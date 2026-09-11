(function () {
  'use strict';

  function initWidget() {
    // Find the executing script tag
    var currentScript =
      document.currentScript ||
      document.querySelector('script[data-assistant]') ||
      document.querySelector('script[src*="widget.js"]');

    var assistantId =
      (currentScript && currentScript.getAttribute('data-assistant')) ||
      window.AIAssistantId;

    if (!assistantId) {
      console.warn('[AI Assistant Widget] Missing data-assistant attribute on script tag.');
      return;
    }

    // Determine host URL from script source or explicit data-host attribute
    var hostUrl = (currentScript && currentScript.getAttribute('data-host')) || '';
    if (!hostUrl) {
      if (currentScript && currentScript.src) {
        try {
          var urlObj = new URL(currentScript.src);
          hostUrl = urlObj.origin;
        } catch (e) {
          hostUrl = window.location.origin;
        }
      } else {
        hostUrl = window.location.origin;
      }
    }

    // Check for Mixed Content warning
    if (window.location.protocol === 'https:' && hostUrl.indexOf('http:') === 0 && hostUrl.indexOf('localhost') === -1) {
      console.warn(
        '[AI Assistant Widget] Mixed Content Warning: This page is HTTPS, but the widget is configured with HTTP (' +
          hostUrl +
          '). The browser will block API calls. Please serve your AI app over HTTPS.'
      );
    }

    // Ensure document.body exists
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', initWidget);
      return;
    }

    // Prevent duplicate widget initialization
    if (document.getElementById('ai-assistant-widget-root')) {
      return;
    }

    // Create container and Shadow Root
    var container = document.createElement('div');
    container.id = 'ai-assistant-widget-root';
    document.body.appendChild(container);
    var shadow = container.attachShadow({ mode: 'open' });

    // State
    var config = {
      name: 'AI Business Assistant',
      welcomeMessage: 'Hi! How can I help you today?',
      primaryColor: '#2563eb',
      launcherPosition: 'bottom-right',
      starterQuestions: [],
      collectLeadEmail: false,
    };
    var isOpen = false;
    var messages = [];
    var isStreaming = false;
    var conversationId = null;
    var visitorId = '';
    try {
      visitorId = localStorage.getItem('ai_ast_visitor_id') || '';
      if (!visitorId) {
        visitorId = 'vis_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('ai_ast_visitor_id', visitorId);
      }
    } catch (e) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 10);
    }

    // Styling inside Shadow DOM
    var style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .widget-container {
        position: fixed;
        bottom: 24px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .pos-bottom-right {
        right: 24px;
        align-items: flex-end;
      }
      .pos-bottom-left {
        left: 24px;
        align-items: flex-start;
      }
      /* Launcher button */
      .launcher-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
        background-color: var(--primary-color, #2563eb);
        color: #ffffff;
        outline: none;
      }
      .launcher-btn:hover {
        transform: scale(1.06);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
      }
      .launcher-icon {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      /* Chat window */
      .chat-window {
        position: absolute;
        bottom: 74px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 560px;
        max-height: calc(100vh - 110px);
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transform: translateY(16px) scale(0.96);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .chat-window.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }
      /* Header */
      .header {
        background-color: var(--primary-color, #2563eb);
        color: #ffffff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }
      .header-title {
        font-size: 15px;
        font-weight: 600;
        line-height: 1.2;
      }
      .header-status {
        font-size: 11px;
        opacity: 0.85;
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 2px;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4ade80;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: #ffffff;
        cursor: pointer;
        opacity: 0.8;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
      }
      .close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.15);
      }
      /* Messages body */
      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8fafc;
      }
      .message {
        max-width: 84%;
        padding: 11px 14px;
        border-radius: 14px;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
      }
      .msg-user {
        align-self: flex-end;
        background-color: var(--primary-color, #2563eb);
        color: #ffffff;
        border-bottom-right-radius: 3px;
      }
      .msg-assistant {
        align-self: flex-start;
        background: #ffffff;
        color: #1e293b;
        border-bottom-left-radius: 3px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04);
      }
      .msg-assistant h1 { font-size: 15px; font-weight: 700; margin: 10px 0 6px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
      .msg-assistant h2 { font-size: 14px; font-weight: 700; margin: 8px 0 4px 0; }
      .msg-assistant h3 { font-size: 13px; font-weight: 700; margin: 6px 0 3px 0; }
      .msg-assistant h4 { font-size: 12.5px; font-weight: 600; margin: 4px 0 2px 0; }
      .msg-assistant p { margin: 4px 0; }
      .msg-assistant ul { padding-left: 18px; margin: 6px 0; list-style-type: disc; }
      .msg-assistant ol { padding-left: 18px; margin: 6px 0; list-style-type: decimal; }
      .msg-assistant li { margin-bottom: 3px; }
      .msg-assistant blockquote { border-left: 3px solid #2563eb; background: #eff6ff; padding: 5px 9px; margin: 6px 0; border-radius: 0 4px 4px 0; font-style: italic; font-size: 12px; }
      .msg-assistant hr { border: none; border-top: 1px solid #e2e8f0; margin: 8px 0; }
      .msg-assistant code { background: #f1f5f9; padding: 1px 4px; border-radius: 4px; font-size: 11.5px; font-family: monospace; border: 1px solid #e2e8f0; }
      .msg-assistant pre { background: #0f172a; color: #f8fafc; padding: 8px; border-radius: 6px; overflow-x: auto; font-size: 11px; margin: 6px 0; }
      .msg-assistant pre code { background: transparent; border: none; color: inherit; padding: 0; }
      .table-responsive {
        width: 100%;
        overflow-x: auto;
        margin: 8px 0;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      .msg-assistant table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11.5px;
      }
      .msg-assistant th, .msg-assistant td {
        border: 1px solid #e2e8f0;
        padding: 5px 8px;
        text-align: left;
        line-height: 1.35;
      }
      .msg-assistant th {
        background: #f1f5f9;
        font-weight: 600;
        color: #1e293b;
      }
      .msg-assistant td {
        background: #ffffff;
      }
      .citations-box {
        display: none !important;
      }
      /* Starter questions */
      .starter-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 6px;
      }
      .starter-pill {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 8px 14px;
        font-size: 12px;
        color: #334155;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }
      .starter-pill:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: var(--primary-color, #2563eb);
      }
      /* Typing indicator */
      .typing-indicator {
        align-self: flex-start;
        background: #ffffff;
        padding: 10px 14px;
        border-radius: 14px;
        border-bottom-left-radius: 3px;
        display: flex;
        gap: 4px;
        align-items: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
      .typing-dot {
        width: 6px;
        height: 6px;
        background: #94a3b8;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }
      .typing-dot:nth-child(1) { animation-delay: 0s; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
      /* Footer input */
      .chat-footer {
        padding: 12px 16px;
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .chat-input {
        flex: 1;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 9px 16px;
        font-size: 13px;
        outline: none;
        resize: none;
        max-height: 80px;
        line-height: 1.4;
      }
      .chat-input:focus {
        border-color: var(--primary-color, #2563eb);
      }
      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background-color: var(--primary-color, #2563eb);
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.15s;
        flex-shrink: 0;
      }
      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
    shadow.appendChild(style);

    // Build UI Elements
    var widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'widget-container pos-bottom-right';

    // Launcher button
    var launcher = document.createElement('button');
    launcher.className = 'launcher-btn';
    launcher.setAttribute('aria-label', 'Open chat');
    launcher.innerHTML = `
      <svg class="launcher-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.63-1.22A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.085-1.127l-.293-.173-2.97.782.795-2.884-.188-.302A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
      </svg>
    `;

    // Chat window
    var chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
      <div class="header">
        <div class="header-info">
          <div class="avatar" id="ast-avatar">AI</div>
          <div>
            <div class="header-title" id="ast-name">AI Assistant</div>
            <div class="header-status"><span class="status-dot"></span> Online</div>
          </div>
        </div>
        <button class="close-btn" id="close-chat-btn" title="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="messages-container" id="messages-body"></div>
      <div class="chat-footer">
        <textarea class="chat-input" id="chat-input" placeholder="Ask anything about our business..." rows="1"></textarea>
        <button class="send-btn" id="send-msg-btn" title="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;

    widgetWrapper.appendChild(chatWindow);
    widgetWrapper.appendChild(launcher);
    shadow.appendChild(widgetWrapper);

    // References
    var messagesBody = shadow.getElementById('messages-body');
    var chatInput = shadow.getElementById('chat-input');
    var sendBtn = shadow.getElementById('send-msg-btn');
    var closeBtn = shadow.getElementById('close-chat-btn');
    var nameEl = shadow.getElementById('ast-name');
    var avatarEl = shadow.getElementById('ast-avatar');

    // Load Assistant Config
    fetch(hostUrl + '/api/widget/' + assistantId + '/config')
      .then(function (res) {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && !data.error) {
          config = Object.assign({}, config, data);
          applyConfig();
        }
      })
      .catch(function (err) {
        console.warn('[AI Assistant Widget] Using fallback configuration (could not reach ' + hostUrl + '):', err.message);
        applyConfig();
      });

    function applyConfig() {
      shadow.host.style.setProperty('--primary-color', config.primaryColor);
      launcher.style.backgroundColor = config.primaryColor;
      if (nameEl) nameEl.textContent = config.name;
      if (avatarEl) avatarEl.textContent = (config.name || 'AI').slice(0, 2).toUpperCase();

      if (config.launcherPosition === 'bottom-left') {
        widgetWrapper.className = 'widget-container pos-bottom-left';
      }

      // Add initial welcome message if empty
      if (messages.length === 0 && config.welcomeMessage) {
        appendMessage('assistant', config.welcomeMessage);
        renderStarterQuestions();
      }
    }

    function renderStarterQuestions() {
      if (!config.starterQuestions || config.starterQuestions.length === 0) return;

      var list = document.createElement('div');
      list.className = 'starter-list';
      config.starterQuestions.forEach(function (q) {
        var pill = document.createElement('button');
        pill.className = 'starter-pill';
        pill.textContent = q;
        pill.addEventListener('click', function () {
          chatInput.value = q;
          sendMessage();
        });
        list.appendChild(pill);
      });
      if (messagesBody) messagesBody.appendChild(list);
      scrollToBottom();
    }

    // Toggle Chat
    launcher.addEventListener('click', function () {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.classList.add('open');
        chatInput.focus();
      } else {
        chatWindow.classList.remove('open');
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        isOpen = false;
        chatWindow.classList.remove('open');
      });
    }

    // Handle Input Auto-resize & Enter key
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', function () {
      sendMessage();
    });

    function appendMessage(role, text) {
      messages.push({ role: role, content: text });
      var msgEl = document.createElement('div');
      msgEl.className = 'message ' + (role === 'user' ? 'msg-user' : 'msg-assistant');
      msgEl.innerHTML = formatMarkdown(text);

      if (messagesBody) messagesBody.appendChild(msgEl);
      if (role === 'user') {
        scrollToBottom();
      } else {
        scrollToStartOfMessage(msgEl);
      }
      return msgEl;
    }

    function scrollToBottom() {
      if (messagesBody) {
        messagesBody.scrollTop = messagesBody.scrollHeight;
      }
    }

    function scrollToStartOfMessage(el) {
      if (!messagesBody || !el) return;
      var targetY = Math.max(0, el.offsetTop - 16);
      messagesBody.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    function formatMarkdown(text) {
      if (!text) return '';
      var html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Restore allowed HTML breaks
      html = html.replace(/&lt;br\s*\/?&gt;/gi, '<br/>');

      // Code blocks: ```lang ... ```
      html = html.replace(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function (_, code) {
        return '<pre><code>' + code.trim() + '</code></pre>';
      });

      // Inline code: `code`
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Markdown tables: | col | col |
      html = html.replace(/(?:^|\n)(\|.*\|(?:\n\|.*\|)+)/g, function (match, tableContent) {
        var rows = tableContent.trim().split('\n');
        var out = '<div class="table-responsive"><table>';
        var isHeader = true;
        for (var r = 0; r < rows.length; r++) {
          var row = rows[r].trim();
          if (/^\|[-:\s|]+\|$/.test(row)) {
            isHeader = false;
            continue;
          }
          var cells = row.split('|').slice(1, -1);
          out += '<tr>';
          for (var c = 0; c < cells.length; c++) {
            var cellContent = cells[c].trim();
            out += isHeader ? ('<th>' + cellContent + '</th>') : ('<td>' + cellContent + '</td>');
          }
          out += '</tr>';
          if (r === 0) isHeader = false;
        }
        out += '</table></div>';
        return out;
      });

      // Horizontal rule: --- or ***
      html = html.replace(/^(?:---|[*]{3}|___)$/gm, '<hr/>');

      // Headers
      html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
      html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
      html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
      html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

      // Blockquotes: > quote
      html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

      // Bold & Italics
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

      // Links: [title](url)
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>');

      // Unordered lists (- item or * item)
      html = html.replace(/^(?:-|\*)\s+(.*?)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>(\n|$))+/g, function (match) {
        return '<ul>' + match + '</ul>';
      });

      // Ordered lists (1. item)
      html = html.replace(/^\d+\.\s+(.*?)$/gm, '<oli>$1</oli>');
      html = html.replace(/(<oli>.*<\/oli>(\n|$))+/g, function (match) {
        return '<ol>' + match.replace(/<\/?oli>/g, function (tag) { return tag.replace('oli', 'li'); }) + '</ol>';
      });

      // Newlines
      html = html.replace(/\n\n+/g, '<br/><br/>');
      html = html.replace(/\n/g, '<br/>');

      // Clean up br tags right after block elements
      html = html.replace(/<\/(h[1-4]|ul|ol|blockquote|pre|hr|div|table)><br\/>/g, '</$1>');

      return html;
    }

    // Send Streaming Message
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text || isStreaming) return;

      chatInput.value = '';
      appendMessage('user', text);
      isStreaming = true;
      sendBtn.disabled = true;

      // Show typing dots
      var typing = document.createElement('div');
      typing.className = 'typing-indicator';
      typing.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      if (messagesBody) messagesBody.appendChild(typing);
      scrollToBottom();

      fetch(hostUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId,
          messages: messages.map(function (m) { return { role: m.role, content: m.content }; }),
          visitorId: visitorId,
          conversationId: conversationId,
        }),
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
          }

          if (typing.parentNode && messagesBody) {
            messagesBody.removeChild(typing);
          }

          var assistantBubble = document.createElement('div');
          assistantBubble.className = 'message msg-assistant';
          if (messagesBody) messagesBody.appendChild(assistantBubble);

          var reader = response.body && response.body.getReader();
          var decoder = new TextDecoder();
          var streamedText = '';
          var receivedCitations = [];

          if (!reader) {
            throw new Error('No response body reader');
          }

          function readStream() {
            return reader.read().then(function (result) {
              if (result.done) {
                messages.push({ role: 'assistant', content: streamedText });
                isStreaming = false;
                sendBtn.disabled = false;
                chatInput.focus();
                scrollToStartOfMessage(assistantBubble);
                return;
              }

              var chunkStr = decoder.decode(result.value, { stream: true });
              var lines = chunkStr.split('\n');

              for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.indexOf('data: ') === 0) {
                  try {
                    var data = JSON.parse(line.slice(6));
                    if (data.type === 'citations') {
                      receivedCitations = data.citations || [];
                      if (data.conversationId) conversationId = data.conversationId;
                    } else if (data.type === 'token') {
                      streamedText += data.token;
                      assistantBubble.innerHTML = formatMarkdown(streamedText);
                      scrollToBottom();
                    } else if (data.type === 'done') {
                      if (data.conversationId) conversationId = data.conversationId;
                    }
                  } catch (e) {
                    // partial chunk
                  }
                }
              }

              return readStream();
            });
          }

          return readStream();
        })
        .catch(function (err) {
          console.error('[AI Assistant Widget] Chat error:', err);
          if (typing.parentNode && messagesBody) messagesBody.removeChild(typing);
          appendMessage('assistant', 'Sorry, I encountered an error connecting to the AI service. Please try again.');
          isStreaming = false;
          sendBtn.disabled = false;
          chatInput.focus();
          scrollToBottom();
        });
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
