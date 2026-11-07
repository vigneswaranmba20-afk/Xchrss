/* VER Chess v6: compact floating coaching comments from EXISTING Stockfish grades.
 * No external book content, paid AI, invented evals or private game tracking.
 */
(function(){
 'use strict';
 if(window.VERChessFloatingCoach)return;
 function mount(){
  const board=document.getElementById('board');
  if(!board||!board.parentElement)return;
  const wrap=board.parentElement;
  const note=document.createElement('div');
  note.id='v6CoachNote';
  note.className='v6-coach-note';
  note.setAttribute('role','status');
  note.setAttribute('aria-live','polite');
  note.setAttribute('aria-atomic','true');
  const marker=document.createElement('span');
  marker.className='v6-coach-dot';marker.setAttribute('aria-hidden','true');
  marker.textContent='✦';
  const copy=document.createElement('div');
  copy.className='v6-coach-copy';
  const heading=document.createElement('strong'),detail=document.createElement('span');
  copy.append(heading,detail);
  note.append(marker,copy);
  board.insertAdjacentElement('afterend',note);
  let lastKey='',hideTimer=null;
  function update(info){
   const data=info||{};
   const hasReview=Boolean(data.flag)&&data.ply>0&&!data.running;
   const show=hasReview&&['miss','blunder','mistake','inaccuracy','best','strong'].includes(data.flag);
   const key=show?[data.ply,data.flag,data.best].join(':'):'';
   if(key===lastKey)return;
   lastKey=key;
   if(hideTimer){clearTimeout(hideTimer);hideTimer=null;}
   if(!show){
    note.classList.remove('is-visible','is-warning','is-positive');
    heading.textContent='';detail.textContent='';
    return;
   }
   const severe=['miss','blunder','mistake','inaccuracy'].includes(data.flag);
   const kind={
    miss:'Missed chance',
    blunder:'A better move was available',
    mistake:'Worth reviewing',
    inaccuracy:'Small improvement',
    best:'Excellent choice',
    strong:'Strong move'
   }[data.flag]||'Move reviewed';
   heading.textContent=(data.label?data.label+' · ':'')+kind;
   if(severe){
    const suggestion=data.best&&data.best!=='—'?'Stockfish prefers '+data.best+'. ':'';
    const raw=String(data.message||'');
    const brief=raw.length>105?raw.slice(0,102).trimEnd()+'…':raw;
    detail.textContent=suggestion+brief;
   }else{
    detail.textContent=data.best&&data.flag==='best'?'You matched Stockfish’s recommendation.':'The engine rated this move favorably at the selected depth.';
   }
   note.classList.toggle('is-warning',severe);
   note.classList.toggle('is-positive',!severe);
   note.classList.remove('is-visible');
   // Restart the subtle entrance without moving or covering the chessboard.
   void note.offsetWidth;
   note.classList.add('is-visible');
   hideTimer=setTimeout(()=>{note.classList.remove('is-visible');},7500);
  }
  window.VERChessFloatingCoach={update};
  window.VERChessViewportFit?.refresh?.();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();