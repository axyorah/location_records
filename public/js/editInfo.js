const genInfoRootHtml = document.getElementById('city[generalInfo]');
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

const resolveSingleItem = (parent, item, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);
    

    if ( item === undefined ) {
        //console.log(`resolving undefined: ${item}`);
        const ul = getNewUl(name);
        parent.appendChild(ul); 
        // always add btns

    } else if ( typeof(item) === 'string' || typeof(item) === 'number' ) {
        //console.log(`resolving string/num:`);
        //console.log(item);
        showText(parent, item, name); 
        // always adds btns

    } else if ( Array.isArray(item) ) {
        //console.log(`resolving array:`);
        //console.log(item);
        showArray(parent, item, name, lvl, ignoredKeyList); 
        // always adds buttons

    } else {
        //console.log(`resolving key-val:`);
        //console.log(item);
        showKeyValPair(parent, item, name, lvl, ignoredKeyList); 
        // adds buttons only for nested objs to avoid adding btns twice 
        // for the same val in case of key-val pair where val is string/num
    }
}

const makeDetails = (key, val, name, lvl, ignoredKeyList) => {
    ignoredKeyList = (ignoredKeyList === undefined) ? [] : ignoredKeyList;
    lvl = (lvl === undefined) ? 5 : Math.min(lvl, 5);

    //const ul = document.createElement('ul');
    //ul.setAttribute('class', 'BY-MAKEDETAILS list-group list-group-flush');
    //ul.setAttribute('id', `${name}_ul`);
            
    
    //const div = resolveSingleItem(val, name, lvl+1, ignoredKeyList);
    

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    //const h = document.createElement(`h${lvl}`);   
        
    summary.setAttribute('class', 'd-flex align-items-center');
    //summary.setAttribute('id', `${name}[key]`);
    //summary.setAttribute('name', `${name}[key]`);
    // h.setAttribute('class', 'd-inline');
    // h.innerHTML = jsonHtmlify(key);  
    
    const titleArea = getTitleArea(name);
    const editBtns = getEditButtons(name, name);

    //textArea.innerHTML = jsonHtmlify(key);
    titleArea.value = key;//jsonHtmlify(key);
    
    //summary.appendChild(h); 
    summary.appendChild(titleArea); // key: title    
    details.appendChild(summary);
    
    //details.appendChild(div); // val: info
    resolveSingleItem(details, val, `${name}[val]`, lvl+1, ignoredKeyList);

    details.appendChild(editBtns); // edit btns
    console.log('adding buttons from makeDetails');
   

    return details;
}

const showGenInfoInit = (obj) => {
    const name = 'city[General Information]';

    // const ul = document.createElement('ul');
    // ul.setAttribute('id', `${name}_ul`);
    // ul.setAttribute('class', 'BY-SHOW-GEN-INFO-INIT list-group list-group-flush my-2')

    const lvl = 5;
    //const li = resolveSingleItem(ul, obj, name, lvl, ignoredKeyList);
    //ul.appendChild(li);
    resolveSingleItem(genInfoRootHtml, obj, name, lvl, ignoredKeyList);
    
    //genInfoRootHtml.appendChild(ul);    
}

if (selectedJSON) {
    const item = JSON.parse(jsonEscape(selectedJSON));
    showGenInfoInit(item['General Information']);
}