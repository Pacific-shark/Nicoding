import {chapters} from './catalog.js';
import {knowledge,knowledgeById} from './knowledge.js';
export const domainKnowledge=Object.fromEntries(chapters.map(c=>[c.id,knowledge.filter(k=>k.domain===c.id)]));

// Prerequisite depth determines horizontal position. Rows reduce crossings;
// the small fixed z offsets give manual rotation depth without a literal globe.
export function layoutDomain(items){
 const ids=new Set(items.map(k=>k.id)),ranks=new Map();
 const rank=id=>{if(ranks.has(id))return ranks.get(id);const parents=knowledgeById[id].prereqs.filter(p=>ids.has(p));const value=parents.length?1+Math.max(...parents.map(rank)):0;ranks.set(id,value);return value;};
 items.forEach(k=>rank(k.id));
 const max=Math.max(...ranks.values()),columns=Array.from({length:max+1},()=>[]);
 items.forEach(k=>columns[ranks.get(k.id)].push(k));
 const rows=new Map(),points=[];
 columns.forEach((column,depth)=>{
  const meanParent=k=>{const parent=k.prereqs.filter(p=>rows.has(p));return parent.length?parent.reduce((s,p)=>s+rows.get(p),0)/parent.length:0;};
  column.sort((a,b)=>meanParent(a)-meanParent(b));
  column.forEach((k,i)=>{
   const row=(i-(column.length-1)/2)*112;rows.set(k.id,row);
   points.push({id:k.id,domain:k.domain,x:(depth-max/2)*155,y:row,z:((i+depth*2)%5-2)*18});
  });
 });
 return points;
}
export const domainPoints=Object.fromEntries(chapters.map(c=>[c.id,layoutDomain(domainKnowledge[c.id])]));
export const CLUSTERS={py:{x:-355,y:-290,z:0},web:{x:0,y:-290,z:-30},eng:{x:355,y:-290,z:10},math:{x:-355,y:0,z:15},ml:{x:0,y:0,z:40},dl:{x:355,y:0,z:-15},llm:{x:-220,y:310,z:5},rl:{x:220,y:310,z:-20}};
export const globalPoints=chapters.flatMap(c=>{
 const items=domainPoints[c.id],columns=items.length>12?4:3,rows=Math.ceil(items.length/columns),center=CLUSTERS[c.id];
 return items.map((p,i)=>{
  const row=Math.floor(i/columns),count=Math.min(columns,items.length-row*columns),col=i%columns;
  return {...p,x:center.x+(col-(count-1)/2)*(columns===4?79:105)+(row%2?5:-5),y:center.y+(row-(rows-1)/2)*(rows>1?200/(rows-1):0),z:center.z+p.z*.6};
 });
});
export const compactClusters=Object.fromEntries(chapters.map((c,i)=>[c.id,{x:i%2?175:-175,y:-465+Math.floor(i/2)*310,z:CLUSTERS[c.id].z}]));
export const compactGlobalPoints=globalPoints.map(p=>({ ...p,x:p.x-CLUSTERS[p.domain].x+compactClusters[p.domain].x,y:p.y-CLUSTERS[p.domain].y+compactClusters[p.domain].y }));
