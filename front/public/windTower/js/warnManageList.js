$(function () {

    //获取测风塔数据
    buildMenu();
    $('#warnManageA').addClass('active');


    let errorList = getSubJson("autoUploadError");

    $('#selectEvent.selectpicker').append(
        "<option value=''></option>");
    for (let key in errorList) {
        $('#selectEvent.selectpicker').append(
            "<option value='" + key + "'>" + errorList[key] + "</option>");
    }
    $('#selectEvent').selectpicker('refresh');
});

$("#selectEvent").change(function (e) {
    if ($("#selectEvent").val()) {
        var selectedData = $('#menuDiv').getSelectedData();
        if (selectedData !== null) {
            serach = {
                towerId: selectedData["_id"],
                alarmDelayDays: selectedData["alarmDelayDays"],
                errorCode: $("#selectEvent").val()
            };
            $("#windTowerTable").bootstrapTable('refresh', {
                silent: true,
                pageNumber: 1,
                query: serach
            });
        }
    } else {
        $("#windTowerTable").bootstrapTable('filterBy', {})
    }
});

function buildMenu(searchText, selectId) {
    //获取测风塔数据
    $.post('/windTower/towerMenu/getTowerMenuData', {
        isShowAlert: true,
        searchText: searchText,
        towerIdList: $("#towerIdList").val()
    }, function (resultList) {
        //菜单初始化
        $('#menuDiv').menuInit(resultList, {
            onNodeClick: function (data) {
                $('#currentTowerName').val(data["text"]);
                let alarmDelayDays = data["alarmDelayDays"];
                getGridData(data["_id"], alarmDelayDays);
                getFixAreaData(data["_id"]);
                if(isEmptyObject(JSON.parse($("#authJson").val()))){
                    $("#batch").show();
                }else{
                    $("#batch").hide();
                    var towerIdAuth =doGetGridBtnAuthByTowerId(data["_id"]);
                    if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowI"]){
                        $("#batch").show();
                    }
                }
            },
            searchFun: function (searchText) {
                buildMenu(searchText);
            }
        });
        if (selectId) {
            $('#menuDiv').selectNode({_id: selectId}, 0);
        } else {
            //选择菜单第一条有警报的测风塔
            $('#menuDiv').selectNode({alertNumber: true}, 0);
        }

    });
}

$(window).on('resize', function () {
    reLocale()
})

$("#article").scroll(function () {
    reLocale()
});

function reLocale() {
    if ($('#filter').length>0) {
        //定位事件筛选框
        $('#divEvent').css({
            "position": "fixed",
            "left": ($('#filter').offset().left - 37) + "px",
            "top": ($('#filter').offset().top - 7) + "px",
            "display": "block"
        })
    }else{
        $('#divEvent').css({
            "display": "none"
        })

    }
}

function openProcess(row) {
    if (row.length <= 0) {
        return warning('请至少选择一行数据');
    }
    $('#currentTowerId').val(row.towerId);
    $('#upload')[0].reset();
    $('#processMemo2').val('');
    $('#updStatus').empty();
    $('#processMemo2').removeClass('c-errorBgColor');
    $('#btnUpd').css("display","inline-block")

    //添加模态框中的待处理日期
    var $waitProcess = $('#waitProcess');
    $waitProcess.empty();
    //如果是多选就循环添加
    if (row instanceof Array) {
        //定义一个记录选中日期的list后最后赋给hide标签（去重）
        var dateList = [];
        for (var i = 0; i < row.length; i++) {
            $waitProcess.append('<span id="' + row[i]._id + '" class="text-left" data-date="'
                + row[i].receive_date + '" style="width:100%;padding-left:6px">' + row[i].receive_date + '</span>');
            if ($.inArray(row[i].receive_date, dateList) < 0) {
                dateList.push(row[i].receive_date);
            }
        }
        $('#dateList').val(dateList.toString());
    } else {
        $waitProcess.append('<span id="' + row._id + '" class="text-left" data-date="'
            + row.receive_date + '" style="width:100%;padding-left:6px">' + row.receive_date + '</span>');
        $('#dateList').val(row.receive_date);
    }

    //显示模态框
    $('#btnUpd,#btnProcessCancel').prop('disabled', '');
    $('#btnProcessCancel').text('取消');
    $('#btnProcessCancel').unbind();
    $('#processModal').modal('show');

    //默认显示第一个Tab
    $('#warnProcessTabs li:first-of-type a').trigger('click');
}

window.operateEvents = {
    'click .look': function (e, value, row, index) {
        doView(row, $('#currentTowerName').val());
    }, 'click .process': function (e, value, row, index) {
        openProcess(row);
    }
};

