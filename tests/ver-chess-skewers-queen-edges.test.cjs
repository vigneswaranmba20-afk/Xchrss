const { test } = require('node:test');
const assert = require('node:assert/strict');
const { skewerGeometry } = require('../ver-chess-skewers.js');

const compact = fen => skewerGeometry(fen).map(({side,attacker,king,behind}) => [side,attacker,king,behind]);

test('queen can geometrically skewer on a file', () => {
  assert.deepEqual(compact('r7/k7/8/8/8/8/8/Q6K b - - 0 1'), [['w','a1','a7','a8']]);
});

test('queen can geometrically skewer on a diagonal', () => {
  assert.deepEqual(compact('6r1/5k2/8/8/2Q5/8/8/K7 b - - 0 1'), [['w','c4','f7','g8']]);
});

test('friendly piece behind enemy king is not a skewer target', () => {
  assert.deepEqual(compact('R7/k7/8/8/8/8/8/Q6K b - - 0 1'), []);
});

test('second opposing king is rejected by shared FEN validation', () => {
  assert.throws(() => skewerGeometry('k7/k7/8/8/8/8/8/Q6K b - - 0 1'), /king/i);
});

test('black queen can skewer along rank without claiming a forced win', () => {
  const hits = skewerGeometry('k6q/8/8/8/8/8/8/RK6 w - - 0 1');
  assert.deepEqual(hits.map(({side,attacker,king,behind})=>[side,attacker,king,behind]), []);
});
