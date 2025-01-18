/**
 * whenElementAppears() - A reusable, single-line MutationObserver utility function
 *
 * Sets up a mutation observer to watch for the *first* appearance of a specified selector in the DOM.
 *
 * When the selector is found, the provided callback function is invoked with the detected element as a parameter.
 *
 * @version 0.0.2
 *
 * @param {string} selector - CSS selector to be monitored
 * @param {function(Node)} fn - Callback function to invoke when the selector is observed.
 * @param {Element} [observationTarget=document] - Optional node to observe for the appearance of the selector. If not provided, the entire DOM will be observed.
 * @param {Number} [timeout] - Optional timeout in ms to disable observer. If set to 0, mutationobserver will continue to run until the selector is seen.
 * @returns {void}
*/
function whenElementAppears(selector, fn, observationTarget = document, timeout = 0) {
    const observer = new MutationObserver(function (mutations, mutationInstance) {

        // TBD: should an existing selector yield an immediate invocation and not set up an observer?

        const record = mutations.find(mutation => mutation.target.querySelector(selector))
        if (record) {
            try {
                const target = record.target.querySelector(selector)
                console.debug(`whenElementAppears: observer of ${selector} invoking callback`)
                fn(target)
                mutationInstance.disconnect()
            } catch (error) {
                console.error('whenElementAppears: unexpected error...', error)
            }
        }
    })
    observer.observe(observationTarget, {
        childList: true,
        subtree: true,
    })
    if (timeout) {
        setTimeout(() => { observer.disconnect(); console.log("Mutation Observer disconnected") }, timeout)
    }
};

module.exports = whenElementAppears;

