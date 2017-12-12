
var $ = require('jquery');
var ajax = require("util/ajax");
var CONFIG = require('config');

var centerUserTpl = require('./tpl/center-user.tpl');
var footTpl = require('./tpl/integral-bottom.tpl');

var menuName,_callBack;

/*
 * 个人中心公共部分
 */

var center = {
    token: null,
    init: function () {
        var me = this;
        me.initBtn();
        me.isLogin();
        me.clickEven();
    },
    initBtn: function () {
        var me = this;
        $('.top').html(centerUserTpl());
        $('#footer').html(footTpl());
    },
    isLogin: function(){
        var me = this;
        var storage = window.sessionStorage;
        var getLoginname = storage["loginname"];
        var loginStatus = storage["islogin"];
        if(loginStatus == 'yes'){
            $('.loging-welcome').html('Hi,' + getLoginname);
        }
        _callBack(getLoginname);
    },
    clickEven: function(){
        var me = this;
        $('.home,.center-user img').on('click', function(){
            location.href = '../integral-base/integral-home.html';
        });
        $('.harvest-address').on('click', function(){
            location.href = '../center-base/my-address.html';
        });
        $('.my-order').on('click', function(){
            location.href = '../center-base/my-order.html';
        });

        $('.my-car,.shopping-car').on('click', function(){
            location.href = '../my-cart/my-cart.html';
        });
    },
};


/*
 *
 */

module.exports = {
    init: function (callback) {
        _callBack = callback;
        center.init();
    }
};