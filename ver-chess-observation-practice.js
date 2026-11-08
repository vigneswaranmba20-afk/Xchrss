/* VER Chess Learn v7.3 — offline, detector-checked observation practice.
 * Geometry is not checkmate, a forced win or an engine evaluation.
 * This panel never changes the review board or saved games. */
(function(){
'use strict';
const quiz=window.VERChessObservationQuiz;
const rules=window.VERChessLessonRules;
const renderer=window.VERChessSmoothBoard;
const host=document.getElementById('verLearnPanel');
if(!host||!quiz||!rules||!renderer)return;
const section=document.createElement('section');
section.id='verObservationPractice';
section.className='ver-observation-practice';
section.setAttribute('aria-label','Back-rank observation practice');
section.innerHTML='<div class="ver-observation-heading"><small>TACTICS · OBSERVE</small><h2>Spot the back-rank pattern</h2><p>Three positions. Decide whether a strict geometric pattern is visible. These observations do not prove checkmate.</p></div><div id="verObservationBoard" class="board ver-learn-board" role="img" aria-label="Observation position"></div><p id="verObservationPrompt"></p><div class="ver-observation-actions"><button type="button" data-answer="yes">Yes, pattern visible</button><button type="button" data-answer="no">No, pattern absent</button></div><p id="verObservationFeedback" role="status" aria-live="polite"></p><button type="button" id="verObservationNext" disabled>Next position →</button><p id="verObservationCount" aria-live="polite"></p>';
host.append(section);
const board=section.querySelector('#verObservationBoard');
const prompt=section.querySelector('#verObservationPrompt');
const feedback=section.querySelector('#verObservationFeedback');
const next=section.querySelector('#verObservationNext');
const count=section.querySelector('#verObservationCount');
const buttons=[...section.querySelectorAll('[data-answer]')];
// Announce the current position and question when an answer receives keyboard focus.
buttons.forEach(button=>button.setAttribute('aria-describedby','verObservationCount verObservationPrompt'));
let index=0;
function show(){
 const q=quiz.questions[index];
 const state=rules.parseFen(q.fen);
 renderer.render(board,{state,flipped:false,focusSquares:[],arrows:''});
 board.setAttribute('aria-label','Back-rank observation position '+(index+1)+' of '+quiz.questions.length);
 prompt.textContent=q.prompt;
 count.textContent='Position '+(index+1)+' of '+quiz.questions.length;
 feedback.textContent='';
 buttons.forEach(b=>b.disabled=false);
 next.disabled=true;
 next.textContent=index===quiz.questions.length-1?'Review again ↺':'Next position →';
}
buttons.forEach(b=>b.addEventListener('click',()=>{
 const q=quiz.questions[index];
 try{
  const result=quiz.assess(q.id,b.dataset.answer==='yes');
  feedback.textContent=(result.correct?'Correct. ':'Try again. ')+result.explanation;
  if(result.correct){
   buttons.forEach(button=>button.disabled=true);
   next.disabled=false;
   // The selected answer becomes disabled; move keyboard focus to the next usable action.
   next.focus({preventScroll:true});
  }
 }catch(error){
  feedback.textContent='This position could not be validated. Practice is paused.';
  buttons.forEach(button=>button.disabled=true);
  next.disabled=true;
  console.error('VER observation practice:',error);
 }
}));
next.addEventListener('click',()=>{if(next.disabled)return;index=(index+1)%quiz.questions.length;show();buttons[0].focus({preventScroll:true});});
show();
})();