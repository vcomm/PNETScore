const { SharedStore } = require('../index');

describe('SharedStore', () => {
  let sharedStore;

  beforeEach(() => {
    sharedStore = new SharedStore({ count: 0 });
  });

  afterEach(() => {
    sharedStore = null;
  });

  test('updateSharedData should update the shared data', async () => {
    const newData = { count: 5 };

    await sharedStore.updateSharedData(newData);

    expect(sharedStore.sharedData).toEqual(newData);
  });

  test('readSharedData should return the current shared data', async () => {
    const currentData = await sharedStore.readSharedData();

    expect(currentData).toEqual(sharedStore.sharedData);
  });

  test('updateSharedData and readSharedData should work correctly in concurrent scenarios', async () => {
    const newData1 = { count: 10 };
    const newData2 = { count: 15 };

    const updatePromise1 = sharedStore.updateSharedData(newData1);
    const updatePromise2 = sharedStore.updateSharedData(newData2);

    await Promise.all([updatePromise1, updatePromise2]);

    const currentData = await sharedStore.readSharedData();

    expect(currentData).toEqual(newData2);
  });
});