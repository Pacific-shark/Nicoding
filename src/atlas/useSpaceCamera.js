import {useEffect,useRef,useState} from 'react';
import {canRotate,cleanCamera,dragCamera,dragSensitivity} from './space-geometry.js';
import {createDragSession} from './drag-session.js';

export function useSpaceCamera(camera,onChange){
 const [live,setLive]=useState(()=>cleanCamera(camera)),[dragging,setDragging]=useState(false);
 const latest=useRef(onChange),session=useRef(null);latest.current=onChange;
 useEffect(()=>{
  const drag=createDragSession({schedule:requestAnimationFrame,cancelFrame:cancelAnimationFrame,render:setLive,commit:value=>latest.current(value)});
  session.current=drag;
  const stop=()=>{drag.finish();setDragging(false);};
  const hidden=()=>{if(document.hidden)stop();};
  window.addEventListener('blur',stop);document.addEventListener('visibilitychange',hidden);
  return()=>{drag.dispose();session.current=null;window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',hidden);};
 },[]);
 useEffect(()=>{session.current?.cancel();setLive(cleanCamera(camera));setDragging(false);},[camera]);
 function stop(e){
  const drag=session.current;if(!drag?.active||e.pointerId!==drag.pointer)return;
  drag.finish(e.pointerId);setDragging(false);
  if(e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
 }
 return {camera:live,dragging,handlers:{
  onPointerDown:e=>{
   const bounds=e.currentTarget.getBoundingClientRect();
   if(!canRotate(e,!!e.target.closest?.('[data-space-target]'))||!session.current?.begin(e.pointerId,e.clientX,e.clientY,live,dragSensitivity(bounds.width,bounds.height)))return;
   e.preventDefault();e.currentTarget.focus({preventScroll:true});
   try{e.currentTarget.setPointerCapture(e.pointerId);}catch{session.current.cancel();return;}
   setDragging(true);
  },
  onPointerMove:e=>{if(e.pointerType==='mouse'&&!(e.buttons&1)){stop(e);return;}session.current?.move(e.pointerId,e.clientX,e.clientY);},
  onPointerUp:stop,onPointerCancel:stop,onLostPointerCapture:stop,
  onKeyDown:e=>{if(e.target!==e.currentTarget)return;const delta={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]}[e.key];if(delta){e.preventDefault();latest.current(dragCamera(live,...delta));}}
 }};
}
