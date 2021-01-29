mapboxgl.accessToken = mapBoxToken;

const map = new mapboxgl.Map({
    container: 'map-nl',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [5.58, 52.25],
    zoom: 6
});