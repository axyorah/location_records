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

const overlayImage = (map, imgUrl, mapUrlFormHtml, mapUrlInptHtml) => {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.onload = () => {
        // adjust the map setting to cover the entire world map with the image
        const aspectRatio = img.width / img.height;
        const lng = aspectRatio > 1 ? 180 : 89 * aspectRatio * 2;
        const lat = aspectRatio > 1 ? 180 / aspectRatio / 2 : 89;

        const mapStyle = getOverlayedMapStyle(imgUrl, lng, lat);
        mapUrlFormHtml.value = mapUrlInptHtml.value;
        mapUrlInptHtml.style.backgroundColor = 'rgba(0,0,0,0)';
    
        map.setStyle(mapStyle);
        map.setZoom(0);  
        map.setCenter([0,0]);
    };
    img.onerror = (evt) => {
        console.log(evt);
        // reset both raw unchecked inpt and legit form inpt and provide an error color cue
        mapUrlFormHtml.value = '';
        mapUrlInptHtml.value = '';
        mapUrlInptHtml.style.backgroundColor = 'rgba(255,0,0,0.1)';
    };
}

const updateMapStyle = (map, mapStyles, mapUrlBtn, mapUrlFormHtml, mapUrlInptHtml, mapStyleHtml) => {
    // default styles
    for (let i = 0; i < mapStyles.length; i++) {
        mapStyles[i].addEventListener('click', (evt) => {
            const layerId = evt.target.id;
            map.setStyle('mapbox://styles/mapbox/' + layerId);
            mapStyleHtml.value = layerId;
            mapUrlFormHtml.value = ''; // reset the map img url 
            mapUrlFormHtml.style.backgroundColor = 'rgba(0,0,0,0)';
        })
    }

    // custom img
    mapUrlBtn.addEventListener('click', () => {
        if ( mapUrlInptHtml.value ) {
            // check raw img url inpt 
            // and if it's legit img url:
            // - display img on the map
            // - set value for the actual form element that will be used by db
            //url example for testing: 'https://miro.medium.com/max/2400/1*vAKUjotJ3K6djUeEQIwyHw.jpeg'
            const imgUrl = mapUrlInptHtml.value;
            overlayImage(map, imgUrl, mapUrlFormHtml, mapUrlInptHtml);
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