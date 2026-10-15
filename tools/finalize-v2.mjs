import {readFile,writeFile} from 'node:fs/promises';
let data=await readFile('web/game/data.js','utf8');
const begin=data.indexOf('export const RUNES ='),end=data.indexOf('export const ENCOUNTERS =');
if(begin>=0&&end>begin)data=data.slice(0,begin)+data.slice(end);
data=data.replace("armor:'+5 armadura e +40% ameaça'","armor:'+4 armadura e +40% ameaça'").replace("crit:'+12% crítico'","crit:'+10% crítico'").replace("support:'+30% cura e +4 mana/turno'","support:'+25% cura e +2 mana/turno'").replace("stagger:'+65% impacto'","stagger:'+50% impacto'").replaceAll('+35%','+30%');
await writeFile('web/game/data.js',data);
let css=await readFile('web/style.css','utf8');css=css.replace(/^@import[^;]*;\r?\n/,'');await writeFile('web/style.css',css);
console.log('v2 data and local-only fonts finalized.');
