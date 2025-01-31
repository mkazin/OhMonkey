// ==UserScript==
// @name         Google Question Suggestion Remover
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Removes the unhelpful sections in Google suggesting worse questions to ask
// @license      BSD-3-Clause
// @match        https://google.com/search?*
// @match        https://www.google.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @run-at       document-end
// @grant        GM_addStyle
// ==/UserScript==

function hideSelector(selector) {
    GM_addStyle(`${selector} { display: none !important; }`)
}
function run() {

    const HEADER_SELECTOR = 'div.d0fCJc.BOZ6hd'
    const QUESTION_SELECTOR = 'div[jsname="yEVEwb"]'
    const PEOPLE_ALSO_ASK_SELECTOR = 'div.MjjYud div.cUnQKe'
    const WHAT_PEOPLE_ARE_SAYING_SELECTOR = 'div.ULSxyf'
    const ALL_SELECTORS =
        [
            HEADER_SELECTOR
            , QUESTION_SELECTOR
            , PEOPLE_ALSO_ASK_SELECTOR
            , WHAT_PEOPLE_ARE_SAYING_SELECTOR
        ]

    ALL_SELECTORS.forEach(selector => hideSelector(selector))
}

run()
