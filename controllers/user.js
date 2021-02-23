const User = require('../models/user.js');
const Project = require('../models/project.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.renderRegister = (req,res) => {
    res.render('./users/new.ejs');
}

module.exports.register = async (req,res,next) => {
    try {
        const { username, password, email, projectToken } = req.body.user;

        const project = new Project({
            name: 'My First Project',
            description: 'My first project.',
            lng: 0,
            lat: 0,
            zoom: 0,
            mapStyle: 'streets-v11',
            token: projectToken
        });
        await project.save();

        const user = new User({ 
            username: username, 
            email: email
        });
        user.projects.push(project);

        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) { return next(err); }

            req.flash('success', `Welcome, ${username}!`); 
            res.redirect(`/projects/${project._id}`);
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/users/new');
    }
}

module.exports.renderLogin = (req,res) => {
    res.render('./users/login.ejs');
}

module.exports.login = async (req,res) => {
    const { username } = req.body;

    const user = await User.findOne({ username: username }).populate('projects');
    const project = user.projects[0];

    req.flash('success', `Welcome back, ${username}!`);
    res.redirect(`/projects/${project._id}`);
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success', 'Bye!');
    res.redirect('/');
}