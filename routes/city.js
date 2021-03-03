const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { setLocals, validateCity, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, doesProjectBelongToUser } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/locations/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, city.renderNew)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateCity, catchAsync(city.addNew));

router.route('/projects/:projectId/locations/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, city.renderEdit)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, validateCity, catchAsync(city.updateEdited));

router.route('/projects/:projectId/locations/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(city.delete));

router.route('/projects/:projectId/locations/:id')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(city.show))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCityInDB, catchAsync(city.data));

module.exports = router;