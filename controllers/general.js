const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;

const baseClient = mbxClient({ accessToken: mbxToken });
const ExpressError = require('../utils/ExpressError.js');

module.exports.home = async (req,res) => {  
    // by default `/` shows the list of all areas as links;
    // on area request (click area link) - shows specific area info
    // on city request (click map marker) - show specific city info

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    const { areaId } = req.query;
    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;
    
    console.log('GENERAL.HOME: SELECTED');
    console.log(selected);

    res.render('./general/home.ejs', { selected, cities, areas });
}