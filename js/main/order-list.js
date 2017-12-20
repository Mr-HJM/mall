
var ajax = require('util/ajax');
var center = require('center-nav/center');

var addressList = require('order-list/address-list');
var deliveryList = require('order-list/delivery-list');

var order = {
    id: null,
    updateId: null,
    deleteId: null,
    setDafaultId: null,
    goodsid: null,
    totalMoney: null,
	init: function(){
		var me = this;
		center.init(function(data){
            $('#center').remove();
        });
        var storage = window.sessionStorage;
        me.id = storage["id"];
        me.getList();
        me.addAddress();
        me.updateAddress();
        me.deleteAddress();
        me.setDefaultAddress();
        me.clickEven();
        me.getSession();
        me.submitOrder();
	},
    getList: function(){
        var me = this;
        ajax({
            url: '/eshop/address/list',
            type: 'post',
            data:{
                accountId: me.id
            }
        }).then(function(data){
            if(data.status == 200){
                var list = data.result;
                $('.address-list').html(addressList(list));
                $('.address-list .addresslist').eq(0).addClass('list-active');
                $('.final-address').attr('data-addressid',$('.address-list .addresslist').eq(0).attr('data-id'));
                $('.final-address .address-final').html($('.address-list .list-active').children('.address-detail').html());
                $('.final-address .final-name').html($('.address-list .list-active').children('.receiver-name').html()+' '+$('.address-list .list-active').children('.phone-detail').html());
            }
        });
    },
    addAddress: function(){
        var me = this;
        $('.pop-address .save-btn').on('click', function(){
            if($('.receivername').val() == ''){
                $('.receiver').find('.error-msg').show();
            } else {
                $('.receiver').find('.error-msg').hide();
            }
            if($('.content-detail').val() == ''){
                $('.content').find('.error-msg').show();
            } else {
                $('.content').find('.error-msg').hide();
            }
            if($('.telphone').val() == ''){
                $('.phone').find('.error-msg').show();
            } else {
                $('.phone').find('.error-msg').hide();
            }
            if($('.receivername').val() != '' && $('.content-detail').val() != '' && $('.telphone').val() != ''){
                ajax({
                    url: '/eshop/address/save',
                    type: 'post',
                    data:{
                        accountId: me.id,
                        receiver: $('.receivername').val(),
                        area: '中国',
                        content: $('.content-detail').val(),
                        phone: $('.telphone').val(),
                        telephone: $('.telephone').val(),
                        email: $('.email-detail').val(),
                        otherAddress: ''
                    }
                }).then(function(data){
                    if(data.status == 200){
                        var list = data.result;
                        me.getList();
                        $('.pop-mask,.pop-address').hide();
                    }
                });
            }
        });
    },
    updateAddress: function(){
        var me = this;
        $('.pop-address .update-btn').on('click', function(){
            if($('.receivername').val() == ''){
                $('.receiver').find('.error-msg').show();
            } else {
                $('.receiver').find('.error-msg').hide();
            }
            if($('.content-detail').val() == ''){
                $('.content').find('.error-msg').show();
            } else {
                $('.content').find('.error-msg').hide();
            }
            if($('.telphone').val() == ''){
                $('.phone').find('.error-msg').show();
            } else {
                $('.phone').find('.error-msg').hide();
            }
            if($('.receivername').val() != '' && $('.content-detail').val() != '' && $('.telphone').val() != ''){
                ajax({
                    url: '/eshop/address/update',
                    type: 'post',
                    data:{
                        id: me.updateId,
                        receiver: $('.receivername').val(),
                        area: '中国',
                        content: $('.content-detail').val(),
                        phone: $('.telphone').val(),
                        telephone: $('.telephone').val(),
                        email: $('.email-detail').val(),
                        otherAddress: ''
                    }
                }).then(function(data){
                    if(data.status == 200){
                        var list = data.result;
                        $('.up-address').hide();
                        $('.down-address').show();
                        me.getList();
                        $('.pop-mask,.pop-address').hide();
                    }
                });
            }
        });
    },
    setDefaultAddress: function(){
        var me = this;
        $('body').on('click', '.addresslist .set-default', function(){
            me.setDafaultId = $(this).parent('.addresslist').attr('data-id');
            ajax({
                url: '/eshop/address/setdefault',
                type: 'post',
                data:{
                    id: me.setDafaultId,
                    accountId: me.id
                }
            }).then(function(data){
                if(data.status == 200){
                    $('.up-address').hide();
                    $('.down-address').show();
                    me.getList();
                }
            });
        });
    },
    deleteAddress: function(){
        var me = this;
        $('.pop-del .sure').on('click', function(){
            ajax({
                url: '/eshop/address/del',
                type: 'get',
                data:{
                    id: me.deleteId
                }
            }).then(function(data){
                if(data.status == 200){
                    $('.up-address').hide();
                    $('.down-address').show();
                    me.getList();
                    $('.pop-mask,.pop-del').hide();
                }
            });
        })
    },
    getSession: function(){
        var me = this;
        var storage = window.sessionStorage;
        me.goodsid = storage.goodsid;
        var goodsDetail = JSON.parse(me.goodsid);
        // console.log(goodsDetail);
        $('.delivery-list').html(deliveryList(goodsDetail));
        $('.delivery-list .goods_list').each(function(){
            var price = $(this).find('.list_money').html();
            var priceNum = parseInt(price.substring(1,price.indexOf('.')));
            me.totalMoney += priceNum;
        })
        $('.final-money span').html('￥'+me.totalMoney+'.00');
    },
    // 提交订单
    submitOrder: function(){
        var me = this;
        var paramArr = $('.delivery-list').serialize();
        var paramArray = decodeURIComponent(paramArr,true); // 中文乱码 通过此方法将数据解码
        // console.log(paramArray)
        var arr = [];                                       // 将json数据格式转换成后台要求格式json字符串
        var arr1 = paramArray.split("&");
        for(var i=0; i < arr1.length; i++){
            if(arr1[i].indexOf("productId") != -1){
                var obj = {};
                obj.productId = arr1[i].split("=")[1];
            }
            if(arr1[i].indexOf("buynum") != -1){
                obj.buynum = arr1[i].split("=")[1];
                arr.push(obj);
            }
        }
        var thisParam = JSON.stringify(arr);
        // console.log(thisParam);

        $('.submit-btn').on('click', function(){
            ajax({
                url: '/eshop/order/create',
                type: 'post',
                data:{
                    accountId: me.id,
                    addressId: $('.final-address').attr('data-addressid'),
                    shippingMode: '01',
                    payMode: '02',
                    totalMoney: me.totalMoney,
                    payMoney: me.totalMoney,
                    buyInfo: thisParam
                }
            }).then(function(data){
                if(data.status == 200){
                    /*ajax({
                        url: '/eshop/pay/trade',
                        type: 'post',
                        dataType: 'html',
                        data: {
                            orderId: data.result.orderId,
                            payMoney: data.result.payMoney
                        },
                    }).then(function(json){
                        sessionStorage.setItem("pay",json);
                        location.href = '../order-settle/pay.html';
                    });*/
                    sessionStorage.setItem("orderNum",data.result.orderId);
                    sessionStorage.setItem("orderMoney",data.result.payMoney);
                    location.href = '../order-settle/payment-choice.html';
                }
            });
        })
    },
    clickEven: function(){
        var me = this;
        $('.down-address').on('click', function(){
            $('.address-list .addresslist').show();
            $(this).hide();
            $('.up-address').show();
        });
        $('.up-address').on('click', function(){
            $('.address-list .addresslist:gt(0)').hide();
            $(this).hide();
            $('.down-address').show();
        });
        $('body').on('mouseenter', '.address-list .addresslist', function(){
            $(this).addClass('list-hover').siblings().removeClass('list-hover');
        });
        $('body').on('mouseleave', '.address-list .addresslist', function(){
            $(this).removeClass('list-hover');
        });
        $('body').on('click', '.address-list .addresslist', function(){
            $(this).addClass('list-active').siblings().removeClass('list-active');
            $('.final-address').attr('data-addressid',$(this).attr('data-id'));
            $('.final-address .address-final').html($(this).children('.address-detail').html());
            $('.final-address .final-name').html($(this).children('.receiver-name').html()+' '+$(this).children('.phone-detail').html());
        });
        $('.add-btn').on('click', function(){
            $('.pop-mask,.pop-address').show();
            $('.pop-address .updateAdd,.pop-address .update-btn').hide();
            $('.pop-address .addAdd,.pop-address .save-btn').show();
            $('.pop-address .receivername').val('');
            $('.pop-address .content-detail').val('');
            $('.pop-address .telphone').val('');
            $('.pop-address .telephone').val('');
            $('.pop-address .email-detail').val('');
        });
        $('.thickclose').on('click', function(){
            $('.pop-mask,.pop-address,.pop-del').hide();
        });

        $('body').on('click', '.addresslist .set-address' , function(){
            me.updateId = $(this).parent('.addresslist').attr('data-id');
            $('.pop-mask,.pop-address').show();
            $('.pop-address .updateAdd,.pop-address .update-btn').show();
            $('.pop-address .addAdd,.pop-address .save-btn').hide();
            var updateDom = $(this).parent('.addresslist');
            $('.pop-address .receivername').val(updateDom.find('.receiver-name').html().trim());
            $('.pop-address .content-detail').val(updateDom.find('.address-detail').html().trim());
            $('.pop-address .telphone').val(updateDom.find('.phone-detail').html().trim());
            $('.pop-address .telephone').val(updateDom.find('.tel-phone').val().trim());
            $('.pop-address .email-detail').val(updateDom.find('.email').val().trim());
        });

        $('body').on('click', '.addresslist .delete-address', function(){
            me.deleteId = $(this).parent('.addresslist').attr('data-id');
            $('.pop-mask,.pop-del').show();
        });
        $('.pop-del .cancel').on('click', function(){
            $('.pop-mask,.pop-del').hide();
        });
    }
}

order.init()
