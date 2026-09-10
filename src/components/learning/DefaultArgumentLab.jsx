import React,{useState} from 'react';
import {Icon} from '../ui.jsx';
import {defaultCalls} from '../../learning/reference-model.js';
const examples={bug:'def collect(item, bag=[]):\n    bag.append(item)\n    return bag',fixed:'def collect(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag'};
export default function DefaultArgumentLab({record,patch}) {
 const [item,setItem]=useState('A');
 const mode=record.experiments?.defaultMode||'bug',key=mode+'Calls',calls=record.experiments?.[key]||[],results=defaultCalls(mode==='fixed',calls);
 function call(){if(!item.trim()||calls.length>=6)return;const next=[...calls,item.trim()];patch(r=>({...r,experiments:{...r.experiments,[key]:next},observations:{...r.observations,...(next.length>=2?{['defaults-'+mode]:true}:{})}}));setItem(String.fromCharCode(65+next.length));}
 return <section className="unit-lab default-lab" aria-label="默认参数实验"><header><h3>连续调用两次，会留下什么？</h3><div className="unit-segment" aria-label="默认参数方案">{[['bug','共享默认列表'],['fixed','每次新建列表']].map(([id,title])=><button key={id} aria-pressed={mode===id} onClick={()=>{patch(r=>({...r,experiments:{...r.experiments,defaultMode:id}}));setItem(String.fromCharCode(65+(record.experiments?.[id+"Calls"]?.length||0)));}}>{title}</button>)}</div></header>
  <div className="default-workspace"><pre>{examples[mode]}</pre><div className="call-history"><div className="default-object"><span>{mode==='bug'?'省略 bag 时复用的列表':'每次省略 bag 都新建列表'}</span><code>{mode==='bug'?JSON.stringify(results.at(-1)||[]):'None → 新列表'}</code></div><ol aria-live="polite">{results.length?results.map((value,i)=><li key={i}><span>collect({JSON.stringify(calls[i])})</span><Icon name="ArrowRight" size={14}/><code>{JSON.stringify(value)}</code></li>):<li className="call-empty">输入一个值，调用一次函数。</li>}</ol></div></div>
  <div className="lab-controls"><label>本次 item<input aria-label="本次调用的值" maxLength={20} value={item} onChange={e=>setItem(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')call();}}/></label><button className="primary" disabled={!item.trim()||calls.length>=6} onClick={call}><Icon name="Play" size={15}/>调用一次</button><button className="plain-button" onClick={()=>{patch(r=>({...r,experiments:{...r.experiments,[key]:[]}}));setItem('A');}}><Icon name="RotateCcw" size={15}/>重置场景</button></div>
  <p className="lab-feedback">{calls.length>=6?'已记录六次调用。可以重置场景重新观察。':mode==='bug'?'同一次函数定义的默认列表一直存在；省略参数的调用会修改它。':'只有 bag is None 时才新建列表；显式传入的列表仍会被原地修改。'}</p>
  <p className="lab-caption">预设过程演示。右侧保留每次调用当时的结果快照，像当时的 print；历史文字不会随对象继续变化。下一章可以修改并运行真实 Python。</p>
 </section>;
}
