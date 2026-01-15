// ==UserScript==
// @name         Google Question Suggestion Remover
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Removes the unhelpful sections in Google suggesting worse questions to ask
// @license      BSD-3-Clause
// @match        https://google.com/search*
// @match        https://www.google.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

const HEADER_SELECTOR = 'div.d0fCJc.BOZ6hd'
const QUESTION_SELECTOR = 'div[jsname="yEVEwb"]'
// Note- the parent part of the selector here is common to other sections
const PEOPLE_ALSO_ASK_SELECTOR = 'div.xfX4Ac.JI5uCe.qB9BY.yWNJXb :has(div.cUnQKe)'
//const WHAT_PEOPLE_ARE_SAYING_SELECTOR = 'div.ULSxyf' // This breaks regular search results, check if :has() is a possibile solution
const LEARN_MORE_LABEL_SELECTOR = 'div.ZKfmAf'
const LEARN_MORE_BOX_SELECTOR = 'div.kLMmLc'
const AI_OVERVIEW_IMAGE_SELECTOR = 'div.oLJ4Uc.l3foLb'
//const PEOPLE_ALSO_SEARCH_FOR_SELECTOR = 'div.ULSxyf'   // This breaks regular search results (and is same as above selector)

const SELECTORS_TO_HIDE = [
      HEADER_SELECTOR
    , QUESTION_SELECTOR
    , PEOPLE_ALSO_ASK_SELECTOR
    // , WHAT_PEOPLE_ARE_SAYING_SELECTOR
    , LEARN_MORE_LABEL_SELECTOR
    , LEARN_MORE_BOX_SELECTOR
    , AI_OVERVIEW_IMAGE_SELECTOR
    // , PEOPLE_ALSO_SEARCH_FOR_SELECTOR
]
GM_addStyle(`${SELECTORS_TO_HIDE.join(', ')} { display: none !important; }`)

// Allow AI Overview to take up full width now that the "Learn More" section is hidden
const AI_OVERVIEW_CONTAINER_SELECTOR = "div.UxeQfc"
const AI_OVERVIEW_SELECTOR = "div.LT6XE"
GM_addStyle(AI_OVERVIEW_CONTAINER_SELECTOR + ' { grid-template-columns: unset; }')
GM_addStyle(AI_OVERVIEW_SELECTOR + ' { max-width: unset; }')
