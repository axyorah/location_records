const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals, validateArea, isLoggedIn, isProjectDefined, isProjectInDB, isAreaInDB, doesProjectBelongToUser } = require('../middleware.js');
const collection = require('../controllers/collection.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/collections/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, catchAsync(collection.renderNew))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateArea, catchAsync(collection.addNew));

router.route('/projects/:projectId/collections/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(collection.renderEdit))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, validateArea, catchAsync(collection.updateEdited));

router.route('/projects/:projectId/collections/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(collection.delete));

router.route('/projects/:projectId/collections/:id')
    .get(setLocals, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isAreaInDB, catchAsync(collection.show));

module.exports = router;