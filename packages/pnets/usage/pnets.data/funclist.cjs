'use strict';

const workerFuncsList = {
    promiseFunc: async function(cntx) {
        return new Promise((resolve,reject) => {
            setTimeout(() => resolve(cntx), 2000)
        })
        .then(data => {
            console.log(`: Run async func: Promise`);
            //throw new Error('user define error');
        }) 
    },
    asynFunc: async function(cntx)  {
        const promise = new Promise((resolve,reject) => {
            setTimeout(() => resolve(cntx), 1000)
        })
        const data = await promise
        console.log(`: Run async/await func: `);        
    },    
    syncFunc: function(cntx) {
        console.log(`: Run sync func: `);
    }
}

module.exports = workerFuncsList;