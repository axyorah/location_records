const User = require('../models/user.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.renderRegistrationForm = (req,res) => {
    res.render('./users/new.ejs');
}

module.exports.addRegistered = async (req,res) => {

    try {
        const { username, password, email } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.flash(
            'success', 
            `New user ${username} has been succesfully registered!`
        );        
        res.redirect('/');

    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/users/new');
    }
}