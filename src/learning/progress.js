const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const text=(value,max=20000)=>typeof value==='string'?value.slice(0,max):'';
const number=value=>Number.isFinite(value)&&value>=0?value:0;
const bools=(value,keys)=>Object.fromEntries(keys.filter(key=>value?.[key]===true).map(key=>[key,true]));
export function sanitizeUnits(value) {
 const record=value?.['py-references'];
 if(!object(record)||record.version!==1)return {};
 const out={version:1,chapter:Math.min(5,Math.floor(number(record.chapter))),
  observations:bools(record.observations,['binding','shallow','deep','defaults-bug','defaults-fixed']),
  answers:{},tasks:{},experiments:{},reflection:{text:text(record.reflection?.text),checks:[...new Set((Array.isArray(record.reflection?.checks)?record.reflection.checks:[]).filter(x=>Number.isInteger(x)&&x>=0&&x<3))]},completedAt:number(record.completedAt)};
 for(const [id,correct] of Object.entries({binding:1,copy:2,defaults:0,transfer:1})){
  const a=record.answers?.[id];if(!object(a))continue;
  const choice=Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3?a.choice:null;
  out.answers[id]={choice,checked:!!a.checked,correct:!!a.checked&&choice===correct,attempts:Math.min(10000,number(a.attempts)),firstCorrect:typeof a.firstCorrect==='boolean'?a.firstCorrect:null};
 }
 for(const id of ['collect','tag']){
  const task=record.tasks?.[id];if(!object(task))continue;
  out.tasks[id]={code:text(task.code,50000),hints:Math.min(3,number(task.hints)),solutionSeen:!!task.solutionSeen};
  const r=task.result;
  if(object(r)&&r.version===1){
   const checks=(Array.isArray(r.checks)?r.checks:[]).slice(0,4).map(c=>({ok:!!c?.ok,error:text(c?.error,1500)}));
   out.tasks[id].result={version:1,code:text(r.code,50000),output:text(r.output,16000),error:text(r.error,4000),checks,ok:r.verified===true&&!r.error&&checks.length===4&&checks.every(c=>c.ok),verified:!!r.verified,at:number(r.at)};
  }
 }
 for(const key of ['binding','shallow','deep'])out.experiments[key]=Math.min(4,Math.floor(number(record.experiments?.[key]??2)));
 out.experiments.copyMode=record.experiments?.copyMode==='deep'?'deep':'shallow';
 out.experiments.defaultMode=record.experiments?.defaultMode==='fixed'?'fixed':'bug';
 for(const key of ['bugCalls','fixedCalls'])out.experiments[key]=(Array.isArray(record.experiments?.[key])?record.experiments[key]:[]).filter(x=>typeof x==='string'&&x.trim()).slice(0,6).map(x=>x.slice(0,20));
 return {'py-references':out};
}
