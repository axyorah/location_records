const express = require('express');
const router = express.Router({ mergeParams: true });

const area = require('../controllers/area.js');

router.route('/areas/new')
    .get(area.renderNew)
    .post(area.addNew);

router.route('/areas/:id')
    .get(area.show);

module.exports = router;