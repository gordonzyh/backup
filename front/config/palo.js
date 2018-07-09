var fs = require("fs");
var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1?basePath.substr(0,basePath.indexOf("bin")-1):basePath;
var objConfig = JSON.parse(fs.readFileSync( basePath + "/config/config.json", "utf8"));
var palo=require("mysql");
var pool = palo.createPool({  
    host: objConfig.palo.host,
    user: objConfig.palo.user,
    password: objConfig.palo.password,
    database: objConfig.palo.database,
    port: objConfig.palo.port
});  
  
var query=function(sql,callback){  
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,function(qerr,rows,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(qerr,rows,fields);  
            });  
        }  
    });  
};  

var promiseQuery = function(sql){
    return new Promise(function(resolve,reject){
        query(sql,function(err,rows,fields){
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                reject(err);
            }else{
                resolve(rows);
            }
        });
    });
}

var client ={};

client.query = query;
client.promiseQuery =promiseQuery;

module.exports=client;