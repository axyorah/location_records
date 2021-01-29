const regionNameHtml = document.querySelector('#region-name');
const regionInfoHtml = document.querySelector('#region-info');

const showQuickInfo = (el, code) => {
    // show quick info on map
    el.html(el.html() + '<br>' + data[code].quickInfo);
}

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
    const ingoredKeyList = ['name', 'quickInfo', 'geometry', 'code', 'area', '_id', '__v']
    regionInfoHtml.appendChild(showObject(item, lvl, ingoredKeyList));
}

showFullInfo(JSON.parse(itemJSON));