
var $ = require('jquery');
var ajax = require('util/ajax');
var loginTpl = require('./tpl/pop-login.tpl');
require('./pop-login.less');
var popLogin = {
	init: function(){
		var me = this;
		$('.pop').show();
		$('.pop-loging').html(loginTpl());
		me.logingBtn();
		me.clickEven();
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
			if($('.user-name').val() != '' && $('.user-pass').val() != ''){
				ajax({
		            url: '/eshop/account/login',
		            type: 'post',
		            data:{
		                loginName: $('.user-name').val(),
		                password: $('.user-pass').val()
		            }
		        }).then(function(data){
		            if(data.status == 200){
		            	var detail = data.result;
						localStorage.setItem("loginname",detail.loginName);
		                sessionStorage.setItem("loginname",detail.loginName);
		                sessionStorage.setItem("id",detail.id);
		                sessionStorage.setItem("photourl",detail.photoUrl);
		                sessionStorage.setItem("islogin","yes");
		                location.reload();
		            }
		        });
			}
		})
	},
	clickEven: function(){
		var me = this;
		$('.pop-login .login-details span').on('click', function(){
			$('.pop,.pop-loging').hide();
		});
		$('.register').on('click', function(){
			location.href = '../integral-base/register.html';
		});
	}
}

module.exports = {
	init: function(){
		popLogin.init()
	}
}


