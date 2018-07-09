//日期控件建立
$.fn.buildCalendar = function (inputId, option) {
    $(this).css("width:100%");
    $(this).addClass("input-group date form_date");
    $(this).append('<input id="' + inputId + '" class="form-control" size="16" type="text"' +
        ' value="" readonly> <span class="input-group-addon"><span class="fa' +
        ' fa-calendar"></span></span>');
    let buildOption = {
        format: "yyyy-mm-dd",
        language: 'zh-CN',
        weekStart: 0,
        autoclose: true,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
        pickerPosition: "bottom-left"
    }
    if (option) {
        $.extend(buildOption, option)
    }
    $(this).datetimepicker(buildOption);
};
$.fn.calendarSetDate = function (date) {
    if (date) {
        $(this).parent().datetimepicker('setDate', new Date(Date.parse(date.replace(/-/g, "/"))));
    }else{
        $(this).parent().datetimepicker('reset');
    }
};

//建立数字框
$.fn.buildNumber = function (option) {
    let buildOption = {
        verticalbuttons: true,
        min: -99999999999,
        max: 99999999999,
        step: 1,
        boostat: 2,
        maxboostedstep: 10,
        buttondown_class: 'btn btn-default',
        buttonup_class: 'btn btn-default',
        verticalup: '',
        verticaldown: '',
        verticalupclass: 'fa fa-angle-up',
        verticaldownclass: 'fa fa-angle-down',
    };
    if (option) {
        $.extend(buildOption, option)
    }
    $(this).TouchSpin(buildOption);
    $(this)[0].parentNode.style.width = "100%";
}