var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');


const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
// const categoryRouter = require('./routes/category');
const app = express();
const session = require('express-session');
require('./db/mongoose');

const fileuploader = require('express-fileupload')
const fs = require('fs');
const HBS = hbs.create({});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({ extname: 'hbs',
helpers:{
  // Function to do basic mathematical operation in handlebar
  math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue
      }[operator];
  }
},
runtimeOptions: {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
},
defaultLayout:'layout',
layoutsDir:__dirname + '/views/layout/',
partialsDir:__dirname + '/views/partials/',

}))

HBS.handlebars.registerHelper("ifCound",function(v1,v2,options){
  if(v1==v2){
    return options.fn(this)
  }
  return options.inverse(this) 
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});

app.use(session({secret:"key",cookie:{maxAge:600000}})) //should be always used before router


app.use('/admin',adminRouter );
app.use('/', usersRouter);
// app.use('/category',categoryRouter);
// app.use(fileuploader());



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404')
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
