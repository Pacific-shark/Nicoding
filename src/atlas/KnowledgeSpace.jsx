import React,{memo,useEffect,useId,useMemo,useRef,useState} from 'react';
import {chapterById} from './catalog.js';
import {knowledgeById,shortTitle} from './knowledge.js';
import {CAMERA_DISTANCE,LOCAL_RADIUS,PLANETS,canRotate,connection,dragCamera,globeLines,orbit,placeLabels,project,projectedPath,rotate} from './space-geometry.js';

const grid=globeLines(),miniatureGrid=globeLines(1),orbits=[140,235,305,355].map(r=>orbit(r));
const tint=(hex,factor)=>'#'+hex.slice(1).match(/../g).map(v=>Math.round(factor>=0?parseInt(v,16)+(255-parseInt(v,16))*factor:parseInt(v,16)*(1+factor)).toString(16).padStart(2,'0')).join('');
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
export function PlanetSurface({color,radius,camera,id}) {
 const paths=useMemo(()=>miniatureGrid.map(line=>{let path='',started=false;for(const point of line){const p=rotate(point,camera);if(p.z<0){started=false;continue;}path+=(started?'L':'M')+(p.x*radius).toFixed(2)+','+(p.y*radius).toFixed(2)+' ';started=true;}return path;}),[radius,camera]);
 return <g pointerEvents="none"><defs><radialGradient id={id} cx="28%" cy="22%" r="82%"><stop offset="0" stopColor={tint(color,.69)}/><stop offset=".36" stopColor={tint(color,.27)}/><stop offset=".72" stopColor={color}/><stop offset="1" stopColor={tint(color,-.47)}/></radialGradient></defs><circle r={radius} fill={'url(#'+id+')'}/>{paths.map((d,i)=><path key={i} d={d} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".7"/>)}<circle r={radius} fill="none" stroke={tint(color,-.25)} strokeOpacity=".28" strokeWidth=".8"/></g>;
}
function NodeLabel({node,placement,active}) {
 const p=placement||{x:node.x-65,y:node.y+node.radius+9,width:130};
 return <g className={'space-label '+(!placement?'space-label-collapsed':'')} pointerEvents={placement?'auto':'none'}><rect x={p.x} y={p.y} width={p.width} height="24" rx="5" fill="var(--atlas-bg)" fillOpacity={active?.98:.88}/><text x={p.x+p.width/2} y={p.y+16} textAnchor="middle">{node.label}</text></g>;
}
function depthPaths(points,camera,width,height,scale,frontLimit) {
 let front='',back='',previous=null;
 for(const point of points){const p=project(point,camera,width,height,scale),near=p.z>=frontLimit,position=p.x.toFixed(2)+','+p.y.toFixed(2);const command=previous?.near===near?'L':'M';
  if(near)front+=command+position+' ';else back+=command+position+' ';previous={near};
 }
 return {front,back};
}
function activate(e,fn){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn();}}
const GlobalScene=memo(function GlobalScene({camera,size,domain,onSelect,onEnter}) {
 const prefix=useId().replace(/:/g,''),{width,height}=size,scale=Math.min(width/920,height/740)*camera.zoom;
 const nodes=PLANETS.map(n=>{const p=project(n,camera,width,height,scale);return {...n,...p,radius:n.radius*p.scale,label:chapterById[n.id].name};}).sort((a,b)=>a.z-b.z);
 const labels=placeLabels(nodes,width,height,width<500?12:14,domain);
 return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="space-svg space-global" aria-label="全局领域星系" role="group"><g className="space-orbits" pointerEvents="none">{orbits.map((points,i)=><path key={i} d={projectedPath(points,camera,width,height,scale)} strokeDasharray={i===0?'3 6':undefined}/>)}</g>{nodes.map(n=>{const active=domain===n.id;return <g key={n.id} className={'space-target space-planet '+(active?'selected':'')} data-space-target={n.id} data-depth={n.z.toFixed(3)} role="button" tabIndex={0} aria-label={n.label+'星球'} aria-pressed={active} onClick={()=>onSelect(n.id)} onDoubleClick={()=>onEnter(n.id)} onKeyDown={e=>activate(e,()=>onSelect(n.id))}><title>{n.label} · 双击进入局部星图</title><circle className="space-hit" cx={n.x} cy={n.y} r={Math.max(n.radius+7,19)}/>{active&&<ellipse className="planet-selection" cx={n.x} cy={n.y} rx={n.radius+10} ry={n.radius+10}/>}<g transform={`translate(${n.x} ${n.y})`}><PlanetSurface color={chapterById[n.id].color} radius={n.radius} camera={camera} id={prefix+'-'+n.id}/></g><NodeLabel node={n} placement={labels[n.id]} active={active}/></g>;})}</svg>;
});
function LocalScene({camera,size,points,selected,onSelect,progress,domain}) {
 const prefix=useId().replace(/:/g,''),{width,height}=size,scale=Math.min((width-52)/620,(height-48)/560)*camera.zoom;
 const radius=LOCAL_RADIUS*CAMERA_DISTANCE/Math.sqrt(CAMERA_DISTANCE**2-LOCAL_RADIUS**2)*scale;
 const nodes=points.map(p=>({...p,...project(p,camera,width,height,scale),radius:8,label:shortTitle(knowledgeById[p.id])})).sort((a,b)=>a.z-b.z);
 const labels=placeLabels(nodes,width,height,width<500?12:15,selected),frontLimit=LOCAL_RADIUS**2/CAMERA_DISTANCE;
 const pointById=useMemo(()=>Object.fromEntries(points.map(p=>[p.id,p])),[points]);
 const edges=useMemo(()=>points.flatMap(p=>knowledgeById[p.id].prereqs.filter(k=>pointById[k]&&(p.id===selected||k===selected)).map(k=>({id:k+'-'+p.id,points:connection(pointById[k],p)}))),[points,pointById,selected]);
 return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="space-svg space-local" aria-label={chapterById[domain].name+'知识星球'} role="group"><defs><radialGradient id={prefix+'-body'} cx="33%" cy="25%" r="76%"><stop offset="0" stopColor="#fffefb" stopOpacity=".12"/><stop offset=".6" stopColor={tint(chapterById[domain].color,.83)} stopOpacity=".22"/><stop offset="1" stopColor={tint(chapterById[domain].color,.55)} stopOpacity=".35"/></radialGradient><radialGradient id={prefix+'-node'} cx="30%" cy="20%" r="85%"><stop stopColor="#d9dce0"/><stop offset=".4" stopColor="#717d87"/><stop offset="1" stopColor="#39424c"/></radialGradient><radialGradient id={prefix+'-active'} cx="30%" cy="20%" r="85%"><stop stopColor="#ffe3be"/><stop offset=".4" stopColor="#c87d56"/><stop offset="1" stopColor="#974a2e"/></radialGradient><marker id={prefix+'-arrow'} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8" fill="#b86645"/></marker></defs>
  <circle className="space-globe-body" cx={width/2} cy={height/2} r={radius} fill={'url(#'+prefix+'-body)'} pointerEvents="none"/><g className="space-grid" pointerEvents="none">{grid.map((line,i)=>{const paths=depthPaths(line,camera,width,height,scale,frontLimit);return <g key={i}><path className="rear" d={paths.back}/><path d={paths.front}/></g>;})}</g><g className="space-connections" pointerEvents="none">{edges.map(edge=>{const paths=depthPaths(edge.points.slice(2,-2),camera,width,height,scale,frontLimit),end=project(edge.points.at(-3),camera,width,height,scale),marker='url(#'+prefix+'-arrow)';return <g key={edge.id} data-prerequisite={edge.id}><path className="rear" d={paths.back} markerEnd={end.z<frontLimit?marker:undefined}/><path d={paths.front} markerEnd={end.z>=frontLimit?marker:undefined}/></g>;})}</g>
  {nodes.map(n=>{const k=knowledgeById[n.id],active=n.id===selected,completed=!!progress.state.lessons[n.id]?.completed,back=n.z<frontLimit;return <g key={n.id} data-space-target={n.id} data-depth={n.z.toFixed(3)} className={'space-target space-knowledge '+(active?'selected ':'')+(back?'rear ':'')+(completed?'completed':'')} role="button" tabIndex={0} aria-label={k.title+(back?'，位于背面':'')+(completed?'，已完成检查':'')} aria-pressed={active} onClick={()=>onSelect(n.id)} onDoubleClick={()=>{location.hash='knowledge/'+n.id;}} onKeyDown={e=>activate(e,()=>onSelect(n.id))}><title>{k.title}{back?' · 转动星球可查看正面':''}</title><circle className="space-hit" cx={n.x} cy={n.y} r="18"/>{active&&<circle className="knowledge-selection" cx={n.x} cy={n.y} r="15"/>}<circle className="knowledge-dot" cx={n.x} cy={n.y} r={(active?9:6.5)*Math.max(.78,Math.min(1.12,n.scale/scale))} fill={'url(#'+prefix+(active?'-active':'-node')+')'}/>{completed&&<path className="knowledge-check" d={`M${n.x-3},${n.y}l2,2 4,-4`}/>}<NodeLabel node={n} placement={labels[n.id]} active={active}/></g>;})}
 </svg>;
}
export default function KnowledgeSpace({mode,domain,camera,onCamera,points,selected,onSelect,onDomain,onEnter,progress}) {
 const viewport=useRef(null),size=useSize(viewport),{dragging,handlers}=useDrag(camera,onCamera);
 return <div className={'knowledge-space '+(dragging?'is-dragging':'')} ref={viewport} tabIndex={0} role="group" aria-label="空间画布：空白处按住左键拖动，方向键也可转动视角" data-yaw={camera.yaw.toFixed(5)} data-pitch={camera.pitch.toFixed(5)} {...handlers}>{mode==='global'?<GlobalScene camera={camera} size={size} domain={domain} onSelect={onDomain} onEnter={onEnter}/>:<LocalScene camera={camera} size={size} domain={domain} points={points} selected={selected} onSelect={onSelect} progress={progress}/>}</div>;
}
