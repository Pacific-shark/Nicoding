import {random} from './models.js';
export const vocabulary=['不错','满意','喜欢','好用','完整','便宜','很差','失望','破损','慢','退货','不好','质量','物流','价格','客服'];
export const encode=text=>vocabulary.map(w=>text.includes(w)?1:0);
const positives=['质量不错','使用很满意','这个很好用','包装完整','我很喜欢','价格便宜，质量不错','客服不错','物流不错'];
const negatives=['质量很差','使用很失望','这个不好用','包装破损','需要退货','价格便宜，效果很差','客服不好','物流很慢'];
export const reviews=['第一次购买：','这次收到：','用了三天：','用了一个月：','朋友收到：','再次购买：'].flatMap((prefix,k)=>[...positives.map(t=>({text:prefix+t,label:1,split:k<3?'train':k===3?'valid':'test'})),...negatives.map(t=>({text:prefix+t,label:0,split:k<3?'train':k===3?'valid':'test'}))]);
// These synthetic holdout sentences expose a bag-of-words limitation, rather than claim real-world generalization.
reviews.push({text:'不是不好用，确实不错',label:1,split:'valid'},{text:'看着不错，用着很失望',label:0,split:'valid'},{text:'不是不满意，我很喜欢',label:1,split:'test'},{text:'物流不错，质量很差',label:0,split:'test'});
export function initialize(seed=42){const rng=random(seed);return{w1:Array.from({length:16},()=>Array.from({length:8},()=> (rng()-.5)*.6)),b1:Array(8).fill(0),w2:Array.from({length:8},()=> (rng()-.5)*.6),b2:0};}
export function forward(model,x){const h=model.b1.map((b,j)=>Math.tanh(b+x.reduce((s,v,i)=>s+v*model.w1[i][j],0)));const z=model.b2+h.reduce((s,v,j)=>s+v*model.w2[j],0);return{h,p:1/(1+Math.exp(-Math.max(-40,Math.min(40,z))))};}
export function gradients(model,x,y){const {h,p}=forward(model,x),dz=p-y,dh=h.map((v,j)=>dz*model.w2[j]*(1-v*v));return{w1:x.map(v=>dh.map(g=>g*v)),b1:dh,w2:h.map(v=>dz*v),b2:dz};}
export function update(model,g,lr){for(let i=0;i<16;i++)for(let j=0;j<8;j++)model.w1[i][j]-=lr*g.w1[i][j];for(let j=0;j<8;j++){model.b1[j]-=lr*g.b1[j];model.w2[j]-=lr*g.w2[j];}model.b2-=lr*g.b2;}
export function evaluate(model,rows){let loss=0,right=0;const predictions=rows.map(r=>{const p=forward(model,encode(r.text)).p;loss-=r.label*Math.log(Math.max(1e-9,p))+(1-r.label)*Math.log(Math.max(1e-9,1-p));if((p>=.5?1:0)===r.label)right++;return{...r,score:p};});return{loss:loss/rows.length,accuracy:right/rows.length,predictions};}
export function trainEpoch(model,lr){const rows=reviews.filter(r=>r.split==='train');const avg={w1:Array.from({length:16},()=>Array(8).fill(0)),b1:Array(8).fill(0),w2:Array(8).fill(0),b2:0};for(const r of rows){const g=gradients(model,encode(r.text),r.label);for(let i=0;i<16;i++)for(let j=0;j<8;j++)avg.w1[i][j]+=g.w1[i][j]/rows.length;for(let j=0;j<8;j++){avg.b1[j]+=g.b1[j]/rows.length;avg.w2[j]+=g.w2[j]/rows.length;}avg.b2+=g.b2/rows.length;}update(model,avg,lr);return{train:evaluate(model,rows).loss,valid:evaluate(model,reviews.filter(r=>r.split==='valid')).loss};}
export function softmax(scores){const max=Math.max(...scores),es=scores.map(x=>Math.exp(x-max)),sum=es.reduce((a,b)=>a+b,0);return es.map(x=>x/sum);}
export function attention(query,keys){return softmax(keys.map(k=>k.reduce((s,v,i)=>s+v*query[i],0)/Math.sqrt(query.length)));}
export function validModel(m){return !!m&&Array.isArray(m.w1)&&m.w1.length===16&&m.w1.every(r=>Array.isArray(r)&&r.length===8&&r.every(Number.isFinite))&&Array.isArray(m.b1)&&m.b1.length===8&&m.b1.every(Number.isFinite)&&Array.isArray(m.w2)&&m.w2.length===8&&m.w2.every(Number.isFinite)&&Number.isFinite(m.b2);}
