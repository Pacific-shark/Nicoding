import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowLeft,Check,ChevronRight,ChevronDown,X,Search,Settings2,Play,RotateCcw,Plus,Minus,Focus,ExternalLink,BookOpen,Braces,Globe,Blocks,Sigma,ChartNoAxesCombined,Network,Route,Sparkles,Clock,Lightbulb,CheckCircle2,FileText,Download,Upload,VolumeX,PawPrint,Move,PanelRightClose,Menu,Code2,NotebookPen,LockKeyhole,Command,Target,RefreshCw,CircleHelp,Maximize2,Minimize2,Bookmark,Info,Sun,Terminal,ChevronUp,Save,StopCircle,MousePointer2} from 'lucide-react';
const icons={ArrowRight,ArrowLeft,Check,ChevronRight,ChevronDown,X,Search,Settings2,Play,RotateCcw,Plus,Minus,Focus,ExternalLink,BookOpen,Braces,Globe,Blocks,Sigma,ChartNoAxesCombined,Network,Route,Sparkles,Clock,Lightbulb,CheckCircle2,FileText,Download,Upload,VolumeX,PawPrint,Move,PanelRightClose,Menu,Code2,NotebookPen,LockKeyhole,Command,Target,RefreshCw,CircleHelp,Maximize2,Minimize2,Bookmark,Info,Sun,Terminal,ChevronUp,Save,StopCircle,MousePointer2};
export function Icon({name,size=18,...props}){const Component=icons[name]||BookOpen;return <Component size={size} strokeWidth={1.6} aria-hidden="true" {...props}/>;}
export function IconButton({name,label,...props}){return <button className="icon-button" aria-label={label} title={label} {...props}><Icon name={name}/></button>;}
export function motionAllowed() {
 return document.documentElement.dataset.motion!=='off'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
export function useSoftTransition(key) {
 const ref=useRef(),previous=useRef(key);
 useEffect(()=>{
  if(previous.current===key)return;
  previous.current=key;
  const el=ref.current;
  if(!el)return;
  el.scrollTop=0;
  if(!motionAllowed())return;
  const animation=el.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
  return()=>animation.cancel();
 },[key]);
 return ref;
}
export function useDialogFocus(ref,active,onClose) {
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  if(!active)return;
  const el=ref.current,previous=document.activeElement,overflow=document.body.style.overflow;
  if(!el)return;
  document.body.style.overflow='hidden';
  const frame=requestAnimationFrame(()=>{
   const first=el.querySelector('input:not([type="file"]):not([type="checkbox"]),textarea')||el.querySelector('button')||el;
   first.focus({preventScroll:true});
  });
  const handler=e=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();return;}
   if(e.key!=='Tab')return;
   const items=[...el.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(x=>!x.disabled&&x.tabIndex>=0&&x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');
   const first=items[0],last=items.at(-1);
   if(!first){e.preventDefault();el.focus();return;}
   if(!el.contains(document.activeElement)){e.preventDefault();first.focus();}
   else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',handler,true);
  return()=>{cancelAnimationFrame(frame);document.body.style.overflow=overflow;document.removeEventListener('keydown',handler,true);if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[active,ref]);
}
export function Modal({title,onClose,children,wide=false}) {
 const ref=useRef(),timer=useRef(),close=useRef(onClose),closingRef=useRef(false);
 close.current=onClose;
 const [closing,setClosing]=useState(false);
 const requestClose=useCallback(()=>{
  if(closingRef.current)return;
  if(!motionAllowed()){close.current();return;}
  closingRef.current=true;setClosing(true);
  timer.current=setTimeout(()=>close.current(),180);
 },[]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useDialogFocus(ref,true,requestClose);
 return <div className={'modal-backdrop'+(closing?' is-closing':'')} onPointerDown={e=>{if(e.target===e.currentTarget)requestClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={'modal '+(wide?'wide':'')}><div className="modal-heading"><h2>{title}</h2><IconButton name="X" label="关闭窗口" onClick={requestClose}/></div>{children}</section></div>;
}
export const statusOf=(record)=>record?.completed?(record.due<=Date.now()?'due':'done'):record?.visited?'started':'new';
export const statusLabel={new:'未开始',started:'学习中',done:'已点亮',due:'待复习'};
export function SourceLinks({lesson}){return <div className="source-links">{lesson.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><Icon name="FileText"/><span>{s.title}</span><Icon name="ExternalLink" size={14}/></a>)}<p className="fineprint">讲解与练习为原创编写，原理资料见上方链接。资料核对：{lesson.checked}。外部资料需要联网。</p></div>;}
