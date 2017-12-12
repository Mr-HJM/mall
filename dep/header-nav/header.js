
var $ = require('jquery');
var ajax = require("util/ajax");
var jsonp = require('jquery.jsonp.js');

var headTpl = require('./tpl/integral-top.tpl');
var typeListTpl = require('./tpl/type-list.tpl');
var hotListTpl = require('./tpl/hot-list.tpl');
var moreFenTpl = require('./tpl/more-fen.tpl');
var footTpl = require('./tpl/integral-bottom.tpl');
var menuName, _callBack;

/*
 * 头部、尾部导航
 */

var header = {
    id: null,
    init: function () {
        var me = this;
        var storage = window.sessionStorage;
        me.id = storage["id"];
        me.initBtn();
    },
    initBtn: function () {
        var me = this;
        ajax({
            url: '/eshop/belong/all',
            type: 'get'
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('#header').html(headTpl(list));
                $('body').on('click', '.my-order' ,function(){
                    location.href = '../center-base/my-order.html';
                });

                $('body').on('click', '.my-car' ,function(){
                    location.href = '../my-cart/my-cart.html';
                });
                _callBack()

                $('.logo img').on('click', function(){
                    location.href = '../integral-base/integral-home.html';
                });
                // 非首页划过全部商品分类显示
                var url = window.location.pathname;
                var splitUrl = url.split('/');
                if(splitUrl[3] != 'integral-home.html'){
                    $('.all-list').hide();
                    $('.all-classify').on('mouseenter', function(){
                        $('.all-list').slideDown(200);
                    });
                    $('.all-list').on('mouseleave', function(){
                        $('.all-list').slideUp(200);
                    });
                } else {
                    $('.all-list').show();
                }
                me.isLogin();
                me.logingBtn();
                me.allType();
                me.hotList();
                me.searchName();
                me.searchHot();

                $('.nav-classify li').on('click', function(){
                    var thisId = $(this).attr('data-id');
                    var thisName = $(this).html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
                });
            }
        });
        $('#footer').html(footTpl());
    },
    // 登录、注册操作
    logingBtn: function(){
        var me = this;
        $('body').on('click', '.top .loging',function(){
            location.href = '../integral-base/login.html';
        });
        $('body').on('click', '.top .register',function(){
            location.href = '../integral-base/register.html';
        });
    },
    isLogin: function(){
        var me = this;
        var storage = window.sessionStorage;
        var getLoginname = storage["loginname"];
        var loginStatus = storage["islogin"];
        //var date = storage["date"];

        if(loginStatus == 'yes'){
            $('.top .site-loged').hide();
        } else {
            $('body').on('click','.site-loging-success li', function(){
                location.href = '../integral-base/login.html'
            });
        }
    },
    hotList: function(){
        var me = this;
        ajax({
            url: '/eshop/type/plist',
            type: 'get',
            data:{
                num: '6'
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.search-hot').html(hotListTpl(list));
            }
        });
    },
    allType: function(){
        var me = this;
        ajax({
            url: '/eshop/type/all',
            type: 'get',
            data:{
                accountId: me.id,
                level: '2'
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                //console.log(list);
                $('.all_list').html(typeListTpl(list));
                $('.more-fen').html(moreFenTpl(list));
                $('.all_list>li:gt(5)').remove();

                $('.all_list>li').on('mouseenter', function(){
                    if($(this).children('.classif-detail').find("ul li").length > 0){
                        $(this).children('.classif-detail').show();
                    }
                });
                $('.all_list>li').on('mouseleave', function(){
                    $(this).children('.classif-detail').hide();
                });
                if(data.result.length > 5){
                    $('.topCon .all-list .more-categories').on('mouseenter', function(){
                        $('.more-fen').show();
                    });
                    $('.topCon .all-list .more-categories').on('mouseleave', function(){
                        $('.more-fen').hide();
                    });
                }

                // 全部商品分类下
                $('.all_list>li').on('click', function(e){
                    //e.stoppropagation();
                    var thisId = $(this).attr('data-id');
                    var thisName = $(this).children('.list-title').html().split('•')[1].trim();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
                });
                /*$('.all_list>li>.list-hot>li').on('click', function(e){
                    var thisId = $(this).attr('data-id');
                    var thisName = $(this).html();
                    location.href = '../commodity-base/commodity-list.html#flag=' + thisName + '&parentId=' + thisId;
                    e.stoppropagation();
                });*/
                $('body').on('click', '.all_list>li>.classif-detail>ul>li',function(e){
                    //e.stoppropagation();
                    var thisId = $(this).attr('data-id');
                    var thisName = $(this).html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
                });

                $('body').on('click', '.more-categories .more-fen .more-list',function(e){
                    //e.stoppropagation();
                    var thisId = $(this).attr('data-id');
                    var thisName = $(this).children('div').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
                });
            }
        });
    },
    searchName: function(){
        var me = this;
        $('body').on('click','.search .search-btn', function(){
            var goodName = $('.search-name').val();
            ajax({
                url: '/eshop/product/query',
                type: 'post',
                data:{
                    name: goodName
                }
            }).then(function(data){
                if(data.status == 200){
                    var list = data.result;
                    window.open('../commodity-base/commodity-list.html#name=' + goodName);
                }
            });
        })
    },
    searchHot: function(){
        var me = this;
        $('body').on('click', '.search-hot li',function(){
            var hotName = $(this).html();
            var parentId = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-list.html?flag=' + hotName + '&parentId=' + parentId;
        })
    }
};

/*
 *
 */

module.exports = {
    init: function (callback) {
        _callBack = callback;
        header.init();
    }
};