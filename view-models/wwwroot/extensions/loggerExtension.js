import { BaseExtension } from './BaseExtension.js';

// *******************************************
// Custom Property Panel
// *******************************************
function CustomPropertyPanel(viewer, options) {
    this.viewer = viewer;
    this.options = options;
    this.nodeId = -1; // dbId of the current element showing properties
    Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(this, this.viewer);
}
CustomPropertyPanel.prototype = Object.create(Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);
CustomPropertyPanel.prototype.constructor = CustomPropertyPanel;

CustomPropertyPanel.prototype.setProperties = function (properties, options) {
    Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setProperties.call(this, properties, options);
    console.log("2")
    // add your custom properties here
    // for example, let's show the dbId and externalId
    var _this = this;
    // dbId is right here as nodeId
    this.addProperty('dbId', this.propertyNodeId, 'Custom Properties');
    // externalId is under all properties, let's get it!
    this.viewer.getProperties(this.propertyNodeId, function (props) {
        _this.addProperty('externalId', props.externalId, 'Custom Properties');
    })
}

CustomPropertyPanel.prototype.setNodeProperties = function (nodeId) {
    Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setNodeProperties.call(this, nodeId);
    this.nodeId = nodeId; // store the dbId for later use
};

function findPanel() {
    let element = document.querySelector('#ViewerPropertyPanel-scroll-container');

    if (element) {
        
        element.style.visibility = 'hidden';
        // The element was found! You can now perform operations on it.
        let groups = element.querySelectorAll('.category');
        if (groups && groups.length > 1) {
            groups.forEach(group => {
                // Check the lmv-nodeid attribute
                let nodeId = group.getAttribute('lmv-nodeid');
                if (nodeId !== 'IFC' && nodeId !== '413_Pset_Windows') {
                    group.remove();
                }
            });
        }
        element.style.visibility = 'visible';
        // console.log(element);
    } else {
        // The element was not found.
        console.log('Element not found.');
    }
}

class LoggerExtension extends BaseExtension {
    load() {
        super.load();
        console.log('LoggerExtension loaded.');
        return true;
    }

    unload() {
        super.unload();
        console.log('LoggerExtension unloaded.');
        return true;
    }

    async onModelLoaded(model) {
        super.onModelLoaded(model);
        const props = await this.findPropertyNames(this.viewer.model);
        console.log('New model has been loaded. Its objects contain the following properties:', props);
        let element = document.querySelector('#preview');
        let canva = element.children[0]
        console.log(canva)
        canva.style = "height: 90%; width: 100%; overflow: hidden;"

        const controls = this.viewer.toolbar._controls;
        let Buttons = []

        Array.from(controls).forEach(element => {
            let controlsButtons = element._controls
            console.log(element)
            Array.from(controlsButtons).forEach(elementS => {
                Buttons.push(elementS)
            });
        });

        let i = 0;
        let first5 = Buttons.slice(0, 5)

        let rest = Buttons.slice(11)
        first5.forEach(element => {
            if (i === 0) { element.setIcon('icon') }
            else { element.setIcon(`icon${i}`) }
            i += 1;
        });
        rest.forEach(element => {
            if (i === 0) { element.setIcon('icon') }
            else { element.setIcon(`icon${i}`) }
            i += 1;
        });
        let functionb = first5[0].onClick
        first5[0].onClick = () => {
            functionb();
            first5[0].setIcon('icon');
        };

        let functionProper= rest[4].onClick
        rest[4].onClick = () => {
            functionProper()
            findPanel()
        };
        console.log(rest[4])
    }

    async onSelectionChanged(model, dbids) {
        super.onSelectionChanged(model, dbids);
        console.log('Selection has changed', dbids);
    }

    onIsolationChanged(model, dbids) {
        super.onIsolationChanged(model, dbids);
        console.log('Isolation has changed', dbids);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('LoggerExtension', LoggerExtension);