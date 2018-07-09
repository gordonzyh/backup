let isBtnChcek = false;
let initViewDates = 10;
var socket = io.connect($("#socketURL").val());
$(function () {
    initEChars()
    $('#datamanageA').addClass('active')
    //获取测风塔数据
    let towerId = $.cookie("towerId");
    if (towerId) {
        buildMenu(null, {_id: towerId});
    } else {
        buildMenu();
    }

    function refreshCharts() {
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();
        var parmList = $('#chartsTab').children('.active').children('a').attr('value').split('-');
        //一定是原始数据
        var data = {
            towerHeight: parmList[0],
            towerIndex: parmList[1],
            target: parmList[2],
            towerId: $("#towerId").val(),
            startDate: startDate,
            endDate: endDate,
            dataIndex: "0"
        };
        getWindChartsData(data, false);
    }

    $('#startDate').on('change', function () {
        refreshCharts()
    });

    $('#endDate').on('change', function () {
        refreshCharts()
    });

    window.addEventListener('resize', function () {
        initTabs();
    });
});

function buildMenu(searchText, selectQuery) {
    //获取测风塔数据
    $.post('/windTower/towerMenu/getTowerMenuData', {
        isShowAlert: false,
        searchText: searchText,
        towerIdList : $("#towerIdList").val()
    }, function (resultList) {
        //菜单初始化
        $('#menuDiv').menuInit(resultList, {
            onNodeClick: function (data) {
                //关闭之前的连接
                socket.close();
                getGridData(data["_id"]);
                $("#towerId").val(data["_id"]);
                $.cookie("towerId",data["_id"]);
                if(isEmptyObject(JSON.parse($("#authJson").val()))){
                   $("#btnUpd").show();
                }else{
                    $("#btnUpd").hide();
                    var towerIdAuth =doGetGridBtnAuthByTowerId(data["_id"]);
                    if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowI"]){
                        $("#btnUpd").show();
                    }
                }
            },
            searchFun: function (searchText) {
                buildMenu(searchText);
            }
        });
        if (!selectQuery) {
            //选择菜单第一条有警报的测风塔
            $('#menuDiv').selectNode({}, 0);
        } else {
            $('#menuDiv').selectNode(selectQuery, 0);
        }
    });
}

function showCharts(data) {
    let unit = {
        "speed":"m/s",
        "direction":"deg",
        "humidity":"℃",
        "temperature":"%",
        "air_pressure":"kPa"
    }
    $('#unit').text("单位：" + unit[data.target]);
    var updIndex = $('#currentUpdIndex').val();
    socket.close()

    //原始数据的情况
    if (updIndex === '0') {
        var appendData = {
            towerId: $("#towerId").val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            dataIndex: updIndex
        };
        getWindChartsData(Object.assign({}, data, appendData), false);
    } else {
        var appendData = {
            towerId: $("#towerId").val(),
            dataType: "upload",
            dataIndex: updIndex
        };
        getWindChartsData(Object.assign({}, data, appendData), false);
    }
}

function openUpd() {
    $('#upload')[0].reset();
    $('#updStatus').empty();
    $('.fileinput-remove').trigger('click');
    $('#updMemo').removeClass('c-errorBgColor');
    $('#btnUpd,#btnCancel').prop('disabled', '');
    $('#btnCancel').text('取消');
    $('#btnUpd').css("display","inline-block")
    $('#btnCancel').unbind();
    $("#updModal").modal("show");
}

window.operateEvents = {
    'click .setToMainData': function (e, value, row, index) {
        isBtnChcek = true;
        var info = '是否将当前' + row.comment + '数据（' + row.startDate + '~' + row.endDate + '）设定为主数据？';
        confirmC(info, "主数据设定", function () {
            socket.close();
            showWaitting("主数据设定中，请稍候");
            $.get($('#backendMainDataUrl').val() + '?towerId=' + $("#towerId").val() + '&updIndex=' + row.updIndex, function (response,status,xhr) {
                closeWaitting();
                if(response.errorCode){
                    error(getMessage(response.errorCode));
                }else{
                    $('#windTowerTable').bootstrapTable('refresh', {
                        url: '/windTower/dataManage/setToMainData?towerId=' + $("#towerId").val() + '&updIndex=' + row.updIndex,
                        method: "get"
                    });
                }
            });
        });
    }, 'click .delete': function (e, value, row, index) {
        isBtnChcek = true;
        if (row.mainData === '主数据') {
            warning('当前数据为主数据，请重新设定主数据后再删除');
            return;
        } else {
            confirmC('是否删除' + row.comment + '(' + row.startDate + '~' + row.endDate + ')' + '数据？', "主数据删除", function () {
                $.get('/windTower/dataManage/delete?towerId=' + $("#towerId").val() + '&updIndex=' + row.updIndex, function (response,status,xhr) {
                    if(response.errorCode){
                        error(getMessage(response.errorCode));
                    }else{
                        socket.close();
                        $('#windTowerTable').bootstrapTable('refresh', {
                            url: '/windTower/dataManage/getTableData?towerId=' + $("#towerId").val(),
                            method: "get"
                        });
                    }
                });
            });
        }
    }, 'click .download': function (e, value, row, index) {
        isBtnChcek = true;
        var parm = "towerId=" + $("#towerId").val() + '&startDate=' + row.startDate + '&endDate=' + row.endDate + '&dataIndex=' + row.updIndex;
        showWaitting("下载准备中，请稍候");
        $.get('/windTower/dataManage/download?' + parm, function (response,status,xhr) {
            closeWaitting();
            if(response.errorCode){
                error(getMessage(response.errorCode));
            }else{
                window.location.href='/windTower/dataManage/downloadFile?zipName=' +  response.zipName;
            }
        });
    }
};

