//路由集合

var control = require('./controllers/index');

var login = require('./controllers/login');
var dataManage = require('./controllers/dataManage');
var dataManageUpload = require('./controllers/dataManageUpload');
var windTowerManage = require('./controllers/windTowerManage');
var warnManage = require('./controllers/warnManage');
var warnManageProcess = require('./controllers/warnManageProcess');
var warnView = require('./controllers/warnView');
var windTowerDetail = require('./controllers/windTowerDetail');
var windTowerDetailView = require('./controllers/windTowerDetailView');
var userRuleSet = require('./controllers/userRuleSet');
var mapDisplay = require('./controllers/mapDisplay');
let towerMenu = require('./controllers/towerMenu');
var auth = require('./controllers/common/auth');

module.exports = function (app, passport) {
    app.get('', login.index);
    app.get('/windTower', login.index);
    app.post('/windTower/login', login.login);
    app.get("/windTower/loginFromFY", login.loginFromFY);
    app.post("/browserClose",login.browserClose);

    /*
     * 系统首页
     */
    // app.get('/windTower/index', control.index);

    //业务共通
    app.post('/windTower/towerMenu/getTowerMenuData', towerMenu.getTowerMenuData);

    //测试画面
    app.get('/windTower/index',auth.needTopMenu,auth.needBtn,auth.authRedirect,auth.needLimitAnemometry, control.index);

    //数据管理
    app.get('/windTower/dataManage',auth.needTopMenu,auth.needBtn,auth.authRedirect, auth.needLimitAnemometry,dataManage.index);
    app.get('/windTower/dataManage/getTowersData', dataManage.getTowersData);
    app.get('/windTower/dataManage/getTableData', dataManage.getTableData);
    app.get('/windTower/dataManage/getWindSpeedChart', dataManage.getWindSpeedChart);
    app.get('/windTower/dataManage/download',auth.checkAuth, dataManage.download);
    app.get('/windTower/dataManage/downloadFile', dataManage.downloadFile);
    app.get('/windTower/dataManage/delete', auth.checkAuth,dataManage.delete);
    app.get('/windTower/dataManage/setToMainData',auth.checkAuth, dataManage.setToMainData);
    app.post('/windTower/dataManageUpload/dataUpload', dataManageUpload.dataUpload);
    app.post('/windTower/dataManageUpload/createPath',auth.checkAuth, dataManageUpload.createPath);

    //测风塔管理
    app.get('/windTower/windTowerManage',auth.needTopMenu,auth.needBtn,auth.authRedirect,auth.needLimitAnemometry, windTowerManage.index);
    app.post('/windTower/windTowerManage/getTowersData', windTowerManage.getTowersData);
    app.post('/windTower/windTowerDetail/init', windTowerDetail.init);
    app.post('/windTower/windTowerDetail/editLoad', windTowerDetail.editLoad);
    app.post('/windTower/windTowerDetail/add',auth.checkAuth, windTowerDetail.save);
    app.post('/windTower/windTowerDetail/edit',auth.checkAuth, windTowerDetail.save);
    app.post('/windTower/windTowerDetail/delete',auth.checkAuth, windTowerDetail.delete);
    app.post('/windTower/windTowerDetailView/viewLoad', windTowerDetailView.viewLoad);

    //报警管理
    app.get('/windTower/warnManage',auth.needTopMenu,auth.needBtn,auth.authRedirect,auth.needLimitAnemometry, warnManage.index);
    app.post('/windTower/warnManage/getWarnTableData', warnManage.getWarnTableData);
    app.post('/windTower/warnManage/getFixAreaTableData', warnManage.getFixAreaTableData);
    app.post('/windTower/warnManageProcess/save',auth.checkAuth, warnManageProcess.save);
    app.post('/windTower/warnManageProcess/dataUpload', warnManageProcess.dataUpload);
    app.post('/windTower/warnManageProcess/createPath',auth.checkAuth,  warnManageProcess.createPath);
    app.post('/windTower/warnView/getData', warnView.getData);

    //权限管理
    app.get('/windTower/userRuleSet',auth.needTopMenu,auth.needBtn,auth.authRedirect,auth.needLimitAnemometry, userRuleSet.index);
    app.post('/windTower/userRuleSet/getUsersMenuData', userRuleSet.getUsersMenuData);
    app.post('/windTower/userRuleSet/getProjectsData', userRuleSet.getProjectsData);
    app.post('/windTower/userRuleSet/getTowerData', userRuleSet.getTowerData);
    app.get('/windTower/userRuleSet/getAllowedAnemometry', userRuleSet.getAllowedAnemometry);
    
    //地图展示
    app.get('/windTower/mapDisplay',auth.needTopMenu,auth.needBtn,auth.authRedirect,auth.needLimitAnemometry, mapDisplay.index);
    app.get('/windTower/mapDisplay/getCharts', mapDisplay.getCharts);
    app.get('/windTower/mapDisplay/getAverageSpeed', mapDisplay.getAverageSpeed);
};
