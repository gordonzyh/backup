let basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
let ftInfoTbl = require(basePath + "/models/ftInfoTbl");
let countryCity = require(basePath + "/models/countryCity");
let company = require(basePath + "/models/ftCompanyTbl");
let project = require(basePath + "/models/ftProjectTbl");
let user = require(basePath + "/models/user");
var comm = require(basePath + "/lib/controllers/common/common.js");
let manufactor = require(basePath + "/models/manufact");
let dbName = require(basePath + "/config/config.json").mongodb.DBNAME;

exports.init = function (req, res, next) {
    let funs = [
        //省市
        new Promise(function (resolve, reject) {
            resolve(countryCity.model(dbName).find().sort({provinceName: 1}));
        }),
        //项目

        new Promise(function (resolve, reject) {
            resolve(project.model(dbName).find({enable: '1'}).sort({name: 1}));
        }),
        //项目经理

        new Promise(function (resolve, reject) {
            resolve(user.model(dbName).find().sort({nickname: -1}));
        }),
        //厂家

        new Promise(function (resolve, reject) {
            resolve(manufactor.model(dbName).find({enable: '1'}).sort({name: 1}));
        }),

        //所属公司
        new Promise(function (resolve, reject) {
            resolve(company.model(dbName).find({enable: '1'}).sort({name: 1}));
        }),
    ];
    Promise.all(funs).then(function (resultList) {
        res.send({
            //省市
            countryCity: resultList[0],
            //项目
            project: resultList[1],
            //项目经理
            manager: resultList[2],
            //厂家
            manufactor: resultList[3],
            //所属公司
            company: resultList[4],
        });
    });
};

