import { Diagram } from '../../src/diagram/diagram';
import { ConnectorModel } from '../../src/diagram/objects/connector-model';
import { NodeModel } from '../../src/diagram/objects/node-model';
import { Snapping } from '../../src/diagram/objects/snapping';
import { PrintAndExport } from '../../src/diagram/print-settings';
import { BackgroundModel, PageSettingsModel } from '../../src/diagram/diagram/page-settings-model';
import { IExportOptions } from '../../src/diagram/objects/interface/interfaces';
import { Image, Rect } from '../../src';
import {
    BpmnDiagrams
} from '../../src/diagram/index';
Diagram.Inject(Snapping, PrintAndExport, BpmnDiagrams);
//Diagram.Inject(BpmnDiagrams);


/**
 * printSettings
 */
let image: any;
let diagram: Diagram;
let connector: ConnectorModel = {
    id: 'connector1', sourcePoint: { x: 300, y: 300 }, targetPoint: { x: 500, y: 400 }
};
let node: NodeModel = {
    id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100, annotations: [{ content: 'Node1', height: 50, width: 50 }]
    ,shape: { type: 'Path', data: 'M150 0 L75 200 L225 200 Z' }
};
let node2: NodeModel = {
    id: 'node2', width: 80, height: 130, offsetX: 600, offsetY: 100, annotations: [{ content: 'Node2', height: 50, width: 50 }]
};
let node3: NodeModel = {
    id: 'node3', width: 100, height: 100, offsetX: 500, offsetY: 100,
    shape: {
        type: 'Bpmn', shape: 'Activity', activity: {
            activity: 'Task', task: {
                type: 'BusinessRule'
            }
        },
    },
};
let options: IExportOptions = {};

let background: BackgroundModel = {};
background.source = 'https://www.w3schools.com/images/w3schools_green.jpg';
background.color = 'yellow';
// options.multiplePage =  true;
options.pageOrientation = 'Landscape';
let pageSettings: PageSettingsModel = {};
pageSettings.multiplePage = true;
pageSettings.background = background;
pageSettings.showPageBreaks = true;
pageSettings.height = 300; pageSettings.width = 300;
pageSettings.orientation = 'Portrait';
diagram = new Diagram({
    width: '850px', height: '1000px', nodes: [node, node2, node3],
    connectors: [connector],
    pageSettings: pageSettings
});
diagram.appendTo('#diagram');
// document.getElementById('print').onclick = () => {
//     let options: IExportOptions = {};
//     options.mode = 'Data';
//     options.region = 'PageSettings';
//     options.stretch = 'Stretch';
//     options.multiplePage = false;
//     pageSettings.height = 700;
//     pageSettings.width = 500;
//     diagram.print(options);
// };
document.getElementById('print').onclick = () => {
    let options: IExportOptions = {};
    options.mode = 'Data';
        //options.region = 'PageSettings';
        options.region = 'PageSettings';
        options.stretch = 'Meet';
        options.multiplePage = false;
        options.pageHeight = 500;
        options.pageWidth = 500;
        diagram.print(options);
};
document.getElementById('export').onclick = () => {
    var options: IExportOptions = {};
    options.mode = 'Download';
    options.stretch = 'Meet';
    options.pageWidth = 500,
        options.pageHeight = 500,
        options.region = 'PageSettings';
        
       // options.region = 'Content';
    options.fileName = 'export';
    var data;
    image = data = diagram.exportDiagram(options);
};
document.getElementById('exportTypes').onchange = () => {
    let options: IExportOptions = {};
    options.mode = 'Data';
    let regionType: any = document.getElementById('regionTypes');
    options.region = regionType.value;
    options.fileName = 'export';
    let type: any = document.getElementById('exportTypes');
    options.format = type.value;
    if (options.region === 'CustomBounds') {
        //options.bounds = rect;
    }

    image = diagram.exportDiagram(options);
};
let regionTypes: any;
document.getElementById('regionTypes').onchange = () => {
    let options: IExportOptions = {};
    options.mode = 'Data';
    options.format = 'SVG';
    options.fileName = 'region';
    let type: any = document.getElementById('regionTypes');
    options.region = type.value;

    //diagram.exportDiagram(options);
};
let exportdiv: HTMLButtonElement = document.getElementById('exportdivelement') as HTMLButtonElement;
exportdiv.onclick = () => {
    let x = document.createElement('IMG');
    x.setAttribute('src', image);
    x.setAttribute('width', '304');
    x.setAttribute('height', '228');
    x.setAttribute('alt', 'The Pulpit Rock');
    document.getElementById('input1').appendChild(x);
}
document.getElementById('multiplePage').onchange = () => {
    let options: IExportOptions = {};
    options.mode = 'Data';
    options.format = 'PNG';
    options.fileName = 'multiplePage';
    options.region = 'PageSettings';
    let type: any = document.getElementById('multiplePage');
    if (type.checked) {
        options.multiplePage = true;
        options.pageHeight = 300;
        options.pageWidth = 300;
        options.pageOrientation = 'Landscape';
        diagram.exportDiagram(options);
    }
};


