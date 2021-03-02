const express = require('express');

const router = express.Router({ mergeParams: true });

const project = require('../controllers/project.js');
const { setLocals, isProjectDefined, isProjectInDB, doesProjectBelongToUser, isLoggedIn } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/projects/new')
    .get(setLocals, isLoggedIn, project.renderNew)
    .post(setLocals, isLoggedIn, catchAsync(project.addNew));

router.route('/projects/share')
    .post(setLocals, isLoggedIn, project.share);

router.route('/projects/:projectId/edit')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, catchAsync(project.renderEdit))
    .post(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, catchAsync(project.updateEdited));

router.route('/projects/:projectId/delete')
    .delete(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, project.delete);

router.route('/projects/:projectId')
    .get(setLocals, isLoggedIn, isProjectDefined, isProjectInDB, doesProjectBelongToUser, project.show);

module.exports = router;