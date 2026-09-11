import React from 'react';
import {Icon} from '../ui.jsx';
export function Range({label,value,onChange,min=0,max=1,step=.05,suffix='',disabled=false}){return <label className="work-range"><span>{label}<strong>{Number.isInteger(value)?value:Number(value.toFixed(3))}{suffix}</strong></span><input type="range" disabled={disabled} min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;}
export function Select({label,value,onChange,options}){return <label className="work-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>;}
export function Note({children}){return <p className="work-note">{children}</p>;}
export function Submit({children,onClick,disabled=false}){return <button className="primary" disabled={disabled} onClick={onClick}>{children}<Icon name="ArrowRight" size={15}/></button>;}
export function Result({children,ok=true}){return <div className={'work-result '+(ok?'ok':'issue')} role="status"><Icon name={ok?'CheckCircle2':'CircleHelp'} size={17}/><div>{children}</div></div>;}
export function Sparkline({series,labels=['训练','验证'],height=180}){
 const values=series.flat(),min=Math.min(0,...values),max=Math.max(.01,...values),span=max-min||1;
 const point=(v,i,n)=>`${40+i*480/Math.max(1,n-1)},${height-28-(v-min)/span*(height-52)}`;
 return <div className="work-chart"><svg viewBox={`0 0 560 ${height}`} role="img" aria-label={labels.map((l,j)=>l+'：'+(series[j]?.at(-1)?.toFixed(3)??'未运行')).join('；')}><path d={`M40 15V${height-28}H535`} stroke="#d6d1ca" fill="none"/>{[0,.5,1].map(t=><g key={t}><text x="2" y={height-26-t*(height-52)}>{(min+t*span).toFixed(2)}</text><path d={`M40 ${height-28-t*(height-52)}H535`} stroke="#eee9e2"/></g>)}{series.map((s,j)=><polyline key={j} points={s.map((v,i)=>point(v,i,s.length)).join(' ')} fill="none" stroke={['var(--chapter-accent)','#bca175'][j%2]} strokeWidth="2.5"/>)}<text x="490" y={height-5}>迭代 →</text></svg><div className="chart-key">{labels.map((l,i)=><span key={l}><i style={{background:['var(--chapter-accent)','#bca175'][i%2]}}/>{l}</span>)}</div></div>;
}
