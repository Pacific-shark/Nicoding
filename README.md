# Nicoding

从项目课题学习技术，用知识星图查清概念之间的关系。

[打开课程](https://pacific-shark.github.io/Nicoding/#explore) · [知识星图](https://pacific-shark.github.io/Nicoding/#library) · [源码](https://github.com/Pacific-shark/Nicoding)

## 课程结构

2026-09-18 版采用 **领域章节 → 多个课题 → 实施环节**。知识点是独立页面，由课题引用，不再把知识点列表直接当作课程主线。

| 章节 | 课题数 | 核心课题 |
| --- | ---: | --- |
| Python | 3 | 订单规则、脏数据清洗、阅读 Flask 教学项目 |
| Web 开发 | 3 | 交互看板、接口客户端、完整前端的状态与请求 |
| 软件工程 | 3 | 可验证的修改、数据契约、可复现交付 |
| 数学与统计 | 2 | 梯度工作坊、实验设计 |
| 机器学习 | 6 | 银行分类、房价管道、分类器对照、分群降维、提升与解释、时间回测 |
| 深度学习 | 6 | micrograd、训练循环、ResNet 迁移、seq2seq、小 Transformer、DCGAN |
| 大模型应用 | 3 | RAG 证据、工具 Agent、指令微调 |
| 强化学习 | 4 | Bandit、DQN、PPO、SAC |

共 **30 个课题、95 个实施环节、84 个知识点、165 道知识理解题**。新增 24 篇知识包含机制、公式或形状、算例、混淆点、可运行的小实验及原始资料；原有数据划分、线性模型、树、链式法则等内容也补充了讲解。内容量和实际复现范围以每页说明为准，不把所有算法都标成已深入掌握。

- 章节按课题推进，每个开篇说明产出、环境、数据、承接关系和参考源码。
- 课题环节可以直接打开所需知识，再回到原环节。检查清单和实验记录自动保存，可导出 Markdown。
- 全局星图直接展示 84 个知识点，用不同姿势的简笔猫作为节点，以连线展示真实先修关系；局部按领域展开。默认静止，空白处按住鼠标左键拖动视角，松手即停。左侧切换层级、领域、缩放和复位，两层独立保留本次浏览的视角。
- 节点表情对应课程难度：基础放松、进阶思考、挑战惊讶；完成检查另以小勾标记。支持搜索、列表、键盘选择和定位，文字朝向屏幕，拥挤标签在悬停或键盘聚焦时显示。点击查看知识详情，双击打开讲解。
- 知识页有固定目录、正文、运行实验、理解检查、自我解释、关联课题和来源。计算图、数据切分、因果注意力与对象引用有可操作示意。
- 桌面固定顶栏和侧栏，移动端将星图控制放在上方、详情放在下方，支持触摸转动。Nico 在学习界面默认收为标签，仍可展开、拖动和使用专注计时；沿用已有形象。

## GitHub 复现

实际阅读并固定到提交的参考包括 `karpathy/micrograd`、`ageron/handson-ml3`、`pytorch/tutorials`、`rasbt/LLMs-from-scratch`、`vwxyzjn/cleanrl`、Flask、FastAPI 模板等 10 个仓库。提交、核对日期、文件和许可记录在 `src/atlas/sources.json`；课题直接链接到相应源码位置。

指南区分机制复现、缩小配置与完整训练。多数 GitHub 课题需要在本地执行，网页没有代跑 PyTorch/GPU 训练，也未验证每个课题的完整训练指标。RAG 旧教程涉及过时接口，课程说明需迁移；未发现明确许可的仓库只提供阅读链接，不分发原文件。讲解和任务是本项目原创，没有复制整本书或镜像第三方教材。

## 可以在浏览器实际运行的内容

- Python、JavaScript、SQLite 的知识算例和练习；13 组独立代码挑战、45 个行为检查。
- 8 个小项目工作区，含起始代码、分步提示、参考解法和 30 组行为检查。
- 银行营销分类课题：4,521 条 UCI 记录、12 小节、4 组 Python 练习、真实 NumPy 训练、验证集决策、冻结后测试、模型与报告导出。
- 原有对象引用实验室和交互学习场景保留，旧课程地址仍可打开。

运行与检查是真实计算。自查勾选只表示学习者自己的记录；知识点的完成标记只表示通过局部检查，不能代表项目已复现或能力认证。基础 Python 首次加载约 13 MB，银行实验另需 NumPy。网页不要求 API key，不调用在线 AI。

## 进度保存

记录保存在当前浏览器 `localStorage` 的 `nicoding.learning.v1`。新课题记录、84 个知识点的笔记、挑战草稿、原有实验和项目记录都纳入备份。旧版 v1 备份仍可导入。

在设置中导出 JSON；导入后先预览，再恢复。本地、GitHub Pages、不同浏览器和设备分别存储，没有账户或云同步。换地址前请导出，避免把 `localhost` 与 `127.0.0.1` 当成同一来源。

## 本地运行与开发

源码使用 React 19.2.8、Vite 8.2.2、lucide-react 1.42.0、Pyodide 0.27.7；依赖固定在 `pnpm-lock.yaml`。

```sh
pnpm install --frozen-lockfile
node scripts/prepare-runtime.mjs
pnpm dev
pnpm build
node server.mjs
```

开发环境使用 Node.js 24、pnpm 11.19.0。`Start-Nicoding.cmd` 可启动已构建的网站，默认地址 http://127.0.0.1:4173；`Stop-Nicoding.cmd` 停止服务。不要直接双击 dist/index.html，代码工作线程需要 HTTP 服务。

- `src/atlas/`：章节、课题、知识、星图、独立阅读页、课题记录。
- `src/data/`：原有知识与练习；`src/courses/bank/`：真实模型课题。
- `src/state.js`：进度与导入兼容；`src/runtime.js`、`public/workers/`：真实代码执行。
- `public/runtime/`：本地运行时；`public/licenses/`：随包第三方许可。

## 验证和发布

```sh
pnpm validate:atlas
pnpm validate:content
pnpm validate:learning
pnpm validate:journeys
pnpm validate:story
pnpm validate:courses
pnpm validate:bank
pnpm build --base /Nicoding/
```

验证需要 Python；银行模型需要 NumPy 2.0.2。`validate:atlas` 检查课题引用、先修无环、GitHub 提交及文件、备份兼容、异常记录，以及 24 个新增 Python 算例的实际执行与关键数值。其他校验覆盖原有课程、练习、训练和数据边界。

GitHub Actions 在 main 推送后运行全部校验，再构建和部署 Pages。构建失败不会发布。线上使用 /Nicoding/ 子目录，本地构建默认相对路径；dist 不提交。

基础编辑器单次执行上限 5 秒；银行实验使用独立的 120 秒运行上限。它们不直接操作电脑真实文件系统。Nico 使用独立姿态素材和现有展示方式，本轮未修改猫的图像资产。
