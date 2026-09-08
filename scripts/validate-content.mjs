import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {lessons,byId,domains,projects} from '../src/data/index.js';
const fail=[];
if(new Set(lessons.map(l=>l.id)).size!==lessons.length)fail.push('重复课程ID');
const visiting=new Set(),seen=new Set();
function visit(id){if(visiting.has(id)){fail.push(`先修循环:${id}`);return;}if(seen.has(id))return;visiting.add(id);for(const p of byId[id]?.prereqs||[])if(byId[p])visit(p);else fail.push(`缺失先修:${id}->${p}`);visiting.delete(id);seen.add(id);}
for(const l of lessons){
 visit(l.id);
 if(!domains.some(d=>d.id===l.domain))fail.push(`未知领域:${l.id}`);
 if(l.parts.length<2||l.quiz.length<2||!l.code||!l.prediction||!l.transfer||!l.sources.length)fail.push(`内容不全:${l.id}`);
 for(const q of l.quiz)if(q.options.length!==q.explanations.length||!q.options[q.correct])fail.push(`测验无效:${l.id}`);
 for(const s of l.sources)if(!s.url.startsWith('https://'))fail.push(`来源URL无效:${l.id}`);
 if(l.challenge&&l.challenge.tests.length<3)fail.push(`挑战验证不足:${l.id}`);
 if(l.lang==='javascript'){
  async function run(code,tests=[]){const context=vm.createContext({console:{log:()=>{}},assert:(ok,msg)=>{if(!ok)throw Error(msg||'assertion failed');}});return await new vm.Script(`(async()=>{${code}\n${tests.join('\n')}\n})()`).runInContext(context,{timeout:1000});}
  try{await run(l.code);}catch(e){fail.push(`${l.id} 示例失败:${e.message}`);}
  if(l.challenge){try{await run(l.challenge.solution,l.challenge.tests);}catch(e){fail.push(`${l.id} 解法失败:${e.message}`);}let failed=false;try{await run(l.challenge.starter,l.challenge.tests);}catch{failed=true;}if(!failed)fail.push(`${l.id} 原始错误未被测试发现`);}
 }
}
for(const p of projects)for(const id of p.skills)if(!byId[id])fail.push(`项目先修无效:${p.id}/${id}`);
fs.mkdirSync('work',{recursive:true});
fs.writeFileSync('work/python-cases.json',JSON.stringify(lessons.filter(l=>l.lang==='python')));
const python=process.env.NICODING_PYTHON||(process.platform==='win32'?'python':'python3');
const pyResult=spawnSync(python,['scripts/validate-python.py'],{encoding:'utf8',timeout:60000});
if(pyResult.status!==0)fail.push(pyResult.stdout||pyResult.stderr||'Python校验没有完成');
const result={lessons:lessons.length,quizQuestions:lessons.reduce((n,l)=>n+l.quiz.length,0),challenges:lessons.filter(l=>l.challenge).length,assertions:lessons.reduce((n,l)=>n+(l.challenge?.tests.length||0),0),sources:new Set(lessons.flatMap(l=>l.sources.map(s=>s.url))).size,errors:fail};
fs.writeFileSync('work/content-validation.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(fail.length)process.exit(1);
