const Area = require('../models/area.js');

const jsonEscape = (str) => {
    // return str
    //     .replace(/\n/g, "\\\\n")
    //     .replace(/\r/g, "\\\\r")
    //     .replace(/\t/g, "\\\\t")
    //     .replace(/"/g, "\\\"")
    //     .replace(/'/g, "\\\"")
    //     ;
    return str
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/"/g, "\\\"")
        .replace(/'/g, "\\\"")
    ;
}

module.exports.jsonEscape = jsonEscape;

const parseMixedSchema = ( inArray ) => {
    // input should be either of type string (escape and return)...    
    if (typeof(inArray) === 'string') {
        return jsonEscape(inArray);
    }

    // ...or array (parse recursively)
    let outArray = [];
    for (let inEle of inArray) {
        let outEle;
        if (inEle.val) {
            let val = parseMixedSchema(inEle.val);
            if (inEle.key) {
                outEle = new Object();
                outEle[inEle.key] = val;
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
    let defaultArea = await Area.findOne({ name: 'DEFAULT AREA' });
    if ( !defaultArea ) {
        defaultArea = new Area({
            name: 'DEFAULT AREA',
            code: 'DEFAULT AREA',
            color: '#ff0000',
            quickInfo: 'default area',
            'General Information': 
            [   `DEFAULT AREA was created because you have recently ` +
                'deleted an area which had some cities assigned to it. ' +
                'The information on these cities is not lost and is ' + 
                'temporarily stored here. You can now reassign these cities ' +
                'to correct areas. After that feel free to delete this area.'],
        });
        defaultArea.markModified('General Information');
    }    
    return defaultArea;
}

module.exports.getOrCreateDefaultArea = getOrCreateDefaultArea;