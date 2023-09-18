// ==UserScript==
// @name         YouTube No Comment
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Hides comments to help you avoid engaging
// @license      BSD-3-Clause
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

const SELECTORS = [
    // "Add a comment" box
    "#comments #simple-box", 
    // "Reply" links
    "#comments div#reply-button-end",
    // Thumbs up/down and Reply links
    "#comments #action-buttons",
    // Entire comments section
    "#comments",
]

GM_addStyle(`${SELECTORS.join(",")} { display:none; }`)

