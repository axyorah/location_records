
const sanitizeHtml = require('sanitize-html');
const Area = require('../models/area.js');
const Project = require('../models/project.js');

const jsonEscape = (str) => {
    return str.toString()
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

const parseMixedSchema = ( inArray ) => {
    // input should be either of type string (escape and return)...    
    if (typeof(inArray) === 'string') {
        return jsonEscape(sanitizeHtml(inArray));
    }

    // ...or array (parse recursively)
    let outArray = [];
    for (let inEle of inArray) {
        let outEle;
        if (inEle.val) {
            let val = parseMixedSchema(inEle.val);
            if (inEle.key) {
                outEle = new Object();
                outEle[jsonEscape(sanitizeHtml(inEle.key))] = val;
            } else {
                outEle = val;
            }
        }
        outArray.push(outEle);        
    }
    return outArray;
}

module.exports.parseMixedSchema = parseMixedSchema;

const getOrCreateDefaultArea = async () => {
    let defaultArea = await Area.findOne({ name: 'DEFAULT COLLECTION' });
    if ( !defaultArea ) {
        defaultArea = new Area({
            name: 'DEFAULT COLLECTION',
            code: 'DEFAULT COLLECTION',
            color: '#ff0000',
            quickInfo: 'default collection',
            'General Information': 
            [   `DEFAULT COLLECTION was created because you have recently ` +
                'deleted a collection which had some locations assigned to it. ' +
                'The information on these locations is not lost and is ' + 
                'temporarily stored here. You can now reassign these locations ' +
                'to correct collection. After that feel free to delete this collection.'],
        });
        defaultArea.markModified('General Information');
    }    
    return defaultArea;
}

module.exports.getOrCreateDefaultArea = getOrCreateDefaultArea;

const createDefaultProject = ( projectToken ) => {
    return new Project({
        name: 'My First Project',
        description: 
            jsonEscape(
            'It seems, this is your first project. '+
            'Most of the controls you will need are located on the menu bar on top of the screen. ' +
            'Additionally, there are edit and delete buttons that you can use. ' +
            'You can start by editing this project to adjust its name, description and map settings ' +
            '(center, zoom and style).\n\n' +
            'Once it is done, you can start populating the project with data. ' +
            'Start by creating a New Collection. ' +
            'It will not be visible on the map at first, but once you add a location to it, ' +
            'a marker will appear on the map at the chosen location with ' +
            'a color that you chose for the collection.\n\n' +
            'On project home page you can view all the collections that belong to this project. ' +
            'If you follow the collection-link you can see all the locations that belong to the collection.\n\n' +
            'You can also access the location-data from the map: ' +
            'hover over the location markers to see a short location/collection note ' +
            'or click  on the marker to see the detailed information.\n\n' +
            'You can always edit or delete any location or collection information ' +
            'by clicking location/collection edit or delete buttons. ' +            
            'Finally, you can create a New Project and share it with other people ' +
            'by sharing the Project Token, which is always visitble on the project home page. ' +
            ''
            ),
        lng: 0,
        lat: 25,
        zoom: 0.7,
        mapStyle: 'streets-v11',
        token: projectToken
    });
}

module.exports.createDefaultProject = createDefaultProject;