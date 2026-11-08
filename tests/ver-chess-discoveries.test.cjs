const {test}=require('node:test');
const assert=require('node:assert/strict');
const {discoveredAttackGeometry:detect}=require('../ver-chess-discoveries.js');
const project=hits=>hits.map(h=>[h.side,h.movedFrom,h.movedTo,h.attacker,h.target]);
test('white knight quiet move reveals rook attack along file',()=>{
 const before='4r2k/8/8/8/8/8/4N3/4R2K w - - 0 1';
 const after='4r2k/8/8/8/8/5N2/8/4R2K b - - 1 1';
 assert.deepEqual(project(detect(before,after)),[['w','e2','f3','e1','e8']]);
 assert.match(detect(before,after)[0].note,/not proof/i);
});
test('black knight quiet move reveals rook attack along file',()=>{
 const before='4r2k/4n3/8/8/8/8/8/4R2K b - - 0 1';
 const after='4r2k/8/8/5n2/8/8/8/4R2K w - - 1 2';
 assert.deepEqual(project(detect(before,after)),[['b','e7','f5','e8','e1']]);
});
test('moving piece to same ray keeps target blocked',()=>{
 const before='4r2k/8/8/8/8/8/4N3/4R2K w - - 0 1';
 const after='4r2k/8/8/8/8/4N3/8/4R2K b - - 1 1';
 assert.deepEqual(detect(before,after),[]);
});
test('moving an unrelated knight does not fabricate a discovery',()=>{
 const before='4r2k/8/8/8/8/8/2N5/4R2K w - - 0 1';
 const after='4r2k/8/8/8/8/3N4/8/4R2K b - - 1 1';
 assert.deepEqual(detect(before,after),[]);
});
test('same side to move rejected',()=>{
 assert.throws(()=>detect('4r2k/8/8/8/8/8/4N3/4R2K w - - 0 1','4r2k/8/8/8/8/5N2/8/4R2K w - - 1 1'),/turn/);
});
test('captures rejected until separately validated',()=>{
 assert.throws(()=>detect('4r2k/8/8/8/8/5p2/4N3/4R2K w - - 0 1','4r2k/8/8/8/8/5N2/8/4R2K b - - 0 1'),/non-capturing/);
});
test('multiple changes rejected',()=>{
 assert.throws(()=>detect('4r2k/8/8/8/8/8/4N3/4R2K w - - 0 1','4r2k/8/8/8/8/5N2/8/3R3K b - - 1 1'),/non-capturing/);
});
test('malformed FEN rejected by shared parser',()=>{
 assert.throws(()=>detect('8/8/8/8/8/8/8/8 w - - 0 1','8/8/8/8/8/8/8/8 b - - 1 1'),/king/i);
});
