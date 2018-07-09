//其他操作
$(function() {
	footPositionChange();
	function footPositionChange(){
		var articleHeight = $('#article').outerHeight();
		var mainHeight = $('#article .main').outerHeight();
		var $footer = $('#article footer');
		if(articleHeight < mainHeight){
			$footer.css({
				"position":"relative"
			})
		}else{
			$footer.css({
				"position":"fixed",
				"bottom":"0"
			})
		}
	}
	$(".pop-box").slideDown("slow");
	$(".panel.pop-box .close,.panel.info-box .close").click(function(){
		var iconClose = $(this).text();
		switch (iconClose)
		{
			case "×":
				$(this).text("+");
				break;
			case "+":
				$(this).text("×");
				break;
		}
		$(this).next(".panel-title").add($(this).parents(".panel-heading").next("")).toggle(200);
	});
	//控制风场内容区高度
	$("#fanCon, #fanPage").css({"bottom": $("#fanTable").height()+30});
	$("#fanTable>.fanTable-arrow").click(function(){
		$(this).toggleClass("up");
		$(this).siblings(".fan-tables").toggle();
		$("#fanCon, #fanPage").css({"bottom": $("#fanTable").height()+30});
	});
	//全局-输入框不要记忆
	$("input:text").attr("autocomplete","off");
	//全局-换皮肤
	//$("#skinBlack").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-black.css");
	//	$.cookie("mystyle","css/skin-black.css",{expires:30,path:"/"});
	//});
	//$("#skinWhite").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-white.css");
	//	$.cookie("mystyle","css/skin-white.css",{expires:30,path:"/"});
	//});
	//$("#skinCyan").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-cyan.css");
	//	$.cookie("mystyle","css/skin-cyan.css",{expires:30,path:"/"});
	//});
	//$("#skinBlue").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-blue.css");
	//	$.cookie("mystyle","css/skin-blue.css",{expires:30,path:"/"});
	//});
	//$("#skinGreen").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-green.css");
	//	$.cookie("mystyle","css/skin-green.css",{expires:30,path:"/"});
	//});
	//$("#skinRed").click(function(){
	//	$(this).addClass("active").siblings(".active").removeClass("active");
	//	$("#skinCss").attr("href","css/skin-red.css");
	//	$.cookie("mystyle","css/skin-red.css",{expires:30,path:"/"});
	//});
	////换肤cookie
	//var cookieStyle = $.cookie("mystyle");
	//if(cookieStyle==null){
	//	$("#skinCss").attr("href","css/skin-black.css");
	//}else{
	//	$("#skinCss").attr("href",cookieStyle);
	//	if(cookieStyle=="css/skin-white.css"){
	//		$("#skinWhite").addClass("active").siblings(".active").removeClass("active");
	//	}else if(cookieStyle=="css/skin-cyan.css"){
	//		$("#skinCyan").addClass("active").siblings(".active").removeClass("active");
	//	}else if(cookieStyle=="css/skin-blue.css"){
	//		$("#skinBlue").addClass("active").siblings(".active").removeClass("active");
	//	}else if(cookieStyle=="css/skin-green.css"){
	//		$("#skinGreen").addClass("active").siblings(".active").removeClass("active");
	//	}else if(cookieStyle=="css/skin-red.css"){
	//		$("#skinRed").addClass("active").siblings(".active").removeClass("active");
	//	}
	//};

	//全局-左导航
	$("#aside .aside-arrow").click(function(){
		//$(this).children(".glyphicon").toggleClass("glyphicon-menu-right").parents("#aside").toggleClass("aside-xs").next("#nav").toggleClass("nav-lg").next("#article").toggleClass("article-lg");
		$(this).children(".glyphicon").toggleClass("glyphicon-menu-right").parents("#aside").toggleClass("aside-xs");
		$("#nav").toggleClass("nav-lg");
		$("#article").toggleClass("article-lg");
	});
	$("#aside .sidebar>li>a").click(function(){
		$(this).children(".glyphicon").toggleClass("glyphicon-minus-sign").parent("a").next("ul").slideToggle();
	});
	$("#aside .sidebar>li>ul>li>a").click(function(){
		$(this).children(".glyphicon").toggleClass("glyphicon-minus").parent("a").next("ul").slideToggle();
	});
	//全局-主导航
	$("#nav ul.nav-list>li").hover(function(){
		$(this).addClass("menu_current").children("ul").stop().fadeIn(300);
	},function(){
		$(this).removeClass("menu_current").children("ul").stop().fadeOut(100);
	});
	//弹出框
	$('[data-toggle="popover"]').popover({
	});
	//全局-响应面板加“加减”号
	$(".panel-title>a").click(function(){
		$(this).toggleClass("minus").parents(".panel").siblings(".panel").find(".minus").removeClass("minus");
	});
	//风机图
	$('[data-toggle="tooltip"]').tooltip();
	//风场页-右下角弹出广告；云端-监控页右栏

	//风机选择-收起展开
	$(".panel.fan-select-box .close").click(function(){
		var iconClose = $(this).text();
		switch (iconClose)
		{
			case "-":
				$(this).text("+");
				break;
			case "+":
				$(this).text("-");
				break;
		}
		$(this).next(".panel-title").add($(this).parents(".panel-heading").next(".panel-body")).toggle(400);
	});
	//模态框
	var winHeight = $(window).height();
	winHeight = winHeight - 190;
	// $(".modal-body").css({"max-height": winHeight,"overflow":"auto"});
	//单选项控制标签显示隐藏
	$("#radioTabContent>.tab-pane:eq(1)").hide();
	$("#radioTabs>label>input").click(function(){
		var radioNum = $(this).parent("label").index();
		$("#radioTabContent>.tab-pane:eq("+radioNum+")").show().siblings(".tab-pane").hide();
	});
	//全局-开关按钮
	//try{
	//	$(".switch input:checkbox").bootstrapSwitch();
	//}catch(e){
	//	console.log("捕获:"+e);
	//}
	//全局-响应面板加“加减”号
	$(".panel-title>a").click(function(){
		$(this).toggleClass("minus");
	});	
	checkshortcutaction();
	//$("#collection_configure").click(function(){
	//	$(this).hide();
	//	$("#collection_configure1").show();
	//});
	//$("#collection_monitor").click(function(){
	//	$(this).hide();
	//	$("#collection_monitor1").show();
	//});
	$("#collectionPage").click(function(){
		var href = window.location.href;
		var url = href.substr(href.lastIndexOf('/')).split("?")[0].replace("#","");
		$.post("/collectionPage",{url:url}, function (result) {
			if(result == "success"){
				$("#collectionPage").hide();
				$("#collectionPageEnd").show();
			}else{
				alert(result);
			}
		})
	});

});
//全局-滚动条
//(function($){
//	$(window).load(function(){
//		$("#aside").mCustomScrollbar({
//			theme:"3d"
//		});
//        $("#aside").mCustomScrollbar("scrollTo","#aside .active");
//		$("#article,#article2,#fanCon").mCustomScrollbar({
//			theme:"3d",
//			axis:"yx"
//		});
//	});
//})(jQuery);

