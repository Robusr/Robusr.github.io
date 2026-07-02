// ============================================================
//  Robusr's Utopia — Terminal simulation engine
// ============================================================

// ============================================================
//  Data — loaded from JSON at startup
// ============================================================
let personal = null;   // data/personal.json
let i18n     = null;   // data/i18n.json
let locale   = 'en';

// ============================================================
//  Template engine  (replaces {{var}} placeholders)
// ============================================================
function renderTemplate(tmpl, vars) {
  return tmpl.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : `{{${key}}}`);
}

// i18n lookup with optional template variables
function tStr(key, vars = {}) {
  const tmpl = i18n?.[locale]?.[key];
  if (!tmpl) return key;
  return renderTemplate(tmpl, vars);
}

// ============================================================
//  ASCII Pixel-Art Logo — "Robusr" + row-shift slant,
//  per-letter colour.  71x13 upright, 1-char/row reversed.
//  Regenerate:  python3 scripts/ascii_gen.py
// ============================================================
const LOGO_UP = [
'########                 ##                                            ',
'#########                ##                                            ',
'###   ###                ##                                            ',
'###    ###               ##                                            ',
'###    ###    ######     ## ####     ##    ##     ######      ### #### ',
'###   ###    ########    ########    ##    ##    ########     #########',
'########     ###  ###    ###  ####   ##    ##    ###   ##     ####   # ',
'#######     ###    ###   ##    ###   ##    ##    ##           ###      ',
'###  ###    ###    ###   ##     ##   ##    ##    ####         ###      ',
'###   ###   ##      ##   ##     ##   ##    ##     ######      ###      ',
'###    ##   ###    ###   ##     ##   ##    ##         ###     ###      ',
'###    ###  ###    ###   ##    ###   ##    ##          ##     ###      ',
'###     ##   ###  ###    ###  ####   ###  ###    ##   ###     ###      ',
];
const LOGO_UP_SPLITS = [11, 23, 35, 47, 59];
const LOGO_UP_WIDTH = 71;
const LOGO_COLORS = ['#FF6188','#FC9867','#FFD866','#A9DC76','#78DCE8','#AB9DF2'];
const LOGO_SLANT = 1;
const LOGO_DIR = 'reverse';
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
let commandHistory  = [];
let historyIndex    = -1;
let isTyping        = false;
let ghReposCache    = null;
let ghProfileCache  = null;
let streamAbort     = null;   // AbortController for cancelling LLM stream
let streamCancelled = false;  // true when user pressed Esc

// ============================================================
//  Helpers
// ============================================================
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function scrollToBottom() {
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
//  Typewriter Effect (HTML-aware, renders tags correctly)
// ============================================================
async function typeHTML(element, html, speed = 16) {
  isTyping = true;
  cmdInput.disabled = true;

  // Respect accessibility preference — instant output, no animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.innerHTML = html;
    isTyping = false;
    cmdInput.disabled = false;
    cmdInput.focus();
    scrollToBottom();
    return;
  }

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
//  Buffer LLM stream → parse Markdown → typewriter
//  Buffers all SSE chunks, then renders Markdown as HTML and
//  plays it with the typewriter effect for a consistent feel.
// ============================================================
async function bufferStream(reader) {
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let timeout;

  try {
    timeout = setTimeout(() => reader.cancel(), 30_000);

    while (true) {
      const { done, value } = await reader.read();
      clearTimeout(timeout);
      if (done) break;
      timeout = setTimeout(() => reader.cancel(), 30_000);

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) fullText += content;
        } catch {}
      }
    }
  } catch {
    // Aborted or network error — caller checks streamCancelled
  }

  clearTimeout(timeout);
  return fullText;
}

// ============================================================
//  Startup: pixel logo + system info + hint
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
  sysDiv.textContent = tStr('sysinfo', {
    name: 'guest',
    tagline: personal?.tagline?.[locale] ?? '',
  });
  output.appendChild(sysDiv);

  // ---- Step 3: Short hint ----
  const hintDiv = document.createElement('div');
  hintDiv.className = 'response';
  hintDiv.innerHTML = `<span class="dim">${escapeHTML(tStr('placeholder'))}</span>`;
  output.appendChild(hintDiv);

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
  const user = personal?.githubUser ?? 'Robusr';
  try { ghProfileCache = await ghFetch(`/users/${user}`); }
  catch { ghProfileCache = null; }
}

