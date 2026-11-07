/* VER Chess v6.1 — thumb dock and frictionless mobile review controls.
 * Original code: preserve Stockfish, navigation logic, PGN imports and PWA.
 */
(function(){
'use strict';
if(window.VERChessTouchUI)return;
const $=id=>document.getElementById(id);
const board=$('board'),prev=$('backBtn'),next=$('nextBtn'),run=$('analyzeBtn');
if(!board||!prev||!next||!run)return;
const badge=$('boardReviewStatus');
// A critical-move explanation must not push the actual chessboard down
// by 100px before a user can start reviewing.
if(badge && badge.previousElementSibling===null && badge.parentElement===board.parentElement){
 board.insertAdjacentElement('afterend',badge);
}
const dock=document.createElement('div');
dock.id='v5Dock';dock.className='v5-dock';dock.dataset.reviewUiVersion='6.1';
dock.setAttribute('aria-label','Review controls');
dock.innerHTML=[
 '<div class="v5-dock-inner">',
 ' <div class="v5-dock-row">',
 '  <button type="button" class="v5-thumb" id="v5Previous" aria-label="Previous chess move"><span aria-hidden="true">◀</span> Previous</button>',
 '  <button type="button" class="v5-dock-reset" id="v5Reset" aria-label="Reset board to the starting position"><span aria-hidden="true">↺</span><strong>Reset board</strong></button>',
 '  <button type="button" class="v5-thumb" id="v5Next" aria-label="Next chess move">Next <span aria-hidden="true">▶</span></button>',
 ' </div>',
 ' <div class="v5-dock-actions">',
 '  <div class="v5-dock-scrub"><input type="range" id="v5Scrubber" min="0" max="1" value="0" step="1" aria-label="Choose move position" /><span id="v5MoveNumber" aria-live="polite">0 / 0</span></div>',
 '  <button type="button" id="v5Analyze" class="v5-dock-analyze">✦ Analyse</button>',
 ' </div>',
 '</div>'
].join('');
document.body.append(dock);
const controller=()=>window.VERChessReviewControls;
const moveTo=ply=>{const r=controller();if(r?.jumpTo)r.jumpTo(ply);};
$('v5Previous').addEventListener('click',()=>prev.click());
$('v5Next').addEventListener('click',()=>next.click());
$('v5Reset').addEventListener('click',()=>{if(!$('v5Reset').disabled)moveTo(0);});
$('v5Analyze').addEventListener('click',()=>{
 if(run.disabled)return;
 run.click();
});
$('v5Scrubber').addEventListener('input',e=>{
 const ply=Number(e.target.value);
 if(Number.isSafeInteger(ply))moveTo(ply);
});
let startTouch=null;
board.addEventListener('touchstart',e=>{
 if(e.touches?.length!==1){startTouch=null;return;}
 const t=e.touches[0];startTouch={x:t.clientX,y:t.clientY};
},{passive:true});
board.addEventListener('touchend',e=>{
 if(!startTouch||!e.changedTouches?.length)return;
 const t=e.changedTouches[0];
 const dx=t.clientX-startTouch.x,dy=t.clientY-startTouch.y;
 startTouch=null;
 if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.4)return;
 // Swipe left explores the next move; swipe right goes back.
 if(dx<0)next.click();else prev.click();
},{passive:true});
board.addEventListener('touchcancel',()=>{startTouch=null;},{passive:true});
const enginePanel=document.querySelector('aside.right #analyzeBtn')?.closest('.panel');
if(enginePanel){
 const note=document.createElement('p');
 note.className='hint v5-reviewhint';
 note.textContent='Set your analysis strength here, then start from the Board tab using the golden Analyse button.';
 const el=enginePanel.querySelector('.body');
 if(el)el.append(note);
}
function sync(details){
 const info=details||controller()?.state?.()||{at:0,total:0,running:false};
 const at=Math.max(0,Math.round(Number(info.at)||0));
 const total=Math.max(0,Math.round(Number(info.total)||0));
 const busy=Boolean(info.running);
 $('v5MoveNumber').textContent=at+' / '+total;
 $('v5Scrubber').max=String(Math.max(1,total));
 $('v5Scrubber').value=String(Math.min(at,Math.max(1,total)));
 $('v5Scrubber').disabled=busy||total===0;
 $('v5Previous').disabled=busy||at===0;
 $('v5Reset').disabled=busy||at===0||total===0;
 $('v5Next').disabled=busy||at>=total;
 $('v5Analyze').disabled=busy||run.disabled||total===0;
 $('v5Analyze').textContent=busy?'Analysing…':'✦ Analyse';
}
window.VERChessTouchUI={version:'6.1',sync};
sync();
})();
