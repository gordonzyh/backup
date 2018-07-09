var socketTimeOut = 30000;

$(function () {

    //    设置按钮JS
    var settingsLeft = parseInt($("#settingIcon").offset().left) - parseInt($("#header").offset().left);
    var triArrowLeft = parseInt($(".settings-dropdown-triArrow").css("left"));
    $("#settingsDropdownLan").select2({
        minimumResultsForSearch: Infinity,
        dropdownParent: $("#settingsDropdownLan").parent(".settings-dropdown-lan"),
    });
    $("#settingIcon")
        .click(function () {
            settingClickDrop();
        });
    function settingClickDrop(){
        $(".nav-settings-dropdown")
            .css({
                "left":settingsLeft - triArrowLeft - 4
            })
            .toggle();
    }
    $(document).click(function (e) {
        var drag = $(".nav-settings-dropdown"),
            setting = $("#settingIcon"),
            target = e.target;
        if(drag){
            if (drag !== target && !$.contains(drag[0], target) && !$.contains(setting[0], target)) {
                drag.hide();
            }
        }
    });
    //    显示时间JS
    function drowTime(){
        var date = new Date();
        var year = date.getYear() + 1900;
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        //补0
        if(hours < 10){
            hours = "0" + hours;
        }
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        if(seconds < 10){
            seconds = "0" + seconds;
        }

        $(".nav-drawTime").text( year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds);
    }
    setInterval(function () {
        drowTime();
    },1000);
//*********  显示时间JS

//    超过3位的数值  用逗号分隔

    function splitByComma(data){
        if(data){
            data += '';
            var x = data.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }else{
            return "";
        }

    }

    //拓展侧边栏
    var asideTimer = null;
    $("#aside").mouseenter(function(e){
        asideTimer = setTimeout(function() {
            $(".asideFather .sidebar.skin .sidebar-lists").show().css("opacity","1");
            $(".contract").hide();
            $(".aside-mask").show();
            $(".sidebar-logo-fengyun").show().css("opacity","1");
            $(".sidebar-fengyun-logo").hide();
            $(".sidebar-logo-text").show().css("opacity","1");
            $("#aside").css({
                backgroundColor:"rgba(0,0,0,0.6)",
                position:"fixed",
                "left":"0",
                "top":"0",
                "bottom":"0",
            }).animate({
                width:"160px"
            },200);
        },300);
    }).mouseleave(function(){
        $(".asideFather .sidebar.skin .sidebar-lists").hide();
        $(".contract").show();
        clearTimeout(asideTimer);
    });
    $(".aside-mask").on("click",function(e){
        clearTimeout(asideTimer);
        $(".asideFather .sidebar.skin .sidebar-lists").hide();
        $(".aside-mask").hide();
        $(".sidebar-logo-fengyun").hide();
        $(".sidebar-fengyun-logo").show();
        $(".sidebar-logo-text").show().css("opacity","0");

        $("#aside").css({
            backgroundColor:"rgba(0,0,0,0.1)",
            position:"absolute",
            "left":"0",
            "top":"0",
            "bottom":"0",
            //width:"90px"
        }).animate({
            width:"90px"
        },200);

        $("#aside .sidebar-logo-text")
            .css({"opacity": "0"})
            .hide();

        setTimeout(function(){
            $(".sidebar-ver-logo")
                .attr("src","./images/ver-logo.png")
                .animate({
                    "width":"51px"
                },0)
        },50);
        //修改侧边栏logo高度
        $("#aside .sidebar.skin .sidebar-logo").stop(true,true).animate({
            "height":"76px"
        },200);
    })

    showDropSelectMix();
    function showDropSelectMix(){
        $.mixhover = function() {
// 整理参数 $.mixhover($e1, $e2, handleIn, handleOut)
            var parms;
            var length = arguments.length;
            var handleIn = arguments[length - 2];
            var handleOut = arguments[length - 1];
            if ($.isFunction(handleIn) && $.isFunction(handleOut)) {
                parms = Array.prototype.slice.call(arguments, 0, length - 2);
            } else if ($.isFunction(handleOut)) {
                parms = Array.prototype.slice.call(arguments, 0, length - 1);
                handleIn = arguments[length - 1];
                handleOut = null;
            } else {
                parms = arguments;
                handleIn = null;
                handleOut = null;
            }

// 整理参数 使得elements依次对应
            var elems = [];
            for (var i = 0, len = parms.length; i < len; i++) {
                elems[i] = [];
                var p = parms[i];
                if (p.constructor === String) {
                    p = $(p);
                }
                if (p.constructor === $ || p.constructor === Array) {
                    for (var j = 0, size = p.length; j < size; j++) {
                        elems[i].push(p[j]);
                    }
                } else {
                    elems[i].push(p);
                }
            }

// 绑定Hover事件
            for (var i = 0, len = elems[0].length; i < len; i++) {
                var arr = [];
                for (var j = 0, size = elems.length; j < size; j++) {
                    arr.push(elems[j][i]);
                }
                $._mixhover(arr, handleIn, handleOut);
            }
        };
        $._mixhover = function(elems, handleIn, handleOut) {
            var isIn = false, timer;
            $(elems).hover(function() {
                    window.clearTimeout(timer);
                    if (isIn === false) {
                        handleIn && handleIn.apply(elems, elems);
                        isIn = true;
                    }
                },
                function() {
                    timer = window.setTimeout(function() {
                        handleOut && handleOut.apply(elems, elems);
                        isIn = false;
                    }, 10);
                });
        };
        showDropSelect();
        function showDropSelect(){
            var container = $(".showDrop-container");
            var nav = $(".showDrop-ul");
            var navHeight = nav.height();
            var containerHeight = container.height();
            var navLis = nav.find("li");
            //如果 ul宽度大于container宽度
            if(navHeight > containerHeight){
                var widthLi = 0;
                var nowIndex = 0;
                var len = navLis.length;
                var containerWidth = container.width() - 10;
                var containerLeft = container.position().left;
                for(var i = 0 ; i < len ; i++){
                    widthLi += navLis.eq(i).width();
                    if(widthLi > containerWidth){
                        nowIndex = i;
                        break;
                    }
                }

                //将超过部分的li拿出来
                var divHtml = '<div class="showDrop-append clearfix">';
                for(var j = nowIndex;j < len ; j ++){
                    divHtml += '<span>' + navLis.eq(j).html() + '</span>';
                }
                divHtml += '</div>';
                $("body").append(divHtml);
                $(".showDrop-append").css('left',"88%");

                var appendDiv = $(".showDrop-append");

                container.append('<span class="container-span">...</span>');
                nav.css({
                    paddingRight: '10px'
                });
                container.find(".container-span").css({
                    position: "absolute",
                    right: "10px",
                    top: "-4px",
                    color:"rgba(255,255,255,0.6)",
                    cursor:"pointer",
                    zIndex:999999
                });
                //appendDiv.height((len - nowIndex) * 23.33333);

                //    绑定mouseenter事件
                //container.off('mouseenter').on('mouseenter', function () {
                //    appendDiv.stop().show();
                //});
                //$(".showDrop-container,.showDrop-append").on('mouseleave', function () {
                //    appendDiv.stop().slideUp();
                //})
                $.mixhover(
                    '.container-span',
                    '.showDrop-append',
                    function(trg, drop){
                        appendDiv.stop().fadeIn();
                    },
                    function(trg, drop){
                        appendDiv.stop().fadeOut();
                    }
                )

            }
        }
    }
});



