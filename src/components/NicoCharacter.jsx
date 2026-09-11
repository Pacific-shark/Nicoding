import React from 'react';

const positions=['0% 0%','50% 0%','100% 0%','0% 100%','50% 100%','100% 100%'];

// Restore the original Nico artwork. Each cell contains the whole pose;
// do not apply the obsolete silhouette masks from a different illustration.
export default function NicoCharacter({pose=0,motion=true,className=''}) {
 const current=Number.isInteger(pose)&&pose>=0&&pose<positions.length?pose:0;
 return <span className={`nico-character nico-pose-${current} ${motion?'nico-alive':''} ${className}`} aria-hidden="true">
  <span className="nico-art" style={{backgroundImage:`url("${import.meta.env.BASE_URL}assets/nico-poses-v2.png")`,backgroundPosition:positions[current]}}/>
 </span>;
}
