var map = new AMap.Map('towerMap', {
    layers: [new AMap.TileLayer.Satellite(), new AMap.TileLayer.RoadNet()],
    zoom: 5,
    center: [103.73, 36.03]
});

$(function () {
    initCharts();
    //左侧目录栏
    initMenuAndMap();
    $('#mapA').addClass('active')
    $('#article').css("left", "0px").css("width", "100%")
    if ($.cookie("index") === "true") {
        toOnlyMap();
        $.cookie("index", false);
    } else {
        toMenuMap();
    }

    $('#btnAddTower').on('click', function () {
        doAddMap();
    });
});

function searchCallFun(searchText) {
    $('#towerMap').empty();
    initMenuAndMap(searchText);
}

function toOnlyMap() {
    $('#article').removeClass("articleFather").addClass("articleFatherFull");

    $('#header').css("display", "none")
    $('#nav').css("display", "none")
    $('#rightArea').css("padding-right", "0")
    $('#leftArea').css('display', 'none').removeClass('col-md-3');
    $('#rightArea').addClass('col-md-12').removeClass('col-md-9');
    $('#leftbtn').text(">");
    $('#leftbtn').css({
        "position": "fixed",
        "left": (0) + "px",
    })
    $('#footer').addClass('mapFooter');
}

function toMenuMap() {
    $('#article').removeClass("articleFatherFull").addClass("articleFather");
    $('#header').css("display", "block")
    $('#nav').css("display", "block")
    $('#rightArea').css("padding-right", "")
    $('#leftArea').css('display', 'block').addClass('col-md-3');
    $('#rightArea').removeClass('col-md-12').addClass('col-md-9');
    $('#menuDiv').resize();
    $('#leftbtn').text("<");
    //定位事件筛选框
    $('#leftbtn').css({
        "position": "fixed",
        "left": ($('#leftArea').offset().left + $('#leftArea').width() + 10) + "px",
    })
    $('#footer').removeClass('mapFooter');
    $('#header').width($('#rightArea').width());
    $('#nav').css({"padding-left": "0px"})
    $('#nav').width($('#header').outerWidth() - $('#rightBtnDiv').outerWidth());

}

$(window).on('resize', function (options) {
    $('#header').width($('#rightArea').width());
    $('#nav').css({"padding-left": "0px"})
    $('#nav').width($('#header').outerWidth() - $('#rightBtnDiv').outerWidth());
})

function initMenuAndMap(searchText, selectNodeTowerCode) {
    var towerList = [];

    //将menuObject解析成tower数组
    function getPoints(resultList) {
        for (var i = 0; i < resultList.length; i++) {
            if (resultList[i]['nodes'] && resultList[i].nodes.length > 0) {
                getPoints(resultList[i].nodes);
            } else {
                towerList.push(resultList[i]);
            }
        }
    }

    $.post('/windTower/towerMenu/getTowerMenuData', {
        searchText: searchText,
        towerIdList: $("#towerIdList").val()
    }, function (resultList) {
        getPoints(resultList);

        //初始化地图
        var markers = [];
        var isCustomOverlayClick = false;

        //根据塔集合循环添加悬浮物
        towerList.forEach(function (tower) {
            var marker = new AMap.Marker({
                map: map,
                position: new AMap.LngLat(tower.longitude, tower.latitude),
                icon: new AMap.Icon({image: "images/landmark-red.png"}),
                title: tower.code + '#' + tower.name,
                //offset: new AMap.Pixel(-200, 200)
            });
            markers.push(marker);

            marker.on('click', function (e) {
                markerClick(markers, marker, map, tower);
            });

        });

        //地图点击事件
        map.on('click', function (e) {
            markers.forEach(function (m) {
                m.setIcon(new AMap.Icon({image: "images/landmark-red.png"}));
                m.setTitle(m.getTitle());
            });
            $('#menuDiv').clearSelect();
        });

        $('#leftbtn').on('click', function () {
            var selectedData = $('#menuDiv').getSelectedData();
            //有测风塔被选中的时候重新设置中心点和偏移量
            if (selectedData) {
                map.setZoomAndCenter(map.getZoom, [selectedData.longitude, selectedData.latitude]);
            }
            if ($('#article').is('.articleFather')) {
                toOnlyMap();
                if (selectedData) map.panBy(-200, 172);
            } else {
                toMenuMap();
                if (selectedData) map.panBy(-200, 250);
            }
        });

        $('#menuDiv').menuInit(resultList, {
            onNodeClick: function (data) {
                var overlays = map.getAllOverlays('marker');
                for (var i = 0; i < overlays.length; i++) {
                    if (Number(data.longitude) === overlays[i].getPosition().lng && Number(data.latitude) === overlays[i].getPosition().lat) {
                        markerClick(markers, overlays[i], map, data);
                        break;
                    }
                }
            },
            searchFun: function (searchText) {
                searchCallFun(searchText);
            }
        });
        if (selectNodeTowerCode) {
            $('#menuDiv').selectNode({code: selectNodeTowerCode});
        } else {
            if ($.cookie("towerId")) {
                $('#menuDiv').selectNode({_id: $.cookie("towerId")});
            }
        }
    });
}

