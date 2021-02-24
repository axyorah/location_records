const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const sanitizeHtml = require('sanitize-html');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const ExpressError = require('../utils/ExpressError.js');
const { parseMixedSchema } = require('../utils/formUtils.js');

module.exports.data = async (req,res) => {
    const { id } = req.params;
    
    const selected = await City.findOne({ _id: id });
    if ( !selected ) throw new ExpressError('City with Specified ID Does Not Exist', 400);

    console.log('CITY.DATA: SELECTED CITY:');
    console.log(selected);    
    res.send(selected);
}

module.exports.show = async (req,res) => {

    const { projectId, id } = req.params;

    const project = await Project.findById(projectId);

    const selected = await City.findOne({ _id: id });
    if ( !selected ) throw new ExpressError('City with Specified ID Does Not Exist', 400);

    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');     
    
    console.log('CITY.SHOW: SELECTED CITY:');
    console.log(selected);
    res.render('./general/show.ejs', { selected, areas, cities, project });
}

module.exports.renderNew = async (req,res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const areas = await Area.find({ project }).populate('cities');
    const cities = await City.find({ project });

    res.render('./cities/new.ejs', { areas, cities, project });
}

module.exports.addNew = async (req,res) => {
    console.log('REQ.BODY.CITY:');
    console.log(req.body.city);
    if ( !req.body.city ) throw new ExpressError('Invalid City Submission', 400);
    
    const { projectId } = req.params;
    const { name, code, lat, lng, quickInfo, area } = req.body.city;
    const generalInfo = req.body.city['General Information'];
    //const citySpecific = req.body.city['City-Specific'];

    const project = await Project.findById(projectId);

    const areaObj = await Area.findOne({ name: area, project });
    if ( !areaObj ) throw new ExpressError('Specified Area Does Not Exist', 400);

    let city = new City({
        name: parseMixedSchema(name),
        geometry: {
            type: 'Point',        
            coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        code: parseMixedSchema(code),
        quickInfo: parseMixedSchema(quickInfo),
        area: areaObj,
        project: project
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

    req.flash('success', `New City "${city.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const project = await Project.findById(projectId);

    const selected = await City.findById(id);
    if ( !selected ) throw new ExpressError('City with Specified ID Does Not Exist', 400);

    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');

    res.render('./cities/edit.ejs', { selected, cities, areas, project });
}

module.exports.updateEdited = async (req,res) => {
    console.log('REQ.BODY.CITY:');
    console.log(req.body.city);
    if ( !req.body.city ) throw new ExpressError('Invalid Format', 400);

    const { projectId, id } = req.params;
    const { name, code, lat, lng, quickInfo, area } = await req.body.city;
    const generalInfo = await req.body.city['General Information'];
    //const citySpecific = req.body.city['City-Specific'];

    const cityOld = await City.findById( id );

    const areaOld = await Area.findById( cityOld.area );
    const areaNew = await Area.findOne({ name: area });
    if ( !areaNew ) throw new ExpressError('Specified Area Does Not Exist', 400);

    const city = await City.findByIdAndUpdate(
        id, 
        {
            name: parseMixedSchema(name),
            geometry: {
                type: 'Point',        
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            code: parseMixedSchema(code),
            quickInfo: parseMixedSchema(quickInfo),
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

    req.flash('success', `"${city.name}" has been succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.delete = async (req,res) => {
    const { projectId, id } = req.params;
    console.log(`DELETING CITY ${id}`);

    // delete city from City collection
    const city = await City.findByIdAndDelete(id);
    if ( !city ) throw new ExpressError('City with Specified ID Does Not Exist', 400);

    // delete city from its parent Area
    const area = await Area.findOneAndUpdate(
        { cities: id },
        { $pull: { cities: id } }
    );
    area.save();

    req.flash('success', `"${city.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}