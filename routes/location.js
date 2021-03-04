const express = require('express');

const router = express.Router({ mergeParams: true });

const location = require('../controllers/location.js');
const { setLocals, validateCity, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, doesProjectBelongToUser } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/locations/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, location.renderNew)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateCity, catchAsync(location.addNew));

router.route('/projects/:projectId/locations/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, location.renderEdit)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, validateCity, catchAsync(location.updateEdited));

router.route('/projects/:projectId/locations/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(location.delete));

router.route('/projects/:projectId/locations/:id')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(location.show))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(location.data));

module.exports = router;