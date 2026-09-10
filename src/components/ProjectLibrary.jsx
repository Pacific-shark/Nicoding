import React from 'react';
import {projects} from '../data/index.js';
import {Icon} from './ui.jsx';

export default function ProjectLibrary({state}) {
 const started=projects.filter(p=>{const saved=state.projects[p.id];return saved&&(saved.code||saved.note||saved.steps?.length);});
 const choices=started.length?started.slice(0,3):['mini-cart','mini-tasks','mini-retriever'].map(id=>projects.find(p=>p.id===id));
 return <section className="studio-welcome" aria-label="选择实践项目"><div className="studio-welcome-inner"><div className="studio-welcome-icon"><Icon name="Code2" size={25}/></div><h1>选一个项目，开始动手。</h1><p>把需求拆成任务，在同一个工作区里写代码、看结果。</p><h2>{started.length?'接着上次的项目':'可以从这里开始'}</h2><div className="studio-resume-list">{choices.map(p=><a href={`#projects/${p.id}`} key={p.id}><Icon name={p.tier==='mini'?'FileCode2':'Folder'} size={21}/><span><strong>{p.name}</strong><small>{p.label} · {started.length?`${state.projects[p.id].steps?.length||0} / ${p.steps.length} 项已记录`:p.minutes}</small></span><Icon name="ArrowRight" size={18}/></a>)}</div><p className="studio-welcome-footnote">小项目可直接在浏览器运行。综合项目保留任务和记录，在自己的开发环境中完成。</p></div></section>;
}
