const mbxClient = require('@mapbox/mapbox-sdk');

const Collection = require('../models/collection.js');
const Location = require('../models/location.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const mbxToken = process.env.MAPBOX_TOKEN;

const baseClient = mbxClient({ accessToken: mbxToken });
const ExpressError = require('../utils/ExpressError.js');

module.exports.home = async (req,res) => {  
    // by default `/` shows the list of all areas as links;
    // on collection request (click collection link) - shows specific collection info
    // on location request (click map marker) - show specific location info
    const { username } = res.locals;

    const user = username === 'anonymous' ? 
        undefined : await User.findOne({ username }).populate('projects');
    const projects = username === 'anonymous' ? [] : user.projects;

    res.render('./general/home.ejs', { selected: undefined, locations: [], collections: [], projects });
}