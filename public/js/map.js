mapboxgl.accessToken = mapBoxToken;

const areas = JSON.parse(areasJSON);
const cities = JSON.parse(citiesJSON);

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
                'circle-color': area.color,
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

        // upadate detailed city info
        // remove popup
        map.on('click', `cities-${area.name}`, function (e) {
            console.log(e);
        });
    }    
});