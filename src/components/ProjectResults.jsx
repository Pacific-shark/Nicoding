import React,{useState} from 'react';
import {byId} from '../data/index.js';
import {projectGuides} from '../data/project-guides.js';
import {Icon} from './ui.jsx';
import TabBar from './TabBar.jsx';

export default function ProjectResults({project,result,stale,phase,tab,onTab,onStop}) {
 const [hints,setHints]=useState(1);
 const mini=project.tier==='mini',guide=projectGuides[project.id];
 const checked=result?.verified,passed=result?.checks?.filter(c=>c.ok).length||0;
 const title=phase||(!result?'等待运行':stale?'代码已修改':result.error?'运行未完成':checked?`${passed} / ${project.tests.length} 项通过`:'代码已运行');
 return <aside className="studio-results" aria-label="运行结果与帮助">
  <TabBar label="结果面板" value={tab} onChange={onTab} items={mini?[['output','输出'],['checks','检查'],['hints','提示']]:[['checks','验收'],['hints','资料']]}/>
  <div className="studio-results-scroll" role="tabpanel" aria-label={tab==='hints'?'项目提示与资料':tab==='checks'?'项目检查':'程序输出'}>
   {mini&&tab!=='hints'&&<><div className={`studio-run-summary ${result&&!stale&&!result.error&&checked&&passed===project.tests.length?'is-pass':''}`} role="status" aria-live="polite"><Icon name={phase?'LoaderCircle':stale?'RotateCw':result?.error?'CircleAlert':checked?'ListChecks':'Terminal'} size={20}/><div><strong>{title}</strong><p>{phase?'代码在浏览器中执行。':!result?'写好代码后，运行并查看结果。':stale?'下方是修改前的结果，请重新运行。':result.error?'查看错误信息后再试一次。':checked?'预设检查只覆盖列出的情况。':'本次只执行代码，尚未检查验收条件。'}</p></div></div>{phase&&<button className="studio-stop" onClick={onStop}><Icon name="Square" size={13}/>停止运行</button>}{result&&<div className="studio-run-time">上次运行 {new Date(result.at).toLocaleTimeString('zh-CN',{hour12:false})}</div>}</>}
   {mini&&tab==='checks'&&<div className="studio-check-list">{project.tests.map((test,i)=>{const check=checked?result.checks?.[i]:null;return <details key={`${result?.at||'initial'}-${i}`} open={check&&!check.ok&&result.checks.findIndex(c=>!c.ok)===i?true:undefined} className={`studio-check ${check?(check.ok?'is-pass':'is-fail'):''}`}><summary><Icon name={!check?'Circle':check.ok?'CircleCheck':'CircleX'} size={17}/><span>{guide.checks[i]}</span><small>{!check?'未检查':check.ok?'通过':'未通过'}</small><Icon name="ChevronDown" size={14}/></summary><div className="studio-check-body"><p>{check?.ok?'本次代码满足这项检查。':check?'这项条件没有满足，对照需求检查你的实现。':'运行并检查后，这里会显示结果。'}</p><pre>{test}</pre>{check?.error&&<><pre className="studio-error">{check.error.trim().split('\n').at(-1)}</pre><details className="studio-error-detail"><summary>完整错误信息</summary><pre>{check.error}</pre></details></>}</div></details>;})}</div>}
   {mini&&tab!=='hints'&&<section className="studio-output"><h3>{tab==='output'?'程序输出':'本次输出'}</h3><pre>{result?.output|| (result?'没有打印输出。':'运行后的 print / console.log 内容会出现在这里。')}</pre>{result?.error&&<pre className="studio-error">{result.error}</pre>}</section>}
   {!mini&&tab==='checks'&&<><div className="studio-section-icon"><Icon name="ListChecks" size={23}/></div><h2>怎样算完成？</h2><p>{project.accept}</p><h3>需要留下的成果</h3><p>{project.deliver}</p><div className="studio-note-callout">在自己的开发环境中实现和测试，把项目地址、测试结果与问题写进「记录」。任务完成情况由你核对。</div></>}
   {tab==='hints'&&<>{mini&&<><h2>先想一小步</h2><div className="studio-hints">{guide.hints.slice(0,hints).map((hint,i)=><p key={hint}><span>{i+1}</span>{hint}</p>)}</div>{hints<guide.hints.length&&<button className="studio-text-action" onClick={()=>setHints(n=>n+1)}>再看一个提示<Icon name="ChevronDown" size={14}/></button>}<details className="studio-solution"><summary>查看一种参考解法<Icon name="ChevronDown" size={15}/></summary><p>先说明你卡在哪一步，再对照差异。看懂之后，试着关掉参考自己重写。</p><pre>{project.solution}</pre></details></>}<h3>用到的知识</h3><div className="studio-course-links">{project.skills.map(id=><a key={id} href={`#learn/${id}`}>{byId[id].title}<Icon name="ArrowUpRight" size={14}/></a>)}</div>{project.stretch&&<><h3>再往前一步</h3><p>{project.stretch}</p></>}</>}
  </div>
 </aside>;
}
