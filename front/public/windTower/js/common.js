function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

function isEmptyArray(obj) {
    if (!obj || !isArray(obj) || obj.length === 0) {
        return true;
    }
    return false
}

function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}

function mustCheck(value, name, msg) {
    if (value === '') {
        msg.push(name + '必须输入!');
        return false;
    }
    return true;
}

function isNumber(val, name, msg) {

    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
        return true;
    } else {
        msg.push(name + '必须是数字!');
        return false;
    }
}

function check_mail(e, msg) {
    if (!/(\S)+[@]{1}(\S)+[.]{1}(\w)+/.test(e)) {
        msg.push("请输入格式正确的邮箱地址！");
        return false;
    }
    return true
}

//度分秒转换成为度
function DegreeConvertNumber(value, name, msg) {
    let returnValue = {}
    if (isNumber(value.trim(), null, [])) {
        returnValue['value'] = value
        returnValue['isError'] = false
        return returnValue;
    }
    let Degree = value.replace(/　/g, ' ').replace(/  /g, ' ').split(' ');
    if (Degree.length > 3) {
        msg.push('请输入正确的' + name + ',必须是数字或由空格分隔的度 分 秒!');
        returnValue['value'] = -1;
        returnValue['isError'] = true
        return returnValue;
    }
    for (let i = 0; i < Degree.length || i < 3; i++) {
        if (i < Degree.length) {
            if (!isNumber(Degree[i], null, [])) {
                msg.push('请输入正确的' + name + ',必须是数字或由空格分隔的度 分 秒!');
                returnValue['value'] = -1;
                returnValue['isError'] = true
                return returnValue;
            }
        } else {
            Degree.push(0);
        }
    }
    returnValue['value'] = Math.abs(Degree[0]) + (Math.abs(Degree[1]) / 60 + Math.abs(Degree[2]) / 3600)
    returnValue['isError'] = false
    return returnValue;

}

function confirmC(msg, title, okfun, canfun) {
    let ret = false
    $.confirm({
        title: title,
        content: msg,
        escapeKey: "cancel",
        buttons: {
            confirmYes: {
                text: '确认',
                btnClass: 'btn-blue',
                action: okfun
            },
            cancelNo: {
                text: '取消',
                btnClass: 'btn-blue',
                keys: ['escape'],
                action: canfun
            }
        }
    });
}

function alertC(msg, title, okfun) {
    $.alert({
        title: title,
        content: msg,
        buttons: {
            confirmYes: {
                text: '确认',
                btnClass: 'btn-blue',
                action: okfun
            }
        }
    });

}

function toasrIni() {
    toastr.options = {
        closeButton: true,
        timeOut: "5000",
        extendedTimeOut: "5000"
    };
}

function msgClear() {
    toastr.clear();
    toasrIni()
}

function getViewMsg(msg) {
    return isArray(msg) && msg.length > 1 ? '● ' + msg.join('<br/> ● ') : msg;
}

function warning(msg) {
    msgClear()
    toastr.warning(getViewMsg(msg));

}

function error(msg) {
    msgClear()
    toastr.error(getViewMsg(msg));
}

function info(msg) {
    msgClear()
    toastr.info(getViewMsg(msg));
}

//不分页制定高度的表，Bootstrap的高度计算有问题，
// 需要在头部渲染完成后（最后一个渲染头部）再计算一次
function bootstrapTableHeightReCal(tableId, height) {
    let container = $('#' + tableId).parents(".fixed-table-container");
    let body = $('#' + tableId).parent(".fixed-table-body");
    let totalH = 0;
    let hExpBody = 0;

    container.children().each(function () {
        totalH += $(this).height();
        if (!$(this).is(body)) {
            hExpBody += $(this).height();
        }
        if (totalH > height) {
            $('#' + tableId).parent().height(height - hExpBody);
        }
    });
}

function showLoadingEchart(divName, height, width) {
    let echart = echarts.getInstanceByDom(document.getElementById(divName));

    echart.showLoading({
        text: '正数据加载中.........',
        color: '#c23531',
        textColor: '#ffffff',
        maskColor: 'rgba(255, 255, 255, 0.1)',
        zlevel: 0
    });
}

function initOrReflashEchart(divName, echarOption, height, width) {
    let echart = echarts.getInstanceByDom(document.getElementById(divName));
    if (!echart) {
        let initOption = {};
        if (height) initOption["height"] = height;
        if (width) initOption["width"] = width;
        echart = echarts.init(document.getElementById(divName), 'macarons', initOption);
    }
    echart.setOption(echarOption);
    echart.resize();
    echart.hideLoading();
}

function clearEchars(divName, height, width) {
    var option = {
        xAxis: {
            data: []
        },
        series: {
            data: []
        }
    };
    initOrReflashEchart(divName, option, height, width);
}

(function ($) {
    $.getUrlParam = function (name) {
        var reg
            = new RegExp("(^|&)" +
            name + "=([^&]*)(&|$)");
        var r
            = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
})(jQuery);

function getCookie(c_name){
    if (document.cookie.length>0){
        c_start=document.cookie.indexOf(c_name + "=");
        if (c_start!=-1){
            c_start=c_start + c_name.length+1;
            c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1){
                c_end=document.cookie.length;
            }

            return unescape(document.cookie.substring(c_start,c_end));
        }
    }

    return "";
}


//grid表中的按钮的权限设定
function doGetGridBtnAuthByTowerId(towerId){
    var authJson = JSON.parse($("#authJson").val());
    //有对象的时候
    if (!isEmptyObject(authJson) && !isEmptyObject(authJson["preData"])) {
        var preData = authJson["preData"]
        var limitAnemometry =preData["limitAnemometry"];
        if(limitAnemometry){
            var towerIdAuth= limitAnemometry[towerId];

            return towerIdAuth;
        }
    }
    return {};
}
