const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const Area = require('../models/area.js');
const City = require('../models/city.js');
const { jsonEscape, parseMixedSchema } = require('../utils/formUtils.js');

module.exports.data = async (req,res) => {
    const { id } = req.params;
    
    const selected = await City.findOne({ _id: id });

    console.log('CITY.DATA: SELECTED CITY:');
    console.log(selected);    
    res.send(selected);
}

module.exports.show = async (req,res) => {

    const { id } = req.params;

    const selected = await City.findOne({ _id: id });
    const cities = await City.find({});
    const areas = await Area.find({}).populate('cities');    

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
    const { name, code, lat, lng, quickInfo, area } = await req.body.city;
    const generalInfo = await req.body.city['General Information'];
    //const citySpecific = req.body.city['City-Specific'];

    const areaObj = await Area.findOne({ name: area });

    let city = new City({
        name: name,
        geometry: {
            type: 'Point',        
            coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        code: code,
        quickInfo: jsonEscape(quickInfo),
        area: areaObj
    });

    // add mixed schema fields separately
    city['General Information'] = parseMixedSchema(generalInfo);
    //city['City-Specific'] = parseMixedSchema(citySpecific);

    city.markModified('General Information'); // mixed schema fields require explicit update
    //city.markModified('City-Specific');    

    await city.save();

    // add city to resp. area and save
    areaObj.cities.push(city);
    await areaObj.save();

    res.redirect('/');
}

module.exports.renderEdit = async (req,res) => {
    const { id } = req.params;

    const selected = await City.findOne({ _id: id });
    const cities = await City.find({});
    const areas = await Area.find({}).populate('cities');

    res.render('./cities/edit.ejs', { selected, cities, areas });
}

module.exports.updateEdited = async (req,res) => {
    console.log('REQ.BODY.CITY:');
    console.log(req.body.city);
    const { id } = req.params;
    const { name, code, lat, lng, quickInfo, area } = await req.body.city;
    const generalInfo = await req.body.city['General Information'];
    //const citySpecific = req.body.city['City-Specific'];

    const cityOld = await City.findById( id );

    const areaOld = await Area.findById( cityOld.area );
    const areaNew = await Area.findOne({ name: area });

    const city = await City.findByIdAndUpdate(
        id, 
        {
            name: name,
            geometry: {
                type: 'Point',        
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            code: code,
            quickInfo: jsonEscape(quickInfo),
            area: areaNew,
            'General Information': parseMixedSchema(generalInfo),
        },
        {
            new: true,
            runValidators: true
        }
    )

    // mixed schema fields require explicit update
    city.markModified('General Information'); 
    //city.markModified('City-Specific');    

    await city.save();

    // if area was changed:
    if (areaOld._id !== areaNew._id ) {
        // delete city from old area
        await areaOld.updateOne({
            $pull: { cities: city._id }
        });
        await areaOld.save();

        // add city to new area
        areaNew.cities.push(city);
        await areaNew.save();
    }    

    res.redirect('/');
}

module.exports.delete = async (req,res) => {
    const { id } = req.params;

    console.log(`DELETING ${id}`);

    // delete city from City collection
    await City.findByIdAndDelete(id);

    // delete city from its parent Area
    const area = await Area.findOneAndUpdate(
        { cities: id },
        { $pull: { cities: id } }
    );
    area.save();

    res.redirect('/');
}