import assert from 'node:assert/strict';
import {knowledge,knowledgeById} from '../src/atlas/knowledge.js';
import {chapters} from '../src/atlas/catalog.js';
import {domainPoints,globalPoints} from '../src/atlas/knowledge-layout.js';
import {personality} from '../src/atlas/knowledge-personality.js';
import {CAMERA_DISTANCE,GLOBAL_CAMERA,canRotate,dragCamera,placeLabels,project,rotate} from '../src/atlas/space-geometry.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,a+' ≠ '+b);
assert(canRotate({button:0,isPrimary:true},false));
for(const button of [1,2,3,4])assert(!canRotate({button,isPrimary:true},false));
assert(!canRotate({button:0,isPrimary:true},true),'dragging a node must not rotate');
assert(!canRotate({button:0,isPrimary:false},false));
const original={...GLOBAL_CAMERA};dragCamera(original,120,80);assert.deepEqual(original,GLOBAL_CAMERA);
for(const delta of [-1e6,1e6])assert(Math.abs(dragCamera(original,delta,delta).pitch)<=1.48);
assert.deepEqual([...globalPoints.map(p=>p.id)].sort(),knowledge.map(k=>k.id).sort(),'global view must contain every real knowledge point, not domain placeholders');
for(const chapter of chapters){
 const points=domainPoints[chapter.id],byId=Object.fromEntries(points.map(p=>[p.id,p]));
 assert.deepEqual(points.map(p=>p.id).sort(),knowledge.filter(k=>k.domain===chapter.id).map(k=>k.id).sort());
 for(const p of points){
  for(const id of knowledgeById[p.id].prereqs)if(byId[id])assert(byId[id].x<p.x,'local prerequisites must appear before their dependents');
  assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));
  const centered=project(p,{...GLOBAL_CAMERA,target:p},1000,700);close(centered.x,500);close(centered.y,350);
 }
}
for(const p of globalPoints){
 assert(personality(p.id).level>=0&&personality(p.id).level<=2);
 for(const yaw of [-Math.PI,0,1.2,Math.PI])for(const pitch of [-1.48,0,1.48]){
  const camera={yaw,pitch},rotated=rotate(p,camera);close(Math.hypot(rotated.x,rotated.y,rotated.z),Math.hypot(p.x,p.y,p.z));
  const projected=project(p,camera,1024,700);assert(Object.values(projected).every(Number.isFinite));assert(projected.scale>0);
 }
}
for(let i=0;i<globalPoints.length;i++)for(let j=i+1;j<globalPoints.length;j++){
 const a=project(globalPoints[i],GLOBAL_CAMERA,1028,725,.77),b=project(globalPoints[j],GLOBAL_CAMERA,1028,725,.77);
 assert(Math.hypot(a.x-b.x,a.y-b.y)>29,'global cats must not overlap at the default desktop view');
}
assert.equal(personality('py-values').expression,'放松');
assert.equal(personality('ml-splits').expression,'思考');
for(const id of ['dl-transformer','dl-autograd','dl-diffusion','rl-sac','rl-ppo'])assert.equal(personality(id).expression,'惊讶');
assert(project({x:100,y:0,z:200},GLOBAL_CAMERA,1000,700).scale>project({x:100,y:0,z:-200},GLOBAL_CAMERA,1000,700).scale);
assert(globalPoints.every(p=>Math.hypot(p.x,p.y,p.z)<CAMERA_DISTANCE));
for(const yaw of [0,.5,1,2,3,4,5]){
 const nodes=globalPoints.map(p=>({...p,...project(p,{...GLOBAL_CAMERA,yaw},1000,740,.77),radius:14,label:knowledgeById[p.id].title}));
 const labels=Object.values(placeLabels(nodes,1000,740,13,'ml-splits'));
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  const a=labels[i],b=labels[j];assert(!(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+24&&a.y+24>b.y),'labels may not overlap');
 }
}
console.log('Space: all 84 knowledge nodes, prerequisite layout, difficulty expressions, default spacing, camera, left-button gating and label collisions passed.');
