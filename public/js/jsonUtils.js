const jsonEscape = (str) => {
    return str
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
        .replace(/\t/g, "\\\\t")
        ;
}

const jsonHtmlify = (str) => {
    return String(str)
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")        
        .replaceAll("\"", "&quot;")
        .replaceAll("\'", "&apos;")
        .replaceAll("&", "&amp;")
        .replaceAll("\\n", "<br>")
        .replaceAll("\\r", "")
        .replaceAll("\\t", "&#9;")
        ;
}