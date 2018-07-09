var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var ftInfoTbl = require(basePath + "/models/ftInfoTbl");
var countryCity = require(basePath + "/models/countryCity");
var project = require(basePath + "/models/ftProjectTbl");
var autoData = require(basePath + "/models/ftAutoDataTbl");
var updData = require(basePath + "/models/ftUpdDataTbl");
var path = require(basePath + "/models/path");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var backendUrl = require(basePath + "/config/config.json").backend_url;
var comm = require(basePath + "/lib/controllers/common/common.js");
var fs = require('fs');
var JSZip = require('jszip');

exports.index = function (req, res, next) {
    comm.render(req, res, 'dataManage', {
        socketURL: comm.getSocketURL(req),
        towerId: req.query.towerId,
        lang: req.query.lang,
        backendUploadUrl: backendUrl + '/upLoadData',
        backendMainDataUrl: backendUrl + '/mainDataSetting'
    })
};

exports.getTowersData = function (req, res, next) {
    Promise.all([getTower(), getCountryCity(), getProject()]).then(function (resultList) {
        var towerDataList = resultList[0];
        var provinceList = resultList[1];
        var projectList = resultList[2];

        for (let i = 0; i < towerDataList.length; i++) {
            let provinceCode = towerDataList[i]._id.provinceCode;
            //let projectCode = towerDataList[i].datas.projectUid;

            //匹配省份名
            for (let j = 0; j < provinceList.length; j++) {
                let province = provinceList[j]._doc.provinceCode;
                if (provinceCode === province) {
                    towerDataList[i]['provinceName'] = provinceList[j]._doc.provinceName;
                    break;
                }
            }
            //匹配项目名
            var datas = towerDataList[i].datas;
            for (let j = 0; j < datas.length; j++) {
                let projectUid = datas[j].projectUid;

                for (let k = 0; k < projectList.length; k++) {
                    let project = projectList[k];
                    if (project._doc.uid === projectUid) {
                        towerDataList[i].datas[j]['projectName'] = project._doc.name;
                        break;
                    }
                }
            }
        }
        res.send(towerDataList);
    });
}

exports.getTableData = function (req, res, next) {
    getTableData(req, res, next);
};

function getTableData(req, res, next) {
    var towerId = req.query.towerId;

    Promise.all([getOriginalData(towerId), getUpdData(towerId), getMainDataIndex(towerId)]).then((resultList) => {
        var originalData = resultList[0];
        var updDataList = resultList[1];

        //值为0/空/null的情况下，原始数据的主数据列设定为“主数据”
        if (!resultList[2] || parseInt(resultList[2]) === 0) {
            originalData['mainData'] = '主数据';
        } else {
            //以外值时，将上传数据表中对应序号的主数据列设定为“主数据”
            for (var i = 0; i < updDataList.length; i++) {
                if (parseInt(updDataList[i].updIndex) === parseInt(resultList[2])) {
                    updDataList[i]['mainData'] = '主数据';
                    break;
                }
            }
        }
        let resList = [].concat(originalData).concat(updDataList);
        if (comm.isEmptyArray(resList)) {
            res.send(null);
        } else {
            comm.objArraySort(resList, "updIndex", 1);
            res.send({data: resList});
        }
    });
}

//webSocket调用
exports.getWindSpeedChart = function (cdata, cli) {
    getWindSpeedChart(cdata, cli);
};

function getWindSpeedChart(cdata, cli) {
    if (cli.connected) {
        let towerId = cdata.towerId;
        let startDate = cdata.startDate;
        let endDate = cdata.endDate;
        let dataIndex = cdata.dataIndex;

        let result = [];
        let dbObject = null;
        let where = {
            towerId: towerId,
            effective_flg: "0"
        };
        let sortParm = {};
        if (dataIndex === '0') {
            dbObject = autoData;
            where["receive_date"] = {$gte: startDate, $lte: endDate};
            sortParm["receive_date"] = 1;

        } else {
            dbObject = updData;
            where["upd_index"] = parseInt(dataIndex);
            sortParm["upd_date"] = 1;
        }
        let fun = [
            new Promise((resolve, reject) => {
                resolve(dbObject.model(dbName).find(where).sort(sortParm).limit(cdata.limit).skip(cdata.offset));
            })];
        if (cdata.offset === 0) {
            fun.push(new Promise((resolve, reject) => {
                resolve(dbObject.model(dbName).aggregate([
                    {$match: where},
                    {$project: {dataCount: 1, _id: 0}},
                    {$group: {_id: null, num_of_data: {$sum: "$dataCount"}}}
                ]).exec());
            }));
        }
        Promise.all(fun).then(function (resultList) {
            let dataList = resultList[0];
            if (comm.isEmptyArray(dataList) || cli.disconnected) {
                cli.emit("onEchartDataGet", null);
            } else {
                let resultObj = getWindSpeedChartJson(dataList, cdata.towerHeight, cdata.towerIndex, cdata.target);
                if (resultList.length > 1) {
                    resultObj["allcount"] = resultList[1][0].num_of_data;
                }
                resultObj["setTabFlg"] = cdata.setTabFlg;
                cli.emit("onEchartDataGet", resultObj);

                if (dataList.length === cdata.limit) {
                    cdata["offset"] = cdata["offset"] + dataList.length
                    getWindSpeedChart(cdata, cli);
                }
            }
        });
    }

};

