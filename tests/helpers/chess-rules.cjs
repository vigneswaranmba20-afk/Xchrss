// Run the actual production rule implementation without initializing DOM/engine UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.resolve(__dirname,'../../index.html'),'utf8');
const start=html.indexOf('const START_FEN='),end=html.indexOf('const $=id=>document.getElementById(id);',start);
if(start<0||end<start)throw Error('Production rules boundary changed; inspect the fixture loader');
module.exports=vm.runInNewContext(html.slice(start,end)+';({parseFen,fen,findUci,apply,san,legal,uci,idx,checked})');
