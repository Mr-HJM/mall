
var ajax = require('util/ajax');
var header = require('header-nav/header');
var message = require('util/message');

var integral = {
	init: function(){
		var me = this;
		header.init(function(){
			$('.top-site,.all-nav,.all-list,.search').remove();
			var welcomeHtml = "<div class='welcomeLogin fl'>欢迎注册</div><div class='already fr'>已有账号？<span>请登录</span></div>";
	        $('.top-logo').append(welcomeHtml);
	        me.logingBtn();
	        me.clickEven();
		});
	},
	logingBtn: function(){
		var me = this;
		$('.wrap .login-btn').on('click', function(){
			if($('.user-name').val() == ''){
				$('.login-detail .username').show();
			} else {
				$('.login-detail .username').hide();
			}
			if($('.user-pass').val() == '') {
				$('.login-detail .userpass').show();
			} else {
				$('.login-detail .userpass').hide();
			}
			if($('.user-phone').val() == '') {
				$('.login-detail .userPhone').show();
			} else {
				$('.login-detail .userPhone').hide();
			}
			if($('.user-pass').val() != $('.user_pass').val()) {
				$('.login-detail .userPass').show();
			} else {
				$('.login-detail .userPass').hide();
			}
			if($('.user-name').val() != '' && $('.user-pass').val() != '' && $('.user-phone').val() != '' && $('.user-pass').val() == $('.user_pass').val()){
				ajax({
		            url: '/eshop/account/regist',
		            type: 'post',
		            data:{
		                loginName: $('.user-name').val(),
		                password: $('.user-pass').val(),
		                mobile: $('.user-phone').val()
		            }
		        }).then(function(data){
		            if(data.status == 200){
		            	message.popMess('body','添加成功');
		            	setTimeout(function(){
		            		location.href = '../integral-base/login.html';
		            	},2000);
		            } else {
		            	alert(data.message);
		            }
		        });
			}
		})
	},
	clickEven: function(){
		var me = this;
		$('.already span').on('click', function(){
			location.href = '../integral-base/login.html';
		})
	}
}

integral.init()
