# Nicoding · 第一份分类模型

这是教学用的逻辑回归实现，用 UCI Bank Marketing 数据从零训练一个二分类模型。
它不是原论文结果复现，也不构成营销增量收益证明。代码和网页 worker 执行同一个 model.py。

## 运行

需要 Python 3.10 或以上。在解压目录的终端执行：

```
python -m pip install -r requirements.txt
python model.py --output experiment.json
python model.py --numeric-only --output numeric.json
```

参数：`--epochs 150 --lr 0.3 --l2 0.01`。
调整输入时先固定其他设置，只改变一个因素。训练保存最后一轮参数，不自动早停。
输出含权重、预处理、验证预测、损失历史和实验设置。

网页冻结并验收后，导出 nicoding-bank-frozen.json 放入当前目录，再执行：

```
python model.py --evaluate nicoding-bank-frozen.json --output test-report.json
```

这是复算已有模型，不重新训练。CSV 的 SHA-256 必须与导出记录一致。
不同 NumPy/平台上的浮点计算可能有微小差异。不要修改 CSV 后沿用旧测试报告。

## 数据与许可

- 数据集：Moro, S., Rita, P., & Cortez, P. (2014). Bank Marketing. UCI Machine Learning Repository.
- 来源：https://archive.ics.uci.edu/dataset/222/bank+marketing
- DOI：https://doi.org/10.24432/C5K306
- 数据许可：CC BY 4.0 https://creativecommons.org/licenses/by/4.0/
- 采用 bank.csv，4,521 行，原表的 10% 随机子集。原字节未修改。
- SHA-256：dc8d576e9bda0f41ee891251bd84bab9a39ce576cba715aac08adc2374a01fde
- 原字段说明在 bank-names.txt；衍生的 metadata 在 dataset.json。

## 实验约定

预测新一轮联系之前的订阅标签。duration 在通话后产生，排除。
campaign 包含当前联系，且 day/month/contact 的时点在本练习未充分约定，也排除。
采用 age/balance/previous 和 job/marital/education/housing/loan/poutcome。

相同的九个候选输入组成一组，固定哈希分到约 70/15/15：实际 train=3171、valid=674、test=676。
哈希不含 y 或 duration，不随特征开关变化。相同可见输入不跨集合，但这不等于按客户 ID 去重。
原表缺少可靠客户标识与完整时间信息，不能证明跨客户、跨时间泛化。

训练集拟合标准化和类别词表；未知类别 one-hot 全零，字符串 unknown 是正常类别。
训练目标为均值交叉熵 + l2 * sum(w*w)/2，不惩罚偏置；曲线显示不含 L2 的交叉熵。
全批量梯度下降，零初始化，默认150轮；训练读取训练标签，验证只用于报告。
浏览器不会在冻结前计算并显示测试分数，但下载的原数据并未隐藏测试标签。
这是一项学习约定，不是防作弊或防篡改系统。

网页上的 FP/FN 成本是假设损失，正确决策成本设为0，不等于真实利润。
高订阅概率不代表电话带来的因果增量。后续需要时间外验证、校准、业务对照和权限审查。

## 可做的延伸

1. 保持固定划分，仅比较有无类别特征，并写下损失差异。
2. 保持输入固定，比较学习率、轮数或正则中的一个因素。
3. 实现预算 k 和最低分数的组合规则，补齐同分、空输入等测试。
4. 接入树模型时保留同一评估协议；类别编码、正则和优化设置不能机械照搬。

看过测试结果后做出的任何新选择，都需要新数据进行独立验收。
