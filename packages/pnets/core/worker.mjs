import asmcore from '@vcomm/asmcore';
const { serviceDeploy } = asmcore;

class serviceWorker extends serviceDeploy {

    constructor(...args) {
      super(...args);
      this._locked = false;
      this.handleRelease = this.handleRelease.bind(this);
      console.log(`Worker constructor`,args);
    }

    sysTime() {
      return `[${new Date().toLocaleString('en-US', { hour12: false })}]`;
    }

    handleRelease(reason) {
      console.log(`Обработка события 'release': ${reason}`);
    }   
    /**
     * Waiting when Chain's execution is completed
     */
    async waiting() {
      console.log(`Waiting Chain Completion:`);
      const promise = new Promise((resolve) => {
          const handleRelease = (reason) => {
            this.removeListener('release', handleRelease);
            resolve(reason);
          };
          super.on('release', handleRelease);
          if (!this._locked) {
              this._locked = true;
          }
      })
      await promise
    }

    /**
     * Sending Chain's execution complete signal
     */
    async release(reason) {
      super.emit('release', reason || true);
      //super.removeListener('release', this.handleRelease);
      this._locked = false;
      return reason || true;
    }

    initLogic() {
      const releaseCompleteCallback = this.releaseComplete.bind(this);
      super.chainOn("test", [
        (cntx) => console.log(`: Start Test pipe chain: `, cntx),
        (cntx) => console.log(`: Final Test pipe chain: `, cntx)
      ], {}, releaseCompleteCallback);
    }

    addChain(event, funclist) {
      const releaseCompleteCallback = this.releaseComplete.bind(this);
      super.chainOn(event, [
        (cntx) => console.log(`: Start <[${event}]> funclist chain: `, cntx),
        funclist,
        (cntx) => console.log(`: Final <[${event}]> funclist chain: `, cntx)
      ], {}, releaseCompleteCallback);
    }

    releaseComplete(stats) {
      console.log(`Processing stats: `, stats);
      return this.release(stats);
    }

    async processHandle(msg) {
           
      try {
        
        if (this._locked) {
          setTimeout(() => this.processHandle(msg),100);
          return { evname: msg.evname, cntx: { status: { proceed: false, reason: 'busy' } } };
        }
        
        console.log('Worker Service: Message processing', msg);
        this.emitEvent(msg.evname, msg.cntx || {});
        await this.waiting();
        //return Promise.resolve(msg); 
        return msg;
      } catch (err) {
        //return Promise.reject(new Error(err));
        return new Error(err);
      }
  }

  deployLogic(funcString) {
    if (funcString instanceof Function) {
        return funcString;
    } else if(funcString instanceof String) {
        return new Function('cntx','"use strict";' + funcString);
    } else {
        console.error('Error deployLogic: ', funcString);
        return null;
    }
  }

  deliveryLogic(func) {
    return '(' + func.toString() + ')';
  }
}

export default serviceWorker