let basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
let ftInfoTbl = require(basePath + "/models/ftInfoTbl");
let company = require(basePath + "/models/ftCompanyTbl");
let project = require(basePath + "/models/ftProjectTbl");
let user = require(basePath + "/models/user");
let dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
let manufactor = require(basePath + "/models/manufact");
let countryCity = require(basePath + "/models/countryCity");


exports.viewLoad = function (req, res, next) {
    getTower(req.body._id).then(function (resultList) {
        Promise.all([getCountryCity(resultList[0]._doc.provinceCode), getProject(resultList[0]._doc.projectUid), getCompany(resultList[0]._doc.company),
            getManufactor(resultList[0]._doc.manufactorCode), getManager(resultList[0]._doc.manager)]).then(function (names) {
            resultList[0]._doc["countryCity"] = names[0].length !== 0 ? names[0][0]._doc.provinceName : "";
            resultList[0]._doc["project"] = names[1].length !== 0 ? names[1][0]._doc.name : "";
            resultList[0]._doc["company"] = names[2].length !== 0 ? names[2][0]._doc.name : "";
            resultList[0]._doc["manufactor"] = names[3].length !== 0 ? names[3][0]._doc.name : "";
            resultList[0]._doc["manager"] = names[4].length !== 0 ? names[4][0]._doc.nickname : "";
            res.send(resultList[0]);

        });
    });
}

function getTower(_id) {
    return new Promise(function (resolve, reject) {
        resolve(ftInfoTbl.model(dbName).find({_id: _id, enable: '0'}));
    });
}

function getCountryCity(provinceCode) {
    return new Promise(function (resolve, reject) {
        resolve(countryCity.model(dbName).find({provinceCode: provinceCode}));
    });
}

function getManufactor(code) {
    return new Promise(function (resolve, reject) {
        resolve(manufactor.model(dbName).find({code: code, enable: '1'}));
    });
}

function getCompany(uid) {
    return new Promise(function (resolve, reject) {
        resolve(company.model(dbName).find({uid: uid, enable: '1'}));
    });
}

function getProject(uid) {
    return new Promise(function (resolve, reject) {
        resolve(project.model(dbName).find({uid: uid, enable: '1'}));
    });
}

function getManager(username) {
    return new Promise(function (resolve, reject) {
        resolve(user.model(dbName).find({username: username}));
    });
}