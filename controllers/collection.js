const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const sanitizeHtml = require('sanitize-html');

const Area = require('../models/collection.js');
const City = require('../models/location.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const { parseMixedSchema, getOrCreateDefaultArea } = require('../utils/formUtils.js');

const ExpressError = require('../utils/ExpressError.js');

// TODO: check whether project/area belongs to user

module.exports.show = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Area.findById(id).populate('cities');
    const project = await Project.findById(projectId);
    const collections = await Area.find({ project }).populate('cities');
    const locations = await City.find({ project });

    res.render('./general/show.ejs', { selected, collections, locations, project });
}

module.exports.renderNew = async (req,res) => {
    const { projectId } = res.locals;
    const project = await Project.findById(projectId);
    
    res.render('./collections/new.ejs', { project });
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.collection ) throw new ExpressError('Invalid Request Format', 400);

    const { projectId } = req.params;
    const { name, code, color, quickInfo } = req.body.collection;
    const generalInfo = req.body.collection['General Information'];

    const project = await Project.findById(projectId);
    
    // skip if area with the same name already exists in this project
    if ( await Area.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/new`);
    }
    
    let collection = new Area({
        name: parseMixedSchema(name),
        code: parseMixedSchema(code),
        color: parseMixedSchema(color),
        quickInfo: parseMixedSchema(quickInfo),
        project: project,
        'General Information': parseMixedSchema(generalInfo),
    });
    // mixed schemas require explicit update
    collection.markModified('General Information');
    await collection.save();

    project.areas.push(collection);
    await project.save();

    req.flash('success', `New collection "${collection.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Area.findById(id);
    const project = await Project.findById(projectId);
    const locations = await City.find({ project });
    const collections = await Area.find({ project }).populate('cities');

    res.render('./collections/edit.ejs', { selected, locations, collections, project });
}

module.exports.updateEdited = async (req,res) => {    
    const { projectId, id } = req.params;    
        
    if ( !req.body.collection ) throw new ExpressError('Invalid Request Format', 400);
    const { name, code, color, quickInfo } = await req.body.collection;
    const generalInfo = await req.body.collection['General Information'];

    const collection = await Area.findById(id);
    const project = await Project.findById(projectId);

    // skip if area with the same name but different id already exists in this project
    if ( await Area.findOne({ project, name }) &&
         !(await Area.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/${id}/edit`);
    }

    const collectionNew = await Area.findByIdAndUpdate(
        id, 
        {
            name: parseMixedSchema(name),
            code: parseMixedSchema(code),
            color: parseMixedSchema(color),
            quickInfo: parseMixedSchema(quickInfo),
            'General Information': parseMixedSchema(generalInfo),
        },
        {
            new: true,
            runValidators: true
        }
    );
    // mixed schema fields require explicit update
    collectionNew.markModified('General Information'); 
    await collectionNew.save();  

    req.flash('success', `"${collection.name}" has been succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.delete = async (req,res) => {
    const { projectId, id } = req.params;

    const collection = await Area.findById(id);
    let project = await Project.findById(projectId);

    // if current area is DEFAULT COLLECTION and it has children - ignore
    if ( collection.name === 'DEFAULT COLLECTION' && collection.cities.length ) {
        req.flash(
            'error', 
            `Can't delete the "DEFAULT COLLECTION" while there are locations ` + 
            `that are assigned to it.\n` + 
            `If you want to delete the "DEFAULT COLLECTION", reassign all the ` +
            `locations that belong to it to different collections and try again.`);
        res.redirect(`/projects/${projectId}`);
        return;
    }

    // delete area from Area collection
    console.log(`DELETING ${collection.name} (${id})`);
    await Area.findByIdAndDelete(id);

    // if there are any cities that belong to deleted area
    // they need to be reassigned to DEFAULT COLLECTION;
    // if DEFAULT COLLECTION doesn't yet exist - create it!
    if ( collection.cities.length ) {
        // get/create default area
        let defaultCollection;
        getOrCreateDefaultArea().then(collection => { defaultCollection = collection });

        // set orphaned cities to be children of default area        
        const locations = await City.find({ area: collection });
        for (let location of locations ) {
            defaultCollection.cities.push(location);
            location.area = defaultCollection;
            location.save();
        }
        // add default area to deleted area's parent project
        defaultCollection.project = project;
        defaultCollection.save();
        project.areas.push(defaultCollection);
    }

    // delete area from its parent project
    project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { areas: collection._id }}
    );
    await project.save();

    req.flash('success', `"${collection.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}