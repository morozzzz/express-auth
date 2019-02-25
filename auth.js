const { User } = require('./schemas');

const fpOpts = {
    clientID: '372394643555938',
    clientSecret: '1a891a4ecd648aaef0955f24daea590c',
    callbackURL: 'http://localhost:3000/auth/facebook/redirect',
    profileFields: ['emails'],
};

const fbCallback = (accessToken, refreshToken, profile, done) => {
    User.findById(profile.id, (err, user) => {
        if (err) {
            return done(err);
        }

        if (user) {
            return done(null, false);
        }

        const newUser = new User({
            _id: profile.id,
            emails: profile.emails
        });

        return newUser.save((error) => {
            if (error) {
                return done(error);
            }

            return done(null, newUser);
        });
    });
};

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    req.session.redirectTo = req.originalUrl;

    return res.redirect('/auth');
};

module.exports = {
    fpOpts,
    fbCallback,
    isLoggedIn
};
