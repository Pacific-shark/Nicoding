import {lesson as L,question as Q,challenge as C} from './schema.js';
export const python = [
L('py-values','变量与对象','先搞清楚：名字指向什么？',[],[
 ['从一条业务规则开始','商品原价 200 元，优惠率 0.1。price = 200 是把名字 price 绑定到一个整数对象；等号在这里是赋值，不是数学上的等式。Python 从上到下执行。下一行可以用 price 取到这个值。'],
 ['类型决定你能做什么','整数 int、浮点数 float、字符串 str 和布尔值 bool 有不同操作。200 * 0.9 是计算；"200" * 2 是字符串重复。接口和表格经常给你字符串，先检查类型再运算。'],
 ['跟踪一次重新绑定','a = 200；b = a；a = 180。最后 b 仍是 200：最后一行只重新绑定 a。不要把所有赋值都想象成两个变量永远同步。后面学列表时，还要区分对象本身被修改。'],
 ['怎样读代码','每遇到一行，记下执行前的值、执行后的值、类型、是否产生外部影响。先手算，再用 print(type(x), x) 核对。变量名是给读者的提示，不能替代真实类型。']
],`price = 200
rate = 0.1
final_price = price * (1 - rate)
print(final_price)
print(type(final_price).__name__)
print("200" * 2)`, '前两行输出 180.0、float；最后一行是 200200。', ['浮点数存在表示误差；金额生产系统通常用整数分或 Decimal。','== 比较值，is 比较是否是同一个对象；不要用 is 比较数字。'],[
 Q('a = 10; b = a; a = 20 后，b 是多少？',['20','10','无法确定'],1,['重新绑定 a 不会重新绑定 b。','正确。b 仍绑定到原来的整数值 10。','这里的行为是确定的，不涉及随机性。']),
 Q('接口传入 price = "20"，想计算两件总价，应该先做什么？',['直接 price * 2','先明确格式并转换成数值','把变量改名为 number'],1,['这会得到字符串 "2020"。','正确。先确认数据契约，再显式转换，并处理无效输入。','名字不会改变类型。'])
],['py'],'把最近项目的 5 个变量写下来，标注类型、来源和允许的范围。', {priority:1,depth:'核心必修',challenge:C('实现 total(price, count)：已知输入都是非负数，返回总价。',`def total(price, count):
    return price

print(total(20, 3))`,`def total(price, count):
    return price * count`,['assert total(20, 3) == 60','assert total(5, 0) == 0','assert total(2.5, 4) == 10'],['总价同时取决于单价和件数。','把两个参数相乘，并返回结果。'])}),
L('py-flow','条件与循环','让程序按规则作选择。',['py-values'],[
 ['把中文条件写明确','“满 100 元减 20”有一个边界：100 也算。写成 if amount >= 100。if/elif/else 一次只选择一个分支；缩进属于语法，表示哪些语句在分支内。'],
 ['循环是一张可追踪的表','for price in prices 每次取一个元素。累加器先初始化为 0，再把每轮价格加入。跟踪表写三列：当前元素、循环前 total、循环后 total。'],
 ['边界比正常例子更重要','range(3) 给出 0、1、2；右端不包含。空列表不会执行循环体，因此初始化位置决定空输入的结果。while 必须能走向结束条件。']
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
],['py'],'给当前业务的一条优惠规则列出阈值前、阈值上、阈值后三组例子。',{priority:1,depth:'核心必修',challenge:C('实现 eligible(prices)：返回价格大于等于 100 的商品数量。',`def eligible(prices):
    count = 0
    for price in prices:
        pass
    return count

print(eligible([99, 100, 101]))`,`def eligible(prices):
    count = 0
    for price in prices:
        if price >= 100:
            count += 1
    return count`,['assert eligible([99, 100, 101]) == 2','assert eligible([]) == 0','assert eligible([100,100]) == 2'],['先判断每个元素，而不是整个列表。','满足 price >= 100 时，count 加 1。'])}),
L('py-functions','函数与参数','让每一个输入，都有明确的输出。',['py-values','py-flow'],[
 ['函数是一份小契约','def discount(price, rate) 定义函数；调用 discount(200, 0.1) 才执行函数体。price、rate 是形参；200、0.1 是实参。先写清输入、输出及不负责的事情，再写实现。'],
 ['print 和 return 各做什么','print 把内容显示出来，适合观察；return 把值交还给调用者，并结束本次调用。算出一个表达式不等于返回它。函数走到末尾还没有 return，默认返回 None。'],
 ['逐行看一次调用','先把 200 和 0.1 绑定给参数；再算 200 × (1 − 0.1)；return 把 180.0 交给 result；最后 print 显示 result。计算函数可以被页面、接口和测试重复调用。'],
 ['把边界留在契约里','这一关约定 price ≥ 0 且 rate 在 0 到 1 之间。生产代码还需决定异常输入是抛错还是返回错误结果；不要让 AI 默认选择而你不知情。把折扣和文件保存拆开，更容易验证。']
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
L('py-containers','列表、字典与集合','根据要做的查询，选择容器。',['py-functions'],[
 ['三种问题，三种结构','需要保持一组订单顺序，用 list；根据订单号找金额，用 dict；只关心用户是否出现过，用 set。字典键通常需要不可变、可哈希的值，例如字符串。'],
 ['遍历的是哪一层','for row in orders 得到一条记录；row["amount"] 才取字段。for key in mapping 默认得到键，mapping.items() 得到键值对。数据形状先画出来，比猜下标快。'],
 ['缺失值要有业务含义','d["missing"] 会抛 KeyError，d.get("missing", 0) 返回默认值。但“缺失”不必然等于“零元”，先决定缺失是错误还是允许值。']
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
L('py-references','引用与默认参数','最容易被 AI 代码藏起来的共享状态。',['py-containers'],[
 ['赋值不等于复制','a = [1]；b = a 后，两个名字指向同一个列表。b.append(2) 修改了这个列表，因此从 a 也能看到 2。b = [2] 则重新绑定 b，不会修改原列表。'],
 ['浅复制只复制外层','b = a.copy() 创建新列表，但嵌套列表可能仍共享。不要把浅复制当成数据完全隔离；必要时用 deepcopy，也要考虑复制的代价。'],
 ['可变默认值只创建一次','def add(x, bag=[]) 中的列表在函数定义时创建，后续调用会复用。通常用 bag=None，再在函数内部创建列表。这样每次省略参数都获得独立容器。']
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
L('py-errors','异常与调试','把“让 AI 再改改”变成可检验的诊断。',['py-functions','py-containers'],[
 ['先保存一个失败证据','记录最小输入、预期结果、实际结果和完整异常。traceback 最后一行告诉你异常类型与消息，上面的栈帮助定位经过哪些函数。先复现再改动。'],
 ['只捕获你能处理的异常','把字符串转整数可能抛 ValueError。可以为它提供明确的错误提示。except Exception: pass 会把真正的缺陷吞掉，让系统表面成功、数据已经损坏。'],
 ['一次验证一个假设','“是不是 price 是字符串？”可以用 type(price) 验证。给 AI 这份证据和允许修改的文件，让它解释根因、补最小修改和回归用例。']
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
L('py-modules','模块、环境与依赖','知道你的程序究竟在哪里运行。',['py-errors'],[
 ['代码文件和运行环境是两件事','模块是可导入的代码组织单元；虚拟环境隔离项目依赖。你编辑的解释器与终端运行的解释器不同，会出现“安装了仍找不到包”。先检查 sys.executable。'],
 ['导入也会执行代码','首次 import 会执行模块顶层语句。把演示代码放在 if __name__ == "__main__": 内，避免被导入时意外启动任务。不要把自己的文件命名为 json.py 等标准库名。'],
 ['记录可复现的依赖','锁定和记录版本、启动命令、配置示例；开发环境与生产环境要能重建。浏览器里的 Python 是 Pyodide，不能代表你电脑上的全部系统能力。']
],`import sys
import json
print(sys.version.split()[0])
print(json.loads('{"name":"Nico"}')["name"])
print(__name__)`,'版本取决于运行时，名字是 Nico；这里的执行空间设定为 __main__。',['pip install 成功不保证安装到了当前解释器对应的环境。','不要把密钥提交进依赖文件或仓库。'],[
 Q('终端能导入包，编辑器却报缺少模块，先看什么？',['当前解释器和环境路径','变量名长短','电脑壁纸'],0,['正确，先确认两边用的是同一环境。','这通常不影响包安装位置。','与模块解析无关。']),
 Q('为什么给脚本加 __main__ 判断？',['阻止任何人导入','避免导入时自动执行脚本入口','自动加速所有函数'],1,['定义的函数仍然可以导入。','正确，区分作为入口运行与被复用。','这不是性能优化机制。'])
],['mod','venv'],'为正在参与的项目补一段新同事能照着执行的环境和启动说明。',{priority:2}),
L('py-json','文件、JSON 与数据契约','数据离开函数之后，也需要边界。',['py-containers','py-errors','py-modules'],[
 ['JSON 是文本表示','Python dict 是内存对象，JSON 是交换格式。json.dumps 编码，json.loads 解码。JSON 的 null 变为 None，true 变为 True。字节、文本、对象这三层不要混用。'],
 ['解析成功不代表字段正确','{"amount":"free"} 是合法 JSON，但不满足金额为非负数的业务要求。先解析，再检查必填键、类型、范围和缺失策略。'],
 ['文件操作也会失败','with open(path, encoding="utf-8") 确保关闭文件。相对路径相对的是工作目录，未必是代码文件目录。这里的浏览器文件系统是沙箱，不会直接修改电脑文件。']
],`import json
raw = '{"user": "Nico", "amount": 120, "paid": true}'
order = json.loads(raw)
print(order["paid"], type(order["amount"]).__name__)
print(json.dumps(order, ensure_ascii=False))`,'paid 是 True，amount 的类型为 int，序列化后是 JSON 文本。',['JSON 不支持 Python set；编码前必须明确表示方式。','反序列化只完成格式转换，不完成身份认证或业务校验。'],[
 Q('json.loads 成功，意味着金额字段必定可用吗？',['是，合法 JSON 就合法业务','不是，还需字段和范围验证','必须先换成 CSV'],1,['语法与业务契约是两个层次。','正确，缺失、错误类型和负数仍可能存在。','换格式不能解决契约缺失。']),
 Q('JSON 中的 null 解码成 Python 什么值？',['"null" 字符串','None','0'],1,['带引号的 "null" 才是字符串。','正确，是缺失值的一个常见表示。','零是实际数值，不等同缺失。'])
],['io'],'为一个接口写一条合法样例和三条非法样例：缺字段、错类型、越界。',{priority:1}),
];
