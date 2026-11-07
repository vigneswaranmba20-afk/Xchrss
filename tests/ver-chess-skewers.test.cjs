const {test}=require('node:test');
const assert=require('node:assert/strict');
const {skewerGeometry}=require('../ver-chess-skewers.js');
const summarize=fen=>skewerGeometry(fen).map(x=>[x.side,x.attacker,x.king,x.behind]);
test('white rook sees enemy queen behind checked king on file',()=>{
  assert.deepEqual(summarize('q7/k7/8/8/8/8/8/R6K b - - 0 1'),[['w','a1','a7','a8']]);
});
test('white bishop sees enemy queen behind king diagonally',()=>{
  assert.deepEqual(summarize('6q1/5k2/8/8/2B5/8/8/K7 b - - 0 1'),[['w','c4','f7','g8']]);
});
test('black rook skewer has correct color and target',()=>{
  assert.deepEqual(summarize('7r/8/8/8/8/8/7K/k6Q w - - 0 1'),[['b','h8','h2','h1']]);
});
test('pawn blocker before king stops the ray',()=>{
  assert.deepEqual(summarize('q7/k7/8/p7/8/8/8/R6K b - - 0 1'),[]);
});
test('own blocker before king stops the ray',()=>{
  assert.deepEqual(summarize('q7/k7/8/8/8/P7/8/R6K b - - 0 1'),[]);
});
test('enemy piece before king is not a king skewer',()=>{
  assert.deepEqual(summarize('q7/k7/8/n7/8/8/8/R6K b - - 0 1'),[]);
});
test('king without a second target is not a skewer',()=>{
  assert.deepEqual(summarize('8/k7/8/8/8/8/8/R6K b - - 0 1'),[]);
});
test('bishop cannot skewer along a file',()=>{
  assert.deepEqual(summarize('q7/k7/8/8/8/8/8/B6K b - - 0 1'),[]);
});
test('malformed FEN rejected through shared parser',()=>{
  assert.throws(()=>skewerGeometry('8/8/8/8/8/8/8/8 w - - 0 1'));
});
test('finding never asserts a forced tactical win',()=>{
  const hits=skewerGeometry('q7/k7/8/8/8/8/8/R6K b - - 0 1');
  assert.match(hits[0].note,/not proof/i);
});
