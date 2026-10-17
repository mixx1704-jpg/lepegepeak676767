import {traitRules} from './trait-codex.js';
import {INFERNAL_ENEMIES,COVEN_GROUPS,combatBudget,encounterDifficulty} from './infernal-content.js';
import {collectDecision,recordJourney} from './journey.js';
import {talentActive,deepNodes,DEEP_TALENT_MAP,BOSS_ROSTER,encounterStory} from './deep-content.js';
import {enemyRecovery} from './combat-state.js';
import {RARE_ENCOUNTERS,QUEST_RELICS} from './adventures.js';
import {echoTotals,TRAIT_BY_ID,echoBonus,EXTRA_ENCOUNTERS,SPECIAL,TRAITS,EVOLUTIONS,skillsFor,EXTRA_ITEMS,PREFIXES,MYTHICS,ENEMY_SPECIES,BIOMES} from './expansion.js';
import {CLASSES,ENCOUNTERS,BOSSES,AFFIXES,BASE_ITEMS} from './data.js';
import {RACES,UPGRADES,TALENTS,resolveSpell,randomFormula} from './content.js';
export const VERSION=2;
const UPGRADE_DEFAULTS=Object.freeze(Object.fromEntries(UPGRADES.map(u=>[u.id,0])));
export const emptyMeta=()=>({shards:0,runs:0,wins:0,upgrades:{...UPGRADE_DEFAULTS},spells:[],races:[]});
export function normalizeMeta(m={}){const base=emptyMeta();return {...base,...m,upgrades:{...base.upgrades,...m.upgrades,aethershield:Math.max(m.upgrades?.aethershield||0,m.upgrades?.spellmemory||0)},races:m.races||[],spells:m.spells||[]};}
export function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
const pick=(s,a)=>a[Math.floor(random(s)*a.length)];
const roll=(s,n)=>1+Math.floor(random(s)*n);
const CLASS_MAP=new Map(CLASSES.map(c=>[c.id,c])),RACE_MAP=new Map(RACES.map(r=>[r.id,r]));
const cls=p=>CLASS_MAP.get(p.classId);
const race=p=>RACE_MAP.get(p.raceId)||RACES[0];
let buildCache=null;
function build(p){if(!buildCache)return null;let b=buildCache.get(p);if(!b){b={talents:new Set(p.talents),passives:new Set(p.evolution==null?[]:EVOLUTIONS[p.classId][p.evolution].nodes.filter(n=>p.skills[n.id]).map(n=>n.effect)),nodes:deepNodes(p,EVOLUTIONS),echo:echoTotals(p.meta),deepTalents:p.talents.map(id=>DEEP_TALENT_MAP.get(id)).filter(Boolean),base:baseStats(p)};buildCache.set(p,b)}return b;}
const has=(p,id)=>buildCache?build(p).talents.has(id):p.talents.includes(id);
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const living=s=>s.players.filter(p=>p.hp>0);
const foes=s=>s.enemies.filter(e=>e.hp>0);
export function log(s,text,kind='info'){s.log.push({id:++s.seq,text,kind});s.log=s.log.slice(-80);}
export function specialStats(p){const r=race(p);return Object.fromEntries(SPECIAL.map(({id})=>[id,Math.max(1,(p.special?.[id]??5)+(r.special?.[id]||0)+(p.traits||[]).map(id=>TRAIT_BY_ID.get(id)).filter(Boolean).reduce((n,t)=>n+(t.mods?.[id]||0),0))]));}
export function baseStats(p){const v=specialStats(p),r=race(p);return {str:v.S*2+(r.stats.str||0)+(p.allocated?.str||0),dex:v.A*2+(r.stats.dex||0)+(p.allocated?.dex||0),int:v.I*2+(r.stats.int||0)+(p.allocated?.int||0),vit:v.E+(p.allocated?.vit||0),...v};}
const trait=(p,id)=>p.traits?.includes(id);
const passive=(p,key)=>buildCache?build(p).passives.has(key):p.evolution!=null&&EVOLUTIONS[p.classId]?.[p.evolution]?.nodes.some(n=>n.effect===key&&p.skills[n.id]);
export function traitBalance(ids){return -ids.reduce((n,id)=>n+(TRAITS.find(t=>t.id===id)?.cost||0),0);}
export function equipmentAllowed(p,it){return (!it.classId||it.classId===p.classId)&&Object.entries(it.requirements||{}).every(([k,v])=>specialStats(p)[k]>=v);}

const activeCommand=new WeakMap();
function ruleContext(s,p,extra={}){const v=stats(p),st=p.status||{};return {hpRatio:p.hp/v.hp,manaRatio:p.mana/v.mana,guard:!!p.guard,formation:p.formation,shield:p.shield||0,injuries:Object.values(p.injuries||{}).reduce((a,b)=>a+b,0),boss:!!s?.enemies.some(e=>e.boss&&e.hp>0),partySize:s?living(s).length:1,enemyCount:s?foes(s).length:0,first:!(p.traitActions||0),turn:p.traitActions||0,poison:st.poison||0,burn:st.scorch||0,freeze:st.chill||0,curse:st.curse||0,bleed:st.bleed||0,...extra};}
function rules(s,p,event,extra={}){return p.traits?.some(id=>id.startsWith('infernal_'))?traitRules(p,event,ruleContext(s,p,extra)):{};}
function traitApply(p,effects,target=null){const v=stats(p);if(effects.hp)p.hp=Math.max(0,Math.min(v.hp,p.hp+effects.hp));if(effects.mana)p.mana=Math.max(0,Math.min(v.mana,p.mana+effects.mana));if(effects.shield)p.shield=Math.max(0,Math.min(v.hp,p.shield+effects.shield));if(effects.threat)p.threat=Math.max(0,p.threat+effects.threat);for(const k of ['poison','burn','freeze','curse','bleed','haste'])if(effects[k]){if(target){if(k==='haste')continue;target[k]=Math.max(0,Math.min(k==='poison'||k==='burn'?500:12,(target[k]||0)+effects[k]));if(k==='poison'||k==='burn')target[k+'Turns']=Math.max(target[k+'Turns']||0,3);}else{const key=({burn:'scorch',freeze:'chill'})[k]||k;p.status[key]=Math.max(0,Math.min(12,(p.status[key]||0)+effects[k]));}}}
function actionRules(s,p,a){const sk=a.type==='combatSkill'?skillsFor(p).find(x=>x.id===a.skill):a.type==='spell'?resolveSpell(a.combo):null;return {...rules(s,p,'action',{action:a.type,kind:sk?.kind||a.type,type:sk?.type||p.equipment.weapon?.damageType||cls(p).type}),kind:sk?.kind||a.type};}
export function combatSkillCost(p,sk,s=null){return Math.max(1,Math.ceil(sk.cost*((activeCommand.get(p)||rules(s,p,'action',{action:'combatSkill',kind:sk.kind,type:sk.type})).cost??1)));}
function deriveStats(p){
 const b=buildCache?build(p).base:baseStats(p),r=race(p),u={vigor:0,mind:0,well:0,...p.meta?.upgrades},echo=buildCache?build(p).echo:echoTotals(p.meta);
 const v={...b,armor:1+(r.stats.armor||0),crit:4,power:1,support:1,stagger:1+(r.stats.stagger||0),leech:0,hp:62+b.str*2+b.vit*6+u.vigor*4+(r.stats.hp||0),mana:30+b.I*8+u.mind*4,threat:1,summonPower:1,xpBonus:0,lootQuality:0,haste:0,dodge:r.dodge||0,regen:3+(r.regen||0)+u.well};
 for(const [k,n] of Object.entries(r.stats))if(!['str','dex','int','hp','armor','stagger'].includes(k))v[k]=(v[k]||0)+n;
 for(const it of Object.values(p.equipment)){if(!it)continue;for(const [k,n] of Object.entries(it.mods))v[k]=(v[k]||0)+(k==='stagger'?n/100:n);}
 if(p.evolution==null)for(const key of Object.keys(p.skills)){const [b,n]=key.split(':').map(Number),eff=cls(p).paths[b]?.effect;if(!eff||n>3||p.evolution!=null)continue;
  if(n===0){v.str+=2;v.dex+=2;v.int+=2;}else if(n===1){v.hp+=18;v.mana+=8;}else{const m=n===3?2:1;if(eff==='armor'){v.armor+=4*m;v.threat+=.4*m;}else if(eff==='crit')v.crit+=10*m;else if(eff==='power')v.power+=.2*m;else if(eff==='support')v.support+=.25*m;else if(eff==='stagger')v.stagger+=.5*m;else v[eff]=(v[eff]||0)+30*m;}
 }
 if(has(p,'precision'))v.crit+=10;if(has(p,'footwork'))v.dodge+=8;if(has(p,'reservoir'))v.mana+=20;if(has(p,'healer'))v.support+=.25;if(has(p,'giantkiller'))v.stagger+=.25;if(has(p,'ironking'))v.stagger+=.5;
 if(has(p,'bloodgod')&&p.hp<v.hp*.35)v.leech+=12;

 v.armor+=b.E*.3;v.summonPower+=b.C*.025;v.crit+=b.P*.7+b.L*.35;v.support+=b.C*.025;v.lootQuality+=b.L*.8+(r.loot||0);v.xpBonus+=b.I;
 if(trait(p,'hollow'))v.mana*=.6;if(trait(p,'vampire'))v.leech+=12;if(trait(p,'tough')){v.armor+=6;v.hp*=1.15;}if(trait(p,'collector'))v.lootQuality+=15;if(trait(p,'cursed'))v.lootQuality-=15;
 if(trait(p,'genius'))v.xpBonus+=100;if(trait(p,'commander'))v.summonPower+=.3;
 for(const t of p.talents.filter(x=>x.startsWith('special_'))){const k=t.split('_')[1];if(k==='S')v.power+=.08;if(k==='P')v.crit+=4;if(k==='E'){v.hp+=15;v.armor++;}if(k==='C'){v.support+=.12;v.summonPower+=.12;}if(k==='I'){v.xpBonus+=10;v.mana+=8;}if(k==='A')v.haste+=4;if(k==='L')v.lootQuality+=5;}
 for(const n of (buildCache?build(p).nodes:deepNodes(p,EVOLUTIONS)))for(const [k,x] of Object.entries(n.mods||{}))v[k]=(v[k]||0)+x;
 for(const t of (buildCache?build(p).deepTalents:p.talents.map(id=>DEEP_TALENT_MAP.get(id)).filter(Boolean))){if(talentActive(t,p,v))for(const [k,x] of Object.entries(t.mods))v[k]=(v[k]||0)+x;}
 if(passive(p,'vigor'))v.hp*=1.12;if(passive(p,'discipline'))v.power+=.08;if(passive(p,'element'))v[['fogo','gelo','eletrico','veneno','sombrio','sagrado','arcano'].includes(cls(p).paths[p.evolution].effect)?cls(p).paths[p.evolution].effect:cls(p).type]=(v[['fogo','gelo','eletrico','veneno','sombrio','sagrado','arcano'].includes(cls(p).paths[p.evolution].effect)?cls(p).paths[p.evolution].effect:cls(p).type]||0)+25;if(passive(p,'bond'))v.summonPower+=.15;if(passive(p,'tempo'))v.haste+=12;if(passive(p,'master'))v.power+=.2;if(passive(p,'crown')&&p.hp<v.hp*.35)v.power+=.4;
 const myth=p.equipment.weapon?.mythic;if(myth==='precision')v.crit+=20;if(myth==='drain')v.leech+=20;if(myth==='army'||myth==='turret')v.summonPower+=.5;if(myth==='mercy'||myth==='radiance')v.support+=.4;if(myth==='mana')v.mana+=60;if(myth==='quake')v.stagger+=1;v.summonPower+=(u.pactecho||0)*.1;if(p.evolution!=null){const eff=cls(p).paths[p.evolution].effect;if(eff==='armor')v.armor+=4;if(eff==='crit')v.crit+=8;if(eff==='stagger')v.stagger+=.3;if(eff==='support')v.support+=.2;if(eff==='power')v.power+=.12;}if(p.ultra){v.power+=.5;v.hp*=1.25;v.mana*=1.2;}
 for(const key of ['hp','mana','armor','crit','dodge','haste','stagger','regen','power','support','summonPower','xpBonus','lootQuality','fogo','gelo','eletrico','sagrado','sombrio','arcano'])v[key]=(v[key]||0)+(echo[key]||0);for(const t of (p.traits||[]).map(id=>TRAIT_BY_ID.get(id)).filter(Boolean))for(const [key,value] of Object.entries(t.mods||{}))if(!SPECIAL.some(x=>x.id===key))v[key]=(v[key]||0)+value;v.power=Math.max(.2,v.power);v.support=Math.max(.2,v.support);v.summonPower=Math.max(.1,v.summonPower);v.stagger=Math.max(.1,v.stagger);v.regen=Math.max(0,v.regen);v.crit=Math.max(0,Math.min(80,v.crit+v.dex*.55));v.dodge=Math.max(0,Math.min(80,v.dodge+Math.max(0,v.dex-8)*.35));v.hp*=1-Math.min(.36,(p.injuries?.trauma||0)*.06);v.power*=1-Math.min(.5,(p.injuries?.fracture||0)*.1);v.hp=Math.max(35,Math.round(v.hp));v.mana=Math.max(15,Math.round(v.mana));return v;
}
let turnStats=null;
export function stats(p){if(!turnStats)return deriveStats(p);const signature=[p.hp,p.mana,p.shield>0,p.guard,p.summons?.length,p.formation,p.level,p.ultra,p.injuries?.trauma||0,p.injuries?.fracture||0,p.injuries?.shock||0].join(':');const cached=turnStats.get(p);if(cached?.key===signature)return cached.value;const value=deriveStats(p);turnStats.set(p,{key:signature,value});return value;}
export function eligibleTalents(p){const b=baseStats(p);return TALENTS.filter(t=>p.level>=(t.level||1)&&(!t.ultraOnly||p.ultra)&&!has(p,t.id)&&t.prereq.every(id=>has(p,id))&&!t.excludes.some(id=>has(p,id))&&Object.entries(t.req).every(([k,n])=>b[k]>=n));}
export function xpNeeded(level){return 35+level*14;}
export function drawTalents(s,p){const eligible=eligibleTalents(p).filter(t=>!p.talentOffers?.includes(t.id));const pool=eligible.length?eligible:eligibleTalents(p);const drawn=[];while(pool.length&&drawn.length<3+(p.meta.upgrades.talentdraw||0)){drawn.push(pool.splice(Math.floor(random(s)*pool.length),1)[0].id);}p.talentOffers=drawn;}
export function gainXp(s,p,n){p.xp+=Math.round(n*(1+(p.meta.upgrades.insight||0)*.04+(race(p).xp||0)+stats(p).xpBonus/100));while(p.xp>=xpNeeded(p.level)){p.xp-=xpNeeded(p.level);p.level++;p.statPoints+=2;p.talentPoints++;p.points+=2;heal(p,12);p.mana=Math.min(stats(p).mana,p.mana+12);if(!p.talentOffers?.length)drawTalents(s,p);log(s,`${p.name}: NÍVEL ${p.level}! +2 SPECIAL, +2 evolução e uma carta.`,'level');}}

