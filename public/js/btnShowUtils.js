const getSubmitBtn = (name) => {
    const btn = document.createElement('button');
    btn.innerHTML = name;
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('type', 'submit');

    return btn;
}

const getABtn = (name, href) => {
    const btn = document.createElement('a');
    btn.innerHTML = name;
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('href', href);
    btn.setAttribute('style', 'display: flex; align-items: center;');

    return btn;
}

const getPostDataBtn = (name, path) => {
    // instead of redirecting to a diff page modify current page
    // iff #region-name and #region-info elements are present
    // and path corresponds to <item>.data route and supports POST req
    const btn = document.createElement('a');
    btn.innerHTML = name;
    btn.setAttribute('class', 'btn btn-sm btn-outline-secondary');
    btn.setAttribute('href', '#');

    // get item id
    const pattern = /\/projects\/[a-zA-Z0-9]*\/[a-zA-Z]*\/(?<id>[a-zA-Z0-9]*)$/;
    const match = path.match(pattern);
    const id = match.groups ? match.groups.id : undefined;

    // get DOM elements for posting data to
    const titleHtml = document.getElementById('region-name');
    const infoHtml = document.getElementById('region-info');

    if ( titleHtml && infoHtml && id ) {
        // on click: send POST req to path and post fetched data to DOM
        btn.addEventListener('click', () => {
            postData(path, { id })
            .then((data) => addDataToDOM(data, titleHtml, infoHtml))
            .catch((err) => console.log(err));
        });
        return btn;
    } else {
        // if DOM elements do not exist or path is wrong get normal link btn
        btn.setAttribute('href', path);
        return btn;
    }
}

const getLocationButtons = (item, names) => {
    // names should be an array of any combination of:
    // ['back', 'edit', 'del']
    if ( item.coll ) {
        const form = document.createElement('form');
        form.setAttribute('action', `/projects/${projectId}/locations/${item._id}/delete?_method=DELETE`);
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

        const backBtn = getPostDataBtn('Back to Collection', `/projects/${projectId}/collections/${item.coll}`);
        const editBtn = getABtn('Edit', `/projects/${projectId}/locations/${item._id}/edit`);
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

const getCollectionButtons = (item, names) => {
    // names should be an array of any combination of:
    // ['edit', 'del']
    if ( item.locs ) {
        const form = document.createElement('form');
        form.setAttribute('action', `/projects/${projectId}/collections/${item._id}/delete?_method=DELETE`);
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

        const editBtn = getABtn('Edit', `/projects/${projectId}/collections/${item._id}/edit`);
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

const getProjectButtons = (item, names) => {
    // names should be an array of any combination of:
    // ['edit', 'del']
    if ( item.token ) {
        const form = document.createElement('form');
        form.setAttribute('action', `/projects/${projectId}/delete?_method=DELETE`);
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

        const editBtn = getABtn('Edit', `/projects/${projectId}/edit`);
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