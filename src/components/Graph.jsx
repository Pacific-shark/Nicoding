import React,{useEffect,useMemo,useRef,useState} from 'react';
import {byDomain,byId,domains,lessons} from '../data/index.js';
import {Icon,IconButton,statusOf,statusLabel} from './ui.jsx';
const overview=['py-functions','py-values','py-flow','py-errors','eng-contract','eng-git','eng-sql','ml-problem','dl-attention','llm-agent','rl-mdp','web-async','math-vectors'];
const labels={"dl-attention":"Transformer","llm-agent":"大模型与 Agent","rl-mdp":"强化学习","web-async":"JavaScript","eng-contract":"模块与接口","eng-sql":"SQL 与数据","eng-git":"Git 与变更","ml-problem":"机器学习","math-vectors":"数学与实验"};
const locations=[[455,480],[185,595],[660,610],[545,715],[765,425],[175,390],[85,250],[440,210],[230,80],[555,65],[745,160],[715,310],[325,305]];
export default function Graph({selected,onSelect,domain,setDomain,state}) {
 const host=useRef(),drag=useRef(),frame=useRef();
 const [size,setSize]=useState({w:850,h:780}),[view,setView]=useState('space'),[priority,setPriority]=useState(false),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
 useEffect(()=>{const r=new ResizeObserver(([e])=>setSize({w:e.contentRect.width,h:e.contentRect.height}));r.observe(host.current);return()=>r.disconnect();},[]);
 const nodes=useMemo(()=>{
  let ids=domain==='all'?[...overview]:byDomain[domain].map(l=>l.id);
  if(domain==='all'&&!ids.includes(selected))ids[4]=selected;
  if(priority)ids=ids.filter(id=>byId[id].priority===1);
  return ids.map((id,i)=>{
   let xy;
   if(domain==='all')xy=locations[overview.indexOf(id)>=0?overview.indexOf(id):4];
   else {const a=-Math.PI/2+i*Math.PI*2/ids.length;xy=[430+Math.cos(a)*260,385+Math.sin(a)*290];}
   return {lesson:byId[id],x:xy[0],y:xy[1]};
  });
 },[domain,priority,selected]);
 const baseScale=size.w<500?.62:Math.min((size.w-70)/900,(size.h-70)/810);
 const scale=Math.max(.24,baseScale)*zoom;
 const connections=useMemo(()=>{
  const visible=new Map(nodes.map(n=>[n.lesson.id,n]));
  const result=[];
  for(const n of nodes){
   const found=new Map(),visited=new Set();
   function ancestors(id,depth){if(visited.has(id))return;visited.add(id);if(visible.has(id)){found.set(id,depth);return;}for(const p of byId[id]?.prereqs||[])ancestors(p,depth+1);}
   for(const id of n.lesson.prereqs)ancestors(id,1);
   const direct=[...found].filter(([,depth])=>depth===1);
   const choices=direct.length?direct:[...found].sort((a,b)=>a[1]-b[1]).slice(0,1);
   for(const [id,depth] of choices)result.push({from:visible.get(id),to:n,indirect:depth>1});
  }
  return result;
 },[nodes]);
 const bg=useMemo(()=>Array.from({length:32},(_,i)=>({x:45+(i*157%820),y:40+(i*239%710),r:i%3===0?10:5})),[]);
 function parallax(x=0,y=0){cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{host.current?.style.setProperty('--parallax-x',x+'px');host.current?.style.setProperty('--parallax-y',y+'px');});}
 function reset(){setPan({x:0,y:0});setZoom(1);parallax();}
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 useEffect(()=>{parallax();},[view,state.settings.motion]);
 useEffect(()=>{const el=host.current;const wheel=e=>{e.preventDefault();setZoom(z=>Math.min(1.75,Math.max(.65,z-e.deltaY*.0006)));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
 useEffect(reset,[domain,view]);
 function down(e){if(e.button!==0||e.target.closest('button'))return;drag.current={x:e.clientX,y:e.clientY,pan};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging');}
 function move(e){
  if(drag.current){setPan({x:drag.current.pan.x+e.clientX-drag.current.x,y:drag.current.pan.y+e.clientY-drag.current.y});}
  else if(view==='space'&&state.settings.motion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const r=e.currentTarget.getBoundingClientRect();parallax(((e.clientX-r.left)/r.width-.5)*12,((e.clientY-r.top)/r.height-.5)*10);}
 }
 return <section className={`graph-panel ${view==='flat'?'flat':''}`} aria-label="交互知识树">
  <div className="graph-toolbar"><label className="select-wrap"><span className="sr-only">知识领域</span><select aria-label="知识领域" value={domain} onChange={e=>setDomain(e.target.value)}><option value="all">全部领域</option>{domains.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select><Icon name="ChevronDown" size={14}/></label><div className="segmented" role="group" aria-label="知识树视图" style={{'--view-index':view==='space'?0:1}}><button className={view==='space'?'active':''} aria-pressed={view==='space'} onClick={()=>setView('space')}>空间</button><button className={view==='flat'?'active':''} aria-pressed={view==='flat'} onClick={()=>setView('flat')}>平面</button></div><button className="toggle-label" onClick={()=>setPriority(!priority)} role="switch" aria-checked={priority}><span className={`switch ${priority?'on':''}`}/><span>只看优先</span></button></div>
  <div className="graph-stage" ref={host} onPointerDown={down} onPointerMove={move} onPointerUp={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging');}} onPointerCancel={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging');}} onPointerLeave={()=>{if(!drag.current)parallax();}}>
   {nodes.length===0?<div className="graph-empty"><Icon name="Sparkles" size={32}/><h3>这个领域可以按顺序慢慢来</h3><p>目前没有标为优先的节点。</p><button onClick={()=>setPriority(false)} className="text-button">显示全部节点 <Icon name="ArrowRight"/></button></div>:<div className="graph-world" style={{width:900,height:810,transform:`translate(-50%,-50%) translate(${pan.x}px,${pan.y}px) scale(${scale})`}}>
    <svg className="ambient-network" viewBox="0 0 900 810" aria-hidden="true"><g>{bg.map((p,i)=><React.Fragment key={i}><path d={`M${p.x},${p.y} Q450,400 ${bg[(i+5)%bg.length].x},${bg[(i+5)%bg.length].y}`}/><circle cx={p.x} cy={p.y} r={p.r}/></React.Fragment>)}</g></svg>
    <svg className="knowledge-edges" viewBox="0 0 900 810" aria-hidden="true">{connections.map(({from:a,to:b,indirect})=><path key={`${a.lesson.id}-${b.lesson.id}`} className={indirect?'indirect-edge':''} d={`M${a.x},${a.y} C${a.x},${(a.y+b.y)/2} ${b.x},${a.y} ${b.x},${b.y}`}><title>{a.lesson.title} → {b.lesson.title}{indirect?'（经过未展示节点）':'（直接先修）'}</title></path>)}</svg>
    {nodes.map(({lesson:l,x,y})=>{const st=statusOf(state.lessons[l.id]);const focused=l.id===selected;return <button key={l.id} data-node={l.id} aria-pressed={focused} className={`knowledge-node ${focused?'selected':''} ${l.priority===1?'priority':''} ${st}`} style={{left:x,top:y}} onClick={()=>onSelect(l.id)}><span className="node-orb">{st==='done'||st==='due'?<Icon name="Check" size={focused?24:15}/>:null}</span><span className="node-copy"><strong>{domain==="all"?(labels[l.id]||l.title):l.title}</strong><small>{focused?`${l.depth} · ${statusLabel[st]}`:domains.find(d=>d.id===l.domain).name}</small></span></button>;})}
   </div>}
   <div className="graph-caption" title="实线是直接先修；虚线经过未展示节点。概览简化了路径，完整先修见知识点详情。"><span className="eyebrow">YOUR LEARNING CONSTELLATION</span><span>{domain==='all'?`8 个领域 · ${lessons.length} 节 · 拖动平移 / 滚轮缩放`:domains.find(d=>d.id===domain).caption}</span><span className="graph-edge-note">实线：直接先修 · 虚线：间接先修 · 完整先修见详情</span></div>
  </div>
  <div className="graph-footer"><div className="legend">{['new','started','done','due'].map(s=><span key={s}><i className={`status-dot ${s}`}/>{statusLabel[s]}</span>)}</div><div className="graph-controls"><IconButton name="Minus" label="缩小知识树" onClick={()=>setZoom(z=>Math.max(.65,z-.1))}/><span className="zoom-label">{Math.round(zoom*100)}%</span><IconButton name="Plus" label="放大知识树" onClick={()=>setZoom(z=>Math.min(1.75,z+.1))}/><IconButton name="Focus" label="重置视角" onClick={reset}/></div></div>
 </section>;
}
