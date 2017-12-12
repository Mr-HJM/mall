
var ajax = require('util/ajax');
var center = require('center-nav/center');
var noData = require('no-data/no-data.js');
var pager = require('page-break/page-break.js');

var cartListTpl = require('cart-base/cart-list');
var guessList = require('commodity-list/guess-list');

var order = {
    id: null,
    checkid: [],
    deleteid: null,
    cartid: null,
	init: function(){
		var me = this;
		center.init(function(data){
            //console.log(data);
            $('#center').remove();
        });
        var storage = window.sessionStorage;
        me.id = storage["id"];
        me.getList();
        me.clickEven();
        me.guessLook();
        me.submitOrder();
        me.deleteGoods();
	},
    getList: function(){
        var me = this;
        ajax({
            url: '/eshop/cart/mycart',
            type: 'get',
            data:{
                accountId: me.id
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.all-goods span').html(list.items.length);
                $('table tbody').html(cartListTpl(list.items));
            }
        });
    },
    // 猜你喜欢
    guessLook: function(){
        var me = this;
        ajax({
            url: '/eshop/product/like',
            type: 'get',
            data:{
                num: '5'
            }
        }).then(function(data){
            // console.log(data);
            if(data.status == 200){
                var respon = data.result;
                $('.choice-list').html(guessList(respon));
            }
        });
    },
    // 删除购物车商品
    deleteGoods: function(){
        var me = this;
        $('body').on('click', 'table tbody tr .del-btn', function(){
            me.deleteid = $(this).parents('tr').attr('data-id');
            me.cartid = $(this).parents('tr').attr('data-cartid');
            ajax({
                url: '/eshop/cart/remove',
                type: 'post',
                data:{
                    productId: me.deleteid,
                    cartId: me.cartid
                }
            }).then(function(data){
                // console.log(data);
                if(data.status == 200){
                    me.getList();
                }
            });
        })
    },
    clickEven: function(){
        var me = this;
        $('body').on('input propertychange', 'table tbody tr .addredu-num .details-number' ,function(){
            $(this)[0].value = $(this)[0].value.replace(/\D/g,'');        //限制只能输入数字
            var numberSk = parseInt($(this).next('.stock-num').val());
            var price = $(this).parents('.addredu-num').prev('.unitprice').html();
            var priceNum = price.substring(1,price.indexOf('.'));   // 单价
            var subtotal = priceNum*$(this).val();
            $(this).parents('.addredu-num').siblings('.subtotal').html('￥'+subtotal+'.00');
            if($(this).val() > numberSk){
                $(this).parent('.goods-num').children('.error').show();
                $(this).parent('.goods-num').children('.error').addClass('showError');
            } else {
                $(this).parent('.goods-num').children('.error').hide();
                $(this).parent('.goods-num').children('.error').removeClass('showError');
            }
        });
        $('body').on('click', 'table tbody tr .addredu-num .addNum' ,function(){
            var numberSk = parseInt($(this).prev('.stock-num').val());
            var numbers = parseInt($(this).parent('.goods-num').children('.details-number').val());
            var addNumber = numbers+=1;
            //console.log(numbers)
            if(addNumber > numberSk) {
                $(this).parent('.goods-num').children('.error').show();
                $(this).parent('.goods-num').children('.error').addClass('showError');
                return;
            } else {
                $(this).parent('.goods-num').children('.error').hide();
                $(this).parent('.goods-num').children('.error').removeClass('showError');
                $(this).parent('.goods-num').children('.details-number').val(addNumber);
            }
            var price = $(this).parents('.addredu-num').prev('.unitprice').html();
            var priceNum = price.substring(1,price.indexOf('.'));   // 单价
            var subtotal = priceNum*$(this).siblings('.details-number').val();
            $(this).parents('.addredu-num').siblings('.subtotal').html('￥'+subtotal+'.00');

            if($(this).parents('tr').hasClass('check-ed')){
                var totalH = $('.total span').html();
                var totalMoney = parseInt(totalH.substring(1,totalH.indexOf('.')));
                totalMoney+=parseInt(priceNum);
                $('.total span').html('￥'+totalMoney+'.00');
            }
        });
        $('body').on('click', 'table tbody tr .addredu-num .reduceNum' ,function(){
            var numberSk = parseInt($(this).parent('.goods-num').children('.stock-num').val());
            var numbers = parseInt($(this).parent('.goods-num').children('.details-number').val());
            if(numbers == 1){
                return;
            } else {
                if (numbers <= numberSk) {
                    $(this).parent('.goods-num').children('.error').hide();
                    $(this).parent('.goods-num').children('.error').removeClass('showError');
                }
                var reduceNumber = numbers-=1;
                $(this).parent('.goods-num').children('.details-number').val(reduceNumber--);
            }
            var price = $(this).parents('.addredu-num').prev('.unitprice').html();
            var priceNum = price.substring(1,price.indexOf('.'));   // 单价
            var subtotal = priceNum*$(this).siblings('.details-number').val();
            $(this).parents('.addredu-num').siblings('.subtotal').html('￥'+subtotal+'.00');

            if($(this).parents('tr').hasClass('check-ed')){
                var totalH = $('.total span').html();
                var totalMoney = parseInt(totalH.substring(1,totalH.indexOf('.')));
                totalMoney-=parseInt(priceNum);
                $('.total span').html('￥'+totalMoney+'.00');
            }
        });
        // 全选操作
        $('table thead tr .check-box .jdcheckbox').on('click', function(){
            var totalH = '￥0.00';
            var totalMoney = parseInt(totalH.substring(1,totalH.indexOf('.')));
            if($(this).prop("checked")){
                $(this).parents('table').children('tbody').find('tr').find('.list-check').prop('checked',true);
                $(this).parents('table').children('tbody').find('tr').addClass('check-ed');
                $('.already-selected span').html($(this).parents('table').children('tbody').find('tr').length);
                $(this).parents('table').children('tbody').find('tr').each(function(){
                    var price = $(this).children('.subtotal').html();
                    var priceNum = parseInt(price.substring(1,price.indexOf('.')));
                    totalMoney+=priceNum;
                    me.checkid.push({goodsId: $(this).attr('data-id'),num: $(this).find('.details-number').val(),name: $(this).find('.goodsname').html(),photourl: $(this).find('.goods-item img').attr('src'),money: $(this).find('.subtotal').html()});
                });
                $('.total span').html('￥'+totalMoney+'.00');
            } else {
                $(this).parents('table').children('tbody').find('tr').find('.list-check').prop('checked',false);
                $(this).parents('table').children('tbody').find('tr').removeClass('check-ed');
                $('.already-selected span').html('0');
                $('.total span').html('￥0.00');
            }
        });
        // 单选操作
        $('body').on('click','table tbody tr .box-check .list-check', function(){
            var totalH = $('.total span').html();
            var total_Money = parseInt(totalH.substring(1,totalH.indexOf('.')));
            var lskd = $('.list-check:checked').length;
            $('.already-selected span').html(lskd);
            if($(this).prop("checked")){
                $(this).prop('checked',true);
                $(this).parents('tr').addClass('check-ed');
                var price = $(this).parents('tr').children('.subtotal').html();
                var priceNum = parseInt(price.substring(1,price.indexOf('.')));
                total_Money += priceNum;
                $('.total span').html('￥'+total_Money+'.00');
                me.checkid.push({goodsId: $(this).parents('tr').attr('data-id'),num: $(this).parents('tr').find('.details-number').val(),name: $(this).parents('tr').find('.goodsname').html(),photourl: $(this).parents('tr').find('.goods-item img').attr('src'),money: $(this).parents('tr').find('.subtotal').html()});
            } else {
                $(this).prop('checked',false);
                $(this).parents('tr').removeClass('check-ed');
                var price = $(this).parents('tr').children('.subtotal').html();
                var priceNum = parseInt(price.substring(1,price.indexOf('.')));
                total_Money -= priceNum;
                $('.total span').html('￥'+total_Money+'.00');
            }
        });

        $('body').on('click','.choice-list>div', function(){
            var id = $(this).attr('data-id');
            location.href = '../commodity-base/commodity-detail.html?id=' + id;
        })
    },
    // 提交订单
    submitOrder: function(){
        var me = this;
        $('.balance-btn').on('click', function(){
            var isSelect = parseInt($('.already-selected span').html());
            sessionStorage.setItem("goodsid",[]);
            if(isSelect > 0){
                var goodid = JSON.stringify(me.checkid);
                sessionStorage.setItem("goodsid",goodid);
                location.href = '../order-settle/order-list.html';
            } else {
                alert('请至少选择一件商品哟！');
            }
        })
    }
}

order.init()
