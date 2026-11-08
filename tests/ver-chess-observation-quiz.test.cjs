const {test}=require('node:test');
const assert=require('node:assert/strict');
const {questions,assess}=require('../ver-chess-observation-quiz.js');
test('each original offline quiz fixture agrees with detector',()=>{
 assert.equal(questions.length,3);
 for(const q of questions){
  assert.equal(assess(q.id,q.expected).correct,true);
  assert.equal(assess(q.id,!q.expected).correct,false);
  assert.equal(assess(q.id,q.expected).observed,q.expected);
 }
});
test('answers must be explicit booleans and question ids known',()=>{
 assert.throws(()=>assess('unknown',true),/Unknown/);
 assert.throws(()=>assess(questions[0].id,'yes'),/boolean/);
});
test('feedback never represents geometry as verified checkmate or accuracy',()=>{
 for(const q of questions){
  const result=assess(q.id,q.expected);
  assert.match(result.explanation,/does not establish/i);
  assert.equal('accuracy' in result,false);
  assert.equal('evaluation' in result,false);
 }
});