export function newPlayer(id,name,classId,meta=emptyMeta(),raceId='humano'){
 assert(CLASSES.some(c=>c.id===classId),'Classe inválida.');meta=normalizeMeta(meta);const r=RACES.find(r=>r.id===raceId);assert(r&&(!r.cost||meta.races.includes(raceId)),'Raça bloqueada.');
 const p={id,name:String(name||'Viajante').slice(0,24),classId,raceId,special:Object.fromEntries(SPECIAL.map(x=>[x.id,5])),traits:[],evolution:null,ultra:null,talentOffers:[],meta:structuredClone(meta),hp:1,mana:1,shield:0,level:1,xp:0,points:0,statPoints:2,talentPoints:0,allocated:{str:0,dex:0,int:0,vit:0},talents:[],skills:{},equipment:{weapon:null,armor:null,helm:null,ring:null,amulet:null},bag:[],gold:25+meta.upgrades.purse*15,potions:1+meta.upgrades.provisions,summons:[],threat:0,guard:false,acted:false,ready:false,encounterDone:false,damage:0,formation:'front',status:{},usedRevive:false,critProcs:0};const v=stats(p);p.hp=v.hp;p.mana=v.mana;return p;
}
export function createRoom(host,name,classId,meta,seed=Date.now(),raceId='humano'){return {version:VERSION,seed:seed>>>0,host,ruleset:3,combatMode:'atb',phase:'lobby',stage:0,cleared:0,round:0,seq:0,log:[],players:[newPlayer(host,name,classId,meta,raceId)],enemies:[],choices:[],event:null,route:[],rewarded:false,roundAt:0,lootClaimed:false};}
export function addPlayer(s,id,name,classId,meta,raceId='humano'){assert(s.phase==='lobby','A expedição já começou.');assert(s.players.length<20,'Party cheia (20 pessoas).');assert(!s.players.some(p=>p.id===id),'Você já está na sala.');s.players.push(newPlayer(id,name,classId,meta,raceId));return s;}
export function pack(items){const grid=Array(60).fill(false),positions=[];for(const it of items){let found=false;for(let y=0;y<=6-it.h&&!found;y++)for(let x=0;x<=10-it.w&&!found;x++){let free=true;for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)if(grid[(y+j)*10+x+i])free=false;if(free){for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)grid[(y+j)*10+x+i]=true;positions.push({id:it.id,x,y});found=true;}}if(!found)return null;}return positions;}
export function item(s,level,p){
 const myth=random(s)<.001;const m=MYTHICS.find(x=>x.classId===p?.classId)||MYTHICS[0];
 const base=pick(s,[...BASE_ITEMS,...EXTRA_ITEMS]),quality=(p?stats(p).lootQuality:0)+(p?.meta.upgrades.scavenger||0)*2;
 const roll=Math.max(0,Math.min(.999,random(s)+quality*.001)),rarity=myth?5:roll>.995?4:roll>.965?3:roll>.86?2:roll>.5?1:0;
 const prefix=pick(s,PREFIXES),suffix=pick(s,AFFIXES),slot=myth?'weapon':base[1];
 const mods=slot==='weapon'?{str:1+Math.ceil(level/4),int:1+Math.ceil(level/4),dex:1+Math.ceil(level/4)}:slot==='armor'?{armor:2+Math.floor(level/4)}:{hp:8+level*2};
 if(rarity>0)mods[prefix[1]]=(mods[prefix[1]]||0)+prefix[2]*(1+Math.floor(level/10)*.2);if(rarity>1)mods[suffix[1]]=(mods[suffix[1]]||0)+suffix[2]*(1+Math.floor(level/10)*.2);
 if(rarity>2){const extra=pick(s,PREFIXES);mods[extra[1]]=(mods[extra[1]]||0)+extra[2];}if(myth){mods.power=.35;mods.hp=80+level*3;mods.mana=40;mods.lootQuality=15;mods.xpBonus=20;}
 const name=myth?m.weapon+' — '+m.name:`${rarity?prefix[0]+' ':''}${base[0]}${rarity>1?' '+suffix[0]:rarity?'':' Gasto'}`;
 const stat=['Espada','Martelo','Machado','Lança','Bastão','Manoplas','Foice'].includes(myth?m.weapon:base[0])?'S':['Cajado','Grimório','Cetro'].includes(myth?m.weapon:base[0])?'I':['Arco','Besta','Pistola','Adaga'].includes(myth?m.weapon:base[0])?'P':'E';
 const weaponName=myth?m.weapon:base[0];const damageType=['Cajado','Grimório','Lira'].includes(weaponName)?'arcano':weaponName==='Cetro'?'sagrado':['Arco','Besta','Pistola','Adaga','Lança'].includes(weaponName)?'perfurante':['Martelo','Bastão','Manoplas'].includes(weaponName)?'contundente':'corte';
 return {id:`i${++s.seq}`,name,slot,damageType,icon:base[2],w:myth?2:base[3],h:myth?3:base[4],rarity,mods,level,requirements:{[stat]:Math.min(25,2+Math.floor(level/5)+(myth?4:0))},...(myth?{classId:m.classId,mythic:m.effect}:{})};
}
export function salePrice(p,it){return Math.floor((8+it.level+it.rarity*12)*(1+(p.meta.upgrades.salvage||0)*.1));}
function stockShop(s){s.shop={name:['Brunna, a ferreira','Ivo, o boticário','Madre Véspera'][Math.floor(s.stage/4)%3],stock:Array.from({length:8},()=>{const it=item(s,s.stage,null);return {...it,price:Math.ceil(35+it.level*4+it.rarity*40)};})};}

