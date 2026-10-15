import {CLASSES,ENCOUNTERS,BOSSES,AFFIXES,BASE_ITEMS} from './data.js';
import {RACES,UPGRADES,TALENTS,resolveSpell,randomFormula} from './content.js';
export const VERSION=2;
export const emptyMeta=()=>({shards:0,runs:0,wins:0,upgrades:Object.fromEntries(UPGRADES.map(u=>[u.id,0])),spells:[],races:[]});
export function normalizeMeta(m={}){const base=emptyMeta();return {...base,...m,upgrades:{...base.upgrades,...m.upgrades},races:m.races||[],spells:m.spells||[]};}
export function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
const pick=(s,a)=>a[Math.floor(random(s)*a.length)];
const roll=(s,n)=>1+Math.floor(random(s)*n);
const cls=p=>CLASSES.find(c=>c.id===p.classId);
const race=p=>RACES.find(r=>r.id===p.raceId)||RACES[0];
const has=(p,id)=>p.talents.includes(id);
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const living=s=>s.players.filter(p=>p.hp>0);
const foes=s=>s.enemies.filter(e=>e.hp>0);
export function log(s,text,kind='info'){s.log.push({id:++s.seq,text,kind});s.log=s.log.slice(-80);}
export function baseStats(p){const c=cls(p),r=race(p);return {str:c.str+(p.allocated?.str||0)+(r.stats.str||0),dex:c.dex+(p.allocated?.dex||0)+(r.stats.dex||0),int:c.int+(p.allocated?.int||0)+(r.stats.int||0),vit:5+(p.allocated?.vit||0)};}
export function stats(p){
 const b=baseStats(p),r=race(p),u=normalizeMeta(p.meta).upgrades;
 const v={...b,armor:1+(r.stats.armor||0),crit:4,power:1,support:1,stagger:1+(r.stats.stagger||0),leech:0,hp:62+b.str*2+b.vit*6+u.vigor*4+(r.stats.hp||0),mana:22+b.int*3+u.mind*4,threat:1,dodge:r.dodge||0,regen:3+(r.regen||0)+u.well};
 for(const [k,n] of Object.entries(r.stats))if(!['str','dex','int','hp','armor','stagger'].includes(k))v[k]=(v[k]||0)+n;
 for(const it of Object.values(p.equipment)){if(!it)continue;for(const [k,n] of Object.entries(it.mods))v[k]=(v[k]||0)+(k==='stagger'?n/100:n);}
 for(const key of Object.keys(p.skills)){const [b,n]=key.split(':').map(Number),eff=cls(p).paths[b]?.effect;if(!eff)continue;
  if(n===0){v.str+=2;v.dex+=2;v.int+=2;}else if(n===1){v.hp+=18;v.mana+=8;}else{const m=n===3?2:1;if(eff==='armor'){v.armor+=4*m;v.threat+=.4*m;}else if(eff==='crit')v.crit+=10*m;else if(eff==='power')v.power+=.2*m;else if(eff==='support')v.support+=.25*m;else if(eff==='stagger')v.stagger+=.5*m;else v[eff]=(v[eff]||0)+30*m;}
 }
 if(has(p,'precision'))v.crit+=10;if(has(p,'footwork'))v.dodge+=8;if(has(p,'reservoir'))v.mana+=20;if(has(p,'healer'))v.support+=.25;if(has(p,'giantkiller'))v.stagger+=.25;if(has(p,'ironking'))v.stagger+=.5;
 if(has(p,'bloodgod')&&p.hp<v.hp*.35)v.leech+=12;
 v.crit=Math.min(80,v.crit+v.dex*.55);v.dodge=Math.min(35,v.dodge+Math.max(0,v.dex-8)*.35);v.hp=Math.max(35,Math.round(v.hp));v.mana=Math.max(15,Math.round(v.mana));return v;
}
export function eligibleTalents(p){const b=baseStats(p);return TALENTS.filter(t=>!has(p,t.id)&&t.prereq.every(id=>has(p,id))&&!t.excludes.some(id=>has(p,id))&&Object.entries(t.req).every(([k,n])=>b[k]>=n));}
export function xpNeeded(level){return 35+level*14;}
export function gainXp(s,p,n){p.xp+=Math.round(n*(1+(p.meta.upgrades.insight||0)*.04+(race(p).xp||0)));while(p.xp>=xpNeeded(p.level)){p.xp-=xpNeeded(p.level);p.level++;p.statPoints+=2;if(p.level%3===0)p.talentPoints++;if(p.level%2===0)p.points++;heal(p,12);p.mana=Math.min(stats(p).mana,p.mana+12);log(s,`${p.name}: NÍVEL ${p.level}! +2 atributos${p.level%3===0?' / +1 talento':''}${p.level%2===0?' / +1 evolução':''}.`,'level');}}
export function newPlayer(id,name,classId,meta=emptyMeta(),raceId='humano'){
 assert(CLASSES.some(c=>c.id===classId),'Classe inválida.');meta=normalizeMeta(meta);const r=RACES.find(r=>r.id===raceId);assert(r&&(!r.cost||meta.races.includes(raceId)),'Raça bloqueada.');
 const p={id,name:String(name||'Viajante').slice(0,24),classId,raceId,meta:structuredClone(meta),hp:1,mana:1,shield:0,level:1,xp:0,points:0,statPoints:2,talentPoints:0,allocated:{str:0,dex:0,int:0,vit:0},talents:[],skills:{},equipment:{weapon:null,armor:null,helm:null,ring:null,amulet:null},bag:[],gold:25+meta.upgrades.purse*15,potions:2+meta.upgrades.provisions,summons:[],threat:0,guard:false,acted:false,ready:false,encounterDone:false,damage:0,status:{},usedRevive:false,critProcs:0};const v=stats(p);p.hp=v.hp;p.mana=v.mana;return p;
}
export function createRoom(host,name,classId,meta,seed=Date.now(),raceId='humano'){return {version:VERSION,seed:seed>>>0,host,phase:'lobby',stage:0,cleared:0,round:0,seq:0,log:[],players:[newPlayer(host,name,classId,meta,raceId)],enemies:[],choices:[],event:null,route:[],rewarded:false,roundAt:0,lootClaimed:false};}
export function addPlayer(s,id,name,classId,meta,raceId='humano'){assert(s.phase==='lobby','A expedição já começou.');assert(s.players.length<20,'Party cheia (20 pessoas).');assert(!s.players.some(p=>p.id===id),'Você já está na sala.');s.players.push(newPlayer(id,name,classId,meta,raceId));return s;}
export function pack(items){const grid=Array(60).fill(false),positions=[];for(const it of items){let found=false;for(let y=0;y<=6-it.h&&!found;y++)for(let x=0;x<=10-it.w&&!found;x++){let free=true;for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)if(grid[(y+j)*10+x+i])free=false;if(free){for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)grid[(y+j)*10+x+i]=true;positions.push({id:it.id,x,y});found=true;}}if(!found)return null;}return positions;}
export function item(s,level,p){const base=pick(s,BASE_ITEMS),luck=p?((p.meta.upgrades.scavenger||0)*.02+(has(p,'lucky')?.05:0)):0,r=Math.min(.999,random(s)+luck),rarity=r>.985?4:r>.90?3:r>.65?2:r>.27?1:0;
 const mods=base[1]==='weapon'?{str:Math.ceil(level/3)+1,int:Math.ceil(level/3)+1,dex:Math.ceil(level/3)+1}:base[1]==='armor'?{armor:2+Math.floor(level/3)}:{hp:6+level};const pool=[...AFFIXES],names=[];
 for(let i=0;i<rarity;i++){const a=pool.splice(Math.floor(random(s)*pool.length),1)[0];mods[a[1]]=(mods[a[1]]||0)+Math.round(a[2]*(1+level*.08));names.push(a[0]);}
 return {id:`i${++s.seq}`,name:`${base[0]} ${names[0]||'Gasto'}`,slot:base[1],icon:base[2],w:base[3],h:base[4],rarity,mods,level};}
