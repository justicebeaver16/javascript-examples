const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { ValidationError } = require('sequelize');
const { environment } = require('./config');
const isProduction = environment === 'production';

const spotsRouter = require('./routes/api/spots');
const reviewsRouter = require('./routes/api/reviews');
const reviewImagesRouter = require('./routes/api/review-images');
const bookingsRouter = require('./routes/api/bookings');
const spotImagesRouter = require('./routes/api/spot-images');

const app = express();

//middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use('/api/spots', spotsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/review-images', reviewImagesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/spot-images', spotImagesRouter);

//security middleware
app.use(cors({ 
  origin: true,
  credentials: true 
}));
  
//helmet helps set headers for better security
  app.use(
    helmet.crossOriginResourcePolicy({
      policy: "cross-origin"
    })
  );

  //sets _csrf token and creates req.csrfToken
  app.use(
    csurf({
      cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
      }
    })
  );

//csrf route
app.get('/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).res.json({
    'XSRF-Token': csrfToken
  });
});

app.use(routes); //connects all the routes

//catch unhandled requests and goes to error handler
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

//process sequelize errors
app.use((err, _req, _res, next) => {
  //checks if error is a sequelize error
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

//error formatting
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

module.exports = app;