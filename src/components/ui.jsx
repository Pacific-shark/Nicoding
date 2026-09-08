import React,{useEffect,useRef} from 'react';
import {ArrowRight,ArrowLeft,Check,ChevronRight,ChevronDown,X,Search,Settings2,Play,RotateCcw,Plus,Minus,Focus,ExternalLink,BookOpen,Braces,Globe,Blocks,Sigma,ChartNoAxesCombined,Network,Route,Sparkles,Clock,Lightbulb,CheckCircle2,FileText,Download,Upload,VolumeX,PawPrint,Move,PanelRightClose,Menu,Code2,NotebookPen,LockKeyhole,Command,Target,RefreshCw,CircleHelp,Maximize2,Minimize2,Bookmark,Info,Sun,Terminal,ChevronUp,Save,StopCircle,MousePointer2} from 'lucide-react';
const icons={ArrowRight,ArrowLeft,Check,ChevronRight,ChevronDown,X,Search,Settings2,Play,RotateCcw,Plus,Minus,Focus,ExternalLink,BookOpen,Braces,Globe,Blocks,Sigma,ChartNoAxesCombined,Network,Route,Sparkles,Clock,Lightbulb,CheckCircle2,FileText,Download,Upload,VolumeX,PawPrint,Move,PanelRightClose,Menu,Code2,NotebookPen,LockKeyhole,Command,Target,RefreshCw,CircleHelp,Maximize2,Minimize2,Bookmark,Info,Sun,Terminal,ChevronUp,Save,StopCircle,MousePointer2};
export function Icon({name,size=18,...props}){const Component=icons[name]||BookOpen;return <Component size={size} strokeWidth={1.6} aria-hidden="true" {...props}/>;}
export function IconButton({name,label,...props}){return <button className="icon-button" aria-label={label} title={label} {...props}><Icon name={name}/></button>;}
export function Modal({title,onClose,children,wide=false}) {
 const ref=useRef();
 useEffect(()=>{
  const previous=document.activeElement;
  const el=ref.current;
  (el.querySelector('[autofocus],input,button')||el).focus();
  const handler=e=>{
   if(e.key==='Escape'){e.preventDefault();onClose();}
   if(e.key==='Tab') {
    const items=[...el.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(x=>!x.disabled&&x.offsetParent!==null);
    if(!items.length){e.preventDefault();return;}
    const first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
  };
  el.addEventListener('keydown',handler);
  return()=>{el.removeEventListener('keydown',handler);previous?.focus?.();};
 },[onClose]);
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`modal ${wide?'wide':''}`}><div className="modal-heading"><h2>{title}</h2><IconButton name="X" label="关闭窗口" onClick={onClose}/></div>{children}</section></div>;
}
export const statusOf=(record)=>record?.completed?(record.due<=Date.now()?'due':'done'):record?.visited?'started':'new';
export const statusLabel={new:'未开始',started:'学习中',done:'已点亮',due:'待复习'};
export function SourceLinks({lesson}){return <div className="source-links">{lesson.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><Icon name="FileText"/><span>{s.title}</span><Icon name="ExternalLink" size={14}/></a>)}<p className="fineprint">讲解与练习为原创编写，原理资料见上方链接。资料核对：{lesson.checked}。外部资料需要联网。</p></div>;}
