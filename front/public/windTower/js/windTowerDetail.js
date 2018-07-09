/**
 * Created by Administrator on 2018/05/18.
 */
$(document).ready(function () {
    $("#inputProject").hide();
    $("#inputCompany").hide();
    $("#inputManufactor").hide();

    //初始化下拉框
    $.ajax({
        url: "/windTower/windTowerDetail/init",
        data: {},
        method: "post",
        success: function (result) {
            //省市
            if (result["countryCity"]) {
                for (let i = 0; i < result["countryCity"].length; i++) {
                    $('#selectCountryCity.selectpicker').append("<option value='" + result["countryCity"][i].provinceCode + "'>" + result["countryCity"][i].provinceName + "</option>");
                }
            }
            $('#selectCountryCity').selectpicker('refresh');
            //所属项目
            if (result["project"]) {
                for (let i = 0; i < result["project"].length; i++) {
                    $('#selectProject.selectpicker').append("<option value='" + result["project"][i].uid + "'>" + result["project"][i].name + "</option>");
                }
            }
            $('#selectProject').selectpicker('refresh');
            //测风塔厂家
            if (result["manufactor"]) {
                for (let i = 0; i < result["manufactor"].length; i++) {
                    $('#selectManufactor.selectpicker').append("<option value='" + result["manufactor"][i].code + "'>" + result["manufactor"][i].name + "</option>");
                }
            }
            $('#selectManufactor').selectpicker('refresh');
            //项目经理
            if (result["manager"]) {
                for (let i = 0; i < result["manager"].length; i++) {
                    $('#selectManager.selectpicker').append("<option value='" + result["manager"][i].username + "'>" + result["manager"][i].nickname + "</option>");
                }
            }
            $('#selectManager').selectpicker('refresh');
            //所属公司
            if (result["company"]) {
                for (let i = 0; i < result["company"].length; i++) {
                    $('#selectCompany.selectpicker').append("<option value='" + result["company"][i].uid + "'>" + result["company"][i].name + "</option>");
                }
            }
            $('#selectCompany').selectpicker('refresh');
        }
    });
});

function doEdit(_id,hasDel) {
    $("#myModalLabel").text('测风塔编辑');
    $.ajax({
        url: "/windTower/windTowerDetail/editLoad",
        data: {_id: _id},
        method: "post",
        success: function (result) {
            if (isEmptyObject(result)) {
                error("测风塔读取错误，请再试一次，如果仍然存在问题，请联系管理员！");
            }
            setControls(result);
            $("#editModel").val('edit');
            if(hasDel){
                $("#btnDelete").show();
            }else{
                $("#btnDelete").hide();
            }
            $("#addModal").modal("show");
        },
        error: function (result) {
            error("测风塔读取错误，请再试一次，如果仍然存在问题，请联系管理员！");
        }
    });
}

function doAdd() {
    setControls({});
    $("#myModalLabel").text('测风塔添加');
    $("#btnDelete").hide();
    $("#code")[0].disabled = false;
    $("#editModel").val('add');
    $("#addModal").modal("show");
    $('#refreshModel').val('table')

}

function doAddMap() {
    setControls({});
    $("#myModalLabel").text('测风塔添加');
    $("#btnDelete").hide();
    $("#code")[0].disabled = false;
    $("#editModel").val('add');
    $("#addModal").modal("show");
    $('#refreshModel').val('map')

}

function setControls(data) {
    $(".c-errorBgColor").removeClass('c-errorBgColor');

    $("#newCheckProject").prop("checked", false);
    $("#inputProject").val('');
    $("#divProject").show();
    $("#inputProject").hide();

    $("#newCheckCompany").prop("checked", false);
    $("#inputCompany").val('');
    $("#divCompany").show();
    $("#inputCompany").hide();

    $("#newCheckManufactor").prop("checked", false);
    $("#inputManufactor").val('');
    $("#divManufactor").show();
    $("#inputManufactor").hide();

    $("#id").val(!data['_id'] ? '' : data['_id']);
    $("#code").val(!data['code'] ? '' : data['code']);
    $("#towerName").val(!data['name'] ? '测风塔' : data['name']);
    $("#selectCountryCity").selectpicker('val', !data['provinceCode'] ? '' : data['provinceCode']);
    $("#selectProject").selectpicker('val', !data['projectUid'] ? '' : data['projectUid']);
    $("#selectCompany").selectpicker('val', !data['company'] ? '' : data['company']);
    $("#selectManufactor").selectpicker('val', !data['manufactorCode'] ? '' : data['manufactorCode']);
    $('#towerCreateDate').calendarSetDate(!data['towerCreateDate'] ? '' : data['towerCreateDate']);
    $("#selectManager").selectpicker('val', !data['manager'] ? '' : data['manager']);
    $("#alarmDelayDays").val(!data['alarmDelayDays'] ? '' : data['alarmDelayDays']);
    $("#longitude").val(!data['longitude'] ? '' : data['longitude']);
    $("#latitude").val(!data['latitude'] ? '' : data['latitude']);
    $("#towerHeight").val(!data['height'] ? '' : data['height']);
    $("#altitude").val(!data['altitude'] ? '' : data['altitude']);
    $("#mailCheck").prop("checked", !data['mail'] ? false : true);
    $("#mail").val(!data['mail'] ? '' : data['mail']);
    $("#mailPwd").val(!data['password'] ? '' : data['password']);
    $("#dataPwd").val(!data['dataPassword'] ? '' : data['dataPassword']);
    $("#mailStartDate").val(!data['mailStartDate'] ? '' : data['mailStartDate']);
    $("#memo").val(!data['memo'] ? '' : data['memo']);
    if ($("#mailCheck").prop("checked")) {
        $("#mailDiv").show();
    } else {
        $("#mailDiv").hide();
    }
}

