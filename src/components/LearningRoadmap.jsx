import React from 'react';
import {byId,domains,lessons,projects} from '../data/index.js';
import {branches,paths,placements,reasons,nextLesson,firstMissingPrereq,pathCompletion} from '../data/paths.js';
import {Icon,statusOf,statusLabel} from './ui.jsx';

const domainById=Object.fromEntries(domains.map(d=>[d.id,d]));
const number=n=>String(n).padStart(2,'0');
export function Prerequisites({lesson,records}) {
 return <div className="path-prereqs"><span>建议先会</span>{lesson.prereqs.length?lesson.prereqs.map(id=><a key={id} href={`#learn/${id}`} className={records[id]?.completed?'is-complete':''}><Icon name={records[id]?.completed?'CheckCircle2':'BookOpen'} size={12}/>{byId[id].domain!==lesson.domain&&<small>{domainById[byId[id].domain].short} · </small>}{byId[id].title}</a>):<span className="no-prereqs">无需先修，从这里开始</span>}</div>;
}
function DomainRow({id,records,recommended}) {
 const d=domainById[id],path=paths[id],done=pathCompletion(id,records);
 return <a className={`direction-row${recommended?' recommended':''}`} href={`#path/${id}`}><span className="direction-icon"><Icon name={d.icon} size={23}/></span><span className="direction-copy"><h3>{d.name}</h3><p>{d.caption}</p></span><span className="direction-progress"><span>{done} / {path.ids.length}<span className="sr-only"> 节已点亮</span></span>{done>0&&<progress value={done} max={path.ids.length} aria-label={`${d.name}完成进度`}/>}</span><Icon name="ChevronRight" size={18}/></a>;
}
const branchCopy={
 foundation:{title:'基础能力',hint:'先学 Python，工程与 Web 随后并行。'},
 application:{title:'AI 应用',hint:'补好接口与测试，再连接知识和工具。'},
 algorithm:{title:'算法原理',hint:'数学 → 机器学习 → 深度学习，强化学习继续拓展。'}
};
export function Roadmap({state}) {
 const done=lessons.filter(l=>state.lessons[l.id]?.completed).length;
 const last=byId[state.last],started=last&&state.lessons[last.id]?.visited&&!state.lessons[last.id]?.completed;
 const target=started?last.id:lessons.find(l=>!state.lessons[l.id]?.completed&&l.prereqs.every(id=>state.lessons[id]?.completed))?.id;
 const suggested=target?byId[target]:null;
 return <main className="roadmap-page"><div className="roadmap-intro"><div><h1>今天，学懂一点。</h1><p>从读懂代码，到独立交付。按自己的节奏，一步步来。</p></div><div className="atlas-progress"><span><b>{done}</b> / {lessons.length} 节已点亮</span><progress value={done} max={lessons.length} aria-label="总学习进度"/></div></div>
  <section className="continue-strip" aria-label="学习建议"><span className="continue-icon"><Icon name="BookOpen" size={28}/></span><div><small>{suggested?(started?'接着上次':'从这里开始'):'课程已全部完成'}</small><h2>{suggested?suggested.title:'选择一个项目练习'}</h2><p>{suggested?`${domainById[suggested.domain].name} · ${suggested.minutes} 分钟起`:'用学过的知识完成一次独立练习。'}</p></div><a className="primary" href={suggested?`#learn/${suggested.id}`:'#projects'}>{suggested?(started?'继续学习':'开始学习'):'查看项目'}<Icon name="ArrowRight" size={17}/></a></section>
  <section className="direction-library" aria-labelledby="directions-heading"><header className="library-heading"><div><h2 id="directions-heading">学习路线</h2><p>共同基础打底后，按目标选择分支。</p></div><span>{domains.length} 个方向</span></header>
   {branches.map(b=><section className="direction-group" key={b.id} aria-label={branchCopy[b.id].title}><div className="direction-group-heading"><span>{b.id==='foundation'?'共同起点':b.id==='application'?'分支 A':'分支 B'}</span><h3>{branchCopy[b.id].title}</h3><p>{branchCopy[b.id].hint}</p></div><div className="direction-rows">{b.domains.map(id=><DomainRow id={id} records={state.lessons} recommended={suggested?.domain===id} key={id}/>)}</div></section>)}
  </section>
  <p className="atlas-footnote">进度保存在当前浏览器，可在设置中导出备份。</p>
 </main>;
}
export function DomainPath({id,state}) {
 const d=domainById[id],path=paths[id],done=pathCompletion(id,state.lessons),next=nextLesson(id,state.lessons);
 const missing=next&&firstMissingPrereq(next,state.lessons),project=projects.find(p=>p.id===path.project);
 function jump(index){document.getElementById(`chapter-${index}`)?.scrollIntoView({block:'start',behavior:'instant'});document.getElementById(`chapter-${index}`)?.focus({preventScroll:true});}
 return <main className="path-page" style={{'--domain-color':d.color}}><aside className="path-sidebar"><a className="back-link" href="#explore"><Icon name="ArrowLeft" size={16}/>全部学习方向</a><details className="direction-switcher"><summary>切换学习方向<Icon name="ChevronDown" size={15}/></summary><nav className="path-domains" aria-label="学习方向">{branches.flatMap(b=>b.domains).map(domain=><a href={`#path/${domain}`} key={domain} aria-current={domain===id?'page':undefined}><span>{domainById[domain].name}</span><small>{pathCompletion(domain,state.lessons)}/{paths[domain].ids.length}</small></a>)}</nav></details><div className="chapter-index"><h3>学习阶段</h3>{path.chapters.map((c,i)=><button key={c.title} onClick={()=>jump(i)}><span>{number(i+1)}</span>{c.title}</button>)}</div><div className="path-goal"><h3>完成后，你能</h3><p>{path.outcome}</p></div></aside>
  <div className="path-main"><header className="path-heading"><div className="breadcrumb"><a href="#explore">学习路线</a><span>/</span>{d.name}</div><div className="path-title-line"><span className="domain-symbol"><Icon name={d.icon} size={27}/></span><h1>{d.name}</h1><span className="path-count">{done}<small> / {path.ids.length} 点亮</small></span></div><p className="path-lead">{path.lead}</p><p className="path-entry">{path.entry}</p><div className="path-start-row"><a className="primary" href={next?`#learn/${next}`:`#projects/${project.id}`}>{next?(done?'继续本方向':'开始本方向'):'用项目巩固'}<Icon name="ArrowRight" size={16}/></a>{missing&&<span>还没学过先修？<a href={`#learn/${missing}`}>先补「{byId[missing].title}」<Icon name="ArrowRight" size={13}/></a></span>}</div></header>
   <div className="path-legend"><span><i className="legend-line"/>编号是建议学习顺序</span><span><Icon name="BookOpen" size={13}/>每节下方列出直接先修</span><span><i className="legend-glow"/>优先掌握</span></div>
   {path.chapters.map((c,i)=><section className="path-chapter" id={`chapter-${i}`} tabIndex={-1} key={c.title}><header><span className="chapter-number">{number(i+1)}</span><div><h2>{c.title}</h2><p>{c.reason}</p></div><span className="chapter-count">{c.ids.filter(id=>state.lessons[id]?.completed).length}/{c.ids.length}</span></header><ol className="lesson-chain" start={placements[c.ids[0]].index+1}>{c.ids.map(lessonId=>{const l=byId[lessonId],record=state.lessons[lessonId],status=statusOf(record);return <li className={`path-node ${l.priority===1?'priority':''} ${status}`} key={lessonId} data-lesson={lessonId}><a className="path-lesson-link" href={`#learn/${lessonId}`}><span className="path-node-orb">{record?.completed?<Icon name="Check" size={20}/>:number(placements[lessonId].index+1)}</span><span className="path-node-copy"><span className="path-node-title">{l.title}{l.priority===1&&<small>优先</small>}</span><span className="path-node-reason">{reasons[lessonId]}</span></span><span className="path-node-meta"><span>{statusLabel[status]}</span><small>{l.minutes} 分钟起</small></span><Icon name="ArrowRight" size={18}/></a><Prerequisites lesson={l} records={state.lessons}/></li>;})}</ol><div className="chapter-outcome"><Icon name="Flag" size={15}/><span>这一阶段的成果</span><p>{c.outcome}</p></div></section>)}
   <section className="path-destination"><span className="eyebrow">把这条路，走进项目</span><h2>{project.name}</h2><p>{project.intro}</p><a className="primary" href={`#projects/${project.id}`}>查看交付与验收<Icon name="ArrowRight" size={16}/></a><div className="path-next-domains"><span>接下来可以连接</span>{path.next.map(id=><a href={`#path/${id}`} key={id}>{domainById[id].name}<Icon name="ArrowRight" size={14}/></a>)}</div></section>
  </div></main>;
}