//bootstrap加滑过弹出下拉菜单
(function($, window, undefined) {
    // outside the scope of the jQuery plugin to
    // keep track of all dropdowns
    var $allDropdowns = $();

    // if instantlyCloseOthers is true, then it will instantly
    // shut other nav items when a new one is hovered over
    $.fn.dropdownHover = function(options) {

        // the element we really care about
        // is the dropdown-toggle's parent
        $allDropdowns = $allDropdowns.add(this.parent());

        return this.each(function() {
            var $this = $(this).parent(),
                defaults = {
                    delay: 500,
                    instantlyCloseOthers: true
                },
                data = {
                    delay: $(this).data('delay'),
                    instantlyCloseOthers: $(this).data('close-others')
                },
                options = $.extend(true, {}, defaults, options, data),
                timeout;

            $this.hover(function() {
                if(options.instantlyCloseOthers === true)
                    $allDropdowns.removeClass('open');

                window.clearTimeout(timeout);
                $(this).addClass('open');
            }, function() {
                timeout = window.setTimeout(function() {
                    $this.removeClass('open');
                }, options.delay);
            });
        });
    };

    $('[data-hover="dropdown"]').dropdownHover();
})(jQuery, this);

var __WIND_FIELD_NAME_MAP;//禁止直接使用此变量；
function getWindFieldName(code){
	if(isNull(__WIND_FIELD_NAME_MAP) || isEmpty(__WIND_FIELD_NAME_MAP[code])){
		if(code == "" || code ==undefined){
			return "";
		}else{
			__WIND_FIELD_NAME_MAP = {};
			$.ajax({
				type: "POST",
				async: false,
				data:{code:code},
				url: "/getWindFieldNameArray",
				success: function (windFildNameArray) {
					if(windFildNameArray != "error") {
						if (windFildNameArray.length > 0) {
							for(var i = 0; i < windFildNameArray.length; i++){
								var code = windFildNameArray[i].code;
								var name = windFildNameArray[i].name
								__WIND_FIELD_NAME_MAP[code] = name;
							}
						}
					}
				}
			});

		}

	}
	return __WIND_FIELD_NAME_MAP[code];
}

function createDynamicForm(url,method,target,params){
	var form = document.createElement('form');
	form.action = url;
	form.method = method;
	form.target = target;
	for(var param in params){
		var value = params[param],
			input = document.createElement('input');

		input.type = 'hidden';
		input.name = param;
		input.value = value;

		form.appendChild(input);
	}
	return form;
}

