const {test}=require('node:test');
const assert=require('node:assert/strict');
const {backRankPatterns:detect}=require('../ver-chess-back-rank.js');
test('white king confined by own three pawns on exposed first rank',()=>{
 const hits=detect('7k/8/8/8/8/8/3PPP2/r3K3 w - - 0 1');
 assert.equal(hits.length,1);assert.equal(hits[0].attacker,'a1');assert.equal(hits[0].king,'e1');
 assert.deepEqual(hits[0].blockingPawns,['d2','e2','f2']);assert.match(hits[0].note,/Not proof/i);
});
test('black king with three pawns ahead and white queen ray',()=>{
 const hits=detect('4k2Q/3ppp2/8/8/8/8/8/K7 b - - 0 1');
 assert.equal(hits.length,1);assert.equal(hits[0].defending,'b');assert.equal(hits[0].attacker,'h8');
});
test('blocked rook ray is not reported',()=>assert.deepEqual(detect('7k/8/8/8/8/8/3PPP2/r2BK3 w - - 0 1'),[]));
test('missing pawn ahead prevents strict confinement pattern',()=>assert.deepEqual(detect('7k/8/8/8/8/8/3PP3/r3K3 w - - 0 1'),[]));
test('king not on home rank is excluded',()=>assert.deepEqual(detect('7k/8/8/8/8/4K3/3PPP2/r7 w - - 0 1'),[]));
test('bishop diagonal attack does not count as back-rank rook ray',()=>assert.deepEqual(detect('7k/8/8/8/8/8/3PPP2/b3K3 w - - 0 1'),[]));
test('friendly rook is not an attacker',()=>assert.deepEqual(detect('7k/8/8/8/8/8/3PPP2/R3K3 w - - 0 1'),[]));
test('malformed FEN is rejected',()=>assert.throws(()=>detect('8/8/8/8/8/8/8/8 w - - 0 1'),/king/i));
