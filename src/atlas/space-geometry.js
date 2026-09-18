export const TAU=Math.PI*2;
export const GLOBAL_CAMERA=Object.freeze({yaw:0,pitch:0,zoom:1});
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const finite=(v,fallback)=>Number.isFinite(v)?v:fallback;
const angle=v=>((finite(v,0)+Math.PI)%TAU+TAU)%TAU-Math.PI;
export const cleanCamera=(camera={})=>({yaw:angle(camera.yaw),pitch:angle(camera.pitch),zoom:clamp(finite(camera.zoom,1),.7,1.25)});
export function rotate(point,camera){
 const {yaw,pitch}=cleanCamera(camera),x=point.x*Math.cos(yaw)+point.z*Math.sin(yaw),z=-point.x*Math.sin(yaw)+point.z*Math.cos(yaw);
 return {x,y:point.y*Math.cos(pitch)-z*Math.sin(pitch),z:point.y*Math.sin(pitch)+z*Math.cos(pitch)};
}
// Orthographic positions keep the silhouette round. Glyph size and opacity
// convey depth without rotating the cat or its label away from the reader.
export function project(point,camera,width,height,scale=1){
 const p=rotate(point,camera);
 return {x:width/2+p.x*scale,y:height/2+p.y*scale,z:p.z,scale};
}
export function focusCamera(point,camera=GLOBAL_CAMERA){
 if(!point)return cleanCamera(camera);
 return {yaw:-Math.atan2(point.x,point.z),pitch:Math.atan2(point.y,Math.hypot(point.x,point.z)),zoom:cleanCamera(camera).zoom};
}
export function dragCamera(camera,dx,dy){
 const clean=cleanCamera(camera);
 return cleanCamera({...clean,yaw:clean.yaw+finite(dx,0)*.006,pitch:clean.pitch-finite(dy,0)*.006});
}
export function canRotate({button,isPrimary},onNode){return button===0&&isPrimary!==false&&!onNode;}
export function sphereArc(a,b,steps=20){
 const radius=Math.hypot(a.x,a.y,a.z),dot=clamp((a.x*b.x+a.y*b.y+a.z*b.z)/(radius*Math.hypot(b.x,b.y,b.z)),-1,1),theta=Math.acos(dot),sin=Math.sin(theta);
 if(theta<1e-6)return [a,b];
 const axis=Math.abs(a.y)<radius*.9?{x:-a.z,y:0,z:a.x}:{x:a.y,y:-a.x,z:0},length=Math.hypot(axis.x,axis.y,axis.z);
 return Array.from({length:steps+1},(_,i)=>{
  const t=i/steps;
  if(Math.abs(sin)<1e-6)return {x:a.x*Math.cos(Math.PI*t)+axis.x/length*radius*Math.sin(Math.PI*t),y:a.y*Math.cos(Math.PI*t)+axis.y/length*radius*Math.sin(Math.PI*t),z:a.z*Math.cos(Math.PI*t)+axis.z/length*radius*Math.sin(Math.PI*t)};
  const u=Math.sin((1-t)*theta)/sin,v=Math.sin(t*theta)/sin;
  return {x:a.x*u+b.x*v,y:a.y*u+b.y*v,z:a.z*u+b.z*v};
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
