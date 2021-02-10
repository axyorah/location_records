// resp fields will not be displayed in the browser
const ingoredKeyList = [
    'name', 
    'quickInfo', 
    'geometry', 
    'code', 
    'area', 
    'color',
    '_id', 
    '__v'
]

const showFullInfo = (item) => {
    // show detailed info in right col
    // set region name
    if (item.name !== item.code) {
        regionNameHtml.innerHTML =  `${item.name} (${item.code})`;
    } else {
        regionNameHtml.innerHTML =  `${item.name}`;
    }    

    // remove data from previously clicked region
    while (regionInfoHtml.firstChild) {
        regionInfoHtml.removeChild(regionInfoHtml.lastChild);
    }

    // add data of currently selected region
    const lvl = 2;    
    regionInfoHtml.appendChild(
        showObject(item, 'selected', lvl, ingoredKeyList)
    );
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showFullInfo(item);
}
