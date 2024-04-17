const { EventEmitter } = require('events');

class MutexEventEmit extends EventEmitter {
  constructor() {
    super();
    this.isLocked = false;
    this.queue = [];
    this.on('unlock', () => this.processQueue());
  }

  lock() {
    if (this.isLocked) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    } else {
      this.isLocked = true;
      return Promise.resolve();
    }
  }

  unlock() {
    this.isLocked = false;
    this.emit('unlock');
  }

  async processQueue() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next.resolve();
      this.isLocked = true;
    }
  }

  async execute(lockedFunction) {
    await this.lock();
    try {
      await lockedFunction();
    } finally {
      this.unlock();
    }
  }
}

module.exports = MutexEventEmit