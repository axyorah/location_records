const Area = require('../models/area.js');
const City = require('../models/city.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const ExpressError = require('../utils/ExpressError.js');
const { parseMixedSchema } = require('../utils/formUtils.js');

module.exports.show = async (req,res) => {    
    const { projectId } = req.params;
    const { username } = res.locals;
    const { areaId } = req.query;

    const user = await User.findOne({ username: username }).populate('projects');
    const project = await Project.findById(projectId);
    res.cookie('projectId', project._id);
    res.locals.projectId = project._id;

    const areas = await Area.find({ project }).populate('cities');
    const cities = await City.find({ project });

    // TODO: check if selected area belongs to project
    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;

    res.render('./projects/show.ejs', { selected, areas, cities, project, projects: user.projects });
}

module.exports.share = async (req,res) => {
    const { username } = res.locals;
    const projectToken = parseMixedSchema(req.body.projectToken);

    const user = await User.findOne({ username }).populate('projects');
    const project = await Project.findOne({ token: projectToken });

    if ( !project ) throw new ExpressError('Project with Given Token Does Not Exist', 400);

    if ( await User.findOne({ username: username, projects: project }) ) {
        return res.redirect(`/projects/${project._id}`);
    }

    user.projects.push(project);
    await user.save();

    req.flash('success', `${project.name} can be accessed now!`);
    res.redirect(`/projects/${project._id}`);
}

module.exports.renderNew = (req,res) => {
    res.render('./projects/new.ejs');
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.project ) throw new ExpressError('Invalid Project Submission', 400);

    const { username } = res.locals;
    const { name, description, lng, lat, zoom, mapStyle, mapUrl, token } = req.body.project;
    
    const project = new Project({
        name: parseMixedSchema(name),
        description: parseMixedSchema(description),
        lng: parseFloat(lng),
        lat: parseFloat(lat),
        zoom: parseFloat(zoom),
        mapStyle: parseMixedSchema(mapStyle),
        mapUrl: mapUrl, // should be checked client-side
        token: token
    });

    await project.save();

    const user = await User.findOne({ username });
    user.projects.push(project);
    await user.save();

    res.cookie('projectId', project._id);
    req.flash('success', `New Project "${project.name}" was added!`);
    res.redirect(`/projects/${project._id}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');

    console.log(projectId)
    console.log(project)

    res.render('./projects/edit.ejs', { cities, areas, project });
}

module.exports.updateEdited = async (req,res) => {
    const { projectId } = req.params;

    if ( !req.body.project ) throw new ExpressError('Invalid Request Format', 400);    
    const { name, description, lat, lng, zoom, mapStyle, mapUrl } = req.body.project;
    
    const project = await Project.findByIdAndUpdate(
        projectId, 
        {
            name: parseMixedSchema(name),
            description: parseMixedSchema(description),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            zoom: parseFloat(zoom),
            mapStyle: parseMixedSchema(mapStyle),
            mapUrl: mapUrl
        },
        {
            new: true,
            runValidators: true
        }
    );
    await project.save();

    req.flash('success', `"${project.name}" was succesfully updated!`);
    res.redirect(`/projects/${projectId}`);
}