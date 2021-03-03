const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals, validateArea, isLoggedIn, isProjectDefined, isProjectInDB, isAreaInDB, doesProjectBelongToUser } = require('../middleware.js');
const area = require('../controllers/area.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/collections/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, catchAsync(area.renderNew))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateArea, catchAsync(area.addNew));

router.route('/projects/:projectId/collections/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(area.renderEdit))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, validateArea, catchAsync(area.updateEdited));

router.route('/projects/:projectId/collections/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(area.delete));

router.route('/projects/:projectId/collections/:id')
    .get(setLocals, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(area.show));

module.exports = router;