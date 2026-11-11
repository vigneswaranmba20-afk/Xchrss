/* A small, isolated lesson player. Shares the existing legal rules and renderer. */
(function(){
'use strict';
const content=window.VERChessCombinationContent,rules=window.VERChessLessonRules;
const host=document.getElementById('verLearnPanel'),catalog=document.getElementById('verLearnChoices');
if(!content||!rules||!host||!catalog||window.VERChessCombination)return;
const $=id=>document.getElementById(id),stages=['Observe','Discover','Animate','Explain','Practice','Review'];
const card=document.createElement('button');card.type='button';card.className='ver-learn-choice';card.dataset.lesson=content.id;
card.innerHTML='<span class="ver-learn-choice-symbol" aria-hidden="true">♖</span><span class="ver-learn-choice-copy"><strong>Lure, then fork</strong><small>A rook lure creates a forcing knight fork.</small></span><span aria-hidden="true">↗</span>';
catalog.append(card);
const player=document.createElement('section');player.id='verComboPlayer';player.className='ver-learn-player ver-combo';player.hidden=true;
player.setAttribute('aria-label','Lure, then fork combination lesson');
player.innerHTML=`
 <div class="ver-combo-head"><h2>Lure, then fork</h2><button id="verComboFlip" type="button" aria-label="Flip combination board">Flip</button><button id="verComboExit" type="button">Exit</button></div>
 <div class="ver-combo-progress" aria-live="polite" aria-atomic="true"><strong id="verComboStage"></strong><span id="verComboProgress"></span></div>
 <div class="ver-combo-position"><div id="verComboBoard" class="board ver-learn-board" role="group" aria-label="Combination position" aria-describedby="verComboText"></div><small id="verComboPosition" aria-live="polite"></small></div>
 <div class="ver-combo-copy"><p id="verComboText"></p><p id="verComboFeedback" role="status" aria-live="polite" hidden></p>
 <details id="verComboMore" hidden><summary>Why this works</summary><p id="verComboDetail"></p><label id="verComboDefenseLabel" for="verComboDefense">Black’s defense after Nf7+<select id="verComboDefense"><option value="kh7">2…Kh7</option><option value="kg8">2…Kg8</option></select></label></details></div>
 <div class="ver-combo-playback" id="verComboPlayback"><button id="verComboPrevious" type="button" aria-label="Previous combination move">Previous</button><button id="verComboPlay" type="button">Play</button><button id="verComboMoveNext" type="button" aria-label="Next combination move">Next move</button><button id="verComboReplay" type="button">Replay</button></div>
 <div class="ver-combo-actions"><button id="verComboBack" type="button">Back</button><button id="verComboNext" type="button" aria-describedby="verComboText">Next</button></div>`;
$('verLearnPlayer').insertAdjacentElement('afterend',player);
const board=$('verComboBoard'),slot=board.parentElement,files='abcdefgh';
let active=false,stage=0,ply=0,line=null,defense='kh7',flipped=false,selected=null,feedback='',solved=false;
let playing=false,busy=false,stageGuard=false,generation=0,drag=null,ghost=null,focusSquare='a8',fitFrame=null;
const timers=new Set(),reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function schedule(fn,ms){
 const epoch=generation;
 const timer=setTimeout(()=>{timers.delete(timer);if(active&&epoch===generation&&!document.hidden)fn();},ms);
 timers.add(timer);return timer;
}
function clearDrag(){
 const pointer=drag;drag=null;
 if(pointer&&board.hasPointerCapture?.(pointer.id))board.releasePointerCapture(pointer.id);
 ghost?.remove();ghost=null;board.classList.remove('ver-learn-dragging');
}
function cancel(){generation++;for(const t of timers)clearTimeout(t);timers.clear();playing=false;busy=false;stageGuard=false;clearDrag();}
function fit(){
 fitFrame=null;if(!active)return;
 const nav=document.querySelector('.verv4-appnav').getBoundingClientRect();
 const top=Math.max(8,Math.ceil(nav.bottom)+8);
 const height=Math.max(260,Math.floor((window.visualViewport?.height||innerHeight)-top-8));
 player.style.top=top+'px';player.style.height=height+'px';
 const size=Math.max(1,Math.floor(Math.min(slot.clientWidth,slot.clientHeight-20)));
 board.style.setProperty('width',size+'px','important');board.style.setProperty('height',size+'px','important');
}
function fitSoon(){if(fitFrame===null)fitFrame=requestAnimationFrame(fit);}
new ResizeObserver(fitSoon).observe(slot);
window.addEventListener('resize',fitSoon,{passive:true});window.visualViewport?.addEventListener('resize',fitSoon,{passive:true});
function canMove(){return active&&!busy&&!playing&&(stage===1||stage===4)&&ply%2===0&&ply<5;}
function point(square){const i=rules.idx(square),r=i>>4,c=i&7;return [(flipped?7-c:c)*100+50,(flipped?7-r:r)*100+50];}
function arrow(from,to){
 const a=point(from),b=point(to),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),x=dx/length,y=dy/length;
 const end=[b[0]-x*38,b[1]-y*38],start=[b[0]-x*Math.min(length-30,180),b[1]-y*Math.min(length-30,180)];
 const base=[end[0]-x*20,end[1]-y*20];
 return '<path d="M '+start.join(' ')+' L '+base.join(' ')+'" fill="none" stroke="#0b8a69" stroke-width="9" stroke-linecap="round" opacity=".75"/><path d="M '+(base[0]-y*12)+' '+(base[1]+x*12)+' L '+end.join(' ')+' L '+(base[0]+y*12)+' '+(base[1]-x*12)+' Z" fill="#0b8a69" opacity=".8"/>';
}
function paint(instant=false){
 if(!active)return;
 const state=line.states[ply],last=line.plies[ply-1];
 let highlights=last?[last.uci.slice(0,2),last.uci.slice(2,4)]:[],arrows='';
 if(ply===3){highlights=['f7','h8','d8'];arrows=arrow('f7','h8')+arrow('f7','d8');}
 else if(ply===4){highlights=['f7','d8'];arrows=arrow('f7','d8');}
 else if(last)arrows=arrow(last.uci.slice(0,2),last.uci.slice(2,4));
 if(selected){highlights=[selected];arrows='';}
 board.classList.toggle('ver-combo-still',instant||reduce());
 window.VERChessSmoothBoard.render(board,{state,flipped,focusSquares:highlights,arrows});
 if(instant)requestAnimationFrame(()=>{if(active)board.classList.remove('ver-combo-still');});
 const legal=new Set(selected&&canMove()?rules.legal(state).filter(m=>m[0]===rules.idx(selected)).map(m=>rules.uci(m).slice(2,4)):[]);
 board.querySelectorAll('.v5-square').forEach((cell,i)=>{
  const row=i>>3,col=i&7,square=files[flipped?7-col:col]+(flipped?row+1:8-row);
  cell.dataset.square=square;cell.removeAttribute('aria-hidden');cell.setAttribute('role','button');
  cell.tabIndex=focusSquare===square?0:-1;cell.setAttribute('aria-pressed',String(selected===square));
  cell.setAttribute('aria-description',legal.has(square)?'Legal destination':canMove()?'Choose a white piece or legal destination':'Use the lesson controls');
  cell.classList.toggle('ver-learn-selected',selected===square);cell.classList.toggle('ver-learn-legal',legal.has(square));
 });
 player.dataset.stage=String(stage);player.setAttribute('aria-busy',String(busy));
 $('verComboStage').textContent=stages[stage];$('verComboProgress').textContent=(stage+1)+' / 6';
 $('verComboPosition').textContent=(state.t===1?'White':'Black')+' to move'+(stage>=2?' · Position '+ply+' / 5'+(last?' · '+last.san:''):'');
 $('verComboText').textContent=stage===0?'White to move. Is the king already on a knight-fork square?':stage===1?'Choose a forcing move that changes the king’s square. Tap a white piece to see its legal destinations.':stage===4?(solved?'You found the whole combination. Ready to review the pattern?':ply===0?'Your turn. Find the lure, then follow through without move hints.':ply===2?'Your turn. Find a checking continuation.':ply===4?'Your turn. Complete the combination.':line.text[ply]):stage===5?'Lure the king onto a fork square. Check with the knight, then take the queen. Calculate every reply before sacrificing.':line.text[ply];
 $('verComboFeedback').hidden=!feedback;$('verComboFeedback').textContent=feedback;
 $('verComboMore').hidden=stage<3||stage===5;
 $('verComboDetail').textContent=line.detail[ply];
 $('verComboDefenseLabel').hidden=stage<3;
 $('verComboDefense').disabled=busy||playing||(stage===4&&ply>0);
 $('verComboDefense').value=defense;
 $('verComboPlayback').hidden=stage<2;
 $('verComboPrevious').hidden=stage===4;$('verComboMoveNext').hidden=stage===4;
 $('verComboPlay').hidden=stage===4&&ply%2===0;
 $('verComboPrevious').disabled=busy||playing||ply===0;
 $('verComboMoveNext').disabled=busy||playing||ply===5;
 $('verComboPlay').disabled=busy&&!playing;
 $('verComboPlay').textContent=playing?'Pause':stage===4?'Continue reply':'Play';
 $('verComboPlay').setAttribute('aria-pressed',String(playing));
 $('verComboReplay').textContent=stage===4?'Try again':'Replay';$('verComboReplay').disabled=busy;
 $('verComboBack').disabled=busy||playing||stageGuard||stage===0;
 $('verComboNext').disabled=busy||playing||stageGuard||(stage===2&&ply!==5)||(stage===4&&!solved);
 $('verComboNext').textContent=['Next','Show combination','Explain','Practice','Review','Practice again'][stage];
 $('verComboFlip').disabled=busy;
 fitSoon();
}
function lock(done){busy=true;paint();schedule(()=>{busy=false;paint();done?.();},reduce()?40:300);}
function guardControls(){stageGuard=true;paint();schedule(()=>{stageGuard=false;paint();},reduce()?40:250);}
function showStage(next){
 cancel();stage=next;selected=null;feedback='';solved=false;$('verComboMore').open=false;
 if(next===0||next===1||next===4)ply=0;
 else if(next===3||next===5)ply=5;
 paint(true);guardControls();
}
function playNext(){
 if(!playing||busy)return;
 if(ply>=5){playing=false;paint();return;}
 ply++;selected=null;paint();lock(()=>{
  if(ply===5){playing=false;paint();return;}
  if(playing)schedule(playNext,850);
 });
}
function play(){
 if(!active)return;
 if(playing){cancel();feedback='';paint();return;}
 if(busy)return;
 feedback='';playing=true;
 if(stage===4){paint();schedule(reply,350);return;}
 if(ply===5){ply=0;paint(true);}
 paint();schedule(playNext,350);
}
function demo(){cancel();stage=2;ply=0;feedback='';selected=null;paint(true);play();}
function reply(){
 if(stage!==4||ply%2!==1)return;
 playing=false;ply++;feedback='';lock();
}
function choose(square){
 if(!canMove())return;
 const state=line.states[ply],piece=state.b[rules.idx(square)];focusSquare=square;
 if(piece!=='.'&&piece===piece.toUpperCase()){selected=selected===square?null:square;feedback='';paint();return;}
 if(selected)tryMove(selected+square);
}
function tryMove(uci){
 if(!canMove())return;
 const state=line.states[ply],move=rules.findUci(state,uci);
 if(!move){feedback='That move is not legal. Choose a dotted square.';paint();return;}
 selected=null;
 if(uci!==line.plies[ply].uci){
  const label=rules.san(state,move);
  feedback=ply===0&&uci==='e5f7'?'Nf7 attacks the queen, but it does not check the king on g8. Black can save the queen with Qf8. Try a forcing lure first.':ply===0&&uci==='f6f7'?'f7+ is a legal check, but it does not lure the king onto the knight’s fork square. Keep the pawn on f6 and look for a rook check.':label+' is legal, but it is outside this combination. '+(ply===2?'Look for a knight check that also attacks the queen.':ply===4?'The king has moved. Which valuable target is still attacked?':'Look for a rook check that changes the king’s square.');
  paint();return;
 }
 if(stage===1){demo();return;}
 ply++;feedback=ply===5?'Combination complete. You exchanged a rook for a queen.':'';
 solved=ply===5;
 if(!solved)playing=true;
 lock(()=>{if(!solved&&playing)schedule(reply,650);});
}
function replay(){cancel();selected=null;feedback='';solved=false;ply=0;if(stage!==4)stage=2;paint(true);guardControls();}
function open(){
 content.verify(rules);cancel();active=true;stage=0;ply=0;flipped=false;defense='kh7';line=content.build(rules,defense);solved=false;selected=null;feedback='';focusSquare='h1';
 host.dataset.comboActive='true';document.body.classList.add('ver-combination-active');player.hidden=false;card.setAttribute('aria-pressed','true');
 $('verComboMore').open=false;window.scrollTo({top:0,behavior:'instant'});paint(true);$('verComboNext').focus({preventScroll:true});
}
function close(restoreFocus=true){
 if(!active)return;cancel();active=false;selected=null;feedback='';
 if(fitFrame!==null){cancelAnimationFrame(fitFrame);fitFrame=null;}
 player.hidden=true;delete host.dataset.comboActive;document.body.classList.remove('ver-combination-active');card.setAttribute('aria-pressed','false');
 board.querySelectorAll('.ver-learn-selected,.ver-learn-legal,.last').forEach(el=>el.classList.remove('ver-learn-selected','ver-learn-legal','last'));
 board.querySelector('.v5-board-arrows')?.replaceChildren();
 if(restoreFocus)card.focus({preventScroll:true});
}
card.onclick=()=>window.VERChessLearn.open(content.id);
$('verComboExit').onclick=()=>close();
$('verComboNext').onclick=()=>{if(busy||playing||stageGuard)return;if(stage===1){demo();return;}showStage(stage===5?4:stage+1);};
$('verComboBack').onclick=()=>{if(!busy&&!playing&&!stageGuard&&stage>0)showStage(stage-1);};
$('verComboPlay').onclick=play;$('verComboReplay').onclick=replay;
$('verComboMoveNext').onclick=()=>{if(!busy&&!playing&&ply<5){ply++;feedback='';lock();}};
$('verComboPrevious').onclick=()=>{if(!busy&&!playing&&ply>0){ply--;feedback='';lock();}};
$('verComboFlip').onclick=()=>{if(!busy){clearDrag();flipped=!flipped;paint(true);lock();}};
$('verComboDefense').onchange=()=>{
 if(busy||playing||(stage===4&&ply>0))return;
 cancel();defense=$('verComboDefense').value;line=content.build(rules,defense);selected=null;feedback='';paint(true);lock();
};
$('verComboMore').addEventListener('toggle',fitSoon);
function squareAt(x,y){const r=board.getBoundingClientRect();if(x<r.left||x>=r.right||y<r.top||y>=r.bottom)return null;const col=Math.floor((x-r.left)/r.width*8),row=Math.floor((y-r.top)/r.height*8);return files[flipped?7-col:col]+(flipped?row+1:8-row);}
board.addEventListener('pointerdown',e=>{
 if(!canMove()||e.button!==0||e.isPrimary===false||drag)return;
 const square=squareAt(e.clientX,e.clientY);if(!square)return;
 const piece=line.states[ply].b[rules.idx(square)],movable=piece!=='.'&&piece===piece.toUpperCase();
 drag={id:e.pointerId,from:square,x:e.clientX,y:e.clientY,piece,movable,previous:selected,moved:false};
 if(movable){selected=square;paint();}board.setPointerCapture(e.pointerId);
});
board.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId||!drag.movable)return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
 drag.moved=true;e.preventDefault();
 if(!ghost){ghost=document.createElement('div');ghost.className='ver-learn-drag-piece ver-combo-ghost';ghost.innerHTML=window.VERChessPieceArt['w'+drag.piece];ghost.style.width=ghost.style.height=board.getBoundingClientRect().width/8+'px';ghost.setAttribute('aria-hidden','true');document.body.append(ghost);board.classList.add('ver-learn-dragging');}
 ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
});
board.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const gesture=drag,to=squareAt(e.clientX,e.clientY);clearDrag();
 if(gesture.moved){if(to&&to!==gesture.from)tryMove(gesture.from+to);return;}
 if(gesture.movable)selected=gesture.previous;
 if(to)choose(to);
});
board.addEventListener('pointercancel',()=>{clearDrag();selected=null;paint();});
board.addEventListener('lostpointercapture',()=>{if(drag)clearDrag();});
board.addEventListener('dragstart',e=>e.preventDefault());board.addEventListener('contextmenu',e=>e.preventDefault());
board.addEventListener('click',e=>{if(e.detail===0){const square=e.target.closest('[data-square]')?.dataset.square;if(square)choose(square);}});
board.addEventListener('keydown',e=>{
 const cell=e.target.closest('[data-square]');if(!cell)return;
 if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(cell.dataset.square);}
 if(e.key==='Escape'){selected=null;clearDrag();paint();}
 const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[e.key];
 if(offset){e.preventDefault();const cells=[...board.querySelectorAll('.v5-square')],i=cells.indexOf(cell),n=i+offset;if(n>=0&&n<64&&(!(Math.abs(offset)===1)||Math.floor(i/8)===Math.floor(n/8))){focusSquare=cells[n].dataset.square;paint();cells[n].focus();}}
});
// Review's window-level Left/Right shortcuts must not navigate an imported
// game while the learner moves focus on this separate lesson board or toolbar.
player.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')e.stopPropagation();});
new MutationObserver(()=>{if(active&&document.body.dataset.verView!=='learn')close(false);}).observe(document.body,{attributes:true,attributeFilter:['data-ver-view']});
document.addEventListener('visibilitychange',()=>{if(active&&document.hidden){cancel();feedback='Paused. Continue when you are ready.';paint();}});
window.addEventListener('pagehide',()=>close(false));
window.VERChessLearn.lessons.push(Object.freeze({id:content.id,name:content.name,fen:content.fen,uci:'h1h8'}));
window.VERChessCombination=Object.freeze({id:content.id,open,close,verify:()=>content.verify(rules),
 state:()=>Object.freeze({active,stage:stages[stage],ply,defense,playing,busy,solved,fen:line?rules.fen(line.states[ply]):content.fen})});
})();
