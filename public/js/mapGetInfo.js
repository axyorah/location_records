async function postData(url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            //'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data, //JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

map.on('load', function () {
    for (let area of areas) {  
        // upadate detailed city info
        map.on('click', `cities-${area.name}`, function (e) {
            const id = e.features[0].properties._id;
            postData(`/cities/${id}`, { id })
                // .then((data) => JSON.stringify(data))
                // .then((data) => jsonEscape(data))
                // .then((data) => JSON.parse(data))
                .then((data) => showFullInfo(data))
                .catch((err) => console.log(err));
        });
    }    
});