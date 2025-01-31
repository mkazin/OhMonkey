// ==UserScript==
// @name         America's Test Kitchen - Amazon Pricing
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Updates linked products to show price on Amazon (note: shows USA prices)
// @author       https://github.com/mkazin
// @match        https://www.americastestkitchen.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=americastestkitchen.com
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

const AFFILIATE_DIV_SELECTOR = 'div[data-testid="affiliate-link"]'
const ATK_PRICE_CLASS = "amazon-price"
const ATK_PRICE_SELECTOR = `span.${ATK_PRICE_CLASS}`
const AMZN_PRICE_SELECTOR = "span.a-price span.a-offscreen";

// NOTE: modified code from Amazon\AmazonVariationPricer.user.js,
// updated to use GM_xmlhttpRequest to avoid CORS error
async function populateWithPrice(productPriceElem, productUrl) {
    GM_xmlhttpRequest({
        method: "GET",
        url: productUrl,
        onload: response => {
            const amznDOM = new DOMParser().parseFromString(response.responseText, 'text/html');
            const amznPriceElem = amznDOM.querySelector(AMZN_PRICE_SELECTOR);
            productPriceElem.innerText = amznPriceElem?.innerText || "?";
            clearTimeout(timeoutId);
        },
        onerror: () => {
            productPriceElem.innerText = "Failed";
        }
    });
}

/**
 * Prepares a new price element with temporary text to indicate processing,
 * updating style of neighboring elements to match the site's design
 */
function createPriceElem(productAnchor) {
    const priceDiv = document.createElement("span");
    priceDiv.classList.add(ATK_PRICE_CLASS);
    priceDiv.innerText = "...";
    productAnchor.querySelector("a").append(priceDiv);

    priceDiv.style.marginRight = "6px";
    priceDiv.style.lineHeight = productAnchor.style.lineHeight;

    return priceDiv;
}

function displayPrice(productAnchor) {
    var priceDiv = createPriceElem(productAnchor);
    populateWithPrice(priceDiv, productAnchor.querySelector("a").href)
}

let timeoutId = setTimeout(() => {
    Array.from(document.querySelectorAll(AFFILIATE_DIV_SELECTOR))
        .filter(div => div.querySelector("a").href.includes("amazon"))
        .forEach(displayPrice)
}, 1000)

