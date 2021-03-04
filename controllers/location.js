const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const sanitizeHtml = require('sanitize-html');

const Area = require('../models/collection.js');
const City = require('../models/location.js');
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
    const locations = await City.find({ project });
    const collections = await Area.find({ project }).populate('cities');     
    
    res.render('./general/show.ejs', { selected, collections, locations, project });
}

module.exports.renderNew = async (req,res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const collections = await Area.find({ project }).populate('cities');
    const locations = await City.find({ project });

    res.render('./locations/new.ejs', { collections, locations, project });
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.location ) throw new ExpressError('Invalid Location Submission', 400);
    
    const { projectId } = req.params;
    const { name, code, lat, lng, quickInfo, area } = req.body.location;
    const generalInfo = req.body.location['General Information'];
    
    const project = await Project.findById(projectId);
    const collectionObj = await Area.findOne({ _id: area, project });
    if ( !collectionObj ) throw new ExpressError('Specified Collection Does Not Exist', 400);

    // skip if city with the same name already exists
    if ( await City.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/locations/new`);
    }

    let location = new City({
        name: parseMixedSchema(name),
        geometry: {
            type: 'Point',        
            coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        code: parseMixedSchema(code),
        quickInfo: parseMixedSchema(quickInfo),
        'General Information': parseMixedSchema(generalInfo),
        area: collectionObj,
        project: project
    });
    
    // mixed schema fields require explicit update
    location.markModified('General Information');     
    await location.save();

    // add city to resp. area and save
    collectionObj.cities.push(location);
    await collectionObj.save();

    req.flash('success', `New Location "${location.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const project = await Project.findById( projectId );
    const selected = await City.findById( id );    
    const locations = await City.find({ project });
    const collections = await Area.find({ project }).populate('cities');

    res.render('./locations/edit.ejs', { selected, locations, collections, project });
}

module.exports.updateEdited = async (req,res) => {
    if ( !req.body.location ) throw new ExpressError('Invalid Format', 400);

    const { projectId, id } = req.params;
    const { name, code, lat, lng, quickInfo, area } = await req.body.location;
    const generalInfo = await req.body.location['General Information'];
    
    const project = await Project.findById(projectId);    
    const locationOld = await City.findById(id);
    const collectionOld = await Area.findById(locationOld.area);
    const collectionNew = await Area.findById(area);
    if ( !collectionNew ) throw new ExpressError('Specified Collection Does Not Exist', 400);

    // skip if city with the same name but different id already exists in this project
    if ( await City.findOne({ project, name }) &&
         !(await City.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/locations/${id}/edit`);
    }

    const location = await City.findByIdAndUpdate(
        id, 
        {
            name: parseMixedSchema(name),
            geometry: {
                type: 'Point',        
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            code: parseMixedSchema(code),
            quickInfo: parseMixedSchema(quickInfo),
            area: collectionNew,
            project: project,
            'General Information': parseMixedSchema(generalInfo),
        },
        {
            new: true,
            runValidators: true
        }
    )

    // mixed schema fields require explicit update
    location.markModified('General Information');
    await location.save();

    // if area was changed:
    if ( collectionOld._id !== collectionNew._id ) {
        // delete city from old area
        await collectionOld.updateOne({
            $pull: { cities: location._id }
        });
        await collectionOld.save();

        // add city to new area
        collectionNew.cities.push(location);
        await collectionNew.save();
    }    

    req.flash('success', `"${location.name}" has been succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.delete = async (req,res) => {
    const { projectId, id } = req.params;

    // delete city from City collection
    const location = await City.findByIdAndDelete(id);
    
    // delete city from its parent Area
    const collection = await Area.findOneAndUpdate(
        { cities: id },
        { $pull: { cities: id } }
    );
    collection.save();

    req.flash('success', `"${location.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}