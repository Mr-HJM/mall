
var ajax = require('util/ajax');
var header = require('header-nav/header');
var noData = require('no-data/no-data.js');
var pager = require('page-break/page-break.js');
var util = require('utilspare/util.js');

var commodityList = require('commodity-list/commodity-list');
var choiceList = require('commodity-list/choice-list');
var leftlist = require('commodity-list/commodity-left-list');
var hotlist = require('commodity-list/hot-list');
var typelist = require('commodity-list/type-list');

var commodity = {
    flag: null,
    flaG: null,
    parentId: null,
    parentID: null,
	pageNumber: '1',
    orderField: '',
    orderDesc: 'asc',
    searchName: '',
    accountId: null,
	init: function(){
		var me = this;
		header.init(function(){});
        var urlSearch = window.location.search;
        me.flaG = urlSearch.split('=')[1];
        me.parentID = urlSearch.split('=')[2];

        me.searchName = util.getParams('name');
        me.flag = util.getParams('flag');
        me.parentId = util.getParams('parentId');
        var storage = window.sessionStorage;
        me.accountId = storage["id"];
        $('.all-list').hide();
        me.clickEven();
        me.getList();
        me.choiceGood();
        me.leftList();
        me.hotList();
        me.allType();
	},
	getList: function(){
		var me = this;
		ajax({
            url: '/eshop/product/query',
            type: 'post',
            data: {
                typeId: me.parentId || me.parentID,
                name: me.searchName,
                orderField: me.orderField,
                orderDesc: me.orderDesc,
            	pageSize: '20',
            	curPageNumber: me.pageNumber
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.commodity-right-list').html(commodityList(list.list));
                pager.init($("#page"), me.pageNumber, list.pager.totalPage, function (curPgNum) {
                    me.pageNumber = curPgNum;
                    me.getList();
                });
            }
        });
	},
    leftList: function(){
        var me = this;
        ajax({
            url: '/eshop/activity/list',
            type: 'post',
            data: {
                nos: 'ATC2017111921080682291'
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.commodity-left').html(leftlist(list[0].items));
            }
        });
    },
    // 精选商品
    choiceGood: function(){
        var me = this;
        ajax({
            url: '/eshop/activity/list',
            type: 'post',
            data: {
                nos: 'ATC2017111921141850052'
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.choice-list').html(choiceList(list[0].items));
                $('.choice-list>div:gt(4)').remove();
            }
        });
    },
    // 热销排行榜
    hotList: function(){
        var me = this;
        ajax({
            url: '/eshop/activity/list',
            type: 'post',
            data:{
                nos: 'ATC2017111921025791892'
            }
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.hot-list').html(hotlist(respon[0].items));
                $('.hot-list li:gt(3)').remove();
            }
        });
    },
    // 分类名称
    allType: function(){
        var me = this;
        ajax({
            url: '/eshop/type/all',
            type: 'get',
            data:{
                accountId: me.accountId,
                level: '2'
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                //console.log(list);
                $('.type-list ul').html(typelist(list));
                if(me.flag != null && me.flag != ''){
                    $('.type-list .type-name').html("<span class='deletePar'>" + me.flag + "：&nbsp;&nbsp;</span>");
                    ajax({
                        url: '/eshop/type/childs',
                        type: 'get',
                        data:{
                            id: me.parentId || me.parentID
                        }
                    }).then(function(json){
                        if(json.status == 200){
                            var lists = json.result;
                            $('.type-list ul').html(typelist(lists));
                        }
                    });
                }
            }
        });
    },
	clickEven: function(){
		var me = this;
        $('body').on('click', '.type-list ul li', function(){
            if($('.type-name').html() == "分类名称："){
                $('.type-list .type-name').html("<span class='deletePar'>" + $(this).html() + "：&nbsp;&nbsp;</span>");
                me.parentId = $(this).attr('data-id');
                ajax({
                    url: '/eshop/type/childs',
                    type: 'get',
                    data:{
                        id: me.parentId
                    }
                }).then(function(json){
                    if(json.status == 200){
                        var lists = json.result;
                        $('.type-list ul').html(typelist(lists));
                    }
                });
                me.getList();
            } else {
                me.parentId = $(this).attr('data-id');
                $(this).addClass('active').siblings().removeClass('active');
                me.getList();
            }
        });
        $('body').on('click', '.type-list .deletePar', function(){
            me.parentId = '';
            $('.type-list .type-name').html("分类名称：");
            me.getList();
            ajax({
                url: '/eshop/type/all',
                type: 'get',
                data:{
                    accountId: me.accountId,
                    level: '2'
                }
            }).then(function(data){
                if(data.status == 200){
                    var list = data.result;
                    //console.log(list);
                    $('.type-list ul').html(typelist(list));
                }
            });
        });

		$('body').on('click', '.commodity-right-list .right-list', function(){
			var id = $(this).attr('data-id');
			location.href = '../commodity-base/commodity-detail.html#id=' + id;
		});
        $('.commodity-right-nav p').on('click', function(){
            $(this).addClass('active').siblings().removeClass('active');
            me.orderField = $(this).attr('data-category');
            me.getList();
        });
        $('body').on('click', '.hot-list li', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        });
        $('body').on('click', '.commodity-left>div', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        });
        $('body').on('click', '.choice-list>div', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html#id=' + id;
        });
	}
}

commodity.init()