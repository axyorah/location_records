const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const Area = require('../models/area.js');
const City = require('../models/city.js');
const { parseMixedSchema, getOrCreateDefaultArea } = require('../utils/formUtils.js');

const ExpressError = require('../utils/ExpressError.js');

module.exports.show = async (req,res) => {

    const { id } = req.params;
    const selected = await Area.findOne({ _id: id }).populate('cities');
    if ( !selected ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    res.render('./general/show.ejs', { selected, areas, cities });
}

module.exports.renderNew = async (req,res) => {
    res.render('./areas/new.ejs');
}

module.exports.addNew = async (req,res) => {
    console.log('REQ.BODY.AREA:');
    console.log(req.body.area);
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);

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
    if ( !selected ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);

    const cities = await City.find({});
    const areas = await Area.find({}).populate('cities');

    res.render('./areas/edit.ejs', { selected, cities, areas });
}

module.exports.updateEdited = async (req,res) => {
    console.log('REQ.BODY.AREA:');
    console.log(req.body.area);
    
    const { id } = req.params;
    const area = await Area.findById(id);
    if ( !area ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);

    const { name, code, color, quickInfo } = await req.body.area;
    const generalInfo = await req.body.area['General Information'];
    //const areaSpecific = req.body.area['Area-Specific'];

    await Area.findByIdAndUpdate(
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

    // if current area is DEFAULT AREA and it has children - ignore
    const area = await Area.findById(id);
    if ( !area ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);
    
    if ( area.name === 'DEFAULT AREA' && area.cities.length ) {
        req.flash(
            'error', 
            `Can't delete the "DEFAULT AREA" while there are cities ` + 
            `that are assigned to it.\n` + 
            `If you want to delete the "DEFAULT AREA", reassign all the ` +
            `cities that belong to it to different areas and try again.`);
        res.redirect('/');
        return;
    }

    // delete area from Area collection
    console.log(`DELETING area ${area.name} (${id})`);
    await Area.findByIdAndDelete(id);

    // if there are any cities that belong to deleted area
    // they need to be reassigned to DEFAULT AREA;
    // if DEFAULT AREA doesn't yet exist - create it!
    if ( area.cities.length ) {
        // get/create default area
        let defaultArea;
        getOrCreateDefaultArea().then(area => { defaultArea = area });

        // set orphaned cities to be children of default area        
        const cities = await City.find({ area: area });
        for (let city of cities ) {
            defaultArea.cities.push(city);
            city.area = defaultArea;
            city.save();
        }
        defaultArea.save();
    }

    req.flash('success', `"${area.name}" has been succesfully deleted!`);
    res.redirect('/');
}