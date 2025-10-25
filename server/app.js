var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var app = express();

// enable CORS early so preflight and responses include CORS headers
app.use(cors({ origin: true, credentials: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// logging and body parsing middleware MUST be registered before routes
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes (mounted after body parsers)
const loginRoutes = require('./routes/loginRoutes');
app.use('/api', loginRoutes);

// connect to MongoDB
const mongoose = require('mongoose');
const MONGO = process.env.MONGO_URI;
mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// book routes
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);


app.get('/', (req, res) => {
  console.log(req.cookies.token);
  res.send('<h1><center>Welcome to the Server</center></h1><h2><center>Book Inventory</center></h2>');
});


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


app.listen(9000, () => {
  console.log('Server is running on http://localhost:9000');
})

module.exports = app;
