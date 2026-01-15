// ==UserScript==
// @name         Reddit Subreddit Hider
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Subreddit filter
// @license      BSD-3-Clause
// @match        https://www.reddit.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// @require      https://raw.githubusercontent.com/mkazin/OhMonkey/refs/heads/main/_Utils/Observer.js
// ==/UserScript==

const POST_SELECTOR = 'shreddit-post[subreddit-name]';
const CACHE_KEY = 'rsh-subreddit-list'

async function init() {
    // Hide previously saved subreddits
    const subreddits = (await GM_getValue(CACHE_KEY))?.split(',') || [];
    subreddits.forEach(name => hideSubreddit(name));
    // console.log(`Loaded list of ${subreddits.length} hidden subreddits: ${subreddits.join(',')}`);

    // Add filter button to posts on page load
    document.querySelectorAll(POST_SELECTOR).forEach(postElement => {
        const subredditName = postElement.getAttribute('subreddit-name');
        if (!subreddits.includes(subredditName) && !postElement.querySelector('#hide-subreddit-button')) {
            createFilterButton(postElement);
        }
    });

    // Observe for new posts being added and add a filter button to each
    wheneverElementAppears(
        POST_SELECTOR,
        (postElement) => { createFilterButton(postElement); },
        document,
        0,
        "RedditSubredditHider"
    );
}

function hideSubreddit(subredditName) {
    const rule = `article:has(shreddit-post[subreddit-name="${subredditName}"]) { display: none; }`;
    GM_addStyle(rule);
}

function createFilterButton(postElement) {
    const newSection = document.createElement('div')
    const creditBar = postElement.querySelector(`[id*="feed-post-credit-bar-"]`);
    creditBar.prepend(newSection)

    const newButton = document.createElement('button');
    newButton.classList.add('button-primary');
    newButton.id = 'hide-subreddit-button';
    newButton.innerText = 'Hide Subreddit'
    newButton.onclick = clickHandler;
    newSection.appendChild(newButton);
}

async function clickHandler(event) {
    const subreddits = (await GM_getValue(CACHE_KEY))?.split(',') || [];
    const postElement = event.target.closest('shreddit-post');
    const subredditName = postElement.getAttribute('subreddit-name');
    if (subreddits.includes(subredditName)) {
        console.warn(`Subreddit ${subredditName} is already hidden.`);
        return;
    }

    hideSubreddit(subredditName);
    subreddits.push(subredditName);
    await GM_setValue(CACHE_KEY, subreddits.join(','));
    // console.log(`Subreddit ${subredditName} has been hidden.`);
    // console.log(`New list of hidden subreddits: ${subreddits.join(',')}`);
}

init();
