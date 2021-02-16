const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const area = require('../controllers/area.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/areas/new')
    .get(setLocals, catchAsync(area.renderNew))
    .post(setLocals, catchAsync(area.addNew));

router.route('/areas/:id/edit')
    .get(setLocals, catchAsync(area.renderEdit))
    .post(setLocals, catchAsync(area.updateEdited));

router.route('/areas/:id/delete')
    .delete(setLocals, catchAsync(area.delete));

router.route('/areas/:id')
    .get(setLocals, catchAsync(area.show));

module.exports = router;