function getGridData(towerId, alarmDelayDays) {
    $("#windTowerTable").bootstrapTable('destroy').bootstrapTable({
        searching: false,
        toolbar: '#batch',
        pageList: [10, 20, 50, 100],
        pageSize: 10,
        pagination: true,
        columns: columnSetting(),
        sidePagination: "server",
        url: '/windTower/warnManage/getWarnTableData',
        queryParams: function (params) {
            params["towerId"] = towerId;
            params["alarmDelayDays"] = alarmDelayDays;
            return params;
        },
        method: "post",
        onLoadSuccess: function (result) {
            var msgJson = getSubJson('errorType');
            let i = 0;
            for (i = 0; i < result.rows.length; i++) {
                let errorCode = result.rows[i].error_code;
                let errorMsg = "";
                if (errorCode === "ERR007") {
                    errorMsg = getMessage(errorCode);
                    let subErrorCodeList = result.rows[i].errorInfo === undefined ? [] : result.rows[i].errorInfo;
                    let subErrorMsg = "";
                    let j = 0;
                    for (j = 0; j < subErrorCodeList.length; j++) {
                        var subErrorCode = subErrorCodeList[j].errorType;
                        subErrorMsg = subErrorMsg + subErrorCodeList[j].errorHeight + "米" + msgJson[subErrorCode] + ",";
                    }
                    errorMsg = errorMsg.replace(new RegExp("\\{" + 0 + "\\}", "g"), subErrorMsg.substring(0, subErrorMsg.length - 1));
                } else {
                    errorMsg = getMessage(errorCode);
                }
                result.rows[i]["error_event"] = errorMsg;
            }
            $("#windTowerTable").bootstrapTable("load", result);

        },
        rowStyle: function (row, index) {
            //无效行变粗体
            if (row.effective_flg === '1') {
                return {css: {"font-weight": "bold"}};
            } else {
                return {css: {"color": " rgba(181, 181, 181, 1)"}};

            }
        },
    });
    $("input[name='btSelectAll']").after(' 全选');

    //定位事件筛选框
    reLocale();

    $('#divEvent').find('button,div.form-control').css({
        "background": "transparent",
        "border": "0px",
        "color": "white",
        "box-shadow": "inset 0 0px 0px rgba(0, 0, 0, 0)"
    });
    $('#divEvent').find('.caret').removeClass('caret').addClass('fa fa-filter');

    $('#batch').on('click', function () {
        openProcess($('#windTowerTable').bootstrapTable('getSelections'));
    });
}


function columnSetting() {
    return [
        {

            title: "全选",
            field: "checked",
            showSelectTitle: true,
            clickToSelect: true,
            checkbox: true,
            width: "20%"
        },
        {
            title: "日期",
            field: "receive_date",
            width: "15%",
            class: "tableDate"
        },
        {
            title: "测风塔",
            field: "windTower",
            width: "20%",
            formatter: function () {
                return $('#currentTowerName').val();
            },
            class: "tableText"
        },
        {
            title: '事件<div id="filter" style="float: right"></div>',
            field: "error_event",
            width: "30%",
            searchable: true,
            class: "tableText"
        },
        {
            title: "操作",
            field: "_id",
            width: "15%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var look = '<a class="look btn btn-check btnCss3" onclick="isBtnChcek=true;" href="javascript:void(0);" style="visibility: ' + (row.dataCount === 0 ? 'hidden' : 'visable') + '" >查看</a>';
                var process = '<a class="process btn btn-reset btnCss3" href="javascript:void(0);">处理</a>';
                var resStr = look;
                if(isEmptyObject(JSON.parse($("#authJson").val()))){
                    return resStr + process;
                }
                var towerIdAuth = doGetGridBtnAuthByTowerId(row.towerId);
                if (!isEmptyObject(towerIdAuth) && towerIdAuth["allowI"]) {
                    resStr = resStr + process;
                }
                return resStr;

            }
        }, {
            title: "事件code",
            field: "error_code",
            visible: false
        }, {
            title: "塔id",
            field: "towerId",
            visible: false
        }];
}

//获取处理履历表
function getFixAreaData(towerId) {
    $("#fixAreaTable").bootstrapTable('destroy').bootstrapTable({
        search: true,
        searchOnEnterKey: true,
        toolbar: '#fixAreaTableTitle',
        pageList: [5, 10, 15],
        pageSize: 5,
        pagination: true,
        columns: fixAreaClumnSetting(),
        sidePagination: "server",
        url: '/windTower/warnManage/getFixAreaTableData',
        queryParams: function (params) {
            params["towerId"] = towerId;
            return params;
        },
        method: "post"

    });
}

function fixAreaClumnSetting() {
    return [
        {
            title: "处理时间",
            field: "fix_date",
            width: "15%",
            sortable: true,
            class: "tableDate"
        },
        {
            title: "创建者",
            field: "create_user",
            width: "10%",
            sortable: true,
            class: "tableText"
        },
        {
            title: '被处理日期',
            field: "do_fix_date",
            width: "10%",
            sortable: true,
            class: "tableDate"
        },
        {
            title: '处理方式',
            field: "fix_method",
            width: "15%",
            sortable: true,
            class: "tableOption"
        }
        ,
        {
            title: '处理备注',
            field: "fix_memo",
            width: "50%",
            class: "tableText"
        }];
}
