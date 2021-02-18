const FORMFIELDROOTS = {
    'city[generalInfo]': 'city[General Information]',
    'area[generalInfo]': 'area[General Information]'
};

// resp fields will not be displayed in the browser
const ignoredKeyList = [
    'name', 
    'quickInfo', 
    'geometry', 
    'code', 
    'area', 
    'color',
    '_id', 
    '__v'
]

const showGenInfoInit = (item) => {
    if ( typeof(item) === "string" || typeof(item) === "number" ) {
        resolveSingleItem(genInfoRootHtml, [item], ignoredKeyList);
    } else {
        resolveSingleItem(genInfoRootHtml, item, ignoredKeyList);
    }    
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showGenInfoInit(item['General Information']);
}