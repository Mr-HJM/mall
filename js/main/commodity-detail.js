
var $ = require('jquery');
var ajax = require('util/ajax');
var header = require('header-nav/header');
var util = require('utilspare/util.js');
var noData = require('no-data/no-data.js');
var popLogin = require('pop-login/index.js');
require('utilspare/pic_tab.js');

var cart = require('add-cart/index');
var guessList = require('commodity-list/guess-list');
var evalList = require('commodity-list/eval-list');
var hotlist = require('commodity-list/hot-list');
var listhot = require('commodity-list/hot_list');
var seeAgain = require('commodity-list/see-agian');


var commodity = {
	id: null,
	searchId: null,
	loginid: null,
	photourl: null,
	checkid: [],
	init: function(){
		var me = this;
		header.init(function(){});
		$('.all-list').hide();
		var urlSearch = window.location.search;
		me.searchId = urlSearch.split('=')[1];
		me.id = util.getParams('id');
		var storage = window.sessionStorage;
		me.loginid = storage["id"];
		me.getDetail();
		me.clickEven();
		me.guessLook();
		me.goodscomment();
		me.hotList();
		me.seeAgainList();
	},
	// 查看物品详情
	getDetail: function(){
		var me = this;
		ajax({
			url: '/eshop/product/detail',
			type: 'get',
			data:{
				id: me.id || me.searchId
			}
		}).then(function(data){
			// console.log(data);
			if(data.status == 200){
				var respon = data.result;
				var photo = respon.photoUrls;
				$('.details-name,title,.goodsname>b').html(respon.name);
				$('.details-money b').html('¥ ' + respon.price + '.00');
				$('.details-standard b,.goodsstandard>b').html(respon.spec);
				$('.details-type b,.goodstype>b').html(respon.typeName);
				$('.details-brand b,.ware-brand>b').html(respon.brand);
				$('.details-stock b,.goodsnum>b').html(respon.num);
				$('.nums .stock-num').val(respon.num);
				$('.goodsdatails').html(respon.content);

				var imgList = '';
				var img_list = '';

				for(var i=0;i<photo.length;i++){
					if([i] == 0){
						$('.jxwpDT-dImg img').attr('src', photo[i].photoUrl);
						me.photourl = photo[i].photoUrl;
						//console.log(me.photourl);
						imgList+="<li class='item on'><a href='javascript:void(0);'><img src="+photo[i].photoUrl+"></a></li>";
						img_list+="<li class='fl'><a href='javascript:void(0);'><img src="+photo[i].photoUrl+"></a></li>";
					} else {
						imgList+="<li class='item'><a href='javascript:void(0);'><img src="+photo[i].photoUrl+"></a></li>";
						img_list+="<li class='fl'><a href='javascript:void(0);'><img src="+photo[i].photoUrl+"></a></li>";
					}
				}

				$('.small-img').html(imgList);
				$('#small_img').html(img_list);

				// $(".jqzoom").jqueryzoom({xzoom:380,yzoom:410});
				$('#preview').banqh({
					box:"#preview",//总框架
					pic:".small-box",//大图框架
					pnum:".thumbnail-box",//小图框架
					prev_btn:".btn-prev",//小图左箭头
					next_btn:".btn-next",//小图右箭头
					delayTime:400,//切换一张图片时间
					order:0,//当前显示的图片（从0开始）
					picdire:true,//大图滚动方向（true为水平方向滚动）
					mindire:true,//小图滚动方向（true为水平方向滚动）
					min_picnum:5//小图显示数量
				});

				var storage = window.sessionStorage;
				var loginStatus = storage["islogin"];

				if(loginStatus == 'yes'){
					$('.top .site-loged').hide();
					// 点击加入购物车
					$('.add-cart').on('click', function(){
						ajax({
							url: '/eshop/cart/add',
							type: 'post',
							data:{
								accountId: me.loginid,
								id: me.id || me.searchId,
								num: $('.details-number').val()
							}
						}).then(function(data){
							// console.log(data);
							if(data.status == 200){
								var respon = data.result;
								var datas = {};
								datas.id = me.id || me.searchId;
								datas.name = $('.details-name').html();
								datas.num = $('.details-number').val();
								datas.photourl = me.photourl;
								//console.log(datas);
								me.addCart(datas);
							}
						})
					});

					// 立即购买
					$('.buy-now').on('click', function(){
						me.checkid.push({goodsId: respon.id,num: $('.details-number').val(),name: respon.name,photourl: respon.onePhoto,money: $('.details-money b').html()});
						var goodid = JSON.stringify(me.checkid);
						sessionStorage.setItem("goodsid",goodid);
						location.href = '../order-settle/order-list.html';
					});
				} else {
					$('.buy-now,.add-cart').on('click', function(){
						$('.pop-loging').show();
						popLogin.init();
					});
				}

				$(".ware-detail").slide({
					mainCell:".ware-introduce",  //切换元素的包裹层对象
					titCell:".ware-nav li",  //导航元素对象（鼠标的触发元素对象）
					effect:"fade",   //动画效果  fade：渐显
					trigger:"click",  //titCell触发方式 || mouseover：鼠标移过触发；
					titOnClassName:'active'   //当前titCell位置自动增加的class名称
				});
			}
		})
	},
	// 加入购物车
	addCart: function(data){
		var me = this;
		$('.hot-recommend').hide();
		$('.wrapC').html(cart.init(data));
	},
	// 商品评论
	goodscomment: function(){
		var me = this;
		ajax({
			url: '/eshop/remark/query',
			type: 'post',
			data:{
				productId: me.id || me.searchId
			}
		}).then(function(data){
			// console.log(data);
			if(data.status == 200){
				var respon = data.result;
				$('.commodity-eval').html(evalList(respon.list));
			}
		});
	},
	// 热销排行榜
	hotList: function(){
		var me = this;
		ajax({
			url: '/eshop/activity/list',
			type: 'post',
			data:{
				nos: 'ATC2017111921025791892'
			}
		}).then(function(data){
			// console.log(data);
			if(data.status == 200){
				var respon = data.result;
				$('.hot-list').html(hotlist(respon[0].items));
				$('.hot-list li:gt(3)').remove();
				$('.hotList').html(listhot(respon[0].items));
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
				$('.choice-list>div:gt(4)').remove();
			}
		});
	},
	// 看了又看
	seeAgainList: function(){
		var me = this;
		ajax({
			url: '/eshop/product/simlist',
			type: 'get',
			data:{
				id: me.id || me.searchId
			}
		}).then(function(data){
			// console.log(data);
			if(data.status == 200){
				var respon = data.result;
				$('.again-list').html(seeAgain(respon));
				$('.again-list>li:gt(1)').remove();
			}
		});
	},
	clickEven: function(){
		var me = this;
		$('.nums .details-number').on('input propertychange', function(){
			$(this)[0].value = $(this)[0].value.replace(/\D/g,'');        //限制只能输入数字
			var numberSk = parseInt($('.stock-num').val());
			if($(this).val() > numberSk){
				$('.error-num').show();
				$('.error-num').addClass('showError');
			} else {
				$('.error-num').hide();
				$('.error-num').removeClass('showError');
			}
		});
		$('.nums .addNum').on('click', function(){
			var numberSk = parseInt($('.stock-num').val());
			var numbers = parseInt($('.nums .details-number').val());
			var addNumber = numbers+=1;
			//console.log(numbers)
			if(addNumber > numberSk) {
				$('.error-num').show();
				$('.error-num').addClass('showError');
				return;
			} else {
				$('.error-num').hide();
				$('.error-num').removeClass('showError');
				$('.nums .details-number').val(addNumber);
			}
		});
		$('.nums .reduceNum').on('click', function(){
			var numberSk = parseInt($('.stock-num').val());
			var numbers = parseInt($('.nums .details-number').val());
			if(numbers == 1){
				return;
			} else {
				if (numbers <= numberSk) {
					$('.error-num').hide();
					$('.error-num').removeClass('showError');
				}
				var reduceNumber = numbers-=1;
				$('.nums .details-number').val(reduceNumber--);
			}
		});
		$('body').on('click', '.hot-list li', function(){
			var id = $(this).attr('data-id');
			location.href = '../commodity-base/commodity-detail.html?id=' + id;
		});
		$('body').on('click', '.hotList li', function(){
			var id = $(this).attr('data-id');
			location.href = '../commodity-base/commodity-detail.html?id=' + id;
		});
		$('body').on('click', '.choice-list .list-choice', function(){
			var id = $(this).attr('data-id');
			location.href = '../commodity-base/commodity-detail.html?id=' + id;
		});
		$('body').on('click', '.again-list li', function(){
			var id = $(this).attr('data-id');
			location.href = '../commodity-base/commodity-detail.html?id=' + id;
		});
	}
}

commodity.init()