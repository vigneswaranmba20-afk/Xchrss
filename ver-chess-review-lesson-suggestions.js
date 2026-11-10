/* v7.4 optional, read-only exact-position lesson suggestions.
 * A match is not a tactic evaluation or a promise of winning material. */
(function(){
'use strict';
const review=window.VERChessReviewControls, index=window.VERChessGameLessonIndex;
if(!review||!index||!document.querySelector('.verv4-appnav'))return;
const lessons=Object.freeze([
 Object.freeze({id:'fork',name:'Knight fork',fen:'3q3k/8/8/4N3/8/8/8/K7 w - - 0 1'}),
 Object.freeze({id:'pin',name:'Absolute pin',fen:'6k1/5n2/8/8/8/8/4B3/K7 w - - 0 1'})
]);
const host=document.createElement('section');
host.id='verReviewLessonSuggestions';
host.setAttribute('aria-label','Lessons matching reviewed positions');
host.style.cssText='margin:12px 0;padding:12px;border:1px solid #547663;border-radius:12px;background:#142a24;color:#eaf2e7';
const heading=document.createElement('strong');
heading.textContent='Lessons from this game';
const note=document.createElement('p');
note.style.cssText='font-size:12px;margin:5px 0 10px;color:#bdcdb8';
note.textContent='Exact board-position matches only. This does not detect a winning tactic or measure accuracy.';
const results=document.createElement('div');
results.id='verReviewLessonResults';
results.setAttribute('aria-live','polite');
host.append(heading,note,results);
// The mobile Board is a fixed, clipped stage. Extra siblings there create
// scrollable overflow and can displace ranks when the coach receives focus.
// Keep recommendations in the scrollable Insights view instead.
const insights=document.querySelector('.main > .right');
if(!insights)return;
insights.prepend(host);
function syncView(){
 host.hidden=document.body.getAttribute('data-ver-view')!=='insights';
 if(!host.hidden)render();
}
const viewObserver=new MutationObserver(syncView);
viewObserver.observe(document.body,{attributes:true,attributeFilter:['data-ver-view']});
syncView();
function render(){
 const fens=review.positionFens();
 const matches=index.findLessonMoments(fens,lessons);
 results.replaceChildren();
 if(!matches.length){
  const p=document.createElement('p');
  p.textContent='No exact lesson positions in this game yet. Explore Learn for guided examples.';
  p.style.cssText='font-size:12px;margin:0;color:#bdcdb8';
  results.append(p);
  return;
 }
 for(const match of matches){
  for(const lesson of match.lessons){
   const button=document.createElement('button');
   button.type='button';
   button.textContent=lesson.name+' · position '+match.ply+' → Learn';
   button.style.cssText='display:block;width:100%;min-height:44px;margin:6px 0;padding:10px;border-radius:9px;border:1px solid #dfbf77;background:#284337;color:#f4e7c5;text-align:left';
   button.addEventListener('click',()=>{
    const tab=document.querySelector('[data-ver-nav="learn"]');
    tab?.click();
    document.querySelector('#verLearnChoices [data-lesson="'+lesson.id+'"]')?.click();
   });
   results.append(button);
  }
 }
}
render();
document.addEventListener('click',event=>{
 if(event.target.closest('#verGameSelect, #gameSelect, #loadPgnBtn, #verv4GamesPanel, #verv4AppNav'))setTimeout(render,0);
});
window.VERChessReviewLessonSuggestions=Object.freeze({refresh:render});
})();
