//import PetriNet from 'pn.js';

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('downloadJson').addEventListener('click', downloadJSON);

//let animationFrameId = null;

let graph = new joint.dia.Graph();
const paper = new joint.dia.Paper({
    el: document.getElementById('paper'),
    model: graph,
    width: 1400,
    height: 700,
    gridSize: 10,
    drawGrid: true
});
/*
let places = {};
let transitions = {};
let stepsLog = [];
let stepIndex = 0;
let transFiring = [];
let currentMarking;
*/
let petriNetData = null;
let petriNet = null;

let placeElements = {};
let transitionElements = {};
let linkElements = [];
let elementSelected  = null;

document.getElementById('executeButton').addEventListener('click', executeBuild);
document.getElementById('stepButton').addEventListener('click', step);
document.getElementById('clearButton').addEventListener('click', clear);
document.getElementById('placeButton').addEventListener('click', addPlace);
document.getElementById('markerPlusButton').addEventListener('click', plusMarker);
document.getElementById('markerMinusButton').addEventListener('click', minusMarker);
document.getElementById('transButton').addEventListener('click', addTransition);
document.getElementById('linkButton').addEventListener('click', addLink);
document.getElementById('delButton').addEventListener('click', elemDelete);

function endisElem(elem, flag) {
    document.getElementById(elem).disabled = flag;
}

function elemDelete() {
    if (elementSelected) {
        elementSelected.remove();
        elementSelected  = null;
        endisElem('delButton', true);
    }
}

endisElem('delButton', true);

graph.on('remove', (cell) => {
    console.log(`Remove cell`, cell);
    switch(cell.get('type')) {
        case 'pn.Place':
            if (placeElements[cell.attr('.label/text')])
                delete placeElements[cell.attr('.label/text')];
            break;
        case 'pn.Transition':
            if (transitionElements[cell.attr('.label/text')])
                delete transitionElements[cell.attr('.label/text')];
            break;
        case 'pn.Link':
            linkElements = linkElements.filter(elem => elem.attr('.label/text') !== cell.attr('.label/text'));
            break;
    }
});   
graph.on('change:source', (trans) => {

});          
graph.on('change:target', (trans) => { 

});
paper.on('cell:pointerdown',(cellView)=>{
    if (elementSelected) {
        elementSelected.attr('.root/fill', 'white');
    }
    cellView.model.attr('.root/fill', 'yellow');
    elementSelected  = cellView.model;
    endisElem('delButton', false);
    console.log(`Selected [${elementSelected.get('type')}]: `,elementSelected);
});
paper.on('blank:pointerdown', ()=>{
    if (elementSelected) {
        elementSelected.attr('.root/fill', 'white');
        elementSelected  = null;
        endisElem('delButton', true);
        console.log('Selected Reset All');
    }    
});
paper.on('cell:pointerclick', (cellView, eventObject, eventX, eventY)=>{
    //console.log(`cell:pointerclick - x[${eventX}], y[${eventY}]`)
}); 
paper.on('cell:pointerdblclick', (cellView)=>{
    let elemName = cellView.model.attr('.label/text');
    elemName = prompt('Element Name: ', elemName);
    cellView.model.attr('.label/text', elemName);
    //console.log('Show State:',cellView.model.attr('.label/text'));
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            petriNetData = JSON.parse(e.target.result);
            //currentMarking = petriNetData.currentMarking;
            const optimizedData = PetriNet.optimizeJSON(petriNetData);
            petriNet = new PetriNet(    
                optimizedData.places, 
                optimizedData.transitions, 
                optimizedData.incidenceMatrix, 
                optimizedData.initialMarking);
            drawPetriNet(petriNetData);
            //console.log('Cycle competed by steps:',petriNet.checkCycleComplete()); 
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

function clear()  {
    graph.clear();
    petriNetData = null;
    petriNet = null;
}

function drawPetriNet(data) {
    graph.clear();

    //const placeElements = {};
    data.places.forEach((place, index) => {
        const placeElement = new joint.shapes.pn.Place({
            //position: { x: 50, y: 50 + index * 100 },
            position: { x: data.graph[place].x, y: data.graph[place].y },
            size: { width: 50, height: 50 },
            attrs: { '.label': { text: place }, '.root': { stroke: '#000' } },
            tokens: data.initialMarking[place] || 0
        });
        graph.addCell(placeElement);
        placeElements[place] = placeElement;
    });

    //const transitionElements = {};
    data.transitions.forEach((transition, index) => {
        const transitionElement = new joint.shapes.pn.Transition({
            //position: { x: 300, y: 50 + index * 100 },
            position: { x: data.graph[transition].x, y: data.graph[transition].y },
            size: { width: 10, height: 50 },
            attrs: { '.label': { text: transition }, '.root': { stroke: '#000' } }
        });
        graph.addCell(transitionElement);
        transitionElements[transition] = transitionElement;
    });

    data.arcs.forEach(arc => {
        const source = placeElements[arc.source] || transitionElements[arc.source];
        const target = placeElements[arc.target] || transitionElements[arc.target];
        const linkName = `${arc.source},${arc.target}`;
        const linkElement = new joint.shapes.pn.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: { '.connection': { 'stroke-width': arc.weight } },
            attrs: { '.label': { text: linkName }, '.root': { stroke: '#000' } }
        });
        graph.addCell(linkElement);
        //linkElements[`${source.id},${target.id}`] = linkElement;
        linkElements.push(linkElement);
    });
    executeBuild();
}

