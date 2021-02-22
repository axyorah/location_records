const Area = require('../models/area.js');
const City = require('../models/city.js');
const Project = require('../models/project.js');
const ExpressError = require('../utils/ExpressError.js');
const { parseMixedSchema } = require('../utils/formUtils.js');

module.exports.renderNew = (req,res) => {
    res.render('./projects/new.ejs');
}

module.exports.addNew = async (req,res) => {
    if ( !req.body.project ) throw new ExpressError('Invalid Project Submission', 400);

    const { name, description, lng, lat, zoom, mapStyle, mapUrl, token } = req.body.project;
    console.log(req.body.project);
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

    req.flash('success', `New Project "${project.name}" was added!`);
    res.redirect('/');
    //res.send(req.body.project);
}