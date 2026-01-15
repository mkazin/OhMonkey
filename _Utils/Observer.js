/**
 * ObserverTracker - A reusable, single-line MutationObserver utility class
 *
 * Sets up a mutation observer to watch for the appearance of a specified selector in the DOM.
 *
 * When found, the provided callback function is invoked with the matching element as a parameter.
 *
 * @version 0.1.0
 *
 * @param {string} selector - CSS selector to be monitored
 * @param {function(Node)} fn - Callback function to invoke when the selector is observed, takes an HTML Element.
 * @param {Element} [observationTarget=document] - Optional node to observe for the appearance of the selector. If not provided, the entire document will be observed.
 * @param {Number} [timeout] - Optional timeout in ms to disable observer. If set to 0, mutationobserver will continue to run until the selector is seen.
 * @param {Boolean} [disconnectOnDetect] - Optional flag to disable automatic disconnection of the observer after the first invocation.
 * @param {string} [debugName] - Optional prefix text for debugging purposes, defaults to "ObserverTracker".
 */
class ObserverTracker {
    // To avoid garbage collection
    static #TRACKER_LIST = []

    constructor(selector, fn, observationTarget, timeout = null, disconnectOnDetect = true, debugName) {
        this.observer = null;
        this.selector = selector
        this.fn = fn
        this.observationTarget = observationTarget
        this.timeout = timeout
        this.disconnectOnDetect = disconnectOnDetect
        this.debugName = `${debugName  || "ObserverTracker"}:`
        this.wasDisconnected = false
        this.shadowrootTrackers = []
        ObserverTracker.#TRACKER_LIST.push(this)

        this.uid = window.crypto.randomUUID()

        // TBD: should an existing selector yield an immediate invocation and not set up an observer if disconnectOnDetect is true?

        this.observer = new MutationObserver(async (mutations, mutationObserver) => {
            await this.handleMutations(mutations)
        })
        this.observer.observe(observationTarget, {
            childList: true,
            subtree: true,
            attributes: false,
        })

        if (timeout) {
            setTimeout(() => {
                this.disconnect();
                console.debug(`${this.debugName} disconnected on timeout`);
            }, timeout);
        }

        this.checkShadowRoots(observationTarget);
    }

    // Recursively check for shadowRoots and set up observers for them
    checkShadowRoots(node) {
        if (node.shadowRoot) {
            const shadowRootTracker = new ObserverTracker(this.selector, this.fn, node.shadowRoot, this.timeout, this.disconnectOnDetect, `${this.debugName}:SR${node.shadowRoot}`);
            this.shadowrootTrackers.push(shadowRootTracker);
        }
        node.childNodes.forEach(child => this.checkShadowRoots(child));
    }

    disconnect() {
        this.observer?.disconnect()
        this.shadowrootTrackers.forEach(st => st.disconnect());
        this.shadowrootTrackers = []
        this.wasDisconnected = true
        this.observer = null
        ObserverTracker.#TRACKER_LIST.splice(ObserverTracker.#TRACKER_LIST.indexOf(this), 1);
    }

    async handleMutations(mutations) {
        if (this.wasDisconnected) {
            console.debug(`${this.debugName} already disconnected, skipping mutation handling`);
            return;
        }
        const foundTargets = mutations.flatMap(
            mutation => Array.from(mutation.addedNodes))
            .filter(node => node.matches && (node.matches(this.selector) || node.querySelector(this.selector)))
            .map(node => node.matches(this.selector) ? node : node.querySelector(this.selector));

        if (foundTargets.length > 0) {
            foundTargets.forEach(foundTarget => {
                try {
                    console.debug(`${this.debugName} invoking callback for ${this.selector}`);
                    this.fn(foundTarget);
                    if (this.disconnectOnDetect) {
                        this.disconnect();
                    }
                    return;
                } catch (error) {
                    // TBD: provide users with an error callback instead?
                    console.error(`${this.debugName} unexpected error...`, error);
                }
            });
        } else {
            // TBD: I think I need to add handling in case disconnectAfterDetection is false
            mutations.forEach(mutation => {
            // For any new nodes with a shadowRoot, set up a new observer targeting the shadowRoot
                Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).forEach(node => {
                    if (node.shadowRoot) { // check if mode is open?
                        const shadowrootTracker = new ObserverTracker(this.selector, this.fn, node.shadowRoot, this.timeout, this.disconnectOnDetect, this.debugName);
                        this.shadowrootTrackers.push(shadowrootTracker);
                    }
                });

                // Check if the mutation target itself has a new shadow root
                if (mutation.target.shadowRoot && !this.shadowrootTrackers.some(tracker => tracker.observationTarget === mutation.target.shadowRoot)) {
                    const shadowrootTracker = new ObserverTracker(this.selector, this.fn, mutation.target.shadowRoot, this.timeout, this.disconnectOnDetect, this.debugName);
                    this.shadowrootTrackers.push(shadowrootTracker);
                }

            });

        }
    }

    static generateRandomUUID() {
        return `observer#${ObserverTracker.#TRACKER_LIST.length}`;
    }

    toString() {
        return `ObserverTracker ${this.debugName}: watching for ${this.selector} on ${this.observationTarget}, wasDisconnected=${this.wasDisconnected})`;
    }
}


function onceElementAppears(selector, fn, observationTarget = document, timeout = 0, debugName = "onceElementAppears") {
    console.debug(`onceElementAppears(${selector}, (fn), ${observationTarget}, ${timeout}, "${debugName}")`)
    return new ObserverTracker(selector, fn, observationTarget, timeout, true, debugName)
}

function wheneverElementAppears(selector, fn, observationTarget = document, timeout = 0, debugName = "wheneverElementAppears") {
    console.debug(`wheneverElementAppears(${selector}, (fn), ${observationTarget}, ${timeout}, "${debugName}")`)
    return new ObserverTracker(selector, fn, observationTarget, timeout, false, debugName)
}

// Expose for userscript (@require) and Node
if (typeof window !== 'undefined') {
    window.ObserverTracker = ObserverTracker;
    window.onceElementAppears = onceElementAppears;
    window.wheneverElementAppears = wheneverElementAppears;
} else if (typeof globalThis !== 'undefined') {
    globalThis.ObserverTracker = ObserverTracker;
    globalThis.onceElementAppears = onceElementAppears;
    globalThis.wheneverElementAppears = wheneverElementAppears;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ObserverTracker, onceElementAppears, wheneverElementAppears };
}
