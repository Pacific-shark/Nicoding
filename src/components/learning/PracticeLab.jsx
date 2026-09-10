import React,{useEffect,useRef,useState} from 'react';
import CodeInput from '../CodeInput.jsx';
import {Icon} from '../ui.jsx';
import {execute} from '../../runtime.js';
const lastErrorLine=error=>String(error||'').trim().split('\n').at(-1)||'';
export default function PracticeLab({task,record,patch}) {
 const saved=record.tasks?.[task.id]||{},code=saved.code??task.starter,result=saved.result;
 const [phase,setPhase]=useState(''),[showSolution,setShowSolution]=useState(false);
 const operation=useRef(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;operation.current?.cancel();};},[]);
 const stale=!!result&&result.code!==code,hints=saved.hints||0;
 function changeTask(update){patch(r=>({...r,tasks:{...r.tasks,[task.id]:{...r.tasks?.[task.id],code,...update}}}));}
 async function run(verified){
  if(operation.current)return;
  const snapshot=code;
  const job=execute('python',snapshot,verified?task.tests.map(t=>t.code):[],setPhase);operation.current=job;
  const outcome=await job.promise;
  if(!alive.current)return;
  operation.current=null;setPhase('');
  changeTask({result:{...outcome,code:snapshot,version:1,verified,at:Date.now(),ok:verified&&outcome.ok&&outcome.checks?.length===task.tests.length}});
 }
 return <section className="unit-practice" aria-label={task.title}><header><h3>{task.title}</h3><p>{task.contract}</p></header><div className="practice-workspace"><div className="practice-editor"><div className="practice-pane-title"><span>{task.filename}</span><small>Python · 浏览器内运行</small></div><CodeInput code={code} busy={!!phase} onChange={value=>{if(value.length<=50000)changeTask({code:value});}}/></div><div className="practice-output" aria-live="polite"><div className="practice-pane-title"><span>运行与检查</span>{result&&<small>{stale?'代码已修改 · 结果待更新':result.ok?'行为检查通过':result.verified?'需要检查':'运行记录'}</small>}</div><pre>{result?[result.output,lastErrorLine(result.error)].filter(Boolean).join('\n')||'程序已结束，没有打印内容。':'先运行错误版本，观察结果；修改后检查全部约定。'}</pre>{result?.error&&<details className="check-trace global-trace"><summary>展开错误位置</summary><pre>{result.error}</pre></details>}{result?.verified&&<ol className="practice-checks">{task.tests.map((test,i)=><li key={test.name} className={result.checks?.[i]?.ok?'pass':'fail'}><Icon name={result.checks?.[i]?.ok?'CheckCircle2':'CircleAlert'} size={16}/><div><strong>{test.name}</strong>{result.checks?.[i]?.error&&<div><p className="check-reason">{lastErrorLine(result.checks[i].error)}</p><details className="check-trace"><summary>展开错误位置</summary><pre>{result.checks[i].error}</pre></details></div>}{!result.checks?.[i]&&<small>本次未执行到此项。</small>}</div></li>)}</ol>}</div></div>
  <div className="lab-controls"><button className="primary" disabled={!!phase} onClick={()=>run(true)}><Icon name="Check" size={16}/>{phase||'检查全部约定'}</button><button className="secondary" disabled={!!phase} onClick={()=>run(false)}><Icon name="Play" size={16}/>运行代码</button>{phase?<button className="plain-button" onClick={()=>operation.current?.cancel()}><Icon name="StopCircle" size={16}/>停止</button>:<button className="plain-button" onClick={()=>changeTask({code:task.starter})}><Icon name="RotateCcw" size={16}/>恢复题目代码</button>}</div>
  <div className="practice-help"><button className="text-button" disabled={hints===task.hints.length} onClick={()=>changeTask({hints:hints+1})}><Icon name="Lightbulb" size={16}/>给一点提示 <small>{hints}/{task.hints.length}</small></button><button className="text-button" onClick={()=>{setShowSolution(v=>!v);if(!showSolution)changeTask({solutionSeen:true});}}>{showSolution?'收起参考实现':'查看参考实现'}</button><span>{saved.solutionSeen?'已查看参考实现':hints?'已使用提示':'尚未查看帮助'}</span></div>
  {hints>0&&<ol className="unit-hints">{task.hints.slice(0,hints).map(h=><li key={h}>{h}</li>)}</ol>}
  {showSolution&&<div className="unit-solution"><p>先比较差异，再自己修改。查看参考实现会记录为借助帮助完成。</p><pre>{task.solution}</pre></div>}
  <details className="unit-detail"><summary>这组检查具体检查什么？</summary>{task.tests.map(test=><div key={test.name}><h4>{test.name}</h4><pre>{test.code}</pre></div>)}<p>这些检查验证本题的约定，不能判断你是否使用了外部 AI，也不能证明任意输入下都正确。</p></details>
 </section>;
}
