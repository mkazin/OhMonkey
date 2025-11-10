let document;
const { ObserverTracker, onceElementAppears, wheneverElementAppears } = require('../../_Utils/Observer')

/**
 * Mock MutationObserver for testing ObserverTracker
 *
 * This mock allows you to simulate DOM mutations without relying on real DOM changes.
 * It provides helper methods to simulate different types of mutations that would
 * normally be detected by a real MutationObserver.
 *
 * Usage:
 * 1. Replace global MutationObserver with this mock in beforeEach()
 * 2. Create your ObserverTracker instance
 * 3. Get the mock instance with MockMutationObserver.getLastInstance()
 * 4. Use simulateAddedNodes(), simulateRemovedNodes(), etc. to trigger mutations
 *
 * Example:
 *   const tracker = onceElementAppears('#test', callback);
 *   const mockObserver = MockMutationObserver.getLastInstance();
 *   document.body.appendChild(targetElement);
 *   mockObserver.simulateAddedNodes([targetElement]);
 */
class MockMutationObserver {
    constructor(callback) {
        this.callback = callback;
        this.observedTargets = [];
        this.isObserving = false;
        MockMutationObserver.instances.push(this);
    }

    observe(target, options) {
        this.observedTargets.push({ target, options });
        this.isObserving = true;
    }

    disconnect() {
        this.isObserving = false;
        this.observedTargets = [];
    }

    takeRecords() {
        return [];
    }

    // Test helper methods
    simulateAddedNodes(addedNodes, target = null) {

        if (!this.isObserving) return;

        const mutationRecord = {
            type: 'childList',
            target: target || this.observedTargets[0]?.target || document.body,
            addedNodes: Array.isArray(addedNodes) ? addedNodes : [addedNodes],
            removedNodes: [],
            previousSibling: null,
            nextSibling: null,
            attributeName: null,
            attributeNamespace: null,
            oldValue: null
        };

        this.callback([mutationRecord], this);
    }

    simulateRemovedNodes(removedNodes, target = null) {
        if (!this.isObserving) return;

        const mutationRecord = {
            type: 'childList',
            target: target || this.observedTargets[0]?.target || document.body,
            addedNodes: [],
            removedNodes: Array.isArray(removedNodes) ? removedNodes : [removedNodes],
            previousSibling: null,
            nextSibling: null,
            attributeName: null,
            attributeNamespace: null,
            oldValue: null
        };

        this.callback([mutationRecord], this);
    }

    simulateAttributeChange(target, attributeName, oldValue = null) {
        if (!this.isObserving) return;

        const mutationRecord = {
            type: 'attributes',
            target: target,
            addedNodes: [],
            removedNodes: [],
            previousSibling: null,
            nextSibling: null,
            attributeName: attributeName,
            attributeNamespace: null,
            oldValue: oldValue
        };

        this.callback([mutationRecord], this);
    }

    // Static methods for test management
    static instances = [];

    static clearInstances() {
        this.instances = [];
    }

    static getLastInstance() {
        return this.instances[this.instances.length - 1];
    }

    static getAllInstances() {
        return this.instances;
    }
}

window.randomUUID = crypto.randomUUID || (() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
}));

beforeEach(() => {
    // Suppress console output for function's debug messages
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'debug').mockImplementation(() => { });

    // Use the Jest-provided global document/window so MutationObserver.observe
    // receives Node instances from the same realm as the observer.
    document = global.document;

    // Replace MutationObserver with our mock
    global.MutationObserver = MockMutationObserver;
    MockMutationObserver.clearInstances();

    // Reset the DOM for test isolation
    document.body.innerHTML = '';
});

afterEach(() => {
    jest.restoreAllMocks();
    MockMutationObserver.clearInstances();
});

describe('Exports', () => {

    test('should export onceElementAppears function', () => {
        console.log(onceElementAppears);
        expect(typeof onceElementAppears).toBe('function');
    });
    test('window should have onceElementAppears function', () => {
        expect(typeof window.onceElementAppears).toBe('function');
    });
    test('should export wheneverElementAppears function', () => {
        expect(typeof wheneverElementAppears).toBe('function');
    });
    test('window should have wheneverElementAppears function', () => {
        expect(typeof window.wheneverElementAppears).toBe('function');
    });
    test('should export ObserverTracker class', () => {
        expect(typeof ObserverTracker).toBe('function');
    });
});

