const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const mbxToken = process.env.MAPBOX_TOKEN;

const baseClient = mbxClient({ accessToken: mbxToken });
const ExpressError = require('../utils/ExpressError.js');
const { resolve } = require('url');
const { request } = require('http');

module.exports.home = async (req,res) => {  
    // by default `/` shows the list of all areas as links;
    // on area request (click area link) - shows specific area info
    // on city request (click map marker) - show specific city info
    const { username } = res.locals;

    const user = username === 'anonymous' ? 
        undefined : await User.findOne({ username }).populate('projects');
    const projects = username === 'anonymous' ? [] : user.projects;

    res.render('./general/home.ejs', { selected: undefined, cities: [], areas: [], projects });
}