$(document).ready(function () {
    $('#AuthoryA').addClass('active')

    //menu初期化
    buildMenu();

    let data = [
        {
            text: "测风塔管理系统",
            nodes: [
                {
                    text: "地图展示",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 1,
                        },
                        {
                            text: "添加",
                            alertNumber: 3,
                        }
                    ]
                },
            ]
        },
        {
            text: "数据管理",

        }, {
            text: "数据管理1",
            nodes: [
                {
                    text: "上传",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 13,
                        }
                    ]
                },
                {
                    text: "上传1",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 1,
                        }
                    ]
                },
            ]
        },
        {
            text: "数据管理1",
            nodes: [
                {
                    text: "上传",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 13,
                        }
                    ]
                },
                {
                    text: "上传1",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 1,
                        }
                    ]
                },
            ]
        },
        {
            text: "数据管理1",
            nodes: [
                {
                    text: "上传",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 13,
                        }
                    ]
                },
                {
                    text: "上传1",
                    nodes: [
                        {
                            text: "详情",
                            alertNumber: 2,
                        },
                        {
                            text: "添加",
                            alertNumber: 1,
                        }
                    ]
                },
            ]
        },
    ];
    buildCheckBoxTree($("#treeDiv"), data)
    $('#treeDiv').hide()

    $("#windTowerTable").bootstrapTable({
        searching: false,
        pagination: false,
        columns: columnSetting(),
        sidePagination: "server",
        url: "/windTower/userRuleSet/getProjectsData",
        method: "post",
        detailView: true,
        onExpandRow: function (index, row, dom) {
            dom.css('padding', '0');
            var cur_table = dom.append('<table class=" table-bordered table-striped table-condensed"></table>').find('table');
            var data = JSON.parse(row.subTableData)
            $(cur_table).bootstrapTable({
                // url: '/windTower/userRuleSet/getTowerData',
                // method: 'post',
                // queryParams: {projectUid: row.projectUid},
                data: data,
                clickToSelect: true,
                uniqueId: "MENU_ID",
                showHeader: false,
                pageSize: 10,
                pageList: [10, 25],
                columns: [{
                    field: "tower",
                    width: "60.7%"
                }, {
                    field: "update",
                    width: "9.9%",
                    events: operateEvents,
                    formatter: function (value, currentRow, index) {
                        var setValue = value === true ? 'checked' : '';
                        return '<div type="checkbox"><input class="update_' + row.projectUid + '" data-index=' + index + ' data-tower=' + currentRow.tower + ' name="btUpdateSelectItem"' +
                            ' type="checkbox" onchange="checkSubItem(this)"' + setValue + '></div>'
                    }
                }, {
                    field: "view",
                    width: "9.8%",
                    events: operateEvents,
                    formatter: function (value, currentRow, index) {
                        var setValue = value === true ? 'checked' : '';
                        return '<div type="checkbox"><input class="view_' + row.projectUid + '" data-index=' + index + ' data-tower=' + currentRow.tower + ' name="btViewSelectItem"' +
                            ' type="checkbox" onchange="checkSubItem(this)"' + setValue + '></div>'
                    }
                }, {
                    field: "upload",
                    width: "9.9%",
                    events: operateEvents,
                    formatter: function (value, currentRow, index) {
                        var setValue = value === true ? 'checked' : '';
                        return '<div type="checkbox"><input class="upload_' + row.projectUid + '" data-index=' + index + ' data-tower=' + currentRow.tower + ' name="btUploadSelectItem"' +
                            ' type="checkbox" onchange="checkSubItem(this)"' + setValue + '></div>'
                    }
                }, {
                    field: "download",
                    width: "9.9%",
                    events: operateEvents,
                    formatter: function (value, currentRow, index) {
                        var setValue = value === true ? 'checked' : '';
                        return '<div type="checkbox"><input class="download_' + row.projectUid + '" data-index=' + index + ' data-tower=' + currentRow.tower + ' name="btDownloadSelectItem"' +
                            ' type="checkbox" onchange="checkSubItem(this)"' + setValue + '></div>'
                    }
                }],
                onPostBody: function () {
                    $('.table .table').css('background-color', 'transparent');
                }
            });
        },
        height: 280,
        //不分页制定高度的表，Bootstrap的高度计算有问题，
        // 需要在头部渲染完成后（最后一个渲染头部）再计算一次
        onPostHeader: function () {
            bootstrapTableHeightReCal("windTowerTable", 300);
        },
        onLoadSuccess: function (result) {
            $('.fixed-table-body').eq(0).css('overflow-y', 'scroll');
            var nowData = result.data;
            var uid = $('#menuDiv').getSelectedData().uid;
            //刷新表格数据
            refreshGridData(nowData, uid);
        }
    });

    $(window).resize(function () {
        $("#windTowerTable").bootstrapTable('resetView');

    });
});

