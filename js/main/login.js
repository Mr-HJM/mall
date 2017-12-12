
var ajax = require('util/ajax');
var header = require('header-nav/header');

var integral = {
	init: function(){
		var me = this;
		header.init(function(){
			$('.top-site,.all-nav,.all-list,.search').remove();
			var welcomeHtml = "<div class='welcomeLogin fl'>欢迎登录</div>";
	        $('.top-logo').append(welcomeHtml);
	        var $storage = window.localStorage;
	        var getLoginname = $storage["loginname"];
	        $('.user-name').val(getLoginname);
	        me.logingBtn();
	        me.registerBtn();
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
		            	//var date = new Date();
						//var nowstr = date.getHours()+'-'+date.getMinutes();
						localStorage.setItem("loginname",detail.loginName);
		                sessionStorage.setItem("loginname",detail.loginName);
		                sessionStorage.setItem("id",detail.id);
		                sessionStorage.setItem("photourl",detail.photoUrl);
		                sessionStorage.setItem("islogin","yes");
		                //sessionStorage.setItem("date",nowstr);
		                location.href = '../integral-base/integral-home.html';
		            }
		        });
			}
		})
	},
	registerBtn: function(){
		var me = this;
		$('.sub-btn .register').on('click', function(){
			location.href = '../integral-base/register.html';
		})
	}
}

integral.init()
