import {lesson as L,question as Q,challenge as C} from './schema.js';
export const web = [
L('web-types','类型、空值与比较','不要让隐式转换替你做业务决定。',['py-values'],[
 ['同样的符号，不同的规则','JavaScript 的 + 既能相加又能拼接。"20" + 1 得到 "201"，而 Number("20") + 1 得到 21。=== 不做类似 == 的隐式类型转换，默认用它会让判断更明确。'],
 ['空值不是一个概念','undefined 常表示没有赋值或缺失属性，null 常被主动用于表达空。0、""、false 都是假值，却可能是合法业务数据。?? 只在 null 或 undefined 时使用默认值；|| 对所有假值都使用默认值。'],
 ['const 固定的是绑定','const order = {amount: 20} 仍允许修改 order.amount。它限制 order 重新指向别的对象，不会自动冻结内部字段。']
],`const amount = 0;
console.log(amount || 100);
console.log(amount ?? 100);
console.log("20" + 1, Number("20") + 1);
const cat = {name: "Nico"};
cat.name = "nico";
console.log(cat.name);`,'依次看到 100、0、201 21、nico。',['NaN !== NaN；检查数值是否有限用 Number.isFinite。','Number("") 得到 0；是否允许空字符串必须单独决定。'],[
 Q('库存 0 必须保留，只有缺失才用 10，选哪个？',['stock || 10','stock ?? 10','stock + 10'],1,['会把合法的 0 也替换。','正确，保留 0，只回退 null/undefined。','这是相加，不是默认值。']),
 Q('const a = {x:1}; a.x = 2 会怎样？',['允许修改属性','必定报错','自动复制对象'],0,['正确；const 限制重新绑定。','没有 freeze 等额外限制时可以修改。','不会自动创建副本。'])
],['mdn'],'检查表单默认值：0、false、空字符串与未填写是否需要不同处理。',{priority:1,challenge:C('实现 fallback(value)：仅 null 或 undefined 返回 10，保留 0、false 和空字符串。',`function fallback(value) {
  return value || 10;
}
console.log(fallback(0));`,`function fallback(value) { return value ?? 10; }`,['assert(fallback(0) === 0, "必须保留零")','assert(fallback(false) === false, "必须保留 false")','assert(fallback("") === "", "必须保留空字符串")','assert(fallback(null) === 10 && fallback(undefined) === 10, "缺失时用10")'],['|| 会处理所有假值。','试试空值合并运算符 ??。'])}),
L('web-scope','作用域、闭包与 this','函数记住的环境，比它所在的行更重要。',['web-types','py-functions'],[
 ['闭包保留对外层变量的访问','makeCounter 内部的 count 被返回的函数引用，即使外层调用已经结束仍可访问。每调用一次 makeCounter，都会建立自己的 count。'],
 ['this 取决于函数形式与调用方式','普通函数的 this 常由如何调用决定。把 obj.method 单独取出再调用，可能丢失 obj；箭头函数的 this 来自外层词法环境。回调里不要凭函数写在哪个对象里来猜。']
],`function makeCounter() {
  let count = 0;
  return () => ++count;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b());`,'输出 1 2 1；a 和 b 有独立的外层状态。',['闭包捕获变量的绑定，不是自动拍一张永不变化的快照。','长时间保留闭包，也可能保留不再需要的大对象。'],[
 Q('两个 makeCounter() 返回的计数器共享 count 吗？',['共享，因为变量同名','不共享，各有一次调用的环境','永远不能改变 count'],1,['变量同名不等于同一绑定。','正确，一次外层调用产生一份环境。','内部函数可以修改其可访问的 let。']),
 Q('把普通方法交给定时器时，要警惕什么？',['this 的调用上下文丢失','变量名不能有字母','函数会自动转成 Python'],0,['正确，可用包装回调或明确 bind。','与此无关。','语言不会自动改变。'])
],['mdn'],'找到项目中的一个回调，标出它读取的外部变量与更新时间。'),
L('web-objects','对象更新与数组方法','复制、修改、映射，是三种操作。',['web-scope','py-references'],[
 ['map 返回新数组','用 map 将每个订单转换成展示项；用 filter 选择满足条件的记录。forEach 用于遍历副作用，不会返回转换后的新数组。'],
 ['展开运算只复制一层','{...user} 新建外层对象，但 profile 等嵌套对象仍共享。更新嵌套状态时逐层复制被修改的路径，其他分支可以复用，避免无意义的深复制。']
],`const old = {name:"Nico", profile:{level:1}};
const next = {...old, profile:{...old.profile, level:2}};
console.log(old.profile.level, next.profile.level);
console.log([10, 20, 30].filter(x => x >= 20).map(x => x * 2));`,'原 level 为 1，新值为 2；数组结果为 [40, 60]。',['sort 默认按字符串顺序并原地修改数组，数值排序需比较函数。','新外层对象不等于每个内层对象都独立。'],[
 Q('想把每条订单映射成金额，应使用？',['map','forEach 的返回值','delete'],0,['正确，map 返回一组映射结果。','forEach 的返回值是 undefined。','这是删除，不是映射。']),
 Q('const b = {...a} 保证深层对象独立吗？',['保证','不保证，只有浅复制','会删除所有嵌套值'],1,['展开只处理当前这一层。','正确，需要检查嵌套引用。','不会删除嵌套值。'])
],['mdn'],'解释页面状态更新时为什么需要新对象，并画出共享与替换的路径。',{challenge:C('实现 doubled(values)：返回每个元素乘二的新数组，原数组保持原值。',`function doubled(values) {
  return values;
}`,`function doubled(values) { return values.map(x => x * 2); }`,['assert(JSON.stringify(doubled([1,3])) === "[2,6]", "映射结果")','const a=[2]; const b=doubled(a); assert(a[0]===2 && b!==a, "不要改原数组")','assert(doubled([]).length === 0, "空数组")'],['创建转换后的数组。','map 会收集每次回调的返回值。'])}),
L('web-async','Promise 与事件循环','异步代码不会按视觉顺序完成。',['web-scope'],[
 ['等待的是结果，不是阻塞整个页面','Promise 表示未来完成或失败的结果。await 会暂停当前 async 函数后续执行，其他任务仍能推进；调用 async 函数得到的总是 Promise。'],
 ['先同步，再微任务','当前调用栈结束后处理 Promise 回调等微任务，然后才能轮到定时器等任务。定时器延迟不是精准执行时刻。并发请求若互不依赖，可一起启动后等待；有依赖则必须串行。'],
 ['失败也属于接口','await 可能抛异常，用 try/catch 处理预期的失败。用户切换筛选时旧请求可能后到，需要取消或请求编号，避免旧结果覆盖新界面。']
],`console.log("A");
Promise.resolve().then(() => console.log("B"));
console.log("C");
await Promise.resolve();
console.log("D");`,'输出 A、C、B、D。本编辑器支持顶层 await。',['Promise.all 有一个拒绝就拒绝，但不会自动取消其他请求。','异步不是自动多线程计算；大量同步工作仍可阻塞所在工作线程。'],[
 Q('调用 async function f(){return 3} 的直接结果是什么？',['数字 3','Promise','线程 ID'],1,['要等待 Promise 兑现才获得 3。','正确，async 调用返回 Promise。','async 本身不等于开新线程。']),
 Q('先请求 A 后请求 B，哪个一定先返回？',['A','B','没有保证'],2,['网络耗时不同，发起顺序不保证完成顺序。','同样没有保证。','正确，UI 必须处理过期响应。'])
],['promise'],'为搜索框写出“旧请求晚到”的时间线，以及你准备用的防覆盖策略。',{priority:1}),
L('web-dom','HTML、CSS 与 DOM','页面是结构、样式与行为的协作。',['web-types'],[
 ['语义是交互的一部分','button 自带键盘激活和按钮语义；可点击 div 则需要自行补齐。label 关联输入框，让读屏和点击标签都能定位控件。布局使用 flex/grid，不要用空格硬推。'],
 ['DOM 是浏览器里的对象树','querySelector 找节点，textContent 写文本，addEventListener 响应事件。直接拼接不可信内容到 innerHTML 会把数据当标记解释，应该优先使用安全的文本输出。'],
 ['理解当前实验边界','本页练习在 Worker 里执行，那里没有 document。因此下面实验验证的是事件处理中的纯逻辑；实际 DOM 操作要在浏览器页面里体验。']
],`function nextLabel(loading) {
  return loading ? "保存中…" : "保存笔记";
}
console.log(nextLabel(false));
console.log(nextLabel(true));
console.log(typeof document);`,'标签分别为保存笔记、保存中…；Worker 中 document 是 undefined。',['视觉上像按钮，不代表键盘和辅助技术也能使用。','CSS 隐藏和 DOM 移除对焦点与读屏的影响不同。'],[
 Q('需要一个可点击操作，优先使用哪个元素？',['button','只有 click 的 div','span 加空格'],0,['正确，原生语义和键盘行为更完整。','还需要额外实现键盘、焦点和语义。','这不能自然表达操作。']),
 Q('显示用户提供的普通文本，优先用？',['innerHTML','textContent','eval'],1,['会按 HTML 解析，需要特别处理风险。','正确，按文本输出。','执行字符串不是展示文本。'])
],['mdn'],'用键盘 Tab 遍历你正在做的页面，记录焦点不可见或无法到达的控件。'),
L('web-http','HTTP、Fetch 与接口','请求发出之后，成功有不止一种定义。',['web-async','py-json'],[
 ['拆开一次交互','URL 指定资源；方法表达意图；请求头携带元信息；正文承载数据。响应的状态码和正文各有含义，200 的正文也可能包含业务失败，取决于接口契约。'],
 ['Fetch 的拒绝不是所有失败','fetch 遇到 HTTP 404/500 通常仍会兑现为 Response，需检查 response.ok。网络错误才可能直接拒绝。JSON 解析也可能失败，不要只检查一层。'],
 ['浏览器还有自己的边界','CORS 由服务端允许跨来源访问，前端改一个变量不能绕过。把密钥放进前端会暴露给使用者；需要机密凭证的调用应设计后端边界。']
],`function classify(status) {
  if (status >= 200 && status < 300) return "HTTP 成功";
  if (status === 429) return "限流：检查重试策略";
  return "检查错误响应";
}
console.log(classify(200), classify(500), classify(429));`,'200 是 HTTP 成功；500 应走错误路径；429 表示限流。',['POST 重试可能重复创建，不能只加一个循环。','浏览器没有提供跨域许可，不应靠关闭安全机制做产品方案。'],[
 Q('fetch 返回了 404，通常会怎样？',['必定进入 catch','拿到 Response，需要检查 ok','自动变成 200'],1,['HTTP 错误通常不直接使 fetch 拒绝。','正确，状态检查不可省略。','状态不会自动修正。']),
 Q('前端代码中的 API 密钥能保密吗？',['能，打包后看不见','不能，应按可被读取设计','变量名复杂就能'],1,['打包不是保密机制。','正确，前端资源交给了浏览器使用者。','混淆不能成为机密边界。'])
],['fetch','http'],'为当前接口整理成功、无权限、限流、超时四种界面状态。',{priority:1}),
L('web-typescript','TypeScript 与运行时校验','类型说明意图，边界仍要验证。',['web-objects','web-http'],[
 ['把形状写下来','type Order = {id: string; amount: number} 能帮助编辑器检查你的代码是否按契约使用对象。联合类型适合表达成功/失败这类不同状态。any 会绕开大量检查。'],
 ['外部数据不会被类型自动改造','把 JSON 写成 as Order 是对编译器的断言，不会把 "free" 转为数值，也不会拒绝缺字段。接收外部数据时用 unknown，再通过检查缩小类型，或使用运行时 schema。']
],`function isOrder(value) {
  return value !== null && typeof value === "object"
    && typeof value.id === "string"
    && typeof value.amount === "number"
    && Number.isFinite(value.amount) && value.amount >= 0;
}
console.log(isOrder({id:"A", amount:20}));
console.log(isOrder({id:"A", amount:"free"}));`,'这是可直接运行的 JavaScript 校验逻辑，输出 true、false；编辑器不编译 TS。',['as 不是转换函数，不能替代 Number 等显式转换。','静态类型无法保证调用外部服务一定成功。'],[
 Q('JSON.parse(raw) as Order 会自动校验字段吗？',['会','不会，类型断言不提供运行时校验','会自动删除错误字段'],1,['断言只影响类型检查。','正确，应在系统边界验证真实值。','不会修改真实对象。']),
 Q('unknown 相对 any 的一个优势？',['强制在使用前缩小类型','自动提高模型准确率','允许任意属性调用'],0,['正确，有助于保留检查责任。','与机器学习指标无关。','这是 any 常带来的问题。'])
],['ts'],'为一个外部 JSON 画出“解析 → 校验 → 业务处理”的三段边界。'),
L('web-react','React 状态与渲染','让界面成为状态的可解释结果。',['web-objects','web-async','web-dom'],[
 ['一次渲染是一张状态快照','组件根据 props 和 state 描述界面。事件处理函数读取其所在渲染的状态；调用 setter 是请求下一次渲染，不是当场改掉当前变量。连续依赖前值更新时使用函数式更新。'],
 ['派生值不必重复存储','订单数组已在 state 中时，总额可以在渲染中计算，避免维护两份会不一致的数据。Effect 用于同步外部系统；不要把所有计算都塞进 Effect。列表 key 应表达稳定身份。']
],`// 用纯函数模拟三次函数式状态更新
let state = 0;
const updates = [n => n + 1, n => n + 1, n => n + 1];
for (const update of updates) state = update(state);
console.log(state);`,'输出 3。实际 React 中可用 setCount(n => n + 1) 表达前值更新。',['直接修改对象可能让变更难以追踪，应按状态更新规则生成新值。','数组下标不适合用作会插入、删除、排序列表的稳定身份。'],[
 Q('总额完全由订单数组决定，通常先怎么做？',['再存一个总额并手动同步','从数组计算派生值','每次刷新数据库'],1,['两份状态容易不一致。','正确，先保持单一数据来源。','不必要地引入外部依赖。']),
 Q('连续三次基于前值加一，更合适的 setter 形式？',['setCount(count + 1) 全部读取同一快照','setCount(n => n + 1)','直接 count++'],1,['多次读取同一旧值可能不能累加到预期。','正确，更新函数依次接收前一结果。','直接改局部变量不是 React 状态更新。'])
],['react'],'为一个页面列出真正状态、派生值、外部副作用，尝试删除一项多余状态。'),
];
