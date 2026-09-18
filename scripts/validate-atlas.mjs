import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {knowledge,knowledgeById} from '../src/atlas/knowledge.js';
import {topics,topicById,reportedStages} from '../src/atlas/topics.js';
import {chapters,chapterById,sources,sourceUrl} from '../src/atlas/catalog.js';
import {lessons,projects} from '../src/data/index.js';
import {empty,validateImport} from '../src/state.js';

assert.equal(new Set(knowledge.map(k=>k.id)).size,knowledge.length,'unique knowledge IDs');
assert.equal(new Set(topics.map(t=>t.id)).size,topics.length,'unique topic IDs');
const visited=new Set(),active=new Set();
function visit(id){
 assert(knowledgeById[id],`missing prerequisite ${id}`);
 assert(!active.has(id),`prerequisite cycle at ${id}`);
 if(visited.has(id))return;
 active.add(id);knowledgeById[id].prereqs.forEach(visit);active.delete(id);visited.add(id);
}
for(const k of knowledge){
 visit(k.id);assert(chapterById[k.domain],`domain ${k.id}`);
 assert(k.parts.length>=2&&k.code&&k.prediction&&k.pitfalls.length&&k.sources.length,`incomplete ${k.id}`);
 for(const [title,body] of k.parts)assert(title&&body.trim(),`empty explanation ${k.id}`);
 for(const q of k.quiz){assert(q.options.length===q.explanations.length&&q.options[q.correct],`quiz ${k.id}`);}
 for(const s of k.sources)assert(new URL(s.url).protocol==='https:',`source ${k.id}`);
}
for(const c of chapters)assert(topics.filter(t=>t.chapter===c.id).length>=2,`chapter needs multiple topics: ${c.id}`);
for(const t of topics){
 assert(chapterById[t.chapter]&&t.scope&&t.deliver&&t.data&&t.environment,`topic opening ${t.id}`);
 assert(t.stages.length>=3,`topic stages ${t.id}`);
 if(t.practice)assert(projects.some(p=>p.id===t.practice),`practice destination ${t.id}`);
 const chain=new Set([t.id]);let parent=t.after;
 while(parent){assert(topicById[parent],`unknown previous topic ${parent}`);assert(!chain.has(parent),`topic cycle ${t.id}`);chain.add(parent);parent=topicById[parent].after;}
 for(const id of t.knowledge)assert(knowledgeById[id],`topic knowledge ${t.id}/${id}`);
 for(const s of t.stages){
  assert(s.brief&&s.actions.length>=2&&s.checks.length>=2&&s.knowledge.length,`stage ${t.id}/${s.title}`);
  for(const id of s.knowledge)assert(knowledgeById[id],`stage knowledge ${t.id}/${id}`);
  if(s.file)assert(sources[t.source]?.files.includes(s.file),`unreviewed source ${t.id}/${s.file}`);
 }
 if(t.extraSource)assert(sources[t.extraSource[0]].files.includes(t.extraSource[1]));
}
for(const [id,s] of Object.entries(sources)){assert(/^[a-f0-9]{40}$/.test(s.sha));assert(s.reviewed&&s.files.length);assert(sourceUrl(id).endsWith(s.sha));}

// Previously exported files must survive the new curriculum, including real model runs.
const state=empty();state.lessons['py-values']={completed:123,due:456,assisted:false};
state.notes['py-values']='旧笔记';state.notes['dl-autograd']='共享变量的两条路径贡献必须累加。';
state.lessons['dl-autograd']={completed:124,due:457};state.drafts['py-values']='print(1)';
state.courses['bank-first-model']={version:1,read:{brief:true},notes:{brief:'既有项目记录'}};
state.studies.micrograd={last:2,stages:{0:{note:'我用中心差分检查 x=3 的导数，两条乘法路径加上一条直接路径得到 7。',checks:[0,1]},2:{note:'正在检查拓扑顺序',checks:[1]}}};
state.lastTopic='micrograd';
const restored=validateImport(JSON.parse(JSON.stringify(state)));
assert.equal(restored.notes['py-values'],'旧笔记');assert.equal(restored.lessons['dl-autograd'].completed,124);
assert.equal(restored.courses['bank-first-model'].read.brief,true);
assert.equal(restored.studies.micrograd.last,2);assert.equal(restored.studies.micrograd.stages[2].note,'正在检查拓扑顺序');
assert.equal(reportedStages(topicById.micrograd,restored),1);
const old=validateImport({version:1,lessons:{'py-values':{visited:5}},notes:{'py-values':'旧版'}});
assert.equal(old.notes['py-values'],'旧版');assert.deepEqual(old.studies,{});
const malformed=validateImport(JSON.parse('{"version":1,"lessons":{"constructor":{},"__proto__":{}},"last":"constructor","lastTopic":"constructor","studies":{"constructor":{},"__proto__":{},"unknown":{},"micrograd":{"last":999,"stages":{"0":{"note":44,"checks":[0,0,999,-1,"1"]},"999":{}}}}}'));
assert.equal(malformed.last,'py-values');assert.equal(malformed.lastTopic,null);
assert.deepEqual(malformed.lessons,{});assert.deepEqual(malformed.studies.micrograd.stages[0],{note:'',checks:[0]});
assert.equal(malformed.studies.micrograd.last,0);

// Execute every new standalone Python example, then check independent numerical expectations.
const additions=knowledge.filter(k=>!lessons.some(l=>l.id===k.id));
const py=`import sys,json,io,contextlib,traceback
results={}
for item in json.load(sys.stdin):
    output=io.StringIO()
    try:
        with contextlib.redirect_stdout(output): exec(compile(item['code'],item['id'],'exec'),{})
        results[item['id']]=output.getvalue().strip()
    except Exception: raise RuntimeError(item['id']+' '+traceback.format_exc())
print(json.dumps(results))`;
const result=spawnSync(process.env.NICODING_PYTHON||(process.platform==='win32'?'python':'python3'),['-c',py],{input:JSON.stringify(additions),encoding:'utf8',timeout:20000,env:{...process.env,PYTHONUTF8:'1'}});
assert.equal(result.status,0,result.stderr);
const output=JSON.parse(result.stdout);
const expected={
 'ml-preprocessing':'2.4495','ml-validation':'A 0.82 0.02\nB 0.82 0.1',
 'ml-knn':'1 B\n3 A','ml-calibration':'0.75\n0.19','ml-interpret':'0.08',
 'dl-mlp':'26\n[0, 0, 3]','dl-vae':'0.5\n0.0\n0.096574',
 'dl-diffusion':'0.133975','rl-sac':'2.89\n1.0',
 'llm-retrieval-eval':'2 recall 0.5 precision 0.5\n4 recall 1.0 precision 0.5\nRR 0.5',
};
for(const [id,value] of Object.entries(expected))assert.equal(output[id],value,`numerical example ${id}`);
for(const k of additions)assert(output[k.id]?.trim(),`example emits no observation: ${k.id}`);
console.log(JSON.stringify({chapters:chapters.length,topics:topics.length,stages:topics.reduce((n,t)=>n+t.stages.length,0),knowledge:knowledge.length,newExamplesExecuted:additions.length,pinnedRepositories:Object.keys(sources).length,prerequisites:'acyclic',backupCompatibility:'passed',numericalChecks:'passed'},null,2));
