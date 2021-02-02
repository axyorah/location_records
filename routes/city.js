const express = require('express');
const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');

router.route('/cities/new')
    .get(city.renderNew)
    .post(city.addNew);

router.route('/cities/:id')
    .post(city.show);

module.exports = router;