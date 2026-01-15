// ==UserScript==
// @name         Amazon Neutral Protection Button
// @description  Remove the bright yellow background on button labeled "Add Protection" (extended warranty)
// @author       https://github.com/mkazin
// @homepage     https://github.com/mkazin/OhMonkey/tree/main/Amazon
// @version      0.1
// @license      BSD-3-Clause
// @namespace    http://tampermonkey.net/
// @match        https://www.amazon.com/*/dp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_addStyle
// ==/UserScript==

const EITHER_BUTTON_SELECTOR = "div.attach-warranty-button-row span.a-button"

GM_addStyle(`${EITHER_BUTTON_SELECTOR} { background-color: white; border-color: black; }`)
