import {byId,byDomain} from './index.js';

// Chapter order is a suggested itinerary. Only lesson.prereqs describe prerequisites.
const chapter=(title,reason,outcome,ids)=>({title,reason,outcome,ids});
export const paths={
 py:{lead:'从读懂一行代码，到写出一个小程序。',entry:'从零开始；先跟踪值，再跟踪执行过程。',outcome:'独立写出带输入检查的优惠计算函数，读懂一次报错。',next:['eng','web'],project:'mini-cart',chapters:[
  chapter('看懂程序怎样执行','先弄清楚数据是什么，再看程序走哪条路，最后把规则封装成函数。','能手算一次函数调用，区分输入、处理和返回值。',['py-values','py-flow','py-functions']),
  chapter('组织数据，解释意外','有了函数，再处理多条记录；理解共享引用，才知道修改为什么会影响别处。','能选对容器、解释一次误修改，并定位异常。',['py-containers','py-references','py-errors']),
  chapter('让程序接触外部世界','把运行环境弄清楚，再读取、解析和检查外部数据。','交付一个能复现、能读写 JSON 的小程序。',['py-modules','py-json'])]},
 eng:{lead:'把“AI 改好了”，变成你能核验的交付。',entry:'先会函数、容器和 JSON；Git 可以在学习 Python 时同步练。',outcome:'写清功能边界，读懂 diff，用回归检查证明修改有效。',next:['web','llm'],project:'mini-report',chapters:[
  chapter('先定义变化和边界','用 Git 看见改动，用接口约定职责，再把需求写成可检查的结果。','一份小需求有边界、有输入输出、有验收标准。',['eng-git','eng-contract','eng-product']),
  chapter('给正确性留下证据','调试定位原因，测试防止回归，SQL 帮你核对数据的真实粒度。','能提交失败例子、修复说明和验证结果。',['eng-debug','eng-tests','eng-sql']),
  chapter('处理真实系统的失败','接触接口后，再考虑重复请求、事务和部署环境中的差异。','能说明失败怎么恢复、权限在哪检查、发布怎么回滚。',['eng-transaction','eng-delivery'])]},
 web:{lead:'理解点击之后，页面、数据和网络发生了什么。',entry:'已有变量、函数和容器的基础；接口课程会回用 JSON。',outcome:'做出能处理加载、错误、空状态并保存进度的小工具。',next:['eng','llm'],project:'mini-tasks',chapters:[
  chapter('先读懂 JavaScript','先分清类型与空值，再理解函数作用域和对象更新。','解释一次空值判断、闭包调用和数组更新。',['web-types','web-scope','web-objects']),
  chapter('连接页面与网络','DOM 说明页面结构，异步说明等待过程，HTTP 说明系统如何交换数据。','能画出一次点击到返回结果的数据流。',['web-dom','web-async','web-http']),
  chapter('管理界面的状态','数据进入页面前要校验；进入页面后，由状态决定渲染。','实现可解释的状态更新，而不是反复直接修改页面。',['web-typescript','web-react'])]},
 math:{lead:'把模型里的符号，变成能手算的关系。',entry:'能读懂 Python 列表和函数即可开始；不要求先掌握算法。',outcome:'检查张量形状、手算梯度更新，并解释指标中的不确定性。',next:['ml','dl'],project:'mini-gradient',chapters:[
  chapter('先描述数据与不确定性','向量表达样本，概率表达在什么条件下相信一个结果。','写清数据的形状和概率的分母。',['math-vectors','math-prob']),
  chapter('理解模型怎样改进','导数描述局部变化，梯度下降用这种变化调整参数。','手算一次梯度更新，并观察学习率的影响。',['math-grad','math-opt']),
  chapter('解释实验与损失','统计帮助判断证据，信息论帮助理解分类与分布的损失。','区分实验效果、随机波动和模型的优化目标。',['math-stats','math-info'])]},
 ml:{lead:'先判断预测是否可信，再比较算法有多复杂。',entry:'先理解向量；概率、梯度和信息论会在相关节点按需补充。',outcome:'建立不泄漏的预测基线，用业务代价解释阈值选择。',next:['dl','llm'],project:'mini-metrics',chapters:[
  chapter('先定义任务和评价方式','先定样本与标签，再划分数据，随后确定怎样算预测得好。','拿到一个问题时，能先写出基线、切分和评估标准。',['ml-problem','ml-splits','ml-metrics']),
  chapter('理解不同模型的假设','回归、树模型和无监督方法解决不同问题；它们不是复杂度排行榜。','能解释为什么选择一个模型，以及它可能在哪失效。',['ml-linear','ml-trees','ml-unsupervised']),
  chapter('回到推荐与真实反馈','把特征、排序和评估放回多阶段推荐系统，检查日志里的偏差。','能追问离线指标与线上用户收益是否一致。',['ml-recommend'])]},
 dl:{lead:'从张量与训练循环，走到不同的网络结构。',entry:'先会向量；训练节点需要梯度下降和数据切分。',outcome:'读懂小型训练循环，跟踪形状、梯度、损失与验证结果。',next:['llm','rl'],project:'mini-neuron',chapters:[
  chapter('先掌握共同的训练基础','形状决定运算是否合法，自动微分连接训练步骤，泛化检验是否只记住了训练集。','解释一次前向、反向、更新与验证。',['dl-tensors','dl-backprop','dl-regularize']),
  chapter('比较三类表示方式','卷积、循环网络与注意力是架构分支；按推荐顺序浏览，按实际任务选择。','说清局部结构、序列状态和注意力各解决什么问题。',['dl-cnn','dl-sequence','dl-attention']),
  chapter('走向表示学习与生成','在训练与结构基础上，继续研究学习信号从哪来，以及如何生成数据。','能区分不同目标，并制定一个小规模复现实验。',['dl-selfsupervised','dl-generative'])]},
 llm:{lead:'先把 AI 应用做可靠，再深入训练与对齐。',entry:'前 6 节走应用路线：Python、JSON、接口与测试。后 2 节再补深度学习和强化学习。',outcome:'做出可追溯、会停止、能评估质量与成本的知识助手。',next:['dl','rl'],project:'mini-retriever',chapters:[
  chapter('理解模型，描述清楚任务','先区分 token、训练与推理，再设计有输入、边界与验收标准的上下文。','给 AI 一份可执行、可核验的任务说明。',['llm-tokens','llm-context']),
  chapter('先建立执行与评估边界','工具参数需要程序校验；质量标准应在复杂执行循环之前准备好。','能定义一个工具和一组有正常、异常案例的评估集。',['llm-tools','llm-eval']),
  chapter('连接知识与行动','RAG 提供证据，Agent 组织行动；两者可以组合，也可以分别使用。','把检索、生成、执行和停止条件分开验证。',['llm-rag','llm-agent']),
  chapter('可选进阶：训练与对齐','只有要改变模型行为或复现算法时，再深入梯度训练、低秩适配与偏好优化。','能说明为什么需要训练，并设计基线、数据与评估。',['llm-finetune','llm-alignment'])]},
 rl:{lead:'从一次选择的反馈，走到长期策略。',entry:'概率是起点；进入深度强化学习前补训练循环。',outcome:'在小环境里比较价值与策略方法，记录回报、随机性与失败。',next:['llm'],project:'mini-qworld',chapters:[
  chapter('先理解反馈与长期回报','从单次探索进入 MDP，再学习怎样用经验更新状态动作价值。','手算一次回报与 Q 更新，区分行为策略和目标策略。',['rl-bandits','rl-mdp','rl-q']),
  chapter('用神经网络表示价值与策略','DQN 学价值，策略梯度直接改策略；PPO 与 SAC 再控制更新和探索。','分清价值路线与策略路线，说明稳定训练的机制。',['rl-dqn','rl-policy','rl-ppo']),
  chapter('可选进阶：受限数据与复杂环境','基础算法之后，再追问离线数据、模型误差和多个智能体带来的困难。','能识别分布外动作、模型误差和非平稳性。',['rl-offline'])]}
};

