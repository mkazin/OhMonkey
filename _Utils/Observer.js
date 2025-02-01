/**
 * whenElementAppears() - A reusable, single-line MutationObserver utility function
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
 * @returns {void}
*/
function whenElementAppears(selector, fn, observationTarget = document, timeout = 0) {
    const tracker = new ObserverTracker(selector, fn, observationTarget, timeout)
    const observer = new MutationObserver((mutations, mutationObserver) => {

        // TBD: should an existing selector yield an immediate invocation and not set up an observer?

        // Search mutations where nodes were added for a node matching the selector
        const foundTarget = mutations.flatMap(
            mutation => Array.from(mutation.addedNodes))
            .find(node => node.matches(selector));

        if (foundTarget) {
            try {
                console.debug(`whenElementAppears: observer of ${selector} invoking callback`);
                fn(foundTarget);
                tracker.disconnect();
                mutationObserver.disconnect();
                return;
            } catch (error) {
                console.error('whenElementAppears: unexpected error...', error);
            }
        } else {
            // TBD: I think I need to add handling in case disconnectAfterDetection is false

            // For any new nodes with a shadowRoot, set up a new observer targeting the shadowRoot
            for (node of mutations.flatMap(mutation => Array.from(mutation.addedNodes))) {
                console.log(`ShadowRoot check on: ${node} : ${node.shadowRoot}`)
                if (node.shadowRoot) {
                    const shadowrootTracker = whenElementAppears(selector, fn, node.shadowRoot, timeout);
                    tracker.shadowrootTrackers.push(shadowrootTracker);
                }
            }
        }
    })
    observer.observe(observationTarget, {
        childList: true,
        subtree: true,
        attributes: false,
    })
    tracker.observer = observer
    if (timeout) {
        setTimeout(() => {
            observer.disconnect();
            console.log("Mutation Observer disconnected due to timeout");
            tracker.disconnected = true;
        }, timeout);
    }

    // Recursively check for shadowRoots and set up observers for them
    const checkShadowRoots = (node) => {
        if (node.shadowRoot) {
            whenElementAppears(selector, fn, node.shadowRoot, timeout);
        }
        node.childNodes.forEach(child => checkShadowRoots(child));
    };
    checkShadowRoots(observationTarget);

    return tracker
};

module.exports = whenElementAppears;


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
    }
    disconnect() {
        this.shadowrootTrackers.forEach(st => st.disconnect());
        this.observer?.disconnect()
        this.disconnected = true
        this.observer = null
    }
}
