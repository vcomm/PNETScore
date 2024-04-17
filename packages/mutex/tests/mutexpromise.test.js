const MutexPromise = require('../src/mutexpromise');

describe('MutexPromise', () => {
  let mutexPromise;

  beforeEach(() => {
    mutexPromise = new MutexPromise();
  });

  test('should execute locked function when unlocked', async () => {
    const lockedFunction = jest.fn(() => 'result');
    const result = await mutexPromise.execute(lockedFunction);
    expect(lockedFunction).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  test('should execute locked function in sequential order', async () => {
    const lockedFunction1 = jest.fn(() => 'result1');
    const lockedFunction2 = jest.fn(() => 'result2');

    const promise1 = mutexPromise.execute(lockedFunction1);
    const promise2 = mutexPromise.execute(lockedFunction2);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(lockedFunction1).toHaveBeenCalled();
    expect(lockedFunction2).toHaveBeenCalled();
    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
    expect(lockedFunction1.mock.invocationCallOrder[0]).toBeLessThan(
      lockedFunction2.mock.invocationCallOrder[0]
    );
  });

  test('should execute locked function in sequential order even with async functions', async () => {
    const lockedFunction1 = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('result1'), 100)));
    const lockedFunction2 = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('result2'), 50)));

    const promise1 = mutexPromise.execute(lockedFunction1);
    const promise2 = mutexPromise.execute(lockedFunction2);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(lockedFunction1).toHaveBeenCalled();
    expect(lockedFunction2).toHaveBeenCalled();
    expect(result1).toBe('result1');
    expect(result2).toBe('result2');
    expect(lockedFunction1.mock.invocationCallOrder[0]).toBeLessThan(
      lockedFunction2.mock.invocationCallOrder[0]
    );
  });
});

/*
In this unit test, we create a new instance of the MutexPromise class before each test case using the beforeEach function. Then, we write multiple test cases to cover different scenarios.

The first test case, should execute locked function when unlocked, ensures that the locked function is executed when the mutex is unlocked. We use the jest.fn() function to create a mock function for the locked function and check if it has been called.

The second test case, should execute locked function in sequential order, verifies that the locked functions are executed in the order they were called. We use two mock functions and execute them using the mutexPromise.execute() method. We also check if the results and the invocation order of the mock functions are as expected.

The third test case, should execute locked function in sequential order even with async functions, tests the behavior of the mutex with asynchronous locked functions. We use two mock functions that return promises with delayed resolutions. Again, we check if the functions are executed in the correct order and if the results are as expected.

You can run this test using the Jest testing framework. Make sure to install Jest (npm install --save-dev jest) and save the test file with a .test.js extension. Then, you can run the test using the jest command.
*/