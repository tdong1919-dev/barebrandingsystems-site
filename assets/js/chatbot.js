/* ============================================================
   Bare Branding Systems — Intake Assistant
   Institutional intake flow with lead scoring
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ── */
  const CONFIG = {
    webhookUrl:  '',
    formspreeId: 'mkoyqvpk',
    botDelay:    680,
    botName:     'BBS Intake Assistant',
  };

  /* ── Lead scoring weights ── */
  const SCORE = {
    budget: {
      'Under $10k':          0,
      '$10k – $25k':         1,
      '$25k – $75k':         2,
      '$75k – $150k':        3,
      '$150k+':              4,
      'Equity / Partnership':2,
    },
    timeline: {
      'Just exploring':           0,
      'In 3–6 months':            1,
      'In the next 1–3 months':   2,
      'Immediately / ASAP':       3,
    },
    stage: {
      'Pre-launch / Concept':     0,
      'Early stage (< 1 year)':   1,
      'Growth stage (1–3 years)': 2,
      'Established (3+ years)':   3,
      'Institutional / Enterprise':4,
    },
  };

  /* ── Flow definition ── */
  const STAGES = [
    /* 0 */ {
      id: 'welcome',
      messages: [
        "Welcome to <strong>Bare Branding Systems</strong>.",
        "I'll gather a few details so our team can give you a meaningful response — this takes about 2 minutes.",
        "What's your name?",
      ],
      input: 'text',
      placeholder: 'Your name…',
      key: 'firstName',
    },
    /* 1 */ {
      id: 'email',
      messages: ['Good to meet you, {firstName}. What email address should we use to follow up?'],
      input: 'text',
      placeholder: 'you@company.com',
      key: 'email',
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    },
    /* 2 */ {
      id: 'org',
      messages: ['What\'s the name of your organization or company?'],
      input: 'text',
      placeholder: 'Organization name…',
      key: 'orgName',
    },
    /* 3 */ {
      id: 'stage',
      messages: ['Where is <strong>{orgName}</strong> in its lifecycle?'],
      input: 'options',
      key: 'orgStage',
      options: [
        'Pre-launch / Concept',
        'Early stage (< 1 year)',
        'Growth stage (1–3 years)',
        'Established (3+ years)',
        'Institutional / Enterprise',
      ],
    },
    /* 4 */ {
      id: 'category',
      messages: ['Which area best describes what you\'re looking to build or improve?'],
      input: 'options',
      key: 'category',
      options: [
        'AI & Automation Infrastructure',
        'Workflow & Operations Systems',
        'Education Technology',
        'Real Estate & Digital Assets',
        'Venture Development',
        'Full operational build-out',
      ],
    },
    /* 5 */ {
      id: 'challenge',
      messages: ['What\'s the core problem you\'re trying to solve?'],
      input: 'options',
      key: 'challenge',
      options: [
        'Need AI systems we can actually govern and scale',
        'Too much manual process — need automation infrastructure',
        'Building or investing in education technology',
        'Tokenization, RWA, or digital asset infrastructure',
        'Launching or scaling a venture and need operational architecture',
        'Need a full operational systems audit and rebuild',
      ],
    },
    /* 6 */ {
      id: 'priority',
      messages: ['What are the most important outcomes for you in the next 6 months? <em>(Select all that apply)</em>'],
      input: 'multiselect',
      key: 'priorities',
      options: [
        'Reduce manual operations by 60%+',
        'Deploy AI that has measurable ROI',
        'Build institutional-grade infrastructure',
        'Create a scalable venture ecosystem',
        'Automate reporting and visibility systems',
        'Establish governance over AI/data systems',
        'Launch a new product or venture',
      ],
    },
    /* 7 */ {
      id: 'current',
      messages: ['What systems or tools are you currently running? <em>(Select all that apply)</em>'],
      input: 'multiselect',
      key: 'currentSystems',
      options: [
        'CRM (HubSpot, Salesforce, Go High Level…)',
        'Workflow tools (n8n, Make, Zapier…)',
        'Project / Ops (Notion, Asana, Linear…)',
        'LMS (Canvas, Moodle, Blackboard…)',
        'Blockchain / Web3 infrastructure',
        'Custom internal tooling',
        'Nothing formal yet',
      ],
    },
    /* 8 */ {
      id: 'team',
      messages: ['How is your team currently structured on the technical side?'],
      input: 'options',
      key: 'teamStructure',
      options: [
        'No technical team — founder-led',
        'Small internal team (1–3 people)',
        'Established internal team (4–10)',
        'Large organization with existing IT/Eng',
        'Institutional (university, enterprise)',
      ],
    },
    /* 9 */ {
      id: 'budget',
      messages: ['What is the approximate budget range for this project?'],
      input: 'options',
      key: 'budget',
      options: [
        'Under $10k',
        '$10k – $25k',
        '$25k – $75k',
        '$75k – $150k',
        '$150k+',
        'Equity / Partnership',
      ],
    },
    /* 10 */ {
      id: 'timeline',
      messages: ['When are you looking to engage?'],
      input: 'options',
      key: 'timeline',
      options: [
        'Immediately / ASAP',
        'In the next 1–3 months',
        'In 3–6 months',
        'Just exploring',
      ],
    },
    /* 11 */ {
      id: 'decision',
      messages: ['Are you the primary decision-maker for this engagement?'],
      input: 'options',
      key: 'decisionMaker',
      options: [
        'Yes — I have authority to proceed',
        'I co-decide with partners or board',
        'I\'m evaluating on behalf of my organization',
      ],
    },
    /* 12 */ {
      id: 'referral',
      messages: ['How did you hear about Bare Branding Systems?'],
      input: 'options',
      key: 'referral',
      options: [
        'Referral from a colleague',
        'LinkedIn',
        'Search / Google',
        'Industry event or podcast',
        'Direct outreach from our team',
        'Other',
      ],
    },
    /* 13 */ {
      id: 'context',
      messages: ['Last one — is there anything specific you\'d like our team to know before we respond?'],
      input: 'text',
      placeholder: 'Additional context, constraints, or goals…',
      key: 'additionalContext',
      optional: true,
    },
    /* 14 */ {
      id: 'submitting',
      messages: ['Submitting your profile…'],
      input: 'none',
    },
    /* 15 */ {
      id: 'complete',
      messages: [],
      input: 'none',
    },
  ];

  const TOTAL_INPUT_STAGES = 14;

  /* ── State ── */
  let state = {
    open: false,
    stage: 0,
    data: {},
    multiBuffer: [],
    submitted: false,
  };

  /* ── DOM refs ── */
  let trigger, win, messagesEl, textarea, sendBtn, progressFill, progressLabel;

  /* ── Init ── */
  function init() {
    injectHTML();
    cacheRefs();
    bindEvents();
    setTimeout(() => startFlow(), 800);
  }

  function injectHTML() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <button id="cb-trigger" aria-label="Open intake assistant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="cb-badge"></span>
      </button>

      <div id="cb-window" role="dialog" aria-label="${CONFIG.botName}">
        <div class="cb-header">
          <div class="cb-avatar">◆</div>
          <div class="cb-header-info">
            <div class="cb-header-name">${CONFIG.botName}</div>
            <div class="cb-header-status">
              <span class="cb-status-dot"></span>
              Bare Branding Systems
            </div>
          </div>
          <button class="cb-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="cb-progress-wrap">
          <div class="cb-progress-label">Intake profile</div>
          <div class="cb-progress-track">
            <div class="cb-progress-fill" style="width:0%"></div>
          </div>
        </div>

        <div class="cb-messages"></div>

        <div class="cb-input-area">
          <textarea rows="1" placeholder="Type your answer…" aria-label="Your answer"></textarea>
          <button class="cb-send" aria-label="Send" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const nudge = document.createElement('div');
    nudge.id = 'cb-nudge';
    nudge.textContent = 'Start a chat here';
    Object.assign(nudge.style, {
      position:      'fixed',
      bottom:        '40px',
      right:         '98px',
      background:    '#1a1a1e',
      border:        '1px solid rgba(142,115,91,.35)',
      color:         '#d0cbc4',
      fontSize:      '12px',
      letterSpacing: '.02em',
      padding:       '8px 16px',
      borderRadius:  '999px',
      whiteSpace:    'nowrap',
      pointerEvents: 'none',
      boxShadow:     '0 4px 20px rgba(0,0,0,.45)',
      zIndex:        '8999',
      fontFamily:    'inherit',
    });
    document.body.appendChild(nudge);
  }

  function cacheRefs() {
    trigger       = document.getElementById('cb-trigger');
    win           = document.getElementById('cb-window');
    messagesEl    = win.querySelector('.cb-messages');
    textarea      = win.querySelector('textarea');
    sendBtn       = win.querySelector('.cb-send');
    progressFill  = win.querySelector('.cb-progress-fill');
    progressLabel = win.querySelector('.cb-progress-label');
  }

  function bindEvents() {
    trigger.addEventListener('click', toggleWindow);
    win.querySelector('.cb-close').addEventListener('click', closeWindow);
    sendBtn.addEventListener('click', handleSend);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
      sendBtn.disabled = !textarea.value.trim();
    });
  }

  /* ── Window toggle ── */
  function toggleWindow() { state.open ? closeWindow() : openWindow(); }

  function openWindow() {
    state.open = true;
    win.classList.add('open');
    trigger.querySelector('.cb-badge').style.display = 'none';
    trigger.classList.remove('has-notification');
    const nudge = document.getElementById('cb-nudge');
    if (nudge) nudge.style.display = 'none';
    setTimeout(() => textarea.focus(), 350);
  }

  function closeWindow() {
    state.open = false;
    win.classList.remove('open');
  }

  /* ── Flow ── */
  function startFlow() {
    trigger.querySelector('.cb-badge').style.display = 'block';
    trigger.classList.add('has-notification');
    deliverStage(0);
  }

  function deliverStage(idx) {
    state.stage = idx;
    const s = STAGES[idx];
    if (!s) return;

    updateProgress(idx);

    if (idx === STAGES.length - 1) {
      renderComplete();
      return;
    }

    if (idx === STAGES.length - 2) {
      setInputVisible(false);
      showTyping().then(() => {
        addBotMessage(s.messages[0]);
        submitLead().then(() => {
          setTimeout(() => deliverStage(idx + 1), 1200);
        });
      });
      return;
    }

    const msgs = s.messages.map(m => interpolate(m));
    showTyping().then(() => {
      msgs.forEach((m, i) => setTimeout(() => addBotMessage(m), i * 340));
      const delay = msgs.length * 340 + 80;

      if (s.input === 'options') {
        setTimeout(() => { setInputVisible(false); addOptions(s.options, s.key, false); }, delay);
      } else if (s.input === 'multiselect') {
        setTimeout(() => { setInputVisible(false); addOptions(s.options, s.key, true); }, delay);
      } else if (s.input === 'text') {
        setTimeout(() => {
          setInputVisible(true);
          textarea.placeholder = s.placeholder || 'Type your answer…';
          textarea.value = '';
          textarea.style.height = 'auto';
          sendBtn.disabled = true;
          if (state.open) textarea.focus();
        }, delay);
      } else {
        setInputVisible(false);
      }
    });
  }

  /* ── Text input send ── */
  function handleSend() {
    const val = textarea.value.trim();
    const s = STAGES[state.stage];
    if (!s || s.input !== 'text') return;
    if (!val && !s.optional) return;

    if (s.validate) {
      const check = s.validate(val);
      if (check !== true) {
        addBotMessage(`⚠ ${check}`);
        return;
      }
    }

    const answer = (!val && s.optional) ? 'Not provided' : val;
    state.data[s.key] = answer;
    addUserMessage(answer);
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
    setInputVisible(false);
    setTimeout(() => deliverStage(state.stage + 1), 380);
  }

  /* ── Option buttons ── */
  function addOptions(options, key, multi) {
    state.multiBuffer = [];
    const wrap = document.createElement('div');
    wrap.className = 'cb-options';

    let confirmBtn;

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'cb-option-btn';
      btn.innerHTML = opt;

      if (multi) {
        btn.addEventListener('click', () => {
          btn.classList.toggle('selected');
          if (btn.classList.contains('selected')) {
            state.multiBuffer.push(opt);
          } else {
            state.multiBuffer = state.multiBuffer.filter(o => o !== opt);
          }
          if (confirmBtn) confirmBtn.classList.toggle('visible', state.multiBuffer.length > 0);
        });
      } else {
        btn.addEventListener('click', () => {
          disableOptions(wrap);
          btn.classList.add('selected');
          state.data[key] = opt;
          addUserMessage(opt);
          setTimeout(() => deliverStage(state.stage + 1), 380);
        });
      }

      wrap.appendChild(btn);
    });

    if (multi) {
      confirmBtn = document.createElement('button');
      confirmBtn.className = 'cb-multiselect-confirm';
      confirmBtn.textContent = 'Confirm →';
      confirmBtn.addEventListener('click', () => {
        if (!state.multiBuffer.length) return;
        disableOptions(wrap);
        const selected = state.multiBuffer.join(', ');
        state.data[key] = selected;
        addUserMessage(selected);
        state.multiBuffer = [];
        setTimeout(() => deliverStage(state.stage + 1), 380);
      });
      wrap.appendChild(confirmBtn);
    }

    messagesEl.appendChild(wrap);
    scrollBottom();
  }

  function disableOptions(wrap) {
    wrap.querySelectorAll('.cb-option-btn').forEach(b => {
      b.disabled = true;
      b.style.pointerEvents = 'none';
    });
    const conf = wrap.querySelector('.cb-multiselect-confirm');
    if (conf) conf.style.display = 'none';
  }

  /* ── Helpers ── */
  function showTyping() {
    return new Promise(resolve => {
      const row = document.createElement('div');
      row.className = 'cb-msg cb-msg-bot';
      row.innerHTML = `
        <div class="cb-msg-avatar">◆</div>
        <div class="cb-typing"><span></span><span></span><span></span></div>
      `;
      messagesEl.appendChild(row);
      scrollBottom();
      setTimeout(() => { row.remove(); resolve(); }, CONFIG.botDelay);
    });
  }

  function addBotMessage(html) {
    const row = document.createElement('div');
    row.className = 'cb-msg cb-msg-bot';
    row.innerHTML = `<div class="cb-msg-avatar">◆</div><div class="cb-bubble">${html}</div>`;
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'cb-msg cb-msg-user';
    row.innerHTML = `<div class="cb-bubble">${escHtml(text)}</div>`;
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function setInputVisible(show) {
    win.querySelector('.cb-input-area').style.display = show ? 'flex' : 'none';
  }

  function scrollBottom() {
    setTimeout(() => { messagesEl.scrollTop = messagesEl.scrollHeight; }, 50);
  }

  function interpolate(str) {
    return str.replace(/\{(\w+)\}/g, (_, k) => state.data[k] || '');
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function updateProgress(idx) {
    const pct = Math.min(Math.round((idx / TOTAL_INPUT_STAGES) * 100), 100);
    progressFill.style.width = pct + '%';
    progressLabel.textContent = idx >= TOTAL_INPUT_STAGES
      ? 'Profile complete'
      : `Step ${idx + 1} of ${TOTAL_INPUT_STAGES}`;
  }

  /* ── Lead scoring ── */
  function calcScore() {
    const b = SCORE.budget[state.data.budget]   ?? 0;
    const t = SCORE.timeline[state.data.timeline] ?? 0;
    const s = SCORE.stage[state.data.orgStage]   ?? 0;
    const total = b + t + s;
    if (total >= 7) return { label: 'PRIORITY',  css: 'cb-score-high',   msg: 'We\'ll respond within 24 hours.' };
    if (total >= 4) return { label: 'QUALIFIED',  css: 'cb-score-medium', msg: 'Expect a response within 48 hours.' };
    return               { label: 'RECEIVED',   css: 'cb-score-low',    msg: 'We\'ll be in touch shortly.' };
  }

  /* ── Completion render ── */
  function renderComplete() {
    setInputVisible(false);
    const score = calcScore();
    state.data._score = score.label;

    showTyping().then(() => {
      addBotMessage(`<strong>Thank you, ${state.data.firstName || 'you'}.</strong>`);
      setTimeout(() => {
        addBotMessage(`Your profile has been received. Our team will review your inquiry and respond personally — no automated sequences, no generic decks.`);
      }, 480);
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = 'padding:6px 0 4px 34px';
        el.innerHTML = `
          <span class="cb-score-badge ${score.css}">${score.label}</span>
          <div style="font-size:.7rem;color:var(--cb-muted);margin-top:6px;line-height:1.5">${score.msg}</div>
          <a href="mailto:hello@barebrandingsystems.com" class="cb-cta-btn" style="margin-top:14px">
            Email us directly →
          </a>
        `;
        messagesEl.appendChild(el);
        scrollBottom();
      }, 1000);
    });
  }

  /* ── Submission ── */
  async function submitLead() {
    const payload = {
      ...state.data,
      _subject:   `[BBS Intake] ${state.data.firstName || 'New lead'} — ${state.data.orgName || 'Unknown org'} — ${state.data.category || ''}`,
      _timestamp: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('bbs_intake') || '[]');
      stored.push(payload);
      localStorage.setItem('bbs_intake', JSON.stringify(stored));
    } catch (_) {}

    if (CONFIG.webhookUrl) {
      try {
        await fetch(CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (_) {}
    }

    if (CONFIG.formspreeId) {
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ''));
        await fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
          method: 'POST', body: fd, headers: { Accept: 'application/json' },
        });
      } catch (_) {}
    }
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
