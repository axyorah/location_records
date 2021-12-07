const User = require('../models/user.js');
const Project = require('../models/project.js');
const { createDefaultProject } = require('../utils/formUtils.js');
const ExpressError = require('../utils/ExpressError.js');

module.exports.renderRegister = (req,res) => {
    res.render('./users/new.ejs');
}

module.exports.register = async (req,res,next) => {
    try {
        const { username, password, email, projectToken } = req.body.user;

        const user = new User({ 
            username: username, 
            email: `${username}@example.com`
        });

        const project = createDefaultProject(projectToken);
        await project.save();
        user.projects.push(project);

        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) { return next(err); }

            res.cookie('projectId', project._id, { sameSite: 'strict' });
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

    //const user = await User.findOne({ username: username }).populate('projects');
    res.cookie('projectId', undefined, { sameSite: 'strict' });
    
    req.flash('success', `Welcome back, ${username}!`);
    res.redirect('/');
}

module.exports.logout = (req,res) => {
    req.logout();
    req.user = {username: 'anonymous'};
    req.flash('success', 'Bye!');
    res.redirect('/');
}