function loot(s,p){const it=item(s,s.stage,p);if(pack([...p.bag,it])){p.bag.push(it);log(s,`${p.name}: ${it.name}.`,'loot');}else{p.gold+=10+it.rarity*8;log(s,'Mochila cheia: loot convertido em ouro.','loot');}}
function heal(p,n,source=p){const tr=rules(null,p,'heal',{type:'sagrado',kind:'heal'});n*=tr.heal??1;const v=stats(p),amount=Math.max(0,Math.round(n*(race(p).healing||1)*(p.status?.infected?.5:1))),extra=Math.max(0,p.hp+amount-v.hp);p.hp=Math.min(v.hp,p.hp+amount);if(passive(source,'element')&&cls(source).paths[source.evolution].effect==='support')shield(p,amount*.2);if(has(source,'overflow'))p.shield=Math.min(Math.round(v.hp*.5),p.shield+Math.round(extra*.5));traitApply(p,tr);}
function shield(p,n){p.shield=Math.min(stats(p).hp,Math.round(p.shield+n*(1+(race(p).shield||0))));}
function finish(s,win){s.phase=win?'victory':'defeat';s.enemies=[];s.rewarded=true;for(const p of s.players){const base=(s.cleared?6+s.cleared*6:0)+(win?Math.floor(s.stage*8):0);p.lastEchoes=Math.floor(base*(1+(p.meta.upgrades.legacy||0)*.05));p.meta.shards+=p.lastEchoes;p.meta.runs++;if(win)p.meta.wins++;}log(s,win?'EXPEDIÇÃO EXTRAÍDA. O ABISMO CONTINUA.':'A PARTY CAIU. O LEGADO FICA.',win?'good':'hurt');}
function damageEnemy(s,p,e,damage,type,impact=1,canProc=true,hitContext={}){
 if(!e||e.hp<=0)return 0;const old=e.hp;if(e.ward){damage=Math.ceil(damage*.75);e.ward--;}e.hp=Math.max(0,e.hp-damage);p.damage+=Math.min(old,damage);p.threat+=damage*stats(p).threat;
 if(e.staggerMax&&!e.stunned&&!e.staggerLock){e.stagger+=damage*impact*stats(p).stagger;if(e.stagger>=e.staggerMax){e.stunned=e.boss?2:1;e.stagger=0;if(passive(p,'element')&&cls(p).paths[p.evolution].effect==='stagger')p.mana=Math.min(stats(p).mana,p.mana+8);log(s,`${e.name}: QUEBRA! ${e.stunned} ações interrompidas.`,'crit');}}
 if(e.hp===0&&old>0){traitApply(p,rules(s,p,'kill',{boss:!!e.boss,type,...hitContext}));}
 if(e.hp===0&&canProc){if(e.trick==='explode'){s.visuals.push({actor:e.id,enemy:true,species:e.species,kind:'explode',fx:e.name+':explode',type:'fogo',target:living(s)[0]?.id,targets:living(s).map(q=>q.id)});for(const q of living(s))hurt(s,q,e.attack*.8,'fogo',null,true);log(s,e.name+' explodiu ao morrer!','hurt');}if(passive(p,'sustain')){heal(p,stats(p).hp*.06);p.mana=Math.min(stats(p).mana,p.mana+4);}if(has(p,'carnage'))heal(p,stats(p).hp*.12);if(has(p,'contagion')&&e.poison){for(const q of foes(s)){q.poison=Math.min(has(p,'plague')?200:70,(q.poison||0)+Math.ceil(e.poison/2));q.poisonTurns=3;}}
  if(has(p,'overkill')&&damage>old){const q=foes(s)[0];if(q)damageEnemy(s,p,q,Math.round((damage-old)*.75),type,0,false);}}
 return Math.min(old,damage);
}
function hit(s,p,e,power,type,impact=1,options={}){
 if(!e||e.hp<=0)return 0;if(!e.combo&&!e.freeze&&!e.stunned&&random(s)<Math.max(0,Math.min(80,e.dodge??(e.trick==='evade'?12:0)))/100){log(s,e.name+' desviou. Marque ou congele o alvo.','hurt');return 0;}const v=stats(p),magical=!['corte','perfurante','contundente'].includes(type),attr=magical?v.int:Math.max(v.str,v.dex),crit=random(s)*100<v.crit;let mult=v.power*(1+(v[type]||0)/100)*(p.buff?1.25:1);
 if(p.equipment.weapon?.mythic==='execute'&&e.hp<e.maxHp*.3)mult*=1.6;
 if(has(p,'bloodedge'))mult*=1+(1-p.hp/v.hp)*.6;if(p.hp<v.hp*.4)mult*=1+(race(p).rage||0);if(has(p,'bloodgod')&&p.hp<v.hp*.35)mult*=2;
 if(has(p,'glass')&&magical)mult*=1.35;if(has(p,'reservoir')&&p.mana>v.mana*.8)mult*=1.2;if(has(p,'execution')&&e.hp<e.maxHp*.3)mult*=1.5;
 if(has(p,'giantkiller')&&e.boss)mult*=1.2;if(has(p,'shatter')&&e.freeze){mult*=1.65;impact*=2;}if(has(p,'fracture')&&e.stunned)mult*=1.5;
 if(p.reprisal&&!options.pet){mult*=has(p,'reprisal')?1.6:1.35;p.reprisal=false;}if(options.pet){mult*=v.summonPower;if(has(p,'pact'))mult*=1.3;}if(has(p,'overmind'))mult*=1+p.summons.length*.12;
 if(options.spell&&has(p,'confluence')&&p.lastElement&&p.lastElement!==type)mult*=1.3;if(options.tier===3&&has(p,'archon'))mult*=1.5;
 if(p.formation==='back'&&['corte','contundente'].includes(type)&&!options.spell)power*=.85;
 const tr=rules(s,p,'hit',{type,boss:!!e.boss,summon:!!options.pet,crit,poison:e.poison||0,burn:e.burn||0,freeze:e.freeze||0,curse:e.curse||0,bleed:e.bleed||0});mult*=tr.dmg??1;
 let d=Math.max(1,Math.round((7+attr*.95+p.level*1.4)*power*mult*(.92+random(s)*.16)*(crit?1.8:1)*(1-((e.resist[type]||0)>0&&options.pierce?(e.resist[type]||0)*.5:e.resist[type]||0)/100)*(e.stunned?1.35:1)*(e.curse?1.25:1)));
 if(e.combo&&e.combo.actor!==p.id&&s.clock-e.combo.at<=240&&!trait(p,'solitary')){power=1;const bonus=Math.round(d*(.4+(passive(p,'bond')?.15:0)+(p.meta.upgrades.resonance||0)*.05));damageEnemy(s,p,e,bonus,type,0);log(s,'COMBO DE PARTY! +'+bonus,'crit');e.combo=null;}
 if(e.lastElement&&e.lastElement.actor!==p.id&&s.clock-e.lastElement.at<240&&((e.lastElement.type==='fogo'&&type==='gelo')||(e.lastElement.type==='gelo'&&type==='fogo')||(type==='eletrico'&&e.freeze))){damageEnemy(s,p,e,Math.ceil(d*.5),type,1);log(s,'REAÇÃO ELEMENTAL EM CONJUNTO!','crit');}
 e.lastElement={actor:p.id,type,at:s.clock||0};
 if(passive(p,'element')&&cls(p).paths[p.evolution].effect==='crit'&&crit)e.nextAt=(e.nextAt||s.clock)+18;if(passive(p,'element')&&cls(p).paths[p.evolution].effect==='power'&&e.hp<e.maxHp*.4)d=Math.round(d*1.25);damageEnemy(s,p,e,d,type,impact,true,{crit,summon:!!options.pet,kind:activeCommand.get(p)?.kind});if(e.hp>0&&e.trick==='counter'&&!options.pet&&['corte','contundente'].includes(type)){s.visuals.push({actor:e.id,enemy:true,species:e.species,kind:'counter',type:'corte',target:p.id});hurt(s,p,e.attack*.4,'corte',null,true);}if(e.hp>0&&e.trick==='reflect'&&(options.spell||!['corte','perfurante','contundente'].includes(type))){s.visuals.push({actor:e.id,enemy:true,species:e.species,kind:'reflect',type:'arcano',target:p.id});hurt(s,p,d*.2,'arcano',null,true);}log(s,`${p.name} > ${e.name}: ${d} ${type}${crit?'! CRÍTICO':''}`,crit?'crit':'damage');
 const myth=p.equipment.weapon?.mythic;if(myth==='roots')e.freeze=2;if(myth==='volatile'){e.burn=Math.ceil(d*.2);e.burnTurns=3;}if(myth==='anthem')for(const q of living(s))q.buff=2;if(myth==='radiance')for(const q of living(s))heal(q,3,p);if(myth==='guard')shield(p,5);if(myth==='combo'&&!options.pet)damageEnemy(s,p,e,Math.ceil(d*.2),type,1,false);if(myth==='storm'){const next=foes(s).find(x=>x!==e);if(next)damageEnemy(s,p,next,Math.ceil(d*.25),'eletrico',0,false);}
 if(v.leech)heal(p,d*v.leech/100);if(crit&&has(p,'manacrit')&&p.critProcs<3){p.mana=Math.min(v.mana,p.mana+5);p.critProcs++;}
 if(has(p,'cinders')&&type==='fogo'){e.burn=Math.max(e.burn||0,Math.round(d*.18));e.burnTurns=2+(race(p).burn||0);}
 if(has(p,'venom')&&type==='veneno'){e.poison=Math.min(has(p,'plague')?200:70,(e.poison||0)+Math.round(d*.2));e.poisonTurns=3;}
 traitApply(p,tr,e);
 if(has(p,'thermal')&&type==='gelo'&&e.burn)damageEnemy(s,p,e,Math.round(d*.45),'contundente',1,false);
 if(has(p,'stormloop')&&type==='eletrico'&&(e.burn||e.freeze)){for(const q of foes(s).filter(q=>q.id!==e.id))damageEnemy(s,p,q,Math.round(d*.4),type,.2,false);}
 if(crit&&has(p,'cascade')){const q=foes(s).find(q=>q.id!==e.id);if(q)damageEnemy(s,p,q,Math.round(d*.45),type,.2,false);}return d;
}
function hurt(s,p,n,type,enemy=null,noDodge=false){const v=stats(p);if(!noDodge&&random(s)*100<dodgeChance(p)){traitApply(p,rules(s,p,'dodge',{type,boss:!!enemy?.boss}));s.visuals.push({actor:p.id,action:'dodge',kind:'dodge',type:'arcano'});log(s,`${p.name} ESQUIVOU.`,'good');if(enemy&&has(p,'riposte'))hit(s,p,enemy,.55,cls(p).type);return 0;}
 const tr=rules(s,p,'hurt',{type,boss:!!enemy?.boss});n*=(tr.received??1)*(p.status.curse?1.25:1);
 if(p.formation==='back'&&['corte','perfurante','contundente'].includes(type))n*=.8;if(trait(p,'fragile')&&['corte','perfurante','contundente'].includes(type))n*=1.4;if(passive(p,'crown')&&p.hp<v.hp*.35)n*=.85;const knight=p.summons.find(x=>x.kind==='knight'&&x.hp>0);if(knight){knight.hp=Math.max(0,knight.hp-n*.35);n*=.65;}
 let dmg=Math.max(1,Math.round(n*(1-Math.max(-40,Math.min(70,(v[type]||0)*.65))/100)-v.armor));if(has(p,'glass'))dmg=Math.round(dmg*1.2);if(has(p,'laststand')&&p.hp<v.hp*.3)dmg=Math.ceil(dmg*.75);if(p.guard)dmg=Math.ceil(dmg*.4);
 const absorbed=Math.min(p.shield,dmg);p.shield-=absorbed;dmg-=absorbed;p.hp=Math.max(0,p.hp-dmg);traitApply(p,tr);log(s,`${p.name}: −${dmg} PV${absorbed?` / ${absorbed} bloqueado`:''}.`,'hurt');
 if(enemy&&has(p,'thorns')&&(p.guard||has(p,'ironking')))damageEnemy(s,p,enemy,Math.round(dmg*.35),'contundente',.3,false);
 if(p.hp===0&&(race(p).revive||trait(p,'phoenix')||p.meta.upgrades.phoenixecho)&&!p.usedRevive){p.usedRevive=true;p.hp=Math.ceil(v.hp*(race(p).revive?.25:trait(p,'phoenix')?.2:.15));log(s,`${p.name} RECUSA A MORTE.`,'good');}return dmg;
}
export function enemyIntent(s,e){if(e.stunned)return {kind:'stun',label:'QUEBRADO',mult:0};if(e.moves?.length){const index=(s.combatMode==='atb'?(e.turn||0):Math.max(0,(s.round||1)-1))%e.moves.length,m=e.moves[index];return {...m,mult:m.mult*(e.phase===2?1.15:1),label:(m.ultimate?'ULTIMATE · ':e.phase===2?'FASE II · ':'')+m.label};}if(e.boss&&e.phase===2&&(e.turn||0)%4===0){const kind=e.type==='fogo'?'enrage':e.type==='veneno'?'brood':'mana';return {kind,label:({enrage:'FASE II · SOBRECARGA',brood:'FASE II · ENXAME',mana:'FASE II · DRENAGEM'})[kind],mult:.8};}if(e.boss){const turn=s.combatMode==='atb'?(e.turn||0)+1:s.round;if(turn%3===0)return {kind:'aoe',label:'CATACLISMO [TODOS]',mult:.8};if(turn%3===2)return {kind:'heavy',label:'EXECUÇÃO [TANQUE]',mult:1.65};return {kind:'attack',label:'GOLPE',mult:1};}
 if(e.trick&&((e.turn||0)+e.pattern)%3===1){const moves={protect:['protect','PROTEGER ALIADOS'],mana:['mana','DRENAR MANA'],brood:['brood','CHAMAR ENXAME'],revive:['revive','REANIMAR CAÍDO'],silence:['silence','SILENCIAR CURANDEIRO'],tax:['mana','DÍZIMO ARCANO'],root:['root','PRENDER RETAGUARDA'],enrage:['enrage','ENFURECER'],storm:['aoe','TEMPESTADE EM ÁREA']};if(moves[e.trick])return {kind:moves[e.trick][0],label:moves[e.trick][1],mult:.8};}
 const cycle=((s.combatMode==='atb'?(e.turn||0)+1:s.round)+e.pattern)%4;if(s.combatMode==='atb'&&cycle===1&&e.role==='fighter')return {kind:'mark',label:'ROMPER GUARDA / MARCA',mult:.8};if(s.combatMode==='atb'&&cycle===2&&e.role==='healer')return {kind:'rally',label:'CÂNTICO / FORTALECE ALIADOS',mult:0};if(cycle===0)return {kind:'heavy',label:'GOLPE PESADO',mult:1.8};if(cycle===2&&e.role==='caster')return {kind:'aoe',label:'MALDIÇÃO [TODOS]',mult:.65};if(cycle===3&&e.role==='healer')return {kind:'heal',label:'RITUAL DE CURA',mult:0};return {kind:'attack',label:e.role==='assassin'?'CAÇA AO FRÁGIL':'ATAQUE',mult:1};}
