import {useEffect,useState} from 'react';
import {byId,projects} from './data/index.js';
import {sanitizeUnits} from './learning/progress.js';
export const KEY='nicoding.learning.v1';
export const empty=()=>({version:1,units:{},lessons:{},notes:{},explanations:{},projects:{},drafts:{},settings:{pet:true,motion:true},last:'py-values'});
export function validateImport(value) {
 if(!value||value.version!==1||typeof value.lessons!=='object'||!value.lessons||Array.isArray(value.lessons)) throw new Error('不是 Nicoding v1 进度文件。');
 const out=empty();
 for(const [id,item] of Object.entries(value.lessons)) {
  if(!byId[id])continue;
  if(!item||typeof item!=='object')throw new Error('课程记录格式不正确。');
  const result={};
  for(const key of ['visited','completed','due','reviewed']) if(Number.isFinite(item[key])&&item[key]>=0)result[key]=item[key];
  if(Number.isInteger(item.reviews)&&item.reviews>=0&&item.reviews<1000)result.reviews=item.reviews;
  result.assisted=!!item.assisted;
  out.lessons[id]=result;
 }
 for(const section of ['notes','drafts']) {
  if(value[section] && typeof value[section]==='object') for(const [id,text] of Object.entries(value[section])) {
   if(byId[id]&&typeof text==='string'&&text.length<=50000)out[section][id]=text;
  }
 }
 for(const [id,record] of Object.entries(value.explanations||{})) {
  if(!byId[id]||!record||typeof record!=='object')continue;
  out.explanations[id]={text:typeof record.text==='string'?record.text.slice(0,20000):'',stretch:typeof record.stretch==='string'?record.stretch.slice(0,20000):'',checks:Array.isArray(record.checks)?[...new Set(record.checks.filter(i=>Number.isInteger(i)&&i>=0&&i<3))]:[]};
 }
 for(const p of projects) if(value.projects?.[p.id]) {
  const input=value.projects[p.id];
  out.projects[p.id]={steps:Array.isArray(input.steps)?[...new Set(input.steps.filter(i=>Number.isInteger(i)&&i>=0&&i<p.steps.length))]:[],note:typeof input.note==='string'?input.note.slice(0,20000):'',...(typeof input.code==='string'?{code:input.code.slice(0,50000)}:{}),...(Number.isInteger(input.activeTask)&&input.activeTask>=0&&input.activeTask<p.steps.length?{activeTask:input.activeTask}:{})};
 }
 if(typeof value.settings?.pet==='boolean')out.settings.pet=value.settings.pet;
 if(typeof value.settings?.motion==='boolean')out.settings.motion=value.settings.motion;
 out.units=sanitizeUnits(value.units);
 if(byId[value.last])out.last=value.last;
 return out;
}
export function useProgress() {
 const [storageError,setStorageError]=useState('');
 const [state,setState]=useState(()=>{try{const raw=localStorage.getItem(KEY);return raw?validateImport(JSON.parse(raw)):empty();}catch{return empty();}});
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));setStorageError('');}catch{setStorageError('浏览器未能保存进度。请导出备份，并检查存储空间或隐私设置。');}},[state]);
 const updateLesson=(id,change)=>setState(s=>({...s,last:id,lessons:{...s.lessons,[id]:{...s.lessons[id],...change}}}));
 const complete=(id,assisted)=>{
  const now=Date.now();
  updateLesson(id,{completed:now,due:now+86400000,assisted, reviews:0});
 };
 const review=id=>{
  const previous=state.lessons[id]||{};
  const reviews=(previous.reviews||0)+1;
  updateLesson(id,{reviewed:Date.now(),reviews,due:Date.now()+[1,3,7,14,30][Math.min(reviews,4)]*86400000});
 };
 return {state,setState,storageError,updateLesson,complete,review};
}
