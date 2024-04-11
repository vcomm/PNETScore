const { EventEmitter } = require('events')
const pnets = require('./pnets.data/example6.json')
const { pnetsService } = require('../index')
const { setTimeout } = require('timers')

// ----------------------------
let owner = '#71ed58'
const serviceOwner = new pnetsService(pnets, owner)
serviceOwner.initModel()
serviceOwner.attach({
    'T1': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}} Transition[T1]: `, cntx),
        async (cntx) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => resolve(cntx), 3000)
            })
            const data = await promise
            console.log(`: Run async/await func: `);        
        }
      ]
    },
    'T2': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}] Transition[T2]: `, cntx)
      ]
    },
    'T6': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}] Transition[T6]: `, cntx)
      ]
    },
})

// --------------------------------
let guest = '#ed53eb'
const serviceGuest = new pnetsService(pnets, guest)
serviceGuest.initModel()
serviceGuest.attach({
    'T3': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}} Transition[T3]: `, cntx),
        async (cntx) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => resolve(cntx), 3000)
            })
            const data = await promise
            console.log(`: Run async/await func: `);        
        }
      ]
    },
    'T4': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}] Transition[T4]: `, cntx)
      ]
    },
    'T5': {
      funclst: [
        (cntx) => console.log(`: Execute Owner[${cntx.owner}] Transition[T5]: `, cntx)
      ]
    },
})

// --------------------------------
const trigger = new EventEmitter()
trigger.on('event', () => {

    let instances = [{service: serviceOwner, name: owner}, 
                     {service: serviceGuest, name: guest}];
    Promise.all(instances.map(async (instance) => {
        await instance.service.fireOn({owner: instance.name})
        .then(trlst => {
          if (!Array.isArray(trlst.trans) || !trlst.trans.length) {
            console.log(instance.name,`:------------- Model Still  -------------: `) 
          } else {
            console.log(instance.name,`:------------- Model Updated -------------: `) 
            console.log(`Worked: `, trlst) 
          }
        })
    }))
        .then(() => {
            console.log(`: Promise.all complete: `)
            trigger.emit('complete');
        });
});


trigger.on('complete', () => {
    setTimeout(() => trigger.emit('event'), 3000)
});

trigger.emit('event');
