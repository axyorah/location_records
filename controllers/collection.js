const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const sanitizeHtml = require('sanitize-html');

const Collection = require('../models/collection.js');
const Location = require('../models/location.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const { parseMixedSchema, getOrCreateDefaultCollection } = require('../utils/formUtils.js');

const ExpressError = require('../utils/ExpressError.js');

module.exports.show = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Collection.findById(id).populate('cities');
    const project = await Project.findById(projectId);
    const collections = await Collection.find({ project }).populate('cities');
    const locations = await Location.find({ project });

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
    
    // skip if collection with the same name already exists in this project
    if ( await Collection.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/new`);
    }
    
    let collection = new Collection({
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

    const selected = await Collection.findById(id);
    const project = await Project.findById(projectId);
    const locations = await Location.find({ project });
    const collections = await Collection.find({ project }).populate('cities');

    res.render('./collections/edit.ejs', { selected, locations, collections, project });
}

module.exports.updateEdited = async (req,res) => {    
    const { projectId, id } = req.params;    
        
    if ( !req.body.collection ) throw new ExpressError('Invalid Request Format', 400);
    const { name, code, color, quickInfo } = await req.body.collection;
    const generalInfo = await req.body.collection['General Information'];

    const collection = await Collection.findById(id);
    const project = await Project.findById(projectId);

    // skip if collection with the same name but different id already exists in this project
    if ( await Collection.findOne({ project, name }) &&
         !(await Collection.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/${id}/edit`);
    }

    const collectionNew = await Collection.findByIdAndUpdate(
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

    const collection = await Collection.findById(id);
    let project = await Project.findById(projectId);

    // if current collection is DEFAULT COLLECTION and it has children - ignore
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

    // delete collection from Collection collection
    console.log(`DELETING ${collection.name} (${id})`);
    await Collection.findByIdAndDelete(id);

    // if there are any locations that belong to deleted collection
    // they need to be reassigned to DEFAULT COLLECTION;
    // if DEFAULT COLLECTION doesn't yet exist - create it!
    if ( collection.cities.length ) {
        // get/create default collection
        let defaultCollection;
        getOrCreateDefaultCollection().then(collection => { defaultCollection = collection });

        // set orphaned locations to be children of default collection        
        const locations = await Location.find({ area: collection });
        for (let location of locations ) {
            defaultCollection.cities.push(location);
            location.area = defaultCollection;
            location.save();
        }
        // add default collection to deleted collection's parent project
        defaultCollection.project = project;
        defaultCollection.save();
        project.areas.push(defaultCollection);
    }

    // delete collection from its parent project
    project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { areas: collection._id }}
    );
    await project.save();

    req.flash('success', `"${collection.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}