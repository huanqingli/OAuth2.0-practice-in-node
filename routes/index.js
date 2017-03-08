/**
 * Created by Muc on 17/3/7.
 */
const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user : req.user });
});


router.get('/register', (req, res) => {
    res.render('register', { });
});


router.post('/register', (req, res, next) => {
    var user = {
        username: req.body.username,
        password: req.body.password,
    };
    var User = new Account(user);
    User.save(function (err) {
        if(err)return res.redirect('/register');
        req.login(user, function(err) {
            if (err) { return res.redirect('/register'); }
            return res.redirect('/');
        });
    });
});


router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local',
    { successRedirect: '/',
    failureRedirect: '/login',})
);

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});


router.get('/auth/provider', passport.authenticate('provider'));
router.get('/auth/provider/callback',
    passport.authenticate('provider', { successRedirect: '/',
        failureRedirect: '/login' }));

module.exports = router;