function getCurWFCode(){
	return $("#cur_wfCode").val();
}

function getCurWFCodePlus(){
	var result = "cur_wfCode=" + getCurWFCode() + "&uuid=" + Math.random();
	return result;
}

function isNull(obj){
	return undefined == obj || null == obj;
}

function isEmpty(obj){
	//alert(JSON.stringify(obj));
	//alert(obj == "");
	//alert("" == 0);
	return isNull(obj) || "" == obj;
}

function toFix(obj,num){
	var result = obj;
	try{
		if(!isEmpty(obj)){
			obj = parseFloat(obj).toFixed(num);
			if(!isNaN(obj)){
				result = obj;
			}
		}
	}catch(e){
		console.log("3toFix error obj="+obj+" num="+num);
	}
	return result;
}


/**
 * 页面权限控制
 */
function jurisdiction(){
	var hf=window.location.href.split(window.location.host);
	var hu=hf[1].split("?")[0];
	$.get("/cloudgetpargeinfobyparentrul?parenturl="+hu, function(data, status){
		 if(data.length>0){
			 for(var i=0;i<data.length;i++){

			 	if(!isEmpty($("input[data-quanxian='"+data[i]+"']"))){
                     $("input[data-quanxian='"+data[i]+"']").attr('disabled',"true");
                 }
                 if(!isEmpty($("button[data-quanxian='"+data[i]+"']"))){
                     $("button[data-quanxian='"+data[i]+"']").attr('disabled',"true");
                 }

				 $("a[data-quanxian='"+data[i]+"']").each(function () {
					 $(this).attr('href',"#");
						$(this).removeAttr("class");
						$(this).attr('hidden',"hidden");
	            });
			 }
		 }
	});	
}


/**
 * 判断当前页面是否已经收藏
 */
function checkshortcutaction(){
	var hf=window.location.href.split(window.location.host);
	var hu=hf[1].split("?")[0];
	// $.get("/commoncheckshortcutaction?url="+hu, function(data, status){
	// 	 if(data.flag=="1"){
	// 			 //$("#collection_configure").hide();
	// 			 //$("#collection_monitor").hide();
	// 			 //$("div[name=collection_configure]").hide();
	// 			 //$("div[name=collection_monitor]").hide();
	// 			 //$("#collection_configure1").show();
	// 			 //$("#collection_monitor1").show();
    //
	// 		 $("#collectionPage").hide();
	// 		 $("#collectionPageEnd").show();
	// 	 }
	// });
}

function toThousands(num) {
	var result = [], counter = 0;
	var tempCharAt =(num).toString()
	if(tempCharAt.charAt(0)!="-") {
		num = (num).toString().split('');
		//alert(num);
		for (var i = num.length - 1; i >= 0; i--) {
			result.unshift(num[i]);
			var temp;
			if (num[i] == ".") {
				temp = "ok";
			} else {
				if (temp == "ok") {
					counter++;
					if (!(counter % 3) && i != 0) {
						result.unshift(',');
					}
				}
			}
		}
		return result.join('');
	}else{
		num = (num).toString().substr(1).split('');
		//alert(num);
		for (var i = num.length - 1; i >= 0; i--) {
			result.unshift(num[i]);
			var temp;
			if (num[i] == ".") {
				temp = "ok";
			} else {
				if (temp == "ok") {
					counter++;
					if (!(counter % 3) && i != 0) {
						result.unshift(',');
					}
				}
			}
		}
		return "-"+result.join('');
	}
};
function menuSort(arr){
	if(arr != null && arr.length > 0){
        arr.sort(function(a,b){
            if(a.index == undefined || a.index == ""){
                a.index = 0;
            }
            if(b.index == undefined || b.index == ""){
                b.index = 0;
            }
            return parseInt(a.index) - parseInt(b.index);
        });
	}
	return arr;
}
headerMenu();
function headerMenu(){
	var menu = $("#headerMenu").val();

	if(!isEmpty(menu)){
		$("#headersystemname").text(menu);
	}
}

function ajaxSuitName(){

	$.ajax({
		type:"POST",
		url:"/getSuitName",
		async :false,
		success:function(data) {
			getSuitIndex++;
			SuitJson = data;
		}
	});
}

var getSuitIndex = 0;
var SuitJson = {};
function getSuitName(code){
	if(getSuitIndex == 0 || JSON.stringify(SuitJson) == "{}"){
		ajaxSuitName();
	}
	return SuitJson[code];
}

