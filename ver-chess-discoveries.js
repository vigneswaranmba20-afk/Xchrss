/* v7.3: discovered sliding attacks between two FEN snapshots; geometry only. */
(function(root,factory){
 const motifs=typeof module==='object'&&module.exports?require('./ver-chess-motifs.js'):root&&root.VERChessMotifs;
 const api=factory(motifs);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VERChessDiscoveries=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(motifs){
'use strict';
if(!motifs||typeof motifs.parseFen!=='function')throw Error('VERChessMotifs must load before VERChessDiscoveries');
const files='abcdefgh',directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const side=p=>p===p.toUpperCase()?'w':'b';
function rays(board){
 const found=[];
 for(const [from,piece] of Object.entries(board)){
  if(!/[brq]/i.test(piece))continue;
  const x=files.indexOf(from[0]),y=Number(from[1])-1;
  for(const [dx,dy] of directions){
   const straight=dx===0||dy===0;
   if((straight&&!/[rq]/i.test(piece))||(!straight&&!/[bq]/i.test(piece)))continue;
   for(let a=x+dx,b=y+dy;a>=0&&a<8&&b>=0&&b<8;a+=dx,b+=dy){
    const to=files[a]+(b+1),target=board[to];
    if(!target)continue;
    if(side(target)!==side(piece))found.push({side:side(piece),attacker:from,target:to});
    break;
   }
  }
 }
 return found;
}
function discoveredAttackGeometry(beforeFen,afterFen){
 const before=motifs.parseFen(beforeFen),after=motifs.parseFen(afterFen);
 // Strict quiet-move observation, not a move validator.
 if(before.turn===after.turn)throw Error('FEN turn must change');
 const removed=Object.keys(before.board).filter(s=>before.board[s]!==after.board[s]&&before.board[s]);
 const added=Object.keys(after.board).filter(s=>before.board[s]!==after.board[s]&&after.board[s]);
 if(removed.length!==1||added.length!==1||before.board[removed[0]]!==after.board[added[0]]||before.board[added[0]])throw Error('Expected one non-capturing piece relocation');
 const from=removed[0],to=added[0],mover=before.board[from],movingSide=side(mover);
 if(before.turn!==movingSide)throw Error('Mover must be side to move');
 const prior=new Set(rays(before.board).map(h=>h.side+':'+h.attacker+':'+h.target));
 return rays(after.board).filter(h=>h.side===movingSide&&h.attacker!==to&&!prior.has(h.side+':'+h.attacker+':'+h.target))
  .map(h=>({kind:'discovered-attack-geometry',side:movingSide,movedFrom:from,movedTo:to,attacker:h.attacker,target:h.target,note:'A friendly move revealed a sliding attack ray; not proof that the move is legal, forcing, or winning.'}))
  .sort((a,b)=>a.attacker.localeCompare(b.attacker)||a.target.localeCompare(b.target));
}
return Object.freeze({discoveredAttackGeometry});
});
