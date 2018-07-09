var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var autoData = require(basePath + "/models/ftAutoDataTbl");
var errorFix = require(basePath + "/models/ftErrorFixTbl");
var dbName = require(basePath + "/config/config.json").mongodb.DBNAME;
var comm = require(basePath + "/lib/controllers/common/common.js");
const palo = require(basePath + '/config/palo');

exports.index = function (req, res, next) {
    comm.render(req, res, 'mapDisplay', {socketURL: comm.getSocketURL(req)});
};

exports.getCharts = function (req, res, next) {
    var sql = chartsSql(req.query.towerId);
    palo.query(sql, function (qerr, rows, fields) {
        let directionScope = []
        if (!comm.isEmptyArray(rows)){
            let startValue = 348.75;
            let addValue = 22.5;

            for (let startDirection = startValue; directionScope.length < 16; startDirection = startDirection + addValue) {
                if (startDirection >= 360) {
                    startDirection -= 360
                }
                let toDirection = startDirection + addValue;
                if (toDirection >= 360) {
                    toDirection -= 360
                }
                directionScope.push({direction: startDirection + "~" + toDirection, speed: 0})
            }
            rows.forEach(function (row) {
                let direction = row.direction;
                if (direction < 0) {
                    direction = 360 + direction;
                }
                let dateIndex = parseInt((direction + (addValue / 2)) / addValue)
                directionScope[dateIndex>=16?0:dateIndex].speed += row.speed;
            });
        }
        res.send(directionScope);
    });
};

exports.getAverageSpeed = function (req, res, next) {
    palo.query(averageSpeedSql(req.query.towerId), function (qerr, rows, fields) {
        if (rows && rows.length > 0) {
            res.send({
                towerId: req.query.towerId,
                averageSpeed: Number(rows[0].averageSpeed).toFixed(2),
                maxHeight: rows[0].maxHeight
            });
        } else {
            res.send({});
        }
    });
}

function averageSpeedSql(towerId) {
    var sql = 'SELECT ' +
        'speed_height AS maxHeight, ' +
        '    avg(speed) AS averageSpeed ' +
        'FROM ' +
        'ft_main_speed_tbl ' +
        'WHERE ' +
        'speed_height = (SELECT MAX(speed_height) FROM ft_main_speed_tbl) ' +
        'AND towerId = :towerId ' +
        'GROUP BY maxHeight ';

    return sql.replace(/:towerId/g, "'" + towerId + "'");
}

function chartsSql(towerId) {
    var sql = 'SELECT ' +
        'T2.direction AS direction ' +
        '    , SUM(T1.speed*T1.speed*T1.speed) AS speed ' +
        'FROM ' +
        'ft_main_speed_tbl T1 ' +
        'INNER JOIN ft_main_direction_tbl T2 ' +
        'ON T1.speed_height = T2.direction_height ' +
        'AND T1.towerId = T2.towerId ' +
        'AND T1.datatime = T2.datatime ' +
        'WHERE T1.towerId= :towerId ' +
        'GROUP BY ' +
        'T2.direction ' +
        'ORDER BY direction ';

    return sql.replace(/:towerId/g, "'" + towerId + "'");
}