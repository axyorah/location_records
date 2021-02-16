const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const rov = require('../controllers/rov.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/')
    .get(setLocals, catchAsync(rov.home))

module.exports = router;