export const branches=[
 {id:'foundation',eyebrow:'共同起点',title:'先能独立读懂与交付',description:'Python 打底；工程与 Web 可以随后并行。',domains:['py','eng','web']},
 {id:'application',eyebrow:'分支 A · 应用',title:'把 AI 放进真实产品',description:'补好接口与测试后，可以先走 AI 应用路线。',domains:['llm']},
 {id:'algorithm',eyebrow:'分支 B · 原理',title:'沿着模型，深入算法',description:'数学 → 机器学习 → 深度学习；强化学习继续拓展决策。',domains:['math','ml','dl','rl']}
];

export const reasons={
 'py-values':'从名字、类型和值开始，后面的每一步执行都依赖它。',
 'py-flow':'知道值是什么以后，追踪条件如何决定执行顺序。',
 'py-functions':'把已经能跟踪的执行过程，封装为有输入和返回值的规则。',
 'py-containers':'有了函数，再让同一条规则处理多条结构化记录。',
 'py-references':'会使用容器后，解释为什么一次修改会影响另一个变量。',
 'py-errors':'现在用失败例子检查函数和数据，找到错误发生的位置。',
 'py-modules':'调试不只看一行代码，还要弄清哪个文件、哪个环境在运行。',
 'py-json':'把容器、异常处理与模块连起来，安全地接收外部数据。',
 'eng-git':'代码读懂之后，开始逐行审查 AI 究竟改了什么。',
 'eng-contract':'将函数和 JSON 的约定扩展成模块间的责任边界。',
 'eng-product':'边界明确后，把需求转成输入、结果和可验收条件。',
 'eng-debug':'把异常证据与 Git 差异放在一起，缩小需要 AI 修改的范围。',
 'eng-tests':'用已经写清的契约和失败例子，建立可重复的回归检查。',
 'eng-sql':'从程序内的容器走向表数据，先核对粒度再做连接。',
 'eng-transaction':'会查数据、会调接口后，再处理重复请求与部分成功。',
 'eng-delivery':'通过检查的代码进入另一个环境时，继续核对配置与权限。',
 'web-types':'先把 Python 的类型直觉和 JavaScript 的实际规则分开。',
 'web-scope':'知道值的类型后，追踪函数从哪里取得变量。',
 'web-objects':'理解作用域和引用后，学习不会误改原数据的更新方式。',
 'web-dom':'把 JavaScript 放回页面，理解结构、样式和交互对象。',
 'web-async':'在函数基础上，追踪等待期间哪些代码先运行。',
 'web-http':'把异步与 JSON 连起来，拆解一次真实接口请求。',
 'web-typescript':'接口数据进入程序时，同时约束静态形状与运行时值。',
 'web-react':'具备 DOM、对象更新与异步基础后，再由状态驱动界面。',
 'math-vectors':'从列表里的数开始，给数据加上维度和运算规则。',
 'math-prob':'在数量表示之上，表达不确定性与条件变化。',
 'math-grad':'把函数从“算结果”推进到“输入变化时结果怎样变”。',
 'math-opt':'用刚学到的梯度，实际执行一次参数更新。',
 'math-stats':'把概率用于有限样本，判断实验差异是否有充分证据。',
 'math-info':'进一步用分布与对数，理解分类损失在惩罚什么。',
 'ml-problem':'会表示样本后，先决定预测什么、用什么作为比较基线。',
 'ml-splits':'任务确定后，先隔离未来信息，避免评估从一开始就失真。',
 'ml-metrics':'在比较算法之前，先说清错判、漏判和业务阈值。',
 'ml-linear':'有了切分与评价标准，再用梯度学习一个简单模型。',
 'ml-trees':'在相同评价标准下，比较树划分和不同集成方式。',
 'ml-unsupervised':'除了预测标签，再学习怎样发现分组和压缩表示。',
 'ml-recommend':'把评价与表示放进排序流程，检查用户反馈造成的偏差。',
 'dl-tensors':'把向量和矩阵推广到多轴数据，先确保每一步形状正确。',
 'dl-backprop':'形状、梯度与优化齐备后，串起一次完整训练迭代。',
 'dl-regularize':'训练能够运行之后，检查优化更好是否也代表泛化更好。',
 'dl-cnn':'在通用训练循环上，加入对局部结构和参数共享的假设。',
 'dl-sequence':'换到有顺序的数据，观察状态如何携带过去的信息。',
 'dl-attention':'用矩阵与概率理解内容之间的加权关联，再比较序列结构。',
 'dl-selfsupervised':'理解表示结构后，追问信号能否从数据本身构造。',
 'dl-generative':'进一步比较重建、对抗和去噪等不同生成目标。',
 'llm-tokens':'先区分模型在推理时使用的上下文，与训练时更新的权重。',
 'llm-context':'有了推理边界和调试经验，再写完整、可验证的任务包。',
 'llm-tools':'把任务包里的动作转成有参数、权限与失败出口的调用。',
 'llm-eval':'在堆叠检索和 Agent 之前，先准备质量与成本的检查标准。',
 'llm-rag':'用已经可校验的接口连接检索与回答，分别检查两段错误。',
 'llm-agent':'在工具和测试基础上，给多步执行增加观察、预算与停止条件。',
 'llm-finetune':'需要改变模型行为时，再用训练基础判断是否值得做适配。',
 'llm-alignment':'在微调和策略优化基础上，比较不同偏好优化流程。',
 'rl-bandits':'先从单步奖励理解探索，再考虑行动对未来的影响。',
 'rl-mdp':'将单步选择扩展到状态转移与长期回报。',
 'rl-q':'明确 MDP 后，用一次经验更新状态动作价值。',
 'rl-dqn':'表格装不下状态时，用已掌握的神经网络近似价值。',
 'rl-policy':'与价值方法并列，直接学习行动概率，并引入价值评价。',
 'rl-ppo':'在策略梯度基础上，控制策略更新或鼓励更充分的探索。',
 'rl-offline':'有了在线学习经验，再研究不能随时试错的情况。'
};

