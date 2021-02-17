const express = require('express');
const router = express.Router({ mergeParams: true });

const { setLocals } = require('../middleware.js');
const user = require('../controllers/user.js');

const catchAsync = require('../utils/catchAsync.js');
const passport = require('passport');

router.route('/users/new')
    .get(setLocals, user.renderRegister)
    .post(setLocals, catchAsync(user.register));

router.route('/users/login')
    .get(setLocals, user.renderLogin)
    .post(
        //setLocals, 
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }),
        user.login);

router.route('/user/logout')
    .post(setLocals, catchAsync(user.logout));

module.exports = router;