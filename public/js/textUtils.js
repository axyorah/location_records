const getTextArea = (childName) => {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'form-control');
    textArea.setAttribute('name', `${childName}[val]`);
    textArea.setAttribute('id', `${childName}[val]`);
    return textArea;
}

const getTitleArea = (childName) => {
    const title = document.createElement('input');
    title.setAttribute('type', 'text');
    title.setAttribute('class', 'form-control');
    title.setAttribute('name', `${childName}[key]`);
    title.setAttribute('id', `${childName}[key]`);
    return title;
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

const getNewUl = (name) => {
    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);
    ul.setAttribute('class', 'list-group list-group-flush mt-2');
    
    addTextAreaToUl(ul);
    return ul;
}

const updateIdAndNameOfAllChildren = (parent, oldBase, newBase) => {
    if (parent.children.length) {
        for (let child of parent.children) {
            // child can be either 
            // - text with suffix `[key]` or `[val]`,
            // - ul, li or btn with suffix `_ul`, `_li` or `_<btn fun>` (e.g., `_add`)
            // - div helper container without any id

            // if it's neither of text/ul/li/btn - recurr without changes
            if (!child.id) {
                return updateIdAndNameOfAllChildren(child, oldBase, newBase);
            }
            
            // if it is - derive it's old base
            const oldChildBase = child.id.split('_')[0];

            // set new child's id and name
            const newId = newBase + child.id.replace(oldBase, '');
            child.setAttribute('id', newId);
            child.setAttribute('name', newId);

            // derive new base for deeper children:
            // - for texts - suffix ([key], [val]) should be part of new base
            // - for li/btn - suffix (`_li`, `_add`) should be excluded from new base
            const newChildBase = child.id.split('_')[0];

            updateIdAndNameOfAllChildren(child, oldChildBase, newChildBase);
        }
    }
}

const updateIdAndNameOfUlChildren = (ul) => {
    // adjust the indices of all the `li`s and  their children,
    // so that the indices in their ids are arranged in order
    const name = ul.id.split('_')[0];
    
    let i = 0;
    for (let li of ul.children) { 
        // get old and new li's base name (without `_li` suffix)       
        const oldBase = li.id.split('_')[0];
        const newBase = `${name}[${i}]`;

        // udpate li, so that it's id reflects its serial num
        li.setAttribute('id', `${name}[${i}]_li`);
        li.setAttribute('class', 'list-group-item');
        
        // update all li's children with new base name
        updateIdAndNameOfAllChildren(li, oldBase, newBase);
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