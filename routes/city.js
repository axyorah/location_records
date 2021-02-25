const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { setLocals, validateCity, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/cities/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, city.renderNew)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, validateCity, catchAsync(city.addNew));

router.route('/projects/:projectId/cities/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, city.renderEdit)
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, validateCity, catchAsync(city.updateEdited));

router.route('/projects/:projectId/cities/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, catchAsync(city.delete));

router.route('/projects/:projectId/cities/:id')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, catchAsync(city.show))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, isCityInDB, catchAsync(city.data));

module.exports = router;