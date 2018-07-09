let selectNodeId="";

function buildMenuTree(menuDiv, data, onSelectfun, option) {
    menuDiv.css({"overflow": "auto"})

    option = option ? option : {
        // showCheckbox:true,
        showTags: true,
        backColor: "#222d32",
        multiSelect:false,
        color: "#fff7fb",
        showBorder: false,
        onhoverColor: "#5baba6",
        collapseIcon: "fa fa-chevron-down",
        expandIcon: "fa fa-chevron-right",
        onNodeSelected: onSelectfun,
        onNodeUnselected : function(event, data) {
            // menuDiv.treeview('selectNode', [data.nodeId,{ silent:false }]);
        }
    }

    option["data"]=data;

    menuDiv.treeview(option);

    let container = menuDiv.parent();
    let h = container.height();
    container.children().each(function () {
        if (!$(this).is(menuDiv)) {
            h -= $(this).height();
        }
    });
    menuDiv.height(h);

}

function buildCheckBoxTree(treeDiv, data, onSelectfun, option) {
    treeDiv.css({"overflow": "auto"})

    option = option ? option : {
        showCheckbox: true,
        collapseIcon: "fa fa-chevron-down",
        expandIcon: "fa fa-chevron-right",
        onNodeSelected: onSelectfun,
    };
    option["data"]=data;

    treeDiv.treeview(option);
}