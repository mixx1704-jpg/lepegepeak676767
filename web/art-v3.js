import {encounterPixels} from './tung-art.js';
import {weaponPixels,raceHand,heroPixels,creaturePixels} from './pixel-sprites.js';
import {CLASSES} from './game/data.js';
import {itemIcon as oldIcon} from './pixel-art.js';


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
function weapon(p){const kind=weaponKind(p);return `<span class="weapon-arm" data-weapon="${kind}"><img class="held-weapon" src="${weaponPixels(p.ultra==='TUNG'?'tungbat':kind,p.equipment?.weapon?.rarity||0)}" alt="" draggable="false"></span>`;}

export function heroSprite(p={}){const c=p.classId||p.class||'guerreiro',race=p.raceId||'humano';return `<span class="pixel-sprite hero-sprite actor-sprite" data-class="${clean(c)}" data-race="${clean(race)}" style="--hand:${p.ultra==='TUNG'?'#c49155':raceHand(race)}" data-weapon="${weaponKind(p)}" aria-hidden="true"><span class="actor-shadow"></span><span class="actor-body">${['idle','step','strike','cast'].map(pose=>`<img class="sprite-frame frame-${pose}" src="${heroPixels(p.ultra==='TUNG'?'tung':c,race,pose)}" alt="" draggable="false">`).join('')}${weapon(p)}</span><span class="weapon-trail"></span></span>`;}
export function monsterSprite(e={}){const kinds=['skeleton','witch','spider','priest','ghoul','witch','knight','executioner','leech','brood','mimic','shaman','imp','wolf','knight','lich','oracle','treant','duelist','tyrant','imp','brood','archer','priest'];const kind=e.art||(e.boss?(e.type==='veneno'?'guardian':e.type==='sombrio'?'wraithking':'dragon'):kinds[e.species]||'skeleton');return `<span class="pixel-sprite monster-sprite creature-sprite" data-weapon="${kind==='archer'?'bow':kind==='turret'?'gun':''}" data-idle="${['bat','eye','wraithking'].includes(kind)?'float':kind==='slime'?'pulse':'breath'}" aria-hidden="true"><span class="actor-shadow"></span><img class="creature-image" src="${creaturePixels(kind,e.species??(['veneno','fogo','sombrio'].indexOf(e.type)+1)*3,!!e.boss,e.type)}" alt="" draggable="false"></span>`;}

export function summonSprite(pet={}){return `<span class="pixel-sprite summon-sprite creature-sprite" data-weapon="${pet.kind==='archer'?'bow':pet.kind==='turret'?'gun':''}" data-idle="${pet.kind==='spirit'?'float':'breath'}" aria-hidden="true"><span class="actor-shadow"></span><img class="creature-image" src="${creaturePixels(pet.kind||'skeleton',0)}" alt="" draggable="false"></span>`;}
export function itemIcon(slot,rarity,name){if(slot==='weapon')return `<img class="item-icon" src="${weaponPixels(weaponKind({equipment:{weapon:{name}},classId:'guerreiro'}),rarity||0)}" alt="" draggable="false">`;return oldIcon(slot,Math.min(4,rarity||0),name);}

export function battleScene(canvas,stage=1){if(!canvas)return;canvas.width=320;canvas.height=180;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const box=c.fillRect.bind(c);c.fillRect=(x,y,w,h)=>box(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));let seed=19+Math.floor(stage/5);const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const crypt=Math.floor((stage-1)/5)%4===1,base=crypt?'#686c65':'#78834c',shade=crypt?'#525d57':'#63713e',light=crypt?'#82877b':'#8c945b';c.fillStyle=base;c.fillRect(0,0,320,180);for(let i=0;i<1600;i++){c.fillStyle=rnd()<.5?shade:light;c.fillRect(Math.floor(rnd()*160)*2,Math.floor(rnd()*90)*2,2+rnd()*2,1);}c.fillStyle=crypt?'#394d4a':'#3d5941';c.fillRect(0,0,320,37);for(let x=0;x<320;x+=18){c.fillStyle='#354740';c.fillRect(x,0,17,32);c.fillStyle='#75816a';c.fillRect(x,27,16,5);c.fillStyle='#a5a17a';c.fillRect(x,27,14,1);c.fillStyle='#53634e';c.fillRect(x+2,3,2,22);}for(let i=0;i<13;i++){const x=i*27-10,y=i%2?5:-7;c.fillStyle='#263e39';c.fillRect(x+9,y+8,7,44);c.fillStyle='#796b49';c.fillRect(x+11,y+16,4,36);for(let j=0;j<4;j++){c.fillStyle=['#304f3c','#3d6544','#52794a','#65884c'][j];c.fillRect(x+5+j,y+j*3,18-j*2,13);c.fillRect(x+1+j,y+4+j*3,26-j*2,6);c.fillRect(x+8+j,y-2+j*3,12-j,4);}c.fillStyle='#92a05b';c.fillRect(x+8,y+12,4,2);c.fillRect(x+16,y+7,5,1);c.fillStyle='#3d5f3d';c.fillRect(x+4,y+20,6,3);}c.fillStyle='#8d8c63';for(let i=0;i<9;i++){const x=48+i*28;c.fillRect(x,151+(i%2)*5,21,6);c.fillStyle='#656e50';c.fillRect(x,156+(i%2)*5,21,2);c.fillStyle='#8d8c63';}for(let i=0;i<13;i++){const x=Math.floor(rnd()*300)+10,y=50+Math.floor(rnd()*90);c.fillStyle='#4d5b4b';c.fillRect(x-2,y+5,14,3);c.fillStyle='#7c8371';c.fillRect(x,y,10,6);c.fillStyle='#a3a58a';c.fillRect(x+2,y-2,6,3);c.fillStyle='#5f6b59';c.fillRect(x+8,y+1,2,5);}for(let i=0;i<70;i++){const x=rnd()*320,y=42+rnd()*110;c.fillStyle='#3f6843';c.fillRect(x,y,1,3);if(i%3===0){c.fillStyle='#c6ba72';c.fillRect(x-1,y-1,3,1);}}}
const poseJobs=new WeakMap();
export function animateAttack(element,kind='attack'){if(!element||document.hidden)return;const sprite=element.matches?.('.actor-sprite')?element:element.querySelector('.actor-sprite');if(!sprite)return;const prev=poseJobs.get(sprite);if(prev){cancelAnimationFrame(prev.frame);clearTimeout(prev.timer)}sprite.classList.remove('attack-pose','cast-pose','shoot-pose');const pose=/heal|cura|spell|mag|summon|cast/.test(kind)?'cast-pose':['bow','crossbow','gun'].includes(sprite.dataset.weapon)?'shoot-pose':'attack-pose',job={frame:0,timer:0};poseJobs.set(sprite,job);job.frame=requestAnimationFrame(()=>{if(!sprite.isConnected)return;sprite.classList.add(pose);job.timer=setTimeout(()=>{sprite.classList.remove(pose);poseJobs.delete(sprite)},420)});}


export const eventSprite=kind=>`<img class="encounter-art" src="${encounterPixels(kind)}" alt="" draggable="false">`;