exports.download = function (req, res, next) {
    path.model(dbName).findOne({}, (err, result) => {
        if (err || !result) {
            res.end();
            return;
        } else {
            if (req.query.dataIndex === '0') {
                var searchJson = {
                    towerId: req.query.towerId,
                    'receive_date': {$gte: req.query.startDate, $lte: req.query.endDate},
                    file_path: {$ne: ""}
                };
                getAutoDataFilePath(searchJson).then((filePaths) => {
                    downloadFile(filePaths.map((filePath) => {
                        return result._doc.prefix + result._doc.ft_real_path + filePath;
                    }), res);
                });
            } else {
                var searchJson = {
                    towerId: req.query.towerId,
                    'upd_index': parseInt(req.query.dataIndex),
                    file_path: {$ne: ""}
                };
                getUpdDataFilePath(searchJson).then((filePaths) => {
                    downloadFile(filePaths.map((filePath) => {
                        return result._doc.prefix + result._doc.ft_real_path + filePath;
                    }), res);
                });
            }
        }
    });

}

//将上传数据中所有对应塔的数据的有效标志改成3
exports.delete = function (req, res, next) {
    updData.model(dbName).update({
        towerId: req.query.towerId,
        upd_index: req.query.updIndex,
    }, {
        $set: {
            effective_flg: '3',
            updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            updateId: req.session.user.uid
        }
    }, {multi: true}, (err, doc) => {
        getTableData(req, res, next);
    });
}

exports.setToMainData = function (req, res, next) {
    var towerId = req.query.towerId;
    var updIndex = req.query.updIndex;
    ftInfoTbl.model(dbName).update({_id: towerId}, {
        $set: {
            mainDataIndex: parseInt(updIndex),
            updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            updateId: req.session.user.uid
        }
    }, {multi: true}, (err, doc) => {
        getTableData(req, res, next);
    });
}

function getWindSpeedChartJson(result, towerHeight, towerIndex, target) {
    towerHeight = "" + (!towerHeight ? "max" : towerHeight);
    target = "" + (!target ? "speed" : target);
    let resultList = [];
    //循环天数
    for (let i = 0; i < result.length; i++) {
        //获取对应天的数据
        let data = comm.isEmptyArray(result[i]._doc.data) ? [] : result[i]._doc.data
        //循环天数的子对象
        for (let j = 0; j < data.length; j++) {
            if (!comm.isEmptyArray(data[j][target])) {
                if (towerHeight === "max" || towerHeight === "min") {
                    //降序
                    comm.objArraySort(data[j][target], "height", towerHeight === "max" ? -1 : 1);
                    resultList.push([data[j].datatime, data[j][target][0].avg]);
                } else {
                    for (let k = 0; k < data[j][target].length; k++) {
                        if (towerHeight === data[j][target][k].height && towerIndex === data[j][target][k].index) {
                            resultList.push([data[j].datatime, data[j][target][k].avg]);
                            break;
                        }
                    }
                }
            }
        }
    }
    comm.objArraySort(resultList, 0, 1);
    var resultObj = {chartData: resultList};

    let tabs = getWindSpeedChartTabData(result);
    resultObj["tabs"] = tabs;
    return resultObj;
}

function getWindSpeedChartTabData(result) {
    let tabs = {};
    let tabChars = ["speed", "direction", "humidity", "temperature", "air_pressure"];
    //获取第一天
    let firstDay = comm.isEmptyArray(result) ? [] : result[0];
    //获取第一天的数据
    let firstDayData = comm.isEmptyArray(firstDay._doc.data) ? [] : firstDay._doc.data;
    //获取第一天的数据中的第一个子data对象
    let firstDaySubData = firstDayData[0];
    for (let xi = 0; xi < tabChars.length; xi++) {
        //获取当前的判断维度
        let nowTabChar = tabChars[xi];
        //判断是否已经存在该判断维度，以及否在子对象中存在该维度数据
        if (!tabs[nowTabChar] && !comm.isEmptyArray(firstDaySubData) && !comm.isEmptyArray(firstDaySubData[nowTabChar])) {
            tabs[nowTabChar] = [];
            //排序以高度降序
            comm.objArraySort(firstDaySubData[nowTabChar], "height", -1);
            for (let k = 0; k < firstDaySubData[nowTabChar].length; k++) {
                var subTabItem = {};
                subTabItem.height = firstDaySubData[nowTabChar][k].height ? firstDaySubData[nowTabChar][k].height : '';
                subTabItem.index = firstDaySubData[nowTabChar][k].index ? firstDaySubData[nowTabChar][k].index : '';
                tabs[nowTabChar].push(subTabItem);
            }
        }
    }
    return tabs;
}

