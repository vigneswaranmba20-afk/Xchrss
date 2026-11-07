/* VER Chess: complete move commentary on demand, without sacrificing board space.
 * No external book content, paid AI, invented evals or private game tracking.
 */
(function(){
 'use strict';
 if(window.VERChessFloatingCoach)return;
 function mount(){
  const board=document.getElementById('board');
  if(!board||!board.parentElement)return;
  const note=document.createElement('div');
  note.id='v6CoachNote';
  note.className='v6-coach-note';
  note.setAttribute('role','status');
  note.setAttribute('aria-live','polite');
  note.setAttribute('aria-atomic','true');
  const marker=document.createElement('span');
  marker.className='v6-coach-dot';
  marker.setAttribute('aria-hidden','true');
  marker.textContent='✦';
  const copy=document.createElement('div');
  copy.className='v6-coach-copy';
  const heading=document.createElement('strong'),detail=document.createElement('span');
  copy.append(heading,detail);
  const more=document.createElement('button');
  more.id='v6CoachReadFull';
  more.className='v6-coach-more';
  more.type='button';
  more.textContent='Read full';
  more.setAttribute('aria-label','Read full move commentary');
  more.hidden=true;
  note.append(marker,copy,more);
  board.insertAdjacentElement('afterend',note);

  const dialog=document.createElement('dialog');
  dialog.id='v6CoachDialog';
  dialog.className='v6-coach-dialog';
  dialog.setAttribute('aria-labelledby','v6CoachDialogTitle');
  const title=document.createElement('h2');
  title.id='v6CoachDialogTitle';
  title.textContent='Move commentary';
  const full=document.createElement('p');
  full.id='v6CoachFullText';
  full.className='v6-coach-full';
  const closeX=document.createElement('button');
  closeX.type='button';
  closeX.className='v6-coach-dialog-close';
  closeX.setAttribute('aria-label','Close commentary');
  closeX.textContent='×';
  const close=document.createElement('button');
  close.type='button';
  close.textContent='Back to board';
  dialog.append(closeX,title,full,close);
  document.body.append(dialog);
  closeX.addEventListener('click',()=>dialog.close());
  close.addEventListener('click',()=>dialog.close());
  more.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});

  let lastKey='';
  function update(info){
   const data=info||{};
   const hasReview=Boolean(data.flag)&&data.ply>0&&!data.running;
   const show=hasReview&&['miss','blunder','mistake','inaccuracy','best','strong'].includes(data.flag);
   const raw=String(data.message||'').trim();
   const key=show?[data.ply,data.flag,data.best,data.label,raw].join(':'):'';
   if(key===lastKey)return;
   lastKey=key;
   if(dialog.open)dialog.close();
   if(!show){
    note.classList.remove('is-visible','is-warning','is-positive');
    heading.textContent='';detail.textContent='';
    full.textContent='';
    more.hidden=true;
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
   const titleText=(data.label?data.label+' · ':'')+kind;
   const suggestion=severe&&data.best&&data.best!=='—'?'Stockfish prefers '+data.best+'.':'';
   const explanation=raw||(severe?'The engine found a stronger continuation.':'The engine rated this move favorably at the selected depth.');
   const comment=[suggestion,explanation].filter(Boolean).join('\n\n');
   heading.textContent=titleText;
   detail.textContent=comment.replace(/\s+/g,' ').trim();
   title.textContent=titleText;
   full.textContent=comment;
   more.hidden=false;
   note.classList.toggle('is-warning',severe);
   note.classList.toggle('is-positive',!severe);
   note.classList.remove('is-visible');
   // Subtle visual cue, but commentary remains available until another move.
   void note.offsetWidth;
   note.classList.add('is-visible');
  }
  window.VERChessFloatingCoach={update};
  window.VERChessViewportFit?.refresh?.();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();
