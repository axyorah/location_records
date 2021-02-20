const pattern = /\[(?<idx>[0-9]*)\]_(?<fun>btns|add|del|title|exp)$/;

const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
};
const expButtonText = {
    'exp': 'Expand',
    'col': 'Collapse'
};

const setTitleBackgroundColor = ( childName, color ) => {
    const title = document.getElementById(`${childName}[key]`);
    if ( title ) {
        title.style.background = color;
    }
}

const setChildrenBackgroundColor = ( childName, color ) => {
    const title = document.getElementById(`${childName}[key]`);
    const textArea = document.getElementById(`${childName}[val]`);
    const textAreaUl = document.getElementById(`${childName}[val]_ul`);

    if ( title ) {
        title.style.background = color;
    }
    if ( textArea ) {
        textArea.style.background = color;
    } else if ( textAreaUl ) {
        for (let child of textAreaUl.children) {
            setChildrenBackgroundColor( child.id.split('_')[0], color );
        }
    }
}

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
        form.setAttribute('action', `/cities/${item._id}/delete?_method=DELETE`);
        form.setAttribute('action', `/`);
        form.setAttribute('method', 'POST');
        form.setAttribute('class', 'd-inline ms-auto'); //d-inline 
        form.setAttribute(
            'onsubmit', 
            `return confirm('Are you sure you want to delete ${jsonTextify(item.name)}?')`
        );
        form.style.display = 'inline-block';

        const btnGroup = document.createElement('div');
        btnGroup.setAttribute('class', 'btn-group');
        btnGroup.setAttribute('role', 'group');

        const backBtn = getABtn('Back to Area', `/?areaId=${item.area}`);
        const editBtn = getABtn('Edit', `/cities/${item._id}/edit`);
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
        form.setAttribute('action', `/areas/${item._id}/delete?_method=DELETE`);
        form.setAttribute('method', 'POST');
        form.setAttribute('class', 'd-inline mr-auto');
        form.setAttribute(
            'onsubmit', 
            `return confirm('Are you sure you want to delete ${jsonTextify(item.name)}?')`
        );
        form.style.display = 'inline-block';

        const btnGroup = document.createElement('div');
        btnGroup.setAttribute('class', 'btn-group');
        btnGroup.setAttribute('role', 'group');

        const editBtn = getABtn('Edit', `/areas/${item._id}/edit`);
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

    btn.addEventListener('mouseenter', function (evt) {
        // set background to red to indicate to-be-deleted fields
        childName = getBtnChildId(btn.id);
        setChildrenBackgroundColor(childName, 'rgba(255,0,0,0.1)');
    })

    btn.addEventListener('mouseleave', function (evt) {
        // set background of no-longer-to-be-deleted fields back to white
        childName = getBtnChildId(btn.id);
        setChildrenBackgroundColor(childName, 'rgba(255,255,255,1)');
    })
    
    btn.addEventListener('click', function (evt) {
        parentName = getBtnParentId(btn.id);
        childName = getBtnChildId(btn.id);
        
        const ul = document.getElementById(`${parentName}_ul`);
        const li = document.getElementById(`${childName}_li`);

        // remove resp. li, unless it's the last one
        if (ul.children.length > 1) {
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
    if ( document.getElementById(`${childName}[key]`) ) {
        btn.innerHTML = titleButtonText.del;
    } else {
        btn.innerHTML = titleButtonText.add;
    }

    btn.addEventListener('mouseenter', function (evt) {
        // if title exists: set it's color to red to indicate that it's about to be deleted
        setTitleBackgroundColor( childName, 'rgba(255,0,0,0.1)');     
    })

    btn.addEventListener('mouseleave', function (evt) {
        // set title background color back to white
        setTitleBackgroundColor( childName, 'rgba(255,255,255,1');
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

    // if child li already expanded - set btn name to col
    // otherwise, set btn name to exp
    if (document.getElementById(`${childName}[val]_ul`)) {
        btn.innerHTML = expButtonText.col;
    } else {
        btn.innerHTML = expButtonText.exp;
    }

    btn.addEventListener('mouseenter', function(evt) {
        childName = getBtnChildId(btn.id);
        if ( document.getElementById(`${childName}[val]_ul` )) {
            setChildrenBackgroundColor( childName, 'rgba(255,255,0,0.1)');
        } else {
            setChildrenBackgroundColor( childName, 'rgba(0,255,0,0.1)');
        }
    })

    btn.addEventListener('mouseleave', function (evt) {
        childName = getBtnChildId(btn.id);
        setChildrenBackgroundColor( childName, 'rgba(255,255,255,1)');
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