function getGridData(towerId) {
    $("#windTowerTable").bootstrapTable('destroy').bootstrapTable({
        searching: false,
        pageList: [10, 20, 50, 100],
        pageSize: 10,
        pagination: true,
        columns: columnSetting(towerId),
        sidePagination: "client",
        url: '/windTower/dataManage/getTableData?towerId=' + towerId,
        method: "get",
        rowStyle: function (row, index) {
            //主数据行变粗体
            if (row.mainData === '主数据') {
                return {css: {"font-weight": "bold"}, classes: "row_active"};
            }
            return {};
        },
        onLoadSuccess: function (result) {
            //有数据的话就就显示图标区域
            $('#windSpeedCharts').show();
            result = result.data;
            //记录上传序号
            let i = 0;
            for (i = 0; i < result.length; i++) {
                //只对主数据进行创建图表
                if (result[i]['mainData'] === '主数据') {
                    break;
                }
            }
            i = i === result.length ? 0 : i;
            var data = {
                towerId: towerId,
                startDate: result[i].startDate,
                endDate: result[i].endDate,
                dataIndex: result[i].updIndex
            };
            getWindChartsData(data, true);
            //原始数据的情况
            if (result[i]['updIndex'] === '0') {
                // 原始数据的话日期框可用
                $('#startDateDiv').css('pointer-events', 'auto');
                $('#startDateDiv').children().attr("style", "background-color:  #eee;");
                $('#endDateDiv').css('pointer-events', 'auto');
                $('#endDateDiv').children().attr("style", "background-color: #eee;");
            } else {
                //否则禁用
                $('#startDateDiv').css('pointer-events', 'none');
                $('#startDateDiv').children().attr("style", "background-color:  #a5a5a5;");
                $('#endDateDiv').css('pointer-events', 'none');
                $('#endDateDiv').children().attr("style", "background-color: #a5a5a5;");
            }
            //记录上传序号
            $('#currentUpdIndex').val(result[i]['updIndex']);

            //判断是否有原始数据如果有原数据的时候使用原数据时间设置
            let j = 0;
            let fg;
            for (j = 0; j < result.length; j++) {
                //只对主数据进行创建图表
                if (result[j]['comment'] === '原始数据') {
                    fg = 'true';
                    break;
                }
            }
            j = j === result.length ? 0 : j;
            if (fg) {
                $('#startDate').calendarSetDate(result[j].startDate ? result[j].startDate : '');
                $('#endDate').calendarSetDate(result[j].endDate ? result[j].endDate : '');
            } else {
                $('#startDate').calendarSetDate(result[i].startDate ? result[i].startDate : '');
                $('#endDate').calendarSetDate(result[i].endDate ? result[i].endDate : '');
            }

        },
        onLoadError: function () {
            clearEchars("windSpeedCharts");

            $('#chartsTab').hide();
        },
        onClickRow: function (row, element) {
            if (isBtnChcek) {
                isBtnChcek = false;
                return;
            }
            socket.close()
            //记录上传序号
            $('#currentUpdIndex').val(row['updIndex']);

            if (row['updIndex'] === '0') {
                // 原始数据的话日期框可用
                $('#startDateDiv').css('pointer-events', 'auto');
                $('#startDateDiv').children().attr("style", "background-color:  #eee;");
                $('#endDateDiv').css('pointer-events', 'auto');
                $('#endDateDiv').children().attr("style", "background-color:  #eee;");
            } else {
                $('#startDateDiv').css('pointer-events', 'none');
                $('#startDateDiv').children().attr("style", "background-color:  #a5a5a5;");
                $('#endDateDiv').css('pointer-events', 'none');
                $('#endDateDiv').children().attr("style", "background-color:  #a5a5a5;");
            }

            var data = {}
            //原始数据的情况
            if (row.updIndex === "0") {
                data = {
                    towerId: towerId,
                    startDate: $('#startDate').val(),
                    endDate: $('#endDate').val(),
                    dataIndex: row.updIndex
                };
                getWindChartsData(data, true);
            } else {
                data = {
                    towerId: towerId,
                    dataIndex: row.updIndex
                };
                getWindChartsData(data, true);
            }
            $("#windTowerTable").find('.row_active').removeClass('row_active');
            element.addClass('row_active');
            $('#chartsTab li').removeClass('active');
            $('#chartsTab li:first-child').addClass('active');
        }
    });

}

