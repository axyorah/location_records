const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const user = require('../controllers/user.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/users/new')
    .get(setLocals, user.renderRegistrationForm)
    .post(setLocals, catchAsync(user.addRegistered));

module.exports = router;