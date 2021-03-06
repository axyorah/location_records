const { locationSchema, collectionSchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError.js');
const catchAsync = require('./utils/catchAsync.js');
const Location = require('./models/location.js');
const Collection = require('./models/collection.js');
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

module.exports.validateLocation = (req,res,next) => {

    // validate with Joi
    const { error } = locationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(',');
        throw new ExpressError(msg, 400);
    }  else {
        next();
    }
}

module.exports.validateCollection = (req,res,next) => {

    // validate with Joi
    const { error } = collectionSchema.validate(req.body);
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

module.exports.isCollectionInDB = catchAsync(async (req,res,next) => {
    const { id } = req.params;
    if ( !(await Collection.findById(id)) ){
        throw new ExpressError('Collection with Specified ID Does Not Exist', 400);
    } else {
        next();
    }
})

module.exports.isLocationInDB = catchAsync(async (req,res,next) => {
    const { id } = req.params;
    if ( !(await Location.findById(id)) ) {
        throw new ExpressError('Location with Specified ID Does Not Exist', 400);
    } else {
        next();
    }
})

module.exports.doesProjectBelongToUser = catchAsync(async (req,res,next) => {
    const { projectId } = req.params;
    const { username } = res.locals;

    const user = await User.findOne({ username });
    if ( !user.projects.includes(projectId) ) {
        throw new ExpressError(`You don't have access to this project`, 400);
    } else {
        next();
    }
})