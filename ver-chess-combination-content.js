/* Original VER teaching position. No book diagram or external service required. */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.VERChessCombinationContent=api;
})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const id='deflection-fork',name='Lure, then fork';
 const fen='3q2k1/8/5P2/4N3/8/8/8/K6R w - - 0 1';
 const defenses=Object.freeze({kh7:'h8h7',kg8:'h8g8'});
 const freezeState=s=>Object.freeze({...s,b:Object.freeze(s.b.slice())});
 function build(rules,defense='kh7'){
  if(!Object.hasOwn(defenses,defense))throw Error('Unknown defensive line');
  const moves=['h1h8','g8h8','e5f7',defenses[defense],'f7d8'];
  const expected=['Rh8+','Kxh8','Nf7+',defense==='kh7'?'Kh7':'Kg8','Nxd8'];
  const states=[freezeState(rules.parseFen(fen))],plies=[];
  for(const [i,uci] of moves.entries()){
   const before=states.at(-1),move=rules.findUci(before,uci);
   if(!move)throw Error('Illegal combination move '+uci);
   const san=rules.san(before,move);
   if(san!==expected[i])throw Error('Combination notation mismatch: '+san);
   plies.push(Object.freeze({uci,san,capture:before.b[rules.idx(uci.slice(2,4))]!=='.'}));
   states.push(freezeState(rules.apply(before,move)));
  }
  const reply=expected[3];
  const text=[
   'White to move. Look for a forcing first move.',
   '1. Rh8+ — offer the rook to draw the king onto h8.',
   '1…Kxh8 — the king takes the rook. Now look for a checking knight fork.',
   '2. Nf7+ — check the king and attack the queen on d8 at the same time.',
   '2…'+reply+' — the king escapes check, but the queen is still attacked.',
   '3. Nxd8 — take the queen. The rook was exchanged for a queen.'
  ];
  const detail=[
   'The king on g8 is not checked by Nf7. The first move needs to change the king’s square while giving Black no time to save the queen.',
   'Kxh8 is Black’s only legal reply here. The rook bars escape along the eighth rank and down the h-file, the knight covers f7, and the pawn on f6 covers g7. A check from an adjacent rook cannot be blocked.',
   'A lure brings a piece onto an unfavorable square. Here h8 and d8 are both knight targets from f7. Check the geometry before offering material.',
   'A knight check cannot be blocked. Black must deal with the check before moving the queen. Both Kh7 and Kg8 are legal; neither removes the threat to d8.',
   'Compare the other king reply with “Black’s defense” below. The queen capture works in both lines. This is why calculating every legal reply matters.',
   'The combination wins the queen for a rook. The remaining endgame is a separate task; this lesson makes no claim of immediate checkmate. In your games, calculate forcing replies before sacrificing.'
  ];
  return Object.freeze({defense,states:Object.freeze(states),plies:Object.freeze(plies),text:Object.freeze(text),detail:Object.freeze(detail)});
 }
 function verify(rules){
  for(const defense of Object.keys(defenses)){
   const line=build(rules,defense);
   const replies=at=>rules.legal(line.states[at]).map(rules.uci).sort().join(',');
   if(replies(1)!=='g8h8'||replies(3)!=='h8g8,h8h7')throw Error('Unexpected king defense');
   if(line.states[5].b[rules.idx('d8')]!=='N'||line.states[5].b.includes('q'))throw Error('Queen not captured');
  }
  return true;
 }
 return Object.freeze({id,name,fen,defenses,build,verify});
});
