//显示和隐藏tab
function showAndHidden(data) {
    if (data === 'changeData') {
        $('#processMemoTab').hide();
        $('#changeDataTab').show();
        $('#btnUpd').show();
        $('#save').hide();
    } else if (data === 'processMemo') {
        $('#changeDataTab').hide();
        $('#processMemoTab').show();
        $('#btnUpd').hide();
        $('#save').show();
    }
}

var FileInput = function () {
    var oFile = new Object();
    oFile.Init = function (ctrlName, uploadUrl) {
        var control = $('#' + ctrlName);
        control.fileinput({
            language: 'zh', //设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['RWD', 'csv'],//接收的文件后缀
            showCaption: true,//是否显示标题
            showUpload: false, //是否显示上传按钮
            browseClass: "btn btn-default", //按钮样式
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            multiple: true,
            previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
            dropZoneEnabled: false,
            uploadAsync: true
        });
    }
    return oFile;
};

//errorLog输出
function outputLog(validateStatus, waitProcessList) {
    var hasError = false;
    validateStatus.typeError.forEach(function (item) {
        appendMsg('文件名错误:' + item, 'error');
        hasError = true;
    });

    waitProcessList = waitProcessList.toString() + ',';
    validateStatus.successDate.forEach(function (item) {
        waitProcessList = waitProcessList.replace(eval('/' + item + ',' + '/g'), '');
    });
    if ((waitProcessList !== '' && validateStatus.successDate.length > 0) || validateStatus.overDate.length > 0) {
        hasError = true;
        appendMsg('日期匹配错误:', 'error');
        if (waitProcessList !== '' && validateStatus.successDate.length > 0) {
            appendMsg('缺失日期:' + waitProcessList.substr(0, waitProcessList.length - 1), 'error');
        }
        if (validateStatus.overDate.length > 0) {
            appendMsg('多选择日期:' + validateStatus.overDate.toString(), 'error');
        }
    }
    return hasError;
}

function appendMsg(msg, msgLevel) {
    var color = msgLevel === 'error' ? 'red' : 'green';
    $('#updStatus').prepend('<li class="list-group-item" style="color:' + color + '">' + msg + '</li>');
}

//根据日期集合改变待处理日期颜色
function changeDateColor(fileDate, color) {
    fileDate.forEach(function (fd) {
        $('#waitProcess [data-date=' + fd + ']').css('color', color);
    });
}

function saveFixData(fixMethod, memo, saveDateList) {
    var data = {
        processDate: saveDateList,
        memo: memo,
        towerId: $('#menuDiv').getSelectedData()._id,
        fix_method: fixMethod
    };
    $.ajax({
        url: "/windTower/warnManageProcess/save",
        method: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (result) {
            if (result.errorCode) {
                error(getMessage(result.errorCode));
            } else {
                if (fixMethod === '保留处理') {
                    $('#processModal').modal('hide');
                    buildMenu($("#searchInp").val(), $('#currentTowerId').val());
                }
            }
        }
    });
}

