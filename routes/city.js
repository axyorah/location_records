const express = require('express');

const router = express.Router({ mergeParams: true });

const city = require('../controllers/city.js');
const { setLocals, validateCity } = require('../middleware.js');


router.route('/cities/new')
    .get(setLocals, city.renderNew)
    .post(setLocals, validateCity, city.addNew);

router.route('/cities/:id/edit')
    .get(setLocals, city.renderEdit)
    .post(setLocals, city.updateEdited);

router.route('/cities/:id/delete')
    .delete(setLocals, city.delete);

router.route('/cities/:id')
    .get(setLocals, city.show)
    .post(setLocals, city.data);

module.exports = router;