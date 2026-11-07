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

test('black knight fork is detected with correct side and sorted targets',()=>{
 const hits=knightForks('k7/8/8/8/8/5n2/3R3Q/7K w - - 0 1');
 assert.deepEqual(hits.map(x=>[x.side,x.from,x.targets]),[['b','f3',['d2','h2']]]);
 assert.match(hits[0].note,/not proof/i);
});
test('queen creates an absolute diagonal pin',()=>{
 const hits=absolutePins('6k1/5n2/8/8/2Q5/8/8/K7 b - - 0 1');
 assert.deepEqual(hits.map(x=>[x.side,x.attacker,x.pinned,x.king]),[['w','c4','f7','g8']]);
});
test('a friendly blocker in front of enemy piece defeats the pin',()=>{
 const hits=absolutePins('6k1/5n2/4P3/8/2B5/8/8/K7 w - - 0 1');
 assert.deepEqual(hits,[]);
});
test('an opposing bishop cannot pin on a straight file',()=>{
 const hits=absolutePins('4k3/4n3/8/8/8/8/4B3/K7 w - - 0 1');
 assert.deepEqual(hits,[]);
});
test('overfilled FEN rank and illegal characters are rejected',()=>{
 for(const fen of ['8/8/8/8/8/8/8/K7k w - - 0 1','8/8/8/8/8/8/8/K6x w - - 0 1','8/8/8/8/8/8/8/K6k x - - 0 1'])assert.throws(()=>parseFen(fen));
});
