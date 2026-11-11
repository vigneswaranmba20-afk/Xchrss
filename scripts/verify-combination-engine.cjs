// Reproduce the local engine evidence. No API, network call or app dependency.
// node scripts/verify-combination-engine.cjs [output.json]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),assert=require('node:assert/strict');
const content=require('../ver-chess-combination-content.js'),rules=require('../tests/helpers/chess-rules.cjs');
const root=path.resolve(__dirname,'..'),engine=path.join(root,'engine/stockfish-19-lite-single.js');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function analyse(fen,multiPV){return new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,[engine],{cwd:root,stdio:['pipe','pipe','pipe']});
 let buffer='',started=false,done=false;const variations=new Map();
 const timer=setTimeout(()=>{child.kill();reject(Error('Local engine timed out'));},45000);
 const fail=err=>{if(!done){done=true;clearTimeout(timer);child.kill();reject(err);}};
 child.on('error',fail);child.on('exit',code=>{if(!done)fail(Error('Engine exited before bestmove: '+code));});
 child.stdout.on('data',chunk=>{
  buffer+=chunk;let end;
  while((end=buffer.indexOf('\n'))>=0){
   const line=buffer.slice(0,end).trim();buffer=buffer.slice(end+1);
   if(line==='uciok')child.stdin.write('setoption name Hash value 32\nsetoption name MultiPV value '+multiPV+'\nisready\n');
   if(line==='readyok'&&!started){started=true;child.stdin.write('position fen '+fen+'\ngo depth 22\n');}
   const match=line.match(/^info depth (\d+).*?multipv (\d+) score (cp|mate) (-?\d+).*?nodes (\d+).*?time (\d+) pv (.+)$/);
   if(match)variations.set(Number(match[2]),{depth:Number(match[1]),multipv:Number(match[2]),scoreType:match[3],score:Number(match[4]),nodes:Number(match[5]),timeMs:Number(match[6]),pv:match[7].split(' ')});
   if(line.startsWith('bestmove ')){
    done=true;clearTimeout(timer);child.stdin.end('quit\n');
    resolve({fen,scorePerspective:rules.parseFen(fen).t===1?'White':'Black',bestmove:line.split(' ')[1],variations:[...variations.values()].sort((a,b)=>a.multipv-b.multipv)});
   }
  }
 });
 child.stdin.write('uci\n');
});}
(async()=>{
 assert.equal(content.verify(rules),true);
 const initial=await analyse(content.fen,3),fork=await analyse(rules.fen(content.build(rules).states[3]),2);
 assert.equal(initial.bestmove,'h1h8');assert.equal(initial.variations[0].depth,22);
 assert.deepEqual(initial.variations[0].pv.slice(0,5),['h1h8','g8h8','e5f7','h8h7','f7d8']);
 assert.deepEqual(fork.variations.map(v=>v.pv[0]).sort(),['h8g8','h8h7']);
 const evidence={time:new Date().toISOString(),engine:'Bundled Stockfish 19 Lite WASM, one thread, Hash 32 MB, depth 22',
  engineSha256:hash(engine),wasmSha256:hash(path.join(root,'engine/stockfish-19-lite-single.wasm')),
  limitation:'Finite-depth analysis, not a tablebase proof or a claim of immediate mate.',initial,fork};
 const json=JSON.stringify(evidence,null,2)+'\n';if(process.argv[2])fs.writeFileSync(process.argv[2],json);process.stdout.write(json);
})().catch(err=>{console.error(err);process.exitCode=1;});
