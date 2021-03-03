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
    
    const selected = await City.findById(id);
      
    res.send(selected);
}

module.exports.show = async (req,res) => {

    const { projectId, id } = req.params;

    const project = await Project.findById(projectId);
    const selected = await City.findById(id);    
    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');     
    
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
    if ( !req.body.city ) throw new ExpressError('Invalid Location Submission', 400);
    
    const { projectId } = req.params;
    const { name, code, lat, lng, quickInfo, area } = req.body.city;
    const generalInfo = req.body.city['General Information'];
    
    const project = await Project.findById(projectId);
    const areaObj = await Area.findOne({ _id: area, project });
    if ( !areaObj ) throw new ExpressError('Specified Collection Does Not Exist', 400);

    // skip if city with the same name already exists
    if ( await City.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/locations/new`);
    }

    let city = new City({
        name: parseMixedSchema(name),
        geometry: {
            type: 'Point',        
            coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        code: parseMixedSchema(code),
        quickInfo: parseMixedSchema(quickInfo),
        'General Information': parseMixedSchema(generalInfo),
        area: areaObj,
        project: project
    });
    
    // mixed schema fields require explicit update
    city.markModified('General Information');     
    await city.save();

    // add city to resp. area and save
    areaObj.cities.push(city);
    await areaObj.save();

    req.flash('success', `New Location "${city.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const project = await Project.findById( projectId );
    const selected = await City.findById( id );    
    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');

    res.render('./cities/edit.ejs', { selected, cities, areas, project });
}

module.exports.updateEdited = async (req,res) => {
    if ( !req.body.city ) throw new ExpressError('Invalid Format', 400);

    const { projectId, id } = req.params;
    const { name, code, lat, lng, quickInfo, area } = await req.body.city;
    const generalInfo = await req.body.city['General Information'];
    
    const project = await Project.findById(projectId);    
    const cityOld = await City.findById(id);
    const areaOld = await Area.findById(cityOld.area);
    const areaNew = await Area.findById(area);
    if ( !areaNew ) throw new ExpressError('Specified Collection Does Not Exist', 400);

    // skip if city with the same name but different id already exists in this project
    if ( await City.findOne({ project, name }) &&
         !(await City.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/locations/${id}/edit`);
    }

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
            project: project,
            'General Information': parseMixedSchema(generalInfo),
        },
        {
            new: true,
            runValidators: true
        }
    )

    // mixed schema fields require explicit update
    city.markModified('General Information');
    await city.save();

    // if area was changed:
    if ( areaOld._id !== areaNew._id ) {
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

    // delete city from City collection
    const city = await City.findByIdAndDelete(id);
    
    // delete city from its parent Area
    const area = await Area.findOneAndUpdate(
        { cities: id },
        { $pull: { cities: id } }
    );
    area.save();

    req.flash('success', `"${city.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}