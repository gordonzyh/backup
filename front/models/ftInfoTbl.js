//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var infoTbl = new Schema({
    code: {type: String},    //测风塔编号
    provinceCode: {type: String},//省市
    projectUid: {type: String},//项目
    name: {type: String},//测风塔名称
    company: {type: String},//所属单位
    longitude: {type: String},//经度
    latitude: {type: String},//纬度
    manufactorCode: {type: String},//厂家
    manager: {type: String},//项目经理
    towerCreateDate: {type: String},//立塔时间
    height: {type: String},//高度
    altitude: {type: String},//海拔
    mail: {type: String},//邮箱
    password: {type: String},//密码
    dataPassword: {type: String},//数据密码
    alarmDelayDays: {type: Number},//报警延迟日数
    mainDataIndex: {type: Number},//主数据序号
    mailStartDate:{ type: String}, //邮件接收起始时间
    memo: {type: String},//主数据序号
    enable: {type: String},//删除标志
    createTime:{ type: String},    //创建日期
    updateTime:{ type: String},    //修改日期
    createId:{ type: String},    //创建者ID
    updateId:{ type: String},    //修改者ID

});

exports.FtpInfo = mdb.cModle("cloud_dev", "ftInfoTbl", infoTbl, "ft_info_tbl");

exports.model = function (code) {
    return mdb.cModle(code, "ftInfoTbl", infoTbl, "ft_info_tbl");
};

exports.table = "ft_info_tbl";//表名