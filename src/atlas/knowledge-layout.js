import {chapters} from './catalog.js';
import {knowledge} from './knowledge.js';
export const FIELD_RADIUS=360;
export const domainKnowledge=Object.fromEntries(chapters.map(c=>[c.id,knowledge.filter(k=>k.domain===c.id)]));
// Lay out the prerequisite forest once. A primary parent defines each branch;
// the renderer still displays every real prerequisite, including cross-links.
function branchOrder(items){
 const ids=new Set(items.map(k=>k.id)),depths=new Map(),parents=new Map(),children=new Map(items.map(k=>[k.id,[]]));
 const byId=Object.fromEntries(items.map(k=>[k.id,k]));
 function depth(id){if(!depths.has(id)){const prerequisites=byId[id].prereqs.filter(p=>ids.has(p));depths.set(id,prerequisites.length?1+Math.max(...prerequisites.map(depth)):0);}return depths.get(id);}
 for(const k of items){
  const parent=k.prereqs.filter(p=>ids.has(p)).sort((a,b)=>depth(b)-depth(a))[0];
  depth(k.id);if(parent){parents.set(k.id,parent);children.get(parent).push(k.id);}
 }
 const lanes=new Map();let leaves=0;
 function lane(id){const branch=children.get(id);const value=branch.length?branch.map(lane).reduce((a,b)=>a+b,0)/branch.length:leaves++;lanes.set(id,value);return value;}
 items.filter(k=>!parents.has(k.id)).forEach(k=>lane(k.id));
 return items.map(k=>({...k,depth:depths.get(k.id),parent:parents.get(k.id),lane:(lanes.get(k.id)+.5)/leaves}));
}
function fit(points){
 const max=Math.max(1,...points.map(p=>Math.hypot(p.x,p.y,p.z)));
 return points.map(p=>({...p,x:p.x/max*FIELD_RADIUS,y:p.y/max*FIELD_RADIUS,z:p.z/max*FIELD_RADIUS}));
}
function separate(points){
 const placed=points.map(p=>({...p}));
 // A bounded setup pass opens crowded branches. No simulation survives load.
 for(let pass=0;pass<140;pass++){
  const shifts=placed.map(()=>({x:0,y:0,z:0}));
  for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){
   const a=placed[i],b=placed[j],dx=a.x-b.x,dy=a.y-b.y,dz=a.z-b.z;
   const planar=Math.hypot(dx,dy)||.01,spatial=Math.hypot(dx,dy,dz)||.01;
   const planarPush=Math.max(0,52-planar)*.22,spatialPush=Math.max(0,70-spatial)*.18;
   const x=dx/planar*planarPush+dx/spatial*spatialPush,y=dy/planar*planarPush+dy/spatial*spatialPush,z=dz/spatial*spatialPush;
   shifts[i].x+=x;shifts[i].y+=y;shifts[i].z+=z;shifts[j].x-=x;shifts[j].y-=y;shifts[j].z-=z;
  }
  placed.forEach((p,i)=>{for(const axis of ['x','y','z'])p[axis]+=shifts[i][axis]+(points[i][axis]-p[axis])*.018;});
 }
 return placed;
}
export function layoutBranches(items,{sector=0,global=false}={}){
 const tree=branchOrder(items),maxDepth=Math.max(1,...tree.map(k=>k.depth));
 const counts=chapters.map(c=>domainKnowledge[c.id].length+5),total=counts.reduce((a,b)=>a+b,0);
 const span=counts[sector]/total*Math.PI*2,start=-3.15+counts.slice(0,sector).reduce((a,b)=>a+b,0)/total*Math.PI*2;
 const elevations=[.55,-.65,.42,-.57,.48,-.38,.65,-.46];
 return tree.map((k,i)=>{
  const advance=k.depth/maxDepth;
  const angle=global?start+span/2+(k.lane-.5)*span*1.1+.055*Math.sin(k.depth*1.9+sector):k.lane*Math.PI*2-2.1+.14*Math.sin(k.depth*1.6);
  const radius=global?95+advance*(205+19*Math.sin(sector*1.7))+(k.lane-.5)*26:58+advance*240;
  const elevation=global?elevations[sector]+(k.lane-.5)*.65+.14*Math.sin(k.depth*1.7):.72*Math.sin(angle*1.6+.8)+.24*Math.cos(k.depth*1.8+i*.7);
  return {id:k.id,domain:k.domain,parent:k.parent,depth:k.depth,x:radius*Math.cos(angle),y:radius*Math.sin(angle),z:radius*elevation};
 });
}
export const domainPoints=Object.fromEntries(chapters.map(c=>[c.id,fit(separate(layoutBranches(domainKnowledge[c.id])))]));
export const globalPoints=fit(separate(chapters.flatMap((c,sector)=>layoutBranches(domainKnowledge[c.id],{sector,global:true}))));