$("#mailCheck").on('click', function () {
    if ($("#mailCheck").prop("checked")) {
        $("#mailDiv").show();
    } else {
        $("#mailDiv").hide();
    }
});
$("#newCheckProject").on('click', function () {
    if ($("#newCheckProject").prop("checked")) {
        $("#divProject").hide();
        $("#inputProject").show();
    } else {
        $("#divProject").show();
        $("#inputProject").hide();
    }
});
$("#newCheckCompany").on('click', function () {
    if ($("#newCheckCompany").prop("checked")) {
        $("#divCompany").hide();
        $("#inputCompany").show();
    } else {
        $("#divCompany").show();
        $("#inputCompany").hide();
    }
});
$("#newCheckManufactor").on('click', function () {
    if ($("#newCheckManufactor").prop("checked")) {
        $("#divManufactor").hide();
        $("#inputManufactor").show();
    } else {
        $("#divManufactor").show();
        $("#inputManufactor").hide();
    }
});
$(".form-control").on('change', function () {
    if ($(this)[0].type === "select-one") {
        $(this).selectpicker('setStyle', 'c-errorBgColor', 'remove')
    } else {
        $(this).removeClass('c-errorBgColor');
    }
});

function saveConfirm() {
    let data = {
        editModel: $("#editModel").val(),
        _id: $("#id").val(),
        code: $("#code").val(),
        name: $("#towerName").val(),
        provinceCode: $("#selectCountryCity").selectpicker('val'),
        projectUid: $("#newCheckProject").prop("checked") ? '-new-' : $("#selectProject").selectpicker('val'),
        projectName: $("#inputProject").val(),
        company: $("#newCheckCompany").prop("checked") ? '-new-' : $("#selectCompany").selectpicker('val'),
        companyName: $("#inputCompany").val(),
        manufactorCode: $("#newCheckManufactor").prop("checked") ? '-new-' : $("#selectManufactor").selectpicker('val'),
        manufactorName: $("#inputManufactor").val(),
        towerCreateDate: $("#towerCreateDate").val(),
        manager: $("#selectManager").selectpicker('val'),
        alarmDelayDays: $("#alarmDelayDays").val(),
        longitude: $("#longitude").val().trim(),
        latitude: $("#latitude").val().trim(),
        height: $("#towerHeight").val(),
        altitude: $("#altitude").val(),
        mailCheck: $("#mailCheck").prop("checked"),
        mail: $("#mailCheck").prop("checked") ? $("#mail").val() : '',
        password: $("#mailCheck").prop("checked") ? $("#mailPwd").val() : '',
        dataPassword: $("#mailCheck").prop("checked") ? $("#dataPwd").val() : '',
        memo: $("#memo").val(),
        mailStartDate: $("#mailStartDate").val()
    };
    let url;
    if ($("#editModel").val() === 'add') {
        url = "/windTower/windTowerDetail/add";
    } else {
        url = "/windTower/windTowerDetail/edit";
    }
    if (saveCheck(data)) {
        $.ajax({
            url: url,
            data: data,
            method: "post",
            success: function (result) {
                if(result.errorCode){
                    error(getMessage(response.errorCode));
                }else if (!result.error) {
                    if (result["project"]) {
                        $('#selectProject.selectpicker').append("<option value='" + result["project"].projectUid + "'>" + result["project"].projectName + "</option>");
                    }
                    if (result["company"]) {
                        $('#selectCompany.selectpicker').append("<option value='" + result["company"].company + "'>" + result["company"].companyName + "</option>");
                    }
                    if (result["manufactor"]) {
                        $('#selectManufactor.selectpicker').append("<option value='" + result["manufactor"].manufactorCode + "'>" + result["manufactor"].manufactorName + "</option>");
                    }
                    $('#selectProject').selectpicker('refresh');
                    $('#selectManufactor').selectpicker('refresh');
                    $('#selectCompany').selectpicker('refresh');

                    $("#addModal").modal("hide");

                    if ($('#refreshModel').val() === 'table' || $("#editModel").val() === 'edit') {
                        $("#windTowerTable").bootstrapTable('refresh');
                    } else {
                        initMenuAndMap('', $("#code").val());
                    }
                    toastr.info('保存成功');
                } else {
                    error(result.error);
                }
            },
            error: function (result) {
                error("测风塔保存错误，请再试一次，如果仍然存在问题，请联系管理员！");
            }
        });
    }
}

