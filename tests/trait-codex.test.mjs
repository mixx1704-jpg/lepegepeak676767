import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INFERNAL_TRAITS,traitRules,matchesTraitRule} from '../web/game/trait-codex.js';

test('codex supplies exactly 100 working advantages and 100 disadvantages',()=>{
 assert.equal(INFERNAL_TRAITS.filter(t=>t.cost>0).length,100);
 assert.equal(INFERNAL_TRAITS.filter(t=>t.cost<0).length,100);
 assert.equal(new Set(INFERNAL_TRAITS.map(t=>t.id)).size,200);
 assert.equal(new Set(INFERNAL_TRAITS.map(t=>t.name)).size,200);
 const patterns=new Set();
 for(const t of INFERNAL_TRAITS){
  assert.ok(t.desc.length>35);
  const rule=t.rules[0], [field,op,value]=rule.when;
  const ctx={[field]:value};
  assert.ok(matchesTraitRule(rule,ctx),t.id);
  assert.deepEqual(traitRules({traits:[t.id]},rule.event,ctx),rule.effects,t.id);
  assert.deepEqual(traitRules({traits:[t.id]},rule.event,{}),{},t.id);
  const pattern=JSON.stringify([Math.sign(t.cost),rule.event,rule.when,Object.keys(rule.effects)]);
  assert.ok(!patterns.has(pattern),`duplicate gimmick ${t.id}`);patterns.add(pattern);
 }
});

test('rule cache follows changed loadouts and duplicate ids never double apply',()=>{
 const a=INFERNAL_TRAITS.find(t=>t.rules[0].event==='hit'&&t.rules[0].effects.hp),p={traits:[a.id,a.id]};
 assert.equal(traitRules(p,'hit',{hpRatio:.2}).hp,a.rules[0].effects.hp);
 p.traits.length=0;
 assert.deepEqual(traitRules(p,'hit',{hpRatio:.2}),{});
 p.traits.push(a.id);
 assert.equal(traitRules(p,'hit',{hpRatio:.2}).hp,a.rules[0].effects.hp);
});

test('outputs multiply modifiers and add deltas without changing context',()=>{
 const selected=INFERNAL_TRAITS.filter(t=>t.rules[0].event==='reward'&&t.rules[0].effects.xp);
 const p={traits:selected.map(t=>t.id)},ctx={hpRatio:.2,injuries:3,partySize:1,manaRatio:.1,burn:3};
 const before=structuredClone(ctx),result=traitRules(p,'reward',ctx);
 const expected=selected.filter(t=>matchesTraitRule(t.rules[0],ctx)).reduce((n,t)=>n*t.rules[0].effects.xp,1);
 assert.equal(result.xp,expected);assert.deepEqual(ctx,before);
 assert.deepEqual(traitRules(null,'hit'),{});
});

