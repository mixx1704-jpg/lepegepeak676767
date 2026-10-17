import {animateAttack} from './art-v3.js?v=9';
const esc=s=>CSS.escape(String(s));
const colors={fogo:'#fca264',gelo:'#acdceb',eletrico:'#efde91',veneno:'#aaca80',sombrio:'#b39acb',sagrado:'#efdda6',arcano:'#aac3de',corte:'#eee1bd',contundente:'#d9b58b',perfurante:'#d7d5b8'};
// Every mechanic has its own silhouette and timing. These are visual events only.
export const ATTACK_PROFILES={
 attack:['slash','lunge'],hit:['slash','lunge'],heavy:['crater','slam'],aoe:['shockwave','slam'],heal:['bloom','cast'],partyheal:['rain','cast'],revive:['ascend','cast'],protect:['rampart','brace'],cover:['rampart','brace'],shield:['rampart','brace'],partyshield:['bastion','brace'],mana:['siphon','cast'],brood:['hatch','cast'],summon:['gate','cast'],silence:['seal','cast'],root:['roots','cast'],freeze:['ice','cast'],chill:['frost','cast'],enrage:['fury','brace'],rage:['fury','brace'],buff:['banner','cast'],haste:['clock','cast'],evade:['afterimage','evade'],dodge:['afterimage','evade'],defend:['rampart','brace'],taunt:['challenge','brace'],mark:['crosshair','aim'],burn:['flame','cast'],poison:['spores','cast'],hunt:['fangs','pounce'],execute:['guillotine','lunge'],multi:['flurry','lunge'],pierce:['lance','lunge'],stagger:['fracture','slam'],chain:['thunder','cast'],curse:['sigil','cast'],drain:['siphon','cast'],potion:['bloom','cast'],rally:['banner','cast'],
 hex:['hexagon','cast'],rupture:['fissure','slam'],brand:['brand','cast'],harvest:['reap','lunge'],volley:['arrows','aim'],wardbreak:['shatter','slam'],ambush:['ambush','pounce'],detonate:['explosion','brace'],ritual:['ritual','cast'],infect:['parasites','cast'],overload:['overload','cast'],exchange:['exchange','cast'],counter:['riposte','lunge'],reflect:['mirror','brace'],explode:['deathburst','brace']
};
export const INCANTATION_PROFILES={funeral:['flame','sigil'],combust:['spores','explosion'],shatter:['ice','fracture'],frostbind:['ice','roots'],conductor:['thunder','crosshair'],ashstorm:['flame','rain'],cleanse:['bloom','parasites'],respite:['rain','clock'],thorns:['rampart','riposte'],veil:['bastion','afterimage'],silence:['sigil','seal'],bloodshare:['siphon','bloom'],manasteal:['siphon','vortex'],partyhaste:['rain','afterimage'],timelock:['clock','ice'],unward:['lance','shatter'],expose:['crosshair','sigil'],guardian:['gate','bloom'],archer:['gate','arrows'],knight:['gate','bastion'],returnshield:['ascend','rampart'],poisonslow:['spores','frost'],quake:['shockwave','fracture'],lastlight:['lance','bloom'],bloodpact:['sigil','siphon'],healshield:['bloom','bastion'],twin:['thunder','overload'],winter:['shockwave','ice'],corrode:['spores','shatter'],voidchorus:['vortex','seal'],harvest:['reap','siphon'],advance:['rampart','clock']};
const restorative=new Set(['heal','partyheal','revive','cover','partyshield','shield','potion','defend','buff','haste','protect','rally','enrage','rage','evade','dodge','taunt','summon','brood','ritual']);
function fingerprint(s){let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n}
export class BattleEffects{
 constructor(root){this.root=root;this.live=new Map();this.motions=new Map();this.pending=new Map();this.actorSlots=new Map();this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.onHidden=()=>{if(document.hidden)this.clear()};document.addEventListener('visibilitychange',this.onHidden)}
 get(selector){return this.root.querySelector(selector)}
 unit(selector){return this.get('#actors')?.querySelector(selector)||this.get(selector)}
 move(el,frames,duration=420){if(!el)return;this.motions.get(el)?.cancel();const a=el.animate(frames,{duration,easing:'steps(7)',fill:'none'});this.motions.set(el,a);a.finished.catch(()=>{}).finally(()=>{if(this.motions.get(el)===a)this.motions.delete(el)});return a}
 remove(el){const timer=this.live.get(el);if(timer!==undefined)clearTimeout(timer);this.live.delete(el);el.remove()}
 temporary(el,ms=900){while(this.live.size>=24)this.remove(this.live.keys().next().value);(this.get('#fx-layer')||this.root).append(el);this.live.set(el,setTimeout(()=>this.remove(el),ms))}
 point(el){const b=el.getBoundingClientRect(),r=this.root.getBoundingClientRect();return {x:b.x-r.x+b.width/2,y:b.y-r.y+b.height*.5}}
 float(el,text,kind){if(!el||document.hidden)return;const pos=this.point(el),n=document.createElement('span');n.className='floating '+kind;n.textContent=text;n.style.cssText=`position:absolute;left:${pos.x}px;top:${pos.y}px;pointer-events:none;z-index:20`;this.temporary(n,650)}
 enqueue(ev){
  if(document.hidden||this.reduced.matches||!ev)return;
  const now=performance.now();for(const [key,until] of this.actorSlots)if(until<=now)this.actorSlots.delete(key);
  const key=(ev.enemy?'enemy:':ev.summon?'pet:':'hero:')+String(ev.actor),at=Math.max(now,this.actorSlots.get(key)||now);
  // Replay bounded bursts without delaying any game action or network request.
  if(at-now>2000||this.pending.size>=48)return;
  this.actorSlots.set(key,at+170);
  const receipt={event:ev,expires:now+2000};
  const timer=setTimeout(()=>{this.pending.delete(timer);if(!document.hidden&&!this.reduced.matches&&performance.now()<=receipt.expires)this.play(receipt.event)},Math.max(0,at-now));
  this.pending.set(timer,receipt);
 }
 play(ev){if(document.hidden||this.reduced.matches)return;
  const actor=ev.enemy?this.unit(`[data-enemy="${esc(ev.actor)}"]`):ev.summon?this.unit(`[data-pet="${esc(ev.actor)}"]`):this.unit(`[data-actor="${esc(ev.actor)}"]`);if(!actor)return;
  const kind=ev.kind||ev.action||'attack',profile=ATTACK_PROFILES[kind]||['vortex','cast'],type=ev.type||'arcano',healing=restorative.has(kind);
  const target=ev.enemy?this.unit(`[data-actor="${esc(ev.target)}"]`):ev.ally?this.unit(`[data-actor="${esc(ev.ally)}"]`):this.unit(`[data-enemy="${esc(ev.target)}"]`);
  const dest=healing?(ev.ally?target||actor:actor):target||actor,from=this.point(actor),to=this.point(dest),weapon=actor.querySelector('[data-weapon]')?.dataset.weapon;
  const physical=['corte','perfurante','contundente'].includes(type)&&ev.action!=='spell'&&!healing;
  const ranged=['bow','crossbow','gun','staff','book','flask','lute'].includes(weapon);
  let motion=profile[1];if(ev.action==='spell'||(!physical&&motion==='lunge'))motion='cast';if(ranged&&motion==='lunge')motion='aim';
  if(!ev.enemy&&!ev.summon&&!['dodge','evade'].includes(kind))animateAttack(actor,healing?'cast':ev.action==='spell'?'spell':motion==='aim'?'shoot':'attack');
  const dx=to.x-from.x,dy=to.y-from.y,sign=dx<0?-1:1,x=sign*Math.max(0,Math.abs(dx)-40),y=dy;
  if(motion==='lunge'||motion==='pounce')this.move(actor,[{transform:'translate(0,0)',offset:0},{transform:`translate(${-sign*8}px,3px)`,offset:.15},{transform:`translate(${x}px,${y-(motion==='pounce'?17:0)}px)`,offset:.42},{transform:`translate(${x+sign*7}px,${y}px)`,offset:.57},{transform:'translate(0,0)',offset:1}],motion==='pounce'?500:440);
  else if(motion==='slam')this.move(actor,[{transform:'translateY(0)',offset:0},{transform:'translateY(-20px) rotate(-5deg)',offset:.3},{transform:'translateY(5px) rotate(3deg)',offset:.55},{transform:'translateY(0)',offset:1}],500);
  else if(motion==='evade')this.move(actor,[{transform:'translateX(0)',opacity:1},{transform:`translateX(${-sign*26}px)`,opacity:.35},{transform:'translateX(0)',opacity:1}],450);
  else if(motion==='aim')this.move(actor,[{transform:'translateX(0)'},{transform:`translateX(${-sign*8}px) rotate(${-sign*3}deg)`},{transform:'translateX(0)'}],390);
  else this.move(actor,[{transform:'translateY(0) scale(1)'},{transform:`translateY(${motion==='brace'?3:-6}px) scale(${motion==='brace'?1.04:1})`},{transform:'translateY(0) scale(1)'}],ev.ultimate?650:400);
  const sprite=actor.querySelector('.creature-image');if(sprite)this.move(sprite,[{transform:'rotate(0deg)'},{transform:`rotate(${sign*(motion==='cast'?4:12)}deg) scaleY(.94)`},{transform:`rotate(${-sign*6}deg)`},{transform:'rotate(0deg)'}],450);
  if(ev.ultimate)this.signature(ev,from,from,'ultimate-charge',type,'charge');
  const incantation=ev.action==='spell'&&INCANTATION_PROFILES[ev.mechanic];this.signature(ev,from,to,kind,type,incantation?.[0]||profile[0]);if(incantation)this.signature({...ev,fx:String(ev.fx)+':echo'},from,to,kind,type,incantation[1]);
  if(!healing&&(motion==='cast'||motion==='aim'))this.projectile(from,to,type,profile[0],fingerprint(ev.species||ev.fx||kind));
  const group=['aoe','chain','volley','detonate','partyheal','partyshield','overload'].includes(kind);
  if(Array.isArray(ev.targets)&&ev.targets.length){const seen=new Set([dest]);for(const entry of ev.targets.slice(0,12)){const id=typeof entry==='object'?entry?.id:entry;if(id==null)continue;const unit=this.unit(`[data-actor="${esc(id)}"],[data-enemy="${esc(id)}"],[data-pet="${esc(id)}"]`);if(unit&&!seen.has(unit)){seen.add(unit);this.signature(ev,from,this.point(unit),kind,type,profile[0]);}}}
  else if(group){const allies=['partyheal','partyshield'].includes(kind),selector=ev.enemy?(allies?'.monster[data-enemy]':'.hero-unit[data-actor]'):(allies?'.hero-unit[data-actor]':'.monster[data-enemy]');const units=[...(this.get('#actors')||this.root).querySelectorAll(selector)].filter(n=>n!==dest&&!n.classList.contains('fallen')).slice(0,kind==='chain'?2:7);for(const unit of units)this.signature(ev,from,this.point(unit),kind,type,profile[0]);}
 }
 projectile(from,to,type,mode,seed){const n=document.createElement('span');n.className='infernal-bolt bolt-'+mode;n.style.cssText=`left:${from.x}px;top:${from.y}px;--fx:${colors[type]||colors.arcano}`;const dx=to.x-from.x,dy=to.y-from.y,angle=Math.atan2(dy,dx)*180/Math.PI;n.style.setProperty('--bearing',angle+'deg');this.temporary(n,480);n.animate([{transform:`translate(0,0) rotate(${angle}deg)`,opacity:0},{transform:`translate(${dx*.35}px,${dy*.35-(seed%13)}px) rotate(${angle}deg)`,opacity:1,offset:.35},{transform:`translate(${dx}px,${dy}px) rotate(${angle}deg)`,opacity:0}],{duration:360,easing:'steps(9)',fill:'both'});}
 signature(ev,from,to,kind,type,mode){const hash=fingerprint((ev.species||'')+(ev.fx||kind)),n=document.createElement('span');n.className='infernal-fx fx-'+(mode||ATTACK_PROFILES[kind]?.[0]||'vortex')+(ev.ultimate?' is-ultimate':'');n.dataset.kind=kind;n.style.cssText=`left:${to.x}px;top:${to.y}px;--fx:${colors[type]||colors.arcano};--turn:${hash%180}deg;--variant:${hash%3};--reach:${36+hash%18}px;--delay:${ev.ultimate&&mode!=='charge'?180:100}ms`;for(let i=0;i<6;i++){const p=document.createElement('i');p.style.cssText=`--i:${i};--angle:${i*60+hash%30}deg;--lag:${i*35}ms`;n.append(p)}this.temporary(n,1100);}
 clear(){for(const timer of this.pending.keys())clearTimeout(timer);this.pending.clear();this.actorSlots.clear();for(const el of [...this.live.keys()])this.remove(el);for(const a of this.motions.values())a.cancel();this.motions.clear()}
 destroy(){this.clear();document.removeEventListener('visibilitychange',this.onHidden)}
}
