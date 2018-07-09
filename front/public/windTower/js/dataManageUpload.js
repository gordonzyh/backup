var FileInput = function () {
    var oFile = new Object();

    oFile.Init = function (ctrlName, uploadUrl) {
        var control = $('#' + ctrlName);

        control.fileinput({
            language: 'zh', //设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['txt', 'tim', 'RWD', 'csv', 'zip'],//接收的文件后缀
            showCaption: true,//是否显示标题
            showUpload: false,
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

function appendMsg(msg, msgLevel) {
    var color = msgLevel === 'error' ? 'red' : 'green';
    $('#updStatus').prepend('<li class="list-group-item" style="color:' + color + '">' + msg + '</li>');
}

//正在上传中状态
var updating = false;
$(function () {
    $('#updModal').on('hide.bs.modal', function (e) {
        //如果在上传或者在解析，不许关闭模态框
        if (updating) {
            e.preventDefault();
            warning('正在上传中，请勿关闭窗口');
        }
    });

    var oFileInput = new FileInput();
    oFileInput.Init("localFile", "/windTower/dataManageUpload/dataUpload");

    $(".form-control").on('change', function () {
        $(this).removeClass('c-errorBgColor');
    });

    //导入文件上传完成之后的事件
    $("#localFile").on("fileuploaded", function (event, data, previewId, index) {
        var response = data.response;

        //上传成功
        if (response.status) {
            var postData = JSON.stringify({
                towerId: $('#menuDiv').getSelectedData()._id,
                startTime: $('#startDateDetail').val(),
                timeInterval: $('#interval').val(),
                dataPassword: $('#dataPassword').val(),
                height: $('#height').val(),
                filePath: response.filePath,
                updUser: "test",//TODO
                updIndex: $('#currentUpdIndex').val(),
                updMemo: $('#updMemo').val()
            });


            $.ajax({
                type: "post",
                url: $('#backendUploadUrl').val(),
                data: postData,
                dataType: "json",
                headers: {"Content-Type": "application/json"},
                success: function (result) {
                    var errorList = result.errorList;
                    var msgJson = getSubJson('autoUploadError');

                    if (errorList && errorList.length > 0) {
                        errorList.forEach(function (err) {
                            appendMsg(getMessage(err.errorCode) + err.errorFile, 'error');
                        });
                        $('#btnUpd,#btnCancel').prop('disabled', '');
                    } else if (result.errorCode || result.message) {
                        appendMsg(result.message, 'error');
                        $('#btnUpd,#btnCancel').prop('disabled', '');
                    } else {
                        appendMsg('解析成功' + result.message, 'info');
                        $('#btnCancel').prop('disabled', '');
                        $('#btnCancel').text('完成');
                        $('#btnUpd').css("display","none")
                        //刷新grid
                        $('#btnCancel').on('click', function () {
                            getGridData($('#menuDiv').getSelectedData()._id);
                        });
                    }

                    $('.fileinput-remove').trigger('click');
                    updating = false;
                },
                error: function () {
                    appendMsg('发生未知错误,解析失败', 'error');
                    $('.fileinput-remove').trigger('click');
                    $('#btnUpd,#btnCancel').prop('disabled', '');
                    updating = false;
                }
            });

            response.message.forEach(function (message) {
                appendMsg(message + ' 上传成功,正在解析中。。。', 'info');
            });
        } else {
            appendMsg(response.message + ' 上传失败', 'error');
            $('.fileinput-remove').trigger('click');
            $('#btnUpd,#btnCancel').prop('disabled', '');
            updating = false;
        }

    });

    //上传前出错的情况
    $("#localFile").on("fileuploaderror", function (event, data, previewId, index) {
        $('#updStatus').empty();//清空处理结果
        warning(previewId);
    });

    //点击移除后的事件
    $("#localFile").on('filecleared',function(event, data, msg){
        updating=false;
        $('#btnUpd,#btnCancel').prop('disabled', '');
    });

    $('#btnUpd').on('click', function () {
        var msg = [];
        var $updMemo = $('#updMemo');
        var $localFile = $('#localFile');
        var files = $localFile.fileinput('getFileStack');
        $('#updStatus').empty();//清空处理结果
        //表单校验
        mustCheck($updMemo.val(), '上传描述', msg) ? $updMemo.removeClass('c-errorBgColor') : $updMemo.addClass('c-errorBgColor');
        for (var i = 0; i < files.length; i++) {
            var fileSplit = files[i].name.split('.');
            //压缩文件和其它文件是否复数存在
            if (fileSplit[fileSplit.length - 1].toLowerCase() === 'zip' && files.length > 1) {
                msg.push('zip类型文件必须单独上传');
                flag = false;
                break;
            }
        }
        if (msg.length > 0) {
            warning(msg);
            return;
        }

        //只有在有文件和校验通过的情况下才进行上传
        if ($localFile.fileinput('getFilesCount') > 0) {
            $updMemo.removeClass('c-errorBgColor');
            //请求创建路径
            updating = true;
            $.post('/windTower/dataManageUpload/createPath', {towerId: $('#menuDiv').getSelectedData()._id}, function (result) {
                if(result.errorCode){
                    updating = false;
                    error(getMessage(result.errorCode));
                }else{
                    if (!result.status) {
                        updating = false;
                        appendMsg(result.errorMsg, 'error');
                    } else {
                        $localFile.fileinput('upload');
                        $('#btnUpd,#btnCancel').prop('disabled', 'disabled');
                    }
                }

            });
        } else {
            warning('请选择正确的文件类型');
        }
    });

});

$('#updModal').on('hidden.bs.modal' , function () {
    if ($('#btnCancel').text()=== "完成"){
        getGridData($('#menuDiv').getSelectedData()._id);
    }
})