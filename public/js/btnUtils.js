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