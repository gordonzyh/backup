/**
 * Created by Administrator on 2018/05/18.
 */
function toDataManage(){
    window.parent.window.showSubPage('toDataManage');
}
function doView(_id) {
    $.ajax({
        url: "/windTower/windTowerDetailView/viewLoad",
        data: {_id:_id},
        method: "post",
        success: function (result) {
            if (isEmptyObject(result)) {
                error("测风塔读取错误，请再试一次，如果仍然存在问题，请联系管理员！");
            }
            setControls_view(result);
            $("#viewModal").modal("show");
        },
        error: function (result) {
            error("测风塔读取错误，请再试一次，如果仍然存在问题，请联系管理员！");
        }
    });
}

function setControls_view(data) {
    $("#id_view").val(data['_id']);
    $("#code_view").val(data['code']);
    $("#towerName_view").val(data['name']);
    $("#countryCity_view").val(data['countryCity']);
    $("#project_view").val(data['project']);
    $("#company_view").val(data['company']);
    $("#manufactor_view").val(data['manufactor']);
    $("#towerCreateDate_view").val(data['towerCreateDate']);
    $("#manager_view").val(data['manager']);
    $("#alarmDelayDays_view").val(data['alarmDelayDays']);
    $("#longitude_view").val(data['longitude']);
    $("#latitude_view").val(data['latitude']);
    $("#towerHeight_view").val(data['height']);
    $("#altitude_view").val(data['altitude']);
    $("#memo_view").val(data['memo']);
}