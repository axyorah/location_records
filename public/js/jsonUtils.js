const jsonEscape = (str) => {
    // can't handle backslashes...
    return str
        //.replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/"/g, "\"")
        .replace(/'/g, "\"")
        ;
}

const jsonHtmlify = (str) => {
    return String(str)
        .replaceAll("&", "&amp;") // `&` sanitized before  `<,>,",'`
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")

        //.replaceAll("\\\\", "&#92;")

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