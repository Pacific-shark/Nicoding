# Nicoding

一点一点，学会创造。给 AI 产品与工程学习者的学习空间，和金加白米努特 Nico 一起点亮知识树。

## 在线访问

[打开 Nicoding](https://pacific-shark.github.io/Nicoding/) · [源码仓库](https://github.com/Pacific-shark/Nicoding)

网页版直接使用浏览器中的 Python / JavaScript / SQLite 运行练习，无需安装或 API key。首次运行 Python 会下载约 13 MB 的运行时文件，请等待加载完成。

**本地和线上进度分别保存。** 如果已经在本地学习，请先在本地页面的“设置 → 导出进度”下载 JSON，再到网页版设置中导入。浏览器不会自动搬迁记录，也没有跨设备同步。

## 本地打开

双击 `Start-Nicoding.cmd`，浏览器打开 **http://127.0.0.1:4173**。启动器优先复用当前设备 Codex 自带的 Node，也支持系统 PATH 中的 Node。服务只监听本机。关闭浏览器不会关闭服务；需要时运行 `Stop-Nicoding.cmd`。

从源码克隆时，先安装 Node.js 24 和 pnpm 11.19.0，按下方“二次开发”安装依赖并构建，再运行 `node server.mjs`。已构建的完整压缩包可直接启动。**不要直接双击 dist/index.html**：浏览器代码工作线程需要本地 HTTP 服务。

运行已构建网页无需安装 npm 依赖，也无需 API key。基础 Python、JavaScript、SQLite 练习使用随包提供的运行时；原文资料链接需要网络。

## 这版包含什么

- 8 个领域、60 个原创学习节点、141 道带逐项解释的理解题、15 组代码挑战和 51 个行为/边界检查。
- Python、JavaScript/Web、软件工程/SQL、数学实验、ML、DL、RL、LLM/Agent。
- 算法涵盖梯度、模型评估、树与集成、推荐、张量、反向传播、CNN/ResNet、RNN/LSTM、Attention/Transformer、自监督、生成模型、Bandit、MDP、Q-learning/SARSA、DQN、Actor–Critic、PPO/SAC、离线 RL、RAG、LoRA、RLHF/DPO/GRPO。
- 8 个可在浏览器运行的小项目，含起始代码、参考解法、30 组行为检查与进阶要求；另有 5 个综合项目，可保存行动清单和交付证据。
- 三层导航：学习方向总览 → 板块阶段路线 → 独立课程页。每个节点直接进入课程，有先修、学习理由、阶段成果、前后课程与项目衔接；优先节点保留局部环光。
- 60 节各自配有直观解释、3 步推演、进阶问题与参考推理，以及向 Nico 讲解的专属提示和 3 条自查标准。解释与变式答案自动保存，不自动判分。
- Nico 能眨眼、击掌、打盹、散步、拖动，也会响应点亮事件。方向键可移动，设置中可以隐藏或重置。需要清爽空间时，可随时收起或拖走。
- Nico 使用独立顶层浮层，提供本节预设提示、课程/下一节/讲解练习/小项目入口，以及可暂停的 5/15/25 分钟专注计时。可收成标签；计时在页面内导航时继续，刷新或关闭 Nico 会重置。设置弹窗打开时保留可见形象，暂停小猫操作以维持弹窗的键盘焦点。

## 怎样学

建议先补 **变量 → 条件 → 函数 → 容器 → 引用 → 异常**，并行学接口契约、Git diff、测试、JSON、HTTP，再进入模型评估和算法。

每关按“理解概念 → 看懂示例 → 修改与观察 → 检查理解 → 解释与进阶”走。不要一开始就打开参考答案：先预测、运行，再说明差异来自哪里。课程提供分层提示；用了提示或错误反馈会记录在本轮点亮信息中。

有代码挑战的课程要通过理解题与真实断言。其他课程要运行实验、留下至少 10 个字的观察记录并通过理解题；观察记录只检查是否填写，**不自动判断解释是否正确**。点亮表示通过本关有限检查，不是就业资格或研究能力认证。

进阶节点标有“算法进阶/算法导览”。浏览器实验只用小型数值例子建立直觉；PyTorch/GPU/大型模型训练需要按原始资料在本地或适当计算环境复现。先修只建议顺序，不强制锁门。

完成后约 1 天进入复习；之后按本次复习时间安排 3、7、14、30 天间隔。可以提前回想，重新正确作答后才记录复习。项目清单由你核对真实交付证据。

## 路线与分层练习

`#explore` 展示共同基础、AI 应用和算法原理分支；`#path/py` 等路线按章节列出完整节点；`#learn/py-functions` 等课程地址可以直接访问、刷新、分享和用浏览器返回。旧的 `#explore/课程ID` 地址仍可进入相应课程。

章节编号是教学建议，不代表每节都严格依赖上一节。课程的“建议先会”列出直接先修，“可选延伸”列出适合进一步研究但不阻塞入门的知识。大模型前 6 节以应用为主，微调与对齐再连接深度学习和强化学习。具体图结构属于本项目的教学设计，并非通用的能力认证标准。

“解释与进阶”借鉴费曼式自我解释：先闭卷作答，再展开例题推演、检查遗漏，最后处理一个变式。参考 [IES 学习实践指南](https://ies.ed.gov/ncee/wwc/practiceguide/1) 与 [CMU 主动学习中的例题解释](https://www.cmu.edu/teaching/online/designteach/strategies/activelearning.html)。两者支持采用解释、例题与练习等策略，不构成对本项目效果的验证。自查勾选与代码检查分开，表达流畅或勾选完整不会自动点亮课程。

每个方向末尾衔接一个小项目，通常建议留出 45–90 分钟，可按基础调整。浏览器检查的是有限的核心行为；React 完整界面、真实 RAG 服务、PyTorch 训练等扩展任务需在本地完成。小项目的原始输入契约、空值/边界行为和简化假设均在对应页面说明。

## 进度与隐私

进度、代码挑战草稿、手动保存的课程笔记、自我解释与进阶作答、小项目代码、项目记录与设置保存在当前浏览器的 `localStorage`，键为 `nicoding.learning.v1`。没有账户、云同步、统计埋点或在线 AI 调用。

在“设置 → 导出进度”备份。换浏览器、清理站点存储、更换主机名/端口前先导出。导入先验证格式、展示内容摘要，确认恢复后才替换当前记录。普通课程笔记要点击“保存笔记”；项目记录、自我解释与小项目代码自动保存。旧版 v1 备份仍可导入；新字段缺失时初始化为空，不修改已有学习记录。

`localhost` 和 `127.0.0.1` 是不同存储来源，请固定使用上面的地址。停止本地服务不会删除浏览器记录。

## 内容与来源

讲解、业务例子、测验和挑战为本项目原创编写；每关的“资料”页链接到对应文档或原文，共 46 个不同入口，包括 Python 官方、MDN、TypeScript、React、Pro Git、PostgreSQL、NIST、Google ML、scikit-learn、PyTorch、D2L、Hugging Face、MCP 与算法原始论文。

原文链接与内容在 2026-09-08 核对。参考材料是学习依据，不表示原作者为本项目背书；API、模型和协议仍需匹配你实际使用的版本。项目保留的是原创课程与引用链接，没有抓取整站教材作为离线副本。

## 二次开发

源码使用 React 19.2.8、Vite 8.2.2、lucide-react 1.42.0，Python 运行时固定 Pyodide 0.27.7。依赖版本记录在 `pnpm-lock.yaml`。

```sh
pnpm install --frozen-lockfile
node scripts/prepare-runtime.mjs
pnpm dev
pnpm build
node server.mjs
```

代码组织：`src/data/` 是课程；`src/components/` 是交互界面；`src/runtime.js` 与 `public/workers/` 负责运行/终止代码；`src/state.js` 管理记录与导入验证；`public/runtime/` 提供本地 Python 与 SQLite；`server.mjs` 是不依赖第三方包的本地服务。

开发验证：`pnpm validate:content` 会检查先修无环、8 条路线完整覆盖、板块内推荐顺序与先修一致、60 份推演结构、测验结构、全部原始示例和小项目的参考解法及错误起始代码。需要本地 Python，可用 `NICODING_PYTHON` 指定解释器。GitHub Actions 使用 Python 3.12 自动执行相同校验；验证失败会阻止发布。

## 自动部署

`.github/workflows/deploy.yml` 在推送到 `main` 后校验课程、构建网页并发布到 GitHub Pages，也可以在 Actions 页面手动运行。Pages 的发布来源设为 **GitHub Actions**。

发布时从 Pages 配置获取站点子目录并传给 Vite；本地构建保留相对路径。`dist/` 是构建产物，不提交到源码仓库。固定版本的 Python/SQLite 运行时和第三方许可随源码保存，网页运行无需连接外部代码 CDN。

配置参考：[Vite 部署指南](https://vite.dev/guide/static-deploy.html#github-pages)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 运行范围

代码在 Worker 内执行，准备运行时最长等候 60 秒，单次执行上限 5 秒，输出限制约 16 KB。不会直接访问电脑真实文件系统。此编辑器用于你自己编写或理解的练习，不是面向陌生人上传任意代码的托管判题平台。

第三方组件的许可保留在 `public/licenses/` 和构建结果 `dist/licenses/`。Nico 六姿态图和字标图为本项目生成的美术素材；精灵图使用白底与 CSS 混合展示，未伪称是透明 PNG。
