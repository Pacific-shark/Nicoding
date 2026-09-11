import React,{useId} from 'react';

// The lower row begins above y=512. Separate windows prevent an adjacent ear
// from leaking into idle, and align all six poses to the same paw baseline.
const frames=[
 {x:0,y:0,height:498,top:0},
 {x:512,y:0,height:498,top:0},
 {x:1024,y:0,height:498,top:0},
 {x:0,y:498,height:526,top:42},
 {x:512,y:498,height:526,top:23},
 {x:1024,y:498,height:526,top:35}
];

export default function NicoCharacter({pose=0,motion=true,className=''}) {
 const id=useId().replace(/:/g,'');
 const maskId=`nico-matte-${id}`,filterId=`nico-matte-clean-${id}`,pawId=`nico-black-paw-${id}`;
 const current=Number.isInteger(pose)&&pose>=0&&pose<frames.length?pose:0;
 const source=`${import.meta.env.BASE_URL}assets/nico-poses-v2.png`;
 const matte=`${import.meta.env.BASE_URL}assets/nico-foreground-v3.png`;
 const pawEdit=`${import.meta.env.BASE_URL}assets/nico-black-paw-v4.png`;
 return <span className={`nico-character nico-pose-${current} ${motion?'nico-alive':''} ${className}`} aria-hidden="true">
  <span className="nico-art"><svg viewBox="0 0 512 512" focusable="false">
   <defs>
    <clipPath id={pawId}><rect x="886" y="682" width="76" height="130"/></clipPath>
    <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
     <feComponentTransfer>
      <feFuncR type="linear" slope="1.04" intercept="-.02"/>
      <feFuncG type="linear" slope="1.04" intercept="-.02"/>
      <feFuncB type="linear" slope="1.04" intercept="-.02"/>
     </feComponentTransfer>
    </filter>
    <mask id={maskId} x="0" y="0" width="1536" height="1024" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style={{maskType:'luminance'}}>
     <image href={matte} width="1536" height="1024" filter={`url(#${filterId})`}/>
    </mask>
   </defs>
   {frames.map((frame,index)=><svg key={index} data-nico-frame={index} x="0" y={frame.top} width="512" height={frame.height} viewBox={`${frame.x} ${frame.y} 512 ${frame.height}`} overflow="hidden" display={index===current?'block':'none'}>
    <image href={source} width="1536" height="1024" mask={`url(#${maskId})`}/>
    {index===4&&<image href={pawEdit} width="1536" height="1024" mask={`url(#${maskId})`} clipPath={`url(#${pawId})`}/>}
   </svg>)}
  </svg></span>
 </span>;
}
