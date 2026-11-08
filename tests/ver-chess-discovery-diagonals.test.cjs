const {test}=require('node:test');
const assert=require('node:assert/strict');
const {discoveredAttackGeometry:detect}=require('../ver-chess-discoveries.js');
const projection=hits=>hits.map(({side,attacker,target,movedFrom,movedTo})=>[side,attacker,target,movedFrom,movedTo]);

test('bishop discovery: a quiet knight move uncovers diagonal attack',()=>{
 const before='k7/8/7r/8/8/8/3N4/2B4K w - - 0 1';
 const after ='k7/8/7r/8/8/5N2/8/2B4K b - - 1 1';
 assert.deepEqual(projection(detect(before,after)),[['w','c1','h6','d2','f3']]);
});
test('queen discovery: a quiet knight move uncovers diagonal attack',()=>{
 const before='k7/8/7r/8/8/8/3N4/2Q4K w - - 0 1';
 const after ='k7/8/7r/8/8/5N2/8/2Q4K b - - 1 1';
 assert.deepEqual(projection(detect(before,after)),[['w','c1','h6','d2','f3']]);
});
test('friendly target does not count as a discovered attack',()=>{
 const before='k7/8/7R/8/8/8/3N4/2B4K w - - 0 1';
 const after ='k7/8/7R/8/8/5N2/8/2B4K b - - 1 1';
 assert.deepEqual(detect(before,after),[]);
});
test('second blocker on diagonal prevents discovered attack',()=>{
 const before='k7/8/7r/8/8/4P3/3N4/2B4K w - - 0 1';
 const after ='k7/8/7r/8/8/4P N2/8/2B4K b - - 1 1'.replace('4P N2','4PN2');
 assert.deepEqual(detect(before,after),[]);
});
