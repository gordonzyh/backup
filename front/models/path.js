//path实体类

var mdb = require('./../config/mdb');

var Schema = mdb.mongoose.Schema;

var path = new Schema({
    computeFilePath: {type: String},
    ruleFilePath: {type: String},
    logFilePath: {type: Array},
    bufferFilePath: {type: String},
    controlFilePath: {type: String},
    resourceFilePath: {type: String},
    otherFilePath: {type: String},
    prefix: {type: String},
    otherGroovyPath: {type: String},
    hisGroovyPath: {type: String},
    imageFilePath: {type: String},
    videoImgPath: {type: String},
    versionFilePath: {type: String},
    windResourceJsonPath: {type: String},
    ft_real_path: {type: String},
    ft_temp_path: {type: String}
});

exports.path = mdb.cModle('cloud_dev', 'path', path, 'PATH');

exports.model = function (code) {
    return mdb.cModle(code, 'path', path, 'PATH');
};

exports.table = 'PATH';//表名