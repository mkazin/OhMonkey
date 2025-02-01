/**
 * ObserverTracker - A reusable, single-line MutationObserver utility class
 *
 * Sets up a mutation observer to watch for the *first* appearance of a specified selector in the DOM.
 *
 * When the selector is found, the provided callback function is invoked with the detected element as a parameter.
 *
 * @version 0.0.3
 *
 * @param {string} selector - CSS selector to be monitored
 * @param {function(Node)} fn - Callback function to invoke when the selector is observed.
 * @param {Element} [observationTarget=document] - Optional node to observe for the appearance of the selector. If not provided, the entire DOM will be observed.
 * @param {Number} [timeout] - Optional timeout in ms to disable observer. If set to 0, mutationobserver will continue to run until the selector is seen.
*/
class ObserverTracker {
    constructor(selector, fn, observationTarget, timeout) {
        this.created = new Date().getUTCMilliseconds()
        this.observer = null;
        this.selector = selector
        this.fn = fn
        this.observationTarget = observationTarget
        this.timeout = timeout
        this.disconnected = false
        this.shadowrootTrackers = []

        // TBD: should an existing selector yield an immediate invocation and not set up an observer?

        this.observer = new MutationObserver(async (mutations, mutationObserver) => {
            await this.handleMutations(mutations)
            logMutations(mutations)
        })
        this.observer.observe(observationTarget, {
            childList: true,
            subtree: true,
            attributes: false,
        })

        if (timeout) {
            setTimeout(() => {
                this.disconnect();
                console.log("Mutation Observer disconnected due to timeout");
            }, timeout);
        }

        this.checkShadowRoots(observationTarget);
    }

    // Recursively check for shadowRoots and set up observers for them
    checkShadowRoots(node) {
        if (node.shadowRoot) {
            const shadowRootTracker = whenElementAppears(this.selector, this.fn, node.shadowRoot, this.timeout);
            this.shadowrootTrackers.push(shadowRootTracker);
        }
        node.childNodes.forEach(child => this.checkShadowRoots(child));
    }

    disconnect() {
        this.observer?.disconnect()
        this.shadowrootTrackers.forEach(st => st.disconnect());
        this.shadowrootTrackers = []
        this.disconnected = true
        this.observer = null
    }

    async handleMutations(mutations) {
        // Search mutations where nodes were added for a node matching the selector
        const foundTarget = mutations.flatMap(
            mutation => Array.from(mutation.addedNodes))
            .find(node => node.matches(this.selector));

        if (foundTarget) {
            try {
                console.debug(`whenElementAppears: observer of ${this.selector} invoking callback`);
                this.fn(foundTarget);
                this.disconnect();
                return;
            } catch (error) {
                // TBD: provide users with an error callback instead?
                console.error('whenElementAppears: unexpected error...', error);
            }
        } else {
            // TBD: I think I need to add handling in case disconnectAfterDetection is false
            mutations.forEach(mutation => {
            // For any new nodes with a shadowRoot, set up a new observer targeting the shadowRoot
                Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).forEach(node => {
                    if (node.shadowRoot) { // check if mode is open?
                        const shadowrootTracker = whenElementAppears(this.selector, this.fn, node.shadowRoot, this.timeout);
                        this.shadowrootTrackers.push(shadowrootTracker);
                    }
                });

                // Check if the mutation target itself has a new shadow root
                if (mutation.target.shadowRoot && !this.shadowrootTrackers.some(tracker => tracker.observationTarget === mutation.target.shadowRoot)) {
                    const shadowrootTracker = whenElementAppears(this.selector, this.fn, mutation.target.shadowRoot, this.timeout);
                    this.shadowrootTrackers.push(shadowrootTracker);
                }

            });

        }
    }
}


function whenElementAppears(selector, fn, observationTarget = document, timeout = 0) {
    console.log(`whenElementAppears(${selector}, ${fn}, ${observationTarget}, ${timeout})`)
    return new ObserverTracker(selector, fn, observationTarget, timeout)
};

module.exports = whenElementAppears;
