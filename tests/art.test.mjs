import test from 'node:test';
import assert from 'node:assert/strict';
import {sprite,itemIcon} from '../web/pixel-art.js';
import {CLASSES} from '../web/game/data.js';
import {RACES} from '../web/game/content.js';
test('every class and race renders a cached image without thousands of DOM nodes',()=>{for(const c of CLASSES)for(const r of RACES){const s=sprite('hero',c.id,r.id);assert(s.startsWith('<img'));assert(s.includes('data:image/svg+xml,'));assert.equal(s,sprite('hero',c.id,r.id));}});
test('six enemy families and three bosses have distinct art',()=>{const variants=[['fighter','corte'],['fighter','contundente'],['caster','fogo'],['caster','gelo'],['healer','sombrio'],['assassin','veneno']].map(([r,t])=>sprite('enemy',r,'humano',t));for(const t of ['veneno','fogo','sombrio'])variants.push(sprite('enemy','boss','humano',t,true));assert.equal(new Set(variants).size,9);});
test('weapons have distinct icons, including staff and bow',()=>{const icons=['Espada','Cajado','Martelo','Arco','Adaga'].map(n=>itemIcon('weapon',0,n));assert.equal(new Set(icons).size,5);});
