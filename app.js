const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./db/models');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const questionsRouter = require('./routes/questions')
const answersRouter = require('./routes/answers')
const commentsRouter = require('./routes/comments')
const errorRouter = require('./routes/error')
const { sessionSecret } = require('./config');
const { restoreUser } = require('./auth');


const app = express();


// view engine setup
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(sessionSecret));
app.use(express.static(path.join(__dirname, 'public')));

// set up session middleware
const store = new SequelizeStore({ db: sequelize });


app.use(
  session({
    name: 'app-overload.sid',
    secret: sessionSecret,
    store,
    saveUninitialized: false,
    resave: false,
  })
);


// create Session table if it doesn't already exist
store.sync();

// restore user using session ID
app.use(restoreUser);

// use routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/questions', questionsRouter)
app.use('/answers', answersRouter)
app.use('/comments', commentsRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.use(errorRouter);

module.exports = app;
