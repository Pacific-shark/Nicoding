import React,{useEffect,useRef,useState} from 'react';
import {Icon} from './ui.jsx';
const positions=['0% 0%','50% 0%','100% 0%','0% 100%','50% 100%','100% 100%'];
export default function Pet({motion,celebration,resetKey,compact=false}) {
 const small=()=>window.innerWidth<700;
 const large=()=>!compact&&window.innerHeight>=930;
 const initial=()=>({x:small()?window.innerWidth-(compact?90:125):15,y:small()&&compact?80:window.innerHeight-(small()?315:large()?310:190)});
 const [pos,setPos]=useState(initial),[pose,setPose]=useState(0),[bubble,setBubble]=useState(''),[menu,setMenu]=useState(false),[sleep,setSleep]=useState(false),[walking,setWalking]=useState(false);
 const drag=useRef(),timer=useRef(),last=useRef(Date.now());
 const size=small()?(compact?78:115):large()?220:155;
 const clamp=p=>({x:Math.max(0,Math.min(window.innerWidth-size,p.x)),y:Math.max(90,Math.min(window.innerHeight-size-45,p.y))});
 function respond(text,p=2){clearTimeout(timer.current);setSleep(false);setPose(p);setBubble(text);last.current=Date.now();timer.current=setTimeout(()=>{setPose(0);setBubble('');},3800);}
 useEffect(()=>{setPos(initial());},[resetKey]);
 useEffect(()=>{const resize=()=>setPos(p=>clamp(p));window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{
  if(!motion||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const blink=setInterval(()=>{
   if(drag.current||menu||bubble)return;
   if(Date.now()-last.current>90000){setSleep(true);setPose(4);return;}
   if(!sleep){setPose(1);timer.current=setTimeout(()=>setPose(0),180);}
  },5100);
  return()=>clearInterval(blink);
 },[motion,menu,bubble,sleep]);
 useEffect(()=>{if(celebration>0)respond('这次是有证据的进步。击个掌！',3);},[celebration]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function pointerDown(e){if(e.button!==0)return;drag.current={x:e.clientX,y:e.clientY,pos,moved:false};e.currentTarget.setPointerCapture(e.pointerId);last.current=Date.now();setPose(5);setBubble('');}
 function pointerMove(e){if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.current.moved=true;setPos(clamp({x:drag.current.pos.x+dx,y:drag.current.pos.y+dy}));}
 function pointerUp(){if(!drag.current)return;const moved=drag.current.moved;drag.current=null;setPose(0);setSleep(false);if(!moved){respond('喵，今天也一点一点来。');setMenu(v=>!v);}}
 function walk(){setMenu(false);setSleep(false);setPose(5);setWalking(true);setPos(p=>clamp({x:p.x+(p.x>window.innerWidth/2?-90:90),y:p.y}));clearTimeout(timer.current);timer.current=setTimeout(()=>{setWalking(false);setPose(0);},1300);}
 return <div className={`pet ${walking?'walking':''} ${motion?'pet-motion':''}`} style={{left:pos.x,top:pos.y,width:size}}>
  {bubble&&<div className="pet-bubble" role="status">{bubble}</div>}
  {menu&&<div className="pet-menu"><button onClick={()=>{setMenu(false);respond('先自己预测一下，再运行看看。',2);}}>击掌</button><button onClick={walk}>散步</button><button onClick={()=>{setMenu(false);setSleep(true);setPose(4);setBubble('');}}>打盹</button></div>}
  <button className="pet-body" aria-label="Nico 小猫，点击互动或拖动移动" title="拖动 Nico，或点击互动；方向键可移动" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setPose(0);}} onKeyDown={e=>{if(e.key.startsWith('Arrow')){e.preventDefault();setPos(p=>clamp({x:p.x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y:p.y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0)}));}}} onClick={e=>{if(e.detail===0){respond('喵，继续探索吧！');setMenu(v=>!v);}}}><span className={`pet-sprite pose-${pose}`} style={{backgroundPosition:positions[pose]}}/></button>
  <span className="pet-tag"><Icon name="Move" size={10}/>{sleep?'Nico 正在打盹':'拖动 Nico'}</span>
 </div>;
}
