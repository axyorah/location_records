const latInpt = document.getElementById('city[lat]');
const lngInpt = document.getElementById('city[lng]');

let markers = [];

map.on('load', function () {
    // add new marker
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