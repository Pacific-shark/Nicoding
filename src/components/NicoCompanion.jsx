import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Icon} from './ui.jsx';
import {placements,paths} from '../data/paths.js';
import {byId} from '../data/index.js';
const positions=['0% 0%','50% 0%','100% 0%','0% 100%','50% 100%','100% 100%'];
export default function NicoCompanion({motion,celebration,resetKey,lesson,completed,onLearn,onTeach,onProject,suspended=false,workspace=false,study=false}) {
 const [viewport,setViewport]=useState(()=>({width:innerWidth,height:innerHeight}));
 const size=viewport.width<700?78:125;
 const initial=()=>({x:Math.max(8,innerWidth-(innerWidth<700?88:143)),y:Math.max(90,innerHeight-(innerWidth<700?168:190))});
 const [pos,setPos]=useState(initial),[pose,setPose]=useState(0),[bubble,setBubble]=useState(''),[menu,setMenu]=useState(false),[sleep,setSleep]=useState(false),[walking,setWalking]=useState(false),[minimized,setMinimized]=useState(false),[hint,setHint]=useState(-1);
 const [duration,setDuration]=useState(25),[remaining,setRemaining]=useState(25*60),[deadline,setDeadline]=useState(null);
 const studyReturn=useRef(null);
 const drag=useRef(),timer=useRef(),last=useRef(Date.now()),petButton=useRef(),panel=useRef(),root=useRef();
 const clamp=p=>({x:Math.max(6,Math.min(viewport.width-size-6,p.x)),y:Math.max(80,Math.min(viewport.height-size-(workspace&&viewport.width<=760?160:viewport.width<700?75:35),p.y))});
 const panelWidth=Math.min(290,viewport.width-24),bottomSpace=viewport.width<700?74:15;
 const above=pos.y-96,below=viewport.height-bottomSpace-pos.y-size-12,placeAbove=above>=below;
 const panelHeight=Math.min(610,Math.max(120,placeAbove?above:below));
 const panelPosition={left:Math.max(12,Math.min(viewport.width-panelWidth-12,pos.x+size-panelWidth)),top:Math.max(84,Math.min(viewport.height-panelHeight-bottomSpace,placeAbove?pos.y-panelHeight-12:pos.y+size+12))};
 function respond(text,p=2){clearTimeout(timer.current);setSleep(false);setPose(p);setBubble(text);last.current=Date.now();timer.current=setTimeout(()=>{setPose(0);setBubble('');},4500);}
 function close(){setMenu(false);petButton.current?.focus({preventScroll:true});}
 function action(fn){setMenu(false);setBubble('');fn();}
 useEffect(()=>{setPos(initial());setMinimized(false);},[resetKey]);
 useEffect(()=>{const resize=()=>setViewport({width:innerWidth,height:innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{setPos(p=>clamp(p));},[viewport.width,viewport.height,workspace,resetKey]);
 useEffect(()=>{setHint(-1);setMenu(false);},[lesson.id]);
 useEffect(()=>{
  if(study){
   if(!studyReturn.current)studyReturn.current={pos,minimized};
   const mobile=viewport.width<=720;
   const compact=true;
   setPos(mobile?initial():{x:Math.max(26,(viewport.width-1536)/2+40),y:Math.max(80,viewport.height-(compact?145:290))});
   setMinimized(compact);setMenu(false);
  }else if(studyReturn.current){
   setPos(clamp(studyReturn.current.pos));setMinimized(studyReturn.current.minimized);studyReturn.current=null;
  }
 },[study,viewport.width,viewport.height,resetKey]);
 useEffect(()=>{if(suspended)setMenu(false);},[suspended]);
 useEffect(()=>{
  if(!menu)return;
  const frame=requestAnimationFrame(()=>panel.current?.querySelector('button')?.focus({preventScroll:true}));
  const key=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
  const outside=e=>{if(!root.current?.contains(e.target))setMenu(false);};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
 },[menu]);
 useEffect(()=>{
  if(!motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let blinkTimer;
  const blink=setInterval(()=>{if(drag.current||menu||bubble)return;if(Date.now()-last.current>90000){setSleep(true);setPose(4);return;}if(!sleep){setPose(1);blinkTimer=setTimeout(()=>setPose(0),180);}},5100);
  return()=>{clearInterval(blink);clearTimeout(blinkTimer);};
 },[motion,menu,bubble,sleep]);
 useEffect(()=>{if(celebration>0)respond('这次是有证据的进步。击个掌！',3);},[celebration]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(!deadline)return;function tick(){const next=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(next);if(next===0){setDeadline(null);respond('这一段专注完成了，站起来休息一下吧。',3);}}tick();const interval=setInterval(tick,500);return()=>clearInterval(interval);},[deadline]);
 function toggleTimer(){if(deadline){setRemaining(Math.max(0,Math.ceil((deadline-Date.now())/1000)));setDeadline(null);}else{const seconds=remaining||duration*60;setRemaining(seconds);setDeadline(Date.now()+seconds*1000);}}
 function pointerDown(e){if(e.button!==0)return;drag.current={x:e.clientX,y:e.clientY,pos,moved:false};e.currentTarget.setPointerCapture(e.pointerId);last.current=Date.now();setPose(5);setBubble('');}
 function pointerMove(e){if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.current.moved=true;setPos(clamp({x:drag.current.pos.x+dx,y:drag.current.pos.y+dy}));}
 function pointerUp(){if(!drag.current)return;const moved=drag.current.moved;drag.current=null;setPose(0);setSleep(false);if(!moved){setMenu(v=>!v);setBubble('');}}
 function walk(){setMenu(false);setSleep(false);setPose(5);setWalking(true);setPos(p=>clamp({x:p.x+(p.x>viewport.width/2?-90:90),y:p.y}));clearTimeout(timer.current);timer.current=setTimeout(()=>{setWalking(false);setPose(0);},1300);}
 const next=placements[lesson.id].next,hints=lesson.challenge?.hints||lesson.pitfalls;
 const time=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
 return createPortal(<div ref={root} className={`nico-layer ${study?'nico-study':''}`} inert={suspended||undefined}>
  <div className={`pet nico-companion ${walking?'walking':''} ${motion?'pet-motion':''} ${minimized?'is-minimized':''}`} style={{left:pos.x,top:pos.y,width:minimized?78:size}}>
   {bubble&&!menu&&!minimized&&<div className="pet-bubble" role="status">{bubble}</div>}
   {minimized?<button className="nico-dock" aria-label="展开 Nico 学习助手" onClick={()=>{if(study)setPos(initial());setMinimized(false);}}><Icon name="PawPrint" size={17}/><span>{deadline?time:'Nico'}</span></button>:<><button ref={petButton} className="pet-body" aria-label="Nico 小猫，打开学习助手或拖动移动" aria-expanded={menu} aria-controls="nico-panel" title="点击打开学习助手；拖动或方向键移动" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setPose(0);}} onKeyDown={e=>{if(e.key.startsWith('Arrow')){e.preventDefault();setMenu(false);setPos(p=>clamp({x:p.x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y:p.y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0)}));}}} onClick={e=>{if(e.detail===0){setMenu(v=>!v);setBubble('');}}}><span className={`pet-sprite pose-${pose}`} style={{backgroundPosition:positions[pose]}}/></button><span className="pet-tag"><Icon name={deadline?'Clock':'Move'} size={10}/>{deadline?time:sleep?'Nico 正在打盹':'点我一起学'}</span><button className="nico-minimize" aria-label="将 Nico 收起到小标签" onClick={()=>{setMenu(false);setMinimized(true);}}><Icon name="Minus" size={12}/></button></>}
  </div>
  {menu&&!suspended&&<section id="nico-panel" ref={panel} className="nico-panel" aria-label="Nico 学习助手" style={{...panelPosition,width:panelWidth,maxHeight:panelHeight}}><header><span><Icon name="PawPrint" size={18}/><b>Nico 陪你学</b></span><button aria-label="关闭 Nico 学习助手" onClick={close}><Icon name="X" size={17}/></button></header><div className="nico-current"><small>已点亮 {completed} / 60 · 当前课程</small><h2>{lesson.title}</h2><p>{lesson.subtitle}</p></div><div className="nico-actions"><button onClick={()=>action(()=>onLearn(lesson.id))}><Icon name="BookOpen" size={15}/>回到课程<Icon name="ArrowRight" size={13}/></button><button onClick={()=>action(()=>onTeach(lesson.id))}><Icon name="Lightbulb" size={15}/>讲给 Nico 听<Icon name="ArrowRight" size={13}/></button><button onClick={()=>action(()=>onProject(paths[lesson.domain].project))}><Icon name="Code2" size={15}/>本方向小项目<Icon name="ArrowRight" size={13}/></button>{next&&<button onClick={()=>action(()=>onLearn(next))}><Icon name="Route" size={15}/>下一节<small>{byId[next].title}</small></button>}</div><div className="nico-hint"><button onClick={()=>setHint(i=>(i+1)%hints.length)}><Icon name="Sparkles" size={14}/>{hint<0?'给我一个本节提示':'换一个提示'}<small>课程预设</small></button>{hint>=0&&<p role="status">{hints[hint]}</p>}</div><div className="nico-focus"><div><span><Icon name="Clock" size={14}/>陪你专注一会儿</span><strong role="timer" aria-label="专注剩余时间">{time}</strong></div><div className="nico-durations" aria-label="专注时长">{[5,15,25].map(m=><button key={m} aria-pressed={duration===m} disabled={!!deadline} onClick={()=>{setDuration(m);setRemaining(m*60);}}>{m} 分钟</button>)}</div><div className="nico-timer-actions"><button className="primary" onClick={toggleTimer}><Icon name={deadline?'StopCircle':'Play'} size={13}/>{deadline?'暂停计时':remaining===0?'再来一轮':'开始 / 继续'}</button><button aria-label="重置专注计时" onClick={()=>{setDeadline(null);setRemaining(duration*60);}}><Icon name="RotateCcw" size={15}/></button></div><p>切换课程继续计时；刷新页面会重置。</p></div><div className="nico-play"><button onClick={()=>{setMenu(false);respond('先把一个问题想清楚，再走下一步。击掌！',3);}}>击掌</button><button onClick={walk}>散步</button><button onClick={()=>{setMenu(false);setSleep(true);setPose(4);setBubble('');}}>打盹</button><button onClick={()=>{setMenu(false);setMinimized(true);}}>收起</button></div></section>}
 </div>,document.body);
}