function clearBattle(s){s.phase='reward';s.roundAt=Date.now();s.cleared++;for(const p of s.players){if(p.hp<=0){addInjury(s,p,'trauma');addInjury(s,p,'trauma');p.hp=1;}const reward=rules(s,p,'reward',{boss:s.stage%5===0});gainXp(s,p,(65+s.stage*11)*(reward.xp??1));p.gold+=Math.round((16+s.stage*3)*(reward.gold??1));traitApply(p,reward);p.ready=false;loot(s,p);if(s.stage%5===0){loot(s,p);p.potions++;}}log(s,'VITÓRIA. Distribua atributos e talentos antes de avançar.','good');s.checkpoint=s.stage%5===0;}
function enemyTurn(s,e){
  if(!living(s).length)return;const intent=enemyIntent(s,e);
  if(e.stunned){e.turn=(e.turn||0)+1;e.stunned--;if(!e.stunned)e.staggerLock=2;log(s,`${e.name} perdeu a ação.`,'good');return;}
  if(e.staggerLock)e.staggerLock--;
  if(e.silenced&& !['attack','heavy'].includes(intent.kind)){e.silenced--;e.turn=(e.turn||0)+1;log(s,e.name+' teve a técnica anulada.','good');return;}
  const targets=living(s),top=[...targets].sort((a,b)=>b.threat-a.threat),max=top[0].threat;
  let target=pick(s,top.filter(p=>p.threat===max));if(!e.boss&&e.role==='assassin'&&max<60)target=[...targets].sort((a,b)=>a.hp/stats(a).hp-b.hp/stats(b).hp)[0];
  s.visuals=s.visuals||[];
  if(['mana','silence'].includes(intent.kind))target=[...targets].sort((a,b)=>b.mana-a.mana)[0];if(e.trick==='hunt'||e.trick==='execute')target=[...targets].sort((a,b)=>(b.status.exposed?1:0)-(a.status.exposed?1:0)||a.hp/stats(a).hp-b.hp/stats(b).hp)[0];
  s.visuals.push({actor:e.id,enemy:true,species:e.species,coven:e.coven,type:e.type,kind:intent.kind,ultimate:!!intent.ultimate,fx:e.name+':'+intent.kind,target:target.id});
  const rage=1+Math.max(0,s.round-4)*.1;let attack=e.attack*rage*(e.freeze?.7:1)*(e.empowered?1.25:1)*(e.role==='assassin'&&target.status.exposed?1.35:1);e.empowered=0;if(e.freeze)e.freeze--;if(e.curse)e.curse--;
  const allies=foes(s).filter(q=>q!==e),linked=allies.filter(q=>q.coven&&q.coven===e.coven);if(linked.length&&target.status.exposed)attack*=1+Math.min(.3,linked.length*.1);if(target.status.doom)attack*=1.2;
  if(e.trick==='pack')attack*=1+foes(s).filter(x=>x.trick==='pack'&&x!==e).length*.12;if(e.trick==='execute'&&target.hp<stats(target).hp*.35)attack*=1.5;
  if(intent.kind==='hex'){hurt(s,target,attack*.65,e.type,e);target.status.doom=3;target.status.infected=2;log(s,e.name+' condenou '+target.name+': rituais +20% dano; cura recebida pela metade.','hurt');}
  else if(intent.kind==='rupture'){const d=hurt(s,target,attack*1.1,e.type,e);if(d>0&&!target.guard){target.status.bleed=3;target.nextAt=(target.nextAt||s.clock)+15;}}
  else if(intent.kind==='brand'){hurt(s,target,attack*.65,e.type,e);target.status.exposed=3;for(const q of linked.slice(0,2))q.nextAt=Math.max(s.clock+12,(q.nextAt||s.clock)-12);log(s,e.name+' marcou a presa e adiantou seus aliados.','hurt');}
  else if(intent.kind==='harvest'){const loss=hurt(s,target,attack*(target.status.bleed||target.hp<stats(target).hp*.4?1.85:1),e.type,e);for(const q of linked)q.hp=Math.min(q.maxHp,q.hp+Math.ceil(loss*.2));}
  else if(intent.kind==='volley'){s.visuals.at(-1).targets=targets.map(q=>q.id);for(const q of targets){const loss=hurt(s,q,attack*.65,e.type,e);if(loss>0&&q.status.exposed)q.status.bleed=2;}}
  else if(intent.kind==='wardbreak'){target.shield=Math.floor(target.shield*.3);hurt(s,target,attack*1.05,e.type,e);log(s,e.name+' destruiu 70% do escudo antes do impacto.','hurt');}
  else if(intent.kind==='ambush'){target=[...targets].sort((a,b)=>(b.status.exposed?1:0)-(a.status.exposed?1:0)||a.hp/stats(a).hp-b.hp/stats(b).hp)[0];s.visuals.at(-1).target=target.id;hurt(s,target,attack*(target.formation==='back'?1.55:1.2),e.type,e);}
  else if(intent.kind==='detonate'){s.visuals.at(-1).targets=targets.map(q=>q.id);for(const q of targets){const d=hurt(s,q,attack*(q.status.scorch?1.5:.9),e.type,e);if(d>0)q.status.scorch=3;}e.hp=Math.max(1,e.hp-Math.ceil(e.maxHp*.18));}
  else if(intent.kind==='ritual'){for(const q of foes(s)){q.empowered=1;q.ward=Math.max(1,q.ward||0);}target.status.doom=3;log(s,e.name+' fortalece e protege o grupo: quebre o ritual.','hurt');}
  else if(intent.kind==='infect'){const d=hurt(s,target,attack*.7,e.type,e);if(d>0){target.status.infected=3;target.status.bleed=2;}}
  else if(intent.kind==='overload'){const marked=targets.filter(q=>q.status.chill||q.status.exposed),victims=marked.length?marked:[target];s.visuals.at(-1).targets=victims.map(q=>q.id);for(const q of victims)hurt(s,q,attack*(q.status.chill?1.65:1.1),e.type,e);}
  else if(intent.kind==='exchange'){const stolen=Math.min(target.mana,8+Math.ceil(s.stage*.7));target.mana-=stolen;target.nextAt=(target.nextAt||s.clock)+22;for(const q of linked)q.nextAt=Math.max(s.clock+12,(q.nextAt||s.clock)-10);log(s,e.name+' roubou mana e cedeu tempo aos aliados.','hurt');}
  else if(intent.kind==='protect'){for(const q of foes(s))q.ward=2;log(s,e.name+' protege o grupo: −25% dano por 2 ações.','hurt');}
  else if(intent.kind==='mana'){const drain=Math.min(target.mana,12+s.stage);target.mana-=drain;e.hp=Math.min(e.maxHp,e.hp+drain);log(s,e.name+' drenou '+drain+' mana de '+target.name+'.','hurt');}
  else if(intent.kind==='silence'){target.status.silence=2;log(s,target.name+' foi silenciado por 2 ciclos.','hurt');}
  else if(intent.kind==='root'){target.status.chill=3;hurt(s,target,attack*.7,e.type,e);}
  else if(intent.kind==='enrage'){e.attack*=1.15;log(s,e.name+' ganhou +15% ataque.','hurt');}
  else if(intent.kind==='revive'){const dead=s.enemies.find(x=>x.hp<=0&&!x.revived);if(dead){dead.hp=Math.ceil(dead.maxHp*.3);dead.revived=true;dead.nextAt=s.clock+75;log(s,e.name+' reanimou '+dead.name+'.','hurt');}else hurt(s,target,attack,e.type,e);}
  else if(intent.kind==='brood'){if(foes(s).length<10){const hp=Math.ceil(e.maxHp*.35);const larva={id:'brood'+(++s.seq),name:'Larva infernal',role:'assassin',type:'veneno',species:2,trick:'pack',pattern:0,hp,maxHp:hp,attack:e.attack*.6,resist:{},nextAt:s.clock+90,turn:0},slot=s.enemies.findIndex(q=>q.hp<=0&&q.id.startsWith('brood'));if(slot>=0)s.enemies[slot]=larva;else if(s.enemies.length<20)s.enemies.push(larva);log(s,e.name+' invocou uma larva.','hurt');}else hurt(s,target,attack,e.type,e);}
  else if(intent.kind==='rally'){for(const q of foes(s))q.empowered=1;log(s,`${e.name}: aliados fortalecidos. Elimine o suporte.`,'hurt');}
  else if(intent.kind==='mark'){hurt(s,target,attack*.8,e.type,e);target.status.exposed=2;log(s,`${target.name} está marcado: caçadores causam +35% dano.`,'hurt');}
  else if(intent.kind==='heal'){for(const q of foes(s))q.hp=Math.min(q.maxHp,q.hp+Math.ceil(q.maxHp*.15));log(s,`${e.name} curou seus aliados. INTERROMPA O RITUAL.`,'hurt');}
  else if(intent.kind==='aoe'){s.visuals.at(-1).targets=targets.map(q=>q.id);log(s,`${e.name}: ATAQUE COLETIVO!`,'hurt');for(const p of targets){hurt(s,p,attack*intent.mult,e.type,e);for(const pet of p.summons)pet.hp=Math.max(0,pet.hp-attack*.5);p.summons=p.summons.filter(pet=>pet.hp>0);}}
  else{const loss=hurt(s,target,attack*intent.mult,e.type,e);if(target.hp>0&&intent.kind==='heavy'&&!target.guard&&loss>=Math.max(8,stats(target).hp*.12)){addInjury(s,target,e.type==='contundente'?'fracture':'trauma');target.status.bleed=3;}if(e.boss&&targets.length>4){for(const q of top.filter(p=>p!==target).slice(0,Math.floor(targets.length/4)))hurt(s,q,attack*.6,e.type,e);}}
  if(s.combatMode==='atb'&&intent.mult>0&&target.hp>0){if(e.type==='gelo'){target.status.chill=2;log(s,`${target.name}: LENTIDÃO / recuperação +25%.`,'hurt');}if(e.type==='fogo'){target.status.scorch=2;log(s,`${target.name}: QUEIMADURA / 3 PV por ciclo.`,'hurt');}if(e.role==='fighter'&&e.type==='contundente'){e.hp=Math.min(e.maxHp,e.hp+Math.ceil(e.maxHp*.08));log(s,`${e.name}: devorou essência e se curou.`,'hurt');}}
  if(e.boss&&intent.bonus&&['attack','heavy','aoe','root','mark'].includes(intent.kind)){const affected=intent.kind==='aoe'?targets:[target];for(const q of affected.filter(q=>q.hp>0)){const b=intent.bonus;if(['bleed','chill','exposed'].includes(b))q.status[b]=2;if(b==='burn')q.status.scorch=2;if(b==='drain')e.hp=Math.min(e.maxHp,e.hp+Math.ceil(attack*.2));if(b==='delay')q.nextAt=(q.nextAt||s.clock)+18;if(b==='mana')q.mana=Math.max(0,q.mana-8);if(b==='execute'&&q.hp<stats(q).hp*.25)hurt(s,q,attack*.4,e.type,e);}}
  if(e.boss&&e.hp<e.maxHp*(e.phaseAt||.5)&&e.phase===1){e.phase=2;e.attack*=1.3;log(s,`${e.name}: FASE II. DANO +30%.`,'crit');}
 if(e.trick==='drain'&&intent.mult>0)e.hp=Math.min(e.maxHp,e.hp+Math.ceil(attack*.25));e.turn=(e.turn||0)+1;
}
function endRound(s){
 for(const p of living(s)){for(const pet of p.summons){if(pet.hp<=0)continue;const e=pet.kind==='archer'?[...foes(s)].sort((a,b)=>a.hp-b.hp)[0]:foes(s)[0];if(e){hit(s,p,e,pet.power,pet.type,.6,{pet:true});s.visuals.push({actor:pet.id,owner:p.id,summon:true,type:pet.type,target:e.id});}pet.turns--;if(pet.turns===0&&has(p,'offering')){heal(p,stats(p).hp*.1);p.mana=Math.min(stats(p).mana,p.mana+5);}}p.summons=p.summons.filter(x=>x.turns>0&&(x.hp===undefined||x.hp>0));if(has(p,'antidote'))heal(p,foes(s).filter(e=>e.poison).length*2);}
 for(const e of foes(s)){for(const [key,turns] of [['poison','poisonTurns'],['burn','burnTurns']]){if(e[key]&&e[turns]>0){e.hp=Math.max(0,e.hp-e[key]);e[turns]--;log(s,`${e.name}: ${e[key]} ${key==='burn'?'queimadura':'veneno'}.`,'damage');if(e[turns]===0)e[key]=0;}}}
 if(!foes(s).length){clearBattle(s);return;}
 for(const e of foes(s))enemyTurn(s,e);
 if(!living(s).length){finish(s,false);return;}if(!foes(s).length){clearBattle(s);return;}
 s.round++;s.roundAt=Date.now();for(const p of s.players){p.acted=false;p.guard=false;p.dodgeStance=false;p.threat=Math.floor(p.threat*.75);p.critProcs=0;p.mana=Math.min(stats(p).mana,p.mana+stats(p).regen+Math.round((stats(p).support-1)*8));if(p.buff)p.buff--;}
}
function battle(s){s.phase='combat';s.round=1;s.roundAt=Date.now();const n=s.players.length,boss=s.stage%5===0,level=s.players.reduce((v,p)=>v+p.level,0)/n,budget=combatBudget(s.stage,n,level);
 if(boss){const b=BOSS_ROSTER[(Math.floor(s.stage/5)-1+(s.bossOffset??=Math.floor(random(s)*BOSS_ROSTER.length)))%BOSS_ROSTER.length],hp=Math.round((200+s.stage*40)*budget.depth*(1+Math.max(0,level-1)*.018)*(1+(n-1)*.9));s.enemies=[{...b,id:'boss',boss:true,hp,maxHp:hp,attack:(21+s.stage*2.4+Math.sqrt(n)*2)*(1+Math.pow(s.stage-1,.9)*.022),stagger:0,staggerMax:hp*.26,staggerLock:0,phase:1,stunned:0,role:'boss',pattern:0}];}
 else{const count=budget.count,coven=pick(s,COVEN_GROUPS),useCoven=random(s)<.72,group=pick(s,[[0,2,3],[6,7,15],[1,12,23],[5,11,18],[9,13,21],[8,14,16],[24,30,31],[25,26,27],[28,29,42],[32,33,34],[35,36,37],[38,39,40],[41,42,43]]);s.enemies=Array.from({length:count},(_,i)=>{const spec=useCoven?INFERNAL_ENEMIES.find(e=>e.species===coven[i%5]):ENEMY_SPECIES[i<3?group[i]:Math.floor(random(s)*ENEMY_SPECIES.length)],hp=Math.round(budget.hp*(i%5===1?1.1:1));return {...spec,id:`e${i}`,pattern:i,boss:false,hp,maxHp:hp,attack:budget.attack*(spec.role==='assassin'?1.08:1),resist:{[spec.type]:30,sagrado:-15},stagger:0,staggerMax:Math.max(35,hp*.85),staggerLock:0,stunned:0};});}

 if(boss&&s.stage>=10){const escorts=INFERNAL_ENEMIES.filter(e=>e.type===s.enemies[0].type).slice(0,2);for(const [i,spec] of escorts.entries()){const hp=Math.round(budget.hp*.75);s.enemies.push({...spec,id:'escort'+i,hp,maxHp:hp,attack:budget.attack*.85,resist:{[spec.type]:25},pattern:i+1,stagger:0,staggerMax:hp*.8,stunned:0});}s.enemies[0].coven=escorts[0]?.coven;}
 for(const p of s.players){p.acted=false;p.threat=0;p.guard=false;p.shield=(race(p).shieldStart||0)+(p.meta.upgrades.aethershield||0)*12+(p.meta.upgrades.aegis||0)*5;p.buff=0;p.summons=[];p.status={};p.usedRevive=false;p.dodgeStance=false;p.traitActions=0;traitApply(p,rules(s,p,'start',{boss}));p.lastElement=null;p.reprisal=false;p.critProcs=0;}
 if(s.combatMode==='atb'){s.clock=0;s.pulse=100;for(const p of s.players){p.nextAt=0;p.acted=false;}for(const e of s.enemies){e.atbDelay=e.boss?58:48+e.pattern*11;e.nextAt=e.atbDelay;e.turn=0;}}
 if(!living(s).length){finish(s,false);return;}
 log(s,`${boss?'CHEFE':'COMBATE'} / PROFUNDIDADE ${s.stage}.`,'info');}
