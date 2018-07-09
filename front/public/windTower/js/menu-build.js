const menuAnimationSpeed = 400;

$.fn["menuInit"] = function menuInit(data, options) {
    if ($(this).find('#searchInp').length === 0) {
        $(this).append('<div class="dataTables_filter input-group" style="width: 100%" >' +
            '        <input id="searchInp" type="text" class="form-control"' +
            '               style="height:30px;width:50%;display:inline;margin-right:0px">' +
            '        <button id="searchBtn" class="btn btn-default search-btn" type="button"' +
            '                style="width:20%;right:auto;top:auto">' +
            '            <img src="images/search.png" class="mCS_img_loaded">' +
            '        </button>' +
            '       <span id="menuExpand" class="btn fa fa-plus-square fa-lg " style="float:' +
            ' right ;padding: 0px; margin: 6px;" title="全展开" ></span>' +
            '       <span id="menuShrink" class="btn fa fa-minus-square fa-lg " style="float:' +
            ' right ;padding: 0px; margin: 6px;" title="全折叠" ></span>' +
            '    </div>');
    }
    $("#searchBtn").click(function (e) {
        options["searchFun"]($("#searchInp").val());
    });
    $("#searchInp").keydown(function (e) {
        if (e.keyCode == 13) {
            options["searchFun"]($("#searchInp").val());
        }
    });
// ' <a class="tooltips" href="#tooltips">这就是Tooltips<span>正是你见到的，这些附加的说明文字是在鼠标经过的时候显示。</span></a>' +
    $("#menuShrink").click(function (e) {
        $("#menuDiv").find(".treeview-menu").css("display", "none");
        $("#menuDiv").find(".treeview-menu").removeClass("menu-open");
    });

    $("#menuExpand").click(function (e) {
        $("#menuDiv").find(".treeview-menu").css("display", "block");
        $("#menuDiv").find(".treeview-menu").addClass("menu-open");
    });

    $(".sidebar-menu").remove();
    let showlist = $("<ul class='sidebar-menu'></ul>");
    showall(data, showlist, 0);
    $(this).append(showlist);

    $(this).eventAndOptionSet(options);
    $(this).resize(options["height"], options["width"]);
}

function showall(menu_list, parent, level) {
    level++;
    let returnCount = 0;
    for (let i = 0; i < menu_list.length; i++) {
        if (menu_list[i].nodes && menu_list[i].nodes.length > 0) {
            let nextParent = $("<ul class='treeview-menu'></ul>");
            let count = showall(menu_list[i].nodes, nextParent, level);
            let li = $("<li class='treeview level" + level + "'></li>");
            $(li).append("<a href='#'>" +
                // "<i class='fa fa-share'></i> " +
                "<span>" + menu_list[i].text + "</span>" +
                "<li class='badge pull-right'>" + (count ? count : "") + "</li>" +
                // "<i class='fa fa-angle-right pull-right'></i>" +
                "</a>"
            );
            returnCount += count;
            $(nextParent).appendTo(li);
            $(li).appendTo(parent);
        } else {
            let alertNumber = menu_list[i]["alertNumber"] ? menu_list[i]["alertNumber"] : 0;
            returnCount += alertNumber
            let li = $("<li class='level" + level + "'></li>");
            let a = $("<a class='menuNode' href='javasprict:void(0)'>" +
                // "<i class='fa fa-circle-o'></i>" +
                "<li class='badge pull-right'>" + (alertNumber ? alertNumber : "") + "</li>" +
                menu_list[i].text +
                "</a>");
            $.data(a[0], "data", menu_list[i]);
            a.appendTo(li);
            li.appendTo(parent);
        }
    }
    level--;
    return returnCount;
}

