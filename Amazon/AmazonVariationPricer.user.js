// ==UserScript==
// @name         Amazon Variation Pricer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.com/*
// @match        https://www.amazon.ca/*
// @match        https://www.amazon.in/*
// @match        https://www.amazon.co.uk/*
// @match        https://www.amazon.de/*
// @match        https://www.amazon.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// ==/UserScript==

const LOG = 0
const WARN = 1
function log(warn, text) {
    if (! LOG) return;
    if (warn) {
        console.warn("Amazon Variation Pricer: " + text)
    } else {
        console.log("Amazon Variation Pricer: " + text)
    }
}

async function populateWithPrice(element, variationUrl) {

    fetch(variationUrl).then(function (response) {
        return response.text();
    }).then(function (html) {

        // Build document object from the HTML response
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var price = doc.querySelector("span.a-price span.a-offscreen")
        element.innerText = price.innerText

    }).catch(function (err) {
        log(WARN, 'Failed to fetch and scrape URL = ' + variationUrl, err);
    });
}

(function() {
    'use strict';

    for(const variationListItem of document.querySelectorAll("li.swatchAvailable span.a-list-item")) {

        // Amazon will sometime list prices in the "Twister". Abort if we find such an element.
        if (variationListItem.querySelector("p.twisterSwatchPrice") != null) {
            log(LOG, "Aborting. Pricing information found: " + variationListItem.querySelector("p.twisterSwatchPrice").innerText)
            return
        }

        // Prepare new price text element
        var priceDiv = document.createElement("span")
        priceDiv.classList.add("a-price-whole")
        priceDiv.innerText = "..."
        variationListItem.prepend(priceDiv)

        // Grab the ASIN (Amazon identifier) of the variation and build its URL
        var ASIN = variationListItem.parentElement.getAttribute("data-defaultasin")
        var variationUrl = document.URL.substr(0, document.URL.search('/dp/')) + "/dp/" + ASIN

        // Trigger our asynchronous fetch&populate function
        populateWithPrice(priceDiv, variationUrl)
    }
})();


function ApplyPriceToImageBoxes() {
    console.log("Checking for variation boxes");
    for(const variationPriceSpan of document.querySelectorAll("#tp-inline-twister-dim-values-container #_price")) {
        console.log(variationPriceSpan.innerText)
        variationPriceSpan.before(variationPriceSpan.innerText)
        /*
        let container = variationPriceSpan.closest("li")
        let priceTag = document.createElement("p")
        priceTag.innerText = variationPriceSpan.innerText
        */
    }
}
setTimeout(ApplyPriceToImageBoxes, 3000)