function next(s){s.checkpoint=false;s.stage++;s.biome=BIOMES[Math.floor((s.stage-1)/5)%BIOMES.length];s.event=null;s.roundAt=Date.now();for(const p of s.players){p.ready=false;p.encounterDone=false;}if(s.stage%5===0){battle(s);return;}if(s.stage%4===0){s.phase='camp';s.cleared++;stockShop(s);for(const p of s.players){heal(p,stats(p).hp*.12);p.mana=Math.min(stats(p).mana,p.mana+Math.ceil(stats(p).mana*.25));}return;}s.phase='route';const choices=[{kind:'combat',name:'Trilha hostil',detail:'Combate / XP e equipamento'},{kind:'event',name:pick(s,['Cripta lacrada','Caminho suspeito','Ruínas antigas']),detail:'Encontro / d20 e risco'}];if(false)choices.push({kind:'camp',name:'Fogueira & mercador',detail:'Recuperação parcial / shop'});else choices.push({kind:'elite',name:'Caçada de elite',detail:'Inimigos +30% / loot extra'});s.choices=choices;}
export function encounterDC(s,p,base,stat,rare=false){const value=rare?specialStats(p)[stat]:stats(p)[stat],raw=Math.floor(((value??5)-5)/2);return Math.max(base,raw+6+Math.floor(Math.sqrt(Math.max(0,s.stage-1))/3));}
function spellCost(p,sp,s=null){if(sp.kind==='death')return 100;let cost=sp.cost*(trait(p,'savant')?.85:1)*(passive(p,'discipline')?.95:1)*(1-(p.meta.upgrades.runesmith||0)*.02)*(1-(race(p).discount||0))*(1-Math.min(.5,echoBonus(p.meta,'runeCost')/100));if(has(p,'archon')&&sp.tier===3)cost*=.7;return Math.max(1,Math.ceil(cost*((activeCommand.get(p)||rules(s,p,'action',{action:'spell',kind:sp.kind,type:sp.type})).cost??1)));}
export {spellCost};
function cast(s,p,combo,target,ally){
 assert(!p.status.silence,'Silenciado: não pode conjurar.');const sp=resolveSpell(combo);if(!sp){assert(p.mana>=3,'Experimentar exige pelo menos 3 mana.');p.mana-=3;log(s,`${p.name}: as runas se desfazem. −3 mana. A ordem importa.`,'magic');return;}
 const cost=spellCost(p,sp,s);assert(p.mana>=cost,`A fórmula exige ${cost} mana.`);const v=stats(p),petCap=summonCap(p);
 if(sp.kind==='summon')assert(p.summons.length<petCap,`Limite de ${petCap} invocações.`);
 if(sp.kind==='revive')assert(ally&&ally.hp<=0,'Essa fórmula exige um aliado caído.');
 if(['heal','shield'].includes(sp.kind))assert(ally&&ally.hp>0,'Selecione um aliado vivo.');
 if(['death','hit','drain','stagger','poison','burn','freeze','chain','curse'].includes(sp.kind))assert(target&&target.hp>0,'Selecione um inimigo vivo.');
 if(trait(p,'bloodprice')){p.hp=Math.max(1,p.hp-Math.ceil(v.hp*.08));}p.mana-=cost;if(!p.meta.spells.includes(sp.combo)){p.meta.spells.push(sp.combo);log(s,`${p.name} DESCOBRIU ${sp.name}!`,'loot');}
 const frozen=target?.freeze,venom=target?.poison||0;const scale=(10+v.int)*sp.power*v.support;
 if(sp.kind==='heal'){const a=ally&&ally.hp>0?ally:p;heal(a,scale,p);p.threat+=scale*.4;}
 else if(sp.kind==='partyheal'){for(const a of living(s)){heal(a,scale,p);if(has(p,'saint'))a.mana=Math.min(stats(a).mana,a.mana+2);}p.threat+=scale*living(s).length*.4;}
 else if(sp.kind==='shield')shield(ally&&ally.hp>0?ally:p,scale);
 else if(sp.kind==='summon')summon(s,p,sp.mechanic==='archer'?'archer':sp.mechanic==='knight'?'knight':p.classId==='necromante'?'skeleton':'spirit',sp.power,sp.type);
 else if(sp.kind==='revive'){ally.hp=Math.ceil(stats(ally).hp*Math.min(.75,sp.power));log(s,`${ally.name} voltou à luta.`,'good');}
 else if(sp.kind==='death'){damageEnemy(s,p,target,target.boss?Math.ceil(target.maxHp*.35):target.hp,'sombrio',2);log(s,'DEATH TOUCH: a alma foi arrancada.','crit');}
 else if(sp.kind==='aoe')for(const e of foes(s))hit(s,p,e,sp.power,sp.type,1,{spell:true,tier:sp.tier});
 else{const d=hit(s,p,target,sp.power,sp.type,sp.kind==='stagger'?2.7:1,{spell:true,tier:sp.tier});if(sp.kind==='drain')heal(p,d*.4,p);if(sp.kind==='poison'){target.poison=Math.min(has(p,'plague')?200:70,(target.poison||0)+Math.round(d*.3));target.poisonTurns=sp.duration+1;}if(sp.kind==='burn'){target.burn=Math.max(target.burn||0,Math.round(d*.3));target.burnTurns=sp.duration+(race(p).burn||0);}if(sp.kind==='freeze')target.freeze=sp.duration;if(sp.kind==='curse')target.curse=sp.duration;if(sp.kind==='chain'){for(const e of foes(s).filter(e=>e.id!==target.id).slice(0,2))hit(s,p,e,sp.power*.6,sp.type,.5,{spell:true,tier:sp.tier});}}
 if(sp.mechanic){const alive=foes(s),m=sp.mechanic;
  if(['funeral','unward','corrode'].includes(m)&&target){target.ward=0;if(m==='unward')target.empowered=0;}
  if(m==='combust'&&target){damageEnemy(s,p,target,Math.ceil(venom*2),'fogo',.5);target.poison=0;target.poisonTurns=0;}
  if(m==='shatter'&&frozen)hit(s,p,target,sp.power*.7,'contundente',2,{spell:true});
  if(m==='frostbind'&&target)target.nextAt=(target.nextAt||s.clock)+25;
  if(m==='conductor')for(const q of [target,...alive.filter(q=>q!==target)].filter(q=>q?.hp>0).slice(0,3))q.combo={actor:p.id,at:s.clock||0};
  if(m==='ashstorm')for(const q of alive){q.burn=Math.max(q.burn||0,Math.ceil((8+v.int)*.35));q.burnTurns=3;}
  if(m==='cleanse'&&ally)for(const k of ['poison','bleed','scorch','infected'])ally.status[k]=0;
  if(m==='respite')for(const q of living(s)){q.status.chill=0;q.status.curse=0;q.status.doom=0;}
  if(m==='thorns'&&ally)ally.reprisal=true;
  if(m==='veil'&&ally)ally.status.haste=2;
  if(m==='silence'&&target)target.silenced=1;
  if(m==='bloodshare'){const q=[...living(s)].filter(q=>q!==p).sort((a,b)=>a.hp/stats(a).hp-b.hp/stats(b).hp)[0];if(q)heal(q,(10+v.int)*.75,p);}
  if(m==='manasteal')p.mana=Math.min(v.mana,p.mana+12);
  if(m==='partyhaste')for(const q of living(s))q.status.haste=2;
  if(m==='timelock'&&target)target.nextAt=(target.nextAt||s.clock)+(target.boss?20:40);
  if(m==='expose'&&target){target.combo={actor:p.id,at:s.clock||0};target.curse=2;}
  if(m==='guardian')for(const pet of p.summons)pet.hp=Math.min(pet.maxHp,pet.hp+Math.ceil(pet.maxHp*.2));
  if(m==='returnshield'&&ally)shield(ally,stats(ally).hp*.15);
  if(m==='poisonslow'&&target)target.freeze=2;
  if(m==='quake')for(const q of alive.filter(q=>q.boss))damageEnemy(s,p,q,Math.ceil((7+v.int)*.35),'contundente',3);
  if(m==='lastlight'&&target?.hp<=0)heal(p,v.hp*.15,p);
  if(m==='bloodpact')p.hp=Math.max(1,p.hp-Math.ceil(v.hp*.1));
  if(m==='healshield'&&ally)shield(ally,scale*.25);
  if(m==='twin'&&target?.hp>0)hit(s,p,target,sp.power,sp.type,1,{spell:true,tier:sp.tier});
  if(m==='winter')for(const q of alive)q.freeze=2;
  if(m==='voidchorus')for(const q of alive.filter(q=>!q.boss).slice(0,2))q.silenced=1;
  if(m==='harvest'&&target?.hp<=0)p.mana=Math.min(v.mana,p.mana+8);
  if(m==='advance'&&ally)ally.nextAt=Math.max(s.clock||0,(ally.nextAt||s.clock)-25);
 }
 p.lastElement=sp.type;log(s,`${p.name}: ${sp.name} [−${cost} PM].`,'magic');
}
function defend(s,p){const v=stats(p);p.guard=true;if(passive(p,'element')&&cls(p).paths[p.evolution].effect==='armor')for(const q of living(s))shield(q,6);shield(p,8+v.str*.5+(has(p,'bulwark')?20:0));p.threat+=35*v.threat*(has(p,'bulwark')?2:1);if(has(p,'reprisal')||passive(p,'reaction'))p.reprisal=true;if(has(p,'martyr')){const ally=[...living(s)].sort((a,b)=>a.hp/stats(a).hp-b.hp/stats(b).hp)[0];heal(ally,stats(ally).hp*.12,p);}log(s,`${p.name} DEFENDE. Dano −60%.`,'good');}
function applyActionCore(original,id,a,now=Date.now()){
 assert(original.version===VERSION,'Esta run usa regras antigas. Volte ao santuário para iniciar uma nova.');const s=structuredClone(original);for(const q of s.players)if(!q.meta?.upgrades||!Object.hasOwn(q.meta.upgrades,UPGRADES.at(-1).id)||!Array.isArray(q.meta.spells)||!Array.isArray(q.meta.races)||q.meta.upgrades.spellmemory>(q.meta.upgrades.aethershield||0))q.meta=normalizeMeta(q.meta);const p=s.players.find(p=>p.id===id);assert(p,'Você não pertence à sala.');assert(a&&typeof a.type==='string','Ação inválida.');s.visuals=[];for(const q of s.players){q.special??=Object.fromEntries(SPECIAL.map(x=>[x.id,5]));q.traits??=[];q.talentOffers??=[];q.status??={};}
 const decision=collectDecision(s,p,a,now);if(decision?.pending)return s;if(decision?.approved)a={...a,type:decision.type,index:decision.index};
 const expanded=expansionAction(s,p,a);if(expanded)return expanded;
 if(a.type==='formation'){assert(!['combat','victory','defeat'].includes(s.phase),'Mude a formação fora do combate.');assert(['front','back'].includes(a.row),'Formação inválida.');p.formation=a.row;return s;}
 if(a.type==='start'){assert(s.phase==='lobby','A expedição já começou.');for(const q of s.players)q.bag.push(item(s,1,q));next(s);return s;}
 if(a.type==='route'){assert(s.phase==='route','Não há rota para escolher agora.');assert(Number.isInteger(a.index)&&s.choices[a.index],'Rota inválida.');const choice=s.choices[a.index];s.route.push(choice.kind);s.elite=choice.kind==='elite';if(['combat','elite'].includes(choice.kind)){battle(s);if(s.elite)for(const e of s.enemies){e.hp=Math.round(e.hp*1.3);e.maxHp=e.hp;e.attack*=1.3;}}
  else if(choice.kind==='camp'){s.phase='camp';s.cleared++;stockShop(s);for(const q of s.players){heal(q,stats(q).hp*.3);q.mana=Math.min(stats(q).mana,q.mana+Math.ceil(stats(q).mana*.6));gainXp(s,q,20);}log(s,'FOGUEIRA: +30% PV, +60% PM. Poções são vendidas.','good');}
  else{s.phase='event';const rare=RARE_ENCOUNTERS.filter(e=>s.stage>=e.minStage&&!s.questSeen?.includes(e.id));if(rare.length&&random(s)<.26){s.event={...structuredClone(pick(s,rare)),special:true,clues:{},outcomes:{}};s.questSeen=[...(s.questSeen||[]),s.event.id];}else{s.event=structuredClone(pick(s,[...ENCOUNTERS,...EXTRA_ENCOUNTERS]));s.event.dc+=encounterDifficulty(s.stage);}}s.roundAt=now;return s;}
 if(['stat','talent','skill'].includes(a.type)){
  assert(!['combat','victory','defeat'].includes(s.phase),'Distribua pontos fora do combate.');
  if(a.type==='stat'){assert(SPECIAL.some(x=>x.id===a.stat),'Atributo SPECIAL inválido.');assert(p.statPoints>0,'Sem pontos de atributo.');assert(p.special[a.stat]<99,'Limite de atributo.');p.statPoints--;p.special[a.stat]++;if(a.stat==='vit')p.hp+=6;if(a.stat==='str')p.hp+=2;if(a.stat==='int')p.mana+=3;}
  if(a.type==='talent'){const t=eligibleTalents(p).find(t=>t.id===a.talent);assert(p.talentPoints>0&&t&&p.talentOffers.includes(a.talent),'Escolha uma das cartas oferecidas.');p.talentPoints--;p.talents.push(t.id);p.talentOffers=[];if(p.talentPoints)drawTalents(s,p);log(s,`${p.name}: talento ${t.name}.`,'good');}
  if(a.type==='skill'){const b=a.branch,n=a.node;assert(Number.isInteger(b)&&b>=0&&b<5&&Number.isInteger(n)&&n>=0&&n<4,'Evolução inválida.');const key=`${b}:${n}`;assert(!p.skills[key],'Já aprendida.');assert(n===0||p.skills[`${b}:${n-1}`],'Aprenda o nó anterior.');assert(n!==3||p.level>=8,'Evolução final exige nível 8.');assert(p.points>=1,'Sem pontos de evolução.');p.points--;p.skills[key]=1;log(s,`${p.name}: ${n===3?cls(p).paths[b].final:cls(p).paths[b].name}.`,'good');}return s;
 }
 if(['equip','sell','unequip','buy','buyPotion'].includes(a.type)){
  assert(!['combat','victory','defeat'].includes(s.phase),'Gerencie equipamento entre combates.');
  if(a.type==='buy')throw new Error('Escolha um item no estoque do mercador.');
  if(a.type==='buyPotion'){assert(s.phase==='camp','Apenas no mercador.');const cost=Math.ceil((a.type==='buy'?40+s.stage*2:24)*(1-(p.meta.upgrades.bargain||0)*.03));assert(p.gold>=cost,`Precisa de ${cost} ouro.`);assert(a.type!=='buyPotion'||p.potions<8,'Limite de 8 poções.');p.gold-=cost;if(a.type==='buy')loot(s,p);else p.potions++;return s;}
  if(a.type==='unequip'){assert(Object.hasOwn(p.equipment,a.slot),'Slot inválido.');const it=p.equipment[a.slot];assert(it,'Slot vazio.');assert(pack([...p.bag,it]),'Mochila cheia.');p.bag.push(it);p.equipment[a.slot]=null;}
  else{const i=p.bag.findIndex(x=>x.id===a.item);assert(i>=0,'Item não encontrado.');const it=p.bag.splice(i,1)[0];if(a.type==='sell')p.gold+=salePrice(p,it);else{assert(equipmentAllowed(p,it),'Requisitos SPECIAL/classe não atendidos.');const old=p.equipment[it.slot];if(old){assert(pack([...p.bag,old]),'Mochila cheia.');p.bag.push(old);}p.equipment[it.slot]=it;}}
  p.hp=Math.min(p.hp,stats(p).hp);p.mana=Math.min(p.mana,stats(p).mana);return s;
 }
 if(a.type==='inspectEncounter'){assert(s.phase==='event'&&s.event?.special&&!p.encounterDone&&p.hp>0,'Inspeção indisponível.');assert(!s.event.clues?.[p.id],'Você já investigou este local.');s.event.clues??={};s.event.clues[p.id]=true;log(s,s.event.clue,'good');return s;}
 if(a.type==='encounter'&&s.event?.special){resolveAdventure(s,p,a);return s;}
 if(a.type==='encounter'){
  assert(s.phase==='event'&&!p.encounterDone,'Encontro já resolvido.');p.encounterDone=true;if(a.skip){log(s,`${p.name} passou em segurança.`);gainXp(s,p,12);}else{const et=rules(s,p,'encounter');traitApply(p,et);p.encounterRisk=et.risk??1;const e=s.event,dice=roll(s,20),bonus=(et.bonus||0)+Math.floor((stats(p)[e.stat]-5)/2)-(trait(p,'cursed')?4:0)+(p.meta.upgrades.fortune||0)+echoBonus(p.meta,'eventBonus')+(has(p,'lucky')?2:0),dc=encounterDC(s,p,e.dc,e.stat),success=dice===20||(dice!==1&&dice+bonus>=dc);s.dice={player:p.name,dice,bonus,dc,success,id:++s.seq};log(s,`${p.name}: D20(${dice}) + ${bonus} / CD ${dc} = ${success?'SUCESSO':'FALHA'}.`,success?'good':'hurt');if(success){gainXp(s,p,48+s.stage*5);if(e.reward==='loot')loot(s,p);if(e.reward==='heal')heal(p,stats(p).hp*.4);if(e.reward==='mana')p.mana=stats(p).mana;if(e.reward==='shards')p.meta.shards+=10;if(e.reward==='spell'){const sp=randomFormula(s,random);p.hints=p.hints||[];const hint=sp.combo.split(' ');hint[hint.length-1]='?';if(!p.hints.includes(hint.join(' ')))p.hints.push(hint.join(' '));log(s,`${p.name} encontrou uma pista rúnica incompleta.`,'magic');}}else{punishEncounter(s,p,false);log(s,'Falha: ferimento crítico, lesão persistente, −45% ouro, −40% mana máxima e uma poção.','hurt');}}
  if(!living(s).length){finish(s,false);return s;}if(s.players.every(q=>q.encounterDone)){s.cleared++;s.phase='reward';s.roundAt=now;for(const q of s.players){q.ready=false;if(q.hp===0)q.hp=1;}}return s;
 }
 if(a.type==='ready'){assert(['camp','reward'].includes(s.phase),'Não é hora de avançar.');next(s);return s;}
 if(a.type==='skipAbsent'){assert(id===s.host,'Apenas o líder encerra a espera.');assert(now-s.roundAt>=45000,'Espere 45 segundos nesta rodada.');assert(s.phase==='combat','Somente em combate.');for(const q of living(s))if(!q.acted){defend(s,q);q.acted=true;q.nextAt=(s.clock||0)+actionDelay(q,'defend');}if(s.combatMode==='atb')advanceATB(s);else endRound(s);return s;}
 if(a.type==='extract'){assert(s.phase==='reward'&&s.checkpoint,'Extração só após um chefe.');finish(s,true);return s;}
 if(a.type==='abandon'){assert(!['lobby','victory','defeat'].includes(s.phase),'O líder pode encerrar uma run ativa.');finish(s,false);return s;}
 assert(s.phase==='combat'&&p.hp>0&&!p.acted,'Aguarde sua próxima rodada.');const e=s.enemies.find(e=>e.id===a.target),ally=s.players.find(q=>q.id===a.ally),v=stats(p),c=cls(p);activeCommand.set(p,actionRules(s,p,a));
 if(s.combatMode==='atb'&&a.type!=='defend')p.guard=false;p.dodgeStance=false;
 if(a.type==='combatSkill'){useCombatSkill(s,p,a,e,ally);}
 else if(a.type==='attack'){assert(e&&e.hp>0,'Selecione um inimigo vivo.');hit(s,p,e,1,p.equipment.weapon?.damageType||c.type);}
 else if(a.type==='defend')defend(s,p);
 else if(a.type==='dodge'){p.dodgeStance=true;p.guard=false;log(s,`${p.name}: DODGE / esquiva ${dodgeChance(p)}% até o próximo comando.`,'good');}
 else if(a.type==='potion'){assert(p.potions>0,'Sem poções.');if(!has(p,'recycle')||random(s)>.25)p.potions--;p.status.bleed=0;heal(p,v.hp*.32*(trait(p,'famine')?.5:1)*(race(p).potion||1)*(has(p,'chemist')?1.3:1));p.mana=Math.min(v.mana,p.mana+10);if(has(p,'chemist'))p.buff=3;log(s,`${p.name} bebeu uma poção.`,'good');}
 else if(a.type==='spell')cast(s,p,a.combo,e,ally);
 else if(a.type==='special'){assert(p.mana>=10,'Habilidade exige 10 mana.');p.mana-=10;
  if(c.action==='taunt'){p.threat=Math.max(...s.players.map(q=>q.threat))+120*v.threat;defend(s,p);shield(p,v.str);}
  else if(c.action==='guard'){for(const q of living(s))shield(q,(10+v.int)*v.support);p.threat+=70*v.threat;}
  else if(c.action==='heal'){for(const q of living(s)){heal(q,(14+v.int)*v.support,p);if(has(p,'saint'))q.mana=Math.min(stats(q).mana,q.mana+2);}p.threat+=15*living(s).length;}
  else if(c.action==='buff'){for(const q of living(s)){q.buff=3;q.mana=Math.min(stats(q).mana,q.mana+7);}p.threat+=30;}
  else if(c.action==='summon'){const cap=summonCap(p);assert(p.summons.length<cap,`Limite de ${cap} invocações.`);summon(s,p,({necromante:'skeleton',patrulheiro:'wolf',druida:'treant',bruxo:'imp',xama:'totem',artifice:'turret'})[p.classId]||'spirit',.7,c.type);}
  else if(c.action==='aoe')s.enemies.forEach(q=>hit(s,p,q,1.05,c.type));
  else{assert(e&&e.hp>0,'Selecione um inimigo vivo.');const d=hit(s,p,e,1.65,c.type,c.action==='stagger'?3:1);if(c.action==='poison'){e.poison=Math.min(70,(e.poison||0)+5+Math.floor(v.dex*.5));e.poisonTurns=3;}if(c.action==='drain')heal(p,d*.45);}
  log(s,`${p.name}: ${c.skill}.`,'magic');
 }else throw new Error('Ação desconhecida.');
 const visualSkill=a.type==='combatSkill'?skillsFor(p).find(x=>x.id===a.skill):a.type==='spell'?resolveSpell(a.combo):null;
 s.visuals.unshift({mechanic:visualSkill?.mechanic,actor:p.id,classId:p.classId,action:a.type,skill:a.skill,fx:visualSkill?.fx||a.skill||a.combo||null,type:visualSkill?.type||p.equipment.weapon?.damageType||c.type,kind:visualSkill?.kind||a.type,target:a.target,ally:a.ally});
 traitApply(p,activeCommand.get(p)||{});p.traitActions=(p.traitActions||0)+1;p.acted=true;if(!foes(s).length){if(s.elite)for(const q of s.players)loot(s,q);clearBattle(s);}else if(s.combatMode==='atb'){p.atbDelay=actionDelay(p,a.type==='combatSkill'?'special':a.type);p.nextAt=s.clock+p.atbDelay;advanceATB(s);}else if(living(s).every(q=>q.acted))endRound(s);return s;
}
export function upgradeMeta(meta,key){const m=normalizeMeta(structuredClone(meta)),u=UPGRADES.find(u=>u.id===key);assert(u,'Melhoria inválida.');assert((u.requires||[]).every(id=>(m.upgrades[id]||0)>0),'Compre o nó anterior neste ramo.');const lv=m.upgrades[key]||0,cost=u.base+lv*u.step;assert(lv<u.max,'Melhoria no máximo.');assert(m.shards>=cost,`Precisa de ${cost} ecos.`);m.shards-=cost;m.upgrades[key]=lv+1;return m;}
export function unlockRace(meta,id){const m=normalizeMeta(structuredClone(meta)),r=RACES.find(r=>r.id===id);assert(r&&r.cost&&!m.races.includes(id),'Raça indisponível ou já liberada.');assert(m.shards>=r.cost,`Precisa de ${r.cost} ecos.`);m.shards-=r.cost;m.races.push(id);return m;}

