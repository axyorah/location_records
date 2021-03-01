//mapboxgl.accessToken = mapBoxToken;

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