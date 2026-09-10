import React,{useEffect,useRef,useState} from 'react';
import {projects,byId} from '../data/index.js';
import {projectGuides,projectFilename} from '../data/project-guides.js';
import {execute} from '../runtime.js';
import {Icon} from './ui.jsx';
import CodeInput from './CodeInput.jsx';
import TabBar from './TabBar.jsx';
import ProjectLibrary from './ProjectLibrary.jsx';
import ProjectResults from './ProjectResults.jsx';

function ProjectSidebar({selected,state,record,onProject,onTask,activeTask,query='',onQuery}) {
 const matches=projects.filter(p=>`${p.name} ${p.label} ${p.lang||''}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <aside className="studio-sidebar" aria-label="项目与任务">
  <div className="studio-sidebar-heading"><strong>项目</strong>{selected&&<a href="#projects"><Icon name="PanelsTopLeft" size={15}/>所有项目</a>}</div>
  {selected?<><label className="studio-project-select"><span className="sr-only">切换项目</span><select value={selected.id} onChange={e=>onProject(e.target.value)}>{[['mini','小项目'],['full','综合项目']].map(([tier,label])=><optgroup label={label} key={tier}>{projects.filter(p=>(p.tier==='mini')===(tier==='mini')).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</optgroup>)}</select><Icon name="ChevronsUpDown" size={14}/></label><div className="studio-task-heading">本项目任务<span>{record.steps.length} / {selected.steps.length}</span></div><nav className="studio-task-list" aria-label="项目任务">{selected.steps.map((step,i)=><button key={step} className={activeTask===i?'active':''} aria-current={activeTask===i?'step':undefined} onClick={()=>onTask(i)}><span className={`studio-task-number ${record.steps.includes(i)?'is-done':''}`}>{record.steps.includes(i)?<Icon name="Check" size={13}/>:i+1}</span><span>{projectGuides[selected.id].tasks[i]}</span>{activeTask===i&&<Icon name="ChevronRight" size={13}/>}</button>)}</nav><div className="studio-task-progress"><div><span>任务记录</span><b>{record.steps.length} / {selected.steps.length}</b></div><progress value={record.steps.length} max={selected.steps.length}/><p>完成后手动标记，按自己的节奏推进。</p></div><div className="studio-sidebar-footer"><Icon name="BookOpen" size={16}/><div><span>需要回顾？</span><a href={`#learn/${selected.skills[0]}`}>{byId[selected.skills[0]].title}<Icon name="ArrowUpRight" size={13}/></a></div></div></>:<><label className="studio-search"><Icon name="Search" size={16}/><input aria-label="查找项目" placeholder="查找项目…" value={query} onChange={e=>onQuery(e.target.value)}/></label><nav className="studio-project-list" aria-label="全部实践项目">{[['mini','小项目'],['full','综合项目']].map(([tier,label])=>{const group=matches.filter(p=>(p.tier==='mini')===(tier==='mini'));return group.length>0&&<section key={tier}><h2>{label}<span>{group.length}</span></h2>{group.map(p=><a href={`#projects/${p.id}`} key={p.id}><Icon name={p.tier==='mini'?'FileCode2':'Folder'} size={16}/><span>{p.name}<small>{state.projects[p.id]?.steps?.length?`${state.projects[p.id].steps.length} 项已记录`:p.tier==='mini'?p.lang==='python'?'Python':'JavaScript':'本地实践'}</small></span></a>)}</section>;})}{!matches.length&&<p className="studio-search-empty">没有找到项目，试试 Python 或机器学习。</p>}</nav></>}
 </aside>;
}

function Requirements({project}) {
 return <article className="studio-document"><h2>要做什么</h2><p>{project.intro}</p><h3>完成路径</h3><ol>{project.steps.map((step,i)=><li key={step}><strong>{projectGuides[project.id].tasks[i]}</strong><p>{step}</p></li>)}</ol><h3>验收标准</h3><p>{project.accept}</p><h3>交付物</h3><p>{project.deliver}</p><h3>用到的知识</h3><div className="studio-course-links">{project.skills.map(id=><a key={id} href={`#learn/${id}`}>{byId[id].title}<Icon name="ArrowUpRight" size={14}/></a>)}</div></article>;
}

function ProjectSession({project,progress,onProject}) {
 const mini=project.tier==='mini';
 const record={steps:[],note:'',...progress.state.projects[project.id]};
 const code=record.code??project.starter??'';
 const activeTask=Number.isInteger(record.activeTask)&&record.activeTask>=0&&record.activeTask<project.steps.length?record.activeTask:Math.max(0,project.steps.findIndex((_,i)=>!record.steps.includes(i)));
 const [pane,setPane]=useState(mini?'code':'requirements'),[mobilePane,setMobilePane]=useState('code'),[resultTab,setResultTab]=useState(mini?'output':'checks');
 const [result,setResult]=useState(null),[phase,setPhase]=useState(''),[undo,setUndo]=useState(null);
 const operation=useRef(null),mounted=useRef(true),mobileTabs=useRef(null);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;operation.current?.cancel();};},[]);
 useEffect(()=>{if(window.matchMedia('(max-width:760px)').matches)mobileTabs.current?.querySelector('[aria-selected="true"]')?.focus();},[mobilePane]);
 function change(patch){progress.setState(s=>({...s,projects:{...s.projects,[project.id]:{steps:[],note:'',...s.projects[project.id],...patch}}}));}
 function edit(value){setUndo(null);change({code:value.slice(0,50000)});}
 function selectTask(i){change({activeTask:i});setPane(mini?'code':'requirements');setMobilePane('code');}
 function toggleTask(){change({activeTask,steps:record.steps.includes(activeTask)?record.steps.filter(i=>i!==activeTask):[...record.steps,activeTask]});}
 async function run(verify){
  if(operation.current)return;
  const snapshot=code;
  setResult(null);setResultTab(verify?'checks':'output');setMobilePane('results');
  const job=execute(project.lang,snapshot,verify?project.tests:[],setPhase);operation.current=job;
  const outcome=await job.promise;
  if(mounted.current){setResult({...outcome,verified:verify,code:snapshot,at:Date.now()});setPhase('');operation.current=null;}
 }
 function download(){const url=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=projectFilename(project);link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const task=<div className="studio-current-task"><div><span>任务 {activeTask+1} / {project.steps.length}</span><strong>{projectGuides[project.id].tasks[activeTask]}</strong></div><button className={record.steps.includes(activeTask)?'is-done':''} aria-pressed={record.steps.includes(activeTask)} onClick={toggleTask}><Icon name={record.steps.includes(activeTask)?'CircleCheck':'Circle'} size={16}/>{record.steps.includes(activeTask)?'已完成':'标记完成'}</button><p>{project.steps[activeTask]}</p></div>;
 return <main className={`project-studio is-session mobile-${mobilePane}`}>
  <ProjectSidebar selected={project} state={progress.state} record={record} onProject={onProject} onTask={selectTask} activeTask={activeTask}/>
  <header className="studio-project-header"><div><h1>{project.name}</h1><p>{project.label}{mini?` · ${project.minutes}`:' · 本地实践'}</p></div><div className="studio-header-actions"><button onClick={()=>{setPane('requirements');setMobilePane('code');}}><Icon name="FileText" size={15}/>查看需求</button>{mini&&<button onClick={download} aria-label="下载代码" title="下载代码"><Icon name="Download" size={16}/></button>}</div></header>
  <div className="studio-mobile-tabs" ref={mobileTabs}><TabBar label="工作区区域" items={mini?[['tasks','任务'],['code','代码'],['results','结果']]:[['tasks','任务'],['code','工作区'],['results','验收']]} value={mobilePane} onChange={setMobilePane}/></div>
  <section className="studio-center" aria-label="项目工作区">
   <TabBar label="工作内容" value={pane} onChange={setPane} items={mini?[['code','代码'],['requirements','需求'],['notes','记录']]:[['requirements','任务说明'],['notes','记录']]}/>
   {pane==='code'&&<div className="studio-code-panel" role="tabpanel" aria-label="编写代码">{task}<div className="studio-filebar"><span><Icon name="FileCode2" size={15}/>{projectFilename(project)}</span><small>{progress.storageError?'保存失败':'自动保存到本机'}</small><details className="studio-file-menu"><summary aria-label="代码操作"><Icon name="Ellipsis" size={19}/></summary><div><button onClick={e=>{setUndo(code);change({code:project.starter});e.currentTarget.closest('details').open=false;}}>恢复初始代码</button><button onClick={download}>下载代码</button></div></details></div>{undo!==null&&<div className="studio-undo" role="status">已恢复初始代码<button onClick={()=>{change({code:undo});setUndo(null);}}>撤销恢复</button></div>}<div className="studio-editor" onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run(true);}}}><CodeInput code={code} onChange={edit} busy={!!phase}/></div><footer className="studio-runbar"><span>{project.lang==='python'?'Python':'JavaScript'} · 浏览器内运行</span><div>{phase?<button className="studio-stop" onClick={()=>operation.current?.cancel()}><Icon name="Square" size={13}/>停止运行</button>:<><button className="studio-run-only" onClick={()=>run(false)}><Icon name="Play" size={14}/>只运行</button><button className="studio-run-check" onClick={()=>run(true)} title="Ctrl / ⌘ + Enter"><Icon name="Play" size={14}/>运行并检查</button></>}</div></footer></div>}
   {pane==='requirements'&&<div className="studio-document-scroll" role="tabpanel" aria-label="项目需求">{!mini&&task}<Requirements project={project}/></div>}
   {pane==='notes'&&<div className="studio-notes" role="tabpanel" aria-label="项目记录"><h2>留下一点记录</h2><p>记下问题、测试结论，或贴上你的项目地址。以后回来能接着做。</p><label htmlFor={`note-${project.id}`}>项目记录 <small>{progress.storageError?'保存失败':'自动保存到本机'}</small></label><textarea id={`note-${project.id}`} value={record.note} onChange={e=>change({note:e.target.value})} maxLength={20000} placeholder="这次做到了哪一步？还有什么没弄明白？"/><small>代码、任务和记录保存在当前浏览器，可在设置中导出备份。</small></div>}
  </section>
  <ProjectResults project={project} result={result} stale={!!result&&result.code!==code} phase={phase} tab={resultTab} onTab={setResultTab} onStop={()=>operation.current?.cancel()}/>
 </main>;
}

export default function ProjectStudio({progress,projectId,onProject}) {
 const [query,setQuery]=useState('');
 const project=projects.find(p=>p.id===projectId);
 if(project)return <ProjectSession key={project.id} project={project} progress={progress} onProject={onProject}/>;
 return <main className="project-studio is-library"><ProjectSidebar state={progress.state} query={query} onQuery={setQuery}/><ProjectLibrary state={progress.state}/></main>;
}
