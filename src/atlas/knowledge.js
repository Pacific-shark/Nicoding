import {lessons} from '../data/index.js';
import {mlKnowledge} from './knowledge-ml.js';
import {dlKnowledge} from './knowledge-dl.js';
import {K} from './knowledge-schema.js';
const extra=[
 K('rl-sac','SAC：最大熵与连续控制','同时学习价值、随机策略和探索温度。',['rl-policy','rl-dqn','math-info'],[
 ['最大熵目标','SAC 将累计奖励与策略熵一起优化，典型目标为 EΣγ^t[r_t+αH(π(·|s_t))]。α 决定熵相对于奖励的权重。它鼓励保留有价值的随机性，并不等于任意乱试。\n\n连续动作常用高斯分布，再经 tanh 映射到动作范围。'],
 ['双 Q 与目标','critic 目标包含下一动作的价值与熵项，常见形式 y=r+γ(1−terminated)[min(Q1_target,Q2_target)−α logπ(a′|s′)]。取双 Q 最小值用于缓解过高估计；目标计算通常停止梯度。\n\n终止与时间截断不能随便混同，下一状态需避免环境自动重置造成错配。'],
 ['策略梯度与动作变换','actor 常最小化 E[α logπ(a|s)−min(Q1,Q2)]，借助重参数化让梯度穿过采样到策略参数。a=tanh(u) 后，对数密度还要减去 log|da/du| 的修正。\n\n自动温度调节有额外目标，和固定 α 是不同实验条件；必须记录目标熵与动作维度。'],
 ['一个价值目标算例','r=1，γ=.9，min Q=2，α=.2，logπ=−.5，未终止时 y=1+.9×(2+.1)=2.89。真实终止时 y=1。\n\n这只是一个目标算例。离策略能复用回放，不意味着固定离线数据上直接训练就可靠，分布外动作估计仍可能失真。'],
 ],'r,gamma,q,alpha,logp=1.,.9,2.,.2,-.5\nfor terminated in [False,True]:\n    target=r+gamma*(not terminated)*(q-alpha*logp)\n    print(round(target,4))','未终止 2.89，真实终止 1.0。',['tanh 后概率密度要修正。','在线离策略不等于可靠离线 RL。'],['真实终止后的目标应包含下一状态价值吗？',['不包含','始终包含','奖励也删除'],0,['没有后续回报。','会错误 bootstrap。','当前奖励保留。']],[['CleanRL · SAC 实现','https://github.com/vwxyzjn/cleanrl/blob/fe8d8a03c41a7ef5b523e2e354bd01c363e786bb/cleanrl/sac_continuous_action.py']]),
 K('llm-retrieval-eval','检索评估：召回、排序与证据','把没找到答案和找到后答错分开诊断。',['llm-rag','ml-metrics'],[
 ['先定义相关性','检索评估需要查询与相关文档或片段的标注。相关可能指主题相近，也可能指包含支撑结论的证据。RAG 更需要后者；只看向量相似度不能判断回答是否可证。\n\n标注要保留原文位置、版本与粒度。一个答案需要多段证据时，不能只标一个模糊标题。'],
 ['常用指标','Recall@k=前 k 项找到的相关项数/全部相关项数。Precision@k=前 k 项相关项数/k。MRR 用第一个相关项排名的倒数，再在查询上取平均。nDCG 还能使用分级相关性并重视靠前结果。\n\n无相关项的问题，Recall 分母为零，应独立评估拒答和无证据行为，不随便计为满分。'],
 ['实验控制','比较块大小、重叠、embedding 或 reranker 时，固定查询和语料版本，一次改变可解释的因素。索引中重复片段可能挤占 top-k，必须按证据 ID 去重或报告。\n\n调检索的开发集和最终保留问题分开。反复看失败问题再改系统，相当于对这些问题做了选择。'],
 ['手算与生成连接','相关文档为 {a,c}，结果 [b,a,d,c]。Recall@2=.5，Precision@2=.5，RR=.5，Recall@4=1。找到全部相关项不保证生成正确；还要核对引用是否支持每条结论。\n\n故障应分为未召回、排序靠后、上下文截断、生成遗漏、无证据编造等，才能定位要改哪一层。'],
 ],"relevant={'a','c'}\nranked=['b','a','d','c']\nfor k in [2,4]:\n    hits=len(set(ranked[:k]) & relevant)\n    print(k,'recall',hits/len(relevant),'precision',hits/k)\nrr=next((1/(i+1) for i,x in enumerate(ranked) if x in relevant),0)\nprint('RR',rr)",'k=2 召回 .5、精确率 .5；k=4 召回 1、精确率 .5；RR=.5。',['检索相似度不是事实可信度。','同一个问题的多个相近片段不一定是多份独立证据。'],['召回正确证据但回答仍错，首先应区分？',['检索与生成错误','只增大 top-k','只换 UI'],0,['分层诊断才能定位原因。','可能增加噪声与成本。','不解决语义错误。']],[['Stanford IR · 检索评估','https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-in-information-retrieval-1.html']]),
];
const enrich={
 'ml-splits':{title:'数据划分与泄漏',prereqs:['ml-problem'],subtitle:'先确定模型将在什么条件下预测，再决定如何划分数据。',figure:'split',parts:[
 ['定义与适用边界','训练集用来估计参数，验证集用来选择方案，测试集用来评估冻结后的方案。分工是为了让评估接近真正遇到新数据时的表现。\n\n泄漏指训练或选择过程使用了目标使用场景里本不该得到的信息。它不仅是“标签直接出现在特征中”，也可能来自预处理、重复主体、时间窗口或反复使用测试反馈。比例不是核心，预测时点与独立性才是。'],
 ['划分跟随问题','如果部署对象是新用户，应让用户整体留出；如果预测已有用户的未来行为，可以保留过去记录，但必须保证训练、特征与标签窗口都早于目标。并非同一用户出现在两边就永远错误，要看所估计的任务。\n\n分层切分维持标签比例，无法自动解决用户重叠。时间切分也可能因重叠标签窗口、事后补录数据而泄漏。记录划分键、时间和可用信息。'],
 ['预处理也会泄漏','在全量数据上拟合均值、词表、特征选择或目标编码，会将验证数据的信息带入训练流程。正确做法是在训练部分 fit，再对保留部分 transform；交叉验证中每折都重复这套流程。\n\n即使没使用标签，无监督预处理也会利用保留数据的分布。若场景确实是转导学习，必须明确说明，不能与面对全新样本的评估混用。'],
 ['把时点写成一张表','银行订阅预测若发生在拨打电话之前，通话时长 duration 不可用。即使它在历史 CSV 中预测力很高，也不能进入该决策时点的模型。\n\n记录“字段、生成时间、入库延迟、预测时是否可用、处理方式”五列，比机械按 70/15/15 分组更重要。已有 Bank 实验按可用特征分组，仍不能证明真正的新客户或跨时间泛化。'],
 ['测试反馈的边界','看完测试错例后调整阈值、特征或模型，相当于将测试纳入开发。原测试结果可以作为探索观察，但不能继续称为同一轮未触碰评估。\n\n样本很少时可用嵌套验证估计选择流程，同时报告不确定性。没有一种切分能替代明确的部署假设。'],
 ]},
 'ml-linear':{parts:[['线性与逻辑回归的目标','线性回归预测实数，可最小化平均平方误差；逻辑回归先计算 z=wᵀx+b，再用 sigmoid 将它映射到二分类概率分数，常用二元交叉熵训练。名字里都有“回归”，输出语义却不同。\n\n逻辑回归线性的是 log-odds：log(p/(1−p))=wᵀx+b。输入特征可含多项式或交互项，所以“线性模型”指对参数的结构，不一定意味着原始坐标下只有一条直线。'],['梯度与正则','对平均二元交叉熵，∂L/∂w=Xᵀ(p−y)/n，∂L/∂b=mean(p−y)。若加 λ||w||²/2，权重梯度再加 λw；偏置是否正则需看定义。\n\nRidge 使用 L2 收缩，Lasso 使用 L1 并可能产生稀疏系数，Elastic Net 组合两者。特征尺度影响惩罚的相对强度；相关特征也会影响系数解释。'],['数值与解释','log(sigmoid(z)) 在大幅值时直接计算可能溢出或出现 log(0)。稳定实现可利用 logaddexp、log-sum-exp 等形式。\n\n系数表示控制其他输入后的模型分数变化，不自动是因果效应。预测概率、概率校准和最终阈值应分开验证。']]},
 'ml-trees':{parts:[['CART 的局部目标','分类树常以 Gini 或熵衡量节点不纯度，回归树可最小化平方误差。对候选特征与切点，比较按子节点样本数加权的不纯度下降。每步选择局部划分，不保证全局最优树。\n\nGini=1−Σp_k²。二分类比例各半时为 .5，单一类别时为 0。限制深度、叶子样本数与剪枝控制复杂度。'],['森林与提升的边界','随机森林结合样本与特征随机性，降低树之间相关性后再聚合。梯度提升按顺序优化当前目标，后一个模型依赖前面的预测。两者不是同一种“多树投票”。\n\n树能表达阈值交互，但叶子预测的外推能力有限。时间漂移、罕见类别、缺失值和单调约束需要结合实现与数据检查。']]},
 'math-grad':{parts:[['从方向导数到梯度检查','标量函数 f:R^d→R 的梯度汇总各坐标偏导。小变化 Δx 下，f(x+Δx)≈f(x)+∇f(x)ᵀΔx。它是局部一阶近似，不保证大步也准确。\n\n复合函数使用 Jacobian 链式相乘。反向传播通常无需显式构造完整 Jacobian，而计算向量—Jacobian 乘积。共享路径导数相加，串联路径导数相乘。'],['数值差分的用途与限制','中心差分 [f(x+h)−f(x−h)]/(2h) 可在光滑点核对解析梯度。选择多个 h 检查稳定区间；小到浮点无法分辨时，误差会重新变大。\n\n在不可导点或带随机性的程序中，差分不一定与框架的约定梯度一致。测试应固定随机性、选取非拐点，并使用合理绝对与相对误差。']]},
 'dl-attention':{figure:'attention',parts:[['数值稳定与 mask 边界','按每个 query 的 key 维度做 softmax。mask 通常在 softmax 前加入负无穷；一行如果所有 key 都被遮掉，可能产生 NaN，需要明确数据或实现的保证。\n\n缩放 √d_k 是针对点积幅度随维度增长的调节，并非概率归一化本身。注意力输出通常是向量，不是选中一个词的硬检索。']]},
 'py-references':{figure:'references',parts:[['嵌套别名与所有权','外层列表复制只复制元素引用。若元素是字典，a.copy()[0] 仍可能与 a[0] 指向同一对象。修改嵌套内容前，要明确谁拥有该对象、是否允许共享。\n\n深拷贝也不是默认答案：文件句柄、缓存和模型参数可能需要共享或不支持复制。用小图画出对象身份，配合 is 和可复现输入检查，比凭“看上去复制了”可靠。']]},
 'rl-ppo':{title:'PPO：截断策略优化',subtitle:'在固定采样上控制策略更新，再收集下一轮轨迹。',parts:[['把 PPO 与 SAC 分开','PPO 典型地使用当前策略收集的 rollout，借助概率比和截断目标限制更新；SAC 使用回放学习并加入熵正则，通常面向连续动作。它们的数据复用、目标与策略参数化不同。\n\n本章把 SAC 拆为独立知识点。先在 PPO 课题中核对 GAE、旧 logprob 和 clip 分支，再进入连续动作密度与温度学习。']]},
};
export const knowledge=[...lessons.map(l=>{
 const e=enrich[l.id]||{};
 return {...l,...e,parts:e.parts?(l.id==='ml-splits'?e.parts:[...l.parts,...e.parts]):l.parts,checked:e.parts?'2026-09-18':l.checked};
}),...mlKnowledge,...dlKnowledge,...extra];
export const knowledgeById=Object.assign(Object.create(null),Object.fromEntries(knowledge.map(k=>[k.id,k])));
export const shortTitle=k=>({
 'py-values':'变量与对象','py-containers':'容器','py-functions':'函数','py-references':'引用与复制','py-json':'文件与 JSON',
 'web-dom':'HTML 与 CSS','web-async':'异步与事件循环','web-react':'React 状态','web-types':'类型与空值','web-scope':'作用域与闭包','web-http':'HTTP 与 Fetch',
 'eng-contract':'接口契约','eng-tests':'测试','eng-git':'Git','eng-sql':'SQL','eng-debug':'调试与证据','eng-delivery':'配置与部署',
 'math-vectors':'线性代数','math-grad':'链式法则','math-prob':'概率','math-info':'交叉熵','math-opt':'梯度下降','math-stats':'统计与因果',
 'ml-problem':'监督学习','ml-splits':'数据划分与泄漏','ml-linear':'线性与逻辑回归','ml-metrics':'分类评估','ml-trees':'树与集成','ml-unsupervised':'聚类','ml-knn':'k 近邻',
 'dl-autograd':'自动微分','dl-backprop':'训练循环','dl-cnn':'卷积','dl-attention':'注意力','dl-transformer':'Transformer',
 'llm-tools':'工具调用','llm-agent':'Agent 与 MCP','llm-rag':'RAG','llm-eval':'评估','llm-tokens':'Token 与推理','llm-context':'上下文设计',
 'rl-bandits':'多臂老虎机','rl-mdp':'MDP','rl-q':'Q-learning','rl-dqn':'DQN','rl-ppo':'PPO','rl-sac':'SAC',
}[k.id]||k.title.split('：')[0]);
