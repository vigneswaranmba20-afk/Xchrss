const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseFen,knightForks,absolutePins}=require('../ver-chess-motifs.js');
test('fork lesson after Nf7: knight attacks king and queen',()=>{
 const hits=knightForks('3q3k/5N2/8/8/8/8/8/K7 b - - 1 1');
 assert.deepEqual(hits.map(x=>[x.from,x.targets]),[['f7',['d8','h8']]]);
});
test('fork not claimed before jump',()=>assert.deepEqual(knightForks('3q3k/8/8/4N3/8/8/8/K7 w - - 0 1'),[]));
test('one knight target is not a fork',()=>assert.deepEqual(knightForks('7k/5N2/8/8/8/8/8/K7 b - - 0 1'),[]));
test('own targets do not count',()=>assert.deepEqual(knightForks('3Q3K/5N2/8/8/8/8/8/k7 b - - 0 1'),[]));
test('pin lesson after Bc4: exact aligned squares',()=>{
 const hits=absolutePins('6k1/5n2/8/8/2B5/8/8/K7 b - - 1 1');
 assert.deepEqual(hits.map(x=>[x.attacker,x.pinned,x.king]),[['c4','f7','g8']]);
});
test('pin not claimed before bishop move',()=>assert.deepEqual(absolutePins('6k1/5n2/8/8/8/8/4B3/K7 w - - 0 1'),[]));
test('two blockers prevent absolute pin',()=>assert.deepEqual(absolutePins('6k1/5n2/4p3/8/2B5/8/8/K7 w - - 0 1'),[]));
test('enemy queen behind target is relative, not absolute pin',()=>assert.deepEqual(absolutePins('6qk/5n2/8/8/2B5/8/8/K7 w - - 0 1'),[]));
test('rook pin along file',()=>assert.deepEqual(absolutePins('4k3/4n3/8/8/8/8/4R3/K7 w - - 0 1').map(x=>[x.attacker,x.pinned,x.king]),[['e2','e7','e8']]));
test('malformed FEN rejected',()=>{
 for(const fen of ['8/8/8/8/8/8/8/8 w - - 0 1','8/8/8/8/8/8/8/K7 w - - 0 1','9/8/8/8/8/8/8/K6k w - - 0 1'])assert.throws(()=>parseFen(fen));
});
