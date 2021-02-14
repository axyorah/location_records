const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const area = require('../controllers/area.js');

router.route('/areas/new')
    .get(setLocals, area.renderNew)
    .post(setLocals, area.addNew);

router.route('/areas/:id')
    .get(setLocals, area.show);

module.exports = router;