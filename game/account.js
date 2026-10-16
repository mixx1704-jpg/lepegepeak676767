import {normalizeMeta} from './engine.js';
const stable=value=>value&&typeof value==='object'?Array.isArray(value)?value.map(stable):Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
export const sameMeta=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
// Upgrade the persisted JSON before the SQL compare-and-swap, never bypass it.
export async function prepareAccount(admin,profile){
 let p=profile;
 for(let attempt=0;attempt<3;attempt++){
  const normalized=normalizeMeta(p.meta);if(p.active_room||sameMeta(normalized,p.meta))return p;
  const result=await admin.from('profiles').update({meta:normalized}).eq('id',p.id).is('active_room',null).eq('meta',JSON.stringify(p.meta)).select().maybeSingle();
  if(result.error)throw new Error(result.error.message);if(result.data)return result.data;
  const fresh=await admin.from('profiles').select('*').eq('id',p.id).single();if(fresh.error)throw new Error(fresh.error.message);p=fresh.data;
 }
 throw new Error('Sua conta recebeu outra atualização. Reabra a sala para usar os dados atuais.');
}
