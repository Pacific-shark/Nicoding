import React,{useMemo,useState} from 'react';
import {Icon} from '../components/ui.jsx';
import {chapters,chapterById} from './catalog.js';
import {knowledge,knowledgeById} from './knowledge.js';
import {topics,topicsFor,topicHref} from './topics.js';
import {AtlasShell} from './AtlasShell.jsx';
import KnowledgeSpace,{PlanetSurface} from './KnowledgeSpace.jsx';
import {GLOBAL_CAMERA,clamp,dragCamera,facePoint,spherePoints} from './space-geometry.js';

const domainKnowledge=Object.fromEntries(chapters.map(c=>[c.id,knowledge.filter(k=>k.domain===c.id)]));
const domainPoints=Object.fromEntries(chapters.map(c=>[c.id,spherePoints(domainKnowledge[c.id])]));
const domainTopics=Object.fromEntries(chapters.map(c=>[c.id,topics.filter(t=>t.chapter===c.id)]));
const defaultCamera=(domain,selected)=>facePoint(domainPoints[domain].find(p=>p.id===selected)||domainPoints[domain][0]);

function KnowledgeInspector({node,onChoose}) {
 const related=topicsFor(node.id);
 return <>
  <div className="atlas-breadcrumb">{chapterById[node.domain].name}<Icon name="ChevronRight" size={14}/></div>
  <h2>{node.title}</h2><p>{node.subtitle}</p>
  <p className="inspector-definition">{node.parts[0][1].replace(/```[\s\S]*?```/g,'').replace(/`/g,'').split('\n\n')[0].slice(0,220)}</p>
  <section><h3>先修知识</h3>{node.prereqs.length?node.prereqs.map(id=><button key={id} className="inspector-prereq" onClick={()=>onChoose(id,true)}><i/>{knowledgeById[id].title}<Icon name="ChevronRight" size={14}/></button>):<p>可以从这里开始。</p>}</section>
  <section><h3>用于这些课题</h3>{related.length?related.map(t=><a key={t.id} className="inspector-topic" href={topicHref(t.id)}><Icon name="FileCode2" size={17}/><span>{t.title}</span><Icon name="ChevronRight" size={14}/></a>):<p>拓展知识，可用于本章的自选实验。</p>}</section>
  <a className="atlas-primary inspector-open" href={'#knowledge/'+node.id}>打开知识点<Icon name="ArrowRight" size={16}/></a>
 </>;
}
export default function Constellation({id,view,progress}) {
 const initial=knowledgeById[view]?.domain||(chapterById[id]?id:'ml');
 const [mode,setMode]=useState(chapterById[id]||knowledgeById[view]?'local':'global');
 const [domain,setDomain]=useState(initial),[selected,setSelected]=useState(knowledgeById[view]?view:domainKnowledge[initial][0].id);
 const [query,setQuery]=useState(''),[list,setList]=useState(false);
 const [cameras,setCameras]=useState(()=>({...Object.fromEntries(chapters.map(c=>[c.id,defaultCamera(c.id)])),global:{...GLOBAL_CAMERA},[initial]:defaultCamera(initial,view)}));
 const cameraKey=mode==='global'?'global':domain,camera=cameras[cameraKey];
 const isList=list||!!query.trim(),chapter=chapterById[domain],node=knowledgeById[selected];
 const matching=useMemo(()=>knowledge.filter(k=>(mode==='global'||k.domain===domain)&&[k.title,k.subtitle,k.id].join(' ').toLowerCase().includes(query.trim().toLowerCase())),[domain,mode,query]);
 const onCamera=value=>setCameras(previous=>({...previous,[cameraKey]:value}));
 function chooseDomain(value){setDomain(value);if(node.domain!==value)setSelected(domainKnowledge[value][0].id);setQuery('');}
 function enterDomain(value){chooseDomain(value);setMode('local');setList(false);}
 function chooseNode(value,focus=false){
  const next=knowledgeById[value];setSelected(value);setDomain(next.domain);
  if(focus||mode==='global'||isList){setMode('local');setList(false);setQuery('');setCameras(previous=>({...previous,[next.domain]:defaultCamera(next.domain,value)}));}
 }
 const reset=()=>onCamera(mode==='global'?{...GLOBAL_CAMERA}:defaultCamera(domain,domainKnowledge[domain][0].id));
 const rail=<>
  <div className="atlas-rail-title"><h2>知识星图</h2><p>转动视角，查找知识</p></div>
  <label className="atlas-map-search"><Icon name="Search" size={16}/><input aria-label="搜索星图知识点" placeholder="搜索知识点" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除星图搜索" onClick={()=>setQuery('')}><Icon name="X" size={14}/></button>}</label>
  <div className="space-segment space-level" role="group" aria-label="空间层级"><button aria-pressed={mode==='global'} onClick={()=>{setMode('global');setQuery('');}}>全局</button><button aria-pressed={mode==='local'} onClick={()=>{setMode('local');setQuery('');}}>局部</button></div>
  <nav className="atlas-chapter-nav" aria-label="星图领域">{chapters.map(c=><button key={c.id} className={domain===c.id?'active':''} aria-pressed={domain===c.id} onClick={()=>chooseDomain(c.id)}><i style={{background:c.color}}/>{c.name}<small>{domainKnowledge[c.id].length}</small></button>)}</nav>
  <div className="space-controller">
   <h3>视角</h3>
   <div className="space-zoom"><button aria-label="缩小星图" disabled={isList||camera.zoom<=.7} onClick={()=>onCamera({...camera,zoom:clamp(camera.zoom-.1,.7,1.6)})}><Icon name="Minus" size={16}/></button><output aria-label="当前缩放">{Math.round(camera.zoom*100)}%</output><button aria-label="放大星图" disabled={isList||camera.zoom>=1.6} onClick={()=>onCamera({...camera,zoom:clamp(camera.zoom+.1,.7,1.6)})}><Icon name="Plus" size={16}/></button></div>
   <button className="space-reset" disabled={isList} onClick={reset}><Icon name="RotateCcw" size={15}/>复位视角</button>
   <div className="space-direction" role="group" aria-label="转动视角">{[['向左转动','ChevronRight',-35,0],['向上转动','ChevronUp',0,-35],['向下转动','ChevronDown',0,35],['向右转动','ChevronRight',35,0]].map(([label,icon,x,y])=><button key={label} aria-label={label} disabled={isList} onClick={()=>onCamera(dragCamera(camera,x,y))}><Icon name={icon} size={16} style={x<0?{transform:'rotate(180deg)'}:undefined}/></button>)}</div>
   {mode==='local'&&<button className="space-focus" disabled={isList} onClick={()=>onCamera({...defaultCamera(domain,selected),zoom:camera.zoom})}><Icon name="Focus" size={15}/>定位选中知识</button>}
   <div className="space-segment" role="group" aria-label="星图呈现"><button aria-pressed={!isList} onClick={()=>{setList(false);setQuery('');}}>空间</button><button aria-pressed={isList} onClick={()=>setList(true)}>列表</button></div>
   <p className="space-drag-help"><Icon name="MousePointer2" size={13}/><span>空白处按住左键拖动<br/>松手即停，也可用方向键</span></p>
  </div>
 </>;
 return <AtlasShell rail={rail} identity={id||'all'} kind="atlas-map atlas-space">
  <div className="atlas-map-work"><section className="atlas-map-surface">
   <header className="atlas-map-head"><h1>{mode==='global'?'知识星系':chapter.name}</h1><p>{mode==='global'?'选择一颗星球，展开这个领域的知识。':'转动星球，沿先修关系探索知识。'}</p></header>
   {isList?<div className="atlas-map-results"><p>{matching.length} 个结果{query&&<span> · 搜索“{query}”</span>}</p>{matching.length?<div className="atlas-node-list">{matching.map(k=><button key={k.id} onClick={()=>chooseNode(k.id,true)}><span><strong>{k.title}</strong><small>{k.subtitle}</small></span><Icon name="ChevronRight" size={16}/></button>)}</div>:<p role="status">没有匹配项。可以换一个词，或切换到全局。</p>}</div>:<KnowledgeSpace key={cameraKey} mode={mode} domain={domain} camera={camera} onCamera={onCamera} points={domainPoints[domain]} selected={selected} onSelect={chooseNode} onDomain={chooseDomain} onEnter={enterDomain} progress={progress}/>}
   <footer className="space-caption"><span>{mode==='global'?'全局 · '+chapters.length+' 个领域':chapter.name+' · '+domainKnowledge[domain].length+' 个知识点'}</span><small>{mode==='global'?'点击星球选择 · 双击进入局部':'点击节点查看 · 双击打开讲解 · 箭头由先修指向后续'}</small></footer>
  </section><aside className="atlas-inspector" aria-label={mode==='global'?'选中领域':'选中知识点'}>
   {mode==='global'?<>
    <svg className="inspector-planet" viewBox="-52 -52 104 104" aria-hidden="true"><PlanetSurface color={chapter.color} radius={41} camera={GLOBAL_CAMERA} id={'inspector-'+domain}/></svg>
    <h2>{chapter.name}</h2><p>{chapter.intro}</p><p className="space-domain-count">{domainKnowledge[domain].length} 个知识点 · {domainTopics[domain].length} 个课题</p>
    <section><h3>从这些知识开始</h3>{domainKnowledge[domain].slice(0,4).map(k=><button key={k.id} className="space-domain-knowledge" onClick={()=>chooseNode(k.id,true)}><span>{k.title}</span><Icon name="ChevronRight" size={14}/></button>)}</section>
    <section><h3>本章课题</h3>{domainTopics[domain].map(t=><a key={t.id} className="inspector-topic" href={topicHref(t.id)}><Icon name="FileCode2" size={16}/><span>{t.title}</span><Icon name="ChevronRight" size={14}/></a>)}</section>
    <button className="atlas-primary inspector-open" onClick={()=>enterDomain(domain)}>进入局部星图<Icon name="ArrowRight" size={16}/></button>
   </>:<KnowledgeInspector node={node} onChoose={chooseNode}/>}
  </aside></div>
 </AtlasShell>;
}

