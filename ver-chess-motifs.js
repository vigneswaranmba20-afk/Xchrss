/* VER Chess v7.2: pure geometric motif observations, not engine accuracy. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.VERChessMotifs=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
'use strict';
const files='abcdefgh';
function parseFen(fen){
  if(typeof fen!=='string')throw Error('FEN must be a string');
  const fields=fen.trim().split(/\s+/);
  if(fields.length<2||!['w','b'].includes(fields[1]))throw Error('Invalid FEN side');
  const rows=fields[0].split('/');
  if(rows.length!==8)throw Error('Invalid FEN rows');
  const board={};
  rows.forEach((row,ri)=>{
    let col=0;
    for(const ch of row){
      if(/[1-8]/.test(ch))col+=Number(ch);
      else if(/[pnbrqkPNBRQK]/.test(ch)){
        if(col>=8)throw Error('Invalid FEN row width');
        board[files[col]+(8-ri)]=ch;col++;
      }else throw Error('Invalid FEN piece');
    }
    if(col!==8)throw Error('Invalid FEN row width');
  });
  if(Object.values(board).filter(x=>x==='K').length!==1||Object.values(board).filter(x=>x==='k').length!==1)throw Error('FEN must have one king per side');
  return {board,turn:fields[1]};
}
function coord(s){return [files.indexOf(s[0]),Number(s[1])-1];}
function square(x,y){return files[x]+(y+1);}
function inside(x,y){return x>=0&&x<8&&y>=0&&y<8;}
function side(p){return p===p.toUpperCase()?'w':'b';}
function knightForks(fen){
  const {board}=parseFen(fen),found=[];
  const offsets=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
  for(const [from,piece] of Object.entries(board)){
    if(piece.toLowerCase()!=='n')continue;
    const [x,y]=coord(from);
    const targets=offsets.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>inside(a,b)).map(([a,b])=>square(a,b)).filter(to=>board[to]&&side(board[to])!==side(piece));
    if(targets.length>=2)found.push({kind:'knight-fork-geometry',side:side(piece),from,targets:targets.sort(),note:'Attacks two or more opposing pieces; not proof of material gain or a forced tactic.'});
  }
  return found;
}
function absolutePins(fen){
  const {board}=parseFen(fen),found=[];
  const directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const [from,piece] of Object.entries(board)){
    if(!/[brq]/i.test(piece))continue;
    const [x,y]=coord(from);
    for(const [dx,dy] of directions){
      const straight=dx===0||dy===0;
      if((straight&&!/[rq]/i.test(piece))||(!straight&&!/[bq]/i.test(piece)))continue;
      let candidate=null;
      for(let a=x+dx,b=y+dy;inside(a,b);a+=dx,b+=dy){
        const at=square(a,b),target=board[at];
        if(!target)continue;
        if(side(target)===side(piece))break;
        if(candidate===null){if(target.toLowerCase()==='k')break;candidate=at;continue;}
        if(target.toLowerCase()==='k')found.push({kind:'absolute-pin',side:side(piece),attacker:from,pinned:candidate,king:at,note:'Geometric absolute pin: moving the interposed piece off this ray would expose its king.'});
        break;
      }
    }
  }
  return found;
}
return Object.freeze({parseFen,knightForks,absolutePins});
});
