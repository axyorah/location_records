//mapboxgl.accessToken = mapBoxToken;
// resp fields will not be displayed in the browser
const ignoredDBKeys = [
    'name', 
    'quickInfo', 
    'geometry', 
    'code', 
    'area', 
    'color',
    'project',
    '_id', 
    '__v'
]

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
        referrerPolicy:'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: data, //JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

const addInfoToDOM = (item, titleHtml, infoHtml) => {
    // show detailed info on City or Area next to the map
    // requires globals `regionNameHtml` and `regionInfoHtml`

    // set City/Area name
    if ( item.area ) {
        // cities have ref to parent area        
        titleHtml.innerHTML =  
            `${jsonHtmlify(item.name)} (${jsonHtmlify(item.code)})`;

        // if user is loggen in - add edit buttons
        if ( username !== 'anonymous' ) {
            const btns = getCityButtons(item, ['back', 'edit', 'del']);
            titleHtml.appendChild(btns);
        }        
    } else if ( item.cities ) {
        // areas have ref to child cities        
        titleHtml.innerHTML =  `${jsonHtmlify(item.name)}`;

        // if user is loggen in - add edit buttons
        if ( username !== 'anonymous' ) {
            const btns = getAreaButtons(item, ['edit', 'del']);
            titleHtml.appendChild(btns);
        }
    } else {
        return;
    }

    // remove data from previously clicked region
    while (infoHtml.firstChild) {
        infoHtml.removeChild(infoHtml.lastChild);
    }

    // add data of currently selected region
    const lvl = 2;    
    addRootObject(infoHtml, item, ignoredDBKeys, lvl);
}

class MapUtils {
    constructor(containerId, project) {
        this.map = new mapboxgl.Map({
            container: containerId,
            style: `mapbox://styles/mapbox/${project.mapStyle}`,
            center: [project.lng, project.lat],
            zoom: project.zoom
        });
    }

    getMap = function () {
        return this.map;
    }

    getAreaSource = function (area) {
        return {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': area.cities.map(city => ({
                    'type': 'Feature',
                    'geometry': city.geometry,
                    'properties': {
                        '_id': city._id,
                        'name': city.name,
                        'description': 
                            `<strong>${jsonHtmlify(city.name)} `+
                            `(${jsonHtmlify(city.code)})</strong><br>`+
                            `${jsonHtmlify(city.quickInfo)}`+
                            '<hr>'+
                            `${jsonHtmlify(area.quickInfo)}`
                    }
                })),
            }
        };
    }

    getAreaLayer = function (area) {
        return {
            'id': `cities-${area.name}`,
            'interactive': true,
            'type': 'circle',
            'source': `cities-${area.name}`,
            'paint': { 
                'circle-color': area.color,
                'circle-radius': 8,
                'circle-opacity': 0.7,
            }
        };
    }

    addPopupCallback = function (popup) {
        return (evt) => {
            // this: MapUtils
            let coordinates = evt.features[0].geometry.coordinates.slice();
            const description = evt.features[0].properties.description;
             
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360;
            }
             
            popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(this.map);
        }
    }

    removePopupCallback = function (popup) {
        return (evt) => {
            popup.remove();
        }
    }

    populateMapWithCities = function (areas) {
        for (let area of areas) {
            if ( !this.map.getSource(`cities-${area.name}`) ) {
                // add city-data of the current area in correct format
                this.map.addSource(`cities-${area.name}`, this.getAreaSource(area));
                    
                // add a layer showing the city markers for the current area
                this.map.addLayer(this.getAreaLayer(area));
            
                // show popup on mouseenter, remove on mouseleave
                let popup = new mapboxgl.Popup();
                this.map.on('mouseenter', `cities-${area.name}`, this.addPopupCallback(popup));
                this.map.on('mouseleave', `cities-${area.name}`, this.removePopupCallback(popup));
            }
        }
    }

    populateMapWithCitiesOnEvent = function(areas, event) {
        // areas: array of `area` objects (db entries) with schema defined in `./models/area.js`
        // event: String: either of'load', 'sourcedata', 'styledata'
        this.map.on(event, () => {
            // this: MapUtils.object
            this.populateMapWithCities(areas);
        })
    }

    addCityInfoToDOM = function (areas, titleHtml, infoHtml) {
        // uses `postData(.)` and `showInfo(.)` functions!
        for (let area of areas) {  
            // upadate detailed city info
            this.map.on('click', `cities-${area.name}`, function (evt) {
                const id = evt.features[0].properties._id;
                postData(`/projects/${projectId}/cities/${id}`, { id })
                    .then((data) => addInfoToDOM(data, titleHtml, infoHtml))
                    .catch((err) => console.log(err));
            });
        }  
    }

    addCityInfoToDOMOnEvent = function (areas, titleHtml, infoHtml, event) {
        // areas: array of `area` objects (db entries) with schema defined in `./models/area.js`
        // event: String: either of: 'click', 'mouseover'
        this.map.on(event, () => {
            // this: MapUtils
            this.addCityInfoToDOM(areas, titleHtml, infoHtml);
        })
    }
}