function loot(s,p){const it=item(s,s.stage,p);if(pack([...p.bag,it])){p.bag.push(it);log(s,`${p.name}: ${it.name}.`,'loot');}else{p.gold+=10+it.rarity*8;log(s,'Mochila cheia: loot convertido em ouro.','loot');}}
function heal(p,n,source=p){const v=stats(p),amount=Math.max(0,Math.round(n*(race(p).healing||1))),extra=Math.max(0,p.hp+amount-v.hp);p.hp=Math.min(v.hp,p.hp+amount);if(has(source,'overflow'))p.shield=Math.min(Math.round(v.hp*.5),p.shield+Math.round(extra*.5));}
function shield(p,n){p.shield=Math.min(stats(p).hp,Math.round(p.shield+n*(1+(race(p).shield||0))));}
function finish(s,win){s.phase=win?'victory':'defeat';s.enemies=[];s.rewarded=true;for(const p of s.players){const base=(s.cleared?6+s.cleared*6:0)+(win?100:0);p.lastEchoes=Math.floor(base*(1+(p.meta.upgrades.legacy||0)*.05));p.meta.shards+=p.lastEchoes;p.meta.runs++;if(win)p.meta.wins++;}log(s,win?'O REI VAZIO FOI DESTRUÍDO.':'A PARTY CAIU. O LEGADO FICA.',win?'good':'hurt');}
function damageEnemy(s,p,e,damage,type,impact=1,canProc=true){
 if(!e||e.hp<=0)return 0;const old=e.hp;e.hp=Math.max(0,e.hp-damage);p.damage+=Math.min(old,damage);p.threat+=damage*stats(p).threat;
 if(e.boss&&!e.stunned&&!e.staggerLock){e.stagger+=damage*impact*stats(p).stagger;if(e.stagger>=e.staggerMax){e.stunned=2;e.stagger=0;log(s,`${e.name}: QUEBRA! 2 ações interrompidas.`,'crit');}}
 if(e.hp===0&&canProc){if(has(p,'carnage'))heal(p,stats(p).hp*.12);if(has(p,'contagion')&&e.poison){for(const q of foes(s)){q.poison=Math.min(has(p,'plague')?200:70,(q.poison||0)+Math.ceil(e.poison/2));q.poisonTurns=3;}}
  if(has(p,'overkill')&&damage>old){const q=foes(s)[0];if(q)damageEnemy(s,p,q,Math.round((damage-old)*.75),type,0,false);}}
 return Math.min(old,damage);
}
function hit(s,p,e,power,type,impact=1,options={}){
 if(!e||e.hp<=0)return 0;const v=stats(p),magical=!['corte','perfurante','contundente'].includes(type),attr=magical?v.int:Math.max(v.str,v.dex),crit=random(s)*100<v.crit;let mult=v.power*(1+(v[type]||0)/100)*(p.buff?1.25:1);
 if(has(p,'bloodedge'))mult*=1+(1-p.hp/v.hp)*.6;if(p.hp<v.hp*.4)mult*=1+(race(p).rage||0);if(has(p,'bloodgod')&&p.hp<v.hp*.35)mult*=2;
 if(has(p,'glass')&&magical)mult*=1.35;if(has(p,'reservoir')&&p.mana>v.mana*.8)mult*=1.2;if(has(p,'execution')&&e.hp<e.maxHp*.3)mult*=1.5;
 if(has(p,'giantkiller')&&e.boss)mult*=1.2;if(has(p,'shatter')&&e.freeze){mult*=1.65;impact*=2;}if(has(p,'fracture')&&e.stunned)mult*=1.5;
 if(p.reprisal&&!options.pet){mult*=1.6;p.reprisal=false;}if(options.pet&&has(p,'pact'))mult*=1.3;if(has(p,'overmind'))mult*=1+p.summons.length*.12;
 if(options.spell&&has(p,'confluence')&&p.lastElement&&p.lastElement!==type)mult*=1.3;if(options.tier===3&&has(p,'archon'))mult*=1.5;
 const d=Math.max(1,Math.round((7+attr*.95+p.level*1.4)*power*mult*(.92+random(s)*.16)*(crit?1.8:1)*(1-(e.resist[type]||0)/100)*(e.stunned?1.35:1)*(e.curse?1.25:1)));
 damageEnemy(s,p,e,d,type,impact);log(s,`${p.name} > ${e.name}: ${d} ${type}${crit?'! CRÍTICO':''}`,crit?'crit':'damage');
 if(v.leech)heal(p,d*v.leech/100);if(crit&&has(p,'manacrit')&&p.critProcs<3){p.mana=Math.min(v.mana,p.mana+5);p.critProcs++;}
 if(has(p,'cinders')&&type==='fogo'){e.burn=Math.max(e.burn||0,Math.round(d*.18));e.burnTurns=2+(race(p).burn||0);}
 if(has(p,'venom')&&type==='veneno'){e.poison=Math.min(has(p,'plague')?200:70,(e.poison||0)+Math.round(d*.2));e.poisonTurns=3;}
 if(has(p,'thermal')&&type==='gelo'&&e.burn)damageEnemy(s,p,e,Math.round(d*.45),'contundente',1,false);
 if(has(p,'stormloop')&&type==='eletrico'&&(e.burn||e.freeze)){for(const q of foes(s).filter(q=>q.id!==e.id))damageEnemy(s,p,q,Math.round(d*.4),type,.2,false);}
 if(crit&&has(p,'cascade')){const q=foes(s).find(q=>q.id!==e.id);if(q)damageEnemy(s,p,q,Math.round(d*.45),type,.2,false);}return d;
}
function hurt(s,p,n,type,enemy=null,noDodge=false){const v=stats(p);if(!noDodge&&random(s)*100<v.dodge){log(s,`${p.name} ESQUIVOU.`,'good');if(enemy&&has(p,'riposte'))hit(s,p,enemy,.55,cls(p).type);return;}
 let dmg=Math.max(1,Math.round(n*(1-Math.max(-40,Math.min(70,(v[type]||0)*.65))/100)-v.armor));if(has(p,'glass'))dmg=Math.round(dmg*1.2);if(has(p,'laststand')&&p.hp<v.hp*.3)dmg=Math.ceil(dmg*.75);if(p.guard)dmg=Math.ceil(dmg*.4);
 const absorbed=Math.min(p.shield,dmg);p.shield-=absorbed;dmg-=absorbed;p.hp=Math.max(0,p.hp-dmg);log(s,`${p.name}: −${dmg} PV${absorbed?` / ${absorbed} bloqueado`:''}.`,'hurt');
 if(enemy&&has(p,'thorns')&&(p.guard||has(p,'ironking')))damageEnemy(s,p,enemy,Math.round(dmg*.35),'contundente',.3,false);
 if(p.hp===0&&race(p).revive&&!p.usedRevive){p.usedRevive=true;p.hp=Math.ceil(v.hp*.25);log(s,`${p.name} RECUSA A MORTE.`,'good');}
}
export function enemyIntent(s,e){if(e.stunned)return {kind:'stun',label:'QUEBRADO',mult:0};if(e.boss){if(s.round%3===0)return {kind:'aoe',label:'CATACLISMO [TODOS]',mult:.8};if(s.round%3===2)return {kind:'heavy',label:'EXECUÇÃO [TANQUE]',mult:1.65};return {kind:'attack',label:'GOLPE',mult:1};}
 const cycle=(s.round+e.pattern)%4;if(cycle===0)return {kind:'heavy',label:'GOLPE PESADO',mult:1.8};if(cycle===2&&e.role==='caster')return {kind:'aoe',label:'MALDIÇÃO [TODOS]',mult:.65};if(cycle===3&&e.role==='healer')return {kind:'heal',label:'RITUAL DE CURA',mult:0};return {kind:'attack',label:e.role==='assassin'?'CAÇA AO FRÁGIL':'ATAQUE',mult:1};}
