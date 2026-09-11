import React from 'react';
import {Icon} from '../components/ui.jsx';
import NicoCharacter from '../components/NicoCharacter.jsx';
import Shopfront from './Shopfront.jsx';
import {domains} from '../data/index.js';
import {journeys} from '../journeys/catalog.js';
import {acts,chapters,chapterOrder,chapterNumber,completeChapter,missingRequirements,firstUnfinished,recommendedChapter} from './catalog.js';

export function ChapterScene({id,motion=true}) {
 const c=chapters[id];
 return <div className={'story-scene scene-'+id} aria-label={c.subject+'任务预览'}><div className="scene-bar"><span><i/><i/><i/></span><span>Nico 杂货铺 / {c.name}</span><Icon name={c.icon} size={16}/></div>
  {id==='py'&&<div className="receipt-scene"><div className="receipt"><h3>订单 #104</h3><dl><div><dt>商品单价</dt><dd>199 + 299 分</dd></div><div><dt>合计</dt><dd>498 分</dd></div><div><dt>九折 · 向下取整</dt><dd><b>448</b> 分</dd></div></dl><p><Icon name="CircleHelp" size={17}/>原订单标签被改了</p></div><NicoCharacter motion={motion}/></div>}
  {id==='web'&&<div className="scene-browser"><div className="scene-query"><Icon name="Search"/>猫砂</div><div className="scene-response"><Icon name="Package" size={42}/><span>成年猫主粮<small>页面显示了“猫粮”的结果</small></span></div><div className="scene-race"><span>猫粮<i/></span><span>猫砂<i/></span></div><p>先发出的请求，可能更晚返回。</p></div>}
  {id==='eng'&&<div className="scene-log"><span>order-104 / 请求记录</span><code>10:02:00　POST /redeem</code><code>10:02:00　余额 2 → 1</code><code className="alert">10:02:01　timeout → retry</code><code>10:02:01　余额 1 → 0</code><p>这次重试又扣了一张券。</p></div>}
  {id==='math'&&<div className="scene-math"><svg viewBox="0 0 400 190" role="img" aria-label="二次函数与梯度更新示意"><path d="M30 15V165H380"/><path className="curve" d="M60 30Q205 285 350 30"/><path className="tangent" d="M45 58L180 166"/><circle cx="111" cy="112" r="7"/><path className="step-arrow" d="M123 114L154 129M147 116L154 129 140 130"/><text x="232" y="63">f(x) = x²</text><text x="205" y="185">一次更新，会走到哪？</text></svg><div className="scene-math-controls"><span>位置 x</span><i/><code>学习率 η</code></div></div>}
  {id==='ml'&&<div className="scene-decision"><h3>这一轮，联系谁？</h3><div className="scene-people">{Array.from({length:20},(_,i)=><span key={i} className={i<8?'selected':''}><Icon name="User" size={19}/></span>)}</div><div className="scene-budget"><span>预算</span><b>8 / 20</b></div><p>阈值、误报和漏报，需要一起考虑。</p><small>教学情境示意</small></div>}
  {id==='dl'&&<div className="scene-model"><div className="scene-comments"><span>包装完整，质量不错</span><span>物流慢，客服也没解决</span><span>价格不贵，效果很差</span></div><div className="scene-network"><strong>16<small>词向量</small></strong><Icon name="ArrowRight"/><strong>8<small>隐藏单元</small></strong><Icon name="ArrowRight"/><strong>1<small>正向分数</small></strong></div><p>试着把这些评论分成正向和负向。</p></div>}
  {id==='llm'&&<div className="scene-evidence"><div><span>顾客</span><p>定制商品能七天无理由退货吗？</p></div><div className="scene-docs"><span><Icon name="FileText"/>旧版规则<small>已过期</small></span><span><Icon name="FileCheck2"/>现行规则<small>待核验</small></span></div><code>资料 → 检索 → 引用 → 工具校验</code><small>虚构客服政策 · 教学情境</small></div>}
  {id==='rl'&&<div className="scene-grid-wrap"><div className="scene-grid">{Array.from({length:25},(_,i)=><span key={i} className={[7,12,17].includes(i)?'wall':''}>{i===0?<NicoCharacter motion={motion}/>:i===24?<Icon name="Flag"/>:null}</span>)}</div><p>每一步都有代价，先试着走到出口。</p></div>}
 </div>;
}

export function StoryHome({state}) {
 const target=state.lastJourney&&!completeChapter(state,state.lastJourney)?state.lastJourney:recommendedChapter(state);
 const started=Object.keys(state.journeys||{}).length>0;
 const entryHref='#chapter/'+target;
 function showChapters(e) {
  e.preventDefault();
  const heading=document.getElementById('shop-chapters-title');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  heading?.focus({preventScroll:true});
  document.getElementById('story-chapters')?.scrollIntoView({behavior:state.settings.motion&&!reduced?'smooth':'instant'});
 }
 return <main className="story-home shop-home">
  <section className="shop-cover" aria-labelledby="shop-title">
   <h1 id="shop-title" className="sr-only">Nico 杂货铺</h1>
   <Shopfront entryHref={entryHref} motion={state.settings.motion}/>
   <div className="shop-actions">
    <a className="shop-enter" href={entryHref}>{started?'回店里看看':'进店看看'}<Icon name="ArrowRight" size={18}/></a>
    <a className="shop-browse" href="#story-chapters" onClick={showChapters}>翻翻章节<Icon name="ChevronDown" size={17}/></a>
   </div>
  </section>
  <section className="shop-chapters" id="story-chapters" aria-labelledby="shop-chapters-title">
   <header><h2 id="shop-chapters-title" tabIndex={-1}>店里的事</h2><p>{started?`上次看到「${(chapters[state.lastJourney]||chapters[target]).name}」。`:'第一次来，就从第一笔订单开始。'}</p></header>
   <div className="shop-acts">{acts.map((act,i)=><section className="shop-act" key={act.title}>
    <header><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h3>{act.title}</h3></header>
    <ol>{act.ids.map(id=>{
     const c=chapters[id],done=completeChapter(state,id);
     return <li key={id}><a href={'#chapter/'+id}>
      <span className="shop-chapter-number">{chapterNumber(id)}</span>
      <span className="shop-chapter-name"><strong>{c.name}</strong><small>{c.subject}</small></span>
      <Icon name={done?'CheckCircle2':'ArrowRight'} size={17}/>
      {done&&<span className="sr-only">本章已完成</span>}
     </a></li>;
    })}</ol>
   </section>)}</div>
   <p className="shop-study-order"><span>数学<Icon name="ArrowRight" size={12}/>机器学习<Icon name="ArrowRight" size={12}/>深度学习</span><span>强化学习是选学章节。</span></p>
  </section>
 </main>;
}

export function ChapterRail({id,state,index=-1}) {
 const c=chapters[id],spec=journeys[id];
 return <aside className="story-rail"><a className="back-link" href="#explore"><Icon name="ArrowLeft" size={16}/>全部章节</a><div className="story-rail-title"><span>第 {chapterNumber(id)} 章 · {c.subject}</span><h2>{c.name}</h2></div><nav aria-label="本章小节"><a href={'#chapter/'+id} className={index<0?'active':''} aria-current={index<0?'page':undefined}><Icon name="BookOpen" size={18}/><span>开篇</span></a>{spec.stages.map((title,i)=><a key={title} href={`#journey/${id}/${i}`} className={index===i?'active':''} aria-current={index===i?'step':undefined}><span className="rail-step">{state.journeys?.[id]?.evidence?.[i]?<Icon name="Check" size={14}/>:String(i+1).padStart(2,'0')}</span><span>{title}</span></a>)}</nav><div className="story-rail-bottom"><a href={'#path/'+id}><Icon name="BookOpen" size={15}/>本章知识索引</a><span>{Object.keys(state.journeys?.[id]?.evidence||{}).length} / {spec.stages.length} 节有记录</span></div></aside>;
}

export function ChapterOpening({id,state}) {
 const c=chapters[id],spec=journeys[id],missing=missingRequirements(state,id),record=state.journeys?.[id],next=c.next[0];
 return <main className="story-frame" data-story={id} style={{'--story-accent':c.color,'--story-soft':c.soft}}><ChapterRail id={id} state={state}/><section className="chapter-opening"><header className="chapter-title"><div><span>第 {chapterNumber(id)} 章 · {c.subject}</span><h1>{c.name}</h1></div><a className="story-link" href="#explore">全部章节<Icon name="ChevronRight" size={15}/></a></header><div className="chapter-opening-scroll"><div className="chapter-opening-grid"><div className="chapter-narrative"><h2>{c.scene}</h2><p>{c.opening}</p><blockquote><span><Icon name="User" size={16}/>{c.sender}</span><p>{c.message}</p></blockquote><div className="chapter-actions"><a className="story-primary" href={`#journey/${id}/${firstUnfinished(state,id)}`}>{record?'回到本章实验':'接下任务'}<Icon name="ArrowRight" size={18}/></a><span>{spec.stages.length} 个连续小节</span></div></div><ChapterScene id={id} motion={state.settings.motion}/></div>
 <section className="chapter-sequence"><h2>这章会发生什么</h2><ol>{c.beats.map((beat,i)=><li key={beat[0]}><a href={`#journey/${id}/${i}`}><span className="sequence-number">{String(i+1).padStart(2,'0')}</span><h3>{spec.stages[i]}</h3><span className="sequence-format"><Icon name={['ScanLine','Code2','Network','FileCheck2'][i%4]} size={22}/>{beat[2]}</span><p>{beat[3]}</p>{record?.evidence?.[i]&&<small><Icon name="Check" size={12}/>已有实验记录</small>}</a></li>)}</ol></section>
 <section className="chapter-prereqs"><div><h3>先学哪些内容</h3>{c.requires.length?<ul>{c.requires.map(r=><li key={r.id}><Icon name={missing.some(m=>m.id===r.id)?'BookOpen':'CheckCircle2'} size={16}/><a href={'#chapter/'+r.id}>{chapters[r.id].subject}</a><span>{r.why}</span>{missing.some(m=>m.id===r.id)?<small>建议先补</small>:<small>已有记录</small>}</li>)}</ul>:<p>无需先修，从这里开始。</p>}</div><div><h3>本章完成后</h3><p>{c.deliver}</p></div></section>{c.requires.map(r=>state.journeys?.[r.id]?.evidence?.[journeys[r.id].stages.length-1]&&<p className="chapter-carry" key={r.id}><Icon name="Folder" size={16}/><span>带来的记录 · {chapters[r.id].name}<br/>{state.journeys[r.id].evidence[journeys[r.id].stages.length-1].summary}</span></p>)}<footer className="chapter-outgoing"><span>{missing.length?'可以先预览本章；进入实验时会提示所需基础。':'准备好后，从第一个未完成的小节开始。'}</span>{next&&<a href={'#chapter/'+next}>接下来：{chapters[next].name}<Icon name="ArrowRight" size={16}/></a>}</footer></div></section></main>;
}

export function KnowledgeLibrary({state}) {
 return <main className="knowledge-library"><h1>知识索引</h1><p>想查哪个概念，直接找就好。</p><div>{chapterOrder.map(id=>{const d=domains.find(d=>d.id===id),c=chapters[id];return <a key={id} href={'#path/'+id} style={{'--story-accent':c.color}}><Icon name={c.icon} size={24}/><span><h2>{d.name}</h2><p>{c.beats.map(b=>b[2]).join(' / ')}</p></span><Icon name="ArrowRight" size={20}/></a>;})}</div></main>;
}
