const jsonEscape = (str) => {
    // click on city:
    // -  \" instead of " 
    // - \n are fine,
    // mouse hover or accessing city from area:
    // - " are fine
    // - \n are missing
    // return str
    //     .replace(/\n/g, "\\n")
    //     .replace(/\r/g, "\\r")
    //     .replace(/\t/g, "\\t")
    //     .replace(/"/g, "\\\"")
    //     .replace(/'/g, "\\\"")
    //     ;
    // --------------------------
    // click on city:
    // - \" instead of "
    // - newlines show 2 extra \ (for \n and \r)
    // mouse hover or accessing city from area
    // - all good
    // return str
    //     .replace(/\n/g, "\\\\n")
    //     .replace(/\r/g, "\\\\r")
    //     .replace(/\t/g, "\\\\t")
    //     .replace(/"/g, "\\\"")
    //     .replace(/'/g, "\\\"")
    //     ;
    return str
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
        .replace(/\t/g, "\\\\t")
        .replace(/"/g, "\\\"")
        .replace(/'/g, "\\\"")
        ;
}

module.exports.jsonEscape = jsonEscape;

module.exports.parseMixedSchema = ( inArray ) => {
    let outArray = [];
    for (let inEle of inArray) {
        let outEle;
        // if val is string
        const val = jsonEscape(inEle.val); // should recursively call parseMixedSchema
        if (inEle.key && inEle.val) {
            outEle = new Object();
            outEle[inEle.key] = val;
        } else {
            outEle = val;
        }
        outArray.push(outEle);
    }
    return outArray;
}