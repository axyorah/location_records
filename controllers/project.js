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

    const project = await Project.findById(projectId);
    res.cookie('projectId', project._id, { sameSite: 'strict' }); //secure: true, 
    res.locals.projectId = project._id;

    const areas = await Area.find({ project }).populate('cities');
    const cities = await City.find({ project });

    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;
    
    res.render('./projects/show.ejs', { selected, areas, cities, project });//, projects: user.projects });
}

module.exports.share = async (req,res) => {
    const { username } = res.locals;
    const projectToken = parseMixedSchema(req.body.projectToken);

    const user = await User.findOne({ username }).populate('projects');
    const project = await Project.findOne({ token: projectToken });

    // if project with given token does not exist - flash error message 
    if ( !project ) {
        req.flash('error', 'Project with this token does not exist!');
        return res.redirect('/');
    }

    // if user already has access to this project - redirect to project home
    // (dont't add project to user's projects)
    if ( await User.findOne({ username: username, projects: project }) ) {
        return res.redirect(`/projects/${project._id}`);
    }

    user.projects.push(project);
    await user.save();

    req.flash('success', `${project.name} can be accessed now!`);
    res.redirect(`/projects/${project._id}`);
}

module.exports.renderNew = async (req,res) => {
    // get dummy project with default map settings
    let project = await Project.findOne({ name: 'DUMMY PROJECT'});
    if ( !project ) {
        project = new Project({
            name: 'DUMMY PROJECT',
            description: 'Dummy Project',
            lat: 25,
            lng: 0,
            zoom: 0.7,
            mapStyle: 'streets-v11',
            mapUrl: '',
            token: 'dummy-project'
        });
        await project.save();
    }
    res.render('./projects/new.ejs', { cities: [], areas: [], project });
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

    res.cookie('projectId', project._id, { sameSite: 'strict' });
    req.flash('success', `New Project "${project.name}" was added!`);
    res.redirect(`/projects/${project._id}`);
}

module.exports.renderEdit = async (req,res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    const cities = await City.find({ project });
    const areas = await Area.find({ project }).populate('cities');

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

module.exports.delete = async (req,res) => {
    const { projectId } = req.params;
    const { username } = res.locals;

    const user = await User.findOne({ username });
    const project = await Project.findById(projectId);
    const areas = await Area.find({ project });
    const cities = await City.find({ project });

    // remove prjectId from cookies    
    res.cookie('projectId', undefined, { sameSite: 'strict' });

    // delete project and its children only if 
    // there's only one user who has access to it
    if ( (await User.find({ projects: project._id })).length === 1 ) {
        // delete project's children cities and areas
        for (let city of cities) {
            await City.findByIdAndDelete(city._id);
        }
        for (let area of areas) {
            await Area.findByIdAndDelete(area._id);
        }

        // delete project
        await Project.findByIdAndDelete(projectId);

        req.flash('success', `${project.name} was succesfully deleted!`);        
    } else {
        req.flash(
            'success', 
            `${project.name} is removed from your projects, ` +
            `however it will still be available to other people.`
        );
    }    

    // delete project from its parent user
    await User.findByIdAndUpdate(
        user._id,
        { $pull: { projects: project._id } }
    )

    res.redirect('/');
}