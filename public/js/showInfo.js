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

const showFullInfo = (item) => {
    // show detailed info on City or Area next to the map

    // set City/Area name
    if ( item.area ) {
        // cities have ref to parent area        
        regionNameHtml.innerHTML =  `${item.name} (${item.code})`;

        // if user is loggen in - add edit buttons
        if ( username !== 'anonymous' ) {
            const btns = getCityButtons(item, ['back', 'edit', 'del']);
            regionNameHtml.appendChild(btns);
        }        
    } else if ( item.cities ) {
        // areas have ref to child cities        
        regionNameHtml.innerHTML =  `${item.name}`;

        // if user is loggen in - add edit buttons
        if ( username !== 'anonymous' ) {
            const btns = getAreaButtons(item, ['edit', 'del']);
            regionNameHtml.appendChild(btns);
        }
    } else {
        return;
    }

    // remove data from previously clicked region
    while (regionInfoHtml.firstChild) {
        regionInfoHtml.removeChild(regionInfoHtml.lastChild);
    }

    // add data of currently selected region
    const lvl = 2;    
    addRootObject(regionInfoHtml, item, ignoredKeyList, lvl);
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON)); // area
    showFullInfo(item);
}