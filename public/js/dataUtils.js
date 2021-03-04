// resp fields will not be displayed in the browser
const ignoredDBKeys = [
    'name', 
    'quickInfo', 
    'geometry', 
    'code', 
    'area', 
    'collection',
    'color',
    'project',
    '_id', 
    '__v'
]

async function postData(url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            //'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy:'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data, //JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

function addDataToDOM (item, titleHtml, infoHtml) {
    // show detailed info on City or Area next to the map
    // set Location(City)/Collection(Area) name
    if ( item.area ) {
        // locations (cities) have ref to parent area        
        titleHtml.innerHTML =  
            `${jsonHtmlify(item.name)} (${jsonHtmlify(item.code)})`;

        const btns = getLocationButtons(item, ['back', 'edit', 'del']);
        titleHtml.appendChild(btns);     
    } else if ( item.cities ) {
        // collections (areas) have ref to child cities        
        titleHtml.innerHTML = `${jsonHtmlify(item.name)}`;

        const btns = getCollectionButtons(item, ['edit', 'del']);
        titleHtml.appendChild(btns);
    } else {
        return;
    }

    // remove data from previously clicked region
    while (infoHtml.firstChild) {
        infoHtml.removeChild(infoHtml.lastChild);
    }

    // add data of currently selected region
    const lvl = 2;    
    addRootObject(infoHtml, item, ignoredDBKeys, lvl);
}