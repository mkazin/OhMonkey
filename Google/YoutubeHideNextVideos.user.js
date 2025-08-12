// ==UserScript==
// @name         YouTube Hide Next Videos
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.2
// @description  Removes YouTube's algorithm suggestions. And ads. Also darkens watched videos.
// @license      BSD-3-Clause
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==


const SELECTORS_TO_HIDE = [
    // Next-video thumbnails shown when approaching end of playback
    "div.ytp-ce-element", 
    // "Video Wall" shown when video is over
    "div.ytp-endscreen-content",
    // "Related" panel
    "div#related",
    // YouTube "Playables"
    // The part preceeding ~ in this selector can also get rid of both Playables and "Shorts".
    // Replace everything starting with ~ to get rid of both.
    "ytd-rich-section-renderer.style-scope.ytd-rich-grid-renderer:has(h2) ~ ytd-rich-section-renderer.style-scope.ytd-rich-grid-renderer:has(h2)",
]

GM_addStyle(`${SELECTORS_TO_HIDE.join(",")} { display:none; }`)

// Shade video thumbnails with a full progress bar (or nearly full)
GM_addStyle(`div#thumbnail:has(div#progress[style="width: 100%;"]) { opacity: 15%; }`)
GM_addStyle(`div#thumbnail:has(div#progress[style*="width: 9;"]) { opacity: 15%; }`)

const VIDEO_CARD_SELECTOR = "ytd-rich-item-renderer"
const SPONSORED_TEXT_SELECTOR = "ad-badge-view-model"
const SPONSORED_RENDER_SELECTOR = "ytd-ad-slot-renderer"
GM_addStyle(`${VIDEO_CARD_SELECTOR}:has(${SPONSORED_TEXT_SELECTOR}),${VIDEO_CARD_SELECTOR}:has(${SPONSORED_RENDER_SELECTOR}) { display: none;}`)
