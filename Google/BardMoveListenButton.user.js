// ==UserScript==
// @name         Bard - Move Listen Button
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Moves the Listen button down to the toolbar at the bottom of the response
// @match        https://bard.google.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bard.google.com
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

const LISTEN_BUTTON_SELECTOR = 'tts-control'
const TOOLBAR_SELECTOR = '.buttons-container-v2'
const RESPONSE_WINDOW_SELECTOR = '.response-container'
const BUTTON_CONTAINOR_SELECTOR = '.response-tts-container'

// Move the provided button element to the correct place within its parent chat window
function moveButton(listenButton) {
    let destination = listenButton.closest(RESPONSE_WINDOW_SELECTOR)?.querySelector(TOOLBAR_SELECTOR);

    destination.appendChild(listenButton);

    // Style updates needed to get the button correctly positioned relative to its parent:
    let buttonContainer = listenButton.querySelector(BUTTON_CONTAINOR_SELECTOR)
    buttonContainer.style.position = 'relative'
    buttonContainer.style.height = 'auto'
    buttonContainer.style.top = '0px'
}

function updatePage() {

    document.querySelectorAll(RESPONSE_WINDOW_SELECTOR).forEach(responseWindow => {
        let listenButton = responseWindow.querySelector(LISTEN_BUTTON_SELECTOR)
        if (! listenButton.parentElement.className.includes(TOOLBAR_SELECTOR.replace(".", ""))) {
            moveButton(listenButton)
        }
    })
}

setInterval(updatePage, 5000)
