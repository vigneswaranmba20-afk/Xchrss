/* VER Chess Intelligence — board palette preferences (no dependencies).
 * Local state only; changes square colours without rerendering the 64-square board.
 */
(function(){
'use strict';
const STORAGE_KEY='ver-chess-board-theme-v1';
const themes=[
 {id:'sage',name:'Classic green',light:'#eeeed2',dark:'#77975d',lastLight:'#e6e596',lastDark:'#b3c975'},
 {id:'wood',name:'Warm wood',light:'#f2dfc2',dark:'#ac7952',lastLight:'#e6d38a',lastDark:'#c1a15e'},
 {id:'ocean',name:'Ocean blue',light:'#e4edf3',dark:'#668bad',lastLight:'#e7e7aa',lastDark:'#a5b9a0'},
 {id:'night',name:'Slate night',light:'#cfdad9',dark:'#617a83',lastLight:'#dcd59a',lastDark:'#91a58e'},
 {id:'contrast',name:'High contrast',light:'#fffdf4',dark:'#527268',lastLight:'#fff4a4',lastDark:'#a3b663'}
];
const known=new Map(themes.map(theme=>[theme.id,theme]));
let selected='sage';
try{
 const stored=localStorage.getItem(STORAGE_KEY);
 if(known.has(stored))selected=stored;
}catch(_){}
document.documentElement.dataset.verBoardTheme=selected;
function init(){
 const title=document.querySelector('.game-title');
 const board=document.getElementById('board');
 if(!title||!board||document.getElementById('verThemeTrigger'))return;
 const button=document.createElement('button');
 button.id='verThemeTrigger';
 button.className='ver-theme-trigger';
 button.type='button';
 button.setAttribute('aria-label','Change chessboard colours');
 button.setAttribute('title','Choose board colours');
 button.setAttribute('aria-haspopup','dialog');
 button.innerHTML='<span class="ver-theme-trigger-swatch" aria-hidden="true"></span><span>Colours</span>';
 title.append(button);
 const dialog=document.createElement('dialog');
 dialog.id='verBoardThemeDialog';
 dialog.className='ver-theme-dialog';
 dialog.setAttribute('aria-labelledby','verThemeHeading');
 dialog.innerHTML=[
  '<div class="ver-theme-top"><div><span class="ver-theme-eyebrow">Make the board yours</span><h2 id="verThemeHeading">Board colours</h2></div><button type="button" class="ver-theme-close" aria-label="Close colour picker">✕</button></div>',
  '<p class="ver-theme-description">Pick a palette. Your pieces stay sharp, and the board changes instantly — no game reset.</p>',
  '<div id="verThemeOptions" class="ver-theme-options" role="radiogroup" aria-label="Chessboard colour theme"></div>',
  '<p class="ver-theme-privacy">Saved on this device only. No account or paid API needed.</p>'
 ].join('');
 document.body.append(dialog);
 const options=dialog.querySelector('#verThemeOptions');
 const actions=new Map();
 function sync(){
  for(const [id,action] of actions){
   const isActive=id===selected;
   action.setAttribute('aria-checked',String(isActive));
   action.classList.toggle('is-selected',isActive);
  }
 }
 function choose(id){
  if(!known.has(id))return;
  selected=id;
  document.documentElement.dataset.verBoardTheme=id;
  try{localStorage.setItem(STORAGE_KEY,id);}catch(_){}
  sync();
  dialog.close();
 }
 for(const theme of themes){
  const choice=document.createElement('button');
  choice.type='button';choice.className='ver-theme-option';
  choice.setAttribute('role','radio');
  choice.setAttribute('aria-label',theme.name);
  choice.style.setProperty('--theme-light',theme.light);
  choice.style.setProperty('--theme-dark',theme.dark);
  const swatch=document.createElement('span');
  swatch.className='ver-theme-preview';swatch.setAttribute('aria-hidden','true');
  const name=document.createElement('span');
  name.className='ver-theme-name';name.textContent=theme.name;
  choice.append(swatch,name);
  choice.addEventListener('click',()=>choose(theme.id));
  options.append(choice);actions.set(theme.id,choice);
 }
 button.addEventListener('click',()=>{
  sync();
  if(typeof dialog.showModal==='function')dialog.showModal();
  else dialog.setAttribute('open','');
 });
 dialog.querySelector('.ver-theme-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>button.focus({preventScroll:true}));
 sync();
 window.VERChessThemes={themes:themes.map(x=>x.id),get:()=>selected,set:choose};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();