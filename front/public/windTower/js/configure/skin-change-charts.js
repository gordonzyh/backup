//全场页换肤JS
$(function(){
    //主题点击事件
    $('.settings-dropdown-theme-color').on('click',function(){
        var $this = $(this);
        //彩色主题
        if($this.hasClass('c-colorful')){
            colorfulColorSkin();
            changeSettingIcon('white');
        }
        // 白色主题
        if($this.hasClass('c-white')){
            whiteColorSkin();
            changeSettingIcon('black');
        }
        //蓝色主题
        if($this.hasClass('c-blue')){
            blueColorSkin();
            changeSettingIcon('black');
        }
        //红色主题
        if($this.hasClass('c-red')){
            redColorSkin();
            changeSettingIcon('white');
        }
    });

    var cookieStyle = $.cookie("mystyleSimensLocal");
    //按照正常的皮肤走
    if(cookieStyle == null || cookieStyle==''){
        $("#skinCss").attr("href","");
        $(".c-colorful").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
        changeSettingIcon('white');
    }else{
        $("#skinCss").attr("href",cookieStyle);
        if(cookieStyle == "./css/skin-white.css"){
            $(".c-white").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
            whiteColorSkin();
            changeSettingIcon('black');
        }else if(cookieStyle == "./css/skin-blue.css"){
            $(".c-blue").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
            blueColorSkin();
            changeSettingIcon('black');
        }else if(cookieStyle == "./css/skin-red.css"){
            $(".c-red").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
            redColorSkin();
            changeSettingIcon('white');
        }
    }

    //彩色主题
    function colorfulColorSkin(){
        $(".c-colorful").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
        $("#skinCss").attr("href","");
        $(".article-header-top-right-sound img").attr('src','./images/global/sound.png');
        $('.article-main-top .article-main-top-message').removeClass('text-shadow').addClass('text-shadow');
        $.cookie("mystyleSimensLocal","",{expires:30, path: "/"});

        //echarts 样式
        myChartOption.title.textStyle.color = '#fff';
        myChartOption.legend.textStyle.color = '#fff';
        myChartOption.toolbox.feature.mark.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.dataView.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.magicType.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.restore.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.saveAsImage.iconStyle.normal.borderColor = '#fff';
        myChartOption.xAxis[0].nameTextStyle.color = '#fff';
        myChartOption.yAxis[0].nameTextStyle.color = '#fff';
        myChart.setOption(myChartOption);

    }

    //白色主题
    function whiteColorSkin(){
        $(".c-white").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
        $("#skinCss").attr("href","./css/skin-white.css");
        $(".article-header-top-right-sound img").attr('src','./images/global/sound-black.png');
        $('.article-main-top .article-main-top-message').removeClass('text-shadow');
        $('.article-main-top strong').removeClass('text-shadow');
        $.cookie("mystyleSimensLocal","./css/skin-white.css",{expires:30, path: "/"});

        //echarts 样式
        myChartOption.title.textStyle.color = '#343434';
        myChartOption.legend.textStyle.color = '#343434';
        myChartOption.toolbox.feature.mark.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.dataView.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.magicType.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.restore.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.saveAsImage.iconStyle.normal.borderColor = '#343434';
        myChartOption.xAxis[0].nameTextStyle.color = '#343434';
        myChartOption.yAxis[0].nameTextStyle.color = '#343434';
        myChart.setOption(myChartOption);
    }

    //蓝色主题
    function blueColorSkin(){
        $(".c-blue").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
        $("#skinCss").attr("href","./css/skin-blue.css");
        $(".article-header-top-right-sound img").attr('src','./images/global/sound.png');
        $('.article-main-top .article-main-top-message').removeClass('text-shadow')
        $('.article-main-top strong').removeClass('text-shadow');
        $.cookie("mystyleSimensLocal","./css/skin-blue.css",{expires:30, path: "/"});

        //echarts 样式
        myChartOption.title.textStyle.color = '#343434';
        myChartOption.legend.textStyle.color = '#343434';
        myChartOption.toolbox.feature.mark.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.dataView.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.magicType.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.restore.iconStyle.normal.borderColor = '#343434';
        myChartOption.toolbox.feature.saveAsImage.iconStyle.normal.borderColor = '#343434';
        myChartOption.xAxis[0].nameTextStyle.color = '#343434';
        myChartOption.yAxis[0].nameTextStyle.color = '#343434';
        myChart.setOption(myChartOption);
    }

    //红色主题
    function redColorSkin(){
        $(".c-red").addClass("active").parent().siblings(".settings-dropdown-theme-bg").children('.active').removeClass("active");
        $("#skinCss").attr("href","./css/skin-red.css");
        $(".article-header-top-right-sound img").attr('src','./images/global/sound-black.png');
        $('.article-main-top .article-main-top-message').removeClass('text-shadow');
        $('.article-main-top strong').removeClass('text-shadow');
        $.cookie("mystyleSimensLocal","./css/skin-red.css",{expires:30, path: "/"});

        //echarts 样式
        myChartOption.title.textStyle.color = '#fff';
        myChartOption.legend.textStyle.color = '#fff';
        myChartOption.toolbox.feature.mark.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.dataView.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.magicType.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.restore.iconStyle.normal.borderColor = '#fff';
        myChartOption.toolbox.feature.saveAsImage.iconStyle.normal.borderColor = '#fff';
        myChartOption.xAxis[0].nameTextStyle.color = '#fff';
        myChartOption.yAxis[0].nameTextStyle.color = '#fff';
        myChart.setOption(myChartOption);
    }

    // 修改设置图标
    function changeSettingIcon(color) {
        let $header = $('#header');
        let $nav = $('#nav');
        let $img = $header.find('img');
        if(color === 'black') {
            $img.eq(0).attr('src','./images/skin/help-icon.png').width(15);
            $img.eq(1).attr('src','./images/skin/bell.png').width(15);
            $img.eq(2).attr('src','./images/skin/settings.png').width(15);
            $img.eq(3).attr('src','./images/skin/exit.png').width(15);

            $nav.find('a > img').attr('src','./images/skin/home.png').width(14);
            $nav.find('.bread-page > img').attr('src','./images/skin/bread-right.png');
        } else if(color === 'white') {
            $img.eq(0).attr('src','./images/help-icon.png');
            $img.eq(1).attr('src','./images/bell.png');
            $img.eq(2).attr('src','./images/settings.png');
            $img.eq(3).attr('src','./images/exit-2.png');

            $nav.find('a > img').attr('src','./images/global/home.png');
            $nav.find('.bread-page > img').attr('src','./images/global/bread-right.png');
        }
    }
});
