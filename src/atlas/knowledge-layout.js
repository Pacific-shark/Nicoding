import {chapters} from './catalog.js';
import {knowledge} from './knowledge.js';
export const SPHERE_RADIUS=320;
export const domainKnowledge=Object.fromEntries(chapters.map(c=>[c.id,knowledge.filter(k=>k.domain===c.id)]));
// Equal-area points on a spherical shell, independent of viewport and camera.
export function layoutSphere(items,radius=SPHERE_RADIUS){
 const goldenAngle=Math.PI*(3-Math.sqrt(5));
 return items.map((k,i)=>{
  const y=1-2*(i+.5)/items.length,ring=Math.sqrt(Math.max(0,1-y*y)),angle=i*goldenAngle;
  return {id:k.id,domain:k.domain,x:radius*ring*Math.cos(angle),y:radius*y,z:radius*ring*Math.sin(angle)};
 });
}
export const domainPoints=Object.fromEntries(chapters.map(c=>[c.id,layoutSphere(domainKnowledge[c.id])]));
export const globalPoints=layoutSphere(knowledge);