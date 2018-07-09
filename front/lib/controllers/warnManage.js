var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var autoData = require(basePath + "/models/ftAutoDataTbl");
var errorFix = require(basePath + "/models/ftErrorFixTbl");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var backendUrl = require(basePath + "/config/config.json").backend_url;
var towerMenu = require(basePath + "/lib/controllers/towerMenu.js");
var comm = require(basePath + "/lib/controllers/common/common.js");


exports.index = function (req, res, next) {
    comm.render(req, res, 'warnManage', {
        socketURL: comm.getSocketURL(req),
        backendUrl: backendUrl + '/updateData'
    });
};

//根据塔towerId获取报警信息
exports.getWarnTableData = function (req, res, next) {
    Promise.all([getWarnTableCount(req.body), getWarnTable(req.body)]).then(
        function (resultList) {
            totalFixAreaCount = resultList[0].length === 0 ? 0 : resultList[0][0].count;
            let towerDataList = resultList[1];
            res.send({total: totalFixAreaCount, rows: towerDataList});
        }
    );
};

//报警信息件数取得
function getWarnTableCount(query) {
    return new Promise(function (resolve, reject) {
        var towerId = query.towerId;
        var errorCode = query.errorCode;
        var alarmDelayDays = query.alarmDelayDays;
        var alarmDelayDate = comm.dateAddDays(new Date(), -1 * alarmDelayDays);
        var alarmDelayDateStr = comm.formatDate(alarmDelayDate, 'YYYY-MM-DD');
        let queryObj = [{
            $match: {
                towerId: towerId,
                receive_date: {$lte: alarmDelayDateStr},
                $or: [{effective_flg: '1'}, {effective_flg: '2'}]
            }
        },
            {$group: {_id: null, count: {$sum: 1}}}
        ];
        if (errorCode !== undefined) {
            queryObj[0]["$match"]["error_code"] = errorCode;
        }
        resolve(autoData.model(dbName).aggregate(queryObj).exec());
    });
}

//报警信息取得
function getWarnTable(query) {
    return new Promise(function (resolve, reject) {
        var towerId = query.towerId;
        var errorCode = query.errorCode;
        var alarmDelayDays = query.alarmDelayDays;
        var alarmDelayDate = comm.dateAddDays(new Date(), -1 * alarmDelayDays);
        var alarmDelayDateStr = comm.formatDate(alarmDelayDate, 'YYYY-MM-DD');
        let queryObj = [
            {
                $project: {
                    towerId: 1,
                    receive_date: 1,
                    error_event: 1,
                    error_code: 1,
                    effective_flg: 1,
                    error_fix_date: 1,
                    errorInfo: 1,
                    dataCount: 1
                }
            },
            {
                $match: {
                    towerId: towerId,
                    receive_date: {$lte: alarmDelayDateStr},
                    $or: [{effective_flg: '1'}, {effective_flg: '2'}]
                }
            },
            {
                $sort: {
                    effective_flg: 1,
                    receive_date: 1
                }
            }

        ];
        if (errorCode !== undefined) {
            queryObj[1]["$match"]["error_code"] = errorCode;
        }
        queryObj.push({$skip: query.offset});
        queryObj.push({$limit: query.limit});

        resolve(autoData.model(dbName).aggregate(queryObj).exec());
    });

}

//获取处理履历表
let totalFixAreaCount = undefined;
exports.getFixAreaTableData = function (req, res, next) {
    Promise.all([getFixAreaCount(req.body), getFixArea(req.body)]).then(
        function (resultList) {
            totalFixAreaCount = resultList[0].length === 0 ? 0 : resultList[0][0].count;
            let towerDataList = resultList[1];
            for (i = 0; i < towerDataList.length; i++) {
                towerDataList[i]["create_user"] = towerDataList[i].create_user[0];
            }
            res.send({total: totalFixAreaCount, rows: towerDataList});
        }
    );
};

//处理日志表件数取得
function getFixAreaCount(query) {
    return new Promise(function (resolve, reject) {
        var towerId = query.towerId;
        let queryObj = [
            {$match: getErrorFixWhere(query)},
            {$group: {_id: null, count: {$sum: 1}}}
        ];
        resolve(errorFix.model(dbName).aggregate(queryObj).exec());
    });
}

//处理日志表数据取得
function getFixArea(query) {
    return new Promise(function (resolve, reject) {
        let queryObj = [
            {
                $lookup: {
                    localField: "createId",
                    from: "USERS",
                    foreignField: "uid",
                    as: "userInfo"
                }
            },
            {
                $project: {
                    _id: 1,
                    fix_date: 1,
                    create_user: '$userInfo.nickname',
                    do_fix_date: 1,
                    fix_method: 1,
                    fix_memo: 1,
                    towerId: 1
                }
            },
            {$match: getErrorFixWhere(query)}
        ];
        let s = {};
        if (query.sort !== undefined) {
            s[query.sort] = query.order === 'asc' ? 1 : -1;
            queryObj.push({$sort: s});
        }else{
            queryObj.push({$sort: {fix_date:-1}});
        }
        queryObj.push({$skip: query.offset});
        queryObj.push({$limit: query.limit});

        resolve(errorFix.model(dbName).aggregate(queryObj).exec());
    });
}

//检索条件设定
function getErrorFixWhere(query) {
    var towerId = query.towerId;
    let where = {towerId: towerId};
    if (query.search !== undefined && query.search !== "") {
        where["$or"] = [
            {fix_date: {$regex: "^.*" + query.search + ".*$"}},
            {create_user: {$regex: "^.*" + query.search + ".*$"}},
            {do_fix_date: {$regex: "^.*" + query.search + ".*$"}},
            {fix_method: {$regex: "^.*" + query.search + ".*$"}},
            {fix_memo: {$regex: "^.*" + query.search + ".*$"}}
        ];
    }
    return where;
}





