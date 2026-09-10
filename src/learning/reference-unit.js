const p=text=>({type:'text',text});
const detail=(title,text)=>({type:'detail',title,text});
const question=(id,prompt,options,correct,feedback)=>({type:'prediction',id,prompt,options,correct,feedback});
export const referenceTasks={
 collect:{id:'collect',title:'让两次独立调用互不干扰',filename:'collect.py',
  contract:'实现 collect(item, bag=None)。省略 bag 或传入 None 时，新建列表；显式传入列表时，向原列表追加 item，并返回同一个列表。输入保证为 None 或 list。',
  starter:'def collect(item, bag=[]):\n    bag.append(item)\n    return bag\n\nprint(collect("A"))\nprint(collect("B"))',
  solution:'def collect(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag\n\nprint(collect("A"))\nprint(collect("B"))',
  hints:['观察第二次省略 bag 的调用。它使用的列表是在何时创建的？','把默认值设为 None，在函数体内判断 bag is None。不要写 if not bag，空列表也是假值。','只在 bag is None 时创建列表；调用者传来的列表要继续使用。'],
  tests:[
   {name:'连续省略参数，结果相互独立',code:'a = collect("first")\nb = collect("second")\nassert a == ["first"] and b == ["second"], f"期望两个独立列表，实际 a={a!r}, b={b!r}"\nassert a is not b, "两次调用返回了同一个列表"'},
   {name:'显式 None 也会新建列表',code:'a = collect(0, None)\nb = collect(False, None)\nassert a == [0] and b == [False] and a is not b, f"实际 a={a!r}, b={b!r}"'},
   {name:'保留调用者传入的空列表',code:'bag = []\nresult = collect("Nico", bag)\nassert result is bag, "必须返回调用者传入的同一列表"\nassert bag == ["Nico"], f"传入列表实际为 {bag!r}"'},
   {name:'已有内容不能被丢弃',code:'bag = ["old"]\nresult = collect("new", bag)\nassert result is bag and bag == ["old", "new"], f"实际 bag={bag!r}"'}]},
 tag:{id:'tag',title:'给配置添加标签，保留原始配置',filename:'add_tag.py',
  contract:'实现 add_tag(config, tag)，返回新字典和新的 tags 列表。原 config 及其 tags 不变；其他键和值保留原引用。config 保证是字典，tags 是字符串列表，tag 是字符串；tag 已存在时不再追加，已有标签的内容与顺序保留。不要使用 deepcopy 复制整个配置。',
  starter:'def add_tag(config, tag):\n    result = config.copy()\n    if tag not in result["tags"]:\n        result["tags"].append(tag)\n    return result\n\nsource = {"tags": ["Python"], "meta": {"owner": "Nico"}}\nupdated = add_tag(source, "AI")\nprint("source:", source)\nprint("updated:", updated)',
  solution:'def add_tag(config, tag):\n    result = config.copy()\n    result["tags"] = config["tags"].copy()\n    if tag not in result["tags"]:\n        result["tags"].append(tag)\n    return result\n\nsource = {"tags": ["Python"], "meta": {"owner": "Nico"}}\nupdated = add_tag(source, "AI")\nprint("source:", source)\nprint("updated:", updated)',
  hints:['修改发生在 result 的外层字典，还是 tags 指向的列表？','先复制外层，再只复制准备修改的 tags 列表。meta 的共享是契约要求。','用 is 检查对象身份，用 == 检查内容。即使没有新增标签，tags 也应当是新的列表。'],
  tests:[
   {name:'追加标签，不修改原始数据',code:'src = {"tags": ["Python"], "meta": {"owner": "Nico"}}\nout = add_tag(src, "AI")\nassert src["tags"] == ["Python"], f"原始 tags 被修改为 {src[\"tags\"]!r}"\nassert out["tags"] == ["Python", "AI"], f"新 tags 为 {out[\"tags\"]!r}"\nassert out is not src and out["tags"] is not src["tags"], "需要新字典和新 tags 列表"'},
   {name:'已有标签保持内容与顺序',code:'src = {"tags": ["Python", "AI", "Python"], "meta": {}}\nout = add_tag(src, "Python")\nassert out["tags"] == ["Python", "AI", "Python"], f"重复标签处理不符：{out!r}"\nassert out["tags"] is not src["tags"], "没有新增标签时，也需要独立的 tags 列表"'},
   {name:'其他字段仍保留原引用',code:'meta = {"owner": "Nico"}\nextra = [1, 2]\nsrc = {"tags": [], "meta": meta, "extra": extra}\nout = add_tag(src, "first")\nassert out["meta"] is meta and out["extra"] is extra, "meta 和 extra 应保留原引用，不应深拷贝整份配置"\nassert out["tags"] == ["first"] and src["tags"] == [], f"空标签处理不符：{src!r}, {out!r}"'},
   {name:'两次派生不互相污染',code:'src = {"tags": ["base"], "meta": {}}\na = add_tag(src, "A")\nb = add_tag(src, "B")\na["tags"].append("local")\nassert b["tags"] == ["base", "B"] and src["tags"] == ["base"], f"发生共享污染：{src!r}, {a!r}, {b!r}"'}]}
};
export const referenceUnit={
 id:'py-references',version:1,title:'引用、复制与共享状态',subtitle:'看清一个改动，为什么会影响另一个变量。',
 prereqs:['py-functions','py-containers'],
 sources:[
  {name:'Python 3.12 · 对象、值与类型',url:'https://docs.python.org/3.12/reference/datamodel.html#objects-values-and-types',note:'区分对象身份、类型、值与可变性。'},
  {name:'Python 3.12 · 浅拷贝与深拷贝',url:'https://docs.python.org/3.12/library/copy.html',note:'核对复制的层次、共享与 deepcopy 的限制。'},
  {name:'Python 3.12 · 默认参数值',url:'https://docs.python.org/3.12/tutorial/controlflow.html#default-argument-values',note:'默认值在函数定义时求值，后续调用会复用。'}],
 chapters:[
  {id:'binding',title:'名字与对象',heading:'名字可以不同，对象可以相同。',blocks:[
   p('执行 `b = a` 时，Python 把同一个对象交给了另一个名字。先看两个名字指向哪里，再判断一次修改会影响谁。'),
   {type:'references',modes:['binding']},
   question('binding','执行 b.append(2) 后，a 会是什么？',['[1]','[1, 2]','[2]'],1,['a 和 b 指向同一列表，append 会改变这个列表。','对。这里变的是共享对象，两个名字都会看到 [1, 2]。','append 在末尾添加元素，原来的 1 没有被替换。']),
   p('接着执行 `a = [9]`。它让 a 指向新列表，b 仍然指向旧列表。判断代码时，先问它是在“换一个指向”，还是在“修改指向的对象”。'),
   detail('is 和 == 分别检查什么？','`a is b` 检查两个名字是否指向同一对象；`a == b` 检查值是否相等。两个分别创建的 `[1]` 可以相等，却不是同一个列表。不要用小整数或字符串的 is 结果推断普遍规则；实现可能复用某些不可变对象。'),
   detail('函数参数也遵循这一套规则','调用 `change(items)` 时，形参获得对同一个对象的引用。函数内 `items.append(2)` 会修改共享列表；`items = [2]` 只重新绑定局部名字。返回值可以把新对象交给调用者，但 return 本身不会把对象复制一份。')
  ]},
  {id:'copy',title:'浅拷贝与深拷贝',heading:'复制了外层，里面可能仍然共享。',blocks:[
   p('`a = [[1]]` 包含两个列表：外层保存对内层的引用，内层保存数字 1。`a.copy()` 新建外层列表，但沿用里面的引用。把下方实验走到第三步，再切换深拷贝比较。'),
   {type:'references',modes:['shallow','deep']},
   question('copy','执行 b = a.copy() 后，哪句话成立？',['a is b，但 a[0] is not b[0]','a is not b，且 a[0] is not b[0]','a is not b，但 a[0] is b[0]'],2,['浅拷贝会新建外层，第一句不成立。','这个嵌套例子中，内层仍共享。要隔离它，需要继续复制内层。','对。外层不同，内层相同；修改前先找准层次。']),
   p('最后一步 `b.append([9])` 修改的是 b 的外层。浅拷贝已经隔离了这一层，因此 a 不会新增一项。是否需要继续复制，要看你准备修改到哪一层。'),
   detail('深拷贝也有边界','对这里的嵌套列表，deepcopy 会递归复制所需列表。真实对象可能有意共享缓存或其他资源，盲目深拷贝可能改变约定，也会增加时间与内存开销。文件、连接等资源不能当作普通数据随意复制；自定义类还能定义自己的复制行为。'),
   detail('元组不可变，为什么里面的列表还能变？','不可变限制的是元组自身保存的那组引用。`t = ([1],)` 中，`t[0].append(2)` 修改了被引用的列表，没有替换元组的第 0 项。判断可变性要明确是在讨论外层对象还是里面的对象。')
  ]},
  {id:'defaults',title:'默认参数的陷阱',heading:'默认列表，可能比一次调用活得更久。',blocks:[
   p('函数定义被执行时，`bag=[]` 创建一个列表，并成为这个函数的默认值。之后每次省略 bag，都复用它。下面连续调用两次，再切到 None 方案观察。'),
   {type:'defaults'},
   question('defaults','修复后，为什么要写 if bag is None，而不是 if not bag？',['后者会把调用者传入的空列表也替换掉','None 不能作为默认值','not bag 会自动复制列表'],0,['对。空列表也是假值；如果契约要求修改调用者的列表，必须保留它。','None 可以作为默认值，关键是在函数体内按需要创建新列表。','not 只进行真假判断，不会复制列表。']),
   p('这里的关键是对象的存续范围。类似问题也会出现在模块级列表、共享配置和类属性中；改成 None 解决了这个函数的默认参数问题，不会自动消除系统里的所有共享。'),
   detail('每次重新定义函数会怎样？','每当 def 语句再次执行，默认表达式会重新求值。本实验的“重置”相当于重新开始一个场景；它不是一次普通函数调用。显式传入列表时，函数使用传入的列表，不使用默认对象。')
  ]},
  {id:'repair',title:'修复共享状态',heading:'先约定共享边界，再写修复。',blocks:[
   p('这个函数有两种有意不同的行为：独立调用要互不干扰，显式传入同一个列表则要共享修改。先运行错误版本，看它违反了哪条约定，再修改。'),
   {type:'practice',task:'collect'},
   detail('为什么只检查打印结果不够？','两个列表可以内容相同、身份不同；同一个列表也会在后续调用中继续改变。检查既要核对值，还要用 is 判断需要保留或隔离的对象身份。练习会同时检查这两类条件。')
  ]},
  {id:'explain',title:'解释与迁移',heading:'换个例子，检验你理解的是哪一层。',blocks:[
   p('这次不使用 copy。三个位置引用同一个列表时，一个 append 会影响多少行？先预测，再画出你心中的引用关系。'),
   {type:'code',code:'rows = [[]] * 3\nrows[0].append("Nico")\nprint(rows)'},
   question('transfer','打印结果是什么？',[
    "[['Nico'], [], []]","[['Nico'], ['Nico'], ['Nico']]","[[], [], []]"],1,[
    '乘法重复了同一内层列表的引用，没有分别创建三个列表。','对。三个位置指向同一列表。可用 [[] for _ in range(3)] 分别创建三个列表。','append 已经改变了内层列表。试着追踪三个位置共同指向的对象。']),
   {type:'reflection'},
   detail('一个容易混淆的反例','若写 `values = [0] * 3`，再执行 `values[0] = 1`，结果是 `[1, 0, 0]`。赋值替换了外层第 0 项的引用，没有修改整数对象。不能把“乘法复制引用”简单记成“改一个就全部变”。')
  ]},
  {id:'apply',title:'带进真实项目',heading:'只隔离要修改的部分。',blocks:[
   p('你要给一份配置新增标签。原始配置还被别处使用，不能被改动；其中 meta 等字段有意共享，也不能全部深拷贝。下面这份修复看似已经 copy，实际仍有问题。'),
   {type:'practice',task:'tag'},
   p('提交通过后，再读一段 AI 给你的数据处理代码：找出它修改的对象、对象的来源、还有谁在引用它。把这三件事写清楚，才容易判断修改范围是否合适。'),
   {type:'project'},
   {type:'completion'}
  ]}
 ]
};
export function unitSectionDone(record={}) {
 const observations=record.observations||{},answers=record.answers||{};
 const passed=id=>record.tasks?.[id]?.result?.ok&&record.tasks[id].result.code===record.tasks[id].code;
 return [!!observations.binding&&answers.binding?.correct===true,
  !!observations.shallow&&!!observations.deep&&answers.copy?.correct===true,
  !!observations['defaults-bug']&&!!observations['defaults-fixed']&&answers.defaults?.correct===true,
  !!passed('collect'),answers.transfer?.correct===true&&!!record.reflection?.text?.trim()&&record.reflection?.checks?.length===3,
  !!passed('tag')];
}
