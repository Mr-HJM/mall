
var header = require('header-nav/header');
var util = require('utilspare/util.js');

var order = {
    id: null,
	init: function(){
		var me = this;
		header.init(function(){
            $('.top-site,.all-nav,.all-list,.search').remove();
            var welcomeHtml = "<div class='welcomeLogin fl'>收银台</div><ul class='already fr'><li class='my-order'>我的订单</li><li class='pay-help'>支付帮助</li></ul>";
            $('.top-logo').append(welcomeHtml);
            me.clickEven();
            me.getDetail();
        });
	},
    getDetail: function(){
        var me = this;
        $('.order-num span').html(util.getParams('out_trade_no'));
        $('.order-money span').html('￥'+util.getParams('total_amount'));
    },
    clickEven: function(){
        var me = this;
        $('.my-order').on('click', function(){
            location.href = '../center-base/my-order.html'
        })
    }
}

order.init()
