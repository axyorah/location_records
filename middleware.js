const { citySchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError.js');
const City = require('./models/city.js');
const Area = require('./models/area.js');

module.exports.setLocals = (req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
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
    } else {
        next();
    }
}