function clearBattle(s){s.phase='reward';s.roundAt=Date.now();s.cleared++;for(const p of s.players){if(p.hp<=0)p.hp=Math.ceil(stats(p).hp*.2);gainXp(s,p,65+s.stage*11);p.gold+=16+s.stage*3;p.ready=false;loot(s,p);if(s.stage%5===0){loot(s,p);p.potions++;}}log(s,'VITÓRIA. Distribua atributos e talentos antes de avançar.','good');if(s.stage===15)finish(s,true);}
function endRound(s){
 for(const p of living(s)){for(const pet of p.summons){const e=foes(s)[0];if(e)hit(s,p,e,pet.power,pet.type,.6,{pet:true});pet.turns--;if(pet.turns===0&&has(p,'offering')){heal(p,stats(p).hp*.1);p.mana=Math.min(stats(p).mana,p.mana+5);}}p.summons=p.summons.filter(x=>x.turns>0);if(has(p,'antidote'))heal(p,foes(s).filter(e=>e.poison).length*2);}
 for(const e of foes(s)){for(const [key,turns] of [['poison','poisonTurns'],['burn','burnTurns']]){if(e[key]&&e[turns]>0){e.hp=Math.max(0,e.hp-e[key]);e[turns]--;log(s,`${e.name}: ${e[key]} ${key==='burn'?'queimadura':'veneno'}.`,'damage');if(e[turns]===0)e[key]=0;}}}
 if(!foes(s).length){clearBattle(s);return;}
 for(const e of foes(s)){
  if(!living(s).length)break;const intent=enemyIntent(s,e);
  if(e.stunned){e.stunned--;if(!e.stunned)e.staggerLock=2;log(s,`${e.name} perdeu a ação.`,'good');continue;}
  if(e.staggerLock)e.staggerLock--;
  const targets=living(s),top=[...targets].sort((a,b)=>b.threat-a.threat),max=top[0].threat;
  let target=pick(s,top.filter(p=>p.threat===max));if(!e.boss&&e.role==='assassin'&&max<60)target=[...targets].sort((a,b)=>a.hp/stats(a).hp-b.hp/stats(b).hp)[0];
  const rage=1+Math.max(0,s.round-7)*.07;let attack=e.attack*rage*(e.freeze?.7:1);if(e.freeze)e.freeze--;if(e.curse)e.curse--;
  if(intent.kind==='heal'){for(const q of foes(s))q.hp=Math.min(q.maxHp,q.hp+Math.ceil(q.maxHp*.15));log(s,`${e.name} curou seus aliados. INTERROMPA O RITUAL.`,'hurt');}
  else if(intent.kind==='aoe'){log(s,`${e.name}: ATAQUE COLETIVO!`,'hurt');for(const p of targets)hurt(s,p,attack*intent.mult,e.type,e);}
  else{hurt(s,target,attack*intent.mult,e.type,e);if(e.boss&&targets.length>4){for(const q of top.filter(p=>p!==target).slice(0,Math.floor(targets.length/4)))hurt(s,q,attack*.6,e.type,e);}}
  if(e.boss&&e.hp<e.maxHp*.5&&e.phase===1){e.phase=2;e.attack*=1.3;log(s,`${e.name}: FASE II. DANO +30%.`,'crit');}
 }
 if(!living(s).length){finish(s,false);return;}if(!foes(s).length){clearBattle(s);return;}
 s.round++;s.roundAt=Date.now();for(const p of s.players){p.acted=false;p.guard=false;p.threat=Math.floor(p.threat*.75);p.critProcs=0;p.mana=Math.min(stats(p).mana,p.mana+stats(p).regen+Math.round((stats(p).support-1)*8));if(p.buff)p.buff--;}
}
function battle(s){s.phase='combat';s.round=1;s.roundAt=Date.now();const n=s.players.length,boss=s.stage%5===0;
 if(boss){const b=BOSSES[s.stage/5-1],hp=Math.round((230+s.stage*45)*(1+(n-1)*.86));s.enemies=[{...b,id:'boss',boss:true,hp,maxHp:hp,attack:19+s.stage*2.1+Math.sqrt(n)*1.8,stagger:0,staggerMax:hp*.26,staggerLock:0,phase:1,stunned:0,role:'boss',pattern:0}];}
 else{const count=Math.min(6,1+Math.floor(n/3)+(random(s)>.48?1:0)),pool=[['Lanceiro oco','fighter','corte'],['Acólito da febre','caster','fogo'],['Aranha de vidro','assassin','veneno'],['Abade sem olhos','healer','sombrio'],['Carniçal','fighter','contundente'],['Bruxa polar','caster','gelo']];s.enemies=Array.from({length:count},(_,i)=>{const [name,role,type]=pick(s,pool),hp=Math.round((62+s.stage*18)*(1+(n-1)*.83)/count);return {id:`e${i}`,name,role,pattern:i,type,boss:false,hp,maxHp:hp,attack:(15+s.stage*1.75+Math.sqrt(n)*1.5)/Math.pow(count,.25),resist:{[type]:35,sagrado:-20},stunned:0};});}
 for(const p of s.players){p.acted=false;p.threat=0;p.guard=false;p.shield=race(p).shieldStart||0;p.buff=0;p.summons=[];p.usedRevive=false;p.lastElement=null;p.reprisal=false;p.critProcs=0;}
 log(s,`${boss?'CHEFE':'COMBATE'} / PROFUNDIDADE ${s.stage}.`,'info');}