var req = [];

function initEChars() {
    //没数据就隐藏图表区域
    // $('#windSpeedCharts').hide();
    var option = {
        grid: {
            left: "35px",
            top: "3.5%",
            height: "67%",
            width: "95%"
        },
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                saveAsImage: {
                    pixelRatio: 2
                }
            },
            iconStyle: {
                borderColor: "white",
                borderWidth: 2,
                shadowColor: 'black',
                shadowBlur: 10
            }
        },
        xAxis: {
            axisLabel: {
                show: true,
                formatter: function (params) {
                    return params.replace(" ", "\n")
                }
            },
            data: []
        },
        dataZoom: [
            {
                startValue: 0,
                endValue: initViewDates * 144
            },
            {
                type: 'inside'
            }
        ],
        yAxis: {
            axisLabel: {show: true},
            splitLine: {
                show: false
            }
        },
        series: {
            type: 'line',
            showSymbol: false,
            data: []
        }
    };
    initOrReflashEchart("windSpeedCharts", option);
}

function appendDataToEchar(resultData) {
    let echart = echarts.getInstanceByDom(document.getElementById("windSpeedCharts"));
    let newOption = echart.getOption();
    let oldData = newOption.series[0].data;
    let oldXAisData = newOption.xAxis[0].data;
    $('#chartsTab').show();
    if (!resultData) {
        if (oldData.length === 0) {
            clearEchars("windSpeedCharts");
            $('#chartsTab').hide();
        }
    } else {
        let data = resultData.chartData;
        if (oldData.length === 0) {
            if (data.length < resultData.allcount) {
                let backDataCount = (resultData.allcount - data.length);
                let addData = [];
                for (let i = 0; i < backDataCount; i++) {
                    addData.push(["loading", 0])
                }
                Array.prototype.push.apply(data, addData);
            }
            showEchart(data, resultData.setTabFlg, resultData.tabs);
        } else {
            let startIndex = $.inArray('loading', oldXAisData);

            for (let i = 0; i < data.length; i++) {
                oldXAisData[startIndex + i] = data[i][0];
                oldData[startIndex + i] = data[i][1];
            }
            newOption.xAxis[0].data = oldXAisData;
            newOption.series[0].data = oldData;
            echart.setOption(newOption);
        }
    }
}

function showEchart(data, setTabFlg, tabs) {
    var option = {
        xAxis: {
            data: data.map(function (item) {
                return item[0];
            })
        },
        series: {
            data: data.map(function (item) {
                return item[1];
            })
        },
        dataZoom: [
            {
                startValue: 0,
                endValue: initViewDates * 144
            },
            {
                type: 'inside'
            }
        ],
    };
    initOrReflashEchart("windSpeedCharts", option);

    if (setTabFlg) {
        $('#chartsTab').empty();
        $('#chartsTab').append(createTemp('speed', tabs.speed));
        $('#chartsTab').append(createTemp('direction', tabs.direction));
        $('#chartsTab').append(createTemp('humidity', tabs.humidity));
        $('#chartsTab').append(createTemp('temperature', tabs.temperature));
        $('#chartsTab').append(createTemp('air_pressure', tabs.air_pressure));
        $('#chartsTab li:first-child').addClass('active');
        initTabs();
    }
}

socket.on("onEchartDataGet", function (data) {
    appendDataToEchar(data);
});

function getWindChartsData(data, setTabFlg) {
    //重开连接
    socket.open();
    clearEchars("windSpeedCharts");
    showLoadingEchart("windSpeedCharts");
    data['limit'] = initViewDates;
    data['offset'] = 0;
    data['setTabFlg'] = setTabFlg;
    socket.emit("dataManage/getWindSpeedChart", data);
}

