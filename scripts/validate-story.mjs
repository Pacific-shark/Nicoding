import assert from 'node:assert/strict';
import {chapters,chapterOrder,missingRequirements,completeChapter,recommendedChapter} from '../src/story/catalog.js';
import {journeys} from '../src/journeys/catalog.js';
import {byId} from '../src/data/index.js';
import {validateImport,empty} from '../src/state.js';

assert.deepEqual(new Set(chapterOrder),new Set(Object.keys(journeys)));
const visited=new Set(),active=new Set();
function visit(id){assert(!active.has(id),'Prerequisite cycle: '+id);if(visited.has(id))return;active.add(id);for(const r of chapters[id].requires){assert(chapters[r.id]);assert(r.skills.every(s=>byId[s]),'Missing prerequisite skill');visit(r.id);}active.delete(id);visited.add(id);}
for(const id of chapterOrder){visit(id);assert.equal(chapters[id].beats.length,journeys[id].stages.length);assert(chapters[id].beats.every(b=>b.length===4&&b.every(Boolean)));assert(chapters[id].next.every(next=>chapters[next]));}
const state=empty();assert.equal(recommendedChapter(state),'py');assert.equal(missingRequirements(state,'math').length,0);assert.equal(missingRequirements(state,'dl').length,2);assert.equal(missingRequirements(state,'llm').length,2);
const done=id=>({version:1,stage:journeys[id].stages.length-1,data:{},note:'',evidence:Object.fromEntries(journeys[id].stages.map((s,i)=>[i,{summary:s,at:1}]))});
state.journeys.py=done('py');assert(completeChapter(state,'py'));assert.equal(recommendedChapter(state),'web');assert.equal(missingRequirements(state,'web').length,0);assert.equal(missingRequirements(state,'eng').length,0);
state.journeys.math=done('math');assert.equal(missingRequirements(state,'ml').length,0);assert.equal(missingRequirements(state,'rl').length,0);assert.equal(missingRequirements(state,'dl').length,1);
state.journeys.ml=done('ml');assert.equal(missingRequirements(state,'dl').length,0);assert.equal(missingRequirements(state,'llm').length,1,'LLM needs engineering, not completion of all DL');
const legacy=empty();for(const id of ['py-json','eng-contract','eng-tests'])legacy.lessons[id]={completed:1};assert.equal(missingRequirements(legacy,'llm').length,0,'Existing knowledge completion satisfies prerequisites');
state.lastJourney='py';const imported=validateImport(JSON.parse(JSON.stringify(state)));assert(completeChapter(imported,'py'));assert.equal(imported.lastJourney,'py');assert.deepEqual(imported.journeys.py.evidence,state.journeys.py.evidence);
delete state.journeys.py.evidence[1];assert(!completeChapter(state,'py'),'A later artifact cannot hide an unfinished prerequisite step');
console.log('Story validation passed: 8 chapters / 36 episodes; acyclic skill prerequisites; optional branches; real evidence completion; old knowledge progress and backup compatibility.');
