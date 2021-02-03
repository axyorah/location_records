module.exports.parseMixedSchema = ( inArray ) => {
    let outArray = [];
    for (let inEle of inArray) {
        let outEle;
        const val = inEle.val; // should recursively call parseMixedSchema
        if (inEle.key && inEle.val) {
            outEle = new Object();
            outEle[inEle.key] = val;
        } else {
            outEle = inEle.val;
        }
        outArray.push(outEle);
    }
    return outArray;
}