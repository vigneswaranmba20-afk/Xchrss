/* VER Chess v6.1 — reliable full-board fit for Android Chrome + PWA.
 * Fixes v6 feedback loop: never measure the board's own flex-height to size itself.
 * Instead reserve the REAL viewport space between the navigation and fixed dock.
 */
(function(){
 'use strict';
 if(window.VERChessViewportFit)return;
 const $=id=>document.getElementById(id);
 function setup(){
  const board=$('board'),wrap=document.querySelector('.board-wrap');
  const nav=document.querySelector('.verv4-appnav'),dock=$('v5Dock');
  const title=document.querySelector('.game-title'),flip=$('flipBtn');
  const footer=document.querySelector('body[data-ver-view="board"] .board-footer')||document.querySelector('.board-footer');
  if(!board||!wrap||!nav||!dock||!title||!flip)return;

  // Move the existing wired Flip button, not a duplicate. Theme stays beside it.
  let actions=title.querySelector('.v6-board-title-actions');
  if(!actions){
   actions=document.createElement('div');
   actions.className='v6-board-title-actions';
   actions.setAttribute('aria-label','Board preferences');
   title.append(actions);
  }
  flip.textContent='↕ Flip';
  flip.setAttribute('aria-label','Flip chessboard orientation');
  actions.append(flip);
  const theme=$('verThemeTrigger');
  if(theme)actions.append(theme);

  let scheduled=false,previousKey='';
  function fit(){
   scheduled=false;
   const mobile=window.matchMedia('(max-width: 850px)').matches;
   const visible=document.body.getAttribute('data-ver-view')==='board';
   if(!mobile||!visible){
    if(previousKey){
     ['width','height','flex'].forEach(key=>board.style.removeProperty(key));
     ['--v7-nav-bottom','--v7-stage-height','--v7-board-size'].forEach(key=>document.documentElement.style.removeProperty(key));
     previousKey='';
    }
    return;
   }

   // Rectangle measurements are independent of the board size and do not
   // create a shrink-on-resize feedback loop through wrap.clientHeight.
   const viewportH=Math.floor(window.visualViewport?.height||window.innerHeight);
   const navBottom=Math.ceil(nav.getBoundingClientRect().bottom+5);
   const dockTop=Math.floor(dock.getBoundingClientRect().top-5);
   const spaceBetween=Math.min(viewportH-navBottom-8,dockTop-navBottom);
   const stageHeight=Math.max(0,spaceBetween);
   const titleHeight=Math.ceil(title.getBoundingClientRect().height)||48;
   const footerHeight=footer&&getComputedStyle(footer).display!=='none'
    ?Math.ceil(footer.getBoundingClientRect().height):0;
   const note=$('v6CoachNote');
   const noteHeight=note?Math.ceil(note.getBoundingClientRect().height)||46:0;
   const boardSpace=Math.max(0,stageHeight-titleHeight-footerHeight-noteHeight-16);
   const width=Math.max(0,Math.min(
    wrap.getBoundingClientRect().width||window.innerWidth-18,
    window.innerWidth-18
   ));
   const size=Math.floor(Math.max(0,Math.min(boardSpace,width,680)));
   // Never replace a visible board with a tiny square when the browser is in a
   // transient zero-height layout state (e.g. Chrome address bar animation).
   if(size<80)return;
   const key=[size,navBottom,stageHeight].join(':');
   if(key===previousKey)return;
   previousKey=key;
   const style=document.documentElement.style;
   style.setProperty('--v7-nav-bottom',navBottom+'px');
   style.setProperty('--v7-stage-height',stageHeight+'px');
   style.setProperty('--v7-board-size',size+'px');
   board.style.setProperty('width',size+'px','important');
   board.style.setProperty('height',size+'px','important');
   board.style.setProperty('flex','0 0 '+size+'px','important');
  }
  function schedule(){
   if(scheduled)return;
   scheduled=true;
   requestAnimationFrame(fit);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  if(window.visualViewport){
   window.visualViewport.addEventListener('resize',schedule,{passive:true});
   window.visualViewport.addEventListener('scroll',schedule,{passive:true});
  }
  const mutation=new MutationObserver(mutations=>{
   if(mutations.some(x=>x.attributeName==='data-ver-view'))schedule();
  });
  mutation.observe(document.body,{attributes:true,attributeFilter:['data-ver-view']});
  if(typeof ResizeObserver!=='undefined'){
   const observer=new ResizeObserver(schedule);
   // Only non-self-referential geometry. DO NOT observe the board or board-wrap.
   observer.observe(nav);observer.observe(dock);observer.observe(title);
  }
  window.VERChessViewportFit={version:'6.1',fitNow:fit,refresh:schedule};
  // Wait for fixed dock and theme header to settle after initial loading.
  schedule();
  requestAnimationFrame(schedule);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})();