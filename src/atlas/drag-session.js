import {dragCamera,cleanCamera} from './space-geometry.js';
// One outstanding animation frame; no retained DOM events or timers at rest.
export function createDragSession({schedule,cancelFrame,render,commit}){
 let start=null,pending=null,frame=null,disposed=false;
 const clear=()=>{if(frame!==null)cancelFrame(frame);frame=null;};
 return {
  get active(){return !!start;},
  get pointer(){return start?.pointer;},
  begin(pointer,x,y,camera){if(disposed||start)return false;start={pointer,x,y,camera:cleanCamera(camera)};return true;},
  move(pointer,x,y){if(disposed||!start||pointer!==start.pointer)return;pending=dragCamera(start.camera,x-start.x,y-start.y);if(frame===null)frame=schedule(()=>{frame=null;if(!disposed&&pending)render(pending);});},
  finish(pointer){if(disposed||!start||(pointer!==undefined&&pointer!==start.pointer))return;start=null;clear();if(pending){const value=pending;pending=null;render(value);commit(value);}},
  cancel(){start=null;pending=null;clear();},
  dispose(){disposed=true;start=null;pending=null;clear();}
 };
}