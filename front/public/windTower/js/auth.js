$(function () {
    var authJson = JSON.parse($("#authJson").val());
    //有对象的时候
    if (!isEmptyObject(authJson) && !isEmptyObject(authJson["preData"])) {
        var preData = authJson["preData"]
        for (var key in preData) {
            var subData = preData[key];
            //顶层菜单权限处理
            if ("topMenu" === key) {
                hiddenTopMenuControlFn(subData);
            }
            //控件权限处理
            if ("btn" === key) {
                hiddenBtnControlFn(subData);
            }
            //测风塔相关权限处理
            if("limitAnemometry" === key){
                authLimitAnemometry(subData);
            }
        }
    }
});

//topMenu权限设置
function hiddenTopMenuControlFn(subData) {
    if (!isEmptyObject(subData)) {
        //顶层菜单的所有的索引控件数组
        var topMenuControlLst = $("#header").find("*[authUrl]");
        let index;
        for (index = 0; index < topMenuControlLst.length; index++) {
            var control = topMenuControlLst[index];
            var controlAuthUrl = $(control).attr("authUrl");
            //如果对应的url 不存在权限列表中
            if (!isAuthDataListContainData(controlAuthUrl, subData)) {
                doHiddenActionByFlg(control,true)
            } else {
                doHiddenActionByFlg(control,false)
            }
        }
    }
}

//btn权限设置
function hiddenBtnControlFn(subData) {
    if (!isEmptyObject(subData)) {
        let i;
        for (i = 0; i < subData.length; i++) {
            var control = $("*[authUrl='" + subData[i]["url"] + "']");
            //如果没有控件存在的时候
            if(!control){
             return;
            }
            if (subData[i]["hasAuth"]) {
                doHiddenActionByFlg(control,false);
            }else{
                doHiddenActionByFlg(control,true);
            }
        }
    }
}

//测风塔相关权限设置
function authLimitAnemometry(subData) {
    if (!isEmptyObject(subData)) {
        let towerIdList=[];
        for (var key in subData) {
            towerIdList.push(key);
        }
        $("#towerIdList").val(towerIdList.toString());
    }
}


//url是否存在在AuthDataList中判断
function isAuthDataListContainData(param, AuthDataList) {
    if (!param) {
        return false;
    }
    if (!AuthDataList) {
        return false;
    }
    let i;
    for (i = 0; i < AuthDataList.length; i++) {
        if (AuthDataList[i]["url"] === param) {
            return true;
        }
    }
    return false;
}

//通过action的类型来判断对于隐藏显示事件
function doHiddenActionByFlg(control, ishidden) {
    //对该TopMenu的索引进行对应的action处理
    var authActionType = $(control).attr("authAction");
    if (ishidden){
        if ("hidden" === authActionType) {
            $(control).hide();
        }
        if ("disabled" === authActionType) {
            $(control).attr("disabled", true);
        }
        if ("visibility" === authActionType) {
            $(control).css("visibility", "hidden");
        }
    } else {
        if ("hidden" === authActionType) {
            $(control).show();
        }
        if ("disabled" === authActionType) {
            $(control).attr("disabled", false);
        }
        if ("visibility" === authActionType) {
            $(control).css("visibility", "visable");
        }
    }
}