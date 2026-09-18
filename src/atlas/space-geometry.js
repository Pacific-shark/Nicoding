// World coordinates stay fixed. Only explicit user input changes the camera.
export const TAU = Math.PI * 2;
export const LOCAL_RADIUS = 235;
export const CAMERA_DISTANCE = 1050;
export const GLOBAL_CAMERA = Object.freeze({yaw:0, pitch:-.82, zoom:1});
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

export function rotate(point,{yaw,pitch}) {
 const x=point.x*Math.cos(yaw)+point.z*Math.sin(yaw);
 const z=-point.x*Math.sin(yaw)+point.z*Math.cos(yaw);
 return {x,y:point.y*Math.cos(pitch)-z*Math.sin(pitch),z:point.y*Math.sin(pitch)+z*Math.cos(pitch)};
}
export function project(point,camera,width,height,scale=1) {
 const p=rotate(point,camera),perspective=CAMERA_DISTANCE/(CAMERA_DISTANCE-p.z);
 return {x:width/2+p.x*perspective*scale,y:height/2+p.y*perspective*scale,z:p.z,scale:perspective*scale};
}
export function orbit(radius,tilt=0,count=120) {
 return Array.from({length:count+1},(_,i)=>{const a=i/count*TAU;return {x:radius*Math.cos(a),y:Math.sin(a)*tilt,z:radius*Math.sin(a)};});
}
export function globeLines(radius=LOCAL_RADIUS) {
 const lines=[];
 for(let lat=-60;lat<=60;lat+=30){
  const a=lat*Math.PI/180,r=radius*Math.cos(a),y=radius*Math.sin(a);
  lines.push(orbit(r).map(p=>({...p,y})));
 }
 for(let lon=0;lon<180;lon+=30){
  const a=lon*Math.PI/180;
  lines.push(Array.from({length:121},(_,i)=>{const b=i/120*TAU;return {x:radius*Math.cos(b)*Math.cos(a),y:radius*Math.sin(b),z:radius*Math.cos(b)*Math.sin(a)};}));
 }
 return lines;
}
export function spherePoints(items,radius=LOCAL_RADIUS) {
 const angle=Math.PI*(3-Math.sqrt(5));
 return items.map((item,i)=>{const y=1-2*(i+.5)/items.length,r=Math.sqrt(1-y*y),a=i*angle;
  return {id:item.id,x:Math.cos(a)*r*radius,y:y*radius,z:Math.sin(a)*r*radius};
 });
}
export function facePoint(point,zoom=1) {
 return {yaw:Math.atan2(-point.x,point.z),pitch:Math.atan2(point.y,Math.hypot(point.x,point.z)),zoom};
}
export function dragCamera(camera,dx,dy) {
 return {...camera,yaw:(camera.yaw+dx*.006)%TAU,pitch:clamp(camera.pitch-dy*.006,-1.48,1.48)};
}
export function canRotate({button,isPrimary},onNode) {return button===0&&isPrimary!==false&&!onNode;}
export function projectedPath(points,camera,width,height,scale) {
 return points.map((p,i)=>{const s=project(p,camera,width,height,scale);return (i?'L':'M')+s.x.toFixed(2)+','+s.y.toFixed(2);}).join(' ');
}
// Shortest great-circle arc, slightly lifted above the sphere for visible relations.
export function connection(a,b,radius=LOCAL_RADIUS+3) {
 const norm=p=>{const n=Math.hypot(p.x,p.y,p.z);return {x:p.x/n,y:p.y/n,z:p.z/n};};
 const u=norm(a),v=norm(b),dot=clamp(u.x*v.x+u.y*v.y+u.z*v.z,-1,1),angle=Math.acos(dot);
 return Array.from({length:49},(_,i)=>{
  const t=i/48;
  if(angle<.0001)return {x:u.x*radius,y:u.y*radius,z:u.z*radius};
  // A deterministic orthogonal vector also handles antipodal endpoints.
  const orth=norm(Math.abs(u.y)<.9?{x:-u.z,y:0,z:u.x}:{x:0,y:u.z,z:-u.y});
  const perpendicular=dot<-.9999?orth:norm({x:v.x-u.x*dot,y:v.y-u.y*dot,z:v.z-u.z*dot});
  return {x:radius*(u.x*Math.cos(angle*t)+perpendicular.x*Math.sin(angle*t)),y:radius*(u.y*Math.cos(angle*t)+perpendicular.y*Math.sin(angle*t)),z:radius*(u.z*Math.cos(angle*t)+perpendicular.z*Math.sin(angle*t))};
 });
}

const planetLayout=[
 ['py',218,350,43,-30],['web',268,330,39,-40],['eng',312,355,36,-20],
 ['math',178,335,36,0],['ml',-8,232,51,18],['dl',137,295,40,10],
 ['llm',88,305,42,0],['rl',39,346,34,0],
];
export const PLANETS=planetLayout.map(([id,angle,distance,radius,y])=>({id,radius,x:Math.cos(angle*Math.PI/180)*distance,y,z:Math.sin(angle*Math.PI/180)*distance}));

// Labels are screen-facing. Try nearby positions before hiding a colliding label;
// its node remains selectable and keyboard focus reveals the full title.
export function placeLabels(nodes,width,height,fontSize=13,selected) {
 const boxes=[],result={};
 const ordered=[...nodes].sort((a,b)=>(b.id===selected)-(a.id===selected)||b.z-a.z);
 for(const n of ordered){
  const textWidth=[...n.label].reduce((s,c)=>s+(c.charCodeAt(0)>255?1:.58)*fontSize,0)+12;
  const candidates=[{x:n.x-textWidth/2,y:n.y+n.radius+8},{x:n.x-textWidth/2,y:n.y-n.radius-fontSize-12},{x:n.x+n.radius+9,y:n.y-fontSize/2-3},{x:n.x-n.radius-textWidth-9,y:n.y-fontSize/2-3}];
  const choice=candidates.find(p=>p.x>=6&&p.x+textWidth<=width-6&&p.y>=6&&p.y+fontSize+7<height-6&&!boxes.some(b=>p.x<b.x+b.w+5&&p.x+textWidth+5>b.x&&p.y<b.y+b.h+4&&p.y+fontSize+11>b.y)&&!nodes.some(other=>other.id!==n.id&&p.x<other.x+other.radius+4&&p.x+textWidth>other.x-other.radius-4&&p.y<other.y+other.radius+4&&p.y+fontSize+7>other.y-other.radius-4));
  if(choice){boxes.push({...choice,w:textWidth,h:fontSize+7});result[n.id]={...choice,width:textWidth};}
 }
 return result;
}
