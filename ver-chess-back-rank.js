/* v7.3: back-rank confinement and sliding-ray observations, NOT checkmate validation. */
(function(root,factory){
 const motifs=typeof module==='object'&&module.exports?require('./ver-chess-motifs.js'):root&&root.VERChessMotifs;
 const api=factory(motifs);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VERChessBackRank=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(motifs){
'use strict';
if(!motifs||typeof motifs.parseFen!=='function')throw Error('VERChessMotifs required');
const files='abcdefgh';
const side=p=>p===p.toUpperCase()?'w':'b';
function backRankPatterns(fen){
 const {board}=motifs.parseFen(fen),hits=[];
 for(const defending of ['w','b']){
  const kingPiece=defending==='w'?'K':'k',rank=defending==='w'?1:8;
  const king=Object.keys(board).find(s=>board[s]===kingPiece);
  if(Number(king[1])!==rank)continue;
  const kx=files.indexOf(king[0]),advance=defending==='w'?2:7;
  // Own pawns on every available forward square restrict immediate king exits.
  const forward=[kx-1,kx,kx+1].filter(x=>x>=0&&x<8);
  if(!forward.every(x=>board[files[x]+advance]===(defending==='w'?'P':'p')))continue;
  for(const [attacker,piece] of Object.entries(board)){
   if(!/[rq]/i.test(piece)||side(piece)===defending||Number(attacker[1])!==rank)continue;
   const ax=files.indexOf(attacker[0]),step=ax<kx?1:-1;
   let clear=true;
   for(let x=ax+step;x!==kx;x+=step)if(board[files[x]+rank]){clear=false;break;}
   if(!clear)continue;
   hits.push({kind:'back-rank-confinement-geometry',attacker,king,defending,blockingPawns:forward.map(x=>files[x]+advance),
    note:'Open rook/queen ray to a back-rank king with own pawns ahead. Not proof of legal checkmate, a forced tactic, or a winning move.'});
  }
 }
 return hits.sort((a,b)=>a.king.localeCompare(b.king)||a.attacker.localeCompare(b.attacker));
}
return Object.freeze({backRankPatterns});
});
