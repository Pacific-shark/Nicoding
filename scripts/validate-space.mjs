import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {knowledge,knowledgeById} from '../src/atlas/knowledge.js';
import {chapters} from '../src/atlas/catalog.js';
import {domainPoints,globalPoints,FIELD_RADIUS} from '../src/atlas/knowledge-layout.js';
import {personality} from '../src/atlas/knowledge-personality.js';
import {GLOBAL_CAMERA,canRotate,cleanCamera,dragCamera,dragSensitivity,focusCamera,placeLabels,project,rotate,branchArc} from '../src/atlas/space-geometry.js';
import {createDragSession} from '../src/atlas/drag-session.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,a+' != '+b);
const nearPoint=(a,b)=>{for(const axis of ['x','y','z'])close(a[axis],b[axis]);};
const inverse=c=>({...c,orientation:c.orientation.map((v,i)=>i===3?v:-v)});
assert(canRotate({button:0,isPrimary:true},false));
for(const button of [1,2,3,4])assert(!canRotate({button,isPrimary:true},false));
assert(!canRotate({button:0,isPrimary:true},true));
assert(!canRotate({button:0,isPrimary:false},false));
assert.deepEqual(cleanCamera({orientation:[NaN,0,0,1],zoom:0}),{orientation:[0,0,0,1],zoom:.7});
assert.deepEqual(cleanCamera({orientation:[0,0,0,0]}),GLOBAL_CAMERA);
const original=structuredClone(GLOBAL_CAMERA);dragCamera(original,120,80);assert.deepEqual(original,GLOBAL_CAMERA);
assert(dragSensitivity(390,440)>dragSensitivity(1000,740));
assert.deepEqual(globalPoints.map(p=>p.id).sort(),knowledge.map(k=>k.id).sort());
for(const chapter of chapters)assert.deepEqual(domainPoints[chapter.id].map(p=>p.id).sort(),knowledge.filter(k=>k.domain===chapter.id).map(k=>k.id).sort());
for(const group of [globalPoints,...Object.values(domainPoints)]){
 const radii=group.map(p=>Math.hypot(p.x,p.y,p.z));
 assert(Math.max(...radii)/Math.min(...radii)>3,'nodes must fill branches at different radii, not a shell');
 for(const p of group){
  assert(Math.hypot(p.x,p.y,p.z)<=FIELD_RADIUS+1e-6);
  if(p.parent){assert(knowledgeById[p.id].prereqs.includes(p.parent));assert(p.depth>group.find(n=>n.id===p.parent).depth);}
  const centered=project(p,focusCamera(p),1000,700,.9);close(centered.x,500);close(centered.y,350);close(centered.z,Math.hypot(p.x,p.y,p.z));
 }
}
const before=JSON.stringify(globalPoints),start=performance.now();
for(let a=0;a<48;a++)for(let b=0;b<24;b++){
 const camera=dragCamera(dragCamera(GLOBAL_CAMERA,a*24,0),0,b*36);
 close(Math.hypot(...camera.orientation),1);
 // A front-facing point must move in screen directions even after flips/roll.
 const front=rotate({x:0,y:0,z:FIELD_RADIUS},inverse(camera));
 const right=rotate(front,dragCamera(camera,25,0)),down=rotate(front,dragCamera(camera,0,25));
 assert(right.x>0);close(right.y,0);assert(down.y>0);close(down.x,0);
 const reverted=dragCamera(dragCamera(camera,27,-19),-27,19);
 nearPoint(rotate(front,reverted),rotate(front,camera));
 const focused=rotate(globalPoints[a%84],focusCamera(globalPoints[a%84],camera));close(focused.x,0);close(focused.y,0);assert(focused.z>0);
 const nodes=globalPoints.map(p=>({...p,...project(p,camera,1000,740,.9),radius:13,depth:rotate(p,camera).z/FIELD_RADIUS,label:knowledgeById[p.id].title}));
 for(const p of nodes)assert(Math.hypot(p.x-500,p.y-370)<=FIELD_RADIUS*.9+1e-6);
 const xs=nodes.map(p=>p.x),ys=nodes.map(p=>p.y),ratio=(Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys));
 assert(ratio>.5&&ratio<2,'the volume should not collapse to a flat sheet');
 if(b===0){
  const labels=Object.values(placeLabels(nodes,1000,740,12,'ml-splits',20));assert(labels.length<=20);
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const x=labels[i],y=labels[j];assert(!(x.x<y.x+y.width&&x.x+x.width>y.x&&x.y<y.y+24&&x.y+24>y.y));}
 }
}
assert.equal(JSON.stringify(globalPoints),before,'rotation must not mutate world coordinates');
for(const a of globalPoints)for(const id of knowledgeById[a.id].prereqs){
 const b=globalPoints.find(p=>p.id===id);assert(b);
 const arc=branchArc(a,b);nearPoint(arc[0],a);nearPoint(arc.at(-1),b);
 for(const p of arc)assert(Object.values(p).every(Number.isFinite)&&Math.hypot(p.x,p.y,p.z)<=FIELD_RADIUS+1e-6);
}
for(const p of branchArc({x:320,y:0,z:0},{x:-320,y:0,z:0}))assert(Object.values(p).every(Number.isFinite));
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
assert.equal(renders,500);assert.equal(commits,500);close(Math.hypot(...last.orientation),1);
// Frame frequency must not change the final view; curved drags use screen axes.
const route=[[20,0],[20,30],[-10,30],[-10,0],[0,0]];
let expected=GLOBAL_CAMERA,x=0,y=0;drag.begin(1,0,0,GLOBAL_CAMERA);
for(const [nextX,nextY] of route){expected=dragCamera(expected,nextX-x,nextY-y);drag.move(1,nextX,nextY);x=nextX;y=nextY;}
drag.finish(1);nearPoint(rotate(globalPoints[0],last),rotate(globalPoints[0],expected));
const afterRelease=structuredClone(last);drag.move(1,999,999);assert.deepEqual(last,afterRelease);
drag.begin(1,0,0,GLOBAL_CAMERA);drag.move(1,8,8);const oldFrame=[...queue.values()][0];drag.dispose();oldFrame();
assert.equal(queue.size,0);assert.equal(renders,501);assert(!drag.begin(1,0,0,GLOBAL_CAMERA));
console.log('Space passed: 84 branching nodes, 1,152 orientations with screen-relative drag, prerequisite curves, 100,000 coalesced drag events, disposal, focus and labels ('+Math.round(performance.now()-start)+' ms).');