//正在上传中状态
var updating = false;
$(function () {
    $('#processModal').on('hide.bs.modal', function (e) {
        //如果在上传或者在解析，不许关闭模态框
        if (updating) {
            e.preventDefault();
            warning('正在上传中，请勿关闭窗口');
        }
    });

    $(".form-control").on('change', function () {
        if ($(this)[0].type === "select-one") {
            $(this).selectpicker('setStyle', 'c-errorBgColor', 'remove')
        } else {
            $(this).removeClass('c-errorBgColor');
        }
    });

    $('#processMemoTab').hide();
    $('#save').hide();

    $('#save').on('click', function () {
        var msg = [];
        var $processMemo2 = $('#processMemo2');
        var flag = mustCheck($processMemo2.val(), "处理备注", msg);
        if (!flag) {
            $processMemo2.addClass('c-errorBgColor');
            warning(msg);
            return;
        }
        $processMemo2.removeClass('c-errorBgColor');

        saveFixData('保留处理', $('#processMemo2').val(), $('#dateList').val().split(','));
    });


    var oFileInput = new FileInput();
    oFileInput.Init("localFile", "/windTower/warnManageProcess/dataUpload");

    //导入文件上传完成之后的事件
    $("#localFile").on("fileuploaded", function (event, data, previewId, index) {
        var response = data.response;
        //上传成功
        var fileDate = [];
        response.fileName.forEach(function (fn) {
            var nameList = fn.split('.');
            if (nameList[1].toLowerCase() === 'csv') {
                var date = nameList[0].split('_')[1];
                fileDate.push(date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2));
            } else {
                var date = nameList[0].substr(nameList[0].length - 11, 8);
                fileDate.push(date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2));
            }
        });

        if (response.status) {
            var postData = JSON.stringify({
                "towerId": $('#menuDiv').getSelectedData()._id,
                "dataPassword": $('#password').val(),
                "userId": "test",
                "filePath": response.filePath
            });
            //发起解析请求
            $.ajax({
                type: "post",
                url: $('#backendUrl').val(),
                data: postData,
                dataType: "json",
                headers: {"Content-Type": "application/json"},
                success: function (result) {
                    var errorList = result.errorList;
                    var msgJson = getSubJson('autoUploadError');
                    var saveDateList = [];

                    if (result.errorCode) {
                        $('#btnUpd,#btnProcessCancel').prop('disabled', '');
                        appendMsg(result.message, 'error');
                        $('#waitProcess span').css('color', 'red');
                    } else {
                        //循环待处理日期
                        var allClear = true;
                        $('#dateList').val().split(',').forEach(function (pd) {
                            var flg = false;//true:err数据
                            //判断是否是包含在errorList中
                            if (errorList) {
                                for (var i = 0; i < errorList.length; i++) {
                                    if (pd === errorList[i].errorDate) {
                                        flg = true;
                                        break;
                                    }
                                }
                            }

                            if (flg) {
                                appendMsg(msgJson[errorList[i].errorCode] + errorList[i].errorFile, 'error');
                                //待处理日期变红
                                $('#waitProcess [data-date=' + msgJson[errorList[i].errorDate] + ']').css('color', 'red');
                                allClear = false;
                            } else {
                                appendMsg(pd + '解析成功', 'info');
                                $('#waitProcess span').css('color', 'green');

                                saveDateList.push(pd);
                            }
                        });
                        //如果全部成功，取消按钮变成完成
                        if (allClear) {
                            $('#btnProcessCancel').prop('disabled', '');
                            $('#btnProcessCancel').text('完成');
                            $('#btnUpd').css("display","none")
                            $('#btnProcessCancel').on('click', function () {
                                buildMenu($("#searchInp").val(), $('#currentTowerId').val());
                            });
                            saveFixData('上传修复', $('#processMemo').val(), saveDateList);//保存备注

                        } else {
                            $('#btnUpd,#btnProcessCancel').prop('disabled', '');
                        }


                        $('.fileinput-remove').trigger('click');
                        if (allClear) {//全部成功，上传按钮disabled
                            $('#btnUpd').prop('disabled', 'disabled');
                        }
                    }
                    updating = false;
                },
                error: function (result) {
                    appendMsg('发生未知错误，解析失败', 'error');
                    changeDateColor(fileDate, 'red');
                    $('.fileinput-remove').trigger('click');
                    updating = false;
                    $('#btnUpd,#btnProcessCancel').prop('disabled', '');
                }
            });
            appendMsg(' 上传成功,等待解析中....', 'info');
        } else {
            appendMsg('发生未知错误 上传失败', 'error');
            changeDateColor(fileDate, 'red');
            $('.fileinput-remove').trigger('click');
            updating = false;
            $('#btnUpd,#btnProcessCancel').prop('disabled', '');
        }
    });

    //上传前出错的情况
    $("#localFile").on("fileuploaderror", function (event, data, previewId, index) {
        $('#updStatus').empty();//清空处理结果
        warning(previewId);
    });

    //点击移除后的事件
    $("#localFile").on('filecleared', function (event, data, msg) {
        updating = false;
        $('#btnUpd,#btnProcessCancel').prop('disabled', '');
    });

    $('#btnUpd').on('click', function () {
        var $localFile = $('#localFile');
        //没有有效文件就不处理
        if ($localFile.fileinput('getFilesCount') <= 0) {
            return;
        }

        //处理备注必入校验
        var msg = [];
        var $processMemo = $('#processMemo');
        var flag = mustCheck($processMemo.val(), "处理备注", msg);
        if (!flag) {
            $processMemo.addClass('c-errorBgColor');
            warning(msg);
            return;
        }
        $processMemo.removeClass('c-errorBgColor');

        $('#updStatus').empty();//清空处理结果
        var waitProcessList = $('#dateList').val().split(',');//待处理日期列表
        var originalFiles = $localFile.fileinput('getFileStack');
        var successFiles = [];//通过校验的文件列表
        //没通过校验的文件
        var validateStatus = {
            typeError: [],
            overDate: [],
            successDate: []
        };
        //开始校验文件名
        for (var i = 0; i < originalFiles.length; i++) {
            //分割后缀名和文件名
            var nameList = originalFiles[i].name.split('.');
            if (nameList.length != 2 || nameList[1].toLowerCase() !== $('[name="fileType"]:checked').val().toLowerCase()) {
                $localFile.fileinput('updateStack', i, null);
                validateStatus.typeError.push(originalFiles[i].name);
                continue;
            }
            if (nameList[1].toLowerCase() === 'csv') {//D144083_20150420_0000.csv
                var date = nameList[0].split('_')[1];//获取文件日期
                if (date === undefined) {
                    $localFile.fileinput('updateStack', i, null);
                    validateStatus.typeError.push(originalFiles[i].name);
                    continue;
                }
                var formatedDate = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);//format to YYYY-MM-DD
                if ($.inArray(formatedDate, waitProcessList) >= 0) {
                    validateStatus.successDate.push(formatedDate);
                } else {
                    validateStatus.overDate.push(formatedDate);
                    $localFile.fileinput('updateStack', i, null);
                }
            } else {
                var date = nameList[0].substr(nameList[0].length - 11, 8);//从后三位开始截日期
                if (date === undefined) {
                    $localFile.fileinput('updateStack', i, null);
                    validateStatus.typeError.push(originalFiles[i].name);
                    continue;
                }
                var formatedDate = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);//format to YYYY-MM-DD
                if ($.inArray(formatedDate, waitProcessList) >= 0) {
                    validateStatus.successDate.push(formatedDate);
                } else {
                    validateStatus.overDate.push(formatedDate);
                    $localFile.fileinput('updateStack', i, null);
                }
            }
        }

        //对校验失败的文件进行log输出
        var hasError = outputLog(validateStatus, waitProcessList);
        //只有在有文件和校验通过的情况下才进行上传
        if ($localFile.fileinput('getFilesCount') > 0 && !hasError) {
            updating = true;
            $.post('/windTower/warnManageProcess/createPath', {towerId: $('#menuDiv').getSelectedData()._id}, function (result) {
                if (result.errorCode) {
                    updating = false;
                    error(getMessage(result.errorCode));
                } else {
                    if (!result.status) {
                        updating = false;
                        appendMsg(result.errorMsg, 'error');
                    } else {
                        $localFile.fileinput('upload');
                        $('#btnUpd,#btnProcessCancel').prop('disabled', 'disabled');
                    }
                }
            });
        }
    });

    //radio改变时清空fileInput
    $('[name="fileType"]').on('change', function () {
        $('.fileinput-remove').trigger('click');
    });
});
$('#processModal').on('hidden.bs.modal' , function () {
    if ($('#btnProcessCancel').text()=== "完成"){
        buildMenu($("#searchInp").val(), $('#currentTowerId').val());
    }
})