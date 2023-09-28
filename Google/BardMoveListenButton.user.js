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



// NOTES:
// On cloning rather than moving the element:
// We're talking about a standard click eventlistener
// 1) Its callback function can be found here:
//   document.querySelector(".tts-button").eventListeners()[4]
// 2) Cloning a node can be done using .cloneNode()
// 3) Given an existing node, we can add an event listener to is and use the callback we found above
//
// This worked in the console and the content actually played:
// let mine = document.createElement("mine")
// mine.addEventListener('click', document.querySelector(".tts-button").eventListeners()[4])
// mine.click()
// 
// The following also works, so we could add a whole new toolbar with buttons to play each response:
//  document.querySelectorAll(".tts-button")[0].eventListeners()[4]()
//  document.querySelectorAll(".tts-button")[1].eventListeners()[4]()
//  document.querySelectorAll(".tts-button")[2].eventListeners()[4]()
//  document.querySelectorAll(".tts-button")[3].eventListeners()[4]()


const LISTEN_BUTTON_SELECTOR = 'tts-control'
const TOOLBAR_SELECTOR = '.buttons-container-v2'
const RESPONSE_WINDOW_SELECTOR = '.response-container'
const BUTTON_CONTAINOR_SELECTOR = '.response-tts-container'

// Move the provided button element to the correct place within its parent chat window
function moveButton(listenButton) {
    let destination = listenButton.closest(RESPONSE_WINDOW_SELECTOR)?.querySelector(TOOLBAR_SELECTOR);
    console.log(`BLB:    destination: ${destination.nodeName}#${destination.className.replaceAll(' ', '#')}`)
    destination.appendChild(listenButton);
}

function styleButton(listenButton) {
    // Style updates needed to get the button correctly positioned relative to its parent:
    let buttonContainer = listenButton.querySelector(BUTTON_CONTAINOR_SELECTOR)
    buttonContainer.style.position = 'relative'
    buttonContainer.style.height = '48px'
    buttonContainer.style.top = '0px'
}

function updatePage() {

    document.querySelectorAll(RESPONSE_WINDOW_SELECTOR).forEach(responseWindow => {
        console.log(`BLB: found a window : ${responseWindow.querySelector(".markdown-main-panel").innerText.slice(0, 30)}`)
        let listenButton = responseWindow.querySelector(LISTEN_BUTTON_SELECTOR)
        console.log(`BLB:    before button parent: ${listenButton.parentElement.nodeName}#${listenButton.parentElement.className.replaceAll(' ', '#')}`)
        if (! listenButton.parentElement.className.includes(TOOLBAR_SELECTOR.replace(".", ""))) {
            moveButton(listenButton)
        }
        // Style attributes appear to be modified on window resizing.
        // This is a hack and we can probably avoid this by updating the CSS,
        // rather than individual element attribute.
        styleButton(listenButton)
        console.log(`BLB:     after button parent: ${listenButton.parentElement.nodeName}#${listenButton.parentElement.className.replaceAll(' ', '#')}`)
    })
}

setInterval(updatePage, 5000)
