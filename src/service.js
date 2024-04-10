const pnetsProcessor = require('./processor')

class pnetsService extends pnetsProcessor {
    #owner = NaN
    #ownerstrans = []
  
    constructor(pnets, owner) {
        super(pnets.model)
        this._pnets_ = pnets
        this.#owner  = owner
    }

    evOn(trans, funclst) {
      if (this._pnets_.attach[this.#owner] && 
          this._pnets_.attach[this.#owner][trans]) {
          this.#ownerstrans.push(`${this.#owner}=>${trans}`)

          this.init(`${this.#owner}=>${trans}`, funclst);
      } else {
          console.warn(`: Wrong Owner/Trans: `)
      }
    }
    /*
      {
        'T1': {
          funclst: [
            (cntx) => console.log(`: Execute Owner[...] Transition[...]: `, cntx)
          ]
        },
        .........
      }
    */
    attach(transitions) {
      this._pnets_.attach[this.#owner].translist
        .forEach((trans) => {
            console.log(`Translist Item[${trans}]`)
            if (transitions[trans]) {
                if (this._pnets_.attach[this.#owner][trans]) {
                    this.evOn(trans, this._pnets_.attach[this.#owner][trans].concat(transitions[trans].funclst))
                } else {
                    this.evOn(trans, transitions[trans].funclst)
                }
                console.log(`Attach trans[${trans}]`)
            }
      });
      //console.log(`Attachment result: `, this._pnets_.attach[this.#owner])
    }

    async fireTrans(trans, cntx) {
        const steps = this.executeTrans(this._pnets_, trans)
        return Promise.all(steps.map(async (step) => await this.fire(step, cntx)))
          .then(() => {
            console.log(`: Promise.all complete: `)
            return steps
          });
    }

    async fireOn(cntx) {
      let step = {
          trans: []
      };
      //console.log(`TRANS:`, Object.keys(super.getTrans()))
      return Promise.all(
        Object.keys(super.getTrans()).map(async (key)=>{
            let arcsIn = super.get_arcsIn(key);
            let conditionPlaces = arcsIn.filter((item) => {
                if (!item.from.track && item.from.token > 0) {
                    item.from.track = true
                    return item.from.token
                }
            }) 
            if (arcsIn.length === conditionPlaces.length) {
                const fireReady = super.getTrans()[key]
                //step.trans.push(fireReady)
                if (fireReady.owner == this.#owner) {
                    const res = await super.fire([fireReady.owner,`=>${fireReady.trans}`], cntx)
                    console.log(`------------ End Execution --------------: `, res)
                    step.trans.push(fireReady)
                    return res;
                }
            } else {
                arcsIn.filter((item) => {                    
                    item.from.track = false                   
                })                
            }
        })
      ).then(() => {   
          //console.log(`Final Fired: ${JSON.stringify(step)}`) 
            const curr = super.getConditions()
            if (super.placesMarkers(step.trans)) {
              if (Array.isArray(step.trans) && step.trans.length)
                  console.log(`New Places` ,{curr: curr, step: step, new: super.getConditions()})
            } else {
                console.log(`Error` ,{curr: curr, error: 400})
            }
          return step
      })
    }
}

module.exports = pnetsService