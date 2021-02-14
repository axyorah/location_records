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
  - details (direct child of li)
        `<root>[<idx>][val]...[<idx>][val][<idx>]_details`
  - summary = title = key in key-val pair (direct child of details): 
        `<root>[<idx>][val]...[<idx>][val][<idx>][key]`
  - text (direct child of li for arrays, or direct child of details for obj): 
        `<root>[<idx>][val]...[<idx>][val][<idx>][val]`
  - buttons (grandchild of li via helper div):
        `<root>[<idx>][val]...[<idx>][val][<idx>]_<btn>`

Form elements can be either:
  - strings/nums (info without a title)
  - arrays  
  - objects 
    [unlike `edit.ejs`, objects with multiple key-val pairs are **allowed** in `show.ejs`]

Object keys can only be of type string/number; however elements
of the arrays and object values can be either of the above three 'types'.

Objects with multiple key-value pairs are **allowed** in `show.ejs`, 
as here we  get data directly from db as valid json objects.

This way it's possible to have a mix of key-value pairs, arrays and strings/numbers
in a single form; and switching from text to titled text (key-val) is quite painless
(aside from the part where all child/sibling indices need to be updated).

UL elements are created when either array of object is encountered in
json object (db entry on selected area/city). This is different to `edit.ejs`
where UL elements can only be created when array is encountered in a form.
Child objects, child arrays and texts/nums are appended to LI elements 
of parent UL.

Only objects are displayed using collapsable html <details>. Object keys are
set to <detail><summary> and object values are added as `innerHTML` to <details>.
In case of arrays, all elements of the arrays are displayed as is, no collapsable
elements are added.

Similarly, as in `edit.ejs` object keys (<details><summary>) are given id's 
with suffices `[key]` and object values, as well as array elements as given
id's with sufficies `[val]`.

Similarly as in `edit.ejs` html elements' names always have **alternating** 
`[<idx>]` and `[val]`.
*/

const addText = (parent, txt) => {
    const parentName = parent.id.split('_')[0]; // should be 'li'
    
    const textArea = document.createElement('div');
    textArea.setAttribute('id', `${parentName}[val]`);
        
    textArea.innerHTML = jsonHtmlify(txt);
    parent.appendChild(textArea);
}

const addArray = (parent, arr, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    // add [val] to name unless we're at a root of `General Information`
    const baseName = `${parent.id.split('_')[0]}[val]`;
    
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
}

const makeDetails = (parent, key, val, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);    

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const h = document.createElement(`h${lvl}`);   

    details.setAttribute('id', `${parent.id.split('_')[0]}_details`);  
    summary.setAttribute('id', `${parent.id.split('_')[0]}[key]`);      
    summary.setAttribute('class', 'd-flex align-items-center');
    h.setAttribute('class', 'd-inline');
    h.innerHTML = jsonHtmlify(key);    
    
    summary.appendChild(h); 
    details.appendChild(summary);
    parent.appendChild(details);

    resolveSingleItem(details, val, ignoredKeyList, lvl+1);
}

const addObject = (parent, obj, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    const baseName = `${parent.id.split('_')[0]}[val]`;
    
    // get valid keys
    const keys = Object.keys(obj)
        .filter(key => !ignoredKeyList.includes(key));    
    
    // create new ul and add valid key-val pairs to it
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    ul.setAttribute('id', `${baseName}_ul`);
    parent.appendChild(ul);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val  = obj[key];

        const li = document.createElement('li');
        li.setAttribute('class', 'list-group-item');
        li.setAttribute('id', `${baseName}[${i}]_li`);
        ul.appendChild(li);

        makeDetails(li, key, val, ignoredKeyList, lvl);
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

            makeDetails(li, `${city.name} (${city.code})`, city, ignoredKeyList, lvl);

            //add city buttons next to city name
            //(since several cities area added - we must be on Area page,
            // so there's no need to add link that redirects back to parent area)
            const summary = li.firstChild.firstChild; // li -> details -> summary
            const btns = getCityButtons(city, ['edit', 'del']);
            summary.appendChild(btns);
        }
    }
}

const addRootObject = (parent, obj, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    const baseName = 'selected';

    const specialKeyList = ['cities'];
    const regularKeyList = Object.keys(obj)
        .filter(key => !ignoredKeyList.includes(key))
        .filter(key => !specialKeyList.includes(key));

    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list-group list-group-flush');
    ul.setAttribute('id', `${baseName}_ul`);
    parent.appendChild(ul);

    // add valid non-city keys
    for (let i = 0; i < regularKeyList.length; i++ ) {
        const key = regularKeyList[i];
        const li = document.createElement('li');
        li.setAttribute('id', `${baseName}[${i}]_li`);
        li.setAttribute('class', 'list-group-item');
        ul.appendChild(li);

        makeDetails(li, key, obj[key], ignoredKeyList, lvl);
    }
    // add cities to ul
    addCitiesToUL(ul, obj, ignoredKeyList, lvl);
}

const resolveSingleItem = (parent, item, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    if (typeof(item) === 'string' || typeof(item) === 'number') {
        addText(parent, item);
    } else if (Array.isArray(item)) {
        addArray(parent, item, ignoredKeyList, lvl);
    } else {
        addObject(parent, item, ignoredKeyList, lvl);
    }
}