import { PetriNet } from '../index.mjs';

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonData = JSON.parse(readFileSync(join(__dirname, '././pnets.data/example2.json'), 'utf8'));

const optimizedData = PetriNet.optimizeJSON(jsonData);
console.log(`Model: `,optimizedData);

const petriNet = new PetriNet(    
    optimizedData.places, 
    optimizedData.transitions, 
    optimizedData.incidenceMatrix, 
    optimizedData.initialMarking);

let steps = 0;
let maxSteps = 10;
while (steps < maxSteps) {
    steps++;
    console.log(`:${steps}:`,petriNet.simulateStep());
}

