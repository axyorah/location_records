const getOverlayedMapStyle = (url, lng, lat) => {
    return {
        // https://docs.mapbox.com/mapbox-gl-js/example/image-on-a-map/
        'version': 8,
        'sources': {
            'mapbox': {
                'type': 'vector',
                'url': 'mapbox://mapbox.mapbox-streets-v8'
            },
            'overlay': {
                'type': 'image',
                'url': url,
                'coordinates': [
                    [-lng,  lat],
                    [ lng,  lat],
                    [ lng, -lat],
                    [-lng, -lat]
                ]
            }
        },
        'layers': [
            {
                'id': 'background',
                'type': 'background',
                'paint': { 'background-color': '#2c2c2c' }
            },
            {
                'id': 'overlay',
                'source': 'overlay',
                'type': 'raster',
                'paint': { 'raster-opacity': 0.85 }
            },
        ]
    };
}

const overlayImage = (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const lng = aspectRatio > 1 ? 180 : 89 * aspectRatio * 2;
        const lat = aspectRatio > 1 ? 180 / aspectRatio / 2 : 89;

        const mapStyle = getOverlayedMapStyle(url, lng, lat);
    
        map.setStyle(mapStyle);
        map.setZoom(0);  
        map.setCenter([0,0]);
    };
    img.onerror = (evt) => {
        console.log(evt);
        mapUrlHtml.value = '';
    };
}

map.on('load', function () {
    lngHtml.value = map.getCenter().lng;
    latHtml.value = map.getCenter().lat;
    zoomHtml.value = map.getZoom();
});

map.on('move', function () {
    lngHtml.value = map.getCenter().lng;
    latHtml.value = map.getCenter().lat;
    zoomHtml.value = map.getZoom();
});

const switchLayer = (layer) => {
    const layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
    mapStyleHtml.value = layerId;
    mapUrlHtml.value = '';
}
 
for (let i = 0; i < mapStyles.length; i++) {
    mapStyles[i].onclick = switchLayer;
}

mapUrlBtn.addEventListener('click', function () {
    if ( mapUrlHtml.value ) {
        //const url = 'https://miro.medium.com/max/2400/1*vAKUjotJ3K6djUeEQIwyHw.jpeg';
        // const url = 'https://images.unsplash.com/photo-1613929905911-96040610a54d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=701&q=80';
        const url = mapUrlHtml.value;
        overlayImage(url);
    }
});

const getToken = (len) => {
    token = [`${username}-`.slice(0,len)]
    for (let i = username.length + 1; i < len; i ++) {
        let chr = Math.floor((122 - 48)*Math.random() + 48);
        while ( (chr >= 58 && chr <= 64) || (chr >= 91 & chr <= 96) ) {
            chr = Math.floor((122 - 48)*Math.random() + 48);
        }
        token.push(String.fromCharCode(chr));        
    }
    return token;
};

window.addEventListener('load', function () {     
    const token = getToken(64);
    tokenPHtml.innerText = token.join('');
    tokenInptHtml.value = token.join('');
});