import {topic as T,step as S} from './catalog.js';
export const aiTopics=[
 T('rag-evidence','llm','做一个能给出证据的问答系统','把索引、检索与回答分别检查，再组合成 RAG。','进阶','本地 · 检索可离线；生成模型另行配置',['llm-tokens','llm-context','llm-rag','llm-eval','llm-retrieval-eval'],[
  S('先做文档与问题集','没有可查的原文，就无法核对回答。',['llm-rag','py-json'],['参考 Notebook 的 indexing 部分，改用自己有权使用的少量文档。','为每个片段记录文档 ID、版本、页码或段落。','先写 20 个问题：直接命中、多段组合、无答案各有样本，留一部分作最终评估。'],['每个问题的参考证据可定位','无答案问题没有伪造参考答案'],'rag_from_scratch_1_to_4.ipynb'),
  S('只检验检索','先隐藏生成模型，检查找到的片段是否包含答案。',['llm-retrieval-eval','math-vectors'],['实现词法检索基线，再比较向量检索。','固定问题集，改变块大小或 top-k 中的一项，记录 Recall@k 与重复片段。','错误按没召回、截断上下文、版本过期分类。'],['召回指标基于人工证据标注','没有把相似度当回答正确率'],'rag_from_scratch_1_to_4.ipynb'),
  S('生成与引用分开验收','生成模型需要把结论绑定到证据。',['llm-context','llm-eval'],['参考 retrieval / generation 链路，逐句检查引用是否支持结论。','加入无答案出口，测试文档里的诱导指令不会覆盖任务规则。','记录模型版本、总 token、耗时；若使用外部 API，先自行设置预算。'],['无证据时能明确停止','报告包含检索失败与生成失败两类'],'rag_from_scratch_1_to_4.ipynb'),
 ],{source:'rag',scope:'复现索引—检索—生成结构并补充评估。原 Notebook 含较旧 API、外部模型和追踪服务，需迁移依赖；本站不会替你调用付费服务。',deliver:'文档索引、问题集、检索对照、引用审查',data:'少量自有文档；原仓库仅作为代码阅读参考，不搬运其文档内容。'}),
 T('tool-agent','llm','给助手一个有边界的工具','从结构化输入走到 MCP，再加入停止与失败处理。','进阶','本地 · Python / MCP SDK',['llm-tools','llm-agent','eng-contract','eng-transaction','llm-eval'],[
  S('读清工具协议','工具描述、参数模式和真正执行的代码是三件事。',['llm-tools','eng-contract'],['定位 list_tools、call_tool 和 fetch_website，画出调用关系。','记录必需参数、未知工具、缺少字段与网络异常的行为。'],['能指出参数校验发生的位置','清楚协议不等于模型能力'],'examples/servers/simple-tool/mcp_simple_tool/server.py'),
  S('把能力缩到需要的范围','先把网页获取器改成只读本地样本文档的查询工具。',['llm-agent','py-json'],['只允许预先列出的文档 ID，禁止直接接受任意文件路径。','设置输入长度、返回长度、超时和结构化错误。','在没有模型时直接调用工具，验证非法 ID 与空内容。'],['输入无法越过约定边界','工具错误可由调用方识别'],'examples/servers/simple-tool/mcp_simple_tool/server.py'),
  S('控制循环并留下轨迹','模型建议调用工具之后，执行器仍负责决定能否执行。',['llm-agent','llm-eval','eng-transaction'],['在自己的控制器里设置最大步数和总预算。','对重复请求、超时与无新信息分别定义停止条件。','先用固定的模拟工具请求测试控制器，再接自己选择的模型。'],['预算耗尽时确实停止','模拟控制流测试没有被写成模型质量评估']),
 ],{source:'mcp',after:'rag-evidence',scope:'参考官方 SDK 的 simple-tool，改造成只读工具；不直接把任意 URL 获取能力暴露到公网。',deliver:'工具契约、边界测试、调用轨迹与停止条件',data:'自建本地文档，不接入个人聊天或企业知识库。'}),
 T('instruction-tuning','llm','理解一次指令微调','从数据格式、标签遮罩到训练与保留集评估。','深入','本地 · PyTorch；GPU 与权重另行准备',['llm-finetune','dl-token-training','llm-eval','llm-alignment'],[
  S('把指令变成训练样本','格式模板和分词方式决定损失优化的对象。',['llm-tokens','llm-finetune'],['阅读 format_input、InstructionDataset 与 collate。','对同一个短样本打印 token、目标与 ignore_index。','先按来源划分数据，检查训练和评估模板近重复。'],['padding 位置没有贡献无意义损失','明确是否对提示词计算损失'],'ch07/01_main-chapter-code/ch07.ipynb'),
  S('控制资源再运行','先用一个小批次检查内存，再决定能训练多大。',['dl-backprop','llm-finetune'],['记录权重许可、数据许可、精度、序列长度和可训练参数。','比较全参数与 LoRA 的机制差别；本课题先复现原仓库训练流程。','保存 optimizer、随机种子与模型配置，记录中断恢复方式。'],['没有把 LoRA 等同于量化','实际资源预算可复查'],'ch07/01_main-chapter-code/ch07.ipynb'),
  S('比较行为而不只看损失','微调可能改善格式，也可能损伤原有能力。',['llm-eval','llm-alignment'],['在同一保留题集比较微调前后，分开评价格式、正确性与拒答。','人工检查评估器分歧，不只依赖一个模型打分。','选读 DPO / GRPO，说明它们的训练数据与目标如何不同于 SFT。'],['评估样本不参与训练和调参','质量、成本与退化行为都记录'],'ch07/01_main-chapter-code/ch07.ipynb'),
 ],{source:'llms',after:'tool-agent',scope:'参考第 7 章指令微调，网页不下载权重、不执行 GPU 训练；先完成数据与损失检查。',deliver:'样本格式、标签检查、训练配置、前后对照',data:'自己有权使用的指令数据与可用权重；运行前核对大小和许可。'}),
 T('bandit-policy','rl','在探索与利用之间做选择','用可控老虎机环境比较随机、贪心与 ε-greedy。','入门','浏览器推演 + 本地 Python',['rl-bandits','math-prob','math-stats'],[
  S('定义能知道和不能知道的量','真实收益率只供评估器使用，策略只能看到实际反馈。',['rl-bandits','math-prob'],['构造三个 Bernoulli 臂，固定真实概率与种子。','分别维护每个臂的拉取次数和样本均值。'],['策略没有读取真实概率','奖励更新只用已选择臂的结果']),
  S('比较探索规则','一个幸运开局可能让纯贪心停在错误选项上。',['rl-bandits'],['比较随机、纯贪心和固定 ε 的策略。','记录累计奖励及按真实期望计算的伪遗憾，区分两者的随机性。'],['预算与种子集合一致','不只展示最好的单次运行']),
  S('检验结论边界','独立同分布收益是假设，不是营销世界的默认状态。',['math-stats','rl-mdp'],['增加一次收益率变化，观察均值估计的滞后。','解释当前模型没有长期状态影响，因此不是完整 MDP。'],['报告多种子的均值和波动','知道何时需要状态与长期回报']),
 ],{scope:'原创有限老虎机实验；不用于真实自动营销或财务决策。',deliver:'策略实现、累计奖励与遗憾、多种子比较',data:'可复查的合成奖励。'}),
 T('dqn-reproduction','rl','从 Q 表走到 DQN','先核对 Bellman 更新，再复现经验回放与目标网络。','进阶','本地 · CPU / PyTorch / Gymnasium',['rl-mdp','rl-q','rl-dqn','dl-backprop'],[
  S('手算一步更新','把终止、奖励与 bootstrap 分开处理。',['rl-mdp','rl-q'],['在小网格中手算 Q-learning 与 SARSA 的不同目标。','给真实终止和时间截断分别写用例。'],['真实终止不 bootstrap','知道截断是否代表任务终止取决于任务定义']),
  S('读懂回放与目标网络','DQN 从旧轨迹学习，目标网络提供较慢变化的目标。',['rl-dqn','dl-backprop'],['定位 ReplayBuffer、QNetwork、目标计算与参数同步。','检查脚本如何用 final_observation 修复自动重置后的状态。','明确 terminations 与 truncations 进入回放记录的方式。'],['回放中的下一状态不是下一回合开头','目标计算不向目标网络反传'],'cleanrl/dqn.py'),
  S('运行与对照','先做短预算冒烟，再跑多个种子。',['rl-dqn','ml-metrics'],['依据仓库依赖说明启动 CartPole-v1，记录脚本 SHA。','分别关掉回放或缩短目标更新周期中的一项做对照。','独立评估回合关闭训练探索，报告回报分布。'],['短预算运行不冒充论文复现','训练曲线与独立评估分开'],'cleanrl/dqn.py'),
 ],{source:'cleanrl',after:'bandit-policy',scope:'机制级 CartPole DQN 复现，包含终止与截断审查；不是 Atari 基准复现。',deliver:'更新算例、源代码注释、训练和评估表',data:'Gymnasium CartPole 环境；环境版本与种子必须保存。'}),
 T('ppo-reproduction','rl','复现一条 PPO 训练链路','串起采样、GAE、概率比与截断目标。','深入','本地 · CPU / PyTorch / Gymnasium',['rl-policy','rl-ppo','math-info','dl-backprop'],[
  S('跟踪一次 rollout','旧策略概率必须来自采样时的策略。',['rl-policy','rl-mdp'],['在单文件实现中定位 obs、actions、logprobs、rewards、values。','画出并行环境与时间轴的形状，确认展平没有打乱对应关系。'],['旧 logprob 不在更新后重新计算','终止边界与价值估计清楚'],'cleanrl/ppo.py'),
  S('手算 GAE 与截断','优势估计和策略更新是两个不同步骤。',['rl-policy','rl-ppo'],['用三步轨迹手算 TD 残差与 GAE。','选择正负优势各一个样本，比较 ratio=0.7、1.0、1.3 时的目标。','审查实现把 termination 与 truncation 合并的行为，说明与任务 horizon 的关系。'],['负优势样本的 min 分支正确','没有声称 clipping 是严格信赖域约束'],'cleanrl/ppo.py'),
  S('对照与复查','PPO 的实现细节很多，只改一项更容易解释。',['rl-ppo','math-stats'],['固定 rollout 预算，比较两个 clip_coef 或 update_epochs。','同时记录回报、熵、近似 KL、clip fraction 和价值损失。','至少三个种子，说明预算不足时的不确定性。'],['对照实际采样步数一致','没有只凭单条平滑曲线宣布优越'],'cleanrl/ppo.py'),
 ],{source:'cleanrl',after:'dqn-reproduction',scope:'单文件离散动作 PPO 复现；不把一次 CartPole 实验外推到大模型强化学习。',deliver:'rollout 形状表、GAE 算例、指标与多种子对照',data:'CartPole-v1；记录 Gymnasium 版本和 horizon。'}),
 T('sac-control','rl','用 SAC 处理连续动作','理解熵正则、双 Q 与动作变换，再比较连续控制。','深入','本地 · PyTorch / Gymnasium',['rl-sac','rl-policy','rl-offline','math-info'],[
  S('连续动作的概率','动作经过 tanh 压缩后，密度也随之改变。',['rl-sac','math-prob'],['定位 Actor 的均值、方差、重参数化采样与 tanh。','解释 logprob 中变换修正项的来源和数值稳定处理。'],['动作范围与环境要求一致','概率没有漏掉变量变换'],'cleanrl/sac_continuous_action.py'),
  S('跟踪三种更新','critic、actor 和温度的目标分别是什么。',['rl-sac','rl-policy'],['定位双 Q 最小值、目标网络与熵项。','区分 actor 的梯度路径与 critic 目标的停止梯度。','先选简单连续环境冒烟，避免直接启动昂贵模拟。'],['损失符号和每项更新对象明确','目标熵与温度设置可追溯'],'cleanrl/sac_continuous_action.py'),
  S('比较与扩展','离策略可以复用轨迹，但固定离线数据会产生新的问题。',['rl-sac','rl-offline'],['比较固定温度与自动温度，在相同交互预算下评估。','记录多种子回报；讨论分布外动作的 Q 估计。','说明为什么不能把在线 SAC 直接当成可靠离线 RL。'],['模型选择不用最终评估回合','数据支持范围在结论中说明'],'cleanrl/sac_continuous_action.py'),
 ],{source:'cleanrl',after:'ppo-reproduction',scope:'连续控制机制复现；MuJoCo 等环境可能有额外安装条件，先以小环境验证流程。',deliver:'动作密度推导、更新图、温度对照与评估',data:'明确选择的 Gymnasium 连续动作环境。'}),
];
