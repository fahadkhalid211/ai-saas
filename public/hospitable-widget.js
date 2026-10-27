/**
 * hospitable-widget.js
 * =====================
 * Zero-dependency, self-contained embeddable chat widget for the Hospitable integration.
 *
 * Drop onto any webpage with a single <script> tag:
 *
 *   <script
 *     src="https://yourdomain.com/hospitable-widget.js"
 *     data-widget-id="YOUR_WIDGET_ID"
 *     data-position="bottom-right"
 *     data-primary-color="#2563eb"
 *     data-greeting="Hi! Ask me about availability or pricing."
 *     data-title="Property Assistant"
 *   ></script>
 *
 * Attributes:
 *  data-widget-id       (required) — your assistant/widget ID
 *  data-position        (optional) — "bottom-right" (default) | "bottom-left"
 *  data-primary-color   (optional) — hex color for the header and buttons
 *  data-greeting        (optional) — initial message shown to the guest
 *  data-title           (optional) — chat panel header text
 *  data-api-base        (optional) — override API base URL (default: same origin as script)
 */
(function () {
  'use strict';

  // ─── Configuration ──────────────────────────────────────────────────────────
  var script = document.currentScript;
  var cfg = {
    widgetId: script.getAttribute('data-widget-id') || '',
    position: script.getAttribute('data-position') || 'bottom-right',
    color: script.getAttribute('data-primary-color') || '#2563eb',
    greeting:
      script.getAttribute('data-greeting') ||
      'Hi! 👋 Ask me about availability, pricing, or property details.',
    title: script.getAttribute('data-title') || 'Property Assistant',
    apiBase: (function () {
      var src = script.getAttribute('data-api-base');
      if (src) return src.replace(/\/$/, '');
      // Derive base from script src
      try {
        var url = new URL(script.src);
        return url.origin;
      } catch (_) {
        return '';
      }
    })(),
  };

  if (!cfg.widgetId) {
    console.error('[Hospitable Widget] data-widget-id is required.');
    return;
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────
  var isRight = cfg.position !== 'bottom-left';
  var css = [
    '#hsp-bubble{position:fixed;' +
      (isRight ? 'right:24px' : 'left:24px') +
      ';bottom:24px;width:56px;height:56px;border-radius:50%;background:' +
      cfg.color +
      ';border:none;cursor:pointer;z-index:2147483647;box-shadow:0 4px 12px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
    '#hsp-bubble:hover{transform:scale(1.08);}',
    '#hsp-panel{position:fixed;' +
      (isRight ? 'right:24px' : 'left:24px') +
      ';bottom:92px;width:360px;max-width:calc(100vw - 32px);height:520px;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:2147483646;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;}',
    '#hsp-panel.hsp-open{display:flex;}',
    '#hsp-header{background:' +
      cfg.color +
      ';color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:15px;}',
    '#hsp-header-close{background:none;border:none;color:#fff;cursor:pointer;opacity:.8;font-size:18px;line-height:1;padding:0 4px;}',
    '#hsp-header-close:hover{opacity:1;}',
    '#hsp-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
    '.hsp-msg{max-width:82%;padding:9px 13px;border-radius:14px;line-height:1.5;font-size:13.5px;word-break:break-word;}',
    '.hsp-msg.hsp-user{background:' +
      cfg.color +
      ';color:#fff;align-self:flex-end;border-bottom-right-radius:3px;}',
    '.hsp-msg.hsp-bot{background:#f3f4f6;color:#111827;align-self:flex-start;border-bottom-left-radius:3px;}',
    '.hsp-msg.hsp-typing{color:#9ca3af;font-style:italic;}',
    '.hsp-cta{display:inline-block;margin-top:6px;padding:7px 14px;background:' +
      cfg.color +
      ';color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;}',
    '#hsp-input-row{display:flex;padding:10px;border-top:1px solid #e5e7eb;gap:8px;align-items:center;}',
    '#hsp-input{flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:10px;font-size:13.5px;outline:none;resize:none;font-family:inherit;max-height:80px;overflow-y:auto;}',
    '#hsp-input:focus{border-color:' + cfg.color + ';box-shadow:0 0 0 2px ' + cfg.color + '22;}',
    '#hsp-send{background:' +
      cfg.color +
      ';color:#fff;border:none;width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '#hsp-send:hover{opacity:.9;}',
    '#hsp-send:disabled{opacity:.4;cursor:not-allowed;}',
    '#hsp-powered{text-align:center;padding:4px 0 8px;font-size:10px;color:#9ca3af;}',
    '@media(max-width:400px){#hsp-panel{width:calc(100vw - 24px);right:12px;left:12px !important;}}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  var bubble = document.createElement('button');
  bubble.id = 'hsp-bubble';
  bubble.setAttribute('aria-label', 'Open Property Assistant');
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="white">' +
    '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  var panel = document.createElement('div');
  panel.id = 'hsp-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', cfg.title);
  panel.innerHTML =
    '<div id="hsp-header">' +
    '<span>' + escapeHtml(cfg.title) + '</span>' +
    '<button id="hsp-header-close" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div id="hsp-messages" role="log" aria-live="polite"></div>' +
    '<div id="hsp-input-row">' +
    '<textarea id="hsp-input" rows="1" placeholder="Ask about availability, pricing…" aria-label="Chat message"></textarea>' +
    '<button id="hsp-send" aria-label="Send message">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
    '</button>' +
    '</div>' +
    '<div id="hsp-powered">Powered by Crescelo AI</div>';

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  // ─── State ───────────────────────────────────────────────────────────────────
  var sessionId = 'hsp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  var history = [];
  var isOpen = false;
  var isSending = false;

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollToBottom() {
    var msgs = document.getElementById('hsp-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function addMessage(role, text, opts) {
    opts = opts || {};
    var msgs = document.getElementById('hsp-messages');
    if (!msgs) return null;

    var el = document.createElement('div');
    el.className = 'hsp-msg ' + (role === 'user' ? 'hsp-user' : 'hsp-bot');
    if (opts.typing) el.classList.add('hsp-typing');

    // Render basic markdown links and line breaks
    var safe = escapeHtml(text)
      .replace(/\n/g, '<br>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener" class="hsp-cta">$1</a>'
      );
    el.innerHTML = safe;

    msgs.appendChild(el);
    scrollToBottom();
    return el;
  }

  // ─── Send message ────────────────────────────────────────────────────────────
  function sendMessage() {
    if (isSending) return;
    var input = document.getElementById('hsp-input');
    var text = (input ? input.value : '').trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', text);
    history.push({ role: 'user', content: text });

    isSending = true;
    var sendBtn = document.getElementById('hsp-send');
    if (sendBtn) sendBtn.disabled = true;

    var typingEl = addMessage('bot', '…', { typing: true });

    fetch(cfg.apiBase + '/api/widget/' + encodeURIComponent(cfg.widgetId) + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: sessionId,
        history: history.slice(-10), // send last 10 turns for context
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var reply = data.reply || data.message || 'Sorry, I could not get a response.';
        if (typingEl) {
          typingEl.classList.remove('hsp-typing');
          var safe = escapeHtml(reply)
            .replace(/\n/g, '<br>')
            .replace(
              /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
              '<a href="$2" target="_blank" rel="noopener" class="hsp-cta">$1</a>'
            );
          typingEl.innerHTML = safe;
        }
        history.push({ role: 'assistant', content: reply });
        scrollToBottom();
      })
      .catch(function () {
        if (typingEl) {
          typingEl.classList.remove('hsp-typing');
          typingEl.textContent = 'Connection error. Please try again.';
        }
      })
      .finally(function () {
        isSending = false;
        if (sendBtn) sendBtn.disabled = false;
        scrollToBottom();
      });
  }

  // ─── Events ──────────────────────────────────────────────────────────────────
  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    panel.classList.toggle('hsp-open', isOpen);
    bubble.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      var input = document.getElementById('hsp-input');
      if (input) input.focus();
    }
  });

  document.getElementById('hsp-header-close').addEventListener('click', function () {
    isOpen = false;
    panel.classList.remove('hsp-open');
    bubble.setAttribute('aria-expanded', 'false');
  });

  document.getElementById('hsp-send').addEventListener('click', sendMessage);

  document.getElementById('hsp-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  document.getElementById('hsp-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (isOpen && !panel.contains(e.target) && e.target !== bubble) {
      isOpen = false;
      panel.classList.remove('hsp-open');
      bubble.setAttribute('aria-expanded', 'false');
    }
  });

  // ─── Initial greeting (after short delay) ────────────────────────────────────
  setTimeout(function () {
    if (!isOpen) {
      // Show a subtle pulse on the bubble to attract attention
      bubble.style.boxShadow = '0 0 0 4px ' + cfg.color + '44, 0 4px 12px rgba(0,0,0,.25)';
      setTimeout(function () {
        bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,.25)';
      }, 1500);
    }
    addMessage('bot', cfg.greeting);
  }, 600);
})();
