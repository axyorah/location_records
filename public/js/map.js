mapboxgl.accessToken = mapBoxToken;

const areas = JSON.parse(areasJSON);
const cities = JSON.parse(citiesJSON);

const area2color = {
    'AML': 'rgba(189,13,76,0.7)',
    'GEBIED-1': 'rgba(13,112,189,0.7)',
    'GEBIED-2A2C': 'rgba(178,145,13,0.7)',
    'GEBIED-2B': 'rgba(156,99,99,0.7)',
    'GEBIED-3': 'rgba(23,200,101,0.7)'
}

let city, area;
if (JSON.parse(selectedJSON).area) {
    city = JSON.parse(selectedJSON);
} else {
    area = JSON.parse(selectedJSON);
}

const map = new mapboxgl.Map({
    container: 'map-nl',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [5.58, 52.25],
    zoom: 6
});

map.on('load', function () {
    for (let area of areas) {
        
        // add city-data of the current area in correct format
        map.addSource(`cities-${area.name}`, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': area.cities.map(city => ({
                    'type': 'Feature',
                    'geometry': city.geometry,
                    'properties': {
                        'description': 
                            `<strong>${city.name} `+
                            `(${city.code})</strong><br>`+
                            `${city.quickInfo}`
                    }
                })),
            }
        });
        
        // add a layer showing the places.
        map.addLayer({
            'id': `cities-${area.name}`,
            'type': 'circle',
            'source': `cities-${area.name}`,
            'paint': { 
                'circle-color': area2color[area.name],
                'circle-radius': 8
            }
        });
        
        // add a popup
        let popup = new mapboxgl.Popup();
        map.on('mouseenter', `cities-${area.name}`, function (e) {
            let coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
             
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
             
            popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });
        
        // remove popup
        map.on('mouseleave', `cities-${area.name}`, function (e) {
            popup.remove();
        });
    }    
});