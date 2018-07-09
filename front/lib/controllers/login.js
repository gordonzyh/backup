//首页内容
//日志
var log = require("../../config/logHelper").helper;

var http = require('http');
var crypto = require("crypto");
//var WFCODE = require("./../common/wfCode");
var COMMON = require("./common/common");
var fs = require('fs');
var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var configJSON = JSON.parse(fs.readFileSync(basePath + "/config/config.json", "utf8"));
var EFFECTIVE_Time = JSON.parse(fs.readFileSync(basePath + "/config/config.json", "utf8")).effectiveTime;
var version = JSON.parse(fs.readFileSync(basePath + "/config/config.json", "utf8")).systemVersion.versionNo;
var moment = require('moment');
var area = require(basePath +"/config/config.json").area;
var User = require(basePath +"/models/user");
var dbName = require(basePath +"/config/config.json").mongodb.DBNAME;
const client = require(basePath + '/config/rdb');
var FENG_YUN_SERVER_URL = configJSON.FENG_YUN_SERVER_URL;

if(COMMON.isEmpty(EFFECTIVE_Time)){
    EFFECTIVE_Time=7;
}
var windFieldArray = require(basePath +"/config/config.json").wfArray;

//返回登陆页
exports.index = function (req, res, next) {
    log.writeDebug("登陆页");
    var isReturn = "";
    var url = "";
    var wfCode = "";
    var isHealth = "";
    if (req.query.return != "" && req.query.return != undefined && req.query.return != null) {
        isReturn = req.query.return;
        url = req.query.url;
        wfCode = req.query.wfCode;
        isHealth = req.query.isHealth;
    }

    res.render('login', {
        title: "登陆页",
        versionNo: version,
        isReturn: isReturn,
        url: url,
        wfCode: wfCode,
        isHealth: isHealth
    });
};

//登陆
exports.login = function (req, res, next) {
    res.cookie("towerId",'',{path:"/windTower"});
    res.cookie("index",'true',{path:"/windTower"});
    log.writeDebug("登陆页");
    var username = req.body.username;
    var password = req.body.password;
    var time = req.body.time;
    if (username == null || "" == username || username == 'undefined') {
        req.session.error = "用户名不能为空";
        res.json({message: "用户名不能为空"});//返回消息
        return;
    } else if (password == null || password == "" || password == 'undefined') {
        req.session.error = "密码不能为空";
        res.json({message: "密码不能为空"});
        return;
    }

    User.model(dbName).findOne({username: username, flag: "1"}, function (err, doc) {
        if(err || !doc){
            res.json({message: "用户名不存在或密码错误！"});
        }else{
            var user = new User.model(dbName)(doc);
            req.session.windFieldArray = windFieldArray;
            req.session.area=area;
            req.session.user = user;
            //进行用户名和密码验证
            res.json({message: ""});
            client.hmset("SessionManger", req.session.id, JSON.stringify(req.session));
        }
    });
};

exports.logout = function (req, res, next) {
    req.session.destroy();
    res.redirect(FENG_YUN_SERVER_URL);
};

//关闭浏览器或关闭浏览器页签
exports.browserClose = function (req, res, next) {
    // 用户动作记录
    // client.hdel("userLimit",new User(req.session.user).username,function(err){
    //     if(err){
    //         log.writeErr("删除redis userLimit 出错",err);
    //     }else{
    //         // req.session.destroy();
    //        // console.log("================浏览器关闭或关闭浏览器页签");
    //         res.json({});
    //     }

    // })
    res.json({});
};

// cookie 序列化
// cookie 格式：name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com;
var serialize = function (name, val, opt) {
    var pairs = [name + '=' + val];
    opt = opt || {};

    if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
    if (opt.domain) pairs.push('Domain=' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.exppires.toUTCString());
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');
    if (opt.overwirte) pairs.push('overwirte=' + opt.overwirte);

    return pairs.join(';');
}
//用于记录当前登录用户的UID
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

exports.loginFromFY = function (req, res, next) {
    res.cookie("towerId",'',{path:"/windTower"});
    res.cookie("index",'true',{path:"/windTower"});
    if (!COMMON.isEmpty(req.query.sid)) {
        client.hget("SessionManger", req.query.sid, function (err, val) {
            if(err || !val) res.redirect(FENG_YUN_SERVER_URL);
            else{
                var sessionObj = JSON.parse(val);
                req.session.windFieldArray = sessionObj.windFieldArray;
                req.session.area = sessionObj.area;
                req.session.user = sessionObj.user;
                console.log("req.session======="+JSON.stringify(req.session));
                res.redirect('./index');
            }
        });
    }else{
        res.redirect(FENG_YUN_SERVER_URL);
    }
};