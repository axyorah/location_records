const genInfoRootHtml = document.getElementById('city[generalInfo]');

const showGenInfoInit = () => {
    const name = 'city[General Information]';

    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);

    insertTextAreaAtIdxToUl(ul, 0);

    genInfoRootHtml.appendChild(ul);    
}

showGenInfoInit();