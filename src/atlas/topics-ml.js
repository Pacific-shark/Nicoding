import {topic as T,step as S} from './catalog.js';
export const mlTopics=[
 T('bank-first-model','ml','第一份分类模型','用银行营销数据建立逻辑回归，完成训练、阈值选择与留出测试。','入门','浏览器 · Python / NumPy',['ml-problem','ml-splits','ml-linear','ml-metrics','math-info','math-opt'],[
  S('任务与数据','先确定预测发生的时刻，再判断每个字段能否使用。',['ml-problem','ml-splits'],['读数据字典，排除通话结束后才知道的 duration。','在任务书里区分“预测订阅”与“联系带来的增量”。'],['能解释标签、样本粒度与可用时点','能说明分组切分的局限']),
  S('从分数到参数更新','将加权和、概率、损失和梯度连成一轮训练。',['ml-linear','math-info','math-grad'],['完成编码、标准化和梯度更新代码。','运行真实数据实验，保留一组单因素对照。'],['行为检查通过且代码未再次修改','对照只改变一个训练因素']),
  S('决策与留出测试','把训练结果变成可以复核的选择。',['ml-metrics','ml-splits'],['在验证集选阈值后冻结方案。','评估测试集，下载模型参数和实验说明。'],['报告同时包含误报和漏报','测试反馈不参与本轮方案选择']),
 ],{runtime:'bank',scope:'已有 12 小节、4 组 Python 练习、真实训练与冻结后测试；本课题运行在浏览器。',deliver:'数据说明、对照实验、冻结参数、测试报告',data:'UCI Bank Marketing 的 bank.csv，4,521 行；原始文件与下载包内附来源。'}),
 T('housing-pipeline','ml','房价预测与特征管道','复现端到端表格学习流程，比较线性模型与树模型。','进阶','本地 · CPU / Jupyter',['ml-splits','ml-preprocessing','ml-linear','ml-validation','ml-trees'],[
  S('先封存测试集','接手一份地区住房数据，目标是估计房价中位数。先记录目标的单位和截断，再开始探索。',['ml-problem','ml-splits'],['阅读 Get the Data 和 Create a Test Set；记录数据年份与样本单位。','解释收入分层抽样的目的；比较随机划分和分层后的收入分布。','测试集先封存，所有图与缺失值统计来自训练数据。'],['有固定样本 ID、切分种子和目标单位','没有用测试误差筛选特征'],'02_end_to_end_machine_learning_project.ipynb'),
  S('让预处理属于模型','缺失值填补、类别编码和缩放都要在训练折内拟合。',['ml-preprocessing','py-json'],['阅读 Transformation Pipelines；画出数值列与类别列的两条处理分支。','用 ColumnTransformer 组合 SimpleImputer、StandardScaler 和 OneHotEncoder。','构造一个未见类别，检查 transform 的行为；用同一管道保存和推理。'],['管道可以处理一个合法的新样本','验证集没有参与 fit'],'02_end_to_end_machine_learning_project.ipynb'),
  S('比较三条基线','在相同数据和评分下比较常数预测、线性回归和随机森林。',['ml-linear','ml-trees','ml-validation'],['固定交叉验证折，报告每折 RMSE 和平均值。','比较训练误差与验证误差；树的训练误差很小不等于表现更好。','为随机搜索设置候选数和运行预算，保留失败配置。'],['比较表保留同一切分与目标单位','解释模型差异及运行代价'],'02_end_to_end_machine_learning_project.ipynb'),
  S('冻结并交付','最优验证配置确定后，才打开测试集。',['eng-tests','ml-metrics'],['导出包含预处理的完整管道、依赖版本和特征顺序。','用另一进程加载模型，核对同一输入输出一致。','报告一次测试误差；说明旧地区数据不能证明当下房价预测能力。'],['新进程能复算预测','报告明确时间与地区的适用边界'],'02_end_to_end_machine_learning_project.ipynb'),
 ],{source:'handson',scope:'复现第 2 章的预处理、模型比较与交付流程；不要求完成该书所有扩展练习。',deliver:'pipeline、交叉验证表、测试报告、环境清单',data:'Notebook 获取的 California housing 数据；记录下载来源和校验值。',after:'bank-first-model'}),
 T('classifier-bench','ml','分类器对照实验','在同一切分下比较 kNN、朴素贝叶斯、SVM 与随机森林。','进阶','本地 · CPU / scikit-learn',['ml-knn','ml-naive-bayes','ml-svm','ml-trees','ml-metrics','ml-calibration'],[
  S('建立分类评估协议','从二分类开始，再扩展到多分类。分类器必须共享同一份评估协议。',['ml-splits','ml-metrics'],['读 MNIST 与 Performance Measures，先预测“是否为数字 5”。','首次运行可使用分层子集，但每个模型必须使用相同 ID；不能与原仓库全量分数直接比较。','同时报告多数类基线、PR 曲线和混淆矩阵。'],['保存训练与验证索引','没有仅用 accuracy 得出结论'],'03_classification.ipynb'),
  S('距离、概率与间隔','用不同的模型假设解释错误，而不是只比较一个总分。',['ml-knn','ml-naive-bayes','ml-svm'],['为 kNN 和 SVM 建立折内缩放管道。','使用适合输入分布的朴素贝叶斯变体；记录是否把像素二值化。','分别改变 k、C、gamma；保留一组欠拟合与一组过拟合对照。'],['每个参数都有对应的机制解释','至少检查 12 个实际错例'],'05_support_vector_machines.ipynb'),
  S('多分类与阈值','类别预测、排序分数和概率是三种输出。',['ml-metrics','ml-calibration','ml-trees'],['扩展到十分类，比较逐类召回率与宏平均 F1。','在二分类任务上调阈值，记录误报与漏报的变化。','若需要概率，另留校准数据或使用交叉验证校准；评估可靠性图与 Brier score。'],['没有把 SVM 距离当概率','阈值和校准未使用最终测试集'],'03_classification.ipynb'),
 ],{source:'handson',scope:'参考第 3、5 章，自行加入朴素贝叶斯对照；复现实验协议，不要求跑完所有 MNIST 超参数搜索。',deliver:'模型对照表、错例册、阈值决策说明',data:'MNIST；先下载并缓存，子集实验需保存索引。',after:'housing-pipeline'}),
 T('cluster-lab','ml','分群与降维','检验聚类稳定性，区分 PCA 表示与二维可视化。','进阶','本地 · CPU / Jupyter',['ml-unsupervised','ml-pca','ml-dbscan','math-vectors'],[
  S('距离到底在比较什么','先在二维合成数据上检查尺度，再对表格数据做分群。',['ml-unsupervised','ml-preprocessing'],['读 K-Means 和 Limits of K-Means。','只把一个维度放大 100 倍，比较分配结果，再标准化。','固定 K，重复多个初始化；记录 inertia 和簇大小。'],['解释 inertia 不能直接确定业务分群','记录随机初始化带来的变化'],'09_unsupervised_learning.ipynb'),
  S('环形、噪声与密度','把 K-means 放在不适合它的数据上，再试 DBSCAN。',['ml-dbscan'],['用双月或含噪数据比较两个算法。','改变 eps 和 min_samples，统计噪声比例与有效簇数。','说明密度不均匀或高维距离集中时的局限。'],['噪声点没有被当成独立业务群体','比较使用相同尺度处理'],'09_unsupervised_learning.ipynb'),
  S('压缩之后丢了什么','PCA 的目标是保留线性方差结构，不是保留标签。',['ml-pca','ml-validation'],['在训练集拟合 PCA，画累计解释方差。','对比重建误差，以及降维前后的下游验证得分。','用保留数据核对投影；把二维图与聚类结论分开报告。'],['能给出中心化、投影和重建形状','没有根据一张二维图宣布发现真实人群'],'08_dimensionality_reduction.ipynb'),
 ],{source:'handson',scope:'第 8、9 章中的 PCA、K-means、DBSCAN；选做 GMM、层次聚类与非线性嵌入。',deliver:'尺度对照、初始化稳定性表、压缩与重建图',data:'先用固定种子的合成数据，再迁移到课题二的住房特征。',after:'housing-pipeline'}),
 T('ensemble-audit','ml','梯度提升与模型解释','围绕验证误差调参，检查重要性解释的适用边界。','进阶','本地 · CPU / scikit-learn',['ml-trees','ml-boosting','ml-interpret','ml-validation'],[
  S('从一棵树到一个森林','把单树高方差问题转换成可观察的实验。',['ml-trees'],['固定训练子集，比较单树、Bagging 和随机森林。','记录样本抽样、特征抽样和树深度，区分两种随机性。','在可使用 bootstrap 的条件下对照 OOB 与独立验证。'],['说明树之间相关性对平均效果的影响','没有把 OOB 当未来时间上的保证'],'07_ensemble_learning_and_random_forests.ipynb'),
  S('拟合还没解决的误差','Boosting 的后一个模型依赖前面的结果。',['ml-boosting','math-grad'],['平方误差下手算两轮残差修正。','固定总预算，比较学习率与树数的组合，再用验证早停。','选做直方图提升；记录缺失值处理与实现版本。'],['每轮训练只使用训练数据','报告学习率、叶子复杂度与验证曲线'],'07_ensemble_learning_and_random_forests.ipynb'),
  S('检查解释会不会误导','模型依赖某个特征，不等于干预该特征能改变结果。',['ml-interpret','math-stats'],['比较树内置重要性与留出集置换重要性。','增加一个随机特征，再增加一份相关特征副本，观察排名。','把“模型如何预测”与“业务应该做什么”写成两个结论。'],['重要性注明数据集与评分函数','相关性和因果性没有混用'],'07_ensemble_learning_and_random_forests.ipynb'),
 ],{source:'handson',scope:'先复现 Bagging、随机森林和梯度提升机制；XGBoost、LightGBM、CatBoost 属迁移比较，不将它们当同一实现。',deliver:'集成对照、学习曲线、特征解释审查',data:'复用房价课题的数据与封存测试协议。',after:'housing-pipeline',extraSource:['sklearn','examples/inspection/plot_permutation_importance.py']}),
 T('temporal-evaluation','ml','时间序列与回测','将静态预测改成面向未来的滚动实验。','进阶','本地 · CPU / Python',['ml-timeseries','ml-validation','ml-linear','ml-metrics'],[
  S('定义一个未来窗口','把“预测销量”改写成可标注的样本定义。',['ml-problem','ml-timeseries'],['自行生成带周期、趋势与噪声的日序列，固定种子。','在 t 日结束后预测 t+1 日；明确每个滞后和滚动特征的最晚观测时间。','保留最后一段时间，建立昨日值和上周同日值基线。'],['滚动均值先 shift 再 rolling','未来标签未出现在输入中']),
  S('滚动验证与参数选择','用过去训练、向后验证，重复观察不同时间段。',['ml-validation','ml-timeseries'],['实现 expanding-window，标签窗口跨界时留 gap。','在相同窗口比较线性模型和树模型，逐窗报告 MAE。','加入分布变化区段，观察均值分数如何掩盖失败。'],['训练时点始终早于对应验证目标','每窗记录训练范围、gap 与误差']),
  S('写出可以复查的回测','给下一位使用者足够的信息复算每个预测。',['eng-tests','ml-metrics'],['保存逐日预测表及每次拟合使用的最后日期。','冻结选择后在末段评估，分析高峰与低谷的误差。','说明合成数据只检验流程，不能证明真实销售预测效果。'],['每个预测可追溯到训练窗口','报告合成规律与部署数据之间的差距']),
 ],{scope:'原创时间评估课题，承接前面的管道和模型比较。它不是对某个论文分数的复现。',deliver:'时点字典、逐窗指标、逐日回测表',data:'固定种子合成日序列，不下载或上传业务数据。',after:'ensemble-audit'}),
];
