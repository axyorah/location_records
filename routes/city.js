const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { validateCity } = require('../middleware.js');


router.route('/cities/new')
    .get(city.renderNew)
    .post(validateCity, city.addNew);

router.route('/cities/edit/:id')
    .get(city.renderEdit)
    .post(city.updateEdited);

router.route('/cities/:id')
    .get(city.show)
    .post(city.data);

module.exports = router;