const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { setLocals, validateCity } = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');

router.route('/cities/new')
    .get(setLocals, catchAsync(city.renderNew))
    .post(setLocals, validateCity, catchAsync(city.addNew));

router.route('/cities/:id/edit')
    .get(setLocals, catchAsync(city.renderEdit))
    .post(setLocals, catchAsync(city.updateEdited));

router.route('/cities/:id/delete')
    .delete(setLocals, catchAsync(city.delete));

router.route('/cities/:id')
    .get(setLocals, catchAsync(city.show))
    .post(setLocals, catchAsync(city.data));

module.exports = router;