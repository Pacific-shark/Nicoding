import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {chapters,chapterById} from './catalog.js';
import {knowledgeById,shortTitle} from './knowledge.js';
import {canRotate,clamp,dragCamera,placeLabels,project} from './space-geometry.js';
import {CLUSTERS,globalPoints,compactClusters,compactGlobalPoints} from './knowledge-layout.js';
import {personality} from './knowledge-personality.js';
import KnowledgeCat from './KnowledgeCat.jsx';
function useSize(ref) {
 const [size,setSize]=useState({width:800,height:620});
 useEffect(()=>{const observer=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect;if(width&&height)setSize({width,height});});observer.observe(ref.current);return()=>observer.disconnect();},[ref]);return size;
}
function useDrag(camera,onChange) {
 const drag=useRef(null),frame=useRef(null),pending=useRef(null),change=useRef(onChange),[dragging,setDragging]=useState(false);change.current=onChange;
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
 const stop=e=>{
  if(!drag.current||e&&e.pointerId!==undefined&&e.pointerId!==drag.current.pointer)return;
  drag.current=null;setDragging(false);
  if(frame.current!==null){cancelAnimationFrame(frame.current);frame.current=null;}
  if(pending.current){change.current(pending.current);pending.current=null;}
  if(e?.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
 };
 return {dragging,handlers:{
  onPointerDown:e=>{if(!canRotate(e,!!e.target.closest('[data-space-target]'))||drag.current)return;e.preventDefault();e.currentTarget.focus({preventScroll:true});drag.current={pointer:e.pointerId,x:e.clientX,y:e.clientY,camera};setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);},
  onPointerMove:e=>{const start=drag.current;if(!start||e.pointerId!==start.pointer)return;if(e.pointerType==='mouse'&&!(e.buttons&1)){stop(e);return;}pending.current=dragCamera(start.camera,e.clientX-start.x,e.clientY-start.y);if(frame.current===null)frame.current=requestAnimationFrame(()=>{frame.current=null;if(pending.current){change.current(pending.current);pending.current=null;}});},
  onPointerUp:stop,onPointerCancel:stop,onLostPointerCapture:stop,
  onKeyDown:e=>{if(e.target!==e.currentTarget)return;const delta={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]}[e.key];if(delta){e.preventDefault();onChange(dragCamera(camera,...delta));}},
 }};
}

