const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
};

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
    const btn = getButton(childName, 'del');
    btn.innerHTML = '&#65293;';//'Delete Previous Field';

    btn.addEventListener('mouseover', function(evt) {
        const li = document.getElementById(`${childName}_li`);
        console.log(btn.id, li);
    })
    
    btn.addEventListener('click', function (evt) {
        //const name = btn.id.split('_')[0];
        const ul = document.getElementById(`${parentName}_ul`);

        if (ul.children.length > 1) {
            const lastChild = ul.children[ul.children.length-1];
            ul.removeChild(lastChild);
        }
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