$.fn["eventAndOptionSet"] = function eventAndOptionSet(options) {
    let _this = this

    _this.find('li a').on('click', function (e) {
        let $this = $(this);
        var checkElement = $this.next();

        if (checkElement.is('.treeview-menu') && checkElement.is(':visible')) {
            checkElement.slideUp(menuAnimationSpeed, function () {
                checkElement.removeClass('menu-open');
            });
            checkElement.parent("li").removeClass("active");
        } else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {//If the menu is not visible
            checkElement.slideDown(menuAnimationSpeed, function () {
                checkElement.addClass('menu-open');
            });
        }
        //if this isn't a link, prevent the page from being redirected
        if (checkElement.is('.treeview-menu')) {
            e.preventDefault();
        }
    });

    // 菜单末节点Click
    _this.find('.menuNode').on('click', function (e) {
        if (!$(this).parent().is('.active')) {
            $('.menuNode').parents().removeClass('active')
            $(this).parent().addClass('active')
            if (options && options["onNodeClick"]) {
                options["onNodeClick"]($.data(this, "data"));
            }
        }
        e.preventDefault();
    });
    //尺寸变化
    $(window).on('resize', function (options) {
        $(_this).resize(options["height"], options["width"]);
    })
}

$.fn["getSelectedData"] = function getSelectedData() {
    if ($(this).find('.active').length === 0) {
        return null;
    }
    return $.data($(this).find('.active').children('.menuNode')[0], "data");
};
$.fn["resize"] = function resize(height, width) {
    let menuDiv = $(this);
    if (height) {
        menuDiv.height(height);
    } else {
        let container = menuDiv.parent();
        let h = container.height();
        container.children().each(function () {
            if (!$(this).is(menuDiv)) {
                h -= $(this).innerHeight();
            }
        });
        menuDiv.height(h - 10);
        let sidebar_menu = menuDiv.find('.sidebar-menu');
        let divH = menuDiv.height();
        menuDiv.children().each(function () {
            if (!$(this).is(sidebar_menu)) {
                divH -= $(this).innerHeight();
            }
        });
        sidebar_menu.height(divH - 10);
    }
    if (width) {
        menuDiv.width(width);
    } else {
        menuDiv.width("100%");
    }
};

//如果是alertNumber条件，设定为true或者False，当alertNumber为True，条件为alertNumber不为空,false相反
function selectNodefun(_this, query, onlyActive, speed) {
    let nodes = _this.find('.menuNode');
    let selectNode = nodes[0];
    if (query) {
        for (let i = 0; i < nodes.length; i++) {
            let isMatch = true;
            let nodeDate = $.data(nodes[i], "data");
            for (let key in query) {
                if (key === 'alertNumber') {
                    if (query[key] && !nodeDate[key]) {
                        isMatch = false;
                        break;
                    } else if (!query[key] && nodeDate[key]) {
                        isMatch = false;
                        break;
                    }
                } else {
                    if (nodeDate[key] !== query[key]) {
                        isMatch = false;
                        break;
                    }
                }
            }
            if (isMatch) {
                selectNode = nodes[i];
                break;
            }
        }
    }
    if (speed === null || speed === undefined) {
        speed = menuAnimationSpeed;
    }
    //展开
    $(selectNode).parents('.treeview-menu').slideDown(speed, function () {
        $(this).addClass('menu-open');
        //滚动
        let mainContainer = _this.children('.sidebar-menu');
        if (($(selectNode).offset().top < mainContainer.offset().top) ||
            ($(selectNode).offset().top + $(selectNode).height() > mainContainer.offset().top + mainContainer.height())) {
            //动画效果
            mainContainer.animate({
                scrollTop: $(selectNode).offset().top - mainContainer.offset().top + mainContainer.scrollTop()
            }, 200);//0.2秒滑动到指定位置
        }
    });
    if (selectNode) {
        if (onlyActive) {
            $('.menuNode').parents().removeClass('active');
            $(selectNode).parent().addClass('active');
        } else {
            selectNode.click();
        }
    }
}

$.fn["activeNode"] = function (query, speed) {
    selectNodefun(this, query, true, speed);
};
$.fn["selectNode"] = function (query, speed) {
    selectNodefun(this, query, false, speed);
};
$.fn["clearSelect"] = function (query, speed) {
    $(this).find('.active').removeClass('active')
};