const express = require('express');

const router = express.Router({ mergeParams: true });

const project = require('../controllers/project.js');
const { setLocals, validateCity, isLoggedIn } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/new')
    .get(setLocals, isLoggedIn, project.renderNew)
    .post(setLocals, isLoggedIn, catchAsync(project.addNew));

router.route('/projects/:projectId')
    .get(setLocals, isLoggedIn, project.show);

module.exports = router;