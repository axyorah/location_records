const genInfoRootHtml = document.getElementById('city[generalInfo]');
const FORMFIELDROOTS = {
    'city[generalInfo]': 'city[General Information]'
};

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

const resolveSingleItem = (parent, item, ignoredKeyList, lvl) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);    

    if ( item === undefined ) {
        const ul = getNewUl(parent.id.split('_')[0]);
        parent.appendChild(ul); 
        // always add btns

    } else if ( typeof(item) === 'string' || typeof(item) === 'number' ) {
        addTextForEdit(parent, item); 
        // always adds btns

    } else if ( Array.isArray(item) ) {
        addArrayForEdit(parent, item, ignoredKeyList, lvl); 
        // adds buttons unless parent is a root of `General Information`

    } else {
        addObjectForEdit(parent, item, ignoredKeyList, lvl); 
        // adds buttons only for nested objs to avoid adding btns twice 
        // for the same val in case of key-val pair where val is string/num
    }
}

// const makeDetails = (key, val, name, ignoredKeyList, lvl) => {
//     ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
//     lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

//     const details = document.createElement('details');
//     const summary = document.createElement('summary');
        
//     summary.setAttribute('class', 'd-flex align-items-center');
    
//     const titleArea = getTitleArea(name);
//     const editBtns = getEditButtons(name, name);

//     titleArea.value = key;//jsonHtmlify(key);
    
//     summary.appendChild(titleArea); // key: title    
//     details.appendChild(summary);
    
//     resolveSingleItem(details, val, `${name}[val]`, lvl+1, ignoredKeyList);

//     details.appendChild(editBtns); // edit btns   

//     return details;
// }

const showGenInfoInit = (item) => {    
    resolveSingleItem(genInfoRootHtml, item, ignoredKeyList);    
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showGenInfoInit(item['General Information']);
}