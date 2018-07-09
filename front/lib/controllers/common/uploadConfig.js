var multer = require('multer');
var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var comm = require(basePath + "/lib/controllers/common/common.js");

exports.upload = function (filePath) {
    return multer({
        storage: multer.diskStorage({
            destination: filePath,
            filename: function (req, file, cb) {
                //获取后缀名后重新拼回去。。
                var nameList = file.originalname.split('.');
                cb(null, file.originalname);
                // cb(null, file.fieldname + '-' + Date.now());
            }
        })
    });
}