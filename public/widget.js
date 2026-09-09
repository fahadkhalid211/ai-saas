(function () {
  'use strict';

  // Find the executing script tag
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-assistant]') ||
    document.querySelector('script[src*="widget.js"]');

  const assistantId =
    (currentScript && currentScript.getAttribute('data-assistant')) ||
    window.AIAssistantId;

  if (!assistantId) {
    console.warn('[AI Assistant Widget] Missing data-assistant attribute on script tag.');
    return;
  }

  // Determine host URL from script source
  let hostUrl = '';
  if (currentScript && currentScript.src) {
    const urlObj = new URL(currentScript.src);
    hostUrl = urlObj.origin;
  } else {
    hostUrl = window.location.origin;
  }

  // Create container and Shadow Root
  const container = document.createElement('div');
  container.id = 'ai-assistant-widget-root';
  document.body.appendChild(container);
  const shadow = container.attachShadow({ mode: 'open' });

  // State
  let config = {
    name: 'AI Business Assistant',
    welcomeMessage: 'Hi! How can I help you today?',
    primaryColor: '#2563eb',
    launcherPosition: 'bottom-right',
    starterQuestions: [],
    collectLeadEmail: false,
  };
  let isOpen = false;
  let messages = [];
  let isStreaming = false;
  let conversationId = null;
  const visitorId =
    localStorage.getItem('ai_ast_visitor_id') ||
    'vis_' + Math.random().toString(36).substring(2, 10);
  localStorage.setItem('ai_ast_visitor_id', visitorId);

  // Styling inside Shadow DOM
  const style = document.createElement('style');
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
    /* Chat Window */
    .chat-window {
      position: absolute;
      bottom: 74px;
      width: 380px;
      height: 580px;
      max-height: calc(100vh - 100px);
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      opacity: 0;
      transform: scale(0.92) translateY(16px);
      pointer-events: none;
    }
    .pos-bottom-left .chat-window {
      transform-origin: bottom left;
    }
    .chat-window.open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }
    /* Header */
    .header {
      background-color: var(--primary-color, #2563eb);
      color: #ffffff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      font-weight: 700;
      font-size: 16px;
      border: 2px solid rgba(255,255,255,0.4);
    }
    .header-title {
      font-weight: 600;
      font-size: 15px;
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
      background: #22c55e;
      display: inline-block;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      opacity: 0.8;
      transition: opacity 0.15s;
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
      max-width: 82%;
      padding: 11px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.45;
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
    .citations-box {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
      font-size: 11px;
      color: #64748b;
    }
    .citation-tag {
      display: inline-block;
      background: #f1f5f9;
      color: #475569;
      border-radius: 4px;
      padding: 2px 6px;
      margin-right: 4px;
      margin-top: 4px;
      font-size: 10.5px;
      font-weight: 500;
      border: 1px solid #e2e8f0;
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
      padding: 7px 12px;
      font-size: 12px;
      color: #334155;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .starter-pill:hover {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
      background: #eff6ff;
    }
    /* Footer input */
    .chat-footer {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .chat-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 10px 14px;
      font-size: 13.5px;
      outline: none;
      resize: none;
      max-height: 100px;
      min-height: 40px;
      line-height: 1.35;
      color: #0f172a;
    }
    .chat-input:focus {
      border-color: var(--primary-color, #2563eb);
    }
    .send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background-color: var(--primary-color, #2563eb);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.1s;
    }
    .send-btn:hover {
      transform: scale(1.04);
    }
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    /* Typing Indicator */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      background: #ffffff;
      border-radius: 12px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
      animation: blink 1.2s infinite both;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.1); }
    }
    /* Mobile full screen */
    @media (max-width: 480px) {
      .widget-container {
        bottom: 16px;
        right: 16px;
      }
      .chat-window {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `;
  shadow.appendChild(style);

  // Build UI Elements
  const widgetWrapper = document.createElement('div');
  widgetWrapper.className = 'widget-container pos-bottom-right';

  // Launcher button
  const launcher = document.createElement('button');
  launcher.className = 'launcher-btn';
  launcher.innerHTML = `
    <svg class="launcher-icon" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.63-1.22A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.085-1.127l-.293-.173-2.97.782.795-2.884-.188-.302A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
    </svg>
  `;

  // Chat window
  const chatWindow = document.createElement('div');
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
  const messagesBody = shadow.getElementById('messages-body');
  const chatInput = shadow.getElementById('chat-input') as HTMLTextAreaElement;
  const sendBtn = shadow.getElementById('send-msg-btn') as HTMLButtonElement;
  const closeBtn = shadow.getElementById('close-chat-btn');
  const nameEl = shadow.getElementById('ast-name');
  const avatarEl = shadow.getElementById('ast-avatar');

  // Load Assistant Config
  fetch(`${hostUrl}/api/widget/${assistantId}/config`)
    .then((res) => res.json())
    .then((data) => {
      if (data && !data.error) {
        config = { ...config, ...data };
        applyConfig();
      }
    })
    .catch((err) => {
      console.warn('[AI Assistant Widget] Using default configuration:', err);
      applyConfig();
    });

  function applyConfig() {
    shadow.host.style.setProperty('--primary-color', config.primaryColor);
    launcher.style.backgroundColor = config.primaryColor;
    if (nameEl) nameEl.textContent = config.name;
    if (avatarEl) avatarEl.textContent = config.name.slice(0, 2).toUpperCase();

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

    const list = document.createElement('div');
    list.className = 'starter-list';
    config.starterQuestions.forEach((q) => {
      const pill = document.createElement('button');
      pill.className = 'starter-pill';
      pill.textContent = q;
      pill.addEventListener('click', () => {
        chatInput.value = q;
        sendMessage();
      });
      list.appendChild(pill);
    });
    messagesBody?.appendChild(list);
    scrollToBottom();
  }

  // Toggle Chat
  launcher.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add('open');
      chatInput.focus();
    } else {
      chatWindow.classList.remove('open');
    }
  });

  closeBtn?.addEventListener('click', () => {
    isOpen = false;
    chatWindow.classList.remove('open');
  });

  // Handle Input Auto-resize & Enter key
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', () => sendMessage());

  function appendMessage(role: 'user' | 'assistant', text: string, citations: any[] = []) {
    messages.push({ role, content: text });
    const msgEl = document.createElement('div');
    msgEl.className = `message ${role === 'user' ? 'msg-user' : 'msg-assistant'}`;
    msgEl.innerHTML = formatMarkdown(text);

    if (citations && citations.length > 0) {
      const citeBox = document.createElement('div');
      citeBox.className = 'citations-box';
      citeBox.innerHTML = `<div>Sources:</div>` +
        citations.map((c) => `<span class="citation-tag">${c.sourceTitle || 'Knowledge'}</span>`).join('');
      msgEl.appendChild(citeBox);
    }

    messagesBody?.appendChild(msgEl);
    scrollToBottom();
    return msgEl;
  }

  function scrollToBottom() {
    if (messagesBody) {
      messagesBody.scrollTop = messagesBody.scrollHeight;
    }
  }

  function formatMarkdown(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:4px;font-size:12px;">$1</code>')
      .replace(/\n/g, '<br/>');
  }

  // Send Streaming Message
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || isStreaming) return;

    chatInput.value = '';
    appendMessage('user', text);
    isStreaming = true;
    sendBtn.disabled = true;

    // Show typing dots
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messagesBody?.appendChild(typing);
    scrollToBottom();

    try {
      const response = await fetch(`${hostUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          visitorId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Remove typing indicator
      messagesBody?.removeChild(typing);

      // Create streaming assistant message bubble
      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'message msg-assistant';
      messagesBody?.appendChild(assistantBubble);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let receivedCitations: any[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
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
              } catch {
                // partial chunk
              }
            }
          }
        }
      }

      // Append citations if any
      if (receivedCitations.length > 0) {
        const citeBox = document.createElement('div');
        citeBox.className = 'citations-box';
        citeBox.innerHTML = `<div>Sources:</div>` +
          receivedCitations.map((c: any) => `<span class="citation-tag">${c.sourceTitle || 'Knowledge'}</span>`).join('');
        assistantBubble.appendChild(citeBox);
      }

      messages.push({ role: 'assistant', content: streamedText });
    } catch (err: any) {
      console.error('[AI Assistant Widget] Chat error:', err);
      if (typing.parentNode) messagesBody?.removeChild(typing);
      appendMessage('assistant', 'Sorry, I encountered an error connecting to the AI service. Please try again.');
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      chatInput.focus();
      scrollToBottom();
    }
  }
})();
