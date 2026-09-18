import sources from './sources.json' with {type:'json'};
export {sources};
export const chapters=[
 {id:'py',name:'Python',intro:'把业务规则写成程序，再让程序处理真实输入。',outcome:'读懂数据怎样流动，能够定位错误、拆分函数和交付脚本。',color:'#ac704a'},
 {id:'web',name:'Web 开发',intro:'从一个操作开始，贯通界面、状态和网络。',outcome:'做出可交互、可恢复、能处理失败的前端应用。',color:'#68858c'},
 {id:'eng',name:'软件工程',intro:'让一次修改有边界，让一次交付可以被复查。',outcome:'把接口、数据库、测试、版本和运行环境连成完整流程。',color:'#8d829c'},
 {id:'math',name:'数学与统计',intro:'从能算出一个结果，走到能解释一个结论。',outcome:'用矩阵、导数、概率和实验设计理解后续模型。',color:'#ac8e47'},
 {id:'ml',name:'机器学习',intro:'从一份可解释的基线，做到可复查的模型比较。',outcome:'掌握表格学习、分类、集成、无监督与可靠评估的完整流程。',color:'#b86645'},
 {id:'dl',name:'深度学习',intro:'从一个梯度开始，逐步复现能够训练的网络。',outcome:'沿计算图、视觉、序列、Transformer 和生成模型逐层深入。',color:'#727a9e'},
 {id:'llm',name:'大模型应用',intro:'把生成能力放进一个能查证、能评估的系统。',outcome:'理解训练与推理，完成检索、工具调用和评估闭环。',color:'#68908b'},
 {id:'rl',name:'强化学习',intro:'从一次选择的回报，走到策略的训练与比较。',outcome:'区分老虎机、价值学习、策略优化与连续控制。',color:'#99805e'},
];
export const chapterById=Object.assign(Object.create(null),Object.fromEntries(chapters.map(c=>[c.id,c])));
export const sourceUrl=(key,path='')=>{const s=sources[key];return `https://github.com/${s.repo}/${path?'blob/':'tree/'}${s.sha}${path?'/'+path:''}`;};
export const step=(title,brief,knowledge,actions,checks,file)=>({title,brief,knowledge,actions,checks,file});
export const topic=(id,chapter,title,summary,level,environment,knowledge,stages,extra={})=>({id,chapter,title,summary,level,environment,knowledge,stages,...extra});
