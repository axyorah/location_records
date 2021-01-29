const getUuid = (num) => {
    num = (num === undefined) ? 16 : num;
    return uuid = 'collapsable-'+[...Array(num)].map(() => Math.floor(Math.random()*10)).join('');
}

const resolveSingleItem = (val, lvl, ignoredKeyList) => {
    const div = document.createElement('div');

    if (typeof(val) === 'string' || typeof(val) === 'number') {
        div.innerText = val;
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

    summary.innerHTML = key;
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
    a.innerHTML = `<h${lvl}>${key}</h${lvl}>`;

    const collapsableDiv = document.createElement('div');    
    collapsableDiv.setAttribute('class', 'collapse');
    collapsableDiv.setAttribute('id', uuid);
    collapsableDiv.appendChild(resolveSingleItem(val, lvl, ignoredKeyList));

    outerDiv.appendChild(a);
    outerDiv.appendChild(collapsableDiv);

    return outerDiv;
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

    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    for (let key in obj) {
        if (!ignoredKeyList.includes(key) && key !== 'cities') {
            const val = obj[key];

            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            
            const collapsable = makeCollapsable(key, val, lvl, ignoredKeyList);            

            li.appendChild(collapsable);

            ul.appendChild(li);
        }
    }

    // show cities after everything else
    if (obj.cities) {
        //const cities = showCities(obj.cities, lvl, ignoredKeyList);
        for (let city of obj.cities) {
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            
            const collapsable = makeCollapsable(
                `${city.name} (${city.code})`, city, lvl, ignoredKeyList);            

            li.appendChild(collapsable);

            ul.appendChild(li);
        }
    }

    // i'd want the same for `general`...

    return ul;
}