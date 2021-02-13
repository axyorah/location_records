const pattern = /\[(?<idx>[0-9]*)\]_(?<fun>btns|add|del|title|exp)$/;

const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
};
const expButtonText = {
    'exp': 'Expand',
    'col': 'Collapse'
};

const getABtn = (name, href) => {
    const btn = document.createElement('a');
    btn.innerHTML = name;
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('href', href);

    return btn;
}

const getSubmitBtn = (name) => {
    const btn = document.createElement('button');
    btn.innerHTML = name;
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('type', 'submit');

    return btn;
}

const getCityButtons = (item, names) => {
    // names should be an array of any combination of:
    // ['back', 'edit', 'del']
    if ( item.area ) {
        const form = document.createElement('form');
        form.setAttribute('action', `/cities/delete/${item._id}`); // TODO: add: `?_DELETE`
        form.setAttribute('method', 'POST');
        form.setAttribute('class', 'd-inline ms-auto'); //d-inline 

        const btnGroup = document.createElement('div');
        btnGroup.setAttribute('class', 'btn-group');
        btnGroup.setAttribute('role', 'group');

        const backBtn = getABtn('Back to Area', `/?areaId=${item.area}`);
        const editBtn = getABtn('Edit', `/cities/edit/${item._id}`);
        const delBtn = getSubmitBtn('Del');

        if (names.includes('back')) {
            btnGroup.appendChild(backBtn);
        }
        if (names.includes('edit')) {
            btnGroup.appendChild(editBtn);
        }
        if (names.includes('del')) {
            btnGroup.appendChild(delBtn);
        }

        form.append(btnGroup);

        return form;
    }
}

const getAreaButtons = (item, names) => {
    // names should be an array of any combination of:
    // ['edit', 'del']
    if ( item.cities ) {
        const form = document.createElement('form');
        form.setAttribute('action', `/areas/delete/${item._id}`); // TODO: add: `?_DELETE`
        form.setAttribute('method', 'POST');
        form.setAttribute('class', 'd-inline mr-auto');

        const btnGroup = document.createElement('div');
        btnGroup.setAttribute('class', 'btn-group');
        btnGroup.setAttribute('role', 'group');

        const editBtn = getABtn('Edit', `/areas/edit/${item._id}`);
        const delBtn = getSubmitBtn('Del');

        if (names.includes('edit')) {
            btnGroup.appendChild(editBtn);
        }
        if (names.includes('del')) {
            btnGroup.appendChild(delBtn);
        }

        form.append(btnGroup);

        return form;
    }
}

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

    btn.addEventListener('mouseover', function (evt) {
        parentName = getBtnParentId(btn.id);
        let idx = getBtnIdx(btn.id);

        const ul = document.getElementById(parentName + '_ul');

        console.log(`PARENT: ${parentName}`);
        console.log(`UL:`);
        console.log(ul);
    })

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
    // so refer to `btn.id` during click-event instead!
    const btn = getButton(childName, 'title');

    // if child li already has a title (...[key]) set btn name to `Remove Title`,
    // otherwise, set btn name to `Add Title`
    if (document.getElementById(`${childName}[key]`)) {
        btn.innerHTML = titleButtonText.del;
    } else {
        btn.innerHTML = titleButtonText.add;
    }

    btn.addEventListener('mouseover', function (evt) {
        console.log(childName);
    })

    btn.addEventListener('click', function (evt) {
        parentName = getBtnParentId(btn.id);
        childName = getBtnChildId(btn.id);

        const ul = document.getElementById(`${parentName}_ul`);
        const li = document.getElementById(`${childName}_li`);

        if (ul.children.length) {
            if (!li.firstChild.id.match(/\[key\]$/)) {
                // swap button name
                btn.innerHTML = titleButtonText.del;
                // add title
                addTitleToLi(li);
            } else {
                // swap button name
                btn.innerHTML = titleButtonText.add;
                // remove title
                li.removeChild(li.children[0]);
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

const getButtonGroup = (btns, groupName) => {
    const div = document.createElement('div');
    div.setAttribute('class', 'btn-group');
    div.setAttribute('role', 'group');
    div.setAttribute('id', groupName);
    
    for (let btn of btns) {
        div.appendChild(btn);
    }
    
    return div;
}

const getEditButtons = (parentName, childName) => {
        
    const btnAdd = getAddButton(parentName, childName);
    const btnDel = getDelButton(parentName, childName);
    const btnTitle = getTitleButton(parentName, childName);
    const btnExp = getExpButton(parentName, childName);

    divInner1 = getButtonGroup([btnAdd, btnDel], `${childName}_btns1`);
    divInner2 = getButtonGroup([btnTitle, btnExp], `${childName}_btns2`);

    const divOuter = document.createElement('div');
    divOuter.setAttribute('class', 'd-flex justify-content-between');
    divOuter.appendChild(divInner1);
    divOuter.appendChild(divInner2);

    return divOuter;
}