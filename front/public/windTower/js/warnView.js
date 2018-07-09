/**
 * Created by Administrator on 2015/11/17.
 */
var chartDatas = [];
initEChars();

function doView(rowData, towerName) {
    $('#myModalLabel').text("测风塔: " + towerName);
    $('#dataTime').calendarSetDate(rowData.receive_date);
    let query = {_id: rowData._id};
    showFrom(query);
}

function initEChars() {
    //没数据就隐藏图表区域
    // $('#windSpeedCharts').hide();
    var option = {
        grid: {
            left: "30px",
            top: "3.5%",
            height: "70%",
            width: "95%"
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [
            {
                axisLabel: {
                    show: true,
                    formatter: function (params) {
                        return params.replace(" ", "\n")
                    }
                },
                data: []
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
    setEchart(option);
}

$("#dataTime").on("change", function () {
    let query = {
        towerId: $('#towerId').val(),
        receive_date: $('#dataTime').val()
    };
    showFrom(query);
});

function showFrom(query) {
    let columns = [];
    clearEchars("windSpeedCharts");
    showLoadingEchart("windSpeedCharts");
    $.ajax({
        url: "/windTower/warnView/getData",
        data: query,
        method: "post",
        success: function (result) {
            result["towerId"] ? $('#towerId').val(result["towerId"]) : '';
            if (!isEmptyArray(result["titles"])) {
                for (let i = 0; i < result["titles"].length; i++) {
                    let titleSet = result["titles"][i];
                    let col = {
                        field: "col" + i,
                        cellStyle: function (value, row, index, field) {
                            let rtnCss = {"white-space": "nowrap"};
                            if (row[field + 'Flg'] === 'ng') {
                                rtnCss["background"] = "rgb(232, 73, 101)";
                            }
                            return {css: rtnCss}
                        }
                    };
                    if (!titleSet["islink"]) {
                        col["title"] = titleSet["title"];
                        col["class"] = "tableDate";

                    } else {
                        col["title"] = "<a href='javascript:void(0)' onclick='titleClick(" + +i + ",\"" + titleSet["title"] + "\");'>" + titleSet["title"] + "</a>";
                        col["class"] = "tableNumber";
                    }
                    columns.push(col);
                }
                $("#dataTable").bootstrapTable('destroy').bootstrapTable({
                    searching: false,
                    pagination: false,
                    columns: columns,
                    sidePagination: "server",
                    data: result["datas"],
                    height: 200,
                    //不分页制定高度的表，Bootstrap的高度计算有问题，
                    // 需要在头部渲染完成后（最后一个渲染头部）再计算一次
                    onPostHeader: function () {
                        bootstrapTableHeightReCal("dataTable", 200);
                    }
                });
                chartDatas = result["chartData"];
                $("#warnViewModel").modal("show");
                getWindChartsData(chartDatas[1])
                $('#tragetName').text(result["titles"][1]["title"]);


            } else {
                $("#dataTable").bootstrapTable('destroy').bootstrapTable({
                    columns: [],
                    data: [],
                });
                clearEchars("windSpeedCharts");
            }
        },
        error: function (result) {
            error("测风塔数据读取错误，请再试一次，如果仍然存在问题，请联系管理员！");
        }

    });
}

function getWindChartsData(data) {
    setEchart({
        xAxis: [
            {
                data: data.map(function (item) {
                    return item[0];
                })
            }
        ],
        series: {
            data: data.map(function (item) {
                return item[1];
            })
        }
    });
}

function setEchart(option) {
    initOrReflashEchart("windSpeedCharts", option, 200, 960)
}

function titleClick(index, name) {
    getWindChartsData(chartDatas[index]);
    $('#tragetName').text(name);
}
