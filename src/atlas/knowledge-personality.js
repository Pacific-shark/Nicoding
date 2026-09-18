// Editorial course difficulty, independent of priority, position and completion.
const foundation=new Set(['py-values','py-flow','py-functions','py-containers','py-errors','web-types','web-dom','eng-git','eng-debug','eng-product','math-vectors','ml-problem','llm-tokens','llm-context']);
const challenge=new Set(['eng-transaction','math-stats','math-info','ml-svm','ml-boosting','ml-calibration','ml-timeseries','ml-recommend','dl-autograd','dl-attention','dl-transformer','dl-selfsupervised','dl-generative','dl-vae','dl-gan','dl-diffusion','rl-policy','rl-ppo','rl-sac','rl-offline','llm-alignment','llm-finetune']);
export const difficultyLevels=[
 {id:'foundation',label:'基础',expression:'放松',description:'从概念和短代码开始。'},
 {id:'practice',label:'进阶',expression:'思考',description:'把几个概念连起来，完成一段实现。'},
 {id:'challenge',label:'挑战',expression:'惊讶',description:'需要推导、比较方法，或检查复杂的执行过程。'},
];
export function personality(id){
 const level=foundation.has(id)?0:challenge.has(id)?2:1;
 const hash=[...id].reduce((n,c)=>n+c.charCodeAt(0),0);
 return {...difficultyLevels[level],level,pose:hash%4};
}
