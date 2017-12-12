
var $ = require('jquery');
var ajax = require("util/ajax");

var cartTpl = require('./tpl/add-cart.tpl');
require('./add-cart.less');

/*
 *  添加到购物车
 */

var cart = {
    init: function (data) {
        var me = this;
        $('.goods-detail,.goods-introduce').hide();
        $('.wrapC').append(cartTpl(data));
        me.clickEven();
    },
    clickEven: function(){
    	var me = this;
    	$('.look-detail').on('click', function(){
    		$('.goods-detail,.goods-introduce').show();
    		$('.add-then').remove();
    	});
        $('.go-cart').on('click', function(){
            window.open('../my-cart/my-cart.html');
        })
    }
};

/*
 *  @param data  获取图片、物品id、物品购买数量、物品名称
 */

module.exports = {
    init: function (data) {
        cart.init(data);
    }
};