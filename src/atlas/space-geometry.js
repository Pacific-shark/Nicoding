// World coordinates stay fixed. Only explicit user input changes the camera.
export const TAU = Math.PI * 2;
export const CAMERA_DISTANCE = 2200;
export const GLOBAL_CAMERA = Object.freeze({yaw:0, pitch:0, zoom:1});
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

export function rotate(point,{yaw,pitch}) {
 const x=point.x*Math.cos(yaw)+point.z*Math.sin(yaw);
 const z=-point.x*Math.sin(yaw)+point.z*Math.cos(yaw);
 return {x,y:point.y*Math.cos(pitch)-z*Math.sin(pitch),z:point.y*Math.sin(pitch)+z*Math.cos(pitch)};
}
export function project(point,camera,width,height,scale=1) {
 const target=camera.target||{x:0,y:0,z:0};
 const p=rotate({x:point.x-target.x,y:point.y-target.y,z:point.z-target.z},camera),perspective=CAMERA_DISTANCE/(CAMERA_DISTANCE-p.z);
 return {x:width/2+p.x*perspective*scale,y:height/2+p.y*perspective*scale,z:p.z,scale:perspective*scale};
}
export function dragCamera(camera,dx,dy) {
 return {...camera,yaw:(camera.yaw+dx*.006)%TAU,pitch:clamp(camera.pitch-dy*.006,-1.48,1.48)};
}
export function canRotate({button,isPrimary},onNode) {return button===0&&isPrimary!==false&&!onNode;}
// Labels are screen-facing. Try nearby positions before hiding a colliding label;
// its node remains selectable and keyboard focus reveals the full title.
export function placeLabels(nodes,width,height,fontSize=13,selected,reserved=[]) {
 const boxes=[...reserved],result={};
 const ordered=[...nodes].sort((a,b)=>(b.id===selected)-(a.id===selected)||(b.priority||0)-(a.priority||0)||b.z-a.z);
 for(const n of ordered){
  const textWidth=[...n.label].reduce((s,c)=>s+(c.charCodeAt(0)>255?1:.58)*fontSize,0)+12;
  const candidates=[{x:n.x-textWidth/2,y:n.y+n.radius+8},{x:n.x-textWidth/2,y:n.y-n.radius-fontSize-12},{x:n.x+n.radius+9,y:n.y-fontSize/2-3},{x:n.x-n.radius-textWidth-9,y:n.y-fontSize/2-3}];
  const choice=candidates.find(p=>p.x>=6&&p.x+textWidth<=width-6&&p.y>=6&&p.y+fontSize+7<height-6&&!boxes.some(b=>p.x<b.x+b.w+5&&p.x+textWidth+5>b.x&&p.y<b.y+b.h+4&&p.y+fontSize+11>b.y)&&!nodes.some(other=>other.id!==n.id&&p.x<other.x+other.radius+4&&p.x+textWidth>other.x-other.radius-4&&p.y<other.y+other.radius+4&&p.y+fontSize+7>other.y-other.radius-4));
  if(choice){boxes.push({...choice,w:textWidth,h:fontSize+7});result[n.id]={...choice,width:textWidth};}
 }
 return result;
}
