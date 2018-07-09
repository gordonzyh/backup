let basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
let ftInfoTbl = require(basePath + "/models/ftInfoTbl");
let company = require(basePath + "/models/ftCompanyTbl");
let project = require(basePath + "/models/ftProjectTbl");
let user = require(basePath + "/models/user");
let dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");
var http = require('http');
var qs = require('querystring');
var fs = require("fs");
var configJSON = JSON.parse(fs.readFileSync(basePath + "/config/config.json"));

exports.index = function (req, res, next) {
    comm.render(req, res, 'userRuleSet', {socketURL: comm.getSocketURL(req)});
};
exports.getUsersMenuData = function (req, res, next) {
    let resObj = {data: [], error: ""}
    user.model(dbName).find({}, (findErr, resultList) => {
        if (findErr) {
            console.error(findErr.message);
            resObj.error = "用户信息读取失败，请联系管理员";
            res.send(resObj)
        } else {
            for (i = 0; i < resultList.length; i++) {
                resObj.data.push({
                    uid: resultList[i].uid,
                    text: resultList[i].nickname,
                    username: resultList[i].username,
                    nickname: resultList[i].nickname,
                    effDate: resultList[i].createTime,
                })
            }
            res.send(resObj)
        }
    }).sort({nickname: -1})
};

exports.getProjectsData = function (req, res, next) {
    let resObj = {data: [], error: ""};
    Promise.all([getProject(), getAllTowerInfo()]).then(function (resultList) {
        var projectList = resultList[0];
        var towerInfoList = resultList[1];
        //排序以名字升序
        comm.objArraySort(projectList, "name", 1);
        //塔信息按projectUid进行分组
        var towerInfoGroupRes = groupBy(towerInfoList, function (item) {
            return item.projectUid;
        })
        for (let i = 0; i < projectList.length; i++) {
            let pro = projectList[i];
            let towerInfoArray = towerInfoGroupRes[pro.uid];
            if (!towerInfoArray) {
                continue;
            }
            //子表信息
            let array = [];
            towerInfoArray.forEach((result) => {
                array.push({
                    tower: result.code + '#' + result.name,
                    update: false,
                    view: false,
                    upload: false,
                    download: false
                });
            });
            //子表信息的json字符串
            var subTableDataStr = JSON.stringify(array);
            resObj.data.push({
                projectName: pro.name,
                projectUid: pro.uid,
                update: false,
                view: false,
                upload: false,
                download: false,
                subTableData: subTableDataStr
            })
        }
        res.send(resObj);
    });
}

//按当个字段进行groupby操作
function groupBy(array, f) {
    const groups = {};
    array.forEach(function (o) {
        const group = f(o);
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return groups;
}

//获取项目下的所有测风塔
exports.getTowerData = function (req, res, next) {
    ftInfoTbl.model(dbName).find({projectUid: req.body.projectUid}, (err, resultList) => {
        if (err) {
            res.send('');
        } else {
            var array = [];
            resultList.forEach((result) => {
                array.push({tower: result.code + '#' + result.name});
            });
            res.send(array);
        }
    });
}

function getTowerCount(query) {
    return new Promise(function (resolve, reject) {
        resolve(ftInfoTbl.model(dbName).count(getTowerWhere(query)));

    });
}

function getTower(query) {
    return new Promise(function (resolve, reject) {
        let s = {};
        if (query.sort !== undefined) {
            s[query.sort] = query.order === 'asc' ? 1 : -1;
        }
        resolve(ftInfoTbl.model(dbName).find(getTowerWhere(query)).limit(query.limit).skip(query.offset).sort(s));
    });
}

function getTowerWhere(query) {
    let where = {enable: '0'};
    for (let keyName in query) {
        if (keyName !== 'sort' && keyName !== 'limit' && keyName !== 'offset' && keyName !== 'order') {
            if (query[keyName] !== "") {
                where[keyName] = {$regex: "^.*" + query[keyName] + ".*$"};
            }
        }
    }
    return where;
}

function getCompany() {
    return new Promise(function (resolve, reject) {
        resolve(company.model(dbName).find({enable: '1'}));
    });
}

function getProject() {
    return new Promise(function (resolve, reject) {
        resolve(project.model(dbName).find({enable: '1'}));
    });
}

function getManager() {
    return new Promise(function (resolve, reject) {
        resolve(user.model(dbName).find());
    });
}

//获取所有塔信息
function getAllTowerInfo() {
    return new Promise(function (resolve, reject) {
        resolve(ftInfoTbl.model(dbName).find());
    });
}


//获取用户菜单权限列表
exports.getAllowedAnemometry = function (request, response, next) {
    var postData = {
        userId: request.query.uid,
    };
    var content = qs.stringify(postData);
    var options = {
        hostname: configJSON.auth.host,
        port: configJSON.auth.port,
        path: "/getAllowedAnemonmetry",
        method: 'get',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            "Content-Length": content.length
        }
    };
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var resultJsonStr = "";
        res.on('data', function (json) {
            resultJsonStr += json;
        });
        res.on('end', function () {
            //      var resObj=  JSON.parse(resultJsonStr);
            var resObj = {};
            resObj.aaa = "aaa"
            resObj.bbb = "bbb"
            response.send(resObj);
        });
    });
    req.write(content);
    req.on('error', function (e) {
        response.send({});
    });
    req.end();

}
