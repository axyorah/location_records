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

const updateIdOfAllChildren = (parent, pattern, newIdx) => {
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

const updateIdAndNameOfUlChildren = (ul, name) => {
    // adjust the indices of all the `li`s and  their children,
    // so that they start from `0` and end with `ul.children.length-1`;
    // - update id's (and names) of li, titles and textareas 'manually',
    // - update buttons id's via pattern matching:
    //     we're looking for a pattern: `...[idx]_fun`
    
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

const getButton = (name, suffix) => {
    const btn = document.createElement('button');
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('id', `${name}_${suffix}`);
    btn.setAttribute('type', 'button');

    return btn;
}

const getAddButton = (parentName, childName) => {    
    const btn = getButton(childName, 'add');
    btn.innerHTML = '&#65291;';//'Add New Field';

    btn.addEventListener('click', function (evt) {
        //const name = btn.id.split('_')[0];
        const ul = document.getElementById(parentName + '_ul');

        // always add textarea without title first
        addTextAreaToUl(ul, parentName);

        // adjust the text of the titleButton (regulates whether there is a title)
        const titleButton = document.getElementById(`${childName}_title`);
        titleButton.innerHTML = titleButtonText.add;
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
        updateIdAndNameOfUlChildren(ul, parentName);
    })
    
    return btn;
}

const getTitleButton = (parentName, childName) => {
    const btn = getButton(childName, 'title');
    btn.innerHTML = titleButtonText.add;

    btn.addEventListener('mouseover', function(evt) {
        console.log(btn.id);
    })

    btn.addEventListener('click', function (evt) {
        const name = btn.id.split('_')[0];
        const ul = document.getElementById(`${parentName}_ul`);

        if (ul.children.length) {
            if (btn.innerHTML === titleButtonText.add) {
                // swap button name
                btn.innerHTML = titleButtonText.del;
                // add title
                addTitleToLastLiOfUl(ul, parentName);
            } else {
                // swap button name
                btn.innerHTML = titleButtonText.add;
                // remove title
                if (lastChild.children[0].type === 'text') {
                    lastChild.removeChild(lastChild.children[0]);
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

const addTextAreaToUl = (ul, parentName) => {
    // ul{ li[i]{textArea, editButtons}}

    const childName = `${parentName}[${ul.children.length}]`;
    const liName = `${childName}_li`
    const textName = `${childName}[val]`;
        
    // get textArea
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'form-control');
    textArea.setAttribute('name', textName);
    textArea.setAttribute('id', textName);

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