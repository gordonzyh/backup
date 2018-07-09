//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var updData = new Schema({
    towerId: {type: String},    //测风塔编号
    upd_index: {type: Number},    //上传序号
    upd_date: {type: String},    //上传时间
    upd_memo: {type: String},    //上传备注
    dataCount: {type: Number},    //接收数据
    data: {type: Array},    //接收数据
    file_url: {type: String},    //文件路径
    effective_flg: {type: String},    //有效标志
    updUser: {type: String},    //上传用户
    createTime:{ type: String},    //创建日期
    updateTime:{ type: String},    //修改日期
    createId:{ type: String},    //创建者ID
    updateId:{ type: String},    //修改者ID

});

exports.updData = mdb.cModle("cloud_dev", "updData", updData, "ft_upd_data_tbl");

exports.model = function (code) {
    return mdb.cModle(code, "updData", updData, "ft_upd_data_tbl");
};

exports.table = "ft_upd_data_tbl";//表名