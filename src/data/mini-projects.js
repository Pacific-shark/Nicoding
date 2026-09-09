const mini=(id,domain,name,skills,intro,steps,accept,starter,solution,tests,stretch,lang='python')=>({id,domain,name,skills,intro,steps,accept,starter,solution,tests,stretch,lang,tier:'mini',label:'小项目 · '+({py:'Python',web:'Web',eng:'工程',math:'数学',ml:'机器学习',dl:'深度学习',llm:'AI 应用',rl:'强化学习'}[domain]),deliver:'可运行代码、边界检查结果、自己的解释',minutes:'45–90 分钟'});
export const miniProjects=[
 mini('mini-cart','py','Nico 的优惠结算器',['py-functions','py-containers','py-errors','py-json'],
 '把多件商品结算成一个金额。补齐 calculate(items, discount)，练习把规则、类型与边界连起来。金额统一使用整数分，discount 是 0–100 的整数百分比。',
 ['逐项验证：items 必须是列表；每项含非负整数 price 和正整数 qty，布尔值不算整数','计算商品总额，再应用折扣；结果向下取整到分','空购物车返回 0，非法输入抛出 ValueError，原输入保持不变','用两个例子解释为何先聚合后舍入；再写一条自己的边界检查'],
 '[{price:1001, qty:2}]，折扣 10%，得到 1801 分。100% 折扣得到 0；缺字段、负值、布尔数量均拒绝。此处舍入规则仅为练习契约。',
 `def calculate(items, discount):
    # TODO: 先验证，再聚合和计算
    return 0

print(calculate([{"price":1001, "qty":2}], 10))`,
 `def calculate(items, discount):
    if not isinstance(items, list) or type(discount) is not int or not 0 <= discount <= 100:
        raise ValueError("invalid cart or discount")
    total = 0
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("invalid item")
        price, qty = item.get("price"), item.get("qty")
        if type(price) is not int or price < 0 or type(qty) is not int or qty <= 0:
            raise ValueError("invalid price or quantity")
        total += price * qty
    return total * (100-discount) // 100

print(calculate([{"price":1001, "qty":2}], 10))`,
 ['assert calculate([{"price":1001,"qty":2}],10)==1801','assert calculate([],0)==0 and calculate([{"price":5,"qty":1}],100)==0',
 `for bad in ([{"price":-1,"qty":2}], [{"price":1,"qty":True}], [{"qty":1}], None):
    try: calculate(bad, 0)
    except ValueError: pass
    else: raise AssertionError("invalid input accepted")`,
 `items=[{"price":7,"qty":3}]
assert calculate(items,0)==21 and items==[{"price":7,"qty":3}]
try: calculate(items, True)
except ValueError: pass
else: raise AssertionError("boolean discount accepted")`],
 '把输入换成 JSON 文本，单独编写解析函数；为优惠券与会员折扣的先后顺序写一份新契约，不要直接叠代码。'),
 mini('mini-tasks','web','不会误改状态的任务列表',['web-types','web-objects','web-react'],
 '先实现任务列表的核心状态函数 toggleTask(tasks, id)，再接到 React 页面。tasks 为合法任务数组，id 为字符串；返回新数组，切换匹配项 done，保持其他数据不变。',
 ['按稳定 id 找任务，不依赖数组位置','返回新数组和变化项的新对象，保留其他项引用','未知 id 返回内容不变的新数组；不得修改原数组或原对象','在本地页面接入按钮、空状态与 localStorage，并核对刷新后的数据'],
 'id=a 的 done 从 false 变 true；再次切换变 false。未知 id 不报错。原任务和旧数组仍可代表之前的界面快照。浏览器内检查核心函数，完整 UI 需在你的本地项目完成。',
 `function toggleTask(tasks, id) {
  // TODO: 返回新状态
  return tasks;
}
console.log(toggleTask([{id:"a", title:"Learn", done:false}], "a"));`,
 `function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? {...task, done:!task.done} : task);
}
console.log(toggleTask([{id:"a", title:"Learn", done:false}], "a"));`,
 [`const source=[{id:'a',done:false},{id:'b',done:true}];const out=toggleTask(source,'a');assert(out!==source && out[0]!==source[0] && out[1]===source[1]);assert(out[0].done===true && source[0].done===false);`,
 `assert(toggleTask(toggleTask([{id:'a',done:false}],'a'),'a')[0].done===false);`,
 `const missing=[{id:'a',done:false}];const result=toggleTask(missing,'x');assert(result!==missing && result[0]===missing[0]);assert(toggleTask([],'x').length===0);`],
 '增加筛选和统计，解释哪些是派生值；再模拟坏格式的存储数据，确保导入失败不覆盖现有任务。','javascript'),
 mini('mini-report','eng','查得准的订单日报',['eng-sql','eng-tests','py-containers'],
 '实现 summarize(rows)：按 order_id 聚合合法订单行，返回 {订单ID: 金额总和}。同一订单可以有多行；amount 为整数分，可为负数表示退款。通过这个小函数先建立聚合基线。',
 ['明确一行代表一条订单金额记录，不能把订单数与记录数混用','空输入返回空字典；重复 order_id 累加，不覆盖','自行补正常、退款、空输入、错误类型测试','在 SQLite 中建同样的行数据，用 GROUP BY 对照函数输出'],
 'A 有 100、-20 两条，B 有 50 一条，输出 A:80、B:50。缺少 order_id、空 ID 或非整数 amount 抛 ValueError。',
 `def summarize(rows):
    # TODO: 校验每一行并按订单聚合
    return {}

print(summarize([{"order_id":"A","amount":100},{"order_id":"A","amount":-20}]))`,
 `def summarize(rows):
    if not isinstance(rows,list): raise ValueError("rows must be a list")
    totals={}
    for row in rows:
        if not isinstance(row,dict): raise ValueError("invalid row")
        key, amount=row.get("order_id"),row.get("amount")
        if not isinstance(key,str) or not key.strip() or type(amount) is not int:
            raise ValueError("invalid fields")
        totals[key]=totals.get(key,0)+amount
    return totals

print(summarize([{"order_id":"A","amount":100},{"order_id":"A","amount":-20}]))`,
 ['assert summarize([{"order_id":"A","amount":100},{"order_id":"A","amount":-20},{"order_id":"B","amount":50}])=={"A":80,"B":50}','assert summarize([])=={}',
 `for row in ({"order_id":"","amount":1},{"order_id":"A","amount":True},{"amount":1}):
    try: summarize([row])
    except ValueError: pass
    else: raise AssertionError("invalid row accepted")`,
 `data=[{"order_id":"A","amount":3}]
assert summarize(data)=={"A":3} and data==[{"order_id":"A","amount":3}]`],
 '再加一张一对多商品表，先手算 JOIN 后的行数；构造一个重复统计金额的错误 SQL，用基线抓住它。'),
 mini('mini-gradient','math','能手算的梯度下降器',['math-grad','math-opt','py-functions'],
 '用一个参数观察优化：L(w)=(w-target)²。实现 descend(w, target, rate, steps)，返回包括起点在内的参数轨迹。w、target 为有限实数，rate 为有限正实数，steps 为非负整数；不接受布尔值。',
 ['先在纸上推导梯度 2(w-target)','每轮按 w←w-rate×gradient 更新，记录新参数','核对零步和恰好到目标的情况','比较 rate=0.1、1、1.1 的轨迹，解释收敛、震荡与发散'],
 'descend(0,3,0.1,2) 约为 [0,0.6,1.08]。返回长度为 steps+1，零步保留起点；负步数和非法学习率抛 ValueError。',
 `def descend(w, target, rate, steps):
    # TODO: 验证参数并返回轨迹
    return [w]

print(descend(0,3,0.1,2))`,
 `import math
def descend(w, target, rate, steps):
    if any(type(x) not in (int,float) or not math.isfinite(x) for x in (w,target,rate)):
        raise ValueError("finite numbers required")
    if rate<=0 or type(steps) is not int or steps<0: raise ValueError("invalid rate or steps")
    history=[w]
    for _ in range(steps):
        w=w-rate*2*(w-target)
        history.append(w)
    return history

print(descend(0,3,0.1,2))`,
 ['out=descend(0,3,0.1,2)\nassert len(out)==3 and abs(out[1]-0.6)<1e-9 and abs(out[2]-1.08)<1e-9','assert descend(2,2,0.1,0)==[2] and descend(0,3,1,2)==[0,6,0]',
 `for rate,steps in ((0,2),(0.1,-1),(0.1,True),(float('nan'),1)):
    try: descend(0,3,rate,steps)
    except ValueError: pass
    else: raise AssertionError("invalid arguments accepted")`],
 '自己实现中心差分，与解析梯度比较；改变差分步长，记录在哪些尺度出现数值误差。'),
 mini('mini-metrics','ml','触达模型的指标评估器',['ml-metrics','ml-splits','math-prob'],
 '实现 evaluate(labels, scores, threshold)，用 score>=threshold 判正例，返回 tp、fp、fn、precision、recall。标签只允许整数 0/1，分数和阈值为 [0,1] 有限实数，两列表等长。',
 ['先手工列出每条样本的真实标签与预测结果','累计 TP、FP、FN，再计算指标，不能平均每行的“精确率”','零分母按本练习契约返回 0；拒绝长度不等和范围外数据','比较不同阈值，把误报与漏报换成一份明确的触达代价表'],
 'labels=[1,0,1]，scores=[0.9,0.8,0.2]，threshold=0.5 时 tp=1、fp=1、fn=1，precision=recall=0.5。空数据返回全零。',
 `def evaluate(labels, scores, threshold):
    # TODO: 校验、统计、计算
    return {"tp":0,"fp":0,"fn":0,"precision":0,"recall":0}

print(evaluate([1,0,1],[0.9,0.8,0.2],0.5))`,
 `import math
def evaluate(labels,scores,threshold):
    if not isinstance(labels,list) or not isinstance(scores,list) or len(labels)!=len(scores): raise ValueError("shape")
    if any(type(y) is not int or y not in (0,1) for y in labels): raise ValueError("label")
    if any(type(x) not in (int,float) or not math.isfinite(x) or not 0<=x<=1 for x in [threshold]+scores): raise ValueError("score")
    tp=fp=fn=0
    for y,s in zip(labels,scores):
        pred=s>=threshold
        tp+=int(pred and y==1); fp+=int(pred and y==0); fn+=int(not pred and y==1)
    return {"tp":tp,"fp":fp,"fn":fn,"precision":tp/(tp+fp) if tp+fp else 0,"recall":tp/(tp+fn) if tp+fn else 0}

print(evaluate([1,0,1],[0.9,0.8,0.2],0.5))`,
 ['assert evaluate([1,0,1],[0.9,0.8,0.2],0.5)=={"tp":1,"fp":1,"fn":1,"precision":0.5,"recall":0.5}','assert evaluate([],[],0.5)=={"tp":0,"fp":0,"fn":0,"precision":0,"recall":0}','assert evaluate([1],[0.5],0.5)["tp"]==1',
 `for labels,scores in (([1],[]),([True],[0.2]),([1],[float('nan')]),([2],[0.5])):
    try: evaluate(labels,scores,0.5)
    except ValueError: pass
    else: raise AssertionError("invalid dataset accepted")`],
 '在验证集上选成本最低的阈值，再在保留测试集报告；记录为什么不能用测试结果反复改阈值。'),
 mini('mini-neuron','dl','从零训练一个小神经元',['dl-backprop','math-opt','dl-tensors'],
 '先不用框架，实现线性神经元的一步批量训练 train_step(w,b,xs,ys,rate)。损失是平均平方误差，返回更新后的 (w,b)。为聚焦梯度，输入保证为有限数、非空等长列表，rate>0。',
 ['写出每条样本的预测 wx+b 与误差 e','按同一组旧参数计算所有梯度：dw=mean(2ex)，db=mean(2e)','两项梯度算完后同时更新，避免把部分新参数混进本轮','用有限差分核对梯度，再循环多步观察损失趋势'],
 'w=b=0，xs=[1,2]，ys=[2,4]，rate=0.1：dw=-10、db=-6，返回约 (1,0.6)。不得改变 xs 与 ys。',
 `def train_step(w,b,xs,ys,rate):
    # TODO: 使用同一组旧参数计算平均梯度
    return w,b

print(train_step(0,0,[1,2],[2,4],0.1))`,
 `def train_step(w,b,xs,ys,rate):
    errors=[w*x+b-y for x,y in zip(xs,ys)]
    dw=sum(2*e*x for e,x in zip(errors,xs))/len(xs)
    db=sum(2*e for e in errors)/len(xs)
    return w-rate*dw,b-rate*db

print(train_step(0,0,[1,2],[2,4],0.1))`,
 ['w,b=train_step(0,0,[1,2],[2,4],0.1)\nassert abs(w-1)<1e-9 and abs(b-0.6)<1e-9','assert train_step(2,0,[1,2],[2,4],0.1)==(2,0)',
 'w,b=train_step(1,1,[-1,0,1],[-1,1,3],0.1)\nassert abs(w-(1+0.4/3))<1e-9 and abs(b-1)<1e-9',
 'xs=[1,2];ys=[2,4];train_step(0,0,xs,ys,0.1)\nassert xs==[1,2] and ys==[2,4]'],
 '在本地用 PyTorch 复现同一步并对齐梯度、损失的 mean/sum；再加入非线性和验证集。这个线性神经元是训练机制练习，不代表完整深度网络。'),
 mini('mini-retriever','llm','带证据出口的最小检索器',['llm-rag','llm-tools','eng-tests'],
 '实现 retrieve(query,docs,limit=2)。每份文档有 id 和 terms（词列表），用查询与文档的“去重词交集数量”排序；只返回有命中的文档 ID，同分保留原顺序。',
 ['query 按空白切词，所有词转小写并去重；输入保证为字符串与合法文档列表','按去重交集计分，重复词不额外加分','没有命中返回 []，limit 为非负整数且不接受布尔值','拿到 ID 后展示原文证据，再人工核对能否回答；不要编造未找到的答案'],
 'query="CAT cat care"，含 [cat,care] 的文档得 2 分，含 [cat,cat] 的得 1 分。零 limit 返回空，负 limit 抛 ValueError。这是关键词检索核心，尚未接入大模型。',
 `def retrieve(query,docs,limit=2):
    # TODO: 去重、计分、稳定排序
    return []

print(retrieve("cat care",[{"id":"A","terms":["cat"]},{"id":"B","terms":["cat","care"]}]))`,
 `def retrieve(query,docs,limit=2):
    if type(limit) is not int or limit<0: raise ValueError("limit")
    words=set(query.lower().split())
    scored=[]
    for doc in docs:
        score=len(words & {term.lower() for term in doc["terms"]})
        if score: scored.append((score,doc["id"]))
    scored.sort(key=lambda item:-item[0])
    return [id for _,id in scored[:limit]]

print(retrieve("cat care",[{"id":"A","terms":["cat"]},{"id":"B","terms":["cat","care"]}]))`,
 ['docs=[{"id":"A","terms":["cat","cat"]},{"id":"B","terms":["cat","care"]}]\nassert retrieve("CAT cat care",docs)==["B","A"]','assert retrieve("missing",docs)==[] and retrieve("cat",docs,0)==[]','assert retrieve("cat",docs)==["A","B"]',
 `for limit in (-1,True):
    try: retrieve("cat",docs,limit)
    except ValueError: pass
    else: raise AssertionError("invalid limit accepted")`],
 '先加入权限过滤和版本字段，再接语义检索；准备“同义词、旧版本、无答案”各三个案例，分别测检索命中与回答正确性。'),
 mini('mini-qworld','rl','Nico 的三格寻宝世界',['rl-mdp','rl-q','math-prob'],
 '实现 q_update(q,s,a,reward,next_s,done,alpha=0.5,gamma=0.9)。q 是合法状态×动作的二维列表，done=True 表示真实终止；返回新 Q 表，只更新被访问的格子。练习数据均合法。',
 ['画出 0→1→2 的世界，到达 2 奖励为 1 并真实终止','非终止目标为 reward+gamma×max(q[next_s])；终止只用 reward','新值=旧值+alpha×(目标-旧值)，原 Q 表保持不变','按经验 [(0,右,0,1,False),(1,右,1,2,True)] 重复更新，解释奖励如何向前传播'],
 'Q 全零时，从 1 右移到终点的更新为 0.5；随后从 0 移到 1，目标 0.45，新值 0.225。终止状态已有大 Q 值也不能加入终止目标。',
 `def q_update(q,s,a,reward,next_s,done,alpha=0.5,gamma=0.9):
    # TODO: 创建独立的行，计算 TD 更新
    return q

q=[[0.0,0.0] for _ in range(3)]
q=q_update(q,1,1,1,2,True)
q=q_update(q,0,1,0,1,False)
print(q)`,
 `def q_update(q,s,a,reward,next_s,done,alpha=0.5,gamma=0.9):
    out=[row.copy() for row in q]
    target=reward if done else reward+gamma*max(q[next_s])
    out[s][a]=q[s][a]+alpha*(target-q[s][a])
    return out

q=[[0.0,0.0] for _ in range(3)]
q=q_update(q,1,1,1,2,True)
q=q_update(q,0,1,0,1,False)
print(q)`,
 ['q=[[0.,0.],[0.,0.],[99.,99.]]\nr=q_update(q,1,1,1,2,True)\nassert r[1][1]==0.5 and q[1][1]==0','r=q_update(r,0,1,0,1,False)\nassert abs(r[0][1]-0.225)<1e-9','assert r is not q and all(a is not b for a,b in zip(r,q)) and r[2]==q[2]',
 'v=q_update([[1.,0.],[3.,2.]],0,0,2,1,False,0.1,0.9)\nassert abs(v[0][0]-1.37)<1e-9'],
 '加入 ε-greedy 采样和最大回合步数，单独记录时间截断；用多个随机种子比较随机基线和学习策略。再扩大到网格环境，避免只记住固定轨迹。')
];
