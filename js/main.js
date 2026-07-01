// ============================================================
//  Robusr's Utopia — Terminal simulation engine
// ============================================================

// ============================================================
//  Personal Info — dual-language (en / zh)
// ============================================================
const personalInfo = {
  name:    'Robusr',
  tagline: { en: "Robusr's Utopia", zh: 'Robusr 的乌托邦' },
  bio:     {
    en: 'An interesting old soul -- coding, writing, designing, and drinking through life.',
    zh: '一个有趣的老东西 -- 编程、写作、设计、小酌，如是度过每一天。',
  },
  skills: {
    en: ['Coding', 'Writing', 'Designing', 'Chating', 'Drinking'],
    zh: ['编程', '写作', '设计', '闲聊', '小酌'],
  },
  contact: {
    email:  'Robusr@outlook.com',
    github: 'https://github.com/Robusr',
    wechat: 'RobusrID',
  },
};

// ============================================================
//  i18n — English-first; toggle with:  lang / zh / en
//  ALL output is pure ASCII; no emoji anywhere.
// ============================================================
let locale = 'en';

const t = {
  en: {
    sysinfo: (name, tagline) => [
      `${name}@${tagline}`,
      `${'-'.repeat(28)}`,
      `OS:      ${tagline}`,
      `Host:    GitHub Pages`,
      `Kernel:  HTML5 + CSS3 + JS`,
      `Shell:   -zsh 5.9`,
    ].join('\n'),
    welcome: [
      `+----------------------------------------------+`,
      `|                                              |`,
      `|         Welcome to Robusr's Utopia           |`,
      `|                                              |`,
      `|  Type help to see available commands         |`,
      `|  Or just ask me anything, e.g.:              |`,
      `|    - Who are you?                            |`,
      `|    - What can you do?                        |`,
      `|    - Show me your projects                   |`,
      `|                                              |`,
      `+----------------------------------------------+`,
    ].join('\n'),
    placeholder: 'Type a command or question...',
    about: (name, bio) => [
      `Name: ${name}`,
      `${'-'.repeat(32)}`,
      bio.en,
    ].join('\n'),
    skillsTitle: '[*] Skills',
    contactTitle: '[@] Contact',
    contact: (c) => [
      `  Email:   ${c.email}`,
      `  GitHub:  ${c.github}`,
      `  WeChat:  ${c.wechat}`,
    ].join('\n'),
    projectsLoading: 'Fetching repositories from GitHub...',
    projectsFailed: 'WARNING: Failed to fetch repos. Please check your network and try again.',
    projectsTitle: '=== GitHub Repositories',
    projectsEmpty: '  No public repositories found.',
    forkTag: 'fork',
    statsLoading: 'Fetching GitHub profile stats...',
    statsFailed: 'WARNING: Failed to fetch profile stats.',
    statsTitle: '=== GitHub Stats',
    help: [
      '+==========================================+',
      '|     [*]  Available Commands              |',
      '+==========================================+',
      '|  help       Show this help               |',
      '|  about      Display bio                  |',
      '|  skills     List skills                  |',
      '|  contact    Show contact info            |',
      '|  projects   List GitHub repos            |',
      '|  stats      GitHub profile overview      |',
      '|  lang       Toggle EN / Chinese          |',
      '|  clear      Clear screen                 |',
      '+==========================================+',
      '|  >  Or ask naturally:                    |',
      '|  - Who are you?                          |',
      '|  - What can you do?                      |',
      '|  - How to reach you?                     |',
      '|  - Show me your projects                 |',
      '+==========================================+',
    ].join('\n'),
    notFound: "Sorry, I haven't learned how to answer that yet. Try typing help to see what I can do.",
    langEN: '--- Switched to English.',
    langZH: '--- 已切换为中文。',
    titleBar: "guest@Robusr's Utopia -- -zsh -- 80x24",
  },
  zh: {
    sysinfo: (name, tagline) => [
      `${name}@${tagline}`,
      `${'-'.repeat(28)}`,
      `系统:    ${tagline}`,
      `主机:    GitHub Pages`,
      `内核:    HTML5 + CSS3 + JS`,
      `Shell:   -zsh 5.9`,
    ].join('\n'),
    welcome: [
      `+----------------------------------------------+`,
      `|                                              |`,
      `|         欢迎来到 Robusr 的乌托邦              |`,
      `|                                              |`,
      `|  输入 help 查看可用命令                       |`,
      `|  也可以直接向我提问，例如：                    |`,
      `|    - 你是谁？                                 |`,
      `|    - 你会什么？                               |`,
      `|    - 看看你的项目                             |`,
      `|                                              |`,
      `+----------------------------------------------+`,
    ].join('\n'),
    placeholder: '输入命令或问题...',
    about: (name, bio) => [
      `Name: ${name}`,
      `${'-'.repeat(32)}`,
      bio.zh,
    ].join('\n'),
    skillsTitle: '[*] 技能清单',
    contactTitle: '[@] 联系方式',
    contact: (c) => [
      `  邮箱:    ${c.email}`,
      `  GitHub:  ${c.github}`,
      `  微信:    ${c.wechat}`,
    ].join('\n'),
    projectsLoading: '正在从 GitHub 获取仓库列表...',
    projectsFailed: 'WARNING: 获取仓库失败。请检查网络后重试。',
    projectsTitle: '=== GitHub 仓库',
    projectsEmpty: '  暂无公开仓库。',
    forkTag: 'fork',
    statsLoading: '正在获取 GitHub 统计数据...',
    statsFailed: 'WARNING: 获取统计数据失败。',
    statsTitle: '=== GitHub 统计',
    help: [
      '+==========================================+',
      '|     [*]  可用命令                         |',
      '+==========================================+',
      '|  help       显示此帮助                    |',
      '|  about      个人简介                      |',
      '|  skills     技能列表                      |',
      '|  contact    联系方式                      |',
      '|  projects   查看 GitHub 仓库              |',
      '|  stats      GitHub 统计概览               |',
      '|  lang       切换 EN / 中文                |',
      '|  clear      清屏                          |',
      '+==========================================+',
      '|  >  也可以直接提问：                       |',
      '|  - 你是谁？                                |',
      '|  - 你会什么？                              |',
      '|  - 怎么联系你？                            |',
      '|  - 你做过什么项目？                        |',
      '+==========================================+',
    ].join('\n'),
    notFound: '抱歉，我还没学会回答这个问题。试试输入 help 看看我能做什么吧。',
    langEN: '--- Switched to English.',
    langZH: '--- 已切换为中文。',
    titleBar: "guest@Robusr's Utopia -- -zsh -- 80x24",
  }
};

