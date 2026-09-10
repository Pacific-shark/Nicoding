import {lesson as L,question as Q,challenge as C} from './schema.js';
export const web = [
L('web-types','类型、空值与比较',"区分类型转换、空值判断和 const 绑定。",['py-values'],[
 ["加号遇到字符串会怎样", "JavaScript 的 `+` 可以计算，也可以拼接字符串：\n```javascript\nconsole.log(\"20\" + 1);          // \"201\"\nconsole.log(Number(\"20\") + 1);  // 21\nconsole.log(20 === \"20\");       // false\n```\n第一个结果是字符串。第二个先把文本转换成数值，才做加法。`===` 比较时不先把数值和字符串转成同一种类型，因此最后是 false。\n\n表单里的输入通常是字符串。转换之前要先决定是否接受空输入：`Number(\"\")` 会得到 0，并不能替你区分“没填写”和“填写了零”。"],
 ["0 不一定意味着没有数据", "`undefined` 常见于没有赋值或缺失属性，`null` 常用来主动表示空。`0`、`false` 和空字符串也能在条件中被当作假，但可能是有效数据。\n```javascript\nconst stock = 0;\nconsole.log(stock || 10);  // 10\nconsole.log(stock ?? 10);  // 0\n```\n`||` 遇到任意假值会取右边的默认值；`??` 只在左边为 null 或 undefined 时取默认值。库存 0 表示售罄，不能被替换成 10，这里应选 `??`。"],
 ["const 不会冻结对象", "`const` 限制变量被重新赋值，不限制对象内部的字段修改：\n```javascript\nconst cat = { name: \"Nico\" };\ncat.name = \"nico\";  // 可以\n// cat = {};       // 不能重新赋值\n```\n`let` 适合需要重新赋值的变量。读代码时，要分别看变量是否被重新赋值、它指向的对象是否被修改；这是两个问题。"]
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
L('web-scope','作用域、闭包与 this',"追踪函数读取的变量，以及 this 的来源。",['web-types','py-functions'],[
 ["作用域决定变量在哪里可用", "函数可以读取自身定义的变量，也能继续向外层作用域查找。`let` 和 `const` 还有块级作用域：在一对花括号中声明的局部变量，外面通常不能直接访问。\n\n变量同名不代表同一份数据。两个独立的函数调用可以各自创建一个叫 count 的局部变量。理解闭包时，这一点比术语本身更重要。"],
 ["函数返回之后，变量还能被用到", "计数器每次调用都要记住上次的数字：\n```javascript\nfunction makeCounter() {\n  let count = 0;\n  return () => {\n    count += 1;\n    return count;\n  };\n}\nconst a = makeCounter();\nconsole.log(a());  // 1\nconsole.log(a());  // 2\n```\n`makeCounter()` 返回一个函数，这个函数继续访问创建它时外层的 count。外层调用虽然结束了，count 仍被返回的函数使用。这种函数连同可访问的词法环境就是闭包。\n\n再执行 `const b = makeCounter()` 会产生另一份 count。第一次 `b()` 返回 1，不接着 a 的 2 累加。闭包保留的是变量访问关系，不是把所有值复制成永不变化的快照。"],
 ["普通函数的 this 要看怎么调用", "对于普通函数，`obj.method()` 和把 method 取出来单独调用，this 可能不同。把方法当回调传出去时，常会丢失原来的对象。\n\n箭头函数没有自己的 this，而是沿用外层的 this。如果希望回调仍然以 obj 调用方法，可以写 `() => obj.method()`，或者在适合时使用 `bind`。先确认调用方式，再决定需要哪一种函数形式。"]
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
L('web-objects','对象更新与数组方法',"使用数组方法，并正确更新嵌套对象。",['web-scope','py-references'],[
 ["map 和 filter 分别留下什么", "`filter` 决定保留哪些元素，`map` 决定每个元素变成什么：\n```javascript\nconst prices = [10, 20, 30];\nconst result = prices.filter(x => x >= 20).map(x => x * 2);\nconsole.log(result);  // [40, 60]\nconsole.log(prices);  // [10, 20, 30]\n```\n先筛选剩下 `[20, 30]`，再把每项乘二。两个方法都返回新数组。`forEach` 常用于逐项执行操作，它本身返回 undefined，不能拿其返回值当转换结果。\n\n返回新数组不表示回调自动没有副作用；如果回调里修改某个对象的属性，原来引用它的地方仍可能受到影响。"],
 ["展开只复制外层", "`const next = {...old}` 新建一个对象，但 old.profile 和 next.profile 仍可能指向同一个内部对象。想更新内部 level 而保留旧数据，要复制这条被修改的路径：\n```javascript\nconst old = { name: \"Nico\", profile: { level: 1 } };\nconst next = { ...old, profile: { ...old.profile, level: 2 } };\nconsole.log(old.profile.level, next.profile.level);  // 1 2\n```\n外层新建一次，profile 也新建一次。没有修改的其他字段可以复用，不需要无条件把整份数据深复制。"],
 ["留意原地修改的方法", "`sort()` 会修改原数组，默认还按字符串顺序比较。数字升序可写 `[...values].sort((a, b) => a - b)`，先复制，再排序。\n\n`push`、`splice` 也会修改原数组。阅读页面状态更新时，先确认该段代码需要保留旧值，还是允许直接修改；不要只凭“用了一个数组方法”判断有没有产生副作用。"]
],`const old = {name:"Nico", profile:{level:1}};
const next = {...old, profile:{...old.profile, level:2}};
console.log(old.profile.level, next.profile.level);
console.log([10, 20, 30].filter(x => x >= 20).map(x => x * 2));`,'原 level 为 1，新值为 2；数组结果为 [40, 60]。',['sort 默认按字符串顺序并原地修改数组，数值排序需比较函数。','新外层对象不等于每个内层对象都独立。'],[
 Q('想把每条订单映射成金额，应使用？',['map','forEach 的返回值','delete'],0,['正确，map 返回一组映射结果。','forEach 的返回值是 undefined。','这是删除，不是映射。']),
 Q('const b = {...a} 保证深层对象独立吗？',['保证','不保证，只有浅复制','会删除所有嵌套值'],1,['展开只处理当前这一层。','正确，需要检查嵌套引用。','不会删除嵌套值。'])
],['mdn'],'解释页面状态更新时为什么需要新对象，并画出共享与替换的路径。',{challenge:C('实现 doubled(values)：返回每个元素乘二的新数组，原数组保持原值。',`function doubled(values) {
  return values;
}`,`function doubled(values) { return values.map(x => x * 2); }`,['assert(JSON.stringify(doubled([1,3])) === "[2,6]", "映射结果")','const a=[2]; const b=doubled(a); assert(a[0]===2 && b!==a, "不要改原数组")','assert(doubled([]).length === 0, "空数组")'],['创建转换后的数组。','map 会收集每次回调的返回值。'])}),
L('web-async','Promise 与事件循环',"区分发起顺序、完成顺序和 await 的等待位置。",['web-scope'],[
 ["await 暂停的是哪一段", "Promise 表示一个将来可能成功或失败的结果。`async` 函数调用后返回 Promise；`await` 等待结果时，暂停当前函数后面的语句，不会让整个页面停止处理其他任务。\n```javascript\nasync function getCount() {\n  return 3;\n}\nconst pending = getCount();  // 得到 Promise\nconsole.log(await pending); // 等到结果 3\n```\n上面即使直接 return 一个数字，函数调用的直接返回值仍然是 Promise。它不是自动开一个线程，大量同步计算仍会占用所在的执行线程。"],
 ["为什么 A、C 比 B 先出现", "先预测这三行的输出顺序：\n```javascript\nconsole.log(\"A\");\nPromise.resolve().then(() => console.log(\"B\"));\nconsole.log(\"C\");\n```\n当前同步代码会先打印 A、C。then 注册的回调进入微任务队列，当前调用栈结束后才执行，所以 B 最后出现。零延迟定时器也不会打断正在执行的同步语句。\n\n接下来的示例还包含一次 await，可以继续追踪它后面的 D 何时出现。不要把源文件的行顺序直接当成所有异步结果的完成顺序。"],
 ["同时发起还是逐个等待", "两个请求互不依赖时，可以先一起发起，再用 `Promise.all` 等待；后一个请求需要前一个的结果时，就需要先等前一个完成。\n\n`Promise.all` 的结果顺序对应传入顺序，不对应谁先完成。有一个输入拒绝，它返回的 Promise 就会拒绝，但其他已经发起的请求不会因此自动取消。"],
 ["旧请求可能最后回来", "用户先搜“猫”，马上又搜“猫粮”。第二次请求先返回并显示猫粮，第一次却晚到。如果直接把每次返回都写进页面，旧结果会覆盖新结果。\n\n可以为请求记录编号，只接受当前编号的响应；支持取消时，也可以取消过期请求。`await` 的 try/catch 还要处理网络和解析失败，不能只写成功路径。"]
],`console.log("A");
Promise.resolve().then(() => console.log("B"));
console.log("C");
await Promise.resolve();
console.log("D");`,'输出 A、C、B、D。本编辑器支持顶层 await。',['Promise.all 有一个拒绝就拒绝，但不会自动取消其他请求。','异步不是自动多线程计算；大量同步工作仍可阻塞所在工作线程。'],[
 Q('调用 async function f(){return 3} 的直接结果是什么？',['数字 3','Promise','线程 ID'],1,['要等待 Promise 兑现才获得 3。','正确，async 调用返回 Promise。','async 本身不等于开新线程。']),
 Q('先请求 A 后请求 B，哪个一定先返回？',['A','B','没有保证'],2,['网络耗时不同，发起顺序不保证完成顺序。','同样没有保证。','正确，UI 必须处理过期响应。'])
],['promise'],'为搜索框写出“旧请求晚到”的时间线，以及你准备用的防覆盖策略。',{priority:1}),
L('web-dom','HTML、CSS 与 DOM',"理解页面结构、CSS 布局和事件处理。",['web-types'],[
 ["HTML 写出控件的用途", "HTML 描述页面内容及其语义。操作用 `button`，跳转用有 href 的 `a`，输入框用 `label` 关联名称。原生按钮已经支持键盘激活，不必从可点击 div 开始补一整套行为。\n\nCSS 决定字号、颜色、间距和布局。把多个元素排成一行可以用 flex，二维排布可以用 grid；不要靠反复输入空格对齐。"],
 ["DOM 是可以访问的节点树", "浏览器把 HTML 解析成 DOM 节点，JavaScript 可以查找节点、读取内容或监听事件。下面这段需放在有对应按钮的普通网页中：\n```javascript\n// 假设 HTML 中已有 <button id=\"save\">保存</button>\nconst button = document.querySelector(\"#save\");\nbutton.addEventListener(\"click\", () => {\n  button.textContent = \"已保存\";\n});\n```\nquerySelector 找按钮，addEventListener 注册点击后的动作。用户真的点击时，回调才执行。这里只改了按钮文字，没有把数据保存到硬盘或服务器。"],
 ["展示文本与解释 HTML 不同", "`textContent` 按普通文本设置内容。`innerHTML` 则会把字符串当 HTML 解析。显示用户输入的评论或笔记时，优先使用普通文本方式，不要随意拼接成 HTML。\n\n本网站的代码练习在 Worker 中运行，那里没有 document，因此接下来的实验只运行按钮标签的计算逻辑。真实 DOM 示例要在网页环境运行。"]
],`function nextLabel(loading) {
  return loading ? "保存中…" : "保存笔记";
}
console.log(nextLabel(false));
console.log(nextLabel(true));
console.log(typeof document);`,'标签分别为保存笔记、保存中…；Worker 中 document 是 undefined。',['视觉上像按钮，不代表键盘和辅助技术也能使用。','CSS 隐藏和 DOM 移除对焦点与读屏的影响不同。'],[
 Q('需要一个可点击操作，优先使用哪个元素？',['button','只有 click 的 div','span 加空格'],0,['正确，原生语义和键盘行为更完整。','还需要额外实现键盘、焦点和语义。','这不能自然表达操作。']),
 Q('显示用户提供的普通文本，优先用？',['innerHTML','textContent','eval'],1,['会按 HTML 解析，需要特别处理风险。','正确，按文本输出。','执行字符串不是展示文本。'])
],['mdn'],'用键盘 Tab 遍历你正在做的页面，记录焦点不可见或无法到达的控件。'),
L('web-http','HTTP、Fetch 与接口',"检查请求、HTTP 状态和响应数据。",['web-async','py-json'],[
 ["一次请求包含哪些信息", "以读取订单为例：URL 指向资源，GET 表达读取意图，请求头可以说明接受什么格式。服务端返回状态码、响应头和正文。\n\n状态码描述 HTTP 层的结果，正文才包含具体数据。不同接口可能约定不同的业务状态字段，不能只见到 200 就认为订单已经成功处理。"],
 ["fetch 不会把所有失败都抛给 catch", "下面是普通页面里常见的请求结构；地址是示意，需要换成真实接口：\n```javascript\nasync function readOrder(url) {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error(`HTTP ${response.status}`);\n  }\n  return await response.json();\n}\n```\nHTTP 404 或 500 通常仍会让 fetch 返回 Response，需要自己检查 ok。网络失败可能直接拒绝；正文不是合法 JSON 时，json() 也会失败。调用 readOrder 的地方还要处理这些异常，并检查得到的字段是否符合订单要求。"],
 ["跨域限制和凭证放在哪里", "浏览器会按来源区分网页。跨来源读取接口响应时，服务端需要按 CORS 规则允许相应来源；前端改个变量不能替服务端授权。\n\n发给浏览器的代码可以被使用者读取，机密 API 密钥不应放在前端包里。需要机密凭证的请求由后端处理，并验证调用者身份。重试写请求时还要防止重复创建，后续事务课程会展开。"]
],`function classify(status) {
  if (status >= 200 && status < 300) return "HTTP 成功";
  if (status === 429) return "限流：检查重试策略";
  return "检查错误响应";
}
console.log(classify(200), classify(500), classify(429));`,'200 是 HTTP 成功；500 应走错误路径；429 表示限流。',['POST 重试可能重复创建，不能只加一个循环。','浏览器没有提供跨域许可，不应靠关闭安全机制做产品方案。'],[
 Q('fetch 返回了 404，通常会怎样？',['必定进入 catch','拿到 Response，需要检查 ok','自动变成 200'],1,['HTTP 错误通常不直接使 fetch 拒绝。','正确，状态检查不可省略。','状态不会自动修正。']),
 Q('前端代码中的 API 密钥能保密吗？',['能，打包后看不见','不能，应按可被读取设计','变量名复杂就能'],1,['打包不是保密机制。','正确，前端资源交给了浏览器使用者。','混淆不能成为机密边界。'])
],['fetch','http'],'为当前接口整理成功、无权限、限流、超时四种界面状态。',{priority:1}),
L('web-typescript','TypeScript 与运行时校验',"用静态类型检查代码，用运行时检查接收数据。",['web-objects','web-http'],[
 ["类型描述代码期望什么", "例如 `type Order = { id: string; amount: number }` 描述订单有字符串 ID 和数值金额。TypeScript 可以检查后续代码有没有按这种形状使用对象，帮助发现把字符串当金额计算等错误。\n\n成功和失败具有不同字段时，可以用联合类型表达。`any` 会跳过很多检查；尚不清楚的外部输入，先用 `unknown`，检查之后再使用。"],
 ["as 不是数据转换", "写 `JSON.parse(raw) as Order` 只是向类型检查器声明“把它当 Order”，不会检查真实字段，也不会把 `\"20\"` 转成数字。\n\n运行时仍需要检查 value 不是 null、id 是字符串、amount 是有限的非负数。接下来的 JavaScript 实验直接实现这几个检查，合法和非法对象会得到不同结果。\n\n静态类型主要检查你写的代码；运行时检查用来接住外部数据。项目里两者常常配合使用。本网站编辑器运行 JavaScript，不直接编译 TypeScript 类型声明。"]
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
L('web-react','React 状态与渲染',"理解状态快照、更新队列和派生数据。",['web-objects','web-async','web-dom'],[
 ["状态更新不会改掉当前快照", "React 组件根据 props 和 state 描述界面。一次渲染中的事件处理函数会读取那次渲染的状态。调用 setter 是安排下一次渲染，不会立即把当前函数里的变量替换成新值。\n\n假设当前 count 是 0，在同一个事件里连续三次调用 `setCount(count + 1)`，这三次读到的 count 都是 0，都在请求设置为 1，而不是依次变成 1、2、3。"],
 ["依赖前值时用更新函数", "需要连续累加时，把怎样更新写成函数：\n```javascript\n// 放在 React 组件的事件处理函数中\nsetCount(n => n + 1);\nsetCount(n => n + 1);\nsetCount(n => n + 1);\n```\nReact 按顺序处理这些更新：第一项接到 0，返回 1；第二项接到 1，返回 2；第三项接到 2，返回 3。接下来的浏览器实验用普通函数模拟这条队列，便于观察，没有真正渲染 React 组件。"],
 ["可以算出的值，不必重复保存", "订单数组已存在 state 中时，总额通常直接从数组计算。如果另外存一份总额，每次增删订单都要同步修改，容易漏掉其中一处。\n\nEffect 适合与组件之外的系统同步，例如订阅浏览器事件，并在清理时取消订阅。普通计算不必为了“响应变化”绕到 Effect 里。可增删或排序的列表还应使用稳定的业务 ID 作为 key，让 React 正确识别每一项。"]
],`// 用纯函数模拟三次函数式状态更新
let state = 0;
const updates = [n => n + 1, n => n + 1, n => n + 1];
for (const update of updates) state = update(state);
console.log(state);`,'输出 3。实际 React 中可用 setCount(n => n + 1) 表达前值更新。',['直接修改对象可能让变更难以追踪，应按状态更新规则生成新值。','数组下标不适合用作会插入、删除、排序列表的稳定身份。'],[
 Q('总额完全由订单数组决定，通常先怎么做？',['再存一个总额并手动同步','从数组计算派生值','每次刷新数据库'],1,['两份状态容易不一致。','正确，先保持单一数据来源。','不必要地引入外部依赖。']),
 Q('连续三次基于前值加一，更合适的 setter 形式？',['setCount(count + 1) 全部读取同一快照','setCount(n => n + 1)','直接 count++'],1,['多次读取同一旧值可能不能累加到预期。','正确，更新函数依次接收前一结果。','直接改局部变量不是 React 状态更新。'])
],['react'],'为一个页面列出真正状态、派生值、外部副作用，尝试删除一项多余状态。'),
];
