const MutexEventEmit = require('../src/mutexevemit');

describe('MutexEventEmit', () => {
  let mutexEventEmit;

  beforeEach(() => {
    mutexEventEmit = new MutexEventEmit();
  });

  test('should lock and unlock', async () => {
    await mutexEventEmit.lock();
    expect(mutexEventEmit.isLocked).toBe(true);

    mutexEventEmit.unlock();
    expect(mutexEventEmit.isLocked).toBe(false);
  });

  test('should lock and unlock with queue', async () => {
    const promise1 = mutexEventEmit.lock();
    const promise2 = mutexEventEmit.lock();

    expect(mutexEventEmit.isLocked).toBe(true);

    mutexEventEmit.unlock();
    expect(mutexEventEmit.isLocked).toBe(true);

    mutexEventEmit.unlock();
    expect(mutexEventEmit.isLocked).toBe(false);

    await Promise.all([promise1, promise2]);
  });

  test('should execute locked function', async () => {
    const lockedFunction = jest.fn();

    await mutexEventEmit.execute(lockedFunction);

    expect(mutexEventEmit.isLocked).toBe(false);
    expect(lockedFunction).toHaveBeenCalled();
  });
});

