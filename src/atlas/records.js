import {topicById} from './topics.js';
export function sanitizeStudies(value){
 const out={};
 if(!value||typeof value!=='object'||Array.isArray(value))return out;
 for(const [id,input] of Object.entries(value)){
  const t=Object.hasOwn(topicById,id)?topicById[id]:null;if(!t||!input||typeof input!=='object')continue;
  const stages={};
  t.stages.forEach((s,i)=>{const r=input.stages?.[i];if(!r||typeof r!=='object')return;
   stages[i]={note:typeof r.note==='string'?r.note.slice(0,12000):'',checks:Array.isArray(r.checks)?[...new Set(r.checks.filter(x=>Number.isInteger(x)&&x>=0&&x<s.checks.length))]:[]};
  });
  out[id]={stages,last:Number.isInteger(input.last)&&input.last>=0&&input.last<t.stages.length?input.last:0};
 }
 return out;
}
