// ==UserScript==
// @name         Gmail Ad Remover
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Removes ads from Gmail. Shows total removed in the console log.
// @license      BSD-3-Clause
// @match        https://mail.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

const KEY_AD_COUNT = "ads-removed"
const SELECTOR_CURRENT_TAB = ".aRz.J-KU:has(.J-KU-KO)"

function removeAds() {
    let tab = document.querySelector(SELECTOR_CURRENT_TAB).innerText
    let adCount = GM_getValue(KEY_AD_COUNT, {})
    if (! adCount[tab]) adCount[tab] = 0;
    let total = Object.keys(adCount).reduce((acc, key) => acc + adCount[key] , 0)

    document.querySelectorAll("tr.zA.zE:has(.ast)").forEach(node => {
        let adText = node.innerText.split("\n")[0]
        console.log(`Removing ad: ${adText} . ${++adCount[tab]} ads removed from ${tab} tab and ${++total} in total!`)
        node.remove()
    })
    GM_setValue(KEY_AD_COUNT, adCount)
}

(function() {
    'use strict';
    setInterval(removeAds, 2000)
})();
