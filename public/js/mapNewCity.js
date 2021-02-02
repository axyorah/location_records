const latInpt = document.getElementById('city[lat]');
const lngInpt = document.getElementById('city[lng]');

let markers = [];

map.on('load', function () {
    // add new marker
    map.on('click', function (e) {
        const lngLat = [e.lngLat.lng, e.lngLat.lat];
        
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