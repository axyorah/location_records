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
    const selected = await Area.findOne({ _id: id }).populate('cities');
    if ( !selected ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);
    
    const project = await Project.findById(projectId);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    res.render('./general/show.ejs', { selected, areas, cities });
}

module.exports.renderNew = async (req,res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);
    
    res.render('./areas/new.ejs');
}

module.exports.addNew = async (req,res) => {
    console.log('REQ.BODY.AREA:');
    console.log(req.body.area);
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);

    const { projectId } = req.params;
    const { name, code, color, quickInfo } = req.body.area;
    const generalInfo = req.body.area['General Information'];

    const project = await Project.findById(projectId);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);

    // skip if area with the same name already exists
    if ( await Area.findOne({ project, name })) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/areas/new`);
    }
    
    let area = new Area({
        name: parseMixedSchema(name),
        code: parseMixedSchema(code),
        color: parseMixedSchema(color),
        quickInfo: parseMixedSchema(quickInfo),
        project: project,
        'General Information': parseMixedSchema(generalInfo),
    });
    area.markModified('General Information');

    await area.save();

    project.areas.push(area);
    await project.save();

    req.flash('success', `New area "${area.name}" has been added!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId, id } = req.params;

    const selected = await Area.findOne({ _id: id });
    if ( !selected ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);

    const project = await Project.findById(projectId);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);
    
    const cities = await City.find({});
    const areas = await Area.find({}).populate('cities');

    res.render('./areas/edit.ejs', { selected, cities, areas });
}

module.exports.updateEdited = async (req,res) => {
    console.log('REQ.BODY.AREA:');
    console.log(req.body.area);
    
    const { projectId, id } = req.params;
    const area = await Area.findById(id);
    const project = await Project.findById(projectId);
    
    if ( !area ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);    
    if ( !req.body.area ) throw new ExpressError('Invalid Request Format', 400);

    const { name, code, color, quickInfo } = await req.body.area;
    const generalInfo = await req.body.area['General Information'];
    //const areaSpecific = req.body.area['Area-Specific'];

    // skip if area with the same name already exists
    if ( await Area.findOne({ project, name }) &&
         !(await Area.findOne({ project, name, _id: id })) ) {
        req.flash('error', `${name} already exists in this project`);
        return res.redirect(`/projects/${projectId}/areas/${id}/edit`);
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
    )

    // mixed schema fields require explicit update
    areaNew.markModified('General Information'); 
    //city.markModified('City-Specific');    

    await areaNew.save();  

    req.flash('success', `"${area.name}" has been succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}

module.exports.delete = async (req,res) => {
    const { projectId, id } = req.params;

    // if current area is DEFAULT AREA and it has children - ignore
    const area = await Area.findById(id);
    if ( !area ) throw new ExpressError('Area with Specified ID Does Not Exist', 400);

    let project = await Project.findById(projectId);
    if ( !project ) throw new ExpressError('Project with Specified ID Does Not Exist', 400);
    
    if ( area.name === 'DEFAULT AREA' && area.cities.length ) {
        req.flash(
            'error', 
            `Can't delete the "DEFAULT AREA" while there are cities ` + 
            `that are assigned to it.\n` + 
            `If you want to delete the "DEFAULT AREA", reassign all the ` +
            `cities that belong to it to different areas and try again.`);
        res.redirect(`/projects/${projectId}`);
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