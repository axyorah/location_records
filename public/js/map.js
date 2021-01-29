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

// let cityMarker, popup;
// for (let city of cities) {
//     popup = new mapboxgl.Popup();
//     popup.setHTML(`${city.name}<br>${city.quickInfo}`);
//     cityMarker = new mapboxgl.Marker()
//         .setLngLat(city.geometry.coordinates)
//         .setPopup(popup)
//         .addTo(map);
// }

map.on('load', function () {
    for (let areaName in area2color) {
        const area = areas.filter(area => area.name === areaName)[0];
        console.log(`AREA: ${areaName}`);
        console.log(area);
        map.addSource(`cities-${areaName}`, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': area.cities
            }
        });
        // Add a layer showing the places.
        map.addLayer({
            'id': `cities-${areaName}`,
            'type': 'circle',
            'source': `cities-${areaName}`,
            'paint': { 
                'circle-color': area2color[areaName],
                'circle-radius': 8
            }
        });
    }    
});