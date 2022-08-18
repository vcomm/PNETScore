const petriNets = require('./petrinets')

class pnetsRegulator extends petriNets {
    /* Constructor */
    constructor(model){
        super(model);
    }    

    getByKey(key) {
        if (key.charAt(0) == "P")
            return this.getPlaces()[key];
        if (key.charAt(0) == "T")
            return this.getTrans()[key];
        return null;
    }

    get_arcsIn(key) {
        let arcsIn = [];
        this.getArcs().forEach(function (item, index) {
            //console.log(`Get Arc IN by key[${key}]:  ${JSON.stringify(item)}`)
            if (item.to.trans === key) {
                arcsIn.push(item);
            }
        });
        return arcsIn;
    }
    
    get_arcsOut(key) {
        let arcsOut = [];
        this.getArcs().forEach(function (item, index) {
            //console.log(`Get Arc OUT by key[${key}]:  ${JSON.stringify(item)}`)
            if (item.from.trans === key) {
                arcsOut.push(item);
            }
        });
        return arcsOut;
    }

    ready2Fire() {
        let self = this;
        let step = {
            trans: []
        };

        Object.keys(this.getTrans()).forEach(function (key, ind) {    
            let arcsIn = self.get_arcsIn(key);
            let conditionPlaces = arcsIn.filter((item) => {
                if (!item.from.track && item.from.token > 0) {
                    item.from.track = true
                    return item.from.token
                }
            })
            if (arcsIn.length === conditionPlaces.length) {
                step.trans.push(self.getTrans()[key])
                //self.getTrans()[key].pass = true
                //step.arcsIn  = arcsIn
                //step.arcsOut = self.get_arcsOut(key)
            } else {
                arcsIn.filter((item) => {                    
                    item.from.track = false                   
                })                
            }
        });
        return step;
    }   

    executeTrans(pnets, rlist) {
        let step = rlist.reduce((stack,item) => {                
            let trarr = []
            let trn = pnets.attach[item.owner][item.trans]
            trarr.push(`${item.owner}`)
            trn.forEach((action) => {                    
                trarr.push(`=>${item.trans}[${action}]`)
            })
            if(!trn.length) trarr.push(`=>${item.trans}`)
            stack.push(trarr)
            console.log(`Stack: `, stack)
            return stack;
        }, [])
        return step
    }
    
    getConditions() {
        let self = this;
        let curr = [];
        Object.keys(this.getPlaces()).forEach((key) => {          
            curr.push(`${self.getPlaces()[key].place}(${self.getPlaces()[key].token})`)
        })
        return curr 
    }

    placesMarkers(firetransitions) {
        let self = this;

        if (firetransitions && Array.isArray(firetransitions)) {
            firetransitions.map((fire) => {
                let arcsIn = self.get_arcsIn(fire.trans)
                arcsIn.map((place) => {
                    place.from.token--    
                    place.from.track = false           
                })    
                let arcsOut = self.get_arcsOut(fire.trans)
                arcsOut.map((place) => {
                    place.to.token++            
                })            
            }) 
            return true      
        } else { 
            console.error(`ERROR Fire transition:  ${JSON.stringify(firetransitions)}`)
            return false            
        }
    }
      
}

module.exports = pnetsRegulator
