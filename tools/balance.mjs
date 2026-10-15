import {CLASSES} from '../web/game/data.js';
import {UPGRADES} from '../web/game/content.js';
import {createRoom,applyAction,stats,emptyMeta,eligibleTalents,enemyIntent} from '../web/game/engine.js';
import {writeFile} from 'node:fs/promises';
const count=Number(process.env.BALANCE_RUNS||20);
function simulate(c,seed,smart,legacy){const m=emptyMeta();if(legacy)for(const u of UPGRADES)m.upgrades[u.id]=Math.min(3,u.max);let s=createRoom('bot','Simulação',c.id,m,seed,c.int>=9?'elfo':c.dex>c.str?'umbriano':'anao');
 const act=a=>{s=applyAction(s,'bot',a);};act({type:'start'});let steps=0;
 while(!['defeat','victory'].includes(s.phase)&&steps++<800){let p=s.players[0],v=stats(p);
  if(s.phase!=='combat'){
   while(p.statPoints>0){const main=c.int>=9?'int':c.dex>c.str?'dex':'str';act({type:'stat',stat:p.statPoints%3===0?'vit':main});p=s.players[0];}
   while(p.points>0){const branch=Math.max(0,c.paths.findIndex(x=>x.effect===(c.int>=9?'support':'power')));let node=[0,1,2,3].find(n=>!p.skills[branch+':'+n]);if(node===3&&p.level<8||node===undefined)break;act({type:'skill',branch,node});p=s.players[0];}
   while(p.talentPoints>0){const talents=eligibleTalents(p);const preferred=['bloodgod','archon','overmind','carnage','laststand','bloodedge','reservoir','healer','precision','manacrit','pact','giantkiller','reprisal','glass'];const t=preferred.map(id=>talents.find(t=>t.id===id)).find(Boolean)||talents[0];if(!t)break;act({type:'talent',talent:t.id});p=s.players[0];}
   for(const it of [...p.bag]){p=s.players[0];const old=p.equipment[it.slot];const score=i=>i?Object.values(i.mods).reduce((a,b)=>a+b,0):0;if(score(it)>score(old)){try{act({type:'equip',item:it.id});}catch{act({type:'sell',item:it.id});}}else act({type:'sell',item:it.id});}
  }
  p=s.players[0];v=stats(p);
  if(s.phase==='route'){const camp=s.choices.findIndex(x=>x.kind==='camp');act({type:'route',index:smart&&camp>=0&&s.stage>1&&p.hp<v.hp*.85?camp:0});}
  else if(s.phase==='reward'||s.phase==='camp'){
   if(s.phase==='camp'&&smart){while(s.players[0].gold>=24&&s.players[0].potions<4)act({type:'buyPotion'});}
   act({type:'ready'});
  }else if(s.phase==='combat'){
   const foes=s.enemies.filter(e=>e.hp>0),e=foes.find(e=>e.role==='healer')||foes.sort((a,b)=>a.hp-b.hp)[0];
   if(!smart){act({type:'attack',target:e.id});continue;}
   const danger=foes.reduce((n,e)=>{const it=enemyIntent(s,e);return n+e.attack*it.mult*(1+Math.max(0,s.round-7)*.07);},0);
   if(p.hp<v.hp*.45&&p.potions>0){act({type:'potion'});continue;}
   if(p.hp<v.hp*.60&&p.mana>=15){act({type:'spell',combo:'VITA FULGUR',ally:'bot',target:e.id});continue;}
   if(danger>v.hp*.3&&foes.some(e=>['heavy','aoe'].includes(enemyIntent(s,e).kind))){act({type:'defend'});continue;}
   if(c.action==='summon'&&p.summons.length<2&&p.mana>=15){act({type:'special',target:e.id});continue;}
   if(c.action==='heal'&&p.hp<v.hp*.8&&p.mana>=10){act({type:'special',target:e.id});continue;}
   if(['burst','poison','drain','stagger','aoe'].includes(c.action)&&p.mana>=14){act({type:'special',target:e.id});continue;}
   if(c.int>=9&&p.mana>=20){act({type:'spell',combo:'LUX IGNIS',target:e.id});continue;}
   act({type:'attack',target:e.id});
  }
 }
 return {stage:s.stage,win:s.phase==='victory',stalled:steps>=800};
}
const results=[];
for(const legacy of [false,true])for(const smart of [false,true]){const rows=[];for(const c of CLASSES){const runs=Array.from({length:count},(_,i)=>simulate(c,10000+i*997,smart,legacy));rows.push({class:c.name,averageStage:Math.round(runs.reduce((s,r)=>s+r.stage,0)/count*100)/100,wins:runs.filter(r=>r.win).length,runs:count,stalled:runs.filter(r=>r.stalled).length});}results.push({policy:smart?'Tactical heuristic (knows three formulas)':'Attack only',legacy:legacy?'3 levels in each upgrade':'No upgrades',rows});}
const report={note:'Deterministic bots, not human playtests or proof of balance. Tactical policy is intentionally simple; learned combos and coordinated parties may outperform it.',results};await writeFile('BALANCE.json',JSON.stringify(report,null,2));console.log(JSON.stringify(results.map(r=>({policy:r.policy,legacy:r.legacy,meanStage:(r.rows.reduce((s,x)=>s+x.averageStage,0)/15).toFixed(2),wins:r.rows.reduce((s,x)=>s+x.wins,0),runs:15*count})),null,2));
