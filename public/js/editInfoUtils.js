/*
Naming Conventions (id's and names of HTML elements):

Element's id/name is composed of:
    root
  + **alternating** [<idx>] and [val] 
  + suffix indicating the type of element, e.g.:

  - root: any, e.g., `city[General Information]`
  - ul: 
        `<root>[<idx>][val]...[<idx>][val]_ul`
  - li (direct child of ul): 
        `<root>[<idx>][val]...[<idx>][val][<idx>]_li`
  - title (direct child of li): 
        `<root>[<idx>][val]...[<idx>][val][<idx>][key]`
  - text (direct child of li): 
        `<root>[<idx>][val]...[<idx>][val][<idx>][val]`
  - buttons (grandchild of li via helper div):
        `<root>[<idx>][val]...[<idx>][val][<idx>]_<btn>`

Form elements can be either:
  - strings/nums (info without a title)
  - key-value pairs (info with title [key]) [not fullfledged objects, see below]
  - arrays  

Keys in key-value pairs can only be of type string/number; however elements
of the arrays and values in key-value pairs can be either of the above three 'types'.

Objects with multiple key-value pairs are forbidden. If an object with mutiple
key-value pairs has to be used, it is converted into an array, where each element
is a key-value pair.

This way it's possible to have a mix of key-value pairs, arrays and strings/numbers
in a single form; and switching from text to titled text (key-val) is quite painless
(aside from the part where all child/sibling indices need to be updated).

UL elements are created ONLY when array is encountered in a form. 
Key-val pairs, child arrays and texts/nums are appended  
to LI elements of parent UL.

If there's a titled info, elements with suffices `[key]` and `[val]` are added
to LI. If no title is added orr title is removed, only `[val]`-suffixed element 
is present. Every child in a form that carries some information (not just html
helper container) is always given `[val]` suffix. For this reason elements' names
always have **alternating** `[<idx>]` and `[val]`.
*/

const addTextForEdit = (parent, txt) => {
    const parentName = parent.id.split('_')[0]; // should be 'li'
    const grandParent = parent.parentNode;
    const grandParentName = grandParent.id.split('_')[0]; // should be 'ul'

    const textArea = getTextArea(parentName);
    const editBtns = getEditButtons(grandParentName, parentName);
        
    textArea.innerHTML = txt;//jsonHtmlify(txt);
    parent.appendChild(textArea);
    parent.appendChild(editBtns);
}

const addArrayForEdit = (parent, arr, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    // add [val] to name unless we're at a root of `General Information`
    const baseName = (FORMFIELDROOTS[parent.id]) ? 
        FORMFIELDROOTS[parent.id] : `${parent.id.split('_')[0]}[val]`;
    
    // create the new ul for array
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    ul.setAttribute('id', `${baseName}_ul`);
    
    for (let i = 0; i < arr.length; i++) {

        // create new li for array element
        const item = arr[i];
        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item');
        li.setAttribute('id', `${baseName}[${i}]_li`); 
        ul.appendChild(li); // set parent-child before `resolveSingleItem()`!
        
        resolveSingleItem(li, item, ignoredKeyList, lvl);
    }
    parent.appendChild(ul);

    // add edit buttons unless we're at a root of `General Information`
    if (!FORMFIELDROOTS[parent.id]) {
        const parentName = parent.id.split('_')[0];
        const grandParentName = parent.parentNode.id.split('_')[0];
        const editBtns = getEditButtons(grandParentName, parentName);
        parent.appendChild(editBtns);
    }    
}

const addKeyValPairToLi = (parent, key, val, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    
    const parentName = parent.id.split('_')[0];

    if (!ignoredKeyList.includes(key)) {
        // add key - title
        const titleArea = getTitleArea(parentName);
        titleArea.value = key;//jsonHtmlify(key);
        parent.appendChild(titleArea)

        // add val - info
        resolveSingleItem(parent, val, ignoredKeyList, lvl+1);
    }
}

const addCitiesToUL = (ul, obj, ignoredKeyList, lvl) => {
    if (obj.cities) {
        const baseName = 'cities';
        for (let i = 0; i < obj.cities.length; i++) {

            const city = obj.cities[i];
            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item');
            li.setAttribute('id', `${baseName}[${i}]_li`);
            ul.appendChild(li); // set parent - child before `resolveSingleItem()`

            // add key - title
            const titleArea = getTitleArea(parentName);
            titleArea.value = `${city.name} (${city.code})`;//jsonHtmlify(key);
            li.appendChild(titleArea)

            // add val - info
            resolveSingleItem(li, city, ignoredKeyList, lvl+1);
        }
    }
}

const addObjectForEdit = (parent, obj, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    const parentName = parent.id.split('_')[0]; // should be `li`
    const grandParent = parent.parentNode;
    const grandParentName = grandParent.id.split('_')[0]; // should be `ul`

    const keys = Object.keys(obj).filter(key => !ignoredKeyList.includes(key));
    
    if ( !keys.length ) {
        // if there are no valid keys - make blank field
        getNewUl(parentName);

    } else if ( keys.length > 1 ) {
        // if there are several keys - the format is wrong
        // we need to convert it to a list of key-val pairs and append to grandparent ul
        const arr = keys.map(key => ({key: obj[key]}));
        resolveSingleItem(grandParent, arr, ignoredKeyList, lvl);

    } else if ( keys[0] === 'cities' ) {
        // if the key is 'cities' - append them to grandParent
        addCitiesToUL(grandParent, obj.cities, ignoredKeyList, lvl);

    } else {
        // if there is exactly one valid key - treat it normally
        const val = obj[keys[0]];
        addKeyValPairToLi(parent, keys[0], val, ignoredKeyList, lvl);

        // only add buttons if val is not string/num
        // to avoid adding btns for the same info in `showText()`
        if (!typeof(val) === 'string' && !typeof(val) === 'number') {
            const editBtns = getEditButtons(grandParentName, parentName);
            parent.appendChild(editBtns);
        }
    }
}