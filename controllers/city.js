const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

module.exports.renderNew = async (req,res) => {
    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    res.render('./cities/new.ejs', { areas, cities });
}

module.exports.addNew = async (req,res) => {
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