function menuClick(data) {
    $("#userName").val(data.username);
    $("#nickName").val(data.nickname);
    $('#effDate').calendarSetDate(data.effDate);

    if ($("#windTowerTable").bootstrapTable('getOptions').data.length > 0) {
        var nowData = $("#windTowerTable").bootstrapTable('getOptions').data;
        var uid = $('#menuDiv').getSelectedData().uid;
        //刷新表格数据
        refreshGridData(nowData, uid);
    }

};

//刷新表格数据
function refreshGridData(nowData, uid) {

    $.get('/windTower/userRuleSet/getAllowedAnemometry', {
        uid: uid
    }, function (resultList) {
        //表初期化
        nowData[0].view = true
        var subTableData = JSON.parse(nowData[0].subTableData);
        for (subRow in subTableData) {
            subTableData[subRow].view = true;
        }
        var subTableDataStr = JSON.stringify(subTableData);
        nowData[0].subTableData = subTableDataStr;

        $("#windTowerTable").bootstrapTable('load', nowData);
    })

}

function buildMenu(searchText, selectId) {
    //获取测风塔数据
    $.post('/windTower/userRuleSet/getUsersMenuData', {
        isShowAlert: false,
        searchText: searchText
    }, function (resultList) {
        //菜单初始化
        $('#menuDiv').menuInit(resultList.data, {
            onNodeClick: menuClick,
            searchFun: function (searchText) {
                buildMenu(searchText);
            }
        });
        if (selectId) {
            $('#menuDiv').selectNode({_id: selectId}, 0);
        } else {
            //选择菜单第一条有警报的测风塔
            $('#menuDiv').selectNode({}, 0);
        }
    });
}

/*
    列设定
*/
function columnSetting() {
    return [
        {
            title: "项目名称",
            field: "projectName",
            width: "60%",
            class: "tableText"
        },
        {
            title: '<input id ="btUpdateSelectAll" type="checkbox" forClass="update"' +
            ' onchange="checkAll(this)">' +
            ' <label for="btUpdateSelectAll"> 修正</label>',
            field: "update",
            width: "10%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var setValue = value === true ? 'checked' : '';
                return '<div type="checkbox"><input id="update_' + row.projectUid + '" class="update" data-index=' + index + ' name="btUpdateSelectItem"' +
                    ' type="checkbox"  onchange="checkAll(this)"' + setValue + ' forClass="update_' + row.projectUid + '"></div>'
            }
        },
        {
            title: '<input id="btViewSelectAll" type="checkbox" forClass="view"' +
            ' onchange="checkAll(this)">' +
            '<label for="btViewSelectAll"> 查看</label>',
            field: "view",
            width: "10%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var setValue = value === true ? 'checked' : '';
                return '<div type="checkbox"><input id="view_' + row.projectUid + '" class="view" data-index=' + index + ' name="btViewSelectItem"' +
                    ' type="checkbox" onchange="checkAll(this)"' + setValue + ' forClass="view_' + row.projectUid + '"></div>'
            }
        },
        {
            title: '<input id="btUploadSelectAll" type="checkbox" forClass="upload"' +
            ' onchange="checkAll(this)">' +
            '<label for="btUploadSelectAll">  上传</label>',
            field: "upload",
            events: operateEvents,
            width: "10%",
            formatter: function (value, row, index) {
                var setValue = value === true ? 'checked' : '';
                return '<div type="checkbox"><input id="upload_' + row.projectUid + '" class="upload" data-index=' + index + ' name="btUploadSelectItem"' +
                    ' type="checkbox" onchange="checkAll(this)"' + setValue + ' forClass="upload_' + row.projectUid + '"></div>'
            }
        },
        {
            title: '<input id="btDownloadSelectAll" type="checkbox" forClass="download"' +
            ' onchange="checkAll(this)">' +
            '<label for="btDownloadSelectAll">  下载</label>',
            field: "download",
            width: "10%",
            events: operateEvents,
            formatter: function (value, row, index) {
                var setValue = value === true ? 'checked' : '';
                return '<div type="checkbox"><input id="download_' + row.projectUid + '" class="download" data-index=' + index + ' name="btdownloadSelectItem"' +
                    ' type="checkbox" onchange="checkAll(this)" ' + setValue + ' forClass="download_' + row.projectUid + '"></div>'
            }
        }, {
            title: '项目id',
            field: 'projectUid',
            visible: false
        }
        , {
            title: '子表数据',
            field: 'subTableData',
            visible: false
        }
    ];
}

