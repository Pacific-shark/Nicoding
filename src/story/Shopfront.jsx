import React,{useEffect,useRef,useState} from 'react';
import NicoCharacter from '../components/NicoCharacter.jsx';

export default function Shopfront({entryHref,motion}) {
 const [greeting,setGreeting]=useState(false);
 const greetingTimer=useRef();
 useEffect(()=>()=>clearTimeout(greetingTimer.current),[]);
 function greet() {
  clearTimeout(greetingTimer.current);
  setGreeting(true);
  greetingTimer.current=setTimeout(()=>setGreeting(false),2200);
 }
 return <div className="shop-window">
  <div className="shop-canvas">
   <img className="shop-artwork" src={`${import.meta.env.BASE_URL}assets/nico-shopfront-v1.png`} width="1881" height="836" alt="暖白墙面、绿白遮阳棚，招牌上写着 Nico 杂货铺。橱窗里摆着罐子、书和纸袋。" fetchPriority="high" decoding="async"/>
   <a className="shop-door" href={entryHref} aria-label="从店门进去"><span className="shop-open-label">营业中</span></a>
   <button className="shop-nico" type="button" onClick={greet} aria-label="摸摸 Nico">
    <NicoCharacter pose={greeting?3:0} motion={motion}/>
    <span className="shop-greeting" role="status">{greeting?'喵～':''}</span>
   </button>
  </div>
 </div>;
}
