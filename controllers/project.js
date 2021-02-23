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

    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;

    res.render('./projects/show.ejs', { selected, areas, cities, project, projects: user.projects });
}

module.exports.renderNew = (req,res) => {
    res.render('./projects/new.ejs');
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.project ) throw new ExpressError('Invalid Project Submission', 400);

    const { name, description, lng, lat, zoom, mapStyle, mapUrl, token } = req.body.project;
    
    const project = new Project({
        name: parseMixedSchema(name),
        description: parseMixedSchema(description),
        lng: parseFloat(lng),
        lat: parseFloat(lat),
        zoom: parseInt(zoom),
        mapStyle: parseMixedSchema(mapStyle),
        mapUrl: mapUrl, // should be checked client-side
        token: token
    });

    await project.save();

    res.cookie('projectId', project._id);
    req.flash('success', `New Project "${project.name}" was added!`);
    res.redirect(`/projects/${project._id}`);
    //res.send(req.body.project);
}