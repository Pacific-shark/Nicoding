import {journeys} from './catalog.js';
import {validModel} from './dl-model.js';
const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=Number.isFinite;
const between=(v,min,max)=>finite(v)&&v>=min&&v<=max;
const list=(v,check,min=0,max=500)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(check);
const numberFields={step:[0,60],slow:[100,1500],fast:[100,1000],log:[0,4],x:[-100000,100000],scale:[-2,2],lr:[.01,3],prior:[1,90],threshold:[0,1],fp:[1,10],fn:[1,15],budget:[1,20],shortcut:[-8,5],epsilon:[0,1],return:[-100000,100000],selected:[0,2],window:[0,2],queryIndex:[0,4],masked:[0,3],manual:[.05,.4]};
const stringFields=['input','cause','reason','fix','filter','query','source','tool','label','split','review','example','pretrain','compare','tryText','handoff'];
const boolFields=['copy','guard','fail','changed','current','accepted','reverse'];
const history=h=>list(h,r=>plain(r)&&between(r.epoch,1,100)&&between(r.train,0,100)&&between(r.valid,0,100),1,100);
const selectedModel=v=>plain(v)&&validModel(v.model)&&between(v.epoch,1,100)&&between(v.lr,.01,3)&&finite(v.seed);
function sanitizeData(raw){
 const out={};
 for(const [k,[min,max]] of Object.entries(numberFields))if(between(raw[k],min,max))out[k]=raw[k];
 for(const k of ['step','log','selected','window','queryIndex','masked'])if(k in out)out[k]=Math.floor(out[k]);
 for(const k of stringFields)if(typeof raw[k]==='string')out[k]=raw[k];
 for(const k of boolFields)if(typeof raw[k]==='boolean')out[k]=raw[k];
 if(!['all','fp','fn'].includes(out.filter))delete out.filter;
 if(list(raw.path,v=>Number.isInteger(v)&&between(v,0,24),1,41))out.path=raw.path;
 if(list(raw.trajectory,v=>between(v,-100000,100000),1,15))out.trajectory=raw.trajectory;
 if(plain(raw.frozen)&&['threshold','fp','fn','budget'].every(k=>between(raw.frozen[k],...numberFields[k])))out.frozen=raw.frozen;
 if(plain(raw.qRun)&&list(raw.qRun.q,r=>list(r,finite,4,4),25,25)&&list(raw.qRun.returns,finite,1,180)&&between(raw.qRun.epsilon,0,1)&&between(raw.qRun.shortcut,-8,5)&&finite(raw.qRun.seed))out.qRun=raw.qRun;
 if(plain(raw.race)&&between(raw.race.slow,100,1500)&&between(raw.race.fast,100,1000)&&['guard','fail'].every(k=>typeof raw.race[k]==='boolean')&&list(raw.race.events,e=>plain(e)&&['query','shown'].every(k=>typeof e[k]==='string')&&['id','issued','end'].every(k=>finite(e[k]))&&['applied','error'].every(k=>typeof e[k]==='boolean'),2,2))out.race=raw.race;
 if(plain(raw.regression)&&typeof raw.regression.fix==='string'&&list(raw.regression.tests,v=>typeof v==='boolean',3,3))out.regression=raw.regression;
 if(Array.isArray(raw.runs))out.runs=raw.runs.filter(r=>plain(r)&&history(r.history)&&validModel(r.model)&&plain(r.best)&&validModel(r.best.model)&&between(r.best.epoch,1,100)&&between(r.lr,.01,3)&&finite(r.seed)&&finite(r.at)).slice(-3);
 if(selectedModel(raw.chosen))out.chosen=raw.chosen;
 if(out.chosen&&plain(raw.testReport)&&between(raw.testReport.accuracy,0,1)&&between(raw.testReport.loss,0,100)&&finite(raw.testReport.at)&&list(raw.testReport.predictions,p=>plain(p)&&typeof p.text==='string'&&[0,1].includes(p.label)&&between(p.score,0,1),1,100))out.testReport=raw.testReport;
 return out;
}
function bounded(v,depth=0){
 if(depth>9)return null;
 if(typeof v==='string')return v.slice(0,12000);
 if(typeof v==='number')return Number.isFinite(v)?v:0;
 if(typeof v==='boolean'||v===null)return v;
 if(Array.isArray(v))return v.slice(0,500).map(x=>bounded(x,depth+1));
 if(plain(v))return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).slice(0,80).map(([k,x])=>[k,bounded(x,depth+1)]));
 return null;
}
export function sanitizeJourneys(value){
 const out={};
 for(const [id,meta] of Object.entries(journeys)){
  const v=value?.[id];if(!plain(v)||v.version!==1)continue;
  const data=plain(v.data)?sanitizeData(bounded(v.data)):{};
  const evidence={};
  for(let i=0;i<meta.stages.length;i++)if(plain(v.evidence?.[i])&&typeof v.evidence[i].summary==='string')evidence[i]={summary:v.evidence[i].summary.slice(0,1200),at:Number(v.evidence[i].at)||0};
  out[id]={version:1,stage:Math.min(meta.stages.length-1,Math.max(0,Math.floor(Number(v.stage)||0))),data,evidence,note:typeof v.note==='string'?v.note.slice(0,16000):''};
 }
 return out;
}
export function saveFile(filename,content,type='application/json'){
 const url=URL.createObjectURL(new Blob([typeof content==='string'?content:JSON.stringify(content,null,2)],{type}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
