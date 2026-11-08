const { test } = require('node:test');
const assert = require('node:assert/strict');
const { backRankPatterns } = require('../ver-chess-back-rank.js');

// Back-rank geometry is an observation only; no checkmate or winning claims.
test('white corner king requires only two forward pawns', () => {
 const hits = backRankPatterns('7k/8/8/8/8/8/PP6/K6r w - - 0 1');
 assert.equal(hits.length, 1);
 assert.equal(hits[0].king, 'a1');
 assert.equal(hits[0].attacker, 'h1');
 assert.deepEqual(hits[0].blockingPawns, ['a2', 'b2']);
});
test('black corner king mirrored with two forward pawns', () => {
 const hits = backRankPatterns('R6k/6pp/8/8/8/8/8/K7 b - - 0 1');
 assert.equal(hits.length, 1);
 assert.equal(hits[0].king, 'h8');
 assert.equal(hits[0].attacker, 'a8');
 assert.deepEqual(hits[0].blockingPawns, ['g7', 'h7']);
});
test('queen on home rank is a sliding attacker', () => {
 const hits = backRankPatterns('7k/8/8/8/8/8/3PPP2/q3K3 w - - 0 1');
 assert.equal(hits.length, 1);
 assert.equal(hits[0].attacker, 'a1');
 assert.match(hits[0].note, /Not proof/i);
});
test('opposing attacker off home rank is not a horizontal back-rank ray', () => {
 assert.deepEqual(backRankPatterns('7k/8/8/8/8/8/r2PPP2/4K3 w - - 0 1'), []);
});
test('opposing piece between queen and king blocks ray', () => {
 assert.deepEqual(backRankPatterns('7k/8/8/8/8/8/3PPP2/q2RK3 w - - 0 1'), []);
});
test('own pawn on the king rank blocks ray', () => {
 assert.deepEqual(backRankPatterns('7k/8/8/8/8/8/3PPP2/r2PK3 w - - 0 1'), []);
});
