import {domains} from './schema.js';
import {python} from './python.js';
import {web} from './web.js';
import {engineering} from './engineering.js';
import {math} from './math.js';
import {ml} from './ml.js';
import {dl} from './dl.js';
import {rl} from './rl.js';
import {llm} from './llm.js';
import {advancedPractice} from './advanced-practice.js';
export {domains};
export const lessons = [...python,...web,...engineering,...math,...ml,...dl,...rl,...llm].map((l,i)=>{
 const extra=advancedPractice[l.id]||{};
 const additionalParts={
  'llm-tokens':['推理中的 KV cache','自回归生成时，之前 token 的注意力 key/value 计算可以缓存，避免每生成一步都重复做全部历史计算。缓存消耗内存，长度与并发会影响服务容量；它保存的是中间计算，不是提前知道的正确答案。'],
  'dl-cnn':['手算输出长度','膨胀率为 1 时，一维输出长度为 floor((输入长度 + 2×填充 − 核长度)/步幅)+1。输入 7、核 3、填充 0、步幅 2，合法窗口从 0、2、4 开始，共 3 个。先确定最后一个窗口不能越界，再理解公式。'],
  'dl-backprop':['有意累计梯度时怎样保持尺度','假设两批样本等大，你想得到两批平均损失的梯度，可将每批损失除以 2 后分别 backward，在两批之前清零、两批之后 step。直接把两个平均损失的梯度相加会把尺度放大为目标平均梯度的两倍。']
 };
 const quiz=[...l.quiz,...(extra.extraQuestion?[extra.extraQuestion]:[])].map((q,j)=>{
  const offset=(i+j)%q.options.length;
  const rotate=a=>a.map((_,k)=>a[(k+offset)%a.length]);
  return {...q,options:rotate(q.options),explanations:rotate(q.explanations),correct:(q.correct-offset+q.options.length)%q.options.length};
 });
 return {...l,parts:[...l.parts,...(additionalParts[l.id]?[additionalParts[l.id]]:[])],...(extra.challenge?{challenge:extra.challenge}:{}),quiz,order:i,priority:l.priority??3,checked:'2026-09-08'};
});
export const byId = Object.assign(Object.create(null),Object.fromEntries(lessons.map(l=>[l.id,l])));
export const byDomain = Object.fromEntries(domains.map(d=>[d.id,lessons.filter(l=>l.domain===d.id)]));
export const projects = [
 {id:'calculator',name:'从一条规则，到一个可靠功能',label:'01 / 代码与交付',intro:'做一个订单优惠计算器，让产品规则、输入校验和测试说同一件事。',skills:['py-functions','py-json','eng-tests','eng-contract'],deliver:'代码、规则说明、测试结果、启动说明',steps:['写清金额单位、折扣范围、舍入规则与异常返回','实现计算函数，覆盖零折扣、全额折扣和非法输入','接入 JSON 输入，分离解析、校验、计算与展示','让 AI 修改一个规则，读 diff 并运行回归测试','请一个不了解项目的人按说明运行，记录卡点'],accept:'输入 20000 分、10% 折扣得到 18000 分；非法折扣得到明确错误。重复计算不修改原订单。'},
 {id:'webapp',name:'一个能留下进度的小工具',label:'02 / 产品与 Web',intro:'用 React 做学习或任务看板，体验数据如何驱动界面。',skills:['web-react','web-http','web-typescript','eng-delivery'],deliver:'可运行页面、状态图、边界案例和演示记录',steps:['定义一个真实用户任务，画出状态与派生值','实现添加、修改、筛选与本地持久化','实现空状态、保存失败状态、键盘可达的控件','验证刷新恢复、移动端布局与非法导入','记录一次用户试用，并依据具体证据改一处交互'],accept:'刷新保留数据；坏格式导入不覆盖现有数据；所有主要操作可用键盘完成。'},
 {id:'mlproject',name:'一个经得起追问的预测实验',label:'03 / 数据与机器学习',intro:'用公开或合成数据预测一个业务结果，重点解释评估为何可信。',skills:['ml-problem','ml-splits','ml-metrics','ml-trees'],deliver:'数据字典、可复现实验、指标表与限制说明',steps:['定义样本粒度、预测时点与标签窗口','按部署场景划分训练、验证和测试，检查泄漏','建立均值/众数基线，再比较线性与树模型','报告阈值下的错误代价和分群表现','保留失败结果，说明哪些结论不能从当前数据推出'],accept:'同一切分下比较；所有预处理只在训练集拟合；最终测试不用于调参。'},
 {id:'agentproject',name:'会查证、会停止的知识助手',label:'04 / RAG 与 Agent',intro:'围绕一份你有权使用的小知识库，做能引用、能拒绝无答案问题的检索助手。',skills:['llm-rag','llm-agent','llm-eval','eng-transaction'],deliver:'数据来源、工具契约、评估集、运行轨迹与成本记录',steps:['准备可追溯文档，记录版本、切分与权限规则','实现检索并人工检查十个问题的证据命中','加入生成与引用，检查每条引用是否支持结论','设置工具白名单、最大步数、超时和无答案出口','用至少十二个保留案例测质量、延迟与总成本'],accept:'无答案时承认证据不足；无权限时不泄露内容；预算耗尽能停止并说明状态。'},
 {id:'rlproject',name:'让 Nico 在小世界里学会选择',label:'05 / 强化学习实验',intro:'从可穷举的小网格开始，比较随机策略、Q-learning，再尝试 DQN。',skills:['rl-mdp','rl-q','rl-dqn','rl-ppo'],deliver:'环境定义、随机种子、训练日志、评估与失败分析',steps:['定义状态、动作、奖励、真实终止与时间截断','实现随机策略基线和 Q 表更新，手算核对一步','固定评估策略和种子集，区分训练探索与评估','观察多个随机种子的回报和失败路径','选读 DQN 或 PPO 原理并本地复现，说明新增复杂度'],accept:'用独立回合评估；终止时不错误 bootstrap；结果包含多种子波动，不只展示最好的一次。'}
];
