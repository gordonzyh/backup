let basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var autoData = require(basePath + "/models/ftAutoDataTbl");
var comm = require(basePath + "/lib/controllers/common/common.js");
let dbName = require(basePath + "/config/config.json").mongodb.DBNAME;

exports.getData = function (req, res, next) {
    autoData.model(dbName).find(req.body, (err, result) => {
        if (err || comm.isEmptyArray(result) || comm.isEmptyArray(result[0]._doc.data)) {
            res.send({titles: [], data: []});
            return;
        }
        var resultObj = getWindSpeedChartJson(result[0]._doc.data, result[0]._doc.errorInfo,);
        resultObj["towerId"] = result[0]._doc.towerId;
        res.send(resultObj);
    });
};


function getWindSpeedChartJson(data, errorInfo) {
    let resultList = [];
    let titles = [{title: "时间"}];
    let datas = [];
    let chartDatas = [[]];
    let tabChars = ["speed", "direction", "humidity", "temperature", "air_pressure"];

    for (let i = 0; i < data.length; i++) {
        let nowdata = {col0: data[i]["datatime"],col0Flg: 'ok'};
        let colNum = 1;
        for (let j = 0; j < tabChars.length; j++) {
            if (!comm.isEmptyArray(data[i][tabChars[j]])) {
                comm.objArraySort(data[i][tabChars[j]], "height", -1);
                for (let k = 0; k < data[i][tabChars[j]].length; k++) {
                    if (i === 0) {
                        titles.push({title: getTitleName(tabChars[j], data[i][tabChars[j]][k].height), islink: true});
                    }
                    nowdata["col" + colNum] = data[i][tabChars[j]][k]["avg"];
                    nowdata["col" + colNum + 'Flg'] = 'ok';
                    if (!comm.isEmptyArray(errorInfo)) {
                        for (idx in errorInfo) {
                            if (errorInfo[idx].errorType === tabChars[j] &&
                                errorInfo[idx].errorHeight === data[i][tabChars[j]][k].height &&
                                i >= errorInfo[idx].startIndex &&
                                i <= errorInfo[idx].endIndex) {
                                nowdata["col" + colNum + 'Flg'] = 'ng';
                            }
                        }
                    }
                    if (chartDatas.length <= colNum) {
                        chartDatas.push([]);
                    }
                    chartDatas[colNum].push([data[i]["datatime"], data[i][tabChars[j]][k]["avg"]]);
                    colNum++
                }
            }
        }
        datas.push(nowdata);
    }
    for (let i = 0; i < chartDatas.length; i++) {
        comm.objArraySort(chartDatas[i], 0, 1);
    }

    let resultObj = {
        datas: datas,
        titles: titles,
        chartData: chartDatas
    }
    return resultObj;
}

function getTitleName(dataType, height) {
    switch (dataType) {
        case "speed" :
            return height + "米风速"
        case "direction" :
            return height + "米风向"
        case "humidity" :
            return height + "米温度"
        case "temperature" :
            return height + "米湿度"
        case "air_pressure" :
            return height + "米气压"
    }
}