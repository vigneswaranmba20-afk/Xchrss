/* VER Chess v7.4 foundation: exact-position lesson suggestions only.
 * No engine evaluation, inferred tactics, game mutation or persistence. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.VERChessLessonMatch=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
'use strict';
function positionKey(fen){
  if(typeof fen!=='string')return null;
  const fields=fen.trim().split(/\s+/);
  if(fields.length<2||!['w','b'].includes(fields[1]))return null;
  const rows=fields[0].split('/');
  if(rows.length!==8)return null;
  for(const row of rows){
    let width=0;
    for(const c of row){
      if(/[1-8]/.test(c))width+=Number(c);
      else if(/[pnbrqkPNBRQK]/.test(c))width++;
      else return null;
    }
    if(width!==8)return null;
  }
  return fields[0]+' '+fields[1];
}
function matchExactPosition(fen,lessons){
  const key=positionKey(fen);
  if(!key||!Array.isArray(lessons))return [];
  return lessons.filter(lesson=>lesson&&typeof lesson.id==='string'&&positionKey(lesson.fen)===key)
    .map(lesson=>Object.freeze({id:lesson.id,name:String(lesson.name||lesson.id),reason:'Exact piece placement and side to move; not a tactical evaluation.'}));
}
return Object.freeze({positionKey,matchExactPosition});
});
