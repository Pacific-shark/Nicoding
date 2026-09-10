import React,{useEffect,useRef,useState} from 'react';
import {referenceUnit,referenceTasks,unitSectionDone} from '../../learning/reference-unit.js';
import {byId} from '../../data/index.js';
import {Icon,Modal} from '../ui.jsx';
import LessonText from '../LessonText.jsx';
import ReferenceLab from './ReferenceLab.jsx';
import DefaultArgumentLab from './DefaultArgumentLab.jsx';
import PracticeLab from './PracticeLab.jsx';

function Prediction({block,record,patch}) {
 const answer=record.answers?.[block.id]||{};
 function update(next){patch(r=>({...r,answers:{...r.answers,[block.id]:{...r.answers?.[block.id],...next}}}));}
 function check(){const correct=answer.choice===block.correct;update({checked:true,correct,attempts:(answer.attempts||0)+1,firstCorrect:answer.firstCorrect??correct});}
 return <section className="unit-prediction"><h3>先猜一下</h3><fieldset><legend>{block.prompt}</legend>{block.options.map((option,i)=><label key={option} className={answer.choice===i?'selected':''}><input type="radio" name={'unit-'+block.id} checked={answer.choice===i} onChange={()=>update({choice:i,checked:false,correct:false})}/><span>{option}</span></label>)}</fieldset><button className="primary" disabled={answer.choice===undefined||answer.choice===null} onClick={check}>核对预测</button>{answer.checked&&<p className={`prediction-feedback ${answer.correct?'pass':'retry'}`} role="status"><Icon name={answer.correct?'CheckCircle2':'Lightbulb'} size={16}/>{block.feedback[answer.choice]}</p>}</section>;
}
const reflectionChecks=['我的解释说清了是哪几个位置引用同一个内层列表。','我能解释为什么 [0] * 3 的赋值反例不同。','我能用“改引用”或“改对象”说明一种修复。'];
function Reflection({record,patch}){
 const reflection=record.reflection||{text:'',checks:[]};
 const update=value=>patch(r=>({...r,reflection:{...r.reflection,...value}}));
 return <section className="unit-reflection"><h3>向 Nico 讲清楚</h3><p>假设对方只知道列表。解释为什么三个位置一起变了，再给出一个不会一起变化的反例。可以画箭头，也可以用文字描述对象关系。</p><label htmlFor="unit-explanation">你的解释 <span>自动保存；不按字数评分</span></label><textarea id="unit-explanation" maxLength={20000} value={reflection.text||''} onChange={e=>update({text:e.target.value})} placeholder="先说清楚外层有几个位置、内层有几个对象，再解释 append 改了谁。"/><details className="unit-detail"><summary>写完后，对照解释要点</summary><LessonText text={'`[[]] * 3` 先创建一个内层空列表，再让外层三个位置都引用它。append 改变了这个内层对象，所以从三个位置读到相同的新内容。\n\n`[[] for _ in range(3)]` 每次迭代都创建一个新列表，三个内层对象独立。`[0] * 3` 后的 `values[0] = 1` 则替换外层的一项引用，并没有修改整数。'}/></details><div className="reflection-checks">{reflectionChecks.map((label,i)=><label key={label}><input type="checkbox" checked={reflection.checks?.includes(i)||false} onChange={e=>update({checks:e.target.checked?[...(reflection.checks||[]),i]:(reflection.checks||[]).filter(x=>x!==i)})}/><span>{label}</span></label>)}</div><small>这里记录的是你的自查，不会自动认定解释正确。遇到不确定的句子，可以回到实验核对。</small></section>;
}
export default function LearningUnit({progress,startExplain=false,onCelebrate}) {
 const {state,setState}=progress,unit=referenceUnit;
 const record=state.units?.[unit.id]||{version:1,chapter:0};
 const index=record.chapter||0,chapter=unit.chapters[index],done=unitSectionDone(record),total=done.filter(Boolean).length;
 const [notes,setNotes]=useState(false),content=useRef(null),heading=useRef(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[]);
 function patch(updater){setState(s=>({...s,units:{...s.units,[unit.id]:updater(s.units?.[unit.id]||{version:1,chapter:0})}}));}
 useEffect(()=>{if(startExplain)patch(r=>({...r,chapter:4}));},[startExplain]);
 function choose(next){patch(r=>({...r,chapter:next}));requestAnimationFrame(()=>{content.current?.scrollIntoView({block:'start',behavior:'instant'});content.current?.focus({preventScroll:true});});}
 function finish(){if(total!==6)return;const now=Date.now();const assisted=Object.values(record.tasks||{}).some(t=>t.hints||t.solutionSeen)||Object.values(record.answers||{}).some(a=>a.firstCorrect===false);setState(s=>({...s,units:{...s.units,[unit.id]:{...s.units[unit.id],completedAt:now}},lessons:{...s.lessons,[unit.id]:{...s.lessons[unit.id],completed:now,due:now+86400000,reviews:0,assisted}}}));onCelebrate();}
 function blockView(block,i){switch(block.type){
  case 'text':return <LessonText key={i} text={block.text}/>;
  case 'detail':return <details className="unit-detail" key={i}><summary>{block.title}</summary><LessonText text={block.text}/></details>;
  case 'code':return <pre className="unit-code-example" key={i}>{block.code}</pre>;
  case 'references':return <ReferenceLab key={i} modes={block.modes} record={record} patch={patch}/>;
  case 'defaults':return <DefaultArgumentLab key={i} record={record} patch={patch}/>;
  case 'prediction':return <Prediction key={i} block={block} record={record} patch={patch}/>;
  case 'practice':return <PracticeLab key={block.task} task={referenceTasks[block.task]} record={record} patch={patch}/>;
  case 'reflection':return <Reflection key={i} record={record} patch={patch}/>;
  case 'project':return <div className="unit-project" key={i}><Icon name="Folder" size={24}/><div><h3>在优惠结算器中继续</h3><p>检查订单里的列表和字典：计算过程是否修改了调用者的数据？用一个前后对照检查证明。</p><a className="text-button" href="#projects/mini-cart">打开项目工作区<Icon name="ArrowRight" size={15}/></a></div></div>;
  case 'completion':return <section className="unit-completion" key={i}><h3>{record.completedAt?'已留下这一轮学习记录':'回顾这次学习的证据'}</h3><ul>{unit.chapters.map((c,j)=><li key={c.id}><Icon name={done[j]?'CheckCircle2':'Circle'} size={16}/><span>{c.title}</span>{!done[j]&&<button className="text-button" onClick={()=>choose(j)}>补齐本节</button>}</li>)}</ul><button className="primary" disabled={total!==6||!!record.completedAt} onClick={finish}>{record.completedAt?'本轮记录已保存':'完成单元 · 保存学习记录'}</button><p>记录包括实验观察、预测、代码检查和解释自查。完成不等于永久掌握；约一周后换个情境，再独立做一次。使用提示和参考实现的情况会保留。</p></section>;
  default:return null;
 }}
 return <main className="learning-unit" data-domain="py"><aside className="unit-sidebar"><a className="back-link" href="#path/py"><Icon name="ArrowLeft" size={16}/>返回 Python</a><h2>本单元</h2><nav aria-label="单元章节">{unit.chapters.map((c,i)=><button key={c.id} aria-current={index===i?'step':undefined} className={index===i?'active':''} onClick={()=>choose(i)}><span>{String(i+1).padStart(2,'0')}</span><span>{c.title}</span>{done[i]&&<Icon name="Check" size={14}/>}</button>)}</nav><div className="unit-progress"><span>实验与练习分别保存</span><div><progress value={total} max={6} aria-label="单元证据进度"/><span>{total} / 6</span></div></div></aside>
  <div className="unit-main"><header className="unit-heading"><div className="breadcrumb"><a href="#explore">学习路线</a><span>/</span><a href="#path/py">Python</a><span>/</span>引用与复制</div><div><h1 ref={heading} tabIndex={-1}>{unit.title}</h1><button className="secondary" onClick={()=>setNotes(true)}><Icon name="NotebookPen" size={16}/>笔记</button></div><p>{unit.subtitle}</p></header>
   <label className="unit-mobile-nav">本单元章节<select value={index} onChange={e=>choose(Number(e.target.value))}>{unit.chapters.map((c,i)=><option key={c.id} value={i}>{String(i+1).padStart(2,'0')} · {c.title}{done[i]?' · 已记录':''}</option>)}</select></label>
   <article className="unit-chapter" ref={content} tabIndex={-1} key={chapter.id}><h2>{chapter.heading}</h2>{chapter.blocks.map(blockView)}</article>
   <nav className="unit-pagination" aria-label="单元前后章节"><button className="text-button" disabled={index===0} onClick={()=>choose(index-1)}><Icon name="ArrowLeft" size={16}/>{index>0?unit.chapters[index-1].title:'本单元起点'}</button>{index<5?<button className="text-button" onClick={()=>choose(index+1)}>下一节：{unit.chapters[index+1].title}<Icon name="ArrowRight" size={16}/></button>:<a className="text-button" href="#path/py">返回 Python 路线<Icon name="ArrowRight" size={16}/></a>}</nav>
   <details className="unit-resources"><summary>先修、资料与学习记录说明<Icon name="ChevronDown" size={15}/></summary><div><h3>先熟悉这两件事</h3><div className="unit-prereqs">{unit.prereqs.map(id=><a key={id} href={'#learn/'+id}>{byId[id].title}<Icon name="ArrowUpRight" size={13}/></a>)}</div><p>本单元可分几次完成。章节位置、实验状态、代码和解释会保存到当前浏览器，并随设置中的进度备份一起导出。</p><h3>进一步核对</h3>{unit.sources.map(source=><a className="unit-source" href={source.url} key={source.url} target="_blank" rel="noreferrer"><span>{source.name}<small>{source.note}</small></span><Icon name="ExternalLink" size={16}/></a>)}<p>原创教学单元 v1 · 核对于 2026-09-10 · 参考 Python 3.12 文档。图解仅覆盖标出的预设场景，练习使用站内 Python 运行器。</p>{state.lessons[unit.id]?.completed&&!record.completedAt&&<p>你之前的课程点亮记录仍保留；本单元的实验与练习记录从新版本单独开始。</p>}</div></details>
  </div>{notes&&<Modal title="引用与复制 · 课程笔记" onClose={()=>setNotes(false)}><label className="unit-note-label">记下问题或理解<textarea value={state.notes[unit.id]||''} maxLength={20000} onChange={e=>{const value=e.target.value;setState(s=>({...s,notes:{...s.notes,[unit.id]:value}}));}}/></label><p className="muted">自动保存到当前浏览器，也会包含在进度备份里。</p></Modal>}
 </main>;
}
