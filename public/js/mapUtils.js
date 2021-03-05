class MapUtils {
    constructor(containerId, project) {
        this.map = new mapboxgl.Map({
            container: containerId,
            style: `mapbox://styles/mapbox/${project.mapStyle}`,
            center: [project.lng, project.lat],
            zoom: project.zoom
        });

        this.markers = [];
    }

    getMap = function () {
        return this.map;
    }

    getCollectionSource = function (collection, exceptLocations) {
        exceptLocations = exceptLocations ? exceptLocations : [];
        return {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': collection.locs
                .filter(location => !exceptLocations.map(exLocation => exLocation._id).includes(location._id))
                .map(location => ({
                    'type': 'Feature',
                    'geometry': location.geometry,
                    'properties': {
                        '_id': location._id,
                        'name': location.name,
                        'description': 
                            `<strong>${jsonHtmlify(location.name)} `+
                            `(${jsonHtmlify(location.code)})</strong><br>`+
                            `${jsonHtmlify(location.quickInfo)}`+
                            '<hr>'+
                            `${jsonHtmlify(collection.quickInfo)}`
                    }
                })),
            }
        };
    }

    getCollectionLayer = function (collection) {
        return {
            'id': `${collection._id}`,
            'interactive': true,
            'type': 'circle',
            'source': `${collection._id}`,
            'paint': { 
                'circle-color': collection.color,
                'circle-radius': 8,
                'circle-opacity': 0.7,
            }
        };
    }

    addPopupCallback = function (popup) {
        // callback associated with adding popup
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
        // callback associated with removing popup
        return (evt) => {
            popup.remove();
        }
    }

    populateMapWithLocations = function (collections) {
        for (let collection of collections) {
            if ( !this.map.getSource(`${collection._id}`) ) {
                // add location-data of the current collection in correct format
                this.map.addSource(`${collection._id}`, this.getCollectionSource(collection));
                    
                // add a layer showing the location markers for the current collection
                this.map.addLayer(this.getCollectionLayer(collection));
            
                // show popup on mouseenter, remove on mouseleave
                let popup = new mapboxgl.Popup();
                this.map.on('mouseenter', `${collection._id}`, this.addPopupCallback(popup));
                this.map.on('mouseleave', `${collection._id}`, this.removePopupCallback(popup));
            }
        }
    }

    populateMapWithLocationsOnEvent = function(collections, event) {
        // collections: array of `collection` objects (db entries) with schema defined in `./models/collection.js`
        // event: String: either of'load', 'sourcedata', 'styledata'
        this.map.on(event, () => {
            // this: MapUtils.object
            this.populateMapWithLocations(collections);
        })
    }

    addOnTheFlyLocationDataToDOMOnEvent = function (collections, titleHtml, infoHtml, event) {
        // gets location data on the fly by querying DB;
        // use it if locations array is 'too big'
        // and collections array is not populated with locations;
        // collections: array of `collection` objects (db entries) with schema defined in `./models/collection.js`
        // event: String: either of 'click', 'mouseover'
        this.map.on('load', () => {
            // this: MapUtils
            for (let collection of collections) {  
                // upadate detailed location info
                this.map.on(event, `${collection._id}`, function (evt) {
                    const id = evt.features[0].properties._id;
                    postData(`/projects/${projectId}/locations/${id}`, { id })
                        .then((data) => addDataToDOM(data, titleHtml, infoHtml))
                        .catch((err) => console.log(err));
                });
            }
        })
    }

    addLocationDataToDOMOnEvent = function (collections, titleHtml, infoHtml, event) {
        // on click gets location with requested id from populated(!) collections array
        // use it if locations array is 'small'
        // and collections array is populated with locations
        this.map.on('load', () => {
            // this: MapUtils
            for (let collection of collections) {  
                // upadate detailed location info                
                this.map.on(event, `${collection._id}`, (evt) => {
                    const id = evt.features[0].properties._id;
                    const location = collection.locs.filter(loc => loc._id === id)[0];
                    addDataToDOM(location, titleHtml, infoHtml);
                });
            }
        });
    }

    addNewMarkerToMapOnEvent = function (event) {
        this.map.on(event, (evt) => {
            const lngLat = [evt.lngLat.lng, evt.lngLat.lat];
        
            // remove previous marker
            if (this.markers.length) {
                let marker = this.markers.pop();
                marker.remove();            
            }
    
            // create/add new marker
            let marker = new mapboxgl.Marker()
                .setLngLat(lngLat)
                .addTo(this.map);
    
            this.markers.push(marker);
        })
    }

    addNewMarkerCoordinatesToFormOnEvent = function (latInpt, lngInpt, event) {
        this.map.on(event, (evt) => {
            // set lat and lng vals in form inputs
            latInpt.value = evt.lngLat.lat;
            lngInpt.value = evt.lngLat.lng;
        })
    }

    removeLastMarkerOnKey = function (key) {
        document.addEventListener('keydown', (evt) => {
            if ( evt.key === key && this.markers.length ) {
                const marker = this.markers.pop();
                marker.remove();
            }
        })
    }

    removeLocationFromSourcesOnEvent = function (selected, collections, event) {
        this.map.on(event, (evt) => {
            // get area corresponding to the selected location
            const collection = collections.filter(collection => collection._id === selected.coll)[0];

            // remove all markers that belong to the area of the selected location
            this.map.removeLayer(`${collection._id}`);
            this.map.removeSource(`${collection._id}`);

            // add again all markers EXCEPT for selected location
            const source = this.getCollectionSource(collection, [selected]);
            this.map.addSource(`${collection._id}`, source );

            // add a layer showing the places.
            const layer = this.getCollectionLayer(collection);
            this.map.addLayer( layer );
        });
    }

    addMarkerAtLngLatToMapOnEvent = function(lngLat, event) {
        this.map.on(event, (evt) => {
            let marker = new mapboxgl.Marker()
                .setLngLat(lngLat) // geojson: geometry.coordinates
                .addTo(this.map);
            this.markers.push(marker);
        });  
    }
}