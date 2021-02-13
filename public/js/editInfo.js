const genInfoRootHtml = document.getElementById('city[generalInfo]');
const FORMFIELDROOTS = {
    'city[generalInfo]': 'city[General Information]'
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
    resolveSingleItem(genInfoRootHtml, item, ignoredKeyList);    
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showGenInfoInit(item['General Information']);
}