/**
 * 权限相关共通。
 */
var basePath = process.cwd();
basePath = basePath.indexOf("bin") == -1 ? basePath : basePath.substr(0, basePath.indexOf("bin") - 1);
var http = require('http');
var qs = require('querystring');
var fs = require("fs");
var configJSON = JSON.parse(fs.readFileSync(basePath + "/config/config.json"));

// 画面迁移类别--需要顶部菜单(仅返回有权限菜单)
exports.needTopMenu = function (req, res, next) {
    req.needTopMenu = true;
    //现在测风塔子项目的ParentUrl还没有定义所以用的是假的m1
    req.topMenuParentUrl = "/m1";
    next();
}

// 画面迁移类别--需要按钮权限(返回该画面所有下属按钮权限)
exports.needBtn = function (req, res, next) {
    req.needBtn = true;
    next();
}

// 画面迁移类别--需要测风塔的列表权限(返回该画面各个测风塔按钮权限)
exports.needLimitAnemometry = function (req, res, next) {
    req.needLimitAnemometry = true;
    next();
}

//画面跳转权限判断
exports.authRedirect = function (request, response, next) {
    if (configJSON.auth.check !== 'on') {
        next();
        return;
    }

    var refererArray = request.headers.referer;
    if (!refererArray) {
        refererArray = configJSON.FENG_YUN_SERVER_URL;
    } else {
        refererArray = refererArray.split("?") [0];
    }

    var checkUser = request.session.user;
    if (!checkUser) {
        response.redirect(configJSON.FENG_YUN_SERVER_URL);
        return;
    }
    var checkUid = request.session.user.uid;
    if (!checkUid) {
        response.redirect(configJSON.FENG_YUN_SERVER_URL);
        return;
    }

    var postData = {
        url: request.url.split("?")[0],
        userId: request.session.user.uid,
        needTopMenu: request.needTopMenu,
        topMenuParentUrl: request.topMenuParentUrl,
        needBtn: request.needBtn
    };
    var content = qs.stringify(postData);
    var options = {
        hostname: configJSON.auth.host,
        port: configJSON.auth.port,
        path: "/redirectAction",
        method: 'POST',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            "Content-Length": content.length
        }
    };
    var authErrorCode="ERR009";
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var resultJsonStr = "";
        res.on('data', function (json) {
            resultJsonStr += json;
        });
        res.on('end', function () {
            // TODO 由于现在接口上还有一点问题 现在为了让画面显示所以是反条件
            if (!JSON.parse(resultJsonStr).hasAuth) {
                //test data start
                var testData = {};
                testData["hasAuth"] = true;
                var topMenu = [];
                topMenu.push(JSON.parse('{"name": "地图展示","url": "/windTower/mapDisplay"}'));
                topMenu.push(JSON.parse('{"name": "数据管理","url": "/windTower/dataManage"}'));
                topMenu.push(JSON.parse('{"name": "测风塔管理","url": "/windTower/windTowerManage"}'));
                topMenu.push(JSON.parse('{"name": "权限管理","url": "/windTower/userRuleSet"}'));
                topMenu.push(JSON.parse('{"name": "报警管理","url": "/windTower/warnManage"}'));
                var btn = [];
                btn.push(JSON.parse('{"name": "添加","url": "/windTower/windTowerDetail/add"  ,"hasAuth": true}'));
                btn.push(JSON.parse('{"name": "测风塔追加","url": "/windTower/windTowerDetail/addSelf"  ,"hasAuth": true}'));
                var btn = [];
                btn.push(JSON.parse('{"name": "添加","url": "/windTower/windTowerDetail/add"  ,"hasAuth": true}'));
                btn.push(JSON.parse('{"name": "测风塔追加","url": "/windTower/windTowerDetail/addSelf"  ,"hasAuth": true}'));
                var limitAnemometry = {};
                limitAnemometry["5af2c0f565132fc9964169c8"]=  JSON.parse( '{"allowC":true ,"allowU":true,"allowD":true,"allowI":true,"allowO":true }');
                limitAnemometry["5af2c11d65132fc9964169c9"]=  JSON.parse( '{"allowC":true ,"allowU":true,"allowD":true,"allowI":true,"allowO":true }');
                var preData = {};
                preData["limitAnemometry"] = limitAnemometry
                preData["topMenu"] = topMenu
                preData["btn"] = btn
                testData["preData"] = preData;
                resultJsonStr = JSON.stringify(testData);
                //test data end
                request.authJson = resultJsonStr;
                next();
                return;
            } else {
                response.redirect(refererArray + '?errorCode=' + authErrorCode);
                return;
            }
        });
    });
    req.write(content);
    req.on('error', function (e) {
        response.redirect(refererArray + '?errorCode=' + authErrorCode);
        return;
    });
    req.end();

}

//权限校验
exports.checkAuth = function (request, response, next) {
    if (configJSON.auth.check !== 'on') {
        next();
        return;
    }
    var postData = {
        url: request.url.split("?")[0],
        urlId: request.url.split("?")[0],
        userId: request.session.user.uid,
    };
    var content = qs.stringify(postData);
    var options = {
        hostname: configJSON.auth.host,
        port: configJSON.auth.port,
        path: "/checkAuth",
        method: 'POST',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            "Content-Length": content.length
        }
    };
    var authErrorCode="ERR009";
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var resultJsonStr = "";
        res.on('data', function (json) {
            resultJsonStr += json;
        });
        res.on('end', function () {
           if (JSON.parse(resultJsonStr).hasAuth) {
                next();
            } else {
                response.send({errorCode:authErrorCode});
                return;
            }

        });
    });
    req.write(content);
    req.on('error', function (e) {
        response.send({errorCode:authErrorCode});
        return;
    });
    req.end();
}