async function fetchGitHubRepos() {
  const user = personal?.githubUser ?? 'Robusr';
  try {
    const data = await ghFetch(`/users/${user}/repos?per_page=50&sort=updated`);
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
//  Response helpers — avoid duplication between exact commands
//  and natural-language intent dispatch
// ============================================================
function respondAbout(respDiv) {
  return typeText(respDiv, tStr('about', {
    name: personal?.name ?? '',
    bio: personal?.bio?.[locale] ?? '',
  }));
}

function respondSkills(respDiv) {
  const title = tStr('skillsTitle');
  const list = (personal?.skills?.[locale] ?? [])
    .map((s, i) => `  ${String(i + 1).padStart(2, ' ')}. ${s}`)
    .join('\n');
  return typeText(respDiv, `${title}\n${'-'.repeat(24)}\n${list}`);
}

function respondContact(respDiv) {
  return typeText(respDiv, [
    tStr('contactTitle'),
    '-'.repeat(24),
    tStr('contact', personal?.contact ?? {}),
  ].join('\n'));
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
    await respondAbout(respDiv);
  }

  // ---- Skills ----
  else if (lower === 'skills' || lower === 'skill') {
    await respondSkills(respDiv);
  }

  // ---- Contact ----
  else if (lower === 'contact') {
    await respondContact(respDiv);
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

  // ---- Natural language / LLM Chat ----
  else {
    const intent = matchNaturalLanguage(cmd);
    respDiv.innerHTML = '';

    if (intent === 'help') {
      await typeHTML(respDiv, tStr('help'));
    } else if (intent === 'about') {
      await respondAbout(respDiv);
    } else if (intent === 'skills') {
      await respondSkills(respDiv);
    } else if (intent === 'contact') {
      await respondContact(respDiv);
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
      // === DeepSeek LLM Chat (with Markdown rendering) ===
      respDiv.innerHTML = '<span class="spinner"></span>';
      streamAbort = new AbortController();

      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: cmd }),
          signal: streamAbort.signal,
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            respDiv.innerHTML =
              `<span class="warn">${escapeHTML('[!] 太快啦，请等几秒再试 — Too fast, wait a moment.')}</span>`;
          } else {
            respDiv.innerHTML =
              `<span class="err">${escapeHTML('[!] 出了点问题 — Something went wrong. Try again later.')}</span>`;
          }
        } else {
          // Buffer the full response, then render Markdown
          const reader = resp.body.getReader();
          const fullText = await bufferStream(reader);

          if (streamCancelled) {
            respDiv.innerHTML = '<span class="dim">--- Cancelled ---</span>';
          } else if (fullText) {
            respDiv.innerHTML = '';
            await typeHTML(respDiv, parseMarkdown(fullText));
          } else {
            respDiv.innerHTML =
              `<span class="dim">${escapeHTML('[!] Empty response — try rephrasing.')}</span>`;
          }
        }
      } catch (err) {
        if (streamCancelled || err.name === 'AbortError') {
          respDiv.innerHTML = '<span class="dim">--- Cancelled ---</span>';
        } else {
          respDiv.innerHTML =
            `<span class="dim">${escapeHTML('[!] 网络连接失败 — Network error. Check your connection.')}</span>`;
        }
      } finally {
        streamAbort = null;
        streamCancelled = false;
      }
    }
  }
}

// ============================================================
//  Event Listeners
// ============================================================
cmdInput.addEventListener('keydown', (e) => {
  // Esc — cancel in-progress LLM stream
  if (e.key === 'Escape' && streamAbort) {
    e.preventDefault();
    streamCancelled = true;
    streamAbort.abort();
    return;
  }

  // Ctrl+L / Cmd+L — clear terminal
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    output.innerHTML = '';
    cmdInput.value = '';
    return;
  }

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
    if (historyIndex < commandHistory.length) {
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
//  Init — show terminal shell immediately, fill data when ready
// ============================================================
async function init() {
  // ---- Phase 1: instant — terminal shell is already in the DOM ----
  cmdInput.placeholder = 'Loading...';
  cmdInput.disabled = true;

  // Subtle loading indicator while JSON is fetched
  const loadDiv = document.createElement('div');
  loadDiv.className = 'response';
  loadDiv.innerHTML = '<span class="spinner"></span> <span class="dim">Loading...</span>';
  output.appendChild(loadDiv);

  // ---- Phase 2: fetch config (network) ----
  let ok = true;
  try {
    const [pRes, iRes] = await Promise.all([
      fetch('./data/personal.json'),
      fetch('./data/i18n.json'),
    ]);
    if (!pRes.ok || !iRes.ok) throw new Error('Failed to load config');
    personal = await pRes.json();
    i18n     = await iRes.json();
  } catch (e) {
    ok = false;
  }

  // Remove loading indicator
  output.innerHTML = '';

  if (!ok) {
    const errDiv = document.createElement('div');
    errDiv.className = 'response';
    errDiv.innerHTML =
      '<span class="err">[!] Failed to load configuration.</span><br><br>' +
      '<span class="dim">Check your connection and try again.</span><br><br>' +
      '<button onclick="output.innerHTML=\'\';init()" ' +
        'style="font-family:inherit;font-size:13px;padding:4px 14px;' +
        'color:var(--text-primary, #F8F8F2);background:rgba(255,255,255,0.08);' +
        'border:1px solid var(--border-code, rgba(255,255,255,0.08));' +
        'border-radius:4px;cursor:pointer;">Retry</button>';
    output.appendChild(errDiv);
    cmdInput.placeholder = 'Reload page to retry...';
    cmdInput.disabled = false;
    cmdInput.focus();
    return;
  }

  // ---- Phase 3: bootstrap the full UI ----
  cmdInput.placeholder = tStr('placeholder');
  titleBar.textContent = tStr('titleBar');
  cmdInput.disabled = false;

  showStartupScreen();
  cmdInput.focus();
  scrollToBottom();

  // Pre-fetch GitHub data in background (unauthenticated)
  fetchGitHubProfile();
  fetchGitHubRepos();
}

init();
