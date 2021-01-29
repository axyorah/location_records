const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

module.exports.index = async (req,res) => {
    const code = '75';

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    const area = await Area.findOne({ code: code }).populate('cities');
    const city = await City.findOne({ code: code });
    const item = area || city;

    console.log(item);

    res.render('./rov/mapView.ejs', { item, areas, cities });
}