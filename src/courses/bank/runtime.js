export function runBank(request,onMessage){
 const worker=new Worker(new URL('workers/bank.js',document.baseURI),{type:'module'});
 let finish,settled=false;
 const promise=new Promise(resolve=>{finish=result=>{if(settled)return;settled=true;clearTimeout(timer);worker.terminate();resolve(result);};});
 const timer=setTimeout(()=>finish({error:'运行超过 120 秒，已停止。可以重试，或下载实验包在电脑上运行。'}),120000);
 worker.onmessage=({data})=>{if(data.type==='result')finish({result:data.result});else if(data.type==='error')finish({error:data.error});else onMessage(data);};
 worker.onerror=event=>finish({error:event.message||'Python 环境加载失败，请检查网络后重试。'});
 worker.postMessage(request);
 return {promise,cancel:()=>finish({error:'已停止，本次未保存实验。'})};
}
