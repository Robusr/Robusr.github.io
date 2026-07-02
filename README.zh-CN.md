# Robusr's Utopia

[ [English](./README.md) ]

一个模拟 macOS 终端交互的个人主页。访客可以输入命令、提问或自由聊天 --
由 DeepSeek AI 驱动，搭载从真实的 Robusr 蒸馏而来的人格设定。
一切都在毛玻璃终端窗口中完成，访问 [robusr.cn](https://robusr.cn)。

![终端截屏](./assets/img/example.png)

## 功能特性

- **macOS 风格终端窗口** -- 红黄绿交通灯标题栏、圆角、毛玻璃背景模糊
  效果（backdrop-filter），覆盖全屏背景图
- **Oh My Zsh 风格提示符**（`$ ~`），支持上下箭头浏览历史命令，
  Ctrl+L 清屏
- **打字机效果输出** -- 回复内容逐字打印，模拟真实终端体验
- **AI 对话** -- 不匹配命令的输入通过 Cloudflare Pages Function 路由到
  DeepSeek，以 Robusr 的说话风格流式回复。按 Esc 可中断正在进行的回复
- **ASCII 像素风 Logo** -- 斜体 "Robusr" 文字，逐字母彩虹配色
  （通过 Pillow 离线生成）
- **中英双语 i18n** -- 默认英文，输入 `lang` 命令可切换为中文
- **实时 GitHub 集成** -- 页面加载时自动获取公开仓库列表和个人资料统计
- **自然语言匹配** -- 可用中英文直接提问，如 "你是谁？"、"你会什么？"、
  "看看你的项目"
- **响应式布局** -- 移动端自适应，字体和边距自动缩小

## 可用命令

| 命令 | 别名 | 说明 |
|---|---|---|
| `help` | `h`, `?` | 显示完整命令列表 |
| `about` | `whoami` | 显示个人简介 |
| `skills` | `skill` | 列出技能 |
| `contact` | -- | 显示联系方式 |
| `projects` | `project`, `portfolio` | 列出 GitHub 公开仓库（实时） |
| `stats` | `status` | 显示 GitHub 个人资料概览（实时） |
| `lang` | `zh`, `en` | 切换中 / 英文 |
| `clear` | `cls` | 清屏 |

任何不匹配命令的输入都会发送给 LLM。你可以自然聊天，询问 Robusr 的
经历背景，讨论机器人或技术话题，或者只是打个招呼。

## 项目结构

```
.
├── index.html                # HTML 骨架
├── css/
│   └── style.css             # 全部样式
├── js/
│   └── main.js               # 终端引擎、i18n、命令逻辑、LLM 客户端
├── functions/
│   └── api/
│       └── chat.js           # Cloudflare Pages Function -- DeepSeek API 代理
├── prompt/
│   └── system.js             # 系统提示词（Robusr 人格 + 场景适配）
├── assets/
│   └── img/
│       ├── Street.webp       # 全屏背景图（WebP）
│       ├── Robusr.jpeg       # 原始头像
│       ├── Robusr_32.jpeg    # 网站图标（32x32）
│       └── example.png       # README 截屏
├── scripts/
│   └── ascii_gen.py          # ASCII Logo 离线生成工具（Pillow）
├── .gitignore
├── README.md
└── README.zh-CN.md
```

## 自定义配置

### 个人信息

编辑 [js/main.js](js/main.js) 顶部的 `personalInfo` 对象：

```javascript
const personalInfo = {
  name:    'YourName',
  tagline: { en: "...", zh: "..." },
  bio:     { en: "...", zh: "..." },
  skills:  { en: [...], zh: [...] },
  contact: { email: '...', github: '...', wechat: '...' },
};
```

### 系统提示词

编辑 [prompt/system.js](prompt/system.js) 来修改 AI 人格。
文件包含 Part A（自我记忆、价值观、重要经历）和 Part B
（人格模型，含说话风格、情感模式和社交行为）。
文件是标准 ES 模块，导出 `SYSTEM_PROMPT` 模板字符串。

### ASCII Logo

Logo 像素图已预计算并存储为 `LOGO_UP` 常量。
如需修改文字后重新生成，运行：

```bash
python3 scripts/ascii_gen.py "你的名字"
```

然后将打印的 `LOGO_UP` / `LOGO_UP_SPLITS` / `LOGO_COLORS`
代码块复制到 [js/main.js](js/main.js) 中。

依赖：Python 3 + [Pillow](https://python-pillow.org/)
（`pip install Pillow`）。

### 背景图

将 `assets/img/Street.webp` 替换为你自己的图片。
如更改文件名，需同步更新 [css/style.css](css/style.css) 中
`.bg` 规则的 URL。

## 部署

本站部署在 **Cloudflare Pages**，绑定自定义域名
[robusr.cn](https://robusr.cn)。`/api/chat` 端点由
Cloudflare Pages Function（`functions/api/chat.js`）处理，
代理转发到 DeepSeek API。

自行部署步骤：

1. 将仓库推送到 GitHub
2. 在 Cloudflare Pages：创建项目，连接仓库，
   Framework preset 选 **None**，Build output directory 设为 `.`
3. 在项目设置中添加环境变量 `DEEPSEEK_API_KEY`
4. （可选）绑定自定义域名

本站也可以直接作为 GitHub Pages 静态站点部署 -- LLM 对话功能
在 `/api/chat` 不可用时仅显示错误提示，不影响其他功能。

## 技术栈

| 层级 | 技术 |
|---|---|
| 标记 | HTML5 |
| 样式 | CSS3（Flexbox、backdrop-filter、自定义滚动条） |
| 逻辑 | 原生 JavaScript（ES2020+） |
| 后端 | Cloudflare Pages Functions（Node.js，零外部依赖） |
| AI | DeepSeek API（`deepseek-chat`，流式 SSE） |
| 字体 | Fira Code / Menlo / Consolas / SF Mono（系统字体栈） |
| 数据 | GitHub REST API（未认证，仅公开数据） |
| Logo 生成 | Python 3 + Pillow（离线） |

## 许可证

本项目仅供个人使用。欢迎自行修改用于你的个人主页。
