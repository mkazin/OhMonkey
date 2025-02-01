
const whenElementAppears = require('../../_Utils/Observer')

beforeEach(() => {
    // Suppress console output for function's debug messages
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'debug').mockImplementation(() => { });

    // Reset the DOM for test isolation, I'm seeing bleeding from one to another
    document.body.innerHTML = '';
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('whenElementAppears', () => {

    test('should observe and call function when element appears', async () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';

        whenElementAppears('#testElement', mockFn);
        expect(mockFn).not.toHaveBeenCalled();

        document.body.appendChild(element);
        await new Promise(process.nextTick);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalledWith(element);

        // Further DOM changes should not trigger invocations
        element.style.display = 'block';
        document.body.removeChild(element);
        await new Promise(process.nextTick);
        expect(mockFn.mock.calls).toHaveLength(1);
    });

    test('should detect when selector is the not the first mutation', async () => {
        const mockFn = jest.fn();
        const firstChild = document.createElement('div');
        const secondChild = document.createElement('div');
        const targetElement = document.createElement('div')
        document.body.appendChild(firstChild)
        document.body.appendChild(secondChild)
        document.body.id = 'body'
        targetElement.id = "target"
        firstChild.id = 'firstChild'
        secondChild.id = 'secondChild'
        whenElementAppears('#target', mockFn);
        expect(mockFn).not.toHaveBeenCalled();

        // The following changes generate three childList mutation records
        firstChild.appendChild(targetElement)
        secondChild.appendChild(targetElement)
        await new Promise(process.nextTick);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalledWith(targetElement);

        // Further DOM changes should not trigger invocations
        targetElement.style.display = 'block';
        targetElement.remove();
        await new Promise(process.nextTick);
        expect(mockFn.mock.calls).toHaveLength(1);
    });

    it('should handle multiple calls with different selectors and functions', async () => {
        const mockFn1 = jest.fn();
        const mockFn2 = jest.fn();
        const element1 = document.createElement('div');
        element1.id = 'testElement1';

        const element2 = document.createElement('div');
        element2.id = 'testElement2';

        whenElementAppears('#testElement1', mockFn1);
        whenElementAppears('#testElement2', mockFn2);

        expect(mockFn1).not.toHaveBeenCalled();
        expect(mockFn2).not.toHaveBeenCalled();

        // Appending the first element should only trigger the first callback
        document.body.appendChild(element1);
        await new Promise(process.nextTick);

        expect(mockFn1).toHaveBeenCalled();
        expect(mockFn1).toHaveBeenCalledWith(element1);
        expect(mockFn2).not.toHaveBeenCalled();

        // Appending the second element should only trigger the second call,
        // the first selector should no longer be observed
        document.body.appendChild(element2);
        await new Promise(process.nextTick);

        expect(mockFn2).toHaveBeenCalled();
        expect(mockFn2).toHaveBeenCalledWith(element2);
        expect(mockFn1.mock.calls).toHaveLength(1);
        expect(mockFn2.mock.calls).toHaveLength(1);

        document.body.removeChild(element1);
        document.body.removeChild(element2);
    });

    it('should handle multiple calls with the same selector and separate functions', async () => {
        const mockFn1 = jest.fn();
        const mockFn2 = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';

        whenElementAppears('#testElement', mockFn1);
        whenElementAppears('#testElement', mockFn2);

        expect(mockFn1).not.toHaveBeenCalled();
        expect(mockFn2).not.toHaveBeenCalled();

        // Appending the first element should only trigger the first callback
        document.body.appendChild(element);
        await new Promise(process.nextTick);

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

        whenElementAppears('.observationSelector', observedFn, observationTarget = observedBranch);

        expect(ignoredFn).not.toHaveBeenCalled();
        expect(observedFn).not.toHaveBeenCalled();

        // Append elements with the desired selector to their respective branches
        ignoredBranch.appendChild(ignoredElement);
        observedBranch.appendChild(observedElement);
        await new Promise(process.nextTick);

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

        const tracker = whenElementAppears('#testElement', mockFn);

        expect(mockFn).not.toHaveBeenCalled();

        element.style.display = 'block';
        document.body.appendChild(element);
        await new Promise(process.nextTick);

        expect(mockFn.mock.calls).toHaveLength(1);
        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith(element);

        expect(tracker.disconnected).toBe(true);
        expect(tracker.observer).toBe(null);

        document.body.removeChild(element);
    });

    it('should not call function if target element is removed before appearing', () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';
        document.body.appendChild(element);

        whenElementAppears('#testElement', mockFn);

        expect(mockFn).not.toHaveBeenCalled();

        document.body.removeChild(element);

        element.style.display = 'block';

        expect(mockFn).not.toHaveBeenCalled();
    });

    it('should not call function if target element appears before observer is set up', () => {
        const mockFn = jest.fn();
        const element = document.createElement('div');
        element.id = 'testElement';
        element.style.display = 'block';
        document.body.appendChild(element);

        whenElementAppears('#testElement', mockFn);

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

        const tracker = whenElementAppears('#testElement', mockFn, document);

        element.dataset.att = 'changed';
        await new Promise(process.nextTick);

        expect(mockFn).not.toHaveBeenCalled();
        tracker.disconnect();
    });

    it('should detect elements that appear within a shadow DOM', async () => {
        const mockFn = jest.fn();
        const hostElement = document.createElement('div');
        const shadowRoot = hostElement.attachShadow({ mode: 'open' });
        document.body.appendChild(hostElement);

        whenElementAppears('#testElement', mockFn, document);
        await new Promise(process.nextTick);

        const element = document.createElement('div');
        element.id = 'testElement';
        shadowRoot.appendChild(element);
        await new Promise(process.nextTick);

        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith(element);

        document.body.removeChild(hostElement);
    });


    describe('Interval testing', () => {
        it('should disable the mutation observer when the specified interval elapses, having invoked the callback', async () => {
            jest.useFakeTimers();

            const TEST_INTERVAL = 1000;
            const mockFn = jest.fn();
            const element = document.createElement('div');
            element.id = 'testElement';

            whenElementAppears('#testElement', mockFn, observationTarget = document, interval = TEST_INTERVAL);

            // setTimeout(() => { document.body.appendChild(element); }, TEST_INTERVAL * 0.95);

            expect(mockFn).not.toHaveBeenCalled();

            // Advance not enough time to trigger the disabling interval
            jest.advanceTimersByTime(TEST_INTERVAL / 2);
            expect(mockFn).not.toHaveBeenCalled();

            // Trigger the callback by providing the observer a selector target
            jest.useRealTimers();
            document.body.appendChild(element);
            await new Promise(process.nextTick);

            expect(mockFn).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith(element);
        });

        it('should disable the mutation observer when the specified interval elapses, without invoking the callback', async () => {
            jest.useFakeTimers();

            const TEST_INTERVAL = 1000;
            const mockFn = jest.fn();
            const nonMatchingElement = document.createElement('div');
            nonMatchingElement.id = 'testElement';

            whenElementAppears('#ImpossibleElement', mockFn, observationTarget = document, interval = TEST_INTERVAL);

            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(TEST_INTERVAL / 2);
            expect(mockFn).not.toHaveBeenCalled();

            // Run time forward callback without providing the observer a selector target
            jest.useRealTimers();
            document.body.appendChild(nonMatchingElement);
            await new Promise(process.nextTick);

            // jest.advanceTimersByTime(TEST_INTERVAL);

            expect(mockFn).not.toHaveBeenCalled();
        });
    });

});
