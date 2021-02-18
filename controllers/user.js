const User = require('../models/user.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.renderRegister = (req,res) => {
    res.render('./users/new.ejs');
}

module.exports.register = async (req,res,next) => {
    try {
        const { username, password, email } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) { return next(err); }

            req.flash('success', `Welcome, ${username}!`); 
            res.redirect('/');
        });
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
    req.logout();
    req.flash('success', 'Bye!');
    res.redirect('/');
}