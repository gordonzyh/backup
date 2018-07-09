var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var ftInfoTbl = require(basePath + "/models/ftInfoTbl");
var countryCity = require(basePath + "/models/countryCity");
var project = require(basePath + "/models/ftProjectTbl");
var autoData = require(basePath + "/models/ftAutoDataTbl");
var updData = require(basePath + "/models/ftUpdDataTbl");
var path = require(basePath + "/models/path");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");
var fs = require('fs');
var admZip = require('adm-zip');
var uploadConfig = require(basePath + '/lib/controllers/common/uploadConfig.js');

var fileTypes = ['txt', 'tim', 'rwd', 'csv'];

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
        var files = req.files;
        var firstFile = req.files[0];
        //如果源文件后缀名为zip，进行解压缩处理
        if (getSuffix(firstFile.originalname).toLowerCase() === 'zip') {
            extract(firstFile);
            fs.unlinkSync(filePath + firstFile.filename);
        }

        var message = [];
        files.forEach(function (file) {
            message.push(file.originalname + ' ' + comm.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'));
        });
        res.send({filePath: filePath, message: message, status: true});
    });

};

//解压缩文件
function extract(file) {
    //压缩文件的临时保存路径和解压路径
    var path = file.destination;
    var zip = new admZip(path + '/' + file.filename);
    var zipEntries = zip.getEntries();

    for (var i = 0; i < zipEntries.length; i++) {
        var zipEntry = zipEntries[i];
        //压缩文件内的文件类型check 通过就解压
        if (checkFileType(zipEntry.entryName)) {
            var writeStream;
            var suffix = getSuffix(zipEntry.entryName).toLowerCase();
            if (suffix === 'tim' || suffix === 'txt') {//如果是tim,txt就重写文件名（防止乱码）
                writeStream = fs.createWriteStream(path + '/' + Date.parse(new Date()).toString() + i.toString() + '.' + suffix);
            } else
                writeStream = fs.createWriteStream(path + '/' + zipEntry.entryName);

            writeStream.write(new Buffer(zipEntry.getData()));
            writeStream.end();
        }
    }

    // zipEntries.forEach(function (zipEntry) {
    //
    // });
}

//获取文件后缀名
function getSuffix(fileName) {
    var list = fileName.split('.');
    return list[list.length - 1];
}

//判断是否是规定的文件类型
function checkFileType(fileName) {
    var suffix = getSuffix(fileName).toLowerCase();
    for (var i = 0; i < fileTypes.length; i++) {
        if (fileTypes[i] === suffix) {
            return true;
        }
    }
    return false;
}