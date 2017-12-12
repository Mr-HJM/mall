
var ajax = require('util/ajax');
var center = require('center-nav/center');
var noData = require('no-data/no-data.js');

var addressList = require('center-base/address-list');

var order = {
    id: null,
    updateId: null,
    deleteId: null,
    setDafaultId: null,
	init: function(){
		var me = this;
		center.init(function(){});
        var storage = window.sessionStorage;
		me.id = storage["id"];
        me.getList();
        me.addAddress();
        me.clickEven();
        me.updateAddress();
        me.deleteAddress();
        me.setDefaultAddress();
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
                $('.address-num').html(list.length);
                $('.mc').html(addressList(list));
            }
        });
    },
    addAddress: function(){
        var me = this;
        $('.pop-address .save-btn').on('click', function(){
            if($('.receiver-name').val() == ''){
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
            if($('.receiver-name').val() != '' && $('.content-detail').val() != '' && $('.telphone').val() != ''){
                ajax({
                    url: '/eshop/address/save',
                    type: 'post',
                    data:{
                        accountId: me.id,
                        receiver: $('.receiver-name').val(),
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
            if($('.receiver-name').val() == ''){
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
            if($('.receiver-name').val() != '' && $('.content-detail').val() != '' && $('.telphone').val() != ''){
                ajax({
                    url: '/eshop/address/update',
                    type: 'post',
                    data:{
                        id: me.updateId,
                        receiver: $('.receiver-name').val(),
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
    setDefaultAddress: function(){
        var me = this;
        $('body').on('click', '.easebuy-m .setDefault', function(){
            me.setDafaultId = $(this).parents('.easebuy-m').attr('data-id');
            ajax({
                url: '/eshop/address/setdefault',
                type: 'post',
                data:{
                    id: me.setDafaultId,
                    accountId: me.id
                }
            }).then(function(data){
                if(data.status == 200){
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
                    me.getList();
                    $('.pop-mask,.pop-del').hide();
                }
            });
        })
    },
    clickEven: function(){
        var me = this;
        $('.add-btn').on('click', function(){
            $('.pop-mask,.pop-address').show();
            $('.pop-address .updateAdd,.pop-address .update-btn').hide();
            $('.pop-address .addAdd,.pop-address .save-btn').show();
            $('.pop-address .receiver-name').val('');
            $('.pop-address .content-detail').val('');
            $('.pop-address .telphone').val('');
            $('.pop-address .telephone').val('');
            $('.pop-address .email-detail').val('');
        });
        $('.thickclose').on('click', function(){
            $('.pop-mask,.pop-address,.pop-del').hide();
        });

        $('body').on('click', '.easebuy-m .update' , function(){
            me.updateId = $(this).parents('.easebuy-m').attr('data-id');
            $('.pop-mask,.pop-address').show();
            $('.pop-address .updateAdd,.pop-address .update-btn').show();
            $('.pop-address .addAdd,.pop-address .save-btn').hide();
            var updateDom = $(this).parents('.easebuy-m');
            $('.pop-address .receiver-name').val(updateDom.find('.receiverVal').html());
            $('.pop-address .content-detail').val(updateDom.find('.contentVal').html());
            $('.pop-address .telphone').val(updateDom.find('.phoneVal').html());
            $('.pop-address .telephone').val(updateDom.find('.telephoneVal').html());
            $('.pop-address .email-detail').val(updateDom.find('.emailVal').html());
        });

        $('body').on('click', '.easebuy-m .del-btn', function(){
            me.deleteId = $(this).parents('.easebuy-m').attr('data-id');
            $('.pop-mask,.pop-del').show();
        });
        $('.pop-del .cancel').on('click', function(){
            $('.pop-mask,.pop-del').hide();
        });
    }
}

order.init()
