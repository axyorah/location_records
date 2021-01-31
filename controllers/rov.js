const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

module.exports.index = async (req,res) => {
    // initial...
    const code = 'AML';

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    const area = await Area.findOne({ code: code }).populate('cities');
    const city = await City.findOne({ code: code });
    const selected = area || city;

    console.log(selected);

    res.render('./rov/mapView.ejs', { selected, areas, cities });
}

module.exports.selected = async (req,res) => {

    const { id } = req.params;
    
    const area = await Area.findOne({ _id: id }).populate('cities');
    const city = await City.findOne({ _id: id });
    const selected = area || city;

    console.log('SELECTED:');
    console.log(selected);

    res.send(selected);
}