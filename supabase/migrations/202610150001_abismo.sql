-- Execute uma vez no SQL Editor de um projeto Supabase novo.
create table public.profiles (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null unique references auth.users(id) on delete cascade,
 name text not null check (length(name) between 1 and 24),
 recovery_hash text not null unique,
 meta jsonb not null default '{"shards":0,"runs":0,"wins":0,"upgrades":{"vigor":0,"mind":0,"fortune":0},"spells":[]}',
 active_room uuid,
 created_at timestamptz not null default now()
);
create table public.rooms (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 state jsonb not null,
 revision integer not null default 0,
 updated_at timestamptz not null default now()
);
create table public.members (
 room_id uuid not null references public.rooms(id) on delete cascade,
 profile_id uuid not null references public.profiles(id) on delete cascade,
 primary key(room_id,profile_id)
);
create index members_profile on public.members(profile_id);
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.members enable row level security;
-- Recovery hashes are never readable through the public Data API.
revoke all on public.profiles,public.rooms,public.members from anon,authenticated;
grant select on public.rooms to authenticated;
grant all on public.profiles,public.rooms,public.members to service_role;
create function public.can_read_room(rid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from members m join profiles p on p.id=m.profile_id where m.room_id=rid and p.owner=auth.uid());
$$;
revoke all on function public.can_read_room(uuid) from public;
grant execute on function public.can_read_room(uuid) to authenticated;
create policy room_members_read on public.rooms for select to authenticated using(public.can_read_room(id));
alter publication supabase_realtime add table public.rooms;

-- All writes are service-role only; the Edge Function validates game rules.
create function public.create_game(pid uuid, room_code text, game_state jsonb) returns public.rooms language plpgsql security definer set search_path=public as $$
declare p profiles; r rooms;
begin
 select * into p from profiles where id=pid for update;
 if p.id is null then raise exception 'Conta inexistente'; end if;
 if p.active_room is not null then raise exception 'Você já está em uma sala. Retome ou saia dela.'; end if;
 if game_state->'players'->0->'meta'<>p.meta then raise exception 'Conta mudou. Tente novamente.'; end if;
 insert into rooms(code,state) values(room_code,game_state) returning * into r;
 insert into members values(r.id,pid);
 update profiles set active_room=r.id where id=pid;
 return r;
end $$;
create function public.join_game(pid uuid,rid uuid,expected integer,game_state jsonb) returns public.rooms language plpgsql security definer set search_path=public as $$
declare p profiles; r rooms;
begin
 select * into r from rooms where id=rid for update;
 if r.revision<>expected then raise exception 'CONFLICT'; end if;
 select * into p from profiles where id=pid for update;
 if p.active_room is not null then raise exception 'Você já está em uma sala.'; end if;
 if game_state->'players'->-1->'meta'<>p.meta then raise exception 'Conta mudou. Tente novamente.'; end if;
 if r.state->>'phase'<>'lobby' or jsonb_array_length(r.state->'players')>=20 then raise exception 'Sala indisponível'; end if;
 insert into members values(rid,pid);
 update profiles set active_room=rid where id=pid;
 update rooms set state=game_state,revision=revision+1,updated_at=now() where id=rid returning * into r;
 return r;
end $$;
create function public.commit_game(rid uuid,expected integer,game_state jsonb) returns public.rooms language plpgsql security definer set search_path=public as $$
declare r rooms; q jsonb;
begin
 select * into r from rooms where id=rid for update;
 if r.revision<>expected then raise exception 'CONFLICT'; end if;
 if r.state->>'phase' in ('defeat','victory') then raise exception 'Expedição finalizada'; end if;
 update rooms set state=game_state,revision=revision+1,updated_at=now() where id=rid returning * into r;
 for q in select * from jsonb_array_elements(game_state->'players') loop
  update profiles set meta=q->'meta' where id=(q->>'id')::uuid and active_room=rid;
 end loop;
 return r;
end $$;
create function public.leave_game(pid uuid,rid uuid) returns void language plpgsql security definer set search_path=public as $$
declare r rooms; remaining jsonb;
begin
 select * into r from rooms where id=rid for update;
 if r.state->>'phase' not in ('lobby','victory','defeat') and r.updated_at>now()-interval '2 hours' then raise exception 'Termine a expedição antes de sair. Salas inativas são liberadas após 2 horas.'; end if;
 if r.state->>'phase'='lobby' then
  select coalesce(jsonb_agg(x),'[]'::jsonb) into remaining from jsonb_array_elements(r.state->'players') x where x->>'id'<>pid::text;
  r.state=jsonb_set(r.state,'{players}',remaining);
  if r.state->>'host'=pid::text then r.state=jsonb_set(r.state,'{host}',coalesce(remaining->0->'id','null'::jsonb)); end if;
  update rooms set state=r.state,revision=revision+1,updated_at=now() where id=rid;
 end if;
 delete from members where room_id=rid and profile_id=pid;
 update profiles set active_room=null where id=pid and active_room=rid;
end $$;
create function public.recover_profile(uid uuid,hashed_code text) returns uuid language plpgsql security definer set search_path=public as $$
declare pid uuid;
begin
 if exists(select 1 from profiles where owner=uid) then raise exception 'Esta sessão já possui uma conta. Use uma janela privada para recuperar outra conta.'; end if;
 select id into pid from profiles where recovery_hash=hashed_code for update;
 if pid is null then raise exception 'Código inválido'; end if;
 update profiles set owner=uid where id=pid;
 return pid;
end $$;
create function public.upgrade_profile(pid uuid,upgrade_key text) returns jsonb language plpgsql security definer set search_path=public as $$
declare p profiles; lvl integer; price integer;
begin
 select * into p from profiles where id=pid for update;
 if p.active_room is not null then raise exception 'Saia da sala antes de melhorar seu legado.'; end if;
 if upgrade_key not in ('vigor','mind','fortune') then raise exception 'Melhoria inválida'; end if;
 lvl=(p.meta->'upgrades'->>upgrade_key)::integer; price=20+lvl*15;
 if lvl>=10 or (p.meta->>'shards')::integer<price then raise exception 'Ecos insuficientes ou nível máximo'; end if;
 p.meta=jsonb_set(p.meta,'{shards}',to_jsonb((p.meta->>'shards')::integer-price));
 p.meta=jsonb_set(p.meta,array['upgrades',upgrade_key],to_jsonb(lvl+1));
 update profiles set meta=p.meta where id=pid;
 return p.meta;
end $$;
revoke all on function public.create_game(uuid,text,jsonb),public.join_game(uuid,uuid,integer,jsonb),public.commit_game(uuid,integer,jsonb),public.leave_game(uuid,uuid),public.recover_profile(uuid,text),public.upgrade_profile(uuid,text) from public,anon,authenticated;
grant execute on function public.create_game(uuid,text,jsonb),public.join_game(uuid,uuid,integer,jsonb),public.commit_game(uuid,integer,jsonb),public.leave_game(uuid,uuid),public.recover_profile(uuid,text),public.upgrade_profile(uuid,text) to service_role;
