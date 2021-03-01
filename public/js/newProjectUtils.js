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

const updateFormInputsOnMapConfigChange = (map, lngHtml, latHtml, zoomHtml) => {
    for (let event of ['load', 'move']) {
        map.on(event, function () {
            lngHtml.value = map.getCenter().lng;
            latHtml.value = map.getCenter().lat;
            zoomHtml.value = map.getZoom();
        });
    }    
}

const overlayImage = (map, imgUrl, mapUrlHtml) => {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const lng = aspectRatio > 1 ? 180 : 89 * aspectRatio * 2;
        const lat = aspectRatio > 1 ? 180 / aspectRatio / 2 : 89;

        const mapStyle = getOverlayedMapStyle(imgUrl, lng, lat);
    
        map.setStyle(mapStyle);
        map.setZoom(0);  
        map.setCenter([0,0]);
    };
    img.onerror = (evt) => {
        console.log(evt);
        mapUrlHtml.value = '';
    };
}

const updateMapStyle = (map, mapStyles, mapUrlBtn, mapUrlHtml, mapStyleHtml) => {
    // default styles
    for (let i = 0; i < mapStyles.length; i++) {
        mapStyles[i].addEventListener('click', (evt) => {
            const layerId = evt.target.id;
            map.setStyle('mapbox://styles/mapbox/' + layerId);
            mapStyleHtml.value = layerId;
            mapUrlHtml.value = '';
        })
    }

    // custom img
    mapUrlBtn.addEventListener('click', () => {
        if ( mapUrlHtml.value ) {
            //const url = 'https://miro.medium.com/max/2400/1*vAKUjotJ3K6djUeEQIwyHw.jpeg';
            //const url = 'https://images.unsplash.com/photo-1613929905911-96040610a54d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=701&q=80';
            const imgUrl = mapUrlHtml.value;
            overlayImage(map, imgUrl, mapUrlHtml);
        }
    });
}

const getToken = (len) => {
    token = [];
    for (let i = 0; i < len; i ++) {
        let chr = Math.floor((122 - 48)*Math.random() + 48);
        while ( (chr >= 58 && chr <= 64) || (chr >= 91 & chr <= 96) ) {
            chr = Math.floor((122 - 48)*Math.random() + 48);
        }
        token.push(String.fromCharCode(chr));        
    }
    return token.join('');
};

const addToken = (tokenPHtml,tokenInptHtml) => {
    window.addEventListener('load', function () {
        if ( tokenInptHtml ) {
            const token = getToken(64);
            tokenPHtml.innerText = token;
            tokenInptHtml.value = token;
        }
    });
}