// ==UserScript==
// @name         Amazon Subscribe & Save Total
// @description  Shows total estimated cost of upcoming for Amazon subscription items
// @author       https://github.com/mkazin
// @version      0.4
// @license      BSD-3-Clause
// @namespace    http://tampermonkey.net/
// @grant        none
// @match        https://www.amazon.com/gp/subscribe-and-save/manager/viewsubscriptions*
// @match        https://www.amazon.com/gp/subscribe-and-save/manage?*
// @match        https://www.amazon.com/auto-deliveries/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// ==/UserScript==

(function() {
    'use strict';

    const DELIVERY_ROW_SELECTOR = ".delivery-card-row"
    const DETAIL_COMLUMN_SELECTOR = ".delivery-information-container"

    document.querySelectorAll(DELIVERY_ROW_SELECTOR).forEach(deliveryRow => {
        const container = deliveryRow.querySelector(DETAIL_COMLUMN_SELECTOR);

    //a-size-base-plus a-color-price subscription-price a-text-bold
        const total = Array.from(deliveryRow.querySelectorAll(".subscription-price"))
            .map(el => Number(el.innerText.replace("$", "")))
            .reduce((acc, val) => acc + val)

        const div = document.createElement("div")
        div.innerText = `Total Cost: $${total.toFixed(2)}`

        container.appendChild(div)
    })

})();
