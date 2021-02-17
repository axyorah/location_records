const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const general = require('../controllers/general.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/')
    .get(setLocals, catchAsync(general.home))

module.exports = router;