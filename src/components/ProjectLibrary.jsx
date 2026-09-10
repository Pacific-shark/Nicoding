import React from 'react';
import {projects,domains,byId} from '../data/index.js';
import {Icon} from './ui.jsx';

export default function ProjectLibrary({state}) {
 return <main className="collection-page project-library"><header className="collection-title"><h1>实践项目</h1><p>选一个学过的主题，写代码、跑检查，再记录自己的结论。</p></header>
  {[['mini','小项目','在浏览器里完成核心逻辑，适合学完一个方向后练习。'],['full','综合项目','在自己的开发环境中实现，包含需求、测试和交付。']].map(([tier,title,description])=><section className="project-library-group" key={tier}><header className="library-heading"><div><h2>{title}</h2><p>{description}</p></div><span>{projects.filter(p=>(p.tier==='mini')===(tier==='mini')).length} 个项目</span></header><div className="project-library-list">{projects.filter(p=>(p.tier==='mini')===(tier==='mini')).map((p,i)=>{
   const domain=domains.find(d=>d.id===byId[p.skills[0]].domain),done=state.projects[p.id]?.steps?.length||0;
   return <a key={p.id} className="project-library-row" href={`#projects/${p.id}`}><span className="project-number">{String(i+1).padStart(2,'0')}</span><span className="project-library-copy"><h3>{p.name}</h3><p>{domain.name}{p.tier==='mini'?` · ${p.minutes}`:' · 本地实践'}</p></span><span className="project-library-status">{done?`${done} / ${p.steps.length} 项已记录`:'未开始'}</span><Icon name="ArrowRight" size={18}/></a>;
  })}</div></section>)}
 </main>;
}
