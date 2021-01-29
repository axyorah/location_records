const mongoose = require('mongoose');
const Area = require('../models/area.js');
const City = require('../models/city.js');
const areas = require('./areasWithCities.js');

mongoose.connect('mongodb://localhost:27017/rov', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!')
});

const seedDB = async () => {
    await Area.deleteMany({});

    for (let area in areas) {
        console.log(`Populating "${area}"`);

        const cities = [];
        for (let city of areas[area].cities) {
            console.log(`  ${city.name}`);
            const newCity = new City({});
            for (let field in city) {
                if (field === 'latLng') {
                    const latLng = city[field];
                    newCity.geometry = {
                        type: 'Point',
                        coordinates: [latLng[1], latLng[0]]
                    }
                } else {
                    newCity[field] = city[field];
                }                
            }
            await newCity.save();
            cities.push(newCity);
        }

        const newArea = new Area({
            name: areas[area].name,
            code: areas[area].name,
            quickInfo: areas[area].quickInfo,
            cities: cities
        })

        await newArea.save();
    }
}

seedDB().then(() => {
    console.log('Database "rov" seeded!');
    mongoose.connection.close();
});