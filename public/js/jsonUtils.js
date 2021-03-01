// for html elements that don't have .innerHTML attr (<input>)
const jsonTextify = (str) => {
    return String(str)
        .replace(/&lt;/g, "\u1438")
        .replace(/&gt;/g, "\u1433")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "\t")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "\u02c8")
        ;
}

// for html elements that do have .innerHTML attr (<p>, <textarea>)
const jsonHtmlify = (str) => {
    return String(str)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

        .replace(/\\\"/g, "&quot;") // click on city 
        .replace(/\\\'/g, "&apos;")

        .replace(/\"/g, "&quot;") // hover or access city from area
        .replace(/\'/g, "&apos;")

        .replace(/\\n/g, "<br>") // click on city
        .replace(/\\r/g, "")
        .replace(/\\t/g, "&#9;")

        .replace(/\n/g, "<br>") // hover or access city from area
        .replace(/\r/g, "")
        .replace(/\t/g, "&#9;")
        ;
}