function saveCheck(data) {
    let msg = [];
    // $('.selectpicker').selectpicker('setStyle', 'btn-large', 'add');
    // $('#'+controlname).addClass('c-errorBgColor')
    //
    let objTemp = $('#code')
    mustCheck(data.code, "测风塔编号", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    if (data.code && !data.code.match("^[0-9]*$")) {
        msg.push("测风塔编号必须为数字")
        objTemp.addClass('c-errorBgColor');
    }

    objTemp = $('#selectCountryCity');
    mustCheck(data.provinceCode, "省市", msg) ? objTemp.selectpicker('setStyle', 'c-errorBgColor', 'remove') : objTemp.selectpicker('setStyle', 'c-errorBgColor', 'add');

    if ($("#newCheckProject").prop("checked")) {
        objTemp = $('#inputProject');
        mustCheck(data.projectName, "所属项目", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    } else {
        objTemp = $('#selectProject');
        mustCheck(data.projectUid, "所属项目", msg) ? objTemp.selectpicker('setStyle', 'c-errorBgColor', 'remove') : objTemp.selectpicker('setStyle', 'c-errorBgColor', 'add');
    }
    objTemp = $('#longitude');
    mustCheck(data.longitude.trim(), "经度", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    let longitudeReturn = DegreeConvertNumber(data.longitude.trim(), "经度", msg)
    !longitudeReturn.isError ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    if (!longitudeReturn.isError) {
        data.longitude = longitudeReturn.value;
        $('#longitude').val(longitudeReturn.value)
    }
    objTemp = $('#latitude');
    mustCheck(data.latitude.trim(), "纬度", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    let latitudeReturn = DegreeConvertNumber(data.latitude.trim(), "纬度", msg)
    !latitudeReturn.isError ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    if (!latitudeReturn.isError) {
        data.latitude = latitudeReturn.value;
        $('#latitude').val(latitudeReturn.value)
    }
    objTemp = $('#selectManager');
    mustCheck(data.manager, "项目经理", msg) ? objTemp.selectpicker('setStyle', 'c-errorBgColor', 'remove') : objTemp.selectpicker('setStyle', 'c-errorBgColor', 'add');
    objTemp = $('#towerHeight');
    mustCheck(data.height, "高度", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    objTemp = $('#alarmDelayDays');
    mustCheck(data.alarmDelayDays, "报警延迟日数", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
    if (data.mailCheck) {
        objTemp = $('#mail');
        mustCheck(data.mail, "邮箱", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
        check_mail(data.mail, msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
        objTemp = $('#mailPwd');
        mustCheck(data.password, "密码", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');
        objTemp = $('#mailStartDate')
        mustCheck(data.mailStartDate, "邮件接收起始时间", msg) ? objTemp.removeClass('c-errorBgColor') : objTemp.addClass('c-errorBgColor');

        if ($('#dataPwd').val() === '') {
            $('#dataPwd').val('1111')
        }
    }
    if (msg.length > 0) {
        warning(msg);
        return false;
    }
    return true
}

function doDelete() {
    confirmC("确定需要删除此测风塔么？", "测风塔删除", function ok() {
        $.ajax({
            url: "/windTower/windTowerDetail/delete",
            data: {
                _id: $("#id").val(),
            },
            method: "post",
            success: function (result) {
                if(result.errorCode){
                    error(getMessage(response.errorCode));
                }else if (result.resText === "OK") {
                    $("#addModal").modal("hide");
                    $("#windTowerTable").bootstrapTable('refresh');
                } else {
                    error(result.resText);
                }
            },
            error: function (result) {
                error("测风塔删除错误，请再试一次，如果仍然存在问题，请联系管理员！");
            }
        });
    })
}

$('#addModal').on('hide.bs.modal', function () {
    toastr.clear();
});