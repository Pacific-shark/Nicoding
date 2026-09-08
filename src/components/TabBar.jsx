import React from 'react';

export default function TabBar({items,value,onChange,label}) {
 const index=Math.max(0,items.findIndex(([id])=>id===value));
 function move(event,current) {
  let next;
  if(event.key==='ArrowRight')next=(current+1)%items.length;
  else if(event.key==='ArrowLeft')next=(current-1+items.length)%items.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=items.length-1;
  else return;
  event.preventDefault();
  onChange(items[next][0]);
  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
 }
 return <div className="tabs" role="tablist" aria-label={label} style={{'--tab-index':index,'--tab-count':items.length}}>
  <span className="tab-indicator" aria-hidden="true"/>
  {items.map(([id,text],i)=><button key={id} type="button" role="tab" aria-selected={value===id} tabIndex={value===id?0:-1} className={value===id?'active':''} onClick={()=>onChange(id)} onKeyDown={e=>move(e,i)}>{text}</button>)}
 </div>;
}
