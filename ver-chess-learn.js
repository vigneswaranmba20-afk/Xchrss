/* VER Chess Learn v7.1 — original offline interactive lessons.
   The chess rule engine validates every played and quiz move.
   No paid APIs, tracking, copyrighted book figures or external animation libraries. */
(function(){
'use strict';
if(window.VERChessLearn)return;
const LESSONS=[
 {id:'fork',name:'Knight fork',icon:'♘',tag:'Tactics · beginner',
  teaser:'One knight jump, two simultaneous threats.',
  fen:'3q3k/8/8/4N3/8/8/8/K7 w - - 0 1',
  uci:'e5f7',targets:['d8','h8'],
  choices:[['e5c6','Nc6'],['e5f7','Nf7+'],['e5g6','Ng6']],
  text:[
   'White to move. Can one knight create two threats at once?',
   'Watch the knight on e5. Find a jump that attacks the king and queen together.',
   'Nf7+! The knight travels from e5 to f7 and checks the king.',
   'Now the knight attacks the king on h8 AND the queen on d8. This is a fork. The position demonstrates two threats, not a guaranteed queen win.',
   'Which knight move simultaneously checks the king and threatens the queen?',
   'One piece attacking two targets is a fork. Look for checking knight jumps that threaten another valuable piece.'
  ]},
 {id:'pin',name:'Absolute pin',icon:'♗',tag:'Tactics · beginner',
  teaser:'A bishop immobilizes a knight in front of its king.',
  fen:'6k1/5n2/8/8/8/8/4B3/K7 w - - 0 1',
  uci:'e2c4',targets:['f7','g8'],
  choices:[['e2g4','Bg4'],['e2d3','Bd3'],['e2c4','Bc4']],
  text:[
   'White to move. Notice the black knight on f7 and king on g8.',
   'Look for a bishop diagonal that passes through the knight toward its king.',
   'Bc4! The bishop slides from e2 to c4, aligning the knight and king.',
   'The bishop now attacks along c4–d5–e6–f7–g8. The knight on f7 cannot legally move away if this exposes its king to check. This is an absolute pin.',
   'Which bishop move pins the knight on f7 to the king?',
   'In an absolute pin, moving the pinned piece would expose its own king. Check the entire line: attacker → pinned piece → king.'
  ]}
];
const STAGES=['Observe','Discover','Animate','Explain','Practice','Review'];
const $=id=>document.getElementById(id);
const nav=document.querySelector('.verv4-appnav');
if(!nav)return;
const root=document.createElement('section');
root.id='verLearnPanel';root.className='ver-learn';
root.setAttribute('aria-label','Learn chess through visual lessons');
root.innerHTML=[
 '<div class="ver-learn-hero"><div><small>VER · CHESS LEARN</small><h1>See the idea. Play the move.</h1>',
 '<p>Two original, interactive tactical lessons. Beautifully visual. Completely free and offline-friendly.</p></div>',
 '<span class="ver-learn-mark" aria-hidden="true">♞</span></div>',
 '<div id="verLearnChoices" class="ver-learn-grid" aria-label="Available lessons"></div>',
 '<section id="verLearnPlayer" class="ver-learn-player" aria-label="Visual chess lesson" hidden>',
 '<div class="ver-learn-player-head"><div><small>INTERACTIVE CHESS LESSON</small><h2 id="verLearnTitle"></h2></div>',
 '<button id="verLearnClose" type="button">✕ Close</button></div>',
 '<div class="ver-learn-progress"><span id="verLearnProgress" aria-live="polite"></span><div aria-hidden="true"><span id="verLearnProgressFill"></span></div></div>',
 '<div class="ver-learn-stage-layout"><div class="ver-learn-board-wrap">',
 '<div id="verLearnBoard" class="board ver-learn-board" role="img" aria-label="Chess lesson position"></div>',
 '<small class="ver-learn-board-foot">Gold: teaching move · Mint: tactical relationship</small></div>',
 '<div class="ver-learn-copy"><strong id="verLearnStage"></strong><p id="verLearnText"></p>',
 '<div id="verLearnChoicesQuiz" class="ver-learn-quiz" hidden></div>',
 '<p id="verLearnFeedback" role="status" aria-live="polite"></p>',
 '<div class="ver-learn-actions">',
 '<button id="verLearnBack" type="button">← Back</button>',
 '<button id="verLearnNext" type="button">Next →</button>',
 '<button id="verLearnReplay" type="button">↺ Replay</button>',
 '<button id="verLearnFlip" type="button">⇅ Flip</button>',
 '</div></div></div></section>',
 '<p class="ver-learn-note">Examples were independently created for teaching. A recognized pattern does not by itself prove a tactical win. Existing PGN games and analysis are never changed.</p>'
].join('');
nav.insertAdjacentElement('afterend',root);
const tab=document.createElement('button');
tab.type='button';tab.setAttribute('role','tab');tab.dataset.verNav='learn';
tab.setAttribute('aria-selected','false');tab.tabIndex=-1;tab.textContent='✧ Learn';
nav.append(tab);

const catalog=$('verLearnChoices');
for(const l of LESSONS){
 const b=document.createElement('button');
 b.type='button';b.dataset.lesson=l.id;b.className='ver-learn-choice';
 const icon=document.createElement('span');icon.className='ver-learn-choice-symbol';icon.textContent=l.icon;
 icon.setAttribute('aria-hidden','true');
 const copy=document.createElement('span');copy.className='ver-learn-choice-copy';
 const title=document.createElement('strong');title.textContent=l.name;
 const teaser=document.createElement('small');teaser.textContent=l.teaser;
 copy.append(title,teaser);
 const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
 b.append(icon,copy,arrow);
 b.addEventListener('click',()=>open(l.id));
 catalog.append(b);
}
const rules=window.VERChessLessonRules;
let lesson=null,step=0,flipped=false,solved=false,animation=null;
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function stop(){if(animation!==null){clearTimeout(animation);animation=null;}}
function verify(l){
 if(!rules)throw Error('Chess rules not initialized');
 const before=rules.parseFen(l.fen),m=rules.findUci(before,l.uci);
 if(!m)throw Error('Invalid lesson move '+l.uci);
 for(const [move] of l.choices)if(!rules.findUci(before,move))throw Error('Invalid choice '+move);
 const after=rules.apply(before,m),idx=rules.idx;
 if(l.id==='fork'){
  const knight=idx('f7'),attacks=s=>[14,18,31,33].includes(Math.abs(idx(s)-knight));
  if(after.b[knight]!=='N'||after.b[idx('d8')]!=='q'||after.b[idx('h8')]!=='k'||!attacks('d8')||!attacks('h8'))throw Error('Invalid fork geometry');
 }
 if(l.id==='pin'){
  if(after.b[idx('c4')]!=='B'||after.b[idx('f7')]!=='n'||after.b[idx('g8')]!=='k'||rules.findUci(after,'f7h6'))throw Error('Invalid absolute pin');
 }
 return {before,after};
}
function point(square){
 const i=rules.idx(square),r=i>>4,c=i&7;
 return [(flipped?7-c:c)*100+50,(flipped?7-r:r)*100+50];
}
function beam(from,to,color){
 const a=point(from),b=point(to);
 return '<path d="M '+a.join(' ')+' L '+b.join(' ')+'" stroke="'+color+'" stroke-width="13" fill="none" stroke-dasharray="18 12" stroke-linecap="round" opacity=".88"/><circle cx="'+b[0]+'" cy="'+b[1]+'" r="24" stroke="'+color+'" stroke-width="9" fill="none"/>';
}
function paint(phase){
 const l=lesson,{before,after}=verify(l),start=l.uci.slice(0,2),end=l.uci.slice(2,4);
 const state=phase==='before'?before:after;
 let squares=[],arrows='';
 if(step===1||step===2){squares=[start,end];arrows=beam(start,end,'#e8c579');}
 if(step===3||step===5){
  squares=[end,...l.targets];
  arrows=l.id==='pin'?beam('c4','g8','#4de5b5'):l.targets.map(t=>beam(end,t,'#4de5b5')).join('');
 }
 if(step===4)squares=[start];
 window.VERChessSmoothBoard.render($('verLearnBoard'),{state,flipped,focusSquares:squares,arrows});
 $('verLearnBoard').setAttribute('aria-label',l.name+' '+STAGES[step]+': '+(phase==='before'?'before':'after')+' '+l.uci);
}
function showQuiz(){
 const quiz=$('verLearnChoicesQuiz');quiz.replaceChildren();quiz.hidden=step!==4;
 if(step!==4)return;
 for(const [uci,label] of lesson.choices){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=solved;
  button.addEventListener('click',()=>{
   if(solved)return;
   if(uci!==lesson.uci){$('verLearnFeedback').textContent='Not quite. Look for the move that creates the tactical relationship.';return;}
   solved=true;$('verLearnFeedback').textContent='Correct! '+label+' creates the pattern.';
   quiz.querySelectorAll('button').forEach(b=>b.disabled=true);
   $('verLearnNext').disabled=false;
  });
  quiz.append(button);
 }
}
function draw(){
 if(!lesson)return;
 stop();
 $('verLearnTitle').textContent=lesson.name;
 $('verLearnStage').textContent=STAGES[step];
 $('verLearnText').textContent=lesson.text[step];
 $('verLearnProgress').textContent='Step '+(step+1)+' of '+STAGES.length;
 $('verLearnProgressFill').style.width=(100*(step+1)/STAGES.length)+'%';
 $('verLearnBack').disabled=step===0;
 $('verLearnNext').disabled=step===4&&!solved;
 $('verLearnNext').textContent=step===5?'Start again ↺':'Next →';
 $('verLearnFeedback').textContent='';
 showQuiz();
 if(step===2&&!reduce()){
  paint('before');
  animation=setTimeout(()=>{animation=null;if(lesson&&step===2)paint('after');},350);
 }else paint(step===0||step===1||step===4?'before':'after');
}
function open(id){
 const l=LESSONS.find(l=>l.id===id);if(!l)return;
 try{verify(l);}catch(e){console.warn('Could not open lesson:',e);return;}
 lesson=l;step=0;flipped=false;solved=false;
 $('verLearnPlayer').hidden=false;
 catalog.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lesson===id)));
 draw();
 $('verLearnPlayer').scrollIntoView({behavior:reduce()?'instant':'smooth',block:'start'});
}
$('verLearnNext').onclick=()=>{if(!lesson||step===4&&!solved)return;if(step===5){step=0;solved=false;}else{step++;if(step===4)solved=false;}draw();};
$('verLearnBack').onclick=()=>{if(step){step--;draw();}};
$('verLearnReplay').onclick=()=>draw();
$('verLearnFlip').onclick=()=>{flipped=!flipped;draw();};
$('verLearnClose').onclick=()=>{stop();lesson=null;$('verLearnPlayer').hidden=true;catalog.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.VERChessLearn={version:'7.1',open,lessons:LESSONS.map(x=>({id:x.id,name:x.name,fen:x.fen,uci:x.uci})),verify:()=>LESSONS.every(l=>!!verify(l))};
})();