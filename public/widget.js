(function () {
  'use strict';

  function initWidget() {
    // Find the executing script tag
    var currentScript =
      document.currentScript ||
      document.querySelector('script[data-assistant]') ||
      document.querySelector('script[data-assistant-id]') ||
      document.querySelector('script[src*="widget.js"]');

    var assistantId =
      (currentScript && (currentScript.getAttribute('data-assistant') || currentScript.getAttribute('data-assistant-id'))) ||
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
      whiteLabelEnabled: false,
      customBrandingText: '',
      customBrandingUrl: '',
      proactiveMessageEnabled: false,
      proactiveMessageText: '',
      proactiveMessageDelay: 5,
      bookingEnabled: false,
      bookingProvider: 'direct',
      bookingUrl: '',
      bookingPromptText: 'Schedule an Appointment',
      bookingSlotDuration: 30,
      bookingStartHour: '09:00',
      bookingEndHour: '17:00',
      bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
        position: relative;
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
        visibility: hidden;
        transform: translateY(16px) scale(0.96);
        transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.25s;
      }
      .chat-window.open {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
        transform: translateY(0) scale(1);
        transition-delay: 0s;
      }
      /* Keyboard focus is always visible, and motion respects the visitor's setting */
      button:focus-visible, a:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible, [tabindex]:focus-visible {
        outline: 3px solid #1d4ed8;
        outline-offset: 2px;
        box-shadow: 0 0 0 5px #ffffff;
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; transition-delay: 0s !important; }
      }
      /* Expanded: a roomy reading window (the Expand button in the header) */
      .chat-window.expanded {
        width: min(760px, calc(100vw - 32px));
        height: min(820px, calc(100vh - 110px));
      }
      @media (max-width: 640px) {
        .chat-window.expanded { width: calc(100vw - 16px); height: calc(100vh - 90px); }
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
      .msg-agent {
        align-self: flex-start;
        background: #fdfcff;
        color: #1e1b4b;
        border: 1.5px solid #c4b5fd;
        border-bottom-left-radius: 3px;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
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
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
      .spin-icon {
        animation: spin 1s linear infinite;
      }
      .sources-container {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.07);
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .source-pill-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        background: #f8fafc;
        color: var(--primary-color, #2563eb);
        padding: 3px 8px;
        border-radius: 9999px;
        text-decoration: none;
        border: 1px solid #e2e8f0;
        font-weight: 500;
        transition: all 0.15s ease;
        max-width: 100%;
      }
      .source-pill-link:hover {
        background: #eff6ff;
        border-color: #bfdbfe;
        transform: translateY(-1px);
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
      .voice-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #e2e8f0;
        background-color: #f8fafc;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .voice-btn:hover {
        background-color: #f1f5f9;
        color: var(--primary-color, #2563eb);
        border-color: #cbd5e1;
      }
      .voice-btn.listening {
        background-color: #fee2e2;
        color: #ef4444;
        border-color: #fca5a5;
        animation: pulseVoice 1.2s infinite ease-in-out;
      }
      @keyframes pulseVoice {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      }
      .lang-dropdown-menu {
        position: absolute;
        top: 52px;
        right: 14px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 6px;
        display: none;
        flex-direction: column;
        gap: 2px;
        z-index: 100;
        min-width: 120px;
      }
      .lang-dropdown-menu.show {
        display: flex;
      }
      .lang-item {
        padding: 6px 10px;
        font-size: 11.5px;
        color: #334155;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
      }
      .lang-item:hover {
        background: #f1f5f9;
        color: var(--primary-color, #2563eb);
      }
      .lang-item.active {
        background: #eff6ff;
        color: var(--primary-color, #2563eb);
        font-weight: 600;
      }
      /* Header action buttons */
      .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .header-action-btn {
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background 0.15s;
      }
      .header-action-btn:hover {
        background: rgba(255, 255, 255, 0.28);
      }
      /* Sleek Support Form Card */
      .support-form-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02);
        margin: 6px 0;
        align-self: stretch;
      }
      .support-form-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f1f5f9;
      }
      .support-form-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #eff6ff;
        color: var(--primary-color, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }
      .support-form-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #0f172a;
      }
      .support-form-desc {
        font-size: 11px;
        color: #64748b;
        margin-top: 1px;
      }
      .support-field {
        margin-bottom: 10px;
      }
      .support-label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #334155;
        margin-bottom: 4px;
      }
      .support-label .required-star {
        color: #ef4444;
        margin-left: 2px;
      }
      .support-label .optional-tag {
        font-size: 10px;
        font-weight: normal;
        color: #526074;
        margin-left: 4px;
      }
      .support-input, .support-select, .support-textarea {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        color: #0f172a;
        background: #f8fafc;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
      }
      .support-input:focus, .support-select:focus, .support-textarea:focus {
        border-color: var(--primary-color, #2563eb);
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }
      .support-textarea {
        resize: vertical;
        min-height: 55px;
      }
      .support-submit-btn {
        width: 100%;
        background-color: var(--primary-color, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: opacity 0.15s, transform 0.1s;
        margin-top: 4px;
      }
      .support-submit-btn:hover {
        opacity: 0.92;
      }
      .support-submit-btn:active {
        transform: scale(0.99);
      }
      .support-submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .support-error-box {
        font-size: 11.5px;
        color: #b91c1c;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 6px;
        padding: 7px 10px;
        margin-bottom: 10px;
        display: none;
      }
      .support-success-card {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 14px;
        padding: 16px;
        text-align: center;
        color: #166534;
        margin: 6px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }
      .support-success-title {
        font-size: 13.5px;
        font-weight: 700;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .support-success-text {
        font-size: 12px;
        color: #15803d;
        line-height: 1.45;
      }
      .support-quick-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #eff6ff;
        color: var(--primary-color, #2563eb);
        border: 1px solid #bfdbfe;
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
        transition: all 0.15s;
      }
      .support-quick-btn:hover {
        background: var(--primary-color, #2563eb);
        color: #ffffff;
      }
      /* Booking Card */
      .booking-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 14px;
        margin: 8px 0;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
      }
      .booking-header {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 5px;
      }
      .booking-desc {
        font-size: 11.5px;
        color: #64748b;
        margin-bottom: 12px;
        line-height: 1.4;
      }
      .booking-external-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        background: var(--primary-color, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 9px;
        padding: 9px 14px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        box-sizing: border-box;
        transition: opacity 0.15s;
      }
      .booking-external-btn:hover {
        opacity: 0.92;
      }
      .booking-quick-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f0fdf4;
        color: #15803d;
        border: 1px solid #bbf7d0;
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
        transition: all 0.15s;
      }
      .booking-quick-btn:hover {
        background: #16a34a;
        color: #ffffff;
      }
      .cal-title { margin-top: 10px; font-size: 11px; font-weight: 700; color: #475569; }
      .cal-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
      .cal-btn { display: inline-flex; align-items: center; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #0f172a; font-size: 11.5px; font-weight: 600; text-decoration: none; cursor: pointer; font-family: inherit; }
      .cal-btn:hover { border-color: var(--primary-color, #2563eb); color: var(--primary-color, #2563eb); }
      .chat-notice {
        padding: 6px 16px 0 16px;
        background: #ffffff;
        text-align: center;
        font-size: 11px;
        line-height: 1.35;
        color: #526074;
      }
      /* Footer branding */
      .chat-branding {
        padding: 6px 16px 8px 16px;
        background: #ffffff;
        text-align: center;
        font-size: 11px;
        color: #526074;
        border-top: 1px solid #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        line-height: 1;
      }
      .chat-branding a {
        color: #64748b;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.15s;
      }
      .chat-branding a:hover {
        color: var(--primary-color, #2563eb);
        text-decoration: underline;
      }
      /* Proactive message popup */
      .proactive-popup {
        position: absolute;
        bottom: 76px;
        right: 0;
        width: 270px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        padding: 12px 14px;
        font-size: 13px;
        line-height: 1.45;
        color: #1e293b;
        cursor: pointer;
        display: none;
        animation: popupSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        z-index: 2147483646;
        box-sizing: border-box;
      }
      .pos-bottom-left .proactive-popup {
        right: auto;
        left: 0;
      }
      @keyframes popupSlideUp {
        from { opacity: 0; transform: translateY(10px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .proactive-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .proactive-popup-author {
        font-size: 11px;
        font-weight: 700;
        color: var(--primary-color, #2563eb);
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .proactive-popup-close {
        background: transparent;
        border: none;
        cursor: pointer;
        color: #526074;
        padding: 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s;
      }
      .proactive-popup-close:hover {
        color: #475569;
      }
      .proactive-popup-text {
        color: #334155;
        font-size: 12.5px;
        font-weight: 500;
      }
      .proactive-popup-tail {
        position: absolute;
        bottom: -6px;
        right: 24px;
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        transform: rotate(45deg);
      }
      .pos-bottom-left .proactive-popup-tail {
        right: auto;
        left: 24px;
      }
      .chat-notice {
        font-size: 11px;
        color: #526074;
        text-align: center;
        padding: 4px 16px 2px;
        line-height: 1.35;
      }
      .chat-branding {
        font-size: 10.5px;
        color: #526074;
        text-align: center;
        padding: 2px 16px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chat-branding a {
        color: #64748b;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.15s;
      }
      .chat-branding a:hover {
        color: #0f172a;
        text-decoration: underline;
      }
      .cm-mark-mini svg {
        display: block;
        overflow: visible;
      }
      @keyframes cm-draw-mini {
        0% { stroke-dashoffset: 100; }
        55%, 75% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -100; }
      }
      @keyframes cm-seed-mini {
        0%, 100% { transform: scale(0.8); opacity: 0.85; }
        50% { transform: scale(1.25); opacity: 1; }
      }
      .cm-c-anim {
        stroke-dasharray: 100;
        animation: cm-draw-mini 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
      }
      .cm-seed-anim {
        transform-box: fill-box;
        transform-origin: center;
        animation: cm-seed-mini 2.8s ease-in-out infinite;
      }

      /* WooCommerce Product Cards & Cart Actions */
      .crescelo-product-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px 12px;
        margin: 8px 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        text-align: left;
      }
      .crescelo-product-thumb {
        width: 52px;
        height: 52px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .crescelo-product-meta {
        flex: 1;
        min-width: 0;
      }
      .crescelo-product-title {
        display: block;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
      }
      .crescelo-product-title:hover {
        color: var(--primary-color, #2563eb);
      }
      .crescelo-price-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .crescelo-product-price {
        font-size: 12.5px;
        font-weight: 700;
        color: #059669;
      }
      .crescelo-product-stock {
        font-size: 10.5px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 9999px;
      }
      .crescelo-product-stock.in-stock {
        background: #ecfdf5;
        color: #059669;
      }
      .crescelo-add-to-cart-btn {
        background: var(--primary-color, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 5px 10px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: opacity 0.15s, transform 0.1s;
      }
      .crescelo-add-to-cart-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .crescelo-add-to-cart-btn.added {
        background: #10b981;
      }
      .crescelo-cart-cta {
        margin: 6px 0;
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
      <span class="launcher-badge" id="launcher-unread-badge" style="display:none;position:absolute;top:-2px;right:-2px;background:#ef4444;color:#ffffff;font-size:11px;font-weight:700;min-width:18px;height:18px;line-height:18px;border-radius:9px;text-align:center;padding:0 4px;box-shadow:0 0 0 2px #ffffff;pointer-events:none;"></span>
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
        <div class="header-actions">
          <button class="header-action-btn" id="header-lang-btn" title="Choose Language">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span id="header-lang-label">EN</span>
          </button>
          <div class="lang-dropdown-menu" id="lang-dropdown">
            <button type="button" class="lang-item active" data-lang="en"><span>English</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
            <button type="button" class="lang-item" data-lang="es"><span>Español</span></button>
            <button type="button" class="lang-item" data-lang="fr"><span>Français</span></button>
            <button type="button" class="lang-item" data-lang="de"><span>Deutsch</span></button>
            <button type="button" class="lang-item" data-lang="ar"><span>العربية</span></button>
            <button type="button" class="lang-item" data-lang="ur"><span>اردو</span></button>
          </div>
          <button class="header-action-btn" id="header-download-btn" title="Download Chat Transcript">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Save</span>
          </button>
          <button class="header-action-btn" id="header-support-btn" title="Contact Support">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Support</span>
          </button>
          <button class="header-action-btn" id="header-expand-btn" title="Expand / Minimize chat window">
            <svg id="header-expand-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            <span id="header-expand-label">Expand</span>
          </button>
          <button class="close-btn" id="close-chat-btn" title="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="messages-container" id="messages-body"></div>
      <div class="chat-footer">
        <textarea class="chat-input" id="chat-input" placeholder="Ask anything about our business..." rows="1"></textarea>
        <button class="voice-btn" id="voice-dictate-btn" type="button" title="Speak to dictate (Voice input)" aria-label="Voice input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button class="send-btn" id="send-msg-btn" title="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="chat-notice" id="widget-notice">AI assistant. Replies may be inaccurate. By sending a message you agree that this business and its service providers store and process it. <a href="${hostUrl}/privacy" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline">Privacy policy</a></div>
      <div class="chat-branding" id="widget-branding">
        <span style="display:inline-flex;align-items:center;gap:5px;"><span class="cm-mark-mini" style="display:inline-block;width:13px;height:13px;vertical-align:middle;line-height:0;"><svg viewBox="0 0 100 100" width="13" height="13"><defs><linearGradient id="cm_t_w" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#12432f"/><stop offset="100%" stop-color="#04140d"/></linearGradient><linearGradient id="cm_c_w" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f1ffc9"/><stop offset="45%" stop-color="#abff44"/><stop offset="100%" stop-color="#74d321"/></linearGradient></defs><rect x="0" y="0" width="100" height="100" rx="26" fill="url(#cm_t_w)"/><path class="cm-c-anim" d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#cm_c_w)" stroke-width="14" stroke-linecap="round"/><circle class="cm-seed-anim" cx="63" cy="50" r="5.6" fill="url(#cm_c_w)"/><rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.3" stroke-width="2"/></svg></span> Powered by <a href="https://crescelo.com" target="_blank" rel="noopener noreferrer">Crescelo</a></span>
      </div>
    `;

    // Proactive Speech Bubble
    var proactiveBubble = document.createElement('div');
    proactiveBubble.className = 'proactive-popup';
    proactiveBubble.id = 'proactive-bubble';
    proactiveBubble.innerHTML = `
      <div class="proactive-popup-header">
        <span class="proactive-popup-author" id="proactive-author">AI Assistant</span>
        <button class="proactive-popup-close" id="proactive-close" title="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="proactive-popup-text" id="proactive-text"></div>
      <div class="proactive-popup-tail"></div>
    `;

    // Accessibility: the window is a dialog, the transcript is a live log, icon buttons have names, the popup works from the keyboard
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'Chat with this business');
    var logEl = chatWindow.querySelector('#messages-body');
    if (logEl) {
      logEl.setAttribute('role', 'log');
      logEl.setAttribute('aria-live', 'polite');
      logEl.setAttribute('aria-relevant', 'additions');
      logEl.setAttribute('aria-label', 'Conversation');
    }
    [chatWindow, proactiveBubble].forEach(function (root) {
      root.querySelectorAll('button[title]:not([aria-label])').forEach(function (b) { b.setAttribute('aria-label', b.getAttribute('title')); });
    });
    var sendEl = chatWindow.querySelector('#chat-input');
    if (sendEl) sendEl.setAttribute('aria-label', 'Your message');
    proactiveBubble.setAttribute('role', 'button');
    proactiveBubble.setAttribute('tabindex', '0');
    proactiveBubble.setAttribute('aria-label', 'Open chat');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-haspopup', 'dialog');

    widgetWrapper.appendChild(chatWindow);
    widgetWrapper.appendChild(proactiveBubble);
    widgetWrapper.appendChild(launcher);
    shadow.appendChild(widgetWrapper);

    // References
    var messagesBody = shadow.getElementById('messages-body');
    var chatInput = shadow.getElementById('chat-input');
    var sendBtn = shadow.getElementById('send-msg-btn');
    var closeBtn = shadow.getElementById('close-chat-btn');
    var supportHeaderBtn = shadow.getElementById('header-support-btn');
    var nameEl = shadow.getElementById('ast-name');
    var avatarEl = shadow.getElementById('ast-avatar');
    var proactiveAuthor = shadow.getElementById('proactive-author');
    var proactiveText = shadow.getElementById('proactive-text');
    var proactiveClose = shadow.getElementById('proactive-close');

    // Funnel events for pilot measurement: at most one widget_loaded and one widget_opened
    // per browser session. Fire-and-forget; must never affect the widget itself.
    var widgetSessionId = '';
    try {
      widgetSessionId = sessionStorage.getItem('ai_ast_sid') || '';
      if (!widgetSessionId) {
        widgetSessionId = 'ws_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        sessionStorage.setItem('ai_ast_sid', widgetSessionId);
      }
    } catch (e) {
      widgetSessionId = 'ws_' + Math.random().toString(36).substring(2, 12);
    }
    var sentWidgetEvents = {};
    function sendWidgetEvent(type) {
      if (sentWidgetEvents[type]) return;
      sentWidgetEvents[type] = true;
      try {
        var evtKey = 'ai_ast_evt_' + assistantId + '_' + type;
        if (sessionStorage.getItem(evtKey)) return;
        sessionStorage.setItem(evtKey, '1');
      } catch (e) {}
      try {
        // text/plain keeps this a "simple" cross-origin request (no CORS preflight).
        fetch(hostUrl + '/api/widget-events', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ assistantId: assistantId, type: type, sessionId: widgetSessionId }),
          keepalive: true,
          credentials: 'omit',
        }).catch(function () {});
      } catch (e) {}
    }

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
          sendWidgetEvent('widget_loaded');
        }
      })
      .catch(function (err) {
        console.warn('[AI Assistant Widget] Using fallback configuration (could not reach ' + hostUrl + '):', err.message);
        applyConfig();
      });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function applyConfig() {
      shadow.host.style.setProperty('--primary-color', config.primaryColor);
      launcher.style.backgroundColor = config.primaryColor;
      if (nameEl) nameEl.textContent = config.name;
      if (avatarEl) avatarEl.textContent = (config.name || 'AI').slice(0, 2).toUpperCase();

      if (config.launcherPosition === 'bottom-left') {
        widgetWrapper.className = 'widget-container pos-bottom-left';
      }

      // White-label & Custom Agency Branding
      var brandingEl = shadow.getElementById('widget-branding');
      if (brandingEl) {
        if (config.whiteLabelEnabled) {
          if (config.customBrandingText) {
            brandingEl.style.display = 'flex';
            if (config.customBrandingUrl) {
              var safeBrandingUrl = config.customBrandingUrl.trim();
              if (/^(https?:\/\/)/i.test(safeBrandingUrl) && !/^javascript:/i.test(safeBrandingUrl)) {
                brandingEl.innerHTML = '<a href="' + escapeHtml(safeBrandingUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(config.customBrandingText) + '</a>';
              } else {
                brandingEl.innerHTML = '<span>' + escapeHtml(config.customBrandingText) + '</span>';
              }
            } else {
              brandingEl.innerHTML = '<span>' + escapeHtml(config.customBrandingText) + '</span>';
            }
          } else {
            brandingEl.style.display = 'none';
          }
        } else {
          brandingEl.style.display = 'flex';
          brandingEl.innerHTML = '<span style="display:inline-flex;align-items:center;gap:5px;"><span class="cm-mark-mini" style="display:inline-block;width:13px;height:13px;vertical-align:middle;line-height:0;"><svg viewBox="0 0 100 100" width="13" height="13"><defs><linearGradient id="cm_t_w2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#12432f"/><stop offset="100%" stop-color="#04140d"/></linearGradient><linearGradient id="cm_c_w2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f1ffc9"/><stop offset="45%" stop-color="#abff44"/><stop offset="100%" stop-color="#74d321"/></linearGradient></defs><rect x="0" y="0" width="100" height="100" rx="26" fill="url(#cm_t_w2)"/><path class="cm-c-anim" d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#cm_c_w2)" stroke-width="14" stroke-linecap="round"/><circle class="cm-seed-anim" cx="63" cy="50" r="5.6" fill="url(#cm_c_w2)"/><rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.3" stroke-width="2"/></svg></span> Powered by <a href="https://crescelo.com" target="_blank" rel="noopener noreferrer">Crescelo</a></span>';
        }
      }

      // Restore active session conversation if returning/reloading
      restoreSessionState();

      // Add initial welcome message if empty
      if (messages.length === 0 && config.welcomeMessage) {
        appendMessage('assistant', config.welcomeMessage);
        renderStarterQuestions();
      }

      // Proactive Engagement Popup Automation
      if (config.proactiveMessageEnabled && config.proactiveMessageText) {
        var proactiveDismissed = false;
        try {
          proactiveDismissed = sessionStorage.getItem('ai_ast_proactive_dismissed') === 'true';
        } catch (e) {}

        if (!proactiveDismissed) {
          var delay = (config.proactiveMessageDelay || 5) * 1000;
          setTimeout(function () {
            if (!isOpen && !proactiveDismissed && proactiveBubble) {
              if (proactiveAuthor) proactiveAuthor.textContent = config.name || 'AI Assistant';
              if (proactiveText) proactiveText.textContent = config.proactiveMessageText;
              proactiveBubble.style.display = 'block';
            }
          }, delay);
        }
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

    // Proactive Bubble Interactions
    if (proactiveBubble) {
      proactiveBubble.addEventListener('click', function (e) {
        if (e.target.closest('#proactive-close')) return;
        proactiveBubble.style.display = 'none';
        if (!isOpen) {
          isOpen = true;
          chatWindow.classList.add('open');
          chatInput.focus();
          sendWidgetEvent('widget_opened');
        }
      });
    }

    if (proactiveClose) {
      proactiveClose.addEventListener('click', function (e) {
        e.stopPropagation();
        if (proactiveBubble) proactiveBubble.style.display = 'none';
        try {
          sessionStorage.setItem('ai_ast_proactive_dismissed', 'true');
        } catch (err) {}
      });
    }

    // Toggle Chat
    launcher.addEventListener('click', function () {
      if (proactiveBubble) proactiveBubble.style.display = 'none';
      isOpen = !isOpen;
      if (isOpen) {
        unreadAgentCount = 0;
        updateUnreadBadge();
        chatWindow.classList.add('open');
        chatInput.focus();
        sendWidgetEvent('widget_opened');
        scrollToBottom();
        if (conversationId) {
          pollLiveSync();
        }
      } else {
        chatWindow.classList.remove('open');
      }
    });

    // Keep aria-expanded in step with the window, and let Escape close it and return focus to the launcher
    new MutationObserver(function () {
      launcher.setAttribute('aria-expanded', chatWindow.classList.contains('open') ? 'true' : 'false');
    }).observe(chatWindow, { attributes: true, attributeFilter: ['class'] });
    shadow.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chatWindow.classList.contains('open')) {
        e.stopPropagation();
        isOpen = false;
        chatWindow.classList.remove('open');
        launcher.focus();
      }
    });
    proactiveBubble.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === proactiveBubble) {
        e.preventDefault();
        proactiveBubble.click();
      }
    });

    // Expand / Minimize
    var expandBtn = shadow.getElementById('header-expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        var expanded = chatWindow.classList.toggle('expanded');
        var label = shadow.getElementById('header-expand-label');
        var icon = shadow.getElementById('header-expand-icon');
        if (label) label.textContent = expanded ? 'Minimize' : 'Expand';
        if (icon) {
          // arrows pointing in when expanded, out when not
          icon.innerHTML = expanded
            ? '<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>'
            : '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
        }
        expandBtn.title = expanded ? 'Minimize chat window' : 'Expand chat window';
        scrollToBottom();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        isOpen = false;
        chatWindow.classList.remove('open');
        launcher.focus();
      });
    }

    if (supportHeaderBtn) {
      supportHeaderBtn.addEventListener('click', function () {
        requestLiveAgent();
      });
    }

    // WooCommerce In-Chat Add-to-Cart Action Delegation
    if (messagesBody) {
      messagesBody.addEventListener('click', function (e) {
        var addBtn = e.target.closest('.crescelo-add-to-cart-btn');
        if (addBtn && !addBtn.disabled) {
          handleWooAddToCart(addBtn);
        }
      });
    }

    function handleWooAddToCart(btn) {
      var pid = btn.getAttribute('data-product-id');
      var title = btn.getAttribute('data-product-title') || 'Item';
      if (!pid) return;

      btn.disabled = true;
      var originalHtml = btn.innerHTML;
      btn.innerHTML = '⏳ Adding to Cart...';

      fetch('/?wc-ajax=add_to_cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ product_id: pid, quantity: 1 }),
      })
      .then(function (res) {
        return res.text();
      })
      .then(function () {
        btn.classList.add('added');
        btn.innerHTML = '✓ Added! <a href="/cart" target="_blank" rel="noopener noreferrer" style="color:#ffffff;text-decoration:underline;margin-left:6px;font-weight:700;">View Cart &rarr;</a>';

        try {
          if (window.jQuery) {
            window.jQuery(document.body).trigger('wc_fragment_refresh');
            window.jQuery(document.body).trigger('added_to_cart', [null, null, null]);
          }
        } catch (evtErr) {}
      })
      .catch(function () {
        window.open('/cart/?add-to-cart=' + encodeURIComponent(pid), '_blank');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      });
    }

    var downloadHeaderBtn = shadow.getElementById('header-download-btn');
    if (downloadHeaderBtn) {
      downloadHeaderBtn.addEventListener('click', function () {
        if (!messages || messages.length === 0) {
          alert('No messages to download yet.');
          return;
        }
        var astTitle = config.name || 'AI Assistant';
        var now = new Date();
        var dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        var lines = [
          '=======================================================',
          astTitle.toUpperCase() + ' - CHAT TRANSCRIPT',
          'Exported: ' + dateStr,
          'Total Messages: ' + messages.length,
          '=======================================================',
          ''
        ];

        messages.forEach(function (m, idx) {
          var sender = m.role === 'user' ? 'Visitor' : astTitle;
          lines.push('[' + (idx + 1) + '] ' + sender + ':');
          lines.push(m.content);
          lines.push('');
        });

        var blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'chat-transcript-' + now.toISOString().slice(0, 10) + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1500);
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

    // Voice Dictation (Speech-to-Text)
    var voiceBtn = shadow.getElementById('voice-dictate-btn');
    var isListening = false;
    var recognition = null;
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = function () {
        isListening = true;
        if (voiceBtn) voiceBtn.classList.add('listening');
        chatInput.placeholder = 'Listening... Speak now';
      };

      recognition.onresult = function (event) {
        var transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          chatInput.value = transcript;
          chatInput.style.height = 'auto';
          chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
        }
      };

      recognition.onerror = function () {
        isListening = false;
        if (voiceBtn) voiceBtn.classList.remove('listening');
        chatInput.placeholder = 'Ask anything about our business...';
      };

      recognition.onend = function () {
        isListening = false;
        if (voiceBtn) voiceBtn.classList.remove('listening');
        chatInput.placeholder = 'Ask anything about our business...';
      };

      if (voiceBtn) {
        voiceBtn.addEventListener('click', function () {
          if (isListening) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (err) {
              console.warn('Speech recognition start failed:', err);
            }
          }
        });
      }
    } else if (voiceBtn) {
      voiceBtn.style.display = 'none';
    }

    // Language Dropdown Selector
    var langBtn = shadow.getElementById('header-lang-btn');
    var langDropdown = shadow.getElementById('lang-dropdown');
    var langLabel = shadow.getElementById('header-lang-label');
    var currentLanguage = 'en';

    if (langBtn && langDropdown) {
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
      });

      document.addEventListener('click', function () {
        langDropdown.classList.remove('show');
      });

      var langItems = langDropdown.querySelectorAll('.lang-item');
      langItems.forEach(function (item) {
        item.addEventListener('click', function () {
          var langCode = item.getAttribute('data-lang');
          currentLanguage = langCode;
          if (langLabel) langLabel.textContent = langCode.toUpperCase();

          langItems.forEach(function (i) {
            i.classList.remove('active');
            var check = i.querySelector('svg');
            if (check) check.remove();
          });
          item.classList.add('active');
          var checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          checkSvg.setAttribute('width', '12');
          checkSvg.setAttribute('height', '12');
          checkSvg.setAttribute('viewBox', '0 0 24 24');
          checkSvg.setAttribute('fill', 'none');
          checkSvg.setAttribute('stroke', 'currentColor');
          checkSvg.setAttribute('stroke-width', '3');
          checkSvg.setAttribute('stroke-linecap', 'round');
          checkSvg.setAttribute('stroke-linejoin', 'round');
          checkSvg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
          item.appendChild(checkSvg);

          langDropdown.classList.remove('show');

          if (recognition) {
            var langMap = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', ar: 'ar-SA', ur: 'ur-PK' };
            recognition.lang = langMap[langCode] || 'en-US';
          }

          var greetings = {
            en: 'Language set to English. How can I assist you?',
            es: 'Idioma cambiado a Español. ¿En qué puedo ayudarte hoy?',
            fr: 'Langue configurée en Français. Comment puis-je vous aider ?',
            de: 'Sprache auf Deutsch eingestellt. Wie kann ich Ihnen helfen?',
            ar: 'تم ضبط اللغة على العربية. كيف يمكنني مساعدتك اليوم؟',
            ur: 'زبان اردو میں تبدیل کر دی گئی ہے۔ میں آپ کی کیا مدد کر سکتا ہوں؟'
          };
          if (greetings[langCode]) {
            appendMessage('assistant', greetings[langCode]);
          }
        });
      });
    }
    var liveSyncTimer = null;
    var knownMessageIds = {};
    var conversationToken = null;
    var isTakeoverActive = false;
    var unreadAgentCount = 0;

    var CONV_STORAGE_KEY = 'ai_ast_conv_' + assistantId;
    var TOKEN_STORAGE_KEY = 'ai_ast_tok_' + assistantId;
    var MSGS_STORAGE_KEY = 'ai_ast_msgs_' + assistantId;
    var TAKEOVER_STORAGE_KEY = 'ai_ast_takeover_' + assistantId;

    function persistSessionState() {
      try {
        if (conversationId) {
          sessionStorage.setItem(CONV_STORAGE_KEY, conversationId);
        }
        if (conversationToken) {
          sessionStorage.setItem(TOKEN_STORAGE_KEY, conversationToken);
        }
        if (messages && messages.length > 0) {
          sessionStorage.setItem(MSGS_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
        }
        sessionStorage.setItem(TAKEOVER_STORAGE_KEY, isTakeoverActive ? '1' : '0');
      } catch (e) {}
    }

    function restoreSessionState() {
      try {
        var savedConvId = sessionStorage.getItem(CONV_STORAGE_KEY);
        var savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        var savedMsgsRaw = sessionStorage.getItem(MSGS_STORAGE_KEY);
        var savedTakeover = sessionStorage.getItem(TAKEOVER_STORAGE_KEY);

        if (savedConvId) {
          conversationId = savedConvId;
        }
        if (savedToken) {
          conversationToken = savedToken;
        }
        if (savedTakeover === '1') {
          isTakeoverActive = true;
        }

        if (savedMsgsRaw) {
          var parsed = JSON.parse(savedMsgsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            messages = [];
            if (messagesBody) messagesBody.innerHTML = '';
            parsed.forEach(function (m) {
              if (m.id) knownMessageIds[m.id] = true;
              appendMessage(m.role, m.content, m.senderName);
            });
            if (isTakeoverActive) {
              renderTakeoverBanner('Live Support Agent');
            }
          }
        }

        if (conversationId) {
          startLiveSync();
        }
      } catch (e) {}
    }

    function updateUnreadBadge() {
      var badge = shadow.getElementById('launcher-unread-badge');
      if (!badge) return;
      if (!isOpen && unreadAgentCount > 0) {
        badge.textContent = unreadAgentCount > 9 ? '9+' : String(unreadAgentCount);
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    function renderTakeoverBanner(agentName) {
      if (!messagesBody) return;
      var existing = messagesBody.querySelector('#live-agent-banner');
      if (!existing) {
        var banner = document.createElement('div');
        banner.id = 'live-agent-banner';
        banner.style.cssText = 'background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 6px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #6d28d9; font-weight: 600;';
        banner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);"></span>
            <span>Live Support Agent Connected (${escapeHtml(agentName || 'Agent')})</span>
          </div>
          <span style="font-size: 10px; color: #8b5cf6; font-weight: 500;">AI Paused</span>
        `;
        messagesBody.insertBefore(banner, messagesBody.firstChild);
      }
    }

    function removeTakeoverBanner() {
      if (!messagesBody) return;
      var existing = messagesBody.querySelector('#live-agent-banner');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }

    function pollLiveSync() {
      if (!conversationId) return;
      var syncUrl = hostUrl + '/api/conversations?id=' + encodeURIComponent(conversationId);
      if (conversationToken) {
        syncUrl += '&token=' + encodeURIComponent(conversationToken);
      }
      fetch(syncUrl)
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data) return;
          var conv = data.conversation || {};
          var msgList = (conv && conv.messages) || data.newMessages || [];

          if (conv.isLiveTakeover) {
            isTakeoverActive = true;
            renderTakeoverBanner(conv.assignedAgentName || 'Live Support Agent');
          } else if (conv.isLiveTakeover === false) {
            isTakeoverActive = false;
            removeTakeoverBanner();
          }

          var hasNewAgentMsg = false;
          msgList.forEach(function (m) {
            if (m.role === 'agent' && !knownMessageIds[m.id]) {
              knownMessageIds[m.id] = true;
              appendMessage('agent', m.content, m.senderName);
              hasNewAgentMsg = true;
            } else if (m.id) {
              knownMessageIds[m.id] = true;
            }
          });

          if (hasNewAgentMsg) {
            persistSessionState();
            if (!isOpen) {
              unreadAgentCount++;
              updateUnreadBadge();
            } else {
              scrollToBottom();
            }
          }
        })
        .catch(function () {});
    }

    function startLiveSync() {
      if (!conversationId) return;
      pollLiveSync();
      if (liveSyncTimer) return;
      liveSyncTimer = setInterval(function () {
        pollLiveSync();
      }, 3500);
    }

    function appendMessage(role, text, senderName) {
      messages.push({ role: role, content: text, senderName: senderName });
      persistSessionState();
      var msgEl = document.createElement('div');
      var isUser = role === 'user';
      var isAgent = role === 'agent';
      msgEl.className = 'message ' + (isUser ? 'msg-user' : isAgent ? 'msg-agent' : 'msg-assistant');

      if (isAgent) {
        var agentHeader = document.createElement('div');
        agentHeader.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#7c3aed;margin-bottom:4px;';
        agentHeader.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <span>${escapeHtml(senderName || 'Live Support Agent')}</span>
        `;
        msgEl.appendChild(agentHeader);
      }

      var hasBookingAction = text && text.indexOf('[ACTION:BOOKING_FORM]') !== -1;
      var hasHumanAction = text && text.indexOf('[ACTION:HUMAN_ESCALATION]') !== -1;
      var cleanText = text ? text.replace(/\s*\[ACTION:[A-Z_]+\]/g, '').trim() : '';

      var textContainer = document.createElement('div');
      textContainer.innerHTML = formatMarkdown(cleanText);
      msgEl.appendChild(textContainer);

      if (messagesBody) messagesBody.appendChild(msgEl);
      if (hasBookingAction) {
        renderBookingCard();
        renderSupportQuickButton(msgEl, '');
      } else if (hasHumanAction) {
        renderAgentNotified(msgEl);
      }
      if (isUser) {
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
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, title, url) {
        var cleanUrl = (url || '').trim();
        if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(cleanUrl) && !/^javascript:/i.test(cleanUrl)) {
          return '<a href="' + escapeHtml(cleanUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--primary-color, #2563eb);text-decoration:underline;font-weight:550;word-break:break-word;">' + title + ' &#8599;</a>';
        }
        return title;
      });

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

      // Parse WooCommerce Product Cards: [PRODUCT_CARD:{...}]
      html = html.replace(/\[PRODUCT_CARD:\s*(\{[\s\S]*?\})\s*\]/g, function (match, jsonStr) {
        try {
          var unescaped = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          var p = JSON.parse(unescaped);
          var imgHtml = p.image ? ('<img src="' + escapeHtml(p.image) + '" class="crescelo-product-thumb" alt="' + escapeHtml(p.title || '') + '" />') : '';
          var priceHtml = p.price ? ('<span class="crescelo-product-price">' + escapeHtml(p.price) + '</span>') : '';
          var stockHtml = p.stock ? ('<span class="crescelo-product-stock in-stock">' + escapeHtml(p.stock) + '</span>') : '';
          var titleHtml = p.url ? ('<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer" class="crescelo-product-title">' + escapeHtml(p.title || 'View Product') + ' &#8599;</a>') : ('<span class="crescelo-product-title">' + escapeHtml(p.title || '') + '</span>');

          return '<div class="crescelo-product-card" data-product-id="' + escapeHtml(String(p.id || '')) + '">' +
            imgHtml +
            '<div class="crescelo-product-meta">' +
              titleHtml +
              '<div class="crescelo-price-row">' + priceHtml + stockHtml + '</div>' +
              '<button type="button" class="crescelo-add-to-cart-btn" data-product-id="' + escapeHtml(String(p.id || '')) + '" data-product-title="' + escapeHtml(p.title || '') + '">' +
                '🛒 Add to Cart' +
              '</button>' +
            '</div>' +
          '</div>';
        } catch (e) {
          return '';
        }
      });

      // Parse Add-to-Cart Call to Action: [ADD_TO_CART:{...}]
      html = html.replace(/\[ADD_TO_CART:\s*(\{[\s\S]*?\})\s*\]/g, function (match, jsonStr) {
        try {
          var unescaped = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          var p = JSON.parse(unescaped);
          return '<div class="crescelo-cart-cta">' +
            '<button type="button" class="crescelo-add-to-cart-btn" data-product-id="' + escapeHtml(String(p.id || '')) + '" data-product-title="' + escapeHtml(p.title || '') + '">' +
              '🛒 Add ' + escapeHtml(p.title || 'Item') + (p.price ? ' (' + escapeHtml(p.price) + ')' : '') + ' to Cart' +
            '</button>' +
          '</div>';
        } catch (e) {
          return '';
        }
      });

      return html;
    }

    function isSupportIntent(text) {
      if (!text) return false;
      var lower = text.toLowerCase().trim();
      var keywords = [
        'connect to support',
        'connect with support',
        'talk to support',
        'contact support',
        'talk to human',
        'speak to human',
        'talk to agent',
        'speak with agent',
        'talk to a person',
        'speak to a person',
        'customer service',
        'customer support',
        'human agent',
        'human help',
        'live agent',
        'support team',
        'support agent'
      ];
      for (var i = 0; i < keywords.length; i++) {
        if (lower.indexOf(keywords[i]) !== -1) return true;
      }
      return false;
    }

    function isSupportSuggested(text) {
      if (!text) return false;
      var lower = text.toLowerCase();
      return (
        lower.indexOf('connect you with our support team') !== -1 ||
        lower.indexOf('contact our support team') !== -1 ||
        lower.indexOf('connect with our support team') !== -1 ||
        lower.indexOf('connect to support') !== -1 ||
        lower.indexOf('reach out to our support') !== -1 ||
        lower.indexOf('support team for further assistance') !== -1
      );
    }

    function formatHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function renderSupportForm(prefillNotes) {
      // Don't duplicate if already open in view
      var existing = messagesBody && messagesBody.querySelector('.support-form-card');
      if (existing) {
        existing.scrollIntoView({ behavior: 'smooth' });
        var firstInput = existing.querySelector('input');
        if (firstInput) firstInput.focus();
        return;
      }

      var card = document.createElement('div');
      card.className = 'support-form-card';

      var customFieldsHtml = '';
      var fieldsList = config.supportCustomFields || [];
      if (Array.isArray(fieldsList) && fieldsList.length > 0) {
        fieldsList.forEach(function (cf) {
          var reqStar = cf.required ? '<span class="required-star">*</span>' : '<span class="optional-tag">(Optional)</span>';
          customFieldsHtml += '<div class="support-field">';
          customFieldsHtml += '<label class="support-label">' + formatHtml(cf.label) + ' ' + reqStar + '</label>';

          if (cf.type === 'select' && cf.options && cf.options.length > 0) {
            customFieldsHtml += '<select class="support-select" data-custom-id="' + cf.id + '" ' + (cf.required ? 'required' : '') + '>';
            customFieldsHtml += '<option value="">-- Select ' + formatHtml(cf.label) + ' --</option>';
            cf.options.forEach(function (opt) {
              customFieldsHtml += '<option value="' + formatHtml(opt) + '">' + formatHtml(opt) + '</option>';
            });
            customFieldsHtml += '</select>';
          } else if (cf.type === 'textarea') {
            customFieldsHtml += '<textarea class="support-textarea" data-custom-id="' + cf.id + '" placeholder="' + formatHtml(cf.label) + '" ' + (cf.required ? 'required' : '') + '></textarea>';
          } else if (cf.type === 'tel') {
            customFieldsHtml += '<input type="tel" class="support-input" data-custom-id="' + cf.id + '" placeholder="e.g. +1 555-0199" ' + (cf.required ? 'required' : '') + ' />';
          } else {
            customFieldsHtml += '<input type="text" class="support-input" data-custom-id="' + cf.id + '" placeholder="' + formatHtml(cf.label) + '" ' + (cf.required ? 'required' : '') + ' />';
          }

          customFieldsHtml += '</div>';
        });
      }

      var initialNotes = prefillNotes && !isSupportIntent(prefillNotes) ? formatHtml(prefillNotes) : '';

      card.innerHTML = `
        <div class="support-form-header">
          <div class="support-form-icon" style="display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <div class="support-form-title">Connect with Support</div>
            <div class="support-form-desc">Leave your details and our team will get back to you promptly.</div>
          </div>
        </div>
        <div class="support-error-box" id="supp-err-box"></div>
        <form id="supp-form">
          <div class="support-field">
            <label class="support-label">Full Name <span class="required-star">*</span></label>
            <input type="text" class="support-input" id="supp-name" placeholder="John Doe" required />
          </div>
          <div class="support-field">
            <label class="support-label">Email Address <span class="required-star">*</span></label>
            <input type="email" class="support-input" id="supp-email" placeholder="john@example.com" required />
          </div>
          <div class="support-field">
            <label class="support-label">Phone Number <span class="required-star">*</span></label>
            <input type="tel" class="support-input" id="supp-phone" placeholder="e.g. +1 234 567 890" required />
          </div>
          ${customFieldsHtml}
          <div class="support-field">
            <label class="support-label">Comments / Message <span class="optional-tag">(Optional)</span></label>
            <textarea class="support-textarea" id="supp-notes" placeholder="How can our team help you?">${initialNotes}</textarea>
          </div>
          <button type="submit" class="support-submit-btn" id="supp-submit-btn">
            <span>Send Support Request</span>
          </button>
        </form>
      `;

      if (messagesBody) messagesBody.appendChild(card);
      scrollToBottom();

      var form = card.querySelector('#supp-form');
      var errBox = card.querySelector('#supp-err-box');
      var submitBtn = card.querySelector('#supp-submit-btn');

      function showError(msg) {
        errBox.textContent = msg;
        errBox.style.display = 'block';
        errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        errBox.style.display = 'none';

        var nameVal = (card.querySelector('#supp-name').value || '').trim();
        var emailVal = (card.querySelector('#supp-email').value || '').trim();
        var phoneVal = (card.querySelector('#supp-phone').value || '').trim();
        var notesVal = (card.querySelector('#supp-notes').value || '').trim();

        if (!nameVal) {
          showError('Please enter your full name.');
          return;
        }
        if (!emailVal || emailVal.indexOf('@') === -1 || emailVal.indexOf('.') === -1) {
          showError('Please enter a valid email address.');
          return;
        }
        if (!phoneVal) {
          showError('Please enter your phone number.');
          return;
        }

        // Collect custom fields
        var customData = {};
        var customInputs = card.querySelectorAll('[data-custom-id]');
        var customHasError = false;
        for (var i = 0; i < customInputs.length; i++) {
          var input = customInputs[i];
          var fieldId = input.getAttribute('data-custom-id');
          var val = input.value.trim();
          var isReq = input.hasAttribute('required');
          if (isReq && !val) {
            var parentLabel = input.parentElement.querySelector('label');
            var labelText = parentLabel ? parentLabel.textContent.replace('*', '').trim() : 'This field';
            showError('Please fill in ' + labelText + '.');
            customHasError = true;
            break;
          }
          if (val) {
            customData[fieldId] = val;
          }
        }
        if (customHasError) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: typing 0.8s infinite linear;">
            <circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10"/>
          </svg>
          <span>Submitting...</span>
        `;

        fetch(hostUrl + '/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assistantId: assistantId,
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            notes: notesVal,
            customData: customData,
            conversationId: conversationId,
            source: 'chat',
          }),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (data.error) {
              throw new Error(data.error);
            }

            // Replace card with sleek confirmation
            card.innerHTML = `
              <div class="support-success-card">
                <div class="support-success-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Support Request Sent!</span>
                </div>
                <div class="support-success-text">
                  Thank you, <strong>${formatHtml(nameVal)}</strong>! Our team has received your message and will reach out to you via <strong>${formatHtml(emailVal)}</strong> or phone shortly.
                </div>
              </div>
            `;
            scrollToBottom();
          })
          .catch(function (err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send Support Request</span>';
            showError(err.message || 'Failed to submit request. Please try again.');
          });
      });
    }

    // Second option next to the booking form: hand the conversation to a person, right here in the chat.
    function requestLiveAgent() {
      if (isStreaming) return;
      chatInput.value = 'I would like to talk to a live agent';
      sendMessage();
    }

    function renderAgentNotified(parentMsgEl) {
      if (!parentMsgEl || parentMsgEl.querySelector('.agent-notified')) return;
      var note = document.createElement('div');
      note.className = 'agent-notified';
      note.style.cssText = 'margin-top:8px;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--primary-color, #2563eb);';
      note.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block"></span><span>Live agent notified. Someone will join this chat shortly.</span>';
      parentMsgEl.appendChild(note);
      scrollToBottom();
    }

    function renderSupportQuickButton(parentMsgEl) {
      if (!parentMsgEl || parentMsgEl.querySelector('.support-quick-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'support-quick-btn';
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Talk to a live agent</span>
      `;
      btn.addEventListener('click', function () {
        btn.remove();
        requestLiveAgent();
      });
      parentMsgEl.appendChild(btn);
      scrollToBottom();
    }

    function isBookingIntent(text) {
      if (!text) return false;
      return /\b(book|schedule|appointment|tour|demo|meeting|call with|consultation|reserve a slot|calendar)\b/i.test(text);
    }

    function renderBookingQuickButton(parentMsgEl, queryText) {
      if (!parentMsgEl || parentMsgEl.querySelector('.booking-quick-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'booking-quick-btn';
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
        </svg>
        <span>${escapeHtml(config.bookingPromptText || 'Schedule an Appointment')}</span>
      `;
      btn.addEventListener('click', function () {
        btn.remove();
        renderBookingCard(queryText);
      });
      parentMsgEl.appendChild(btn);
      scrollToBottom();
    }

    function renderBookingCard(queryText) {
      var card = document.createElement('div');
      card.className = 'booking-card';

      if (config.bookingProvider === 'calendly' || config.bookingProvider === 'cal_com') {
        var isCalCom = config.bookingProvider === 'cal_com';
        var calUrl = config.bookingUrl || (isCalCom ? 'https://cal.com' : 'https://calendly.com');
        var providerName = isCalCom ? 'Cal.com' : 'Calendly';
        card.innerHTML = `
          <div class="booking-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #2563eb)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 14h.01"></path>
            </svg>
            <span>${escapeHtml(config.bookingPromptText || ('Schedule with ' + providerName))}</span>
          </div>
          <div class="booking-desc">Choose a convenient time on ${escapeHtml(providerName)} to meet with our team.</div>
          <a href="${escapeHtml(calUrl)}" target="_blank" rel="noopener noreferrer" class="booking-external-btn">
            <span>Open ${escapeHtml(providerName)} &amp; Pick a Time</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        `;
        if (messagesBody) messagesBody.appendChild(card);
        scrollToBottom();
        return;
      }

      // Direct In-Widget Date & Time Booking
      var tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      var slotDuration = parseInt(config.bookingSlotDuration, 10) || 30;
      var durationLabel = slotDuration === 60 ? '1 hour' : slotDuration === 120 ? '2 hours' : slotDuration === 90 ? '1.5 hours' : slotDuration + ' mins';

      // Generate dynamic slots based on admin duration and operating hours
      function generateWidgetSlots(duration, startHourStr, endHourStr) {
        var startParts = (startHourStr || '09:00').split(':');
        var endParts = (endHourStr || '17:00').split(':');
        var startTotalMins = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1] || 0, 10);
        var endTotalMins = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1] || 0, 10);

        if (endTotalMins <= startTotalMins) {
          endTotalMins = startTotalMins + 480;
        }

        var slots = [];
        var curr = startTotalMins;

        function formatTime(mins) {
          var h = Math.floor(mins / 60);
          var m = mins % 60;
          var period = h >= 12 ? 'PM' : 'AM';
          var displayH = h % 12 === 0 ? 12 : h % 12;
          var displayM = m < 10 ? '0' + m : m;
          return displayH + ':' + displayM + ' ' + period;
        }

        while (curr + duration <= endTotalMins) {
          var slotStart = formatTime(curr);
          var slotEnd = formatTime(curr + duration);
          slots.push(slotStart + ' - ' + slotEnd);
          curr += duration;
        }

        if (slots.length === 0) {
          slots.push('09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM');
        }
        return slots;
      }

      var availableSlots = generateWidgetSlots(slotDuration, config.bookingStartHour, config.bookingEndHour);
      var slotOptionsHtml = availableSlots.map(function (s, i) {
        return '<option value="' + escapeHtml(s) + '" ' + (i === 1 || i === 0 ? 'selected' : '') + '>' + escapeHtml(s) + '</option>';
      }).join('');

      card.innerHTML = `
        <div class="booking-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #2563eb)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="M8 14h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M16 14h.01"></path>
          </svg>
          <span>${escapeHtml(config.bookingPromptText || 'Schedule an Appointment')}</span>
        </div>
        <div class="booking-desc">Select your preferred date &amp; time (${escapeHtml(durationLabel)} session). We will confirm instantly.</div>
        <form id="widget-booking-form" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Date</label>
              <input type="date" id="book-date" min="${tomorrow}" value="${tomorrow}" required style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none;" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Time Slot (${escapeHtml(durationLabel)})</label>
              <select id="book-time" style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none; background: #fff;">
                ${slotOptionsHtml}
              </select>
            </div>
          </div>
          <div>
            <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Your Name</label>
            <input type="text" id="book-name" placeholder="Full name" required style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none;" />
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Email Address</label>
              <input type="email" id="book-email" placeholder="name@email.com" required style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none;" />
            </div>
            <div style="flex: 1;">
              <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Phone (Optional)</label>
              <input type="tel" id="book-phone" placeholder="+1..." style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none;" />
            </div>
          </div>
          <div>
            <label style="font-size: 10.5px; font-weight: 600; color: #64748b; display: block; margin-bottom: 3px;">Meeting Note (Optional)</label>
            <input type="text" id="book-notes" placeholder="What would you like to discuss?" style="width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 12px; outline: none;" />
          </div>
          <button type="submit" id="book-submit-btn" style="margin-top: 4px; padding: 8px; border: none; border-radius: 7px; background: var(--primary-color, #2563eb); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;">
            Confirm ${escapeHtml(durationLabel)} Appointment
          </button>
        </form>
      `;

      if (messagesBody) messagesBody.appendChild(card);
      scrollToBottom();

      var formEl = card.querySelector('#widget-booking-form');
      if (formEl) {
        formEl.addEventListener('submit', function (e) {
          e.preventDefault();
          var dateVal = card.querySelector('#book-date').value;
          var timeVal = card.querySelector('#book-time').value;
          var nameVal = card.querySelector('#book-name').value;
          var emailVal = card.querySelector('#book-email').value;
          var phoneVal = (card.querySelector('#book-phone') && card.querySelector('#book-phone').value) || '';
          var notesVal = (card.querySelector('#book-notes') && card.querySelector('#book-notes').value) || '';
          var btnEl = card.querySelector('#book-submit-btn');

          if (btnEl) {
            btnEl.disabled = true;
            btnEl.textContent = 'Confirming...';
          }

          var payloadNotes = notesVal ? (notesVal + (queryText ? ' | Inquired: ' + queryText : '')) : (queryText ? 'Inquired: ' + queryText : '');

          fetch(hostUrl + '/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assistantId: assistantId,
              name: nameVal,
              email: emailVal,
              phone: phoneVal,
              date: dateVal,
              timeSlot: timeVal,
              durationMinutes: slotDuration,
              notes: payloadNotes,
              conversationId: conversationId,
              source: 'chat',
            }),
          })
            .then(function (res) {
              return res.json().then(function (data) {
                return { ok: res.ok, data: data || {} };
              });
            })
            .then(function (result) {
              if (!result.ok) {
                // e.g. the slot was just taken: say so and let the visitor choose another time
                if (btnEl) {
                  btnEl.disabled = false;
                  btnEl.textContent = 'Confirm Appointment';
                }
                var errBox = card.querySelector('#book-error');
                if (!errBox) {
                  errBox = document.createElement('div');
                  errBox.id = 'book-error';
                  errBox.style.cssText = 'margin-top:8px;padding:8px 10px;border-radius:8px;background:#fef2f2;color:#b91c1c;font-size:12px;';
                  formEl.appendChild(errBox);
                }
                errBox.textContent = (result.data && result.data.error) || 'That time could not be booked. Please choose another.';
                return;
              }
              var links = buildCalendarLinks({
                title: 'Appointment with ' + (config.name || 'us'),
                description: 'Booked through the ' + (config.name || 'business') + ' chat assistant.' + (notesVal ? ' Notes: ' + notesVal : ''),
                date: dateVal,
                time: timeVal,
                durationMinutes: slotDuration,
              });
              card.innerHTML = `
                <div class="support-success-card">
                  <div class="support-success-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Appointment Confirmed!</span>
                  </div>
                  <div class="support-success-text">
                    Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your appointment has been booked for <strong>${escapeHtml(dateVal)}</strong> at <strong>${escapeHtml(timeVal)}</strong> (${escapeHtml(durationLabel)}). A confirmation email has been dispatched to <strong>${escapeHtml(emailVal)}</strong>.
                  </div>
                  ${links ? `
                  <div class="cal-title">Add to your calendar</div>
                  <div class="cal-actions">
                    <a class="cal-btn" id="cal-google" href="${escapeHtml(links.google)}" target="_blank" rel="noopener noreferrer">Google Calendar</a>
                    <button type="button" class="cal-btn" id="cal-apple">Apple Calendar</button>
                    <button type="button" class="cal-btn" id="cal-ical">iCal / Outlook (.ics)</button>
                  </div>` : ''}
                </div>
              `;
              if (links) {
                var onIcs = function () { downloadIcs(links.ics); };
                var appleBtn = card.querySelector('#cal-apple');
                var icalBtn = card.querySelector('#cal-ical');
                if (appleBtn) appleBtn.addEventListener('click', onIcs);
                if (icalBtn) icalBtn.addEventListener('click', onIcs);
              }
              scrollToBottom();
            })
            .catch(function () {
              if (btnEl) {
                btnEl.disabled = false;
                btnEl.textContent = 'Confirm Appointment';
              }
            });
        });
      }
    }

    // ---- Add to calendar (Google link, and an .ics file that Apple Calendar, iCal and Outlook open) ----
    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function parseSlotTime(t) {
      var m = String(t || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
      if (!m) return null;
      var h = parseInt(m[1], 10);
      var min = parseInt(m[2], 10);
      if (m[3]) {
        var pm = m[3].toLowerCase() === 'pm';
        if (h === 12) h = pm ? 12 : 0;
        else if (pm) h += 12;
      }
      if (h > 23 || min > 59) return null;
      return { h: h, m: min };
    }

    function localStamp(d) {
      return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
    }

    function icsEscape(v) {
      return String(v || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    }

    function buildCalendarLinks(ev) {
      var dm = String(ev.date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
      var tm = parseSlotTime(ev.time);
      if (!dm || !tm) return null;
      var start = new Date(parseInt(dm[1], 10), parseInt(dm[2], 10) - 1, parseInt(dm[3], 10), tm.h, tm.m, 0);
      var end = new Date(start.getTime() + (ev.durationMinutes || 30) * 60000);
      var s = localStamp(start);
      var e = localStamp(end);
      // "floating" local time: the event appears at the same clock time in the visitor's own calendar
      var google = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(ev.title) +
        '&dates=' + s + '/' + e + '&details=' + encodeURIComponent(ev.description || '');
      var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Crescelo//Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '@crescelo.com',
        'DTSTAMP:' + stamp,
        'DTSTART:' + s,
        'DTEND:' + e,
        'SUMMARY:' + icsEscape(ev.title),
        'DESCRIPTION:' + icsEscape(ev.description),
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Appointment reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
      return { google: google, ics: ics };
    }

    function downloadIcs(icsText) {
      try {
        var blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'appointment.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      } catch (err) {}
    }

    // Send Streaming Message with Stream Stability & Support Handoff
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text || isStreaming) return;

      chatInput.value = '';
      appendMessage('user', text);
      isStreaming = true;
      sendBtn.disabled = true;

      var userWantsSupport = isSupportIntent(text);
      var userWantsBooking = config.bookingEnabled && isBookingIntent(text);

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

      // If user wants appointment booking, render booking card immediately
      if (userWantsBooking) {
        if (typing.parentNode && messagesBody) {
          messagesBody.removeChild(typing);
        }
        appendMessage('assistant', "I would be happy to help you schedule a time! Please pick your preferred date and slot below:");
        renderBookingCard(text);
        isStreaming = false;
        sendBtn.disabled = false;
        chatInput.focus();
        return;
      }

      // If user directly typed "connect to support", render form immediately!
      // (A request for a person is answered by the server, which alerts the team; no contact form is shown here.)

      // 28-second AbortController timeout safeguard against hanging connections
      var controller = null;
      var timeoutId = null;
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(function () {
          if (controller) controller.abort();
        }, 28000);
      }

      fetch(hostUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          assistantId: assistantId,
          messages: messages.map(function (m) { return { role: m.role, content: m.content }; }),
          visitorId: visitorId,
          conversationId: conversationId,
          preferredLanguage: currentLanguage,
        }),
      })
        .then(function (response) {
          if (timeoutId) clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
          }

          var reader = response.body && response.body.getReader();
          var decoder = new TextDecoder();
          var streamedText = '';
          var assistantBubble = null;
          var hasMountedBubble = false;
          var currentCitations = [];
          var isCurrentWebSearch = false;

          if (!reader) {
            throw new Error('No response body reader');
          }

          function renderWidgetCitations(parentBubble, citations, isWebSearch) {
            if (!parentBubble || !citations || !citations.length || !isWebSearch) return;
            // Strictly only surface active live external web search links — never internal knowledge base, documents, CSVs, or files
            var validCitations = citations.filter(function (c) {
              return c && c.url && (c.url.indexOf('http://') === 0 || c.url.indexOf('https://') === 0) && (c.isLiveWebSearch || isWebSearch);
            });
            if (validCitations.length === 0) return;

            var seen = {};
            var uniqueCitations = [];
            validCitations.forEach(function (c) {
              var key = c.url;
              if (!seen[key]) {
                seen[key] = true;
                uniqueCitations.push(c);
              }
            });

            var container = document.createElement('div');
            container.className = 'sources-container';

            var header = document.createElement('div');
            header.style.cssText = 'font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:4px;width:100%;margin-bottom:2px;';
            header.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Web Sources:</span>
            `;
            container.appendChild(header);

            uniqueCitations.forEach(function (c) {
              var title = c.sourceTitle || (c.url ? (function() {
                try { return new URL(c.url).hostname; } catch(e) { return c.url; }
              })() : 'Web Source');

              var a = document.createElement('a');
              a.href = c.url;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.className = 'source-pill-link';
              a.title = c.preview || c.url;
              a.innerHTML = `
                <span>${escapeHtml(title)}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              `;
              container.appendChild(a);
            });

            parentBubble.appendChild(container);
          }

          var streamBuffer = '';

          function readStream() {
            return reader.read().then(function (result) {
              if (result.done) {
                if (typing.parentNode && messagesBody) {
                  messagesBody.removeChild(typing);
                }

                if (!streamedText.trim()) {
                  if (isTakeoverActive) {
                    // In human takeover mode, visitor messages are delivered to the agent without bot fallback
                  } else {
                    // If finished with zero tokens, display helpful message and offer support form
                    var fallback = config.fallbackMessage || "I'm here to help! If you'd like to connect with our support team, please let us know below.";
                    var fbEl = appendMessage('assistant', fallback);
                    renderSupportQuickButton(fbEl, text);
                  }
                } else {
                  var hasActionBooking = streamedText.indexOf('[ACTION:BOOKING_FORM]') !== -1;
                  var hasActionHuman = streamedText.indexOf('[ACTION:HUMAN_ESCALATION]') !== -1;
                  var cleanContent = streamedText.replace(/\s*\[ACTION:[A-Z_]+\]/g, '').trim();
                  if (assistantBubble) {
                    assistantBubble.innerHTML = formatMarkdown(cleanContent);
                  }
                  messages.push({ role: 'assistant', content: cleanContent });
                  persistSessionState();
                  // Attach citation pills strictly if a live external web search was executed
                  if (assistantBubble && currentCitations.length > 0 && isCurrentWebSearch) {
                    renderWidgetCitations(assistantBubble, currentCitations, isCurrentWebSearch);
                  }
                  // Check if bot explicitly signaled booking form or suggested booking/support
                  // Two ways forward, never a request to type contact details: the booking form, or a live agent.
                  if (hasActionBooking) {
                    renderBookingCard(text);
                    if (assistantBubble) renderSupportQuickButton(assistantBubble, text);
                  } else if (hasActionHuman && assistantBubble) {
                    renderAgentNotified(assistantBubble);
                  } else if (assistantBubble && config.bookingEnabled && isBookingIntent(cleanContent)) {
                    renderBookingQuickButton(assistantBubble, text);
                    renderSupportQuickButton(assistantBubble, text);
                  } else if (assistantBubble && isSupportSuggested(cleanContent)) {
                    renderSupportQuickButton(assistantBubble, text);
                  }
                  if (assistantBubble) {
                    scrollToStartOfMessage(assistantBubble);
                  }
                }

                isStreaming = false;
                sendBtn.disabled = false;
                chatInput.focus();
                return;
              }

              streamBuffer += decoder.decode(result.value, { stream: true });
              var lines = streamBuffer.split('\n');
              streamBuffer = lines.pop();

              for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.indexOf('data: ') === 0) {
                  try {
                    var data = JSON.parse(line.slice(6));
                    if (data.type === 'status') {
                      if (data.status === 'searching_web') {
                        if (typing) {
                          typing.innerHTML = `
                            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--primary-color, #2563eb);font-weight:600;padding:2px 4px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              </svg>
                              <span>${escapeHtml(data.message || 'Searching the web...')}</span>
                            </div>
                          `;
                          scrollToBottom();
                        }
                      } else if (data.status === 'web_results_found') {
                        if (typing) {
                          typing.innerHTML = `
                            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#059669;font-weight:600;padding:2px 4px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>Found web sources, writing response...</span>
                            </div>
                          `;
                          scrollToBottom();
                        }
                      }
                    } else if (data.type === 'citations') {
                      if (data.conversationId) conversationId = data.conversationId;
                      if (data.conversationToken) conversationToken = data.conversationToken;
                      persistSessionState();
                      if (conversationId) startLiveSync();
                      isCurrentWebSearch = Boolean(data.isWebSearch);
                      if (Array.isArray(data.citations)) {
                        currentCitations = data.citations;
                      }
                    } else if (data.type === 'takeover_active') {
                      if (data.conversationId) conversationId = data.conversationId;
                      if (data.conversationToken) conversationToken = data.conversationToken;
                      isTakeoverActive = true;
                      renderTakeoverBanner(data.agentName || 'Live Support Agent');
                      persistSessionState();
                      if (conversationId) startLiveSync();
                    } else if (data.type === 'escalation') {
                      if (data.conversationId) conversationId = data.conversationId;
                      if (data.conversationToken) conversationToken = data.conversationToken;
                      persistSessionState();
                      if (conversationId) startLiveSync();
                    } else if (data.type === 'token') {
                      // MOUNT BUBBLE ON FIRST TOKEN ONLY
                      if (!hasMountedBubble) {
                        if (typing.parentNode && messagesBody) {
                          messagesBody.removeChild(typing);
                        }
                        assistantBubble = document.createElement('div');
                        assistantBubble.className = 'message msg-assistant';
                        if (messagesBody) messagesBody.appendChild(assistantBubble);
                        hasMountedBubble = true;
                      }
                      streamedText += data.token;
                      var cleanStreamed = streamedText.replace(/\s*\[ACTION:[A-Z_]+\]/g, '').trim();
                      assistantBubble.innerHTML = formatMarkdown(cleanStreamed);
                      scrollToBottom();
                    } else if (data.type === 'error') {
                      throw new Error(data.error || 'Inference error');
                    } else if (data.type === 'done') {
                      if (data.conversationId) conversationId = data.conversationId;
                      if (data.conversationToken) conversationToken = data.conversationToken;
                      persistSessionState();
                      if (conversationId) startLiveSync();
                    }
                  } catch (e) {
                    if (e.message && (e.message.indexOf('Inference') !== -1 || e.message.indexOf('error') !== -1)) {
                      throw e;
                    }
                  }
                }
              }

              return readStream();
            });
          }

          return readStream();
        })
        .catch(function (err) {
          if (timeoutId) clearTimeout(timeoutId);
          console.error('[AI Assistant Widget] Chat error:', err);
          if (typing.parentNode && messagesBody) messagesBody.removeChild(typing);

          var errMsg = "I apologize, but I encountered a temporary connection issue. You can ask again, or connect directly with our support team:";
          var errBubble = appendMessage('assistant', errMsg);
          renderSupportQuickButton(errBubble, text);

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
