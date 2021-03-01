const { citySchema, areaSchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError.js');
const catchAsync = require('./utils/catchAsync.js');
const City = require('./models/city.js');
const Area = require('./models/area.js');
const User = require('./models/user.js');
const Project = require('./models/project.js');

module.exports.setLocals = (req,res,next) => {
    res.locals.username = req.user ? req.user.username : 'anonymous';    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    const projectId = req.params.projectId || req.cookies.projectId;
    res.locals.projectId = projectId;
    next();
}

module.exports.validateCity = (req,res,next) => {

    console.log('VALIDATECITY: REQ.BODY:');
    console.log(req.body);

    // validate with Joi
    const { error } = citySchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(',');
        throw new ExpressError(msg, 400);
    }  else {
        next();
    }
}

module.exports.validateArea = (req,res,next) => {

    console.log('VALIDATEAREA: REQ.BODY:');
    console.log(req.body);

    // validate with Joi
    const { error } = areaSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/users/login');
    } else {
        next();
    }
}

module.exports.isProjectDefined = (req,res,next) => {
    if(!res.locals ||
        res.locals.projectId === undefined || 
        res.locals.projectId === 'undefined' ||
        res.locals.projectId === '"undefined"') {
        req.flash('error', 'Select Project First');
        return res.redirect('/');
    } else {
        next();
    }
}

module.exports.isProjectInDB = catchAsync(async (req,res,next) => {
    const { projectId } = req.params;
    if ( !(await Project.findById(projectId)) ) {
        throw new ExpressError('Project with Specified ID Does Not Exist', 400);
    } else {
        next();
    }
})

module.exports.isAreaInDB = catchAsync(async (req,res,next) => {
    const { id } = req.params;
    if ( !(await Area.findById(id)) ){
        throw new ExpressError('Area with Specified ID Does Not Exist', 400);
    } else {
        next();
    }
})

module.exports.isCityInDB = catchAsync(async (req,res,next) => {
    const { id } = req.params;
    if ( !(await City.findById(id)) ) {
        throw new ExpressError('City with Specified ID Does Not Exist', 400);
    } else {
        next();
    }
})