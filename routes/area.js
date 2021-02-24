const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals, validateArea, isLoggedIn, isProjectDefined } = require('../middleware.js');
const area = require('../controllers/area.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/areas/new')
    .get(setLocals, isLoggedIn, isProjectDefined, catchAsync(area.renderNew))
    .post(setLocals, isLoggedIn, isProjectDefined, validateArea, catchAsync(area.addNew));

router.route('/projects/:projectId/areas/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, catchAsync(area.renderEdit))
    .post(setLocals, isLoggedIn, isProjectDefined, validateArea, catchAsync(area.updateEdited));

router.route('/projects/:projectId/areas/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, catchAsync(area.delete));

router.route('/projects/:projectId/areas/:id')
    .get(setLocals, isProjectDefined, catchAsync(area.show));

module.exports = router;