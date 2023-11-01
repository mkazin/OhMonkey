// ==UserScript==
// @name         YouTube Hide Next Videos
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.1
// @description  Removes YouTube's algorithm suggestions. Also shades watched videos.
// @license      BSD-3-Clause
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

const SELECTORS = [
    // Next-video thumbnails shown when approaching end of playback
    "div.ytp-ce-element", 
    // "Video Wall" shown when video is over
    "div.ytp-endscreen-content",
    // "Related" panel
    "div#related",
]

GM_addStyle(`${SELECTORS.join(",")} { display:none; }`)

// Shades video thumbnails with a full progress bar
GM_addStyle(`div#thumbnail:has(div#progress[style="width: 100%;"]) { opacity: 20%; }`)