const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get(
    '/facebook/redirect',
    passport.authenticate('facebook'),
    (req, res) => {
        res.redirect(req.session.redirectTo || '/');
        delete req.session.redirectTo;
    }
);

router.get('/', passport.authenticate('facebook', { scope: ['email'] }));

module.exports = router;
