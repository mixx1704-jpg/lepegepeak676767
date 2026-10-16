import {CLASSES} from './game/data.js';
import {RACES} from './game/content.js';
const hero=['000000001111110000000000','000000012222221000000000','000000122222222100000000','000000124444421100000000','000000124545421000000000','000000014444410000000000','000000001444100000000000','000000011333110000000000','000000133363331000000000','000001433333334100000000','000014133333314410000000','000014133663310410000000','000001013333310010000000','000000013333310000000000','000000133333331000000000','000000133333331000000000','000000111111111000000000','000000012001210000000000','000000012001210000000000','000000012001210000000000','000000122001221000000000','000000111001111000000000'];
const skeleton=['000000001111110000000000','000000014444441000000000','000000144144144100000000','000000145145145100000000','000000144444444100000000','000000014144141000000000','000000001444410000000000','000000011133111000000000','000001443333334410000000','000014414444414410000000','000014014141410141000000','000014014444410014100000','000014014141410014100000','000001014444410001000000','000000011111110000000000','000000014004410000000000','000000014004100000000000','000000144001410000000000','000001440000141000000000','000001110000111000000000'];
const spider=['000000000000000000000000','000010000000000000100000','000014000111100004100000','000001401444410041000000','000000141455414100000000','000001114444441110000000','000014144144144141000000','000140144444441014000000','001400014444410004100000','014000141111141000410000','010001400000041000010000','000014000000004100000000','000140000000000410000000','000100000000000010000000'];
const demon=['000100000000000000010000','000140000000000000410000','000144001111110004410000','000014414444441044100000','000001444444444441000000','000001441444414441000000','000001455144155441000000','000001444144144441000000','000000144444444410000000','000000014511541000000000','000000011444110000000000','000001133663331100000000','000014333333333410000000','000144333663333441000000','001444333663333444100000','014414333333331444410000','014401333663331044410000','001101333663331011100000','000001333333331000000000','000001333333331000000000','000001133333311000000000','000000114444110000000000','000000014004410000000000','000000144001441000000000','000001444001444100000000','000001111001111100000000'];
const colors=['#57a5fb','#ffe478','#ee846b','#b979d9','#7cce91','#72b6ed','#ac8bdf','#f3eea0','#55ba86','#e788c4','#f2a65e','#a574cf','#63d8bb','#7ad8e3','#b2b8d1'];
function baseSprite(kind='hero',key='guerreiro',raceId='humano',type='sombrio',boss=false){
 const ci=Math.max(0,CLASSES.findIndex(c=>c.id===key)),rc=RACES.find(r=>r.id===raceId)?.color||'#71c8a8';
 const tint=kind==='hero'?colors[ci]:({fogo:'#ed805d',gelo:'#8ad9ee',veneno:'#6ae4a0',sombrio:'#b689db',eletrico:'#e9df82',corte:'#aadcb9',contundente:'#b6a087'})[type]||'#75dcaa';
 let rows=(kind==='hero'?hero:boss?demon:key==='assassin'?spider:key==='caster'||key==='healer'?hero:skeleton).map(r=>r.split(''));
 if(kind==='hero'){
  if([5,6,7,11,13].includes(ci))rows.unshift(...['000000000003000000000000','000000000033300000000000','000000000333330000000000','000000003333333000000000'].map(r=>r.split('')));
  if([0,1,2,10].includes(ci)){for(let y=3;y<15;y++)if(rows[y])rows[y][19]='7';for(let x=17;x<22;x++)rows[12][x]='7';}
  else if([5,6,7,8,11,13].includes(ci)){for(let y=5;y<rows.length-2;y++)rows[y][19]='7';rows[4][19]='6';rows[5][18]='6';rows[5][20]='6';}
  else if([3,4,14].includes(ci)){for(let y=9;y<16;y++)rows[y][18]='7';}
  if(['orc','infernal','draconico'].includes(raceId)){rows[2][6]='6';rows[1][5]='6';rows[2][15]='6';rows[1][16]='6';}
 }
 const skin=({humano:'#e0b184',anao:'#c99872',elfo:'#e6c49a',orc:'#a3b879',umbriano:'#b9a4ba',infernal:'#bd7864',revenante:'#a9b6a0',forjado:'#a9bab7',astral:'#a4c9cf',draconico:'#b7a274'})[raceId]||'#dab28c';
 const palette={'1':'#17272b','2':colors[(ci+2)%colors.length],'3':tint,'4':kind==='hero'?skin:'#8fe4bd','5':'#fffbe5','6':kind==='hero'?'#f3dc78':tint,'7':'#c5e5ec'};
 const rects=[];for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const color=palette[rows[y][x]];if(color)rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);}
 return `<svg class="pixel-sprite ${kind==='hero'?'hero-sprite':'monster-sprite'}" viewBox="0 0 24 ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`;
}

