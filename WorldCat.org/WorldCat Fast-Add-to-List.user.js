// ==UserScript==
// @name         WorldCat Fast-Add-to-List
// @version      0.1
// @author       Michael Kazin
// @namespace    https://openuserjs.org/users/mkazin
// @description  Adds names of existing Lists on title elements for fast adding (skip the extra dialog)
// @license      BSD-3-Clause
// @match        https://www.worldcat.org/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=worldcat.org
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// TODO: add support for institutional investors (currently being hardcoded to False)
const LISTS_REQUEST_URL="https://www.worldcat.org/api/lists?limit=100&offset=1&orderBy=name-asc&listName=&isInstitutionalUser=false"

const ADD_BUTTON_CONTAINER_CLASS = ".MuiButton-startIcon.MuiButton-iconSizeMedium"
const ITEM_TITLE_CLASS = 'div h2 a'
const ITEM_CONTAINER_CLASS = '.MuiGrid-item'
const SEARCH_CHECK_INTERVAL = 2500

let lists = new Map()
let listsContainer

// Builds lists map of List Name to List ID
function queryLists() {
    fetch(LISTS_REQUEST_URL)
    .then((response) => response.json())
    .then((data) => {
        lists = new Map(data.listsData.entries.map( (entry) => [entry.id, entry.listName]))
    })
}

function buildExistingListsContainers() {
    Array.from(document.querySelectorAll(ADD_BUTTON_CONTAINER_CLASS)).forEach(container => {

        const itemId = container.closest(ITEM_CONTAINER_CLASS).querySelector(ITEM_TITLE_CLASS).href.split('/').at(-1)
        let listContainer = document.createElement("div")
        let containerLabel = document.createElement("span")
        containerLabel.innerText = "Quick Add to List: "
        listContainer.append(containerLabel)
        lists.forEach( (listName, listId) => {

            let listLink = document.createElement("span")
            listLink.innerText = listName
            listLink.style.color = 'blue'
            listLink.onclick = () => {
                const post_url = `https://www.worldcat.org/api/lists/${listId}?listId=${listId}&itemId=${itemId}&isInstitutionalUser=false`
                fetch(post_url, { method: 'POST' }).then((response) => console.log(response))
            }
            listContainer.append(listLink)
        })
        container.closest(".MuiBox-root").append(listContainer)
    })
}


var search_interval
function startSearchInterval() {
    search_interval = setInterval(checkSearchCompletion, SEARCH_CHECK_INTERVAL)
}
function checkSearchCompletion() {
    if (document.querySelectorAll(ITEM_TITLE_CLASS).length > 0) {
        clearInterval(search_interval)
        onSearchCompletion()
    }
}

function onSearchCompletion() {
    buildExistingListsContainers()
}


(function() {
    'use strict';
    startSearchInterval()
    queryLists()
})();