
var ajax = require('util/ajax');
var header = require('header-nav/header');
var noData = require('no-data/no-data.js');

var limitListTpl = require('mall-home/limit-list');
var listFurnitureTpl = require('mall-home/list-furniture');
var listPlistTpl = require('mall-home/listPlist');
var listHotTpl = require('mall-home/list-hot');
var listNowTpl = require('mall-home/list-now');

var integral = {
    id: null,
	init: function(){
		var me = this;
		header.init(function(){});
        var storage = window.sessionStorage;
        me.id = storage["id"];
        me.lunboBanner();
        me.initData();
        me.clickEven();
        me.allType();
        me.recommendation();
        me.hotking();
	},
    initData: function(){
        var me = this;
    },
    hoverEven: function(){
        var me = this;
        $(".limit_news").slide({
            mainCell:".limit-list",  //切换元素的包裹层对象
            titCell:".tab li",  //导航元素对象（鼠标的触发元素对象）
            effect:"fade",   //动画效果  fade：渐显
            trigger:"mouseover",  //titCell触发方式 || mouseover：鼠标移过触发；
            titOnClassName:'on'   //当前titCell位置自动增加的class名称
        });
    },
    // 轮播图
    lunboBanner: function(){
        var me = this;
        $(".carousel-img").slide({
            mainCell:".bd ul",
            titCell:".hd li",
            effect:"fold",
            autoPlay:true,
            delayTime:1000,
            titOnClassName:"on",
            easing:"swing",
            mouseOverStop:true
        });
    },
    // 所有风格列表
    allType: function(){
        var me = this;
        ajax({
            url: '/eshop/type/all',
            type: 'get',
            data:{
                num: '4',
                level: '2'
            }
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.furnitureUl').html(listFurnitureTpl(respon));
                $('.furnitureNav').html(listNowTpl(respon[0].child));
                $('.furnitureNav').attr('data-id',respon[0].id);
            }
        });
        // 现代风格
        ajax({
            url: '/eshop/product/list',
            type: 'get',
            data: {
                bnum: '001'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.xiandai .introduce').html(listPlistTpl(respon));
                $('.xiandai .immediately').on('click', function(){
                    //var thisId = $(this).attr('data-id');
                    var thisName = $(this).parents('.furniture-title').children('.title-furniture').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&bnum=001'; //+ '&parentId=' + thisId;
                })
            }
        });
        // 美式风格
        ajax({
            url: '/eshop/product/list',
            type: 'get',
            data: {
                bnum: '002'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.meishi .introduce').html(listPlistTpl(respon));
                $('.meishi .immediately').on('click', function(){
                    //var thisId = $(this).attr('data-id');
                    var thisName = $(this).parents('.furniture-title').children('.title-furniture').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&bnum=002'; //+ '&parentId=' + thisId;
                })
            }
        });
        // 欧式风格
        ajax({
            url: '/eshop/product/list',
            type: 'get',
            data: {
                bnum: '003'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.oushi .introduce').html(listPlistTpl(respon));
                $('.oushi .immediately').on('click', function(){
                    //var thisId = $(this).attr('data-id');
                    var thisName = $(this).parents('.furniture-title').children('.title-furniture').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&bnum=003'; //+ '&parentId=' + thisId;
                })
            }
        });
        // 中式风格
        ajax({
            url: '/eshop/product/list',
            type: 'get',
            data: {
                bnum: '005'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.zhongshi .introduce').html(listPlistTpl(respon));
                $('.zhongshi .immediately').on('click', function(){
                    //var thisId = $(this).attr('data-id');
                    var thisName = $(this).parents('.furniture-title').children('.title-furniture').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&bnum=005'; //+ '&parentId=' + thisId;
                })
            }
        });
        // 韩式风格
        ajax({
            url: '/eshop/product/list',
            type: 'get',
            data: {
                bnum: '006'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.hanshi .introduce').html(listPlistTpl(respon));
                $('.hanshi .immediately').on('click', function(){
                    //var thisId = $(this).attr('data-id');
                    var thisName = $(this).parents('.furniture-title').children('.title-furniture').html();
                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&bnum=006'; //+ '&parentId=' + thisId;
                })
            }
        });

    },
    // 限时抢购、新品推荐
    recommendation: function(){
        var me = this;
        ajax({
            url: '/eshop/activity/list',
            type: 'post',
            data: {
                nos: 'ATC2017111912210021840,ATC201711191214032670'
            },
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                var xianshiEnd = respon[0].endTime;
                var xingpin = respon[1].endTime;
                $('.limit-list').html(limitListTpl(respon));
                me.hoverEven();
                setInterval(function(){
                    var nowtime = new Date();
                    var time = new Date(xianshiEnd) - nowtime;
                    var day = parseInt(time / 1000 / 60 / 60 / 24);
                    var hour = parseInt(time / 1000 / 60 / 60 % 24);
                    var minute = parseInt(time / 1000 / 60 % 60);
                    var seconds = parseInt(time / 1000 % 60);
                    if(day >= 0 && hour >= 0 && minute >= 0 && seconds >= 0){
                        $('.limit-list .xianshi .time-detail').html("剩余"+day+"天"+hour+"小时"+minute+"分钟"+seconds+"秒结束");
                    } else {
                        $('.limit-list .xianshi .time-detail').html("已结束！");
                    }
                },1000);
            }
        });
    },
    // 热卖排行
    hotking: function(){
        ajax({
            url: '/eshop/activity/list',
            type: 'post',
            data:{
                nos: 'ATC2017112719115349389'
            }
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.rank-list').html(listHotTpl(respon[0].items));
            }
        });
    },
    clickEven: function(){
        var me = this;
        $('.all-classify').on('click', function(){
            location.href = '../commodity-base/commodity-list.html'
        });
        $('body').on('click','.limit-list ul li', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        })
        $('body').on('click','.rank-list li', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        });

        $('body').on('click', '.furnitureUl>ul>li', function(){
            var thisName = $(this).html();
            var thisId = $(this).parent('ul').attr('data-id');
            var bnum = $(this).parents('.furnitureUl').attr('data-num');
            location.href = '../commodity-base/commodity-list.html#flag=' + thisName + '&parentId=' + thisId + '&bnum=' + bnum;
        });
        $('body').on('click', '.furnitureNav>li', function(){
            var thisName = $(this).html();
            var thisId = $(this).parent('ul').attr('data-id');
            var bnum = $(this).parent('ul').attr('data-num');
            location.href = '../commodity-base/commodity-list.html#flag=' + thisName + '&parentId=' + thisId + '&bnum=' + bnum;
        });

        $('body').on('click','.introduce>ul', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        });
        $('.hot-ranking .more').on('click', function(){
            location.href = '../commodity-base/commodity-list.html';
        })
    }
}

integral.init()