const pattern = /\[(?<idx>[0-9]*)\]_(?<fun>btns|add|del|title)$/;
const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
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

const getTextArea = (name) => {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'form-control');
    textArea.setAttribute('name', name);
    textArea.setAttribute('id', name);
    return textArea;
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

const addTextAreaToUl = (ul, parentName) => {
    // ul{ li[i]{textArea, editButtons}}

    const childName = `${parentName}[${ul.children.length}]`;
    const liName = `${childName}_li`
    const textName = `${childName}[val]`;
        
    // get textArea
    const textArea = getTextArea(textName);

    // get editButtons
    const editBtns = getEditButtons(parentName, childName);
    
    // add new li to ul;
    // by default new li only contains textarea and edtiButtons
    const li = document.createElement('li');
    li.setAttribute('id', liName);
    li.appendChild(textArea);
    li.append(editBtns);

    ul.appendChild(li);
}

const insertTextAreaAtIdxToUl = (ul, idx) => {
    // initially give new child an idx 
    // that wouldn't conflict with existing children
    const parentName = ul.id.split('_')[0];
    const childName = `${parentName}[${ul.children.length}]`;
    const liName = `${childName}_li`
    const textName = `${childName}[val]`;
        
    // get textArea
    const textArea = getTextArea(textName);

    // get editButtons
    const editBtns = getEditButtons(parentName, childName);
    
    // add new li to ul;
    // by default new li only contains textarea and edtiButtons
    const li = document.createElement('li');
    li.setAttribute('id', liName);
    li.appendChild(textArea);
    li.append(editBtns);

    // insert li at ul at specified location
    insertNewChildAtIdxToParent(ul, li, idx);

    // update indices of all li's
    updateIdAndNameOfUlChildren(ul);
}

const addTitleToLastLiOfUl = (ul, name) => {
    // add title to last li of ul
    const lastChild = ul.children[ul.children.length-1];

    const title = document.createElement('input');
    title.setAttribute('class', 'form-control');
    title.setAttribute('type', 'text');
    title.setAttribute('name', `${name}[${ul.children.length-1}][key]`);
    title.setAttribute('id', `${name}[${ul.children.length-1}][key]`);
    title.placeholder = 'Title'

    lastChild.prepend(title);    
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
        //addTextAreaToUl(ul, parentName);
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

    btn.addEventListener('mouseover', function(evt) {
        console.log(btn.id);
    })

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

const getEditButtons = (parentName, childName) => {
        
    const btnAdd = getAddButton(parentName, childName);
    const btnDel = getDelButton(parentName, childName);
    const btnTitle = getTitleButton(parentName, childName);

    const divInner = document.createElement('div');
    divInner.setAttribute('class', 'btn-group mx-4');
    divInner.setAttribute('role', 'group');
    divInner.setAttribute('id', `${childName}_btns`);
    divInner.appendChild(btnAdd);
    divInner.appendChild(btnDel);

    const divOuter = document.createElement('div');
    divOuter.appendChild(divInner);
    divOuter.appendChild(btnTitle);

    return divOuter;
}