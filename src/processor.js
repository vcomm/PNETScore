const { serviceDeploy } = require('@vcomm/asmcore');
const { EventEmitter } = require('events');
const pnetsRegulator = require('./regulator');

class pnetsProcessor extends pnetsRegulator {
    #eventname = NaN
    #content = {}  
    #locked = false
  
    constructor(model) {
        super(model)
        this.worker = new serviceDeploy()
        this.mutex  = new EventEmitter()
    }

    /**
     * Waiting when Chain's execution is completed
     */
    async waiting() {
        const mutex = this.mutex;
        console.log(`Waiting Chain Completion:`);
        const promise = new Promise((resolve) => {
            mutex.on('release', (reason) => resolve(reason));
            if (!this.#locked) {
                this.#locked = true;
            }
        })
        await promise
    }

    /**
     * Sending Chain's execution complete signal
     */
    release(reason) {
        this.mutex.emit('release', reason || true);
        this.mutex.off('release', (reason) => resolve(reason));
        this.#locked = false;
        console.log(`Execution Chain Complete:`);
        return reason || true;
    }
  
    init(event, funclst, content = null, release = null) {
        this.#eventname = event;
        this.#content = content || {};
      
        console.log(`Init processor pipeline`)
        
        this.worker.chainOn(event, [
            (cntx) => console.log(`: Run [${event}] chain: `), 
            funclst
        ], this.#content, (cntx) => { 
            release ? release(cntx) : console.log(`: Free [${event}] resources: `, cntx)
            this.release()
        })
    }

    async fire(step, cntx) {
      const event = step.join('')
      if (this.worker.chains[event]) {
          this.worker.emitEvent(event,cntx)
          await this.waiting()
          return true
      } else {
          console.warn(`: Wrong Chain[${event}]: `, this.worker.eventNames());
          return false
      }
      /*
        this.worker.waterFallPromise(event, cntx, 3)
          .then(stat => console.log(`: Chain Stats: `, stat))
          .then(() => {
              console.log(`cntx: `, this.#content)
          })
      */
    }    
}

module.exports = pnetsProcessor