const cache=new Map();
const enemyPal={fogo:['#b44735','#f2ac53'],gelo:['#5798a7','#caeee5'],veneno:['#628f45','#d4e48e'],sombrio:['#665878','#bb8ca2'],corte:['#788b88','#d7d8b3'],contundente:['#a27957','#dfba85']};
function monster(key,type,boss){
 const [dark,light]=enemyPal[type]||enemyPal.sombrio;
 let parts='';const r=(x,y,w,h,c)=>parts+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const outline='#182321',bone='#d5cba3';
 // Each enemy has a distinct silhouette, equipment and material, not a palette swap.
 if(key==='assassin'){
  for(let i=0;i<4;i++){r(2+i*2,15+i*3,9,2,outline);r(1+i*2,17+i*3,2,7,light);r(22-i*2,15+i*3,9,2,outline);r(29-i*2,17+i*3,2,7,light);}
  r(10,8,12,16,outline);r(9,12,14,9,dark);r(12,10,8,7,light);r(11,18,10,6,dark);r(12,19,2,2,'#ffdd85');r(18,19,2,2,'#ffdd85');r(13,24,2,3,bone);r(18,24,2,3,bone);
 }else if(key==='fighter'&&type==='contundente'){
  r(9,4,13,10,outline);r(10,5,11,8,dark);r(7,13,19,13,outline);r(5,15,21,8,dark);r(8,15,14,5,light);r(4,19,5,9,dark);r(25,17,5,10,dark);r(9,26,5,5,bone);r(20,25,5,6,bone);r(12,8,3,2,'#ffe481');r(19,8,3,2,'#ffe481');r(16,11,7,2,outline);
 }else if(key==='fighter'){
  r(11,4,10,9,outline);r(12,5,8,7,bone);r(12,8,2,2,outline);r(17,8,2,2,outline);r(10,13,13,11,outline);r(11,14,10,7,dark);r(14,13,3,11,light);r(9,24,4,7,bone);r(20,24,4,7,bone);r(5,14,5,10,dark);r(4,15,5,8,light);r(27,2,2,27,'#986e42');r(26,1,4,6,'#d5e0ce');r(22,16,5,3,bone);
 }else if(key==='healer'){
  r(10,3,12,12,outline);r(12,5,8,9,light);r(13,8,6,4,outline);r(10,15,12,4,dark);r(8,19,16,5,dark);r(6,24,20,7,dark);r(12,16,8,13,light);r(15,17,2,12,bone);r(3,10,2,20,bone);r(1,8,6,2,light);r(25,16,6,7,bone);
 }else if(key==='caster'&&type==='gelo'){
  r(15,1,3,4,light);r(12,5,9,3,light);r(8,8,17,3,dark);r(13,11,7,6,bone);r(11,17,11,8,dark);r(8,25,17,6,light);r(24,13,2,17,bone);r(23,8,4,6,light);r(5,18,7,3,light);r(14,13,2,1,outline);
 }else if(!boss){
  r(11,5,12,11,outline);r(13,7,8,7,dark);r(14,10,2,2,'#ffd773');r(19,10,2,2,'#ffd773');r(10,16,14,7,dark);r(8,23,18,8,dark);r(14,17,6,14,light);r(3,16,6,5,light);r(3,9,5,6,'#e8743d');r(4,6,3,5,'#ffe080');r(25,19,4,7,bone);
 }else{
  // Root colossus, flame seraph and crowned void monarch.
  const root=type==='veneno',angel=type==='fogo';
  for(let i=0;i<5;i++){r(1+i*2,7+i*3,5,root?16:5,dark);r(26-i*2,7+i*3,5,root?16:5,dark);}
  r(11,4,11,10,outline);r(12,6,9,7,light);r(13,8,2,2,'#fff7d4');r(18,8,2,2,'#fff7d4');r(8,14,18,12,dark);r(12,15,10,10,light);r(7,26,9,5,dark);r(20,26,8,5,dark);r(15,17,4,5,outline);
  if(root){r(10,1,2,5,bone);r(22,1,2,6,bone);}else if(angel){r(11,1,12,2,'#ffe29a');}else{r(11,1,2,5,'#d6b669');r(16,0,2,6,'#d6b669');r(21,1,2,5,'#d6b669');}
 }
 if(key==='assassin'){r(13,11,5,2,'#e9efb5');r(11,14,2,4,'#a7c476');r(19,13,2,5,'#3e663d');r(12,21,2,1,'#fff6b8');r(18,21,2,1,'#fff6b8');}else if(key==='fighter'){r(11,15,2,6,'#b9c5ac');r(17,17,4,1,'#344b45');r(17,20,4,1,'#344b45');r(12,6,3,1,'#f4e3bd');}else if(key==='healer'){r(13,5,6,1,'#eee0ba');r(9,23,2,6,'#94839e');r(22,24,2,6,'#3d3b55');r(15,18,2,2,'#f4d29b');}else if(key==='caster'){r(12,18,2,7,light);r(20,24,3,6,outline);r(14,8,2,1,'#fff4d3');}if(boss){r(13,15,2,7,bone);r(21,16,2,8,outline);r(13,7,7,1,'#fff0bf');}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 34" shape-rendering="crispEdges">${parts}</svg>`;
}
export function sprite(kind='hero',key='guerreiro',race='humano',type='sombrio',boss=false){
 const id=[kind,key,race,type,boss].join(':');if(cache.has(id))return cache.get(id);
 const svg=kind==='hero'?baseSprite(kind,key,race,type,boss).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '):monster(key,type,boss);
 const result=`<img class="pixel-sprite ${kind==='hero'?'hero-sprite':'monster-sprite'}" src="data:image/svg+xml,${encodeURIComponent(svg)}" alt="" draggable="false" width="96" height="102">`;
 cache.set(id,result);return result;
}
export function itemIcon(slot='weapon',rarity=0,name=''){
 const colors=['#c6cbb7','#82bdc9','#dfbb70','#b093ce','#e8915e'],c=colors[rarity]||colors[0];
 const paths={weapon:'M13 2h3v13h-3z M8 14h12v3H8z M12 17h4v6h-4z',armor:'M7 5h5v3h5V5h5l4 7-5 3v10H7V15l-5-3z',helm:'M7 10V6h14v4h3v12h-7v-7h-3v7H5V10z',ring:'M9 8h11v3h3v10h-3v3H9v-3H6V11h3z M10 12v8h9v-8z',amulet:'M9 2h2v8h7V2h2v11h-4v4h5v7H9v-7h5v-4H9z',potion:'M11 2h8v5h-2v5h4v13H7V12h4z'};
 const base=name.split(' ')[0];const variants={Cajado:'M12 8h4v18h-4z M9 2h10v8H9z',Martelo:'M12 8h4v18h-4z M4 3h20v8H4z',Arco:'M8 2h6v3h4v4h3v10h-3v4h-4v3H8v-3h4v-3h4V8h-4V5H8z M8 3h1v22H8z',Adaga:'M12 7h4v10h-4z M8 17h12v3H8z M12 20h4v6h-4z',Manto:'M10 3h9l6 23H4z M12 6h5v6h-5z'};
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges"><path fill="${c}" fill-rule="evenodd" stroke="#1a2525" stroke-width="1" d="${variants[base]||paths[slot]||paths.amulet}"/><path d="M12 4h2v8h-2z" fill="#fff3ce"/></svg>`;
 return `<img class="item-icon" src="data:image/svg+xml,${encodeURIComponent(svg)}" alt="" width="32" height="32">`;
}
let landscape;
export function scene(canvas){
 if(!canvas)return;const w=960,h=400;canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');
 if(landscape){c.drawImage(landscape,0,0);return;}
 c.imageSmoothingEnabled=false;let seed=17;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 rect(0,0,w,h,'#344b37');
 for(let i=0;i<14000;i++){const x=rand()*w,y=rand()*h;rect(x,y,2+Math.floor(rand()*3),2,['#40593a','#4a633f','#53683e','#293f31'][i%4]);}
 // Broken stone terrace across the battlefield.
 for(let y=125;y<365;y+=18)for(let x=115;x<860;x+=32){const xx=x+(y%36?16:0);if((x<220||x>740)&&rand()>.32)continue;if(y>285&&rand()>.55)continue;rect(xx,y,30,16,['#777864','#838471','#6f745f'][Math.floor(rand()*3)]);rect(xx,y,30,2,'#92927b');rect(xx+28,y,2,16,'#545c4d');if(rand()>.6)rect(xx+3,y+12,12,3,'#4a603b');}
 // Ruined doorway and stairs.
 rect(365,0,236,104,'#252f2c');rect(396,0,174,80,'#111f20');
 for(let y=0;y<85;y+=14){rect(365,y,31,12,'#757c68');rect(570,y,31,12,'#68725f');rect(368,y,25,3,'#92947b');}
 for(let i=0;i<5;i++){rect(381-i*8,80+i*9,204+i*16,8,'#727b68');rect(381-i*8,80+i*9,204+i*16,2,'#a4a58b');}
 for(const [x,y] of [[45,125],[860,145],[78,235],[830,250]]){rect(x,y+8,50,25,'#273b32');rect(x+4,y+3,40,27,'#53614a');rect(x+9,y,30,6,'#8e9270');rect(x+7,y+7,29,3,'#748164');rect(x+35,y+13,8,15,'#354b3a');rect(x+4,y+26,34,4,'#263e31');}
 const tree=(x,y,scale=1)=>{rect(x+24,y+34,13,62,'#342f27');rect(x+29,y+36,5,59,'#66523b');for(let layer=0;layer<4;layer++){const size=64-layer*10,tx=x+layer*5,ty=y+20-layer*7;rect(tx+6,ty,size-12,22,'#1b342b');rect(tx,ty+6,size,12,['#294632','#39553a','#4b663e','#617747'][layer]);rect(tx+8,ty+2,size-16,5,'#6a7d48');}for(let i=0;i<24;i++){const xx=x+rand()*60,yy=y+rand()*44;rect(xx,yy,4,3,['#263e2e','#4c653a','#829355'][i%3]);}};
 for(let x=-20;x<960;x+=75){if(x<290||x>650)tree(x,-15);}
 tree(-25,220);tree(875,210);tree(15,290);tree(805,320);
 for(let i=0;i<50;i++){const x=rand()*960,y=rand()*400;if(x<110||x>860){rect(x,y,6,3,'#c5a765');rect(x+2,y-3,2,3,'#e3c479');}}
 // Torches: static art; action effects are animated separately.
 for(const x of [344,615]){rect(x,60,5,28,'#332b27');rect(x-3,49,11,15,'#bb6939');rect(x,46,5,13,'#f2c36a');}
 landscape=document.createElement('canvas');landscape.width=w;landscape.height=h;landscape.getContext('2d').drawImage(canvas,0,0);
}
