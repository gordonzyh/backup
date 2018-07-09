//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var autoData = new Schema({
    towerId: {type: String},    //测风塔编号
    receive_date: {type: String},    //接收时间
    dataCount: {type: Number},    //接收数据
    data: {type: Array},    //接收数据
    effective_flg: {type: String},    //有效标志
    error_code: {type: String},    //错误内容
    error_event: {type: String},    //错误内容
    error_fix_date: {type: String},    //错误处理时间
    errorInfo: {type: Array},    //接收数据
    file_path: {type: String},    //文件位置
    createTime:{ type: String},    //创建日期
    updateTime:{ type: String},    //修改日期
    createId:{ type: String},    //创建者ID
    updateId:{ type: String},    //修改者ID

});


exports.autoData = mdb.cModle("cloud_dev", "autoData", autoData, "ft_auto_data_tbl");

exports.model = function (code) {
    return mdb.cModle(code, "autoData", autoData, "ft_auto_data_tbl");
};

exports.table = "ft_auto_data_tbl";//表名