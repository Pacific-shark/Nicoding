import React,{lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {journeys} from './journeys/catalog.js';
import {byId,domains,lessons,projects} from './data/index.js';
import {paths} from './data/paths.js';
import {knowledge,knowledgeById} from './atlas/knowledge.js';
import {topics,topicById} from './atlas/topics.js';
import {chapterById} from './atlas/catalog.js';
import {useProgress,validateImport} from './state.js';
import {StoryHome} from './story/StoryViews.jsx';
import {COURSE,unitById,units as bankUnits,courseHref} from './courses/bank/registry.js';
import Lesson from './components/Lesson.jsx';
import Pet from './components/NicoCompanion.jsx';
import {Review,Projects} from './components/Collections.jsx';
import {Icon,IconButton,Modal,statusOf} from './components/ui.jsx';
const LearningJourney=lazy(()=>import('./components/journeys/LearningJourney.jsx'));
const LearningUnit=lazy(()=>import('./components/learning/LearningUnit.jsx'));
const Atlas=lazy(()=>import('./atlas/Atlas.jsx'));
const BankCourse=lazy(()=>import('./courses/bank/BankCourse.jsx'));
function routeFromHash(){
 const [page='explore',id,view]=location.hash.slice(1).split('/');
 if(!page||page==='explore')return knowledgeById[id]?{page:'learn',id}:{page:'explore'};
 if(page==='shop')return {page};
 if((page==='knowledge'||page==='learn')&&knowledgeById[id])return {page,id,view};
 if(page==='practice'&&byId[id])return {page,id,view};
 if(page==='topic'&&topicById[id]&&(view===undefined||(/^\d+$/.test(view)&&topicById[id].stages[Number(view)])))return {page,id,view};
 if(page==='chapter'&&chapterById[id])return {page,id};
 if(page==='library'&&(!id||chapterById[id])&&(!view||knowledgeById[view]))return {page,id,view};
 if(page==='course'&&id===COURSE&&(!view||unitById[view]))return {page,id,view};
 if(page==='journey'&&journeys[id])return {page,id,view:view!==undefined?String(Math.min(journeys[id].stages.length-1,Math.max(0,parseInt(view,10)||0))):undefined};
 if(page==='path'&&domains.some(d=>d.id===id)||page==='learn'&&byId[id]||page==='projects'&&(!id||projects.some(p=>p.id===id))||page==='review'&&!id)return {page,id,view:page==='learn'&&view==='explain'?'explain':undefined};
 return {page:'missing'};
}
export default function App(){
 const progress=useProgress(),{state,setState}=progress;
 const [route,setRoute]=useState(routeFromHash),[modal,setModal]=useState(null),[query,setQuery]=useState(''),[toast,setToast]=useState(''),[celebration,setCelebration]=useState(0),[petReset,setPetReset]=useState(0),[importData,setImportData]=useState(null),[importError,setImportError]=useState('');
 const inputFile=useRef(),toastTimer=useRef(),pageRef=useRef();
 const {page,id,view}=route,l=knowledgeById[id];
 const petLesson=byId[id]||byId[page==='topic'?paths[topicById[id].chapter].ids[0]:page==='chapter'||page==='journey'||page==='path'?paths[id].ids[0]:byId[state.last]?state.last:'py-values'];
 const closeModal=useCallback(()=>{setModal(null);setImportData(null);setImportError('');},[]);
 function notify(message){clearTimeout(toastTimer.current);setToast(message);toastTimer.current=setTimeout(()=>setToast(''),4000);}
 function navigate(next,nextId){location.hash=next+(nextId?'/'+nextId:'');}
 function learn(nextId){closeModal();navigate('knowledge',nextId);}
 useEffect(()=>{const handler=()=>setRoute(routeFromHash());window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler);},[]);
 useEffect(()=>{
  document.title=(page==='course'?(unitById[view]?.title||'第一份分类模型'):page==='topic'?topicById[id].title:page==='chapter'?chapterById[id].name:page==='journey'?journeys[id].title:['learn','knowledge','practice'].includes(page)?l.title:page==='path'?chapterById[id].name:({explore:'课程',shop:'Nico 杂货铺',library:'知识星图',review:'复习',projects:'练习',missing:'页面未找到'}[page]))+' · Nicoding';
  window.scrollTo(0,0);
  const heading=pageRef.current?.querySelector('main h1');if(heading&&page!=='course'&&!(page==='chapter'&&id==='ml')){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  if(page==='learn'||page==='knowledge')setState(s=>({...s,last:id,lastJourney:null,lastCourse:null,lessons:{...s.lessons,[id]:{...s.lessons[id],visited:s.lessons[id]?.visited||Date.now()}}}));
 },[page,id,view,setState]);
 useEffect(()=>{const key=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(document.querySelector('[role=dialog]'))return;setQuery('');setModal('search');}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{document.documentElement.dataset.motion=state.settings.motion?'on':'off';},[state.settings.motion]);
 useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
 function exportProgress(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Nicoding-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('进度备份已交给浏览器下载。');}
 async function chooseFile(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>3_000_000)throw new Error('文件过大，请选择 3 MB 以内的进度 JSON。');const parsed=validateImport(JSON.parse(await file.text()));setImportData(parsed);setImportError('');}catch(err){setImportError(err.message);setImportData(null);}}
 const bankResults=bankUnits.filter(x=>(x.title+' '+x.format+' 机器学习 逻辑回归 bank').toLowerCase().includes(query.trim().toLowerCase()));
 const topicResults=topics.filter(x=>(x.title+' '+x.summary+' '+chapterById[x.chapter].name).toLowerCase().includes(query.trim().toLowerCase()));
 const filtered=knowledge.filter(x=>[x.title,x.subtitle,domains.find(d=>d.id===x.domain).name,x.id,...x.parts.flat()].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
 return <div ref={pageRef} className={`app page-${page}`}>
  <header className="app-header"><a className="brand" aria-label="Nicoding 首页" href="#explore"><img src="./assets/nicoding-logo.png" alt="Nicoding"/></a><nav className="top-nav" aria-label="主导航">{[['explore','课程'],['library','知识星图'],['projects','练习'],['review','复习']].map(([target,label])=>{const active=page===target||target==='explore'&&['chapter','journey','course','topic','shop'].includes(page)||target==='library'&&['learn','knowledge','path'].includes(page);return <a key={target} href={'#'+target} className={active?'active':''} aria-current={active?'page':undefined}>{label}{target==='review'&&knowledge.some(x=>state.lessons[x.id]?.completed&&state.lessons[x.id].due<=Date.now())&&<i/>}</a>;})}</nav><div className="header-actions"><button className="search-trigger" aria-label="搜索知识点（Ctrl K）" onClick={()=>{setQuery('');setModal('search');}}><Icon name="Search" size={19}/><span>搜索</span><kbd>Ctrl K</kbd></button><IconButton name="Settings2" label="设置与进度备份" onClick={()=>setModal('settings')}/></div></header>
  {progress.storageError&&<div className="storage-error" role="alert">{progress.storageError}<button onClick={exportProgress}>导出备份</button></div>}
  {['explore','chapter','library','path','knowledge','learn','topic'].includes(page)&&<Suspense fallback={<main className="collection-page" role="status">正在打开学习空间…</main>}><Atlas page={page} id={id} view={view} progress={progress}/></Suspense>}
  {page==='shop'&&<StoryHome state={state}/>}
  {page==='course'&&<Suspense fallback={<main role="status" className="collection-page">正在打开真实实验…</main>}><BankCourse key={view||'opening'} unitId={view} progress={progress}/></Suspense>}
  {page==='journey'&&<Suspense fallback={<main role="status" className="collection-page">正在准备学习场景…</main>}><LearningJourney key={id} id={id} stageParam={view} progress={progress}/></Suspense>}
  {page==='practice'&&id==='py-references'&&<Suspense fallback={<main className="collection-page" role="status">正在打开引用与复制单元…</main>}><LearningUnit progress={progress} startExplain={view==='explain'} onCelebrate={()=>setCelebration(v=>v+1)}/></Suspense>}
  {page==='practice'&&id!=='py-references'&&<Lesson key={id} lesson={l} startStep={view==='explain'?4:0} progress={progress} onBack={()=>navigate('path',l.domain)} onSelect={learn} onCelebrate={()=>setCelebration(v=>v+1)}/>}
  {page==='review'&&<Review progress={progress} onLearn={learn} onCelebrate={()=>setCelebration(v=>v+1)}/>}
  {page==='projects'&&<Projects key={id||'default'} progress={progress} onLearn={learn} projectId={id} onProject={id=>navigate('projects',id)}/>}
  {page==='missing'&&<main className="collection-page empty-state"><h1>这条学习路径还不存在。</h1><p>可以回到学习路线，或搜索你想学的知识点。</p><a className="primary" href="#explore">返回学习路线<Icon name="ArrowRight"/></a></main>}
  {state.settings.pet&&<Pet cover={page==='explore'||page==='chapter'||page==='shop'||page==='library'} lesson={petLesson} completed={lessons.filter(l=>state.lessons[l.id]?.completed).length} suspended={!!modal} workspace={page==='projects'} study={['course','topic','knowledge','learn','journey','practice'].includes(page)} onLearn={learn} onTeach={id=>navigate('learn',id+'/explain')} onProject={id=>navigate('projects',id)} motion={state.settings.motion} celebration={celebration} resetKey={petReset}/>}
  {toast&&<div className="toast" role="status"><Icon name="CheckCircle2" size={17}/>{toast}</div>}
  {modal==='search'&&<Modal wide title="找到你的下一个知识点" onClose={closeModal}><div className="search-field"><Icon name="Search"/><input autoFocus aria-label="搜索课程" placeholder="试试 return、PPO、接口、引用…" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>ESC</kbd></div><div className="search-result-count">{filtered.length+bankResults.length+topicResults.length} 个结果 · 课题、小节与知识点</div><div className="search-results">{topicResults.map(t=><button key={t.id} onClick={()=>{closeModal();location.hash='topic/'+t.id;}}><span className="search-orb"><Icon name="FileCode2"/></span><span><strong>{t.title}</strong><small>{chapterById[t.chapter].name} · 课题 · {t.environment}</small></span><Icon name="ArrowRight" size={15}/></button>)}{bankResults.map(x=><button key={x.id} onClick={()=>{closeModal();location.hash=courseHref(x.id);}}><span className="search-orb"><Icon name="FlaskConical"/></span><span><strong>{x.title}</strong><small>机器学习项目 · {x.format}</small></span><Icon name="ArrowRight" size={15}/></button>)}{filtered.length?filtered.map(x=><button key={x.id} onClick={()=>learn(x.id)}><span className={`search-orb ${statusOf(state.lessons[x.id])}`}><Icon name={domains.find(d=>d.id===x.domain).icon}/></span><span><strong>{x.title}</strong><small>{domains.find(d=>d.id===x.domain).name} · {x.subtitle}</small></span><span className="search-depth">{x.depth}</span><Icon name="ArrowRight" size={15}/></button>):!bankResults.length&&!topicResults.length&&<div className="search-empty">还没有匹配项。试试更短的关键词或相近概念。</div>}</div></Modal>}
  {modal==='settings'&&<Modal title="你的学习空间" onClose={closeModal}><div className="settings-section"><h3>陪伴与动效</h3><label className="settings-toggle"><span><Icon name="PawPrint"/>显示 Nico 小猫</span><input type="checkbox" checked={state.settings.pet} onChange={e=>setState(s=>({...s,settings:{...s.settings,pet:e.target.checked}}))}/></label><label className="settings-toggle"><span><Icon name="Sparkles"/>空间与小猫动效</span><input type="checkbox" checked={state.settings.motion} onChange={e=>setState(s=>({...s,settings:{...s.settings,motion:e.target.checked}}))}/></label><button className="text-button" onClick={()=>{setPetReset(v=>v+1);notify('Nico 回到熟悉的位置了。');}}><Icon name="Focus" size={15}/>重置小猫位置</button></div><div className="settings-section"><h3>保存你的积累</h3><p className="muted">进度与笔记在当前浏览器中。换浏览器、清理站点数据或更换地址前，请先导出备份。</p><div className="settings-buttons"><button className="secondary" onClick={exportProgress}><Icon name="Download"/>导出进度</button><button className="secondary" onClick={()=>inputFile.current.click()}><Icon name="Upload"/>导入进度</button><input ref={inputFile} type="file" accept="application/json,.json" hidden onChange={chooseFile}/></div>{importError&&<p className="error-text" role="alert">{importError} 当前进度没有改变。</p>}{importData&&<div className="import-preview"><h4>已读取备份，等待恢复</h4><p>{Object.values(importData.lessons).filter(r=>r.completed).length} 个点亮节点 · {Object.keys(importData.notes).length} 份笔记、{Object.keys(importData.studies).length} 份课题记录。恢复会替换当前浏览器中的学习记录。</p><button className="primary" onClick={()=>{setState(importData);setImportData(null);notify('备份已恢复。');}}>恢复这份备份</button></div>}</div><div className="settings-section"><h3>关于 Nicoding</h3><p className="muted">为从 AI 协作走向独立理解而做。{knowledge.length} 个知识节点、{topics.length} 个课题、{knowledge.reduce((n,l)=>n+l.quiz.length,0)} 道理解题、{lessons.filter(l=>l.challenge).length} 组代码挑战。原创讲解配权威资料，提示为预先编写，不会调用在线 AI。</p><p className="fineprint">课题与星图版 · 新增内容及 GitHub 参考核对于 2026-09-18。节点点亮是局部学习证据，项目能力需要真实交付检验。</p></div></Modal>}
 </div>;
}
