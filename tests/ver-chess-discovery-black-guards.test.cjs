const {test}=require('node:test');
const assert=require('node:assert/strict');
const {discoveredAttackGeometry:detect}=require('../ver-chess-discoveries.js');
const brief=hits=>hits.map(({side,attacker,target,movedFrom,movedTo})=>[side,attacker,target,movedFrom,movedTo]);

test('black bishop discovery: knight vacates d7 to reveal c8-h3 diagonal',()=>{
 const before='k1b5/3n4/8/8/8/7R/8/K7 b - - 0 1';
 const after ='k1b5/8/5n2/8/8/7R/8/K7 w - - 1 2';
 assert.deepEqual(brief(detect(before,after)),[['b','c8','h3','d7','f6']]);
});
test('black discovery blocked by a second friendly piece is not reported',()=>{
 const before='k1b5/3n4/4p3/8/8/7R/8/K7 b - - 0 1';
 const after ='k1b5/8/4pn2/8/8/7R/8/K7 w - - 1 2';
 assert.deepEqual(detect(before,after),[]);
});
test('rejects unchanged side to move even if a piece relocated',()=>{
 const before='k1b5/3n4/8/8/8/7R/8/K7 b - - 0 1';
 const after ='k1b5/8/5n2/8/8/7R/8/K7 b - - 1 2';
 assert.throws(()=>detect(before,after),/turn must change/i);
});
test('rejects relocation by side that did not have the turn',()=>{
 const before='k1b5/3n4/8/8/8/7R/8/K7 w - - 0 1';
 const after ='k1b5/8/5n2/8/8/7R/8/K7 b - - 1 1';
 assert.throws(()=>detect(before,after),/Mover must be side to move/i);
});
test('rejects captures rather than implying a quiet discovered attack',()=>{
 const before='k1b5/3n4/5P2/8/8/7R/8/K7 b - - 0 1';
 const after ='k1b5/8/5n2/8/8/7R/8/K7 w - - 0 2';
 assert.throws(()=>detect(before,after),/non-capturing piece relocation/i);
});
