// Shared authoritative expedition decisions and bounded journey records.
import {BIOMES} from './expansion.js';
export const DECISIONS={start:{label:'Iniciar a descida',type:'start',phases:['lobby']},advance:{label:'Avançar na jornada',type:'ready',phases:['camp','reward']},extract:{label:'Extrair e guardar os ecos',type:'extract',phases:['reward']},abandon:{label:'Encerrar a expedição',type:'abandon',phases:['route','event','camp','reward','combat']},route:{label:'Escolher o caminho',type:'route',phases:['route']}};
const check=(ok,message)=>{if(!ok)throw Error(message)};
const alias={start:'start',ready:'advance',extract:'extract',abandon:'abandon',route:'route'};
function validContext(s,v){return v&&v.stage===s.stage&&v.phase===s.phase&&DECISIONS[v.kind]?.phases.includes(s.phase)}
export function decisionStatus(s){const v=s?.vote;if(!validContext(s,v))return null;const members=s.players.map(p=>p.id),ballots=Object.fromEntries(Object.entries(v.ballots||{}).filter(([id])=>members.includes(id))),threshold=v.kind==='abandon'?members.length:Math.floor(members.length/2)+1,tallies={};for(const choice of Object.values(ballots))tallies[String(choice)]=(tallies[String(choice)]||0)+1;return {...v,ballots,deadlineAt:v.deadlineAt||v.createdAt+10000,threshold,tallies,total:members.length,voted:Object.keys(ballots).length,yes:tallies.true||0};}
function settle(s,now,timeout=false){const v=decisionStatus(s),winner=v.kind==='route'?Object.entries(v.tallies).find(([,n])=>n>=v.threshold)?.[0]:v.yes>=v.threshold?'true':null;if(winner!=null){s.lastVote={...s.vote,approved:true,choice:v.kind==='route'?Number(winner):true,endedAt:now};s.vote=null;return {approved:true,type:DECISIONS[v.kind].type,index:v.kind==='route'?Number(winner):undefined};}if(timeout||(v.kind==='abandon'&&v.tallies.false)||(v.tallies.false||0)>=v.threshold){s.lastVote={...s.vote,rejected:true,expired:timeout,endedAt:now};s.vote=null;for(const q of s.players)q.ready=false;}return {pending:true};}
export function cleanDecision(s){if(s.vote&&!validContext(s,s.vote)){s.vote=null;for(const p of s.players)p.ready=false;}if(s.vote){const view=decisionStatus(s);s.vote.ballots=view.ballots;if(s.vote.kind==='advance')for(const p of s.players)p.ready=view.ballots[p.id]===true;}}
export function collectDecision(s,p,a,now){
 cleanDecision(s);let kind=alias[a.type];const explicit=['proposeDecision','vote','withdrawVote','cancelDecision','resolveDecision'].includes(a.type);if(!kind&&!explicit)return null;
 if(a.type==='resolveDecision'){check(s.vote&&a.voteId===s.vote.id,'Essa votação já terminou.');check(now>=decisionStatus(s).deadlineAt,'A votação ainda está aberta.');return settle(s,now,true);}
 if(a.type==='cancelDecision'&&s.vote&&a.voteId===s.vote.id&&now>=decisionStatus(s).deadlineAt)return settle(s,now,true);
 if(a.type==='cancelDecision'){check(s.vote,'Nenhuma votação ativa.');check(a.voteId===s.vote.id,'Essa votação já terminou.');check(s.vote.by===p.id||s.host===p.id,'Apenas o proponente ou líder cancela a votação.');s.lastVote={...s.vote,ballots:{...s.vote.ballots},cancelled:true,endedAt:now};s.vote=null;for(const q of s.players)q.ready=false;return {pending:true};}
 if(a.type==='vote'||a.type==='withdrawVote'){check(s.vote&&a.voteId===s.vote.id,'Essa votação já terminou. Atualize sua decisão.');kind=s.vote.kind;}else if(a.type==='proposeDecision')kind=a.kind;
 const rule=DECISIONS[kind];check(rule&&rule.phases.includes(s.phase),'Essa decisão não está disponível agora.');check(kind!=='extract'||s.checkpoint,'Só é possível extrair após um chefe.');
 if(s.vote){check(s.vote.kind===kind,'Há outra votação ativa. Conclua ou cancele antes.');if(a.voteId!=null)check(a.voteId===s.vote.id,'Essa votação já terminou.');if(now>=decisionStatus(s).deadlineAt)return settle(s,now,true);}else{check(a.voteId==null,'Essa votação já terminou.');s.vote={id:++s.seq,kind,stage:s.stage,phase:s.phase,by:p.id,createdAt:now,deadlineAt:now+10000,ballots:{}};}
 if(a.type==='proposeDecision'){s.vote.ballots[p.id]=kind==='route'?0:true;return {pending:true};}
 const choice=a.type==='withdrawVote'?null:kind==='route'?(a.type==='route'?a.index:a.choice):(a.type==='vote'?a.choice:true);
 check(choice===null||(kind==='route'?Number.isInteger(choice)&&!!s.choices[choice]:typeof choice==='boolean'),'Voto inválido.');
 if(choice===null)delete s.vote.ballots[p.id];else s.vote.ballots[p.id]=choice;
 if(kind==='advance')for(const q of s.players)q.ready=s.vote.ballots[q.id]===true;
 return settle(s,now);
}
export function personalStory(s,id){if(!s||!id)return null;const own=s.stories?.[id];if(own?.actor===id)return own;return s.story?.actor===id?s.story:null;}

