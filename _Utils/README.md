# _Utils
Utility functions for reuse in userscripts

This code is vanilla JS and imports no runtime dependencies

## Observer.js

Provides whenElementAppears() - A reusable, single-line MutationObserver utility function.

Allows scripts to wait for a specific selector to appear on the page prior to running a provided callback function. Whether due to lazy loading, or a high-latency script download.

Replaces the numerous lines of fairly boilerplate code which is otherwise required to set up a single-mutation observer, a better technique than the less reliable timeout or interval implementation a developer would otherwise use as a hack.

Returns an instance of the *ObserverTracker*  which allows users to have manual control over disconnecting the mutationObserver and otherwise track its status.

Employs a [MutationObserver (MDN docs)](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to monitor DOM changes. See the documentation to understand the implementation.

Version 0.0.3 introduced the ability to monitor within an existing [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot). I'm still working on getting it to recognize new ShadowRoots that are attached after the observer is set up.

### Usage

1. Import the code by adding the following to your userscript header:

        // @require      https://raw.githubusercontent.com/mkazin/OhMonkey/main/_Utils/Observer.js
1. Pass delayed-execution code as a callback to `whenElementAppears()`

    Parameters:
    * @param {string} selector - CSS selector to be monitored
    * @param {function} fn - The callback function to invoke the selector is observed.
    * @param {DOM element} [observationTarget=document] - Optional node to observe for the appearance of the selector. If not provided, the entire DOM will be observed. Limiting the scope can yield better performance.
    * @param {Number} [timeout] - Optional timeout in ms to disable observer. If set to 0, mutationobserver will continue to run until the selector is seen.
    * @returns {ObserverTracker}

### Example
See my [YoutubeAutoSpeed.user.js](../Google/YoutubeAutoSpeed.user.js) userscript where this code was first developed.

The function's original code was:

    const container = document.querySelector("div#start")
    const button = document.createElement("button")
    button.onclick = () => {
            setSpeed(1.0)
            button.textContent = `Speed = 1.0x`
        }
    button.textContent = `Speed = ${currentSpeed}x`
    container.appendChild(button)

To delay the execution until after the `container` element appears in the DOM, it was wrapped with the following code which passes in that element:

    whenElementAppears("div#start", (container) => {
        const button = document.createElement("button")
        ...
        container.appendChild(button)
    }


### Security Warning
As with any browser script, importing code brings risk. Make sure you evaluate the code first. (Please do let me know if you find security concerns I can fix)

I recommend avoiding linking directly to the raw copy of the file on the main branch. Rather I prefer to use a tagged version or even locking to a commit identifier which can't be tampered with should my account get hacked.

### Development / Contributions
Pull requests, bug reports, and suggestions are welcome.

The dev environment is NodeJS. See [package.json](../package.json) in the root folder which includes the three dependencies used in testing (jest, jest-environment-jsdom, jsdom).

Use the `npm run` commands: `test`, `watch`, and `coverage`

Pull requests should pass the existing [unit tests](/__tests__/) and have additional tests to cover updates.

### Security, Forward-compatablity
Due to the nature of git repositories, the content of the above imported link can change, including changes which may break your code, or even mallicious code if the repository is compromised. The utility might even be moved to a different repository.

To avoid this you may lock your code to a specific version by using a commit ID rather than the "main" branch name.

### Possible future development

This implementation serves several possible use-cases, even allowing for having multiple callbacks run on the same selector. That implementation may benefit from an upgrade which reuses the MutationObserver object. It may not be adequate for some more advanced use-cases.

I may decide to switch this function (or add another one) to return a Promise. For one this would move error handling to be performed by the caller.
I expect code using it would also look better, especially as it's currently taking a function as a second parameter. For example:

    .then(waitForSelector("#desiredElement"))
    .then(desiredElement => ...)

Timeouts are another possible addition to allow developers to improve user experience when the code will not execute, such as running some fallback or cleanup code.

