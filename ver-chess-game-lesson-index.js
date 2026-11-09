/* VER Chess v7.4: read-only, offline game-to-lesson position index.
 * Exact FEN placement + turn only. No tactic, accuracy or engine claims. */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./ver-chess-lesson-match.js'):root?.VERChessLessonMatch);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VERChessGameLessonIndex=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(matcher){
 'use strict';
 function findLessonMoments(fens,lessons){
  if(!matcher||typeof matcher.matchExactPosition!=='function'||!Array.isArray(fens)||!Array.isArray(lessons))return [];
  const results=[];
  for(let ply=0;ply<fens.length;ply++){
   const matches=matcher.matchExactPosition(fens[ply],lessons);
   if(matches.length)results.push(Object.freeze({ply,lessons:Object.freeze(matches)}));
  }
  return Object.freeze(results);
 }
 return Object.freeze({findLessonMoments});
});
