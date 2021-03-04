const express = require('express');

const router = express.Router({ mergeParams: true });

const location = require('../controllers/location.js');
const { setLocals, validateLocation, isLoggedIn, isProjectDefined, isProjectInDB, isLocationInDB, doesProjectBelongToUser } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/locations/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, location.renderNew)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateLocation, catchAsync(location.addNew));

router.route('/projects/:projectId/locations/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLocationInDB, location.renderEdit)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLocationInDB, validateLocation, catchAsync(location.updateEdited));

router.route('/projects/:projectId/locations/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLocationInDB, catchAsync(location.delete));

router.route('/projects/:projectId/locations/:id')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLocationInDB, catchAsync(location.show))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLocationInDB, catchAsync(location.data));

module.exports = router;