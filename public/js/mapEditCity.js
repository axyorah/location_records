// const selected = JSON.parse(jsonEscape(selectedJSON));
// const selected = JSON.parse(selectedJSON);

const latInpt = document.getElementById('city[lat]');
const lngInpt = document.getElementById('city[lng]');

let markers = [];

map.on('load', function () {

    // get area corresponding to the selected city
    const area = areas.filter(area => area._id === selected.area)[0];

    // remove all markers that belong to the area of the selected city
    map.removeLayer(`cities-${area.name}`);
    map.removeSource(`cities-${area.name}`);

    // add again all markers EXCEPT for selected city
    map.addSource(`cities-${area.name}`, {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': area.cities
                .filter(city => city._id !== selected._id)
                .map(city => ({
                'type': 'Feature',
                'geometry': city.geometry,
                'properties': {
                    '_id': city._id,
                    'name': city.name,
                    'description': 
                        `<strong>${jsonHtmlify(city.name)} `+
                        `(${jsonHtmlify(city.code)})</strong><br>`+
                        `${jsonHtmlify(city.quickInfo)}`
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
            'circle-radius': 8,
            'circle-opacity': 0.7,
        }
    });

    // add a MOVABLE marker for selected city at 'old' position
    let marker = new mapboxgl.Marker()
        .setLngLat(selected.geometry.coordinates)
        .addTo(map);
    markers.push(marker);


    // move marker: remove old - add new
    map.on('click', function (evt) {
        const lngLat = [evt.lngLat.lng, evt.lngLat.lat];
        
        // remove previous marker
        if (markers.length) {
            let marker = markers.pop();
            marker.remove();            
        }

        // create/add new marker
        let marker = new mapboxgl.Marker()
            .setLngLat(lngLat)
            .addTo(map);

        markers.push(marker);

        // set lat and lng vals in form inputs
        latInpt.value = evt.lngLat.lat;
        lngInpt.value = evt.lngLat.lng;
    })
});

// remove marker
document.addEventListener('keydown', (evt) => {
    if (evt.key === "Escape" && markers.length) {
        marker = markers.pop();
        marker.remove();
    }
})