// Function to generate JSON data
function generateJSON() {
    const places = Object.keys(placeElements);
    const transitions = Object.keys(transitionElements);

    const arcs = linkElements.map(link => {
        const sourceId = link.get('source').id;
        const targetId = link.get('target').id;

        const sourceElement = graph.getCell(sourceId);
        const targetElement = graph.getCell(targetId);

        const sourceLabel = sourceElement.attr('.label/text');
        const targetLabel = targetElement.attr('.label/text');

        return { source: sourceLabel, target: targetLabel, weight: link.attr('.connection/stroke-width') || 1 };
    });

    //const initialMarking = places.map(place => parseInt(placeElements[place].attr('.tokens/text')) || 0);
    //const initialMarking = places.map(place => parseInt(placeElements[place].get('tokens')) || 0);
    const initialMarking = {};

    const graphData = {};
    places.forEach(place => {
        const position = placeElements[place].position();
        graphData[place] = { x: position.x, y: position.y };
        initialMarking[place] = parseInt(placeElements[place].get('tokens')) || 0;
    });

    transitions.forEach(transition => {
        const position = transitionElements[transition].position();
        graphData[transition] = { x: position.x, y: position.y };
    });

    const jsonData = { places, transitions, arcs, initialMarking, graph: graphData };

    console.log(JSON.stringify(jsonData, null, 2));
    return jsonData;
}

function updateMarking(marking) {
    const places = graph.getCells().filter(cell => cell instanceof joint.shapes.pn.Place);
    places.forEach((place, index) => {
        const tokenCount = marking[index];
        //place.attr('.label/text', `${place.attr('.label/text').split(':')[0]}: ${tokenCount}`);
        place.attr('.root/fill', tokenCount > 0 ? 'orange' : 'white');
        place.set('tokens', tokenCount);
        place.trigger('change:tokens', place, tokenCount);
    });
}

function updateEnabledTransitions(transFiring) {
    const trans = graph.getCells().filter(cell => cell instanceof joint.shapes.pn.Transition);
    trans.forEach((tran, index) => {
        const ready2Fire = transFiring[index];
        tran.attr('.root/fill', ready2Fire > 0 ? 'green' : 'red');
    });
}

let indx = 0;

function step() {
    const step = petriNet.simulateStep();
    updateMarking(petriNet.currentMarking);
    updateEnabledTransitions(petriNet.predictEnabledTransitions());
    indx++;
}

function addPlace(event) {
    const rect = paper.el.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let place = prompt('Place Name', 'P');
    // Создание элемента placeElement
    const placeElement = new joint.shapes.pn.Place({
        position: { x: rect.left, y: rect.top },
        size: { width: 50, height: 50 },
        attrs: { '.label': { text: place }, '.root': { stroke: '#000' } },
        tokens: 0
    });

    // Добавление элемента в граф
    graph.addCell(placeElement);
    placeElements[place] = placeElement;
}

function addTransition() {
    const rect = paper.el.getBoundingClientRect();
    let transition = prompt('Transition Name', 'T');
    const transitionElement = new joint.shapes.pn.Transition({
        position: { x: rect.left, y: rect.top },
        size: { width: 10, height: 50 },
        attrs: { '.label': { text: transition }, '.root': { stroke: '#000' } }
    });
    graph.addCell(transitionElement);
    transitionElements[transition] = transitionElement;
}

function addLink() {
    const input = prompt('Enter source & target names, separated by comma', 'P,T');
    if (!input) return; 

    const [sourceName, targetName] = input.split(',').map(param => param.trim());
    const source = placeElements[sourceName] || transitionElements[sourceName];
    const target = placeElements[targetName] || transitionElements[targetName];
    if (!source || !target) return;
    
    const linkElement = new joint.shapes.pn.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: { '.label': { text: input }, '.root': { stroke: '#000' } }
    });
    graph.addCell(linkElement);
    //linkElements[`${source.id},${target.id}`] = linkElement;
    linkElements.push(linkElement);
}

function plusMarker() {
    if (elementSelected && 
        elementSelected.get('type') === 'pn.Place') {
        let tokenCount = parseInt(elementSelected.get('tokens') || 0) + 1;
        elementSelected.set('tokens', tokenCount);
        elementSelected.trigger('change:tokens', elementSelected, tokenCount);
    }
}

function minusMarker() {
    if (elementSelected && 
        elementSelected.get('type') === 'pn.Place') {
        let tokenCount = parseInt(elementSelected.get('tokens') || 0);
        if (tokenCount > 0) {
            tokenCount--;
            elementSelected.set('tokens', tokenCount);
            elementSelected.trigger('change:tokens', elementSelected, tokenCount);  
        }      
    }
}

function executeBuild() {
    petriNetData = JSON.parse(JSON.stringify(generateJSON()));
    const optimizedData = PetriNet.optimizeJSON(petriNetData);
    petriNet = new PetriNet(    
        optimizedData.places, 
        optimizedData.transitions, 
        optimizedData.incidenceMatrix, 
        optimizedData.initialMarking);

    updateMarking(petriNet.currentMarking);
    console.log(petriNet.enabledTransitions);
    updateEnabledTransitions(petriNet.enabledTransitions);
}

// Function to download JSON data
function downloadJSON() {
    const fileName = prompt('PetriNets File Name', 'petrinets.json');
    const jsonData = generateJSON();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}