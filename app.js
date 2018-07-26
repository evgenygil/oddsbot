process.setMaxListeners(0);

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('logger').createLogger('./logs/oddswork.log');

const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const mongoose = require('mongoose');
const config = require('./common/db');

const indexRouter = require('./routes/index');
const monitorRouter = require('./routes/monitor');
const logsRouter = require('./routes/logs');
const filtersRouter = require('./routes/filters');
const settingsRouter = require('./routes/settings');

let app = express();

mongoose.connect(config.database, {useNewUrlParser: true });
let db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

// Express Session Middleware
app.use(session({
    secret: 'qwerty123',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/monitor', monitorRouter);
app.use('/logs', logsRouter);
app.use('/filters', filtersRouter);
app.use('/settings', settingsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
