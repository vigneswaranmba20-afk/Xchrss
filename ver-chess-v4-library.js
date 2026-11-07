/* VER Chess Intelligence — v4.1 mobile UX.
 * Two visible public account searches, honest search states, filtered results,
 * local PGN library and a compact Games / Board / Insights flow.
 * This is independent of both services; no paid APIs, passwords or tracking.
 */
(function(){
'use strict';
if(window.VERChessLibraryV4)return;
const root=document.querySelector('.shell');
const main=document.querySelector('main.main');
const host=document.querySelector('aside.right');
const left=document.querySelector('.left');
if(!root||!main||!host||!left||typeof window.importText!=='function'||typeof window.runAnalysis!=='function')return;
const $=id=>document.getElementById(id);
const STORE='ver-chess-v4-public-library-v1';
const MAX_ITEMS=80,MAX_FETCH=40;
const state={
 items:[],accounts:{chesscom:'',lichess:''},shown:10,busy:false,
 active:null,currentKeys:[],scope:'all',view:'games',selected:null
};
const nameFor=k=>k==='chesscom'?'Chess.com':'Lichess';
function el(tag,cls,text){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(text!==undefined)n.textContent=text;
 return n;
}
const nav=el('nav','verv4-appnav');
nav.setAttribute('aria-label','Main chess navigation');
nav.setAttribute('role','tablist');
nav.innerHTML=[
 '<button type="button" role="tab" data-ver-nav="games" aria-selected="true">♟ Games <span id="verV4Count" class="v4-count">0</span></button>',
 '<button type="button" role="tab" data-ver-nav="board" aria-selected="false">▦ Board</button>',
 '<button type="button" role="tab" data-ver-nav="insights" aria-selected="false">✦ Insights</button>'
].join('');
root.insertBefore(nav,main);
const reviewbar=el('div','verv4-reviewbar');
reviewbar.innerHTML=[
 '<button type="button" id="verV4Back" class="btn btn-quiet verv4-inline-back" aria-label="Back to games">← Games</button>',
 '<div class="verv4-reviewcopy"><strong id="verV4ReviewName">Game review board</strong><small id="verV4ReviewMeta">Choose a game from your library or import a PGN</small></div>',
 '<button type="button" id="verV4QuickAnalyze" class="btn btn-gold">✦ Analyse</button>'
].join('');
left.insertBefore(reviewbar,left.firstChild);
// Insights now leads directly to the existing engine panel, without an intermediate header.
const panel=el('section','panel verv4-panel');
panel.setAttribute('aria-label','Public games from Chess.com and Lichess');
panel.innerHTML=[
 '<div class="panel-head"><h2>00 / Discover your games</h2><span class="sub">Two platforms · One library</span></div>',
 '<div class="body">',
 '<div><div class="verv4-overline">Your chess studio</div><h2 class="verv4-heading">Find your games. Learn faster.</h2><p class="verv4-lead">Both platforms are ready. Type a public username in either card; no account login required.</p></div>',
 '<div class="verv4-platforms">',
 '<section class="verv4-platform" aria-labelledby="verV4ChessLabel">',
 '<div class="verv4-platform-head"><div class="verv4-mark" aria-hidden="true">♜</div><h3 id="verV4ChessLabel">Chess.com</h3></div>',
 '<form id="verV4ChessForm"><label for="verV4ChessUsername">Chess.com username</label><input type="text" id="verV4ChessUsername" maxlength="32" placeholder="e.g. hikaru" autocomplete="off" autocapitalize="none" spellcheck="false" required/><button id="verV4ChessFind" type="submit" class="btn btn-gold">Find Chess.com games</button></form>',
 '<div class="verv4-platform-status" id="verV4ChessStatus" role="status" aria-live="polite">Public finished games</div>',
 '</section>',
 '<section class="verv4-platform" aria-labelledby="verV4LichessLabel">',
 '<div class="verv4-platform-head"><div class="verv4-mark" aria-hidden="true">♞</div><h3 id="verV4LichessLabel">Lichess</h3></div>',
 '<form id="verV4LichessForm"><label for="verV4LichessUsername">Lichess username</label><input type="text" id="verV4LichessUsername" maxlength="32" placeholder="e.g. thibault" autocomplete="off" autocapitalize="none" spellcheck="false" required/><button id="verV4LichessFind" type="submit" class="btn btn-gold">Find Lichess games</button></form>',
 '<div class="verv4-platform-status" id="verV4LichessStatus" role="status" aria-live="polite">Public finished games</div>',
 '</section>',
 '</div>',
 '<section class="ver-pgn-widget" aria-labelledby="verPgnWidgetTitle">',
 ' <div class="ver-pgn-widget-head"><div><span class="verv4-overline">Have a PGN file?</span><h3 id="verPgnWidgetTitle">Import a saved game</h3></div><span class="ver-pgn-small">Optional · On-device</span></div>',
 ' <div class="ver-pgn-inputs"><div id="verPgnUploadSlot" class="ver-pgn-upload-slot"></div><details id="verPgnPasteDetails" class="ver-pgn-details"><summary>Paste PGN</summary><div id="verPgnPasteSlot"></div></details></div>',
 ' <div id="verPgnSelectSlot"></div>',
 '</section>',
 '<div class="verv4-results-head"><div><span class="verv4-overline">Your collection</span><h3 id="verV4ResultTitle">Saved games</h3></div><button type="button" class="verv4-clear" id="verV4Clear">Clear saved</button></div>',
 '<div class="verv4-scope"><button type="button" id="verV4All" class="active" aria-pressed="true">All saved games</button><button type="button" id="verV4Latest" aria-pressed="false" hidden>Current search</button></div>',
 '<p class="verv4-context" id="verV4Context" role="status" aria-live="polite">Your saved public games appear here, from either platform.</p>',
 '<div class="verv4-filters"><select id="verV4Source" aria-label="Filter platform"><option value="all">Both platforms</option><option value="chesscom">Chess.com only</option><option value="lichess">Lichess only</option></select><select id="verV4Result" aria-label="Filter game result"><option value="all">All outcomes</option><option value="win">Wins</option><option value="loss">Losses</option><option value="draw">Draws</option></select><input type="text" id="verV4Query" placeholder="Search opponent or opening…" aria-label="Search games"/></div>',
 '<div class="verv4-summary" id="verV4Summary" aria-label="Visible game results"></div>',
 '<div class="verv4-list" id="verV4List" aria-live="polite"></div>',
 '<button type="button" id="verV4More" class="btn btn-quiet verv4-loadmore" hidden>Show more games</button>',
 '<p class="verv4-fineprint">Only public, completed standard games. Stockfish analysis runs on this device, at no paid API cost. PGNs are saved only in this browser. Unaffiliated with Chess.com or Lichess.</p>',
 '</div>'
].join('');
host.insertBefore(panel,host.firstChild);
// Move the original parser-wired PGN elements into their visible home on Games.
// No new parser and no duplicate controls — the inline handlers remain attached.
const uploadBtn=$('uploadBtn'),fileInput=$('fileInput'),pasteText=$('pgnText'),pasteBtn=$('pasteBtn'),selector=$('gameSelectRow');
if(uploadBtn&&fileInput&&pasteText&&pasteBtn&&selector){
 $('verPgnUploadSlot').append(uploadBtn,fileInput);
 $('verPgnPasteSlot').append(pasteText,pasteBtn);
 $('verPgnSelectSlot').append(selector);
 uploadBtn.textContent='↑ Upload PGN';
 pasteBtn.textContent='Open pasted game';
}
function setView(view){
 if(!['games','board','insights'].includes(view))return;
 state.view=view;
 document.body.setAttribute('data-ver-view',view);
 nav.querySelectorAll('[data-ver-nav]').forEach(button=>{
  const selected=button.getAttribute('data-ver-nav')===view;
  button.setAttribute('aria-selected',String(selected));
  button.tabIndex=selected?0:-1;
 });
 if(typeof window.scrollTo==='function')window.scrollTo({top:0,behavior:'instant'});
 if(view==='insights'){
  // Skip any import chrome: put engine depth/progress and analysis first.
  requestAnimationFrame(()=>{
   const engine=$('verEngineAnalysisPanel');
   if(state.view==='insights'&&engine)engine.scrollIntoView({block:'start',behavior:'auto'});
  });
 }
}
nav.addEventListener('click',e=>{
 const button=e.target.closest('[data-ver-nav]');
 if(button)setView(button.getAttribute('data-ver-nav'));
});
nav.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const items=Array.from(nav.querySelectorAll('[data-ver-nav]'));
 const current=items.findIndex(button=>button.getAttribute('aria-selected')==='true');
 const next=e.key==='Home'?0:e.key==='End'?items.length-1:(current+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;
 e.preventDefault();
 const button=items[next];
 setView(button.getAttribute('data-ver-nav'));
 button.focus({preventScroll:true});
});
$('verV4Back').addEventListener('click',()=>setView('games'));
// The top navigation already provides a direct, persistent Board destination.
// Manual PGN controls live immediately beneath the two platform searches.
$('verV4QuickAnalyze').addEventListener('click',()=>{
 if(state.busy){$('verV4ReviewMeta').textContent='Finish importing before analysis.';return;}
 window.runAnalysis();
});
function setPlatformStatus(platform,message,kind){
 const target=$(platform==='chesscom'?'verV4ChessStatus':'verV4LichessStatus');
 target.textContent=message;
 target.setAttribute('data-kind',kind||'');
}
function titleOf(item){return item.white+' vs '+item.black;}
function sourceLabel(platform){return platform==='chesscom'?'Chess.com':'Lichess';}
function getHeaders(pgn){
 const headers={},re=/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\s*\]\s*$/gm;
 let m;while((m=re.exec(pgn))!==null)headers[m[1]]=m[2].replace(/\\"/g,'"');
 return headers;
}
function splitPgn(raw){
 const data=String(raw||'').replace(/^\uFEFF/,'').trim();
 if(!data)return [];
 const parts=data.split(/(?=^\[Event\s+")/gm).map(x=>x.trim()).filter(x=>/^\s*\[[A-Za-z]/m.test(x));
 return parts.length?parts:[data];
}
function gameStamp(h){
 const d=(h.UTCDate||h.Date||'').replace(/\./g,'-');
 if(!/^\d{4}-\d\d-\d\d$/.test(d))return 0;
 const t=/^\d\d:\d\d:\d\d$/.test(h.UTCTime||'')?h.UTCTime:'00:00:00';
 const ms=Date.parse(d+'T'+t+'Z');
 return Number.isFinite(ms)?ms:0;
}
function identity(platform,url,pgn){
 if(url && /^https:\/\//i.test(url))return platform+':'+url.split('?')[0].toLowerCase();
 let hash=2166136261;
 for(let i=0;i<pgn.length;i++){hash^=pgn.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return platform+':'+(hash>>>0);
}
function record(platform,username,pgn,url,at,timeClass){
 if(typeof pgn!=='string'||!pgn.trim()||pgn.length>80000)return null;
 const h=getHeaders(pgn);
 if(h.Variant&&!['standard','chess'].includes(h.Variant.toLowerCase()))return null;
 if(!['1-0','0-1','1/2-1/2'].includes(h.Result))return null;
 const white=h.White||'White',black=h.Black||'Black',player=username.toLowerCase();
 if(white.toLowerCase()!==player && black.toLowerCase()!==player)return null;
 const source=url||h.Site||'',opening=h.Opening||'';
 return {key:identity(platform,source,pgn),platform,username,white,black,result:h.Result,
  opening,event:h.Event||'Chess game',timeClass:timeClass||h.TimeControl||'',url:source,
  at:Number(at)||gameStamp(h),pgn};
}
function outcome(x){
 if(x.result==='1/2-1/2')return 'draw';
 const isWhite=x.white.toLowerCase()===x.username.toLowerCase();
 return (x.result==='1-0')===isWhite?'win':'loss';
}
function safeSource(x){
 try{
  const u=new URL(x.url);
  if(u.protocol!=='https:')return '';
  if(x.platform==='chesscom'&&['chess.com','www.chess.com'].includes(u.hostname))return u.href;
  if(x.platform==='lichess'&&['lichess.org','www.lichess.org'].includes(u.hostname))return u.href;
 }catch(_){}
 return '';
}
function displayDate(at){
 if(!at)return 'Date unavailable';
 const d=new Date(at);
 return Number.isNaN(d.valueOf())?'Date unavailable':d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
}
function loadSaved(){
 try{
  const data=JSON.parse(localStorage.getItem(STORE)||'null');
  if(data&&Array.isArray(data.items))state.items=data.items.filter(x=>x&&typeof x.pgn==='string'&&x.pgn.length<80000&&['chesscom','lichess'].includes(x.platform)&&typeof x.key==='string').slice(0,MAX_ITEMS);
  if(data?.accounts)for(const p of ['chesscom','lichess'])if(typeof data.accounts[p]==='string')state.accounts[p]=data.accounts[p].slice(0,32);
 }catch(_){}
}
function persist(){
 try{localStorage.setItem(STORE,JSON.stringify({items:state.items,accounts:state.accounts}));}
 catch(_){$('verV4Context').textContent='Browser storage is full or disabled; games remain available this session only.';}
}
function visibleItems(){
 let pool=state.scope==='latest'?state.items.filter(x=>state.currentKeys.includes(x.key)):[...state.items];
 const src=$('verV4Source').value,win=$('verV4Result').value,q=$('verV4Query').value.trim().toLowerCase();
 return pool.filter(x=>(src==='all'||x.platform===src)&&(win==='all'||outcome(x)===win)&&(!q||[x.username,x.white,x.black,x.opening,x.event].some(s=>String(s).toLowerCase().includes(q))));
}
function showGame(item){
 const article=el('article','verv4-game');
 const top=el('div','verv4-game-top');
 const info=el('div','verv4-game-info');
 const topline=el('div','verv4-game-top');
 topline.append(el('span','verv4-tag '+item.platform,sourceLabel(item.platform)));
 topline.append(el('span','verv4-result '+outcome(item),outcome(item).toUpperCase()));
 info.append(topline);
 info.append(el('strong',null,titleOf(item)));
 info.append(el('small',null,displayDate(item.at)+(item.timeClass?' · '+item.timeClass:'')+(item.opening?' · '+item.opening:'')));
 top.append(info);
 article.append(top);
 const actions=el('div','verv4-game-actions');
 const board=el('button','btn btn-quiet','View board');
 board.type='button';board.addEventListener('click',()=>openItem(item,false));
 const analyze=el('button','btn btn-gold','✦ Analyse');
 analyze.type='button';analyze.addEventListener('click',()=>openItem(item,true));
 actions.append(board,analyze);
 const source=safeSource(item);
 if(source){
  const link=el('a',null,'Source');
  link.href=source;link.target='_blank';link.rel='noopener noreferrer';
  link.setAttribute('aria-label','Open original game on '+sourceLabel(item.platform));
  actions.append(link);
 } else actions.append(el('span',null,''));
 article.append(actions);
 return article;
}
function render(){
 $('verV4Count').textContent=String(state.items.length);
 $('verV4All').classList.toggle('active',state.scope==='all');
 $('verV4All').setAttribute('aria-pressed',String(state.scope==='all'));
 $('verV4Latest').classList.toggle('active',state.scope==='latest');
 $('verV4Latest').setAttribute('aria-pressed',String(state.scope==='latest'));
 $('verV4Latest').hidden=!state.active;
 const all=visibleItems();
 const title=state.scope==='latest'&&state.active?'Results: '+sourceLabel(state.active.platform)+' @'+state.active.username:'Saved games';
 $('verV4ResultTitle').textContent=title;
 const summary=$('verV4Summary');
 summary.replaceChildren();
 const counts={win:0,loss:0,draw:0};
 for(const item of all)counts[outcome(item)]++;
 for(const val of [all.length+' shown',counts.win+' wins',counts.loss+' losses',counts.draw+' draws'])summary.append(el('span',null,val));
 const list=$('verV4List');list.replaceChildren();
 if(all.length===0){
  const empty=el('div','verv4-empty');
  let heading='No games to display',message='Enter a username above to search public completed games.';
  if(state.scope==='latest'&&state.active){
   if(state.busy){heading='Searching '+sourceLabel(state.active.platform)+' @'+state.active.username+'…';message='Fetching public completed games. Please wait…';}
   else {heading='No results for '+sourceLabel(state.active.platform)+' @'+state.active.username;
   message='This search returned no completed standard games, failed, or matches your filters. Older saved accounts are hidden here. Tap “All saved games” to see them.';}
  }else if(state.items.length){
   message='Try changing the result, platform or opponent filters.';
  }
  empty.append(el('strong',null,heading),el('span',null,message));list.append(empty);
 }else{
  for(const game of all.slice(0,state.shown))list.append(showGame(game));
 }
 $('verV4More').hidden=all.length<=state.shown;
 $('verV4More').textContent='Show more · '+Math.max(0,all.length-state.shown)+' remaining';
}
function switchScope(scope){
 if(scope==='latest'&&!state.active)return;
 state.scope=scope;state.shown=10;
 $('verV4Source').value='all';
 $('verV4Result').value='all';$('verV4Query').value='';
 $('verV4Context').textContent=scope==='all'?'Showing saved public games from both platforms and all previous accounts.':('Showing only the newest '+sourceLabel(state.active.platform)+' search for @'+state.active.username+'.');
 render();
}
function openItem(item,analyze){
 if(state.busy)return;
 try{
  window.importText(item.pgn);
  state.selected=item;
  $('verV4ReviewName').textContent=titleOf(item);
  $('verV4ReviewMeta').textContent=sourceLabel(item.platform)+' · '+displayDate(item.at);
  setView('board');
  if(analyze)window.runAnalysis();
 }catch(err){
  $('verV4Context').textContent='Unable to open this game: '+(err?.message||String(err))+'. Try another completed standard game.';
 }
}
async function api(url,type){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
 try{
  const response=await fetch(url,{method:'GET',credentials:'omit',mode:'cors',signal:ctrl.signal,headers:{Accept:type==='json'?'application/json':'application/x-chess-pgn'}});
  if(!response.ok){
   if(response.status===404)throw Error('Username or public game archive not found (404).');
   if(response.status===429)throw Error('Rate limited (429). Try again later.');
   throw Error('Provider returned HTTP '+response.status+'.');
  }
  return type==='json'?await response.json():await response.text();
 }catch(err){
  if(err?.name==='AbortError')throw Error('Request timed out; check your connection.');
  if(err instanceof TypeError)throw Error('Network or browser CORS restriction; manual PGN import is still available.');
  throw err;
 }finally{clearTimeout(timer);}
}
async function importChessCom(username){
 const base='https://api.chess.com/pub/player/'+encodeURIComponent(username)+'/games/';
 const index=await api(base+'archives','json');
 const archives=Array.isArray(index.archives)?index.archives.slice(-6).reverse():[];
 const found=new Map();
 for(let n=0;n<archives.length;n++){
  if(found.size>=MAX_FETCH)break;
  const url=new URL(archives[n]);
  if(url.origin!=='https://api.chess.com'||!url.pathname.startsWith('/pub/player/'))continue;
  setPlatformStatus('chesscom','Checking month '+(n+1)+' of '+archives.length+' · '+found.size+' games…','loading');
  const result=await api(url.href,'json');
  for(const g of (Array.isArray(result.games)?result.games:[])){
   if(!g||g.rules&&g.rules!=='chess'||!g.end_time||!g.pgn)continue;
   const item=record('chesscom',username,g.pgn,g.url,g.end_time*1000,g.time_class);
   if(item)found.set(item.key,item);
  }
 }
 return Array.from(found.values()).sort((a,b)=>b.at-a.at).slice(0,MAX_FETCH);
}
async function importLichess(username){
 const url='https://lichess.org/api/games/user/'+encodeURIComponent(username)+'?max='+MAX_FETCH+'&finished=true&clocks=false&evals=false&opening=true';
 const body=await api(url,'pgn');
 return splitPgn(body).map(pgn=>{
  const h=getHeaders(pgn);
  return record('lichess',username,pgn,h.Site||'',0,h.TimeControl||'');
 }).filter(Boolean).slice(0,MAX_FETCH);
}
async function findGames(platform,evt){
 evt.preventDefault();
 if(state.busy)return;
 const input=$(platform==='chesscom'?'verV4ChessUsername':'verV4LichessUsername');
 const username=input.value.trim();
 if(!/^[A-Za-z0-9_.-]{2,32}$/.test(username)){
  setPlatformStatus(platform,'Use 2–32 letters, numbers, dots, hyphens or underscores.','error');
  return;
 }
 state.active={platform,username};
 state.currentKeys=[];state.scope='latest';state.shown=10;
 state.busy=true;
 $('verV4Source').value='all';$('verV4Result').value='all';$('verV4Query').value='';
 $('verV4Context').textContent='Searching '+sourceLabel(platform)+' for @'+username+'… Other saved accounts are hidden until you choose All saved games.';
 render();
 const buttons=[$('verV4ChessFind'),$('verV4LichessFind')];
 buttons.forEach(b=>b.disabled=true);
 $(platform==='chesscom'?'verV4ChessFind':'verV4LichessFind').textContent='Searching…';
 setPlatformStatus(platform,'Connecting to '+sourceLabel(platform)+'…','loading');
 try{
  const fresh=platform==='chesscom'?await importChessCom(username):await importLichess(username);
  state.currentKeys=fresh.map(x=>x.key);
  const map=new Map(state.items.map(item=>[item.key,item]));
  for(const item of fresh)map.set(item.key,item);
  state.items=Array.from(map.values()).sort((a,b)=>b.at-a.at).slice(0,MAX_ITEMS);
  // The library has a storage cap; don't promise records that were not retained.
  state.currentKeys=state.currentKeys.filter(k=>state.items.some(x=>x.key===k));
  state.accounts[platform]=username;
  persist();
  if(fresh.length){
   const message='Found '+fresh.length+' finished games for @'+username+'. Select View board or Analyse below.';
   setPlatformStatus(platform,message,'ok');$('verV4Context').textContent=message;
  }else{
   const message='No finished standard games returned for @'+username+'. Previous saved games are hidden from this search.';
   setPlatformStatus(platform,message,'error');$('verV4Context').textContent=message;
  }
 }catch(err){
  const message='Could not load @'+username+': '+(err?.message||String(err));
  setPlatformStatus(platform,message,'error');
  $('verV4Context').textContent=message+' Your previous saved games are safe. Choose All saved games to view them.';
 }finally{
  state.busy=false;
  buttons.forEach(b=>b.disabled=false);
  $('verV4ChessFind').textContent='Find Chess.com games';
  $('verV4LichessFind').textContent='Find Lichess games';
  render();
 }
}
$('verV4ChessForm').addEventListener('submit',e=>findGames('chesscom',e));
$('verV4LichessForm').addEventListener('submit',e=>findGames('lichess',e));
$('verV4All').addEventListener('click',()=>switchScope('all'));
$('verV4Latest').addEventListener('click',()=>switchScope('latest'));
for(const id of ['verV4Source','verV4Result','verV4Query'])$(id).addEventListener(id==='verV4Query'?'input':'change',()=>{state.shown=10;render();});
$('verV4More').addEventListener('click',()=>{state.shown+=10;render();});
$('verV4Clear').addEventListener('click',()=>{
 if(state.busy)return;
 if(!window.confirm('Clear saved public PGNs from this browser? Original accounts and online games will not be affected.'))return;
 state.items=[];state.currentKeys=[];state.active=null;state.scope='all';state.shown=10;
 persist();switchScope('all');
 $('verV4Context').textContent='Local games cleared. Both platforms are ready for a new search.';
});
loadSaved();
$('verV4ChessUsername').value=state.accounts.chesscom||'';
$('verV4LichessUsername').value=state.accounts.lichess||'';
render();setView('games');
window.VERChessLibraryV4={
 version:'5.1-streamlined-workflow',
 openGames:()=>setView('games'),
 openImportedPgn:()=>{
  state.selected=null;
  $('verV4ReviewName').textContent='Imported PGN';
  $('verV4ReviewMeta').textContent='Completed game · Review on your board';
  setView('board');
 }
};
})();