const express = require('express');

const router = express.Router({ mergeParams: true });

const project = require('../controllers/project.js');
const { setLocals, validateCity, isProjectDefined, isProjectInDB, isLoggedIn } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/new')
    .get(setLocals, isLoggedIn, project.renderNew)
    .post(setLocals, isLoggedIn, catchAsync(project.addNew));

router.route('/projects/share')
    .post(setLocals, isLoggedIn, project.share);

router.route('/projects/:projectId')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, project.show);

module.exports = router;