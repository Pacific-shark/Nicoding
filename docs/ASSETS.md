# 视觉素材

`public/assets/nicoding-logo.png`：透明 PNG，衬线 Nicoding 字标与猫耳轮廓，深棕字色、焦糖色线条。

`public/assets/nico-poses.png`：1536×1024，3 列×2 行，六格分别为睁眼、眨眼、挥爪、开心、睡觉、向右行走。每格 512×512。素材为白底，通过 CSS background-position 与混合模式在暖色页面展示；没有程序抠图或重新着色。

两份美术素材使用图像生成工具为此项目生成。主页面和学习页均使用真实 HTML/CSS/React 实现，概念图没有被当作整页背景来假装交互。

`public/fonts/nicoding-sans-sc.woff2`：Noto Sans SC 可变字体的课程字符子集，约 353 KiB（会随课程字符增减）。中文标题、正文和知识树统一使用此字体，代码继续使用等宽字体，Nicoding 字标保持原图。字体随网站提供，不依赖字体 CDN；未包含的用户输入字符由系统中文字体补足。

字体采用 SIL Open Font License 1.1，完整许可保留在 `public/licenses/NotoSansSC-OFL.txt`。[官方字体来源](https://github.com/google/fonts/tree/main/ofl/notosanssc)。增加新课程后可安装可选工具 `fonttools[woff]`，运行 `python scripts/prepare-font.py /path/to/NotoSansSC-VF.ttf` 重新生成子集；该脚本从源码提取字符并检查中文覆盖。普通构建不需要这些额外工具。