function getTower() {
    return new Promise(function (resolve, reject) {
        ftInfoTbl.model(dbName).aggregate().group({
            _id: {provinceCode: "$provinceCode"},
            datas: {$push: "$$ROOT"}
        }).exec(function (err, resultList) {
            if (err || !resultList) {
                reject();
            } else {
                resolve(resultList);
            }
        });
    });
}

function getCountryCity() {
    return new Promise(function (resolve, reject) {
        countryCity.model(dbName).find((err, resultList) => {
            if (err || !resultList) {
                reject();
            } else {
                resolve(resultList);
            }
        });
    });
}

function getProject() {
    return new Promise(function (resolve, reject) {
        project.model(dbName).find((err, resultList) => {
            if (err || !resultList) {
                reject();
            } else {
                resolve(resultList);
            }
        });
    });
}

//获取原始数据
function getOriginalData(towerId) {
    return new Promise((resolve, reject) => {

        autoData.model(dbName).aggregate().match({
            towerId: towerId,
            effective_flg: "0"
        }).group({
            _id: "$towerId",
            maxDate: {$max: "$receive_date"},
            minDate: {$min: "$receive_date"}
        }).exec(function (err, result) {
            if (comm.isEmptyArray(result)) {
                resolve([]);
            } else {
                resolve({
                    comment: '原始数据',
                    startDate: result[0]["minDate"],
                    endDate: result[0]["maxDate"],
                    from: '测风塔',
                    updIndex: '0', //上传序号
                    isOriginal: true //原始数据flag
                });
            }
        });
    });
}

//获取上传数据
function getUpdData(towerId) {
    return new Promise((resolve, reject) => {
        updData.model(dbName).aggregate().match({
            towerId: towerId,
            effective_flg: "0"
        }).group({
            _id: {
                towerId: "$towerId",
                upd_index: "$upd_index",
                upd_index: "$upd_index",
                upd_memo: "$upd_memo",
                updUser: "$updUser"
            },
            maxDate: {$max: "$upd_date"},
            minDate: {$min: "$upd_date"}
        }).sort({'upd_index': 1}).exec(function (err, result) {
            if (comm.isEmptyArray(result)) {
                resolve([]);
            } else {
                let resultList = [];
                for (i = 0; i < result.length; i++) {
                    resultList.push({
                        comment: result[i]._id.upd_memo,
                        startDate: result[i]["minDate"],
                        endDate: result[i]["maxDate"],
                        from: result[i]._id.updUser,
                        updIndex: result[i]._id.upd_index, //上传序号
                        isOriginal: false //原始数据flag
                    });
                }
                resolve(resultList);
            }
        });
    });
}

//获取测风塔的主数据序号
function getMainDataIndex(towerId) {
    return new Promise((resolve, reject) => {
        ftInfoTbl.model(dbName).findOne({_id: towerId}, (err, result) => {
            if (!result) {
                resolve('');
            } else {
                resolve(result._doc.mainDataIndex);
            }
        }).select('mainDataIndex');
    });
}

//获取自动接收的文件集合
function getAutoDataFilePath(searchJson) {
    return new Promise((resolve, reject) => {
        autoData.model(dbName).find(searchJson,
            (err, result) => {
                var files = [];
                result.forEach((file) => {
                    files.push(file._doc.file_path);
                });
                resolve(files);
            }).select('file_path');
    });
}

//获取上传数据的文件集合
function getUpdDataFilePath(searchJson) {
    return new Promise((resolve, reject) => {
        updData.model(dbName).find(searchJson,
            (err, result) => {
                var files = [];
                result.forEach((file) => {
                    files.push(file._doc.file_path);
                });
                resolve(files);
            }).select('file_path');
    });
}

function downloadFile(filePaths, res) {
    var set = new Set(filePaths);
    filePaths = Array.from(set);

    var zip = new JSZip();
    try {
        filePaths.forEach((file) => {
            let s = file.split('/');
            zip.file(s[s.length - 1], fs.readFileSync(file));
        });
    } catch (e) {
        res.send({errorCode: "ERR999", errorMessage: e.message});
        return
    }
    zip.generateAsync({type: "base64"}).then(function (content) {
        var zipName = "tmp/" + Date.parse(new Date()).toString() + '.zip';//TODO
        fs.writeFile(zipName, content, 'base64', function () {
            res.send({zipName: zipName});
        });
    });
}

exports.downloadFile = function (req, res, next) {
    let zipName = req.query.zipName;
    res.setHeader('Content-type', 'application/zip');
    res.download(basePath + '/' + zipName, (err) => {
        if (!err) {
            fs.unlinkSync(zipName);
        }
    });
}