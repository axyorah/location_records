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
    // show detailed info on City or Area next to the map

    // set City/Area name
    if ( item.area ) {
        // cities have ref to parent area
        const btns = getCityButtons(item, ['back', 'edit', 'del']);
        
        regionNameHtml.innerHTML =  `${item.name} (${item.code})`;
        regionNameHtml.appendChild(btns);
    } else if ( item.cities ) {
        // areas have ref to child cities
        const btns = getAreaButtons(item, ['edit', 'del']);
        
        regionNameHtml.innerHTML =  `${item.name}`;
        regionNameHtml.appendChild(btns);
    } else {
        return;
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
