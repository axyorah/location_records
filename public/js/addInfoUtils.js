const pattern = /\[(?<idx>[0-9]*)\]_(?<fun>btns|add|del|title|exp)$/;
const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
};
const expButtonText = {
    'exp': 'Expand',
    'col': 'Collapse'
};

const getBtnParentId = (btnId) => {
    const found = btnId.match(pattern);

    if (found) {
        const parentId = btnId.replace(found[0], '');
        return parentId;
    } else {
        console.log(`CAN\'T DERIVE BUTTON\'S PARENT ID FROM ${btnId}`);
    }
}

const getBtnChildId = (btnId) => {
    const found = btnId.match(pattern);

    if (found) {
        const parentId = btnId.replace(found[0], '');
        const idx = found.groups.idx;
        return `${parentId}[${idx}]`;
    } else {
        console.log(`CAN\'T DERIVE BUTTON\'S PARENT ID FROM ${btnId}`);
    }
}

const getBtnIdx = (btnId) => {
    const found = btnId.match(pattern);

    if (found) {
        return parseInt(found.groups.idx);
    } else {
        console.log(`CAN\'T DERIVE BUTTON\'S PARENT ID FROM ${btnId}`);
    }
}

const getTextArea = (childName) => {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'form-control');
    textArea.setAttribute('name', `${childName}[val]`);
    textArea.setAttribute('id', `${childName}[val]`);
    return textArea;
}

const getNewUl = (name) => {
    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);
    ul.setAttribute('class', 'list-group list-group-flush mt-2');

    addTextAreaToUl(ul);
    return ul;
}

const updateIdOfAllChildren = (parent, pattern, newIdx) => {
    // Note:
    // this function only updates ids of non-text elements 
    // that follow the pattern: `...[idx]_fun`, e.g., `city[info][11]_add`
    //(text elements follow a different pattern: 
    // `...[idx][key]` or `...[idx][val]` - they are updated separately)
    if (parent.children) {
        for (let child of parent.children) {
            
            const found = child.id.match(pattern);

            if (found) {
                const base = child.id.replace(found[0], '');
                const fun = found.groups.fun;
                const newId = `${base}[${newIdx}]_${fun}`;
                
                child.setAttribute('id', newId);                
            }

            updateIdOfAllChildren(child, pattern, newIdx);
        }
    }
}

const updateIdAndNameOfUlChildren = (ul) => {
    // adjust the indices of all the `li`s and  their children,
    // so that the indices in their ids are arranged in order:
    // start with `0` and end with `ul.children.length-1`;
    // - update id's (and names) of li, titles and textareas 'manually',
    // - update buttons id's via pattern matching:
    //     we're looking for a pattern: `...[idx]_fun`
    const name = ul.id.split('_')[0];
    
    let i = 0;
    for (let li of ul.children) {
        const newChildName = `${name}[${i}]`;
        const newLiName = `${newChildName}_li`;
        const newTextName = `${newChildName}[val]`;
        const newTitleName = `${newChildName}[key]`;

        // udpate li
        li.setAttribute('id', newLiName);
        li.setAttribute('class', 'list-group-item');

        // update title and textarea (they have both id and name)
        if (li.children.length == 3) {
            li.children[0].setAttribute('id', newTitleName);
            li.children[0].setAttribute('name', newTitleName);
        }
        li.children[li.children.length-2].setAttribute('id', newTextName);
        li.children[li.children.length-2].setAttribute('name', newTextName);
        
        // update other children recursively
        updateIdOfAllChildren(li, pattern, i);        
        i += 1;
    }
}

const insertNewChildAtIdxToParent = (parent, newChild, idx) => {
    // temporarily remove all children at idx+
    let lastChildren = [];
    for (let i = parent.children.length - 1; i >= idx; i--) {
        const child = parent.children[i];
        lastChildren.push(child);
        parent.removeChild(child);
    }

    // append new child at the end
    parent.appendChild(newChild);

    // reattach the removed children
    for (let i = lastChildren.length-1; i >= 0; i--) {
        const child = lastChildren[i];
        parent.appendChild(child);
    }
}

