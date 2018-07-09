//mongodb数据库连接相关配置

var mongoose = require('mongoose');
var fs = require("fs");
var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1?basePath.substr(0,basePath.indexOf("bin")-1):basePath;
var objConfig = JSON.parse(fs.readFileSync( basePath + "/config/config.json", "utf8"));

//var dbUrl="mongodb://172.160.0.13/sec";
var dbUrl = "";
if(objConfig.mongodb != null){
	if(objConfig.mongodb.USERNAME != ""){
		dbUrl = "mongodb://" + objConfig.mongodb.USERNAME + ":" 
		+ objConfig.mongodb.PASSWORD + "@" + objConfig.mongodb.IP + ":" 
		+ objConfig.mongodb.PORT + "/" + objConfig.mongodb.DBNAME;
	}else{
		dbUrl = "mongodb://"  + objConfig.mongodb.IP + ":" 
		+ objConfig.mongodb.PORT + "/" + objConfig.mongodb.DBNAME;
	}
}

var dbPool = new Array();
function useDb(dbName){
	if(dbName=="cloud_dev"||dbName==null||dbName==""){
		dbName=objConfig.mongodb.DBNAME;
	}
	// console.log("a:"+dbPool.length);
	if(dbPool==null||dbPool.length==0){
		var conn = mongoose.createConnection(dbUrl);
		var db = conn.useDb(dbName);
		var map = {};
		map.db = db;
		map.dbName = dbName;
		dbPool[0]=map;
		// console.log("a01:"+dbPool.length);
		return db;
	}else{
		for(var i=0;i<dbPool.length;i++){
			if(dbPool[i]['dbName'] == dbName){
				// console.log("b01:"+dbName);
				return dbPool[i]['db'];
			}
		}

		var conn = mongoose.createConnection(dbUrl);
		var db = conn.useDb(dbName);
		var map = {};
		map.db = db;
		map.dbName = dbName;
		dbPool[dbPool.length]=map;
		// console.log("b02:"+dbName);
		return db;
	}
}
function cModel(dbName,mdName,schema,table){
	var db = useDb(dbName);
	return db.model(mdName,schema,table);
}

//mongoose.connect(dbUrl);//进行mongodb数据库的连接

// console.log(objConfig.mongodb.IP + ":"
// 	+ objConfig.mongodb.PORT + "/" + objConfig.mongodb.DBNAME);

mongoose.connection.on('connected', function () {
     // console.log('Mongoose connected to : '+objConfig.mongodb.IP + ":"
		//  + objConfig.mongodb.PORT + "/" + objConfig.mongodb.DBNAME);
});
mongoose.connection.on('error',function (err) {
      console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
      console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
      mongoose.connection.close(function () {
          console.log('Mongoose disconnected through app termination');
          process.exit(0);   
       });
});

exports.mongoose = mongoose;
exports.cModle = cModel;