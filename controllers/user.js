const User = require('../models/user.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.renderRegister = (req,res) => {
    res.render('./users/new.ejs');
}

module.exports.register = async (req,res) => {

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

module.exports.renderLogin = (req,res) => {
    res.render('./users/login.ejs');
}

module.exports.login = (req,res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back, ${username}!`);
    res.redirect('/');
}

module.exports.logout = (req,res) => {
    res.redirect('/');
}