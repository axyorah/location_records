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

const resolveSingleItem = (val, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    const div = document.createElement('div');

    if (typeof(val) === 'string' || typeof(val) === 'number') {
        div.innerHTML = jsonHtmlify(val);
    } else if (Array.isArray(val)) {
        div.appendChild(showArray(val, `${name}[val]`, lvl, ignoredKeyList));
    } else {
        div.appendChild(showObject(val, `${name}[val]`, lvl, ignoredKeyList));
    }

    return div;
}

const makeDetails = (key, val, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    
    const div = resolveSingleItem(val, name, lvl+1, ignoredKeyList);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const h = document.createElement(`h${lvl}`);   
        
    summary.setAttribute('class', 'd-flex align-items-center');
    h.setAttribute('class', 'd-inline');
    h.innerHTML = jsonHtmlify(key);    
    
    summary.appendChild(h); 
    details.appendChild(summary);
    details.appendChild(div);

    return details;
}

const makeCollapsable = (key, val, name, lvl, ignoredKeyList) => {
    // this only works if `id`s don't contain square brackets...
    // we can use `getUuid()` to generate random id's,
    // but this would inconsistent with `new` and `edit`
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    const uuid = getUuid(); // `name` doesn't work because of `[...]`

    const outerDiv = document.createElement('div');

    const a = document.createElement('a');
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('href', `#${uuid}`); //`#div[id=\"${uuid}\"]`); // nope x.x
    a.setAttribute('aria-controls', uuid);
    a.innerHTML = `<h${lvl}>${jsonHtmlify(key)}</h${lvl}>`;

    const collapsableDiv = document.createElement('div');    
    collapsableDiv.setAttribute('class', 'collapse');
    collapsableDiv.setAttribute('id', uuid);//`div[id=\"${uuid}\"]`); //
    collapsableDiv.appendChild(
        resolveSingleItem(val, name, lvl+1, ignoredKeyList)
    );

    outerDiv.appendChild(a);
    outerDiv.appendChild(collapsableDiv);

    return outerDiv;
}

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
        showObject(item, 'selected', lvl, ignoredKeyList)
    );
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showFullInfo(item);
}