window.operateEvents = {
    'change [name*=SelectItem]:checkbox': function (e, value, row, index) {
        row[this.className] = this.checked;
        if ($('.' + this.className + ':not(:checked)').length === 0) {
            $('input[forClass=' + this.className + ']').prop('checked', true);

            if ($('input[id^="' + this.className.split('_')[0] + '"]:not(:checked)').length === 0) {
                $('input[forClass=' + this.className.split('_')[0] + ']').prop('checked', true);
            }
        } else {
            $('input[forClass=' + this.className + ']').prop('checked', false);
            $('input[forClass=' + this.className.split('_')[0] + ']').prop('checked', false);
        }
    }, 'click div[type=checkbox]': function (e, value, row, index) {
        $(this).children().click();
    }
    , 'click input[type=checkbox]': function (e, value, row, index) {
        $(this).click();
    }
};


function checkSubItem(_this) {
    let tower = $(_this).attr('data-tower');
    let type = $(_this).attr('class').split('_')[0];
    let projectUid = $(_this).attr('class').split('_')[1];
    let dataList = $('#windTowerTable').bootstrapTable('getData')
    let data;
    for (let subRow in dataList) {
        let rowProjectUid = dataList[subRow]["projectUid"];
        if (projectUid === rowProjectUid) {
            data = dataList[subRow];
            break;
        }
    }
    if (data) {
        updateRowSubTableDataSub(data, tower, type);
    }
}

function updateRowSubTableDataSub(nowRowData, tower, setType) {
    let subTableData = JSON.parse(nowRowData.subTableData);
    for (let subRow in subTableData) {
        let towerSelect = subTableData[subRow]["tower"];
        if (towerSelect !== tower) {
            continue;
        }
        let nowSubBoolean = subTableData[subRow][setType];
        if (nowSubBoolean) {
            subTableData[subRow][setType] = false;
        } else {
            subTableData[subRow][setType] = true;
        }
    }
    let subTableDataStr = JSON.stringify(subTableData);
    nowRowData.subTableData = subTableDataStr;
}


function checkAll(_this) {
    if (_this.checked) {
        $('.' + $(_this).attr('forClass') + ':not(:checked)').click();
        let index = $(_this).attr('data-index');
        if (index) {
            updateRowSubTableDataSelectAll($('#windTowerTable').bootstrapTable('getData')[index], $(_this).attr('class'), true);
        } else {
            let dataList = $('#windTowerTable').bootstrapTable('getData');
            for (let i = 0; i < dataList.length; i++) {
                updateRowSubTableDataSelectAll($('#windTowerTable').bootstrapTable('getData')[i], $(_this).attr('class'), true);
            }
        }
    } else {
        $('.' + $(_this).attr('forClass') + ':checked').click();
        let index = $(_this).attr('data-index');
        if (index) {
            updateRowSubTableDataSelectAll($('#windTowerTable').bootstrapTable('getData')[index], $(_this).attr('class'),false);
        } else {
            let dataList = $('#windTowerTable').bootstrapTable('getData');
            for (let i = 0; i < dataList.length; i++) {
                updateRowSubTableDataSelectAll($('#windTowerTable').bootstrapTable('getData')[i], $(_this).attr('class'),false);
            }
        }
    }

}

function updateRowSubTableDataSelectAll(nowRowData, setType, setValue) {
    nowRowData["setType"] = setValue;
    let subTableData = JSON.parse(nowRowData.subTableData);
    for (let subRow in subTableData) {
            subTableData[subRow][setType] = setValue;
    }
    let subTableDataStr = JSON.stringify(subTableData);
    nowRowData.subTableData = subTableDataStr;
}