function tStr(key, ...args) {
  const fn = t[locale][key];
  return typeof fn === 'function' ? fn(...args) : fn;
}

// ============================================================
//  ASCII Pixel-Art Logo — "Robusr :)" + row-shift slant,
//  per-letter colour.  83x13 upright, 1-char/row reversed.
//  Smiley face shares warm yellow tone.
//  Regenerate:  python3 scripts/ascii_gen.py
// ============================================================
const LOGO_UP = [
'                                                                               ##  ',
'######              ##                                                          ## ',
'#######             ##                                                          ## ',
'##   ###            ##                                                          ## ',
'##    ##     ##     ## ##     #    #      ##       #  #                #         ##',
'##   ###   #####    ######   ###   ##   ######    #######             ###        ##',
'#######   #######   #######   #    ##  #######    #######             ###        ##',
'######    ##   ##   ##   ##  ###   ##  ##         ###                 ###        ##',
'#######   ##    ##  ##   ### ###   ##  ###        ##                   #         ##',
'##   ##   ##    ##  ##    ## ###   ##   #####     ##                             ##',
'##   ##   ##    ##  ##   ### ###   ##     ####    ##                             ##',
'##    ##  ##   ###  ##   ##   ##  ###       ##    ##                  ###        ##',
'##    ##  ###  ##   ### ###   ##  ###  ##   ##    ##                  ###        ##',
];
const LOGO_UP_SPLITS = [9, 18, 27, 36, 46, 55, 64, 73];
const LOGO_UP_WIDTH = 83;
const LOGO_COLORS = ['#FF6188','#FC9867','#FFD866','#A9DC76','#78DCE8','#AB9DF2','#8888A0','#FFBD2E','#FFBD2E'];
const LOGO_SLANT = 1;
const LOGO_DIR = 'reverse';  // top rows more indent
const LOGO_ROWS = LOGO_UP.length;
const LOGO_TOTAL_W = LOGO_UP_WIDTH + LOGO_SLANT * (LOGO_ROWS - 1);

