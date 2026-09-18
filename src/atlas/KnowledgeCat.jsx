import React from 'react';

// Small vector symbols: four complete silhouettes share three readable faces.
function Face({level,x=0,y=0}){
 return <g transform={`translate(${x} ${y})`}>
  {level===2?<><circle cx="-4.2" cy="-1" r="2"/><circle cx="4.2" cy="-1" r="2"/><circle cx="-4.2" cy="-1" r=".5" fill="currentColor" stroke="none"/><circle cx="4.2" cy="-1" r=".5" fill="currentColor" stroke="none"/><ellipse cx="0" cy="4" rx="1.6" ry="2.1"/><path d="M-6-6l-2-2M6-6l2-2"/></>:level===1?<><circle cx="-3.7" cy="-1" r=".9" fill="currentColor"/><circle cx="4.7" cy="-2" r=".9" fill="currentColor"/><path d="M-6-5h3M3-6l3-1M-1 4h3"/><path d="M0 1h.1"/></>:<><path d="M-6-1q2-3 4 0M2-1q2-3 4 0M-3 3q3 4 6 0"/></>}
 </g>;
}
export default function KnowledgeCat({pose=0,level=0}){
 const head='M-11-9l-1-10 7 5q5-2 10 0l7-5-1 10';
 return <g className={'knowledge-cat cat-pose-'+pose+' cat-expression-'+level} stroke="currentColor" strokeWidth="1.5" fill="var(--cat-fill,#fffdf8)" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  {pose===0?<>
   <path d="M10 14q13 3 12-7q-1-5-4-3q-2 1-1 4q1 4-6 3" fill="none"/>
   <path d={head+'q5 8-1 13q4 5 3 12q-1 5-7 4q-5 2-11 0q-8 1-8-7q-1-5 4-9q-6-5-2-13Z'}/>
   <path d="M-5 11v7M2 11v7" fill="none"/><Face level={level} y={-4}/>
  </>:pose===1?<>
   <path d="M-8 3q-10-3-14 5q-4 10 9 10h24q12-1 11-7q-2-6-7-1q-2 3 3 3"/>
   <path d={head+'q6 6 1 13q-3 4-13 4q-10 0-13-5q-4-6 1-12Z'}/>
   <path d="M-12 15h6M3 15h6" fill="none"/><Face level={level} y={-3}/>
  </>:pose===2?<>
   <path d="M9-8q12 3 12 14q-1 14-17 14q-20 1-23-11q-3-11 7-15q7-3 12 1q6 6 0 11q-4 3-8 0"/>
   <g transform="translate(-6 0) scale(.87)"><path d={head+'q6 8 0 14q-4 4-12 4q-9 0-12-5q-3-6 2-13Z'}/><Face level={level} y={-3}/></g>
  </>:<>
   <path d="M-10 14q-12 1-11-8q1-5 4-3q3 1 1 4q0 4 6 3" fill="none"/>
   <path d={head+'q5 7 0 12q3 4 5 1l4-6q3-4 6-1q2 3-2 6l-7 9q1 9-7 10q-5 1-9-1q-9 2-10-6q-1-7 3-11q-6-5-3-13Z'}/>
   <path d="M-5 12v7M2 12v7" fill="none"/><Face level={level} y={-4}/>
  </>}
 </g>;
}