export const extensions={
 'eng-git':['py-modules'],'eng-delivery':['eng-transaction'],
 'math-stats':['eng-product'],'ml-problem':['eng-product'],'ml-metrics':['math-stats'],
 'dl-tensors':['ml-linear'],'dl-attention':['dl-sequence','dl-backprop'],
 'rl-bandits':['math-stats'],
 'llm-tokens':['math-prob','dl-attention'],'llm-tools':['web-typescript','eng-transaction'],
 'llm-rag':['math-vectors','dl-selfsupervised','ml-metrics'],'llm-agent':['llm-rag','eng-transaction'],
 'llm-eval':['math-stats','ml-metrics']
};
export const placements=Object.create(null);
for(const [domain,path] of Object.entries(paths)){
 path.ids=path.chapters.flatMap(c=>c.ids);
 path.chapters.forEach((chapter,chapterIndex)=>chapter.ids.forEach(id=>{
  const index=path.ids.indexOf(id);
  placements[id]={domain,chapter,chapterIndex,index,previous:path.ids[index-1],next:path.ids[index+1],total:path.ids.length};
 }));
}
export const pendingPrereqs=(id,records)=>byId[id].prereqs.filter(p=>!records[p]?.completed);
export function nextLesson(domain,records){return paths[domain].ids.find(id=>!records[id]?.completed)||null;}
export function firstMissingPrereq(id,records){
 for(const p of byId[id].prereqs)if(!records[p]?.completed)return firstMissingPrereq(p,records)||p;
 return null;
}
export function pathCompletion(domain,records){return byDomain[domain].filter(l=>records[l.id]?.completed).length;}
