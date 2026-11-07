/* VER Chess Intelligence v4 — public username game library.
   Independent, free browser-only integration. No OAuth token, private data or API key.
   Stockfish analysis continues through the existing local engine and PGN importer.
*/
(function(){
'use strict';
if(window.VERChessLibraryV4)return;
const host=document.querySelector('aside.right');
if(!host || typeof window.importText!=='function' || typeof window.runAnalysis!=='function')return;
const STORE='ver-chess-v4-public-library-v1';
const MAX_ITEMS=80;
const MAX_PER_REQUEST=40;
const $=id=>document.getElementById(id);
const state={items:[],accounts:{chesscom:'',lichess:''},busy:false,shown:10};
const css=document.createElement('style');
css.textContent=[
'.verv4-panel{border-color:#b5c98a42}',
'.verv4-panel .body{display:grid;gap:11px}',
'.verv4-intro{font-size:12px;color:#b8ccba;line-height:1.6;margin:0}',
'.verv4-search{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr) auto;gap:7px}',
'.verv4-search .btn{white-space:nowrap}',
'.verv4-status{font-size:11px;color:#d5d7ba;min-height:17px;line-height:1.5}',
'.verv4-filters{display:grid;grid-template-columns:1fr 1fr;gap:7px}',
'.verv4-filters input{grid-column:1/-1}',
'.verv4-summary{display:flex;gap:6px;flex-wrap:wrap}',
'.verv4-summary span{padding:6px 8px;font-size:11px;border-radius:8px;background:#0b251c;border:1px solid #68836c50;color:#d6e6d6}',
'.verv4-list{display:grid;gap:8px;max-height:450px;overflow-y:auto;scrollbar-color:#4c7058 transparent}',
'.verv4-game{display:flex;flex-direction:column;gap:8px;border:1px solid #58746063;border-radius:12px;padding:11px;background:#10261f}',
'.verv4-game-main{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}',
'.verv4-game-main strong{font-size:12px;font-weight:680;line-height:1.5;display:block;overflow-wrap:anywhere}',
'.verv4-game-main small{font-size:10px;color:#b7cbb6;display:block;margin-top:3px;line-height:1.5}',
'.verv4-result{font-size:10px;flex:none;border:1px solid #bfcf9e66;border-radius:999px;padding:4px 8px;color:#f1dfae}',
'.verv4-result.win{color:#b9f2c1;border-color:#76b48b88}',
'.verv4-result.loss{color:#f4aaaa;border-color:#bb777788}',
'.verv4-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}',
'.verv4-actions button{flex:1;min-width:95px}',
'.verv4-actions a{color:#ddca92;font-size:11px;white-space:nowrap;padding:5px}',
'.verv4-actions a:focus-visible,.verv4-game button:focus-visible{outline:2px solid #e5c77d;outline-offset:2px}',
'.verv4-tail{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}',
'.verv4-tail .hint{max-width:240px}',
'.verv4-empty{border:1px dashed #6a8a725c;padding:14px;border-radius:10px;font-size:12px;color:#a9c0ac}',
'@media(max-width:430px){.verv4-search{grid-template-columns:1fr 1fr}.verv4-search input{grid-column:1/-1}.verv4-search button{grid-column:1/-1}.verv4-actions button{min-width:100px}.verv4-panel .body{gap:10px}}'
].join('\n');
document.head.append(css);
const panel=document.createElement('section');
panel.className='panel verv4-panel';
panel.setAttribute('aria-label','Public chess game library');
panel.innerHTML=[
'<div class="panel-head"><h2>00 / Your game library</h2><span class="sub">Chess.com + Lichess · Free</span></div>',
'<div class="body">',
'<p class="verv4-intro">Enter a public chess username. Find finished games on either platform and keep them together here. No password or paid API needed.</p>',
'<form id="verV4Form" class="verv4-search">',
'<select id="verV4Platform" aria-label="Chess platform"><option value="chesscom">Chess.com</option><option value="lichess">Lichess</option></select>',
'<input id="verV4Username" type="text" aria-label="Public chess username" maxlength="32" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Player username" required />',
'<button type="submit" class="btn btn-gold" id="verV4Find">Find games</button>',
'</form>',
'<div id="verV4Status" class="verv4-status" role="status" aria-live="polite">Ready to search public finished games.</div>',
'<div class="verv4-summary" id="verV4Summary" aria-label="Library statistics"></div>',
'<div class="verv4-filters">',
'<select id="verV4Source" aria-label="Filter by platform"><option value="all">Both platforms</option><option value="chesscom">Chess.com</option><option value="lichess">Lichess</option></select>',
'<select id="verV4Result" aria-label="Filter by result"><option value="all">All results</option><option value="win">Wins</option><option value="loss">Losses</option><option value="draw">Draws</option></select>',
'<input id="verV4Query" type="text" aria-label="Search games" placeholder="Search opponent or opening…" />',
'</div>',
'<div class="verv4-list" id="verV4List" aria-live="polite"></div>',
'<div class="verv4-tail"><button class="btn btn-quiet" id="verV4More" hidden>Show more games</button><button class="btn btn-quiet" id="verV4Clear" type="button">Clear saved games</button></div>',
'<p class="hint">Public completed games only. Only your search username goes to the selected chess platform. Imported PGNs stay in this browser; Stockfish analysis stays on your device. Requests need internet.</p>',
'</div>'
].join('');
host.insertBefore(panel,host.firstChild);
function status(message){$('verV4Status').textContent=message;}
function keyFor(platform,source,pgn){
 const id=String(source||'').trim().toLowerCase();
 if(id)return platform+':'+id;
 let hash=2166136261;
 for(let i=0;i<pgn.length;i++){hash^=pgn.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return platform+':pgn:'+String(hash>>>0);
}
function headersOf(pgn){
 const h={};
 const re=/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\s*\]\s*$/gm;
 let m;
 while((m=re.exec(pgn))!==null)h[m[1]]=m[2].replace(/\\"/g,'"');
 return h;
}
function pgnParts(text){
 const clean=String(text||'').replace(/^\uFEFF/,'').trim();
 if(!clean)return [];
 return clean.split(/(?=^\[Event\s+")/gm).map(x=>x.trim()).filter(x=>x&&/^\s*\[[A-Za-z]+/m.test(x));
}
function standardFinished(h){
 if(h.Variant && !['standard','chess'].includes(h.Variant.toLowerCase()))return false;
 return ['1-0','0-1','1/2-1/2'].includes(h.Result);
}
function dateFrom(h){
 const d=(h.UTCDate||h.Date||'').replace(/\./g,'-');
 if(!/^\d{4}-\d\d-\d\d$/.test(d))return 0;
 const t=/^\d\d:\d\d:\d\d$/.test(h.UTCTime||'')?h.UTCTime:'00:00:00';
 return Date.parse(d+'T'+t+'Z')||0;
}
function record(platform,username,pgn,source,time,classification){
 const h=headersOf(pgn);
 if(!standardFinished(h) || !pgn.trim())return null;
 const white=String(h.White||'White'),black=String(h.Black||'Black');
 const player=String(username||'').toLowerCase();
 if(white.toLowerCase()!==player && black.toLowerCase()!==player)return null;
 const url=typeof source==='string' && /^https:\/\//i.test(source)?source:(h.Site||'');
 const key=keyFor(platform,url,pgn);
 return {key,platform,username,white,black,result:h.Result,event:String(h.Event||'Game'),opening:String(h.Opening||''),timeClass:String(classification||h.TimeControl||''),url,pgn,at:Number(time)||dateFrom(h)};
}
function outcome(item){
 if(item.result==='1/2-1/2')return 'draw';
 const white=item.white.toLowerCase()===item.username.toLowerCase();
 const won=item.result==='1-0'?white:!white;
 return won?'win':'loss';
}
function loadSaved(){
 try {
  const saved=JSON.parse(localStorage.getItem(STORE)||'null');
  if(saved && Array.isArray(saved.items)){
   state.items=saved.items.filter(x=>x&&typeof x.pgn==='string'&&x.pgn.length<80000&&['lichess','chesscom'].includes(x.platform)&&typeof x.key==='string').slice(0,MAX_ITEMS);
   if(saved.accounts && typeof saved.accounts==='object'){
    for(const k of ['chesscom','lichess'])if(typeof saved.accounts[k]==='string')state.accounts[k]=saved.accounts[k].slice(0,32);
   }
  }
 }catch(_){status('Browser storage unavailable. You can still import games for this session.');}
}
function save(){
 try{localStorage.setItem(STORE,JSON.stringify({items:state.items,accounts:state.accounts}));}
 catch(_){status('Game list is available now, but this browser could not save it offline (storage full or restricted).');}
}
function showDate(ts){
 if(!Number.isFinite(ts)||ts<1)return 'Date unavailable';
 try{return new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}
 catch(_){return 'Date unavailable';}
}
function sourceLabel(x){return x==='chesscom'?'Chess.com':'Lichess';}
function safeGameUrl(item){
 try{
  const u=new URL(item.url);
  if(u.protocol!=='https:')return '';
  if(item.platform==='lichess' && ['lichess.org','www.lichess.org'].includes(u.hostname))return u.href;
  if(item.platform==='chesscom' && ['chess.com','www.chess.com'].includes(u.hostname))return u.href;
 }catch(_){}
 return '';
}
function filtered(){
 const src=$('verV4Source').value,res=$('verV4Result').value,q=$('verV4Query').value.toLowerCase().trim();
 return state.items.filter(x=>(src==='all'||x.platform===src)&&(res==='all'||outcome(x)===res)&&(!q||[x.white,x.black,x.opening,x.event,x.username].some(t=>String(t).toLowerCase().includes(q))));
}
function addText(parent,tag,content,cls){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 el.textContent=content;
 parent.append(el);
 return el;
}
function showItem(item){
 const row=document.createElement('article');row.className='verv4-game';
 const main=document.createElement('div');main.className='verv4-game-main';
 const desc=document.createElement('div');
 addText(desc,'strong',item.white+' vs '+item.black);
 const kind=sourceLabel(item.platform)+' · '+showDate(item.at)+(item.timeClass?' · '+item.timeClass:'');
 addText(desc,'small',kind);
 if(item.opening)addText(desc,'small',item.opening);
 main.append(desc);
 const result=outcome(item);
 addText(main,'span',result==='win'?'WIN':result==='loss'?'LOSS':'DRAW','verv4-result '+result);
 row.append(main);
 const actions=document.createElement('div');actions.className='verv4-actions';
 const load=document.createElement('button');load.className='btn btn-quiet';load.type='button';load.textContent='Open board';load.addEventListener('click',()=>openGame(item,false));
 const analyse=document.createElement('button');analyse.className='btn btn-gold';analyse.type='button';analyse.textContent='✦ Analyse';analyse.addEventListener('click',()=>openGame(item,true));
 actions.append(load,analyse);
 const url=safeGameUrl(item);
 if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Source';link.setAttribute('aria-label','Open original game on '+sourceLabel(item.platform));actions.append(link);}
 row.append(actions);
 return row;
}
function render(){
 const sum=$('verV4Summary');sum.replaceChildren();
 const counts={win:0,loss:0,draw:0};
 for(const x of state.items)counts[outcome(x)]++;
 for(const t of [state.items.length+' games',counts.win+' wins',counts.loss+' losses',counts.draw+' draws'])addText(sum,'span',t);
 const items=filtered(),list=$('verV4List');list.replaceChildren();
 if(!items.length)addText(list,'p',state.items.length?'No games match those filters.':'Your library is empty. Search a username to get started.','verv4-empty');
 else for(const x of items.slice(0,state.shown))list.append(showItem(x));
 $('verV4More').hidden=items.length<=state.shown;
 $('verV4More').textContent='Show more ('+Math.max(0,items.length-state.shown)+' remaining)';
}
function openGame(item,analyse){
 if(state.busy){status('Finish importing before opening a game.');return;}
 try{
  window.importText(item.pgn);
  status('Opened '+item.white+' vs '+item.black+'. '+(analyse?'Starting local Stockfish review…':'Choose Analyse when you are ready.'));
  if(analyse)window.runAnalysis();
  else $('board').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){status('Could not parse this PGN: '+(err?.message||String(err))+'. Try another standard chess game.');}
}
async function readApi(url,type){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',headers:{Accept:type==='json'?'application/json':'application/x-chess-pgn'},signal:controller.signal});
  if(!response.ok){
   if(response.status===404)throw Error('Player not found or games unavailable (404).');
   if(response.status===429)throw Error('Platform rate limit reached (429). Please try again later.');
   throw Error('Platform returned HTTP '+response.status+'.');
  }
  return type==='json'?await response.json():await response.text();
 }catch(err){
  if(err?.name==='AbortError')throw Error('Request timed out. Try again on a stable connection.');
  if(err instanceof TypeError)throw Error('Network or browser cross-origin (CORS) restriction. Try again online or upload a PGN.');
  throw err;
 }finally{clearTimeout(timer);}
}
async function chessComGames(username){
 const base='https://api.chess.com/pub/player/'+encodeURIComponent(username);
 const index=await readApi(base+'/games/archives','json');
 const archives=Array.isArray(index.archives)?index.archives.slice(-6).reverse():[];
 const out=[];
 for(const raw of archives){
  if(out.length>=MAX_PER_REQUEST)break;
  let u;
  try{u=new URL(raw);}catch(_){continue;}
  if(u.origin!=='https://api.chess.com' || !u.pathname.startsWith('/pub/player/'))continue;
  const result=await readApi(u.href,'json');
  const games=Array.isArray(result.games)?result.games:[];
  for(const g of games){
   if(g.rules && g.rules!=='chess')continue;
   if(!g.pgn || !g.end_time)continue;
   const rec=record('chesscom',username,g.pgn,g.url,g.end_time*1000,g.time_class);
   if(rec)out.push(rec);
  }
  status('Chess.com: checked '+Math.min(6,archives.indexOf(raw)+1)+' monthly archive(s), found '+out.length+' completed standard games…');
 }
 return out.sort((a,b)=>b.at-a.at).slice(0,MAX_PER_REQUEST);
}
async function lichessGames(username){
 const url='https://lichess.org/api/games/user/'+encodeURIComponent(username)+'?max='+MAX_PER_REQUEST+'&clocks=false&evals=false&opening=true';
 const data=await readApi(url,'pgn');
 return pgnParts(data).map(pgn=>{
  const h=headersOf(pgn);
  return record('lichess',username,pgn,h.Site||'',0,h.Event||'');
 }).filter(Boolean).slice(0,MAX_PER_REQUEST);
}
async function searchUser(e){
 e.preventDefault();
 if(state.busy)return;
 const platform=$('verV4Platform').value,username=$('verV4Username').value.trim();
 if(!/^[A-Za-z0-9_.-]{2,32}$/.test(username)){status('Use a valid public username (2–32 letters, numbers, dots, underscores or hyphens).');return;}
 state.busy=true;
 const btn=$('verV4Find');btn.disabled=true;btn.textContent='Finding…';
 status('Fetching '+sourceLabel(platform)+' games for '+username+'…');
 try{
  const incoming=platform==='chesscom'?await chessComGames(username):await lichessGames(username);
  const map=new Map(state.items.map(x=>[x.key,x]));
  for(const item of incoming)map.set(item.key,item);
  state.items=Array.from(map.values()).sort((a,b)=>b.at-a.at).slice(0,MAX_ITEMS);
  state.accounts[platform]=username;
  state.shown=10;
  save();render();
  status(incoming.length?'Found '+incoming.length+' recent public games for '+username+'. Tap Analyse on any game.':'No finished standard games returned for '+username+'. Try a different username or platform.');
 }catch(err){status(sourceLabel(platform)+': '+(err?.message||String(err))+' Your existing library is unchanged.');}
 finally{state.busy=false;btn.disabled=false;btn.textContent='Find games';}
}
$('verV4Form').addEventListener('submit',searchUser);
$('verV4Platform').addEventListener('change',()=>{$('verV4Username').value=state.accounts[$('verV4Platform').value]||'';});
for(const id of ['verV4Source','verV4Result','verV4Query'])$(id).addEventListener(id==='verV4Query'?'input':'change',()=>{state.shown=10;render();});
$('verV4More').addEventListener('click',()=>{state.shown+=10;render();});
$('verV4Clear').addEventListener('click',()=>{
 if(state.busy)return;
 if(!window.confirm('Clear saved public game records from this browser? This will not delete anything on Chess.com or Lichess.'))return;
 state.items=[];state.shown=10;save();render();status('Local game library cleared. Your chess accounts are untouched.');
});
loadSaved();
$('verV4Username').value=state.accounts.chesscom||'';
render();
window.VERChessLibraryV4={version:'4.0-phase1'};
})();