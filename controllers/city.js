const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

module.exports.data = async (req,res) => {
    const { id } = req.params;
    
    const selected = await City.findOne({ _id: id });

    console.log('SELECTED CITY:');
    console.log(selected);    
    res.send(selected);
}

module.exports.show = async (req,res) => {

    const { id } = req.params;
    const selected = await City.findOne({ _id: id });

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    console.log('SELECTED CITY:');
    console.log(selected);
    res.render('./rov/show.ejs', { selected, areas, cities});
}

module.exports.renderNew = async (req,res) => {
    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    res.render('./cities/new.ejs', { areas, cities });
}

module.exports.addNew = async (req,res) => {
    console.log('REQ.BODY.CITY:');
    console.log(req.body.city);
    const { name, code, lat, lng, quickInfo, area } = req.body.city;

    const areaObj = await Area.findOne({ name: area });

    let city = new City({
        name: name,
        geometry: {
            type: 'Point',        
            coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        code: code,
        quickInfo: quickInfo,
        area: areaObj
    });
    await city.save();

    areaObj.cities.push(city);
    await areaObj.save();

    res.redirect('/');
}