// ============================================================
//  DOM References
// ============================================================
const terminalBody = document.getElementById('terminalBody');
const output       = document.getElementById('output');
const cmdInput     = document.getElementById('cmdInput');
const titleBar     = document.getElementById('titleBar');

// ============================================================
//  State
// ============================================================
let commandHistory = [];
let historyIndex   = -1;
let isTyping       = false;
let ghReposCache   = null;
let ghProfileCache = null;

// ============================================================
//  Helpers
// ============================================================
function scrollToBottom() {
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function appendCommandLine(cmd) {
  const line = document.createElement('div');
  line.className = 'cmd-line';
  line.innerHTML =
    `<span class="prompt-arrow">$</span> <span class="prompt-path">~</span> <span class="cmd-text">${escapeHTML(cmd)}</span>`;
  output.appendChild(line);

  const resp = document.createElement('div');
  resp.className = 'response';
  output.appendChild(resp);
  return resp;
}

function appendSysMsg(text) {
  const div = document.createElement('div');
  div.className = 'response';
  div.innerHTML = `<span class="dim">${escapeHTML(text)}</span>`;
  output.appendChild(div);
  return div;
}

// ============================================================
//  Typewriter Effect (HTML-aware, pure ASCII output)
// ============================================================
async function typeHTML(element, html, speed = 16) {
  isTyping = true;
  cmdInput.disabled = true;

  let out = '';
  let i = 0;

  while (i < html.length) {
    const remaining = html.slice(i);
    const tagMatch = remaining.match(/^<[^>]*>/);
    if (tagMatch) {
      out += tagMatch[0];
      i += tagMatch[0].length;
      element.innerHTML = out;
      scrollToBottom();
      continue;
    }

    out += html[i];
    element.innerHTML = out;
    scrollToBottom();
    i++;

    const ch = html[i - 1];
    const pause =
      (ch === '.' || ch === '。') ? speed * 5 :
      (ch === ',' || ch === '，') ? speed * 3 :
      speed;
    await delay(pause);
  }

  isTyping = false;
  cmdInput.disabled = false;
  cmdInput.focus();
  scrollToBottom();
}

async function typeText(element, text, speed = 16) {
  await typeHTML(element, escapeHTML(text).replace(/\n/g, '<br>'), speed);
}

// ============================================================
//  Startup: pixel logo + system info + full command list
// ============================================================
function showStartupScreen() {
  // ---- Step 1: "Robusr" logo: upright colouring + row-shift slant ----
  const logoDiv = document.createElement('div');
  logoDiv.className = 'ascii-logo';
  for (let r = 0; r < LOGO_ROWS; r++) {
    const line = LOGO_UP[r];
    const leftPad  = LOGO_DIR === 'reverse'
      ? LOGO_SLANT * (LOGO_ROWS - 1 - r)
      : LOGO_SLANT * r;
    const rightPad = LOGO_TOTAL_W - leftPad - LOGO_UP_WIDTH;

    const rowDiv = document.createElement('div');
    rowDiv.style.whiteSpace = 'pre';

    let html = ' '.repeat(leftPad);
    let cursor = 0;
    for (let i = 0; i < LOGO_COLORS.length; i++) {
      const end = (i < LOGO_UP_SPLITS.length) ? LOGO_UP_SPLITS[i] : LOGO_UP_WIDTH;
      const seg = line.slice(cursor, end);
      html += `<span style="color:${LOGO_COLORS[i]};">${escapeHTML(seg)}</span>`;
      cursor = end;
    }
    html += ' '.repeat(rightPad);

    rowDiv.innerHTML = html;
    logoDiv.appendChild(rowDiv);
  }
  output.appendChild(logoDiv);

  // ---- Step 2: System info ----
  const sysDiv = document.createElement('div');
  sysDiv.className = 'sysinfo';
  sysDiv.textContent = tStr('sysinfo', 'guest', personalInfo.tagline[locale]);
  output.appendChild(sysDiv);

  // ---- Step 3: Separator ----
  const sep = document.createElement('div');
  sep.className = 'response';
  sep.innerHTML = '<span class="dim">' + '='.repeat(48) + '</span>';
  output.appendChild(sep);

  // ---- Step 4: Full command list ----
  const helpDiv = document.createElement('div');
  helpDiv.className = 'welcome';
  helpDiv.textContent = tStr('help');
  output.appendChild(helpDiv);

  scrollToBottom();
}

// ============================================================
//  GitHub API (unauthenticated -- public data only)
// ============================================================
async function ghFetch(path) {
  const res = await fetch(`https://api.github.com${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchGitHubProfile() {
  try { ghProfileCache = await ghFetch('/users/Robusr'); }
  catch { ghProfileCache = null; }
}

async function fetchGitHubRepos() {
  try {
    const data = await ghFetch('/users/Robusr/repos?per_page=50&sort=updated');
    ghReposCache = {
      originals: data.filter(r => !r.fork),
      forks:     data.filter(r => r.fork),
    };
  } catch { ghReposCache = null; }
}

// ============================================================
//  Format: projects
// ============================================================
function formatProjects() {
  if (!ghReposCache) {
    return `<span class="dim">${escapeHTML(tStr('projectsFailed'))}</span>`;
  }

  const { originals, forks } = ghReposCache;
  const lines = [tStr('projectsTitle'), '='.repeat(40), ''];

  if (originals.length === 0 && forks.length === 0) {
    lines.push(tStr('projectsEmpty'));
    return lines.join('\n');
  }

  originals.forEach((r, i) => {
    lines.push(`  <span class="hl">${i + 1}.</span> <span class="bold">${escapeHTML(r.name)}</span>`);
    if (r.description) {
      lines.push(`     <span class="dim">${escapeHTML(r.description)}</span>`);
    }
    lines.push(`     <span class="accent">url: ${escapeHTML(r.html_url)}</span>`);
    const meta = [];
    if (r.language) meta.push(`lang: ${escapeHTML(r.language)}`);
    meta.push(`* ${r.stargazers_count}`);
    meta.push(`fork: ${r.forks_count}`);
    meta.push(`since ${new Date(r.created_at).getFullYear()}`);
    lines.push(`     <span class="dim">${meta.join('  ')}</span>`);
    lines.push('');
  });

  if (forks.length > 0) {
    lines.push('<span class="dim">' + '-'.repeat(40) + '</span>');
    lines.push('<span class="dim">Forked repositories:</span>');
    lines.push('');
    forks.forEach((r, i) => {
      const desc = r.description ? ` -- ${r.description}` : '';
      lines.push(`  <span class="dim">${i + 1}.</span> <span class="dim">${escapeHTML(r.name)}</span> <span class="tag">${tStr('forkTag')}</span><span class="dim">${escapeHTML(desc)}</span>`);
      lines.push(`     <span class="accent">url: ${escapeHTML(r.html_url)}</span>`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

// ============================================================
//  Format: stats
// ============================================================
function formatStats() {
  if (!ghProfileCache) {
    return `<span class="dim">${escapeHTML(tStr('statsFailed'))}</span>`;
  }

  const p = ghProfileCache;
  const lines = [tStr('statsTitle'), '='.repeat(36), ''];

  lines.push(`  <span class="bold">${escapeHTML(p.login)}</span>`);
  if (p.name) lines.push(`  ${escapeHTML(p.name)}`);
  if (p.bio)  lines.push(`  <span class="dim">${escapeHTML(p.bio)}</span>`);
  lines.push('');

  lines.push(`  repos: <span class="hl">${p.public_repos}</span>    followers: <span class="hl">${p.followers}</span>    following: <span class="hl">${p.following}</span>`);
  lines.push('');

  if (p.company)  lines.push(`  org:   ${escapeHTML(p.company)}`);
  if (p.location) lines.push(`  loc:   ${escapeHTML(p.location)}`);
  if (p.blog)     lines.push(`  web:   <span class="accent">${escapeHTML(p.blog)}</span>`);
  lines.push(`  url:   <span class="accent">${escapeHTML(p.html_url)}</span>`);
  lines.push(`  since: ${new Date(p.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);

  lines.push('');
  lines.push(`  <span class="dim">Public gists: ${p.public_gists}</span>`);

  return lines.join('\n');
}

// ============================================================
//  Language Switch
// ============================================================
function switchLanguage(lang) {
  if (lang === locale) return;
  locale = lang;
  cmdInput.placeholder = tStr('placeholder');
  titleBar.textContent = tStr('titleBar');
  appendSysMsg(lang === 'en' ? tStr('langEN') : tStr('langZH'));
  scrollToBottom();
}

// ============================================================
//  Natural Language Matching
// ============================================================
function matchNaturalLanguage(input) {
  const lower = input.toLowerCase();

  // English
  if (/who (are|is) (you|this)|your name|what.*name/.test(lower)) return 'about';
  if (/what (can|do) you do|skill|ability|tech stack/.test(lower)) return 'skills';
  if (/contact|email|reach|find you|github|wechat|how.*(contact|reach)/.test(lower)) return 'contact';
  if (/project|repo|github|code|work|portfolio|show.*(project|repo)/.test(lower)) return 'projects';
  if (/about|bio|intro|tell me about|describe|whoami/.test(lower)) return 'about';
  if (/stat|profile|overview|account/.test(lower)) return 'stats';
  if (/help|command|what.*available/.test(lower)) return 'help';

  // Chinese
  if (/名字|叫什么|是谁|称呼|姓名|你是谁/.test(lower)) return 'about';
  if (/技能|会什么|能力|技术|擅长|懂什么|你会/.test(lower)) return 'skills';
  if (/联系|邮箱|微信|电话|找到你|联系你|怎么联系/.test(lower)) return 'contact';
  if (/项目|作品|做过|写过|仓库|github/.test(lower)) return 'projects';
  if (/简介|介绍|about|关于|背景/.test(lower)) return 'about';
  if (/统计|数据|概览|状态|账号/.test(lower)) return 'stats';

  return null;
}

// ============================================================
//  Command Execution
// ============================================================
async function executeCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;

  // History
  if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd) {
    commandHistory.push(cmd);
  }
  historyIndex = commandHistory.length;

  const respDiv = appendCommandLine(cmd);
  scrollToBottom();

  const lower = cmd.toLowerCase();

  // ---- Help ----
  if (lower === 'help' || lower === 'h' || lower === '?') {
    await typeHTML(respDiv, tStr('help'));
  }

  // ---- About ----
  else if (lower === 'about' || lower === 'whoami') {
    await typeText(respDiv, tStr('about', personalInfo.name, personalInfo.bio));
  }

  // ---- Skills ----
  else if (lower === 'skills' || lower === 'skill') {
    const title = tStr('skillsTitle');
    const list = personalInfo.skills[locale]
      .map((s, i) => `  ${String(i + 1).padStart(2, ' ')}. ${s}`)
      .join('\n');
    await typeText(respDiv, `${title}\n${'-'.repeat(24)}\n${list}`);
  }

  // ---- Contact ----
  else if (lower === 'contact') {
    const lines = [
      tStr('contactTitle'),
      '-'.repeat(24),
      tStr('contact', personalInfo.contact),
    ].join('\n');
    await typeText(respDiv, lines);
  }

  // ---- Projects ----
  else if (lower === 'projects' || lower === 'project' || lower === 'portfolio') {
    if (!ghReposCache) {
      respDiv.innerHTML = `<span class="spinner"></span> ${escapeHTML(tStr('projectsLoading'))}`;
      scrollToBottom();
      await fetchGitHubRepos();
    }
    respDiv.innerHTML = '';
    await typeHTML(respDiv, formatProjects(), 8);
  }

  // ---- Stats ----
  else if (lower === 'stats' || lower === 'status') {
    if (!ghProfileCache) {
      respDiv.innerHTML = `<span class="spinner"></span> ${escapeHTML(tStr('statsLoading'))}`;
      scrollToBottom();
      await fetchGitHubProfile();
    }
    respDiv.innerHTML = '';
    await typeHTML(respDiv, formatStats(), 8);
  }

  // ---- Language ----
  else if (lower === 'lang' || lower === 'locale') {
    switchLanguage(locale === 'en' ? 'zh' : 'en');
    respDiv.remove();
  } else if (lower === 'zh' || lower === 'cn') {
    switchLanguage('zh');
    respDiv.remove();
  } else if (lower === 'en') {
    switchLanguage('en');
    respDiv.remove();
  }

  // ---- Clear ----
  else if (lower === 'clear' || lower === 'cls') {
    output.innerHTML = '';
    cmdInput.value = '';
    cmdInput.focus();
  }

  // ---- Natural language ----
  else {
    const intent = matchNaturalLanguage(cmd);
    respDiv.innerHTML = '';

    if (intent === 'help') {
      await typeHTML(respDiv, tStr('help'));
    } else if (intent === 'about') {
      await typeText(respDiv, tStr('about', personalInfo.name, personalInfo.bio));
    } else if (intent === 'skills') {
      const title = tStr('skillsTitle');
      const list = personalInfo.skills[locale]
        .map((s, i) => `  ${String(i + 1).padStart(2, ' ')}. ${s}`)
        .join('\n');
      await typeText(respDiv, `${title}\n${'-'.repeat(24)}\n${list}`);
    } else if (intent === 'contact') {
      await typeText(respDiv, [
        tStr('contactTitle'),
        '-'.repeat(24),
        tStr('contact', personalInfo.contact),
      ].join('\n'));
    } else if (intent === 'projects') {
      if (!ghReposCache) {
        respDiv.innerHTML = `<span class="spinner"></span> ${escapeHTML(tStr('projectsLoading'))}`;
        scrollToBottom();
        await fetchGitHubRepos();
      }
      respDiv.innerHTML = '';
      await typeHTML(respDiv, formatProjects(), 8);
    } else if (intent === 'stats') {
      if (!ghProfileCache) {
        respDiv.innerHTML = `<span class="spinner"></span> ${escapeHTML(tStr('statsLoading'))}`;
        scrollToBottom();
        await fetchGitHubProfile();
      }
      respDiv.innerHTML = '';
      await typeHTML(respDiv, formatStats(), 8);
    } else {
      await typeText(respDiv, tStr('notFound'));
    }
  }
}

// ============================================================
//  Event Listeners
// ============================================================
cmdInput.addEventListener('keydown', (e) => {
  if (isTyping) { e.preventDefault(); return; }

  if (e.key === 'Enter') {
    e.preventDefault();
    const cmd = cmdInput.value;
    cmdInput.value = '';
    executeCommand(cmd);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      cmdInput.value = commandHistory[historyIndex];
    }
    cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      cmdInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      cmdInput.value = '';
    }
    cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
  }
});

terminalBody.addEventListener('click', () => {
  if (!isTyping) cmdInput.focus();
});

cmdInput.addEventListener('click', (e) => e.stopPropagation());

// ============================================================
//  Init
// ============================================================
cmdInput.placeholder = tStr('placeholder');
titleBar.textContent = tStr('titleBar');

showStartupScreen();
cmdInput.focus();
scrollToBottom();

// Pre-fetch GitHub data in background (unauthenticated)
fetchGitHubProfile();
fetchGitHubRepos();
