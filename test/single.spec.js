const { EventEmitter } = require('events')
const pnets = require('./pnets.data/example6.json')
const { pnetsService } = require('../index')
const { setTimeout } = require('timers')

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
const trigger = new EventEmitter()
trigger.on('event', () => {
    console.log('Owner Fire');
    serviceOwner.fireOn({owner: owner})
    .then(trlst => {
      if (!Array.isArray(trlst.trans) || !trlst.trans.length) {
        console.log(`------------- Model same style  -------------: `) 
      } else {
        console.log(`------------- Model Updated -------------: `) 
        console.log(`Worked: `, trlst) 
      }
      trigger.emit('complete');
    }) 
});
trigger.on('event', () => {
    console.log('Guest Fire');
    serviceGuest.fireOn({owner: guest})
    .then(trlst => {
      if (!Array.isArray(trlst.trans) || !trlst.trans.length) {
        console.log(`------------- Model same style  -------------: `) 
      } else {
        console.log(`------------- Model Updated -------------: `) 
        console.log(`Worked: `, trlst) 
      }
      trigger.emit('complete');
    })    
});
trigger.on('complete', () => {
    setTimeout(() => trigger.emit('event'), 1000)
});

trigger.emit('event');
