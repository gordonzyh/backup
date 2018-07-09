//测风塔信息实体类

var mdb = require("./../config/mdb");

var Schema = mdb.mongoose.Schema;

var countryCity = new Schema({
    provinceCode: {type: String},    //省市Code
    country: {type: String},    //国家
    countryCode: {type: String},    //国家Code
    provinceName: {type: String},    //省市名
    citys: {type: Array},    //城市
});

exports.autoData = mdb.cModle("cloud_dev", "countryCity", countryCity, "COUNTRY_CITY");

exports.model = function (code) {
    return mdb.cModle(code, "countryCity", countryCity, "COUNTRY_CITY");
};

exports.table = "COUNTRY_CITY";//表名