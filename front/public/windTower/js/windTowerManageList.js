/**
 * Created by Administrator on 2015/11/17.
 */
/**
 * Created by Administrator on 2015/11/17.
 */
let serach = {};
window.operateEvents = {
    'click .rowEdit': function (e, value, row, index) {
      var hasDel= $(e.target).attr("hasDel");
        doEdit(value ,hasDel);
    }
};

$("#btnAdd").on('click', function () {
    doAdd();
});


$("#searchInp, #companySearchInp").keydown(function (e) {
    if (e.keyCode == 13) {
        $("#searchBtn").click();
    }
});

$(document).ready(function () {
    $(".inN_m").css({width: "16%"});
    var he = $(window).height() - 136;
    $('#content').css({'min-height': he + 'px'});
    $('#windTowerManageA').addClass('active')

    $("#windTowerTable").bootstrapTable({
        search: true,
        searchOnEnterKey: true,
        pageList: [10, 20, 50, 100],
        pageSize: 5,
        pagination: true,
        columns: columnSetting(),
        sidePagination: "server",
        url: '/windTower/windTowerManage/getTowersData',
        method: "post",
        queryParams: function (params) {
            $.extend(params, serach)
            return params;
        }
    });

    $("#searchBtn,#companySearchBtn").click(function () {
        $("#windTowerTable").bootstrapTable('resetSearch','');
        serach = {
            codeName: $("#searchInp")[0].value.trim(),
            companyName: $("#companySearchInp")[0].value.trim(),
        };
        $("#windTowerTable").bootstrapTable('refresh', {
            silent: true,
            pageNumber: 1,
            query: serach,
        });

    })
});

/*
    列设定
*/
function columnSetting() {
    return [
        {
            title: "测风塔",
            field: "codeName",
            width: "12%",
            sortable: true,
            class:"tableText"
        },
        {
            title: "所属公司",
            field: "companyName",
            width: "12%",
            sortable: true,
            class:"tableText"
        },
        {
            title: "所属项目",
            field: "projectName",
            width: "12%",
            sortable: true,
            class:"tableText"
        },
        {
            title: "项目经理",
            field: "manager",
            width: "12%",
            sortable: true,
            class:"tableText"
        },
        {
            title: "立塔时间",
            field: "towerCreateDate",
            width: "12%",
            sortable: true,
            class:"tableDate"
        },
        {
            title: "延迟报警日数",
            field: "alarmDelayDays",
            width: "12%",
            class:"tableNumber"
        },
        {
            title: "操作",
            field: "_id",
            width: "15%",
            events: operateEvents,
            formatter: operateFormatter
        },
    ];


    function operateFormatter(value, row, index) {
        var controlArray=[];
        var update= '<a href="javascript:void(0);" class="rowEdit btn btn-reset btnCss3"  hasDel="true">修改</a>';
        if(isEmptyObject(JSON.parse($("#authJson").val()))){
            controlArray.push(update);
            return controlArray.join('');
        }
        var towerIdAuth =doGetGridBtnAuthByTowerId(row._id);
        if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowU"]){
            update= '<a href="javascript:void(0);" class="rowEdit btn btn-reset btnCss3" >修改</a>';
            if(!isEmptyObject(towerIdAuth)&&towerIdAuth["allowD"]){
                update= '<a href="javascript:void(0);" class="rowEdit btn btn-reset btnCss3"  hasDel="true">修改</a>';
            }
            controlArray.push(update);
        }
        return controlArray.join('');
    }

}
