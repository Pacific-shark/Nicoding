export function execute(lang,code,tests,onPhase) {
 let worker,timer,settled=false,resolveResult;
 const promise=new Promise(resolve=>{
  resolveResult=resolve;
  const finish=result=>{if(settled)return;settled=true;clearTimeout(timer);worker?.terminate();resolve(result);};
  try {worker=new Worker(new URL(`workers/${lang}.js`,document.baseURI),{type:'module'});}catch(e){finish({ok:false,error:e.message});return;}
  onPhase?.(lang==='python'?'正在准备本地 Python…':'正在准备运行…');
  timer=setTimeout(()=>finish({ok:false,error:'运行时准备超时。请检查本地文件是否完整，再试一次。'}),60000);
  worker.onmessage=({data})=>{
   if(data.type==='ready') {
    clearTimeout(timer);onPhase?.('正在运行…');
    timer=setTimeout(()=>finish({ok:false,error:'运行超过 5 秒，已停止。请检查循环是否能结束，或缩小实验规模。'}),5000);
    worker.postMessage({code,tests});
   } else if(data.type==='init-error') finish({ok:false,error:`运行时未能启动：${data.error}`});
   else if(data.type==='result') finish(data);
  };
  worker.onerror=e=>{e.preventDefault();finish({ok:false,error:e.message||'工作线程未能运行。'});};
 });
 return {promise,cancel:()=>{if(!settled){settled=true;clearTimeout(timer);worker?.terminate();resolveResult({ok:false,error:'本次运行已停止。'});}}};
}
