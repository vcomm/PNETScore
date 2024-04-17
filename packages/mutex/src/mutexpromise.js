class MutexPromise {
    constructor() {
      this.queue = Promise.resolve();
      this.isLocked = false;
    }
  
    lock() {
      let unlock;
      const lockPromise = new Promise(resolve => {
        unlock = () => {
          if (this.isLocked) {
            return; // If already unlocked, do nothing
          }
          this.isLocked = false; // Update the lock status
          resolve();
        };
      });
  
      this.queue = this.queue.then(() => {
        this.isLocked = true; // Update the lock status
        return lockPromise;
      });
  
      return unlock;
    }
  
    async execute(lockedFunction) {
      const unlock = await this.lock();
      try {
        return await lockedFunction();
      } finally {
        unlock();
      }
    }
  }

  module.exports = MutexPromise