const addTextAreaToUl = (ul) => {
    // append empty textarea at the end of ul;
    // recall ul structure: ul{ li[i]{[title,] textArea, editButtons}}

    const parentName = ul.id.split('_')[0];
    const childName = `${parentName}[${ul.children.length}]`;
        
    // get textArea
    const textArea = getTextArea(childName);

    // get editButtons
    const editBtns = getEditButtons(parentName, childName);
    
    // add new li to ul;
    // by default new li only contains textarea and edtiButtons
    const li = document.createElement('li');
    li.setAttribute('id', `${childName}_li`);
    li.setAttribute('class', 'list-group-item');
    li.appendChild(textArea);
    li.append(editBtns);

    ul.appendChild(li);
}

const insertTextAreaAtIdxToUl = (ul, idx) => {
    // insert textarea at a given idx location
    // // recall ul structure: ul{ li[i]{[title,] textArea, editButtons}}

    // initially give new child an idx 
    // that wouldn't conflict with existing children
    const parentName = ul.id.split('_')[0];
    const childName = `${parentName}[${ul.children.length}]`;
        
    // get textArea
    const textArea = getTextArea(childName);

    // get editButtons
    const editBtns = getEditButtons(parentName, childName);
    
    // add new li to ul;
    // by default new li only contains textarea and edtiButtons
    const li = document.createElement('li');
    li.setAttribute('id', `${childName}_li`);
    li.setAttribute('class', 'list-group-item my-2');
    li.appendChild(textArea);
    li.append(editBtns);

    // insert li at ul at specified location
    insertNewChildAtIdxToParent(ul, li, idx);

    // update indices of all li's
    updateIdAndNameOfUlChildren(ul);
}

const addTitleToLi = (li) => {
    // li id/name: `...[idx]_li`
    const name = li.id.split('_')[0];

    // add title to last li of ul
    const title = document.createElement('input');
    title.setAttribute('class', 'form-control');
    title.setAttribute('type', 'text');
    title.setAttribute('name', `${name}[key]`);
    title.setAttribute('id', `${name}[key]`);
    title.placeholder = 'Title'

    li.prepend(title);    
}

const getTextFromAllChildren = (parent) => {
    if (!parent.children.length) {
        return [parent.value];
    }

    let texts = [];
    for (let child of parent.children) {
        if (!child.id.match(/_btns/)) {
            const newTexts = getTextFromAllChildren(child);
            texts.push(...newTexts);
        }
    }
    return texts;
}

const expandLi = (li) => {
    const childName = `${li.id.split('_')[0]}[val]`;

    // 1. get all texts of li's child textArea;
    //   (ignore title if present)
    // 2. remove all existing textArea children of li
    //   (since li is collapsed, there should only be one such textArea)
    let idx;
    let oldTexts;
    for (let i = 0; i < li.children.length; i++) {
        const child = li.children[i];
        if (child.id.match(/\[val\]$/)) {
            idx = i;
            oldTexts = getTextFromAllChildren(child);
            li.removeChild(child);
            break;
        }
    }

    // 3. create new ul
    const newUl = getNewUl(childName);
    const newLi = newUl.children[0];    
    const newTextArea = newLi.children[0];
    newTextArea.value = oldTexts.join('\/n');

    // 4. add newUl as a new child of li instead of removed textArea
    insertNewChildAtIdxToParent(li, newUl, idx);
}

const collapseLi = (li) => {
    const childName = li.id.split('_')[0];

    // 1. get all texts of li's inner ul and all its children
    // 2. remove inner ul
    let ulChild;
    let idx;
    for (let i = 0; i < li.children.length; i++) {
        const child = li.children[i];
        if (child.id.match(/_ul$/)) {
            ulChild = child;
            li.removeChild(child);
            idx = i;
            break;
        }
    }
    const oldTexts = getTextFromAllChildren(ulChild); 

    // 3. paste the old texts to a single new text area
    const textArea = getTextArea(childName);
    textArea.value = oldTexts.join('\n');

    // 4. insert the new text area to li instead of collapsed ul
    const btns = li.lastChild;
    li.removeChild(btns);
    li.appendChild(textArea);
    li.appendChild(btns);
}

const getButton = (name, suffix) => {
    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('id', `${name}_${suffix}`);
    btn.setAttribute('type', 'button');

    return btn;
}