export const FEATS=[
 ['first_blood','Primeiro combate','Vença um combate.',t=>t.combats>=1],['skirmisher','Linha de frente','Vença dez combates.',t=>t.combats>=10],['veteran','Veteranos do abismo','Vença trinta combates.',t=>t.combats>=30],
 ['elite','Caçadores de elite','Vença uma caçada de elite.',t=>t.elites>=1],['elite5','Acima da própria sorte','Vença cinco caçadas de elite.',t=>t.elites>=5],['boss','Quebra de reinado','Derrote um chefe.',t=>t.bosses>=1],['boss5','Cinco coroas ao chão','Derrote cinco chefes.',t=>t.bosses>=5],
 ['slayer25','Rastro de aço','Abata 25 inimigos.',t=>t.kills>=25],['slayer100','O abismo recua','Abata cem inimigos.',t=>t.kills>=100],['event','Decisão certeira','Supere um teste de encontro.',t=>t.successes>=1],['events5','Leitores dos sinais','Supere cinco testes de encontro.',t=>t.successes>=5],['rare','Uma história para contar','Supere um encontro raro.',t=>t.rareSuccesses>=1],
 ['retreat','Saber recuar','Recue de um encontro sem arriscar.',t=>t.retreats>=1],['survive_failure','O preço da curiosidade','Sobreviva a uma falha de encontro.',t=>t.survivedFailures>=1],['healing','Fôlego recuperado','Recupere 500 PV na party.',t=>t.healing>=500],['damage','Vontade de ferro','Cause 5.000 de dano registrado.',t=>t.damage>=5000],
 ['growth','O eco aprende','Ganhe dez níveis somados na party.',t=>t.levels>=10],['loot','Bolsos cheios de histórias','Encontre vinte equipamentos.',t=>t.items>=20],['mythic','Lenda nas mãos','Encontre um equipamento mítico.',t=>t.mythics>=1],['gold','Espólios da jornada','Receba mil moedas na party.',t=>t.gold>=1000],
 ['area','Além da fronteira','Conclua uma área de cinco profundidades.',t=>t.areas>=1],['area3','Outros horizontes','Conclua três áreas.',t=>t.areas>=3],['depth25','Fundo ainda distante','Alcance a profundidade 25.',t=>t.depth>=25],['extract','Voltaram para contar','Extraia a expedição com seus ecos.',t=>t.extractions>=1],
 ['flawless','Ninguém ficou para trás','Conclua uma área sem ninguém cair.',()=>false],['dry','Último gole guardado','Conclua uma área sem usar poções.',()=>false],['wise','Nenhum passo em falso','Conclua uma área sem falhar em encontros.',()=>false]
].map(([id,name,desc,test])=>({id,name,desc,test}));
const KEYS=['combats','elites','bosses','kills','successes','failures','rareSuccesses','retreats','survivedFailures','healing','damage','levels','items','mythics','gold','areas','depth','extractions','potions','falls'];
const blank=()=>Object.fromEntries(KEYS.map(k=>[k,0]));
export function areaIndex(stage){return Math.max(0,Math.floor((Math.max(1,stage)-1)/5));}
export function plannedKind(stage){return stage%5===0?'boss':stage%4===0?'camp':'choice';}
export function ensureJourney(s){if(!s.journey)s.journey={version:1,entries:[],areas:[],awards:[],totals:blank(),base:blank(),area:areaIndex(s.stage),partial:s.stage>1};return s.journey;}
function inventory(p){return [...(p.bag||[]),...Object.values(p.equipment||{}).filter(Boolean)];}
function add(j,key,n=1){j.totals[key]=(j.totals[key]||0)+Math.max(0,n);}
function award(s,j,id){if(j.awards.some(x=>x.id===id))return;const def=FEATS.find(x=>x.id===id);j.awards.push({id,name:def.name,desc:def.desc,stage:s.stage,area:areaIndex(s.stage)});}
function node(s,j){if(s.stage<1)return null;let e=j.entries.find(e=>e.stage===s.stage);if(!e){e={stage:s.stage,area:areaIndex(s.stage),biome:BIOMES[areaIndex(s.stage)%BIOMES.length],kind:plannedKind(s.stage),status:'current',outcomes:{}};j.entries.push(e);j.entries=j.entries.slice(-80);}return e;}
export function recordJourney(before,s,actor,a,now){
 const j=ensureJourney(s);
 for(const p of s.players){const old=before.players.find(q=>q.id===p.id);if(!old)continue;add(j,'damage',(p.damage||0)-(old.damage||0));add(j,'healing',p.hp-old.hp);add(j,'levels',p.level-old.level);add(j,'gold',p.gold-old.gold);if(old.hp>0&&p.hp<=0)add(j,'falls');
  if(a.type==='encounter'||before.phase==='combat'&&s.phase==='reward'){const owned=new Set(inventory(old).map(it=>it.id));for(const it of inventory(p))if(!owned.has(it.id)){add(j,'items');if(it.rarity===5)add(j,'mythics');}}
 }
 if(a.type==='potion')add(j,'potions');
 if(before.phase==='combat'&&s.stage===before.stage){for(const old of before.enemies)if(old.hp>0&&s.enemies.some(e=>e.id===old.id&&e.hp<=0))add(j,'kills');}
 if(before.phase==='combat'&&s.phase==='reward'&&s.cleared>before.cleared){add(j,'combats');if(before.elite)add(j,'elites');if(before.enemies.some(e=>e.boss))add(j,'bosses');}
 if(a.type==='encounter'){const p=s.players.find(p=>p.id===actor),old=before.players.find(p=>p.id===actor);if(p?.encounterDone&&!old?.encounterDone){if(a.skip)add(j,'retreats');else{const success=s.event?.outcomes?.[actor]?.success??s.dice?.success;if(success){add(j,'successes');if(s.event?.special)add(j,'rareSuccesses');}else{add(j,'failures');if(p.hp>0)add(j,'survivedFailures');}}}}
 if(before.phase!=='victory'&&s.phase==='victory')add(j,'extractions');
 j.totals.depth=Math.max(j.totals.depth||0,s.stage);
 const current=node(s,j);
 if(current){if(before.phase==='combat'&&s.phase==='reward'&&before.stage===s.stage){current.kind=before.enemies.some(e=>e.boss)?'boss':before.elite?'elite':'combat';current.name=before.enemies.find(e=>e.boss)?.name;}if(s.phase==='combat'){current.kind=s.enemies.some(e=>e.boss)?'boss':s.elite?'elite':'combat';current.name=s.enemies.find(e=>e.boss)?.name;}if(s.phase==='event'){current.kind='event';current.name=s.event?.name;}if(s.phase==='camp'){current.kind='camp';current.name=s.shop?.name;current.status='completed';}if(['reward','victory'].includes(s.phase))current.status='completed';if(s.phase==='defeat')current.status='failed';
  if(a.type==='encounter'){current.kind='event';current.name=s.event?.name;current.outcomes[actor]=a.skip?'retreat':s.event?.outcomes?.[actor]?.success??s.dice?.success?'success':'failure';}
 }
 // Old saves start their report at the next observed action; never invent past victories.
 if(s.stage%5===0&&s.stage>0&&((before.phase==='combat'&&s.phase==='reward')||s.phase==='victory')&&!j.areas.some(x=>x.area===areaIndex(s.stage))){
  add(j,'areas');const metrics=Object.fromEntries(KEYS.map(k=>[k,Math.max(0,(j.totals[k]||0)-(j.base[k]||0))]));
  if(!j.partial){if(!metrics.falls)award(s,j,'flawless');if(!metrics.potions)award(s,j,'dry');if(!metrics.failures&&metrics.successes)award(s,j,'wise');}
  const area=areaIndex(s.stage);j.areas.push({id:++s.seq,area,start:area*5+1,end:s.stage,name:BIOMES[area%BIOMES.length],next:BIOMES[(area+1)%BIOMES.length],metrics,partial:!!j.partial,party:s.players.map(p=>({id:p.id,name:p.name,alive:p.hp>0,level:p.level})),at:now});j.areas=j.areas.slice(-20);j.area=area+1;j.base={...j.totals};j.partial=false;
 }
 for(const def of FEATS)if(def.test(j.totals))award(s,j,def.id);
 const latest=j.areas.at(-1);if(latest&&latest.end===s.stage)latest.awards=j.awards.filter(x=>x.area===latest.area).map(x=>x.id);
 // Coarse group statistics only; never retain a full action log in the map.
 s.route=s.route.slice(-80);cleanDecision(s);
}
