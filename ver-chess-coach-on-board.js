/* VER Chess Intelligence v7 — board-first interactive move commentary.
 * The current PGN and Stockfish evaluations are the only move sources.
 * No invented variants, external animation services, or game-state writes.
 */
(function(){
'use strict';
if(window.VERChessFloatingCoach)return;
const $=id=>document.getElementById(id);
function setup(){
 const board=$('board'),dock=$('v5Dock');
 if(!board||!board.parentElement||!dock)return;
 const originalDock=dock.querySelector('.v5-dock-inner');
 if(!originalDock)return;
 const note=document.createElement('div');
 note.id='v6CoachNote';
 note.className='v6-coach-note';
 note.setAttribute('role','status');
 note.setAttribute('aria-live','polite');
 note.setAttribute('aria-atomic','true');
 const marker=document.createElement('span');
 marker.className='v6-coach-dot'; marker.setAttribute('aria-hidden','true'); marker.textContent='✦';
 const copy=document.createElement('div'); copy.className='v6-coach-copy';
 const heading=document.createElement('strong'),detail=document.createElement('span');
 copy.append(heading,detail);
 const more=document.createElement('button');
 more.id='v6CoachReadFull'; more.className='v6-coach-more';more.type='button';
 more.textContent='Read full';more.setAttribute('aria-label','Explain this move on the chessboard');more.hidden=true;
 note.append(marker,copy,more);
 board.insertAdjacentElement('afterend',note);

 const lesson=document.createElement('section');
 lesson.id='v7CoachLesson';
 lesson.className='v7-coach-lesson';
 lesson.setAttribute('role','region');
 lesson.setAttribute('aria-label','Interactive move explanation');
 lesson.hidden=true;
 lesson.innerHTML=[
   '<div class="v7-lesson-head"><strong id="v7LessonTitle"></strong>',
   '<span id="v7LessonStage" class="v7-lesson-stage" aria-live="polite"></span></div>',
   '<p id="v7LessonFull" class="v7-lesson-full" tabindex="0"></p>',
   '<div class="v7-lesson-actions">',
   '<button id="v7Played" type="button" aria-pressed="false">▶ Played move</button>',
   '<button id="v7Best" type="button" aria-pressed="false">✦ Better move</button>',
   '<button id="v7Before" type="button" aria-pressed="false">↶ Before</button>',
   '<button id="v7Close" type="button">✕ Done</button>',
   '</div>'
 ].join('');
 dock.append(lesson);
 const stage=$('v7LessonStage'),full=$('v7LessonFull'),played=$('v7Played'),
       best=$('v7Best'),before=$('v7Before'),close=$('v7Close'),title=$('v7LessonTitle');
 let lastKey='',lastData=null,active=null,animationTimer=null,previousFocus=null;
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
 const api=()=>window.VERChessLessonAPI;
 function cancelAnimation(){
  if(animationTimer!==null){clearTimeout(animationTimer);animationTimer=null;}
 }
 function clearActivePosition(){
  api()?.restore?.();
 }
 function finish(restore=true){
  if(!active)return;
  cancelAnimation();
  active=null;
  lesson.hidden=true;
  dock.classList.remove('v7-lesson-open');
  document.body.classList.remove('v7-lesson-mode');
  originalDock.hidden=false;
  dock.style.removeProperty('height');
  if(restore)clearActivePosition();
  if(previousFocus?.isConnected&&document.body.getAttribute('data-ver-view')==='board'){
   previousFocus.focus({preventScroll:true});
  }
  previousFocus=null;
  window.VERChessViewportFit?.refresh?.();
 }
 function syncSelected(mode){
  for(const [el,kind] of [[played,'played'],[best,'best'],[before,'before']]){
   el.setAttribute('aria-pressed',String(mode===kind));
  }
 }
 function demonstrate(mode){
  if(!active)return;
  cancelAnimation();
  const context=api()?.context?.(active.ply);
  if(!context){finish(false);return;}
  if(mode==='best'&&(!context.best||context.best.uci===context.played.uci))return;
  active.mode=mode;
  syncSelected(mode);
  stage.textContent=mode==='before'?'Position before the move':
     mode==='best'?'Stockfish alternative: '+context.best.san:'The played move: '+context.played.san;
  if(mode==='before'){
   api()?.show?.(active.ply,'before');
  }else{
   // Render the legal pre-move position first; the retained piece nodes then
   // animate to the real PGN move or legally calculated engine alternative.
   api()?.show?.(active.ply,'before');
   if(reduced())api()?.show?.(active.ply,mode);
   else animationTimer=setTimeout(()=>{
    animationTimer=null;
    if(active&&active.ply===context.ply&&active.mode===mode)api()?.show?.(active.ply,mode);
   },250);
  }
 }
 function start(){
  if(active)return;
  const data=lastData,context=data&&api()?.context?.(data.ply);
  if(!data||!context||data.running||!['board',null].includes(document.body.getAttribute('data-ver-view')))return;
  previousFocus=document.activeElement;
  const dockHeight=dock.getBoundingClientRect().height;
  if(dockHeight<80)return;
  active={ply:data.ply,mode:'played',key:lastKey};
  title.textContent=(data.label||context.label)+' · '+(heading.textContent.split(' · ').slice(-1)[0]||'Move explained');
  full.textContent=String(data.fullComment||data.message||'');
  full.scrollTop=0;
  const alt=context.best&&context.best.uci!==context.played.uci?context.best:null;
  best.hidden=!alt;
  best.textContent=alt?'✦ Better '+alt.san:'✦ Better move';
  played.textContent='▶ Played '+context.played.san;
  // Preserve the original dock's exact footprint. Coach replaces its controls
  // instead of taking space away from any chessboard ranks.
  dock.style.height=Math.ceil(dockHeight)+'px';
  originalDock.hidden=true;
  lesson.hidden=false;
  dock.classList.add('v7-lesson-open');
  document.body.classList.add('v7-lesson-mode');
  demonstrate('played');
  played.focus({preventScroll:true});
 }
 played.addEventListener('click',()=>demonstrate('played'));
 best.addEventListener('click',()=>demonstrate('best'));
 before.addEventListener('click',()=>demonstrate('before'));
 close.addEventListener('click',()=>finish());
 more.addEventListener('click',start);
 document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Escape'){e.preventDefault();finish();}
 });
 $('flipBtn')?.addEventListener('click',()=>{
  if(!active)return;
  // The original Flip control repaints the current PGN position; re-apply the
  // active lesson preview after the orientation changes.
  requestAnimationFrame(()=>{
   if(active)demonstrate(active.mode);
  });
 });
 const viewObserver=new MutationObserver(()=>{
  if(active&&document.body.getAttribute('data-ver-view')!=='board')finish();
 });
 viewObserver.observe(document.body,{attributes:true,attributeFilter:['data-ver-view']});
 function update(info){
  const data=info||{};
  const hasReview=Boolean(data.flag)&&data.ply>0&&!data.running;
  const show=hasReview&&['miss','blunder','mistake','inaccuracy','best','strong'].includes(data.flag);
  const raw=String(data.message||'').trim();
  const key=show?[data.ply,data.flag,data.best,data.label,raw].join(':'):'';
  if(active&&(key!==active.key||!show))finish(false);
  if(key===lastKey)return;
  lastKey=key;
  if(!show){
   note.classList.remove('is-visible','is-warning','is-positive');
   heading.textContent='';detail.textContent='';
   more.hidden=true;lastData=null;
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
  const suggestion=severe&&data.best&&data.best!=='—'?'Stockfish prefers '+data.best+'.':'';
  const explanation=raw||(severe?'The engine found a stronger continuation.':'The engine rated this move favorably at the selected depth.');
  const complete=[suggestion,explanation].filter(Boolean).join('\n\n');
  lastData={...data,fullComment:complete};
  heading.textContent=(data.label?data.label+' · ':'')+kind;
  detail.textContent=complete.replace(/\s+/g,' ').trim();
  more.hidden=false;
  note.classList.toggle('is-warning',severe);
  note.classList.toggle('is-positive',!severe);
  note.classList.remove('is-visible');
  void note.offsetWidth;
  note.classList.add('is-visible');
 }
 window.VERChessFloatingCoach={update,closeLesson:()=>finish()};
 window.VERChessViewportFit?.refresh?.();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
else setup();
})();
