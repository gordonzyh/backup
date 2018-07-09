var basePath = process.cwd();
basePath = basePath.indexOf("bin") != -1 ? basePath.substr(0, basePath.indexOf("bin") - 1) : basePath;
var dataManage = require(basePath + "/lib/controllers/dataManage.js");
var index = require(basePath + "/lib/controllers/index.js");

function cli_Event(cli, path, callbanck) {
    cli.on(path, function (cdata) {
        callbanck(cdata, cli);
    });
}
function socketStartDo(cli) {
    function refreshWarningCount() {
        index.getWarningCount().then(function (data) {
            cli.emit("refreshWarningCount", data)
        });
    }
    refreshWarningCount();
}

exports.socketRoutes = function socketRoutes(cli) {
    socketStartDo(cli)
    cli_Event(cli, "dataManage/getWindSpeedChart", dataManage.getWindSpeedChart);
};

