import { PetriNet } from './pn.js';

class AdvancedPetriNet extends PetriNet {
    constructor(places, transitions, incidenceMatrix, initialMarking) {
        //console.log(`initialMarking:`, initialMarking);
        super(places, transitions, incidenceMatrix, initialMarking);
    }

    static union(pn1, pn2) {
        const places = [...new Set([...pn1.places, ...pn2.places])];
        const transitions = [...new Set([...pn1.transitions, ...pn2.transitions])];

        const initialMarking = Array(places.length).fill(0);
        places.forEach((place, i) => {
            initialMarking[i/*places.indexOf(place)*/] = (pn1.initialMarking[i] || 0) + (pn2.initialMarking[i] || 0);
        });

        const incidenceMatrix = [];
        for (let p = 0; p < places.length; p++) {
            incidenceMatrix[p] = [];
            for (let t = 0; t < transitions.length; t++) {
                incidenceMatrix[p][t] = (pn1.incidenceMatrix[pn1.places.indexOf(places[p])] || [])[pn1.transitions.indexOf(transitions[t])] || 0;
                incidenceMatrix[p][t] += (pn2.incidenceMatrix[pn2.places.indexOf(places[p])] || [])[pn2.transitions.indexOf(transitions[t])] || 0;
            }
        }

        return new AdvancedPetriNet(places, transitions, incidenceMatrix, initialMarking);
    }

    static synchronization(pn1, pn2) {
        // To be implemented based on specific synchronization rules.
    }

    static substitution(pn, transition, subNet) {
        // Replace a transition with a subnet.
    }

    static difference(pn1, pn2) {
        const places = pn1.places.filter(place => !pn2.places.includes(place));
        const transitions = pn1.transitions.filter(transition => !pn2.transitions.includes(transition));

        const initialMarking = Array(places.length).fill(0);
        places.forEach((place, i) => {
            initialMarking[i/*places.indexOf(place)*/] = pn1.initialMarking[i];
        });

        const incidenceMatrix = [];
        for (let p = 0; p < places.length; p++) {
            incidenceMatrix[p] = [];
            for (let t = 0; t < transitions.length; t++) {
                incidenceMatrix[p][t] = pn1.incidenceMatrix[pn1.places.indexOf(places[p])][pn1.transitions.indexOf(transitions[t])];
            }
        }

        return new AdvancedPetriNet(places, transitions, incidenceMatrix, initialMarking);
    }

    static intersection(pn1, pn2) {
        const places = pn1.places.filter(place => pn2.places.includes(place));
        const transitions = pn1.transitions.filter(transition => pn2.transitions.includes(transition));

        const initialMarking = Array(places.length).fill(0);
        places.forEach((place, i) => {
            initialMarking[i/*places.indexOf(place)*/] = Math.min(pn1.initialMarking[i], pn2.initialMarking[i]);
        });

        const incidenceMatrix = [];
        for (let p = 0; p < places.length; p++) {
            incidenceMatrix[p] = [];
            for (let t = 0; t < transitions.length; t++) {
                incidenceMatrix[p][t] = Math.min(
                    pn1.incidenceMatrix[pn1.places.indexOf(places[p])][pn1.transitions.indexOf(transitions[t])],
                    pn2.incidenceMatrix[pn2.places.indexOf(places[p])][pn2.transitions.indexOf(transitions[t])]
                );
            }
        }

        return new AdvancedPetriNet(places, transitions, incidenceMatrix, initialMarking);
    }

    static simulateHierarchical(parentNet, subNet, transitionIndex, maxSteps = 10) {
        // Замена перехода в родительской сети на подмножество
        parentNet.transitions[transitionIndex] = subNet;

        const executeStep = (net) => {
            const firingTransitions = net.predictEnabledTransitions();
            if (!firingTransitions) return false;
            net.computeMarking(firingTransitions);
            return true;
        };

        const simulateNet = (net) => {
            let steps = 0;
            while (executeStep(net)) {
                steps++;
                console.log(`Net: ${net.constructor.name}, Step: ${steps}`);
            }
        };

        // Симуляция иерархической сети
        const simulateHierarchicalStep = () => {
            let parentEnabled = parentNet.determineEnabledTransitions();

            // Если текущий переход вложенной сети готов к выполнению
            if (parentEnabled[transitionIndex]) {
                simulateNet(subNet);

                // Обновление маркировки родительской сети после выполнения подмножества
                parentNet.currentMarking = subNet.currentMarking;
                parentNet.enabledTransitions = parentNet.determineEnabledTransitions();
            }

            return parentNet.enabledTransitions.some(t => t);
        };

        let steps = 0;
        while (steps < maxSteps) {
            steps++;
            simulateHierarchicalStep();
            console.log('Parent Net Step Executed');
        }
    }
}

export { AdvancedPetriNet };