/**
 * whenElementAppears() - A reusable, single-line MutationObserver utility function
 * Sets up a mutation observer to watch for the appearance of a selector in the DOM.
 * When the selector is found, the provided callback function is invoked with the queried element as an argument.
 *
 * @version 0.0.1
 *
 * @param {string} selector - CSS selector to be monitored
 * @param {function} fn - The callback function to invoke the selector is observed.
 * @param {DOM element} [observationTarget=document] - Optional node to observe for the appearance of the selector. If not provided, the entire DOM will be observed.
 * @returns {void}
 */
function whenElementAppears(selector, fn, observationTarget=document) {
    const observer = new MutationObserver(function (mutations, mutationInstance) {

        // TBD: should an existing selector yield an immediate invocation and not set up an observer?

        const target = mutations[0].target.querySelector(selector)
        if (!target) {
            console.warn(`whenElementAppears: target ${selector} not found in this mutation`)
            return
        }
        try {
            console.debug(`whenElementAppears: observer of ${selector} invoking callback`)
            fn(target)
            mutationInstance.disconnect()
        } catch (error) {
            console.error('whenElementAppears: unexpected error...', error)
        }
    })
    observer.observe(observationTarget, {
        childList: true,
        subtree: true
    })
};

module.exports = whenElementAppears;

