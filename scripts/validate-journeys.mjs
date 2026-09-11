import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {classification,marketingData,requestRace,couponRegression,transition,trainQ,rollout,retrieve,validateTicket} from '../src/journeys/models.js';
import {initialize,forward,encode,gradients,trainEpoch,evaluate,reviews,vocabulary,attention,validModel} from '../src/journeys/dl-model.js';
import {sanitizeJourneys} from '../src/journeys/records.js';
import {journeys} from '../src/journeys/catalog.js';
import {byId} from '../src/data/index.js';
import {empty,validateImport} from '../src/state.js';

const model=initialize(42),x=encode('质量不错'),y=1,g=gradients(model,x,y),eps=1e-5;
const loss=m=>-Math.log(forward(m,x).p);
const checkGradient=(get,set,expected)=>{const original=get();set(original+eps);const plus=loss(model);set(original-eps);const minus=loss(model);set(original);assert(Math.abs((plus-minus)/(2*eps)-expected)<1e-7);};
for(let i=0;i<16;i++)for(let j=0;j<8;j++)checkGradient(()=>model.w1[i][j],v=>model.w1[i][j]=v,g.w1[i][j]);
for(let j=0;j<8;j++){checkGradient(()=>model.b1[j],v=>model.b1[j]=v,g.b1[j]);checkGradient(()=>model.w2[j],v=>model.w2[j]=v,g.w2[j]);}
checkGradient(()=>model.b2,v=>model.b2=v,g.b2);
const first=evaluate(model,reviews.filter(r=>r.split==='train')).loss;
const twin=initialize(42),history=[];let best=null,bestLoss=Infinity;
for(let epoch=1;epoch<=100;epoch++){const result=trainEpoch(model,.3);trainEpoch(twin,.3);history.push({epoch,...result});if(result.valid<bestLoss){bestLoss=result.valid;best={epoch,model:structuredClone(model)};}}
assert(history.at(-1).train<first*.5);assert.deepEqual(model,twin);assert(validModel(model));assert(!validModel({w1:{length:16}}));
// Changing held-out labels must never change a gradient update.
const a=initialize(7),b=initialize(7);trainEpoch(a,.2);
const heldout=reviews.filter(r=>r.split!=='train');heldout.forEach(r=>r.label=1-r.label);trainEpoch(b,.2);heldout.forEach(r=>r.label=1-r.label);assert.deepEqual(a,b);
const weights=attention([1,0],[[1,0],[0,1],[-1,0]]);assert(Math.abs(weights.reduce((a,b)=>a+b)-1)<1e-12);assert(weights[0]>weights[1]&&weights[1]>weights[2]);

const c=classification([{score:.8,label:1},{score:.8,label:0},{score:.2,label:1},{score:.2,label:0}],.5,2,5);
assert.deepEqual([c.tp,c.fp,c.fn,c.tn,c.cost],[1,1,1,1,7]);assert.equal(classification(marketingData,1).precision,null);assert.equal(classification(marketingData,0).count,20);
assert.equal(requestRace({}).at(-1).shown,'猫粮');assert.equal(requestRace({guard:true}).at(-1).shown,'猫砂');assert.equal(requestRace({guard:true,fail:true}).at(-1).shown,'');
assert.equal(requestRace({slow:100,fast:1000}).at(-1).shown,'猫砂');
assert(couponRegression('atomic').every(r=>r.ok));assert(!couponRegression('client')[0].ok);assert(!couponRegression('check')[2].ok);assert(couponRegression('check')[0].ok);
assert.deepEqual(transition(0,0),{next:0,reward:-1,done:false});assert.deepEqual(transition(3,1),{next:4,reward:10,done:true});
const qRun=trainQ();assert.deepEqual(qRun,trainQ());assert(rollout(qRun.q).success);assert.deepEqual(qRun.q[4],[0,0,0,0]);assert(!rollout(trainQ(180,.25,5).q,{shortcut:5}).success);
assert(retrieve('定制退货',true).every(r=>r.current));assert.equal(retrieve('完全未知请求',true).length,0);
assert.equal(validateTicket('{"order_id":"N0104","reason":"quality"}').length,0);assert.equal(validateTicket('{"order_id":104,"reason":"refund","auto_refund":true}').length,3);

const record={version:1,stage:7,note:'下次检查否定句',evidence:{0:{summary:'确认任务',at:1}},data:{accepted:true,runs:[{lr:.3,seed:42,at:1,epochs:100,history,best,model}],chosen:{model:best.model,epoch:best.epoch,lr:.3,seed:42},testReport:{...evaluate(best.model,reviews.filter(r=>r.split==='test')),at:1}}};
assert.deepEqual(sanitizeJourneys({dl:record}).dl,record);
const bad=sanitizeJourneys({dl:{...record,data:{runs:[{}],chosen:{model:{}},testReport:{predictions:42},queryIndex:99}},rl:{version:1,data:{qRun:{q:12},path:[],epsilon:'oops'},stage:900}});
assert.deepEqual(bad.dl.data,{runs:[]});assert.deepEqual(bad.rl.data,{});assert.equal(bad.rl.stage,3);
const old=empty();delete old.journeys;old.lessons['py-values']={completed:123};assert.equal(validateImport(old).lessons['py-values'].completed,123);
const restored=validateImport({...old,journeys:{dl:record},lastJourney:'dl'});assert.equal(restored.lastJourney,'dl');assert.deepEqual(restored.journeys.dl,record);
for(const [id,j] of Object.entries(journeys)){assert.equal(j.stages.length,j.lessons.length);assert.equal(j.stages.length,j.outputs.length);for(const lid of j.lessons)assert.equal(byId[lid]?.domain,id);}
const python=process.env.PYTHON||'python';
const result=spawnSync(python,['public/learning/comment-classifier.py','--describe'],{encoding:'utf8'});if(result.error)throw result.error;assert.equal(result.status,0,result.stderr);
const description=JSON.parse(result.stdout);assert.deepEqual(description.vocabulary,vocabulary);for(const split of ['train','valid','test'])assert.equal(description.counts[split],reviews.filter(r=>r.split===split).length);
const script=fs.readFileSync('public/learning/comment-classifier.py','utf8');assert(!script.includes('__DATA__'));
console.log('Journey validation passed: 145 finite-difference gradients; actual training and held-out isolation; threshold metrics; request races; idempotency interleavings; Q-learning; evidence and JSON checks; backup compatibility; standalone script/data parity.');
