import {CLASSES} from '../web/game/data.js';
import {EVOLUTIONS,skillsFor} from '../web/game/expansion.js';
import {createRoom,applyAction,stats,emptyMeta,equipmentAllowed} from '../web/game/engine.js';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const c of CLASSES){const depths=[];for(let seed=1;seed<=8;seed++){let s=createRoom('bot','Teste',c.id,emptyMeta(),seed);const act=a=>{s=applyAction(s,'bot',a)};act({type:'start'});for(let turn=0;turn<500&&s.phase!=='defeat'&&s.stage<30;turn++){let p=s.players[0];if(s.phase!=='combat'){
 while(p.statPoints){act({type:'stat',stat:p.statPoints%2?'E':(['mago','necromante','clerigo','druida','bardo','bruxo','alquimista','xama'].includes(c.id)?'I':'S')});p=s.players[0];}
 while(p.points){const tree=EVOLUTIONS[c.id][0],n=tree.nodes.findIndex(n=>!p.skills[n.id]&&p.level>=n.level&&n.req.every(id=>p.skills[id]));if(n<0)break;act({type:'skill',branch:0,node:n});p=s.players[0];}
 while(p.talentPoints&&p.talentOffers.length){act({type:'talent',talent:p.talentOffers[0]});p=s.players[0];}
 for(const it of [...p.bag])if(equipmentAllowed(p,it)){try{act({type:'equip',item:it.id});}catch{act({type:'sell',item:it.id});}p=s.players[0];}if(p.bag.length){act({type:'sellMany',items:p.bag.map(x=>x.id)});p=s.players[0];}
 }
 p=s.players[0];const v=stats(p);
 if(s.phase==='route')act({type:'route',index:0});
 else if(s.phase==='camp'||s.phase==='reward'){if(s.phase==='camp')while(s.players[0].gold>=24&&s.players[0].potions<6)act({type:'buyPotion'});act({type:'ready'});}
 else if(s.phase==='combat'){const enemy=s.enemies.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0],skills=skillsFor(p).filter(x=>x.cost<=p.mana),pet=skills.find(x=>x.kind==='summon'),heal=skills.find(x=>x.kind==='heal'||x.kind==='partyheal');
 if(p.hp<v.hp*.45&&p.potions)act({type:'potion'});
 else if(!p.status.silence&&p.hp<v.hp*.5&&heal)act({type:'combatSkill',skill:heal.id,ally:'bot'});
 else if(!p.status.silence&&pet&&p.summons.length<2)act({type:'combatSkill',skill:pet.id});
 else{const skill=skills.find(x=>['aoe','multi','chain','stagger','hit','drain'].includes(x.kind));if(skill&&!p.status.silence)act({type:'combatSkill',skill:skill.id,target:enemy.id});else act({type:'attack',target:enemy.id});}
 }else break;
 }depths.push(s.stage);}results.push({class:c.name,medianDepth:[...depths].sort((a,b)=>a-b)[4],maxDepth:Math.max(...depths),depths});}
await writeFile('BALANCE-v3.json',JSON.stringify({note:'120 runs locais, bot simples sem legado, estratégia limitada; não substitui playtest humano. Sem uso de Supabase.',results},null,2));console.table(results.map(({class:classe,medianDepth:mediana,maxDepth:melhor})=>({classe,mediana,melhor})));

