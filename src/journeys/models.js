export const purchaseScores=[.94,.88,.83,.79,.76,.7,.66,.6,.55,.49,.44,.4,.35,.29,.25,.19,.15,.1,.07,.03];
export const marketingData=purchaseScores.map((score,i)=>({id:'V'+String(i+1).padStart(2,'0'),score,label:[0,1,2,4,7,11,16].includes(i)?1:0,group:i%2?'回访':'新客'}));
export const heldoutData=purchaseScores.map((score,i)=>({id:'T'+String(i+1).padStart(2,'0'),score:Math.max(0,score-.03*(i%3)),label:[1,3,4,8,12,17].includes(i)?1:0,group:i%2?'回访':'新客'}));
export function classification(rows,threshold,fpCost=2,fnCost=5){
 let tp=0,fp=0,tn=0,fn=0;
 for(const r of rows){if(r.score>=threshold){if(r.label)tp++;else fp++;}else if(r.label)fn++;else tn++;}
 return {tp,fp,tn,fn,precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,cost:fp*fpCost+fn*fnCost,count:tp+fp};
}
export function requestRace({slow=900,fast=200,guard=false,fail=false}){
 const events=[{query:'猫粮',issued:0,end:slow,id:1},{query:'猫砂',issued:80,end:80+fast,id:2}].sort((a,b)=>a.end-b.end);
 let shown='';
 return events.map(e=>{const applied=(!guard||e.id===2)&&!(fail&&e.id===2);if(applied)shown=e.query;return {...e,applied,error:fail&&e.id===2,shown};});
}
export function couponRegression(fix){
 function simulate(keys,interleaved){let balance=2;const seen=new Set(),trace=[];
  const operations=keys.map(key=>({key,allowed:true}));
  if(fix==='check'&&interleaved)operations.forEach(op=>{op.allowed=!seen.has(op.key);trace.push(`查询 ${op.key}: ${op.allowed?'不存在':'已存在'}`);});
  for(const op of operations){const allowed=fix==='atomic'?!seen.has(op.key):fix==='check'?(interleaved?op.allowed:!seen.has(op.key)):true;if(allowed){balance--;seen.add(op.key);}trace.push(`${op.key}: ${allowed?'扣减':'复用结果'}，余额 ${balance}`);}
  return {balance,trace};
 }
 return [[['A','A'],false,1],[['A','B'],false,0],[['A','A'],true,1]].map(([keys,interleaved,expected])=>{const result=simulate(keys,interleaved);return {...result,expected,ok:result.balance===expected};});
}
export const GRID=5,WALLS=[6,7,12,17],START=20,GOAL=4;
export function transition(s,a,{shortcut=-3,changed=false}={}){
 const wall=changed?[...WALLS,3]:WALLS;
 const x=s%GRID,y=Math.floor(s/GRID),[dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][a];
 const nx=x+dx,ny=y+dy;
 const next=nx<0||nx>=GRID||ny<0||ny>=GRID||wall.includes(ny*GRID+nx)?s:ny*GRID+nx;
 return {next,reward:next===GOAL?10:next===13?shortcut:-1,done:next===GOAL};
}
export function random(seed){let a=seed>>>0;return()=>{a=(1664525*a+1013904223)>>>0;return a/4294967296;};}
export function greedy(q,s){return q[s].indexOf(Math.max(...q[s]));}
export function trainQ(episodes=180,epsilon=.25,shortcut=-3,seed=42){
 const q=Array.from({length:25},()=>[0,0,0,0]),rng=random(seed),returns=[];
 for(let ep=0;ep<episodes;ep++){let s=START,total=0;for(let k=0;k<80;k++){const a=rng()<epsilon?Math.floor(rng()*4):greedy(q,s),t=transition(s,a,{shortcut});q[s][a]+=.3*(t.reward+(t.done?0:.9*Math.max(...q[t.next]))-q[s][a]);total+=t.reward;s=t.next;if(t.done)break;}returns.push(total);}
 return {q,returns,epsilon,shortcut,seed};
}
export function rollout(q,config={}){let s=START,total=0;const path=[s];for(let i=0;i<35;i++){const t=transition(s,greedy(q,s),config);total+=t.reward;s=t.next;path.push(s);if(t.done)return{path,total,success:true};}return{path,total,success:false};}
export const documents=[
 {id:'P-2024',title:'退货规则 · 旧版',current:false,text:'普通商品和定制商品均可申请七天无理由退货。'},
 {id:'P-2026',title:'退货规则 · 现行',current:true,text:'普通商品签收后七天内可申请无理由退货；定制商品不适用七天无理由。质量问题需人工审核。'},
 {id:'S-2026',title:'物流说明 · 现行',current:true,text:'发货后可使用订单号查询物流；配送延迟请联系客服。'}
];
export function retrieve(query,currentOnly=true){const terms=['定制','退货','七天','无理由','物流','质量'].filter(w=>query.includes(w));return documents.filter(d=>!currentOnly||d.current).map(d=>({...d,score:terms.filter(w=>d.text.includes(w)).length})).filter(d=>d.score>0).sort((a,b)=>b.score-a.score);}
export function validateTicket(value){try{const obj=JSON.parse(value);if(!obj||typeof obj!=='object'||Array.isArray(obj))return['根节点必须是对象'];const errors=[];if(typeof obj.order_id!=='string'||!/^N\d{4}$/.test(obj.order_id))errors.push('order_id 必须是 N 加四位数字的字符串');if(!['quality','delivery'].includes(obj.reason))errors.push('reason 只能是 quality 或 delivery');for(const key of Object.keys(obj))if(!['order_id','reason'].includes(key))errors.push('未允许的参数：'+key);return errors;}catch{return['不是有效 JSON'];}}
