//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var errorFix = new Schema({
    towerId:{ type: String },    //测风塔编号
    fix_date:{ type: String },    //处理时间
    fix_memo:{ type: String },    //处理备注
    fix_method:{ type: String },    //处理方式
    do_fix_date:{ type: String },    //被处理时间
    createTime:{ type: String },    //创建日期
    updateTime:{ type: String },    //修改日期
    createId:{ type: String },    //创建者ID
    updateId:{ type: String }    //修改者ID
});

exports.errorFix = mdb.cModle("cloud_dev", "errorFix", errorFix, "ft_error_fix_tbl");

exports.model = function (code) {
    return mdb.cModle(code, "errorFix", errorFix, "ft_error_fix_tbl");
};

exports.table = "ft_error_fix_tbl";//表名