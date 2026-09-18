import {loadPyodide} from '../runtime/pyodide/pyodide.mjs';
const base=new URL('../learning/bank/',import.meta.url);
const expected='dc8d576e9bda0f41ee891251bd84bab9a39ce576cba715aac08adc2374a01fde';
async function get(file){const r=await fetch(new URL(file,base));if(!r.ok)throw new Error(`无法读取 ${file} (${r.status})`);return r;}
self.onmessage=async({data})=>{
 let globals;
 try{
  self.postMessage({type:'phase',message:'正在加载 Python 与 NumPy…'});
  const [py,csvResponse,sourceResponse]=await Promise.all([loadPyodide({indexURL:new URL('../runtime/pyodide/',import.meta.url).href}),get('bank.csv'),get('model.py')]);
  const bytes=await csvResponse.arrayBuffer();
  const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==expected)throw new Error('数据校验失败，请刷新后重试。');
  await py.loadPackage('numpy');
  globals=py.toPy({__name__:'nicoding_bank'});
  await py.runPythonAsync(await sourceResponse.text(),{globals});
  globals.set('_csv',new TextDecoder().decode(bytes));
  globals.set('_request',JSON.stringify(data));
  globals.set('_progress',entry=>self.postMessage({type:'progress',entry:JSON.parse(entry)}));
  self.postMessage({type:'phase',message:data.action==='train'?'正在执行梯度下降…':'正在评估冻结方案…'});
  const json=await py.runPythonAsync(`
request = json.loads(_request)
rows = load_rows(_csv)
if request['action'] == 'train':
    result = train(rows, request['config'], _progress)
else:
    frozen = request['frozen']
    policy = frozen['policy']
    result = test_run(rows, frozen['run'], policy['threshold'], policy['fpCost'], policy['fnCost'])
json.dumps(result)
`,{globals});
  self.postMessage({type:'result',result:JSON.parse(json)});
 }catch(error){self.postMessage({type:'error',error:String(error.message||error)});}
 finally{globals?.destroy();}
};
