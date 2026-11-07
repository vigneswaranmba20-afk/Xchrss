/* VER Chess v6: responsive single-screen mobile board.
 * Custom code: visualViewport + stable board sizing; no new runtime packages.
 * Keeps 64-square SmoothBoard, local engine and theme preferences unchanged.
 */
(function(){
 'use strict';
 if(window.VERChessViewportFit)return;
 const $=id=>document.getElementById(id);
 function setup(){
  const board=$('board');
  const wrap=document.querySelector('.board-wrap');
  const nav=document.querySelector('.verv4-appnav');
  const dock=$('v5Dock');
  const title=document.querySelector('.game-title');
  const flip=$('flipBtn');
  if(!board||!wrap||!nav||!dock||!title||!flip)return;
  // Reuse the actual existing Flip control and listener; do not make a copy.
  const actions=document.createElement('div');
  actions.className='v6-board-title-actions';
  actions.setAttribute('aria-label','Board preferences');
  title.append(actions);
  flip.textContent='↕ Flip';
  flip.setAttribute('aria-label','Flip chessboard orientation');
  actions.append(flip);
  const theme=$('verThemeTrigger');
  if(theme)actions.append(theme);
  let queued=false,previous=-1;
  function fit(){
   queued=false;
   const mobile=window.matchMedia('(max-width: 850px)').matches;
   const onBoard=document.body.getAttribute('data-ver-view')==='board';
   if(!mobile||!onBoard){
    if(previous!==-1){
     board.style.removeProperty('width');
     board.style.removeProperty('height');
     board.style.removeProperty('flex');
     previous=-1;
    }
    return;
   }
   const vh=Math.max(280,Math.floor(window.visualViewport?.height||window.innerHeight));
   const navBottom=Math.max(0,Math.ceil(nav.getBoundingClientRect().bottom+4));
   const dockHeight=Math.max(0,Math.ceil(dock.getBoundingClientRect().height+5));
   const root=document.documentElement.style;
   root.setProperty('--v6-visible-height',vh+'px');
   root.setProperty('--v6-nav-bottom',navBottom+'px');
   root.setProperty('--v6-dock-height',dockHeight+'px');
   const note=$('v6CoachNote');
   const remainingHeight=wrap.clientHeight-(note?note.offsetHeight:0)-12;
   const remainingWidth=wrap.clientWidth-2;
   const size=Math.floor(Math.max(100,Math.min(remainingHeight,remainingWidth,680)));
   if(size===previous)return;
   previous=size;
   board.style.setProperty('width',size+'px','important');
   board.style.setProperty('height',size+'px','important');
   board.style.setProperty('flex','0 0 '+size+'px','important');
  }
  function schedule(){
   if(queued)return;
   queued=true;
   requestAnimationFrame(fit);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  if(window.visualViewport){
   window.visualViewport.addEventListener('resize',schedule,{passive:true});
   window.visualViewport.addEventListener('scroll',schedule,{passive:true});
  }
  const observer=new MutationObserver(mutations=>{
   if(mutations.some(m=>m.attributeName==='data-ver-view'))schedule();
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['data-ver-view']});
  if(typeof ResizeObserver!=='undefined'){
   const ro=new ResizeObserver(()=>schedule());
   ro.observe(wrap);ro.observe(nav);ro.observe(dock);
  }
  window.VERChessViewportFit={refresh:schedule,fitNow:fit};
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})();