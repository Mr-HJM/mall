
var ajax = require('util/ajax');
var header = require('header-nav/header');
var util = require('utilspare/util.js');

var payCode = require('cart-base/wx-code');

var payment = {
    orderNum: null,
    orderMoney: null,
	init: function(){
		var me = this;
		header.init(function(){
            $('.top-site,.all-nav,.all-list,.search').remove();
            var welcomeHtml = "<div class='welcomeLogin fl'>收银台</div><ul class='already fr'><li class='my-order'>我的订单</li><li class='pay-help'>支付帮助</li></ul>";
            $('.top-logo').append(welcomeHtml);
            me.getDetail();
            me.clickEven();
        });
	},
    getDetail: function(){
        var me = this;
        var storage = window.sessionStorage;
        me.orderNum = storage["orderNum"];
        me.orderMoney = storage["orderMoney"];
        var data = {
            orderId:  me.orderNum
        };
        $('.order-num span').html(me.orderNum);
        $('.order-money span').html('￥'+me.orderMoney+'0');
        $('.choice-cont').html(payCode(data));
    },
    clickEven: function(){
        var me = this;
        $(".choice").slide({
            mainCell:".choice-cont",  //切换元素的包裹层对象
            titCell:".payment-nav li",  //导航元素对象（鼠标的触发元素对象）
            effect:"fade",   //动画效果  fade：渐显
            trigger:"click",  //titCell触发方式 || mouseover：鼠标移过触发；
            titOnClassName:'active'   //当前titCell位置自动增加的class名称
        });
        $('.my-order').on('click', function(){
            location.href = '../center-base/my-order.html';
        });

        $('.zfb-detail img').on('click', function(){
            ajax({
                url: '/eshop/pay/trade',
                type: 'post',
                dataType: 'html',
                data: {
                    orderId: me.orderNum,
                    payMoney: me.orderMoney
                },
            }).then(function(json){
                sessionStorage.setItem("pay",json);
                window.open('../order-settle/pay.html');
            });
        })
    }
}

payment.init()