//获取节点列表
function getNodeInfo(selectId, callback) {
    $.get("/getNodeInfo?uuid=" + Math.random(), function (data) {
        if (data.length > 0) {
            $("#" + selectId).html("");//清空
        }
        for (var i = 0; i < data.length; i++) {
        	//过滤中间点节点
			if("00001" == data[i].nodeId || data[i].nodeId.indexOf("F") >= 0){
                if( data[i].isCurrentNode == "Y"){
                    var temp = "<option value='" + data[i].nodeId + "' selected>" + data[i].nodeName + "</option>";
                }else{
                    var temp = "<option value='" + data[i].nodeId + "'>" + data[i].nodeName + "</option>";
                }
                $("#" + selectId).append(temp);
			}
        }
        callback();
    });
}


//参数 传入数组
var timeoutObj = new Object();
function timeoutSet(id){
	var date = new Date();
	//if(id == "voiceBroadCast"){
	//	console.log(id+"="+(date.getTime()-$("#"+id).val())/1000);
	//}

	$("#"+id).val(date.getTime());
	var circleTime = $("#timeout").val()*1000;
	//if(timeoutObj[id] == undefined || timeoutObj[id] == ""){
		timeoutObj[id] = setTimeout(function(){
			$("#"+id).attr("outNum",parseInt($("#"+id).attr("outNum"))+1);
			//console.log(id+"超时"+$("#"+id).attr("outNum")+"次");
			$("#"+id).click();
		},circleTime);
	//}
}


function clearTimeoutSet(id){
		//console.log(id+" start clear="+JSON.stringify(timeoutObj));
	clearTimeout(timeoutObj[id]);
	timeoutObj[id] = "";

}

function getUniqueKey(id){
	return id+$("#"+id).val();
}

//升级任务主任务，子任务权限
var taskMap = {};
function getLimitTaskOptions(mainId,childId){
	//清空主任务，子任务下拉框
	var mainTask = document.getElementById(mainId);
	var childTask = document.getElementById(childId);
	mainTask.options.length=0;
	childTask.options.length=0;
	//获取权限主任务列表,主任务，子任务下拉框赋值
	$.get("/getUserLimitUpgradeTask", function(data, status){
		taskMap = {};
		if(data.length>0){
			var mainTaskAry = new Array();
			data = menuSort(data);
			var menuMap = {};
			for(var i=0;i<data.length;i++){
				menuMap[data[i].uid] = data[i].name;
			}
			for(var i=0;i<data.length;i++){
				var menu = data[i];
				var uid = menu.uid;
				var parentId = menu.parent_id;
				if(menu.level=="2"){
					//主任务
					mainTaskAry.push(menu);
				}
				else{
					var name = menuMap[parentId];
					if(isEmpty(taskMap[name])){
						var temp = new Array();
						taskMap[name] = temp;
					}
					taskMap[name].push(menu);
				}
			}
			mainTaskAry = menuSort(mainTaskAry);
			//主任务赋值
			for(var i=0;i<mainTaskAry.length;i++){
				var menu = mainTaskAry[i];
				mainTask.options.add(new Option(menu.name,menu.name)); //这个兼容IE与firefox
			}
			//子任务赋值，若无子任务，则子任务显示主任务
			var mainTaskCheckOption = $("#mainTask_add").val();
			var childTaskAry = taskMap[mainTaskCheckOption];
			if(isEmpty(taskMap[mainTaskCheckOption]) || childTaskAry.length == 0){
				childTaskAry = new Array();
				childTaskAry.push({name:mainTaskCheckOption});
			}
			for(var i=0;i<childTaskAry.length;i++){
				var menu = childTaskAry[i];
				childTask.options.add(new Option(menu.name,menu.name)); //这个兼容IE与firefox
			}
		}
		else{
			mainTask.options.add(new Option("无权限",""));
			childTask.options.add(new Option("无权限",""));
		}
	});
}


function emptyReplace(data,str){
	return isEmpty(data)?str:data;
}
window.onbeforeunload = onbeforeunload_handler;
//window.onunload = onunload_handler;
function onbeforeunload_handler(){
    $.ajax({
        type:"post",
        url:"/browserClose",
        async :false,
        success:function(data) {

        }
    });
    //var warning="确认退出?";
    //return warning;
}
//console.log("test");
//if (navigator.onLine){
//	console.log("正常联网");
//}else{
//	console.log("网络不正常");
//}
//var EventUtil = {
//	addHandler: function (element, type, handler) {
//		if (element.addEventListener) {
//			element.addEventListener(type, handler, false);
//		} else if (element.attachEvent) {
//			element.attachEvent("on" + type, handler);
//		} else {
//			element["on" + type] = handler;
//		}
//	}
//};
//EventUtil.addHandler(window, "online", function () {
//	alert("Online");
//});
//EventUtil.addHandler(window, "offline", function () {
//	alert("Offline");
//});
//实数
//是返回true,否则返回false
function isFloat(str) {
  //  str = str.trim();
    var re = /^(0|(-?0\.\d+)|((-?)[1-9]{1}(\d*)(\.\d+)?))$/;
    return re.test(str);
}