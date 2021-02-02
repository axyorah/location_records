const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

module.exports.home = async (req,res) => {  
    // by default `/` shows the list of all areas as links;
    // on area request (click area link) - shows specific area info
    // on city request (click map marker) - show specific city info

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    const { areaId } = req.query;
    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;

    res.render('./rov/home.ejs', { selected, areas, cities });
}

// module.exports.index = async (req,res) => {
//     // initial...
//     const code = 'AML';

//     const areas = await Area.find({}).populate('cities');
//     const cities = await City.find({});

//     const area = await Area.findOne({ code: code }).populate('cities');
//     const city = await City.findOne({ code: code });
//     const selected = area || city;

//     console.log(selected);

//     res.render('./rov/index.ejs', { selected, areas, cities });
// }

// module.exports.selected = async (req,res) => {

//     const { id } = req.params;
    
//     const area = await Area.findOne({ _id: id }).populate('cities');
//     const city = await City.findOne({ _id: id });
//     const selected = area || city;

//     console.log('SELECTED:');
//     console.log(selected);

//     res.send(selected);
// }