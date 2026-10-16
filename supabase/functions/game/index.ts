import {isRepeatedCommand} from './shared/combat-state.js';
import {prepareAccount} from './shared/account.js';
import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import {createRoom,addPlayer,applyAction,emptyMeta,upgradeMeta,unlockRace,normalizeMeta} from './shared/engine.js';

const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors={'Access-Control-Allow-Origin':Deno.env.get('SITE_ORIGIN')||'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
function checked(result:any){if(result.error)throw new Error(result.error.message);return result.data;}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');}
async function hash(code:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code.trim().toLowerCase().replace(/[^a-f0-9]/g,'')))),b=>b.toString(16).padStart(2,'0')).join('');}
const publicProfile=(p:any)=>({id:p.id,name:p.name,meta:normalizeMeta(p.meta),active_room:p.active_room});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return response({error:'Método inválido'},405);
 try{
  const jwt=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');
  const {data:{user},error}=await admin.auth.getUser(jwt);
  if(error||!user)return response({error:'Sessão inválida. Entre novamente.'},401);
  const raw=await req.text();if(raw.length>4096)return response({error:'Pedido muito grande'},413);
  const body=JSON.parse(raw),op=body.op;
  let p=checked(await admin.from('profiles').select('*').eq('owner',user.id).maybeSingle());

  if(op==='servers'){
   const rows=checked(await admin.from('rooms').select('id,code,state,updated_at').order('updated_at',{ascending:false}).limit(100));
   const servers=rows.filter((r:any)=>r.state?.phase==='lobby'&&r.state?.public!==false&&Array.isArray(r.state?.players)&&r.state.players.length>0).map((r:any)=>({
    id:r.id,code:r.code,name:String(r.state?.serverName||`Sala ${r.code}`).slice(0,32),hostName:String(r.state?.players?.find((x:any)=>x.id===r.state?.host)?.name||r.state?.players?.[0]?.name||'Viajante').slice(0,24),players:r.state.players.length,maxPlayers:20,updatedAt:r.updated_at
   }));
   return response({servers});
  }
  if(op==='recover'){
   if(typeof body.code!=='string'||body.code.replace(/[^a-f0-9]/gi,'').length!==48)throw new Error('Código de recuperação inválido.');
   const pid=checked(await admin.rpc('recover_profile',{uid:user.id,hashed_code:await hash(body.code)}));
   p=checked(await admin.from('profiles').select('*').eq('id',pid).single());return response({profile:publicProfile(p)});
  }
  if(op==='account'){
   let recoveryCode;
   if(!p){recoveryCode=token();p=checked(await admin.from('profiles').insert({owner:user.id,name:String(body.name||'Viajante').trim().slice(0,24)||'Viajante',recovery_hash:await hash(recoveryCode),meta:emptyMeta()}).select().single());}
   return response({profile:publicProfile(p),recoveryCode});
  }
  if(!p)throw new Error('Crie ou recupere sua conta primeiro.');
  if(op==='rename'){
   const name=String(body.name||'').trim().slice(0,24);
   if(!name)throw new Error('Nome inválido.');
   if(p.active_room)throw new Error('Saia da sala para trocar o nome.');
   p=checked(await admin.from('profiles').update({name}).eq('id',p.id).select().single());
   return response({profile:publicProfile(p)});
  }
  if(op==='rotate'){const recoveryCode=token();checked(await admin.from('profiles').update({recovery_hash:await hash(recoveryCode)}).eq('id',p.id));return response({recoveryCode});}
  if(op==='upgrade'||op==='unlockRace'){const updated=op==='upgrade'?upgradeMeta(p.meta,body.key):unlockRace(p.meta,body.raceId);const meta=checked(await admin.rpc('mutate_meta',{pid:p.id,expected_meta:p.meta,updated_meta:updated}));return response({profile:{...publicProfile(p),meta}});}
  if(op==='create'){
   p=await prepareAccount(admin,p);
   const state:any=createRoom(p.id,p.name,body.classId,p.meta,crypto.getRandomValues(new Uint32Array(1))[0],body.raceId||'humano');
   state.serverName=String(body.serverName||`Sala de ${p.name}`).trim().slice(0,32)||`Sala de ${p.name}`;
   state.public=body.isPublic!==false;
   const room=checked(await admin.rpc('create_game',{pid:p.id,room_code:token().slice(0,10).toUpperCase(),game_state:state}));return response({room});
  }
  if(op==='join'){
   p=await prepareAccount(admin,p);
   if(typeof body.code!=='string'||!/^[A-F0-9]{10}$/i.test(body.code.trim()))throw new Error('Código da sala inválido.');
   const room=checked(await admin.from('rooms').select('*').eq('code',body.code.trim().toUpperCase()).single());
   const state=addPlayer(room.state,p.id,p.name,body.classId,p.meta,body.raceId||'humano');
   return response({room:checked(await admin.rpc('join_game',{pid:p.id,rid:room.id,expected:room.revision,game_state:state}))});
  }
  const rid=p.active_room;if(!rid)throw new Error('Você não está em uma sala.');
  if(op==='leave'){checked(await admin.rpc('leave_game',{pid:p.id,rid}));return response({ok:true});}
  if(op==='sync'&&Number.isInteger(body.revision)){const head=checked(await admin.from('rooms').select('revision').eq('id',rid).single());if(head.revision===body.revision)return response({unchanged:true,revision:head.revision});}
  const room=checked(await admin.from('rooms').select('*').eq('id',rid).single());
  if(op==='sync')return response({room});
  if(op==='action'){
   if(isRepeatedCommand(room.state,p.id,body.action?.clientActionId))return response({room});
   if(body.revision!==room.revision)return response({error:'A partida mudou. Tente a ação novamente.',room,conflict:true},409);
   const state=applyAction(room.state,p.id,body.action);
   const result=await admin.rpc('commit_game',{rid,expected:room.revision,game_state:state});
   if(result.error?.message.includes('CONFLICT'))return response({error:'Outra ação chegou primeiro. Tente novamente.',conflict:true},409);
   return response({room:checked(result)});
  }
  throw new Error('Operação desconhecida.');
 }catch(e){console.error('game:',e instanceof Error?e.message:'error');return response({error:e instanceof Error?e.message:'Erro interno'},400);}
});
