/* VER Chess v7.3: geometrical king skewers only; not proof of a winning tactic. */
(function(root,factory){
  const motifs=typeof module==='object'&&module.exports?require('./ver-chess-motifs.js'):root&&root.VERChessMotifs;
  const api=factory(motifs);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.VERChessSkewers=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(motifs){
'use strict';
if(!motifs||typeof motifs.parseFen!=='function')throw Error('VERChessMotifs must load before VERChessSkewers');
const files='abcdefgh';
const directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function ownSide(piece){return piece===piece.toUpperCase()?'w':'b';}
function skewerGeometry(fen){
  const {board}=motifs.parseFen(fen),hits=[];
  for(const [from,piece] of Object.entries(board)){
    if(!/[brq]/i.test(piece))continue;
    const side=ownSide(piece),x=files.indexOf(from[0]),y=Number(from[1])-1;
    for(const [dx,dy] of directions){
      const straight=dx===0||dy===0;
      if(straight&&!/[rq]/i.test(piece)||!straight&&!/[bq]/i.test(piece))continue;
      let king=null;
      for(let a=x+dx,b=y+dy;a>=0&&a<8&&b>=0&&b<8;a+=dx,b+=dy){
        const at=files[a]+(b+1),target=board[at];
        if(!target)continue;
        if(ownSide(target)===side)break;
        if(king===null){
          if(target.toLowerCase()!=='k')break;
          king=at;
          continue;
        }
        // A second enemy piece behind the king creates a geometric skewer.
        if(target.toLowerCase()!=='k')hits.push({kind:'king-skewer-geometry',side,attacker:from,king,behind:at,note:'King and piece align on an attack ray; not proof of a legal move, forced continuation or material gain.'});
        break;
      }
    }
  }
  return hits.sort((a,b)=>a.attacker.localeCompare(b.attacker)||a.king.localeCompare(b.king)||a.behind.localeCompare(b.behind));
}
return Object.freeze({skewerGeometry});
});
