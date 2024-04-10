async function promiseFunc(cntx){
    return new Promise((resolve,reject) => {
        setTimeout(() => resolve(cntx), 2000)
    })
    .then(data => {
        console.log(`: Run async func: Promise`);
        //throw new Error('user define error');
    }) 
}
async function asynFunc(cntx)  {
    const promise = new Promise((resolve,reject) => {
        setTimeout(() => resolve(cntx), 1000)
    })
    const data = await promise
    console.log(`: Run async/await func: `);        
}    
function syncFunc(cntx) {
    console.log(`: Run sync func: `);
}

const pnets = {
  "id": "template",
  "type": "PNETS",
  "prj": "proj_",
  "model": {
    "places": [
      "P1,735,325,1,orange",
      "P2,369,321,0,orange",
      "P3,372,175,1,orange",
      "P4,360,485,0,orange",
      "P5,1143,338,0,orange",
      "P6,1145,164,1,orange",
      "P7,1131,497,0,orange"
    ],
    "trans": [
      "T1,554,263,#71ed58",
      "T2,552,391,#71ed58",
      "T3,941,271,#ed53eb",
      "T4,940,409,#ed53eb",
      "T5,1368,341,#ed53eb",
      "T6,159,308,#71ed58"
    ],
    "arcs": [
      "T1,P2",
      "T2,P1",
      "P1,T1",
      "P2,T2",
      "T2,P4",
      "P1,T3",
      "T4,P1",
      "P5,T4",
      "T3,P5",
      "T4,P7",
      "P3,T1",
      "P6,T3",
      "P7,T5",
      "T5,P6",
      "T6,P3",
      "P4,T6"
    ]
  },
  "attach": {
    "#71ed58": {
      "key": "*",
      "api": "*",
      "owner": "#71ed58",
      "translist": ["T1","T2","T6"],
      "T1": [],
      "T2": [],
      "T6": [promiseFunc,syncFunc,asynFunc]
    },
    "#ed53eb": {
      "key": "*",
      "api": "*",
      "owner": "#ed53eb",
      "translist": ["T3","T4","T5"],
      "T3": [],
      "T4": [],
      "T5": []
    }
  }
}

const { pnetsService } = require('../index')

let owner = '#71ed58'
const service = new pnetsService(pnets, owner)
service.initModel()
service.attach({
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

setInterval(()=> {
  
  service.fireOn({owner: '#71ed58'})
  .then(trlst => {
    if (!Array.isArray(trlst.trans) || !trlst.trans.length) {
      console.log(`------------- Model same style  -------------: `) 
    } else {
      console.log(`------------- Model Updated -------------: `) 
      console.log(`Worked: `, trlst) 
    }
  })  
  
},5000)
