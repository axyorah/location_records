const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals, validateCollection, isLoggedIn, isProjectDefined, isProjectInDB, isCollectionInDB, doesProjectBelongToUser } = require('../middleware.js');
const collection = require('../controllers/collection.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/:projectId/collections/new')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, catchAsync(collection.renderNew))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, validateCollection, catchAsync(collection.addNew));

router.route('/projects/:projectId/collections/:id/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCollectionInDB, catchAsync(collection.renderEdit))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCollectionInDB, validateCollection, catchAsync(collection.updateEdited));

router.route('/projects/:projectId/collections/:id/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCollectionInDB, catchAsync(collection.delete));

router.route('/projects/:projectId/collections/:id')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCollectionInDB, catchAsync(collection.show))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isCollectionInDB, catchAsync(collection.data));

module.exports = router;