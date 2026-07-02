# Robusr's Utopia

[ [中文](./README.zh-CN.md) ]

A macOS Terminal-style personal homepage that simulates an interactive
shell session. Visitors can type commands, ask questions, or chat freely --
powered by DeepSeek AI with a custom persona distilled from the real Robusr.
Everything runs inside a frosted-glass terminal window at [robusr.cn](https://robusr.cn).

![Terminal Screenshot](./assets/img/example.png)

## Features

- **macOS terminal window** with traffic-light title bar, rounded
  corners, and backdrop-blur glassmorphism over a fullscreen background
- **Oh My Zsh style prompt** (`$ ~`) with command history navigable via
  Arrow-Up / Arrow-Down and Ctrl+L to clear
- **Typewriter-effect responses** -- output is printed character by
  character for a realistic terminal feel
- **AI-powered chat** -- unmatched input is routed to DeepSeek via a
  Cloudflare Pages Function, responding in Robusr's own voice with
  streaming text. Press Esc to cancel an in-progress response
- **ASCII pixel-art logo** rendered in italic with per-letter rainbow
  colours (generated offline via Pillow)
- **Dual-language i18n** -- English by default, toggle to Chinese with
  the `lang` command
- **Live GitHub integration** -- fetches public repository list and
  profile stats from the GitHub API at page load
- **Natural-language matching** -- ask "Who are you?", "What can you
  do?", or "Show me your projects" in either English or Chinese
- **Responsive layout** -- adapts to mobile viewports with smaller
  fonts and tighter margins

## Commands

| Command | Aliases | Description |
|---|---|---|
| `help` | `h`, `?` | Show the full command list |
| `about` | `whoami` | Display personal bio |
| `skills` | `skill` | List technical skills |
| `contact` | -- | Show email, GitHub, and WeChat |
| `projects` | `project`, `portfolio` | List public GitHub repositories (live) |
| `stats` | `status` | Show GitHub profile overview (live) |
| `lang` | `zh`, `en` | Toggle between English and Chinese |
| `clear` | `cls` | Clear the terminal screen |

Anything that does not match a command is sent to the LLM. You can chat
naturally, ask about Robusr's background, discuss robotics or technology,
or just say hello.

## Project Structure

```
.
├── index.html                # HTML skeleton
├── css/
│   └── style.css             # All styles
├── js/
│   └── main.js               # Terminal engine, i18n, commands, LLM client
├── functions/
│   └── api/
│       └── chat.js           # Cloudflare Pages Function -- DeepSeek API proxy
├── prompt/
│   └── system.js             # System prompt (Robusr persona + scene adaptation)
├── assets/
│   └── img/
│       ├── Street.webp       # Fullscreen background (WebP)
│       ├── Robusr.jpeg       # Original avatar
│       ├── Robusr_32.jpeg    # Favicon (32x32)
│       └── example.png       # README screenshot
├── scripts/
│   └── ascii_gen.py          # Offline ASCII logo generator (Pillow)
├── .gitignore
├── README.md
└── README.zh-CN.md
```

## Customisation

### Personal Info

Edit the `personalInfo` object at the top of [js/main.js](js/main.js):

```javascript
const personalInfo = {
  name:    'YourName',
  tagline: { en: "...", zh: "..." },
  bio:     { en: "...", zh: "..." },
  skills:  { en: [...], zh: [...] },
  contact: { email: '...', github: '...', wechat: '...' },
};
```

### System Prompt

Edit [prompt/system.js](prompt/system.js) to change the AI persona.
It contains Part A (self memory, values, key experiences) and
Part B (personality model with speaking style, emotional patterns,
and social behaviour). The file is a standard ES module exporting
a `SYSTEM_PROMPT` template literal.

### ASCII Logo

The pixel-art logo is pre-computed and stored as a `LOGO_UP` constant.
To regenerate it after changing the text, run:

```bash
python3 scripts/ascii_gen.py "YourName"
```

Then copy the printed `LOGO_UP` / `LOGO_UP_SPLITS` / `LOGO_COLORS`
blocks into [js/main.js](js/main.js).

Requirements: Python 3 with [Pillow](https://python-pillow.org/)
(`pip install Pillow`).

### Background Image

Replace `assets/img/Street.webp` with your own image.  Update the URL in
[css/style.css](css/style.css) (`.bg` rule) if you change the filename.

## Deployment

The site is deployed on **Cloudflare Pages** with a custom domain at
[robusr.cn](https://robusr.cn). The `/api/chat` endpoint is handled by
a Cloudflare Pages Function (`functions/api/chat.js`) that proxies
requests to the DeepSeek API.

To deploy your own:

1. Push the repository to GitHub
2. In Cloudflare Pages: Create a new project, connect the repo,
   set Framework preset to **None**, Build output directory to `.`
3. Add environment variable `DEEPSEEK_API_KEY` in project settings
4. (Optional) Bind a custom domain

The site also works as a static GitHub Pages deployment -- the LLM chat
simply falls back to an error message when `/api/chat` is unavailable.

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (Flexbox, backdrop-filter, custom scrollbars) |
| Logic | Vanilla JavaScript (ES2020+) |
| Backend | Cloudflare Pages Functions (Node.js, zero dependencies) |
| AI | DeepSeek API (`deepseek-chat`, streaming SSE) |
| Font | Fira Code / Menlo / Consolas / SF Mono (system stack) |
| Data | GitHub REST API (unauthenticated, public data) |
| Logo gen | Python 3 + Pillow (offline) |

## License

This project is for personal use.  Feel free to adapt it for your own
homepage.