describe('onceElementAppears', () => {

    test('should observe and call function when element appears', async () => {
        const mockFn = jest.fn();
        const targetElement = document.createElement('div');
        targetElement.id = 'testElement';
        document.body.appendChild(targetElement);

        // Create the observer
        const tracker = onceElementAppears('#testElement', mockFn, document);
        expect(mockFn).not.toHaveBeenCalled();

        // Get the mock MutationObserver instance
        const mockObserver = MockMutationObserver.getLastInstance();
        expect(mockObserver).toBeDefined();
        expect(mockObserver.isObserving).toBe(true);

        mockObserver.simulateAddedNodes([targetElement], document.body);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalledWith(targetElement);

        // Verify observer was disconnected after first detection (onceElementAppears behavior)
        expect(mockObserver.isObserving).toBe(false);

        // Further mutations should not trigger the callback since observer was disconnected
        const anotherElement = document.createElement('div');
        anotherElement.id = 'testElement';
        document.body.appendChild(anotherElement);
        mockObserver.simulateAddedNodes([anotherElement], document.body);
        expect(mockFn.mock.calls).toHaveLength(1);
    });

    test('should detect when selector is the not the first mutation', async () => {
        const mockFn = jest.fn();
        const firstChild = document.createElement('div');
        const secondChild = document.createElement('div');
        const targetElement = document.createElement('div');

        targetElement.id = "target";
        firstChild.id = 'firstChild';
        secondChild.id = 'secondChild';

        // Create the observer
        onceElementAppears('#target', mockFn);
        expect(mockFn).not.toHaveBeenCalled();

        const mockObserver = MockMutationObserver.getLastInstance();

        // Simulate multiple mutations - first without target, then with target
        mockObserver.simulateAddedNodes([firstChild], document.body);
        expect(mockFn).not.toHaveBeenCalled();

        mockObserver.simulateAddedNodes([secondChild], document.body);
        expect(mockFn).not.toHaveBeenCalled();

        // Now simulate adding the target element directly
        mockObserver.simulateAddedNodes([targetElement], firstChild);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalledWith(targetElement);

        // Verify observer was disconnected after first detection
        expect(mockObserver.isObserving).toBe(false);
    });

    it('should handle multiple calls with different selectors and functions', async () => {
        const mockFn1 = jest.fn();
        const mockFn2 = jest.fn();
        const element1 = document.createElement('div');
        element1.id = 'testElement1';

        const element2 = document.createElement('div');
        element2.id = 'testElement2';

        onceElementAppears('#testElement1', mockFn1);
        const mockObserver1 = MockMutationObserver.getLastInstance();
        onceElementAppears('#testElement2', mockFn2);
        const mockObserver2 = MockMutationObserver.getLastInstance();

        expect(mockFn1).not.toHaveBeenCalled();
        expect(mockFn2).not.toHaveBeenCalled();

        // Simulate multiple mutations - first without target, then with target
        document.body.appendChild(element1);
        mockObserver1.simulateAddedNodes([element1], document.body);

        expect(mockFn1).toHaveBeenCalled();
        expect(mockFn1).toHaveBeenCalledWith(element1);
        expect(mockFn2).not.toHaveBeenCalled();

        // Appending the second element should only trigger the second call,
        // the first selector should no longer be observed
        document.body.appendChild(element2);
        mockObserver2.simulateAddedNodes([element2], document.body);

        expect(mockFn2).toHaveBeenCalled();
        expect(mockFn2).toHaveBeenCalledWith(element2);
        expect(mockFn1.mock.calls).toHaveLength(1);
        expect(mockFn2.mock.calls).toHaveLength(1);
    });

    it('should handle multiple calls with the same selector and separate functions', async () => {
        const mockFn1 = jest.fn();
        const mockFn2 = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';

        onceElementAppears('#testElement', mockFn1);
        const mockObserver1 = MockMutationObserver.getLastInstance();
        onceElementAppears('#testElement', mockFn2);
        const mockObserver2 = MockMutationObserver.getLastInstance();

        expect(mockFn1).not.toHaveBeenCalled();
        expect(mockFn2).not.toHaveBeenCalled();

        // Appending the first element should only trigger the first callback
        mockObserver1.simulateAddedNodes([element], document.body);
        mockObserver2.simulateAddedNodes([element], document.body);
        document.body.appendChild(element);

        expect(mockFn1).toHaveBeenCalled();
        expect(mockFn1).toHaveBeenCalledWith(element);
        expect(mockFn2).toHaveBeenCalled();
        expect(mockFn2).toHaveBeenCalledWith(element);
        expect(mockFn1.mock.calls).toHaveLength(1);
        expect(mockFn2.mock.calls).toHaveLength(1);

        document.body.removeChild(element);
    });

    it('should observe and respond to mutations on the optional observationTarget', async() => {
        const ignoredFn = jest.fn();
        const observedFn = jest.fn();
        const ignoredBranch = document.createElement('div')
        ignoredBranch.id = 'ignoredBranch';
        const observedBranch = document.createElement('div')
        observedBranch.id = 'observedBranch';

        const ignoredElement = document.createElement('div');
        ignoredElement.id = 'ignoredElement'
        ignoredElement.className = 'observationSelector'
        const observedElement = document.createElement('div');
        observedElement.id = 'observedElement'
        observedElement.className = 'observationSelector'

        onceElementAppears('.observationSelector', observedFn, observedBranch);
        const mockObserver = MockMutationObserver.getLastInstance();

        expect(ignoredFn).not.toHaveBeenCalled();
        expect(observedFn).not.toHaveBeenCalled();

        // Append elements with the desired selector to their respective branches
        ignoredBranch.appendChild(ignoredElement);
        observedBranch.appendChild(observedElement);
        mockObserver.simulateAddedNodes([observedElement], observedBranch);

        // Only one branch's should generate a mutation and have its callback invoked
        expect(observedFn.mock.calls).toHaveLength(1);
        expect(observedFn).toHaveBeenCalledWith(observedElement);
        expect(ignoredFn.mock.calls).toHaveLength(0);
        expect(ignoredFn).not.toHaveBeenCalledWith();
    })

    it('should disconnect observer after calling function', async () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';

        const tracker = onceElementAppears('#testElement', mockFn);
        const mockObserver = MockMutationObserver.getLastInstance();

        expect(mockFn).not.toHaveBeenCalled();

        element.style.display = 'block';
        document.body.appendChild(element);
        mockObserver.simulateAddedNodes([element], document.body);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith(element);

        expect(tracker.wasDisconnected).toBe(true);
        expect(tracker.observer).toBe(null);

        document.body.removeChild(element);
    });

    it('should not call function if target element is removed before appearing', () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';
        document.body.appendChild(element);

        onceElementAppears('#testElement', mockFn);
        const mockObserver = MockMutationObserver.getLastInstance();

        expect(mockFn).not.toHaveBeenCalled();

        document.body.removeChild(element);
        mockObserver.simulateRemovedNodes([element], document.body);

        element.style.display = 'block';

        expect(mockFn).not.toHaveBeenCalled();
    });

    it('should not call function if target element appears before observer is set up', () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';
        element.style.display = 'block';
        document.body.appendChild(element);

        onceElementAppears('#testElement', mockFn);
        const mockObserver = MockMutationObserver.getLastInstance();

        const otherElement = document.createElement('div');
        otherElement.id = 'otherElement';
        document.body.appendChild(otherElement);
        mockObserver.simulateAddedNodes([otherElement], document.body);

        expect(mockFn).not.toHaveBeenCalled();

        document.body.removeChild(element);
    });

    it('should not call function due to attribute changes in the target element', async () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';
        element.dataset.att = 'original';
        element.style.display = 'block';
        document.body.appendChild(element);

        const tracker = onceElementAppears('#testElement', mockFn, document);
        const mockObserver = MockMutationObserver.getLastInstance();

        element.dataset.att = 'changed';
        mockObserver.simulateAttributeChange(element, 'data-att', 'original', 'changed');

        expect(mockFn).not.toHaveBeenCalled();
        tracker.disconnect();
    });

    it('should detect and return a matching descendent of a mutated element ', async () => {
        const mockFn = jest.fn();
        const parentElement = document.createElement('div');
        const childElement = document.createElement('div');
        childElement.id = 'testElement';
        parentElement.appendChild(childElement);

        const tracker = onceElementAppears('#testElement', mockFn, document);
        const mockObserver = MockMutationObserver.getLastInstance();

        // Simulate a mutation that adds the parent element
        document.body.appendChild(parentElement);
        mockObserver.simulateAddedNodes([parentElement], document.body);

        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith(childElement);

        tracker.disconnect();
    });

    it('should it detect a pre-existing selector element that is moved into an observed element?', async () => {
        const mockFn = jest.fn();
        const originParentElement = document.createElement('div');
        const childElement = document.createElement('div');
        childElement.id = 'testElement';
        originParentElement.appendChild(childElement);
        document.body.appendChild(originParentElement);

        const tracker = onceElementAppears('#testElement', mockFn, document);
        const mockObserver = MockMutationObserver.getLastInstance();

        // Simulate a mutation that moves the child element
        const targetParentElement = document.createElement('div');
        targetParentElement.appendChild(childElement);
        document.body.appendChild(targetParentElement);
        mockObserver.simulateRemovedNodes([childElement], originParentElement);
        mockObserver.simulateAddedNodes([targetParentElement], document.body);

        expect(mockFn).toHaveBeenCalled();
        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalledWith(childElement);
    });

    it('should detect elements that appear within a shadow DOM', async () => {
        const mockFn = jest.fn();
        const hostElement = document.createElement('div');
        const shadowRoot = hostElement.attachShadow({ mode: 'open' });
        document.body.appendChild(hostElement);

        onceElementAppears('#testElement', mockFn, document);
        const mockObserver = MockMutationObserver.getLastInstance();

        const element = document.createElement('div');
        element.id = 'testElement';
        shadowRoot.appendChild(element);
        mockObserver.simulateAddedNodes([element], shadowRoot);

        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith(element);

        document.body.removeChild(hostElement);
    });


    describe('Timeout testing', () => {
        let tracker;

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            if (tracker) {
                tracker.disconnect();
            }
            jest.useRealTimers();
            jest.clearAllTimers();
        });

        it('should disable the mutation observer when invoking the callback before the timeout elapses', () => {
            const TEST_TIMEOUT = 1000;
            const mockFn = jest.fn();
            const element = document.createElement('div');
            element.id = 'testElement';

            tracker = onceElementAppears('#testElement', mockFn, document, TEST_TIMEOUT);
            const mockObserver = MockMutationObserver.getLastInstance();

            // Advance not enough time to trigger the disabling interval
            jest.advanceTimersByTime(TEST_TIMEOUT / 2);
            expect(mockFn).not.toHaveBeenCalled();
            expect(tracker.wasDisconnected).toBe(false);

            // Trigger the callback by providing the observer a selector target
            document.body.appendChild(element);
            mockObserver.simulateAddedNodes([element], document.body);

            expect(mockFn).toHaveBeenCalledWith(element);
            expect(tracker.wasDisconnected).toBe(true);
            expect(mockObserver.isObserving).toBe(false);

            // Advance past original timeout — nothing additional should happen
            jest.advanceTimersByTime(TEST_TIMEOUT * 2);
            expect(tracker.wasDisconnected).toBe(true);
            expect(mockFn.mock.calls.length).toBe(1);

            // Try to trigger a second callback, which should not work since the observer is disconnected
            const secondElement = element.cloneNode(true);
            document.body.appendChild(secondElement);
            mockObserver.simulateAddedNodes([secondElement], document.body);
            expect(mockFn.mock.calls.length).toBe(1);
        });

        it('should disable the mutation observer on timeout, without invoking the callback', () => {
            const TEST_TIMEOUT = 1000;
            const mockFn = jest.fn();
            const nonMatchingElement = document.createElement('div');
            nonMatchingElement.id = 'testElement';

            tracker = onceElementAppears('#ImpossibleElement', mockFn, document, TEST_TIMEOUT);
            const mockObserver = MockMutationObserver.getLastInstance();

            // Run time forward a bit, trigger the mutation observer, with a non-matching target
            jest.advanceTimersByTime(TEST_TIMEOUT / 2);
            expect(mockFn).not.toHaveBeenCalled();
            document.body.appendChild(nonMatchingElement);
            mockObserver.simulateAddedNodes([nonMatchingElement], document.body);
            expect(tracker.wasDisconnected).toBe(false);

            // Advance time past the timeout, the observer should disconnect without invoking the callback
            jest.advanceTimersByTime(TEST_TIMEOUT * 2);
            expect(mockFn).not.toHaveBeenCalled();
            expect(tracker.wasDisconnected).toBe(true);
            expect(mockObserver.isObserving).toBe(false);
        });
    });
});
