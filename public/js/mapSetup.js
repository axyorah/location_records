mapboxgl.accessToken = mapBoxToken;

const map = new mapboxgl.Map({
    container: 'map-nl',
    style: `mapbox://styles/mapbox/${project.mapStyle}`,
    center: [project.lng, project.lat],
    zoom: project.zoom
});

const getAreaSource = (area) => {
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

const getAreaLayer = (area) => {
    return {
        'id': `cities-${area.name}`,
        'type': 'circle',
        'source': `cities-${area.name}`,
        'paint': { 
            'circle-color': area.color,
            'circle-radius': 8,
            'circle-opacity': 0.7,
        }
    };
}

const addPopupCallback = (popup) => {
    return function (evt) {
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
            .addTo(map);
    }
}

const removePopupCallback = (popup) => {
    return function (evt) {
        popup.remove();
    }
}

const showMarkers = () => {
    for (let area of areas) {
        
        // add city-data of the current area in correct format
        map.addSource(`cities-${area.name}`, getAreaSource(area));
        
        // add a layer showing the city markers for the current area
        map.addLayer(getAreaLayer(area));
        
        // show popup on mouseenter, remove on mouseleave
        let popup = new mapboxgl.Popup();
        map.on('mouseenter', `cities-${area.name}`, addPopupCallback(popup));
        map.on('mouseleave', `cities-${area.name}`, removePopupCallback(popup));
    }    
}

map.on('load', showMarkers);