/* VER Chess SmoothBoard v5 — original, dependency-free board renderer.
 * Retained square DOM and retained piece DOM: no reloading SVGs on every move.
 * Works with existing legal PGN replay, Stockfish and arrow generator.
 * Bundled art remains © Colin M. L. Burnett (GPLv2+); see COPYRIGHT.md.
 */
(function(){
'use strict';
const instances=new WeakMap();
const files='abcdefgh';
const squareName=i=>files[i&7]+(8-(i>>4));
const valid=i=>i>=0&&i<128&&!(i&0x88);
const colorCode=p=>p==='.'?'':((p===p.toUpperCase())?'w':'b')+p.toUpperCase();
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
class SmoothBoard {
 constructor(root){
  this.root=root;this.nodes=[];this.cells=[];this.orientation=null;
  root.classList.add('v5-smooth-board');
  const fragment=document.createDocumentFragment();
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
   const cell=document.createElement('div');
   cell.className='sq v5-square '+((row+col)%2===0?'light':'dark');
   cell.setAttribute('aria-hidden','true');
   if(col===0){const rank=document.createElement('span');rank.className='v5-coord v5-rank';cell.append(rank);}
   if(row===7){const file=document.createElement('span');file.className='v5-coord v5-file';cell.append(file);}
   this.cells.push(cell);fragment.append(cell);
  }
  this.layer=document.createElement('div');
  this.layer.className='v5-piece-layer';
  this.layer.setAttribute('aria-hidden','true');
  fragment.append(this.layer);
  this.svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  this.svg.classList.add('board-arrows','v5-board-arrows');
  this.svg.setAttribute('viewBox','0 0 800 800');
  this.svg.setAttribute('preserveAspectRatio','none');
  this.svg.setAttribute('aria-hidden','true');
  fragment.append(this.svg);
  root.replaceChildren(fragment);
 }
 coords(i,flipped){
  const rank=i>>4,file=i&7;
  return flipped?{row:7-rank,col:7-file}:{row:rank,col:file};
 }
 place(el,i,flipped,animate){
  const {row,col}=this.coords(i,flipped);
  const next='translate3d('+(col*100)+'%,'+(row*100)+'%,0)';
  if(el.style.transform===next)return;
  if(animate)el.style.transform=next;
  else {
   el.style.transition='none';
   el.style.transform=next;
   // Restore default transitions after layout, no motion on flip / initial import.
   requestAnimationFrame(()=>{if(el.isConnected)el.style.transition='';});
  }
 }
 newPiece(code,i,flipped){
  const el=document.createElement('div');
  el.className='v5-piece';
  el.setAttribute('aria-hidden','true');
  el.dataset.piece=code;
  // The following HTML comes exclusively from the checked, locally bundled
  // twelve-piece SVG dictionary, never from user PGNs or remote game data.
  const source=window.VERChessPieceArt?.[code];
  if(source){
   el.innerHTML=source;
   const svg=el.firstElementChild;
   if(svg){svg.setAttribute('focusable','false');svg.setAttribute('aria-hidden','true');}
  }else{
   el.textContent=({wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'})[code]||'';
   el.classList.add('v5-fallback');
  }
  this.place(el,i,flipped,false);
  this.layer.append(el);
  return {el,code,square:i};
 }
 render({state,flipped=false,focusSquares=[],arrows=''}){
  if(!state||!Array.isArray(state.b))return;
  const rotate=this.orientation!==null&&this.orientation!==flipped;
  if(rotate)this.root.classList.add('v5-reorienting');
  const highlights=new Set(focusSquares);
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
   const actual=flipped?(7-row)*16+(7-col):row*16+col;
   const cell=this.cells[row*8+col],piece=state.b[actual],notation=squareName(actual);
   cell.classList.toggle('last',highlights.has(notation));
   cell.setAttribute('aria-label',notation+' '+(piece==='.'?'empty':piece));
   const rank=cell.querySelector('.v5-rank');
   const file=cell.querySelector('.v5-file');
   if(rank)rank.textContent=notation[1];
   if(file)file.textContent=notation[0];
  }
  const targets=[];
  for(let i=0;i<128;i++)if(valid(i)&&state.b[i]!=='.')targets.push({code:colorCode(state.b[i]),square:i});
  // Preserve piece identity on the same square, then match any moved piece by type
  // and shortest distance. This avoids tearing down all SVGs on each navigation step.
  const used=new Set(),assignments=[];
  for(const target of targets){
   let match=this.nodes.find(n=>!used.has(n)&&n.code===target.code&&n.square===target.square);
   if(match){used.add(match);assignments.push({target,node:match});}
   else assignments.push({target,node:null});
  }
  for(const entry of assignments)if(!entry.node){
   const choices=this.nodes.filter(n=>!used.has(n)&&n.code===entry.target.code);
   choices.sort((a,b)=>{
    const dist=n=>Math.abs((n.square&7)-(entry.target.square&7))+Math.abs((n.square>>4)-(entry.target.square>>4));
    return dist(a)-dist(b);
   });
   const matched=choices[0];
   if(matched){entry.node=matched;used.add(matched);}
  }
  const updated=[];
  const animate=!rotate&&!reduced()&&this.orientation!==null;
  for(const entry of assignments){
   let n=entry.node;
   if(!n)n=this.newPiece(entry.target.code,entry.target.square,flipped);
   else this.place(n.el,entry.target.square,flipped,animate);
   n.square=entry.target.square;
   updated.push(n);
  }
  for(const n of this.nodes)if(!used.has(n)){
   if(animate){
    n.el.classList.add('v5-exit');
    setTimeout(()=>n.el.remove(),145);
   }else n.el.remove();
  }
  this.nodes=updated;
  this.orientation=flipped;
  // Update only the SVG arrow overlay; its DOM is separate from the pieces.
  if(this.lastArrows!==arrows){this.svg.innerHTML=arrows;this.lastArrows=arrows;}
  if(rotate)requestAnimationFrame(()=>this.root.classList.remove('v5-reorienting'));
 }
}
window.VERChessSmoothBoard={
 version:'5.0',
 render(root,props){
  if(!instances.has(root))instances.set(root,new SmoothBoard(root));
  instances.get(root).render(props);
 },
};
})();