function next(s){s.stage++;s.event=null;s.roundAt=Date.now();for(const p of s.players){p.ready=false;p.encounterDone=false;}if(s.stage%5===0){battle(s);return;}s.phase='route';const choices=[{kind:'combat',name:'Trilha hostil',detail:'Combate / XP e equipamento'},{kind:'event',name:pick(s,['Cripta lacrada','Caminho suspeito','Ruínas antigas']),detail:'Encontro / d20 e risco'}];if(s.stage%3===1)choices.push({kind:'camp',name:'Fogueira & mercador',detail:'Recuperação parcial / shop'});else choices.push({kind:'elite',name:'Caçada de elite',detail:'Inimigos +30% / loot extra'});s.choices=choices;}
function spellCost(p,sp){let cost=sp.cost*(1-(race(p).discount||0));if(has(p,'archon')&&sp.tier===3)cost*=.7;return Math.max(1,Math.ceil(cost));}
export {spellCost};
function cast(s,p,combo,target,ally){
 const sp=resolveSpell(combo);if(!sp){assert(p.mana>=3,'Experimentar exige pelo menos 3 mana.');p.mana-=3;log(s,`${p.name}: as runas se desfazem. −3 mana. A ordem importa.`,'magic');return;}
 const cost=spellCost(p,sp);assert(p.mana>=cost,`A fórmula exige ${cost} mana.`);const v=stats(p),petCap=has(p,'legion')?5:3;
 if(sp.kind==='summon')assert(p.summons.length<petCap,`Limite de ${petCap} invocações.`);
 if(sp.kind==='revive')assert(ally&&ally.hp<=0,'Essa fórmula exige um aliado caído.');
 if(['hit','drain','stagger','poison','burn','freeze','chain','curse'].includes(sp.kind))assert(target&&target.hp>0,'Selecione um inimigo vivo.');
 p.mana-=cost;if(!p.meta.spells.includes(sp.combo)){p.meta.spells.push(sp.combo);log(s,`${p.name} DESCOBRIU ${sp.name}!`,'loot');}
 const scale=(10+v.int)*sp.power*v.support;
 if(sp.kind==='heal'){const a=ally&&ally.hp>0?ally:p;heal(a,scale,p);p.threat+=scale*.4;}
 else if(sp.kind==='partyheal'){for(const a of living(s)){heal(a,scale,p);if(has(p,'saint'))a.mana=Math.min(stats(a).mana,a.mana+2);}p.threat+=scale*living(s).length*.4;}
 else if(sp.kind==='shield')shield(ally&&ally.hp>0?ally:p,scale);
 else if(sp.kind==='summon')p.summons.push({name:sp.name,type:sp.type,power:sp.power,turns:4+(sp.duration-2)});
 else if(sp.kind==='revive'){ally.hp=Math.ceil(stats(ally).hp*Math.min(.75,sp.power));log(s,`${ally.name} voltou à luta.`,'good');}
 else if(sp.kind==='aoe')for(const e of foes(s))hit(s,p,e,sp.power,sp.type,1,{spell:true,tier:sp.tier});
 else{const d=hit(s,p,target,sp.power,sp.type,sp.kind==='stagger'?2.7:1,{spell:true,tier:sp.tier});if(sp.kind==='drain')heal(p,d*.4,p);if(sp.kind==='poison'){target.poison=Math.min(has(p,'plague')?200:70,(target.poison||0)+Math.round(d*.3));target.poisonTurns=sp.duration+1;}if(sp.kind==='burn'){target.burn=Math.max(target.burn||0,Math.round(d*.3));target.burnTurns=sp.duration+(race(p).burn||0);}if(sp.kind==='freeze')target.freeze=sp.duration;if(sp.kind==='curse')target.curse=sp.duration;if(sp.kind==='chain'){for(const e of foes(s).filter(e=>e.id!==target.id).slice(0,2))hit(s,p,e,sp.power*.6,sp.type,.5,{spell:true,tier:sp.tier});}}
 p.lastElement=sp.type;log(s,`${p.name}: ${sp.name} [−${cost} PM].`,'magic');
}
function defend(s,p){const v=stats(p);p.guard=true;shield(p,8+v.str*.5+(has(p,'bulwark')?20:0));p.threat+=35*v.threat*(has(p,'bulwark')?2:1);if(has(p,'reprisal'))p.reprisal=true;if(has(p,'martyr')){const ally=[...living(s)].sort((a,b)=>a.hp/stats(a).hp-b.hp/stats(b).hp)[0];heal(ally,stats(ally).hp*.12,p);}log(s,`${p.name} DEFENDE. Dano −60%.`,'good');}
export function applyAction(original,id,a,now=Date.now()){
 assert(original.version===VERSION,'Esta run usa regras antigas. Volte ao santuário para iniciar uma nova.');const s=structuredClone(original),p=s.players.find(p=>p.id===id);assert(p,'Você não pertence à sala.');assert(a&&typeof a.type==='string','Ação inválida.');
 if(a.type==='start'){assert(id===s.host&&s.phase==='lobby','Somente o líder inicia.');for(const q of s.players)q.bag.push(item(s,1,q));next(s);return s;}
 if(a.type==='route'){assert(id===s.host&&s.phase==='route','O líder escolhe a rota.');assert(Number.isInteger(a.index)&&s.choices[a.index],'Rota inválida.');const choice=s.choices[a.index];s.route.push(choice.kind);s.elite=choice.kind==='elite';if(['combat','elite'].includes(choice.kind)){battle(s);if(s.elite)for(const e of s.enemies){e.hp=Math.round(e.hp*1.3);e.maxHp=e.hp;e.attack*=1.3;}}
  else if(choice.kind==='camp'){s.phase='camp';s.cleared++;for(const q of s.players){heal(q,stats(q).hp*.3);q.mana=Math.min(stats(q).mana,q.mana+Math.ceil(stats(q).mana*.6));gainXp(s,q,20);}log(s,'FOGUEIRA: +30% PV, +60% PM. Poções são vendidas.','good');}
  else{s.phase='event';s.event=structuredClone(pick(s,ENCOUNTERS));s.event.dc+=Math.floor(s.stage/5);}s.roundAt=now;return s;}
 if(['stat','talent','skill'].includes(a.type)){
  assert(!['combat','victory','defeat'].includes(s.phase),'Distribua pontos fora do combate.');
  if(a.type==='stat'){assert(['str','dex','int','vit'].includes(a.stat),'Atributo inválido.');assert(p.statPoints>0,'Sem pontos de atributo.');p.statPoints--;p.allocated[a.stat]++;if(a.stat==='vit')p.hp+=6;if(a.stat==='str')p.hp+=2;if(a.stat==='int')p.mana+=3;}
  if(a.type==='talent'){const t=eligibleTalents(p).find(t=>t.id===a.talent);assert(p.talentPoints>0&&t,'Talento indisponível: confira pontos e pré-requisitos.');p.talentPoints--;p.talents.push(t.id);log(s,`${p.name}: talento ${t.name}.`,'good');}
  if(a.type==='skill'){const b=a.branch,n=a.node;assert(Number.isInteger(b)&&b>=0&&b<5&&Number.isInteger(n)&&n>=0&&n<4,'Evolução inválida.');const key=`${b}:${n}`;assert(!p.skills[key],'Já aprendida.');assert(n===0||p.skills[`${b}:${n-1}`],'Aprenda o nó anterior.');assert(n!==3||p.level>=8,'Evolução final exige nível 8.');assert(p.points>=1,'Sem pontos de evolução.');p.points--;p.skills[key]=1;log(s,`${p.name}: ${n===3?cls(p).paths[b].final:cls(p).paths[b].name}.`,'good');}return s;
 }
 if(['equip','sell','unequip','buy','buyPotion'].includes(a.type)){
  assert(!['combat','victory','defeat'].includes(s.phase),'Gerencie equipamento entre combates.');
  if(a.type==='buy'||a.type==='buyPotion'){assert(s.phase==='camp','Apenas no mercador.');const cost=Math.ceil((a.type==='buy'?40+s.stage*2:24)*(1-(p.meta.upgrades.bargain||0)*.03));assert(p.gold>=cost,`Precisa de ${cost} ouro.`);assert(a.type!=='buyPotion'||p.potions<8,'Limite de 8 poções.');p.gold-=cost;if(a.type==='buy')loot(s,p);else p.potions++;return s;}
  if(a.type==='unequip'){assert(Object.hasOwn(p.equipment,a.slot),'Slot inválido.');const it=p.equipment[a.slot];assert(it,'Slot vazio.');assert(pack([...p.bag,it]),'Mochila cheia.');p.bag.push(it);p.equipment[a.slot]=null;}
  else{const i=p.bag.findIndex(x=>x.id===a.item);assert(i>=0,'Item não encontrado.');const it=p.bag.splice(i,1)[0];if(a.type==='sell')p.gold+=8+it.level+it.rarity*8;else{const old=p.equipment[it.slot];if(old){assert(pack([...p.bag,old]),'Mochila cheia.');p.bag.push(old);}p.equipment[it.slot]=it;}}
  p.hp=Math.min(p.hp,stats(p).hp);p.mana=Math.min(p.mana,stats(p).mana);return s;
 }
 if(a.type==='encounter'){
  assert(s.phase==='event'&&!p.encounterDone,'Encontro já resolvido.');p.encounterDone=true;if(a.skip){log(s,`${p.name} passou em segurança.`);gainXp(s,p,12);}else{const e=s.event,dice=roll(s,20),bonus=Math.floor((stats(p)[e.stat]-5)/2)+(p.meta.upgrades.fortune||0)+(has(p,'lucky')?2:0),success=dice===20||(dice!==1&&dice+bonus>=e.dc);s.dice={player:p.name,dice,bonus,dc:e.dc,success,id:++s.seq};log(s,`${p.name}: D20(${dice}) + ${bonus} / CD ${e.dc} = ${success?'SUCESSO':'FALHA'}.`,success?'good':'hurt');if(success){gainXp(s,p,48+s.stage*5);if(e.reward==='loot')loot(s,p);if(e.reward==='heal')heal(p,stats(p).hp*.4);if(e.reward==='mana')p.mana=stats(p).mana;if(e.reward==='shards')p.meta.shards+=10;if(e.reward==='spell'){const sp=randomFormula(s,random);p.hints=p.hints||[];const hint=sp.combo.split(' ');hint[hint.length-1]='?';if(!p.hints.includes(hint.join(' ')))p.hints.push(hint.join(' '));log(s,`${p.name} encontrou uma pista rúnica incompleta.`,'magic');}}else{hurt(s,p,18+s.stage*2,'arcano',null,true);gainXp(s,p,8);}}
  if(!living(s).length){finish(s,false);return s;}if(s.players.every(q=>q.encounterDone)){s.cleared++;s.phase='reward';s.roundAt=now;for(const q of s.players){q.ready=false;if(q.hp===0)q.hp=1;}}return s;
 }
 if(a.type==='ready'){assert(['camp','reward'].includes(s.phase),'Não é hora de avançar.');p.ready=true;if(s.players.every(q=>q.ready))next(s);return s;}
 if(a.type==='skipAbsent'){assert(id===s.host,'Apenas o líder encerra a espera.');assert(now-s.roundAt>=45000,'Espere 45 segundos nesta rodada.');assert(s.phase==='combat','Somente em combate.');for(const q of living(s))if(!q.acted){defend(s,q);q.acted=true;}endRound(s);return s;}
 if(a.type==='abandon'){assert(id===s.host&&!['lobby','victory','defeat'].includes(s.phase),'O líder pode encerrar uma run ativa.');finish(s,false);return s;}
 assert(s.phase==='combat'&&p.hp>0&&!p.acted,'Aguarde sua próxima rodada.');const e=s.enemies.find(e=>e.id===a.target),ally=s.players.find(q=>q.id===a.ally),v=stats(p),c=cls(p);
 if(a.type==='attack'){assert(e&&e.hp>0,'Selecione um inimigo vivo.');hit(s,p,e,1,c.type);}
 else if(a.type==='defend')defend(s,p);
 else if(a.type==='potion'){assert(p.potions>0,'Sem poções.');if(!has(p,'recycle')||random(s)>.25)p.potions--;heal(p,v.hp*.4*(race(p).potion||1)*(has(p,'chemist')?1.3:1));p.mana=Math.min(v.mana,p.mana+10);if(has(p,'chemist'))p.buff=3;log(s,`${p.name} bebeu uma poção.`,'good');}
 else if(a.type==='spell')cast(s,p,a.combo,e,ally);
 else if(a.type==='special'){assert(p.mana>=10,'Habilidade exige 10 mana.');p.mana-=10;
  if(c.action==='taunt'){p.threat=Math.max(...s.players.map(q=>q.threat))+120*v.threat;defend(s,p);shield(p,v.str);}
  else if(c.action==='guard'){for(const q of living(s))shield(q,(10+v.int)*v.support);p.threat+=70*v.threat;}
  else if(c.action==='heal'){for(const q of living(s)){heal(q,(14+v.int)*v.support,p);if(has(p,'saint'))q.mana=Math.min(stats(q).mana,q.mana+2);}p.threat+=15*living(s).length;}
  else if(c.action==='buff'){for(const q of living(s)){q.buff=3;q.mana=Math.min(stats(q).mana,q.mana+7);}p.threat+=30;}
  else if(c.action==='summon'){const cap=has(p,'legion')?5:3;assert(p.summons.length<cap,`Limite de ${cap} invocações.`);p.summons.push({name:c.skill,type:c.type,power:.55,turns:4});}
  else if(c.action==='aoe')s.enemies.forEach(q=>hit(s,p,q,1.05,c.type));
  else{assert(e&&e.hp>0,'Selecione um inimigo vivo.');const d=hit(s,p,e,1.65,c.type,c.action==='stagger'?3:1);if(c.action==='poison'){e.poison=Math.min(70,(e.poison||0)+5+Math.floor(v.dex*.5));e.poisonTurns=3;}if(c.action==='drain')heal(p,d*.45);}
  log(s,`${p.name}: ${c.skill}.`,'magic');
 }else throw new Error('Ação desconhecida.');
 p.acted=true;if(!foes(s).length){if(s.elite)for(const q of s.players)loot(s,q);clearBattle(s);}else if(living(s).every(q=>q.acted))endRound(s);return s;
}
export function upgradeMeta(meta,key){const m=normalizeMeta(structuredClone(meta)),u=UPGRADES.find(u=>u.id===key);assert(u,'Melhoria inválida.');const lv=m.upgrades[key]||0,cost=u.base+lv*u.step;assert(lv<u.max,'Melhoria no máximo.');assert(m.shards>=cost,`Precisa de ${cost} ecos.`);m.shards-=cost;m.upgrades[key]=lv+1;return m;}
export function unlockRace(meta,id){const m=normalizeMeta(structuredClone(meta)),r=RACES.find(r=>r.id===id);assert(r&&r.cost&&!m.races.includes(id),'Raça indisponível ou já liberada.');assert(m.shards>=r.cost,`Precisa de ${r.cost} ecos.`);m.shards-=r.cost;m.races.push(id);return m;}
