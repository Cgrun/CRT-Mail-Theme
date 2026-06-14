// ==UserScript==
// @name         J's Oracle CRT Theme for Outlook v9
// @namespace    js-oracle-crt-lite
// @version      0.4.3
// @description  Lightweight amber CRT theme for Outlook Web. Visual-only.
// @author       CrJia
// @match        https://outlook.cloud.microsoft/*
// @match        https://outlook.live.com/*
// @match        https://outlook.office.com/*
// @match        https://outlook.office365.com/*
// @match        https://mail.live.com/*
// @match        https://www.youtube.com/*
// @match        https://kcnd4kn8i6ap.feishu.cn/*
// @match        https://www.bilibili.com/*
// @match        https://www.google.com/*
// @match        https://scholar.google.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "js-oracle-crt-lite-style";
  const OVERLAY_ID = "js-oracle-crt-lite-overlay";
  const TOGGLE_ID = "js-oracle-crt-lite-toggle";
  const MENU_ID = "js-oracle-crt-lite-menu";
  const THEME_ACTION_ID = "js-oracle-crt-lite-theme-action";
  const FORCE_COLOR_ACTION_ID = "js-oracle-crt-lite-force-color-action";
  const FORCE_FONT_ACTION_ID = "js-oracle-crt-lite-force-font-action";
  const WARP_SVG_ID = "js-oracle-crt-lite-warp-svg";
  const WARP_FILTER_ID = "js-oracle-crt-lite-edge-warp";
  const STORAGE_KEY = "jsOracleCrtLiteEnabled";
  const FORCE_COLOR_STORAGE_KEY = "jsOracleCrtForceMessageColor";
  const FORCE_FONT_STORAGE_KEY = "jsOracleCrtForceMessageFont";
  const FORCE_COLOR_CLASS = "js-oracle-crt-force-message-color";
  const FORCE_FONT_CLASS = "js-oracle-crt-force-message-font";

  let suspendTimer = null;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      :root {
        --oracle-bg: #020100;
        --oracle-panel: rgba(7, 3, 0, 0.94);
        --oracle-panel-soft: rgba(14, 6, 0, 0.88);

        --oracle-amber: #c87524;
        --oracle-amber-bright: #d98a2d;
        --oracle-amber-hot: #efa33b;
        --oracle-text: #c87524;
        --oracle-text-dim: #7d4f1e;
        --oracle-border: rgba(200, 117, 36, 0.38);

        --oracle-font:
          "Glass TTY VT220",
          "VT323",
          "Terminus",
          "Terminess Nerd Font",
          "Px437 IBM VGA 8x16",
          "Perfect DOS VGA 437",
          "Cascadia Mono",
          "Consolas",
          "Courier New",
          monospace;

        --oracle-text-glow:
          0 0 2px rgba(216, 138, 45, 0.58),
          0 0 7px rgba(200, 117, 36, 0.34),
          0 0 14px rgba(120, 58, 6, 0.32);

        --oracle-scanline-alpha: 0.115;
        --oracle-scanline-dark: 0.13;
        --oracle-vignette-strength: 0.62;
      }

      html.js-oracle-crt-lite,
      html.js-oracle-crt-lite body {
        background:
          radial-gradient(
            ellipse at center,
            rgba(200, 117, 36, 0.035) 0%,
            rgba(5, 2, 0, 0.98) 58%,
            #000000 100%
          ) !important;
        color: var(--oracle-text) !important;
      }

      html.js-oracle-crt-lite body {
        font-family: var(--oracle-font) !important;
        font-variant-ligatures: none !important;
        font-feature-settings: "liga" 0, "calt" 0 !important;
        -webkit-font-smoothing: none !important;
        text-rendering: optimizeSpeed !important;
        text-shadow: var(--oracle-text-glow) !important;
      }

      html.js-oracle-crt-lite:not(.js-oracle-crt-lite-warp-suspended)
      body > *:not(#${OVERLAY_ID}):not(#${TOGGLE_ID}):not(#${MENU_ID}):not(#${WARP_SVG_ID}):not(script):not(style):not(link):not(meta) {
        filter: url(#${WARP_FILTER_ID});
      }

      html.js-oracle-crt-lite [role="banner"],
      html.js-oracle-crt-lite [role="toolbar"] {
        background:
          linear-gradient(
            180deg,
            rgba(216, 138, 45, 0.20),
            rgba(5, 2, 0, 0.96)
          ) !important;
        border-bottom: 1px solid var(--oracle-border) !important;
      }

      html.js-oracle-crt-lite [role="navigation"],
      html.js-oracle-crt-lite [role="main"],
      html.js-oracle-crt-lite [role="complementary"],
      html.js-oracle-crt-lite [role="tree"],
      html.js-oracle-crt-lite [role="grid"],
      html.js-oracle-crt-lite [role="listbox"] {
        background:
          linear-gradient(
            180deg,
            rgba(12, 5, 0, 0.96),
            rgba(2, 1, 0, 0.98)
          ) !important;
        color: var(--oracle-text) !important;
        border-color: var(--oracle-border) !important;
        box-shadow:
          inset 0 0 0 1px rgba(200, 117, 36, 0.08),
          inset 0 0 22px rgba(0, 0, 0, 0.42) !important;
      }

      html.js-oracle-crt-lite [role="row"],
      html.js-oracle-crt-lite [role="option"],
      html.js-oracle-crt-lite [role="listitem"] {
        background: rgba(5, 2, 0, 0.74) !important;
        color: var(--oracle-text) !important;
        border-bottom: 1px solid rgba(200, 117, 36, 0.12) !important;
      }

      html.js-oracle-crt-lite [role="row"]:hover,
      html.js-oracle-crt-lite [role="option"]:hover,
      html.js-oracle-crt-lite [role="listitem"]:hover {
        background: rgba(200, 117, 36, 0.15) !important;
        box-shadow: inset 0 0 0 1px rgba(216, 138, 45, 0.18) !important;
      }

      html.js-oracle-crt-lite [aria-selected="true"] {
        background:
          linear-gradient(
            90deg,
            rgba(216, 138, 45, 0.34),
            rgba(200, 117, 36, 0.09)
          ) !important;
      }

      html.js-oracle-crt-lite input,
      html.js-oracle-crt-lite textarea,
      html.js-oracle-crt-lite [contenteditable="true"] {
        background: rgba(3, 1, 0, 0.96) !important;
        color: #d98a2d !important;
        border: 1px solid var(--oracle-border) !important;
        caret-color: var(--oracle-amber-hot) !important;
        text-shadow: var(--oracle-text-glow) !important;
      }

      html.js-oracle-crt-lite button,
      html.js-oracle-crt-lite [role="button"] {
        color: var(--oracle-text) !important;
        font-family: var(--oracle-font) !important;
      }

      html.js-oracle-crt-lite a,
      html.js-oracle-crt-lite span,
      html.js-oracle-crt-lite div,
      html.js-oracle-crt-lite label {
        color: inherit;
      }

      html.js-oracle-crt-lite.${FORCE_COLOR_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ),
      html.js-oracle-crt-lite.${FORCE_COLOR_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ) :where(*:not(svg):not(path):not(img):not(video):not(canvas)) {
        color: var(--oracle-text) !important;
        text-shadow: var(--oracle-text-glow) !important;
      }

      html.js-oracle-crt-lite.${FORCE_COLOR_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ) :where(a, [role="link"]) {
        color: var(--oracle-amber-hot) !important;
        text-decoration: underline !important;
        text-decoration-color: rgba(239, 163, 59, 0.72) !important;
        text-underline-offset: 2px !important;
      }

      html.js-oracle-crt-lite.${FORCE_COLOR_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ) :where(mark, [style*="background" i]) {
        background-color: rgba(92, 40, 0, 0.42) !important;
        color: var(--oracle-amber-hot) !important;
      }

      html.js-oracle-crt-lite.${FORCE_FONT_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ),
      html.js-oracle-crt-lite.${FORCE_FONT_CLASS} :where(
        [role="document"],
        [aria-label*="message body" i],
        [aria-label*="邮件正文" i],
        [aria-label*="正文" i],
        [contenteditable="true"]
      ) :where(*:not(svg):not(path):not(img):not(video):not(canvas)) {
        font-family: var(--oracle-font) !important;
        font-variant-ligatures: none !important;
        font-feature-settings: "liga" 0, "calt" 0 !important;
      }

      #${OVERLAY_ID} {
        pointer-events: none !important;
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        border-radius: 30px;
        overflow: hidden;
        background:
          repeating-linear-gradient(
            to bottom,
            rgba(216, 138, 45, var(--oracle-scanline-alpha)) 0px,
            rgba(216, 138, 45, var(--oracle-scanline-alpha)) 1px,
            rgba(0, 0, 0, var(--oracle-scanline-dark)) 2px,
            rgba(0, 0, 0, var(--oracle-scanline-dark)) 4px
          ),
          repeating-linear-gradient(
            to right,
            rgba(200, 117, 36, 0.026) 0px,
            rgba(200, 117, 36, 0.026) 1px,
            transparent 1px,
            transparent 3px
          ),
          radial-gradient(
            ellipse at center,
            transparent 38%,
            rgba(0, 0, 0, 0.22) 72%,
            rgba(0, 0, 0, var(--oracle-vignette-strength)) 100%
          );
        box-shadow:
          inset 0 0 0 1px rgba(216, 138, 45, 0.18),
          inset 20px 0 64px rgba(216, 138, 45, 0.06),
          inset -20px 0 64px rgba(216, 138, 45, 0.06),
          inset 0 0 120px rgba(0, 0, 0, 0.44),
          inset 0 0 240px rgba(0, 0, 0, 0.62);
      }

      #${OVERLAY_ID}::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(
            ellipse at 50% -18%,
            rgba(239, 163, 59, 0.16),
            transparent 30%
          ),
          linear-gradient(
            105deg,
            transparent 0 8%,
            rgba(239, 163, 59, 0.045) 12%,
            transparent 24%
          );
        mix-blend-mode: screen;
      }

      #${OVERLAY_ID}::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: -64px;
        height: 54px;
        pointer-events: none;
        background:
          linear-gradient(
            180deg,
            transparent,
            rgba(239, 163, 59, 0.10) 28%,
            rgba(216, 138, 45, 0.20) 50%,
            rgba(200, 117, 36, 0.08) 72%,
            transparent
          );
        mix-blend-mode: screen;
        animation: oracle-crt-sweep 8s linear infinite;
      }

      @keyframes oracle-crt-sweep {
        0% { transform: translateY(-80px); opacity: 0; }
        15% { opacity: 0.28; }
        70% { opacity: 0.15; }
        100% { transform: translateY(calc(100vh + 120px)); opacity: 0; }
      }

      #${TOGGLE_ID} {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        border: 1px solid rgba(216, 138, 45, 0.52);
        background: rgba(3, 1, 0, 0.94);
        color: #d98a2d;
        font-family: var(--oracle-font);
        font-size: 12px;
        letter-spacing: 0.08em;
        padding: 7px 10px;
        border-radius: 2px;
        cursor: pointer;
        text-shadow: var(--oracle-text-glow);
      }

      #${TOGGLE_ID}:hover {
        background: rgba(200, 117, 36, 0.18);
      }

      #${MENU_ID} {
        position: fixed;
        right: 16px;
        bottom: 50px;
        z-index: 2147483647;
        display: grid;
        gap: 6px;
        min-width: 210px;
        padding: 8px;
        border: 1px solid rgba(216, 138, 45, 0.42);
        border-radius: 2px;
        background: rgba(3, 1, 0, 0.96);
        box-shadow:
          0 10px 28px rgba(0, 0, 0, 0.58),
          0 0 18px rgba(200, 117, 36, 0.16);
      }

      #${MENU_ID}[hidden] {
        display: none !important;
      }

      #${MENU_ID} button {
        width: 100%;
        border: 1px solid rgba(216, 138, 45, 0.36);
        border-radius: 2px;
        background: rgba(12, 5, 0, 0.96);
        color: #d98a2d !important;
        font-family: var(--oracle-font);
        font-size: 12px;
        letter-spacing: 0.05em;
        padding: 8px 10px;
        cursor: pointer;
        text-align: left;
        text-shadow: var(--oracle-text-glow);
      }

      #${MENU_ID} button:hover {
        background: rgba(200, 117, 36, 0.18);
      }
    `;

    document.head.appendChild(style);
  }

  function createWarpMapDataUrl() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const image = ctx.createImageData(size, size);
    const data = image.data;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const nx = (x / (size - 1)) * 2 - 1;
        const ny = (y / (size - 1)) * 2 - 1;

        const r = Math.sqrt(nx * nx + ny * ny);
        const edge = Math.max(0, Math.min(1, (r - 0.46) / 0.54));
        const eased = edge * edge * (3 - 2 * edge);
        const cornerBoost = Math.abs(nx * ny);
        const strength = eased * (0.45 + cornerBoost * 0.95);

        const index = (y * size + x) * 4;

        data[index] = Math.max(0, Math.min(255, 128 + Math.sign(nx) * strength * 112));
        data[index + 1] = Math.max(0, Math.min(255, 128 + Math.sign(ny) * strength * 112));
        data[index + 2] = 128;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function addWarpFilter() {
    if (!document.body) return;
    if (document.getElementById(WARP_SVG_ID)) return;

    const mapUrl = createWarpMapDataUrl();
    if (!mapUrl) return;

    const svgNs = "http://www.w3.org/2000/svg";
    const xlinkNs = "http://www.w3.org/1999/xlink";

    const svg = document.createElementNS(svgNs, "svg");
    svg.id = WARP_SVG_ID;
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";

    const filter = document.createElementNS(svgNs, "filter");
    filter.id = WARP_FILTER_ID;
    filter.setAttribute("x", "-4%");
    filter.setAttribute("y", "-4%");
    filter.setAttribute("width", "108%");
    filter.setAttribute("height", "108%");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    const image = document.createElementNS(svgNs, "feImage");
    image.setAttribute("result", "oracleWarpMap");
    image.setAttribute("x", "0");
    image.setAttribute("y", "0");
    image.setAttribute("width", "100%");
    image.setAttribute("height", "100%");
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("href", mapUrl);
    image.setAttributeNS(xlinkNs, "href", mapUrl);

    const displace = document.createElementNS(svgNs, "feDisplacementMap");
    displace.setAttribute("in", "SourceGraphic");
    displace.setAttribute("in2", "oracleWarpMap");
    displace.setAttribute("scale", "13");
    displace.setAttribute("xChannelSelector", "R");
    displace.setAttribute("yChannelSelector", "G");

    filter.appendChild(image);
    filter.appendChild(displace);
    svg.appendChild(filter);
    document.body.appendChild(svg);
  }

  function isVisibleLargeLayer(el) {
    const style = window.getComputedStyle(el);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }

    const rect = el.getBoundingClientRect();
    return rect.width >= 280 && rect.height >= 180;
  }

  function hasVisiblePdfOrDialogLayer() {
    const selectors = [
      '[role="dialog"]',
      '[aria-modal="true"]',
      'iframe[src*=".pdf" i]',
      'iframe[title*="pdf" i]',
      'embed[type="application/pdf"]',
      'object[type="application/pdf"]',
      '[aria-label*="pdf" i]',
      '[data-automationid*="pdf" i]',
      '[data-testid*="pdf" i]',
      '[class*="pdf" i]'
    ];

    for (const selector of selectors) {
      let nodes = [];

      try {
        nodes = Array.from(document.querySelectorAll(selector));
      } catch (_) {
        continue;
      }

      if (nodes.some(isVisibleLargeLayer)) {
        return true;
      }
    }

    return false;
  }

  function isOutlookOptionsUrl() {
    const path = window.location.pathname.replace(/\/+$/, "");
    return path === "/mail/options" || path.startsWith("/mail/options/");
  }

  function updateWarpSuspension() {
    const enabled = document.documentElement.classList.contains("js-oracle-crt-lite");
    const shouldSuspend = enabled && (
      isOutlookOptionsUrl() ||
      hasVisiblePdfOrDialogLayer()
    );

    document.documentElement.classList.toggle(
      "js-oracle-crt-lite-warp-suspended",
      shouldSuspend
    );
  }

  function scheduleWarpCheck() {
    window.clearTimeout(suspendTimer);
    suspendTimer = window.setTimeout(updateWarpSuspension, 80);
  }

  function watchUrlChanges() {
    const notify = () => window.setTimeout(scheduleWarpCheck, 0);
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      notify();
      return result;
    };

    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      notify();
      return result;
    };

    window.addEventListener("popstate", notify);
    window.addEventListener("hashchange", notify);
  }

  function addOverlay() {
    if (!document.body) return;
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }

  function readForceColorState() {
    return localStorage.getItem(FORCE_COLOR_STORAGE_KEY) === "true";
  }

  function setForceColorState(value) {
    localStorage.setItem(FORCE_COLOR_STORAGE_KEY, value ? "true" : "false");
    applyForceColorState();
    updateToggleText();
  }

  function applyForceColorState() {
    const themeOn = document.documentElement.classList.contains("js-oracle-crt-lite");
    const forceOn = readForceColorState();

    document.documentElement.classList.toggle(
      FORCE_COLOR_CLASS,
      themeOn && forceOn
    );
  }

  function readForceFontState() {
    return localStorage.getItem(FORCE_FONT_STORAGE_KEY) === "true";
  }

  function setForceFontState(value) {
    localStorage.setItem(FORCE_FONT_STORAGE_KEY, value ? "true" : "false");
    applyForceFontState();
    updateToggleText();
  }

  function applyForceFontState() {
    const themeOn = document.documentElement.classList.contains("js-oracle-crt-lite");
    const fontOn = readForceFontState();

    document.documentElement.classList.toggle(
      FORCE_FONT_CLASS,
      themeOn && fontOn
    );
  }

  function addToggleButton() {
    if (!document.body) return;
    if (document.getElementById(TOGGLE_ID)) return;

    const btn = document.createElement("button");
    btn.id = TOGGLE_ID;
    btn.type = "button";

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    document.body.appendChild(btn);
    updateToggleText();
  }

  function addToggleMenu() {
    if (!document.body) return;
    if (document.getElementById(MENU_ID)) return;

    const menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.hidden = true;

    const themeBtn = document.createElement("button");
    themeBtn.id = THEME_ACTION_ID;
    themeBtn.type = "button";
    themeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOn = document.documentElement.classList.contains("js-oracle-crt-lite");
      setEnabled(!isOn);
    });

    const forceBtn = document.createElement("button");
    forceBtn.id = FORCE_COLOR_ACTION_ID;
    forceBtn.type = "button";
    forceBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setForceColorState(!readForceColorState());
    });

    const fontBtn = document.createElement("button");
    fontBtn.id = FORCE_FONT_ACTION_ID;
    fontBtn.type = "button";
    fontBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setForceFontState(!readForceFontState());
    });

    menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    menu.appendChild(themeBtn);
    menu.appendChild(forceBtn);
    menu.appendChild(fontBtn);
    document.body.appendChild(menu);

    updateToggleText();
  }

  function toggleMenu() {
    const menu = document.getElementById(MENU_ID);
    if (!menu) return;

    menu.hidden = !menu.hidden;
    updateToggleText();
  }

  function closeMenu() {
    const menu = document.getElementById(MENU_ID);
    if (menu) menu.hidden = true;
  }

  function updateToggleText() {
    const btn = document.getElementById(TOGGLE_ID);
    const themeBtn = document.getElementById(THEME_ACTION_ID);
    const forceBtn = document.getElementById(FORCE_COLOR_ACTION_ID);
    const fontBtn = document.getElementById(FORCE_FONT_ACTION_ID);

    const isOn = document.documentElement.classList.contains("js-oracle-crt-lite");

    if (btn) {
      btn.textContent = isOn ? "ORACLE CRT: ON" : "ORACLE CRT: OFF";
    }

    if (themeBtn) {
      themeBtn.textContent = isOn ? "THEME: TURN OFF" : "THEME: TURN ON";
    }

    if (forceBtn) {
      forceBtn.textContent = readForceColorState() ? "MESSAGE COLOR: ON" : "MESSAGE COLOR: OFF";
    }

    if (fontBtn) {
      fontBtn.textContent = readForceFontState() ? "MESSAGE FONT: ON" : "MESSAGE FONT: OFF";
    }
  }

  function setEnabled(value) {
    localStorage.setItem(STORAGE_KEY, value ? "true" : "false");

    if (value) {
      document.documentElement.classList.add("js-oracle-crt-lite");
      injectStyle();
      addWarpFilter();
      addOverlay();
      scheduleWarpCheck();
    } else {
      document.documentElement.classList.remove("js-oracle-crt-lite");
      document.documentElement.classList.remove("js-oracle-crt-lite-warp-suspended");
      removeOverlay();
    }

    applyForceColorState();
    applyForceFontState();
    updateToggleText();
  }

  function init() {
    injectStyle();
    addToggleButton();
    addToggleMenu();

    const saved = localStorage.getItem(STORAGE_KEY);
    const enabled = saved === null ? true : saved !== "false";

    setEnabled(enabled);

    const observer = new MutationObserver(scheduleWarpCheck);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "aria-hidden", "hidden"]
    });

    window.addEventListener("resize", scheduleWarpCheck);
    window.addEventListener("focus", scheduleWarpCheck);
    watchUrlChanges();

    document.addEventListener("click", (event) => {
      const menu = document.getElementById(MENU_ID);
      const toggle = document.getElementById(TOGGLE_ID);

      if (!menu || !toggle) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;

      closeMenu();
    });

    console.log("[J's Oracle CRT Lite] Theme loaded:", location.href);
  }

  function waitForBody() {
    if (document.body) {
      init();
      return;
    }

    setTimeout(waitForBody, 100);
  }

  waitForBody();
})();
