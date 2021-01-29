const cities = require('./cities.json');
//const cities = JSON.parse(citiesJSON);

const area2city = {
    'AML': [75, 63, 64, 62],
    'GEBIED-1': [17, 27, 89, 61, 70, 87, 73, 97],
    'GEBIED-2A2C': [110, 140, 121, 120, 30, 68, 69, 29, 28, 71, 20, 82],
    'GEBIED-2B' :[55, 67, 38, 49],
    'GEBIED-3': [180, 107, 1, 604, 3],    
}

const completeCityProfile = (code) => {
    if ( cities[code] !== undefined ) {
        const city = cities[code];
        city.code = parseInt(code);
        city.quickInfo = code;
        return city;
    }
}

const areas = {
    'AML': {
        name: 'AML',
        quickInfo: 'AML',
        general: {'eve': 'eveervew', 'aserv': 'evertv'},
        cities: area2city['AML']
            .map(code => completeCityProfile(code))
            .filter((city) => city !== undefined)
    },
    'GEBIED-1': {
        name: 'GEBIED-1',
        quickInfo: 'GEBIED-1',
        cities: area2city['GEBIED-1']
            .map(code => completeCityProfile(code))
            .filter((city) => city !== undefined)
    },
    'GEBIED-2A2C': {
        name: 'GEBIED-2A2C',
        quickInfo: 'GEBIED-2A2C',
        cities: area2city['GEBIED-2A2C']
            .map(code => completeCityProfile(code))
            .filter((city) => city !== undefined)
    },
    'GEBIED-2B': {
        name: 'GEBIED-2B',
        quickInfo: 'GEBIED-2B',
        cities: area2city['GEBIED-2B']
            .map(code => completeCityProfile(code))
            .filter((city) => city !== undefined)
    },
    'GEBIED-3': {
        name: 'GEBIED-3',
        quickInfo: 'GEBIED-3',
        cities: area2city['GEBIED-3']
            .map(code => completeCityProfile(code))
            .filter((city) => city !== undefined)
    }
}

//console.log(areas['AML'].cities[0]);
module.exports = areas;