const mbxClient = require('@mapbox/mapbox-sdk');

const Area = require('../models/area.js');
const City = require('../models/city.js');
const User = require('../models/user.js');
const Project = require('../models/project.js');
const mbxToken = process.env.MAPBOX_TOKEN;

const baseClient = mbxClient({ accessToken: mbxToken });
const ExpressError = require('../utils/ExpressError.js');

module.exports.home = async (req,res) => {  
    // by default `/` shows the list of all areas as links;
    // on area request (click area link) - shows specific area info
    // on city request (click map marker) - show specific city info
    const { username } = res.locals;
    const { projectId, areaId } = req.query;

    // if not logged in show empty map
    if ( username === 'anonymous' ) {
        return res.render(
            './general/home.ejs', 
            { selected: undefined, cities: [], areas: [], project: undefined, projects: [] }
        );
    }

    // if logged in:
    // 1. get logged in user
    const user = await User.findOne({ username: username }).populate('projects');
    
    // 2. get logged in user's project (if none specified - get first project)
    const project = projectId ? await Project.findById(projectId) : user.projects[0];    

    // 3. get areas and cities associated with the project
    const areas = await Area.find({}).populate('cities');
    const cities = await City.find({});

    // 4. get area if specified
    const selected = areaId ? await Area.findById(areaId).populate('cities') : undefined;
    
    console.log('GENERAL.HOME: SELECTED');
    console.log(selected);

    res.render(
        './general/home.ejs', 
        { selected, cities, areas, project, projects: user.projects }
    );
}