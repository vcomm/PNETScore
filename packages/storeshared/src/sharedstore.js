const { Mutex } = require('async-mutex');

class SharedStore {
  constructor(initialData) {
    this.sharedData = initialData;
    this.mutex = new Mutex();
  }

  async updateSharedData(newData) {
    const release = await this.mutex.acquire();

    try {
      // Update the shared data
      this.sharedData = newData;
    } finally {
      release();
    }
  }

  async readSharedData() {
    const release = await this.mutex.acquire();

    try {
      // Read the shared data
      return this.sharedData;
    } finally {
      release();
    }
  }
}

module.exports = SharedStore