const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const Area = require('../models/area.js');
const City = require('../models/city.js');
const { parseMixedSchema } = require('../utils/formUtils.js');

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
    const generalInfo = req.body.city['General Information'];
    //const citySpecific = req.body.city['City-Specific'];

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

    // add mixed schema fields separately
    city['General Information'] = parseMixedSchema(generalInfo);
    //city['City-Specific'] = parseMixedSchema(citySpecific);

    city.markModified('General Information'); // mixed schema fields require explicit update
    //city.marlModified('City-Specific');    

    await city.save();

    // add city to resp. area and save
    areaObj.cities.push(city);
    await areaObj.save();

    res.redirect('/');
}