const express = require('express');

const router = express.Router({ mergeParams: true });

const project = require('../controllers/project.js');
const { setLocals, validateCity, isLoggedIn } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/new')
    .get(setLocals, isLoggedIn, project.renderNew)
    .post(setLocals, isLoggedIn, catchAsync(project.addNew));

module.exports = router;