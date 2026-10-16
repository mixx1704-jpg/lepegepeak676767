import {applyAction} from '../web/game/engine.js';
// Fixtures explicitly supply the party's votes before exercising combat rules.
export function groupAction(s,id,a,now=Date.now()){let n=applyAction(s,id,a,now);for(const p of s.players){if(!n.vote)break;if(p.id===id)continue;n=applyAction(n,p.id,{type:'vote',voteId:n.vote.id,choice:a.type==='route'?a.index:true},now);}return n;}
