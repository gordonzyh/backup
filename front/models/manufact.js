//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var manufact = new Schema({
    code: {type: String},    //code
    credate: {type: String},    //新建日期
    enable: {type: String},    //有效标志
    name: {type: String},    //名称
    nameShort: {type: String},    //略称
    createTime: {type: String},    //创建日期
    updateTime: {type: String},    //修改日期
    createId: {type: String},    //创建者ID
    updateId: {type: String},    //修改者ID
});

exports.autoData = mdb.cModle("cloud_dev", "manufact", manufact, "MANUFACT");

exports.model = function (code) {
    return mdb.cModle(code, "manufact", manufact, "MANUFACT");
};

exports.table = "MANUFACT";//表名