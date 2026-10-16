import {pixelGrid} from './sprite-grid.js';
const cache=new Map();
export function tungPixels(pose='idle'){if(cache.has(pose))return cache.get(pose);const g=pixelGrid(32,48),r=g.rect.bind(g),e=g.ellipse.bind(g),l=g.line.bind(g),p=g.poly.bind(g),ink='#453628',dark='#815331',wood='#b47a43',hi='#dfaa63',light='#f0c47e';const sway=pose==='step'?1:0;
 // One continuous cylindrical wooden head/body, with thin articulated limbs.
 l(12,31,11,40,ink,4);l(20,31,21,40,ink,4);l(13,32,12,40,wood,2);l(21,32,22,40,hi,2);
 const step=pose==='step'?2:pose==='strike'?-1:0;l(12,39,10,44+step,ink,3);l(22,39,23,44-step,ink,3);r(7,44+step,8,3,ink);r(21,44-step,8,3,ink);r(8,44+step,6,2,hi);r(22,44-step,6,2,wood);r(8,46+step,1,1,dark);r(11,46+step,1,1,dark);r(24,46-step,1,1,dark);
 e(7+sway,2,19,8,ink);r(7+sway,6,19,26,ink);e(7+sway,27,19,9,ink);r(8+sway,6,17,24,wood);e(8+sway,27,17,7,wood);e(8+sway,3,17,6,hi);r(9+sway,7,3,22,hi);r(22+sway,7,2,23,dark);l(13+sway,6,13+sway,9,wood);l(19+sway,5,19+sway,8,dark);l(12+sway,26,12+sway,31,dark);l(17+sway,24,17+sway,32,hi);l(20+sway,27,20+sway,31,dark);
 // Oversized round eyes and a carved smile keep the Sahur silhouette recognizable.
 e(10+sway,10,6,8,ink);e(17+sway,10,6,8,ink);e(10+sway,10,5,7,'#f4e7c7');e(17+sway,10,5,7,'#f4e7c7');r(12+sway,12,2,4,'#302f2b');r(19+sway,12,2,4,'#302f2b');r(12+sway,12,1,1,'#fff7dd');r(19+sway,12,1,1,'#fff7dd');l(10+sway,9,14+sway,8,dark);l(18+sway,8,22+sway,9,dark);r(16+sway,16,2,4,dark);r(16+sway,17,1,2,hi);l(11+sway,21,14+sway,23,ink);l(14+sway,23,20+sway,23,ink);l(20+sway,23,23+sway,20,ink);r(14+sway,22,6,1,light);
 if(pose==='cast'){l(8,22,4,15,ink,3);l(4,15,6,10,wood,2);r(5,9,4,4,hi);l(25,23,28,18,ink,3);r(26,16,4,4,wood);}
 else{l(7,21,3,27,ink,3);l(3,27,5,34,ink,3);l(8,22,5,27,hi,1);r(4,32,4,4,wood);const x=pose==='strike'?27:24;l(25,21,x+1,28,ink,3);l(24,22,x+1,28,wood,2);r(x,28,4,5,ink);r(x,28,3,3,hi);}
 const out=g.uri();cache.set(pose,out);return out;}
export function encounterPixels(kind='stone'){const key='event:'+kind;if(cache.has(key))return cache.get(key);const g=pixelGrid(64,48),r=g.rect.bind(g),e=g.ellipse.bind(g),l=g.line.bind(g),p=g.poly.bind(g),ink='#293a3b',stone='#839692',shade='#536d6c',hi='#c3c7a7',gold='#e9c778';e(4,40,56,6,'#435846');
 switch(kind){case 'stone':p([[12,39],[11,29],[20,22],[43,21],[53,31],[50,42],[24,44]],ink);p([[14,38],[14,30],[22,25],[42,24],[49,32],[47,40],[24,42]],stone);p([[15,30],[24,25],[41,25],[37,29],[22,32]],hi);l(33,28,38,36,shade);l(38,36,32,40,shade);l(35,34,43,34,shade);r(29,8,5,21,ink);r(30,8,3,20,'#c7e2d4');r(30,8,1,20,'#f8f1bf');r(24,8,16,3,ink);r(25,8,14,2,gold);r(29,2,5,7,ink);r(30,2,3,6,'#9e774d');r(29,0,5,3,gold);r(30,8,3,3,'#9acac3');break;
 case 'egg':e(19,9,27,32,ink);e(21,10,23,29,'#ab7384');e(24,11,12,10,'#d1a08b');p([[25,20],[30,17],[31,23],[37,20],[35,26]],'#6b5371');r(22,31,4,3,gold);r(38,27,3,4,gold);break;
 case 'tree':l(31,39,31,17,'#584d3a',7);l(31,24,19,14,'#584d3a',4);l(32,21,44,12,'#584d3a',4);for(const [x,y] of [[9,10],[18,3],[32,2],[40,8],[23,13]]){e(x,y,19,14,ink);e(x+1,y,17,12,'#829e68');e(x+3,y,10,5,'#b8be7a');}for(const [x,y] of [[18,14],[40,14],[29,19]]){e(x,y,4,5,gold);r(x,y,2,2,'#fff0b7');}break;
 case 'well':e(14,18,38,25,ink);e(15,19,36,21,stone);e(18,17,29,11,hi);e(21,18,24,8,'#30596a');r(18,30,29,1,shade);r(28,28,1,12,shade);r(41,26,1,11,shade);r(25,14,5,2,gold);r(33,10,4,2,gold);break;
 case 'forge':r(23,31,23,11,ink);r(27,27,15,7,shade);p([[13,19],[49,19],[50,25],[39,29],[23,27],[15,24],[6,21]],ink);p([[14,20],[47,20],[47,23],[38,26],[24,24]],stone);r(23,19,21,2,hi);r(10,31,4,10,'#c08a49');r(7,28,10,5,shade);break;
 case 'clock':r(15,3,34,4,ink);r(15,39,34,4,ink);l(19,6,44,39,gold,2);l(44,6,19,39,gold,2);p([[22,7],[41,7],[31,23]],'#a6cad0');p([[31,25],[22,38],[41,38]],'#a6cad0');p([[25,9],[38,9],[31,18]],gold);p([[31,28],[26,36],[37,36]],gold);break;
 case 'shrine':r(12,37,42,5,shade);r(19,29,28,9,stone);r(26,12,14,19,ink);r(27,13,12,16,stone);p([[24,12],[33,3],[42,12]],hi);r(31,15,4,11,gold);r(28,18,10,3,gold);break;
 default:r(14,22,35,20,ink);r(15,23,33,17,'#a47d4b');r(20,22,3,19,gold);r(40,22,3,19,gold);r(14,18,35,7,ink);r(15,18,33,5,'#c4a36c');r(29,25,6,6,gold);r(31,27,2,3,ink);
 }const out=g.uri();cache.set(key,out);return out;}
