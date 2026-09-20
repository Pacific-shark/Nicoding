export const GLOBAL_CAMERA=Object.freeze({orientation:Object.freeze([0,0,0,1]),zoom:1});
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const finite=(v,fallback)=>Number.isFinite(v)?v:fallback;
function unitQuaternion(value){
 const q=Array.isArray(value)&&value.length===4&&value.every(Number.isFinite)?value:[0,0,0,1],length=Math.hypot(...q);
 return Number.isFinite(length)&&length>1e-12?q.map(n=>n/length):[0,0,0,1];
}
function multiply(a,b){
 const [x,y,z,w]=a,[X,Y,Z,W]=b;
 return [w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z];
}
export const cleanCamera=(camera={})=>({orientation:unitQuaternion(camera.orientation),zoom:clamp(finite(camera.zoom,1),.7,1.25)});
export function rotate(point,camera){
 const [x,y,z,w]=cleanCamera(camera).orientation;
 const tx=2*(y*point.z-z*point.y),ty=2*(z*point.x-x*point.z),tz=2*(x*point.y-y*point.x);
 return {x:point.x+w*tx+y*tz-z*ty,y:point.y+w*ty+z*tx-x*tz,z:point.z+w*tz+x*ty-y*tx};
}
// Orthographic projection keeps text readable; world coordinates carry depth.
export function project(point,camera,width,height,scale=1){
 const p=rotate(point,camera);
 return {x:width/2+p.x*scale,y:height/2+p.y*scale,z:p.z,scale};
}
export function focusCamera(point,camera=GLOBAL_CAMERA){
 const clean=cleanCamera(camera);if(!point)return clean;
 const p=rotate(point,clean),length=Math.hypot(p.x,p.y,p.z);if(length<1e-9)return clean;
 // Shortest rotation from the current direction to the front, preserving roll.
 const q=p.z/length<-.999999?[1,0,0,0]:unitQuaternion([p.y/length,-p.x/length,0,1+p.z/length]);
 return {...clean,orientation:unitQuaternion(multiply(q,clean.orientation))};
}
export function dragCamera(camera,dx,dy,gain=.006){
 const clean=cleanCamera(camera),x=finite(dx,0),y=finite(dy,0),distance=Math.hypot(x,y);if(!distance)return clean;
 const halfAngle=distance*gain/2,s=Math.sin(halfAngle)/distance;
 // Pre-multiply: the axis belongs to the screen, even after a full flip.
 return {...clean,orientation:unitQuaternion(multiply([-y*s,x*s,0,Math.cos(halfAngle)],clean.orientation))};
}
export const dragSensitivity=(width,height)=>clamp(2.8/Math.max(1,Math.min(width,height)),.0035,.009);
export function canRotate({button,isPrimary},onNode){return button===0&&isPrimary!==false&&!onNode;}
export function branchArc(a,b,steps=12){
 // A short bow through the volume, never a route along a spherical shell.
 const distance=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2};
 const length=Math.hypot(mid.x,mid.y,mid.z)||1,bend=Math.min(24,distance*.12);
 const control={x:mid.x*(1-bend/length),y:mid.y*(1-bend/length),z:mid.z*(1-bend/length)};
 return Array.from({length:steps+1},(_,i)=>{
  const t=i/steps,u=1-t;
  return {x:u*u*a.x+2*u*t*control.x+t*t*b.x,y:u*u*a.y+2*u*t*control.y+t*t*b.y,z:u*u*a.z+2*u*t*control.z+t*t*b.z};
 });
}
export function placeLabels(nodes,width,height,fontSize=12,selected,limit=24){
 const boxes=[],result={};
 const ordered=[...nodes].sort((a,b)=>(b.id===selected)-(a.id===selected)||(b.priority||0)-(a.priority||0)||b.z-a.z);
 for(const n of ordered){
  if(boxes.length>=limit)break;
  if(n.depth<-.12&&n.id!==selected)continue;
  const textWidth=Math.min(width-16,[...n.label].reduce((s,c)=>s+(c.charCodeAt(0)>255?1:.58)*fontSize,0)+12);
  const candidates=[{x:n.x-textWidth/2,y:n.y+n.radius+7},{x:n.x-textWidth/2,y:n.y-n.radius-25},{x:n.x+n.radius+8,y:n.y-12},{x:n.x-n.radius-textWidth-8,y:n.y-12}];
  const choice=candidates.find(p=>p.x>=6&&p.x+textWidth<=width-6&&p.y>=6&&p.y+24<height-6&&!boxes.some(b=>p.x<b.x+b.w+5&&p.x+textWidth+5>b.x&&p.y<b.y+28&&p.y+28>b.y)&&!nodes.some(other=>other.id!==n.id&&other.depth>-.12&&p.x<other.x+other.radius+3&&p.x+textWidth>other.x-other.radius-3&&p.y<other.y+other.radius+3&&p.y+24>other.y-other.radius-3));
  if(choice){boxes.push({...choice,w:textWidth});result[n.id]={...choice,width:textWidth};}
 }
 return result;
}
