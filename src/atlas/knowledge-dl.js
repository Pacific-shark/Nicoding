import {K} from './knowledge-schema.js';
const torch=['PyTorch · 基础教程','https://docs.pytorch.org/tutorials/beginner/basics/intro.html'];
const micro=['micrograd · engine.py','https://github.com/karpathy/micrograd/blob/7bc720e951fe422b8f8814aa5aa1b64121d26b4c/micrograd/engine.py'];
const book=['LLMs from scratch · 第 4 章','https://github.com/rasbt/LLMs-from-scratch/blob/ace7c08802b5ad7cfbb1738d8f29f2a0b548d875/ch04/01_main-chapter-code/ch04.ipynb'];
export const dlKnowledge=[
 K('py-classes','类、实例与特殊方法','读懂 Value、Module 和模型对象的基础。',['py-functions','py-references'],[
 ['类把数据与行为放在一起','实例属性保存每个对象自己的状态；方法通过 self 访问该实例。两个 Value(3) 可以数值相同，但仍是两个对象。对于计算图，身份决定是否共享节点，不能只按数值去重。\n\n__init__ 初始化实例，不是“每次调用所有方法前都执行”。类属性由类持有；把可变列表放成类属性可能让所有实例共享。'],
 ['特殊方法与运算符','a+b 会通过相应的特殊方法分派计算，__add__ 可以返回新对象。__radd__ 用于左操作数未处理时的反向分派。它不是直接把字符串方法名随意改成运算符。\n\n__call__ 让实例能像函数一样使用，例如 layer(x)。方法必须明确是否修改当前对象，还是生成新的结果。'],
 ['接口和组合','一个 Module 可以约定 parameters() 返回可训练参数，zero_grad() 清空梯度。Neuron、Layer、MLP 通过组合构成网络，不需要让每个对象继承所有功能。\n\n继承是复用与接口关系，不自动保证子类行为正确。阅读对象时先问“保存什么状态、暴露什么方法、谁拥有它”。'],
 ['用小例子检验共享','下面 Counter 为每个实例创建自己的 n。b=a 只是另一个引用，因此 b.add() 后 a.n 也改变；c 是新实例，保持零。\n\n写模型时参数共享可能是有意设计，不能遇到共享就全部深拷贝。先确定对象所有权。'],
 ],'class Counter:\n    def __init__(self):\n        self.n=0\n    def add(self):\n        self.n+=1\na=Counter()\nb=a\nc=Counter()\nb.add()\nprint(a.n,c.n,a is b)','输出 1 0 True。',['可变类属性可能意外共享。','== 与 is 分别关心值比较和对象身份。'],['b=a 后 b 修改实例属性，a 会看到吗？',['会，引用同一对象','不会，自动复制','仅浮点数会'],0,['赋值没有复制实例。','需要显式构造或复制。','与数值类型无关。']],[['Python · 类','https://docs.python.org/zh-cn/3/tutorial/classes.html']]),
 K('dl-autograd','计算图与自动微分','把链式法则变成可执行的反向传播。',['math-grad','py-classes','py-references'],[
 ['计算图记录依赖','节点代表计算结果，边代表运算对输入的依赖。前向计算同时记录局部运算，反向从标量损失出发传播导数。反向自动微分不是数值差分，也不依赖把整个表达式符号化简。\n\n对于很多参数、一个损失，反向模式可以一次遍历得到所有参数的梯度。'],
 ['局部导数与上游梯度','若 z=a+b，局部导数都为 1；若 z=a×b，则 ∂z/∂a=b，∂z/∂b=a。收到上游梯度 g=∂L/∂z 后，向 a 传 g×b，向 b 传 g×a。\n\n同一个输入可能经多条路径影响损失，所以需要累加贡献。存储父节点时可去重，但一次乘法的两个输入位置都要贡献梯度。'],
 ['为什么必须逆拓扑','先构造让父节点在子节点前的拓扑序，再反向执行。这样一个节点收到所有下游贡献后，才向更上游传播。仅按代码创建顺序倒过来，在复杂共享图里需要仔细验证。\n\n叶子梯度通常累积保存，因此多次 backward 是否先清零必须明确。参数更新与求梯度是两步。'],
 ['共享节点算例','y=x×x+x，x=3。乘法分支贡献 3+3，直连分支贡献 1，dy/dx=7。若用覆盖赋值，部分贡献会丢失。\n\n中心差分 [f(x+h)−f(x−h)]/(2h) 可用于检查光滑点。h 太大会有截断误差，太小会受浮点消减影响；ReLU 的零点需要单独说明导数约定。'],
 ],'def f(x):\n    return x*x+x\nx,h=3.,1e-5\nnumeric=(f(x+h)-f(x-h))/(2*h)\nanalytic=2*x+1\nprint(round(numeric,6),analytic)','两种方法都约为 7。',['+= 不能随意改为 =。','detach 会切断路径，不能当成通用修复。'],['y=x*x+x，x=3 时梯度是？',['3','6','7'],2,['遗漏路径。','遗漏直连贡献 1。','三条贡献 3+3+1。']],[micro,torch],{figure:'autograd'}),
 K('dl-mlp','多层感知机与激活函数','从仿射变换到可以表达非线性的网络。',['math-vectors','dl-tensors','math-grad'],[
 ['层的计算','一层可写为 H=φ(XW+b)。X 为 [B,d_in]，W 为 [d_in,d_out]，b 按样本广播，H 为 [B,d_out]。在 PyTorch Linear 的权重存储约定下，weight 为 [d_out,d_in]，内部使用转置。\n\n参数量是 d_in×d_out+d_out，与当前 batch 大小无关。'],
 ['非线性为何必要','若没有激活，多层仿射变换仍等价于一层仿射变换。深度本身不会凭空带来非线性表达。ReLU=max(0,x)，正区导数为 1，负区为 0，零点由框架选择约定。\n\nsigmoid 和 tanh 在饱和区导数很小；ReLU 的负区可能持续无梯度。激活选择会影响优化，但不能替代合理的数据与初始化。'],
 ['输出与损失','二分类可输出一个 logit 配合稳定的二元交叉熵，多分类可输出 C 个 logits 配合交叉熵。不要在需要原始 logits 的损失之前重复 softmax。\n\n回归输出范围应匹配任务。输出激活、标签编码和损失函数必须作为一个契约检查。'],
 ['参数量算例','输入 3 维、隐藏 4 维、输出 2 维，两层分别有 3×4+4=16 和 4×2+2=10 个参数，共 26 个。把 batch 从 8 改成 32 不改变 26。\n\n这个规模不代表泛化能力，数据量、目标与正则化仍决定是否过拟合。'],
 ],'sizes=[3,4,2]\nparams=sum(a*b+b for a,b in zip(sizes,sizes[1:]))\nprint(params)\nprint([max(0,x) for x in [-2,0,3]])','参数量 26；ReLU 输出 [0,0,3]。',['无激活的多层线性网络不能增加非线性表达。','输出 logits 不等于概率。'],['batch 增大后参数量？',['随之增大','不变','变为零'],1,['样本数不改变层权重。','权重由输入输出维度决定。','模型仍有参数。']],[torch,micro]),
 K('dl-normalization','BatchNorm 与 LayerNorm','先确定统计轴，再理解训练与推理的差别。',['dl-tensors','math-prob','dl-backprop'],[
 ['共同形式','归一化通常以 (x−μ)/√(σ²+ε) 为核心，再乘可学习 γ、加 β。ε 用于数值稳定。关键区别是 μ 和 σ² 沿哪些轴计算，以及推理时从哪里来。\n\n归一化层不是输入数据标准化的同义词，发生位置、参数与训练语义都不同。'],
 ['BatchNorm 的统计轴','对 [N,C,H,W] 的 BatchNorm2d，每个通道使用 N、H、W 上的统计量。训练时一般使用当前批次统计并更新 running stats；eval 时通常用保存的统计量，具体受 track_running_stats 设置影响。\n\n冻结 weight 的梯度不会自动冻结 running stats。迁移学习时必须明确模型模式。很小或非代表性的 batch 可能使统计不稳定。'],
 ['LayerNorm 的统计轴','LayerNorm 通常对每个样本的最后若干维归一化。Transformer 常对 [B,T,C] 的 C 维处理，每个 token 分开计算，不依赖其他样本的 batch 统计。\n\n它在训练和推理中都使用当前输入统计；这不意味着整模型的其他模块也没有 train/eval 区别。'],
 ['一个具体例子','两条向量 [1,3] 和 [10,14]，逐行归一化（暂忽略 ε）均得到 [−1,1]。这说明逐行消除了各自平移与尺度，不表示这两条输入语义相同。\n\n写测试时检查轴、shape 和 affine 参数，不要只看输出均值接近零。'],
 ],'import math\nfor row in [[1.,3.],[10.,14.]]:\n    mean=sum(row)/len(row)\n    var=sum((x-mean)**2 for x in row)/len(row)\n    print([round((x-mean)/math.sqrt(var+1e-5),5) for x in row])','每行约为 [−1,1]，ε 导致微小差异。',['eval 不等于 no_grad。','LayerNorm 的 normalized_shape 决定最后哪些轴。'],['冻结 BatchNorm 的梯度会自动冻结运行统计吗？',['会','不会，模式也要检查','不存在统计'],1,['requires_grad 只控制梯度。','训练模式仍可能更新统计。','BatchNorm 可维护 running stats。']],[['PyTorch · LayerNorm','https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html'],['PyTorch · BatchNorm2d','https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html']]),
 K('dl-resnet','残差连接与 ResNet','让网络学习修正，并保留直接的信息路径。',['dl-cnn','dl-backprop','dl-tensors'],[
 ['残差形式','基本形式 y=x+F(x)。F 学习输入的修正。对输入求导可写为 I+∂F/∂x，直接路径为梯度提供另一条通路，有助于训练深层网络。\n\n这不是“梯度永不消失”的保证，也不是参数不训练。分支自身仍由数据学习。'],
 ['形状必须对齐','相加要求对应轴兼容。通道数或空间大小改变时，可使用投影捷径 P(x)，写成 y=P(x)+F(x)。投影常用 1×1 卷积和适当步幅，但具体结构需看实现。\n\n如果错误地依赖广播，相加可能合法却改变语义，因此残差接口应有 shape 断言。'],
 ['迁移学习','预训练 ResNet 的分类头可以替换；冻结主干与全部微调是两种策略。冻结哪些参数、哪些归一化统计和优化器包含谁都要明确。\n\n“加载权重成功”不等于预处理正确。权重对应的输入缩放、归一化与类别任务需要核对。'],
 ['标量理解','F(x)=.1x 时，y=1.1x，dy/dx=1.1，而不是只有分支的 .1。实际网络使用矩阵 Jacobian，这个算例只帮助看清两条路径相加。\n\n残差不是预测误差的同义词；在 ResNet 中指结构上的修正分支。'],
 ],'x=3.\nbranch=.1*x\nprint(x+branch)\nprint(1+.1)','输出约 3.3 和 1.1。',['不要把结构残差与回归残差混同。','投影捷径也可能有参数。'],['F(x)=.1x，y=x+F(x) 的导数？',['.1','1.1','0'],1,['漏掉直接路径。','直接路径 1 加分支 .1。','两条路径都有贡献。']],[['ResNet 原始论文','https://arxiv.org/abs/1512.03385'],torch]),
 K('dl-embeddings','Embedding 与序列表示','把离散 ID 映射成向量，保留词表与轴的语义。',['dl-tensors','py-containers','math-vectors'],[
 ['查表并非编码整数大小','Embedding 矩阵 E∈R^(V×D)，输入 token ID 选取对应行。ID=100 并不比 ID=2 更重要或更接近某类；ID 只是索引。\n\n输入 [B,T] 查表后是 [B,T,D]。训练更新被使用的行，但具体稀疏梯度和优化器支持取决于实现。'],
 ['特殊 token 与词表','PAD、UNK、BOS、EOS 有不同职责。padding 仅用于凑齐批次，通常需要遮罩损失或注意力；EOS 表示真实结束。把同一个数值兼作两者需要明确训练约定。\n\n自建词表只从训练集拟合；使用固定预训练 tokenizer 时，需保存 tokenizer 版本与特殊 token 设置。'],
 ['顺序信息从哪里来','单独的查表只告诉模型每个位置是什么 token，并未告诉位置序号。RNN 的递归顺序或 Transformer 的位置机制负责引入位置信息。\n\n词向量相似不等于命题真假，向量距离需在具体任务中验证。'],
 ['形状算例','词表四项，每项三维，参数量 12。ID 序列 [2,0,2] 输出三个三维向量，第一个和第三个来自同一行。\n\n共享行意味着相同 token 的使用会共同更新该行，不是每个出现位置都有独立词表参数。'],
 ],'E=[[1,0,0],[0,1,0],[0,0,1],[1,1,1]]\nids=[2,0,2]\nprint([E[i] for i in ids])\nprint(len(E)*len(E[0]))','输出三个三维向量，参数量 12。',['padding 需要显式考虑。','词表更大不自动改善效果。'],['相同 ID 在不同位置查表得到？',['同一行表示','自动不同的词向量','ID 的数值倍数'],0,['位置机制是额外信息。','纯查表不会按位置改变。','ID 仅作索引。']],[torch,book]),
 K('dl-transformer','Transformer 块与因果性','将注意力、逐位置网络、残差与归一化组装起来。',['dl-attention','dl-normalization','dl-resnet','dl-embeddings'],[
 ['一个块不只有注意力','常见 pre-norm 解码器块为 H=X+Attention(LN(X))，Y=H+MLP(LN(H))。注意力混合位置间信息，MLP 对每个位置做非线性变换，两条残差保留路径。\n\npost-norm、不同激活和不同位置机制都存在。讲清所复现架构的顺序，不能把一个变体当全部 Transformer。'],
 ['多头形状','输入 [B,T,C]，h 个头，每头 d=C/h。Q、K、V 常重排为 [B,h,T,d]；分数为 [B,h,T,T]；汇总后合并回 [B,T,C] 再投影。\n\ntranspose 是换轴，reshape 是重解释形状，不能因为元素个数相同就互换。'],
 ['因果遮罩的检验','位置 t 只能看自己和更早位置。在 softmax 前将未来分数设为负无穷，使对应权重为零。padding mask 与因果 mask 解决不同问题。\n\n一个实用测试是改动未来 token，确认过去位置输出不变。若 Dropout 开启，测试要控制随机性或切换到 eval。'],
 ['复杂度与局限','标准全注意力分数矩阵随 T² 增长，长上下文会增加内存与计算。KV cache 缓存生成中已有 token 的 K/V，减少重复计算，但仍占内存。\n\n小模型能跑通因果训练，不表示已获得事实知识或可靠推理能力；架构、数据和训练规模都影响结果。'],
 ],'T=4\nmask=[[int(j<=i) for j in range(T)] for i in range(T)]\nfor row in mask:\n    print(row)','下三角允许位置矩阵；每行只允许本位与过去。',['mask 在 softmax 后简单置零会破坏行归一化，除非重新处理。','注意力权重不自动是因果解释。'],['修改未来 token，过去输出在 eval 下应？',['改变','不变（正确因果实现）','消失'],1,['这会违反因果约束。','可作为因果性测试。','输出仍存在。']],[book,['Attention Is All You Need','https://arxiv.org/abs/1706.03762']],{figure:'attention'}),
 K('dl-token-training','下一 token 预测与损失遮罩','让输入窗口、目标窗口和损失位置严格对齐。',['dl-embeddings','math-info','dl-backprop'],[
 ['输入与目标相差一位','序列 [a,b,c,d] 可以形成输入 [a,b,c] 与目标 [b,c,d]。第 t 个输出预测下一 token，而非复述当前输入。并行计算各位置时依靠因果 mask 防止看见目标。\n\n自回归生成只给过去，训练若暴露未来，会得到看似很低但无法用于生成的损失。'],
 ['交叉熵与形状','输出 logits [B,T,V]，标签 [B,T]。可将前两维合并为 [B×T,V] 和 [B×T]，再计算交叉熵。对 padding 或不计损失的位置使用明确的忽略标记。\n\n按 token 平均和先按序列平均后再平均，遇到不同长度时权重不同。必须说明损失聚合方式。'],
 ['样本窗口与泄漏','长文切重叠窗口时，同一片段不能同时进入训练和验证。先按文档或时间划分，再构造窗口。特殊 token、截断和末尾短块都需记录。\n\n语言模型验证损失依赖 tokenizer 和语料，跨不同分词器直接比较 perplexity 可能误导。'],
 ['微调的遮罩选择','指令微调可以只对回答部分计算损失，也可以对完整序列计算；两者优化对象不同。padding 与真正 EOS 的标签是否保留，需要看 collate 的实现。\n\n示例中 label=-100 仅是常见约定，不代表所有库都自动识别这个值。'],
 ],"tokens=[4,8,3,2]\nx,y=tokens[:-1],tokens[1:]\nprint(x,y)\nlabels=[8,3,2,-100]\nprint('scored positions',sum(t!=-100 for t in labels))",'输入 [4,8,3]，目标 [8,3,2]，三个位置参与评分。',['padding mask 与因果 mask 不相同。','困惑度低不等于回答可靠。'],['训练和生成条件一致需要？',['输入目标未来词','因果遮罩且目标右移一位','删除所有过去词'],1,['会泄漏标签。','每个位置只能使用过去。','过去是预测上下文。']],[['LLMs from scratch · 训练实现','https://github.com/rasbt/LLMs-from-scratch/blob/ace7c08802b5ad7cfbb1738d8f29f2a0b548d875/ch05/01_main-chapter-code/gpt_train.py']]),
 K('dl-vae','VAE：潜变量与变分下界','区分重建、先验和近似后验的职责。',['math-prob','math-info','dl-backprop'],[
 ['为什么引入近似后验','生成模型 pθ(x,z)=p(z)pθ(x|z) 使用潜变量 z。真实后验 pθ(z|x) 通常难算，于是用编码器 qφ(z|x) 近似。\n\n编码器输出分布参数，不只是固定压缩向量；解码器输出给定 z 的数据分布。'],
 ['ELBO 的两项','ELBO=E_q[log pθ(x|z)]−KL(qφ(z|x)||p(z))，是 log pθ(x) 的下界。最大化它等价于最小化负重建对数似然加 KL。\n\n重建项取决于观测分布假设，不能在任意数据上不加说明地使用同一种像素损失。'],
 ['重参数化','对对角高斯，z=μ+σ⊙ε，ε~N(0,I)。随机性移到 ε，梯度通过 μ 与 σ 的确定运算传播。σ 常由 log variance 构造以满足正值。\n\n标准正态先验时 KL=½Σ(μ²+σ²−1−log σ²)。β-VAE 改变 KL 权重，目标与权衡也改变。'],
 ['算例与限制','一维 μ=1、σ²=1，KL=.5。μ=0、σ²=1 时 KL=0，因为分布与先验一致。\n\n只降低重建误差可能忽略潜空间约束，过强 KL 又可能造成后验坍塌。单独手算 KL 不等于实现了完整 VAE。'],
 ],'import math\nfor mu,var in [(1.,1.),(0.,1.),(0.,.5)]:\n    kl=.5*(mu*mu+var-1-math.log(var))\n    print(round(kl,6))','KL 为 .5、0、约 .096574。',['KL 的方向不能随意调换。','解码器分布假设决定重建目标。'],['μ=0、σ²=1，对标准正态先验的 KL？',['0','1','无穷'],0,['两分布相同。','无需额外差异惩罚。','分布支撑相同且相等。']],[['Auto-Encoding Variational Bayes','https://arxiv.org/abs/1312.6114']]),
 K('dl-gan','GAN：交替优化与梯度路径','分清判别器学习和生成器学习的计算图。',['dl-backprop','math-info'],[
 ['两个模型两种职责','生成器 G 将噪声映射为样本，判别器 D 区分真实与生成。原始极小极大目标为 E_x log D(x)+E_z log(1−D(G(z)))。\n\n实践常用非饱和生成器损失 −E_z log D(G(z))，避免某些区域学习信号过弱。它与原始生成器目标要分开标注。'],
 ['判别器步骤','真实与生成样本共同更新 D。此时生成器输出常 detach，避免对 G 累积这一步的梯度。判别器的优化目标和更新参数应明确列出。\n\ndetach 不是把张量变成另一份训练数据，而是切断梯度连接。'],
 ['生成器步骤','计算 D(G(z)) 来更新 G，需要梯度穿过 D 对输入的导数。可以冻结 D 的参数更新，但不能用整个 no_grad 包住判别器前向，否则 G 得不到该路径梯度。\n\n两个优化器的清零和 step 顺序必须核对。BatchNorm 与 train/eval 行为还会影响状态。'],
 ['失败不只看损失','模式坍塌可能让样本看似清晰却缺乏覆盖。固定噪声网格有助观察演变，但不能证明分布匹配。训练损失也不具备普通监督学习那样简单的单调含义。\n\n若 D(G(z))=.1，非饱和损失为 −log .1≈2.303；变为 .8 时约 .223。此算例只说明目标方向。'],
 ],'import math\nfor d in [.1,.5,.8]:\n    print(d,round(-math.log(d),4))','非饱和生成器损失随判别器给生成样本的真概率上升而下降。',['更新 G 时要保留经 D 到输入的梯度。','固定网格不等于全面评估。'],['更新 G 时把 D 前向放进 no_grad 会？',['帮助 G 求导','切断所需路径','只改变图像颜色'],1,['关闭记录会破坏链路。','G 需要穿过 D 的输入导数。','这是计算图变化。']],[['PyTorch · DCGAN 教程','https://docs.pytorch.org/tutorials/beginner/dcgan_faces_tutorial.html']]),
 K('dl-diffusion','扩散模型：加噪、目标与采样','不要把一次加噪或去噪算例当成完整生成。',['math-prob','math-info','dl-backprop'],[
 ['前向过程','常见高斯过程用 x_t=√ᾱ_t x_0+√(1−ᾱ_t)ε，ε~N(0,I)。ᾱ_t 是多个保留系数的累积乘积，不能与单步 α_t 混同。\n\n有了闭式形式，训练可以直接抽一个 t 和噪声得到 x_t，不必每次从第 1 步逐步加噪。'],
 ['噪声预测目标','一种常用简化目标是 E||ε−εθ(x_t,t)||²。网络输入带噪样本与时间条件，学习与去噪相关的量。预测噪声、预测 x_0、预测 v 是不同参数化，需要对应换算和权重。\n\n不应把简化 MSE 不加条件地说成所有扩散模型唯一的精确似然目标。'],
 ['反向采样','生成从噪声开始，结合训练好的预测器和具体采样公式逐步更新。DDPM、DDIM 与其他求解器在随机性、步数和误差上不同；不能用 x_t 减一次预测噪声当完整采样。\n\n引导强度、噪声日程和采样步数都影响质量、覆盖与成本。'],
 ['端点与算例','ᾱ=1 时 x_t=x_0，ᾱ=0 时只剩 ε。x_0=2、ε=−1、ᾱ=.25 时 x_t=1−√.75≈.134。\n\n下面实验只验证前向公式；训练模型还需要网络、数据、时间采样、目标与反向采样实现。'],
 ],'import math\nx0,eps,abar=2.,-1.,.25\nxt=math.sqrt(abar)*x0+math.sqrt(1-abar)*eps\nprint(round(xt,6))','输出 .133975；只是前向混合。',['ᾱ 与 α 是不同量。','好看的样本不证明覆盖或隐私性质。'],['已知加噪公式，是否就完成了生成模型？',['是','否，还需训练与采样算法','只需换背景'],1,['公式没有学到数据分布。','网络、目标和采样都不可省。','与背景无关。']],[['Denoising Diffusion Probabilistic Models','https://arxiv.org/abs/2006.11239']]),
];

