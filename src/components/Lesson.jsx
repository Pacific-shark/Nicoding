import React,{useEffect,useRef,useState} from 'react';
import {byId,domains} from '../data/index.js';
import {execute} from '../runtime.js';
import {placements,reasons,extensions} from '../data/paths.js';
import {Prerequisites} from './LearningRoadmap.jsx';
import DepthPractice from './DepthPractice.jsx';
import CodeInput from './CodeInput.jsx';
import TabBar from './TabBar.jsx';
import {Icon,SourceLinks,statusLabel,statusOf,useSoftTransition} from './ui.jsx';
export function Quiz({lesson,onPass,onAssist,review=false}) {
 const [answers,setAnswers]=useState({}),[checked,setChecked]=useState(false);
 const answered=lesson.quiz.every((_,i)=>answers[i]!==undefined);
 const correct=lesson.quiz.every((q,i)=>answers[i]===q.correct);
 useEffect(()=>{onPass(false);},[]);
 function verify(){setChecked(true);onPass(correct);if(!correct)onAssist?.();}
 return <div className="quiz-content"><div className="section-kicker"><Icon name="Target"/> {review?'回想一下，再作答':'把理解变成可检验的回答'}</div><p className="muted">每个选项都有解释。答错时先找原因，再回来尝试。</p>{lesson.quiz.map((q,i)=><fieldset className="quiz-question" key={i}><legend><span>{String(i+1).padStart(2,'0')}</span>{q.prompt}</legend><div className="quiz-options">{q.options.map((opt,j)=><label className={`quiz-option ${answers[i]===j?'selected':''} ${checked&&answers[i]===j?(j===q.correct?'correct':'incorrect'):''}`} key={j}><input type="radio" name={`${lesson.id}-${i}`} checked={answers[i]===j} onChange={()=>{setAnswers(a=>({...a,[i]:j}));setChecked(false);onPass(false);}}/><span className="option-letter">{'ABC'[j]}</span><span>{opt}</span>{checked&&answers[i]===j&&<Icon name={j===q.correct?'Check':'X'} size={16}/>}</label>)}</div>{checked&&answers[i]!==undefined&&<p className={`answer-feedback ${answers[i]===q.correct?'good':'bad'}`}><Icon name={answers[i]===q.correct?'CheckCircle2':'Lightbulb'} size={16}/>{q.explanations[answers[i]]}</p>}</fieldset>)}<button className="primary" onClick={verify} disabled={!answered}><Icon name="Check"/>{checked&&correct?'理解检查已通过':'检查答案'}</button>{checked&&correct&&<p className="success-line" role="status">本轮 {lesson.quiz.length} 题均正确。请继续用代码和真实任务巩固。</p>}</div>;
}
export function Editor({lesson,challengeMode,onEvidence,onAssist,savedCode,onCodeChange}) {
 const task=challengeMode?lesson.challenge:null;
 const initial=task?.starter||lesson.code;
 const [code,setCode]=useState(savedCode??initial),[result,setResult]=useState(null),[phase,setPhase]=useState(''),[hint,setHint]=useState(0),[prediction,setPrediction]=useState('');
 const current=useRef(null),mounted=useRef(true);
 useEffect(()=>{return()=>{mounted.current=false;current.current?.cancel();};},[]);
 function change(value){setCode(value);onCodeChange(value);setResult(null);onEvidence(false);}
 async function run(verify=false){
  if(current.current)return;
  const operation=execute(lesson.lang,code,verify?task?.tests:[],setPhase);
  current.current=operation;
  const outcome=await operation.promise;
  current.current=null;
  if(!mounted.current)return;
  setPhase('');setResult({...outcome,verified:verify});
  if(task){if(verify)onEvidence(outcome.ok&&outcome.checks?.length===task.tests.length);}
  else if(outcome.ok)onEvidence(true);
 }
 function insertIndent(e){if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd;change(code.slice(0,start)+'    '+code.slice(end));requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=start+4;});}}
 return <div className="experiment">
  <div className="section-kicker"><span className="small-flame"/>{task?'动手练习':'可运行的小实验'}</div>
  <h3 className="exercise-title">{task?task.task:'先预测结果，再运行观察。'}</h3>
  {!task&&<label className="prediction-label">你的预测 <input value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder="不用怕猜错，先留下你的判断…"/></label>}
  {task&&<div className="expected"><Icon name="Target" size={16}/><span>验证方式：{task.tests.length} 个行为与边界检查</span></div>}
  <div className="code-shell"><div className="code-title"><span><Icon name="Code2" size={15}/>{lesson.id.replace('-','_')}.{lesson.lang==='python'?'py':'js'}</span><span>{lesson.lang==='python'?'Python 3 · Pyodide':'JavaScript · Worker'}</span></div><CodeInput code={code} onChange={change} busy={!!phase}/></div>
  <div className="run-actions"><button className="primary" disabled={!!phase} onClick={()=>run(false)}><Icon name="Play" size={16}/>{phase||'运行代码'}</button>{task&&<button className="secondary" disabled={!!phase} onClick={()=>run(true)}><Icon name="Check"/>验证修改</button>}{phase?<button className="plain-button" onClick={()=>current.current?.cancel()}><Icon name="StopCircle"/>停止</button>:<button className="plain-button" onClick={()=>{change(initial);setHint(0);}}><Icon name="RotateCcw" size={16}/>重置代码</button>}</div>
  <div className={`console ${result?.error?'has-error':''}`} aria-live="polite"><div className="console-title"><span><Icon name="Terminal" size={16}/>运行结果</span>{result&&<span>{result.ok?(result.verified?'验证通过':'已运行'):'需要检查'}</span>}</div><pre>{result?([result.output,result.error].filter(Boolean).join('\n')||'（程序运行结束，没有打印内容）'):'运行后，真实输出会显示在这里。'}</pre>{result?.verified&&<div className="test-results">{result.checks?.map((c,i)=><details key={i} open={!c.ok}><summary><Icon name={c.ok?'CheckCircle2':'X'} size={14}/><span>检查 {i+1} · {c.ok?'通过':'未通过'}</span></summary><pre>{task.tests[i]}{c.error?`\n${c.error}`:''}</pre></details>)}</div>}</div>
  {task?<div className="hints"><button className="hint-heading" onClick={()=>{setHint(v=>Math.min(v+1,task.hints.length));onAssist();}} disabled={hint===task.hints.length}><Icon name="Lightbulb"/><span>逐级提示</span><small>{hint}/{task.hints.length}</small><Icon name="Plus" size={16}/></button>{task.hints.slice(0,hint).map((h,i)=><p key={i}><b>{i+1}</b>{h}</p>)}<details onToggle={e=>{if(e.currentTarget.open)onAssist();}}><summary>卡住了？查看一种参考解法</summary><pre>{task.solution}</pre><p>看完先合上，再独立重写。点亮记录会注明本轮使用过帮助。</p></details></div>:<details className="prediction-answer"><summary><Icon name="Lightbulb" size={16}/>对照预期与解释</summary><p>{lesson.prediction}</p></details>}
  <p className="fineprint">代码在本地浏览器工作线程中运行，单次执行上限 5 秒。Python 已包含基础运行时；PyTorch、GPU 和大型模型训练请按资料在本地环境复现。</p>
 </div>;
}
export default function Lesson({lesson,progress,onBack,onSelect,onCelebrate,startStep=0}) {
 const {state,setState,complete}=progress;
 const [step,setStep]=useState(0),[sideTab,setSideTab]=useState('explain'),[quizPassed,setQuizPassed]=useState(false),[evidence,setEvidence]=useState(false),[assisted,setAssisted]=useState(false),[note,setNote]=useState(state.notes[lesson.id]||''),[noteSaved,setNoteSaved]=useState(true),[reflection,setReflection]=useState(''),[justCompleted,setJustCompleted]=useState(false);
 const contentRef=useSoftTransition(step);
 useEffect(()=>setStep(startStep),[startStep]);
 const [codes,setCodes]=useState({2:state.drafts[lesson.id]});
 const domain=domains.find(d=>d.id===lesson.domain);
 const missing=lesson.prereqs.filter(id=>!state.lessons[id]?.completed);
 const ready=quizPassed&&evidence&&(!!lesson.challenge||reflection.trim().length>=10);
 const steps=['理解概念','看懂示例',lesson.challenge?'动手练习':'改变与观察','检查理解','解释与进阶'];
 const position=placements[lesson.id];
 function saveNote(){setState(s=>({...s,notes:{...s.notes,[lesson.id]:note}}));setNoteSaved(true);}
 function finish(){if(!ready)return;complete(lesson.id,assisted);setJustCompleted(true);onCelebrate();}
 return <main className="lesson-layout">
  <div className="lesson-heading"><a className="back-link" href={`#path/${lesson.domain}`}><Icon name="ArrowLeft"/>返回学习路线</a><div><div className="breadcrumb"><a href="#explore">学习路线</a><span>/</span><a href={`#path/${lesson.domain}`}>{domain.name}</a><span>/</span>第 {position.index+1} 节</div><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div><span className="lesson-estimate"><Icon name="Clock" size={15}/>{lesson.minutes} 分钟起 · {lesson.depth}</span></div>
  <section className="lesson-context" aria-label="在学习路线中的位置"><div className="lesson-position"><a href={`#path/${lesson.domain}`}>阶段 {position.chapterIndex+1} · {position.chapter.title}</a><span>本方向 {position.index+1} / {position.total} 节</span></div><h2>{reasons[lesson.id]}</h2><Prerequisites lesson={lesson} records={state.lessons}/>{extensions[lesson.id]?.length>0&&<details><summary>可选延伸 · 不必全部学完再开始本节</summary><div className="lesson-extensions">{extensions[lesson.id].map(id=><a key={id} href={`#learn/${id}`}>{byId[id].title}</a>)}</div></details>}</section>
  <aside className="lesson-steps surface"><h3>学习步骤</h3><nav aria-label="学习步骤">{steps.map((s,i)=><button key={s} className={i===step?'active':''} aria-current={i===step?'step':undefined} onClick={()=>setStep(i)}><span>{String(i+1).padStart(2,'0')}</span>{s}{(i===3&&quizPassed||i===2&&evidence)&&<Icon name="Check" size={14}/>}</button>)}</nav><div className="aside-section"><h3>本关目标</h3><ol>{lesson.parts.slice(0,3).map(([title],i)=><li key={title}><span>{i+1}</span>{title}</li>)}</ol></div><div className="aside-section"><h3>先修知识</h3>{lesson.prereqs.length?lesson.prereqs.map(id=><a className="prereq-link" key={id} href={`#learn/${id}`}><Icon name={state.lessons[id]?.completed?'CheckCircle2':'BookOpen'} size={15}/>{byId[id].title}<Icon name="ChevronRight" size={14}/></a>):<p className="muted">从这里开始就好，无需编程前提。</p>}</div><p className="sidebar-footnote">慢一点，把原因想清楚。<br/>学习时间是建议，不是倒计时。</p></aside>
  <section ref={contentRef} className="lesson-center surface" aria-label="课程内容">
   {step===0&&<article className="lesson-article"><div className="section-kicker"><Icon name="BookOpen"/>理解概念</div>{missing.length>0&&<div className="prereq-notice"><Icon name="Route" size={17}/><div>有 {missing.length} 个先修节点还未点亮。可以先浏览；遇到卡点时从 <button onClick={()=>onSelect(missing[0])}>{byId[missing[0]].title}</button> 补起。</div></div>}{lesson.parts.map(([title,text],i)=><section key={title}><span className="article-number">{String(i+1).padStart(2,'0')}</span><h2>{title}</h2><p>{text}</p></section>)}<div className="transfer"><Icon name="NotebookPen"/><div><h3>把它带回你的项目</h3><p>{lesson.transfer}</p></div></div><button className="primary" onClick={()=>setStep(1)}>带着理解，看一个例子<Icon name="ArrowRight"/></button></article>}
   {(step===1||step===2)&&<React.Fragment key={step}><Editor lesson={lesson} challengeMode={step===2&&!!lesson.challenge} onEvidence={ok=>{if(!lesson.challenge||step===2)setEvidence(ok);}} onAssist={()=>setAssisted(true)} savedCode={codes[step]} onCodeChange={code=>{setCodes(c=>({...c,[step]:code}));if(step===2&&lesson.challenge)setState(s=>({...s,drafts:{...s.drafts,[lesson.id]:code}}));}}/>{step===2&&!lesson.challenge&&<label className="reflection-label">观察记录 <span>自己写至少 10 个字，说明改了什么、结果为何变化。</span><textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="我把……改成……，观察到……，原因是……"/><small>{reflection.trim().length} 字 · 只检查是否记录，不自动评判解释正确性</small></label>}<div className="step-next"><button className="text-button" onClick={()=>setStep(step+1)}>{step===1?`下一步 · ${steps[2]}`:'下一步 · 检查理解'}<Icon name="ArrowRight"/></button></div></React.Fragment>}
   {step===3&&<><Quiz lesson={lesson} onPass={ok=>setQuizPassed(ok)} onAssist={()=>setAssisted(true)}/><div className="mastery-panel"><h3>点亮这个节点</h3><div className="evidence-list"><span className={quizPassed?'yes':''}><Icon name={quizPassed?'CheckCircle2':'Target'} size={16}/>本轮理解检查</span><span className={evidence?'yes':''}><Icon name={evidence?'CheckCircle2':'Code2'} size={16}/>{lesson.challenge?'代码行为验证':'运行与观察实验'}</span>{!lesson.challenge&&<span className={reflection.trim().length>=10?'yes':''}><Icon name="NotebookPen" size={16}/>自己的观察记录</span>}</div>{!evidence&&<button className="text-button" onClick={()=>setStep(2)}>回到练习，补齐验证<Icon name="ArrowRight" size={14}/></button>}<button className="primary full" disabled={!ready||justCompleted} onClick={finish}><Icon name={justCompleted?'CheckCircle2':'Sparkles'}/>{justCompleted?'节点已点亮，明天再回来回想':'完成本关 · 点亮节点'}</button><p className="fineprint">点亮表示完成本关的有限检查，不等同于独立工程或研究能力。本轮{assisted?'使用过提示或纠错讲解':'未使用提示或纠错讲解'}；深度掌握还需迁移到项目。</p>{justCompleted&&<button className="text-button" onClick={()=>setStep(4)}>再向 Nico 讲清楚<Icon name="ArrowRight"/></button>}</div></>}
   {step===4&&<DepthPractice lesson={lesson} progress={progress}/>}
  </section>
  <aside className="lesson-reference surface"><TabBar label="课程辅助内容" items={[["explain","讲解"],["notes","笔记"],["sources","资料"]]} value={sideTab} onChange={setSideTab}/>{sideTab==='explain'?<div className="reference-body"><h2>{lesson.parts[Math.min(step,lesson.parts.length-1)][0]}</h2><p>{lesson.parts[Math.min(step,lesson.parts.length-1)][1]}</p><div className="pitfall"><div><Icon name="Info"/>常见误区</div>{lesson.pitfalls.map(p=><p key={p}>{p}</p>)}</div><h3>相关资料</h3><SourceLinks lesson={lesson}/></div>:sideTab==='sources'?<div className="reference-body"><span className="eyebrow">READ THE ORIGINAL</span><h2>从讲解，走向原文</h2><p>先带着本关的问题阅读，再对照自己的代码。英文资料可配合浏览器翻译，关键公式与接口名保留原文。</p><SourceLinks lesson={lesson}/><p className="fineprint">本页内容与外部作者无隶属关系。涉及具体 API、依赖和协议版本时，以你的运行环境对应文档为准。</p></div>:null}{sideTab!=='sources'&&<div className="note-box"><label htmlFor="lesson-note">我的笔记 <small>{noteSaved?'已保存到本机':'有未保存修改'}</small></label><textarea id="lesson-note" value={note} onChange={e=>{setNote(e.target.value);setNoteSaved(false);}} placeholder="用自己的话解释一次变化，也记下还没想通的地方。" maxLength={20000}/><button className="secondary full" onClick={saveNote}><Icon name="Save" size={15}/>保存笔记</button></div>}</aside>
  <div className="lesson-bottom"><span><i className={`status-dot ${statusOf(state.lessons[lesson.id])}`}/>{statusLabel[statusOf(state.lessons[lesson.id])]} · {lesson.challenge?'理解检查 + 代码验证':'理解检查 + 实验记录'}</span><button className="text-button" onClick={()=>setStep(s=>Math.min(4,s+1))} disabled={step===4}>下一步<Icon name="ArrowRight"/></button></div>
  <nav className="lesson-navigation" aria-label="前后课程"><a href={position.previous?`#learn/${position.previous}`:`#path/${lesson.domain}`}><Icon name="ArrowLeft"/><span><small>{position.previous?'上一节 · 推荐顺序':'回到方向总览'}</small><b>{position.previous?byId[position.previous].title:domain.name}</b></span></a><a href={position.next?`#learn/${position.next}`:`#path/${lesson.domain}`}><span><small>{position.next?'浏览下一节 · 不会自动完成本节':'本方向最后一节 · 去看实践项目'}</small><b>{position.next?byId[position.next].title:'回到路线，衔接项目'}</b></span><Icon name="ArrowRight"/></a></nav>
 </main>;
}
