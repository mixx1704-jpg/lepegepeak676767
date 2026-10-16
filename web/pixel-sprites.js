import {CLASSES} from './game/data.js';
const cache=new Map();
const raceColors={humano:['#efb780','#ffd5a1','#a86c51'],anao:['#d99a6c','#f4bf86','#96523d'],elfo:['#f7cfac','#ffe6c5','#bc907d'],orc:['#6e9b59','#a2c87a','#405f3e'],umbriano:['#9283bd','#b5a4dc','#5d537f'],infernal:['#c46b61','#e69778','#753d4c'],revenante:['#a7bbad','#d9e0c2','#607c77'],forjado:['#8c9a9d','#d5d7bd','#4c6169'],astral:['#a3c4d9','#e1ebec','#6a86b2'],draconico:['#b68c56','#e3b269','#785c43'],goblin:['#7d9e51','#b2c578','#49643f'],saurio:['#6eac84','#a9d49a','#456b68'],silfide:['#b9d9cf','#edf3ce','#779fa8'],ogro:['#8b9e6a','#b5bf88','#596747'],vampiro:['#cdc1be','#f1dcd1','#968a9e'],fungo:['#b6b07c','#e8d69b','#77794f'],kitsune:['#e9b583','#ffdcaa','#b07755'],abissal:['#697f9d','#a5b6c3','#3d4c70']};
const clothes=[['#3d7493','#7bb6c4','#28445f','#a6b5b3'],['#d7bd6c','#f7e6a4','#8e7046','#e7e4c3'],['#a65e3d','#d29658','#643c38','#c8b28a'],['#684b7b','#a77b9e','#3e3456','#bca0b6'],['#548456','#9cb872','#355542','#c0ba86'],['#4865a0','#8b9acb','#2b3e6a','#d6b667'],['#645678','#9c8aaf','#3c344f','#c4c5ac'],['#ded7ba','#fff2d0','#9a9d8b','#b77f63'],['#5e8b63','#a8bd7b','#3b5e4b','#dbc38c'],['#a85159','#e7957d','#663c57','#e8c486'],['#c98147','#f4ba70','#7c523d','#e9d7ad'],['#794c75','#b47d9d','#473450','#c48b70'],['#558a89','#9ec5af','#355c67','#dab573'],['#819597','#c6c6af','#4a6374','#d2a86b'],['#856947','#c6a46d','#4c4741','#b6bdb0']];
const hairs=['#a9452f','#e8bc58','#684c39','#abb4c5','#ad663a','#78523d','#c6c6b4','#c78343','#b9a976','#427b82','#4d4750','#baaea2','#875532','#344c5e','#805b38'];
function board(w=32,h=48){const pixels=Array.from({length:h},()=>Array(w).fill(null));return {w,h,pixels,rect(x,y,a,b,c){for(let j=Math.max(0,Math.round(y));j<Math.min(h,Math.round(y+b));j++)for(let i=Math.max(0,Math.round(x));i<Math.min(w,Math.round(x+a));i++)pixels[j][i]=c;},dot(x,y,c){this.rect(x,y,1,1,c)}};}
function uri(b){let nodes='';for(let y=0;y<b.h;y++){let x=0;while(x<b.w){const color=b.pixels[y][x];let end=x+1;while(end<b.w&&b.pixels[y][end]===color)end++;if(color)nodes+=`<rect x="${x}" y="${y}" width="${end-x}" height="1" fill="${color}"/>`;x=end;}}return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${b.w}" height="${b.h}" viewBox="0 0 ${b.w} ${b.h}" shape-rendering="crispEdges">${nodes}</svg>`);}
export function heroPixels(classId='guerreiro',raceId='humano',pose='idle'){
 const key=`hero:${classId}:${raceId}:${pose}`;if(cache.has(key))return cache.get(key);
 const b=board(),i=Math.max(0,CLASSES.findIndex(c=>c.id===classId)),[skin,light,shade]=raceColors[raceId]||raceColors.humano,[coat,hi,dark,trim]=clothes[i],hair=hairs[i],ink='#242b37';
 const short=['anao','goblin','fungo'].includes(raceId),broad=['ogro','orc','forjado'].includes(raceId),slim=['elfo','silfide','astral'].includes(raceId);const off=short?6:0,top=off+(pose==='step'?1:0),wide=broad?2:slim?-1:0;
 const r=(x,y,w,h,c)=>b.rect(x,y+top,w,h,c),d=(x,y,c)=>r(x,y,1,1,c);
 // Silhouette, trousers and two individually posed boots.
 const legY=short?34:37,bootY=short?39:43,step=pose==='step'?2:pose==='strike'?-2:0;
 b.rect(10-wide,legY,6+wide,bootY-legY,ink);b.rect(18,legY,5+wide,bootY-legY,ink);b.rect(11-wide,legY,4+wide,bootY-legY,dark);b.rect(19,legY,3+wide,bootY-legY,coat);
 b.rect(8-wide,bootY+step,9+wide,4,ink);b.rect(18,bootY-step,8+wide,4,ink);b.rect(9-wide,bootY+step,6+wide,2,trim);b.rect(19,bootY-step,5+wide,2,trim);
 // Cloaks and class silhouette.
 if([0,1,3,5,6,7,8,9,11,13].includes(i)){r(7-wide,23,16+wide*2,short?12:17,ink);r(8-wide,24,14+wide*2,short?10:15,dark);r(9-wide,25,3,short?9:14,coat);r(22+wide,29,2,short?7:11,coat);}
 r(10-wide,22,13+wide*2,short?13:17,ink);r(11-wide,23,11+wide*2,short?11:15,coat);r(11-wide,24,4,short?9:12,hi);r(15,25,2,10,coat);r(19+wide,24,2,11,dark);r(10-wide,34,13+wide*2,3,ink);r(11-wide,34,11+wide*2,2,trim);r(16,34,3,2,hi);
 if([0,1,14].includes(i)){r(8-wide,22,7,6,ink);r(9-wide,22,6,4,trim);r(9-wide,22,4,2,light);r(18,23,6+wide,5,trim);r(18,23,4,2,hi);r(14,27,7,4,trim);d(15,28,light);}
 if(i===2||i===10){r(12-wide,23,10+wide*2,10,skin);r(13-wide,23,4,7,light);r(19+wide,25,2,7,shade);r(11-wide,24,3,9,dark);r(14,26,3,2,trim);r(16,28,3,2,trim);}
 if([5,6,7,8,11,13].includes(i)){r(13,30,7,9,coat);r(13,36,8,4,dark);r(14,37,5,2,trim);}
 // Left arm and the right hand used as the equipment anchor.
 r(6-wide,25,5,10,ink);r(7-wide,25,4,6,coat);r(7-wide,31,4,4,skin);d(8-wide,31,light);
 const handX=pose==='strike'?25:24,handY=pose==='cast'?21:29;r(21+wide,24,5,8,ink);r(21+wide,24,4,6,coat);r(handX,handY,4,5,ink);r(handX,handY,3,3,skin);d(handX,handY,light);
 // Neck and large, readable face, with two-tone skin and a single dark outline.
 r(13,19,7,5,ink);r(14,20,5,4,shade);r(10,7,13,14,ink);r(9,10,15,8,ink);r(11,8,11,12,skin);r(10,11,13,7,skin);r(12,9,6,7,light);r(21,11,2,7,shade);r(13,20,7,2,shade);r(11,11,2,5,shade);
 r(10,5,13,6,ink);r(9,8,15,4,hair);r(11,6,11,5,hair);r(12,5,7,2,hair);r(11,8,3,6,hair);r(20,8,3,5,hair);r(14,7,3,2,trim);r(18,6,3,2,trim);
 // Distinct hairstyles rather than detailed portrait texture.
 if([0,2,3,10].includes(i)){r(12,2,3,5,hair);r(16,1,3,6,hair);r(20,3,3,5,hair);r(8,6,3,3,hair);d(16,1,trim);}
 if([1,4,7,8,9,11,12,13].includes(i)){r(8,11,3,15,hair);r(22,10,3,17,hair);r(23,16,3,9,dark);}
 r(14,14,3,3,ink);r(20,14,3,3,ink);d(15,14,'#fff2ce');d(21,14,'#fff2ce');d(16,15,i===6?'#bd7191':'#346e88');d(22,15,'#346e88');r(18,18,2,1,shade);
 // Hats, hoods and identifying class accessories.
 if(i===5){r(7,8,19,3,ink);r(8,7,17,3,coat);r(11,4,12,4,coat);r(14,1,7,5,coat);r(17,0,5,3,hi);r(10,7,12,1,trim);}
 if(i===3||i===6||i===11){r(8,6,3,13,dark);r(9,5,14,3,dark);r(22,7,3,13,dark);r(11,6,10,1,coat);if(i===6){r(16,7,4,4,trim);d(17,8,ink);d(19,8,ink);}}
 if(i===4){r(8,7,17,3,dark);r(10,4,13,4,coat);r(12,3,10,2,hi);r(22,1,2,6,trim);}
 if(i===9){r(8,7,18,3,dark);r(10,5,13,3,coat);r(21,1,2,6,trim);r(23,2,2,3,light);}
 if(i===7){r(10,5,13,3,trim);r(15,3,3,6,hi);r(14,5,6,2,hi);}
 if(i===12||i===14){r(10,10,14,3,ink);r(11,10,5,3,trim);r(18,10,5,3,trim);r(12,10,2,2,'#8ecaca');r(19,10,2,2,'#8ecaca');}
 if(i===8||i===13){r(7,4,3,5,trim);r(6,3,2,2,trim);r(23,4,3,5,trim);r(25,2,2,3,trim);r(11,6,12,2,dark);}
 // Racial anatomy changes remain recognizable under every class outfit.
 if(['elfo','silfide','goblin','umbriano'].includes(raceId)){r(5,11,5,2,shade);r(6,12,4,3,skin);r(24,11,6,2,shade);r(24,12,4,3,skin);}
 if(['orc','ogro'].includes(raceId)){r(10,17,13,4,skin);r(12,19,2,3,'#f1e0ad');r(21,19,2,3,'#f1e0ad');r(16,18,4,2,shade);}
 if(raceId==='anao'){r(11,18,11,7,hair);r(13,23,7,4,hair);r(16,24,2,2,trim);}
 if(['infernal','draconico','abissal'].includes(raceId)){r(8,3,3,6,shade);r(7,1,2,4,trim);r(22,2,3,6,shade);r(24,0,2,4,trim);if(raceId!=='infernal'){r(23,35,6,3,shade);r(28,31,2,6,skin);}}
 if(raceId==='saurio'){r(21,15,6,4,skin);r(23,15,4,1,light);d(25,16,ink);r(23,36,7,3,shade);r(29,31,2,6,skin);r(11,9,2,2,shade);}
 if(raceId==='forjado'){r(12,13,11,5,shade);r(13,14,3,2,'#e8c477');r(20,14,3,2,'#e8c477');r(16,18,4,1,ink);r(16,25,3,4,'#e8c477');}
 if(raceId==='revenante'){r(11,17,12,4,shade);r(12,18,2,3,light);r(15,18,2,3,light);r(18,18,2,3,light);r(21,18,2,3,light);r(13,14,4,3,ink);r(20,14,4,3,ink);}
 if(raceId==='vampiro'){r(14,15,3,1,'#b95065');r(21,15,2,1,'#b95065');d(17,19,'#fff1d3');d(20,19,'#fff1d3');}
 if(raceId==='fungo'){r(6,6,22,5,'#835b58');r(8,3,18,4,'#bb8272');r(11,1,12,4,'#d0a07f');r(9,5,3,2,'#e9d5a1');r(19,3,3,2,'#e9d5a1');r(14,7,4,2,'#e9d5a1');}
 if(raceId==='kitsune'){r(8,1,5,8,'#bf7747');r(10,3,2,4,'#f1d4a5');r(21,1,5,8,'#bf7747');r(22,3,2,4,'#f1d4a5');r(24,33,6,6,'#c58b55');r(28,28,3,8,'#e5b77e');r(29,27,2,3,'#fff0bd');}
 if(raceId==='astral'){d(8,10,'#e2ecca');d(24,23,'#e2ecca');d(12,30,'#e2ecca');r(16,10,2,2,'#f0ecbb');}
 if(raceId==='silfide'){r(4,24,3,7,'#97b9c5');r(3,23,2,4,'#c7d9cf');r(26,24,3,7,'#97b9c5');r(28,23,2,4,'#c7d9cf');}
 const result=uri(b);cache.set(key,result);return result;
}
export function creaturePixels(kind='skeleton',variant=0,boss=false){const key=`mob:${kind}:${variant}:${boss}`;if(cache.has(key))return cache.get(key);const b=board(48,48),ink='#29313c',pal=[['#cbc7a1','#eee0b9','#898b77'],['#719262','#b0be7d','#46644f'],['#9a6b68','#d49b83','#644756'],['#7c8ca9','#b6d4d5','#505c81'],['#a28854','#dcc07a','#6d5742'],['#8a6393','#bf94b3','#514366']][Math.abs(variant)%6],[base,hi,shade]=pal;const r=(...a)=>b.rect(...a);const animal=/wolf|lobo|aranha|spider|fera|javali/.test(kind),plant=/treant|ent|totem|homunculus/.test(kind),machine=/turret|golem/.test(kind);
 if(animal){r(9,23,28,13,ink);r(10,24,26,10,base);r(11,24,20,4,hi);r(5,16,15,15,ink);r(6,17,13,12,base);r(3,23,8,6,base);r(7,12,4,8,shade);r(17,12,4,8,shade);r(8,20,3,2,'#eac57a');r(16,20,3,2,'#eac57a');for(let i=0;i<4;i++){r(10+i*7,34,3,9,ink);r(11+i*7,34,2,7,shade);}r(35,16,4,13,base);r(38,14,3,6,hi);if(/aranha|spider/.test(kind))for(let i=0;i<4;i++){r(3,26+i*4,10,2,shade);r(35,26+i*4,10,2,shade);r(2+i,27+i*4,2,8,ink);r(43-i,27+i*4,2,8,ink);}}
 else{r(14,35,7,10,ink);r(28,35,7,10,ink);r(15,35,5,8,shade);r(29,35,5,8,base);r(11,20,27,18,ink);r(12,21,25,15,shade);r(15,22,18,13,base);r(16,22,6,10,hi);r(7,22,7,14,ink);r(8,23,5,11,base);r(36,23,6,13,ink);r(37,24,4,11,base);r(15,5,19,16,ink);r(16,6,17,14,base);r(18,6,8,8,hi);r(17,12,5,4,ink);r(27,12,5,4,ink);r(19,13,2,2,'#e3b864');r(28,13,2,2,'#e3b864');r(22,18,6,1,shade);
 if(/skeleton|archer|knight|lich/.test(kind)){r(19,19,2,3,hi);r(23,19,2,3,hi);r(28,19,2,3,hi);r(23,26,2,8,hi);for(let y=25;y<34;y+=3)r(18,y,13,1,hi);}
 if(/knight|golem/.test(kind)){r(14,7,21,7,shade);r(17,5,16,6,base);r(19,11,12,2,ink);r(23,11,3,2,'#c5d4bf');r(10,21,10,6,hi);r(31,21,10,6,hi);r(17,25,16,7,shade);}
 if(/archer|turret/.test(kind)){r(38,11,3,26,shade);r(42,15,2,19,hi);r(40,12,3,3,hi);r(40,34,3,3,hi);r(27,25,16,2,hi);}
 if(plant){r(10,5,6,8,shade);r(6,3,6,4,base);r(34,4,5,10,shade);r(38,2,6,4,base);r(18,2,13,5,hi);r(20,31,3,11,shade);r(29,28,3,13,shade);}
 if(/imp|demon|infernal/.test(kind)||boss){r(12,2,4,8,shade);r(10,0,3,6,hi);r(33,1,4,9,shade);r(37,0,3,5,hi);r(4,19,5,13,shade);r(0,17,5,5,base);r(41,20,5,13,shade);r(44,18,4,5,base);}
 if(/spirit/.test(kind)){r(12,37,26,6,shade);r(16,42,19,3,base);r(21,45,9,2,hi);}
 if(machine){r(18,28,14,3,ink);r(23,26,5,7,'#dcb66b');r(16,7,16,3,hi);}
 }
 // Cloth silhouettes have stepped hems, a face and articulated arms, not square torsos.
 if(!animal&&/lich|witch|shaman|priest|oracle|brood|leech/.test(kind)){
  for(const row of b.pixels)row.fill(null);
  const robe=kind==='witch'?'#637ea0':kind==='shaman'?'#7d698d':kind==='priest'?'#9e7955':shade;
  const robeHi=kind==='witch'?'#aac6d1':kind==='shaman'?'#bca3b3':hi;
  for(let y=21;y<43;y++){const spread=Math.floor((y-21)/5);r(16-spread,y,16+spread*2,1,ink);r(17-spread,y,14+spread*2,1,robe);r(18-spread,y,3,1,robeHi);r(28+spread,y,2,1,shade);}
  r(14,9,20,13,ink);r(16,10,16,11,robe);r(18,11,12,10,'#c8bea0');r(19,12,6,6,'#e4d2ae');r(19,15,3,3,ink);r(27,15,3,3,ink);r(20,15,1,1,'#d2b86e');r(28,15,1,1,'#d2b86e');r(23,20,4,1,shade);
  r(12,24,6,11,ink);r(13,24,4,8,robe);r(11,31,5,4,'#c8bea0');r(30,23,7,11,ink);r(31,24,5,8,robe);r(34,31,5,4,'#c8bea0');r(23,23,3,18,robeHi);r(24,24,1,16,'#dfcaa0');r(18,40,13,2,robeHi);r(20,43,5,2,ink);r(29,43,5,2,ink);
  r(39,12,3,32,ink);r(40,13,1,30,'#bb945f');r(36,9,9,5,ink);r(37,10,7,3,robeHi);r(39,6,3,8,robeHi);r(40,7,1,4,'#e6e0bb');
  if(kind==='witch'){r(10,8,27,3,ink);r(11,8,25,1,robeHi);r(15,5,19,4,robe);r(19,2,12,5,robe);r(23,0,7,3,robeHi);}
  else if(kind==='shaman'){r(15,6,4,5,'#bcac84');r(12,3,3,5,'#bcac84');r(31,6,4,5,'#bcac84');r(35,3,3,5,'#bcac84');r(19,8,12,3,robeHi);r(21,24,7,3,base);}
  else{r(15,5,18,6,ink);r(17,4,14,4,robe);r(20,2,8,3,robe);r(14,10,4,12,robe);r(31,10,4,12,robe);r(18,7,12,1,robeHi);}
 }
 if(!animal&&/skeleton|ghoul|executioner|duelist/.test(kind)){
  for(const row of b.pixels)row.fill(null);
  r(19,7,14,12,ink);r(18,10,16,7,ink);r(20,8,12,10,base);r(21,8,6,3,hi);r(21,12,4,3,ink);r(28,12,4,3,ink);r(23,17,7,4,base);r(24,18,1,2,ink);r(27,18,1,2,ink);r(30,18,1,2,ink);
  r(23,21,4,14,ink);r(24,21,2,13,hi);for(let y=23;y<32;y+=3){r(17,y,16,2,ink);r(18,y,14,1,base);}r(15,23,4,12,ink);r(16,24,2,10,hi);r(31,23,4,12,ink);r(32,24,2,10,base);r(14,34,5,4,base);r(32,34,5,4,base);r(19,34,13,4,shade);r(20,37,4,7,ink);r(21,38,2,5,base);r(29,37,4,7,ink);r(30,38,2,5,base);r(18,43,7,3,shade);r(29,43,7,3,shade);
  if(kind==='duelist'){r(16,21,18,4,shade);r(17,25,4,9,base);r(31,24,3,14,shade);r(17,5,16,4,shade);}
  r(39,19,3,17,ink);r(40,17,1,17,hi);r(36,33,9,2,shade);r(39,35,3,5,ink);
 }
 if(variant%3===1){r(10,19,5,4,shade);r(35,19,5,4,shade);}if(variant%3===2){r(21,2,5,5,hi);r(22,0,3,2,base);}const family=Math.floor(Math.abs(variant)/6)%4;if(family===1){r(12,4,24,3,shade);r(11,7,4,14,shade);r(33,7,4,14,shade);}if(family===2){r(3,25,10,13,ink);r(4,26,8,10,base);r(6,27,2,7,hi);r(4,30,8,2,hi);}if(family===3){r(16,3,18,3,hi);r(17,0,3,5,base);r(23,0,3,5,base);r(29,0,3,5,base);r(21,27,8,2,hi);r(24,24,2,8,hi);}const out=uri(b);cache.set(key,out);return out;}
export const PIXEL_RACES=Object.keys(raceColors);

export const raceHand=id=>(raceColors[id]||raceColors.humano)[0];
export function weaponPixels(kind='sword',rarity=0){const key=`weapon:${kind}:${rarity}`;if(cache.has(key))return cache.get(key);const b=board(16,32),r=(...args)=>b.rect(...args),ink='#26323e',steel='#b6ced1',edge='#f0edd2',shade='#698c9b',wood='#8f6746',gold='#ddb56a',gem=['#b5c9c4','#71b4c2','#e6c77d','#af8cce','#eab17a','#dc879f'][rarity]||'#83bdc1';
 // Every handle shares one grip coordinate; blade shapes and material shading differ.
 r(6,21,4,10,ink);r(7,22,2,8,wood);r(7,24,2,1,gold);r(7,28,2,1,gold);
 if(['sword','dagger','spear'].includes(kind)){const top=kind==='dagger'?11:kind==='spear'?0:2;r(6,top+2,4,20-top,ink);r(7,top+1,2,21-top,steel);r(7,top+2,1,18-top,edge);r(8,top+3,1,18-top,shade);r(4,21,8,3,ink);r(4,21,8,1,gold);r(7,22,2,1,gem);if(kind==='spear'){r(7,11,2,12,wood);r(5,5,6,5,steel);r(7,0,2,5,edge);}}
 if(kind==='axe'){r(6,4,4,20,ink);r(7,5,2,19,wood);r(2,3,12,10,ink);r(1,5,14,7,ink);r(2,5,12,6,steel);r(2,5,2,6,edge);r(12,5,2,6,shade);r(5,5,6,6,shade);r(7,6,2,5,gold);}
 if(kind==='club'){r(4,2,8,19,ink);r(3,4,10,12,ink);r(4,4,8,13,wood);r(5,3,2,15,'#c39a60');r(9,4,2,14,'#604c39');r(4,6,8,2,gold);r(4,14,8,2,gold);}
 if(kind==='staff'){r(6,8,4,17,ink);r(7,9,2,15,wood);r(3,1,10,11,ink);r(4,2,8,8,gold);r(5,3,6,6,gem);r(6,3,2,2,edge);r(6,10,4,2,gold);}
 if(kind==='scythe'){r(6,3,4,21,ink);r(7,5,2,20,wood);r(6,2,9,4,ink);r(10,4,6,9,ink);r(7,3,7,2,steel);r(13,5,2,7,steel);r(15,8,1,6,shade);r(7,3,7,1,edge);}
 if(kind==='bow'){r(7,1,4,3,ink);r(10,3,3,5,ink);r(12,7,3,15,ink);r(10,21,3,5,ink);r(7,25,4,3,ink);r(8,2,2,3,gold);r(11,5,2,4,wood);r(13,9,1,12,gold);r(11,21,2,4,wood);r(8,25,2,2,gold);r(6,3,1,23,edge);r(1,14,14,1,wood);r(13,13,3,3,steel);}
 if(kind==='crossbow'){r(1,9,14,4,ink);r(2,10,12,2,wood);r(1,6,2,11,ink);r(13,6,2,11,ink);r(2,7,1,9,gold);r(13,7,1,9,gold);r(6,7,4,17,ink);r(7,7,2,16,wood);r(7,4,1,15,steel);r(7,3,2,3,edge);}
 if(kind==='gun'){r(1,12,14,7,ink);r(2,13,12,4,steel);r(3,13,9,1,edge);r(12,14,4,3,shade);r(4,18,5,8,ink);r(5,18,3,7,wood);r(3,14,3,2,gold);}
 if(kind==='book'){r(1,9,14,17,ink);r(2,10,12,14,gem);r(3,11,4,12,shade);r(8,11,5,12,'#f1dca6');r(8,11,1,12,wood);r(10,13,2,1,wood);r(10,17,2,1,wood);r(4,14,2,4,gold);}
 if(kind==='lute'){r(6,1,4,20,ink);r(7,2,2,18,wood);r(2,18,12,12,ink);r(3,19,10,10,wood);r(5,20,7,7,gold);r(7,20,3,4,ink);r(7,5,1,23,edge);r(5,3,6,2,gold);}
 if(kind==='flask'){r(5,8,6,10,ink);r(6,9,4,8,steel);r(2,17,12,13,ink);r(3,18,10,11,shade);r(4,22,8,6,gem);r(4,19,2,6,edge);r(5,7,6,3,wood);}
 if(kind==='fist'){r(1,16,14,13,ink);r(2,17,12,11,gold);r(3,16,2,7,edge);r(6,15,2,8,edge);r(9,16,2,7,edge);r(12,18,2,5,shade);r(4,25,8,2,shade);r(7,24,2,3,gem);}
 const out=uri(b);cache.set(key,out);return out;}
