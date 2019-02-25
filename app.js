const createError = require('http-errors');
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth-route');
const { Article } = require('./schemas');
const { fpOpts, fbCallback, isLoggedIn } = require('./auth');

const dbURI = 'mongodb://localhost:27017/newsdb';
const { ObjectId } = mongoose.Types;

const app = express();

mongoose.connect(dbURI, {
    useNewUrlParser: true
});

mongoose.connection.on('error', (err) => {
    console.log(`mongoose connection error: ${err}`);
});

mongoose.connection.on('connected', () => {
    console.log(`mongoose connected to ${dbURI}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('mongoose disconnected');
});

passport.use(new FacebookStrategy(fpOpts, fbCallback));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
    secret: 'foo'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.get('/news', (req, res) => {
    Article.find({}, (err, data) => {
        if (data.length) {
            res.send(data);
        } else {
            res.sendStatus(404);
        }
    });
});

app.get('/news/:id', (req, res) => {
    Article.find({ _id: req.params.id }, (err, data) => {
        if (data.length) {
            res.send(data);
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/news', isLoggedIn, (req, res) => {
    req.body._id = req.body._id || new ObjectId();

    const newArticle = new Article(req.body);

    newArticle.save((err) => {
        if (err) {
            return res.status(400).send(err);
        }

        return res.sendStatus(200);
    });
});

app.put('/news/:id', isLoggedIn, (req, res) => {
    Article.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true },
        (err, article) => {
            if (err || !article) {
                res.status(400).send(err);
            } else {
                res.status(200).send(article);
            }
        }
    );
});

app.delete('/news/:id', isLoggedIn, (req, res) => {
    Article.findByIdAndDelete(req.params.id, (err, data) => {
        if (err || !data) {
            res.status(400).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
