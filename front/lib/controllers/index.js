var basePath = process.cwd();
var http = require('http');
const https = require('https');
var crypto = require("crypto");
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;

var log = require(basePath + "/config/logHelper").helper;
var User = require(basePath + "/models/user").User;
const fs = require("fs");
const client = require(basePath + '/config/rdb');
const COMMON = require(basePath + "/lib/controllers/common/common");
const qs = require('querystring');
const config = require(basePath + "/config/config.json");
//webview用临时sessionKey
const tempSessionKey = "65kRuF91wJvm23bntCoaKgbhM318w9n_";
const cloud_dev = JSON.parse(fs.readFileSync(basePath + "/config/config.json", "utf8")).mongodb.DBNAME;
const moment = require('moment');
const palo = require(basePath + '/config/palo');
const autoData = require(basePath + "/models/ftAutoDataTbl");
const ftInfoTbl = require(basePath + "/models/ftInfoTbl");
const dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
//总首页 目录
exports.index = function (req, res, next) {

    client.hmset("testKey", {id: 123}, function (err) {
        console.log(err)
    });

    //读取JavaScript(JSON)对象
    client.hgetall('testKey', function (err, object) {
        console.log(object);
    })
    console.log('goto index ' + COMMON.getSocketURL(req));
    COMMON.render(req, res,'mapDisplay', {
        socketURL: COMMON.getSocketURL(req),
        roles: "",
        userName: "test",
        time: req.body.time,
        timeout: null,
        cur_wfCode: '233'
    });
};

exports.getWarningCount = function () {
    return new Promise(function (resolve, reject) {
        autoData.model(dbName).find({effective_flg: '1'}, (err, resultList) => {
            if (err || !resultList) {
                resolve({count: 0});
            }

            (async () => {
                var currentDate = new Date().valueOf();
                var towerAlarmDelayDays = {};
                var realWarnCount = resultList.length;
                for (var i = 0; i < resultList.length; i++) {
                    var towerId = resultList[i]._doc.towerId;
                    if (!towerAlarmDelayDays[towerId]) {
                        await ftInfoTbl.model(dbName).find({_id: towerId}, (err, rs) => {
                            if (!err && rs&&resultList[i]) {
                                towerAlarmDelayDays[towerId] = rs[0]._doc.alarmDelayDays;
                                //接收日期+报警延迟日数>当前日期的话不报警
                                if (new Date(resultList[i]._doc.receive_date).valueOf() + rs[0]._doc.alarmDelayDays * 24 * 60 * 60 * 1000 > currentDate) {
                                    realWarnCount--;
                                }
                            }
                        });
                    } else {
                        if (new Date(resultList[i]._doc.receive_date).valueOf() + towerAlarmDelayDays[towerId] * 24 * 60 * 60 * 1000 > currentDate) {
                            realWarnCount--;
                        }
                    }
                }

                resolve({count: realWarnCount});
            })();
        });
    });
}