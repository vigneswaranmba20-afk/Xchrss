/* Offline read-only position index fixtures. Run: node tests/game-lesson-index.spec.cjs */
'use strict';
const assert=require('node:assert/strict');
const {findLessonMoments}=require('../ver-chess-game-lesson-index.js');
const fork='3q3k/8/8/4N3/8/8/8/K7 w - - 0 1';
const pin='6k1/5n2/8/8/8/8/4B3/K7 w - - 0 1';
const lessons=Object.freeze([Object.freeze({id:'fork',name:'Knight fork',fen:fork}),Object.freeze({id:'pin',name:'Absolute pin',fen:pin})]);
const positions=Object.freeze([fork, fork.replace(' w ',' b '), pin, 'bad',fork.replace(' 0 1',' 12 30')]);
const before=JSON.stringify({positions,lessons});
const found=findLessonMoments(positions,lessons);
assert.deepEqual(found.map(x=>[x.ply,x.lessons.map(l=>l.id)]),[[0,['fork']],[2,['pin']],[4,['fork']]]);
assert.equal(found[0].lessons[0].reason.includes('not a tactical evaluation'),true);
assert.equal(findLessonMoments(null,lessons).length,0);
assert.equal(findLessonMoments(positions,null).length,0);
assert.equal(findLessonMoments([fork.replace('K7','8')],lessons).length,0);
assert.equal(JSON.stringify({positions,lessons}),before,'must not mutate saved game or lessons');
assert.ok(Object.isFrozen(found)&&Object.isFrozen(found[0]));
console.log('game-to-lesson read-only fixtures passed');
