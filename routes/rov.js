const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const rov = require('../controllers/rov.js');

router.route('/')
    .get(setLocals, rov.home) 

// router.route('/:id')
//     .post(rov.selected);

module.exports = router;