import {COURSE,PROTOCOL,DATA_SHA,fresh,units} from './registry.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x,n=6000)=>typeof x==='string'?x.slice(0,n):'';
const num=x=>Number.isFinite(x)&&Math.abs(x)<=Number.MAX_SAFE_INTEGER;
const array=(x,n)=>Array.isArray(x)&&x.length<=n;
export function validRun(r){
 return object(r)&&r.version===1&&r.protocol===PROTOCOL&&r.datasetSha256===DATA_SHA&&typeof r.id==='string'&&r.id.length<100&&num(r.at)&&
 object(r.config)&&num(r.config.lr)&&r.config.lr>=.01&&r.config.lr<=1&&num(r.config.l2)&&r.config.l2>=0&&r.config.l2<=1&&Number.isInteger(r.config.epochs)&&r.config.epochs>=10&&r.config.epochs<=400&&typeof r.config.categorical==='boolean'&&
 object(r.counts)&&['train','valid','test'].every(k=>Number.isInteger(r.counts[k])&&r.counts[k]>0)&&Object.values(r.counts).reduce((a,b)=>a+b,0)===4521&&
 object(r.prep)&&array(r.prep.mean,3)&&r.prep.mean.length===3&&r.prep.mean.every(num)&&array(r.prep.scale,3)&&r.prep.scale.length===3&&r.prep.scale.every(x=>num(x)&&x>0)&&
 object(r.prep.categories)&&Object.keys(r.prep.categories).every(k=>['job','marital','education','housing','loan','poutcome'].includes(k))&&Object.values(r.prep.categories).every(v=>array(v,30)&&v.every(x=>typeof x==='string'&&x.length<60))&&
 array(r.prep.features,100)&&r.prep.features.every(x=>typeof x==='string'&&x.length<100)&&array(r.weights,100)&&r.weights.length===r.prep.features.length&&r.weights.length===3+Object.values(r.prep.categories).reduce((s,a)=>s+a.length,0)&&r.weights.every(num)&&num(r.bias)&&
 array(r.history,42)&&r.history.length>=2&&r.history.every(h=>object(h)&&num(h.epoch)&&num(h.train)&&num(h.valid))&&num(r.trainRate)&&r.trainRate>=0&&r.trainRate<=1&&
 array(r.predictions,4521)&&r.predictions.length===r.counts.valid&&r.predictions.every(p=>object(p)&&Number.isInteger(p.id)&&p.id>0&&p.id<=4521&&(p.y===0||p.y===1)&&num(p.p)&&p.p>=0&&p.p<=1&&['age','balance','previous'].every(k=>num(p[k])))&&num(r.seconds);
}
const policy=p=>object(p)&&num(p.threshold)&&p.threshold>=0&&p.threshold<=1&&num(p.fpCost)&&p.fpCost>=0&&p.fpCost<=100&&num(p.fnCost)&&p.fnCost>=0&&p.fnCost<=100;
export function sanitizeCourses(input){
 const r=input?.[COURSE];if(!object(r)||r.version!==1)return {};
 const out=fresh();
 out.last=units.some(u=>u.id===r.last)?r.last:undefined;
 for(const u of units){
  if(r.read?.[u.id]===true)out.read[u.id]=true;
  const a=r.answers?.[u.id];if(object(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3)out.answers[u.id]={choice:a.choice,checked:a.checked===true};
  if(typeof r.notes?.[u.id]==='string')out.notes[u.id]=text(r.notes[u.id]);
  if(!u.task)continue;const t=r.tasks?.[u.task];if(!object(t))continue;
  const next={code:text(t.code,50000),hints:Math.min(3,Math.max(0,Math.floor(t.hints)||0)),solutionSeen:!!t.solutionSeen};
  const aResult=t.result;if(object(aResult)&&aResult.version===1){
   const checks=(Array.isArray(aResult.checks)?aResult.checks:[]).slice(0,4).map(c=>({ok:c?.ok===true,error:text(c?.error,1500)}));
   next.result={version:1,code:text(aResult.code,50000),output:text(aResult.output,16000),error:text(aResult.error,4000),verified:aResult.verified===true,checks,ok:aResult.verified===true&&!aResult.error&&checks.length===4&&checks.every(c=>c.ok),at:num(aResult.at)?aResult.at:0};
  }out.tasks[u.task]=next;
 }
 out.hypothesis=text(r.hypothesis);out.comparison=text(r.comparison);
 out.runs=(Array.isArray(r.runs)?r.runs:[]).filter(validRun).slice(-4).map(run=>({...run,hypothesis:text(run.hypothesis)}));
 out.selected=out.runs.some(x=>x.id===r.selected)?r.selected:out.runs.at(-1)?.id||'';
 if(policy(r.policy))out.policy={threshold:r.policy.threshold,fpCost:r.policy.fpCost,fnCost:r.policy.fnCost};
 if(object(r.frozen)&&validRun(r.frozen.run)&&policy(r.frozen.policy)&&num(r.frozen.at))out.frozen={run:r.frozen.run,policy:r.frozen.policy,at:r.frozen.at,datasetSha256:DATA_SHA};
 out.testSeen=r.testSeen===true;
 if(out.frozen&&object(r.report)&&r.report.frozenAt===out.frozen.at&&object(r.report.metrics)&&['tp','fp','tn','fn','n','cost','selected','accuracy','logloss'].every(k=>num(r.report.metrics[k]))&&['precision','recall'].every(k=>r.report.metrics[k]===null||num(r.report.metrics[k])))out.report={metrics:r.report.metrics,frozenAt:r.report.frozenAt,at:num(r.report.at)?r.report.at:0,exploratory:!!r.report.exploratory};
 if(out.report)out.testSeen=true;
 return {[COURSE]:out};
}
