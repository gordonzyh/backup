let basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
let ftInfoTbl = require(basePath + "/models/ftInfoTbl");
let company = require(basePath + "/models/ftCompanyTbl");
let project = require(basePath + "/models/ftProjectTbl");
let user = require(basePath + "/models/user");
let dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");

exports.index = function (req, res, next) {
    comm.render(req, res, 'windTowerManage', {socketURL: comm.getSocketURL(req)});
};
let totalCount = undefined;
exports.getTowersData = function (req, res, next) {

    Promise.all([getTowerCount(req.body), getTower(req.body)]).then(function (resultList) {
        totalCount = resultList[0][0] ? resultList[0][0].count : 0;
        let towerDataList = resultList[1];

        for (i = 0; i < towerDataList.length; i++) {
            towerDataList[i]["codeName"] = towerDataList[i].code + '#' + towerDataList[i].name;
            towerDataList[i]["companyName"] = towerDataList[i].companyName[0];
            towerDataList[i]["projectName"] = towerDataList[i].projectName[0];
            towerDataList[i]["manager"] = towerDataList[i].manager[0];
        }
        res.send({total: totalCount, rows: towerDataList});
    });
}

function getTowerCount(query) {
    return new Promise(function (resolve, reject) {
        let queryObj = getQueryObj(query);
        queryObj.push({$group: {_id: null, count: {$sum: 1}}});
        resolve(ftInfoTbl.model(dbName).aggregate(queryObj).exec());
    });
}

function getTower(query) {
    return new Promise(function (resolve, reject) {
        let queryObj = getQueryObj(query);
        let s = {};
        if (query.sort !== undefined) {
            if (query.sort === 'codeName') {
                s["code"] = query.order === 'asc' ? 1 : -1;
                s["name"] = query.order === 'asc' ? 1 : -1;
            } else {
                s[query.sort] = query.order === 'asc' ? 1 : -1;
            }
            queryObj.push({$sort: s});
        }
        queryObj.push({$skip: query.offset});
        queryObj.push({"$limit": query.limit});
        resolve(ftInfoTbl.model(dbName).aggregate(queryObj).exec());
    });
}

function getQueryObj(query) {

    let queryObj = [
        {
            $lookup: {
                localField: "projectUid",
                from: "ft_project_tbl",
                foreignField: "uid",
                as: "projectInfo"
            }
        },
        {
            $lookup: {
                localField: "company",
                from: "ft_company_tbl",
                foreignField: "uid",
                as: "companyInfo"
            }
        },
        {
            $lookup: {
                localField: "manager",
                from: "USERS",
                foreignField: "username",
                as: "managerInfo"
            }
        },
        {
            $project: {
                _id: "$_id",
                code: "$code",
                name: "$name",
                towerCreateDate: "$towerCreateDate",
                alarmDelayDays: "$alarmDelayDays",
                companyName: '$companyInfo.name',
                projectName: '$projectInfo.name',
                manager: '$managerInfo.nickname',
                enable: '$enable',
            }
        },
        {$match: getTowerWhere(query)},
    ]
    return queryObj;
}

function getTowerWhere(query) {
    let where = {enable: '0'};
    let whereOther = {};
    let whereSearch = {};
    for (let keyName in query) {
        if (keyName === "search") {
            whereSearch["$or"] = [
                {code: {$regex: "^.*" + query.search + ".*$"}},
                {name: {$regex: "^.*" + query.search + ".*$"}},
                {towerCreateDate: {$regex: "^.*" + query.search + ".*$"}},
                {alarmDelayDays: {$regex: "^.*" + query.search + ".*$"}},
                {companyName: {$regex: "^.*" + query.search + ".*$"}},
                {projectName: {$regex: "^.*" + query.search + ".*$"}},
                {manager: {$regex: "^.*" + query.search + ".*$"}},
            ];
        } else if (keyName !== 'sort' && keyName !== 'limit' && keyName !== 'offset' && keyName !== 'order') {
            if (keyName === "codeName" && query[keyName] !== "") {
                whereOther["$or"] = [{code: {$regex: "^.*" + query[keyName] + ".*$"}}, {name: {$regex: "^.*" + query[keyName] + ".*$"}}];
            } else if (query[keyName] !== "") {
                whereOther[keyName] = {$regex: "^.*" + query[keyName] + ".*$"};
            }
        }
    }
    where["$and"] = [whereSearch, whereOther]
    return where;
}