exports.save = function (req, res, next) {
    let data = {
        code: req.body.code,
        name: req.body.name,
        provinceCode: req.body.provinceCode,
        projectUid: req.body.projectUid,
        projectName: req.body.projectName,
        company: req.body.company,
        companyName: req.body.companyName,
        manufactorCode: req.body.manufactorCode,
        manufactorName: req.body.manufactorName,
        towerCreateDate: req.body.towerCreateDate,
        manager: req.body.manager,
        alarmDelayDays: req.body.alarmDelayDays,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        height: req.body.height,
        altitude: req.body.altitude,
        mail: req.body.mail,
        password: req.body.password,
        dataPassword: req.body.dataPassword,
        mailStartDate:req.body.mailStartDate,
        memo: req.body.memo,
        mainDataIndex: 0,
        enable: "0",
        updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        updateId: req.session.user.uid,
    };

    Promise.all([getProjectUid(data), getCompany(data), getManufactorCode(data)]).then(function (resultIds) {
        let resObj = {error: ''}
        if (resultIds[0]) {
            data.projectUid = resultIds[0];
            resObj["project"] = {projectUid: resultIds[0], projectName: data.projectName}
        }
        if (resultIds[1]) {
            data.company = resultIds[1];
            resObj["company"] = {company: resultIds[1], companyName: data.companyName}
        }
        if (resultIds[2]) {
            data.manufactorCode = resultIds[2];
            resObj["manufactor"] = {
                manufactorCode: resultIds[2],
                manufactorName: data.manufactorName
            }
        }

        if (req.body.editModel === 'edit') {
            ftInfoTbl.model(dbName).find({
                _id: req.body._id,
                enable: '0'
            }, (findErr, resultList) => {
                if (findErr) {
                    console.error(findErr.message);
                    resObj.error = "更新错误，请联系管理员";
                    res.send(resObj);
                } else if (resultList.length === 0) {
                    resObj.error = "更新的记录被删除，请确认";
                    res.send(resObj);
                } else {
                    ftInfoTbl.model(dbName).find({
                        _id: {$ne: req.body._id},
                        code: req.body.code,
                        enable: '0'
                    }, (findErr, resultList) => {
                        if (findErr) {
                            console.error(findErr.message);
                            resObj.error = "更新错误，请联系管理员";
                            res.send(resObj);
                        } else if (resultList.length !== 0) {
                            resObj.error = "测风塔编号重复，请确认！";
                            res.send(resObj);
                        } else {
                            ftInfoTbl.model(dbName).update({_id: req.body._id}, {$set: data}, {multi: true}, (updateErr, doc) => {
                                if (updateErr) {
                                    console.error(updateErr.message);
                                    resObj.error = "更新错误，请联系管理员";
                                    res.send(resObj);
                                } else {
                                    res.send(resObj);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            ftInfoTbl.model(dbName).find({
                code: data.code,
                enable: "0",
            }, (findErr, resultList1) => {
                if (findErr) {
                    console.error(findErr.message);
                    resObj.error = "添加错误，请联系管理员";
                    res.send(resObj);
                } else if (resultList1.length !== 0) {
                    resObj.error = "测风塔编号重复，请确认！";
                    res.send(resObj);
                } else {
                    data.createTime = comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
                    data.createId = req.session.user.uid;
                    ftInfoTbl.model(dbName).create(data, (createErr, doc) => {
                        if (createErr) {
                            console.error(createErr.message);
                            resObj.error = "添加错误，请联系管理员";
                            res.send(resObj);
                        } else {
                            res.send(resObj);
                        }
                    });
                }
            });
        }
    });

};
exports.editLoad = function (req, res, next) {
    let _id = req.body._id;
    ftInfoTbl.model(dbName).find({_id: _id, enable: '0'}, (err, resultList) => {
        if (err || comm.isEmptyArray(resultList)) {
            res.send({});
        } else {
            res.send(resultList[0]);
        }
    });
};
exports.delete = function (req, res, next) {
    let _id = req.body._id;
    ftInfoTbl.model(dbName).update({_id: _id}, {
        $set: {
            enable: "1", updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            updateId: req.session.user.uid
        }
    }, {multi: true}, (updateErr, doc) => {
        if (updateErr) {
            console.error(updateErr.message);
            res.send({resText:"删除错误，请联系管理员"});
        } else {
            res.send({resText:"OK"});
        }
    });
};

function getProjectUid(data) {
    return new Promise(function (resolve, reject) {
        if (data.projectUid === '-new-') {
            project.model(dbName).find({
                name: data.projectName,
                enable: '1'
            }, (findErr, resultList) => {
                if (findErr || comm.isEmptyArray(resultList)) {
                    project.model(dbName).create({}, (creatErr, doc) => {
                        if (creatErr) {
                            console.error(creatErr.message)
                            resolve("error");
                        } else {
                            let projectData = {
                                uid: doc._id.toString(),
                                enable: '1',
                                name: data.projectName,
                                nameShort: data.projectName,
                                createTime: data.updateTime,
                                updateTime: '',
                                createId: data.updateId,
                                updateId: ''
                            }
                            project.model(dbName).update({_id: doc._id.toString()}, {$set: projectData}, {multi: true}, (updateErr, doc) => {
                                if (updateErr) {
                                    console.error(updateErr.message)
                                    resolve("error");
                                } else {
                                    resolve(projectData.uid);
                                }
                            });
                        }
                    });
                } else {
                    resolve(resultList[0]._doc.uid);
                }
            });
        } else {
            resolve('');
        }
    });
}

function getCompany(data) {
    return new Promise(function (resolve, reject) {
        if (data.company === '-new-') {
            company.model(dbName).find({
                name: data.companyName,
                enable: '1'
            }, (findErr, resultList) => {
                if (findErr || comm.isEmptyArray(resultList)) {
                    company.model(dbName).create({}, (creatErr, doc) => {
                        if (creatErr) {
                            console.error(creatErr.message)
                            resolve("error");
                        } else {
                            let companyData = {
                                uid: doc._id.toString(),
                                enable: '1',
                                name: data.companyName,
                                nameShort: data.companyName,
                                createTime: data.updateTime,
                                updateTime: '',
                                createId: data.updateId,
                                updateId: ''
                            }
                            company.model(dbName).update({_id: doc._id.toString()}, {$set: companyData}, {multi: true}, (updateErr, doc) => {
                                if (updateErr) {
                                    console.error(updateErr.message)
                                    resolve("error");
                                } else {
                                    resolve(companyData.uid);
                                }
                            });
                        }
                    });
                } else {
                    resolve(resultList[0]._doc.uid);
                }
            });
        } else {
            resolve('');
        }
    });
}

function getManufactorCode(data) {
    return new Promise(function (resolve, reject) {
        if (data.manufactorCode === '-new-') {
            manufactor.model(dbName).find({
                name: data.manufactorName,
                enable: '1'
            }, (findErr, resultList) => {
                if (findErr || comm.isEmptyArray(resultList)) {
                    manufactor.model(dbName).create({}, (creatErr, doc) => {
                        if (creatErr) {
                            console.error(creatErr.message)
                            resolve("error");
                        } else {
                            let manufactorData = {
                                code: doc._id.toString(),
                                enable: '1',
                                name: data.manufactorName,
                                nameShort: data.manufactorName,
                                createTime: data.updateTime,
                                updateTime: '',
                                createId: data.updateId,
                                updateId: ''

                            }
                            manufactor.model(dbName).update({_id: doc._id.toString()}, {$set: manufactorData}, {multi: true}, (updateErr, doc) => {
                                if (updateErr) {
                                    console.error(updateErr.message)
                                    resolve("error");
                                } else {
                                    resolve(manufactorData.code);
                                }
                            });
                        }
                    });
                } else {
                    resolve(resultList[0]._doc.code);
                }
            });
        } else {
            resolve('');
        }
    });
}