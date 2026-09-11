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
const legRegions=[{x:130,y:300,w:350,h:198},{x:642,y:300,w:350,h:198},{x:1154,y:300,w:350,h:198},{x:130,y:775,w:350,h:190}];

export default function NicoCharacter({pose=0,motion=true,className=''}) {
 const id=useId().replace(/:/g,'');
 const maskId=`nico-matte-${id}`,filterId=`nico-matte-clean-${id}`,pawId=`nico-black-paw-${id}`,walkPawId=`nico-white-paw-${id}`,tuftId=`nico-sole-tuft-${id}`;
 const legMaskId=`nico-leg-matte-${id}`,legAreaId=`nico-leg-area-${id}`;
 const legColorMaskId=`nico-leg-color-${id}`,legFeatherId=`nico-leg-feather-${id}`;
 const current=Number.isInteger(pose)&&pose>=0&&pose<frames.length?pose:0;
 const source=`${import.meta.env.BASE_URL}assets/nico-poses-v2.png`;
 const matte=`${import.meta.env.BASE_URL}assets/nico-foreground-v3.png`;
 // One hind paw has mostly black pads and a small dark tuft just behind them.
 // The ankle, toe tips and dorsal surface remain white in every pose.
 const pawEdit=`${import.meta.env.BASE_URL}assets/nico-white-fur-black-pads-v5.png`;
 const tuftEdit=`${import.meta.env.BASE_URL}assets/nico-sole-tuft-v6.png`;
 // Both hind paws remain readable behind the front paws. Idle/blink show four
 // grounded paws; wave/happy lift one front paw, leaving three grounded paws.
 const legEdit=`${import.meta.env.BASE_URL}assets/nico-four-limbs-v8.png`;
 const legMatte=`${import.meta.env.BASE_URL}assets/nico-four-limbs-matte-v8.png`;
 return <span className={`nico-character nico-pose-${current} ${motion?'nico-alive':''} ${className}`} aria-hidden="true">
  <span className="nico-art"><svg viewBox="0 0 512 512" focusable="false">
   <defs>
    <clipPath id={pawId}><rect x="886" y="682" width="76" height="130"/></clipPath>
    <clipPath id={walkPawId}><rect x="1176" y="870" width="114" height="78"/></clipPath>
    <clipPath id={tuftId}><rect x="906" y="731" width="40" height="40"/></clipPath>
    <clipPath id={legAreaId}>{legRegions.map(r=><rect key={r.x+':'+r.y} x={r.x} y={r.y} width={r.w} height={r.h}/>)}</clipPath>
    <filter id={legFeatherId} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <mask id={legColorMaskId} x="0" y="0" width="1536" height="1024" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style={{maskType:'alpha'}}>
     <g fill="white" filter={`url(#${legFeatherId})`}>{legRegions.map(r=><rect key={r.x+':'+r.y} x={r.x+12} y={r.y+12} width={r.w-24} height={r.h-24}/>)}</g>
    </mask>
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
    <mask id={legMaskId} x="0" y="0" width="1536" height="1024" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style={{maskType:'luminance'}}>
     <image href={matte} width="1536" height="1024" filter={`url(#${filterId})`}/>
     <image data-nico-leg-matte="" href={legMatte} width="1536" height="1024" filter={`url(#${filterId})`} clipPath={`url(#${legAreaId})`}/>
    </mask>
   </defs>
   {frames.map((frame,index)=><svg key={index} data-nico-frame={index} x="0" y={frame.top} width="512" height={frame.height} viewBox={`${frame.x} ${frame.y} 512 ${frame.height}`} overflow="hidden" display={index===current?'block':'none'}>
    <image href={source} width="1536" height="1024" mask={`url(#${index<=3?legMaskId:maskId})`}/>
    {index<=3&&<g mask={`url(#${legMaskId})`}><image data-nico-leg-fix="" href={legEdit} width="1536" height="1024" mask={`url(#${legColorMaskId})`} clipPath={`url(#${legAreaId})`}/></g>}
    {index===4&&<image href={pawEdit} width="1536" height="1024" mask={`url(#${maskId})`} clipPath={`url(#${pawId})`}/>}
    {index===4&&<image data-nico-sole-tuft="" href={tuftEdit} width="1536" height="1024" mask={`url(#${maskId})`} clipPath={`url(#${tuftId})`}/>}
    {index===5&&<image href={pawEdit} width="1536" height="1024" mask={`url(#${maskId})`} clipPath={`url(#${walkPawId})`}/>}
   </svg>)}
  </svg></span>
 </span>;
}
