import React,{useLayoutEffect,useRef} from 'react';
import {Icon} from '../components/ui.jsx';
import {chapters,chapterById} from './catalog.js';
export function AtlasShell({rail,children,kind='',identity}){
 const content=useRef();
 useLayoutEffect(()=>{content.current?.scrollTo(0,0);const h=content.current?.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}},[identity]);
 return <main className={'atlas-shell '+kind}><aside className="atlas-rail">{rail}</aside><section className="atlas-main" ref={content}>{children}</section></main>;
}
export function ChapterRail({active}){
 return <><div className="atlas-rail-title"><h2>课程</h2><p>从课题开始，按需补知识</p></div><nav aria-label="章节目录" className="atlas-chapter-nav">{chapters.map((c,i)=><a key={c.id} href={'#chapter/'+c.id} aria-current={active===c.id?'page':undefined}><span>{String(i+1).padStart(2,'0')}</span>{c.name}</a>)}</nav><div className="atlas-rail-footer"><a href="#library"><Icon name="Orbit" size={16}/>打开知识星图</a><a href="#shop">Nico 杂货铺<Icon name="ArrowUpRight" size={14}/></a></div></>;
}
export function External({href,children,...rest}){return <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}<Icon name="ArrowUpRight" size={14}/></a>;}
export function KnowledgeLink({node,context,children}){return <a href={'#knowledge/'+node.id+(context?'/'+context:'')} className="atlas-knowledge-link">{children||node.title}<Icon name="ArrowUpRight" size={14}/></a>;}
export function Breadcrumb({chapter,children}){return <div className="atlas-breadcrumb"><a href={'#chapter/'+chapter}>{chapterById[chapter].name}</a><span>/</span>{children}</div>;}

