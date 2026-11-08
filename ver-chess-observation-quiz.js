/* VER Chess Learn v7.3 — original offline observation practice; not checkmate or accuracy scoring. */
(function(root,factory){
 const detector=typeof module==='object'&&module.exports?require('./ver-chess-back-rank.js'):root&&root.VERChessBackRank;
 const api=factory(detector);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VERChessObservationQuiz=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(detector){
'use strict';
if(!detector||typeof detector.backRankPatterns!=='function')throw Error('VERChessBackRank required');
const questions=Object.freeze([
 Object.freeze({id:'back-rank-open-ray',fen:'7k/8/8/8/8/8/3PPP2/r3K3 w - - 0 1',prompt:'Is there an unobstructed rook or queen ray to a back-rank king whose own pawns occupy every forward square?',expected:true}),
 Object.freeze({id:'back-rank-blocked-ray',fen:'7k/8/8/8/8/8/3PPP2/r2BK3 w - - 0 1',prompt:'Is there an unobstructed rook or queen ray to a back-rank king whose own pawns occupy every forward square?',expected:false}),
 Object.freeze({id:'back-rank-missing-pawn',fen:'7k/8/8/8/8/8/3PP3/r3K3 w - - 0 1',prompt:'Is there an unobstructed rook or queen ray to a back-rank king whose own pawns occupy every forward square?',expected:false})
]);
function assess(id,answer){
 const question=questions.find(q=>q.id===id);
 if(!question)throw Error('Unknown lesson question');
 if(typeof answer!=='boolean')throw TypeError('Answer must be boolean');
 const observed=detector.backRankPatterns(question.fen).length>0;
 if(observed!==question.expected)throw Error('Lesson fixture does not match detector');
 return Object.freeze({id,correct:answer===observed,observed,explanation:observed?
 'A geometric back-rank confinement pattern is visible. This does not establish legal checkmate or a forced win.':
 'The strict geometric pattern is absent. This does not establish that the king is safe.'});
}
return Object.freeze({questions,assess});
});