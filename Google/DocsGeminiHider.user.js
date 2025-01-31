// ==UserScript==
// @name         Google Docs "Try Gemini" Hider
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Hides "Try Gemini" trial icon
// @license      BSD-3-Clause
// @match        https://docs.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle('div#docs-sidekick-gen-ai-promo-button-container { display: none !important; }'); // Hides the "Try Gemini" trial icon
