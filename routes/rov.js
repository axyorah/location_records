const express = require('express');
const router = express.Router({ mergeParams: true });

const rov = require('../controllers/rov.js');

router.route('/')
    .get(rov.home) 

// router.route('/:id')
//     .post(rov.selected);

module.exports = router;