const jsonEscape = (str) => {
    return str
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
        .replace(/\t/g, "\\\\t")
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