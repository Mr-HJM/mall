
var $ = require('jquery');
var ajax = require("util/ajax");
var CONFIG = require('config');
var centerUserTpl = require('./tpl/exchange-center-user.tpl');
var centerNavTpl = require('./tpl/exchange-center-nav.tpl');
var logingSuccessTpl = require('./tpl/exchange-loging-success.tpl');
var logingWarnTpl = require('./tpl/exchange-loging-warn.tpl');

var menuName,roleData,_callback;

/*
 * 个人中心公共部分
 */

var center = {
    token: null,
    accountId: null,
    userId: null,
    organizeName: null,
    organizeId: null,
    personId: null,
    code:null,
    init: function () {
        var self = this;
        self.currentRole();
        self.initBtn();
        self.clickUrl();
    },
    // 获取角色
    currentRole: function(){
        var my = this;
        $.jsonp({
            url: CONFIG.URL.CHECK_LOGIN,
            callback: "callbackHandler",
            success: function (data) {
                // console.log(data);
                roleData = data;
                if (!roleData.chooseUserId && roleData.users) {
                    roleData.chooseUserId = roleData.users[0].userId;
                }
                var userIdentity;
                var organizeName;
                var USERES = roleData.users;
                for(var i = 0;i<USERES.length;i++){
                    USERES[i].name = USERES[i].organizeName + '-' + roleData.showname;
                    if (roleData.chooseUserId == USERES[i].userId) {
                        my.organizeName = USERES[i].organizeName;
                        my.organizeId = USERES[i].organizeId;
                        my.userId = USERES[i].userId;
                        my.token = roleData.token;
                        my.accountId = roleData.accountId;
                        my.personId = roleData.personId;
                    }
                }
                my.visitSpace();
                my.getLevel();
            }
        });
    },
    // 获取头像，姓名
    visitSpace: function () {
        var me = this;
        ajax({
            url: '/rest/rrt/guestspace',
            type: 'get',
            data: {
                accountId: me.accountId || me.userId,
                access_token: me.token
            }
        }).then(function(data){
            if(data.status == 200){
                var rex = /^http/;
                if (rex.test(data.result.avatarLink)) {
                    data.result.imgurl = "";
                } else {
                    data.result.imgurl = config.URL.UPLOAD;
                }
                $('.currents').append(logingSuccessTpl(data.result));
            } else {
                $('.currents').append(logingWarnTpl());
            }
        });
    },
    // 获取等级
    getLevel: function(){
        var me = this;
       
    },
    initBtn: function () {
        var _This = this;
        $('#center').html(centerUserTpl());
    },
    clickUrl: function(){
        var me = this;
        // 我的订单
        $('body').on('click', '.my-order', function(){
            location.href = '../center-personal/my-ticket.html'
        });
        // 收货信息
        $('body').on('click', '.receiving-information', function(){
            location.href = '../center-personal/delivery-address.html'
        })
    }
};


/*
 * 
 */

module.exports = {
    init: function (callback) {
        _callBack = callback
        center.init();
    }
};