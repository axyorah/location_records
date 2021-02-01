const latInpt = document.getElementById('city[lat]');
const lngInpt = document.getElementById('city[lng]');

mapboxgl.accessToken = mapBoxToken;
const areas = JSON.parse(areasJSON);
const cities = JSON.parse(citiesJSON);

let markers = [];

const mapNew = new mapboxgl.Map({
    container: 'map-new',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [5.58, 52.25],
    zoom: 6
});

mapNew.on('load', function () {
    for (let area of areas) {
        
        // add city-data of the current area in correct format
        mapNew.addSource(`cities-${area.name}`, {
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
                            `<strong>${city.name} `+
                            `(${city.code})</strong><br>`+
                            `${city.quickInfo}`
                    }
                })),
            }
        });
        
        // add a layer showing the places.
        mapNew.addLayer({
            'id': `cities-${area.name}`,
            'type': 'circle',
            'source': `cities-${area.name}`,
            'paint': { 
                'circle-color': area.color,
                'circle-opacity': 0.4,
                'circle-radius': 8
            }
        });
        
        // add a popup
        let popup = new mapboxgl.Popup();
        mapNew.on('mouseenter', `cities-${area.name}`, function (e) {
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
                .addTo(mapNew);
        });
        
        // remove popup
        mapNew.on('mouseleave', `cities-${area.name}`, function (e) {
            popup.remove();
        });
    }    
    // add new marker
    mapNew.on('click', function (e) {
        const lngLat = [e.lngLat.lng, e.lngLat.lat];
        
        // remove previous marker
        if (markers.length) {
            let marker = markers.pop();
            marker.remove();            
        }

        // create/add new marker
        let marker = new mapboxgl.Marker()
            .setLngLat(lngLat)
            .addTo(mapNew);

        markers.push(marker);

        // set lat and lng vals in form inputs
        latInpt.value = e.lngLat.lat;
        lngInpt.value = e.lngLat.lng;
    })

});

// remove marker
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && markers.length) {
        marker = markers.pop();
        marker.remove();
        console.log(e);
    }
})