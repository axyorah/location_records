const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { setLocals, validateCity, isLoggedIn } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/cities/new')
    .get(setLocals, isLoggedIn, city.renderNew)
    .post(setLocals, isLoggedIn, validateCity, catchAsync(city.addNew));

router.route('/cities/:id/edit')
    .get(setLocals, isLoggedIn, city.renderEdit)
    .post(setLocals, isLoggedIn, catchAsync(city.updateEdited));

router.route('/cities/:id/delete')
    .delete(setLocals, isLoggedIn, catchAsync(city.delete));

router.route('/cities/:id')
    .get(setLocals, catchAsync(city.show))
    .post(setLocals, catchAsync(city.data));

module.exports = router;