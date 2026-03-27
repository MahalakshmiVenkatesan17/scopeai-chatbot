(function () {
  "use strict";

  if (window.AIChatbotWidget) {
    return;
  }

  const DEFAULT_CONFIG = {
    getApiUrl() {
      const hostname = window.location.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("localhost")
      ) {
        return "http://localhost:3001/api/v1";
      }
      return "https://api-scopeaichat.scopethinkers.ai/api/v1";
    },
    tenant: null,
    primaryColor: "#007bff",
    secondaryColor: "#10B981",
    chatbotName: "AI Assistant",
    welcomeMessage: "Hello! How can I help you today?",
    placeholderText: "Type a message...",
    widgetPosition: "bottom-right", // bottom-right | bottom-left | top-right | top-left
    widgetSize: "medium", // small | medium | large
    autoOpen: false,
    showAgentAvatar: true,
    collectUserInfo: false,
    requireEmail: false,
    enableFileUpload: false,
    maxMessageLength: 2000,
    textColor: "#333333",
    backgroundColor: "#ffffff",
    chatbotAvatar: null,
    customCss: null,
    useAPI: true,
  };

  class AIChatbotWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.config.apiUrl = this.config.apiUrl || DEFAULT_CONFIG.getApiUrl();
      this.conversationId = null;
      this.sessionToken = null;
      this.isOpen = false;
      this.hasInitialized = false;
      this.userInfo = null;

      if (!this.config.tenant) {
        console.error("[Widget] Tenant is required");
        return;
      }

      this.init();
    }

    async init() {
      if (this.config.useAPI) {
        await this.fetchTenantConfig();
      }

      this.createContainer();
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();

      // Add page unload handler to end session
      window.addEventListener("beforeunload", () => {
        if (this.sessionToken) {
          // Use synchronous-ish fetch or keepalive for unload
          const url = `${this.config.apiUrl}/public/chat/session/${this.sessionToken}/end`;
          fetch(url, { method: "POST", keepalive: true }).catch(() => { });
        }
      });

      // Auto-open if configured
      if (this.config.autoOpen) {
        setTimeout(() => this.openChat(), 800);
      }
    }

    async fetchTenantConfig() {
      try {
        const url = `${this.config.apiUrl}/public/chat/config/${this.config.tenant}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.config) {
            const c = data.data.config;
            // Map every API field into this.config
            this.config.primaryColor =
              c.primaryColor || this.config.primaryColor;
            this.config.secondaryColor =
              c.secondaryColor || this.config.secondaryColor;
            this.config.textColor = c.textColor || this.config.textColor;
            this.config.backgroundColor =
              c.backgroundColor || this.config.backgroundColor;
            this.config.chatbotName = c.chatbotName || this.config.chatbotName;
            this.config.welcomeMessage =
              c.welcomeMessage || this.config.welcomeMessage;
            this.config.placeholderText =
              c.placeholderText || this.config.placeholderText;
            this.config.widgetPosition =
              c.widgetPosition || this.config.widgetPosition;
            this.config.widgetSize = c.widgetSize || this.config.widgetSize;
            this.config.autoOpen = c.autoOpen === 1 || c.autoOpen === true;
            this.config.showAgentAvatar =
              c.showAgentAvatar === 1 || c.showAgentAvatar === true;
            this.config.collectUserInfo =
              c.collectUserInfo === 1 || c.collectUserInfo === true;
            this.config.requireEmail =
              c.requireEmail === 1 || c.requireEmail === true;
            this.config.enableFileUpload =
              c.enableFileUpload === 1 || c.enableFileUpload === true;
            this.config.maxMessageLength =
              c.maxMessageLength || this.config.maxMessageLength;
            this.config.chatbotAvatar = c.chatbotAvatar || null;
            this.config.customCss = c.customCss || null;
          }
        } else {
          console.warn("[Widget] Could not fetch config, using defaults");
        }
      } catch (error) {
        console.warn(
          "[Widget] Config fetch failed, using defaults:",
          error.message,
        );
      }
    }

    /* ─────────────────────────── POSITION HELPER ─────────────────────────── */
    getPositionStyle() {
      switch (this.config.widgetPosition) {
        case "bottom-left":
          return "bottom:20px;left:20px;right:auto;";
        case "top-right":
          return "top:20px;right:20px;bottom:auto;";
        case "top-left":
          return "top:20px;left:20px;bottom:auto;right:auto;";
        case "bottom-right":
        default:
          return "bottom:20px;right:20px;";
      }
    }

    getWindowPositionStyle() {
      // Chat window opens opposite to toggle button to avoid clipping
      switch (this.config.widgetPosition) {
        case "bottom-left":
          return "bottom:0;left:0;right:auto;";
        case "top-right":
          return "top:0;right:0;bottom:auto;";
        case "top-left":
          return "top:0;left:0;bottom:auto;right:auto;";
        case "bottom-right":
        default:
          return "bottom:0;right:0;";
      }
    }

    getWidgetDimensions() {
      switch (this.config.widgetSize) {
        case "small":
          return { width: "320px", height: "420px" };
        case "large":
          return { width: "440px", height: "680px" };
        case "medium":
        default:
          return { width: "400px", height: "580px" };
      }
    }

    /* ──────────────────────────── DOM SETUP ──────────────────────────────── */
    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "aicw-widget-container-v1";
      this.container.style.cssText = `position:fixed!important;${this.getPositionStyle()}z-index:999999!important;font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;`;
      document.body.appendChild(this.container);
    }

    injectStyles() {
      const p = this.config.primaryColor;
      const pDark = this.adjustColor(p, -20);
      const pMid = this.adjustColor(p, -15);
      const dims = this.getWidgetDimensions();

      // Inject custom CSS from tenant if any
      if (this.config.customCss) {
        const customStyle = document.createElement("style");
        customStyle.textContent = this.config.customCss;
        document.head.appendChild(customStyle);
      }

      const style = document.createElement("style");
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        #aicw-toggle-btn-v1 {
          width:60px!important;height:60px!important;border-radius:50%!important;
          background:linear-gradient(135deg,${p} 0%,${pDark} 100%)!important;
          border:none!important;cursor:pointer!important;
          box-shadow:0 4px 12px rgba(0,0,0,0.15)!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          transition:all .3s ease!important;position:relative!important;overflow:hidden!important;
        }
        #aicw-toggle-btn-v1:hover{transform:scale(1.1)!important;box-shadow:0 6px 20px rgba(0,0,0,0.25)!important;}
        .aicw-pulse-ring{
          position:absolute;inset:0;border-radius:50%;
          animation:aicw-pulse-v1 2s infinite;
          background:${p}60;
        }
        @keyframes aicw-pulse-v1{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.3);opacity:0}100%{transform:scale(1.3);opacity:0}}

        #aicw-window-v1{
          display:none!important;
          position:absolute!important;
          z-index:1 !important;
          ${this.getWindowPositionStyle()}
          width:${dims.width}!important;
          height:${dims.height}!important;
          max-height:90vh!important;
          min-height:350px!important;
          background:${this.config.backgroundColor}!important;
          border-radius:16px!important;
          box-shadow:0 10px 40px rgba(0,0,0,0.3)!important;
          flex-direction:column!important;overflow:hidden!important;
        }
        #aicw-window-v1.aicw-open-v1{display:flex!important;animation:aicw-slideUp-v1 .3s ease!important;}
        @keyframes aicw-slideUp-v1{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

        /* ── Header ── */
        .aicw-header-v1{
          background:linear-gradient(135deg,${p} 0%,${pDark} 100%)!important;
          color:white!important;padding:14px 18px!important;
          display:flex!important;justify-content:space-between!important;align-items:center!important;
          font-weight:600!important;font-size:15px!important;flex-shrink:0!important;
          position:relative!important;overflow:hidden!important;
        }
        .aicw-header-dot-pattern{
          position:absolute;inset:0;opacity:.08;pointer-events:none;
          background-image:radial-gradient(circle at 1px 1px,white 1px,transparent 0);
          background-size:18px 18px;
        }
        .aicw-header-left{display:flex!important;align-items:center!important;gap:10px!important;position:relative;z-index:1;}
        .aicw-avatar-wrap{position:relative;}
        .aicw-avatar-v1{
          width:36px!important;height:36px!important;border-radius:50%!important;
          background:rgba(255,255,255,0.2)!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          font-weight:700!important;font-size:13px!important;color:white!important;
          border:2px solid rgba(255,255,255,0.35)!important;backdrop-filter:blur(4px)!important;
          flex-shrink:0!important;overflow:hidden!important;
        }
        .aicw-online-dot{
          position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;
          border-radius:50%;background:#4ade80;border:2px solid white;
        }
        .aicw-name-v1{font-size:14px!important;font-weight:600!important;line-height:1.2!important;}
        .aicw-status-v1{font-size:11px!important;opacity:.85!important;display:flex!important;align-items:center!important;gap:4px!important;}

        .aicw-header-actions{display:flex!important;gap:4px!important;position:relative;z-index:1;}
        .aicw-icon-btn-v1{
          width:30px!important;height:30px!important;border-radius:50%!important;
          background:transparent!important;border:none!important;color:white!important;
          cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;
          transition:background .2s!important;font-size:18px!important;line-height:1!important;
        }
        .aicw-icon-btn-v1:hover{background:rgba(255,255,255,0.2)!important;}

        /* ── Messages ── */
        .aicw-messages-v1{
          flex:1!important;padding:12px 14px!important;overflow-y:auto!important;
          background:#f8f9fa!important;display:flex!important;flex-direction:column!important;
          gap:4px!important;
        }
        .aicw-messages-v1::-webkit-scrollbar{width:4px!important;}
        .aicw-messages-v1::-webkit-scrollbar-thumb{background:#cbd5e0!important;border-radius:8px!important;}

        /* ── Bubbles ── */
        .aicw-message-v1{
          max-width:85%!important;word-wrap:break-word!important;
          animation:aicw-fadeIn-v1 .3s ease-out!important;
          font-size:13px!important;line-height:1.45!important;
          white-space:pre-wrap!important;position:relative!important;
          font-family:'Inter',sans-serif!important;
        }
        @keyframes aicw-fadeIn-v1{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        .aicw-message-row-v1{display:flex!important;align-items:flex-end!important;gap:8px!important;margin:2px 0!important;}
        .aicw-message-row-v1.aicw-user-row-v1{flex-direction:row-reverse!important;}
        .aicw-msg-avatar-v1{
          width:28px!important;height:28px!important;border-radius:50%!important;
          background:${p}!important;color:white!important;font-size:11px!important;font-weight:700!important;
          display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;
          overflow:hidden!important;
        }

        .aicw-message-v1.aicw-bot-v1{
          background:white!important;align-self:flex-start!important;
          box-shadow:0 1px 2px rgba(0,0,0,0.08)!important;color:#2d3748!important;
          border:1px solid rgba(226,232,240,0.8)!important;
          border-radius:10px 10px 10px 4px!important;padding:8px 12px!important;
        }
        .aicw-message-v1.aicw-user-v1{
          background:linear-gradient(135deg,${p} 0%,${pMid} 100%)!important;
          color:white!important;align-self:flex-end!important;margin-left:auto!important;
          padding:8px 12px!important;box-shadow:0 1px 3px ${p}40!important;
          border-radius:10px 10px 4px 10px!important;
        }

        /* ── Formatted content ── */
        .aicw-message-v1.aicw-bot-v1 p{margin:0 0 6px 0!important;color:#374151!important;line-height:1.5!important;font-size:13px!important;}
        .aicw-message-v1.aicw-bot-v1 p:last-child{margin-bottom:0!important;}
        .aicw-message-v1.aicw-bot-v1 h3.aicw-main-heading{
          margin:10px 0 6px 0!important;font-size:13.5px!important;font-weight:700!important;
          color:${p}!important;border-left:4px solid ${p}!important;padding-left:10px!important;
        }
        .aicw-message-v1.aicw-bot-v1 h4.aicw-subheading{
          margin:8px 0 5px 0!important;font-size:13px!important;font-weight:600!important;color:#374151!important;
          border-bottom:2px solid ${p}40!important;padding-bottom:2px!important;
        }
        .aicw-message-v1.aicw-bot-v1 .aicw-bullet-list{margin:6px 0 8px 0!important;padding-left:0!important;list-style:none!important;}
        .aicw-message-v1.aicw-bot-v1 .aicw-bullet-list li{
          margin:4px 0!important;font-size:13px!important;padding-left:20px!important;
          position:relative!important;color:#4a5568!important;line-height:1.45!important;
        }
        .aicw-message-v1.aicw-bot-v1 .aicw-bullet-list li::before{
          content:"•"!important;color:${p}!important;font-size:16px!important;font-weight:bold!important;
          position:absolute!important;left:6px!important;top:-2px!important;
        }
        .aicw-message-v1.aicw-bot-v1 .aicw-numbered-list{margin:6px 0 8px 0!important;padding-left:20px!important;}
        .aicw-message-v1.aicw-bot-v1 .aicw-numbered-list li{margin:4px 0!important;font-size:13px!important;color:#4a5568!important;}
        .aicw-message-v1.aicw-bot-v1 .aicw-bullet-bold{
          font-weight:700!important;color:#1a202c!important;background:${p}10!important;
          padding:1px 5px!important;border-radius:4px!important;
          border:1px solid ${p}20!important;margin-right:4px!important;display:inline-block!important;
        }
        .aicw-message-v1.aicw-bot-v1 a{color:${p}!important;text-decoration:none!important;border-bottom:1px solid ${p}40!important;}
        .aicw-message-v1.aicw-bot-v1 code.aicw-inline-code{
          background:#f7fafc!important;padding:1px 4px!important;border-radius:4px!important;
          font-size:11.5px!important;color:#d53f8c!important;border:1px solid #e2e8f0!important;
        }
        .aicw-message-v1.aicw-bot-v1 .aicw-code-block{
          background:#1a202c!important;border-radius:6px!important;padding:10px!important;
          margin:8px 0!important;overflow-x:auto!important;
        }
        .aicw-message-v1.aicw-bot-v1 .aicw-code-block code{
          color:#e2e8f0!important;font-size:12px!important;white-space:pre!important;
          background:transparent!important;border:none!important;padding:0!important;display:block!important;
        }
        .aicw-message-v1.aicw-bot-v1 blockquote.aicw-quote{
          border-left:4px solid ${p}80!important;padding:6px 10px!important;margin:6px 0!important;
          background:${p}08!important;border-radius:0 4px 4px 0!important;
          font-style:italic!important;color:#4a5568!important;
        }
        .aicw-message-v1.aicw-bot-v1 hr.aicw-divider{border:none!important;height:1px!important;background:linear-gradient(to right,transparent,${p}40,transparent)!important;margin:10px 0!important;}
        .aicw-message-v1.aicw-bot-v1 .aicw-address-block{
          background:#f8fafc!important;border-left:3px solid ${p}!important;padding:6px 10px!important;
          margin:6px 0!important;border-radius:0 4px 4px 0!important;font-size:12.5px!important;color:#4a5568!important;
        }

        /* ── User Info Form ── */
        .aicw-userform-v1{
          flex:1!important;padding:20px!important;display:flex!important;flex-direction:column!important;
          overflow-y:auto!important;background:#f8f9fa!important;
        }
        .aicw-userform-title-v1{font-size:15px!important;font-weight:700!important;color:#1a202c!important;margin:0 0 4px 0!important;}
        .aicw-userform-sub-v1{font-size:12px!important;color:#6b7280!important;margin:0 0 16px 0!important;}
        .aicw-field-v1{margin-bottom:12px!important;}
        .aicw-field-v1 label{display:block!important;font-size:12px!important;font-weight:600!important;color:#374151!important;margin-bottom:5px!important;}
        .aicw-field-v1 input{
          width:100%!important;padding:9px 12px!important;border:2px solid #e5e7eb!important;
          border-radius:10px!important;font-size:13px!important;font-family:'Inter',sans-serif!important;
          outline:none!important;transition:border-color .2s!important;box-sizing:border-box!important;
          background:white!important;
        }
        .aicw-field-v1 input:focus{border-color:${p}!important;}
        .aicw-field-error-v1{font-size:11px!important;color:#ef4444!important;margin-top:4px!important;}
        .aicw-form-actions-v1{display:flex!important;gap:8px!important;margin-top:16px!important;}
        .aicw-form-submit-v1{
          width:100%;padding:10px!important;border-radius:10px!important;
          background:linear-gradient(135deg,${p},${pDark})!important;
          color:white!important;border:none!important;font-weight:600!important;font-size:13px!important;
          cursor:pointer!important;transition:opacity .2s,transform .2s!important;
        }
        .aicw-form-submit-v1:hover{opacity:.9!important;transform:scale(1.02)!important;}
        .aicw-form-skip-v1{
          padding:10px 14px!important;border-radius:10px!important;
          background:#f3f4f6!important;color:#6b7280!important;border:none!important;
          font-size:12px!important;cursor:pointer!important;transition:background .2s!important;flex: 1;font-weight: 600;
        }
        .aicw-form-skip-v1:hover{background:#e5e7eb!important;}
        .aicw-form-privacy-v1{font-size:11px!important;color:#9ca3af!important;text-align:center!important;margin-top:12px!important;}

        /* ── Input bar ── */
        .aicw-input-container-v1{
          padding:10px 12px!important;background:white!important;
          border-top:1px solid #e9ecef!important;display:flex!important;gap:8px!important;
          align-items:center!important;min-height:58px!important;box-sizing:border-box!important;flex-shrink:0!important;
        }
        .aicw-input-v1{
          flex:1!important;padding:8px 12px!important;border:2px solid #dee2e6!important;
          border-radius:20px!important;outline:none!important;font-size:13px!important;
          transition:border-color .2s!important;font-family:'Inter',sans-serif!important;
          background:${this.config.backgroundColor}!important;color:${this.config.textColor}!important;
        }
        .aicw-input-v1:focus{border-color:${p}!important;}
        .aicw-send-btn-v1{
          width:38px!important;height:38px!important;border-radius:50%!important;
          background:linear-gradient(135deg,${p},${pDark})!important;
          border:none!important;color:white!important;cursor:pointer!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          transition:opacity .2s,transform .2s!important;flex-shrink:0!important;
        }
        .aicw-send-btn-v1:hover:not(:disabled){opacity:.9!important;transform:scale(1.05)!important;}
        .aicw-send-btn-v1:disabled{opacity:.5!important;cursor:not-allowed!important;}

        /* ── Typing indicator ── */
        .aicw-typing-v1{
          display:flex!important;gap:3px!important;padding:7px 11px!important;
          align-self:flex-start!important;background:white!important;
          border-radius:10px 10px 10px 4px!important;box-shadow:0 1px 2px rgba(0,0,0,0.08)!important;
          border:1px solid rgba(226,232,240,0.8)!important;margin:2px 0!important;
        }
        .aicw-typing-v1 span{
          width:5px!important;height:5px!important;border-radius:50%!important;
          background:${p}!important;animation:aicw-typing-anim-v1 1.4s infinite ease-in-out!important;opacity:.6!important;
        }
        .aicw-typing-v1 span:nth-child(2){animation-delay:.2s!important;}
        .aicw-typing-v1 span:nth-child(3){animation-delay:.4s!important;}
        @keyframes aicw-typing-anim-v1{0%,60%,100%{transform:translateY(0);opacity:.6}30%{transform:translateY(-5px);opacity:1}}

        /* ── Branding ── */
        .aicw-branding-v1{
          padding:6px 12px!important;background:#f8f9fa!important;border-top:1px solid #e9ecef!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          font-size:11px!important;color:#6c757d!important;min-height:36px!important;box-sizing:border-box!important;flex-shrink:0!important;
        }
        .aicw-branding-link-v1{color:#6c757d!important;text-decoration:none!important;display:flex!important;align-items:center!important;gap:5px!important;}
        .aicw-branding-link-v1:hover{color:${p}!important;}
        .aicw-branding-logo-v1{width:14px!important;height:14px!important;}

        /* ── Error ── */
        .aicw-error-v1{
          background:#fee!important;color:#c53030!important;padding:6px 10px!important;
          border-radius:6px!important;font-size:12px!important;align-self:flex-start!important;
          border:1px solid #feb2b2!important;max-width:85%!important;margin:2px 0!important;
        }

        /* ── Loading ── */
        .aicw-loading-v1{
          flex:1!important;display:flex!important;align-items:center!important;justify-content:center!important;
          flex-direction:column!important;gap:12px!important;background:#f8f9fa!important;
        }
        .aicw-spinner-v1{
          width:40px;height:40px;border-radius:50%;
          border:3px solid #e5e7eb;border-top-color:${p};
          animation:aicw-spin 1s linear infinite;
        }
        @keyframes aicw-spin{to{transform:rotate(360deg)}}

        /* ── Notification badge ── */
        .aicw-notif-badge-v1{
          position:absolute!important;top:-4px!important;right:-4px!important;
          width:16px!important;height:16px!important;border-radius:50%!important;
          background:#ef4444!important;border:2px solid white!important;
          animation:aicw-bounce-v1 1s infinite!important;
        }
        @keyframes aicw-bounce-v1{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

        /* ── Responsive ── */
        @media(max-width:768px){
          #aicw-window-v1{width:90vw!important;max-width:400px!important;height:70vh!important;}
        }
        @media(max-width:480px){
          #aicw-window-v1{width:calc(100vw - 20px)!important;height:78vh!important;max-height:90vh!important;}
        }
      `;
      document.head.appendChild(style);
    }

    createWidget() {
      const avatarHtml = this.config.showAgentAvatar
        ? `<div class="aicw-avatar-wrap">
             <div class="aicw-avatar-v1">
               ${this.config.chatbotAvatar ? `<img src="${this.config.chatbotAvatar}" style="width:100%;height:100%;object-fit:cover;overflow:hidden;" />` : "AI"}
             </div>
           </div>`
        : "";

      this.container.innerHTML = `
        <div id="aicw-window-v1">
          <!-- Header -->
          <div class="aicw-header-v1">
            <div class="aicw-header-dot-pattern"></div>
            <div class="aicw-header-left">
              ${avatarHtml}
              <div>
                <div class="aicw-name-v1">${this.config.chatbotName}</div>
                <div class="aicw-status-v1">
                  <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;"></span>
                  Online
                </div>
              </div>
            </div>
            <div class="aicw-header-actions">
              <button class="aicw-icon-btn-v1 aicw-minimize-btn-v1" title="Minimize">–</button>
              <button class="aicw-icon-btn-v1 aicw-close-btn-v1" title="Close">×</button>
            </div>
          </div>

          <!-- Body: filled dynamically -->
          <div id="aicw-body-v1" style="flex:1;display:flex;flex-direction:column;overflow:hidden;"></div>

          <!-- Branding -->
          <div class="aicw-branding-v1">
            <a href="https://scopethinkers.ai" target="_blank" rel="noopener noreferrer" class="aicw-branding-link-v1">
              <span>Powered by</span>
              <img src="https://frontend-scopeaichat.scopethinkers.ai/favicon.svg" alt="ScopeThinkers" class="aicw-branding-logo-v1"/>
              <span style="font-weight:600;">scopeaichat.ai</span>
            </a>
          </div>
        </div>

        <!-- Toggle Button -->
        <button id="aicw-toggle-btn-v1">
          <div class="aicw-pulse-ring"></div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      `;

      this.renderBody();
    }

    /* ──────────────────────── BODY RENDERING ─────────────────────────────── */
    renderBody() {
      const body = this.container.querySelector("#aicw-body-v1");
      if (!body) return;

      if (!this.hasInitialized && this.config.collectUserInfo) {
        body.innerHTML = this.buildUserInfoForm();
      } else if (!this.hasInitialized) {
        // Don't start session automatically if minimized
        if (this.isOpen) {
          body.innerHTML = this.buildLoadingState();
          this.startSession();
        } else {
          body.innerHTML = ""; // Placeholder until opened
        }
      } else {
        body.innerHTML = this.buildChatInterface();
        this.renderMessages();
        // Re-attach input listener
        this.attachInputListeners();
      }
    }

    buildLoadingState() {
      return `
        <div class="aicw-loading-v1">
          <div class="aicw-spinner-v1"></div>
          <div style="font-size:13px;color:#6b7280;font-weight:500;">Connecting…</div>
        </div>`;
    }

    buildUserInfoForm() {
      const required = this.config.requireEmail;
      return `
        <div class="aicw-userform-v1" id="aicw-userform-inner-v1">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${this.config.primaryColor},${this.adjustColor(this.config.primaryColor, -20)});
                        color:white;font-weight:700;font-size:18px;display:inline-flex;align-items:center;justify-content:center;
                        box-shadow:0 6px 20px ${this.config.primaryColor}30;margin-bottom:10px;overflow:hidden;">
              ${this.config.chatbotAvatar ? `<img src="${this.config.chatbotAvatar}" style="width:100%;height:100%;object-fit:cover;" />` : "AI"}
            </div>
            <p class="aicw-userform-title-v1">Welcome to ${this.config.chatbotName}!</p>
            <p class="aicw-userform-sub-v1">${required ? "✨ Please share your details to get started" : "🎯 Tell us a bit about you (optional)"}</p>
          </div>

          <div class="aicw-field-v1">
            <label for="aicw-name-v1">👤 Your Name</label>
            <input type="text" id="aicw-name-v1" value="${this.tempFormData?.name || ""}" placeholder="What should we call you?" />
          </div>

          <div class="aicw-field-v1">
            <label for="aicw-email-v1">📧 Email Address ${required ? '<span style="color:#ef4444">*</span>' : ""}</label>
            <input type="email" id="aicw-email-v1" value="${this.tempFormData?.email || ""}" placeholder="your@email.com" ${required ? "required" : ""} />
            <div class="aicw-field-error-v1" id="aicw-email-error-v1" style="display:none;"></div>
          </div>

          <div class="aicw-form-actions-v1">
            <button class="aicw-form-submit-v1" id="aicw-form-submit-v1">🚀 Start Chatting</button>
            ${!required ? '<button class="aicw-form-skip-v1" id="aicw-form-skip-v1">Skip</button>' : ""}
          </div>
          <div class="aicw-form-privacy-v1">🔒 Your info is secure and never shared</div>
        </div>`;
    }

    buildChatInterface() {
      return `
        <div class="aicw-messages-v1" id="aicw-messages-v1"></div>
        <div class="aicw-input-container-v1">
          <input type="text" class="aicw-input-v1" id="aicw-input-v1"
                 placeholder="${this.config.placeholderText}"
                 maxlength="${this.config.maxMessageLength}" />
          <button class="aicw-send-btn-v1" id="aicw-send-btn-v1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>`;
    }

    renderMessages() {
      const msgDiv = this.container.querySelector("#aicw-messages-v1");
      if (!msgDiv) return;
      msgDiv.innerHTML = "";

      // Welcome message
      if (
        this.config.welcomeMessage &&
        this.messages &&
        this.messages.length === 0
      ) {
        this.appendBotBubble(this.config.welcomeMessage);
      }

      if (this.messages) {
        this.messages.forEach((m) => {
          if (m.role === "user") this.appendUserBubble(m.content, false);
          else this.appendBotBubble(m.content, false);
        });
      }
    }

    /* ─────────────────────────── SESSION ─────────────────────────────────── */
    async startSession(visitorInfo = {}) {
      try {
        const sessionUrl = `${this.config.apiUrl}/public/chat/session`;
        const payload = {
          tenantSlug: this.config.tenant,
          visitorId: this.generateVisitorId(),
          visitorInfo: {
            name: visitorInfo.name || "",
            email: visitorInfo.email || "",
            metadata: {},
          },
          pageUrl: window.location.href,
          referrerUrl: document.referrer || "",
        };

        const response = await fetch(sessionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Session error: ${response.status}`);

        const data = await response.json();
        this.sessionToken = data.data.sessionToken;
        this.messages = [];
        this.hasInitialized = true;

        // Switch to chat UI
        const body = this.container.querySelector("#aicw-body-v1");
        if (body) {
          body.innerHTML = this.buildChatInterface();
          this.attachInputListeners();
          this.appendBotBubble(this.config.welcomeMessage);
        }
      } catch (error) {
        console.error("[Widget] Session failed:", error);
        const body = this.container.querySelector("#aicw-body-v1");
        if (body) {
          body.innerHTML = `<div style="padding:20px;text-align:center;color:#ef4444;font-size:13px;">
            ⚠️ Could not connect. Please try again later.</div>`;
        }
      }
    }

    generateVisitorId() {
      let id = localStorage.getItem("aicw_visitor_id");
      if (!id) {
        id = "visitor_" + Math.random().toString(36).substr(2, 12);
        try {
          localStorage.setItem("aicw_visitor_id", id);
        } catch (e) { }
      }
      return id;
    }

    /* ──────────────────────── EVENT LISTENERS ────────────────────────────── */
    attachEventListeners() {
      const toggleBtn = this.container.querySelector("#aicw-toggle-btn-v1");
      const closeBtn = this.container.querySelector(".aicw-close-btn-v1");
      const minBtn = this.container.querySelector(".aicw-minimize-btn-v1");

      toggleBtn.addEventListener("click", () => this.openChat());

      // ✕ Close: ends the API session and fully resets state
      closeBtn.addEventListener("click", () => this.closeChat());

      // — Minimize: just hides the window, session remains alive
      minBtn.addEventListener("click", () => {
        // ✅ Save form data
        const name = this.container.querySelector("#aicw-name-v1")?.value || "";
        const email =
          this.container.querySelector("#aicw-email-v1")?.value || "";

        this.tempFormData = { name, email };

        const win = this.container.querySelector("#aicw-window-v1");
        win.classList.remove("aicw-open-v1");
        this.isOpen = false;
      });

      // Delegate form events (form is rendered later)
      this.container.addEventListener("click", (e) => {
        if (e.target.id === "aicw-form-submit-v1") this.handleFormSubmit();
        if (e.target.id === "aicw-form-skip-v1") this.handleFormSkip();
      });
    }

    attachInputListeners() {
      const sendBtn = this.container.querySelector("#aicw-send-btn-v1");
      const input = this.container.querySelector("#aicw-input-v1");
      if (!sendBtn || !input) return;

      sendBtn.addEventListener("click", () => this.sendMessage());
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendMessage();
      });
      input.focus();
    }

    /* ──────────────────────── CHAT OPEN / CLOSE ──────────────────────────── */
    openChat() {
      const win = this.container.querySelector("#aicw-window-v1");
      win.classList.add("aicw-open-v1");
      this.isOpen = true;

      // Remove notification badge if present
      const badge = this.container.querySelector(".aicw-notif-badge-v1");
      if (badge) badge.remove();

      // If not yet initialized (first open OR after a close+reset), set up the body
      if (!this.hasInitialized) {
        const body = this.container.querySelector("#aicw-body-v1");
        if (!body) return;

        if (this.config.collectUserInfo) {
          // Show user info form — startSession() is triggered on form submit
          body.innerHTML = this.buildUserInfoForm();
        } else {
          // No form needed — start session immediately
          body.innerHTML = this.buildLoadingState();
          this.startSession();
        }
      }
      // If minimized (session still alive), just re-show — nothing to rebuild
    }

    async closeChat() {
      // Call end session API if a session is active
      if (this.sessionToken) {
        await this.endSession();
      }

      const win = this.container.querySelector("#aicw-window-v1");
      win.classList.remove("aicw-open-v1");
      this.isOpen = false;

      // Reset state so next open starts a fresh session
      this.sessionToken = null;
      this.conversationId = null;
      this.hasInitialized = false;
      this.userInfo = null;
      this.messages = [];
      this.tempFormData = null;

      // Reset body back to initial state (form or loading-on-demand)
      const body = this.container.querySelector("#aicw-body-v1");
      if (body) {
        if (this.config.collectUserInfo) {
          body.innerHTML = this.buildUserInfoForm();
        } else {
          // Empty — will show loading spinner on next open
          body.innerHTML = "";
        }
      }
    }

    async endSession() {
      try {
        const url = `${this.config.apiUrl}/public/chat/session/${this.sessionToken}/end`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          console.warn(
            "[Widget] End session returned non-OK status:",
            response.status,
          );
          return;
        }

        const data = await response.json();
        if (data.success) {
          console.log("[Widget] Session ended:", data.data.message);
        }
      } catch (error) {
        // Non-blocking — we still close the chat even if this call fails
        console.warn("[Widget] End session call failed:", error.message);
      }
    }

    /* ──────────────────────── USER INFO FORM ─────────────────────────────── */
    handleFormSubmit() {
      const nameInput = this.container.querySelector("#aicw-name-v1");
      const emailInput = this.container.querySelector("#aicw-email-v1");
      const emailError = this.container.querySelector("#aicw-email-error-v1");
      const email = emailInput ? emailInput.value.trim() : "";
      const name = nameInput ? nameInput.value.trim() : "";

      // Validate
      if (this.config.requireEmail && !email) {
        emailError.textContent = "⚠️ Email is required";
        emailError.style.display = "block";
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "⚠️ Please enter a valid email address";
        emailError.style.display = "block";
        return;
      }

      const visitorInfo = {};
      if (name) visitorInfo.name = name;
      if (email) visitorInfo.email = email;

      this.userInfo = visitorInfo;

      // Show loading then start session
      const body = this.container.querySelector("#aicw-body-v1");
      if (body) body.innerHTML = this.buildLoadingState();
      this.startSession(visitorInfo);
    }

    handleFormSkip() {
      const body = this.container.querySelector("#aicw-body-v1");
      if (body) body.innerHTML = this.buildLoadingState();
      this.startSession();
    }

    /* ──────────────────────── MESSAGING ──────────────────────────────────── */
    async sendMessage() {
      const input = this.container.querySelector("#aicw-input-v1");
      const sendBtn = this.container.querySelector("#aicw-send-btn-v1");
      const msgDiv = this.container.querySelector("#aicw-messages-v1");
      const message = input ? input.value.trim() : "";

      if (!message || !this.sessionToken) return;

      sendBtn.disabled = true;
      input.disabled = true;
      input.value = "";

      this.appendUserBubble(message);

      // Typing indicator
      const typing = document.createElement("div");
      typing.className = "aicw-message-row-v1";
      typing.id = "aicw-typing-container-v1";
      
      const typingAvatar = this.config.showAgentAvatar
        ? `<div class="aicw-msg-avatar-v1" style="transform:translateY(10px)">
             ${this.config.chatbotAvatar ? `<img src="${this.config.chatbotAvatar}" style="width:100%;height:100%;object-fit:cover;" />` : "AI"}
           </div>`
        : "";
        
      typing.innerHTML = `${typingAvatar}<div class="aicw-typing-v1"><span></span><span></span><span></span></div>`;
      msgDiv.appendChild(typing);
      msgDiv.scrollTop = msgDiv.scrollHeight;

      try {
        const responseText = await this.sendToAPI(message);
        typing.remove();
        this.appendBotBubble(responseText);
      } catch (error) {
        typing.remove();
        const err = document.createElement("div");
        err.className = "aicw-error-v1";
        err.textContent = "Sorry, something went wrong. Please try again.";
        msgDiv.appendChild(err);
      } finally {
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
        msgDiv.scrollTop = msgDiv.scrollHeight;
      }
    }

    appendUserBubble(text, scroll = true) {
      const msgDiv = this.container.querySelector("#aicw-messages-v1");
      if (!msgDiv) return;
      const row = document.createElement("div");
      row.className = "aicw-message-row-v1 aicw-user-row-v1";
      row.innerHTML = `<div class="aicw-message-v1 aicw-user-v1">${this.escapeHtml(text)}</div>`;
      msgDiv.appendChild(row);
      if (scroll) msgDiv.scrollTop = msgDiv.scrollHeight;
    }

    appendBotBubble(text, scroll = true) {
      const msgDiv = this.container.querySelector("#aicw-messages-v1");
      if (!msgDiv) return;

      const avatarHtml = this.config.showAgentAvatar
        ? `<div class="aicw-msg-avatar-v1">
             ${this.config.chatbotAvatar ? `<img src="${this.config.chatbotAvatar}" style="width:100%;height:100%;object-fit:cover;" />` : "AI"}
           </div>`
        : "";

      const row = document.createElement("div");
      row.className = "aicw-message-row-v1";
      row.innerHTML = `${avatarHtml}<div class="aicw-message-v1 aicw-bot-v1">${this.formatMessage(text)}</div>`;
      msgDiv.appendChild(row);
      if (scroll) msgDiv.scrollTop = msgDiv.scrollHeight;
    }

    async sendToAPI(message) {
      const url = `${this.config.apiUrl}/public/chat/session/${this.sessionToken}/message`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, visitorInfo: this.userInfo || {} }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error?.message || "API request failed");
      if (data.data.conversationId)
        this.conversationId = data.data.conversationId;
      return data.data.assistantMessage.content || "No response from server";
    }

    /* ──────────────────────── UTILITIES ──────────────────────────────────── */
    escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    adjustColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = ((num >> 8) & 0x00ff) + amt;
      const B = (num & 0x0000ff) + amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    }

    /* ─────────────────── MESSAGE FORMATTER (unchanged logic) ─────────────── */
    formatMessage(text) {
      const lines = text.split("\n");
      const processedLines = [];
      let currentListItems = [],
        currentOrderedItems = [];
      let lastLineType = "";
      let isCollectingAddress = false,
        addressLines = [];
      let isCodeBlock = false,
        codeBlockContent = [];
      let isQuote = false,
        quoteContent = [];

      const isAddressContent = (line) => {
        const patterns = [
          /^\d+[/-]\d+/,
          /^(Suite|Floor|Room|Unit|Building|Apt)\.?\s+\w+/i,
          /^(No\.?|Number)\s+\d+/i,
          /^[A-Z][a-z]+,\s+[A-Z][a-z]+/,
          /^\d+\s+[A-Z][a-z]+\s+(Road|Street|Avenue|Boulevard|Lane|Drive|Way)/i,
          /^(P\.?O\.?\s+)?Box\s+\d+/i,
          /^[A-Z]{2}\s+\d+/,
          /^\d{5,6}/,
        ];
        const hasIndicators =
          (line.includes(",") && line.match(/[A-Z]/)) ||
          ["Road", "Street", "Avenue", "Floor", "Suite", "Unit"].some((w) =>
            line.includes(w),
          ) ||
          line.match(/^\s*[A-Z][a-z]+,\s+[A-Z]/) ||
          (line.match(/^\s*\d/) && line.length < 60);
        return patterns.some((p) => p.test(line)) || hasIndicators;
      };
      const flushAddressLines = () => {
        if (addressLines.length) {
          processedLines.push(
            '<div class="aicw-address-block">' +
            addressLines.join("<br>") +
            "</div>",
          );
          addressLines = [];
          isCollectingAddress = false;
          lastLineType = "address";
        }
      };
      const flushBulletList = () => {
        if (currentListItems.length) {
          processedLines.push(
            '<ul class="aicw-bullet-list">' +
            currentListItems.join("") +
            "</ul>",
          );
          currentListItems = [];
        }
      };
      const flushOrderedList = () => {
        if (currentOrderedItems.length) {
          processedLines.push(
            '<ol class="aicw-numbered-list">' +
            currentOrderedItems.join("") +
            "</ol>",
          );
          currentOrderedItems = [];
        }
      };
      const flushCodeBlock = () => {
        if (codeBlockContent.length) {
          processedLines.push(
            '<div class="aicw-code-block"><pre><code>' +
            codeBlockContent.join("\n") +
            "</code></pre></div>",
          );
          codeBlockContent = [];
          isCodeBlock = false;
        }
      };
      const flushQuoteBlock = () => {
        if (quoteContent.length) {
          processedLines.push(
            '<blockquote class="aicw-quote">' +
            quoteContent.join("<br>") +
            "</blockquote>",
          );
          quoteContent = [];
          isQuote = false;
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line.length) {
          if (
            !isCollectingAddress &&
            !isCodeBlock &&
            !isQuote &&
            lastLineType &&
            lastLineType !== "empty"
          ) {
            processedLines.push("<br>");
            lastLineType = "empty";
          }
          continue;
        }
        if (line === "```") {
          isCodeBlock
            ? flushCodeBlock()
            : (flushBulletList(),
              flushOrderedList(),
              flushAddressLines(),
              flushQuoteBlock(),
              (isCodeBlock = true));
          continue;
        }
        if (line.startsWith("> ")) {
          flushBulletList();
          flushOrderedList();
          flushAddressLines();
          flushCodeBlock();
          isQuote = true;
          quoteContent.push(line.substring(2));
          lastLineType = "quote";
          continue;
        }
        if (isCodeBlock) {
          codeBlockContent.push(line);
          continue;
        }
        if (isQuote) {
          flushQuoteBlock();
        }
        const looksAddr = isAddressContent(line);
        if (looksAddr && !isCollectingAddress) {
          flushBulletList();
          flushOrderedList();
          flushCodeBlock();
          isCollectingAddress = true;
        }
        if (isCollectingAddress) {
          if (looksAddr) {
            addressLines.push(line);
            continue;
          } else {
            flushAddressLines();
          }
        }
        const isNum = line.match(/^(\d+)[\.\)]\s+(.+)/);
        const isBoldBullet = line.match(/^-\s+\*\*(.+?)\*\*(?:\s|$)/);
        const isBullet = line.match(/^-\s+(.+)/) && !isBoldBullet;
        const isMainHeading =
          line.match(/^[A-Z][^:\n]+:$/) &&
          line.length < 60 &&
          !line.includes("(") &&
          !line.match(/phone|email|website|address|sales|contact|fax/i);
        const isContactHeading = line.match(
          /^(Contact|Email|Website|Phone|Mobile|Tel|Fax|Address|Location):?$/i,
        );
        if (isNum && lastLineType !== "numbered") flushBulletList();
        else if ((isBullet || isBoldBullet) && lastLineType !== "bullet")
          flushOrderedList();
        if (isNum) {
          const c = isNum[2].replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          currentOrderedItems.push("<li>" + c + "</li>");
          lastLineType = "numbered";
        } else if (isMainHeading || isContactHeading) {
          flushBulletList();
          flushOrderedList();
          flushAddressLines();
          processedLines.push(
            '<h3 class="aicw-main-heading">' + line.replace(/:$/, "") + "</h3>",
          );
          lastLineType = "main-heading";
        } else if (isBoldBullet) {
          const bold = line.replace(/^-\s+\*\*(.+?)\*\*\s*/, "$1");
          const rest = line
            .replace(/^-\s+\*\*(.+?)\*\*\s*/, "")
            .replace(/\*\*/g, "");
          currentListItems.push(
            '<li><span class="aicw-bullet-bold">' +
            bold +
            ":</span>" +
            (rest.trim() ? " " + rest.trim() : "") +
            "</li>",
          );
          lastLineType = "bullet";
        } else if (isBullet) {
          let bc = line
            .replace(/^-\s+/, "")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/`(.+?)`/g, '<code class="aicw-inline-code">$1</code>');
          if (bc.match(/^[A-Za-z\s]+:/) && !bc.includes("<strong>")) {
            const parts = bc.split(":");
            if (parts[0].length < 30)
              bc =
                '<span class="aicw-bullet-bold">' +
                parts[0].trim() +
                ":</span> " +
                parts.slice(1).join(":").trim();
          }
          currentListItems.push("<li>" + bc + "</li>");
          lastLineType = "bullet";
        } else {
          flushBulletList();
          flushOrderedList();
          flushAddressLines();
          let fl = line
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/`(.+?)`/g, '<code class="aicw-inline-code">$1</code>');
          if (
            line.match(/^[A-Z][A-Za-z\s]+$/) &&
            line.length < 50 &&
            !line.includes(".") &&
            !line.includes(",")
          ) {
            processedLines.push('<h4 class="aicw-subheading">' + fl + "</h4>");
            lastLineType = "sub-heading";
          } else if (line.endsWith(":") && line.length < 100) {
            processedLines.push('<h4 class="aicw-subheading">' + fl + "</h4>");
            lastLineType = "sub-heading";
          } else if (line.match(/^[-=_*]{3,}$/)) {
            processedLines.push('<hr class="aicw-divider">');
            lastLineType = "divider";
          } else {
            processedLines.push("<p>" + fl + "</p>");
            lastLineType = "paragraph";
          }
        }
      }
      flushAddressLines();
      flushBulletList();
      flushOrderedList();
      flushCodeBlock();
      flushQuoteBlock();
      let result = processedLines.join("");
      result = result
        .replace(/(<br>\s*){2,}/g, "<br>")
        .replace(/<\/p>\s*<br>\s*<p>/g, "</p><p>")
        .replace(/<\/(h3|h4|ul|ol|blockquote|div)>\s*<br>/g, "</$1>")
        .replace(/<p><\/p>/g, "");
      return result;
    }
  }

  /* ───────────────────────── BOOTSTRAP ───────────────────────────────────── */
  function init() {
    if (!window.AIChatbotConfig) {
      console.error("[Widget] AIChatbotConfig not found");
      return;
    }
    const instance = new AIChatbotWidget(window.AIChatbotConfig);
    window.AIChatbotWidget = { instance };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.initializeChatbotFromForm = async function (formData) {
    if (!window.AIChatbotWidget?.instance) {
      console.error("[Widget] Chatbot instance not found");
      return;
    }
    await window.AIChatbotWidget.instance.startSession(formData);
  };
})();
