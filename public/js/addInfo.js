const showGenInfoInit = (genInfoRootHtml) => {
    const found = genInfoRootHtml.id.match(/^(?<region>.*)\[generalInfo\]$/);
    const name = `${found.groups.region}[General Information]`;

    const ul = document.createElement('ul');
    ul.setAttribute('id', `${name}_ul`);
    ul.setAttribute('class', 'list-group list-group-flush my-2')

    insertTextAreaAtIdxToUl(ul, 0);

    genInfoRootHtml.appendChild(ul);    
}

showGenInfoInit(genInfoRootHtml);