class petriNets {
    #model_ = NaN
    #FireList_ = []
    #Places_ = {}       
    #Trans_ = {}
    #Arcs_  = []
    
    constructor(model){
      this.#model_ = model
    }

    initModel(pnmodel) {
        this.clearAll();
        this.#model_ = pnmodel || this.#model_;
        this.initPlace();
        this.initTrans();
        this.initArcs();
    }

    clearAll() {
        this.#FireList_ = [];
        this.#Places_ = {};        
        this.#Trans_ = {};
        this.#Arcs_  = [];        
    }

    initPlace() {
        this.#model_.places.map((item) => {
            let a = item.split(",");
            this.#Places_[a[0]] = {
                place : a[0],
                token : Number(a[3]),
                track : false,
                owner : a[4] 
            }             
        })
    }

    getPlaces() {
        return this.#Places_;
    }

    initTrans() {
        this.#model_.trans.map((item) => {
            let a = item.split(",");
            this.#Trans_[a[0]] = {
                trans : a[0],                
                owner : a[3],
                pass  : false 
            }             
        })
    }

    getTrans() {
        return this.#Trans_;
    }

    initArcs() {
        this.#model_.arcs.map((item) => {
            let a = item.split(",");
            this.#Arcs_.push({from: this.getByKey(a[0]), to: this.getByKey(a[1])})             
        })
    }

    getArcs() {
        return this.#Arcs_;
    }

    getModel() {
      return this.#model_
    }
}

module.exports = petriNets