// Deterministic ATB Wait: no timer writes, offline drift, or client-supplied clock.
export function dodgeChance(p){return Math.min(100,stats(p).dodge+(p.dodgeStance?20:0));}
export function actionDelay(p,type='attack'){
 const speed=(70+Math.min(60,stats(p).dex*2))*(p.status?.chill?.8:1);
 return Math.max(25,Math.round(10000/speed*(trait(p,'slow')?1.35:1)*(trait(p,'nimble')?.8:1)*(1-Math.min(.5,stats(p).haste/100))*(p.status.haste?.7:1)*(1+(p.injuries?.shock||0)*.12)*((activeCommand.get(p)||rules(null,p,'action',{action:type,kind:type})).delay??1)*({dodge:.7,defend:.65,potion:.8,special:1.25,spell:1.4}[type]||1)));
}
function advanceATB(s){
 for(let step=0;step<200&&s.phase==='combat';step++){
  const heroes=living(s);if(!heroes.length){finish(s,false);return;}
  const enemies=foes(s);if(!enemies.length){clearBattle(s);return;}
  const nextHero=Math.min(...heroes.map(p=>Math.max(s.clock,p.nextAt??0)));
  const nextEnemy=Math.min(...enemies.map(e=>e.nextAt??75));
  s.clock=Math.min(nextHero,nextEnemy);
  while(s.clock>=s.pulse){
   s.pulse+=100;s.round++;
   for(const p of heroes){traitApply(p,rules(s,p,'pulse'));p.threat=Math.floor(p.threat*.85);p.critProcs=0;p.mana=Math.min(stats(p).mana,p.mana+stats(p).regen+Math.round((stats(p).support-1)*8));if(has(p,'antidote'))heal(p,foes(s).filter(e=>e.poison).length*2);if(p.buff)p.buff--;if(p.status.exposed)p.status.exposed--;if(p.status.chill)p.status.chill--;if(p.status.haste)p.status.haste--;if(p.status.silence)p.status.silence--;if(p.status.curse)p.status.curse--;if(p.status.poison&&p.hp>0){p.status.poison--;p.hp=Math.max(0,p.hp-4);}if(p.status.doom)p.status.doom--;if(p.status.infected)p.status.infected--;if(trait(p,'terminal'))p.hp=Math.max(0,p.hp-Math.ceil(stats(p).hp*.1));if(p.meta.upgrades.secondwind&&p.hp>0)heal(p,stats(p).hp*.02*p.meta.upgrades.secondwind);if(p.status.scorch){p.status.scorch--;hurt(s,p,Math.ceil(stats(p).hp*.035),'fogo',null,true);}if(p.status.bleed&&p.hp>0){p.status.bleed--;p.hp=Math.max(0,p.hp-Math.ceil(stats(p).hp*.06));log(s,p.name+' sangrou.','hurt');}
    for(const pet of p.summons){if(pet.hp<=0)continue;const e=pet.kind==='archer'?[...foes(s)].sort((a,b)=>a.hp-b.hp)[0]:foes(s)[0];if(e){hit(s,p,e,pet.power,pet.type,.6,{pet:true});s.visuals.push({actor:pet.id,owner:p.id,summon:true,type:pet.type,target:e.id});}pet.turns--;if(!pet.turns&&has(p,'offering')){heal(p,stats(p).hp*.1);p.mana=Math.min(stats(p).mana,p.mana+5);}}p.summons=p.summons.filter(x=>x.turns>0&&(x.hp===undefined||x.hp>0));
   }
   for(const e of foes(s)){if(e.bleed){e.hp=Math.max(0,e.hp-Math.ceil(e.maxHp*.025));e.bleed--;}for(const [key,turns] of [['poison','poisonTurns'],['burn','burnTurns']])if(e[key]&&e[turns]>0){e.hp=Math.max(0,e.hp-e[key]);e[turns]--;if(!e[turns])e[key]=0;}}
  }
  if(!foes(s).length){clearBattle(s);return;}
  if(!living(s).length){finish(s,false);return;}
  if(nextHero<=nextEnemy&&heroes.some(p=>p.hp>0&&(p.nextAt??0)<=nextHero)){for(const p of s.players){p.acted=p.hp<=0||(p.nextAt??0)>s.clock;}s.roundAt=Date.now();return;}
  const e=enemies.find(e=>e.hp>0&&e.nextAt===nextEnemy);if(e&&nextEnemy<=nextHero){enemyTurn(s,e);e.atbDelay=enemyRecovery(e);e.nextAt=s.clock+e.atbDelay;}
 }
}
export function summonCap(p){return 3+(has(p,'legion')?2:0)+(trait(p,'commander')?1:0)+(passive(p,'master')?1:0)+(p.meta.upgrades.legionecho||0)+(p.equipment.weapon?.mythic==='army'?2:0);}
function summon(s,p,kind,power,type){assert(p.summons.length<summonCap(p),'Limite de invocações atingido.');const hp=Math.round(30+stats(p).int*3+p.level*5);p.summons.push({id:'pet'+(++s.seq),kind,name:({skeleton:'Esqueleto',archer:'Arqueiro ósseo',knight:'Cavaleiro sepulcral',lich:'Lich',wolf:'Lobo',treant:'Ent',imp:'Ímpio',homunculus:'Homúnculo',totem:'Totem',spirit:'Espírito',turret:'Torreta',golem:'Autômato'})[kind]||'Servo',type,power,turns:6,hp,maxHp:hp});log(s,p.name+' invocou '+p.summons.at(-1).name+'.','magic');}
function useCombatSkill(s,p,a,e,ally){
 const sk=skillsFor(p).find(x=>x.id===a.skill);assert(sk,'Skill não aprendida.');assert(!p.status.silence,'Silenciado: use ataque, defesa ou item.');assert(p.mana>=combatSkillCost(p,sk,s),'Mana insuficiente.');if(sk.target==='enemy')assert(e&&e.hp>0,'Escolha um inimigo vivo.');if(sk.target==='ally')assert(ally&&(sk.kind==='revive'?ally.hp<=0:ally.hp>0),'Escolha um aliado válido.');if(sk.kind==='summon')assert(p.summons.length<summonCap(p),'Limite de invocações.');p.mana-=combatSkillCost(p,sk,s);const v=stats(p),scale=(10+v.int)*sk.power*v.support;
 if(sk.kind==='summon')summon(s,p,sk.pet,sk.power,sk.type);
 else if(sk.kind==='heal')heal(ally,scale,p);
 else if(sk.kind==='revive'){ally.hp=Math.ceil(stats(ally).hp*sk.power);ally.nextAt=Math.max(s.clock||0,ally.nextAt||0);}
 else if(sk.kind==='cover'){shield(ally,scale);ally.guard=true;p.threat+=35;}
 else if(sk.kind==='partyshield')for(const q of living(s))shield(q,scale);
 else if(sk.kind==='partyheal')for(const q of living(s))heal(q,scale,p);
 else if(sk.kind==='buff')for(const q of living(s))q.buff=3;
 else if(sk.kind==='haste'){ally.status.haste=3;ally.nextAt=(s.clock||0)+Math.max(0,(ally.nextAt||0)-(s.clock||0))*.65;}
 else if(sk.kind==='rage'){p.buff=4;p.hp=Math.max(1,p.hp-Math.ceil(v.hp*.08));}
 else if(sk.kind==='evade'){p.shield+=Math.ceil(v.hp*.25);p.status.haste=2;}
 else if(sk.kind==='taunt'){p.threat=Math.max(...s.players.map(q=>q.threat))+150;defend(s,p);}
 else if(sk.kind==='aoe')for(const q of foes(s))hit(s,p,q,sk.power,sk.type,1);
 else if(sk.kind==='chain')for(const q of [e,...foes(s).filter(q=>q!==e)].slice(0,3))hit(s,p,q,sk.power,sk.type,1);
 else if(sk.kind==='multi'){for(let i=0;i<3;i++)hit(s,p,e,sk.power,sk.type,1);}
 else{let power=sk.power;if(sk.kind==='execute'&&e.hp<e.maxHp*.35)power*=2;if(sk.kind==='pierce')power*=1.2;const d=hit(s,p,e,power,sk.type,sk.kind==='stagger'?3:1,{pierce:sk.kind==='pierce'});
  if(sk.kind==='mark')e.combo={actor:p.id,at:s.clock||0};if(sk.kind==='poison'){e.poison=(e.poison||0)+Math.ceil(d*.25);e.poisonTurns=3;}if(sk.kind==='burn'){e.burn=Math.ceil(d*.25);e.burnTurns=3;}if(sk.kind==='freeze')e.freeze=3;if(sk.kind==='curse')e.curse=3;if(sk.kind==='drain')heal(p,d*.5,p);
 }
 if(sk.mechanic){const m=sk.mechanic;if(m==='breach'&&e)e.curse=2;if(m==='momentum')p.status.haste=2;if(m==='cull'&&e?.hp<=0)p.mana=Math.min(v.mana,p.mana+12);if(m==='sunder'&&e)e.curse=3;if(m==='delay'&&e)e.nextAt=(e.nextAt||s.clock)+20;if(m==='silence'&&e)e.silenced=1;if(m==='conduct')for(const q of foes(s).slice(0,3))q.combo={actor:p.id,at:s.clock||0};if(m==='break'&&e?.stunned)p.mana=Math.min(v.mana,p.mana+8);if(m==='cleanse'&&ally){ally.status.bleed=0;ally.status.scorch=0;}if(m==='renew'&&ally)ally.mana=Math.min(stats(ally).mana,ally.mana+6);if(m==='aegis')for(const q of living(s))q.status.haste=2;if(m==='respite')for(const q of living(s))q.status.chill=0;if(sk.kind==='summon')for(const pet of p.summons)pet.hp=Math.min(pet.maxHp,pet.hp+Math.ceil(pet.maxHp*.15));}
 log(s,`${p.name}: ${sk.name}.`,'magic');
}
function expansionAction(s,p,a){
 if(a.type==='treat'){assert(s.phase==='camp','Tratamento só no mercador.');assert(Object.values(p.injuries||{}).some(Boolean),'Sem lesões para tratar.');const cost=90+s.stage*12;assert(p.gold>=cost,'Ouro insuficiente para tratamento.');p.gold-=cost;p.injuries={};p.status.bleed=0;log(s,p.name+' tratou suas lesões.','good');return s;}
 if(a.type==='configure'){
  assert(s.phase==='lobby','Personalize antes de iniciar.');const spec=a.special,traits=a.traits||[];assert(spec&&SPECIAL.every(x=>Number.isInteger(spec[x.id])&&spec[x.id]>=1&&spec[x.id]<=10),'SPECIAL inicial: 1–10 por atributo.');assert(SPECIAL.reduce((n,x)=>n+spec[x.id],0)<=40,'Você possui 40 pontos SPECIAL.');assert(Array.isArray(traits)&&traits.length<=12&&new Set(traits).size===traits.length&&traits.every(id=>TRAITS.some(t=>t.id===id)),'Traits inválidas.');assert(traitBalance(traits)>=0,'Debuffs precisam pagar o custo dos buffs.');p.special=Object.fromEntries(SPECIAL.map(x=>[x.id,spec[x.id]]));p.traits=traits;p.hp=stats(p).hp;p.mana=stats(p).mana;return s;
 }
 if(a.type==='skill'){
  assert(!['combat','victory','defeat'].includes(s.phase),'Evolua fora do combate.');const b=a.branch,n=a.node,tree=EVOLUTIONS[p.classId]?.[b],node=tree?.nodes[n];assert(Number.isInteger(b)&&Number.isInteger(n)&&node,'Nó inválido.');assert(p.evolution==null||p.evolution===b,'Você já escolheu outra superclasse nesta run.');assert(!p.skills[node.id]&&p.points>0&&p.level>=node.level&&node.req.every(k=>p.skills[k]),'Pontos, nível ou nós anteriores insuficientes.');p.evolution=b;p.points--;p.skills[node.id]=1;log(s,`${p.name}: ${tree.name} / ${node.name}.`,'level');return s;
 }
 if(a.type==='ultraSkill'){
  assert(!['combat','victory','defeat'].includes(s.phase),'Evolua fora do combate.');const tree=EVOLUTIONS[p.classId]?.[p.evolution],node=tree?.ultraNodes?.find(n=>n.id===a.node);assert(p.ultra&&node&&p.level>=node.level&&p.points>0&&!p.skills[node.id]&&node.req.every(k=>p.skills[k]),'Pontos, nível ou ramo ultra insuficiente.');assert(p.ultraLane==null||p.ultraLane===node.lane,'Escolha um único caminho ultra por expedição.');p.ultraLane=node.lane;p.points--;p.skills[node.id]=1;return s;
 }
 if(a.type==='ultra'){
  assert(!['combat','victory','defeat'].includes(s.phase),'Evolua fora do combate.');const tree=EVOLUTIONS[p.classId]?.[p.evolution];assert(tree&&!p.ultra&&p.level>=50&&p.points>=3&&tree.nodes.every(n=>p.skills[n.id]),'ULTRA exige árvore completa, nível 50 e 3 pontos.');p.points-=3;p.ultra=tree.ultra;p.hp=stats(p).hp;p.mana=stats(p).mana;log(s,`${p.name} ascendeu: ${p.ultra}!`,'level');return s;
 }
 if(a.type==='sellMany'){
  assert(['lobby','camp','reward','route'].includes(s.phase),'Venda fora do combate.');assert(Array.isArray(a.items)&&a.items.length>0&&a.items.length<=60&&new Set(a.items).size===a.items.length,'Seleção inválida.');const list=a.items.map(id=>p.bag.find(it=>it.id===id));assert(list.every(Boolean),'Um item selecionado não existe.');p.gold+=list.reduce((n,it)=>n+salePrice(p,it),0);p.bag=p.bag.filter(it=>!a.items.includes(it.id));return s;
 }
 if(a.type==='shopBuy'){
  assert(s.phase==='camp'&&s.shop,'Loja indisponível.');const i=s.shop.stock.findIndex(it=>it.id===a.item);assert(i>=0,'Item esgotado.');const it=s.shop.stock[i],cost=shopPrice(p,it);assert(p.gold>=cost,'Ouro insuficiente.');assert(pack([...p.bag,it]),'Mochila cheia.');p.gold-=cost;p.bag.push(it);s.shop.stock.splice(i,1);return s;
 }
 if(a.type==='refreshTalents'){
  assert(p.talentPoints>0,'Sem cartas disponíveis.');if(!p.talentOffers.length)drawTalents(s,p);return s;
 }
 return null;
}
export function shopPrice(p,it){return Math.max(1,Math.ceil(it.price*(1-(p.meta.upgrades.bargain||0)*.03)*Math.max(.6,1-specialStats(p).C*.02)*(race(p).price||1)));}

