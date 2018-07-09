var msgJSON = {};
$.getJSON("msg/msg.json", function (data) {
    msgJSON = data;
});

function getMessage(msgCode) {
    return msgJSON.messages[msgCode];
}

function getSubJson(name){
    return msgJSON[name];
}