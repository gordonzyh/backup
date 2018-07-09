var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var autoData = require(basePath + "/models/ftAutoDataTbl");
var path = require(basePath + "/models/path");
var errorFix = require(basePath + "/models/ftErrorFixTbl");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");
var uploadConfig = require(basePath + '/lib/controllers/common/uploadConfig.js');

exports.save = function (req, res, next) {
    //拿到处理日期数组和处理备注
    var processDate = req.body.processDate;

    (async () => {
        for (var i = 0; i < processDate.length; i++) {
            //用处理日期去更新有效标志为保留
            //如果找不到对应数据就插入一条新的
            await (function (i) {
                autoData.model(dbName).update({receive_date: processDate[i]}, {
                    $set: {
                        effective_flg: '2', updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        updateId: req.session.user.uid
                    }
                }, {
                    multi: true,
                    upsert: true
                }, (err, doc) => {
                    //处理到最后一条记录后建一条error_fix数据
                    var data = {
                        towerId: req.body.towerId,
                        fix_date: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss').toString(),
                        do_fix_date: processDate[i],
                        fix_method: req.body.fix_method,
                        fix_memo: req.body.memo,
                        createTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        updateTime: comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        createId: req.session.user.uid,
                        updateId: req.session.user.uid
                    };

                    insertErrorFix(data);
                })
            })(i);
        }

        res.send({status: true});
    })();
};

exports.createPath = function (req, res, next) {
    path.model(dbName).findOne({}, (err, result) => {
        if (err || !result) {
            res.send({errorMsg: '发生未知错误,上传失败', status: false});
        } else {
            req.session.filePath = result._doc.prefix + result._doc.ft_temp_path;
            req.session.towerId = req.body.towerId;
            res.send({status: true});
        }
    });
}

exports.dataUpload = function (req, res, next) {
    if (!req.session.filePath || !req.session.towerId) {
        res.send({message: '发生未知错误,上传失败', status: false});
        return;
    }

    //filepath=数据据filpath+towerId+currentTime
    var filePath = req.session.filePath + req.session.towerId + Date.parse(new Date()).toString() + '/';
    var upload = uploadConfig.upload(filePath).array('localFile');

    upload(req, res, function (err) {
        if (err) {
            res.send({status: false});
            return;
        }

        var files = req.files;
        var message = [];
        var fileName = [];
        files.forEach(function (file) {
            fileName.push(file.originalname);
            message.push(file.originalname + ' ' + comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'));
        });

        res.send({
            filePath: filePath,
            fileName: fileName,
            message: message,
            status: true//上传状态
        });
    });
}

//新建一条error_fix数据
function insertErrorFix(data) {
    errorFix.model(dbName).create(data, function () {
    });
}