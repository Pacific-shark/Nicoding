import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {referenceModes,referenceSnapshot,defaultCalls} from '../src/learning/reference-model.js';
import {referenceUnit,referenceTasks,unitSectionDone} from '../src/learning/reference-unit.js';
import {sanitizeUnits} from '../src/learning/progress.js';
import {empty,validateImport} from '../src/state.js';

const python=process.env.PYTHON||'python';
function runPython(script){const result=spawnSync(python,['-c',script],{encoding:'utf8',timeout:15000});if(result.error)throw result.error;assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);}
for(const [mode,definition] of Object.entries(referenceModes)){
 const script=`import json\nfrom copy import deepcopy\nnames = {}\nknown = {}\nheld = []\ndef capture():\n    objects = {}\n    def visit(value):\n        key = id(value)\n        if key not in known:\n            known[key] = chr(65 + len(known))\n            held.append(value)\n        label = known[key]\n        objects[label] = []\n        objects[label] = [{"ref": visit(item)} if isinstance(item, list) else item for item in value]\n        return label\n    bindings = {name: visit(names[name]) for name in ["a", "b"] if name in names}\n    return {"names": bindings, "objects": objects}\nsnapshots = [capture()]\nfor line in ${JSON.stringify(definition.lines)}:\n    exec(line, {"deepcopy": deepcopy}, names)\n    snapshots.append(capture())\nprint(json.dumps(snapshots))`;
 const snapshots=runPython(script);
 for(let step=0;step<=4;step++)assert.deepEqual(referenceSnapshot(mode,step),snapshots[step],`${mode} step ${step} differs from Python`);
}
const calls=['A','B','Nico'];
for(const fixed of [false,true]){
 const setup=fixed?'def collect(item, bag=None):\n    if bag is None: bag = []\n    bag.append(item)\n    return bag':'def collect(item, bag=[]):\n    bag.append(item)\n    return bag';
 const values=runPython(`import json\n${setup}\nprint(json.dumps([list(collect(item)) for item in ${JSON.stringify(calls)}]))`);
 assert.deepEqual(defaultCalls(fixed,calls),values);
}
for(const task of Object.values(referenceTasks)){
 const candidates=[['solution',task.solution,true],['starter',task.starter,false]];
 if(task.id==='collect')candidates.push(['falsey replacement',task.solution.replace('bag is None','not bag'),false]);
 else candidates.push(['over-copying',task.solution.replace('result = config.copy()','from copy import deepcopy\n    result = deepcopy(config)'),false]);
 for(const [name,code,shouldPass] of candidates){
  const script=`import json, io, contextlib\nns = {}\nfailures = []\nwith contextlib.redirect_stdout(io.StringIO()):\n    exec(${JSON.stringify(code)}, ns)\n    for test in ${JSON.stringify(task.tests.map(t=>t.code))}:\n        try: exec(test, ns)\n        except Exception as error: failures.append(str(error))\nprint(json.dumps(failures))`;
  const failures=runPython(script);
  assert.equal(failures.length===0,shouldPass,`${task.id}: ${name}: ${failures.join('; ')}`);
 }
}
const old={...empty(),notes:{'py-references':'旧笔记'},drafts:{'py-references':'旧代码'},lessons:{'py-references':{completed:123,due:456}},projects:{'mini-cart':{steps:[0],code:'return 0',activeTask:0}}};
delete old.units;
const restored=validateImport(old);
assert.equal(restored.notes['py-references'],'旧笔记');assert.equal(restored.drafts['py-references'],'旧代码');assert.equal(restored.lessons['py-references'].completed,123);assert.deepEqual(restored.units,{});
const record={version:1,chapter:5,observations:{binding:true,shallow:true,deep:true,'defaults-bug':true,'defaults-fixed':true},answers:Object.fromEntries(Object.entries({binding:1,copy:2,defaults:0,transfer:1}).map(([id,choice])=>[id,{choice,checked:true,correct:true,firstCorrect:false}])),tasks:Object.fromEntries(Object.entries(referenceTasks).map(([id,task])=>[id,{code:task.solution,hints:1,solutionSeen:true,result:{version:1,code:task.solution,verified:true,ok:true,checks:task.tests.map(()=>({ok:true})),output:'实际输出',at:789}}])),experiments:{binding:4,shallow:3,deep:4,copyMode:'deep',defaultMode:'fixed',bugCalls:['A','B'],fixedCalls:['A','B']},reflection:{text:'对象关系解释',checks:[0,1,2]}};
const roundtrip=validateImport({...restored,units:{'py-references':record}}).units['py-references'];
assert.equal(roundtrip.chapter,5);assert.equal(roundtrip.tasks.tag.result.output,'实际输出');assert.equal(roundtrip.tasks.tag.solutionSeen,true);assert.equal(roundtrip.answers.binding.firstCorrect,false);assert.equal(roundtrip.experiments.copyMode,'deep');assert.equal(unitSectionDone(roundtrip).every(Boolean),true);
const changed=structuredClone(roundtrip);changed.tasks.tag.code+='\n# 修改';assert.equal(unitSectionDone(changed)[5],false,'stale results cannot complete a task');
const bad=sanitizeUnits({'py-references':{version:1,chapter:99,answers:{binding:{choice:0,checked:true,correct:true}},reflection:{checks:[-1,0,0,3,'2']},experiments:{binding:900,copyMode:'invalid'}}})['py-references'];
assert.equal(bad.chapter,5);assert.equal(bad.answers.binding.correct,false);assert.deepEqual(bad.reflection.checks,[0]);assert.equal(bad.experiments.binding,4);
assert.deepEqual(sanitizeUnits({'py-references':{version:9}}),{});
assert.equal(referenceUnit.chapters.length,6);
const types=new Set(['text','detail','prediction','references','defaults','practice','code','reflection','project','completion']);
for(const chapter of referenceUnit.chapters)for(const block of chapter.blocks){assert(types.has(block.type));if(block.type==='prediction')assert(block.options[block.correct]);if(block.type==='practice')assert(referenceTasks[block.task]);}
console.log('Learning validation passed: 15 graph snapshots vs Python; both call scenarios; reference solutions and faulty repairs; progress migration, backup and stale-result checks.');
