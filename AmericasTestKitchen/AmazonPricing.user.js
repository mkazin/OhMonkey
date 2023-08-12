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

const PRODUCT_URL_SELECTOR = "a.dropdown-module_affiliateDropdown__H040y"
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
            var amznDOM = new DOMParser().parseFromString(response.responseText, 'text/html');

            var amznPriceElem = amznDOM.querySelector(AMZN_PRICE_SELECTOR)
            productPriceElem.innerText = amznPriceElem.innerText

            // Once our first price is shown we should stop re-running the script
            clearInterval(interval)
        }
    })
}

/** 
 * Prepares a new price element with temporary text to indicate processing,
 * updating style of neighboring elements to match the site's design
 */
function createPriceElem(productAnchor) {
    var priceDiv = document.createElement("span")
    priceDiv.classList.add(ATK_PRICE_CLASS)
    priceDiv.innerText = "..."
    productAnchor.append(priceDiv)

    // Let's move the right margin from the "Buy at Amazon" element to
    // the price element and bring them close together
    let buyAtAmazonElem = productAnchor.querySelector("p")
    buyAtAmazonElem.style.marginRight = "6px"
    priceDiv.style.marginRight = buyAtAmazonElem.style.marginRight

    // Finally, properties we want to match to "Buy at Amazon" text
    priceDiv.style.lineHeight = buyAtAmazonElem.style.lineHeight

    return priceDiv
}

function displayPrice(productAnchor) {
    var priceDiv = createPriceElem(productAnchor);
    populateWithPrice(priceDiv, productAnchor.href)
}

let interval = setInterval( () => {
    Array.from(document.querySelectorAll(PRODUCT_URL_SELECTOR))
    .filter(anchor => ! anchor.querySelector(ATK_PRICE_SELECTOR))
    .forEach(displayPrice)
}, 1000)

