//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var projectTbl = new Schema({
    uid: {type: String},    //ID
    enable: {type: String},    //有效标志
    name: {type: String},    //名称
    nameShort: {type: String},    //略称
    createTime: {type: String},    //创建日期
    updateTime: {type: String},    //修改日期
    createId: {type: String},    //创建者ID
    updateId: {type: String}    //修改者ID
});

exports.FtProject = mdb.cModle("cloud_dev", "projectTbl", projectTbl, "ft_project_tbl");

exports.model = function (code) {
    return mdb.cModle(code, "projectTbl", projectTbl, "ft_project_tbl");
};

exports.table = "ft_project_tbl";//表名