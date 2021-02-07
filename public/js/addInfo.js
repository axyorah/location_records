const genInfoRootHtml = document.getElementById('city[generalInfo]');
const titleButtonText = {
    'add': 'Add Title',
    'del': 'Remove Title'
};

// const getButton = (name, suffix) => {
//     const btn = document.createElement('button');
//     btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
//     btn.setAttribute('id', `${name}_${suffix}`);
//     btn.setAttribute('type', 'button');

//     return btn;
// }

// const getAddButton = (name) => {    
//     const btn = getButton(name, 'add');
//     btn.innerHTML = '&#65291;';//'Add New Field';

//     btn.addEventListener('click', function (evt) {
//         const name = btn.id.split('_')[0];
//         const ul = document.getElementById(name + '_ul');

//         // always add textarea without title first
//         addTextAreaToUl(ul, name);

//         // adjust the text of the titleButton (regulates whether there is a title)
//         const titleButton = document.getElementById(`${name}_title`);
//         titleButton.innerHTML = titleButtonText.add;
//     })

//     return btn
// }

// const getDelButton = (name) => {
//     const btn = getButton(name, 'del');
//     btn.innerHTML = '&#65293;';//'Delete Previous Field';
    
//     btn.addEventListener('click', function (evt) {
//         const name = btn.id.split('_')[0];
//         const ul = document.getElementById(`${name}_ul`);

//         if (ul.children.length) {
//             const lastChild = ul.children[ul.children.length-1];
//             ul.removeChild(lastChild);
//         }

//         // adjust titleButton text
//         const titleButton = document.getElementById(`${name}_title`);
//         if (ul.children.length) {
//             const lastChild = ul.children[ul.children.length-1];

//             if (lastChild.children.length == 1) {
//                 titleButton.innerHTML = titleButtonText.add;
//             } else {
//                 titleButton.innerHTML = titleButtonText.del;
//             }
//         } else {
//             titleButton.innerHTML = titleButtonText.add;
//         }
//     })
    
//     return btn;
// }

// const getTitleButton = (name) => {
//     const btn = getButton(name, 'title');
//     btn.innerHTML = titleButtonText.add;

//     btn.addEventListener('click', function (evt) {
//         const name = btn.id.split('_')[0];
//         const ul = document.getElementById(`${name}_ul`);

//         if (ul.children.length) {
//             if (btn.innerHTML === titleButtonText.add) {
//                 // swap button name
//                 btn.innerHTML = titleButtonText.del;
//                 // add title
//                 addTitleToLastLiOfUl(ul, name);
//             } else {
//                 // swap button name
//                 btn.innerHTML = titleButtonText.add;
//                 // remove title
//                 if (lastChild.children[0].type === 'text') {
//                     lastChild.removeChild(lastChild.children[0]);
//                 }
//             }            
//         } 
//     });

//     return btn;
// }

// const getEditButtons = (name) => {
        
//     const btnAdd = getAddButton(name);
//     const btnDel = getDelButton(name);
//     const btnTitle = getTitleButton(name);

//     const divInner = document.createElement('div');
//     divInner.setAttribute('class', 'btn-group mx-4');
//     divInner.setAttribute('role', 'group');
//     divInner.setAttribute('id', `${name}_btns`);
//     divInner.appendChild(btnAdd);
//     divInner.appendChild(btnDel);

//     const divOuter = document.createElement('div');
//     divOuter.appendChild(divInner);
//     divOuter.appendChild(btnTitle);

//     return divOuter;
// }

// const addTextAreaToUl = (ul, name) => {
//     // add new li to ul;
//     // by default new li only contains textarea
//     const li = document.createElement('li');
//     const textArea = document.createElement('textarea');
//     textArea.setAttribute('class', 'form-control');
//     textArea.setAttribute('name', `${name}[${ul.children.length}][val]`);
//     textArea.setAttribute('id', `${name}[${ul.children.length}][val]`);
    
//     li.appendChild(textArea);
//     ul.appendChild(li);
// }

// const addTitleToLastLiOfUl = (ul, name) => {
//     // add title to last li of ul
//     const lastChild = ul.children[ul.children.length-1];

//     const title = document.createElement('input');
//     title.setAttribute('class', 'form-control');
//     title.setAttribute('type', 'text');
//     title.setAttribute('name', `${name}[${ul.children.length-1}][key]`);
//     title.setAttribute('id', `${name}[${ul.children.length-1}][key]`);
//     title.placeholder = 'Title'

//     lastChild.prepend(title);    
// }

const showGenInfoInit = () => {
    const name = 'city[General Information]';

    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);

    addTextAreaToUl(ul, name);

    // const li = document.createElement('li');
    
    // const textArea = document.createElement('textarea');
    // textArea.setAttribute('class', 'form-control');
    // textArea.setAttribute('name', `${name}[0][val]`);
    // textArea.setAttribute('id', `${name}[0][val]`);

    genInfoRootHtml.appendChild(ul);
    // ul.appendChild(li);
    // li.appendChild(textArea);

    // const div = getEditButtons(name);

    //genInfoRootHtml.appendChild(div);
}

showGenInfoInit();