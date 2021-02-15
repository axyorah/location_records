const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const Area = require('../models/area.js');
const City = require('../models/city.js');
const { jsonEscape, parseMixedSchema } = require('../utils/formUtils.js');

module.exports.show = async (req,res) => {

    const { id } = req.params;
    const selected = await Area.findOne({ _id: id }).populate('cities');

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    res.render('./rov/show.ejs', { selected, areas, cities, messages: req.flash('success') });
}

module.exports.renderNew = async (req,res) => {
    res.render('./areas/new.ejs');
}

module.exports.addNew = async (req,res) => {
    console.log(req.body.area);
    const { name, code, color, quickInfo } = req.body.area;
    const generalInfo = req.body.area['General Information'];

    let area = new Area({
        name: name,
        code: code,
        color: color,
        quickInfo: quickInfo,
        'General Information': parseMixedSchema(generalInfo),
    });
    area.markModified('General Information');

    await area.save();

    req.flash('success', `New area "${area.name}" has been added!`);
    res.redirect('/');
}

module.exports.renderEdit = async (req,res) => {
    const { id } = req.params;

    const selected = await Area.findOne({ _id: id });
    const cities = await City.find({});
    const areas = await Area.find({}).populate('cities');

    res.render('./areas/edit.ejs', { selected, cities, areas });
}

module.exports.updateEdited = async (req,res) => {
    console.log('REQ.BODY.AREA:');
    console.log(req.body.area);
    const { id } = req.params;
    const { name, code, color, quickInfo } = await req.body.area;
    const generalInfo = await req.body.area['General Information'];
    //const areaSpecific = req.body.area['Area-Specific'];

    const area = await Area.findByIdAndUpdate(
        id, 
        {
            name: name,
            code: code,
            color: color,
            quickInfo: parseMixedSchema(quickInfo),
            'General Information': parseMixedSchema(generalInfo),
        },
        {
            new: true,
            runValidators: true
        }
    )

    // mixed schema fields require explicit update
    area.markModified('General Information'); 
    //city.markModified('City-Specific');    

    await area.save();  

    req.flash('success', `"${area.name}" has been succesfully updated!`);
    res.redirect('/');
}

module.exports.delete = async (req,res) => {
    const { id } = req.params;
    console.log(`DELETING ${id}`);

    // delete area from Area collection
    await Area.findByIdAndDelete(id);

    // set orphaned cities to be children on default area
    const defaultAreaId = '123'; // MAKE ACTUAL DEFAULT AREA
    const cities = await City.updateMany(
        { area: id },
        { area: defaultAreaId }
    );
    cities.save();


    req.flash('success', `"${area.name}" has been succesfully deleted!`);
    res.redirect('/');
}