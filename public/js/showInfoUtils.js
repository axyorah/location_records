const getUuid = (num) => {
    num = (num === undefined) ? 16 : num;
    return uuid = 'collapsable-'+[...Array(num)].map(() => Math.floor(Math.random()*10)).join('');
}

const resolveSingleItem = (val, lvl, ignoredKeyList) => {
    const div = document.createElement('div');

    if (typeof(val) === 'string' || typeof(val) === 'number') {
        console.log('RESOLVE SINGLE ITEM');
        console.log(val);
        div.innerHTML = jsonHtmlify(val);
    } else if (Array.isArray(val)) {
        div.appendChild(showArray(val, 5, ignoredKeyList));
    } else {
        div.appendChild(showObject(val, 5, ignoredKeyList));
    }

    return div;
}

const makeDetails = (key, val, lvl, ignoredKeyList) => {
    const div = resolveSingleItem(val, ignoredKeyList);

    const details = document.createElement('details');
    const summary = document.createElement('summary');

    summary.innerHTML = jsonHtmlify(key);
    details.appendChild(summary);
    details.appendChild(div);

    return details;
}

const makeCollapsable = (key, val, lvl, ignoredKeyList) => {
    lvl = (lvl === undefined) ? 5 : lvl;
    const uuid = getUuid();

    const outerDiv = document.createElement('div');

    const a = document.createElement('a');
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('href', `#${uuid}`);
    a.setAttribute('aria-controls', uuid);
    a.innerHTML = `<h${lvl}>${jsonHtmlify(key)}</h${lvl}>`;

    const collapsableDiv = document.createElement('div');    
    collapsableDiv.setAttribute('class', 'collapse');
    collapsableDiv.setAttribute('id', uuid);
    collapsableDiv.appendChild(resolveSingleItem(val, lvl, ignoredKeyList));

    outerDiv.appendChild(a);
    outerDiv.appendChild(collapsableDiv);

    return outerDiv;
}

const addSubsetOfObjectKeysToUL = (ul, obj, lvl, keyList, ignoredKeyList) => {
    for (let key of keyList) {
        if (!ignoredKeyList.includes(key)) {
            const val = obj[key];

            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            
            const collapsable = makeCollapsable(key, val, lvl, ignoredKeyList);            

            li.appendChild(collapsable);

            ul.appendChild(li);
        }
    }
}

const addCitiesToUL = (ul, obj, lvl, ignoredKeyList) => {
    if (obj.cities) {
        for (let city of obj.cities) {
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            
            const collapsable = makeCollapsable(
                `${city.name} (${city.code})`, city, lvl, ignoredKeyList);            

            li.appendChild(collapsable);

            ul.appendChild(li);
        }
    }
}

const showArray = (arr, lvl, ignoredKeyList) => {
    const ul = document.createElement('ul');
    for (let val of arr) {
        const li = document.createElement('li');

        const div = resolveSingleItem(val, lvl, ignoredKeyList);

        li.appendChild(div);
        ul.appendChild(li);
    }
    return ul;
}

const showObject = (obj, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : lvl;

    const specialKeyList = ['cities'];
    const regularKeyList = Object.keys(obj).filter(key => !specialKeyList.includes(key));

    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');

    addSubsetOfObjectKeysToUL(ul, obj, lvl, regularKeyList, ignoredKeyList);
    addCitiesToUL(ul, obj, lvl, ignoredKeyList);

    return ul;
}