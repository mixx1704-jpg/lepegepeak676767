import {CLASSES} from './game/data.js';
import {itemIcon as oldIcon,scene as fallbackScene} from './pixel-art.js';

const asset = name => new URL(`./assets/${name}`,import.meta.url).href;
const clean = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = text => String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function weaponKind(p={}) {
 const name=plain(p.equipment?.weapon?.name||p.weapon?.name||'');
 if(plain(p.ultra).includes('tung'))return 'club';
 if(/foice/.test(name))return 'scythe';
 if(/grimorio/.test(name))return 'book';
 if(/besta/.test(name))return 'crossbow';
 if(/arco|bow|balista/.test(name))return 'bow';
 if(/pistola|rifle|mosquete|canhao/.test(name))return 'gun';
 if(/cajado|baculo|staff|varinha|cetro|grimorio/.test(name))return 'staff';
 if(/machado|axe/.test(name))return 'axe';
 if(/martelo|bastao|clava|porrete/.test(name))return 'club';
 if(/adaga|punhal/.test(name))return 'dagger';
 if(/lanca|tridente|foice/.test(name))return 'spear';
 if(/manoplas/.test(name))return 'fist';
 if(/lira/.test(name))return 'lute';
 if(/espada|lamina|sabre/.test(name))return 'sword';
 return ({patrulheiro:'bow',arqueiro:'bow',ladino:'dagger',barbaro:'axe',monge:'fist',artifice:'gun',mago:'staff',necromante:'staff',clerigo:'staff',druida:'staff',bruxo:'staff',xama:'staff',alquimista:'flask',bardo:'lute'})[p.classId||p.class]||'sword';
}
// Equipment is a separate rigid pixel layer, pivoting at the character's hand.
const weapons={
 scythe:'M12 8h4v32h-4z M12 6h13v4h6v14h-4V14h-7v-3h-8z',
 book:'M3 9h12l2 3 2-3h11v26H19l-2 3-2-3H3z',
 crossbow:'M14 6h4v34h-4z M2 10h28v4H2z M2 5h3v16H2z M27 5h3v16h-3z',
 sword:'M12 2h4v26h-4z M8 26h12v3H8z M12 29h4v9h-4z',
 dagger:'M12 13h4v14h-4z M9 27h10v3H9z M12 30h4v8h-4z',
 spear:'M13 1h2v4h3v8h-3v27h-2V13h-3V5h3z',
 axe:'M13 7h4v33h-4z M5 4h7v3h9V4h6v17h-6v-3H12v3H5z',
 club:'M11 18h6v22h-6z M7 2h14v21H7z',
 staff:'M12 12h4v28h-4z M7 3h14v11H7z M10 0h8v3h-8z',
 bow:'M9 1h5v3h4v4h4v5h3v15h-3v5h-4v4h-4v3H9v-4h4v-5h4V10h-4V5H9z M8 2h1v37H8z',
 gun:'M2 13h25v8H12v13H5V21H2z M24 15h8v4h-8z',
 fist:'M7 18h15v13H7z M9 14h3v8H9z M14 13h3v9h-3z M19 15h3v7h-3z',
 flask:'M10 10h10v5h-2v5h5v14H7V20h5v-5h-2z',
 lute:'M12 3h5v17h5v15H7V20h5z'
};
function weapon(p){const kind=weaponKind(p),color=['club','bow','staff','lute'].includes(kind)?'#b8864e':kind==='flask'?'#6bccb0':'#dce5da';return `<span class="weapon-arm" data-weapon="${kind}"><svg class="held-weapon" viewBox="0 0 32 42" shape-rendering="crispEdges" aria-hidden="true"><path d="${weapons[kind]}" fill="${color}" stroke="#27252d" stroke-width="2"/><path d="M13 5h2v16h-2z" fill="${kind==='staff'?'#b7eefd':'#f2d895'}"/><path d="M11 29h7v6h-7z" fill="#d9a679" stroke="#453a37"/></svg></span>`;}
function frame(index,cols,src,extra=''){return `<span class="atlas-cell ${extra}" style="--atlas-cols:${cols};--atlas-rows:3;--atlas-x:${index%cols};--atlas-y:${Math.floor(index/cols)};background-image:url('${asset(src)}')"></span>`;}
export function heroSprite(p={}){const index=Math.max(0,CLASSES.findIndex(c=>c.id===(p.classId||p.class||'guerreiro')));return `<span class="pixel-sprite hero-sprite actor-sprite" data-class="${clean(p.classId||p.class)}" data-weapon="${weaponKind(p)}" aria-hidden="true"><span class="actor-shadow"></span><span class="actor-body">${frame(index,5,'heroes-atlas.png','hero-cell')}${weapon(p)}</span><span class="weapon-trail"></span></span>`;}
export function monsterSprite(e={}){const name=plain(e.name),type=e.type||e.damageType,role=e.role||e.kind;let i=0;if(e.boss)i=type==='veneno'?10:type==='fogo'?9:11;else if(/aranha|spider/.test(name)||role==='assassin')i=4;else if(/javali|ogro|troll|fera/.test(name)||type==='contundente')i=5;else if(/arqueiro|atirador/.test(name))i=1;else if(/cavaleiro|knight/.test(name))i=2;else if(type==='gelo')i=6;else if(role==='healer'||type==='veneno')i=7;else if(type==='fogo')i=8;else if(role==='caster')i=11;return `<span class="pixel-sprite monster-sprite creature-sprite" aria-hidden="true"><span class="actor-shadow"></span>${frame(i,4,'creatures-atlas.png')}</span>`;}
export function summonSprite(pet={}){const name=plain(pet.name||pet.id||pet.kind),i=/arq|archer/.test(name)?1:/cavaleiro|knight|guard/.test(name)?2:/lobo|wolf|espirito|spirit/.test(name)?3:/demon|infernal|impio/.test(name)?8:/ent|totem|homunculo/.test(name)?7:/automato|torreta/.test(name)?2:/lich/.test(name)?11:0;return `<span class="pixel-sprite summon-sprite creature-sprite" aria-hidden="true"><span class="actor-shadow"></span>${frame(i,4,'creatures-atlas.png')}</span>`;}
export function itemIcon(slot,rarity,name){if(slot==='weapon'){const kind=weaponKind({equipment:{weapon:{name}},classId:'guerreiro'});return `<svg class="item-icon" viewBox="0 0 32 42" shape-rendering="crispEdges" aria-hidden="true"><path d="${weapons[kind]}" fill="${['#b5bdb3','#8ebbd1','#dfc582','#bea3d9','#dfa46c','#ec8da0'][rarity||0]}" stroke="#283431" stroke-width="2"/></svg>`;}return oldIcon(slot,Math.min(4,rarity||0),name);}

let background;
export function battleScene(canvas,stage=1){if(!canvas)return;const draw=()=>{if(!canvas.isConnected)return;canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(background,0,0,1280,720);if(Number(stage)>25){ctx.fillStyle=Number(stage)%3===0?'#3c12332b':'#10182718';ctx.fillRect(0,0,1280,720);}};if(background?.complete&&background.naturalWidth){draw();return;}fallbackScene(canvas);if(!background){background=new Image();background.src=asset('temple-battlefield.png');}background.addEventListener('load',draw,{once:true});}
export function animateAttack(element,kind='attack'){if(!element)return;const sprite=element.matches?.('.actor-sprite')?element:element.querySelector('.actor-sprite');if(!sprite)return;sprite.classList.remove('attack-pose','cast-pose','shoot-pose');const pose=/heal|cura|spell|mag|summon|cast/.test(kind)?'cast-pose':['bow','crossbow','gun'].includes(sprite.dataset.weapon)?'shoot-pose':'attack-pose';void sprite.offsetWidth;sprite.classList.add(pose);setTimeout(()=>sprite.classList.remove(pose),760);}
