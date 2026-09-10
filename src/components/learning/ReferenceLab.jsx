import React,{useId} from 'react';
import {Icon} from '../ui.jsx';
import {referenceModes,referenceSnapshot,referenceRows} from '../../learning/reference-model.js';

function ObjectGraph({snapshot,simple}) {
 const marker=useId().replace(/:/g,'');
 const positions=simple?{A:[305,58],B:[305,163]}:{A:[175,40],B:[405,40],C:[175,155],D:[405,155],E:[405,265]};
 const rows=referenceRows(snapshot),height=simple?245:350;
 const arrow=(key,x1,y1,x2,y2)=><path key={key} d={`M ${x1} ${y1} C ${x1+55} ${y1}, ${x2-55} ${y2}, ${x2} ${y2}`} markerEnd={`url(#${marker})`}/>;
 return <div className="reference-diagram"><svg viewBox={`0 0 590 ${height}`} role="img" aria-label={rows.length?rows.map(r=>`${r.name} 指向对象 ${r.id}，值为 ${r.value}`).join('；'):'尚未创建对象'}>
  <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs>
  <g className="reference-arrows">{Object.entries(snapshot.names).map(([name,id],i)=>{const [x,y]=positions[id];return arrow('name-'+name,94,simple?85+i*95:65+i*115,x-7,y+22);})}
   {Object.entries(snapshot.objects).flatMap(([id,values])=>values.flatMap((v,i)=>{if(typeof v!=='object')return [];const [x,y]=positions[id],[tx,ty]=positions[v.ref];return [arrow(id+'-'+i,x+140,y+22+i*12,tx-7,ty+22)];}))}</g>
  {Object.entries(snapshot.names).map(([name],i)=><text className="reference-name" key={name} x="58" y={(simple?85+i*95:65+i*115)+6}>{name}</text>)}
  {Object.entries(snapshot.objects).map(([id,values])=>{const [x,y]=positions[id];return <g key={id} className="reference-object"><rect x={x} y={y} width="140" height="48" rx="8"/><text x={x+70} y={y+29} textAnchor="middle">[ {values.map(v=>typeof v==='object'?'→ '+v.ref:v).join(', ')} ]</text><text className="reference-object-label" x={x+70} y={y+70} textAnchor="middle">列表 · 对象 {id}</text></g>;})}
  {!rows.length&&<text className="reference-object-label" x="295" y="115" textAnchor="middle">执行第一行，创建一个列表。</text>}
 </svg></div>;
}
export default function ReferenceLab({modes,record,patch}) {
 const mode=modes.length===1?modes[0]:(record.experiments?.copyMode||'shallow');
 const step=record.experiments?.[mode]??2;
 const definition=referenceModes[mode],snapshot=referenceSnapshot(mode,step),rows=referenceRows(snapshot);
 function changeStep(next){patch(r=>({...r,experiments:{...r.experiments,[mode]:next},observations:{...r.observations,...(next===4?{[mode]:true}:{})}}));}
 return <section className="unit-lab" aria-label="引用过程实验"><header><h3>跟着代码，看一次变化。</h3>{modes.length>1&&<div className="unit-segment" aria-label="复制方式">{modes.map(m=><button key={m} aria-pressed={mode===m} onClick={()=>patch(r=>({...r,experiments:{...r.experiments,copyMode:m}}))}>{referenceModes[m].label}</button>)}</div>}</header>
  <div className={`reference-workspace ${mode!=='binding'?'nested':''}`}><ol className="reference-code" aria-label="实验代码">{definition.lines.map((line,i)=><li key={line} className={step===i+1?'current':''} aria-current={step===i+1?'step':undefined}><span aria-hidden="true">{i+1}</span><code>{line}</code></li>)}</ol><ObjectGraph snapshot={snapshot} simple={mode==='binding'}/></div>
  <div className="lab-controls"><button className="secondary" disabled={step===0} onClick={()=>changeStep(step-1)}><Icon name="ArrowLeft" size={16}/>上一步</button><button className="primary" disabled={step===4} onClick={()=>changeStep(step+1)}>下一步<Icon name="ArrowRight" size={16}/></button><button className="plain-button" onClick={()=>changeStep(0)}><Icon name="RotateCcw" size={16}/>重置</button><span>{step} / 4</span></div>
  <p className="lab-feedback" aria-live="polite">{definition.notes[step]}</p>
  <details className="lab-equivalent"><summary>用表格看引用与值</summary><table><thead><tr><th>名字</th><th>指向</th><th>当前值</th></tr></thead><tbody>{rows.map(row=><tr key={row.name}><td><code>{row.name}</code></td><td>对象 {row.id}</td><td><code>{row.value}</code></td></tr>)}</tbody></table><p>图中 A、B 是便于阅读的对象编号，不是内存地址。此预设演示只覆盖上方代码；自由编辑和运行在后面的练习中进行。</p></details>
 </section>;
}
