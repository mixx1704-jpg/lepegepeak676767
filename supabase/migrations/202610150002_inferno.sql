-- Execute após a migração 001 (inclusive em instalações novas).
create function public.mutate_meta(pid uuid,expected_meta jsonb,updated_meta jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare p profiles;
begin
 select * into p from profiles where id=pid for update;
 if p.id is null then raise exception 'Conta inexistente'; end if;
 if p.active_room is not null then raise exception 'Saia da sala antes de comprar legado ou raças.'; end if;
 if p.meta<>expected_meta then raise exception 'Conta mudou. Atualize e tente novamente.'; end if;
 update profiles set meta=updated_meta where id=pid;
 return updated_meta;
end $$;
revoke all on function public.mutate_meta(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.mutate_meta(uuid,jsonb,jsonb) to service_role;
-- Remove the old v1 upgrade entry point to keep one authoritative pricing path.
revoke execute on function public.upgrade_profile(uuid,text) from service_role;
update public.profiles set meta=jsonb_set(jsonb_set(meta,'{races}',coalesce(meta->'races','[]'::jsonb)), '{upgrades}',
 '{"vigor":0,"mind":0,"fortune":0,"purse":0,"scavenger":0,"insight":0,"provisions":0,"well":0,"bargain":0,"legacy":0}'::jsonb || (meta->'upgrades'));
