
const whenElementAppears = require('../../_Utils/Observer')

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

describe('whenElementAppears', () => {

    // Function correctly observes and calls function when element appears
    it('should observe and call function when element appears', async () => {
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
    
    
    // Function can handle multiple calls with different selectors and functions
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
    
    
    // Function can handle multiple calls with the same selectors and separate functions
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

      whenElementAppears('.observationSelector', observedFn, observationTarget=observedBranch);
      
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

    // Function disconnects observer after calling function
    it('should disconnect observer after calling function', async () => {
      const mockFn = jest.fn();
      const element = document.createElement('div');
      element.id = 'testElement';
      
      whenElementAppears('#testElement', mockFn);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      element.style.display = 'block';
      document.body.appendChild(element);
      await new Promise(process.nextTick);
      
      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith(element);
      
      const observer = element._observer;
      expect(observer).toBeUndefined();
      
      document.body.removeChild(element);
    });
    
    // Function does not call function if target element is removed before appearing
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
    
    // Function does not call function if target element appears before observer is set up
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

});
