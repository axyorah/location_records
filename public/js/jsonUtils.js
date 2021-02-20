// for html elements that don't have .innerHTML attr (<input>)
const jsonTextify = (str) => {
    return String(str)
        .replaceAll("&lt;", "\u1438")
        .replaceAll("&gt;", "\u1433")
        .replaceAll("\\n", "\n")
        .replaceAll("\\r", "")
        .replaceAll("\\t", "\t")
        .replaceAll("&quot;", "\"")
        .replaceAll("&apos;", "\u02c8")
        ;        
}

// for html elements that do have .innerHTML attr (<p>, <textarea>)
const jsonHtmlify = (str) => {
    return String(str)
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")

        .replaceAll("\\\"", "&quot;") // click on city 
        .replaceAll("\\\'", "&apos;")

        .replaceAll("\"", "&quot;") // hover or access city from area
        .replaceAll("\'", "&apos;")

        .replaceAll("\\n", "<br>") // click on city
        .replaceAll("\\r", "")
        .replaceAll("\\t", "&#9;")

        .replaceAll("\n", "<br>") // hover or access city from area
        .replaceAll("\r", "")
        .replaceAll("\t", "&#9;")
        ;
}