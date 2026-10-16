import {animateAttack} from './art-v3.js?v=6';
const motions=new WeakMap(),esc=s=>CSS.escape(String(s));
const colors={fogo:'#fca264',gelo:'#acdceb',eletrico:'#efde91',veneno:'#aaca80',sombrio:'#b39acb',sagrado:'#efdda6',arcano:'#aac3de',corte:'#eee1bd',contundente:'#d9b58b',perfurante:'#d7d5b8'};
export class BattleEffects{
 constructor(root){this.root=root;this.live=new Set();this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches}
 get(selector){return this.root.querySelector(selector)}
 move(el,frames,duration=320){motions.get(el)?.cancel();const a=el.animate(frames,{duration,easing:'steps(5)'});motions.set(el,a);a.finished.catch(()=>{}).finally(()=>{if(motions.get(el)===a)motions.delete(el)});return a}
 temporary(el,ms=500){if(this.live.size>=32){const oldest=this.live.values().next().value;oldest.remove();this.live.delete(oldest)}this.live.add(el);(this.get('#fx-layer')||this.root).append(el);setTimeout(()=>{el.remove();this.live.delete(el)},ms)}
 point(el){const b=el.getBoundingClientRect(),r=this.root.getBoundingClientRect();return {x:b.x-r.x+b.width/2,y:b.y-r.y+b.height*.5}}
 float(el,text,kind){if(!el||document.hidden)return;const pos=this.point(el),n=document.createElement('span');n.className='floating '+kind;n.textContent=text;n.style.cssText=`position:absolute;left:${pos.x}px;top:${pos.y}px;pointer-events:none;z-index:20`;this.temporary(n,650)}
 play(ev){if(document.hidden||this.reduced)return;
  const actor=ev.enemy?this.get(`[data-enemy="${esc(ev.actor)}"]`):ev.summon?this.get(`[data-pet="${esc(ev.actor)}"]`):this.get(`[data-actor="${esc(ev.actor)}"]`);if(!actor)return;
  const kind=ev.kind||ev.action||'attack',healing=['heal','partyheal','revive','cover','partyshield','shield','potion','defend','buff','haste','protect','rally','enrage','rage','evade','taunt'].includes(kind),summoning=['summon','brood','revive'].includes(kind),type=ev.type||'arcano';
  const target=ev.enemy?this.get(`[data-actor="${esc(ev.target)}"]`):ev.ally?this.get(`[data-actor="${esc(ev.ally)}"]`):this.get(`[data-enemy="${esc(ev.target)}"]`);const dest=healing?(ev.ally?target:actor):(target||actor),from=this.point(actor),to=this.point(dest),weapon=actor.querySelector('[data-weapon]')?.dataset.weapon;
  if(!ev.enemy&&!ev.summon)animateAttack(actor,healing||summoning?'cast':ev.action==='spell'?'spell':'attack');
  const physical=['corte','perfurante','contundente'].includes(type)&&ev.action!=='spell'&&!healing&&!summoning;
  if(physical&&!['bow','crossbow','gun','staff','book','flask','lute'].includes(weapon)){
   const dx=to.x-from.x,sign=dx<0?-1:1,moveX=sign*Math.max(0,Math.abs(dx)-42),dy=to.y-from.y;
   this.move(actor,[{transform:'translate(0,0)',offset:0},{transform:`translate(${moveX}px,${dy}px)`,offset:.4},{transform:`translate(${moveX}px,${dy}px)`,offset:.65},{transform:'translate(0,0)',offset:1}],340);
  }else this.move(actor,[{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],280);
  if(ev.enemy||ev.summon){const image=actor.querySelector('.creature-image');if(image)this.move(image,[{transform:'rotate(0deg)'},{transform:'rotate(-10deg) translateX(-3px)'},{transform:'rotate(12deg) translateX(4px)'},{transform:'rotate(0deg)'}],300);}
  if(ev.fx||ev.action==='spell'||ev.ultimate){this.signature(ev,from,to,kind,type);if(['aoe','chain','partyheal','partyshield'].includes(kind)){const allies=['partyheal','partyshield'].includes(kind),selector=ev.enemy||allies?'.hero-unit[data-actor]':'.monster[data-enemy]';let units=[...this.root.querySelectorAll(selector)].filter(x=>!x.classList.contains('fallen')&&x!==dest);if(kind==='chain')units=units.slice(0,2);for(const unit of units)this.signature(ev,from,this.point(unit),kind,type);}}
  const n=document.createElement('span');n.className='battle-effect '+(healing?'restoration':summoning?'summoning':physical?'impact':type);n.style.cssText=`left:${to.x}px;top:${to.y}px;--fx:${colors[type]||'#e8d7ae'};pointer-events:none`;n.innerHTML='<i></i><i></i><i></i><i></i>';this.temporary(n,450);
  if(!healing&&!summoning&&(!physical||['bow','crossbow','gun'].includes(weapon))){const bolt=document.createElement('span');bolt.className=physical?'arrow-projectile':'spell-projectile '+type;bolt.style.cssText=`left:${from.x}px;top:${from.y}px;--fx:${colors[type]||'#c3c7dd'}`;this.temporary(bolt,220);bolt.animate([{transform:'translate(0,0)',opacity:.5},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px)`,opacity:1}],{duration:200,easing:'linear'});}
 }
 signature(ev,from,to,kind,type){
  let hash=2166136261;for(const c of String(ev.fx||kind))hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  const mode=ev.ultimate?'cataclysm':['heal','partyheal','revive'].includes(kind)?'petals':kind==='summon'?'gate':['cover','partyshield','shield'].includes(kind)?'shield':kind==='freeze'?'prison':kind==='chain'?'lightning':kind==='multi'?'cuts':kind==='stagger'?'quake':kind==='poison'?'bubbles':kind==='curse'?'sigil':kind==='drain'?'drain':kind==='burn'?'embers':ev.action==='spell'?'vortex':'cuts';
  const n=document.createElement('span');n.className='signature-fx '+mode;n.style.cssText=`left:${to.x}px;top:${to.y}px;--fx:${colors[type]||'#d4c6e4'};--turn:${hash%180}deg;--radius:${32+hash%24}px`;
  const count=mode==='cuts'?3+hash%3:mode==='lightning'?5:8;
  for(let i=0;i<count;i++){const x=document.createElement('i');x.style.cssText=`--i:${i};--angle:${i*360/count}deg;--wait:${i*22}ms`;n.append(x)}this.temporary(n,650);
 }
 clear(){for(const el of this.live)el.remove();this.live.clear()}
}