function resolveAdventure(s,p,a){
 assert(s.phase==='event'&&!p.encounterDone&&p.hp>0,'Encontro já resolvido ou personagem caído.');const event=s.event;event.outcomes??={};
 if(a.skip){p.encounterDone=true;event.outcomes[p.id]={success:true,text:'Você recuou em segurança.',reward:null};log(s,p.name+' deixou '+event.name+' para trás.');}
 else{
 const option=event.options.find(x=>x.id===a.choice);assert(option,'Escolha uma das ações deste encontro.');assert(p.gold>=(option.cost||0),'Ouro insuficiente para esta tentativa.');assert(!QUEST_RELICS[option.reward]||!s.questClaims?.[option.reward],'Esta relíquia já encontrou um portador nesta expedição.');
 // Reserve pack room before paying or rolling for an irreplaceable quest relic.
 const relic=QUEST_RELICS[option.reward];if(relic)assert(pack([...p.bag,{...relic,id:'preview'}]),'Abra espaço na mochila antes de tentar obter a relíquia.');
 p.gold-=option.cost||0;p.encounterDone=true;const et=rules(s,p,'encounter');traitApply(p,et);p.encounterRisk=et.risk??1;const dice=roll(s,20),bonus=(et.bonus||0)+Math.floor((specialStats(p)[option.stat]-5)/2)+(p.meta.upgrades.fortune||0)+echoBonus(p.meta,'eventBonus')+(event.clues?.[p.id]?4:0)-(trait(p,'cursed')?4:0)+(has(p,'lucky')?2:0),dc=encounterDC(s,p,option.dc+Math.floor(s.stage/12),option.stat,true),success=dice===20||(dice!==1&&dice+bonus>=dc);s.dice={player:p.name,dice,bonus,dc,success,id:++s.seq};let text;
 if(success){
  if(relic){const it={...structuredClone(relic),id:'quest'+(++s.seq),level:s.stage,quest:event.id};p.bag.push(it);s.questClaims??={};s.questClaims[option.reward]=p.id;text='Você conquistou '+it.name+'!';log(s,text,'loot');}
  else if(option.reward==='echoes'){p.meta.shards+=option.amount;text=option.amount+' ecos recuperados.';}
  else if(option.reward==='gold'){p.gold+=option.amount;text=option.amount+' ouro recuperados.';}
  else if(option.reward==='rest'){heal(p,stats(p).hp*.65);p.mana=Math.min(stats(p).mana,p.mana+Math.ceil(stats(p).mana*.65));text='O encontro restaurou sua vida e mana.';}
  else if(option.reward==='xp'){gainXp(s,p,option.amount);text='Você recebeu a memória de outra vida.';}
  else if(option.reward==='loot2'){loot(s,p);loot(s,p);if(event.id==='chest')p.gold+=80;text='Dois espólios foram recolhidos; mochila cheia converte itens comuns em ouro.';}
  gainXp(s,p,35+s.stage*4);
 }else{punishEncounter(s,p,true,option.risk);text='A tentativa falhou: ferimento crítico e lesão persistente, −60% do ouro restante, −50% da mana máxima e uma poção.';}
 event.outcomes[p.id]={success,text,reward:success?option.reward:null,dice,bonus,dc};log(s,`${p.name}: ${option.label} / D20 ${dice} + ${bonus} contra ${dc}. ${text}`,success?'good':'hurt');
 }
 if(!living(s).length){finish(s,false);return;}if(s.players.every(q=>q.encounterDone||q.hp<=0)){s.cleared++;s.phase='reward';s.roundAt=Date.now();for(const q of s.players){q.ready=false;if(q.hp===0)q.hp=1;}}
}