function activate(e,fn){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn();}}
function relationPath(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
 if(d<a.radius+b.radius+10)return null;
 const ax=a.x+dx/d*(a.radius+5),ay=a.y+dy/d*(a.radius+5),bx=b.x-dx/d*(b.radius+6),by=b.y-dy/d*(b.radius+6);
 return 'M'+ax.toFixed(2)+','+ay.toFixed(2)+' L'+bx.toFixed(2)+','+by.toFixed(2);
}
function CatLabel({node,placement,active,selected}){
 const labelWidth=Math.max(80,[...node.label].length*13+14),p=placement||{x:clamp(node.x-labelWidth/2,7,node.canvasWidth-labelWidth-7),y:clamp(node.y+node.radius+6,5,node.canvasHeight-30),width:labelWidth};
 return <g className={'cat-label '+(!placement?'cat-label-reveal':'')} pointerEvents={placement?'auto':'none'}>
  <rect x={p.x} y={p.y} width={p.width} height="24" rx="4" fill="var(--atlas-bg)" fillOpacity={active||selected?1:.94}/>
  <text x={p.x+p.width/2} y={p.y+16} textAnchor="middle">{node.label}</text>
 </g>;
}
export default function KnowledgeSpace({mode,domain,camera,onCamera,points,selected,onSelect,progress}){
 const viewport=useRef(null),size=useSize(viewport),{dragging,handlers}=useDrag(camera,onCamera),prefix=useId().replace(/:/g,'');
 const [hovered,setHovered]=useState(null),[focused,setFocused]=useState(null);
 const {width,height}=size,global=mode==='global',compact=width<520,world=global?(compact?compactGlobalPoints:globalPoints):points;
 const renderCamera=camera.focusId?{...camera,target:world.find(p=>p.id===camera.focusId)||camera.target}:camera;
 const clusters=compact?compactClusters:CLUSTERS;
 const extentX=global?(compact?335:550):Math.max(...world.map(p=>Math.abs(p.x)),250)+80;
 const extentY=global?(compact?620:450):Math.max(...world.map(p=>Math.abs(p.y)),190)+65;
 const scale=Math.min((width-36)/(extentX*2),(height-32)/(extentY*2))*camera.zoom;
 const selectedKnowledge=knowledgeById[selected];
 const related=useMemo(()=>new Set([...selectedKnowledge.prereqs,...world.filter(p=>knowledgeById[p.id].prereqs.includes(selected)).map(p=>p.id)]),[selected,selectedKnowledge,world]);
 const projected=world.map(p=>{
  const projection=project(p,renderCamera,width,height,scale),active=p.id===selected;
  const baseRadius=global?(compact?8:14*Math.min(1,scale/camera.zoom/.77)):(compact?15:23);
  const radius=clamp(baseRadius*(projection.scale/scale)*Math.sqrt(camera.zoom),global?7:(compact?13:18),global?24:31);
  return {...p,...projection,radius,label:shortTitle(knowledgeById[p.id]),canvasWidth:width,canvasHeight:height,priority:active?4:related.has(p.id)?3:p.domain===domain?2:0};
 }).sort((a,b)=>a.z-b.z);
 const byId=Object.fromEntries(projected.map(p=>[p.id,p]));
 const headings=global?chapters.map(c=>({...c,...project({...clusters[c.id],y:clusters[c.id].y-135},renderCamera,width,height,scale)})):[];
 const reserved=headings.map(p=>({x:p.x-60,y:p.y-17,w:120,h:26}));
 const labels=placeLabels(projected,width,height,compact?(global?9:12):(global?11:13),selected,reserved);
 const foreground=hovered||focused||selected;
 const ordered=[...projected.filter(p=>p.id!==foreground),...projected.filter(p=>p.id===foreground)];
 return <div className={'knowledge-space '+(global?'is-global ':'')+(dragging?'is-dragging':'')} ref={viewport} tabIndex={0} role="group" aria-label="知识星图画布：空白处按住左键拖动，方向键也可转动视角" data-yaw={camera.yaw.toFixed(5)} data-pitch={camera.pitch.toFixed(5)} {...handlers}>
  <svg width={width} height={height} viewBox={'0 0 '+width+' '+height} className={'space-svg cat-constellation '+(global?'cat-global':'cat-local')} aria-label={global?'全局知识点星图':chapterById[domain].name+'知识关系图'} role="group">
   <defs><marker id={prefix+'-arrow'} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8" fill="#b86645"/></marker></defs>
   <g className="cat-relations" pointerEvents="none">{projected.flatMap(n=>knowledgeById[n.id].prereqs.filter(p=>byId[p]).map(p=>{
    const a=byId[p],active=n.id===selected||p===selected;
    if(global&&a.domain!==n.domain&&!active)return null;
    const d=relationPath(a,n);return d?<path key={p+'-'+n.id} data-prerequisite={p+'-'+n.id} className={active?'selected':''} d={d} markerEnd={active?'url(#'+prefix+'-arrow)':undefined}/>:null;
   }))}</g>
   {global&&<g className="cat-cluster-labels" pointerEvents="none">{headings.map(p=><text key={p.id} x={p.x} y={p.y} textAnchor="middle" fill={p.color}>{p.name}</text>)}</g>}
   {ordered.map(n=>{
    const k=knowledgeById[n.id],active=n.id===selected,p=personality(n.id),completed=!!progress.state.lessons[n.id]?.completed,relevant=related.has(n.id);
    const catColor=active?'#a65333':chapterById[n.domain].color;
    return <g key={n.id} data-space-target={n.id} data-difficulty={p.id} data-depth={n.z.toFixed(3)} className={'space-target cat-node '+(active?'selected ':'')+(relevant?'related ':'')+(global&&n.domain!==domain&&!relevant?'muted ':'')+(completed?'completed':'')} style={{color:catColor,'--cat-fill':active?'#fff1dd':'#fffdf9'}} role="button" tabIndex={0} aria-label={k.title+'，'+p.label+'，'+p.expression+'表情'+(completed?'，已完成检查':'')} aria-pressed={active} onClick={()=>onSelect(n.id)} onDoubleClick={()=>{location.hash='knowledge/'+n.id;}} onKeyDown={e=>activate(e,()=>onSelect(n.id))} onPointerEnter={()=>setHovered(n.id)} onPointerLeave={()=>setHovered(null)} onFocus={()=>setFocused(n.id)} onBlur={()=>setFocused(null)}>
     <title>{k.title+' · '+p.label+' · '+p.expression+'表情'}</title>
     <circle className="space-hit" cx={n.x} cy={n.y} r={Math.max(n.radius+3,global?12:18)}/>
     {active&&<circle className="cat-selected-ring" cx={n.x} cy={n.y} r={n.radius+7}/>}
     <g transform={'translate('+n.x+' '+n.y+') scale('+(n.radius/22)+')'} pointerEvents="none"><KnowledgeCat pose={p.pose} level={p.level}/></g>
     {completed&&<g className="cat-completion" transform={'translate('+(n.x+n.radius-1)+' '+(n.y+n.radius-1)+')'} pointerEvents="none"><circle r="5"/><path d="M-2 0l1.5 1.5L3-2"/></g>}
     <CatLabel node={n} placement={labels[n.id]} active={n.id===foreground} selected={active}/>
    </g>;
   })}
  </svg>
 </div>;
}
