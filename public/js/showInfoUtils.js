const getUuid = (num) => {
    num = (num === undefined) ? 16 : num;
    return uuid = 'collapsable-'+[...Array(num)].map(() => Math.floor(Math.random()*10)).join('');
}

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

const addSubsetOfObjectKeysToUL = (ul, obj, lvl, keyList, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    
    let idx = 0;
    const baseName = ul.id.split('_')[0];

    for (let key of keyList) {
        if (!ignoredKeyList.includes(key)) {
            const val = obj[key];

            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            li.setAttribute('id', `${baseName}[${idx}]_li`);

            const collapsable = makeDetails(
                key, val, `${baseName}[${idx}]`, lvl, ignoredKeyList
            );

            li.appendChild(collapsable);

            ul.appendChild(li);
            
            idx += 1;
        }
    }
}

const addCitiesToUL = (ul, obj, lvl, ignoredKeyList) => {
    if (obj.cities) {
        const baseName = 'cities';
        for (let i = 0; i < obj.cities.length; i++) {

            const city = obj.cities[i];
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            li.setAttribute('id', `${baseName}[${i}]_li`);

            const collapsable = makeDetails(
                `${city.name} (${city.code})`, city, `${baseName}[${i}]`, lvl, ignoredKeyList
            );

            li.appendChild(collapsable);

            ul.appendChild(li);
        }
    }
}

const showArray = (arr, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);

    for (let i = 0; i < arr.length; i++) {

        const val = arr[i];
        const li = document.createElement('li');
        li.setAttribute('id', `${name}[${i}]_li`);

        const div = resolveSingleItem(val, `${name}[${i}]`, lvl, ignoredKeyList);

        li.appendChild(div);
        ul.appendChild(li);
    }
    return ul;
}

const showObject = (obj, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    const specialKeyList = ['cities'];
    const regularKeyList = Object.keys(obj).filter(key => !specialKeyList.includes(key));

    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    ul.setAttribute('id', `${name}_ul`);

    addSubsetOfObjectKeysToUL(ul, obj, lvl, regularKeyList, ignoredKeyList);
    addCitiesToUL(ul, obj, lvl, ignoredKeyList);

    return ul;
}