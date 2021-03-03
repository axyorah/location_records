const mbxClient = require('@mapbox/mapbox-sdk');

const mbxToken = process.env.MAPBOX_TOKEN;
const baseClient = mbxClient({ accessToken: mbxToken });

const sanitizeHtml = require('sanitize-html');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const { parseMixedSchema, getOrCreateDefaultArea } = require('../utils/formUtils.js');

const ExpressError = require('../utils/ExpressError.js');

// TODO: check whether project/area belongs to user

module.exports.show = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Area.findById(id).populate('cities');
    const project = await Project.findById(projectId);
    const areas = await Area.find({ project }).populate('cities');
    const cities = await City.find({ project });

    res.render('./general/show.ejs', { selected, areas, cities, project });
}

module.exports.renderNew = async (req,res) => {
    const { projectId } = res.locals;
    const project = await Project.findById(projectId);
    
    res.render('./areas/new.ejs', { project });
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);

    const { projectId } = req.params;
    const { name, code, color, quickInfo } = req.body.area;
    const generalInfo = req.body.area['General Information'];

    const project = await Project.findById(projectId);
    
    // skip if area with the same name already exists in this project
    if ( await Area.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/new`);
    }
    
    let area = new Area({
        name: parseMixedSchema(name),
        code: parseMixedSchema(code),
        color: parseMixedSchema(color),
        quickInfo: parseMixedSchema(quickInfo),
        project: project,
        'General Information': parseMixedSchema(generalInfo),
    });
    // mixed schemas require explicit update
    area.markModified('General Information');
    await area.save();

    project.areas.push(area);
    await project.save();

    req.flash('success', `New collection "${area.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Area.findOne({ _id: id });
    const project = await Project.findById(projectId);
    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');

    res.render('./areas/edit.ejs', { selected, cities, areas, project });
}

module.exports.updateEdited = async (req,res) => {    
    const { projectId, id } = req.params;    
        
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);
    const { name, code, color, quickInfo } = await req.body.area;
    const generalInfo = await req.body.area['General Information'];

    const area = await Area.findById(id);
    const project = await Project.findById(projectId);

    // skip if area with the same name but different id already exists in this project
    if ( await Area.findOne({ project, name }) &&
         !(await Area.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/collections/${id}/edit`);
    }

    const areaNew = await Area.findByIdAndUpdate(
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
    areaNew.markModified('General Information'); 
    await areaNew.save();  

    req.flash('success', `"${area.name}" has been succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.delete = async (req,res) => {
    const { projectId, id } = req.params;

    const area = await Area.findById(id);
    let project = await Project.findById(projectId);

    // if current area is DEFAULT COLLECTION and it has children - ignore
    if ( area.name === 'DEFAULT COLLECTION' && area.cities.length ) {
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
    console.log(`DELETING ${area.name} (${id})`);
    await Area.findByIdAndDelete(id);

    // if there are any cities that belong to deleted area
    // they need to be reassigned to DEFAULT COLLECTION;
    // if DEFAULT COLLECTION doesn't yet exist - create it!
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
        // add default area to deleted area's parent project
        defaultArea.project = project;
        defaultArea.save();
        project.areas.push(defaultArea);
    }

    // delete area from its parent project
    project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { areas: area._id }}
    );
    await project.save();

    req.flash('success', `"${area.name}" has been succesfully deleted!`);
    res.redirect(`/projects/${projectId}`);
}