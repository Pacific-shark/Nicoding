import React from 'react';

function InlineText({text}) {
 return text.split(/(`[^`]+`)/g).map((part,i)=>part.startsWith('`')&&part.endsWith('`')
  ?<code key={i}>{part.slice(1,-1)}</code>:part);
}

// Only paragraphs and code are supported. Course text is never interpreted as HTML.
export default function LessonText({text}) {
 return <div className="lesson-prose">{text.split(/(```[\s\S]*?```)/g).filter(Boolean).map((part,i)=>{
  if(part.startsWith('```')){
   const code=part.slice(3,-3).replace(/^[a-z]*\n/, '').trimEnd();
   return <pre className="reading-code" key={i}><code>{code}</code></pre>;
  }
  return part.split(/\n\s*\n/).filter(p=>p.trim()).map((p,j)=><p key={`${i}-${j}`}><InlineText text={p.trim()}/></p>);
 })}</div>;
}
