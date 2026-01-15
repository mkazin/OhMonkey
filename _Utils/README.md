# _Utils
Utility functions for reuse in userscripts

This code is vanilla JS and imports no runtime dependencies

## Observer.js

Provides:
* `ObserverTracker` - a utility class to monitor the DOM for the appearence of a selector.
* `onceElementAppears()` and `wheneverElementAppears()` - Easy-to-use functions to use ObserverTracker for one-time- or ongoing observation, respectively.

These allow userscripts to wait for a specific selector to appear on the page prior to running a provided callback function. Whether due to lazy loading, high-latency script download, or scrolling content.

This replaces the numerous lines of fairly boilerplate code which is otherwise required to set up a single-mutation observer, a better technique than the less reliable timeout or interval implementation some developers use as a hack.

Returns an instance of the *ObserverTracker*  which allows users to have manual control over disconnecting the mutationObserver and otherwise track its status.

Employs a [MutationObserver (MDN docs)](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to monitor DOM changes. See the documentation to understand the implementation.

Version 0.0.3 introduced the ability to monitor within an existing [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot). I'm still working on getting it to recognize new ShadowRoots that are attached after the observer is set up.

### Usage

1. Import the code by adding the following to your userscript header:

        // @require      https://raw.githubusercontent.com/mkazin/OhMonkey/main/_Utils/Observer.js
1. Pass the desired selector and a callback to `wheneverElementAppears()` or `onceElementAppears()`

    Parameters:
    * `@param {string} selector` - CSS selector to be monitored
    * `@param {function} fn` - The callback function to invoke the selector is observed.
    * `@param {DOM element} [observationTarget=document]` - Optional node to observe for the appearance of the selector. If not provided, the entire DOM will be observed. Limiting the scope can yield better performance.
    * `@param {Number} [timeout]` - Optional timeout in ms to disable observer. By default set to 0 which means it will continue to run until the selector is seen.
    * `@param {Boolean} [disconnectOnDetect]` - Optional flag to disable automatic disconnection of the observer after the first invocation (unless already disconnected by the timeout). This parameter does not exist in `wheneverElementAppears()` and `onceElementAppears()` (these hard-code the parameter passed to `ObserverTracker`).
    * `@param {string} [debugName]` - Optional prefix text for debugging purposes, defaults to "ObserverTracker". Useful when running multiple observers in your script(s).

    * `@returns {ObserverTracker}`, providing access to  `disconnect()` which can be called manually.

### Example uses

1. Pages which load content over time such as infinite scrolling. In this case, we want a long-running MutationObserver. For this use case we can use the `wheneverElementAppears` function,
which sets *ObserverTracker*'s `disconnectOnDetect` to `false`.

   See my [RedditSubredditHider.user.js](../Reddit/RedditSubredditHider.user.js) userscript in which newly-loaded posts have a "Hide Subreddit" button added to them to trigger the filtering.

2. Waiting for a site event - a frequent use of MutationObserver is waiting until a website loads asynchronously. Sometimes setting `@run-at` to `document-idle` is sufficient and the correct way to go. Other sites may have Javascript which runs even later.

   YouTube video pages are one example where a necessary element is not available at the time the GreaseMonkey script runs. My
[YoutubeAutoSpeed.user.js](../Google/YoutubeAutoSpeed.user.js) userscript adds a button on the page to allow quickly let a user reset the playback speed to 1x- handy for when the script's code makes a false negative decision on a video where playback shouldn't be adjusted.

   To delay the execution until after the `container` element appears in the DOM, it was wrapped with the following code which passes in that element:

    onceElementAppears("div#start", (container) => {
        const button = document.createElement("button")
        ...
        container.appendChild(button)
    }

3. Tracking changes to an element over time- On the Boston Globe's website the page for a newspaper story displays a counter of the number of reader comments and is updated as new comments come in. This code observes the comment counter's element and console logs the element's text each time it changes. Since we want to track more than a single change, we can also use the *wheneverElementAppears* function or set disconnectOnDetect to false.
window.wheneverElementAppears("span.sharebar_comment_count", (e) => console.log(`Comment count: ${e.textContent}`));


### Security, Forward-compatablity

As with any browser script, importing code brings risk. Make sure you evaluate the code first. (Please do let me know if you find security concerns I can fix)

Due to the nature of git repositories, the content of the above imported link can change, including changes which may break your code, or even mallicious code if the repository is compromised. The utility might even be moved to a different repository.

I recommend avoiding linking directly to the raw copy of the file on the main branch. Instead, some possible alternatives:
 # A tagged version to avoid future compatability issues, or;
 # Lock to a commit identifier which can't be tampered with, even should my account get hacked; or
 # Self-host your own copy (e.g. fork or copy to a repo you control)
 I don't recommend including the code in your own script, but that's a technical option.

### Development / Contributions
Pull requests, bug reports, and suggestions are welcome.

The dev environment is NodeJS. See [package.json](../package.json) in the root folder which includes the three dependencies used in testing (jest, jest-environment-jsdom, jsdom).

Use the `npm run` commands: `test`, `watch`, and `coverage`

Pull requests should pass the existing [unit tests](/__tests__/) and have additional tests to cover updates.

### Possible future development

This implementation serves several possible use-cases, even allowing for having multiple callbacks run on the same selector. That implementation may benefit from an upgrade which reuses the MutationObserver object. It may not be adequate for some more advanced use-cases.

I may decide to switch this function (or add another one) to return a Promise. For one this would move error handling to be performed by the caller.
I expect code using it would also look better, especially as it's currently taking a function as a second parameter. For example:

    .then(waitForSelector("#desiredElement"))
    .then(desiredElement => ...)