function addInjury(s,p,kind){p.injuries??={};p.injuries[kind]=Math.min(3,(p.injuries[kind]||0)+1);p.hp=Math.min(p.hp,stats(p).hp);log(s,p.name+' sofreu '+({trauma:'trauma',fracture:'fratura',shock:'choque'})[kind]+' persistente.','hurt');}
function punishEncounter(s,p,rare=false,risk=.3){const v=stats(p),damage=Math.ceil((Math.ceil(v.hp*(rare?Math.min(.9,.3+risk*1.5):.55))+s.stage*(rare?3:5))*(p.encounterRisk??1));p.hp=Math.max(0,p.hp-damage);p.gold=Math.floor(p.gold*(rare?.4:.55));p.mana=Math.max(0,p.mana-Math.ceil(v.mana*(rare?.5:.4)));p.potions=Math.max(0,p.potions-1);addInjury(s,p,rare?'trauma':'shock');if(rare)addInjury(s,p,'fracture');}
function capacityChanged(a,b){return !a||a.id!==b.id||a.hp!==b.hp||a.mana!==b.mana||!!a.shield!==!!b.shield||a.guard!==b.guard||a.summons?.length!==b.summons?.length||a.level!==b.level||a.ultra!==b.ultra||a.formation!==b.formation||a.injuries?.trauma!==b.injuries?.trauma||a.injuries?.fracture!==b.injuries?.fracture||a.injuries?.shock!==b.injuries?.shock;}
export function applyAction(original,id,a,now=Date.now()){
 const prev=turnStats,prevBuild=buildCache;turnStats=['attack','combatSkill','spell','special','defend','dodge','potion'].includes(a?.type)?new WeakMap():null;buildCache=turnStats?new WeakMap():null;
 try{const s=applyActionCore(original,id,a,now);for(const [index,p] of s.players.entries())if((!turnStats||capacityChanged(original.players[index],p))&&p.talents.some(id=>{const t=DEEP_TALENT_MAP.get(id);return t&&t.condition!=='always'&&(t.mods.hp||t.mods.mana)})){const v=stats(p);p.hp=Math.min(p.hp,v.hp);p.mana=Math.min(p.mana,v.mana);}if(a.type==='encounter'&&original.phase==='event'){const outcome=s.event?.outcomes?.[id];const success=outcome?.success??s.dice?.success??false;s.story={id:++s.seq,actor:id,event:s.event?.name||original.event.name,art:s.event?.art||'stone',success,skip:!!a.skip,frames:encounterStory(s.event||original.event,success,!!a.skip,a.choice),result:outcome?.text|| (a.skip?'Você seguiu em segurança.':success?'Teste superado.':'O erro deixou feridas e consumiu recursos.')};}if(a.type==='encounter'&&s.story?.actor===id){if(!a.skip&&s.dice?.id!==original.dice?.id)s.story.roll={die:s.dice.dice,bonus:s.dice.bonus,dc:s.dice.dc,total:s.dice.dice+s.dice.bonus,success:s.dice.success};s.stories={...(s.stories||{}),[id]:s.story};s.stories=Object.fromEntries(Object.entries(s.stories).filter(([pid])=>s.players.some(p=>p.id===pid)));}recordJourney(original,s,id,a,now);s.fxSeq=original.fxSeq||0;const events=(s.visuals||[]).map(ev=>({...ev,seq:++s.fxSeq,at:now,tick:s.clock||0,actionId:typeof a.clientActionId==='string'?a.clientActionId.slice(0,80):null}));s.visuals=events;s.fxHistory=[...(s.fxHistory||[]),...events].slice(-96);if(a.clientActionId)s.recentCommands=[...(s.recentCommands||[]),{id:String(a.clientActionId).slice(0,80),actor:id}].slice(-32);return s;}finally{turnStats=prev;buildCache=prevBuild;}
}