function createTemp(target, heightList) {
    var tabTemps = '';
    if (isEmptyArray(heightList)) {
        return;
    }
    let towerIndex = 1;
    for (let k = 0; k < heightList.length; k++) {
        var cn = '';
        if (target === 'speed') {
            cn = '风速';
        } else if (target === 'direction') {
            cn = '风向';
        } else if (target === 'humidity') {
            cn = '温度';
        } else if (target === 'temperature') {
            cn = '湿度';
        } else if (target === 'air_pressure') {
            cn = '气压';
        }
        var nowObj = heightList[k];
        var nextObj = heightList[k + 1];
        nextObj = nextObj === undefined ? {} : nextObj;
        if (towerIndex > 1 || nowObj.height === nextObj.height) {
            cn = cn + "(" + towerIndex + ")";
            towerIndex = towerIndex + 1;
        }
        if (nowObj.height !== nextObj.height) {
            towerIndex = 1;
        }

        tabTemps += $('#tabTemp').text().replace(/{towerHeightLabel}/g, ((nowObj.height === "0" || !nowObj.height) ? "" : nowObj.height + "米"))
            .replace(/{towerHeight}/g, nowObj.height)
            .replace(/{towerIndex}/g, nowObj.index)
            .replace(/{target}/g, target)
            .replace(/{target2}/g, target)
            .replace(/{targetCN}/g, cn);
    }
    return tabTemps;
}

function columnSetting(towerId) {
    return [{
        title: "数据备注",
        field: "comment",
        width: "12%"
    },
        {
            title: "开始日期",
            field: "startDate",
            width: "12%",
            class: "tableDate"
        },
        {
            title: "结束日期",
            field: "endDate",
            width: "12%",
            class: "tableDate"
        },
        {
            title: "来源",
            field: "from",
            width: "12%",
            class: "tableText"
        },
        {
            title: "主数据",
            field: "mainData",
            width: "12%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var  btnStr = '<button class="setToMainData btn btn-reset btnCss3" >设为主数据</button>';
                var  spanStr ='<span class="rowEdit">主数据</span>';
                var resStr =spanStr;
               if( row.mainData !== '主数据'){
                   if(isEmptyObject(JSON.parse($("#authJson").val()))){
                       return btnStr;
                   }
                   var towerIdAuth =doGetGridBtnAuthByTowerId(row.towerId);
                   if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowU"]){
                       resStr=btnStr;
                   }else{
                       resStr="";
                   }
               }
                return resStr;
            }
        },
        {
            title: "操作",
            field: "towerId",
            width: "12%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var download ='<a class="download btn btn-reset btnCss3"  href="javascript:void(0);">下载</a>' ;
                var del ='<a class="delete btn btn-delete btnCss3" href="javascript:void(0);"style="visibility: ' + (row.updIndex === '0' ? 'hidden' : 'visable') + '">删除</a>';
                var resStr="";
                if(isEmptyObject(JSON.parse($("#authJson").val()))){
                    return  download+del;
                }
                var towerIdAuth =doGetGridBtnAuthByTowerId(towerId);
                if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowO"]){
                    resStr=resStr+download;
                }
                if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowD"]){
                    resStr=resStr+del;
                }
                return resStr;
            }
        },
        {
            title: "序号",
            field: "updInex",
            width: "12%",
            visible: false
        }];
}

function initTabs() {
    //移除之前注册的事件和偏移量
    $('.tab-left').unbind();
    $('.tab-right').unbind();
    document.getElementById('chartsTab').style.cssText = '';

    var tabAreaWidth = $('#tabArea').width();
    var ulWidth = 0;
    var offsetLeft = 0;
    var offsetRight = 0;
    var step = 80;
    var interval;

    $('#chartsTab li').each(function () {
        ulWidth += $(this).width();
    });
    $('#chartsTab').width(ulWidth + 5000);

    function offsetToRight() {
        if (offsetRight <= ulWidth - tabAreaWidth) {
            $("#chartsTab").offset({left: $("#chartsTab").offset().left - step});
            offsetRight += step;
            offsetLeft -= step;
        }
    }

    function offsetToLeft() {
        if (offsetLeft !== 0) {
            $("#chartsTab").offset({left: $("#chartsTab").offset().left + step});
            offsetLeft += step;
            offsetRight -= step;
        }
    }

    //左偏移事件
    $('.tab-left').on('click', function () {
        offsetToLeft();
    }).on('mousedown', function () {
        interval = setInterval(offsetToLeft, '80');
    }).on('mouseup', function () {
        clearInterval(interval);
    });

    //右偏移事件
    $('.tab-right').on('click', function () {
        offsetToRight();
    }).on('mousedown', function () {
        interval = setInterval(offsetToRight, '80');
    }).on('mouseup', function () {
        clearInterval(interval);
    });
}