const getAddButton = (parentName, childName) => {  
    // both parentName and childName are only valid 
    // at the moment button creation!
    // insertion/deletion will modify the name,
    // so refer to `btn.id` instead!  
    const btn = getButton(childName, 'add');
    btn.innerHTML = '&#65291;';//'Add New Field';

    btn.addEventListener('click', function (evt) {
        parentName = getBtnParentId(btn.id);
        let idx = getBtnIdx(btn.id);

        const ul = document.getElementById(parentName + '_ul');

        // always add textarea without title first
        insertTextAreaAtIdxToUl(ul, idx + 1);
    })

    return btn
}

const getDelButton = (parentName, childName) => {
    // both parentName and childName are only valid 
    // at the moment button creation!
    // insertion/deletion will modify the name,
    // so refer to `btn.id` instead!
    const btn = getButton(childName, 'del');
    btn.innerHTML = '&#65293;';//'Delete Previous Field';
    
    btn.addEventListener('click', function (evt) {
        parentName = getBtnParentId(btn.id);
        childName = getBtnChildId(btn.id);
        
        const ul = document.getElementById(`${parentName}_ul`);
        const li = document.getElementById(`${childName}_li`);

        // remove resp. li, unless it's the last one
        if (ul.children.length > 1) {
            console.log('removing: ', li);
            ul.removeChild(li);
        }        

        // adjust the names of remaining li and all their children
        updateIdAndNameOfUlChildren(ul);
    })
    
    return btn;
}

const getTitleButton = (parentName, childName) => {
    // both parentName and childName are only valid 
    // at the moment button creation!
    // insertion/deletion will modify the name,
    // so refer to `btn.id` instead!
    const btn = getButton(childName, 'title');
    btn.innerHTML = titleButtonText.add;

    btn.addEventListener('click', function (evt) {
        parentName = getBtnParentId(btn.id);
        childName = getBtnChildId(btn.id);

        const ul = document.getElementById(`${parentName}_ul`);
        const li = document.getElementById(`${childName}_li`);

        if (ul.children.length) {
            if (btn.innerHTML === titleButtonText.add) {
                // swap button name
                btn.innerHTML = titleButtonText.del;
                // add title
                addTitleToLi(li);
            } else {
                // swap button name
                btn.innerHTML = titleButtonText.add;
                // remove title
                if (li.children[0].type === 'text') {
                    li.removeChild(li.children[0]);
                }
            }      
        } 
    });

    return btn;
}

const getExpButton = (parentName, childName) => {
    // both parentName and childName are only valid 
    // at the moment button creation!
    // insertion/deletion will modify the name,
    // so refer to `btn.id` instead!
    const btn = getButton(childName, 'exp');
    btn.innerHTML = expButtonText.exp;

    btn.addEventListener('mouseover', function(evt) {
        console.log(btn.id);
    })

    btn.addEventListener('click', function(evt) {
        parentName = getBtnParentId(btn.id);
        childName = getBtnChildId(btn.id);

        const li = document.getElementById(`${childName}_li`);

        if (btn.innerHTML === expButtonText.exp) {
            // toggle button name
            btn.innerHTML = expButtonText.col;
            // expand single textArea of li into an inner ul array
            expandLi(li);            
        } else {
            // togge button name
            btn.innerHTML = expButtonText.exp;
            // collapse inner ul array within li into a single textArea
            collapseLi(li);
        }
    })

    return btn;
}

const getEditButtons = (parentName, childName) => {
        
    const btnAdd = getAddButton(parentName, childName);
    const btnDel = getDelButton(parentName, childName);
    const btnTitle = getTitleButton(parentName, childName);
    const btnExp = getExpButton(parentName, childName);

    const divInner1 = document.createElement('div');
    divInner1.setAttribute('class', 'btn-group');
    divInner1.setAttribute('role', 'group');
    divInner1.setAttribute('id', `${childName}_btns1`);
    divInner1.appendChild(btnAdd);
    divInner1.appendChild(btnDel);

    const divInner2 = document.createElement('div');
    divInner2.setAttribute('class', 'btn-group');
    divInner2.setAttribute('role', 'group');
    divInner2.setAttribute('id', `${childName}_btns2`);
    divInner2.appendChild(btnTitle);
    divInner2.appendChild(btnExp);

    const divOuter = document.createElement('div');
    divOuter.setAttribute('class', 'd-flex justify-content-between');
    divOuter.appendChild(divInner1);
    divOuter.appendChild(divInner2);

    return divOuter;
}