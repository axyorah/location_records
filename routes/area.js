const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals, isLoggedIn } = require('../middleware.js');
const area = require('../controllers/area.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/areas/new')
    .get(setLocals, isLoggedIn, catchAsync(area.renderNew))
    .post(setLocals, isLoggedIn, catchAsync(area.addNew));

router.route('/areas/:id/edit')
    .get(setLocals, isLoggedIn, catchAsync(area.renderEdit))
    .post(setLocals, isLoggedIn, catchAsync(area.updateEdited));

router.route('/areas/:id/delete')
    .delete(setLocals, isLoggedIn, catchAsync(area.delete));

router.route('/areas/:id')
    .get(setLocals, catchAsync(area.show));

module.exports = router;