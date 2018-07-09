var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var autoData = require(basePath + "/models/ftAutoDataTbl");
let ftInfoTbl = require(basePath + "/models/ftInfoTbl");
let countryCity = require(basePath + "/models/countryCity");
let project = require(basePath + "/models/ftProjectTbl");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");


//获取每个测风塔有效标志为无效的条目
exports.getTowerMenuData = function (req, res, next) {
    let searchText = req.body.searchText;
    let projectWhere = {enable: '1'};
    if (searchText) {
        projectWhere["name"]={$regex: "^.*" + searchText + ".*$"};
    }
    let projectFun = new Promise(function (resolve, reject) {
        resolve(project.model(dbName).find(projectWhere).sort({name: 1}));
    });
    projectFun.then(function (pList) {
        let towerWhere = {enable: '0'};
        if (searchText) {
            searchText= searchText.replace("#","")
            let uidList = [];
            for (i = 0; i < pList.length; i++) {
                uidList.push(pList[i]._doc.uid);
            }
            towerWhere["$or"] = [];
            towerWhere["$or"].push({code: {$regex: "^.*" + searchText + ".*$"}});    // 名称
            towerWhere["$or"].push({name: {$regex: "^.*" + searchText + ".*$"}});    // 名称
            towerWhere["$or"].push({projectUid: {$in: uidList}});    // 项目
        }
        let funs = [
            //测风塔
            new Promise(function (resolve, reject) {
                let towerIdList = req.body.towerIdList;
                if(towerIdList&&!comm.isEmpty(towerIdList)){
                    towerIdList=   towerIdList.split(",");
                    towerWhere["_id"]={$in: towerIdList};
                }
                resolve(ftInfoTbl.model(dbName).find(towerWhere).sort({code: 1}));
            }),
            //省市
            new Promise(function (resolve, reject) {
                resolve(countryCity.model(dbName).find().sort({provinceName: 1}));
            }),
            new Promise(function (resolve, reject) {
                resolve(project.model(dbName).find({enable: '1'}).sort({name: 1}));
            }),
        ];

        Promise.all(funs).then(function (resultList) {
            let towerList = resultList[0];
            let countryCityList = resultList[1];
            let projectList = resultList[2];
            let ids = [];

            let menuDataList = [];
            for (let i = 0; i < towerList.length; i++) {
                let towerData = towerList[i]._doc;
                ids.push(towerData["_id"].toString())
                for (let j = 0; j < countryCityList.length; j++) {
                    let countryCity = countryCityList[j];
                    if (towerData.provinceCode === countryCity._doc.provinceCode) {
                        towerData["provinceName"] = countryCity._doc.provinceName;
                        break;
                    }
                }
                for (let j = 0; j < projectList.length; j++) {
                    let project = projectList[j];
                    if (towerData.projectUid === project._doc.uid) {
                        towerData['projectName'] = project._doc.name;
                        break;
                    }
                }
                menuDataList.push(towerData);
            }
            if (req.body["isShowAlert"] && req.body["isShowAlert"].toLowerCase ().trim()==="true") {
                autoData.model(dbName).find({
                        towerId: {$in: ids},
                        effective_flg: '1'
                }).sort({towerId: 1}).exec(
                    function (error, noEffectiveNumberList) {
                        var subData =[];
                        for (let i = 0; i < towerList.length; i++) {
                            let towerInfo = towerList[i];
                            var mainTowerId = towerList[i]._doc["_id"].toString()
                            var alarmDelayDays = towerInfo._doc.alarmDelayDays;
                            var alarmDelayDate= comm.dateAddDays(new Date() ,-1 * alarmDelayDays);
                            var towerWarnCount =0;
                            for (let i = 0; i < noEffectiveNumberList.length; i++) {
                                let noEffectiveNumber = noEffectiveNumberList[i];
                                let subTowerId= noEffectiveNumber._doc.towerId;
                                let receiveDate= new Date(noEffectiveNumber._doc.receive_date.replace(/-/g,"/"));
                                if(mainTowerId===subTowerId&&comm.dateIsBeforeOrEquals(receiveDate,alarmDelayDate)){
                                    towerWarnCount=towerWarnCount+1;
                                }
                            }
                            subData.push({towerId:mainTowerId,towerWarnCount:towerWarnCount});
                        }
                            for (let i = 0; i < subData.length; i++) {
                                let subDataObj = subData[i];
                                for (let j = 0; j < menuDataList.length; j++) {
                                    if (menuDataList[j]._id.toString() === subDataObj.towerId) {
                                        menuDataList[j]['alertNumber'] = subDataObj.towerWarnCount;
                                        break;
                                    }
                                }
                            }
                            res.send(getMenuObj(menuDataList));
                    }
                );

            } else {
                res.send(getMenuObj(menuDataList));
            }
        });
    });
};

function getMenuObj(data) {

    comm.objArraySort(data, ['provinceName', 'projectName', 'code'], [1, 1, 1]);

    let resData = []
    let provinceName = "";
    let projectName = "";
    let fNode = null;
    let sNode = null;
    for (let i = 0; i < data.length; i++) {
        if (provinceName !== data[i]["provinceName"]) {
            if (fNode) {
                if (sNode) {
                    fNode["nodes"].push(sNode);
                }
                sNode = {nodes: []}
                sNode["text"] = data[i]["projectName"];
                projectName = data[i]["projectName"];
                resData.push(fNode);
            }
            fNode = {nodes: []}
            fNode["text"] = data[i]["provinceName"];
            provinceName = data[i]["provinceName"];
        }
        if (projectName !== data[i]["projectName"]) {
            if (sNode) {
                fNode["nodes"].push(sNode);
            }
            sNode = {nodes: []}
            sNode["text"] = data[i]["projectName"];
            projectName = data[i]["projectName"];
        }
        data[i]["text"] = data[i]["code"] + "#" + data[i]["name"];
        sNode.nodes.push(data[i])
    }
    if (fNode) {
        if (sNode) {
            fNode["nodes"].push(sNode);
        }
        resData.push(fNode);
    }
    return resData;
}