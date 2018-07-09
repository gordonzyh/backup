//用户实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var userData = new Schema({
    uid: {type: String},
    flag: {type: String},
    createTime: {type: String},
    updateTime: {type: String},
    createId: {type: String},
    updateId: {type: String},
    //用户名
    username: {type: String},
    //用户名加密
    usernameMd5: {type: String},
    //密码
    password: {type: String},
    //电子邮箱
    email: {type: String},
    //用户昵称
    nickname: {type: String},
    //qq
    qq: {type: String},
    //联系电话
    phone: {type: String},
    //手机
    mobilPhone: {type: String},
    //用户头像
    face: {type: String},
    //微信
    weixin: {type: String},
    //组织机构
    organization: {type: String},
    //风场信息
    infoWind: {type: String},
    //角色
    roles: {type: String},
    //角色
    roleid: {type: String},
    action: String,
    menus: String,//用户特权
    is_login: String,
    login_time: String,
    before_time: String,
    devicetype: Array,//机型分类
    // devicevalues:Array,//机型信息
    statustype: Array,//状态分类
    faulttype: Array,//故障分类
    //风场编号
    code: String,
    isWindField: String,
    effectiveTime: String,
    effectiveType: String//01 自定义；02 30天；03 90天；04 360天； 05 永久
});

exports.User = mdb.cModle("cloud_dev", "User", userData, "USERS");

exports.model = function (code) {
    return mdb.cModle(code, "User", userData, "USERS");
};

exports.table = "USERS";//表名