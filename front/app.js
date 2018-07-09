var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var server = require('http').createServer();
var io = require('socket.io')(server);
var fs = require('fs');
var passport = require('passport');
var join = require('path').join;
var connect = require('connect');//主要进行session的设置
var ejs = require('ejs');
var FENG_YUN_SERVER_URL = require('./config/config.json').FENG_YUN_SERVER_URL;

var app = express();
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    next();
});

//日志
var log = require('./config/logHelper');
log.use(app);

// view engine setup
app.set('views', path.join(__dirname, 'public/windTower/views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');


//代理
// app.set('trust proxy', true);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'windTower/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(connect.session({secret: 'scada-windTower', key: 'scada-windTower', /*cookie: { maxAge: 1800000}*/}));//不设置maxAge则浏览器关闭session失效
app.use(express.static(path.join(__dirname, 'public')));
app.use('/windTower/node_modules',express.static(path.join(__dirname, 'node_modules') ));

//登陆拦截器
app.use(function (req, res, next) {
    var url = req.originalUrl;
    if (req.session.user) {
        req.session.lasturl = url;
    }
    if (url == "/" && req.session.user) {
        return res.redirect("/index");
    }
    var urlReal = url.split("?")[0];
   // if (!req.session.user && urlReal != "/windTower/loginFromFY") return res.redirect(FENG_YUN_SERVER_URL);
    next();
});

//#####################################################
require('./lib/routes')(app, passport);

//此处代码必须放在最后一行，请勿在此代码后添加任何路由
// app.get('*', function (req, res) {
//     res.render('404.html');
// });

require('./lib/controllers/socket/websocket');//websocket 引入
// require('./lib/controllers/initData/initData').initData();//初始化数据

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    console.log("--------------"+req.url +"-------------------------");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
