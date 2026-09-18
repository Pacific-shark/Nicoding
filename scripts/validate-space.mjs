import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {knowledge,knowledgeById} from '../src/atlas/knowledge.js';
import {chapters} from '../src/atlas/catalog.js';
import {domainPoints,globalPoints,SPHERE_RADIUS} from '../src/atlas/knowledge-layout.js';
import {personality} from '../src/atlas/knowledge-personality.js';
import {GLOBAL_CAMERA,canRotate,cleanCamera,dragCamera,focusCamera,placeLabels,project,rotate,sphereArc} from '../src/atlas/space-geometry.js';
import {createDragSession} from '../src/atlas/drag-session.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,a+' ≠ '+b);
assert(canRotate({button:0,isPrimary:true},false));
for(const button of [1,2,3,4])assert(!canRotate({button,isPrimary:true},false));
assert(!canRotate({button:0,isPrimary:true},true));
assert(!canRotate({button:0,isPrimary:false},false));
assert.deepEqual(cleanCamera({yaw:NaN,pitch:Infinity,zoom:0}),{yaw:0,pitch:0,zoom:.7});
const original={...GLOBAL_CAMERA};dragCamera(original,120,80);assert.deepEqual(original,GLOBAL_CAMERA);
assert.deepEqual(globalPoints.map(p=>p.id).sort(),knowledge.map(k=>k.id).sort());
for(const chapter of chapters)assert.deepEqual(domainPoints[chapter.id].map(p=>p.id).sort(),knowledge.filter(k=>k.domain===chapter.id).map(k=>k.id).sort());
for(const group of [globalPoints,...Object.values(domainPoints)])for(const p of group){
 close(Math.hypot(p.x,p.y,p.z),SPHERE_RADIUS);
 const centered=project(p,focusCamera(p),1000,700,.9);close(centered.x,500);close(centered.y,350);close(centered.z,SPHERE_RADIUS);
}
const before=JSON.stringify(globalPoints),start=performance.now();
for(let a=0;a<48;a++)for(let b=0;b<24;b++){
 const camera={yaw:a*Math.PI/24,pitch:b*Math.PI/12,zoom:1};
 const nodes=globalPoints.map(p=>({...p,...project(p,camera,1000,740,.9),radius:13,depth:rotate(p,camera).z/SPHERE_RADIUS,label:knowledgeById[p.id].title}));
 for(const p of nodes)assert(Math.hypot(p.x-500,p.y-370)<=SPHERE_RADIUS*.9+1e-6);
 const xs=nodes.map(p=>p.x),ys=nodes.map(p=>p.y),ratio=(Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys));
 assert(ratio>.92&&ratio<1.09,'sphere must not become a flat sheet at any angle: '+ratio);
 if(b===0){
  const labels=Object.values(placeLabels(nodes,1000,740,12,'ml-splits',20));assert(labels.length<=20);
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const x=labels[i],y=labels[j];assert(!(x.x<y.x+y.width&&x.x+x.width>y.x&&x.y<y.y+24&&x.y+24>y.y));}
 }
}
assert.equal(JSON.stringify(globalPoints),before,'rotation must not mutate world coordinates');
for(const a of globalPoints)for(const id of knowledgeById[a.id].prereqs){
 const b=globalPoints.find(p=>p.id===id);assert(b);
 const arc=sphereArc(a,b);for(const p of arc)close(Math.hypot(p.x,p.y,p.z),SPHERE_RADIUS);
 for(const axis of ['x','y','z']){close(arc[0][axis],a[axis]);close(arc.at(-1)[axis],b[axis]);}
}
for(const p of sphereArc({x:320,y:0,z:0},{x:-320,y:0,z:0}))close(Math.hypot(p.x,p.y,p.z),320);
assert.equal(personality('py-values').expression,'放松');
assert.equal(personality('ml-splits').expression,'思考');
for(const id of ['dl-transformer','dl-autograd','dl-diffusion','rl-sac'])assert.equal(personality(id).expression,'惊讶');
let queue=new Map(),serial=0,renders=0,commits=0,last;
const drag=createDragSession({schedule:fn=>{queue.set(++serial,fn);return serial;},cancelFrame:id=>queue.delete(id),render:c=>{renders++;last=c;},commit:()=>commits++});
for(let round=0;round<500;round++){
 assert(drag.begin(1,0,0,GLOBAL_CAMERA));assert(!drag.begin(2,0,0,GLOBAL_CAMERA));
 for(let move=0;move<200;move++)drag.move(1,move,-move);
 assert.equal(queue.size,1,'coalesce all queued pointer events into one frame');
 drag.finish(2);assert(drag.active);drag.finish(1);
 assert.equal(queue.size,0);assert(!drag.active);
}
assert.equal(renders,500);assert.equal(commits,500);assert(Object.values(last).every(Number.isFinite));
drag.begin(1,0,0,GLOBAL_CAMERA);drag.move(1,8,8);const oldFrame=[...queue.values()][0];drag.dispose();oldFrame();
assert.equal(queue.size,0);assert.equal(renders,500);assert(!drag.begin(1,0,0,GLOBAL_CAMERA));
console.log('Space passed: 84 spherical nodes, 1,152 orientations, curved prerequisite edges, 100,000 coalesced drag events, disposal, focus and labels ('+Math.round(performance.now()-start)+' ms).');