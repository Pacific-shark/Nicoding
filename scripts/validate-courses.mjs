import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {COURSE,DATA_SHA,units,parts,fresh,unitDone,completed} from '../src/courses/bank/registry.js';
import {sanitizeCourses,validRun} from '../src/courses/bank/records.js';
import {content} from '../src/courses/bank/content.js';
import {tasks} from '../src/courses/bank/tasks.js';
import {controlledPair,evaluate} from '../src/courses/bank/math.js';
import {validateImport,empty} from '../src/state.js';
import {byId} from '../src/data/index.js';
assert.deepEqual(parts.flatMap(p=>p.ids),units.map(u=>u.id));
for(const u of units){
 assert(content[u.id].sections.length>=2);
 assert.equal(content[u.id].quiz.options.length,3);
 for(const id of content[u.id].bridge)assert(byId[id],id);
 if(u.task)assert.equal(tasks[u.task].tests.length,4);
}
const execute=source=>spawnSync(process.env.PYTHON||'python',['-c',source],{encoding:'utf8',timeout:10000});
for(const task of Object.values(tasks)){
 for(const test of task.tests){
  const r=execute(task.solution+'\n'+test.code);
  assert.equal(r.status,0,task.id+' / '+test.name+'\n'+r.stderr);
 }
 const incorrect=execute(task.starter+'\n'+task.tests.map(t=>t.code).join('\n'));
 assert.notEqual(incorrect.status,0,'Starter must expose a real error: '+task.id);
}
const course=fresh();course.answers.rows={choice:2,checked:true};
course.tasks.encode={code:tasks.encode.solution,hints:1,solutionSeen:false,result:{version:1,verified:true,ok:true,code:tasks.encode.solution,checks:Array.from({length:4},()=>({ok:true}))}};
assert(unitDone(course,units[1]));
const state={...empty(),courses:{[COURSE]:course}};
const restored=validateImport(JSON.parse(JSON.stringify(state)));
assert(unitDone(restored.courses[COURSE],units[1]));
restored.courses[COURSE].tasks.encode.code+='\n# changed';
assert(!unitDone(restored.courses[COURSE],units[1]));
assert.equal(completed(fresh()),0);
assert.deepEqual(validateImport({version:1,lessons:{}}).courses,{});
assert.deepEqual(sanitizeCourses({[COURSE]:null}),{});
assert(!validRun({version:1,weights:[Infinity]}));
// Contemporary millisecond timestamps exceed 1e12: a reload must not discard them.
const sample={version:1,protocol:'bank-v1-feature-groups-sha256-70-15-15',datasetSha256:DATA_SHA,id:'roundtrip',at:Date.now(),config:{lr:.3,l2:.01,epochs:150,categorical:false},counts:{train:3171,valid:674,test:676},prep:{mean:[0,0,0],scale:[1,1,1],categories:{},features:['age','balance','previous']},weights:[.1,.2,.3],bias:0,history:[{epoch:0,train:.69,valid:.69},{epoch:150,train:.3,valid:.4}],trainRate:.12,predictions:Array.from({length:674},(_,i)=>({id:i+1,y:i%2,p:.2,age:30,balance:100,previous:1})),seconds:1};
const frozen={run:sample,policy:{threshold:.2,fpCost:1,fnCost:5},at:Date.now(),datasetSha256:DATA_SHA};
const roundtrip=validateImport({...empty(),courses:{[COURSE]:{...fresh(),runs:[sample],selected:sample.id,frozen,testSeen:true,report:{metrics:evaluate(sample.predictions),at:Date.now(),frozenAt:frozen.at,exploratory:true}}}}).courses[COURSE];
assert.equal(roundtrip.runs.length,1);
assert.equal(roundtrip.frozen.at,frozen.at);
assert.equal(roundtrip.report.exploratory,true);
assert.equal(roundtrip.testSeen,true);
assert(!controlledPair([{config:{lr:.3,l2:.1,epochs:10,categorical:true}},{config:{lr:.3,l2:.1,epochs:10,categorical:true}}]));
assert(controlledPair([{config:{lr:.3,l2:.1,epochs:10,categorical:true}},{config:{lr:.3,l2:.1,epochs:10,categorical:false}}]));
assert.equal(evaluate([{y:1,p:.5},{y:0,p:.5}],{threshold:.5,fpCost:2,fnCost:9}).cost,2);
assert.equal(evaluate([{y:1,p:.1}],{threshold:.5}).precision,null);
const sha=createHash('sha256').update(readFileSync(new URL('../public/learning/bank/bank.csv',import.meta.url))).digest('hex');
assert.equal(sha,DATA_SHA);
console.log('Course checks passed: 12 units, 4 exercises / 16 contracts, stale results, backup compatibility, metrics, dataset.');
