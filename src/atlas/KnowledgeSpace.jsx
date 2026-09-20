import React,{memo,useEffect,useId,useMemo,useRef,useState} from 'react';
import {chapterById} from './catalog.js';
import {knowledgeById,shortTitle} from './knowledge.js';
import {clamp,placeLabels,project,branchArc} from './space-geometry.js';
import {globalPoints,FIELD_RADIUS} from './knowledge-layout.js';
import {personality} from './knowledge-personality.js';
import KnowledgeCat from './KnowledgeCat.jsx';
import {useSpaceCamera} from './useSpaceCamera.js';

function useSize(ref){
 const [size,setSize]=useState({width:800,height:620});
 useEffect(()=>{
  const element=ref.current;if(!element)return;
  const update=()=>{const rect=element.getBoundingClientRect(),width=Math.round(rect.width),height=Math.round(rect.height);if(width>0&&height>0)setSize(old=>old.width===width&&old.height===height?old:{width,height});};
  update();
  if(typeof ResizeObserver==='undefined'){window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);}
  const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();
 },[ref]);return size;
}
function activate(e,fn){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn();}}
function arcPaths(samples,camera,width,height,scale){
 const points=samples.map(p=>project(p,camera,width,height,scale)),segments={front:'',back:''};
 let previous;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],side=(a.z+b.z)/2>=0?'front':'back';
  segments[side]+=(side!==previous?'M'+a.x.toFixed(1)+','+a.y.toFixed(1):'')+'L'+b.x.toFixed(1)+','+b.y.toFixed(1);
  previous=side;
 }
 return segments;
}
const CatSymbols=memo(function CatSymbols({prefix}){
 return <>{Array.from({length:12},(_,i)=><g id={prefix+'-cat-'+i} key={i}><KnowledgeCat pose={Math.floor(i/3)} level={i%3}/></g>)}</>;
});
function CatLabel({node,placement,selected}){
 const labelWidth=Math.min(node.canvasWidth-20,Math.max(66,[...node.label].length*12+12));
 const p=placement||{x:clamp(node.x-labelWidth/2,8,node.canvasWidth-labelWidth-8),y:clamp(node.y+node.radius+6,5,node.canvasHeight-28),width:labelWidth};
 return <g className={'cat-label '+(!placement?'cat-label-reveal':'')} pointerEvents="none">
  <rect x={p.x} y={p.y} width={p.width} height="24" rx="5" fill="#faf9f5" fillOpacity={selected?.97:.87}/>
  <text x={p.x+p.width/2} y={p.y+16} textAnchor="middle">{node.label}</text>
 </g>;
}
export default function KnowledgeSpace({mode,domain,camera:savedCamera,onCamera,points,selected,onSelect,progress}){
 const viewport=useRef(null),{width,height}=useSize(viewport),{camera,dragging,handlers}=useSpaceCamera(savedCamera,onCamera);
 const prefix=useId().replace(/:/g,''),global=mode==='global',compact=width<520,world=global?globalPoints:points;
 const related=useMemo(()=>new Set([...(knowledgeById[selected]?.prereqs||[]),...world.filter(p=>knowledgeById[p.id].prereqs.includes(selected)).map(p=>p.id)]),[selected,world]);
 const edges=useMemo(()=>{
  const byId=Object.fromEntries(world.map(p=>[p.id,p]));
  return world.flatMap(n=>knowledgeById[n.id].prereqs.filter(id=>byId[id]).map(id=>({from:id,to:n.id,sameDomain:byId[id].domain===n.domain,color:chapterById[n.domain].color,samples:branchArc(byId[id],n)})));
 },[world]);
 const fieldRadius=Math.max(24,Math.min(width,height)*.43-8)*camera.zoom,scale=fieldRadius/FIELD_RADIUS;
 const projected=useMemo(()=>world.map(p=>{
  const screen=project(p,camera,width,height,scale),depth=clamp(screen.z/FIELD_RADIUS,-1,1),proximity=(depth+1)/2;
  const radius=clamp((global?17:25)*Math.min(1,Math.min(width,height)/660)*(.65+.45*proximity)*Math.sqrt(camera.zoom),global?7:12,global?22:30);
  return {...p,...screen,depth,radius,opacity:.3+.7*Math.pow(proximity,1.2),label:shortTitle(knowledgeById[p.id]),canvasWidth:width,canvasHeight:height,priority:p.id===selected?4:related.has(p.id)?3:p.domain===domain?2:0};
 }).sort((a,b)=>a.z-b.z),[world,camera,width,height,scale,global,related,selected,domain]);
 const labels=useMemo(()=>placeLabels(projected,width,height,compact?10:12,selected,global?(compact?10:20):24),[projected,width,height,compact,global,selected]);
 const paths=useMemo(()=>edges.filter(e=>!global||e.sameDomain||e.from===selected||e.to===selected).map(e=>({...e,...arcPaths(e.samples,camera,width,height,scale),active:e.from===selected||e.to===selected})),[edges,global,selected,camera,width,height,scale]);
 return <div className={'knowledge-space '+(global?'is-global ':'')+(dragging?'is-dragging':'')} ref={viewport} tabIndex={0} role="group" aria-label="知识星图画布：空白处按住左键拖动，方向键也可转动视角" data-orientation={camera.orientation.map(v=>v.toFixed(6)).join(',')} data-renderer="branching" {...handlers}>
  <svg width={width} height={height} viewBox={'0 0 '+width+' '+height} className={'space-svg cat-constellation '+(global?'cat-global':'cat-local')} aria-label={global?'全局三维知识星图':chapterById[domain].name+'三维知识星图'} role="group">
   <defs>
    <CatSymbols prefix={prefix}/>
   </defs>
   <g className="cat-relations" pointerEvents="none">{paths.map(e=><g key={e.from+'-'+e.to} data-prerequisite={e.from+'-'+e.to} style={{'--branch-color':e.color}} className={e.active?'is-linked':''}><path d={e.back} className="arc-back"/><path d={e.front} className="arc-front"/></g>)}</g>
   {projected.map(n=>{
    const k=knowledgeById[n.id],active=n.id===selected,p=personality(n.id),completed=!!progress?.state?.lessons?.[n.id]?.completed;
    const color=active?'#a65333':chapterById[n.domain].color;
    return <g key={n.id} data-space-target={n.id} data-difficulty={p.id} data-depth={n.depth.toFixed(3)} className={'space-target cat-node '+(active?'selected ':'')+(related.has(n.id)?'related ':'')+(completed?'completed':'')} style={{color,'--cat-fill':active?'#fff0db':'#fffdf8','--depth-opacity':n.opacity}} role="button" tabIndex={0} aria-label={k.title+'，'+p.label+'，'+p.expression+'表情'+(completed?'，已完成检查':'')} aria-pressed={active} onClick={()=>onSelect(n.id)} onDoubleClick={()=>{location.hash='knowledge/'+n.id;}} onKeyDown={e=>activate(e,()=>onSelect(n.id))}>
     <title>{k.title+' · '+p.label+' · '+p.expression+'表情'}</title>
     <circle className="space-hit" cx={n.x} cy={n.y} r={Math.max(n.radius+4,global?12:18)}/>
     <g className="cat-depth" pointerEvents="none">
      {active&&<circle className="cat-selected-ring" cx={n.x} cy={n.y} r={n.radius+7}/>}
      <use href={'#'+prefix+'-cat-'+(p.pose*3+p.level)} transform={'translate('+n.x.toFixed(2)+' '+n.y.toFixed(2)+') scale('+(n.radius/22).toFixed(3)+')'}/>
      {completed&&<g className="cat-completion" transform={'translate('+(n.x+n.radius-1)+' '+(n.y+n.radius-1)+')'}><circle r="5"/><path d="M-2 0l1.5 1.5L3-2"/></g>}
     </g>
     <CatLabel node={n} placement={labels[n.id]} selected={active}/>
    </g>;
   })}
  </svg>
 </div>;
}
