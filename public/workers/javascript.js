const format = value => typeof value === 'string' ? value : value === undefined ? 'undefined' : (()=>{try{return JSON.stringify(value);}catch{return String(value);}})();
self.onmessage = async ({data}) => {
 const lines=[];
 const print=(...args)=>{if(lines.join('\n').length<16000) lines.push(args.map(format).join(' ').slice(0,4000));};
 const logger={log:print,error:print,warn:print,info:print};
 const assert=(condition,message='断言未通过')=>{if(!condition) throw new Error(message);};
 const testCode = (data.tests||[]).map(t=>`try { ${t}\n __checks.push({ok:true}); } catch(__error){ __checks.push({ok:false,error:String(__error.message)}); }`).join('\n');
 try {
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const run = new AsyncFunction('console','assert',`${data.code}\n;await Promise.resolve();\nconst __checks=[];\n${testCode}\nreturn __checks;`);
  const checks=await run(logger,assert);
  self.postMessage({type:'result',ok:checks.every(c=>c.ok),output:lines.join('\n'),checks});
 } catch(e) {self.postMessage({type:'result',ok:false,output:lines.join('\n'),error:String(e.stack||e.message).slice(0,4000),checks:[]});}
};
self.postMessage({type:'ready'});
