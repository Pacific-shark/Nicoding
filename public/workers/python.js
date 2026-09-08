import {loadPyodide} from '../runtime/pyodide/pyodide.mjs';
let lines = [];
function write(line) { if(lines.join('\n').length < 16000) lines.push(String(line).slice(0,4000)); }
try {
 const py = await loadPyodide({indexURL:new URL('../runtime/pyodide/',import.meta.url).href,stdout:write,stderr:write});
 self.postMessage({type:'ready'});
 self.onmessage = async ({data}) => {
  lines = [];
  const globals = py.toPy({__name__:'__main__'});
  try {
   if (/\b(?:import\s+sqlite3|from\s+sqlite3)\b/.test(data.code)) await py.loadPackage('sqlite3',{messageCallback:()=>{},errorCallback:write});
   const result = await py.runPythonAsync(data.code,{globals});
   result?.destroy?.();
   const checks = [];
   for(const test of data.tests||[]) {
    try { const value = await py.runPythonAsync(test,{globals}); value?.destroy?.(); checks.push({ok:true}); }
    catch(e) {checks.push({ok:false,error:String(e.message).slice(-1500)});}
   }
   self.postMessage({type:'result',ok:checks.every(c=>c.ok),output:lines.join('\n'),checks});
  } catch(e) {self.postMessage({type:'result',ok:false,output:lines.join('\n'),error:String(e.message).slice(-4000),checks:[]});}
  finally {globals.destroy();}
 };
} catch(e) {self.postMessage({type:'init-error',error:String(e.message)});}
