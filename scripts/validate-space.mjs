import assert from 'node:assert/strict';
import {knowledge} from '../src/atlas/knowledge.js';
import {chapters} from '../src/atlas/catalog.js';
import {CAMERA_DISTANCE,LOCAL_RADIUS,PLANETS,GLOBAL_CAMERA,canRotate,connection,dragCamera,facePoint,placeLabels,project,rotate,spherePoints} from '../src/atlas/space-geometry.js';

const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
assert.equal(canRotate({button:0,isPrimary:true},false),true);
for(const button of [1,2,3,4])assert.equal(canRotate({button,isPrimary:true},false),false,'only left button rotates');
assert.equal(canRotate({button:0,isPrimary:true},true),false,'nodes cannot initiate a rotation');
assert.equal(canRotate({button:0,isPrimary:false},false),false,'secondary touch cannot steal a drag');
const original={...GLOBAL_CAMERA};dragCamera(original,120,80);assert.deepEqual(original,GLOBAL_CAMERA,'drag must not mutate cached camera');
for(const delta of [-1e6,1e6])assert(Math.abs(dragCamera(original,delta,delta).pitch)<=1.48);
for(const chapter of chapters){
 const items=knowledge.filter(k=>k.domain===chapter.id),points=spherePoints(items);
 assert.equal(points.length,items.length);assert.equal(new Set(points.map(p=>p.id)).size,items.length);
 for(const p of points){
  close(Math.hypot(p.x,p.y,p.z),LOCAL_RADIUS);
  const centered=rotate(p,facePoint(p));close(centered.x,0);close(centered.y,0);close(centered.z,LOCAL_RADIUS);
  for(const yaw of [-Math.PI,0,1.2,Math.PI])for(const pitch of [-1.48,0,1.48]){
   const camera={yaw,pitch},rotated=rotate(p,camera);close(Math.hypot(rotated.x,rotated.y,rotated.z),LOCAL_RADIUS);
   const projected=project(p,camera,1024,700);assert(Object.values(projected).every(Number.isFinite));assert(projected.scale>0);
  }
 }
}
const near=project({x:100,y:0,z:200},GLOBAL_CAMERA,1000,700),far=project({x:100,y:0,z:-200},GLOBAL_CAMERA,1000,700);
assert(near.scale>far.scale,'near objects must look larger');assert(CAMERA_DISTANCE>Math.max(...PLANETS.map(p=>Math.hypot(p.x,p.y,p.z)+p.radius)));
for(const endpoint of [{x:0,y:0,z:235},{x:0,y:0,z:-235},{x:235,y:0,z:0}]){
 const arc=connection({x:0,y:0,z:235},endpoint);
 for(const p of arc){assert(Object.values(p).every(Number.isFinite));close(Math.hypot(p.x,p.y,p.z),LOCAL_RADIUS+3);}
 const end=arc.at(-1);close(end.x/(LOCAL_RADIUS+3),endpoint.x/235);close(end.z/(LOCAL_RADIUS+3),endpoint.z/235);
}
for(const yaw of [0,.5,1,2,3,4,5]){
 const nodes=PLANETS.map(p=>({...p,...project(p,{...GLOBAL_CAMERA,yaw},1000,740),label:chapters.find(c=>c.id===p.id).name}));
 const labels=Object.values(placeLabels(nodes,1000,740,14,'ml'));
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  const a=labels[i],b=labels[j];assert(!(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+24&&a.y+24>b.y),'labels may not overlap');
 }
}
console.log('Space: left-button gating, all 84 node positions, camera centering, perspective, arcs and label collisions passed.');
