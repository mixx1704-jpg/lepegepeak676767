// Pure cursor: skip initial history, recover missed revisions, never replay a duplicate.
export class FXCursor{
 constructor(){this.room=null;this.last=0;this.own=new Set()}
 markOwn(id){this.own.add(id);if(this.own.size>128)this.own.delete(this.own.values().next().value)}
 seed(room){this.room=room?.id||null;this.last=room?.state?.fxSeq||0}
 accept(room,self){const history=room.state.fxHistory||[];if(this.room!==room.id){this.seed(room);return []}const unseen=history.filter(e=>e.seq>this.last);this.last=Math.max(this.last,room.state.fxSeq||0);return unseen.filter(e=>!(e.actor===self&&this.own.has(e.actionId)));}
}
function key(el){return el.nodeType===1?(el.getAttribute('data-unit')||el.getAttribute('data-sprite-slot')||el.getAttribute('data-group')||''):''}
function morph(old,next){
 if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){const copy=next.cloneNode(true);old.replaceWith(copy);return copy}
 if(old.nodeType===3){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return old}
 if(old.nodeType!==1)return old;
 if(old.hasAttribute('data-sprite-slot')&&old.dataset.skin===next.dataset.skin&&old.dataset.ready)return old;
 for(const a of [...old.attributes])if(!next.hasAttribute(a.name))old.removeAttribute(a.name);
 for(const a of [...next.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
 const current=[...old.childNodes],used=new Set();const keyed=new Map(current.filter(x=>key(x)).map(x=>[key(x),x]));
 for(const [i,wanted] of [...next.childNodes].entries()){
  const k=key(wanted);let found=k?keyed.get(k):current.find((x,j)=>j===i&&!used.has(x)&&!key(x)&&x.nodeName===wanted.nodeName);
  if(!found){found=wanted.cloneNode(true);old.insertBefore(found,old.childNodes[i]||null)}else{if(old.childNodes[i]!==found)old.insertBefore(found,old.childNodes[i]||null);found=morph(found,wanted)}used.add(found);
 }
 for(const child of [...old.childNodes])if(!used.has(child))child.remove();return old;
}
export function patchArena(root,html,hydrate){const template=document.createElement('template');template.innerHTML=html;const container=root.cloneNode(false);container.append(template.content);morph(root,container);for(const slot of root.querySelectorAll('[data-sprite-slot]:not([data-ready])')){slot.innerHTML=hydrate(slot.dataset.spriteSlot)||'';slot.dataset.ready='1';}}
