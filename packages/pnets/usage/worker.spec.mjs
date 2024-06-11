import { createRequire } from 'module';
const require = createRequire(import.meta.url);

//const serviceWorker = require('../core/worker.cjs');
import { serviceWorker } from '../index.mjs';
const worker = new serviceWorker();

worker.initLogic();
const workerFuncsList = require('./pnets.data/funclist.cjs');
worker.addChain('pipe', [workerFuncsList.promiseFunc,workerFuncsList.syncFunc,workerFuncsList.asynFunc]);

worker.processHandle({ evname: 'pipe' })
.then(async (result) => {
    console.log(`:${worker.sysTime()}: Worker attached pipe <pipe> translist:`, result);
});

worker.processHandle({ evname: 'test' })
.then(async (result) => {
    console.log(`:${worker.sysTime()}: Worker attached pipe <test> translist:`, result);
});