function initCharts() {
//底层设定
    var baseOption = {
        polar: {
            center: ['50%', '50%']
        },
        radiusAxis: {
            min: 0,
            max: 100,//  第一个需要变化的地方，半径的刻度
            type: 'value',
            axisLabel: {
                axisTick: {
                    length: 10
                },
                textStyle: {
                    color: 'grey'
                }
            }
        },
        angleAxis: {
            axisLabel: {interval: 0},
            boundaryGap: false,
            data: ['0ﾟ', '22.5ﾟ', '45ﾟ', '67.5', '90ﾟ'
                , '112.5ﾟ', '135ﾟ', '157.5ﾟ', '180ﾟ', '202.5ﾟ',
                '225ﾟ', '247.5ﾟ', '270ﾟ', '292.5ﾟ', '315ﾟ', '337.5ﾟ']
        },
        animationDuration: 2000
    };

    //玫瑰设定
    var roseOption = {
        color: [
            "rgba(230, 80, 80, 0.7)",
            "rgba(230, 130, 80, 0.7)",
            "rgba(230, 230, 80, 0.7)",
            "rgba(130, 230, 80, 0.7)",
            "rgba(230, 80, 230, 0.7)",
            "rgba(80, 230, 230, 0.7)",
            "rgba(80, 80, 230, 0.7)",
            "rgba(255, 0, 0, 0.7)"
        ],
        tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b}: {d}%"
        },
        calculable: true,
        series: [
            {
                name: '风频',
                type: 'pie',
                radius: [20, 110],
                center: ['50%', '50%'],
                startAngle: 90 + 11.25,//初始角度 第3个需要变化的地方
                roseType: 'area',//半径都相等，只有半径不同
                radius: '63%',//67%
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false//多出来一条线指着他
                    }
                },
                lableLine: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                data: []
            }
        ]
    };
    $.extend(baseOption, roseOption);
    initOrReflashEchart("windFloatCharts", baseOption, 326, 358);
}

function customInitOverlay(towerId, map, marker) {
    var windSpeedChart = echarts.getInstanceByDom(document.getElementById("windFloatCharts"));
    windSpeedChart.resize();

    windSpeedChart.showLoading({
        text: '正数据加载中.........',
        color: '#c23531',
        textColor: '#ffffff',
        maskColor: 'rgba(255, 255, 255, 0.1)',
        zlevel: 0
    });
    $.ajax({
        url: "/windTower/mapDisplay/getCharts?towerId=" + towerId,
        success: function (resultList) {
            if (!resultList) {
                windSpeedChart.hideLoading();
                return;
            }
            var option = windSpeedChart.getOption();

            option.series[0].data = resultList.map(function (result) {
                return {value: result.speed, name: result.direction + 'ﾟ'};
            });
            windSpeedChart.setOption(option);
            windSpeedChart.hideLoading();
        },
        error: function () {
            windSpeedChart.hideLoading();
        }
    });

};

//marker点击后的处理
function markerClick(markers, marker, map, tower) {
    markers.forEach(function (m) {
        m.setIcon(new AMap.Icon({image: "images/landmark-red.png"}));//还原icon（变红）
    });
    map.clearInfoWindow();
    $('#menuDiv').activeNode({_id: tower._id}, 0);//展开左侧栏

    $.get('/windTower/mapDisplay/getAverageSpeed',
        {towerId: tower._id}, function (result) {
            marker.setIcon(new AMap.Icon({image: "images/landmark-green.png"}));//marker变绿
            map.setZoomAndCenter(map.getZoom, marker.getPosition());
            map.panBy(-200, 200);

            $('#title').text(tower.code + '#' + tower.name);
            $('#maxHeight').text(result.maxHeight ? ' ' + result.maxHeight : ' ');
            $('#averageSpeed').text(result.averageSpeed ? ' ' + result.averageSpeed : ' ');
            $('#tag').css('display', 'block');
            customInitOverlay(tower._id, map, marker);

            var infoWindow = new AMap.InfoWindow({
                isCustom: true,
                autoMove: false,
                content: document.getElementById('tag'),
                closeWhenClickMap: true,
                offset: new AMap.Pixel(200, -50)
            });

            infoWindow.open(map, marker.getPosition());
            //记录towerId，用于数据管理画面跳转
            $.cookie("towerId", $('#menuDiv').getSelectedData()._id);
            //信息窗口关闭事件，清除cookie
            infoWindow.on('close', function () {
                $.cookie("towerId", '');
            });

            //给详情添加事件
            $('#btnDetail').on('click', function () {
                $('#viewModal').modal('show');
                doView(tower._id);
            });

            $('#tag').on('click', function () {
                isCustomOverlayClick = true;
            });
        });
}