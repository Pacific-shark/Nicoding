import {lesson as L,question as Q,challenge as C} from './schema.js';
export const python = [
L('py-values','变量与对象',"认识变量、赋值和几种常见数据类型。",[],[
 ["赋值语句怎么读", "假设要计算三袋猫粮的总价。单价是 20 元，数量是 3，可以先把这两个数分别记下来：\n```python\nprice = 20\ncount = 3\ntotal = price * count\nprint(total)  # 60\n```\n`price`、`count`、`total` 是我们起的变量名。执行 `price = 20` 时，Python 先计算等号右边，再让左边的名字指向结果。后续写 `price`，就能取到它指向的值。这个过程叫赋值。\n\n第三行先取出 20 和 3，相乘得到 60，再赋给 `total`。第四行才把结果显示出来；赋值本身不会自动打印。`#` 后面是注释，用来说明代码，不参与执行。"],
 ["数字和字符串", "`20` 是整数，`0.5` 是浮点数，`\"20\"` 是字符串。引号里的内容按文本处理，即使看起来全是数字。\n```python\nprint(20 * 2)    # 40\nprint(\"20\" * 2)  # 2020\nprint(type(20))  # <class 'int'>\n```\n同一个乘号，对数字表示相乘，对字符串表示重复。表单和接口中读到的 `\"20\"` 因而不能直接当价格使用。已确认内容确实是整数文本时，可以用 `int(\"20\")` 转换；`int(\"免费\")` 则会报错。错误怎么处理，后面会单独练。\n\n还有一种常见类型是布尔值 `bool`，只有 `True` 和 `False`，常用来表示判断结果。例如 `20 > 10` 得到 `True`。"],
 ["重新赋值会影响谁", "先自己算一遍，再运行：\n```python\nprice = 20\nsaved_price = price\nprice = 18\nprint(price)        # 18\nprint(saved_price)  # 20\n```\n第二行执行时，`saved_price` 指向当时的整数 20。第三行只改变 `price` 的指向，`saved_price` 没有被重新赋值，所以仍是 20。\n\n赋值不会建立一条“以后自动跟着变化”的公式。前面算出的 `total` 也不会因为后来改了 `price` 自动更新，要重新执行计算。列表内部被修改是另一种情况，学容器时再区分。"],
 ["先记住这几个符号", "`=` 用于赋值，`==` 用于比较值是否相等。`*` 是乘法，`/` 是除法。整数做 `/` 运算也可能得到浮点数，例如 `20 / 2` 的结果是 `10.0`。\n\n这一节先练习读懂每行执行后的变量值。`is`、浮点精度等细节暂时不必全部记住，遇到相关课程时再展开。"]
],`price = 20
count = 3
total = price * count
print(total)
print(type(total))
print("20" * 2)`, '总价是 60，类型显示 <class \'int\'>；最后一行是字符串 2020。', ['浮点数存在表示误差；金额生产系统通常用整数分或 Decimal。','== 比较值，is 比较是否是同一个对象；不要用 is 比较数字。'],[
 Q('a = 10; b = a; a = 20 后，b 是多少？',['20','10','无法确定'],1,['重新绑定 a 不会重新绑定 b。','正确。b 仍绑定到原来的整数值 10。','这里的行为是确定的，不涉及随机性。']),
 Q('接口传入 price = "20"，想计算两件总价，应该先做什么？',['直接 price * 2','先明确格式并转换成数值','把变量改名为 number'],1,['这会得到字符串 "2020"。','正确。先确认文本表示有效价格，再转换成数值。','名字不会改变类型。'])
],['py'],'把最近项目的 5 个变量写下来，标注类型、来源和允许的范围。', {priority:1,depth:'核心必修'}),
L('py-flow','条件与循环',"用条件选择分支，用循环重复处理数据。",['py-values'],[
 ["if：条件满足才执行", "“满 100 元减 20 元”要包含恰好 100 元的情况，所以比较符号用 `>=`。\n```python\namount = 100\nif amount >= 100:\n    amount = amount - 20\nprint(amount)  # 80\n```\n冒号后缩进的行属于 `if` 分支。只有条件为 `True` 才会执行。最后的 `print` 没有缩进，不属于分支，无论是否优惠都会执行。\n\n如果要从多个结果中选一个，用 `if / elif / else`：从上往下检查，找到第一个满足条件的分支后，就不再检查同组后面的分支。两个独立的 `if` 则会分别判断，可能都执行。"],
 ["for：每次取出一个元素", "列表 `[60, 100, 140]` 存着三个价格。`for price in prices` 每次取出其中一个，把它交给本轮的 `price`。\n```python\nprices = [60, 100, 140]\ntotal = 0\nfor price in prices:\n    total = total + price\nprint(total)  # 300\n```\n第一轮是 `0 + 60`，第二轮是 `60 + 100`，第三轮是 `160 + 140`。变量 `total` 保留前几轮的累计结果，不能把 `total = 0` 放进循环体，否则每轮都会清零。\n\n接下来的可运行示例会在每轮先计算单件优惠，再累加，得到 260。它和“把原价先汇总、整单只减 20”是两条不同的规则。"],
 ["循环的起点和终点", "`range(3)` 产生 0、1、2，不包含 3。空列表没有元素，所以 `for x in []` 一次也不执行；循环前把总额设为 0，空输入便能自然得到 0。\n\n`continue` 跳过本轮剩余语句，接着处理下一个元素；`break` 直接结束这一层循环。`while` 则在每轮前检查条件，需要保证循环中有机会让条件变成假。例如计数时忘了更新计数器，就可能一直运行。"]
],`prices = [60, 100, 140]
total = 0
for price in prices:
    if price >= 100:
        price = price - 20
    total += price
print(total)
print(list(range(3)))`,'输出 260 和 [0, 1, 2]。先逐项优惠，再汇总。',['两个独立的 if 可能都执行；这和 if/elif 不同。','不要边遍历列表边随意删元素，容易跳过项目。'],[
 Q('满 100 减 20，100 元应进入哪个条件？',['amount > 100','amount >= 100','amount < 100'],1,['严格大于漏掉了 100 这个边界。','正确，等于也包含在内。','方向相反。']),
 Q('for x in [] 的循环体执行几次？',['一次，x 是 None','零次','无限次'],1,['空列表没有元素可赋给 x。','正确；因此循环前应初始化结果。','for 会在迭代结束时退出。'])
],['py'],'给当前业务的一条优惠规则列出阈值前、阈值上、阈值后三组例子。',{priority:1,depth:'核心必修'}),
L('py-functions','函数与参数',"定义函数，传入参数，并取回计算结果。",['py-values','py-flow'],[
 ["定义和调用是两件事", "同一条折扣规则会用在不同价格上，可以把它写成函数：\n```python\ndef discount(price, rate):\n    return price * (1 - rate)\n\nresult = discount(200, 0.1)\nprint(result)  # 180.0\n```\n`def` 开始定义，后面是函数名和括号内的参数。缩进的部分是函数体。Python 执行到定义时会建立这个函数，调用 `discount(200, 0.1)` 时才执行里面的计算。\n\n这里约定 `rate` 是减免比例，`0.1` 表示减 10%，也就是付原价的 90%。先把单位和含义说清楚，才知道公式有没有写反。"],
 ["参数如何进入函数", "定义中的 `price`、`rate` 叫形参；调用中的 `200`、`0.1` 叫实参。这次调用开始时，前者分别取得后者的值。计算完成后，下次调用可以换一组值。\n\n`discount(200, 0.1)` 按位置对应参数；`discount(price=200, rate=0.1)` 按参数名对应。函数内部产生的局部变量通常只在这次调用中使用，不会自动成为函数外的同名变量。"],
 ["return 和 print 的区别", "`return` 把结果交回调用者，同时结束当前调用。`print` 只把内容显示出来。请比较这段有问题的函数：\n```python\ndef show_total(price, count):\n    print(price * count)\n\nvalue = show_total(20, 3)  # 屏幕显示 60\nprint(value)             # 又显示 None\n```\n屏幕上的 60 来自函数内部的 `print`。这个函数没有 `return`，所以交给 `value` 的是 `None`，表示没有返回一个具体结果。若后续还要拿总价计算，就应写 `return price * count`，由调用方决定什么时候打印。\n\n只写 `price * count` 也不够：表达式虽然被算出，却没有被返回。接下来的练习就是修复这类错误。"],
 ["让函数只负责约定的事", "这一关只要求算折后金额，输入约定为非负价格和 0 到 1 的减免比例。检查三个简单结果：没有优惠时应返回原价；减免 100% 时应为 0；普通优惠应按公式计算。\n\n以后把它放进真实接口，还要处理字符串、负数和越界比例。这些检查可以逐步加，但不要顺手把文件保存、页面显示也全塞进计算函数。职责少，出错时更容易找到原因。"]
],`def discount(price, rate):
    price * (1 - rate)

result = discount(200, 0.1)
print(result)`,'输出 None。表达式的值被算出来了，却没有 return。',['在函数里 print(180) 后，调用者拿到的仍可能是 None。','return 后面的同一执行路径不会继续执行。','默认参数不是每次调用都重新计算，后面的“引用与默认参数”会实验。'],[
 Q('原示例为什么输出 None？',['浮点乘法失败了','函数缺少 return','print 不能打印小数'],1,['乘法正常执行；问题在值没有交还调用者。','正确。没有显式返回值就隐式返回 None。','print 可以打印小数，也可以打印 None。']),
 Q('希望页面和测试都能复用折扣计算，函数更适合怎样写？',['返回金额，由调用方决定怎么展示','只打印一句话','在函数中同时改页面和数据库'],0,['正确。把计算与副作用分开，输入输出更清楚。','只有显示效果，调用者不方便继续计算。','职责太多，会让边界和测试难以控制。'])
],['fn'],'从 AI 最近写的代码找一个函数，用一句话说明输入、返回值和副作用。',{priority:1,depth:'核心必修',challenge:C('修复 discount，使 discount(200, 0.1) 返回 180.0；支持零折扣和全额折扣。',`def discount(price, rate):
    price * (1 - rate)

result = discount(200, 0.1)
print(result)`,`def discount(price, rate):
    return price * (1 - rate)`,['assert discount(200, 0.1) == 180.0','assert discount(75, 0) == 75','assert discount(75, 1) == 0','assert abs(discount(39, 0.2) - 31.2) < 1e-9'],['函数执行完后，谁把结果交给调用者？','比较 print(value) 和 return value。','在计算表达式前加上 return，保持缩进。'])}),
L('py-containers','列表、字典与集合',"用列表保存顺序，用字典查字段，用集合去重。",['py-functions'],[
 ["列表存一组有顺序的值", "`prices = [20, 30, 10]` 是一个列表。下标从 0 开始，`prices[0]` 是 20，`prices[-1]` 是最后一项 10。`prices[1:3]` 取下标 1、2，不包含右端 3。\n\n用 `len(prices)` 取长度，用 `prices.append(40)` 在末尾添加一项。添加会修改原列表；`append` 的返回值是 `None`，因此不要写 `prices = prices.append(40)`。"],
 ["字典按名字取值", "订单里有用户、金额等不同字段，适合用字典表示：\n```python\norder = {\"user\": \"nico\", \"amount\": 20}\nprint(order[\"user\"])    # nico\nprint(order[\"amount\"])  # 20\n```\n冒号左边是键，右边是值。通过键取字段，不需要猜它位于第几个。多笔订单可以组成列表：外层列表的一项是一笔订单，内层字典的一个键对应一个字段。\n\n遍历字典 `for key in order` 默认取键；需要键和值时用 `for key, value in order.items()`。字典键必须可哈希，字符串是常见选择，列表不能直接当键。"],
 ["按用户累计金额", "有两笔属于 nico 的订单，金额分别为 20、30。用用户名当键，总额当值，每读一笔就累加：\n```python\ntotals = {}\nfor order in [{\"user\": \"nico\", \"amount\": 20},\n              {\"user\": \"nico\", \"amount\": 30}]:\n    user = order[\"user\"]\n    totals[user] = totals.get(user, 0) + order[\"amount\"]\nprint(totals)  # {'nico': 50}\n```\n第一轮还没有 `\"nico\"`，`get(user, 0)` 返回默认的 0，再加 20。第二轮取到已累计的 20，再加 30，得到 50。若每次都写 `totals[user] = order[\"amount\"]`，旧金额会被覆盖，最后只剩 30。\n\n默认值要看含义：累计表里尚未出现的用户可以从 0 开始；原始订单缺了金额却未必应该当作零元。"],
 ["集合只保留不同的值", "`set([\"nico\", \"nico\", \"milo\"])` 只保留两个不同的用户名，`len(set(users))` 因而能统计去重数量。判断用户是否出现过，可以写 `\"nico\" in users_set`。\n\n需要顺序和重复次数时用列表；需要键到值的对应关系时用字典；只查成员或去重时考虑集合。集合不提供列表那样的位置下标，也不应用来保存业务顺序。"]
],`orders = [{"user": "nico", "amount": 20}, {"user": "nico", "amount": 30}, {"user": "milo", "amount": 10}]
totals = {}
for order in orders:
    user = order["user"]
    totals[user] = totals.get(user, 0) + order["amount"]
print(totals)
print(len({order["user"] for order in orders}))`,'nico 总额 50，milo 总额 10，独立用户数为 2。',['列表下标从 0 开始；切片不包含右边界。','set 不应用来表达需要稳定顺序的业务序列。'],[
 Q('按用户 ID 查询累计金额，优先用什么？',['列表下标猜位置','字典映射','一个超长字符串'],1,['用户 ID 不一定是连续整数。','正确，键到值的关系与任务匹配。','需要反复解析，语义也不清楚。']),
 Q('统计去重用户数的表达式是哪一个？',['len(users)','len(set(users))','sum(users)'],1,['原列表长度会包含重复项。','正确，set 先去重，再取长度。','用户 ID 并非应该相加的数值。'])
],['ds'],'画出一段真实接口 JSON 的形状：外层类型、每层键和单条记录。',{priority:1,challenge:C('实现 unique_count(users)，返回不同用户名的数量。',`def unique_count(users):
    return len(users)

print(unique_count(["nico", "nico", "milo"]))`,`def unique_count(users):
    return len(set(users))`,['assert unique_count(["a","a","b"]) == 2','assert unique_count([]) == 0','assert unique_count(["a"]) == 1'],['重复值应该只算一次。','集合 set 可以去掉重复值。'])}),
L('py-references','引用与默认参数',"分清重新赋值、原地修改和浅复制。",['py-containers'],[
 ["两个变量可以指向同一个列表", "看这两组操作的差别：\n```python\na = [1]\nb = a\nb.append(2)\nprint(a)  # [1, 2]\n\nb = [9]\nprint(a)  # 仍是 [1, 2]\n```\n`b = a` 没有复制列表，两个名字指向同一个对象。`append` 改的是这个对象，所以通过 a、b 都能看到变化。`b = [9]` 新建了另一个列表并让 b 指向它，a 的指向不变。\n\n判断一行代码会影响谁，先看它改的是变量的指向，还是已有对象里的内容。"],
 ["浅复制在哪一层独立", "`copy()` 会创建新的外层列表，但其中的元素仍可能指向原来的对象：\n```python\na = [[1]]\nb = a.copy()\nb[0].append(2)\nprint(a)  # [[1, 2]]\n```\n这时 `a is b` 为假，外层不同；`a[0] is b[0]` 为真，里面那一个列表仍共享。相反，`b[0] = [7]` 是替换 b 的一个元素，不会把 a 的对应元素换掉。\n\n`deepcopy` 会递归复制适用的内部对象，但不必见到嵌套数据就全部深复制。先找出实际要改的那一层，再决定需要怎样隔离。"],
 ["默认列表为什么会越积越多", "下面的默认列表在执行函数定义时创建，而不是每次调用都创建：\n```python\ndef collect(x, bag=[]):\n    bag.append(x)\n    return bag\n\nprint(collect(\"A\"))  # ['A']\nprint(collect(\"B\"))  # ['A', 'B']\n```\n两次都省略了 bag，于是用到同一个默认对象。改成 `bag=None`，在函数体中用 `if bag is None: bag = []`，每次省略参数时才新建列表。\n\n这里不能随手改成 `if not bag`：调用者显式传入的空列表也是假值，会被替换掉，而练习约定要在传入的原列表上追加。"]
],`def collect(x, bag=[]):
    bag.append(x)
    return bag

print(collect("A"))
print(collect("B"))
a = [[1]]
b = a.copy()
b[0].append(2)
print(a)`,'第二次 collect 输出 [\'A\', \'B\']；a 变成 [[1, 2]]。',['不可变默认值如整数、字符串没有同样的容器修改问题。','深复制也不代替清晰的所有权设计。'],[
 Q('为什么省略 bag 的两次调用互相影响？',['函数定义时创建的默认列表被复用','Python 会记住所有函数答案','append 返回了一个新列表'],0,['正确。这是默认参数求值时机导致的共享。','普通函数不会自动缓存所有答案。','append 原地修改列表，返回 None。']),
 Q('a = [[1]]; b = a.copy() 后，b[0] 与 a[0] 呢？',['完全独立','仍指向同一个内层列表','都变成空列表'],1,['只复制了一层。','正确；修改内层仍能相互影响。','copy 不会清空数据。'])
],['fn','ds'],'检查项目函数签名里的 []、{} 默认值，并判断是否存在跨请求共享。',{priority:1,challenge:C('修复 collect：省略 bag 时每次新建列表；显式传入列表时追加到该列表并返回它。',`def collect(x, bag=[]):
    bag.append(x)
    return bag`,`def collect(x, bag=None):
    if bag is None:
        bag = []
    bag.append(x)
    return bag`,['assert collect("a") == ["a"]','assert collect("b") == ["b"]','bag = []\nassert collect("x", bag) is bag\nassert bag == ["x"]'],['不要让不同调用默认使用同一个列表。','用 None 作为默认哨兵，在函数体内创建列表。'])}),
L('py-errors','异常与调试',"读懂报错信息，复现问题，再检查一个原因。",['py-functions','py-containers'],[
 ["先看错误发生在哪一行", "异常会中断当前的正常执行过程。例如 `int(\"three\")` 无法转换成整数，会抛出 `ValueError`。traceback 末尾是异常类型和消息，上面是经过的调用位置。\n\n先找到自己代码中触发错误的那一行，再看它收到的值。不要只截最后一句“出错了”：同样的异常可能来自不同输入。记录输入、预期输出和实际报错，才能让自己或别人复现。"],
 ["捕获之后，调用者怎么处理", "如果允许用户输入错误，可以捕获已知的转换异常：\n```python\ndef parse_count(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\ncount = parse_count(\"three\")\nif count is None:\n    print(\"请输入整数\")\n```\n这个例子约定 text 是字符串，`None` 表示转换失败，调用方必须单独处理。它和数量 0 的含义不同。若允许传入其他类型，还要决定哪些接受、哪些拒绝，而不是笼统地吞掉全部异常。"],
 ["检查一个可以证实的原因", "假设总价变成了 `\"2020\"`。先检查单价的类型，看到它是字符串后，再检查数据在哪里进入程序。这样能区分“输入没有转换”和“计算公式写错”这两个原因。\n\n请 AI 协助时，把这条失败输入、相关函数和期望结果一起给它。修改后先重新运行原例，再检查合法的零值和普通金额。`except Exception: pass` 只会让错误不再显示，无法证明计算恢复正常。"]
],`def parse_count(text):
    try:
        return int(text)
    except ValueError:
        return None

print(parse_count("3"))
print(parse_count("three"))`,'输出 3、None。调用方还必须处理 None。',['错误被捕获不代表业务成功；要定义降级结果。','不要把密码、令牌或完整用户数据写入日志。'],[
 Q('遇到偶发错误，首先应该收集什么？',['让 AI 重写全部代码','复现步骤、输入、预期和实际错误','只发一句“报错了”'],1,['大范围改写会增加变量，也可能掩盖原因。','正确；这些信息能约束诊断。','信息太少，容易迫使模型猜测。']),
 Q('except Exception: pass 的主要问题是什么？',['代码太长','隐藏失败，调用方可能以为成功','不能捕获错误'],1,['长度不是这里的问题。','正确，静默吞错破坏了观察和契约。','它能捕获多种异常，正因此需要谨慎。'])
],['err'],'选一个现有 Bug，写四行复现报告，再让 AI 只提出一个可验证假设。',{priority:1}),
L('py-modules','模块、环境与依赖',"确认解释器、模块来源和项目依赖。",['py-errors'],[
 ["import 找的是哪个文件", "模块可以理解为可导入的 Python 代码单元。写 `import json` 后，通过 `json.loads(...)` 调用其中的函数。\n\n导入时，Python 按搜索路径寻找模块。项目中若也有一个 `json.py`，可能先找到自己的文件，导致标准库里的函数找不到。可以查看模块的 `__file__` 确认来源；部分内置模块没有这个属性。"],
 ["为什么导入时也会打印", "模块第一次导入时会执行顶层语句。若把演示代码直接写在文件末尾，别的文件只是想复用函数，也会触发演示。\n```python\ndef greet(name):\n    return \"你好，\" + name\n\nif __name__ == \"__main__\":\n    print(greet(\"Nico\"))\n```\n直接运行这个文件时，`__name__` 是 `\"__main__\"`，因此打印问候。被其他文件导入时，名字通常是模块名，入口里的演示便不会运行，`greet` 仍然可以被调用。"],
 ["依赖装到了哪个环境", "虚拟环境让不同项目使用各自的第三方依赖。编辑器和终端若选了不同的 Python，就可能出现“明明安装了，仍然找不到包”。用 `import sys; print(sys.executable)` 查看当前解释器路径。\n\n在对应终端使用 `python -m pip`，可以让 pip 和这一个 Python 对应起来。项目说明还应写清版本、依赖安装方式和启动命令。\n\n本网站的 Python 由 Pyodide 在浏览器运行，和电脑终端的 Python 是两个环境。网页里能导入什么包，不由你电脑上的 pip 安装结果决定。"]
],`import sys
import json
print(sys.version.split()[0])
print(json.loads('{"name":"Nico"}')["name"])
print(__name__)`,'版本取决于运行时，名字是 Nico；这里的执行空间设定为 __main__。',['pip install 成功不保证安装到了当前解释器对应的环境。','不要把密钥提交进依赖文件或仓库。'],[
 Q('终端能导入包，编辑器却报缺少模块，先看什么？',['当前解释器和环境路径','变量名长短','电脑壁纸'],0,['正确，先确认两边用的是同一环境。','这通常不影响包安装位置。','与模块解析无关。']),
 Q('为什么给脚本加 __main__ 判断？',['阻止任何人导入','避免导入时自动执行脚本入口','自动加速所有函数'],1,['定义的函数仍然可以导入。','正确，区分作为入口运行与被复用。','这不是性能优化机制。'])
],['mod','venv'],'为正在参与的项目补一段新同事能照着执行的环境和启动说明。',{priority:2}),
L('py-json','文件、JSON 与数据契约',"在对象、JSON 文本和文件之间转换数据。",['py-containers','py-errors','py-modules'],[
 ["JSON 文本和 Python 字典", "接口发送的是一种文本表示，程序计算时通常需要对象。两者的转换方向如下：\n```python\nimport json\nraw = '{\"user\": \"Nico\", \"paid\": true}'\norder = json.loads(raw)\nprint(order[\"paid\"])  # True\ntext = json.dumps(order, ensure_ascii=False)\n```\n`loads` 把 JSON 字符串解析成 Python 对象；`dumps` 把对象编码成 JSON 字符串。JSON 的 `true`、`false`、`null` 对应 Python 的 `True`、`False`、`None`。字符串里的 JSON 要使用它自己的语法。"],
 ["合法 JSON 也可能是错误订单", "`{\"amount\":\"免费\"}` 完全符合 JSON 格式，但金额字段是字符串。解析器只检查格式，不知道订单要求什么。\n\n解析后还需要确认：有无 amount 字段，类型能否接受，金额是否为非负数，单位是元还是分。缺字段、类型不对和数值越界，应按接口约定分别处理。不要把所有异常都改成金额 0。"],
 ["文件路径从哪里开始算", "读文本文件常见的写法是：\n```python\nwith open(\"orders.json\", encoding=\"utf-8\") as f:\n    orders = json.load(f)\n```\n`load` 读取文件对象，`loads` 读取字符串。`with` 会安排退出时关闭文件；即使解析失败，也不必靠下一行手动 close。\n\n相对路径 `orders.json` 从当前工作目录解析，不保证是代码文件所在目录。文件找不到时，先确认运行位置。网页里的文件系统属于浏览器沙箱，这段文件示例需要先在相应环境准备文件。"]
],`import json
raw = '{"user": "Nico", "amount": 120, "paid": true}'
order = json.loads(raw)
print(order["paid"], type(order["amount"]).__name__)
print(json.dumps(order, ensure_ascii=False))`,'paid 是 True，amount 的类型为 int，序列化后是 JSON 文本。',['JSON 不支持 Python set；编码前必须明确表示方式。','反序列化只完成格式转换，不完成身份认证或业务校验。'],[
 Q('json.loads 成功，意味着金额字段必定可用吗？',['是，合法 JSON 就合法业务','不是，还需字段和范围验证','必须先换成 CSV'],1,['语法与业务契约是两个层次。','正确，缺失、错误类型和负数仍可能存在。','换格式不能解决契约缺失。']),
 Q('JSON 中的 null 解码成 Python 什么值？',['"null" 字符串','None','0'],1,['带引号的 "null" 才是字符串。','正确，是缺失值的一个常见表示。','零是实际数值，不等同缺失。'])
],['io'],'为一个接口写一条合法样例和三条非法样例：缺字段、错类型、越界。',{priority:1}),
];
