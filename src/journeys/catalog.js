export const journeys = {
 py: {title:'订单为什么算错了？',format:'程序侦探',intro:'拿到一份订单，跟踪数据怎样变成结果，再修复一个隐蔽的共享问题。',rail:'排查路线',stages:['检查输入','跟踪执行','定位共享','交付结果'],lessons:['py-values','py-flow','py-references','py-json'],outputs:['输入契约','执行轨迹','复制边界','订单结果'],brief:'运营需要核对订单汇总与取整方式，优惠标签还串到了原数据上。跟踪金额，再缩小复制范围。'},
 web:{title:'让搜索结果跟上用户',format:'浏览器实验台',intro:'一边操作页面，一边追踪请求；修复快速输入时旧结果覆盖新结果的问题。',rail:'联调步骤',stages:['搭好页面','复现竞态','保护新结果','检查失败状态'],lessons:['web-dom','web-async','web-react','web-http'],outputs:['页面状态','竞态时间线','响应保护','失败处理'],brief:'用户先搜猫粮，接着搜猫砂。猫粮请求比较慢，最后却覆盖了猫砂结果。把页面、请求和响应放到同一条时间线上。'},
 eng:{title:'优惠券被扣了两次',format:'故障调查室',intro:'从一条用户反馈开始，用日志、接口约定和回归证据完成一次修复。',rail:'调查进程',stages:['阅读现场','缩小根因','选择修复','回归与交接'],lessons:['eng-debug','eng-contract','eng-transaction','eng-tests'],outputs:['时间线','根因假设','修复方案','回归记录'],brief:'用户只提交一次订单，却少了两张优惠券。客户端发生了重试；第二次请求是否应该再次扣券？'},
 math:{title:'把公式变成可观察的变化',format:'数学工作台',intro:'移动参数，先预测曲线与向量怎么变，再用同一组数核对公式。',rail:'探索顺序',stages:['拉动向量','观察局部变化','走一步梯度','检验概率直觉'],lessons:['math-vectors','math-grad','math-opt','math-prob'],outputs:['线性变换','局部导数','更新轨迹','条件概率'],brief:'用图、数值和符号描述同一个问题。每次只改变一个量，观察变化，避免把公式记成孤立的符号。'},
 ml:{title:'这一轮，该触达哪些用户？',format:'决策实验室',intro:'拿到模型分数后，你还要决定阈值、触达预算和错误代价。',rail:'决策流程',stages:['确认任务与数据','在验证集选阈值','解释错误样本','冻结方案并验收'],lessons:['ml-problem','ml-metrics','ml-splits','ml-recommend'],outputs:['业务假设','阈值方案','误差分析','保留集报告'],brief:'团队给你一份购买意向分数。高分不等于触达一定有收益；先声明成本假设，在验证集作选择，最后才打开保留集。'},
 dl:{title:'商品评论分流器',format:'项目制学习',intro:'从接到需求，到交付一份可复现的模型报告。',rail:'项目推进',stages:['接到任务','跑通训练','选择模型','看局部线索','读懂顺序','对齐关键信息','利用未标注数据','交付与边界'],lessons:['dl-tensors','dl-backprop','dl-regularize','dl-cnn','dl-sequence','dl-attention','dl-selfsupervised','dl-generative'],outputs:['任务与输入契约','训练记录与参数','验证集选择','卷积窗口记录','顺序对照','注意力计算','预训练实验设计','模型与交付报告'],brief:'每天有一批商品评论需要人工处理。请先做一个二分类基线，区分正向与负向评论。交付模型、评估结果和失败案例；不确定的评论交回人工。'},
 rl:{title:'让 Nico 自己学会找出口',format:'策略训练场',intro:'先亲自走一遍，再让智能体从奖励中学习，观察它为什么会选这条路。',rail:'训练进程',stages:['探索环境','设计奖励','学习动作价值','在变化后复测'],lessons:['rl-mdp','rl-bandits','rl-q','rl-offline'],outputs:['手动轨迹','奖励设定','Q 表与学习曲线','新环境复测'],brief:'起点到出口之间有障碍和一个捷径。你负责定义每一步的代价，让智能体学会长期回报，而不是只盯着眼前奖励。'},
 llm:{title:'客服助手为什么答错了？',format:'证据与调用审计',intro:'从错误回答逆向追踪：是没找到资料、引用过期，还是工具参数不符合约定？',rail:'审计步骤',stages:['检查知识来源','调试检索','校验工具调用','提交有依据的答复'],lessons:['llm-context','llm-rag','llm-tools','llm-eval'],outputs:['资料选择','检索证据','参数校验','可追溯答复'],brief:'用户问定制商品能否七天无理由退货。旧版规则说可以，现行规则有例外。把检索证据与工具调用分别核验，证据不足时不能编造政策。'}
};
export const journeySources = {
 py:[['Python 对象与复制','https://docs.python.org/3.12/library/copy.html']],
 web:[['MDN · AbortController','https://developer.mozilla.org/en-US/docs/Web/API/AbortController']],
 eng:[['RFC 9110 · 幂等方法','https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2']],
 math:[['MIT · 微积分课程','https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/']],
 ml:[['scikit-learn · 分类指标','https://scikit-learn.org/stable/modules/model_evaluation.html#confusion-matrix']],
 dl:[['PyTorch · 训练循环','https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html'],['PyTorch · Attention','https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html']],
 rl:[['Gymnasium · Q-learning 训练智能体','https://gymnasium.farama.org/introduction/train_agent/']],
 llm:[['原始 RAG 论文','https://arxiv.org/abs/2005.11401'],['JSON Schema · 对象约束','https://json-schema.org/understanding-json-schema/reference/object']]
};
