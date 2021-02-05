const jsonEscape = (str) => {
    return str
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
        .replace(/\t/g, "\\\\t")
        .replace(/"/g, "\"")
        .replace(/'/g, "\"")
        ;
}

const jsonHtmlify = (str) => {
    return String(str)
        .replaceAll("&", "&amp;") // `&` sanitized before  `<,>,",'`
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")

        .replaceAll("\\\"", "&quot;") // click on city (TEMP!!!)
        .replaceAll("\\\'", "&apos;")
        .replaceAll("\\\\n", "<br>")
        .replaceAll("\\\\r", "")
        .replaceAll("\\\\t", "&#9;") 

        .replaceAll("\"", "&quot;") // hover or access city from area
        .replaceAll("\'", "&apos;")
        .replaceAll("\\n", "<br>")
        .replaceAll("\\r", "")
        .replaceAll("\\t", "&#9;")
        ;
}