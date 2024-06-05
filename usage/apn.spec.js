import { AdvancedPetriNet } from '../core/apn.js';

const pn1 = new AdvancedPetriNet(
    ['P1', 'P2', 'P3'],
    ['T1', 'T2', 'T3'],
    [
        [-1, 2, 0],
        [1, -1, -1],
        [0, -1, 1]
    ],
    [2, 0, 0]
);

const pn2 = new AdvancedPetriNet(
    ['P2', 'P3', 'P4'],
    ['T2', 'T3', 'T4'],
    [
        [1, -1, 0],
        [-1, 1, -1],
        [0, 0, 1]
    ],
    [0, 1, 0]
);

const subpn = new AdvancedPetriNet(
    ['P4', 'P5'],
    ['T4', 'T5'],
    [
        [-1, 1],
        [1, -1]
    ],
    [1, 0]
);

const unionPN = AdvancedPetriNet.union(pn1, pn2);
console.log(`UNION:`,unionPN);
const diffPN = AdvancedPetriNet.difference(pn1, pn2);
console.log(`DIFF:`,diffPN);
const insecPN = AdvancedPetriNet.intersection(pn1, pn2); 
console.log(`INSEC:`,insecPN);

AdvancedPetriNet.simulateHierarchical(pn1, subpn, 1);
