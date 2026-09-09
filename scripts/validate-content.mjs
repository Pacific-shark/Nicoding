import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {lessons,byId,domains,projects} from '../src/data/index.js';
import {paths,placements,reasons,extensions,branches} from '../src/data/paths.js';
import {depth} from '../src/data/depth.js';
import {miniProjects} from '../src/data/mini-projects.js';
const fail=[];
const pathIds=Object.values(paths).flatMap(p=>p.ids);
if(pathIds.length!==lessons.length||new Set(pathIds).size!==lessons.length||lessons.some(l=>!pathIds.includes(l.id)))fail.push('路径必须恰好覆盖全部课程一次');
const branchIds=branches.flatMap(b=>b.domains);
if(new Set(branchIds).size!==domains.length||branchIds.length!==domains.length)fail.push('分支必须覆盖所有领域一次');
for(const [id,p] of Object.entries(paths)){
 if(!projects.some(project=>project.id===p.project))fail.push(`无效路线项目:${id}`);
 for(const c of p.chapters)if(!c.ids.length||!c.reason||!c.outcome)fail.push(`阶段解释不全:${id}`);
 for(const lessonId of p.ids){
  const l=byId[lessonId],guide=depth[lessonId];
  if(!l||l.domain!==id){fail.push(`课程领域错位:${lessonId}`);continue;}
  if(!reasons[lessonId]||!guide?.plain||guide.steps?.length<3||!guide.question||!guide.answer||!guide.teach||guide.checks?.length!==3)fail.push(`深度学习材料不全:${lessonId}`);
  for(const prerequisite of l.prereqs)if(byId[prerequisite]?.domain===id&&placements[prerequisite].index>=placements[lessonId].index)fail.push(`推荐顺序与先修冲突:${lessonId}->${prerequisite}`);
  for(const extension of extensions[lessonId]||[])if(!byId[extension]||extension===lessonId||l.prereqs.includes(extension))fail.push(`无效延伸:${lessonId}->${extension}`);
 }
}
function ancestors(id,seen=new Set()){if(seen.has(id))return seen;seen.add(id);for(const p of byId[id]?.prereqs||[])ancestors(p,seen);return seen;}
for(const id of paths.llm.ids.slice(0,6))if([...ancestors(id)].some(p=>/^(dl|rl)-/.test(p)))fail.push(`AI应用入门意外依赖算法进阶:${id}`);
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
for(const p of miniProjects){
 if(p.tests.length<3||!p.starter||!p.solution||!p.stretch)fail.push(`小项目不完整:${p.id}`);
 if(p.lang==='javascript'){
  const run=code=>new vm.Script(code+'\n'+p.tests.join('\n')).runInNewContext({console:{log:()=>{}},assert:(ok)=>{if(!ok)throw Error('assertion failed');}},{timeout:1000});
  try{run(p.solution);}catch(e){fail.push(`小项目解法失败:${p.id}:${e.message}`);}
  let caught=false;try{run(p.starter);}catch{caught=true;}if(!caught)fail.push(`小项目未捕获未实现逻辑:${p.id}`);
 }
}
fs.mkdirSync('work',{recursive:true});
fs.writeFileSync('work/python-cases.json',JSON.stringify([...lessons.filter(l=>l.lang==='python'),...miniProjects.filter(p=>p.lang==='python').map(p=>({id:p.id,code:p.solution,challenge:{solution:p.solution,starter:p.starter,tests:p.tests}}))]));
const python=process.env.NICODING_PYTHON||(process.platform==='win32'?'python':'python3');
const pyResult=spawnSync(python,['scripts/validate-python.py'],{encoding:'utf8',timeout:60000});
if(pyResult.status!==0)fail.push(pyResult.stdout||pyResult.stderr||'Python校验没有完成');
const result={lessons:lessons.length,paths:Object.keys(paths).length,depthGuides:Object.keys(depth).length,miniProjects:miniProjects.length,miniProjectChecks:miniProjects.reduce((n,p)=>n+p.tests.length,0),quizQuestions:lessons.reduce((n,l)=>n+l.quiz.length,0),challenges:lessons.filter(l=>l.challenge).length,assertions:lessons.reduce((n,l)=>n+(l.challenge?.tests.length||0),0),sources:new Set(lessons.flatMap(l=>l.sources.map(s=>s.url))).size,errors:fail};
fs.writeFileSync('work/content-validation.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(fail.length)process.exit(1);
