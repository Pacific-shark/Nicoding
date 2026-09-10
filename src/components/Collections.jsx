import React,{useState} from 'react';
import {lessons,domains} from '../data/index.js';
import {Icon,Modal} from './ui.jsx';
import {Quiz} from './Lesson.jsx';
import ProjectStudio from './ProjectStudio.jsx';
export function Review({progress,onLearn,onCelebrate}) {
 const [active,setActive]=useState(null),[passed,setPassed]=useState(false);
 const completed=lessons.filter(l=>progress.state.lessons[l.id]?.completed).sort((a,b)=>progress.state.lessons[a.id].due-progress.state.lessons[b.id].due);
 const due=completed.filter(l=>progress.state.lessons[l.id].due<=Date.now());
 return <main className="collection-page"><div className="collection-title"><h1>复习</h1><p>根据上次完成的时间安排回顾，看看哪些内容还记得。</p></div><div className="review-summary"><span><b>{due.length}</b> 今天待复习</span><span><b>{completed.length}</b> 已点亮节点</span><span><Icon name="Clock"/>按实际完成时间安排</span></div>{completed.length?<div className="review-list">{completed.map(l=>{const r=progress.state.lessons[l.id],isDue=r.due<=Date.now();return <div className="review-row" key={l.id}><span className={`review-status ${isDue?'is-due':''}`}><Icon name={isDue?'RefreshCw':'CheckCircle2'}/></span><div><small>{domains.find(d=>d.id===l.domain).name}</small><h3>{l.title}</h3><p>{r.assisted?'上次借助了提示或纠错':'上次未使用提示'} · 已复习 {r.reviews||0} 次</p></div><time>{isDue?'现在可以回想':new Date(r.due).toLocaleDateString('zh-CN')+' 到期'}</time><button className="secondary" onClick={()=>{setActive(l);setPassed(false);}}>{isDue?'开始复习':'提前回想'}<Icon name="ArrowRight" size={15}/></button></div>;})}</div>:<div className="empty-state"><div className="empty-orb"><Icon name="Bookmark" size={28}/></div><h2>完成第一节课后，这里会有复习安排。</h2><p>完成课程的理解检查和练习后，节点会自动进入复习计划。</p><button className="primary" onClick={()=>onLearn('py-values')}>从变量与对象开始<Icon name="ArrowRight"/></button></div>}{active&&<Modal wide title={`复习 · ${active.title}`} onClose={()=>setActive(null)}><Quiz key={active.id} lesson={active} review onPass={ok=>setPassed(ok)}/><div className="modal-footer"><button className="text-button" onClick={()=>{setActive(null);onLearn(active.id);}}>回到讲解<Icon name="ArrowRight" size={14}/></button><button className="primary" disabled={!passed} onClick={()=>{progress.review(active.id);setActive(null);onCelebrate();}}>记录本次复习<Icon name="Check"/></button></div></Modal>}</main>;
}
export function Projects(props) { return <ProjectStudio {...props}/>; }
