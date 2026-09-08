import React,{useMemo,useRef} from 'react';
const tokenizer=/(#[^\n]*|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|return|if|else|elif|for|in|import|from|try|except|raise|with|as|while|pass|class|lambda|and|or|not|is|None|True|False|const|let|function|async|await|new|throw|typeof|null|undefined|true|false)\b|\b\d+(?:\.\d+)?\b)/g;
export default function CodeInput({code,onChange,busy=false}) {
 const highlight=useRef(),numbers=useRef();
 const tokens=useMemo(()=>code.split(tokenizer).map((part,i)=>{
  let type='';
  if(part.startsWith('#')||part.startsWith('//'))type='comment';
  else if(part.startsWith('"')||part.startsWith("'"))type='string';
  else if(/^\d/.test(part))type='number';
  else if(/^(def|return|if|else|elif|for|in|import|from|try|except|raise|with|as|while|pass|class|lambda|and|or|not|is|None|True|False|const|let|function|async|await|new|throw|typeof|null|undefined|true|false)$/.test(part))type='keyword';
  return <span key={i} className={type?'syntax-'+type:undefined}>{part}</span>;
 }),[code]);
 function indent(e){if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd;onChange(code.slice(0,start)+'    '+code.slice(end));requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=start+4;});}}
 return <div className="code-body"><div className="line-gutter"><pre className="line-numbers" aria-hidden="true" ref={numbers}>{code.split('\n').map((_,i)=>i+1).join('\n')}</pre></div><div className="code-input-area"><pre ref={highlight} className="code-highlight" aria-hidden="true">{tokens}{'\n'}</pre><textarea disabled={busy} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-label="代码编辑器" value={code} onChange={e=>onChange(e.target.value)} onKeyDown={indent} onScroll={e=>{highlight.current.scrollTop=e.currentTarget.scrollTop;highlight.current.scrollLeft=e.currentTarget.scrollLeft;numbers.current.style.transform=`translateY(-${e.currentTarget.scrollTop}px)`;}}/></div></div>;
}
