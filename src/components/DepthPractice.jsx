import React,{useState} from 'react';
import {depth} from '../data/depth.js';
import {Icon} from './ui.jsx';
export default function DepthPractice({lesson,progress}) {
 const guide=depth[lesson.id],record=progress.state.explanations[lesson.id]||{text:'',checks:[],stretch:''};
 const [reveal,setReveal]=useState(false);
 function change(patch){progress.setState(s=>({...s,explanations:{...s.explanations,[lesson.id]:{...record,...patch}}}));}
 return <article className="depth-practice"><div className="section-kicker"><Icon name="PawPrint"/>向 Nico 讲清楚</div><p className="depth-intro">先不看正文，解释下面的问题。卡住时回看例子，再用代码核对。</p>
  <section className="teach-workspace"><span className="depth-level">01 · 先自己讲</span><h2>{guide.teach}</h2><label htmlFor="teach-explanation">用自己的话解释 <small>自动保存到本机</small></label><textarea id="teach-explanation" value={record.text} maxLength={20000} onChange={e=>change({text:e.target.value,checks:[]})} placeholder="按本题说明写下你的理解；不确定的地方也可以直接记下来。"/><p className="fineprint">可以先写几句，不必凑字数。这里保存你的解释，不自动评分。</p></section>
  <button className="secondary depth-reveal" aria-expanded={reveal} onClick={()=>setReveal(v=>!v)}><Icon name={reveal?'ChevronUp':'BookOpen'}/>{reveal?'收起参考解释':'查看参考解释'}</button>
  {reveal&&<section className="worked-reasoning"><span className="depth-level">02 · 对照例子</span><h2>参考解释</h2><p>{guide.plain}</p><h3>推演过程</h3><ol>{guide.steps.map((text,i)=><li key={text}><span>{i+1}</span><p>{text}</p></li>)}</ol><p className="fineprint">原理出处在页首“资料与提醒”中。例子中的代码与数值，可以回到实验核对。</p></section>}
  <section className="teach-checks"><span className="depth-level">03 · 对照本节标准</span><h2>检查自己的解释</h2>{guide.checks.map((item,i)=><label key={item}><input type="checkbox" checked={record.checks.includes(i)} onChange={()=>change({checks:record.checks.includes(i)?record.checks.filter(n=>n!==i):[...record.checks,i]})}/><span>{item}</span></label>)}<p className="fineprint">能解释清楚的项可以勾选，方便下次回看。</p></section>
  <section className="stretch-problem"><span className="depth-level">04 · 选学：进一步思考</span><h2>{guide.question}</h2><label htmlFor="stretch-answer">你的思路<textarea id="stretch-answer" value={record.stretch} onChange={e=>change({stretch:e.target.value})} maxLength={20000} placeholder="试着换一个例子，看看刚才的解释是否仍然成立。"/></label><details><summary>对照参考推理</summary><p>{guide.answer}</p></details></section>
  <details className="learning-method"><summary>为什么这样学？</summary><p>用自己的话解释，常能发现读正文时忽略的地方。再换一个例子或运行代码，检查自己的理由是否成立。本页借鉴自我解释与提取练习；具体学习效果仍取决于后续练习。</p><a href="https://ies.ed.gov/ncee/wwc/practiceguide/1" target="_blank" rel="noreferrer">IES · 学习与教学实践指南<Icon name="ExternalLink" size={12}/></a><a href="https://www.cmu.edu/teaching/online/designteach/strategies/activelearning.html" target="_blank" rel="noreferrer">CMU · 解释例题与主动学习<Icon name="ExternalLink" size={12}/></a></details>
 </article>;
}
