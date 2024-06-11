class PetriNet {
    constructor(places, transitions, incidenceMatrix, initialMarking) {
        this.places = places;
        this.transitions = transitions;
        this.incidenceMatrix = incidenceMatrix;
        this.initialMarking = initialMarking;
        this.currentMarking = initialMarking.slice();
        this.enabledTransitions = this.determineEnabledTransitions(this.currentMarking);
    }

    transFiringUpdate(enabledTransitions) {
        // clear previously
        const transFiring = Array(this.transitions.length).fill(0);
        enabledTransitions.forEach((tran, index) => {
            transFiring[tran] = 1;            
        })
        return transFiring;
    }

    computeMarking(firingTransitions) {
        const newMarking = this.currentMarking.slice();
        for (let t = 0; t < firingTransitions.length; t++) {
            if (firingTransitions[t]) {
                for (let p = 0; p < this.incidenceMatrix.length; p++) {
                    newMarking[p] += this.incidenceMatrix[p][t];
                    if (newMarking[p] < 0) {
                        throw new Error(`Model error: Negative token count detected in place ${this.places[p]}: ${newMarking[p]}`);
                    }
                }
            }
        }
        this.currentMarking = newMarking;
        return newMarking;
    }

    determineEnabledTransitions() {
        return this.transitions.map((_, t) => 
            this.places.every((_, p) => this.currentMarking[p] + this.incidenceMatrix[p][t] >= 0)
        );
    }

    calculateTransitionPriority(transitionIndex) {
        let priority = 0;
        for (let p = 0; p < this.places.length; p++) {
            if (this.incidenceMatrix[p][transitionIndex] < 0) {
                priority += 1;
            }
        }
        return priority;
    }

    predictEnabledTransitions() {
        const enabledTransitions = this.determineEnabledTransitions();
        const enabledIndices = enabledTransitions
            .map((enabled, index) => enabled ? index : -1)
            .filter(index => index !== -1);

        if (enabledIndices.length === 0) {
            console.log('No more enabled transitions.');
            return null;
        }

        const ready2Fire = Array(this.transitions.length).fill(0);

        // Проверка на конкуренцию
        const placeConflicts = this.places.map((_, p) => 
            enabledIndices.filter(t => this.incidenceMatrix[p][t] < 0)
        ).filter(conflicts => conflicts.length > 1);

        if (placeConflicts.length > 0) {
            // Сортировка доступных переходов на основе приоритетов
            enabledIndices.sort((a, b) => this.calculateTransitionPriority(b) - this.calculateTransitionPriority(a));
            ready2Fire[enabledIndices[0]] = 1;
        } else {
            enabledTransitions.forEach((tran, index) => {
                if (tran) ready2Fire[index] = 1;            
            })            
        }
        return ready2Fire;
    }

    simulateStep() {
/*
        const enabledTransitions = this.determineEnabledTransitions();
        const enabledIndices = enabledTransitions
            .map((enabled, index) => enabled ? index : -1)
            .filter(index => index !== -1);

        if (enabledIndices.length === 0) {
            console.log('No more enabled transitions.');
            return;
        }

        const firingTransitions = Array(this.transitions.length).fill(0);

        // Проверка на конкуренцию
        const placeConflicts = this.places.map((_, p) => 
            enabledIndices.filter(t => this.incidenceMatrix[p][t] < 0)
        ).filter(conflicts => conflicts.length > 1);

        if (placeConflicts.length > 0) {
            // Сортировка доступных переходов на основе приоритетов
            enabledIndices.sort((a, b) => this.calculateTransitionPriority(b) - this.calculateTransitionPriority(a));
            firingTransitions[enabledIndices[0]] = 1;
        } else {
            enabledTransitions.forEach((tran, index) => {
                if (tran) firingTransitions[index] = 1;            
            })            
        }
*/
        const firingTransitions = this.predictEnabledTransitions();
        const prevMarking = this.currentMarking;
        const newMarking = this.computeMarking(firingTransitions);
        console.log(`[${prevMarking}] => [${firingTransitions}] = [${newMarking}]`);

        return {prevMarking, firingTransitions, newMarking};
    }

    static formatConverter(inputData) {
        const outputData = {
            places: inputData.places.map(place => place.split(",")[0]),
            transitions: inputData.trans.map(transition => transition.split(",")[0]),
            arcs: inputData.arcs.map(arc => {
                const [source, target] = arc.split(",");
                return { source, target, weight: 1 };
            }),
            initialMarking: {}
        };

        inputData.places.forEach((item) => {
            let a = item.split(",");
            const place = a[0];
            const token = Number(a[3]);
            outputData.initialMarking[place] = token;
        })

        return outputData;
    }

}

// Пример функции formatConverter
PetriNet.formatNewConverter = function(data) {
    const places = data.places.map(place => place.split(',')[0]);
    const transitions = data.trans.map(trans => trans.split(',')[0]);

    const arcs = data.arcs.map(arc => {
        const [source, target] = arc.split(',');
        return { source, target, weight: 1 };
    });

    return { places, transitions, arcs, initialMarking: data.initialMarking };
};

// Пример функции optimizeJSON
PetriNet.optimizeJSON = function(data) {
    const places = data.places;
    const transitions = data.transitions;
    const initialMarking = Object.values(data.initialMarking);
    const incidenceMatrix = Array.from({ length: places.length }, () => Array(transitions.length).fill(0));

    data.arcs.forEach(arc => {
        const placeIndex = places.indexOf(arc.source);
        const transitionIndex = transitions.indexOf(arc.target);
        if (placeIndex !== -1 && transitionIndex !== -1) {
            incidenceMatrix[placeIndex][transitionIndex] -= arc.weight;
        } else {
            const transitionIndex = transitions.indexOf(arc.source);
            const placeIndex = places.indexOf(arc.target);
            incidenceMatrix[placeIndex][transitionIndex] += arc.weight;
        }
    });

    return { places, transitions, incidenceMatrix, initialMarking };
};
 
export default PetriNet;
