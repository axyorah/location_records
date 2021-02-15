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