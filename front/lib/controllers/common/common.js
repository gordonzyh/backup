/**
 * 通用方法
 */
var basePath = process.cwd();
basePath = basePath.indexOf("bin") == -1 ? basePath : basePath.substr(0, basePath.indexOf("bin") - 1);
var client = require('../../../config/rdb');
//日志
var log = require("../../../config/logHelper").helper;
var fs = require("fs");
var COMMON = require('./common');
var dateUtils = require("date-utils");
var configJSON = JSON.parse(fs.readFileSync(basePath + "/config/config.json"));
var code = JSON.parse(fs.readFileSync(basePath + "/config/config.json")).mongodb.DBNAME;
var http = require('http');
var qs = require('querystring');

//UUID
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

// 获取socket路径(子工程需要在config.json里配置PATH属性)
exports.getSocketURL = function (req) {
    return getSocketURL(req);
}

function getSocketURL(req) {
    var socketUrl;
    if (COMMON.isEmpty(configJSON.socket)) {
        log.writeWarn("请检查配置文件中是否配置socket的ip和端口！");
        socketUrl = null;
    } else {
        socketUrl = "http://" + configJSON.socket.IP + ":" + configJSON.socket.PORT;
        if (!COMMON.isEmpty(configJSON.socket.PATH)) {
            socketUrl += configJSON.socket.PATH;
        }
    }
    return socketUrl;
}

exports.isEmptyObject = function (obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

exports.toFix = function (obj, num) {
    var result = obj;
    try {
        if (!isEmpty(obj)) {
            obj = parseFloat(obj).toFixed(num);
            if (!isNaN(obj)) {
                result = obj;
            }
        }
    } catch (e) {
        console.log("2ztoFix error obj=" + obj + " num=" + num + "-->" + e);
    }
    return result;
}

exports.isNull = function (obj) {
    return undefined == obj || null == obj;
}

function isNull(obj) {
    return undefined == obj || null == obj;
}

exports.isEmpty = function (obj) {
    return undefined == obj || null == obj || "" == obj || "undefined" == obj;
}

function isEmpty(obj) {
    return isNull(obj) || "" == obj;
}

exports.dateAddDays = function (date, addDays) {
    return date.add({days: addDays});
}

exports.compareTo = function (date1, date2) {
    return date1.compareTo(date2);
}

exports.dateIsBefore = function (date1, date2) {
    return date1.isBefore(date2);
}
exports.dateIsBeforeOrEquals = function (date1, date2) {
    return date1.isBefore(date2) || date1.equals(date2);
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

exports.formatDate = function (date, format) {
    var formateArr = [];
    var returnArr = [];

    if (format.indexOf('YYYY') >= 0) {
        returnArr.push(date.getFullYear());
        formateArr.push('YYYY')
    } else if (format.indexOf('YY') >= 0) {
        returnArr.push(date.getFullYear().toString().substr(2, 2));
        formateArr.push('YY')
    }

    if (format.indexOf('MM') >= 0) {
        returnArr.push(formatNumber(date.getMonth() + 1));
        formateArr.push('MM')
    }

    if (format.indexOf('DD') >= 0) {
        returnArr.push(formatNumber(date.getDate()));
        formateArr.push('DD')
    }

    if (format.indexOf('HH') >= 0) {
        returnArr.push(formatNumber(date.getHours()));
        formateArr.push('HH')
    } else if (format.indexOf('hh') >= 0) {
        var hours = formatNumber(date.getHours());

        if (hours > 12) {
            hours = hours - 12;
        }
        returnArr.push(formatNumber(hours));
        formateArr.push('hh')

    }

    if (format.indexOf('mm') >= 0) {
        returnArr.push(formatNumber(date.getMinutes()));
        formateArr.push('mm')
    }

    if (format.indexOf('ss') >= 0) {
        returnArr.push(formatNumber(date.getSeconds()));
        formateArr.push('ss')
    }

    for (var i = 0; i < returnArr.length; i++) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
}

exports.currentYear = function (date, format) {
    let curDate = new Date();
    return COMMON.formatDate(curDate, 'YYYY');
}

exports.lastMonth = function (date, format) {
    let curDate = new Date();
    let vYear = curDate.getFullYear();
    let vMon = curDate.getMonth();
    if (vMon == 0) {
        return (vYear - 1) + '12';
    }
    return vYear + '' + (vMon < 10 ? '0' + vMon : vMon);
}
//sortType =1 升序 =-1降序
exports.objArraySort = function (arr, sortKey, sortType) {
    if (!isArray(sortKey)) {
        arr.sort(function (t1, t2) {
            if (t1[sortKey] === t2[sortKey]){
                return 0;
            }else if (t1[sortKey] > t2[sortKey]){
                return 1* sortType;
            }else{
                return -1* sortType;
            }
        });
    } else {
        arr.sort(function (t1, t2) {
            return compary(t1, t2, sortKey, sortType, 0);
        });
    }
};

function compary(t1, t2, sortKey, sortType, sortIndex) {
    if (t1[sortKey[sortIndex]] > t2[sortKey[sortIndex]]) {
        return 1 * sortType[sortIndex]
    } else if (t1[sortKey[sortIndex]] === t2[sortKey[sortIndex]]) {
        if (sortIndex === sortKey.length) {
            return 0
        } else {
            return compary(t1, t2, sortKey, sortType, ++sortIndex)
        }
    } else {
        return -1 * sortType[sortIndex]
    }
}

exports.isEmptyArray = function (obj) {
    return undefined === obj || null === obj || obj.length === 0;
}
exports.isArray = function (o) {
    return isArray(o);
};

function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}

exports.extendCom = function (json1, json2) {
    return extendCom(json1, json2);
};

function extendCom(json1, json2) {
    for (key in json2) {
        json1[key] = json2[key];
    }
    return json1;
}

exports.render = function (req, res, htmlName, option) {
    if (!req.authJson) {
        option["authJson"] = '{}'
    } else {
        option["authJson"] = req.authJson
    }
    res.render(htmlName, extendCom(option));
}