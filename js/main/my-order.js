
var ajax = require('util/ajax');
var center = require('center-nav/center');
var noData = require('no-data/no-data.js');
var pager = require('page-break/page-break.js');

var orderListTpl = require('center-base/order-list');

var order = {
    id: null,
    cancelId: null,
    confirmId: null,
    status: '',
    remarkStatus: '',
    checkid: [],
    pageNumber: '1',
	init: function(){
		var me = this;
		center.init(function(){});
        var storage = window.sessionStorage;
		me.id = storage["id"];
        me.getList();
        me.clickEven();
	},
    getList: function(){
        var me = this;
        ajax({
            url: '/eshop/order/myorder',
            type: 'post',
            data:{
                accountId: me.id,
                status: me.status,
                remarkStatus: me.remarkStatus,
                pageSize: '10',
                curPageNumber: me.pageNumber
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.detail-list').html(orderListTpl(list));
                pager.init($("#page"), me.pageNumber, list.pager.totalPage, function (curPgNum) {
                    me.pageNumber = curPgNum;
                    me.getList();
                    $('html,body').animate({ scrollTop : 0 },0);
                });
                $('#page .appoint').hide();
            }
        });
    },
    clickEven: function(){
        var me = this;
        var buyInfoArr = [];
        var buyInfoObj = {};
        // 去支付
        $('body').on('click','.detail-list .now-pay', function(){
            /*var totalMoney = $(this).parents('tr').find('.amount').children('span').html();
            buyInfoObj.productId = $(this).parents('td').attr('data-productid');
            buyInfoObj.buynum = $(this).parents('tr').find('.goods-number').html().split('x')[1];
            buyInfoArr.push(buyInfoObj);
            var ingify = JSON.stringify(buyInfoArr);
            ajax({
                url: '/eshop/pay/trade',
                type: 'post',
                dataType: 'html',
                data: {
                    orderId: $(this).parents('tr').siblings('.tr-th').find('a').html(),
                    payMoney: $(this).attr('data-money')
                },
            }).then(function(json){
                sessionStorage.setItem("pay",json);
                window.open('../order-settle/pay.html');
            });*/
            sessionStorage.setItem("orderNum",$(this).parents('tbody').children('.tr-th').find('a').html());
            sessionStorage.setItem("orderMoney",$(this).attr('data-money'));
            location.href = '../order-settle/payment-choice.html';
        });
        // 订单详情
        /*$('body').on('click','.detail-list .status .order_detail', function(){
            me.checkid.push({goodsId: $(this).parents('td').attr('data-id'),num: $(this).parents('tr').find('.goods-number').html().split('x')[1],name: $(this).parents('tr').find('.a-link').html(),photourl: $(this).parents('tr').find('.p-img img').attr('src'),money: $(this).parents('tr').find('.amount span').html().split(' ')[1]});
            var goodid = JSON.stringify(me.checkid);
            sessionStorage.setItem("goodsid",goodid);
            window.open('../order-settle/order-list.html');
        });*/

        $('body').on('click','.detail-list .order-cancel', function(){
            me.cancelId = $(this).parents('td').attr('data-id');
            $('.pop-mask,.pop-del').show();
        });
        $('.pop-del .sure').on('click', function(){   // 取消订单
            ajax({
                url: '/eshop/order/cancle',
                type: 'get',
                data: {
                    id: me.cancelId
                }
            }).then(function(data){
                if(data.status == 200){
                    $('.pop-mask,.pop-del').hide();
                    me.getList();
                }
            });
        });

        $('.pop-del .cancel,.thickclose,.pop-sh .cancel,.thickclose').on('click', function(){
            $('.pop-mask,.pop-del,.pop-sh').hide();
        });

        // 订单状态切换
        $('.nav-ul li').on('click', function(){
            $(this).addClass('active').siblings().removeClass('active');
            if($(this).hasClass('pingjia')){
                me.remarkStatus = $(this).attr('data-remarkStatus');
                me.status = '';
                me.getList();
            } else {
                me.status = $(this).attr('data-status');
                me.remarkStatus = '';
                me.getList();
            }
        });

        // 确认收货
        $('body').on('click', 'table tbody td .qr-sh', function(){
            $('.pop-mask,.pop-sh').show();
            me.confirmId = $(this).parents('tbody').children('.tr-th').find('a').html();
        });

        $('.pop-sh .sure').on('click', function(){   // 确认收货
            ajax({
                url: '/eshop/order/confirm',
                type: 'get',
                data: {
                    id: me.confirmId
                }
            }).then(function(data){
                if(data.status == 200){
                    $('.pop-mask,.pop-del').hide();
                    me.getList();
                }
            });
        });
    }
}

order.init()
