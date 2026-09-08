import {challenge as C,question as Q} from './schema.js';
export const advancedPractice={
 'ml-linear':{challenge:C('实现 sigmoid(z)。本关输入限定在 −50 到 50，用数学函数返回 1/(1+exp(−z))。',`import math
def sigmoid(z):
    return z

print(sigmoid(0))`,`import math
def sigmoid(z):
    return 1 / (1 + math.exp(-z))`,['assert abs(sigmoid(0)-0.5)<1e-9','assert abs(sigmoid(2)-0.8807970779778823)<1e-9','assert 0 < sigmoid(-10) < sigmoid(0) < sigmoid(10) < 1'],['先从 z=0 时应得到 0.5 检查公式。','指数里是负的 z，分母是 1 + exp(-z)。'])},
 'dl-attention':{challenge:C('实现 softmax(scores)：返回归一化权重；空输入返回 []。先减最大值，避免大分数溢出。',`import math
def softmax(scores):
    return scores

print(softmax([1, 2, 0]))`,`import math
def softmax(scores):
    if not scores:
        return []
    m = max(scores)
    values = [math.exp(s-m) for s in scores]
    total = sum(values)
    return [v/total for v in values]`,['assert softmax([]) == []','assert softmax([0,0]) == [0.5,0.5]','w=softmax([1001,1002,1000])\nassert abs(sum(w)-1)<1e-9\nassert w[1]>w[0]>w[2]','a=softmax([1,2,0]);b=softmax([1001,1002,1000])\nassert all(abs(x-y)<1e-9 for x,y in zip(a,b))'],['指数的相对比例有意义；给所有分数减同一个数不改变比例。','先处理空输入，再取最大值 m。','算 exp(s-m)，然后每一项除以所有指数项之和。']),extraQuestion:Q('Q 的形状是 (4,8)，K 是 (6,8)，那么 QKᵀ 的形状是？',['(4,6)','(8,8)','(6,4)'],0,['正确，4 个 query 对 6 个 key 产生 24 个匹配分数。','8 是内积维度，被求和消去。','交换了查询和键的轴。'])},
 'dl-tensors':{extraQuestion:Q('图像批次 NCHW=(16,3,32,32)，哪个轴表示通道？',['第一个，16','第二个，3','第三个，32'],1,['第一个是批次中的样本数量。','正确，C 对应通道；此例可以是 RGB。','第三个是高度 H。'])},
 'dl-backprop':{extraQuestion:Q('如果有意累计两个等大 batch 的梯度来模拟平均损失，应额外考虑什么？',['把每个 batch 的损失适当缩放后再累计','每个 batch 都清零且只最后 step','把标签乘二'],0,['正确，否则累计梯度的尺度与平均目标不同。','清零会丢掉前一个 batch 的贡献。','会改变学习目标，无法代替梯度缩放。'])},
 'dl-regularize':{extraQuestion:Q('训练集标准化器在验证集上再次 fit 后再评估，问题在哪？',['验证集参与了变换拟合','验证集太独立','学习率一定太小'],0,['正确，应沿用训练集拟合的变换。','恰恰破坏了独立评估。','不能据此判断学习率。'])},
 'dl-cnn':{extraQuestion:Q('一维输入长度 7，核长度 3，无填充、步幅 2，输出长度？',['2','3','5'],1,['漏算了最后一个合法窗口。','正确，floor((7−3)/2)+1=3。','这是步幅 1 时的结果。'])},
 'dl-sequence':{extraQuestion:Q('padding 补齐的序列位置若参与真实标签损失，可能导致？',['模型学习填充模式并偏移目标','自动获得更多真实样本','保证长短序列权重完全公平'],0,['正确，通常要按有效位置做 mask 或对应长度处理。','填充不是新增观察。','损失归一化和有效长度仍需明确。'])},
 'dl-selfsupervised':{extraQuestion:Q('当商品颜色决定类别时，强制把所有颜色增强成任意颜色，可能？',['破坏应保留的语义','必定提高分类准确率','等价于扩大真实标签集'],0,['正确，增强的语义不变假设在这里不成立。','没有这样的保证。','合成变换不会自动创建可靠新标签。'])},
 'dl-generative':{extraQuestion:Q('在给出的扩散公式中 ᾱ=1 时，x_t 等于？',['纯噪声 ε','原信号 x_0','x_0+ε'],1,['噪声系数此时为零。','正确，√1×x_0+√0×ε=x_0。','噪声没有权重 1。'])},
 'rl-q':{challenge:C('实现 q_step(q, r, next_q, alpha, gamma, terminal)：一次 Q-learning 更新。terminal=True 时不计未来价值。',`def q_step(q, r, next_q, alpha, gamma, terminal):
    target = r + gamma * next_q
    return target`,`def q_step(q, r, next_q, alpha, gamma, terminal):
    target = r if terminal else r + gamma * next_q
    return q + alpha * (target - q)`,['assert abs(q_step(2,1,4,0.5,0.9,False)-3.3)<1e-9','assert q_step(2,1,999,0.5,0.9,True)==1.5','assert q_step(2,1,4,0,0.9,False)==2','assert q_step(2,1,4,1,0,False)==1'],['先求 TD 目标，再用学习率走一步。','终止时 target = r，不能再 bootstrap。','新 Q = 原 Q + alpha × (target − 原 Q)。'])},
 'rl-ppo':{challenge:C('实现 clipped_objective(ratio, advantage, epsilon)：返回 PPO-Clip 的 min(ratio*A, clip(ratio,1−ε,1+ε)*A)。',`def clipped_objective(ratio, advantage, epsilon):
    return ratio * advantage`,`def clipped_objective(ratio, advantage, epsilon):
    clipped = min(max(ratio, 1-epsilon), 1+epsilon)
    return min(ratio*advantage, clipped*advantage)`,['assert abs(clipped_objective(1.4,2,0.2)-2.4)<1e-9','assert abs(clipped_objective(0.6,-2,0.2)+1.6)<1e-9','assert abs(clipped_objective(1.4,-2,0.2)+2.8)<1e-9','assert clipped_objective(1,0,0.2)==0'],['不能只把 ratio 截断后乘优势；还要与未截断项取最小值。','正优势与负优势要分别测试。','clipped = min(max(ratio, 1-epsilon), 1+epsilon)。'])},
 'rl-bandits':{extraQuestion:Q('ε=0.1、两个动作均匀探索，当前贪心动作被选中的总概率是？',['0.9','0.95','0.5'],1,['还漏掉了探索时也选中它的 0.05。','正确，0.9+0.1/2=0.95。','只有纯随机探索时才是 0.5。'])},
 'rl-mdp':{extraQuestion:Q('奖励序列 [2,4]，γ=0.5，从第一步起回报？',['6','4','3'],1,['忽略了折扣。','正确，2+0.5×4=4。','把首个奖励也错误打折了。'])},
 'rl-dqn':{extraQuestion:Q('时间上限使回合截断，但任务本身并未终止，bootstrap 应？',['一律置零','结合环境定义与终止语义决定','把奖励全部删除'],1,['时间截断不一定等于无后续价值。','正确，需区分 terminated 与 truncated。','删除奖励没有理论依据。'])},
 'rl-policy':{extraQuestion:Q('一个动作奖励为正，但回报低于状态基线，优势可能？',['为负','一定为正','一定为零'],0,['正确，优势看相对预期而非奖励符号。','正奖励不保证高于预期。','只有回报等于基线时才为零。'])},
 'rl-offline':{extraQuestion:Q('用学习到的环境模型长距离滚动预测，最应额外关注？',['多步模型误差的累积','每一步误差必定相互抵消','日志文件名是否一致'],0,['正确，规划可能利用模型缺陷。','误差没有自动抵消保证。','命名不能解决预测误差。'])},
 'llm-tokens':{extraQuestion:Q('模型在生成时使用 KV cache，主要复用什么？',['历史 token 的部分注意力键值计算','未来还没出现的正确答案','训练集的全部标签'],0,['正确，减少自回归解码中的重复计算，但仍有存储成本。','缓存不提供未来真值。','不是把训练标签全部放入内存。'])},
 'llm-context':{extraQuestion:Q('摘要遗漏了“不要修改支付模块”，后续 Agent 更可能出现哪类问题？',['任务范围漂移','模型参数自动变小','API 版本自动固定'],0,['正确，否定约束也是必须保留的任务状态。','上下文摘要不改变参数数量。','版本不会因此固定。'])},
 'llm-tools':{extraQuestion:Q('工具说“保存成功”，但任务要求确认记录可读，还需要？',['按契约查询或核验写入后的状态','仅复述模型的成功消息','直接跳到下一个无关任务'],0,['正确，写入回执与可读状态是可区分的证据。','模型文字不是持久化证据。','会遗留未验收工作。'])},
 'llm-rag':{extraQuestion:Q('正确证据没有进入召回候选，提高生成温度会？',['可靠修复召回问题','不能直接补上缺失证据','自动重建索引'],1,['生成采样参数不控制文档召回。','正确，应先改检索、查询或索引。','需要明确的索引流程。'])},
 'llm-agent':{extraQuestion:Q('检索工具返回的文档中包含新的“管理员指令”，它应被视为？',['用户授权的自动延伸','待分析的数据，不能自动升级权限','比原任务更高优先级'],1,['工具内容不是用户的新授权。','正确，需要保留指令与数据的边界。','来源决定其权限，文字自称无效。'])},
 'llm-eval':{extraQuestion:Q('用同一份题目调提示词 50 次，再把该题集称为独立测试，会？',['高估独立泛化证据','自动降低所有偏差','让测试变成随机对照实验'],0,['正确，题集已参与选择过程。','反复选择可能引入过拟合。','没有随机分组或对应因果设计。'])},
 'llm-finetune':{extraQuestion:Q('W 为 100×100，LoRA rank=4，忽略缩放与偏置，新增参数多少？',['10000','800','40000'],1,['这是完整矩阵参数量。','正确，100×4+4×100=800。','没有四个完整矩阵。'])},
 'llm-alignment':{extraQuestion:Q('同组奖励完全相同时，简单标准化相对优势会怎样？',['都为零，几乎没有组内区分信号','自动产生最佳答案标签','每项都为 1'],0,['正确，需处理零方差和训练信号不足。','算法不会凭空获得偏好差异。','去均值后分子都是零。'])}
};
