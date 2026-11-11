const {test}=require('node:test'),assert=require('node:assert/strict');
const rules=require('./helpers/chess-rules.cjs'),content=require('../ver-chess-combination-content.js');
const independent=require('../docs/release-evidence/v75-combination-python.json');
const engine=require('../docs/release-evidence/v75-combination-stockfish.json');

test('original starting position matches the independently valid python-chess FEN',()=>{
 assert.equal(independent.valid,true);assert.equal(independent.fen,content.fen);
 const s=rules.parseFen(content.fen);assert.equal(rules.fen(s),content.fen);
 assert.equal(rules.checked(s,1),false);assert.equal(rules.checked(s,-1),false);
 assert.equal(content.verify(rules),true);
});
for(const [key,reply] of Object.entries(content.defenses))test('every move, SAN and legal reply agrees with independent validator: '+key,()=>{
 const actual=content.build(rules,key),reference=independent.lines.find(l=>l.defense===reply);
 for(const [i,p] of actual.plies.entries()){
  const fixture=reference.moves[i];
  assert.equal(p.uci,fixture.uci);assert.equal(p.san,fixture.san);
  assert.equal(rules.fen(actual.states[i]),fixture.before);
  assert.deepEqual(Array.from(rules.legal(actual.states[i]),rules.uci).sort(),fixture.legalResponses);
  assert.ok(rules.findUci(actual.states[i],p.uci));
 }
 assert.equal(rules.fen(actual.states.at(-1)),reference.final);
 assert.equal(actual.states.at(-1).b[rules.idx('d8')],'N');
 assert.equal(actual.plies.filter(p=>p.capture).length,2);
});
test('all meaningful king defenses are covered and wrong candidates get accurate explanations',()=>{
 const l=content.build(rules);
 assert.deepEqual(Array.from(rules.legal(l.states[1]),rules.uci),['g8h8']);
 assert.deepEqual(Array.from(rules.legal(l.states[3]),rules.uci).sort(),['h8g8','h8h7']);
 const premature=rules.apply(l.states[0],rules.findUci(l.states[0],'e5f7'));
 assert.equal(rules.checked(premature),false);assert.ok(rules.findUci(premature,'d8f8'));
 const withoutPawn=rules.parseFen(content.fen.replace('5P2','8'));
 const rookCheck=rules.apply(withoutPawn,rules.findUci(withoutPawn,'h1h8'));
 assert.ok(rules.findUci(rookCheck,'g8g7'),'f6 pawn is essential to the forced king capture');
});
test('line snapshots are immutable; invalid defense never produces a partial line',()=>{
 const l=content.build(rules),before=JSON.stringify(l);
 assert.ok(Object.isFrozen(l)&&Object.isFrozen(l.states)&&Object.isFrozen(l.states[0].b));
 rules.apply(l.states[0],rules.findUci(l.states[0],'e5f7'));
 assert.equal(JSON.stringify(l),before);assert.throws(()=>content.build(rules,'unknown'));
});
test('saved Stockfish evidence belongs to this position and supports the demonstrated main line',()=>{
 assert.equal(engine.initial.fen,content.fen);assert.equal(engine.initial.bestmove,'h1h8');
 assert.equal(engine.initial.variations[0].depth,22);
 assert.deepEqual(engine.initial.variations[0].pv.slice(0,5),content.build(rules).plies.map(p=>p.uci));
 assert.equal(engine.fork.fen,rules.fen(content.build(rules).states[3]));
 assert.deepEqual(engine.fork.variations.map(v=>v.pv[0]).sort(),Object.values(content.defenses).sort());
});
