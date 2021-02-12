/*
only array initiates ul
strings, numbers and objects (single key-val pairs) are attached to li of ul;
objects only exists as a single key-val pair;
if object has several key-val pairs - convert it into an array, 
with each ele being a single key-val pair
(this way adding removing a title is as simple as 
adding and removing key from key-val pair)
*/

const showText = (parent, txt, name) => {
    const parentName = parent.id.split('_')[0]; // should be 'li'
    const grandParent = parent.parentNode;
    const grandParentName = grandParent.id.split('_')[0]; // should be 'ul'

    const textArea = getTextArea(parentName);
    const editBtns = getEditButtons(grandParentName, parentName);
        
    textArea.innerHTML = txt;//jsonHtmlify(txt);
    parent.appendChild(textArea);
    parent.appendChild(editBtns);
}

const showArray = (parent, arr, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    // add [val] to name unless we're at a root of `General Information`
    const baseName = (parent.id === 'city[generalInfo]') ? name : `${name}[val]`;
    
    // create the new ul for array
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    //ul.setAttribute('id', `${name}_ul`);
    ul.setAttribute('id', `${baseName}_ul`); // <-- TEST
    
    for (let i = 0; i < arr.length; i++) {

        // create new li for array element
        const item = arr[i];
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item');
        //li.setAttribute('id', `${name}[${i}]_li`);
        li.setAttribute('id', `${baseName}[${i}]_li`); // <-- TEST
        ul.appendChild(li); // set parent-child before `resolveSingleItem()`!

        // append [val] to name unless val is a 'leaf' (text/num)
        //const childName = (typeof(item) === 'string' || typeof(item) === 'number') ? 
        //    `${name}[${i}]` : `${name}[${i}][val]`;
        const childName = `${baseName}${i}]`; // <-- TEST

        resolveSingleItem(li, item, childName, lvl, ignoredKeyList);

    }
    parent.appendChild(ul);

    // add edit buttons unless we're at a root of `General Information`
    if (parent.id !== 'city[generalInfo]') {
        const parentName = parent.id.split('_')[0];
        const grandParentName = parent.parentNode.id.split('_')[0];
        const editBtns = getEditButtons(grandParentName, parentName);
        parent.appendChild(editBtns);
    }    
}

const addKeyValPairToLi = (parent, key, val, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    
    const parentName = parent.id.split('_')[0];
    //const childName = (typeof(val) === 'string' || typeof(val) === 'number') ? 
    //    parent.id.split('_')[0] : `${parent.id.split('_')[0]}[val]`;
    const childName = parent.id.split('_')[0]; // <-- TEST

    if (!ignoredKeyList.includes(key)) {

        // const collapsable = makeDetails(
        //     key, val, `${name}`, lvl, ignoredKeyList
        // );
        // parent.appendChild(collapsable);

        // add key - title
        const titleArea = getTitleArea(parentName);
        titleArea.value = key;//jsonHtmlify(key);
        parent.appendChild(titleArea)

        // add val - info
        resolveSingleItem(parent, val, childName, lvl+1, ignoredKeyList);
    }
}

const addCitiesToUL = (ul, obj, lvl, ignoredKeyList) => {
    if (obj.cities) {
        const baseName = 'cities';
        for (let i = 0; i < obj.cities.length; i++) {

            const city = obj.cities[i];
            const li = document.createElement('li');
            li.setAttribute('class', 'BY-ADD-CITIES-TO-UL list-group-item');
            li.setAttribute('id', `${baseName}[${i}]_li`);
            ul.appendChild(li); // set parent - child before `resolveSingleItem()`

            // // get collapsable city info
            // const collapsable = makeDetails(
            //     `${city.name} (${city.code})`, city, `${baseName}[${i}]`, lvl, ignoredKeyList
            // );
            // // add city buttons next to city name
            // //(since several cities area added - we must be on Area page,
            // // so there's no need to add link that redirects back to parent area)
            // const summary = collapsable.firstChild;
            // const btns = getCityButtons(city, ['edit', 'del']);
            // summary.appendChild(btns);            
            // li.appendChild(collapsable);

            // add key - title
            const titleArea = getTitleArea(parentName);
            titleArea.value = `${city.name} (${city.code})`;//jsonHtmlify(key);
            li.appendChild(titleArea)

            // add val - info
            resolveSingleItem(li, city, childName, lvl+1, ignoredKeyList);
        }
    }
}

const showKeyValPair = (parent, obj, name, lvl, ignoredKeyList) => {
    //const suffix = parent.id.match(/\[[0-9]\]_(.*)$/);
    //const grandParentUlName = `${parent.id.replace(suffix, '')}_ul`;
    //const grandParent = document.getElementById(grandParentUlName);
    const parentName = parent.id.split('_')[0]; // should be `li`
    const grandParent = parent.parentNode;
    const grandParentName = grandParent.id.split('_')[0]; // should be `ul`

    const keys = Object.keys(obj).filter(key => !ignoredKeyList.includes(key));
    
    if ( !keys.length ) {
        // if there are no valid keys - make blank field
        //console.log('key-val is void...');
        getNewUl(parentName);
    } else if ( keys.length > 1 ) {
        // if there are several keys - the format is wrong
        // we need to convert it to a list of key-val pairs and append to grandparent ul
        //console.log('multiple key-vals!!! converting to array!!!')
        const arr = keys.map(key => ({key: obj[key]}));
        resolveSingleItem(grandParent, arr, grandParentName, lvl, ignoredKeyList);
    } else if ( keys[0] === 'cities' ) {
        // if the key is 'cities' - append them to grandParent
        //resolveSingleItem(grandParent, obj.cities, grandParentUlName, lvl, ignoredKeyList);
        //console.log('key-val ok! (cities)');
        addCitiesToUL(grandParent, obj.cities, lvl, ignoredKeyList);
    } else {
        // if there is exactly one valid key - treat it normally
        //console.log('key-val ok!');
        const val = obj[keys[0]];
        addKeyValPairToLi(parent, keys[0], val, lvl, ignoredKeyList);

        // only add buttons if val is not string/num
        // to avoid adding btns for the same info in `showText()`
        if (!typeof(val) === 'string' && !typeof(val) === 'number') {
            const editBtns = getEditButtons(grandParentName, parentName);
            parent.appendChild(editBtns);
        }
    }
}