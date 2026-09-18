import {controlledPair} from './math.js';
export const COURSE='bank-first-model';
export const DATA_SHA='dc8d576e9bda0f41ee891251bd84bab9a39ce576cba715aac08adc2374a01fde';
export const PROTOCOL='bank-v1-feature-groups-sha256-70-15-15';
export const parts=[
 {title:'接下任务',description:'先知道预测什么，再决定哪些数据能用。',ids:['brief','rows','split']},
 {title:'模型怎样学',description:'从一个笨办法出发，走完一次梯度更新。',ids:['baseline','score','loss','gradient','features']},
 {title:'做一轮实验',description:'在同一份验证数据上比较，再冻结方案。',ids:['train','decision']},
 {title:'自己改，自己交付',description:'改写一个决策规则，并说明结果的边界。',ids:['transfer','handoff']},
];
export const units=[
 {id:'brief',title:'先把任务说清楚',format:'数据调查',minutes:'15–25',answer:1},
 {id:'rows',title:'一行记录怎样变成输入',format:'Python 练习',minutes:'25–40',answer:2,task:'encode'},
 {id:'split',title:'给三份数据分工',format:'代码修复',minutes:'25–40',answer:0,task:'scale'},
 {id:'baseline',title:'准确率很高，也可能没用',format:'指标推演',minutes:'15–25',answer:1},
 {id:'score',title:'从加权求和到概率分数',format:'函数实验',minutes:'20–30',answer:2},
 {id:'loss',title:'用一个数衡量预测有多差',format:'损失实验',minutes:'20–30',answer:0},
 {id:'gradient',title:'亲手更新一次参数',format:'Python 练习',minutes:'30–45',answer:1,task:'step'},
 {id:'features',title:'让数字和类别都能进入模型',format:'编码推演',minutes:'20–30',answer:2},
 {id:'train',title:'训练你的第一个模型',format:'真实数据实验',minutes:'35–55',answer:0},
 {id:'decision',title:'选方案，查错误，再验收',format:'决策工作台',minutes:'30–45',answer:1},
 {id:'transfer',title:'名额有限，规则怎么改',format:'迁移练习',minutes:'25–40',answer:0,task:'budget'},
 {id:'handoff',title:'把结果交给下一位同事',format:'实验交付',minutes:'20–30',answer:2},
];
export const unitById=Object.fromEntries(units.map(u=>[u.id,u]));
export const courseHref=id=>`#course/${COURSE}${id?'/'+id:''}`;
export const fresh=()=>({version:1,read:{},answers:{},tasks:{},notes:{},runs:[],selected:'',testSeen:false});
export function taskPassed(task){const r=task?.result;return !!(r?.verified&&r.ok&&r.code===task.code&&r.checks?.length===4&&r.checks.every(c=>c.ok));}
export function unitDone(record,unit){
 if(record.answers?.[unit.id]?.choice!==unit.answer||!record.answers?.[unit.id]?.checked)return false;
 if(unit.task&&!taskPassed(record.tasks?.[unit.task]))return false;
 if(unit.id==='train'&&(!controlledPair(record.runs||[])||(record.comparison?.trim().length||0)<20))return false;
 if(unit.id==='decision'&&!record.report)return false;
 if(unit.id==='handoff'&&(!(record.notes?.handoff?.trim().length>=100)||!record.report))return false;
 return true;
}
export const completed=record=>units.filter(u=>unitDone(record||fresh(),u)).length;
