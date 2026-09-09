import React,{useState} from 'react';
import {depth} from '../data/depth.js';
import {Icon} from './ui.jsx';
export default function DepthPractice({lesson,progress}) {
 const guide=depth[lesson.id],record=progress.state.explanations[lesson.id]||{text:'',checks:[],stretch:''};
 const [reveal,setReveal]=useState(false);
 function change(patch){progress.setState(s=>({...s,explanations:{...s.explanations,[lesson.id]:{...record,...patch}}}));}
 return <article className="depth-practice"><div className="section-kicker"><Icon name="PawPrint"/>向 Nico 讲清楚</div><p className="depth-intro">借鉴费曼式自我解释：先闭卷讲，再找卡点、回看推演，最后换一个例子。写得流畅不等于理解正确，要用下面的标准和实验核对。</p>
  <section className="teach-workspace"><span className="depth-level">01 · 先自己讲</span><h2>{guide.teach}</h2><label htmlFor="teach-explanation">用自己的话解释 <small>自动保存到本机</small></label><textarea id="teach-explanation" value={record.text} maxLength={20000} onChange={e=>change({text:e.target.value,checks:[]})} placeholder="它解决什么问题？为什么这样工作？举一个自己的例子，再指出一个不能这样用的情况。"/><p className="fineprint">遇到讲不下去的地方，直接写“这里我还不明白……”。本页不按字数、关键词或模型评分判定掌握。</p></section>
  <button className="secondary depth-reveal" aria-expanded={reveal} onClick={()=>setReveal(v=>!v)}><Icon name={reveal?'ChevronUp':'BookOpen'}/>{reveal?'收起推演，再独立讲一次':'打开直观解释与逐步推演'}</button>
  {reveal&&<section className="worked-reasoning"><span className="depth-level">02 · 找到缺口，再推一遍</span><h2>先建立直觉</h2><p>{guide.plain}</p><h3>一步一步，追到原因</h3><ol>{guide.steps.map((text,i)=><li key={text}><span>{i+1}</span><p>{text}</p></li>)}</ol><p className="fineprint">这些是为本课编写的推演，原理资料见右侧“资料”。代码与数值可以回到实验中独立核对。</p></section>}
  <section className="teach-checks"><span className="depth-level">03 · 对照本节标准</span><h2>你的解释，能经得起这三问吗？</h2>{guide.checks.map((item,i)=><label key={item}><input type="checkbox" checked={record.checks.includes(i)} onChange={()=>change({checks:record.checks.includes(i)?record.checks.filter(n=>n!==i):[...record.checks,i]})}/><span>{item}</span></label>)}<p className="fineprint">这是自查记录，和课程的代码验证、理解题分开保存。勾选不会自动点亮节点。</p></section>
  <section className="stretch-problem"><span className="depth-level">04 · 进阶与迁移</span><h2>{guide.question}</h2><label htmlFor="stretch-answer">先留下推理，再看参考<textarea id="stretch-answer" value={record.stretch} onChange={e=>change({stretch:e.target.value})} maxLength={20000} placeholder="写出假设、推理、可能的反例，以及你会怎样验证。"/></label><details><summary>对照参考推理</summary><p>{guide.answer}</p></details></section>
  <details className="learning-method"><summary>为什么这样学？</summary><p>本练习将自我解释、例题推演、闭卷提取和变式练习组合使用。方法用于发现理解缺口，不保证仅靠讲解就能掌握工程与算法。</p><a href="https://ies.ed.gov/ncee/wwc/practiceguide/1" target="_blank" rel="noreferrer">IES · 学习与教学实践指南<Icon name="ExternalLink" size={12}/></a><a href="https://www.cmu.edu/teaching/online/designteach/strategies/activelearning.html" target="_blank" rel="noreferrer">CMU · 解释例题与主动学习<Icon name="ExternalLink" size={12}/></a></details>
 </article>;
}
