import React,{useEffect,useRef,useState} from 'react';
import {Icon} from '../../components/ui.jsx';
import {runBank} from './runtime.js';
import {DATA_SHA,courseHref} from './registry.js';
import {sigmoid,evaluate,pct,decimal,controlledPair} from './math.js';
const setField=(patch,key,value)=>patch(r=>({...r,[key]:value}));
const setNote=(patch,key,value)=>patch(r=>({...r,notes:{...r.notes,[key]:value}}));

export function Range({label,value,onChange,min=0,max=1,step=.01,disabled=false}){
 return <label className="bank-range"><span>{label}<output>{value}</output></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} disabled={disabled}/></label>;
}
export function Metrics({value}){
 return <dl className="bank-metrics">{[['准确率',pct(value.accuracy)],['精确率',pct(value.precision)],['召回率',pct(value.recall)],['选中',value.selected+' / '+value.n]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}
export function Confusion({value,onSelect,selected}){
 return <div className="bank-confusion">{[['tp','选中 · 实际订阅'],['fp','选中 · 实际未订阅'],['fn','未选 · 实际订阅'],['tn','未选 · 实际未订阅']].map(([key,label])=>onSelect?<button key={key} className={selected===key?'active':''} onClick={()=>onSelect(key)} aria-pressed={selected===key}><small>{key.toUpperCase()} · {label}</small><b>{value[key]}</b></button>:<div key={key}><small>{key.toUpperCase()} · {label}</small><b>{value[key]}</b></div>)}</div>;
}
export function Concept({id}){
 const [w,setW]=useState(1),[b,setB]=useState(0),[x,setX]=useState(1),[p,setP]=useState(.5),[y,setY]=useState(1),[t,setT]=useState(.5),[job,setJob]=useState('student');
 if(id==='brief')return <div className="bank-fieldboard"><div><small>拨号前候选输入</small><h3>客户资料 + 过往记录</h3><code>age · balance · previous<br/>job · marital · education<br/>housing · loan · poutcome</code></div><div className="excluded"><small>本次不进入 X</small><h3>通话结果与当前过程</h3><code>duration · y<br/>campaign · day · month · contact</code></div><p>字段是否可用，取决于预测时点。这里列的是本课约定，真实项目需要逐项核实。</p></div>;
 if(id==='baseline'){
  const rows=Array.from({length:100},(_,i)=>({y:i<10?1:0,p:.1})),m=evaluate(rows,{threshold:t});
  return <div className="bank-demo"><small>教学小例子 · 10 条正类 / 90 条负类 · 所有分数均为 0.1</small><Range label="决策阈值" value={t} onChange={setT}/><Confusion value={m}/><Metrics value={m}/><p>{t>.1?'没有记录被选中；高准确率没有找回任何正类。':'所有记录被选中；召回提高，但名单里多数是负类。'}预测正类的条件是 p ≥ 阈值。</p></div>;
 }
 if(id==='score'){
  const prob=sigmoid(w*x+b),points=Array.from({length:101},(_,i)=>{const v=-4+i*.08;return (40+i*4.6)+','+(180-sigmoid(w*v+b)*150);}).join(' ');
  return <div className="bank-demo bank-function"><div><Range label="系数 w" min={-3} max={3} step={.1} value={w} onChange={setW}/><Range label="偏置 b" min={-4} max={4} step={.1} value={b} onChange={setB}/><Range label="输入 x" min={-4} max={4} step={.1} value={x} onChange={setX}/><p><code>z = {w} × {x} + {b} = {(w*x+b).toFixed(2)}</code></p><strong>p = {prob.toFixed(3)}</strong></div><svg viewBox="0 0 540 230" role="img" aria-label={'Sigmoid 曲线，当前概率 '+prob.toFixed(3)}><path d="M40 25V180H510" className="axis"/><path d="M40 105H500" className="guide"/><polyline points={points} className="train-line"/><circle cx={40+(x+4)*57.5} cy={180-prob*150} r="6" className="point"/><text x="15" y="36">1</text><text x="9" y="110">0.5</text><text x="20" y="185">0</text><text x="36" y="208">−4</text><text x="265" y="208">0</text><text x="495" y="208">4</text><text x="255" y="228">输入 x</text></svg></div>;
 }
 if(id==='loss'){
  const loss=-(y*Math.log(p)+(1-y)*Math.log(1-p)),points=Array.from({length:99},(_,i)=>{const v=(i+1)/100;return (40+v*460)+','+(185-(-(y*Math.log(v)+(1-y)*Math.log(1-v)))*32);}).join(' ');
  return <div className="bank-demo bank-function"><div><label className="bank-label">真实标签 y<select value={y} onChange={e=>setY(Number(e.target.value))}><option value={1}>1 · 实际订阅</option><option value={0}>0 · 实际未订阅</option></select></label><Range label="预测概率 p" min={.01} max={.99} value={p} onChange={setP}/><strong>单条损失 {loss.toFixed(3)}</strong><p>试着把 p 拖向“自信但错误”的一端。</p></div><svg viewBox="0 0 540 230" role="img" aria-label={'交叉熵曲线，当前损失 '+loss.toFixed(3)}><path d="M40 25V185H510" className="axis"/><polyline points={points} className="valid-line"/><circle cx={40+p*460} cy={185-loss*32} r="6" className="point"/><text x="15" y="190">0</text><text x="15" y="62">4</text><text x="35" y="210">0</text><text x="495" y="210">1</text><text x="236" y="228">预测概率 p</text></svg></div>;
 }
 if(id==='features')return <div className="bank-demo"><small>示例词表 · 实际模型的类别来自训练集</small><label className="bank-label">职业<select value={job} onChange={e=>setJob(e.target.value)}>{['student','management','services','new-job'].map(j=><option key={j}>{j}</option>)}</select></label><div className="bank-encoding">{['management','services','student'].map(j=><div key={j}><span>{j}</span><b>{j===job?1:0}</b></div>)}</div><p>{job==='new-job'?'词表中没有这个类别，所以整组为 0。':'只有对应的那一列为 1，没有人为大小顺序。'}</p></div>;
 return null;
}
function useOperation(){
 const [phase,setPhase]=useState(''),[error,setError]=useState(''),[history,setHistory]=useState([]);
 const job=useRef(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;job.current?.cancel();};},[]);
 async function start(request){
  if(job.current)return null;setError('');setHistory([]);setPhase('正在准备运行…');
  try{
   job.current=runBank(request,m=>{if(!alive.current)return;if(m.type==='phase')setPhase(m.message);else if(m.type==='progress')setHistory(h=>[...h,m.entry]);});
   const response=await job.current.promise;if(!alive.current)return null;
   if(response.error)setError(response.error);return response.result||null;
  }catch(e){if(alive.current)setError(e.message);return null;}
  finally{job.current=null;if(alive.current)setPhase('');}
 }
 return {phase,error,history,start,cancel:()=>job.current?.cancel()};
}
export function LossChart({history}){
 if(!history?.length)return <div className="bank-chart-empty"><Icon name="ChartNoAxesCombined" size={28}/><p>训练开始后，在这里看到实际损失曲线。</p></div>;
 const max=Math.max(.1,...history.flatMap(h=>[h.train,h.valid]))*1.08,end=Math.max(1,history.at(-1).epoch);
 const points=key=>history.map(h=>(45+h.epoch/end*490)+','+(208-h[key]/max*170)).join(' ');
 return <figure className="bank-chart"><svg viewBox="0 0 570 250" role="img" aria-label={'训练和验证损失，已运行 '+history.at(-1).epoch+' 轮'}><path className="axis" d="M45 30V208H540"/>{[0,.5,1].map(r=><g key={r}><path className="guide" d={'M45 '+(208-r*170)+'H540'}/><text x="2" y={212-r*170}>{(max*r).toFixed(2)}</text></g>)}<polyline className="train-line" points={points('train')}/><polyline className="valid-line" points={points('valid')}/><text x="43" y="232">0</text><text x="520" y="232">{end}</text><text x="258" y="248">训练轮数</text></svg><figcaption><span><i className="train-key"/>训练损失</span><span><i className="valid-key"/>验证损失</span><small>交叉熵，不含 L2 · 越低越好</small></figcaption></figure>;
}
export function Training({record,patch}){
 const initialRun=record.runs?.find(r=>r.id===record.selected)||record.runs?.at(-1);
 const [config,setConfig]=useState(()=>initialRun?{...initialRun.config}:{lr:.3,l2:.01,epochs:150,categorical:true}),op=useOperation(),runs=record.runs||[],selected=runs.find(r=>r.id===record.selected)||runs.at(-1);
 const hypothesis=record.hypothesis||'';
 async function train(){
  const snapshot={...config},hyp=hypothesis.trim();
  const run=await op.start({action:'train',config:snapshot});if(!run)return;
  const result={...run,id:crypto.randomUUID(),at:Date.now(),hypothesis:hyp,datasetSha256:DATA_SHA};
  patch(r=>({...r,runs:[...(r.runs||[]),result].slice(-4),selected:result.id,frozen:null,report:null}));
 }
 function choose(id){const chosen=runs.find(r=>r.id===id);if(!chosen)return;setConfig({...chosen.config});patch(r=>({...r,selected:id,hypothesis:chosen.hypothesis,frozen:null,report:null}));}
 return <section className="bank-workbench" aria-label="模型训练工作台"><div className="bank-workbench-heading"><div><small>UCI BANK MARKETING</small><h2>实验工作台</h2></div><span className="bank-badge">Python + NumPy · 本地计算</span></div><div className="bank-training-grid"><div className="bank-configuration"><label className="bank-label">这次要验证的假设<textarea value={hypothesis} maxLength={6000} disabled={!!op.phase} onChange={e=>setField(patch,'hypothesis',e.target.value)} placeholder="例如：只关闭类别输入，验证损失会升高。"/></label><label className="bank-label">输入特征<select disabled={!!op.phase} value={config.categorical?'all':'numeric'} onChange={e=>setConfig(c=>({...c,categorical:e.target.value==='all'}))}><option value="all">3 个数值字段 + 6 个类别字段</option><option value="numeric">仅 3 个数值字段</option></select></label><Range label="学习率 η" min={.01} max={1} value={config.lr} disabled={!!op.phase} onChange={lr=>setConfig(c=>({...c,lr}))}/><Range label="训练轮数" min={10} max={400} step={10} value={config.epochs} disabled={!!op.phase} onChange={epochs=>setConfig(c=>({...c,epochs}))}/><Range label="L2 系数 λ" min={0} max={.2} step={.005} value={config.l2} disabled={!!op.phase} onChange={l2=>setConfig(c=>({...c,l2}))}/><button className="primary" disabled={!!op.phase||hypothesis.trim().length<10} onClick={train}><Icon name="Play" size={17}/>{op.phase?'实验运行中':'开始训练'}</button>{op.phase?<button className="text-button" onClick={op.cancel}>停止运行</button>:<small>先写至少 10 字的假设。离开本节会停止运行。</small>}</div><div className="bank-training-output"><p role="status">{op.phase|| (selected?'当前显示：'+new Date(selected.at).toLocaleTimeString('zh-CN')+' 的实验':'尚未运行 · 首次加载约 15 MB 的运行环境')}</p><LossChart history={op.phase?op.history:selected?.history}/>{selected&&!op.phase&&<><div className="bank-run-summary"><span>基线验证损失<b>{decimal(evaluate(selected.predictions.map(p=>({...p,p:selected.trainRate}))).logloss)}</b></span><span>模型验证损失<b>{decimal(evaluate(selected.predictions).logloss)}</b></span><span>输入维度<b>{selected.weights.length}</b></span></div><small>训练 {selected.counts.train} / 验证 {selected.counts.valid} / 测试 {selected.counts.test} 条 · 本次计算 {selected.seconds.toFixed(2)} 秒（不含加载）</small><p className="bank-muted">这些是当前实验的最后一轮结果。验证表现不好也会如实保存。</p></>}{op.error&&<p role="alert" className="error-text">{op.error}</p>}</div></div>
 <div className="bank-table-wrap"><table><caption>最近四次实验 · 点击选择，后续决策使用这一版</caption><thead><tr><th>版本</th><th>输入</th><th>η / λ / 轮数</th><th>验证损失</th><th>假设</th></tr></thead><tbody>{runs.map((r,i)=><tr key={r.id} className={r.id===selected?.id?'selected':''}><td><button className="text-button" disabled={!!op.phase} aria-pressed={r.id===selected?.id} onClick={()=>choose(r.id)}>{r.id===selected?.id?'✓ ':''}实验 {i+1}</button></td><td>{r.config.categorical?'数值 + 类别':'仅数值'}</td><td>{r.config.lr} / {r.config.l2} / {r.config.epochs}</td><td>{decimal(evaluate(r.predictions).logloss)}</td><td>{r.hypothesis}</td></tr>)}</tbody></table>{!runs.length&&<p className="bank-muted">还没有实验记录。</p>}</div>
 <label className="bank-label">对照结论<textarea value={record.comparison||''} maxLength={6000} onChange={e=>setField(patch,'comparison',e.target.value)} placeholder="只改变了什么？两次验证损失是多少？结果是否支持原先的假设？"/></label><p className="bank-muted">{controlledPair(runs)?'已有单因素对照，请解释差异。':'完成两次实验，其中一对只改变一个设置，才算完成本节实验要求。'} 最近四次之外的实验请先导出备份。</p><details className="bank-detail"><summary>实际训练代码与数据约定</summary><pre>{'z = X @ w + b\np = sigmoid(z)\ngrad_w = X.T @ (p - y) / len(y) + l2 * w\ngrad_b = (p - y).mean()\nw -= lr * grad_w\nb -= lr * grad_b'}</pre><p>九个候选字段组成分组，按固定 SHA-256 规则切分。预处理只拟合训练集。保存最后一轮参数，不做自动早停。</p><a href="./learning/bank/model.py" download>下载本页实际执行的完整 Python 脚本</a></details></section>;
}
export function Decision({record,patch}){
 const run=record.runs?.find(r=>r.id===record.selected)||record.runs?.at(-1),policy=record.policy||{threshold:.5,fpCost:1,fnCost:5},op=useOperation(),[filter,setFilter]=useState('fn');
 if(!run)return <div className="bank-empty"><Icon name="FlaskConical" size={28}/><h3>先训练一版模型</h3><p>决策工作台会读取你自己的验证分数。</p><a className="primary" href={courseHref('train')}>前往训练</a></div>;
 const value=evaluate(run.predictions,policy),rows=run.predictions.filter(r=>(r.y?(r.p>=policy.threshold?'tp':'fn'):(r.p>=policy.threshold?'fp':'tn'))===filter).sort((a,b)=>Math.abs(a.p-policy.threshold)-Math.abs(b.p-policy.threshold)),frozen=record.frozen;
 function change(key,v){patch(r=>({...r,policy:{...policy,[key]:v},frozen:null,report:null}));}
 async function test(){
  const snapshot=record.frozen,exploratory=!!record.testSeen;
  patch(r=>({...r,testSeen:true}));
  const result=await op.start({action:'test',frozen:snapshot});if(!result)return;
  patch(r=>({...r,report:{metrics:result.metrics,frozenAt:snapshot.at,at:Date.now(),exploratory}}));
 }
 return <section className="bank-workbench" aria-label="决策工作台"><div className="bank-workbench-heading"><div><small>VALIDATION → FREEZE → TEST</small><h2>用自己的模型做决定</h2></div><span className="bank-badge">验证数据 · {run.counts.valid} 条</span></div><p>模型：{run.config.categorical?'数值 + 类别':'仅数值'} · η {run.config.lr} · λ {run.config.l2} · {run.config.epochs} 轮。<a href={courseHref('train')}>更换实验版本</a></p><div className="bank-decision-grid"><div><Range label="选中阈值" value={policy.threshold} onChange={v=>change('threshold',v)} disabled={!!op.phase}/><Range label="每个误报的假设成本" value={policy.fpCost} max={20} step={1} onChange={v=>change('fpCost',v)} disabled={!!op.phase}/><Range label="每个漏报的假设成本" value={policy.fnCost} max={20} step={1} onChange={v=>change('fnCost',v)} disabled={!!op.phase}/><p className="bank-cost">验证假设损失 <b>{value.cost}</b><small>FP × {policy.fpCost} + FN × {policy.fnCost}</small></p></div><div><Confusion value={value} selected={filter} onSelect={setFilter}/><Metrics value={value}/></div></div><div className="bank-table-wrap"><table><caption>{filter.toUpperCase()} 样本 · 共 {rows.length} 条，展示离阈值最近的前 8 条</caption><thead><tr><th>原始行号</th><th>年龄</th><th>余额</th><th>过往联系次数</th><th>真实 y</th><th>预测 p</th></tr></thead><tbody>{rows.slice(0,8).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.age}</td><td>{r.balance}</td><td>{r.previous}</td><td>{r.y}</td><td>{r.p.toFixed(4)}</td></tr>)}</tbody></table>{!rows.length&&<p className="bank-muted">这个格子暂时没有记录。可以选择其他格子。</p>}</div><label className="bank-label">错误分析与选择理由<textarea value={record.notes?.decision||''} maxLength={6000} onChange={e=>setNote(patch,'decision',e.target.value)} placeholder="记一个行号；解释误报或漏报。为什么选择这个阈值与成本？"/></label><div className="bank-freeze"><div><h3>{frozen?'方案已冻结':'准备最终验收'}</h3><p>{record.testSeen?'你已启动过测试评估。再次运行会标为探索复测。':'冻结后再打开测试，测试结果不用于本轮调参。'} 改动模型或决策设置会解除冻结。</p></div><button className="secondary" disabled={!!op.phase||(record.notes?.decision?.trim().length||0)<20} onClick={()=>patch(r=>({...r,frozen:{run,policy:{...policy},at:Date.now(),datasetSha256:DATA_SHA},report:null}))}>冻结当前方案</button><button className="primary" disabled={!frozen||!!op.phase||!!record.report} onClick={test}>{op.phase?'正在验收…':'运行最终测试'}</button>{op.phase&&<button className="text-button" onClick={op.cancel}>停止</button>}<small>先写至少 20 字的选择理由，再冻结。</small></div>{op.phase&&<p role="status">{op.phase}</p>}{op.error&&<p role="alert" className="error-text">{op.error}</p>}{record.report&&<div className="bank-test-report"><small>{record.report.exploratory?'探索复测 · 不是新的独立验收':'冻结方案的首次测试报告'}</small><h3>测试结果已保存</h3><Metrics value={record.report.metrics}/><p>测试损失 {decimal(record.report.metrics.logloss)} · 假设成本 {record.report.metrics.cost} · 样本 {record.report.metrics.n} 条</p><Confusion value={record.report.metrics}/><a className="text-button" href={courseHref('handoff')}>查看交付与下载<Icon name="ArrowRight" size={16}/></a></div>}</section>;
}
export function downloadJSON(value,name){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function Handoff({record,patch}){
 return <section className="bank-workbench"><h2>你的实验交付</h2><label className="bank-label">写给下一位同事<textarea className="bank-report-input" maxLength={6000} value={record.notes?.handoff||''} onChange={e=>setNote(patch,'handoff',e.target.value)} placeholder="任务与边界 → 两次实验 → 决策理由 → 测试结果 → 失败例子 → 下一步。至少 100 字，不按关键词自动评分。"/></label><p className="bank-muted">{record.notes?.handoff?.trim().length||0} 字 · 文字只保存，不由 AI 自动打分。</p><div className="bank-downloads"><a className="secondary" href="./learning/bank/nicoding-bank-lab.zip" download><Icon name="Download" size={17}/>下载完整本地实验包</a><button className="primary" disabled={!record.frozen||!record.report} onClick={()=>downloadJSON({...record.frozen,report:record.report,writeup:record.notes?.handoff||'',comparison:record.comparison||''},'nicoding-bank-frozen.json')}><Icon name="Download" size={17}/>导出冻结记录与报告</button></div><details className="bank-detail"><summary>在自己的电脑复算</summary><p>先解压实验包，把导出的 JSON 放进同一文件夹。使用 Python 3.10 以上版本，在该目录的终端执行：</p><pre>{'python -m pip install -r requirements.txt\npython model.py --output experiment.json\npython model.py --evaluate nicoding-bank-frozen.json --output test-report.json'}</pre><p>第一条安装 NumPy；第二条从零训练默认设置；第三条使用你在网页冻结的权重与规则，重新计算测试结果。跨运行平台可能有很小的浮点差异。</p></details><p className="bank-muted">完整学习进度请到右上角“设置与进度备份”导出。浏览器数据不是云账号同步。</p></section>;
}
