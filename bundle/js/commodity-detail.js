webpackJsonp([0,12],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	
	var $ = __webpack_require__(2);
	var ajax = __webpack_require__(3);
	var header = __webpack_require__(9);
	var util = __webpack_require__(17);
	var noData = __webpack_require__(18);
	var popLogin = __webpack_require__(20);
	__webpack_require__(30);
	
	var cart = __webpack_require__(31);
	var guessList = __webpack_require__(35);
	var evalList = __webpack_require__(36);
	var hotlist = __webpack_require__(37);
	var listhot = __webpack_require__(38);
	var seeAgain = __webpack_require__(39);
	
	
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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = $;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by YU on 2016/2/18.
	 */
	var Q = __webpack_require__(4);
	var $ = __webpack_require__(2);
	var CONFIG=__webpack_require__(8);
	$.ajaxSetup({cache: false});
	
	module.exports = function(opt){
	    return Q.promise(function(resolve, reject, notify){
	        $.ajax({
	            url: opt.url,
	            data: opt.data || {},
	            dataType: opt.dataType || 'json',
	            headers: opt.headers || {},
	            type: opt.type || 'get',
	            success: function (data,textStatus,jqXHR) {
	                delete jqXHR.then;
	                if(data.status == '401'){
	                    //未登录 或者登录超时
	                    location.href =CONFIG.URL.SSO_LOGIN+"?service="+CONFIG.URL.INDEX;
	                    return;
	                }
	                resolve.apply(null, arguments);
	            },
	            error: function (jqXHR, textStatus, errorThrown) {
	                delete jqXHR.then;
	                reject.apply(null, arguments);
	            }
	        });
	    });
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
	 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function (definition) {
	    "use strict";
	
	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.
	
	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);
	
	    // CommonJS
	    } else if (true) {
	        module.exports = definition();
	
	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);
	
	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }
	
	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;
	
	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();
	
	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };
	
	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }
	
	})(function () {
	"use strict";
	
	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}
	
	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;
	
	// shims
	
	// used for fallback in "allResolved"
	var noop = function () {};
	
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];
	
	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;
	
	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;
	
	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);
	
	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();
	
	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!
	
	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }
	
	                throw e;
	
	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	
	        if (domain) {
	            domain.exit();
	        }
	    }
	
	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };
	
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	
	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.toString()` yields "[object process]".
	        isNodeJS = true;
	
	        requestTick = function () {
	            process.nextTick(flush);
	        };
	
	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }
	
	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };
	
	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();
	
	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis
	
	var array_slice = uncurryThis(Array.prototype.slice);
	
	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);
	
	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);
	
	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);
	
	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};
	
	var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
	    obj[prop] = descriptor.value;
	    return obj;
	};
	
	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	
	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};
	
	var object_toString = uncurryThis(Object.prototype.toString);
	
	function isObject(value) {
	    return value === Object(value);
	}
	
	// generator related shims
	
	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}
	
	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}
	
	// long stack traces
	
	var STACK_JUMP_SEPARATOR = "From previous event:";
	
	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
	                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);
	
	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        var stack = filterStackString(concatedStacks);
	        object_defineProperty(error, "stack", {value: stack, configurable: true});
	    }
	}
	
	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];
	
	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}
	
	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}
	
	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }
	
	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }
	
	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}
	
	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	
	    if (!fileNameAndLineNumber) {
	        return false;
	    }
	
	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];
	
	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}
	
	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }
	
	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }
	
	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}
	
	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}
	
	// end of shims
	// beginning of real work
	
	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }
	
	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;
	
	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;
	
	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;
	
	/**
	 * The counter is used to determine the stopping point for building
	 * long stack traces. In makeStackTraceLong we walk backwards through
	 * the linked list of promises, only stacks which were created before
	 * the rejection are concatenated.
	 */
	var longStackCounter = 1;
	
	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}
	
	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;
	
	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };
	
	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };
	
	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };
	
	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	            promise.stackCounter = longStackCounter++;
	        }
	    }
	
	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.
	
	    function become(newPromise) {
	        resolvedPromise = newPromise;
	
	        if (Q.longStackSupport && hasStacks) {
	            // Only hold a reference to the new promise if long stacks
	            // are enabled to reduce memory usage
	            promise.source = newPromise;
	        }
	
	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);
	
	        messages = void 0;
	        progressListeners = void 0;
	    }
	
	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(Q(value));
	    };
	
	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };
	
	    return deferred;
	}
	
	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};
	
	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}
	
	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6
	
	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};
	
	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};
	
	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};
	
	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Q can't join: not the same: " + x + " " + y);
	        }
	    });
	};
	
	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}
	
	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};
	
	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }
	
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };
	
	    promise.inspect = inspect;
	
	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }
	
	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }
	
	    return promise;
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks
	
	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }
	
	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }
	
	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }
	
	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_rejected(exception));
	        }]);
	    });
	
	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }
	
	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);
	
	    return deferred.promise;
	};
	
	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};
	
	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);
	
	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};
	
	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}
	
	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};
	
	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};
	
	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};
	
	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};
	
	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */
	
	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}
	
	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}
	
	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}
	
	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}
	
	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};
	
	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}
	
	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};
	
	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}
	
	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};
	
	//// BEGIN UNHANDLED REJECTION TRACKING
	
	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;
	
	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;
	
	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}
	
	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }
	
	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}
	
	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	
	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}
	
	Q.resetUnhandledRejections = resetUnhandledRejections;
	
	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};
	
	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};
	
	resetUnhandledRejections();
	
	//// END UNHANDLED REJECTION TRACKING
	
	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });
	
	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);
	
	    return rejection;
	}
	
	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}
	
	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}
	
	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}
	
	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}
	
	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};
	
	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;
	
	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.
	
	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}
	
	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}
	
	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}
	
	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}
	
	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}
	
	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};
	
	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};
	
	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};
	
	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};
	
	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};
	
	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};
	
	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};
	
	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};
	
	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};
	
	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};
	
	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};
	
	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};
	
	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};
	
	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	
	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};
	
	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};
	
	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}
	
	Promise.prototype.all = function () {
	    return all(this);
	};
	
	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;
	
	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }
	
	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];
	
	        pendingCount++;
	
	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected(err) {
	            pendingCount--;
	            if (pendingCount === 0) {
	                err.message = ("Q can't get fulfillment value from any promise, all " +
	                    "promises were rejected. Last error message: " + err.message);
	                deferred.reject(err);
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);
	
	    return deferred.promise;
	}
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}
	
	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};
	
	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}
	
	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};
	
	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};
	
	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};
	
	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}
	
	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};
	
	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};
	
	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    if (!callback || typeof callback.apply !== "function") {
	        throw new Error("Q can't apply finally callback");
	    }
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};
	
	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};
	
	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };
	
	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;
	
	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }
	
	    promise.then(void 0, onUnhandledError);
	};
	
	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};
	
	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);
	
	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);
	
	    return deferred.promise;
	};
	
	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};
	
	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    if (callback === undefined) {
	        throw new Error("Q can't wrap an undefined function");
	    }
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};
	
	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};
	
	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}
	
	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};
	
	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};
	
	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();
	
	return Q;
	
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(6).setImmediate))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(7);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/**
	 * Created by Tom on 2016/05/09
	 */
	
	module.exports = {
		URL:{
			SSO_LOGIN:'http://223.202.64.204:50901/login',//单点登录
	        SSO_LOGOUT:'http://223.202.64.204:50901/logout',//单点退出
	        INDEX:'http://127.0.0.1:9020/html/index.html',//人人通首页
	        CHECK_LOGIN:'http://223.202.64.204:50934/',//检查是否登陆及得到登陆信息
	        SETUSER:'http://223.202.64.204:50934/setuser.jsp',//设置登录
	        APP:'http://223.202.64.204:50713/',//应用的请求地址
	        RES:'http://221.228.242.4:8007/index.html',//资源的请求地址
	        UPLOAD:'http://223.202.64.204:50951/files',//上传文件地址
	        RESTFUL:'http://223.202.64.204:50932',
			FOOTERTYPE:2,//1是张家港，2是通配
			STATISTICS:0,//0是不显示，1是显示
	        COURSE:0//0是不显示，1是显示
		},
		APP:{
			ISWX:true
	    },
		APPEXISTS:false,//张家港显示，无锡、黄冈不显示
		ISPINGCETASK:false
	};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	
	var $ = __webpack_require__(2);
	var ajax = __webpack_require__(3);
	var jsonp = __webpack_require__(10);
	
	var headTpl = __webpack_require__(11);
	var typeListTpl = __webpack_require__(13);
	var hotListTpl = __webpack_require__(14);
	var moreFenTpl = __webpack_require__(15);
	var footTpl = __webpack_require__(16);
	var menuName, _callBack;
	
	/*
	 * 头部、尾部导航
	 */
	
	var header = {
	    id: null,
	    init: function () {
	        var me = this;
	        var storage = window.sessionStorage;
	        me.id = storage["id"];
	        me.initBtn();
	    },
	    initBtn: function () {
	        var me = this;
	        ajax({
	            url: '/eshop/belong/all',
	            type: 'get'
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('#header').html(headTpl(list));
	                $('body').on('click', '.my-order' ,function(){
	                    location.href = '../center-base/my-order.html';
	                });
	
	                $('body').on('click', '.my-car' ,function(){
	                    location.href = '../my-cart/my-cart.html';
	                });
	                _callBack()
	
	                $('.logo img').on('click', function(){
	                    location.href = '../integral-base/integral-home.html';
	                });
	                // 非首页划过全部商品分类显示
	                var url = window.location.pathname;
	                var splitUrl = url.split('/');
	                if(splitUrl[3] != 'integral-home.html'){
	                    $('.all-list').hide();
	                    $('.all-classify').on('mouseenter', function(){
	                        $('.all-list').slideDown(200);
	                    });
	                    $('.all-list').on('mouseleave', function(){
	                        $('.all-list').slideUp(200);
	                    });
	                } else {
	                    $('.all-list').show();
	                }
	                me.isLogin();
	                me.logingBtn();
	                me.allType();
	                me.hotList();
	                me.searchName();
	                me.searchHot();
	
	                $('.nav-classify li').on('click', function(){
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	            }
	        });
	        $('#footer').html(footTpl());
	    },
	    // 登录、注册操作
	    logingBtn: function(){
	        var me = this;
	        $('body').on('click', '.top .loging',function(){
	            location.href = '../integral-base/login.html';
	        });
	        $('body').on('click', '.top .register',function(){
	            location.href = '../integral-base/register.html';
	        });
	    },
	    isLogin: function(){
	        var me = this;
	        var storage = window.sessionStorage;
	        var getLoginname = storage["loginname"];
	        var loginStatus = storage["islogin"];
	        //var date = storage["date"];
	
	        if(loginStatus == 'yes'){
	            $('.top .site-loged').hide();
	        } else {
	            $('body').on('click','.site-loging-success li', function(){
	                location.href = '../integral-base/login.html'
	            });
	        }
	    },
	    hotList: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/type/plist',
	            type: 'get',
	            data:{
	                num: '6'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('.search-hot').html(hotListTpl(list));
	            }
	        });
	    },
	    allType: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/type/all',
	            type: 'get',
	            data:{
	                accountId: me.id,
	                level: '2'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                //console.log(list);
	                $('.all_list').html(typeListTpl(list));
	                $('.more-fen').html(moreFenTpl(list));
	                $('.all_list>li:gt(5)').remove();
	
	                $('.all_list>li').on('mouseenter', function(){
	                    if($(this).children('.classif-detail').find("ul li").length > 0){
	                        $(this).children('.classif-detail').show();
	                    }
	                });
	                $('.all_list>li').on('mouseleave', function(){
	                    $(this).children('.classif-detail').hide();
	                });
	                if(data.result.length > 5){
	                    $('.topCon .all-list .more-categories').on('mouseenter', function(){
	                        $('.more-fen').show();
	                    });
	                    $('.topCon .all-list .more-categories').on('mouseleave', function(){
	                        $('.more-fen').hide();
	                    });
	                }
	
	                // 全部商品分类下
	                $('.all_list>li').on('click', function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).children('.list-title').html().split('•')[1].trim();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	                /*$('.all_list>li>.list-hot>li').on('click', function(e){
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    location.href = '../commodity-base/commodity-list.html#flag=' + thisName + '&parentId=' + thisId;
	                    e.stoppropagation();
	                });*/
	                $('body').on('click', '.all_list>li>.classif-detail>ul>li',function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	
	                $('body').on('click', '.more-categories .more-fen .more-list',function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).children('div').html();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	            }
	        });
	    },
	    searchName: function(){
	        var me = this;
	        $('body').on('click','.search .search-btn', function(){
	            var goodName = $('.search-name').val();
	            ajax({
	                url: '/eshop/product/query',
	                type: 'post',
	                data:{
	                    name: goodName
	                }
	            }).then(function(data){
	                if(data.status == 200){
	                    var list = data.result;
	                    window.open('../commodity-base/commodity-list.html#name=' + goodName);
	                }
	            });
	        })
	    },
	    searchHot: function(){
	        var me = this;
	        $('body').on('click', '.search-hot li',function(){
	            var hotName = $(this).html();
	            var parentId = $(this).attr('data-id');
	            location.href = '../commodity-base/commodity-list.html?flag=' + hotName + '&parentId=' + parentId;
	        })
	    }
	};
	
	/*
	 *
	 */
	
	module.exports = {
	    init: function (callback) {
	        _callBack = callback;
	        header.init();
	    }
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/*
	 * jQuery JSONP Core Plugin 2.4.0 (2012-08-21)
	 *
	 * https://github.com/jaubourg/jquery-jsonp
	 *
	 * Copyright (c) 2012 Julian Aubourg
	 *
	 * This document is licensed as free software under the terms of the
	 * MIT License: http://www.opensource.org/licenses/mit-license.php
	 */
	( function( $ ) {
	
		// ###################### UTILITIES ##
	
		// Noop
		function noop() {
		}
	
		// Generic callback
		function genericCallback( data ) {
			lastValue = [ data ];
		}
	
		// Call if defined
		function callIfDefined( method , object , parameters ) {
			return method && method.apply( object.context || object , parameters );
		}
	
		// Give joining character given url
		function qMarkOrAmp( url ) {
			return /\?/ .test( url ) ? "&" : "?";
		}
	
		var // String constants (for better minification)
			STR_ASYNC = "async",
			STR_CHARSET = "charset",
			STR_EMPTY = "",
			STR_ERROR = "error",
			STR_INSERT_BEFORE = "insertBefore",
			STR_JQUERY_JSONP = "_jqjsp",
			STR_ON = "on",
			STR_ON_CLICK = STR_ON + "click",
			STR_ON_ERROR = STR_ON + STR_ERROR,
			STR_ON_LOAD = STR_ON + "load",
			STR_ON_READY_STATE_CHANGE = STR_ON + "readystatechange",
			STR_READY_STATE = "readyState",
			STR_REMOVE_CHILD = "removeChild",
			STR_SCRIPT_TAG = "<script>",
			STR_SUCCESS = "success",
			STR_TIMEOUT = "timeout",
	
			// Window
			win = window,
			// Deferred
			Deferred = $.Deferred,
			// Head element
			head = $( "head" )[ 0 ] || document.documentElement,
			// Page cache
			pageCache = {},
			// Counter
			count = 0,
			// Last returned value
			lastValue,
	
			// ###################### DEFAULT OPTIONS ##
			xOptionsDefaults = {
				//beforeSend: undefined,
				//cache: false,
				callback: STR_JQUERY_JSONP,
				//callbackParameter: undefined,
				//charset: undefined,
				//complete: undefined,
				//context: undefined,
				//data: "",
				//dataFilter: undefined,
				//error: undefined,
				//pageCache: false,
				//success: undefined,
				//timeout: 0,
				//traditional: false,
				url: location.href
			},
	
			// opera demands sniffing :/
			opera = win.opera,
	
			// IE < 10
			oldIE = !!$( "<div>" ).html( "<!--[if IE]><i><![endif]-->" ).find("i").length;
	
		// ###################### MAIN FUNCTION ##
		function jsonp( xOptions ) {
	
			// Build data with default
			xOptions = $.extend( {} , xOptionsDefaults , xOptions );
	
			// References to xOptions members (for better minification)
			var successCallback = xOptions.success,
				errorCallback = xOptions.error,
				completeCallback = xOptions.complete,
				dataFilter = xOptions.dataFilter,
				callbackParameter = xOptions.callbackParameter,
				successCallbackName = xOptions.callback,
				cacheFlag = xOptions.cache,
				pageCacheFlag = xOptions.pageCache,
				charset = xOptions.charset,
				url = xOptions.url,
				data = xOptions.data,
				timeout = xOptions.timeout,
				pageCached,
	
				// Abort/done flag
				done = 0,
	
				// Life-cycle functions
				cleanUp = noop,
	
				// Support vars
				supportOnload,
				supportOnreadystatechange,
	
				// Request execution vars
				firstChild,
				script,
				scriptAfter,
				timeoutTimer;
	
			// If we have Deferreds:
			// - substitute callbacks
			// - promote xOptions to a promise
			Deferred && Deferred(function( defer ) {
				defer.done( successCallback ).fail( errorCallback );
				successCallback = defer.resolve;
				errorCallback = defer.reject;
			}).promise( xOptions );
	
			// Create the abort method
			xOptions.abort = function() {
				!( done++ ) && cleanUp();
			};
	
			// Call beforeSend if provided (early abort if false returned)
			if ( callIfDefined( xOptions.beforeSend , xOptions , [ xOptions ] ) === !1 || done ) {
				return xOptions;
			}
	
			// Control entries
			url = url || STR_EMPTY;
			data = data ? ( (typeof data) == "string" ? data : $.param( data , xOptions.traditional ) ) : STR_EMPTY;
	
			// Build final url
			url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;
	
			// Add callback parameter if provided as option
			callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );
	
			// Add anticache parameter if needed
			!cacheFlag && !pageCacheFlag && ( url += qMarkOrAmp( url ) + "_" + ( new Date() ).getTime() + "=" );
	
			// Replace last ? by callback parameter
			url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );
	
			// Success notifier
			function notifySuccess( json ) {
	
				if ( !( done++ ) ) {
	
					cleanUp();
					// Pagecache if needed
					pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
					// Apply the data filter if provided
					dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
					// Call success then complete
					callIfDefined( successCallback , xOptions , [ json , STR_SUCCESS, xOptions ] );
					callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );
	
				}
			}
	
			// Error notifier
			function notifyError( type ) {
	
				if ( !( done++ ) ) {
	
					// Clean up
					cleanUp();
					// If pure error (not timeout), cache if needed
					pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
					// Call error then complete
					callIfDefined( errorCallback , xOptions , [ xOptions , type ] );
					callIfDefined( completeCallback , xOptions , [ xOptions , type ] );
	
				}
			}
	
			// Check page cache
			if ( pageCacheFlag && ( pageCached = pageCache[ url ] ) ) {
	
				pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached );
	
			} else {
	
				// Install the generic callback
				// (BEWARE: global namespace pollution ahoy)
				win[ successCallbackName ] = genericCallback;
	
				// Create the script tag
				script = $( STR_SCRIPT_TAG )[ 0 ];
				script.id = STR_JQUERY_JSONP + count++;
	
				// Set charset if provided
				if ( charset ) {
					script[ STR_CHARSET ] = charset;
				}
	
				opera && opera.version() < 11.60 ?
					// onerror is not supported: do not set as async and assume in-order execution.
					// Add a trailing script to emulate the event
					( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "document.getElementById('" + script.id + "')." + STR_ON_ERROR + "()" )
				:
					// onerror is supported: set the script as async to avoid requests blocking each others
					( script[ STR_ASYNC ] = STR_ASYNC )
	
				;
	
				// Internet Explorer: event/htmlFor trick
				if ( oldIE ) {
					script.htmlFor = script.id;
					script.event = STR_ON_CLICK;
				}
	
				// Attached event handlers
				script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = script[ STR_ON_READY_STATE_CHANGE ] = function ( result ) {
	
					// Test readyState if it exists
					if ( !script[ STR_READY_STATE ] || !/i/.test( script[ STR_READY_STATE ] ) ) {
	
						try {
	
							script[ STR_ON_CLICK ] && script[ STR_ON_CLICK ]();
	
						} catch( _ ) {}
	
						result = lastValue;
						lastValue = 0;
						result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );
	
					}
				};
	
				// Set source
				script.src = url;
	
				// Re-declare cleanUp function
				cleanUp = function( i ) {
					timeoutTimer && clearTimeout( timeoutTimer );
					script[ STR_ON_READY_STATE_CHANGE ] = script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = null;
					head[ STR_REMOVE_CHILD ]( script );
					scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
				};
	
				// Append main script
				head[ STR_INSERT_BEFORE ]( script , ( firstChild = head.firstChild ) );
	
				// Append trailing script if needed
				scriptAfter && head[ STR_INSERT_BEFORE ]( scriptAfter , firstChild );
	
				// If a timeout is needed, install it
				timeoutTimer = timeout > 0 && setTimeout( function() {
					notifyError( STR_TIMEOUT );
				} , timeout );
	
			}
	
			return xOptions;
		}
	
		// ###################### SETUP FUNCTION ##
		jsonp.setup = function( xOptions ) {
			$.extend( xOptionsDefaults , xOptions );
		};
	
		// ###################### INSTALL in jQuery ##
		$.jsonp = jsonp;
	
	} )( jQuery );


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-top',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$out+='<div class="top-site"> <div class="site">  <div class="welcome-presence fl"> <div class="welcome fl">您好，欢迎光临御廷家居！</div> <div class="site-loged fl"> <span class="loging">[ 登录 ]</span> <span class="register">[ 注册 ]</span> </div> </div>  <div class="site-loging-success fr"> <ul class="clearfix"> <li class="my-order"><i class="order"></i><a>我的订单</a></li> <li class="my-car"><i class="cart"></i><a>购物车</a></li> <li class="mu-info"><i class="user"></i><a>用户管理</a></li> </ul> </div> </div> </div> <div class="topCon"> <div class="top-logo clearfix"> <div class="logo fl"> <img src="../../bundle/img/logo.png"> </div> <div class="search fl"> <input type="text" class="search-name fl"> <span class="search-btn fr">搜 索</span> <img src="../../bundle/img/icon-search.png" class="search-icon"> <img src="../../bundle/img/icon-yuyin.png" class="yuyin-icon"> <ul class="search-hot"></ul> </div> </div> <div class="all-nav clearfix"> <div class="all-classify fl">全部商品分类</div> <ul class="nav-classify fl"> ';
	$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> </div> <div class="all-list"> <ul class="all_list"></ul> <div class="more-categories"> <span>更多分类</span>  <div class="more-fen clearfix"></div> </div> </div> </div>';
	return new String($out);
	});

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/*TMODJS:{}*/
	!function () {
		function a(a, b) {
			return (/string|function/.test(typeof b) ? h : g)(a, b)
		}
	
		function b(a, c) {
			return "string" != typeof a && (c = typeof a, "number" === c ? a += "" : a = "function" === c ? b(a.call(a)) : ""), a
		}
	
		function c(a) {
			return l[a]
		}
	
		function d(a) {
			return b(a).replace(/&(?![\w#]+;)|[<>"']/g, c)
		}
	
		function e(a, b) {
			if (m(a))for (var c = 0, d = a.length; d > c; c++)b.call(a, a[c], c, a); else for (c in a)b.call(a, a[c], c)
		}
	
		function f(a, b) {
			var c = /(\/)[^\/]+\1\.\.\1/, d = ("./" + a).replace(/[^\/]+$/, ""), e = d + b;
			for (e = e.replace(/\/\.\//g, "/"); e.match(c);)e = e.replace(c, "/");
			return e
		}
	
		function g(b, c) {
			var d = a.get(b) || i({filename: b, name: "Render Error", message: "Template not found"});
			return c ? d(c) : d
		}
	
		function h(a, b) {
			if ("string" == typeof b) {
				var c = b;
				b = function () {
					return new k(c)
				}
			}
			var d = j[a] = function (c) {
				try {
					return new b(c, a) + ""
				} catch (d) {
					return i(d)()
				}
			};
			return d.prototype = b.prototype = n, d.toString = function () {
				return b + ""
			}, d
		}
	
		function i(a) {
			var b = "{Template Error}", c = a.stack || "";
			if (c)c = c.split("\n").slice(0, 2).join("\n"); else for (var d in a)c += "<" + d + ">\n" + a[d] + "\n\n";
			return function () {
				return "object" == typeof console && console.error(b + "\n\n" + c), b
			}
		}
	
		var j = a.cache = {}, k = this.String, l = {
			"<": "&#60;",
			">": "&#62;",
			'"': "&#34;",
			"'": "&#39;",
			"&": "&#38;"
		}, m = Array.isArray || function (a) {
				return "[object Array]" === {}.toString.call(a)
			}, n = a.utils = {
			$helpers: {}, $include: function (a, b, c) {
				return a = f(c, a), g(a, b)
			}, $string: b, $escape: d, $each: e
		}, o = a.helpers = n.$helpers;
		a.get = function (a) {
			return j[a.replace(/^\.\//, "")]
		}, a.helper = function (a, b) {
			o[a] = b
		}, module.exports = a
	}();

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/type-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='"> <div class="list-title">• ';
	$out+=$escape($value.name);
	$out+='</div> <ul class="list-hot clearfix"> ';
	$each($value.child,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> <div class="classif-detail"> <ul class="more-list clearfix"> ';
	$each($value.child,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> </div> </li> ';
	});
	return new String($out);
	});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/hot-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	return new String($out);
	});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/more-fen',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <ul class="more-list clearfix" data-id="';
	$out+=$escape($value.id);
	$out+='"> <div class="more-title">';
	$out+=$escape($value.name);
	$out+='</div> </ul> ';
	});
	return new String($out);
	});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-bottom','<div class="return-top"></div> <div class="bottomCon clearfix"> <ul class="foot-nav gouwu fl clearfix"> <div>购物指南</div> <li> <a href="javascript:void(0);">购物流程</a> </li> <li> <a href="javascript:void(0);">会员介绍</a> </li> <li> <a href="javascript:void(0);">团购/机票</a> </li> <li> <a href="javascript:void(0);">常见问题</a> </li> <li> <a href="javascript:void(0);">联系客服</a> </li> </ul> <ul class="foot-nav peisong fl clearfix"> <div>配送方式</div> <li> <a href="javascript:void(0);">上门自提</a> </li> <li> <a href="javascript:void(0);">211限时达</a> </li> <li> <a href="javascript:void(0);">配送服务查询</a> </li> <li> <a href="javascript:void(0);">配送费收取标准</a> </li> <li> <a href="javascript:void(0);">海外配送</a> </li> </ul> <ul class="foot-nav zhifu fl clearfix"> <div>支付方式</div> <li> <a href="javascript:void(0);">货到付款</a> </li> <li> <a href="javascript:void(0);">在线支付</a> </li> <li> <a href="javascript:void(0);">分期付款</a> </li> <li> <a href="javascript:void(0);">邮局汇款</a> </li> <li> <a href="javascript:void(0);">公司转账</a> </li> </ul> <ul class="foot-nav shouhou fl clearfix"> <div>售后服务</div> <li> <a href="javascript:void(0);">售后政策</a> </li> <li> <a href="javascript:void(0);">价格保护</a> </li> <li> <a href="javascript:void(0);">退款说明</a> </li> <li> <a href="javascript:void(0);">返修/退换货</a> </li> <li> <a href="javascript:void(0);">取消订单</a> </li> </ul> </div>');

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	_id = 0;
	var SHOW_POP_TYPE_SUCCESS = 0;
	var SHOW_POP_TYPE_FAIL = 1;
	var SHOW_POP_TYPE_WARNING = 2;
	module.exports = {
	    ajax:function(url, params, method, success, err) {
	        $.ajax({
	            url: url,
	            data: params,
	            type: method,
	            dataType: 'json',
	            success: function (data) {
	                success && success(data);
	            },
	            error: function (e) {
	                console.log(e);
	                err && err(e);
	            }
	        });
	    },
	    forEach: function (array, callback, scope) {
	        scope = scope || null;
	        array = array == null ? [] : array;
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            //console.log('array is not a Array!!!');
	            return;
	        }
	        for (var i = 0, len = array.length; i < len; i++) {
	            if (!callback.call(scope, array[i], i)) {//array[i],maps[i],
	                continue;
	            } else {
	                break;
	            }
	        }
	    },
	    /**
	     * url参数获取接口，经过decodeURI，如果没有传递key值，则返回当前页面的所有参数，如果有key返回key对应的内容，
	     * 如果key没有对应的内容，则返回空字符串
	     * @param key
	     * @returns {*}
	     */
	    getParams: function (key) {
	        var paramsStr = location.href.indexOf('#') > 0 ? location.href.substring(location.href.indexOf("#") + 1, location.href.length) : '';
	        //获取所有的#即以前的？后面的值，相当于location.search
	        var maps, paramsObj = {};
	        if (paramsStr === '') {
	            return '';
	        }
	        paramsStr = decodeURI(paramsStr);//解码的paramStr
	        maps = paramsStr.split('&');//将&之前的字符串都放入数组里面
	        this.forEach(maps, function (item) {//循环数组,arguments[0]
	            var paramList = item.split('=');//item为maps[i]
	            if (paramList.length < 2 && paramList[0] == '') {
	                return;
	            }
	            paramsObj[paramList[0]] = paramList[1];
	        });
	        if (key) {//如果key有值得话
	            return paramsObj[key] || '';//则返回对象里可以属性的值否则返回空
	        } else {
	            return paramsObj;//如果key传过来的是没有的话，即什么都没传的话则返回paramsObj的对象
	        }
	    },
	    getQueryString:function(name) {
	        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	        var r = window.location.search.substr(1).match(reg);
	        if (r!=null) return (r[2]); return null;
	    },
	    addEvent: function (el, type, callback) {
	        if (document.attachEvent) {//如果页面文档中存在attachEvent方法
	            el.attachEvent('on' + type, function () {
	                //console.log(arguments);
	                var params = [].slice.call(arguments, 0);
	                params.splice(0, 0, window.event);
	                callback.apply(el, params);
	            });
	        } else {
	            el.addEventListener(type, function (e) {
	                callback.apply(el, arguments);
	            }, false);
	        }
	    },
	    //是否是IE678
	    isIE678: function () {
	        return ('a~b'.split(/(~)/))[1] == "b";
	    },
	    //去空格
	    trimAll: function (str) {
	        return str.replace(/ +/g, '');
	    },
	    trimBlank:function(params){
	        //form表单序列化之后去前后空格
	        params= decodeURIComponent(params).split('&');
	        for(var i = 0;i<params.length;i++){
	            var param = params[i].split('=');
	            param[1]= param[1].replace(/(^\+*)|(\+*$)|(^\s*)|(\s*$)/g,'');
	            params[i] = param.join('=');
	        }
	        return params.join('&');
	    },
	    //验证联系方式 手机号 座机
	    check_phone:function(phone){
	        var reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
	        return reg.test(phone);
	    },
	    //验证英文名
	    check_english:function(en){
	        var reg = /^[a-zA-Z]+(\s*[a-zA-Z]+){0,}$/;
	        return reg.test(en);
	    },
	    //验证邮箱
	    check_email:function(email){
	        var reg =  /^\w+@\w+\.\w+$/;
	        return reg.test(email);
	    },
	    //只能含验证数字和.
	    check_numdot:function(val){
	        var reg =  /^\d+(?:\.\d{1,2})?$/;
	        return reg.test(val);
	    },
	    SHOW_POP_TYPE_SUCCESS: SHOW_POP_TYPE_SUCCESS,
	    SHOW_POP_TYPE_FAIL: SHOW_POP_TYPE_FAIL,
	    SHOW_POP_TYPE_WARNING: SHOW_POP_TYPE_WARNING,
	    /**
	     * 显示提示信息（要求每个要显示的页面都要有pop-mask div），
	     * 警示图片命名使用格式show-pop0.png代表sucess，show-pop1.png代表fail，跟上边的参数定义一致
	     * @param title 顶部显示框的标题
	     * @param message 内容值
	     * @param type 警示图片的类型，通过util.js返回对象获取，不写默认是success
	     */
	    showMsgInfo: function (title, message, type) {
	        type = type ? type : SHOW_POP_TYPE_SUCCESS;
	        var msgInfoId = 'msg-pop-' + _id++;
	        var data = {
	            title: title,
	            message: message,
	            msgInfoId: msgInfoId,
	            type: type
	        };
	        //   $("body").append(template('warning-box/warning-box-templ', data));
	        //关闭图标跟取消的点击事件封装，但是确认的就自己写
	        $("#" + msgInfoId + " .cancel,#" + msgInfoId + " .close-box").click(function () {
	            $('#' + msgInfoId).hide();
	            $(".pop-mask").hide();
	        });
	        return function () {
	            $('#' + msgInfoId).show();
	            $(".pop-mask").show();
	        };
	    },
	    apertInfo: function (title, message) {
	        var popup = "pop-up-div";
	        $(".pop-mask").show();
	        $("#"+popup).show();
	        $(".head").find("h1").html(title);
	        $(".pop-content").html(message);
	        $("#"+popup).find(".close").click(function(){
	            $('#' + popup).hide();
	            $(".pop-mask").hide();
	        });
	
	
	    },
	    closePop:function(popup){
	        $('#' + popup).hide();
	        $(".pop-mask").hide();
	    },
	    //根据阿拉伯数字生成中文数字
	    coverNum: function (number) {
	        if (isNaN(number - 0)) {
	            throw new Error('arg is not a number');
	        } else if (number.length > 12) {
	            throw new Error('arg is too big');
	        }
	        var a = (number + '').split(''),
	            s = [],
	            t = this,
	            chars = '零一二三四五六七八九',
	            units = '个十百千万@#%亿^&~';
	        for (var i = 0, j = a.length - 1; i <= j; i++) {
	            if (j == 1 || j == 5 || j == 9) {//两位数 处理特殊的 1*
	                if (i == 0) {
	                    if (a[i] != '1') s.push(chars.charAt(a[i]));
	                } else {
	                    s.push(chars.charAt(a[i]));
	                }
	            } else {
	                s.push(chars.charAt(a[i]));
	            }
	            if (i != j) {
	                s.push(units.charAt(j - i));
	            }
	        }
	        //return s;
	        return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) {//优先处理 零百 零千 等
	            b = units.indexOf(d);
	            if (b != -1) {
	                if (d == '亿') return d;
	                if (d == '万')return d;
	                if (a[j - b] == '0') return '零';
	            }
	            return '';
	        }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) {// 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
	            return b;
	        }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
	            return {'@': '十', '#': '百', '%': '千', '^': '十', '&': '百', '~': '千'}[m];
	        }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
	            c = units.indexOf(d);
	            if (c != -1) {
	                if (a[j - c] == '0') return d + '零' + b;
	            }
	            return m;
	        });
	    },
	    //计算echart title 高度
	    eHeight: function (array) {
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            return;
	        }
	        var StringPx = array.join('').length * 14;
	        var elsePL = array.length * (20 + 10);
	        var YHeight = Math.ceil((StringPx + elsePL) / 850) * 24 + 10;//向上修正10像素
	        return YHeight < 60 ? 60 : YHeight;
	    },
	    //转换时间格式
	    getTime: function (date, format) {
	        date = new Date(date * 1000);
	
	        var map = {
	            "M": date.getMonth() + 1, //月份
	            "d": date.getDate(), //日
	            "h": date.getHours(), //小时
	            "m": date.getMinutes(), //分
	            "s": date.getSeconds(), //秒
	            "q": Math.floor((date.getMonth() + 3) / 3), //季度
	            "S": date.getMilliseconds() //毫秒
	        };
	        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
	            var v = map[t];
	            if (v !== undefined) {
	                if (all.length > 1) {
	                    v = '0' + v;
	                    v = v.substr(v.length - 2);
	                }
	                return v;
	            }
	            else if (t === 'y') {
	                return (date.getFullYear() + '').substr(4 - all.length);
	            }
	            return all;
	        });
	        return format;
	    },
	    getBrowser: function () {
	        var Sys = {};
	        var ua = navigator.userAgent.toLowerCase();
	        var s;
	        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
	            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
	                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
	                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
	                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
	                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	
	        if (Sys.ie) {
	            return 'ie'
	        }
	        if (Sys.firefox) {
	            return 'firefox'
	        }
	        if (Sys.chrome) {
	            return 'chrome'
	        }
	        if (Sys.opera) {
	            return 'opera'
	        }
	        if (Sys.safari) {
	            return 'safari'
	        }
	    },
	    //计算显示字符串的长度
	    strDisplayformat: function (string, maxLength) {
	        var num = 0;
	        var STR_NUMBER = maxLength ? maxLength : 30;
	        var pat = new RegExp('[0-9a-zA-Z-]');
	        for (var i = 0; i < (string.length > STR_NUMBER ? STR_NUMBER : string.length); i++) {
	            if (pat.test(string[i])) {
	                num++;
	            } else {
	                num += 2;
	            }
	            if (num > STR_NUMBER) {
	                return string.substring(0, i) + '...';
	            }
	        }
	        return string;
	    },
	    //根据中文数字生成阿拉伯数字
	    toNum:function(str){
	        if(typeof(str) !=="string"){
	            throw new Error('str is not a string');
	        }
	        var charts = {
	            "一":1,
	            "二":2,
	            "三":3,
	            "四":4,
	            "五":5,
	            "六":6,
	            "七":7,
	            "八":8,
	            "九":9
	        };
	        var nums =[];
	
	        if(str.length ==1){
	            return charts[str];
	        }
	        for(var i = 0;i<str.length;i++) {
	            if(str[i] == "十"){
	                nums.push("十");
	            }else{
	                nums.push(charts[str[i]]);
	            }
	        }
	        for(var i = 0,j=nums.length-1;i<=j;i++){
	            if(nums[i] =="十"){
	                nums[i] = (i == 0 && 1) ||( i==j && '0') || '';
	            }
	        }
	        return nums.join("")-0;
	
	    },
	    //不同年级不同班的排序
	    sortgrade:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var req = /[一二三四五六七八九十]+/g;
	
	        var resultGrades = [];
	
	        var grades={};//{[1:[]]}
	        for(var i = 0; i<data.length;i++){
	            var gradeNum = this.toNum(data[i].classesName.match(req)[0]);
	            if(!grades[gradeNum]){
	                grades[gradeNum] =[];
	            }
	            grades[gradeNum].push(data[i]);
	        }
	        for( var ii in grades){
	            resultGrades =resultGrades.concat(this.sortClass(grades[ii]));
	        }
	        return resultGrades;
	    },
	    //根据同年级不同班级排序
	    sortClass:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var toIndex = Math.floor(data.length/2);
	        var toNum = data[toIndex].classesName.match(/\d+/g)[0]-0;
	        var leftClass= [],rightClass = [];
	        for(var i = 0; i<data.length;i++){
	            //model.userData.classes[i].classNum = data[i].classesName.match(/\d+/g)[0]-0;
	            if(i ==toIndex){
	                continue;
	            }
	            if(toNum >data[i].classesName.match(/\d+/g)[0]-0){
	                leftClass.push(data[i]);
	            }else{
	                rightClass.push(data[i]);
	            }
	        }
	        return	 this.sortClass(leftClass).concat( data[toIndex],this.sortClass(rightClass));
	    }
	
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by hui on 2016/12/28 0028.
	 */
	var  noDataTpl=__webpack_require__(19);
	/*
	* data 没有数据需要填写的提示内容
	* */
	module.exports=function(data){
	   return noDataTpl(data);
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/no-data/no-data',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,content=$data.content,$out='';$out+='<div class="no-data"> <div class="no-img"></div> <div class="cont">';
	$out+=$escape(content);
	$out+='</div> </div>';
	return new String($out);
	});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	
	var $ = __webpack_require__(2);
	var ajax = __webpack_require__(3);
	var loginTpl = __webpack_require__(21);
	__webpack_require__(22);
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
			})
		}
	}
	
	module.exports = {
		init: function(){
			popLogin.init()
		}
	}
	
	


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/pop-login/tpl/pop-login','<div class="pop-login"> <div class="login-details clearfix"> <p class="fl">你尚未登录</p> <span class="fr"></span> </div> <div class="user-login">账户登录</div> <div class="login-detail"> <input type="text" class="user-name" placeholder="邮箱/用户名/已验证手机"> <input type="password" class="user-pass" placeholder="密码"> <button class="login-btn">登录</button> <div class="sub-btn clearfix"> <div class="register fl">立即注册</div> <div class="forget fr">忘记密码</div> </div> <div class="username error">请输入账号</div> <div class="userpass error">请输入密码</div> </div> </div>');

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(23);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(29)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./pop-login.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./pop-login.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(24)(undefined);
	// imports
	
	
	// module
	exports.push([module.id, ".pop-login {\n  width: 400px;\n  height: 340px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  margin-left: -200px;\n  margin-top: -170px;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 5px;\n  -moz-border-radius: 5px;\n  -webkit-border-radius: 5px;\n  z-index: 999;\n  background-color: #fff;\n}\n.login-details {\n  width: 398px;\n  height: 30px;\n  background-color: #f3f3f3;\n  padding: 0 10px;\n}\n.login-details p {\n  font-size: 14px;\n  color: #666;\n  line-height: 30px;\n}\n.login-details span {\n  display: inline-block;\n  width: 13px;\n  height: 13px;\n  background: url(" + __webpack_require__(25) + ") no-repeat;\n  cursor: pointer;\n  margin-top: 8px;\n}\n.user-login {\n  text-align: center;\n  color: #666;\n  font-size: 18px;\n  margin-top: 20px;\n  margin-bottom: 20px;\n}\n.login-detail {\n  padding: 0 50px;\n  position: relative;\n}\n.login-detail .user-name {\n  width: 300px;\n  height: 42px;\n  border: 1px solid #d3d3d3;\n  background: url(" + __webpack_require__(26) + ") no-repeat 10px 10px;\n  padding-left: 36px;\n}\n.login-detail .user-pass {\n  width: 300px;\n  height: 42px;\n  border: 1px solid #d3d3d3;\n  background: url(" + __webpack_require__(27) + ") no-repeat 10px 10px;\n  padding-left: 36px;\n  margin-top: 27px;\n}\n.login-detail .login-btn {\n  width: 300px;\n  height: 42px;\n  border: 1px solid #d3d3d3;\n  background: #e02b2e;\n  color: #fff;\n  margin-top: 27px;\n  letter-spacing: 12px;\n  font-size: 18px;\n  cursor: pointer;\n}\n.login-detail .sub-btn {\n  margin-top: 16px;\n}\n.login-detail .sub-btn .forget {\n  color: #999999;\n  font-size: 14px;\n  cursor: pointer;\n}\n.login-detail .sub-btn .register {\n  width: 78px;\n  text-align: right;\n  color: #d5595b;\n  font-size: 14px;\n  background: url(" + __webpack_require__(28) + ") no-repeat left;\n  cursor: pointer;\n}\n.login-detail .error {\n  color: #e02b2e;\n  display: none;\n}\n.login-detail .username {\n  position: absolute;\n  left: 50px;\n  top: 41px;\n}\n.login-detail .userpass {\n  position: absolute;\n  left: 50px;\n  top: 110px;\n}\n", ""]);
	
	// exports


/***/ }),
/* 24 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function(useSourceMap) {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			return this.map(function (item) {
				var content = cssWithMappingToString(item, useSourceMap);
				if(item[2]) {
					return "@media " + item[2] + "{" + content + "}";
				} else {
					return content;
				}
			}).join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};
	
	function cssWithMappingToString(item, useSourceMap) {
		var content = item[1] || '';
		var cssMapping = item[3];
		if (!cssMapping) {
			return content;
		}
	
		if (useSourceMap && typeof btoa === 'function') {
			var sourceMapping = toComment(cssMapping);
			var sourceURLs = cssMapping.sources.map(function (source) {
				return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
			});
	
			return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
		}
	
		return [content].join('\n');
	}
	
	// Adapted from convert-source-map (MIT)
	function toComment(sourceMap) {
		// eslint-disable-next-line no-undef
		var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
		var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
	
		return '/*# ' + data + ' */';
	}


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANBAMAAACAxflPAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAVUExURfPz89XV1fr6+s3Nzdra2vX19ff39zWXrq8AAABASURBVAjXY0hRYGBgUElgcBZiYGASdmBQNFQAYyZhISACyikaBhqC1DAJG4O4DAzBxgEMSHyoPEw9TD/MPKj5AOB0CTu/oe11AAAAAElFTkSuQmCC"

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAATCAYAAACdkl3yAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNzNDM0FCN0JERUExMUU3OTEzM0Y4OTI4NkU3M0Y2OCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyNzNDM0FCOEJERUExMUU3OTEzM0Y4OTI4NkU3M0Y2OCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI3M0MzQUI1QkRFQTExRTc5MTMzRjg5Mjg2RTczRjY4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjI3M0MzQUI2QkRFQTExRTc5MTMzRjg5Mjg2RTczRjY4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+lVT/MgAAAc5JREFUeNqcVE1LAlEUnXmFJihBi0K0ZZugCHVqY/YHCitCcBd9QX+gRdGibfQDgoqgFtUm8icEQla6kHZBixZlEhQxBQrDTOfEi2yaUfPC9d65H+edd+eOquIi+Xw+CLNiWVaaz6qqHsFsxmKxklO96gKShDmjDyBTAgmZngRYxt4jHEDCBAHArWmaYZ/P10ZFLMQYc6jptfe1OxBakwwSmqaVa+KPhUIhAbAn+KvQ5bqMICn+6LpeticikUgZQO/QmYZXQ5FOGwgE/uSKxaIAUz/cj4ZAkH1pR+0JwzBGbDXubw1z6MSQX3CyAXZjsJcypUHPEfMIIbqi0ehbXUZo1KGHcD2wF7CmVAJ2MPd9fUdGSPLVk3oGxT1KfXmAToHVNWp/GBEEV1pCMEcQuS8p7hF8P5U+YzIXgl7h4LlfjBAYltQJmq5WqyfxeNxyopLNZlWv15vCgccyNIhNv1EBItBcQqIbwUUEd5UmBH0LMDtQfnthggwRBPa+UqnsKU2KrL2DBtE7wBlNyNy623WchLWQDfmY5KZOf01diJzyT5HrQTvOq/XLIb/+F6imp49f/wECs0B9xgCVFsC4rKcCfxXzANlSWpdtYnwKMAAKWN5AW1e8rgAAAABJRU5ErkJggg=="

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMTIzMDRGN0JERUExMUU3ODBDRkYyMkI1NzZBQzQwRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMTIzMDRGOEJERUExMUU3ODBDRkYyMkI1NzZBQzQwRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjMxMjMwNEY1QkRFQTExRTc4MENGRjIyQjU3NkFDNDBEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjMxMjMwNEY2QkRFQTExRTc4MENGRjIyQjU3NkFDNDBEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+xCSkNAAAAOBJREFUeNpiZEADV65cYfj+/XsQIyNjF5CrjCz3////+0CqhJOTc52Ojg6KPiZ0g4CGBAINWYtuCAgAxRVBcj9+/PBEl2PCorgbarvt79+/mU1MTBhBGMQGiUGVTWYgBM6cOfMfhEmVZ2KgEsBm0F0i9GGoYTx16pQoMFx2AbEBOS4BhtsFIHZjocQQaOSA9O5igRkCNJXf1NT0EymGAAOdD0h9BJkBDyNSDQEBYLL4RJdYGzUIh0GnT5/mI1Uzsh4WUMoEpQMg/ghMF+Q66BLIRW4gBrkmAB1yFohdAAIMAG2eXzI9RDn8AAAAAElFTkSuQmCC"

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDNzM0OTI1N0JERUIxMUU3ODZDQThFMzA1QjIxNTU1NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDNzM0OTI1OEJERUIxMUU3ODZDQThFMzA1QjIxNTU1NSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkM3MzQ5MjU1QkRFQjExRTc4NkNBOEUzMDVCMjE1NTU1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkM3MzQ5MjU2QkRFQjExRTc4NkNBOEUzMDVCMjE1NTU1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+82UBXAAAAVVJREFUeNqU088rRFEUwPEZM6MUC2MlTVFjJ9Hkx8LGAvkDLKQklKREzIaym81EFBsb1NT8CQorC0qSlJUfNfmRkJT8bmp8r86rmdt913Pq0/Re95x73zl3/JmBQZ8lmpHBg9uCIktyHQ5wjzmU/qeAen+MaZSgDHsYQdBLgRlZuIhPxNGKKryh21noN/QgjCe0ya6/6+Q3hwrs4xazphNsYjcvWUUA53KSZ6hd2xENaskdaDE0LIt6LOACNZhAKr9ACNuYlO/U4x2jqEYPlvUerKBPepDzeQynB5UYk+PbkufRqBdQOx4ijTNLciemcKUXWJL5DluSi7GFIRlxQYET3Emn3WIDL1g39SCFcjS4JEfQi5ipP6rAI3bQZUgOSF9WZf7GKaiqSfTLs/reJqzhWv6N43+N8Qi1uMEXEriUCxPFt1sB5yZ+yK7q+RSvXi/SjwADACqkSDpjErqtAAAAAElFTkSuQmCC"

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 30 */
/***/ (function(module, exports) {

	
	var jq = $.noConflict();
	//ban_qh
	jq.fn.banqh = function(can){
		can = jq.extend({
						box:null,//总框架
						pic:null,//大图框架
						pnum:null,//小图框架
						prev_btn:null,//小图左箭头
						next_btn:null,//小图右箭头
						prev:null,//大图左箭头
						next:null,//大图右箭头
						pop_prev:null,//弹出框左箭头
						pop_next:null,//弹出框右箭头
						autoplay:false,//是否自动播放
						interTime:5000,//图片自动切换间隔
						delayTime:800,//切换一张图片时间
						pop_delayTime:800,//弹出框切换一张图片时间
						order:0,//当前显示的图片（从0开始）
						picdire:true,//大图滚动方向（true水平方向滚动）
						mindire:true,//小图滚动方向（true水平方向滚动）
						min_picnum:null,//小图显示数量
						pop_up:false,//大图是否有弹出框
						pop_div:null,//弹出框框架
						pop_pic:null,//弹出框图片框架
						pop_xx:null,//关闭弹出框按钮
						mhc:null//朦灰层
					}, can || {});
		var picnum = jq(can.pic).find('ul li').length;
		var picw = jq(can.pic).find('ul li').outerWidth(true);
		var pich = jq(can.pic).find('ul li').outerHeight(true);
		var poppicw = jq(can.pop_pic).find('ul li').outerWidth(true);
		var picminnum = jq(can.pnum).find('ul li').length;
		var picpopnum = jq(can.pop_pic).find('ul li').length;
		var picminw = jq(can.pnum).find('ul li').outerWidth(true);
		var picminh = jq(can.pnum).find('ul li').outerHeight(true);
		var pictime;
		var tpqhnum=0;
		var xtqhnum=0;
		var popnum=0;
		jq(can.pic).find('ul').width(picnum*picw);
		jq(can.pnum).find('ul').width(picminnum*picminw);
		jq(can.pop_pic).find('ul').width(picpopnum*poppicw);
		
	//点击小图切换大图
		    jq(can.pnum).find('li').click(function () {
	        tpqhnum = xtqhnum = jq(can.pnum).find('li').index(this);
	        show(tpqhnum);
			minshow(xtqhnum);
	    }).eq(can.order).trigger("click");
	//大图弹出框
	if(can.pop_up==true){
		jq(can.pic).find('ul li').click(function(){
			jq(can.mhc).height(jq(document).height()).show();
			jq(can.pop_div).show();
			popnum = jq(this).index();
			var gdjl_w=-popnum*poppicw;
			jq(can.pop_pic).find('ul').css('left',gdjl_w);
			popshow(popnum);
			})
		jq(can.pop_xx).click(function(){
			jq(can.mhc).hide();
			jq(can.pop_div).hide();
		})
	}
	
		if(can.autoplay==true){
	//自动播放
			pictime = setInterval(function(){
				show(tpqhnum);
				minshow(tpqhnum)
				tpqhnum++;
				xtqhnum++;
				if(tpqhnum==picnum){tpqhnum=0};	
				if(xtqhnum==picminnum){xtqhnum=0};
						
			},can.interTime);	
			
	//鼠标经过停止播放
			jq(can.box).hover(function(){
				clearInterval(pictime);
			},function(){
				pictime = setInterval(function(){
					show(tpqhnum);
					minshow(tpqhnum)
					tpqhnum++;
					xtqhnum++;
					if(tpqhnum==picnum){tpqhnum=0};	
					if(xtqhnum==picminnum){xtqhnum=0};		
					},can.interTime);			
				});
		}
	//小图左右切换			
		jq(can.prev_btn).click(function(){
			if(tpqhnum==0){tpqhnum=picnum};
			if(xtqhnum==0){xtqhnum=picnum};
			xtqhnum--;
			tpqhnum--;
			show(tpqhnum);
			minshow(xtqhnum);	
			})
		jq(can.next_btn).click(function(){
			if(tpqhnum==picnum-1){tpqhnum=-1};
			if(xtqhnum==picminnum-1){xtqhnum=-1};
			xtqhnum++;
			minshow(xtqhnum)
			tpqhnum++;
			show(tpqhnum);
			})	
	//大图左右切换	
		jq(can.prev).click(function(){
			if(tpqhnum==0){tpqhnum=picnum};
			if(xtqhnum==0){xtqhnum=picnum};
			xtqhnum--;
			tpqhnum--;
			show(tpqhnum);
			minshow(xtqhnum);	
			})
		jq(can.next).click(function(){
			if(tpqhnum==picnum-1){tpqhnum=-1};
			if(xtqhnum==picminnum-1){xtqhnum=-1};
			xtqhnum++;
			minshow(xtqhnum)
			tpqhnum++;
			show(tpqhnum);
			})
	//弹出框图片左右切换	
		jq(can.pop_prev).click(function(){
			if(popnum==0){popnum=picnum};
			popnum--;
			popshow(popnum);
			})
		jq(can.pop_next).click(function(){
			if(popnum==picnum-1){popnum=-1};
			popnum++;
			popshow(popnum);
			})			
	//小图切换过程
		function minshow(xtqhnum){
			var mingdjl_num =xtqhnum-can.min_picnum+2
			var mingdjl_w=-mingdjl_num*picminw;
			var mingdjl_h=-mingdjl_num*picminh;
			
			if(can.mindire==true){
				jq(can.pnum).find('ul li').css('float','left');
				if(picminnum>can.min_picnum){
					if(xtqhnum<3){mingdjl_w=0;}
					if(xtqhnum==picminnum-1){mingdjl_w=-(mingdjl_num-1)*picminw;}
					jq(can.pnum).find('ul').stop().animate({'left':mingdjl_w},can.delayTime);
					}
					
			}else{
				jq(can.pnum).find('ul li').css('float','none');
				if(picminnum>can.min_picnum){
					if(xtqhnum<3){mingdjl_h=0;}
					if(xtqhnum==picminnum-1){mingdjl_h=-(mingdjl_num-1)*picminh;}
					jq(can.pnum).find('ul').stop().animate({'top':mingdjl_h},can.delayTime);
					}
				}
			
		}
	//大图切换过程
			function show(tpqhnum){
				var gdjl_w=-tpqhnum*picw;
				var gdjl_h=-tpqhnum*pich;
				if(can.picdire==true){
					jq(can.pic).find('ul li').css('float','left');
					jq(can.pic).find('ul').stop().animate({'left':gdjl_w},can.delayTime);
					}else{
				jq(can.pic).find('ul').stop().animate({'top':gdjl_h},can.delayTime);
				}//滚动
				//jq(can.pic).find('ul li').eq(tpqhnum).fadeIn(can.delayTime).siblings('li').fadeOut(can.delayTime);//淡入淡出
				jq(can.pnum).find('li').eq(tpqhnum).addClass("on").siblings(this).removeClass("on");
			};
	//弹出框图片切换过程
			function popshow(popnum){
				var gdjl_w=-popnum*poppicw;
					jq(can.pop_pic).find('ul').stop().animate({'left':gdjl_w},can.pop_delayTime);
				//jq(can.pop_pic).find('ul li').eq(tpqhnum).fadeIn(can.pop_delayTime).siblings('li').fadeOut(can.pop_delayTime);//淡入淡出
			};					
					
	}


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	
	var $ = __webpack_require__(2);
	var ajax = __webpack_require__(3);
	
	var cartTpl = __webpack_require__(32);
	__webpack_require__(33);
	
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

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/add-cart/tpl/add-cart',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,photourl=$data.photourl,name=$data.name,num=$data.num,id=$data.id,$out='';$out+='<div class="add-then"> <div class="addC"> <div class="add-success clearfix"> <img class="fl" src="../../bundle/img/icon-then.png"> <span class="goods fl">商品已成功加入购物车！</span> </div> <div class="then-details clearfix"> <div class="then-left fl clearfix"> <div class="then-img fl"> <img src="';
	$out+=$escape(photourl);
	$out+='"> </div> <div class="then-introduce fl"> <p class="then-name">';
	$out+=$escape(name);
	$out+='</p> <p class="then-num">数量：';
	$out+=$escape(num);
	$out+='</p> </div> </div> <div class="then-btn fr clearfix" data-id="';
	$out+=$escape(id);
	$out+='"> <span class="look-detail fl">查看物品详情</span> <span class="go-cart fl">去购物车结算</span> </div> </div> </div> </div>';
	return new String($out);
	});

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(34);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(29)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./add-cart.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./add-cart.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(24)(undefined);
	// imports
	
	
	// module
	exports.push([module.id, ".add-then {\n  width: 100%;\n  background-color: #f6f6f6;\n}\n.add-then .addC {\n  width: 1200px;\n  margin: 0 auto;\n  padding: 20px 0;\n}\n.add-then .addC .add-success {\n  border-bottom: 1px dashed #e4e4e4;\n  width: 1200px;\n  height: 50px;\n}\n.add-then .addC .add-success img {\n  width: 32px;\n  height: 32px;\n}\n.add-then .addC .add-success .goods {\n  color: #6eb242;\n  font-size: 20px;\n  margin-top: 2px;\n  margin-left: 12px;\n}\n.add-then .addC .then-details {\n  margin-top: 19px;\n}\n.add-then .addC .then-details .then-left .then-img {\n  width: 112px;\n  height: 112px;\n  background-color: #fff;\n  text-align: center;\n}\n.add-then .addC .then-details .then-left .then-img img {\n  width: 98px;\n  height: 98px;\n  margin-top: 7px;\n}\n.add-then .addC .then-details .then-left .then-introduce {\n  margin-left: 11px;\n  margin-top: 28px;\n}\n.add-then .addC .then-details .then-left .then-introduce .then-name {\n  color: #666666;\n  font-size: 14px;\n}\n.add-then .addC .then-details .then-left .then-introduce .then-num {\n  color: #b1b1b1;\n  font-size: 14px;\n  margin-top: 20px;\n}\n.add-then .addC .then-details .then-btn {\n  margin-top: 84px;\n  margin-right: 60px;\n}\n.add-then .addC .then-details .then-btn .look-detail {\n  display: inline-block;\n  width: 160px;\n  height: 40px;\n  background-color: #fff;\n  line-height: 40px;\n  text-align: center;\n  color: #666666;\n  font-size: 16px;\n  cursor: pointer;\n  margin-right: 29px;\n}\n.add-then .addC .then-details .then-btn .go-cart {\n  display: inline-block;\n  width: 164px;\n  height: 40px;\n  background-color: #de362b;\n  line-height: 40px;\n  text-align: center;\n  color: #fff;\n  font-size: 16px;\n  cursor: pointer;\n}\n", ""]);
	
	// exports


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/guess-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <div class="list-choice fl" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <p class="list-name">';
	$out+=$escape($value.name);
	$out+='</p> <div class="list-cont clearfix"> <span class="list-money fl">￥';
	$out+=$escape($value.price);
	$out+='.00</span> <span class="list-num fr"><b>';
	$out+=$escape($value.remarkNum || '0');
	$out+='</b>人评价</span> </div> </div> ';
	});
	return new String($out);
	});

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/eval-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$out='';$each($data,function($value,$index){
	$out+=' ';
	});
	return new String($out);
	});

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/hot-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li class="fl clearfix" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img class="fl" src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <div class="hot-detail fr"> <span>';
	$out+=$escape($value.name);
	$out+='</span> <b>特价：<i>￥';
	$out+=$escape($value.price);
	$out+='.00</i></b> <p class="now-buy">立即抢购</p> </div> </li> ';
	});
	return new String($out);
	});

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/hot_list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li class="fl clearfix" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img class="fl" src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <div class="fr"> <span>';
	$out+=$escape($value.name);
	$out+='</span> <b>￥';
	$out+=$escape($value.price);
	$out+='.00</b> </div> </li> ';
	});
	return new String($out);
	});

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/see-agian',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='"> <img src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <span class="see-money">￥';
	$out+=$escape($value.price);
	$out+='.00</span> </li> ';
	});
	return new String($out);
	});

/***/ })
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9tYWluL2NvbW1vZGl0eS1kZXRhaWwuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiJFwiIiwid2VicGFjazovLy8uL2RlcC91dGlsL2FqYXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9xL3EuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJwYWNrLXN0cmVhbS9+L3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9zZXRpbW1lZGlhdGUvc2V0SW1tZWRpYXRlLmpzIiwid2VicGFjazovLy8uL2RlcC9jb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvaGVhZGVyLmpzIiwid2VicGFjazovLy8uL2RlcC9qcXVlcnkuanNvbnAuanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcC50cGwiLCJ3ZWJwYWNrOi8vLy4vfi90bW9kanMtbG9hZGVyL3J1bnRpbWUuanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL3R5cGUtbGlzdC50cGwiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL2hvdC1saXN0LnRwbCIsIndlYnBhY2s6Ly8vLi9kZXAvaGVhZGVyLW5hdi90cGwvbW9yZS1mZW4udHBsIiwid2VicGFjazovLy8uL2RlcC9oZWFkZXItbmF2L3RwbC9pbnRlZ3JhbC1ib3R0b20udHBsIiwid2VicGFjazovLy8uL2RlcC91dGlsc3BhcmUvdXRpbC5qcyIsIndlYnBhY2s6Ly8vLi9kZXAvbm8tZGF0YS9uby1kYXRhLmpzIiwid2VicGFjazovLy8uL2RlcC9uby1kYXRhL25vLWRhdGEudHBsIiwid2VicGFjazovLy8uL2RlcC9wb3AtbG9naW4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL3BvcC1sb2dpbi90cGwvcG9wLWxvZ2luLnRwbCIsIndlYnBhY2s6Ly8vLi9kZXAvcG9wLWxvZ2luL3BvcC1sb2dpbi5sZXNzPzUzZGQiLCJ3ZWJwYWNrOi8vLy4vZGVwL3BvcC1sb2dpbi9wb3AtbG9naW4ubGVzcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL2J1bmRsZS9pbWcvZGlhbG9nLnBuZyIsIndlYnBhY2s6Ly8vLi9idW5kbGUvaW1nL2ljb24tdXNlci5wbmciLCJ3ZWJwYWNrOi8vLy4vYnVuZGxlL2ltZy9pY29uLXBhc3MucG5nIiwid2VicGFjazovLy8uL2J1bmRsZS9pbWcvaWNvbi1yZWdpc3Rlci5wbmciLCJ3ZWJwYWNrOi8vLy4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzIiwid2VicGFjazovLy8uL2RlcC91dGlsc3BhcmUvcGljX3RhYi5qcyIsIndlYnBhY2s6Ly8vLi9kZXAvYWRkLWNhcnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL2FkZC1jYXJ0L3RwbC9hZGQtY2FydC50cGwiLCJ3ZWJwYWNrOi8vLy4vZGVwL2FkZC1jYXJ0L2FkZC1jYXJ0Lmxlc3M/MDIwMiIsIndlYnBhY2s6Ly8vLi9kZXAvYWRkLWNhcnQvYWRkLWNhcnQubGVzcyIsIndlYnBhY2s6Ly8vLi90cGwvY29tbW9kaXR5LWxpc3QvZ3Vlc3MtbGlzdC50cGwiLCJ3ZWJwYWNrOi8vLy4vdHBsL2NvbW1vZGl0eS1saXN0L2V2YWwtbGlzdC50cGwiLCJ3ZWJwYWNrOi8vLy4vdHBsL2NvbW1vZGl0eS1saXN0L2hvdC1saXN0LnRwbCIsIndlYnBhY2s6Ly8vLi90cGwvY29tbW9kaXR5LWxpc3QvaG90X2xpc3QudHBsIiwid2VicGFjazovLy8uL3RwbC9jb21tb2RpdHktbGlzdC9zZWUtYWdpYW4udHBsIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBOztBQUVBLEVBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQSxlQUFjLGdCQUFnQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNB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QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFrQyxjQUFjLEVBQUU7QUFDbEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQWtDLGNBQWMsRUFBRTtBQUNsRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEIsY0FBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBb0IsUUFBUTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxNQUFNLHNDQUFzQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsbURBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBQzs7Ozs7Ozs7QUN4aEVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSw0QkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNkJBQTRCLFVBQVU7Ozs7Ozs7QUN2THRDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMEJBQXlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNkNBQTRDLGNBQWM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLElBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxPQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7O0FBRUo7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEVBQUM7Ozs7Ozs7QUM1UkQ7QUFDQTtBQUNBO0FBQ0EsY0FBYSxtSUFBbUk7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQSxFQUFDLEU7Ozs7OztBQ2JELFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQWtDO0FBQ2xDOztBQUVBO0FBQ0EseUNBQXdDLE9BQU8sMkJBQTJCO0FBQzFFOztBQUVBO0FBQ0E7QUFDQSxzQ0FBcUMsWUFBWTtBQUNqRDtBQUNBOztBQUVBO0FBQ0EsMEJBQXlCLGlFQUFpRTtBQUMxRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQSxhQUFZLGVBQWU7QUFDM0Isa0RBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNCQUFxQjtBQUNyQixjQUFhO0FBQ2IsY0FBYTtBQUNiLGNBQWE7QUFDYixjQUFhO0FBQ2IsY0FBYTtBQUNiLEdBQUU7QUFDRixrQ0FBaUM7QUFDakMsSUFBRztBQUNILGVBQWM7QUFDZDtBQUNBLElBQUc7QUFDSCxHQUFFO0FBQ0Y7QUFDQTtBQUNBLEdBQUU7QUFDRjtBQUNBLEdBQUU7QUFDRixFQUFDLEc7Ozs7OztBQzlFRDtBQUNBO0FBQ0E7QUFDQSxjQUFhLG1JQUFtSTtBQUNoSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0EsRUFBQztBQUNEO0FBQ0EsRUFBQyxFOzs7Ozs7QUMzQkQ7QUFDQTtBQUNBO0FBQ0EsY0FBYSxtSUFBbUk7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUMsRTs7Ozs7O0FDWEQ7QUFDQTtBQUNBO0FBQ0EsY0FBYSxtSUFBbUk7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUMsRTs7Ozs7O0FDWEQ7QUFDQSx3TkFBdU4sa0RBQWtELGtEQUFrRCxtREFBbUQsa0RBQWtELGtIQUFrSCxrREFBa0Qsb0RBQW9ELG9EQUFvRCxxREFBcUQsZ0hBQWdILGtEQUFrRCxrREFBa0Qsa0RBQWtELGtEQUFrRCxrSEFBa0gsa0RBQWtELGtEQUFrRCxrREFBa0Qsb0RBQW9ELGdDOzs7Ozs7QUNEcjFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxzQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBMkMsU0FBUztBQUNwRCxzREFBcUQ7QUFDckQ7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBeUM7QUFDekMscUNBQW9DO0FBQ3BDLDZDQUE0QztBQUM1Qyw2Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsbUJBQWtCO0FBQ2xCLHlDQUF3QztBQUN4QyxVQUFTO0FBQ1QsOEJBQTZCO0FBQzdCO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLG9DQUFtQztBQUNuQyxNQUFLO0FBQ0w7QUFDQSxvQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYixVQUFTO0FBQ1Q7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHVCQUFzQixnQkFBZ0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsMkJBQTBCLElBQUksSUFBSSxJQUFJLGFBQWEsRUFBRTtBQUNyRDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsNkNBQTRDLEdBQUc7QUFDL0M7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLGlDQUFnQyxJQUFJO0FBQ3BDO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTOzs7QUFHVCxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQXlDLFFBQVE7QUFDakQsOENBQTZDO0FBQzdDO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRFQUEyRTtBQUMzRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVMsMkRBQTJEO0FBQ3BFO0FBQ0EsVUFBUztBQUNULHFCQUFvQiwyREFBMkQ7QUFDL0UsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQSxzQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNFQUFxRTtBQUNyRTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsK0RBQStEO0FBQ3RGO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBc0IsYUFBYTtBQUNuQztBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLHVDQUFzQyxLQUFLO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx1QkFBc0IsR0FBRztBQUN6Qix1QkFBc0IsZUFBZTtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsRzs7Ozs7O0FDM1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEc7Ozs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsOEZBQThGO0FBQzNHO0FBQ0E7QUFDQTtBQUNBLEVBQUMsRTs7Ozs7OztBQ05EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQSxJQUFHO0FBQ0gsR0FBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDNURBO0FBQ0EseWxCOzs7Ozs7QUNEQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRjtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBLGlDQUFnQyxVQUFVLEVBQUU7QUFDNUMsRTs7Ozs7O0FDcEJBO0FBQ0E7OztBQUdBO0FBQ0EsdUNBQXNDLGlCQUFpQixrQkFBa0Isb0JBQW9CLGNBQWMsYUFBYSx3QkFBd0IsdUJBQXVCLHlDQUF5Qyx1QkFBdUIsNEJBQTRCLCtCQUErQixpQkFBaUIsMkJBQTJCLEdBQUcsa0JBQWtCLGlCQUFpQixpQkFBaUIsOEJBQThCLG9CQUFvQixHQUFHLG9CQUFvQixvQkFBb0IsZ0JBQWdCLHNCQUFzQixHQUFHLHVCQUF1QiwwQkFBMEIsZ0JBQWdCLGlCQUFpQiwrREFBOEUsb0JBQW9CLG9CQUFvQixHQUFHLGVBQWUsdUJBQXVCLGdCQUFnQixvQkFBb0IscUJBQXFCLHdCQUF3QixHQUFHLGlCQUFpQixvQkFBb0IsdUJBQXVCLEdBQUcsNEJBQTRCLGlCQUFpQixpQkFBaUIsOEJBQThCLHlFQUEyRix1QkFBdUIsR0FBRyw0QkFBNEIsaUJBQWlCLGlCQUFpQiw4QkFBOEIseUVBQTJGLHVCQUF1QixxQkFBcUIsR0FBRyw0QkFBNEIsaUJBQWlCLGlCQUFpQiw4QkFBOEIsd0JBQXdCLGdCQUFnQixxQkFBcUIseUJBQXlCLG9CQUFvQixvQkFBb0IsR0FBRywwQkFBMEIscUJBQXFCLEdBQUcsa0NBQWtDLG1CQUFtQixvQkFBb0Isb0JBQW9CLEdBQUcsb0NBQW9DLGdCQUFnQixzQkFBc0IsbUJBQW1CLG9CQUFvQixvRUFBMEYsb0JBQW9CLEdBQUcsd0JBQXdCLG1CQUFtQixrQkFBa0IsR0FBRywyQkFBMkIsdUJBQXVCLGVBQWUsY0FBYyxHQUFHLDJCQUEyQix1QkFBdUIsZUFBZSxlQUFlLEdBQUc7O0FBRTVuRTs7Ozs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBbUMsZ0JBQWdCO0FBQ25ELEtBQUk7QUFDSjtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBZ0IsaUJBQWlCO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxvQkFBb0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQW9ELGNBQWM7O0FBRWxFO0FBQ0E7Ozs7Ozs7QUMzRUEsa0NBQWlDLDRQOzs7Ozs7QUNBakMsa0NBQWlDLDR5RDs7Ozs7O0FDQWpDLGtDQUFpQyw0K0M7Ozs7OztBQ0FqQyxrQ0FBaUMsd29EOzs7Ozs7QUNBakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRTtBQUNGO0FBQ0E7QUFDQSxHQUFFO0FBQ0Y7QUFDQTtBQUNBLEdBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBZ0IsbUJBQW1CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQixzQkFBc0I7QUFDdEM7QUFDQTtBQUNBLG1CQUFrQiwyQkFBMkI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWUsbUJBQW1CO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCLDJCQUEyQjtBQUM1QztBQUNBO0FBQ0EsU0FBUSx1QkFBdUI7QUFDL0I7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBLGtCQUFpQix1QkFBdUI7QUFDeEM7QUFDQTtBQUNBLDRCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsaUJBQWlCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFjO0FBQ2Q7QUFDQSxpQ0FBZ0Msc0JBQXNCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUU7QUFDRjtBQUNBLEdBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVEO0FBQ3ZEOztBQUVBLDhCQUE2QixtQkFBbUI7O0FBRWhEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUssV0FBVztBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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Ryx3REFBd0QsMEJBQTBCLGlCQUFpQixpQkFBaUIsMkJBQTJCLHNCQUFzQix1QkFBdUIsbUJBQW1CLG9CQUFvQixvQkFBb0IsdUJBQXVCLEdBQUcsb0RBQW9ELDBCQUEwQixpQkFBaUIsaUJBQWlCLDhCQUE4QixzQkFBc0IsdUJBQXVCLGdCQUFnQixvQkFBb0Isb0JBQW9CLEdBQUc7O0FBRTlzRDs7Ozs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsbUlBQW1JO0FBQ2hKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDLEU7Ozs7OztBQ2pCRDtBQUNBO0FBQ0E7QUFDQSxjQUFhLDRHQUE0RztBQUN6SDtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUMsRTs7Ozs7O0FDUEQ7QUFDQTtBQUNBO0FBQ0EsY0FBYSxtSUFBbUk7QUFDaEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0EsRUFBQyxFOzs7Ozs7QUNmRDtBQUNBO0FBQ0E7QUFDQSxjQUFhLG1JQUFtSTtBQUNoSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDLEU7Ozs7OztBQ2ZEO0FBQ0E7QUFDQTtBQUNBLGNBQWEsbUlBQW1JO0FBQ2hKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0EsRUFBQyxFIiwiZmlsZSI6ImNvbW1vZGl0eS1kZXRhaWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcclxudmFyIGFqYXggPSByZXF1aXJlKCd1dGlsL2FqYXgnKTtcclxudmFyIGhlYWRlciA9IHJlcXVpcmUoJ2hlYWRlci1uYXYvaGVhZGVyJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbHNwYXJlL3V0aWwuanMnKTtcclxudmFyIG5vRGF0YSA9IHJlcXVpcmUoJ25vLWRhdGEvbm8tZGF0YS5qcycpO1xyXG52YXIgcG9wTG9naW4gPSByZXF1aXJlKCdwb3AtbG9naW4vaW5kZXguanMnKTtcclxucmVxdWlyZSgndXRpbHNwYXJlL3BpY190YWIuanMnKTtcclxuXHJcbnZhciBjYXJ0ID0gcmVxdWlyZSgnYWRkLWNhcnQvaW5kZXgnKTtcclxudmFyIGd1ZXNzTGlzdCA9IHJlcXVpcmUoJ2NvbW1vZGl0eS1saXN0L2d1ZXNzLWxpc3QnKTtcclxudmFyIGV2YWxMaXN0ID0gcmVxdWlyZSgnY29tbW9kaXR5LWxpc3QvZXZhbC1saXN0Jyk7XHJcbnZhciBob3RsaXN0ID0gcmVxdWlyZSgnY29tbW9kaXR5LWxpc3QvaG90LWxpc3QnKTtcclxudmFyIGxpc3Rob3QgPSByZXF1aXJlKCdjb21tb2RpdHktbGlzdC9ob3RfbGlzdCcpO1xyXG52YXIgc2VlQWdhaW4gPSByZXF1aXJlKCdjb21tb2RpdHktbGlzdC9zZWUtYWdpYW4nKTtcclxuXHJcblxyXG52YXIgY29tbW9kaXR5ID0ge1xyXG5cdGlkOiBudWxsLFxyXG5cdHNlYXJjaElkOiBudWxsLFxyXG5cdGxvZ2luaWQ6IG51bGwsXHJcblx0cGhvdG91cmw6IG51bGwsXHJcblx0Y2hlY2tpZDogW10sXHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRoZWFkZXIuaW5pdChmdW5jdGlvbigpe30pO1xyXG5cdFx0JCgnLmFsbC1saXN0JykuaGlkZSgpO1xyXG5cdFx0dmFyIHVybFNlYXJjaCA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcblx0XHRtZS5zZWFyY2hJZCA9IHVybFNlYXJjaC5zcGxpdCgnPScpWzFdO1xyXG5cdFx0bWUuaWQgPSB1dGlsLmdldFBhcmFtcygnaWQnKTtcclxuXHRcdHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xyXG5cdFx0bWUubG9naW5pZCA9IHN0b3JhZ2VbXCJpZFwiXTtcclxuXHRcdG1lLmdldERldGFpbCgpO1xyXG5cdFx0bWUuY2xpY2tFdmVuKCk7XHJcblx0XHRtZS5ndWVzc0xvb2soKTtcclxuXHRcdG1lLmdvb2RzY29tbWVudCgpO1xyXG5cdFx0bWUuaG90TGlzdCgpO1xyXG5cdFx0bWUuc2VlQWdhaW5MaXN0KCk7XHJcblx0fSxcclxuXHQvLyDmn6XnnIvnianlk4Hor6bmg4VcclxuXHRnZXREZXRhaWw6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0YWpheCh7XHJcblx0XHRcdHVybDogJy9lc2hvcC9wcm9kdWN0L2RldGFpbCcsXHJcblx0XHRcdHR5cGU6ICdnZXQnLFxyXG5cdFx0XHRkYXRhOntcclxuXHRcdFx0XHRpZDogbWUuaWQgfHwgbWUuc2VhcmNoSWRcclxuXHRcdFx0fVxyXG5cdFx0fSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XHJcblx0XHRcdGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcblx0XHRcdFx0dmFyIHJlc3BvbiA9IGRhdGEucmVzdWx0O1xyXG5cdFx0XHRcdHZhciBwaG90byA9IHJlc3Bvbi5waG90b1VybHM7XHJcblx0XHRcdFx0JCgnLmRldGFpbHMtbmFtZSx0aXRsZSwuZ29vZHNuYW1lPmInKS5odG1sKHJlc3Bvbi5uYW1lKTtcclxuXHRcdFx0XHQkKCcuZGV0YWlscy1tb25leSBiJykuaHRtbCgnwqUgJyArIHJlc3Bvbi5wcmljZSArICcuMDAnKTtcclxuXHRcdFx0XHQkKCcuZGV0YWlscy1zdGFuZGFyZCBiLC5nb29kc3N0YW5kYXJkPmInKS5odG1sKHJlc3Bvbi5zcGVjKTtcclxuXHRcdFx0XHQkKCcuZGV0YWlscy10eXBlIGIsLmdvb2RzdHlwZT5iJykuaHRtbChyZXNwb24udHlwZU5hbWUpO1xyXG5cdFx0XHRcdCQoJy5kZXRhaWxzLWJyYW5kIGIsLndhcmUtYnJhbmQ+YicpLmh0bWwocmVzcG9uLmJyYW5kKTtcclxuXHRcdFx0XHQkKCcuZGV0YWlscy1zdG9jayBiLC5nb29kc251bT5iJykuaHRtbChyZXNwb24ubnVtKTtcclxuXHRcdFx0XHQkKCcubnVtcyAuc3RvY2stbnVtJykudmFsKHJlc3Bvbi5udW0pO1xyXG5cdFx0XHRcdCQoJy5nb29kc2RhdGFpbHMnKS5odG1sKHJlc3Bvbi5jb250ZW50KTtcclxuXHJcblx0XHRcdFx0dmFyIGltZ0xpc3QgPSAnJztcclxuXHRcdFx0XHR2YXIgaW1nX2xpc3QgPSAnJztcclxuXHJcblx0XHRcdFx0Zm9yKHZhciBpPTA7aTxwaG90by5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHRcdGlmKFtpXSA9PSAwKXtcclxuXHRcdFx0XHRcdFx0JCgnLmp4d3BEVC1kSW1nIGltZycpLmF0dHIoJ3NyYycsIHBob3RvW2ldLnBob3RvVXJsKTtcclxuXHRcdFx0XHRcdFx0bWUucGhvdG91cmwgPSBwaG90b1tpXS5waG90b1VybDtcclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhtZS5waG90b3VybCk7XHJcblx0XHRcdFx0XHRcdGltZ0xpc3QrPVwiPGxpIGNsYXNzPSdpdGVtIG9uJz48YSBocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCk7Jz48aW1nIHNyYz1cIitwaG90b1tpXS5waG90b1VybCtcIj48L2E+PC9saT5cIjtcclxuXHRcdFx0XHRcdFx0aW1nX2xpc3QrPVwiPGxpIGNsYXNzPSdmbCc+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOyc+PGltZyBzcmM9XCIrcGhvdG9baV0ucGhvdG9VcmwrXCI+PC9hPjwvbGk+XCI7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRpbWdMaXN0Kz1cIjxsaSBjbGFzcz0naXRlbSc+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOyc+PGltZyBzcmM9XCIrcGhvdG9baV0ucGhvdG9VcmwrXCI+PC9hPjwvbGk+XCI7XHJcblx0XHRcdFx0XHRcdGltZ19saXN0Kz1cIjxsaSBjbGFzcz0nZmwnPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnPjxpbWcgc3JjPVwiK3Bob3RvW2ldLnBob3RvVXJsK1wiPjwvYT48L2xpPlwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0JCgnLnNtYWxsLWltZycpLmh0bWwoaW1nTGlzdCk7XHJcblx0XHRcdFx0JCgnI3NtYWxsX2ltZycpLmh0bWwoaW1nX2xpc3QpO1xyXG5cclxuXHRcdFx0XHQkKCcjcHJldmlldycpLmJhbnFoKHtcclxuXHRcdFx0XHRcdGJveDpcIiNwcmV2aWV3XCIsLy/mgLvmoYbmnrZcclxuXHRcdFx0XHRcdHBpYzpcIi5zbWFsbC1ib3hcIiwvL+Wkp+WbvuahhuaetlxyXG5cdFx0XHRcdFx0cG51bTpcIi50aHVtYm5haWwtYm94XCIsLy/lsI/lm77moYbmnrZcclxuXHRcdFx0XHRcdHByZXZfYnRuOlwiLmJ0bi1wcmV2XCIsLy/lsI/lm77lt6bnrq3lpLRcclxuXHRcdFx0XHRcdG5leHRfYnRuOlwiLmJ0bi1uZXh0XCIsLy/lsI/lm77lj7Pnrq3lpLRcclxuXHRcdFx0XHRcdGRlbGF5VGltZTo0MDAsLy/liIfmjaLkuIDlvKDlm77niYfml7bpl7RcclxuXHRcdFx0XHRcdG9yZGVyOjAsLy/lvZPliY3mmL7npLrnmoTlm77niYfvvIjku44w5byA5aeL77yJXHJcblx0XHRcdFx0XHRwaWNkaXJlOnRydWUsLy/lpKflm77mu5rliqjmlrnlkJHvvIh0cnVl5Li65rC05bmz5pa55ZCR5rua5Yqo77yJXHJcblx0XHRcdFx0XHRtaW5kaXJlOnRydWUsLy/lsI/lm77mu5rliqjmlrnlkJHvvIh0cnVl5Li65rC05bmz5pa55ZCR5rua5Yqo77yJXHJcblx0XHRcdFx0XHRtaW5fcGljbnVtOjUvL+Wwj+WbvuaYvuekuuaVsOmHj1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcclxuXHRcdFx0XHR2YXIgbG9naW5TdGF0dXMgPSBzdG9yYWdlW1wiaXNsb2dpblwiXTtcclxuXHJcblx0XHRcdFx0aWYobG9naW5TdGF0dXMgPT0gJ3llcycpe1xyXG5cdFx0XHRcdFx0JCgnLnRvcCAuc2l0ZS1sb2dlZCcpLmhpZGUoKTtcclxuXHRcdFx0XHRcdC8vIOeCueWHu+WKoOWFpei0reeJqei9plxyXG5cdFx0XHRcdFx0JCgnLmFkZC1jYXJ0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0YWpheCh7XHJcblx0XHRcdFx0XHRcdFx0dXJsOiAnL2VzaG9wL2NhcnQvYWRkJyxcclxuXHRcdFx0XHRcdFx0XHR0eXBlOiAncG9zdCcsXHJcblx0XHRcdFx0XHRcdFx0ZGF0YTp7XHJcblx0XHRcdFx0XHRcdFx0XHRhY2NvdW50SWQ6IG1lLmxvZ2luaWQsXHJcblx0XHRcdFx0XHRcdFx0XHRpZDogbWUuaWQgfHwgbWUuc2VhcmNoSWQsXHJcblx0XHRcdFx0XHRcdFx0XHRudW06ICQoJy5kZXRhaWxzLW51bWJlcicpLnZhbCgpXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgcmVzcG9uID0gZGF0YS5yZXN1bHQ7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgZGF0YXMgPSB7fTtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGFzLmlkID0gbWUuaWQgfHwgbWUuc2VhcmNoSWQ7XHJcblx0XHRcdFx0XHRcdFx0XHRkYXRhcy5uYW1lID0gJCgnLmRldGFpbHMtbmFtZScpLmh0bWwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRhdGFzLm51bSA9ICQoJy5kZXRhaWxzLW51bWJlcicpLnZhbCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YXMucGhvdG91cmwgPSBtZS5waG90b3VybDtcclxuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YXMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0bWUuYWRkQ2FydChkYXRhcyk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0Ly8g56uL5Y2z6LSt5LmwXHJcblx0XHRcdFx0XHQkKCcuYnV5LW5vdycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdG1lLmNoZWNraWQucHVzaCh7Z29vZHNJZDogcmVzcG9uLmlkLG51bTogJCgnLmRldGFpbHMtbnVtYmVyJykudmFsKCksbmFtZTogcmVzcG9uLm5hbWUscGhvdG91cmw6IHJlc3Bvbi5vbmVQaG90byxtb25leTogJCgnLmRldGFpbHMtbW9uZXkgYicpLmh0bWwoKX0pO1xyXG5cdFx0XHRcdFx0XHR2YXIgZ29vZGlkID0gSlNPTi5zdHJpbmdpZnkobWUuY2hlY2tpZCk7XHJcblx0XHRcdFx0XHRcdHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJnb29kc2lkXCIsZ29vZGlkKTtcclxuXHRcdFx0XHRcdFx0bG9jYXRpb24uaHJlZiA9ICcuLi9vcmRlci1zZXR0bGUvb3JkZXItbGlzdC5odG1sJztcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKCcuYnV5LW5vdywuYWRkLWNhcnQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHQkKCcucG9wLWxvZ2luZycpLnNob3coKTtcclxuXHRcdFx0XHRcdFx0cG9wTG9naW4uaW5pdCgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQkKFwiLndhcmUtZGV0YWlsXCIpLnNsaWRlKHtcclxuXHRcdFx0XHRcdG1haW5DZWxsOlwiLndhcmUtaW50cm9kdWNlXCIsICAvL+WIh+aNouWFg+e0oOeahOWMheijueWxguWvueixoVxyXG5cdFx0XHRcdFx0dGl0Q2VsbDpcIi53YXJlLW5hdiBsaVwiLCAgLy/lr7zoiKrlhYPntKDlr7nosaHvvIjpvKDmoIfnmoTop6blj5HlhYPntKDlr7nosaHvvIlcclxuXHRcdFx0XHRcdGVmZmVjdDpcImZhZGVcIiwgICAvL+WKqOeUu+aViOaenCAgZmFkZe+8mua4kOaYvlxyXG5cdFx0XHRcdFx0dHJpZ2dlcjpcImNsaWNrXCIsICAvL3RpdENlbGzop6blj5HmlrnlvI8gfHwgbW91c2VvdmVy77ya6byg5qCH56e76L+H6Kem5Y+R77ybXHJcblx0XHRcdFx0XHR0aXRPbkNsYXNzTmFtZTonYWN0aXZlJyAgIC8v5b2T5YmNdGl0Q2VsbOS9jee9ruiHquWKqOWinuWKoOeahGNsYXNz5ZCN56ewXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fSxcclxuXHQvLyDliqDlhaXotK3nianovaZcclxuXHRhZGRDYXJ0OiBmdW5jdGlvbihkYXRhKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHQkKCcuaG90LXJlY29tbWVuZCcpLmhpZGUoKTtcclxuXHRcdCQoJy53cmFwQycpLmh0bWwoY2FydC5pbml0KGRhdGEpKTtcclxuXHR9LFxyXG5cdC8vIOWVhuWTgeivhOiuulxyXG5cdGdvb2RzY29tbWVudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRhamF4KHtcclxuXHRcdFx0dXJsOiAnL2VzaG9wL3JlbWFyay9xdWVyeScsXHJcblx0XHRcdHR5cGU6ICdwb3N0JyxcclxuXHRcdFx0ZGF0YTp7XHJcblx0XHRcdFx0cHJvZHVjdElkOiBtZS5pZCB8fCBtZS5zZWFyY2hJZFxyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0aWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuXHRcdFx0XHR2YXIgcmVzcG9uID0gZGF0YS5yZXN1bHQ7XHJcblx0XHRcdFx0JCgnLmNvbW1vZGl0eS1ldmFsJykuaHRtbChldmFsTGlzdChyZXNwb24ubGlzdCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdC8vIOeDremUgOaOkuihjOamnFxyXG5cdGhvdExpc3Q6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0YWpheCh7XHJcblx0XHRcdHVybDogJy9lc2hvcC9hY3Rpdml0eS9saXN0JyxcclxuXHRcdFx0dHlwZTogJ3Bvc3QnLFxyXG5cdFx0XHRkYXRhOntcclxuXHRcdFx0XHRub3M6ICdBVEMyMDE3MTExOTIxMDI1NzkxODkyJ1xyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0aWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuXHRcdFx0XHR2YXIgcmVzcG9uID0gZGF0YS5yZXN1bHQ7XHJcblx0XHRcdFx0JCgnLmhvdC1saXN0JykuaHRtbChob3RsaXN0KHJlc3BvblswXS5pdGVtcykpO1xyXG5cdFx0XHRcdCQoJy5ob3QtbGlzdCBsaTpndCgzKScpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdCQoJy5ob3RMaXN0JykuaHRtbChsaXN0aG90KHJlc3BvblswXS5pdGVtcykpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdC8vIOeMnOS9oOWWnOasolxyXG5cdGd1ZXNzTG9vazogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRhamF4KHtcclxuXHRcdFx0dXJsOiAnL2VzaG9wL3Byb2R1Y3QvbGlrZScsXHJcblx0XHRcdHR5cGU6ICdnZXQnLFxyXG5cdFx0XHRkYXRhOntcclxuXHRcdFx0XHRudW06ICc1J1xyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdFx0aWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuXHRcdFx0XHR2YXIgcmVzcG9uID0gZGF0YS5yZXN1bHQ7XHJcblx0XHRcdFx0JCgnLmNob2ljZS1saXN0JykuaHRtbChndWVzc0xpc3QocmVzcG9uKSk7XHJcblx0XHRcdFx0JCgnLmNob2ljZS1saXN0PmRpdjpndCg0KScpLnJlbW92ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdC8vIOeci+S6huWPiOeci1xyXG5cdHNlZUFnYWluTGlzdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRhamF4KHtcclxuXHRcdFx0dXJsOiAnL2VzaG9wL3Byb2R1Y3Qvc2ltbGlzdCcsXHJcblx0XHRcdHR5cGU6ICdnZXQnLFxyXG5cdFx0XHRkYXRhOntcclxuXHRcdFx0XHRpZDogbWUuaWQgfHwgbWUuc2VhcmNoSWRcclxuXHRcdFx0fVxyXG5cdFx0fSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XHJcblx0XHRcdGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcblx0XHRcdFx0dmFyIHJlc3BvbiA9IGRhdGEucmVzdWx0O1xyXG5cdFx0XHRcdCQoJy5hZ2Fpbi1saXN0JykuaHRtbChzZWVBZ2FpbihyZXNwb24pKTtcclxuXHRcdFx0XHQkKCcuYWdhaW4tbGlzdD5saTpndCgxKScpLnJlbW92ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cdGNsaWNrRXZlbjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHQkKCcubnVtcyAuZGV0YWlscy1udW1iZXInKS5vbignaW5wdXQgcHJvcGVydHljaGFuZ2UnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHQkKHRoaXMpWzBdLnZhbHVlID0gJCh0aGlzKVswXS52YWx1ZS5yZXBsYWNlKC9cXEQvZywnJyk7ICAgICAgICAvL+mZkOWItuWPquiDvei+k+WFpeaVsOWtl1xyXG5cdFx0XHR2YXIgbnVtYmVyU2sgPSBwYXJzZUludCgkKCcuc3RvY2stbnVtJykudmFsKCkpO1xyXG5cdFx0XHRpZigkKHRoaXMpLnZhbCgpID4gbnVtYmVyU2spe1xyXG5cdFx0XHRcdCQoJy5lcnJvci1udW0nKS5zaG93KCk7XHJcblx0XHRcdFx0JCgnLmVycm9yLW51bScpLmFkZENsYXNzKCdzaG93RXJyb3InKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcuZXJyb3ItbnVtJykuaGlkZSgpO1xyXG5cdFx0XHRcdCQoJy5lcnJvci1udW0nKS5yZW1vdmVDbGFzcygnc2hvd0Vycm9yJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0JCgnLm51bXMgLmFkZE51bScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBudW1iZXJTayA9IHBhcnNlSW50KCQoJy5zdG9jay1udW0nKS52YWwoKSk7XHJcblx0XHRcdHZhciBudW1iZXJzID0gcGFyc2VJbnQoJCgnLm51bXMgLmRldGFpbHMtbnVtYmVyJykudmFsKCkpO1xyXG5cdFx0XHR2YXIgYWRkTnVtYmVyID0gbnVtYmVycys9MTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhudW1iZXJzKVxyXG5cdFx0XHRpZihhZGROdW1iZXIgPiBudW1iZXJTaykge1xyXG5cdFx0XHRcdCQoJy5lcnJvci1udW0nKS5zaG93KCk7XHJcblx0XHRcdFx0JCgnLmVycm9yLW51bScpLmFkZENsYXNzKCdzaG93RXJyb3InKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnLmVycm9yLW51bScpLmhpZGUoKTtcclxuXHRcdFx0XHQkKCcuZXJyb3ItbnVtJykucmVtb3ZlQ2xhc3MoJ3Nob3dFcnJvcicpO1xyXG5cdFx0XHRcdCQoJy5udW1zIC5kZXRhaWxzLW51bWJlcicpLnZhbChhZGROdW1iZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQoJy5udW1zIC5yZWR1Y2VOdW0nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgbnVtYmVyU2sgPSBwYXJzZUludCgkKCcuc3RvY2stbnVtJykudmFsKCkpO1xyXG5cdFx0XHR2YXIgbnVtYmVycyA9IHBhcnNlSW50KCQoJy5udW1zIC5kZXRhaWxzLW51bWJlcicpLnZhbCgpKTtcclxuXHRcdFx0aWYobnVtYmVycyA9PSAxKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKG51bWJlcnMgPD0gbnVtYmVyU2spIHtcclxuXHRcdFx0XHRcdCQoJy5lcnJvci1udW0nKS5oaWRlKCk7XHJcblx0XHRcdFx0XHQkKCcuZXJyb3ItbnVtJykucmVtb3ZlQ2xhc3MoJ3Nob3dFcnJvcicpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR2YXIgcmVkdWNlTnVtYmVyID0gbnVtYmVycy09MTtcclxuXHRcdFx0XHQkKCcubnVtcyAuZGV0YWlscy1udW1iZXInKS52YWwocmVkdWNlTnVtYmVyLS0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhvdC1saXN0IGxpJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIGlkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWRldGFpbC5odG1sP2lkPScgKyBpZDtcclxuXHRcdH0pO1xyXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuaG90TGlzdCBsaScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBpZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG5cdFx0XHRsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1kZXRhaWwuaHRtbD9pZD0nICsgaWQ7XHJcblx0XHR9KTtcclxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmNob2ljZS1saXN0IC5saXN0LWNob2ljZScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBpZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG5cdFx0XHRsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1kZXRhaWwuaHRtbD9pZD0nICsgaWQ7XHJcblx0XHR9KTtcclxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFnYWluLWxpc3QgbGknLCBmdW5jdGlvbigpe1xyXG5cdFx0XHR2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuXHRcdFx0bG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktZGV0YWlsLmh0bWw/aWQ9JyArIGlkO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG5jb21tb2RpdHkuaW5pdCgpXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9tYWluL2NvbW1vZGl0eS1kZXRhaWwuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiJFwiXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgWVUgb24gMjAxNi8yLzE4LlxyXG4gKi9cclxudmFyIFEgPSByZXF1aXJlKCdxJyk7XHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBDT05GSUc9cmVxdWlyZSgnY29uZmlnJyk7XHJcbiQuYWpheFNldHVwKHtjYWNoZTogZmFsc2V9KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0KXtcclxuICAgIHJldHVybiBRLnByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpe1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcclxuICAgICAgICAgICAgZGF0YTogb3B0LmRhdGEgfHwge30sXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBvcHQuZGF0YVR5cGUgfHwgJ2pzb24nLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBvcHQuaGVhZGVycyB8fCB7fSxcclxuICAgICAgICAgICAgdHlwZTogb3B0LnR5cGUgfHwgJ2dldCcsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhLHRleHRTdGF0dXMsanFYSFIpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBqcVhIUi50aGVuO1xyXG4gICAgICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gJzQwMScpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8v5pyq55m75b2VIOaIluiAheeZu+W9lei2heaXtlxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPUNPTkZJRy5VUkwuU1NPX0xPR0lOK1wiP3NlcnZpY2U9XCIrQ09ORklHLlVSTC5JTkRFWDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUganFYSFIudGhlbjtcclxuICAgICAgICAgICAgICAgIHJlamVjdC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC91dGlsL2FqYXguanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxNyBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9ibG9iL3YxL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gUHJlZmVyIHdpbmRvdyBvdmVyIHNlbGYgZm9yIGFkZC1vbiBzY3JpcHRzLiBVc2Ugc2VsZiBmb3JcbiAgICAgICAgLy8gbm9uLXdpbmRvd2VkIGNvbnRleHRzLlxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBgd2luZG93YCBvYmplY3QsIHNhdmUgdGhlIHByZXZpb3VzIFEgZ2xvYmFsXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXG4gICAgICAgIHZhciBwcmV2aW91c1EgPSBnbG9iYWwuUTtcbiAgICAgICAgZ2xvYmFsLlEgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgbm9Db25mbGljdCBmdW5jdGlvbiBzbyBRIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgIC8vIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuUSA9IHByZXZpb3VzUTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuICAgIC8vIHF1ZXVlIGZvciBsYXRlIHRhc2tzLCB1c2VkIGJ5IHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmdcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuICAgICAgICB2YXIgdGFzaywgZG9tYWluO1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pO1xuXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxhdGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXNrID0gbGF0ZXJRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBydW5zIGEgc2luZ2xlIGZ1bmN0aW9uIGluIHRoZSBhc3luYyBxdWV1ZVxuICAgIGZ1bmN0aW9uIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHByb2Nlc3MudG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBFbnN1cmUgUSBpcyBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudCwgd2l0aCBhIGBwcm9jZXNzLm5leHRUaWNrYC5cbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcbiAgICAgICAgLy8gKiBNb2NoYSB0ZXN0IHJ1bm5lciAtIGV4cG9zZXMgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgXG4gICAgICAgIC8vICogQnJvd3NlcmlmeSAtIGV4cG9zZXMgYSBgcHJvY2Vzcy5uZXhUaWNrYCBmdW5jdGlvbiB0aGF0IHVzZXNcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxuICAgICAgICAvLyAgICBpdCBpcyBmYXN0ZXIuIEJyb3dzZXJpZnkncyBgcHJvY2Vzcy50b1N0cmluZygpYCB5aWVsZHNcbiAgICAgICAgLy8gICBcIltvYmplY3QgT2JqZWN0XVwiLCB3aGlsZSBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudFxuICAgICAgICAvLyAgIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBydW5zIGEgdGFzayBhZnRlciBhbGwgb3RoZXIgdGFza3MgaGF2ZSBiZWVuIHJ1blxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gYWZ0ZXIgYWxsIGB0aGVuYGQgdGFza3MgaGF2ZSBiZWVuIHJ1bi5cbiAgICBuZXh0VGljay5ydW5BZnRlciA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgfHwgZnVuY3Rpb24gKG9iaiwgcHJvcCwgZGVzY3JpcHRvcikge1xuICAgIG9ialtwcm9wXSA9IGRlc2NyaXB0b3IudmFsdWU7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjayAmJiAoIWVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fIHx8IGVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fID4gcC5zdGFja0NvdW50ZXIpKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0X2RlZmluZVByb3BlcnR5KGVycm9yLCBcIl9fbWluaW11bVN0YWNrQ291bnRlcl9fXCIsIHt2YWx1ZTogcC5zdGFja0NvdW50ZXIsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgICAgICBvYmplY3RfZGVmaW5lUHJvcGVydHkoZXJyb3IsIFwic3RhY2tcIiwge3ZhbHVlOiBzdGFjaywgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGNvdW50ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0b3BwaW5nIHBvaW50IGZvciBidWlsZGluZ1xuICogbG9uZyBzdGFjayB0cmFjZXMuIEluIG1ha2VTdGFja1RyYWNlTG9uZyB3ZSB3YWxrIGJhY2t3YXJkcyB0aHJvdWdoXG4gKiB0aGUgbGlua2VkIGxpc3Qgb2YgcHJvbWlzZXMsIG9ubHkgc3RhY2tzIHdoaWNoIHdlcmUgY3JlYXRlZCBiZWZvcmVcbiAqIHRoZSByZWplY3Rpb24gYXJlIGNvbmNhdGVuYXRlZC5cbiAqL1xudmFyIGxvbmdTdGFja0NvdW50ZXIgPSAxO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICAgICAgcHJvbWlzZS5zdGFja0NvdW50ZXIgPSBsb25nU3RhY2tDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICAgICAgLy8gT25seSBob2xkIGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgcHJvbWlzZSBpZiBsb25nIHN0YWNrc1xuICAgICAgICAgICAgLy8gYXJlIGVuYWJsZWQgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxuUS5wcm9taXNlID0gcHJvbWlzZTtcbmZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxucHJvbWlzZS5hbGwgPSBhbGw7IC8vIEVTNlxucHJvbWlzZS5yZWplY3QgPSByZWplY3Q7IC8vIEVTNlxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XG5cbi8vIFhYWCBleHBlcmltZW50YWwuICBUaGlzIG1ldGhvZCBpcyBhIHdheSB0byBkZW5vdGUgdGhhdCBhIGxvY2FsIHZhbHVlIGlzXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcbi8vIGluc3RlYWQgb2YgcGFzc2luZyBhIHJlZmVyZW5jZS5cblEucGFzc0J5Q29weSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXG4gKiBidXQgb3RoZXJ3aXNlIHJlamVjdHMuXG4gKiBAcGFyYW0geCB7QW55Kn1cbiAqIEBwYXJhbSB5IHtBbnkqfVxuICogQHJldHVybnMge0FueSp9IGEgcHJvbWlzZSBmb3IgeCBhbmQgeSBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGEgcmVqZWN0aW9uXG4gKiBvdGhlcndpc2UuXG4gKlxuICovXG5RLmpvaW4gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gUShbdGhpcywgdGhhdF0pLnNwcmVhZChmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhpcyBvbmNlIHdlIGNhbiBhc3N1bWUgYXQgbGVhc3QgRVM1XG4gICAgICAgIC8vIGFuc3dlclBzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInVuaGFuZGxlZFJlamVjdGlvblwiLCByZWFzb24sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGF0UmVwb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJyZWplY3Rpb25IYW5kbGVkXCIsIHVuaGFuZGxlZFJlYXNvbnNbYXRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nQ291bnQ7XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLXBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxuICogaWdub3JlZC4gIFJlamVjdHMgb25seSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIG9yIHByb21pc2VzIGZvciB2YWx1ZXNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXG4gKiBvciBhIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqL1xuUS5hbnkgPSBhbnk7XG5cbmZ1bmN0aW9uIGFueShwcm9taXNlcykge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2luZGV4XTtcblxuICAgICAgICBwZW5kaW5nQ291bnQrKztcblxuICAgICAgICB3aGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnIpIHtcbiAgICAgICAgICAgIHBlbmRpbmdDb3VudC0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gKFwiUSBjYW4ndCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgZnJvbSBhbnkgcHJvbWlzZSwgYWxsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9taXNlcyB3ZXJlIHJlamVjdGVkLiBMYXN0IGVycm9yIG1lc3NhZ2U6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9ncmVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYW55KHRoaXMpO1xufTtcblxuLyoqXG4gKiBXYWl0cyBmb3IgYWxsIHByb21pc2VzIHRvIGJlIHNldHRsZWQsIGVpdGhlciBmdWxmaWxsZWQgb3JcbiAqIHJlamVjdGVkLiAgVGhpcyBpcyBkaXN0aW5jdCBmcm9tIGBhbGxgIHNpbmNlIHRoYXQgd291bGQgc3RvcFxuICogd2FpdGluZyBhdCB0aGUgZmlyc3QgcmVqZWN0aW9uLiAgVGhlIHByb21pc2UgcmV0dXJuZWQgYnlcbiAqIGBhbGxSZXNvbHZlZGAgd2lsbCBuZXZlciBiZSByZWplY3RlZC5cbiAqIEBwYXJhbSBwcm9taXNlcyBhIHByb21pc2UgZm9yIGFuIGFycmF5IChvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcbiAqIChvciB2YWx1ZXMpXG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqL1xuUS5hbGxSZXNvbHZlZCA9IGRlcHJlY2F0ZShhbGxSZXNvbHZlZCwgXCJhbGxSZXNvbHZlZFwiLCBcImFsbFNldHRsZWRcIik7XG5mdW5jdGlvbiBhbGxSZXNvbHZlZChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcHJvbWlzZXMgPSBhcnJheV9tYXAocHJvbWlzZXMsIFEpO1xuICAgICAgICByZXR1cm4gd2hlbihhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocHJvbWlzZSwgbm9vcCwgbm9vcCk7XG4gICAgICAgIH0pKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VzO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsUmVzb2x2ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbFJlc29sdmVkKHRoaXMpO1xufTtcblxuLyoqXG4gKiBAc2VlIFByb21pc2UjYWxsU2V0dGxlZFxuICovXG5RLmFsbFNldHRsZWQgPSBhbGxTZXR0bGVkO1xuZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlcykge1xuICAgIHJldHVybiBRKHByb21pc2VzKS5hbGxTZXR0bGVkKCk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZWlyIHN0YXRlcyAoYXNcbiAqIHJldHVybmVkIGJ5IGBpbnNwZWN0YCkgd2hlbiB0aGV5IGhhdmUgYWxsIHNldHRsZWQuXG4gKiBAcGFyYW0ge0FycmF5W0FueSpdfSB2YWx1ZXMgYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMge0FycmF5W1N0YXRlXX0gYW4gYXJyYXkgb2Ygc3RhdGVzIGZvciB0aGUgcmVzcGVjdGl2ZSB2YWx1ZXMuXG4gKi9cblByb21pc2UucHJvdG90eXBlLmFsbFNldHRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcmV0dXJuIGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gUShwcm9taXNlKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZ2FyZGxlc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UuaW5zcGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgZmFpbHVyZSBvZiBhIHByb21pc2UsIGdpdmluZyBhbiBvcG9ydHVuaXR5IHRvIHJlY292ZXJcbiAqIHdpdGggYSBjYWxsYmFjay4gIElmIHRoZSBnaXZlbiBwcm9taXNlIGlzIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gKiBwcm9taXNlIGlzIGZ1bGZpbGxlZC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBmdWxmaWxsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlmIHRoZVxuICogZ2l2ZW4gcHJvbWlzZSBpcyByZWplY3RlZFxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFja1xuICovXG5RLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogQXR0YWNoZXMgYSBsaXN0ZW5lciB0aGF0IGNhbiByZXNwb25kIHRvIHByb2dyZXNzIG5vdGlmaWNhdGlvbnMgZnJvbSBhXG4gKiBwcm9taXNlJ3Mgb3JpZ2luYXRpbmcgZGVmZXJyZWQuIFRoaXMgbGlzdGVuZXIgcmVjZWl2ZXMgdGhlIGV4YWN0IGFyZ3VtZW50c1xuICogcGFzc2VkIHRvIGBgZGVmZXJyZWQubm90aWZ5YGAuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gcmVjZWl2ZSBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybnMgdGhlIGdpdmVuIHByb21pc2UsIHVuY2hhbmdlZFxuICovXG5RLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5mdW5jdGlvbiBwcm9ncmVzcyhvYmplY3QsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uIChwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIG9wcG9ydHVuaXR5IHRvIG9ic2VydmUgdGhlIHNldHRsaW5nIG9mIGEgcHJvbWlzZSxcbiAqIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgcHJvbWlzZSBpcyBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuICBGb3J3YXJkc1xuICogdGhlIHJlc29sdXRpb24gdG8gdGhlIHJldHVybmVkIHByb21pc2Ugd2hlbiB0aGUgY2FsbGJhY2sgaXMgZG9uZS5cbiAqIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBjb21wbGV0aW9uLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBvYnNlcnZlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlblxuICogcHJvbWlzZSwgdGFrZXMgbm8gYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSB3aGVuXG4gKiBgYGZpbmBgIGlzIGRvbmUuXG4gKi9cblEuZmluID0gLy8gWFhYIGxlZ2FjeVxuUVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdClbXCJmaW5hbGx5XCJdKGNhbGxiYWNrKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZpbiA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2sgfHwgdHlwZW9mIGNhbGxiYWNrLmFwcGx5ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCBhcHBseSBmaW5hbGx5IGNhbGxiYWNrXCIpO1xuICAgIH1cbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXG4gICAgdmFyIHByb21pc2UgPSBmdWxmaWxsZWQgfHwgcmVqZWN0ZWQgfHwgcHJvZ3Jlc3MgP1xuICAgICAgICB0aGlzLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIDpcbiAgICAgICAgdGhpcztcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xuICAgIH1cblxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYXVzZXMgYSBwcm9taXNlIHRvIGJlIHJlamVjdGVkIGlmIGl0IGRvZXMgbm90IGdldCBmdWxmaWxsZWQgYmVmb3JlXG4gKiBzb21lIG1pbGxpc2Vjb25kcyB0aW1lIG91dC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcyB0aW1lb3V0XG4gKiBAcGFyYW0ge0FueSp9IGN1c3RvbSBlcnJvciBtZXNzYWdlIG9yIEVycm9yIG9iamVjdCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXG4gKiBmdWxmaWxsZWQgYmVmb3JlIHRoZSB0aW1lb3V0LCBvdGhlcndpc2UgcmVqZWN0ZWQuXG4gKi9cblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xuICAgIHJldHVybiBRKG9iamVjdCkudGltZW91dChtcywgZXJyb3IpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgZXJyb3IpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFlcnJvciB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yIHx8IFwiVGltZWQgb3V0IGFmdGVyIFwiICsgbXMgKyBcIiBtc1wiKTtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgfSwgbXMpO1xuXG4gICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfSwgZGVmZXJyZWQubm90aWZ5KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGdpdmVuIHZhbHVlIChvciBwcm9taXNlZCB2YWx1ZSksIHNvbWVcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXG4gKiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlLlxuICogSWYgdGhlIGdpdmVuIHByb21pc2UgcmVqZWN0cywgdGhhdCBpcyBwYXNzZWQgaW1tZWRpYXRlbHkuXG4gKi9cblEuZGVsYXkgPSBmdW5jdGlvbiAob2JqZWN0LCB0aW1lb3V0KSB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHZvaWQgMCkge1xuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICpcbiAqICAgICAgUS5uZmFwcGx5KEZTLnJlYWRGaWxlLCBbX19maWxlbmFtZV0pXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiAgICAgIH0pXG4gKlxuICovXG5RLm5mYXBwbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZjYWxsKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKVxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqIH0pXG4gKlxuICovXG5RLm5mY2FsbCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxuICogdmVyc2lvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXG4gKiAudGhlbihjb25zb2xlLmxvZylcbiAqIC5kb25lKClcbiAqL1xuUS5uZmJpbmQgPVxuUS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRIGNhbid0IHdyYXAgYW4gdW5kZWZpbmVkIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBRKGNhbGxiYWNrKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYmluZCA9XG5Qcm9taXNlLnByb3RvdHlwZS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLmRlbm9kZWlmeS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuUS5uYmluZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBRKGJvdW5kKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5iaW5kID0gZnVuY3Rpb24gKC8qdGhpc3AsIC4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAwKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEubmJpbmQuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xuICogd2lsbCBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5ucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5ucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyB8fCBbXSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrLCBmb3J3YXJkaW5nIHRoZSBnaXZlbiB2YXJpYWRpYyBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZFxuICogY2FsbGJhY2sgYXJndW1lbnQuXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxuICogYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5RLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUHJvbWlzZS5wcm90b3R5cGUubmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIElmIGEgZnVuY3Rpb24gd291bGQgbGlrZSB0byBzdXBwb3J0IGJvdGggTm9kZSBjb250aW51YXRpb24tcGFzc2luZy1zdHlsZSBhbmRcbiAqIHByb21pc2UtcmV0dXJuaW5nLXN0eWxlLCBpdCBjYW4gZW5kIGl0cyBpbnRlcm5hbCBwcm9taXNlIGNoYWluIHdpdGhcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcbiAqIGVsZWN0cyB0byB1c2UgYSBub2RlYmFjaywgdGhlIHJlc3VsdCB3aWxsIGJlIHNlbnQgdGhlcmUuICBJZiB0aGV5IGRvIG5vdFxuICogcGFzcyBhIG5vZGViYWNrLCB0aGV5IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IHByb21pc2UuXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZWJhY2sgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrXG4gKiBAcmV0dXJucyBlaXRoZXIgdGhlIHByb21pc2Ugb3Igbm90aGluZ1xuICovXG5RLm5vZGVpZnkgPSBub2RlaWZ5O1xuZnVuY3Rpb24gbm9kZWlmeShvYmplY3QsIG5vZGViYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xuICAgIGlmIChub2RlYmFjaykge1xuICAgICAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuUS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUS5ub0NvbmZsaWN0IG9ubHkgd29ya3Mgd2hlbiBRIGlzIHVzZWQgYXMgYSBnbG9iYWxcIik7XG59O1xuXG4vLyBBbGwgY29kZSBiZWZvcmUgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzLlxudmFyIHFFbmRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcblxucmV0dXJuIFE7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3EvcS5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgNSA2IDcgOCAxMCAxMSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwidmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkge1xuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVvdXQuY2xvc2UoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBzZXRpbW1lZGlhdGUgYXR0YWNoZXMgaXRzZWxmIHRvIHRoZSBnbG9iYWwgb2JqZWN0XG5yZXF1aXJlKFwic2V0aW1tZWRpYXRlXCIpO1xuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSBzZXRJbW1lZGlhdGU7XG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2VicGFjay1zdHJlYW0vfi90aW1lcnMtYnJvd3NlcmlmeS9tYWluLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwiKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKGdsb2JhbC5zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXh0SGFuZGxlID0gMTsgLy8gU3BlYyBzYXlzIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgdmFyIHRhc2tzQnlIYW5kbGUgPSB7fTtcbiAgICB2YXIgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgcmVnaXN0ZXJJbW1lZGlhdGU7XG5cbiAgICBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoY2FsbGJhY2spIHtcbiAgICAgIC8vIENhbGxiYWNrIGNhbiBlaXRoZXIgYmUgYSBmdW5jdGlvbiBvciBhIHN0cmluZ1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKFwiXCIgKyBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICAvLyBDb3B5IGZ1bmN0aW9uIGFyZ3VtZW50c1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICB9XG4gICAgICAvLyBTdG9yZSBhbmQgcmVnaXN0ZXIgdGhlIHRhc2tcbiAgICAgIHZhciB0YXNrID0geyBjYWxsYmFjazogY2FsbGJhY2ssIGFyZ3M6IGFyZ3MgfTtcbiAgICAgIHRhc2tzQnlIYW5kbGVbbmV4dEhhbmRsZV0gPSB0YXNrO1xuICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUobmV4dEhhbmRsZSk7XG4gICAgICByZXR1cm4gbmV4dEhhbmRsZSsrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGhhbmRsZSkge1xuICAgICAgICBkZWxldGUgdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bih0YXNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRhc2suY2FsbGJhY2s7XG4gICAgICAgIHZhciBhcmdzID0gdGFzay5hcmdzO1xuICAgICAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bklmUHJlc2VudChoYW5kbGUpIHtcbiAgICAgICAgLy8gRnJvbSB0aGUgc3BlYzogXCJXYWl0IHVudGlsIGFueSBpbnZvY2F0aW9ucyBvZiB0aGlzIGFsZ29yaXRobSBzdGFydGVkIGJlZm9yZSB0aGlzIG9uZSBoYXZlIGNvbXBsZXRlZC5cIlxuICAgICAgICAvLyBTbyBpZiB3ZSdyZSBjdXJyZW50bHkgcnVubmluZyBhIHRhc2ssIHdlJ2xsIG5lZWQgdG8gZGVsYXkgdGhpcyBpbnZvY2F0aW9uLlxuICAgICAgICBpZiAoY3VycmVudGx5UnVubmluZ0FUYXNrKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBieSBkb2luZyBhIHNldFRpbWVvdXQuIHNldEltbWVkaWF0ZSB3YXMgdHJpZWQgaW5zdGVhZCwgYnV0IGluIEZpcmVmb3ggNyBpdCBnZW5lcmF0ZWQgYVxuICAgICAgICAgICAgLy8gXCJ0b28gbXVjaCByZWN1cnNpb25cIiBlcnJvci5cbiAgICAgICAgICAgIHNldFRpbWVvdXQocnVuSWZQcmVzZW50LCAwLCBoYW5kbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcnVuKHRhc2spO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7IHJ1bklmUHJlc2VudChoYW5kbGUpOyB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5Vc2VQb3N0TWVzc2FnZSgpIHtcbiAgICAgICAgLy8gVGhlIHRlc3QgYWdhaW5zdCBgaW1wb3J0U2NyaXB0c2AgcHJldmVudHMgdGhpcyBpbXBsZW1lbnRhdGlvbiBmcm9tIGJlaW5nIGluc3RhbGxlZCBpbnNpZGUgYSB3ZWIgd29ya2VyLFxuICAgICAgICAvLyB3aGVyZSBgZ2xvYmFsLnBvc3RNZXNzYWdlYCBtZWFucyBzb21ldGhpbmcgY29tcGxldGVseSBkaWZmZXJlbnQgYW5kIGNhbid0IGJlIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgICAgaWYgKGdsb2JhbC5wb3N0TWVzc2FnZSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpIHtcbiAgICAgICAgICAgIHZhciBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBvbGRPbk1lc3NhZ2UgPSBnbG9iYWwub25tZXNzYWdlO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoXCJcIiwgXCIqXCIpO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IG9sZE9uTWVzc2FnZTtcbiAgICAgICAgICAgIHJldHVybiBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIC8vIEluc3RhbGxzIGFuIGV2ZW50IGhhbmRsZXIgb24gYGdsb2JhbGAgZm9yIHRoZSBgbWVzc2FnZWAgZXZlbnQ6IHNlZVxuICAgICAgICAvLyAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS93aW5kb3cucG9zdE1lc3NhZ2VcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9jb21tcy5odG1sI2Nyb3NzRG9jdW1lbnRNZXNzYWdlc1xuXG4gICAgICAgIHZhciBtZXNzYWdlUHJlZml4ID0gXCJzZXRJbW1lZGlhdGUkXCIgKyBNYXRoLnJhbmRvbSgpICsgXCIkXCI7XG4gICAgICAgIHZhciBvbkdsb2JhbE1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGV2ZW50LmRhdGEgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4T2YobWVzc2FnZVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoK2V2ZW50LmRhdGEuc2xpY2UobWVzc2FnZVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbC5hdHRhY2hFdmVudChcIm9ubWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShtZXNzYWdlUHJlZml4ICsgaGFuZGxlLCBcIipcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBldmVudC5kYXRhO1xuICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICAgICAgICB2YXIgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudChoYW5kbGUpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgICAgICBzY3JpcHQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSWYgc3VwcG9ydGVkLCB3ZSBzaG91bGQgYXR0YWNoIHRvIHRoZSBwcm90b3R5cGUgb2YgZ2xvYmFsLCBzaW5jZSB0aGF0IGlzIHdoZXJlIHNldFRpbWVvdXQgZXQgYWwuIGxpdmUuXG4gICAgdmFyIGF0dGFjaFRvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihnbG9iYWwpO1xuICAgIGF0dGFjaFRvID0gYXR0YWNoVG8gJiYgYXR0YWNoVG8uc2V0VGltZW91dCA/IGF0dGFjaFRvIDogZ2xvYmFsO1xuXG4gICAgLy8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBlLmcuIGJyb3dzZXJpZnkgZW52aXJvbm1lbnRzLlxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGdsb2JhbC5wcm9jZXNzKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIpIHtcbiAgICAgICAgLy8gRm9yIE5vZGUuanMgYmVmb3JlIDAuOVxuICAgICAgICBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChjYW5Vc2VQb3N0TWVzc2FnZSgpKSB7XG4gICAgICAgIC8vIEZvciBub24tSUUxMCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLk1lc3NhZ2VDaGFubmVsKSB7XG4gICAgICAgIC8vIEZvciB3ZWIgd29ya2Vycywgd2hlcmUgc3VwcG9ydGVkXG4gICAgICAgIGluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGRvYyAmJiBcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiIGluIGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpKSB7XG4gICAgICAgIC8vIEZvciBJRSA24oCTOFxuICAgICAgICBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbigpO1xuICAgIH1cblxuICAgIGF0dGFjaFRvLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbiAgICBhdHRhY2hUby5jbGVhckltbWVkaWF0ZSA9IGNsZWFySW1tZWRpYXRlO1xufSh0eXBlb2Ygc2VsZiA9PT0gXCJ1bmRlZmluZWRcIiA/IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB0aGlzIDogZ2xvYmFsIDogc2VsZikpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCIvKipcclxuICogQ3JlYXRlZCBieSBUb20gb24gMjAxNi8wNS8wOVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdFVSTDp7XHJcblx0XHRTU09fTE9HSU46J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkwMS9sb2dpbicsLy/ljZXngrnnmbvlvZVcclxuICAgICAgICBTU09fTE9HT1VUOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5MDEvbG9nb3V0JywvL+WNleeCuemAgOWHulxyXG4gICAgICAgIElOREVYOidodHRwOi8vMTI3LjAuMC4xOjkwMjAvaHRtbC9pbmRleC5odG1sJywvL+S6uuS6uumAmummlumhtVxyXG4gICAgICAgIENIRUNLX0xPR0lOOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5MzQvJywvL+ajgOafpeaYr+WQpueZu+mZhuWPiuW+l+WIsOeZu+mZhuS/oeaBr1xyXG4gICAgICAgIFNFVFVTRVI6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkzNC9zZXR1c2VyLmpzcCcsLy/orr7nva7nmbvlvZVcclxuICAgICAgICBBUFA6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDcxMy8nLC8v5bqU55So55qE6K+35rGC5Zyw5Z2AXHJcbiAgICAgICAgUkVTOidodHRwOi8vMjIxLjIyOC4yNDIuNDo4MDA3L2luZGV4Lmh0bWwnLC8v6LWE5rqQ55qE6K+35rGC5Zyw5Z2AXHJcbiAgICAgICAgVVBMT0FEOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5NTEvZmlsZXMnLC8v5LiK5Lyg5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgUkVTVEZVTDonaHR0cDovLzIyMy4yMDIuNjQuMjA0OjUwOTMyJyxcclxuXHRcdEZPT1RFUlRZUEU6MiwvLzHmmK/lvKDlrrbmuK/vvIwy5piv6YCa6YWNXHJcblx0XHRTVEFUSVNUSUNTOjAsLy8w5piv5LiN5pi+56S677yMMeaYr+aYvuekulxyXG4gICAgICAgIENPVVJTRTowLy8w5piv5LiN5pi+56S677yMMeaYr+aYvuekulxyXG5cdH0sXHJcblx0QVBQOntcclxuXHRcdElTV1g6dHJ1ZVxyXG4gICAgfSxcclxuXHRBUFBFWElTVFM6ZmFsc2UsLy/lvKDlrrbmuK/mmL7npLrvvIzml6DplKHjgIHpu4TlhojkuI3mmL7npLpcclxuXHRJU1BJTkdDRVRBU0s6ZmFsc2VcclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvY29uZmlnLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwiXHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBhamF4ID0gcmVxdWlyZShcInV0aWwvYWpheFwiKTtcclxudmFyIGpzb25wID0gcmVxdWlyZSgnanF1ZXJ5Lmpzb25wLmpzJyk7XHJcblxyXG52YXIgaGVhZFRwbCA9IHJlcXVpcmUoJy4vdHBsL2ludGVncmFsLXRvcC50cGwnKTtcclxudmFyIHR5cGVMaXN0VHBsID0gcmVxdWlyZSgnLi90cGwvdHlwZS1saXN0LnRwbCcpO1xyXG52YXIgaG90TGlzdFRwbCA9IHJlcXVpcmUoJy4vdHBsL2hvdC1saXN0LnRwbCcpO1xyXG52YXIgbW9yZUZlblRwbCA9IHJlcXVpcmUoJy4vdHBsL21vcmUtZmVuLnRwbCcpO1xyXG52YXIgZm9vdFRwbCA9IHJlcXVpcmUoJy4vdHBsL2ludGVncmFsLWJvdHRvbS50cGwnKTtcclxudmFyIG1lbnVOYW1lLCBfY2FsbEJhY2s7XHJcblxyXG4vKlxyXG4gKiDlpLTpg6jjgIHlsL7pg6jlr7zoiKpcclxuICovXHJcblxyXG52YXIgaGVhZGVyID0ge1xyXG4gICAgaWQ6IG51bGwsXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcclxuICAgICAgICBtZS5pZCA9IHN0b3JhZ2VbXCJpZFwiXTtcclxuICAgICAgICBtZS5pbml0QnRuKCk7XHJcbiAgICB9LFxyXG4gICAgaW5pdEJ0bjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9lc2hvcC9iZWxvbmcvYWxsJyxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCdcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICQoJyNoZWFkZXInKS5odG1sKGhlYWRUcGwobGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubXktb3JkZXInICxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY2VudGVyLWJhc2UvbXktb3JkZXIuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5teS1jYXInICxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vbXktY2FydC9teS1jYXJ0Lmh0bWwnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfY2FsbEJhY2soKVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5sb2dvIGltZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9pbnRlZ3JhbC1iYXNlL2ludGVncmFsLWhvbWUuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIOmdnummlumhteWIkui/h+WFqOmDqOWVhuWTgeWIhuexu+aYvuekulxyXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgaWYoc3BsaXRVcmxbM10gIT0gJ2ludGVncmFsLWhvbWUuaHRtbCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWNsYXNzaWZ5Jykub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWxpc3QnKS5zbGlkZURvd24oMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWxpc3QnKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLnNsaWRlVXAoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmFsbC1saXN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbWUuaXNMb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgbWUubG9naW5nQnRuKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5hbGxUeXBlKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5ob3RMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICBtZS5zZWFyY2hOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5zZWFyY2hIb3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcubmF2LWNsYXNzaWZ5IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNOYW1lID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sP2ZsYWc9JyArIHRoaXNOYW1lICsgJyZwYXJlbnRJZD0nICsgdGhpc0lkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjZm9vdGVyJykuaHRtbChmb290VHBsKCkpO1xyXG4gICAgfSxcclxuICAgIC8vIOeZu+W9leOAgeazqOWGjOaTjeS9nFxyXG4gICAgbG9naW5nQnRuOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcudG9wIC5sb2dpbmcnLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vaW50ZWdyYWwtYmFzZS9sb2dpbi5odG1sJztcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy50b3AgLnJlZ2lzdGVyJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2ludGVncmFsLWJhc2UvcmVnaXN0ZXIuaHRtbCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgaXNMb2dpbjogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xyXG4gICAgICAgIHZhciBnZXRMb2dpbm5hbWUgPSBzdG9yYWdlW1wibG9naW5uYW1lXCJdO1xyXG4gICAgICAgIHZhciBsb2dpblN0YXR1cyA9IHN0b3JhZ2VbXCJpc2xvZ2luXCJdO1xyXG4gICAgICAgIC8vdmFyIGRhdGUgPSBzdG9yYWdlW1wiZGF0ZVwiXTtcclxuXHJcbiAgICAgICAgaWYobG9naW5TdGF0dXMgPT0gJ3llcycpe1xyXG4gICAgICAgICAgICAkKCcudG9wIC5zaXRlLWxvZ2VkJykuaGlkZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcuc2l0ZS1sb2dpbmctc3VjY2VzcyBsaScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2ludGVncmFsLWJhc2UvbG9naW4uaHRtbCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhvdExpc3Q6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICBhamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3R5cGUvcGxpc3QnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICBudW06ICc2J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAkKCcuc2VhcmNoLWhvdCcpLmh0bWwoaG90TGlzdFRwbChsaXN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhbGxUeXBlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9lc2hvcC90eXBlL2FsbCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhOntcclxuICAgICAgICAgICAgICAgIGFjY291bnRJZDogbWUuaWQsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogJzInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGlzdCk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3QnKS5odG1sKHR5cGVMaXN0VHBsKGxpc3QpKTtcclxuICAgICAgICAgICAgICAgICQoJy5tb3JlLWZlbicpLmh0bWwobW9yZUZlblRwbChsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGk6Z3QoNSknKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGknKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5jaGlsZHJlbignLmNsYXNzaWYtZGV0YWlsJykuZmluZChcInVsIGxpXCIpLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCcuY2xhc3NpZi1kZXRhaWwnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGknKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignLmNsYXNzaWYtZGV0YWlsJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZihkYXRhLnJlc3VsdC5sZW5ndGggPiA1KXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcudG9wQ29uIC5hbGwtbGlzdCAubW9yZS1jYXRlZ29yaWVzJykub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubW9yZS1mZW4nKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnRvcENvbiAuYWxsLWxpc3QgLm1vcmUtY2F0ZWdvcmllcycpLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm1vcmUtZmVuJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIOWFqOmDqOWVhuWTgeWIhuexu+S4i1xyXG4gICAgICAgICAgICAgICAgJCgnLmFsbF9saXN0PmxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9lLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmNoaWxkcmVuKCcubGlzdC10aXRsZScpLmh0bWwoKS5zcGxpdCgn4oCiJylbMV0udHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLyokKCcuYWxsX2xpc3Q+bGk+Lmxpc3QtaG90PmxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTmFtZSA9ICQodGhpcykuaHRtbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbCNmbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFsbF9saXN0PmxpPi5jbGFzc2lmLWRldGFpbD51bD5saScsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9lLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1saXN0Lmh0bWw/ZmxhZz0nICsgdGhpc05hbWUgKyAnJnBhcmVudElkPScgKyB0aGlzSWQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb3JlLWNhdGVnb3JpZXMgLm1vcmUtZmVuIC5tb3JlLWxpc3QnLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZS5zdG9wcHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNOYW1lID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuaHRtbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2VhcmNoTmFtZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcuc2VhcmNoIC5zZWFyY2gtYnRuJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGdvb2ROYW1lID0gJCgnLnNlYXJjaC1uYW1lJykudmFsKCk7XHJcbiAgICAgICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3Byb2R1Y3QvcXVlcnknLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZ29vZE5hbWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbCNuYW1lPScgKyBnb29kTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc2VhcmNoSG90OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2VhcmNoLWhvdCBsaScsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGhvdE5hbWUgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyBob3ROYW1lICsgJyZwYXJlbnRJZD0nICsgcGFyZW50SWQ7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICBfY2FsbEJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICBoZWFkZXIuaW5pdCgpO1xyXG4gICAgfVxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvaGVhZGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCAxMCAxMSIsIi8qXG4gKiBqUXVlcnkgSlNPTlAgQ29yZSBQbHVnaW4gMi40LjAgKDIwMTItMDgtMjEpXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2phdWJvdXJnL2pxdWVyeS1qc29ucFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBKdWxpYW4gQXVib3VyZ1xuICpcbiAqIFRoaXMgZG9jdW1lbnQgaXMgbGljZW5zZWQgYXMgZnJlZSBzb2Z0d2FyZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlXG4gKiBNSVQgTGljZW5zZTogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqL1xuKCBmdW5jdGlvbiggJCApIHtcblxuXHQvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIFVUSUxJVElFUyAjI1xuXG5cdC8vIE5vb3Bcblx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0fVxuXG5cdC8vIEdlbmVyaWMgY2FsbGJhY2tcblx0ZnVuY3Rpb24gZ2VuZXJpY0NhbGxiYWNrKCBkYXRhICkge1xuXHRcdGxhc3RWYWx1ZSA9IFsgZGF0YSBdO1xuXHR9XG5cblx0Ly8gQ2FsbCBpZiBkZWZpbmVkXG5cdGZ1bmN0aW9uIGNhbGxJZkRlZmluZWQoIG1ldGhvZCAsIG9iamVjdCAsIHBhcmFtZXRlcnMgKSB7XG5cdFx0cmV0dXJuIG1ldGhvZCAmJiBtZXRob2QuYXBwbHkoIG9iamVjdC5jb250ZXh0IHx8IG9iamVjdCAsIHBhcmFtZXRlcnMgKTtcblx0fVxuXG5cdC8vIEdpdmUgam9pbmluZyBjaGFyYWN0ZXIgZ2l2ZW4gdXJsXG5cdGZ1bmN0aW9uIHFNYXJrT3JBbXAoIHVybCApIHtcblx0XHRyZXR1cm4gL1xcPy8gLnRlc3QoIHVybCApID8gXCImXCIgOiBcIj9cIjtcblx0fVxuXG5cdHZhciAvLyBTdHJpbmcgY29uc3RhbnRzIChmb3IgYmV0dGVyIG1pbmlmaWNhdGlvbilcblx0XHRTVFJfQVNZTkMgPSBcImFzeW5jXCIsXG5cdFx0U1RSX0NIQVJTRVQgPSBcImNoYXJzZXRcIixcblx0XHRTVFJfRU1QVFkgPSBcIlwiLFxuXHRcdFNUUl9FUlJPUiA9IFwiZXJyb3JcIixcblx0XHRTVFJfSU5TRVJUX0JFRk9SRSA9IFwiaW5zZXJ0QmVmb3JlXCIsXG5cdFx0U1RSX0pRVUVSWV9KU09OUCA9IFwiX2pxanNwXCIsXG5cdFx0U1RSX09OID0gXCJvblwiLFxuXHRcdFNUUl9PTl9DTElDSyA9IFNUUl9PTiArIFwiY2xpY2tcIixcblx0XHRTVFJfT05fRVJST1IgPSBTVFJfT04gKyBTVFJfRVJST1IsXG5cdFx0U1RSX09OX0xPQUQgPSBTVFJfT04gKyBcImxvYWRcIixcblx0XHRTVFJfT05fUkVBRFlfU1RBVEVfQ0hBTkdFID0gU1RSX09OICsgXCJyZWFkeXN0YXRlY2hhbmdlXCIsXG5cdFx0U1RSX1JFQURZX1NUQVRFID0gXCJyZWFkeVN0YXRlXCIsXG5cdFx0U1RSX1JFTU9WRV9DSElMRCA9IFwicmVtb3ZlQ2hpbGRcIixcblx0XHRTVFJfU0NSSVBUX1RBRyA9IFwiPHNjcmlwdD5cIixcblx0XHRTVFJfU1VDQ0VTUyA9IFwic3VjY2Vzc1wiLFxuXHRcdFNUUl9USU1FT1VUID0gXCJ0aW1lb3V0XCIsXG5cblx0XHQvLyBXaW5kb3dcblx0XHR3aW4gPSB3aW5kb3csXG5cdFx0Ly8gRGVmZXJyZWRcblx0XHREZWZlcnJlZCA9ICQuRGVmZXJyZWQsXG5cdFx0Ly8gSGVhZCBlbGVtZW50XG5cdFx0aGVhZCA9ICQoIFwiaGVhZFwiIClbIDAgXSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0Ly8gUGFnZSBjYWNoZVxuXHRcdHBhZ2VDYWNoZSA9IHt9LFxuXHRcdC8vIENvdW50ZXJcblx0XHRjb3VudCA9IDAsXG5cdFx0Ly8gTGFzdCByZXR1cm5lZCB2YWx1ZVxuXHRcdGxhc3RWYWx1ZSxcblxuXHRcdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgREVGQVVMVCBPUFRJT05TICMjXG5cdFx0eE9wdGlvbnNEZWZhdWx0cyA9IHtcblx0XHRcdC8vYmVmb3JlU2VuZDogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jYWNoZTogZmFsc2UsXG5cdFx0XHRjYWxsYmFjazogU1RSX0pRVUVSWV9KU09OUCxcblx0XHRcdC8vY2FsbGJhY2tQYXJhbWV0ZXI6IHVuZGVmaW5lZCxcblx0XHRcdC8vY2hhcnNldDogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jb21wbGV0ZTogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jb250ZXh0OiB1bmRlZmluZWQsXG5cdFx0XHQvL2RhdGE6IFwiXCIsXG5cdFx0XHQvL2RhdGFGaWx0ZXI6IHVuZGVmaW5lZCxcblx0XHRcdC8vZXJyb3I6IHVuZGVmaW5lZCxcblx0XHRcdC8vcGFnZUNhY2hlOiBmYWxzZSxcblx0XHRcdC8vc3VjY2VzczogdW5kZWZpbmVkLFxuXHRcdFx0Ly90aW1lb3V0OiAwLFxuXHRcdFx0Ly90cmFkaXRpb25hbDogZmFsc2UsXG5cdFx0XHR1cmw6IGxvY2F0aW9uLmhyZWZcblx0XHR9LFxuXG5cdFx0Ly8gb3BlcmEgZGVtYW5kcyBzbmlmZmluZyA6L1xuXHRcdG9wZXJhID0gd2luLm9wZXJhLFxuXG5cdFx0Ly8gSUUgPCAxMFxuXHRcdG9sZElFID0gISEkKCBcIjxkaXY+XCIgKS5odG1sKCBcIjwhLS1baWYgSUVdPjxpPjwhW2VuZGlmXS0tPlwiICkuZmluZChcImlcIikubGVuZ3RoO1xuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgTUFJTiBGVU5DVElPTiAjI1xuXHRmdW5jdGlvbiBqc29ucCggeE9wdGlvbnMgKSB7XG5cblx0XHQvLyBCdWlsZCBkYXRhIHdpdGggZGVmYXVsdFxuXHRcdHhPcHRpb25zID0gJC5leHRlbmQoIHt9ICwgeE9wdGlvbnNEZWZhdWx0cyAsIHhPcHRpb25zICk7XG5cblx0XHQvLyBSZWZlcmVuY2VzIHRvIHhPcHRpb25zIG1lbWJlcnMgKGZvciBiZXR0ZXIgbWluaWZpY2F0aW9uKVxuXHRcdHZhciBzdWNjZXNzQ2FsbGJhY2sgPSB4T3B0aW9ucy5zdWNjZXNzLFxuXHRcdFx0ZXJyb3JDYWxsYmFjayA9IHhPcHRpb25zLmVycm9yLFxuXHRcdFx0Y29tcGxldGVDYWxsYmFjayA9IHhPcHRpb25zLmNvbXBsZXRlLFxuXHRcdFx0ZGF0YUZpbHRlciA9IHhPcHRpb25zLmRhdGFGaWx0ZXIsXG5cdFx0XHRjYWxsYmFja1BhcmFtZXRlciA9IHhPcHRpb25zLmNhbGxiYWNrUGFyYW1ldGVyLFxuXHRcdFx0c3VjY2Vzc0NhbGxiYWNrTmFtZSA9IHhPcHRpb25zLmNhbGxiYWNrLFxuXHRcdFx0Y2FjaGVGbGFnID0geE9wdGlvbnMuY2FjaGUsXG5cdFx0XHRwYWdlQ2FjaGVGbGFnID0geE9wdGlvbnMucGFnZUNhY2hlLFxuXHRcdFx0Y2hhcnNldCA9IHhPcHRpb25zLmNoYXJzZXQsXG5cdFx0XHR1cmwgPSB4T3B0aW9ucy51cmwsXG5cdFx0XHRkYXRhID0geE9wdGlvbnMuZGF0YSxcblx0XHRcdHRpbWVvdXQgPSB4T3B0aW9ucy50aW1lb3V0LFxuXHRcdFx0cGFnZUNhY2hlZCxcblxuXHRcdFx0Ly8gQWJvcnQvZG9uZSBmbGFnXG5cdFx0XHRkb25lID0gMCxcblxuXHRcdFx0Ly8gTGlmZS1jeWNsZSBmdW5jdGlvbnNcblx0XHRcdGNsZWFuVXAgPSBub29wLFxuXG5cdFx0XHQvLyBTdXBwb3J0IHZhcnNcblx0XHRcdHN1cHBvcnRPbmxvYWQsXG5cdFx0XHRzdXBwb3J0T25yZWFkeXN0YXRlY2hhbmdlLFxuXG5cdFx0XHQvLyBSZXF1ZXN0IGV4ZWN1dGlvbiB2YXJzXG5cdFx0XHRmaXJzdENoaWxkLFxuXHRcdFx0c2NyaXB0LFxuXHRcdFx0c2NyaXB0QWZ0ZXIsXG5cdFx0XHR0aW1lb3V0VGltZXI7XG5cblx0XHQvLyBJZiB3ZSBoYXZlIERlZmVycmVkczpcblx0XHQvLyAtIHN1YnN0aXR1dGUgY2FsbGJhY2tzXG5cdFx0Ly8gLSBwcm9tb3RlIHhPcHRpb25zIHRvIGEgcHJvbWlzZVxuXHRcdERlZmVycmVkICYmIERlZmVycmVkKGZ1bmN0aW9uKCBkZWZlciApIHtcblx0XHRcdGRlZmVyLmRvbmUoIHN1Y2Nlc3NDYWxsYmFjayApLmZhaWwoIGVycm9yQ2FsbGJhY2sgKTtcblx0XHRcdHN1Y2Nlc3NDYWxsYmFjayA9IGRlZmVyLnJlc29sdmU7XG5cdFx0XHRlcnJvckNhbGxiYWNrID0gZGVmZXIucmVqZWN0O1xuXHRcdH0pLnByb21pc2UoIHhPcHRpb25zICk7XG5cblx0XHQvLyBDcmVhdGUgdGhlIGFib3J0IG1ldGhvZFxuXHRcdHhPcHRpb25zLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQhKCBkb25lKysgKSAmJiBjbGVhblVwKCk7XG5cdFx0fTtcblxuXHRcdC8vIENhbGwgYmVmb3JlU2VuZCBpZiBwcm92aWRlZCAoZWFybHkgYWJvcnQgaWYgZmFsc2UgcmV0dXJuZWQpXG5cdFx0aWYgKCBjYWxsSWZEZWZpbmVkKCB4T3B0aW9ucy5iZWZvcmVTZW5kICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zIF0gKSA9PT0gITEgfHwgZG9uZSApIHtcblx0XHRcdHJldHVybiB4T3B0aW9ucztcblx0XHR9XG5cblx0XHQvLyBDb250cm9sIGVudHJpZXNcblx0XHR1cmwgPSB1cmwgfHwgU1RSX0VNUFRZO1xuXHRcdGRhdGEgPSBkYXRhID8gKCAodHlwZW9mIGRhdGEpID09IFwic3RyaW5nXCIgPyBkYXRhIDogJC5wYXJhbSggZGF0YSAsIHhPcHRpb25zLnRyYWRpdGlvbmFsICkgKSA6IFNUUl9FTVBUWTtcblxuXHRcdC8vIEJ1aWxkIGZpbmFsIHVybFxuXHRcdHVybCArPSBkYXRhID8gKCBxTWFya09yQW1wKCB1cmwgKSArIGRhdGEgKSA6IFNUUl9FTVBUWTtcblxuXHRcdC8vIEFkZCBjYWxsYmFjayBwYXJhbWV0ZXIgaWYgcHJvdmlkZWQgYXMgb3B0aW9uXG5cdFx0Y2FsbGJhY2tQYXJhbWV0ZXIgJiYgKCB1cmwgKz0gcU1hcmtPckFtcCggdXJsICkgKyBlbmNvZGVVUklDb21wb25lbnQoIGNhbGxiYWNrUGFyYW1ldGVyICkgKyBcIj0/XCIgKTtcblxuXHRcdC8vIEFkZCBhbnRpY2FjaGUgcGFyYW1ldGVyIGlmIG5lZWRlZFxuXHRcdCFjYWNoZUZsYWcgJiYgIXBhZ2VDYWNoZUZsYWcgJiYgKCB1cmwgKz0gcU1hcmtPckFtcCggdXJsICkgKyBcIl9cIiArICggbmV3IERhdGUoKSApLmdldFRpbWUoKSArIFwiPVwiICk7XG5cblx0XHQvLyBSZXBsYWNlIGxhc3QgPyBieSBjYWxsYmFjayBwYXJhbWV0ZXJcblx0XHR1cmwgPSB1cmwucmVwbGFjZSggLz1cXD8oJnwkKS8gLCBcIj1cIiArIHN1Y2Nlc3NDYWxsYmFja05hbWUgKyBcIiQxXCIgKTtcblxuXHRcdC8vIFN1Y2Nlc3Mgbm90aWZpZXJcblx0XHRmdW5jdGlvbiBub3RpZnlTdWNjZXNzKCBqc29uICkge1xuXG5cdFx0XHRpZiAoICEoIGRvbmUrKyApICkge1xuXG5cdFx0XHRcdGNsZWFuVXAoKTtcblx0XHRcdFx0Ly8gUGFnZWNhY2hlIGlmIG5lZWRlZFxuXHRcdFx0XHRwYWdlQ2FjaGVGbGFnICYmICggcGFnZUNhY2hlIFsgdXJsIF0gPSB7IHM6IFsganNvbiBdIH0gKTtcblx0XHRcdFx0Ly8gQXBwbHkgdGhlIGRhdGEgZmlsdGVyIGlmIHByb3ZpZGVkXG5cdFx0XHRcdGRhdGFGaWx0ZXIgJiYgKCBqc29uID0gZGF0YUZpbHRlci5hcHBseSggeE9wdGlvbnMgLCBbIGpzb24gXSApICk7XG5cdFx0XHRcdC8vIENhbGwgc3VjY2VzcyB0aGVuIGNvbXBsZXRlXG5cdFx0XHRcdGNhbGxJZkRlZmluZWQoIHN1Y2Nlc3NDYWxsYmFjayAsIHhPcHRpb25zICwgWyBqc29uICwgU1RSX1NVQ0NFU1MsIHhPcHRpb25zIF0gKTtcblx0XHRcdFx0Y2FsbElmRGVmaW5lZCggY29tcGxldGVDYWxsYmFjayAsIHhPcHRpb25zICwgWyB4T3B0aW9ucyAsIFNUUl9TVUNDRVNTIF0gKTtcblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEVycm9yIG5vdGlmaWVyXG5cdFx0ZnVuY3Rpb24gbm90aWZ5RXJyb3IoIHR5cGUgKSB7XG5cblx0XHRcdGlmICggISggZG9uZSsrICkgKSB7XG5cblx0XHRcdFx0Ly8gQ2xlYW4gdXBcblx0XHRcdFx0Y2xlYW5VcCgpO1xuXHRcdFx0XHQvLyBJZiBwdXJlIGVycm9yIChub3QgdGltZW91dCksIGNhY2hlIGlmIG5lZWRlZFxuXHRcdFx0XHRwYWdlQ2FjaGVGbGFnICYmIHR5cGUgIT0gU1RSX1RJTUVPVVQgJiYgKCBwYWdlQ2FjaGVbIHVybCBdID0gdHlwZSApO1xuXHRcdFx0XHQvLyBDYWxsIGVycm9yIHRoZW4gY29tcGxldGVcblx0XHRcdFx0Y2FsbElmRGVmaW5lZCggZXJyb3JDYWxsYmFjayAsIHhPcHRpb25zICwgWyB4T3B0aW9ucyAsIHR5cGUgXSApO1xuXHRcdFx0XHRjYWxsSWZEZWZpbmVkKCBjb21wbGV0ZUNhbGxiYWNrICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zICwgdHlwZSBdICk7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDaGVjayBwYWdlIGNhY2hlXG5cdFx0aWYgKCBwYWdlQ2FjaGVGbGFnICYmICggcGFnZUNhY2hlZCA9IHBhZ2VDYWNoZVsgdXJsIF0gKSApIHtcblxuXHRcdFx0cGFnZUNhY2hlZC5zID8gbm90aWZ5U3VjY2VzcyggcGFnZUNhY2hlZC5zWyAwIF0gKSA6IG5vdGlmeUVycm9yKCBwYWdlQ2FjaGVkICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBJbnN0YWxsIHRoZSBnZW5lcmljIGNhbGxiYWNrXG5cdFx0XHQvLyAoQkVXQVJFOiBnbG9iYWwgbmFtZXNwYWNlIHBvbGx1dGlvbiBhaG95KVxuXHRcdFx0d2luWyBzdWNjZXNzQ2FsbGJhY2tOYW1lIF0gPSBnZW5lcmljQ2FsbGJhY2s7XG5cblx0XHRcdC8vIENyZWF0ZSB0aGUgc2NyaXB0IHRhZ1xuXHRcdFx0c2NyaXB0ID0gJCggU1RSX1NDUklQVF9UQUcgKVsgMCBdO1xuXHRcdFx0c2NyaXB0LmlkID0gU1RSX0pRVUVSWV9KU09OUCArIGNvdW50Kys7XG5cblx0XHRcdC8vIFNldCBjaGFyc2V0IGlmIHByb3ZpZGVkXG5cdFx0XHRpZiAoIGNoYXJzZXQgKSB7XG5cdFx0XHRcdHNjcmlwdFsgU1RSX0NIQVJTRVQgXSA9IGNoYXJzZXQ7XG5cdFx0XHR9XG5cblx0XHRcdG9wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDExLjYwID9cblx0XHRcdFx0Ly8gb25lcnJvciBpcyBub3Qgc3VwcG9ydGVkOiBkbyBub3Qgc2V0IGFzIGFzeW5jIGFuZCBhc3N1bWUgaW4tb3JkZXIgZXhlY3V0aW9uLlxuXHRcdFx0XHQvLyBBZGQgYSB0cmFpbGluZyBzY3JpcHQgdG8gZW11bGF0ZSB0aGUgZXZlbnRcblx0XHRcdFx0KCAoIHNjcmlwdEFmdGVyID0gJCggU1RSX1NDUklQVF9UQUcgKVsgMCBdICkudGV4dCA9IFwiZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1wiICsgc2NyaXB0LmlkICsgXCInKS5cIiArIFNUUl9PTl9FUlJPUiArIFwiKClcIiApXG5cdFx0XHQ6XG5cdFx0XHRcdC8vIG9uZXJyb3IgaXMgc3VwcG9ydGVkOiBzZXQgdGhlIHNjcmlwdCBhcyBhc3luYyB0byBhdm9pZCByZXF1ZXN0cyBibG9ja2luZyBlYWNoIG90aGVyc1xuXHRcdFx0XHQoIHNjcmlwdFsgU1RSX0FTWU5DIF0gPSBTVFJfQVNZTkMgKVxuXG5cdFx0XHQ7XG5cblx0XHRcdC8vIEludGVybmV0IEV4cGxvcmVyOiBldmVudC9odG1sRm9yIHRyaWNrXG5cdFx0XHRpZiAoIG9sZElFICkge1xuXHRcdFx0XHRzY3JpcHQuaHRtbEZvciA9IHNjcmlwdC5pZDtcblx0XHRcdFx0c2NyaXB0LmV2ZW50ID0gU1RSX09OX0NMSUNLO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBdHRhY2hlZCBldmVudCBoYW5kbGVyc1xuXHRcdFx0c2NyaXB0WyBTVFJfT05fTE9BRCBdID0gc2NyaXB0WyBTVFJfT05fRVJST1IgXSA9IHNjcmlwdFsgU1RSX09OX1JFQURZX1NUQVRFX0NIQU5HRSBdID0gZnVuY3Rpb24gKCByZXN1bHQgKSB7XG5cblx0XHRcdFx0Ly8gVGVzdCByZWFkeVN0YXRlIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRpZiAoICFzY3JpcHRbIFNUUl9SRUFEWV9TVEFURSBdIHx8ICEvaS8udGVzdCggc2NyaXB0WyBTVFJfUkVBRFlfU1RBVEUgXSApICkge1xuXG5cdFx0XHRcdFx0dHJ5IHtcblxuXHRcdFx0XHRcdFx0c2NyaXB0WyBTVFJfT05fQ0xJQ0sgXSAmJiBzY3JpcHRbIFNUUl9PTl9DTElDSyBdKCk7XG5cblx0XHRcdFx0XHR9IGNhdGNoKCBfICkge31cblxuXHRcdFx0XHRcdHJlc3VsdCA9IGxhc3RWYWx1ZTtcblx0XHRcdFx0XHRsYXN0VmFsdWUgPSAwO1xuXHRcdFx0XHRcdHJlc3VsdCA/IG5vdGlmeVN1Y2Nlc3MoIHJlc3VsdFsgMCBdICkgOiBub3RpZnlFcnJvciggU1RSX0VSUk9SICk7XG5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gU2V0IHNvdXJjZVxuXHRcdFx0c2NyaXB0LnNyYyA9IHVybDtcblxuXHRcdFx0Ly8gUmUtZGVjbGFyZSBjbGVhblVwIGZ1bmN0aW9uXG5cdFx0XHRjbGVhblVwID0gZnVuY3Rpb24oIGkgKSB7XG5cdFx0XHRcdHRpbWVvdXRUaW1lciAmJiBjbGVhclRpbWVvdXQoIHRpbWVvdXRUaW1lciApO1xuXHRcdFx0XHRzY3JpcHRbIFNUUl9PTl9SRUFEWV9TVEFURV9DSEFOR0UgXSA9IHNjcmlwdFsgU1RSX09OX0xPQUQgXSA9IHNjcmlwdFsgU1RSX09OX0VSUk9SIF0gPSBudWxsO1xuXHRcdFx0XHRoZWFkWyBTVFJfUkVNT1ZFX0NISUxEIF0oIHNjcmlwdCApO1xuXHRcdFx0XHRzY3JpcHRBZnRlciAmJiBoZWFkWyBTVFJfUkVNT1ZFX0NISUxEIF0oIHNjcmlwdEFmdGVyICk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBBcHBlbmQgbWFpbiBzY3JpcHRcblx0XHRcdGhlYWRbIFNUUl9JTlNFUlRfQkVGT1JFIF0oIHNjcmlwdCAsICggZmlyc3RDaGlsZCA9IGhlYWQuZmlyc3RDaGlsZCApICk7XG5cblx0XHRcdC8vIEFwcGVuZCB0cmFpbGluZyBzY3JpcHQgaWYgbmVlZGVkXG5cdFx0XHRzY3JpcHRBZnRlciAmJiBoZWFkWyBTVFJfSU5TRVJUX0JFRk9SRSBdKCBzY3JpcHRBZnRlciAsIGZpcnN0Q2hpbGQgKTtcblxuXHRcdFx0Ly8gSWYgYSB0aW1lb3V0IGlzIG5lZWRlZCwgaW5zdGFsbCBpdFxuXHRcdFx0dGltZW91dFRpbWVyID0gdGltZW91dCA+IDAgJiYgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG5vdGlmeUVycm9yKCBTVFJfVElNRU9VVCApO1xuXHRcdFx0fSAsIHRpbWVvdXQgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB4T3B0aW9ucztcblx0fVxuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgU0VUVVAgRlVOQ1RJT04gIyNcblx0anNvbnAuc2V0dXAgPSBmdW5jdGlvbiggeE9wdGlvbnMgKSB7XG5cdFx0JC5leHRlbmQoIHhPcHRpb25zRGVmYXVsdHMgLCB4T3B0aW9ucyApO1xuXHR9O1xuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgSU5TVEFMTCBpbiBqUXVlcnkgIyNcblx0JC5qc29ucCA9IGpzb25wO1xuXG59ICkoIGpRdWVyeSApO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvanF1ZXJ5Lmpzb25wLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskb3V0Kz0nPGRpdiBjbGFzcz1cInRvcC1zaXRlXCI+IDxkaXYgY2xhc3M9XCJzaXRlXCI+ICA8ZGl2IGNsYXNzPVwid2VsY29tZS1wcmVzZW5jZSBmbFwiPiA8ZGl2IGNsYXNzPVwid2VsY29tZSBmbFwiPuaCqOWlve+8jOasoui/juWFieS4tOW+oeW7t+WutuWxhe+8gTwvZGl2PiA8ZGl2IGNsYXNzPVwic2l0ZS1sb2dlZCBmbFwiPiA8c3BhbiBjbGFzcz1cImxvZ2luZ1wiPlsg55m75b2VIF08L3NwYW4+IDxzcGFuIGNsYXNzPVwicmVnaXN0ZXJcIj5bIOazqOWGjCBdPC9zcGFuPiA8L2Rpdj4gPC9kaXY+ICA8ZGl2IGNsYXNzPVwic2l0ZS1sb2dpbmctc3VjY2VzcyBmclwiPiA8dWwgY2xhc3M9XCJjbGVhcmZpeFwiPiA8bGkgY2xhc3M9XCJteS1vcmRlclwiPjxpIGNsYXNzPVwib3JkZXJcIj48L2k+PGE+5oiR55qE6K6i5Y2VPC9hPjwvbGk+IDxsaSBjbGFzcz1cIm15LWNhclwiPjxpIGNsYXNzPVwiY2FydFwiPjwvaT48YT7otK3nianovaY8L2E+PC9saT4gPGxpIGNsYXNzPVwibXUtaW5mb1wiPjxpIGNsYXNzPVwidXNlclwiPjwvaT48YT7nlKjmiLfnrqHnkIY8L2E+PC9saT4gPC91bD4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cInRvcENvblwiPiA8ZGl2IGNsYXNzPVwidG9wLWxvZ28gY2xlYXJmaXhcIj4gPGRpdiBjbGFzcz1cImxvZ28gZmxcIj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2xvZ28ucG5nXCI+IDwvZGl2PiA8ZGl2IGNsYXNzPVwic2VhcmNoIGZsXCI+IDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2VhcmNoLW5hbWUgZmxcIj4gPHNwYW4gY2xhc3M9XCJzZWFyY2gtYnRuIGZyXCI+5pCcIOe0ojwvc3Bhbj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2ljb24tc2VhcmNoLnBuZ1wiIGNsYXNzPVwic2VhcmNoLWljb25cIj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2ljb24teXV5aW4ucG5nXCIgY2xhc3M9XCJ5dXlpbi1pY29uXCI+IDx1bCBjbGFzcz1cInNlYXJjaC1ob3RcIj48L3VsPiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJhbGwtbmF2IGNsZWFyZml4XCI+IDxkaXYgY2xhc3M9XCJhbGwtY2xhc3NpZnkgZmxcIj7lhajpg6jllYblk4HliIbnsbs8L2Rpdj4gPHVsIGNsYXNzPVwibmF2LWNsYXNzaWZ5IGZsXCI+ICc7XG4kZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5uYW1lKTtcbiRvdXQrPSc8L2xpPiAnO1xufSk7XG4kb3V0Kz0nIDwvdWw+IDwvZGl2PiA8ZGl2IGNsYXNzPVwiYWxsLWxpc3RcIj4gPHVsIGNsYXNzPVwiYWxsX2xpc3RcIj48L3VsPiA8ZGl2IGNsYXNzPVwibW9yZS1jYXRlZ29yaWVzXCI+IDxzcGFuPuabtOWkmuWIhuexuzwvc3Bhbj4gIDxkaXYgY2xhc3M9XCJtb3JlLWZlbiBjbGVhcmZpeFwiPjwvZGl2PiA8L2Rpdj4gPC9kaXY+IDwvZGl2Pic7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcC50cGxcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCAxMCAxMSIsIi8qVE1PREpTOnt9Ki9cclxuIWZ1bmN0aW9uICgpIHtcclxuXHRmdW5jdGlvbiBhKGEsIGIpIHtcclxuXHRcdHJldHVybiAoL3N0cmluZ3xmdW5jdGlvbi8udGVzdCh0eXBlb2YgYikgPyBoIDogZykoYSwgYilcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGIoYSwgYykge1xyXG5cdFx0cmV0dXJuIFwic3RyaW5nXCIgIT0gdHlwZW9mIGEgJiYgKGMgPSB0eXBlb2YgYSwgXCJudW1iZXJcIiA9PT0gYyA/IGEgKz0gXCJcIiA6IGEgPSBcImZ1bmN0aW9uXCIgPT09IGMgPyBiKGEuY2FsbChhKSkgOiBcIlwiKSwgYVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYyhhKSB7XHJcblx0XHRyZXR1cm4gbFthXVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZChhKSB7XHJcblx0XHRyZXR1cm4gYihhKS5yZXBsYWNlKC8mKD8hW1xcdyNdKzspfFs8PlwiJ10vZywgYylcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGUoYSwgYikge1xyXG5cdFx0aWYgKG0oYSkpZm9yICh2YXIgYyA9IDAsIGQgPSBhLmxlbmd0aDsgZCA+IGM7IGMrKyliLmNhbGwoYSwgYVtjXSwgYywgYSk7IGVsc2UgZm9yIChjIGluIGEpYi5jYWxsKGEsIGFbY10sIGMpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBmKGEsIGIpIHtcclxuXHRcdHZhciBjID0gLyhcXC8pW15cXC9dK1xcMVxcLlxcLlxcMS8sIGQgPSAoXCIuL1wiICsgYSkucmVwbGFjZSgvW15cXC9dKyQvLCBcIlwiKSwgZSA9IGQgKyBiO1xyXG5cdFx0Zm9yIChlID0gZS5yZXBsYWNlKC9cXC9cXC5cXC8vZywgXCIvXCIpOyBlLm1hdGNoKGMpOyllID0gZS5yZXBsYWNlKGMsIFwiL1wiKTtcclxuXHRcdHJldHVybiBlXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnKGIsIGMpIHtcclxuXHRcdHZhciBkID0gYS5nZXQoYikgfHwgaSh7ZmlsZW5hbWU6IGIsIG5hbWU6IFwiUmVuZGVyIEVycm9yXCIsIG1lc3NhZ2U6IFwiVGVtcGxhdGUgbm90IGZvdW5kXCJ9KTtcclxuXHRcdHJldHVybiBjID8gZChjKSA6IGRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGgoYSwgYikge1xyXG5cdFx0aWYgKFwic3RyaW5nXCIgPT0gdHlwZW9mIGIpIHtcclxuXHRcdFx0dmFyIGMgPSBiO1xyXG5cdFx0XHRiID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJldHVybiBuZXcgayhjKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgZCA9IGpbYV0gPSBmdW5jdGlvbiAoYykge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdHJldHVybiBuZXcgYihjLCBhKSArIFwiXCJcclxuXHRcdFx0fSBjYXRjaCAoZCkge1xyXG5cdFx0XHRcdHJldHVybiBpKGQpKClcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBkLnByb3RvdHlwZSA9IGIucHJvdG90eXBlID0gbiwgZC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIGIgKyBcIlwiXHJcblx0XHR9LCBkXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpKGEpIHtcclxuXHRcdHZhciBiID0gXCJ7VGVtcGxhdGUgRXJyb3J9XCIsIGMgPSBhLnN0YWNrIHx8IFwiXCI7XHJcblx0XHRpZiAoYyljID0gYy5zcGxpdChcIlxcblwiKS5zbGljZSgwLCAyKS5qb2luKFwiXFxuXCIpOyBlbHNlIGZvciAodmFyIGQgaW4gYSljICs9IFwiPFwiICsgZCArIFwiPlxcblwiICsgYVtkXSArIFwiXFxuXFxuXCI7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gXCJvYmplY3RcIiA9PSB0eXBlb2YgY29uc29sZSAmJiBjb25zb2xlLmVycm9yKGIgKyBcIlxcblxcblwiICsgYyksIGJcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBqID0gYS5jYWNoZSA9IHt9LCBrID0gdGhpcy5TdHJpbmcsIGwgPSB7XHJcblx0XHRcIjxcIjogXCImIzYwO1wiLFxyXG5cdFx0XCI+XCI6IFwiJiM2MjtcIixcclxuXHRcdCdcIic6IFwiJiMzNDtcIixcclxuXHRcdFwiJ1wiOiBcIiYjMzk7XCIsXHJcblx0XHRcIiZcIjogXCImIzM4O1wiXHJcblx0fSwgbSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGEpIHtcclxuXHRcdFx0cmV0dXJuIFwiW29iamVjdCBBcnJheV1cIiA9PT0ge30udG9TdHJpbmcuY2FsbChhKVxyXG5cdFx0fSwgbiA9IGEudXRpbHMgPSB7XHJcblx0XHQkaGVscGVyczoge30sICRpbmNsdWRlOiBmdW5jdGlvbiAoYSwgYiwgYykge1xyXG5cdFx0XHRyZXR1cm4gYSA9IGYoYywgYSksIGcoYSwgYilcclxuXHRcdH0sICRzdHJpbmc6IGIsICRlc2NhcGU6IGQsICRlYWNoOiBlXHJcblx0fSwgbyA9IGEuaGVscGVycyA9IG4uJGhlbHBlcnM7XHJcblx0YS5nZXQgPSBmdW5jdGlvbiAoYSkge1xyXG5cdFx0cmV0dXJuIGpbYS5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIildXHJcblx0fSwgYS5oZWxwZXIgPSBmdW5jdGlvbiAoYSwgYikge1xyXG5cdFx0b1thXSA9IGJcclxuXHR9LCBtb2R1bGUuZXhwb3J0cyA9IGFcclxufSgpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi90bW9kanMtbG9hZGVyL3J1bnRpbWUuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9oZWFkZXItbmF2L3RwbC90eXBlLWxpc3QnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVhY2g9JHV0aWxzLiRlYWNoLCR2YWx1ZT0kZGF0YS4kdmFsdWUsJGluZGV4PSRkYXRhLiRpbmRleCwkZXNjYXBlPSR1dGlscy4kZXNjYXBlLCRvdXQ9Jyc7JGVhY2goJGRhdGEsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gPGRpdiBjbGFzcz1cImxpc3QtdGl0bGVcIj7igKIgJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvZGl2PiA8dWwgY2xhc3M9XCJsaXN0LWhvdCBjbGVhcmZpeFwiPiAnO1xuJGVhY2goJHZhbHVlLmNoaWxkLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbiRvdXQrPScgPC91bD4gPGRpdiBjbGFzcz1cImNsYXNzaWYtZGV0YWlsXCI+IDx1bCBjbGFzcz1cIm1vcmUtbGlzdCBjbGVhcmZpeFwiPiAnO1xuJGVhY2goJHZhbHVlLmNoaWxkLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbiRvdXQrPScgPC91bD4gPC9kaXY+IDwvbGk+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvdHlwZS1saXN0LnRwbFxuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9oZWFkZXItbmF2L3RwbC9ob3QtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5uYW1lKTtcbiRvdXQrPSc8L2xpPiAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvdHBsL2hvdC1saXN0LnRwbFxuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9oZWFkZXItbmF2L3RwbC9tb3JlLWZlbicsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPHVsIGNsYXNzPVwibW9yZS1saXN0IGNsZWFyZml4XCIgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+IDxkaXYgY2xhc3M9XCJtb3JlLXRpdGxlXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvZGl2PiA8L3VsPiAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvdHBsL21vcmUtZmVuLnRwbFxuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9oZWFkZXItbmF2L3RwbC9pbnRlZ3JhbC1ib3R0b20nLCc8ZGl2IGNsYXNzPVwicmV0dXJuLXRvcFwiPjwvZGl2PiA8ZGl2IGNsYXNzPVwiYm90dG9tQ29uIGNsZWFyZml4XCI+IDx1bCBjbGFzcz1cImZvb3QtbmF2IGdvdXd1IGZsIGNsZWFyZml4XCI+IDxkaXY+6LSt54mp5oyH5Y2XPC9kaXY+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7otK3nianmtYHnqIs8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7kvJrlkZjku4vnu408L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7lm6LotK0v5py656WoPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5bi46KeB6Zeu6aKYPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6IGU57O75a6i5pyNPC9hPiA8L2xpPiA8L3VsPiA8dWwgY2xhc3M9XCJmb290LW5hdiBwZWlzb25nIGZsIGNsZWFyZml4XCI+IDxkaXY+6YWN6YCB5pa55byPPC9kaXY+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7kuIrpl6joh6rmj5A8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj4yMTHpmZDml7bovr48L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7phY3pgIHmnI3liqHmn6Xor6I8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7phY3pgIHotLnmlLblj5bmoIflh4Y8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7mtbflpJbphY3pgIE8L2E+IDwvbGk+IDwvdWw+IDx1bCBjbGFzcz1cImZvb3QtbmF2IHpoaWZ1IGZsIGNsZWFyZml4XCI+IDxkaXY+5pSv5LuY5pa55byPPC9kaXY+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7otKfliLDku5jmrL48L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7lnKjnur/mlK/ku5g8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7liIbmnJ/ku5jmrL48L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7pgq7lsYDmsYfmrL48L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7lhazlj7jovazotKY8L2E+IDwvbGk+IDwvdWw+IDx1bCBjbGFzcz1cImZvb3QtbmF2IHNob3Vob3UgZmwgY2xlYXJmaXhcIj4gPGRpdj7llK7lkI7mnI3liqE8L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWUruWQjuaUv+etljwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuS7t+agvOS/neaKpDwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumAgOasvuivtOaYjjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPui/lOS/ri/pgIDmjaLotKc8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7lj5bmtojorqLljZU8L2E+IDwvbGk+IDwvdWw+IDwvZGl2PicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLWJvdHRvbS50cGxcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCAxMCAxMSIsIl9pZCA9IDA7XHJcbnZhciBTSE9XX1BPUF9UWVBFX1NVQ0NFU1MgPSAwO1xyXG52YXIgU0hPV19QT1BfVFlQRV9GQUlMID0gMTtcclxudmFyIFNIT1dfUE9QX1RZUEVfV0FSTklORyA9IDI7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYWpheDpmdW5jdGlvbih1cmwsIHBhcmFtcywgbWV0aG9kLCBzdWNjZXNzLCBlcnIpIHtcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICB0eXBlOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzICYmIHN1Y2Nlc3MoZGF0YSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICBlcnIgJiYgZXJyKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZm9yRWFjaDogZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcclxuICAgICAgICBzY29wZSA9IHNjb3BlIHx8IG51bGw7XHJcbiAgICAgICAgYXJyYXkgPSBhcnJheSA9PSBudWxsID8gW10gOiBhcnJheTtcclxuICAgICAgICBhcnJheSA9IFtdLnNsaWNlLmNhbGwoYXJyYXkpOy8v5bCGYXJyYXnlr7nosaHovazljJbkuLrmlbDnu4QsYXJyYXnkuI3kuIDlrprmmK/kuKrmlbDnu4RcclxuICAgICAgICBpZiAoIShhcnJheSBpbnN0YW5jZW9mIEFycmF5KSkge1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhcnJheSBpcyBub3QgYSBBcnJheSEhIScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrLmNhbGwoc2NvcGUsIGFycmF5W2ldLCBpKSkgey8vYXJyYXlbaV0sbWFwc1tpXSxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiB1cmzlj4LmlbDojrflj5bmjqXlj6PvvIznu4/ov4dkZWNvZGVVUknvvIzlpoLmnpzmsqHmnInkvKDpgJJrZXnlgLzvvIzliJnov5Tlm57lvZPliY3pobXpnaLnmoTmiYDmnInlj4LmlbDvvIzlpoLmnpzmnIlrZXnov5Tlm55rZXnlr7nlupTnmoTlhoXlrrnvvIxcclxuICAgICAqIOWmguaenGtleeayoeacieWvueW6lOeahOWGheWuue+8jOWImei/lOWbnuepuuWtl+espuS4slxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIGdldFBhcmFtczogZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgIHZhciBwYXJhbXNTdHIgPSBsb2NhdGlvbi5ocmVmLmluZGV4T2YoJyMnKSA+IDAgPyBsb2NhdGlvbi5ocmVmLnN1YnN0cmluZyhsb2NhdGlvbi5ocmVmLmluZGV4T2YoXCIjXCIpICsgMSwgbG9jYXRpb24uaHJlZi5sZW5ndGgpIDogJyc7XHJcbiAgICAgICAgLy/ojrflj5bmiYDmnInnmoQj5Y2z5Lul5YmN55qE77yf5ZCO6Z2i55qE5YC877yM55u45b2T5LqObG9jYXRpb24uc2VhcmNoXHJcbiAgICAgICAgdmFyIG1hcHMsIHBhcmFtc09iaiA9IHt9O1xyXG4gICAgICAgIGlmIChwYXJhbXNTdHIgPT09ICcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcGFyYW1zU3RyID0gZGVjb2RlVVJJKHBhcmFtc1N0cik7Ly/op6PnoIHnmoRwYXJhbVN0clxyXG4gICAgICAgIG1hcHMgPSBwYXJhbXNTdHIuc3BsaXQoJyYnKTsvL+WwhibkuYvliY3nmoTlrZfnrKbkuLLpg73mlL7lhaXmlbDnu4Tph4zpnaJcclxuICAgICAgICB0aGlzLmZvckVhY2gobWFwcywgZnVuY3Rpb24gKGl0ZW0pIHsvL+W+queOr+aVsOe7hCxhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgdmFyIHBhcmFtTGlzdCA9IGl0ZW0uc3BsaXQoJz0nKTsvL2l0ZW3kuLptYXBzW2ldXHJcbiAgICAgICAgICAgIGlmIChwYXJhbUxpc3QubGVuZ3RoIDwgMiAmJiBwYXJhbUxpc3RbMF0gPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJhbXNPYmpbcGFyYW1MaXN0WzBdXSA9IHBhcmFtTGlzdFsxXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoa2V5KSB7Ly/lpoLmnpxrZXnmnInlgLzlvpfor51cclxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtc09ialtrZXldIHx8ICcnOy8v5YiZ6L+U5Zue5a+56LGh6YeM5Y+v5Lul5bGe5oCn55qE5YC85ZCm5YiZ6L+U5Zue56m6XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtc09iajsvL+WmguaenGtleeS8oOi/h+adpeeahOaYr+ayoeacieeahOivne+8jOWNs+S7gOS5iOmDveayoeS8oOeahOivneWImei/lOWbnnBhcmFtc09iaueahOWvueixoVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBnZXRRdWVyeVN0cmluZzpmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoXCIoXnwmKVwiICsgbmFtZSArIFwiPShbXiZdKikoJnwkKVwiLFwiaVwiKTtcclxuICAgICAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XHJcbiAgICAgICAgaWYgKHIhPW51bGwpIHJldHVybiAoclsyXSk7IHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICAgIGFkZEV2ZW50OiBmdW5jdGlvbiAoZWwsIHR5cGUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmF0dGFjaEV2ZW50KSB7Ly/lpoLmnpzpobXpnaLmlofmoaPkuK3lrZjlnKhhdHRhY2hFdmVudOaWueazlVxyXG4gICAgICAgICAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5zcGxpY2UoMCwgMCwgd2luZG93LmV2ZW50KTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGVsLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShlbCwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL+aYr+WQpuaYr0lFNjc4XHJcbiAgICBpc0lFNjc4OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICgnYX5iJy5zcGxpdCgvKH4pLykpWzFdID09IFwiYlwiO1xyXG4gICAgfSxcclxuICAgIC8v5Y6756m65qC8XHJcbiAgICB0cmltQWxsOiBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8gKy9nLCAnJyk7XHJcbiAgICB9LFxyXG4gICAgdHJpbUJsYW5rOmZ1bmN0aW9uKHBhcmFtcyl7XHJcbiAgICAgICAgLy9mb3Jt6KGo5Y2V5bqP5YiX5YyW5LmL5ZCO5Y675YmN5ZCO56m65qC8XHJcbiAgICAgICAgcGFyYW1zPSBkZWNvZGVVUklDb21wb25lbnQocGFyYW1zKS5zcGxpdCgnJicpO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7aTxwYXJhbXMubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICAgICAgICBwYXJhbVsxXT0gcGFyYW1bMV0ucmVwbGFjZSgvKF5cXCsqKXwoXFwrKiQpfCheXFxzKil8KFxccyokKS9nLCcnKTtcclxuICAgICAgICAgICAgcGFyYW1zW2ldID0gcGFyYW0uam9pbignPScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyYW1zLmpvaW4oJyYnKTtcclxuICAgIH0sXHJcbiAgICAvL+mqjOivgeiBlOezu+aWueW8jyDmiYvmnLrlj7cg5bqn5py6XHJcbiAgICBjaGVja19waG9uZTpmdW5jdGlvbihwaG9uZSl7XHJcbiAgICAgICAgdmFyIHJlZyA9IC9eKCgwXFxkezIsM30tXFxkezcsOH0pfCgxWzM1ODRdXFxkezl9KSkkLztcclxuICAgICAgICByZXR1cm4gcmVnLnRlc3QocGhvbmUpO1xyXG4gICAgfSxcclxuICAgIC8v6aqM6K+B6Iux5paH5ZCNXHJcbiAgICBjaGVja19lbmdsaXNoOmZ1bmN0aW9uKGVuKXtcclxuICAgICAgICB2YXIgcmVnID0gL15bYS16QS1aXSsoXFxzKlthLXpBLVpdKyl7MCx9JC87XHJcbiAgICAgICAgcmV0dXJuIHJlZy50ZXN0KGVuKTtcclxuICAgIH0sXHJcbiAgICAvL+mqjOivgemCrueusVxyXG4gICAgY2hlY2tfZW1haWw6ZnVuY3Rpb24oZW1haWwpe1xyXG4gICAgICAgIHZhciByZWcgPSAgL15cXHcrQFxcdytcXC5cXHcrJC87XHJcbiAgICAgICAgcmV0dXJuIHJlZy50ZXN0KGVtYWlsKTtcclxuICAgIH0sXHJcbiAgICAvL+WPquiDveWQq+mqjOivgeaVsOWtl+WSjC5cclxuICAgIGNoZWNrX251bWRvdDpmdW5jdGlvbih2YWwpe1xyXG4gICAgICAgIHZhciByZWcgPSAgL15cXGQrKD86XFwuXFxkezEsMn0pPyQvO1xyXG4gICAgICAgIHJldHVybiByZWcudGVzdCh2YWwpO1xyXG4gICAgfSxcclxuICAgIFNIT1dfUE9QX1RZUEVfU1VDQ0VTUzogU0hPV19QT1BfVFlQRV9TVUNDRVNTLFxyXG4gICAgU0hPV19QT1BfVFlQRV9GQUlMOiBTSE9XX1BPUF9UWVBFX0ZBSUwsXHJcbiAgICBTSE9XX1BPUF9UWVBFX1dBUk5JTkc6IFNIT1dfUE9QX1RZUEVfV0FSTklORyxcclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65o+Q56S65L+h5oGv77yI6KaB5rGC5q+P5Liq6KaB5pi+56S655qE6aG16Z2i6YO96KaB5pyJcG9wLW1hc2sgZGl277yJ77yMXHJcbiAgICAgKiDorabnpLrlm77niYflkb3lkI3kvb/nlKjmoLzlvI9zaG93LXBvcDAucG5n5Luj6KGoc3VjZXNz77yMc2hvdy1wb3AxLnBuZ+S7o+ihqGZhaWzvvIzot5/kuIrovrnnmoTlj4LmlbDlrprkuYnkuIDoh7RcclxuICAgICAqIEBwYXJhbSB0aXRsZSDpobbpg6jmmL7npLrmoYbnmoTmoIfpophcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlIOWGheWuueWAvFxyXG4gICAgICogQHBhcmFtIHR5cGUg6K2m56S65Zu+54mH55qE57G75Z6L77yM6YCa6L+HdXRpbC5qc+i/lOWbnuWvueixoeiOt+WPlu+8jOS4jeWGmem7mOiupOaYr3N1Y2Nlc3NcclxuICAgICAqL1xyXG4gICAgc2hvd01zZ0luZm86IGZ1bmN0aW9uICh0aXRsZSwgbWVzc2FnZSwgdHlwZSkge1xyXG4gICAgICAgIHR5cGUgPSB0eXBlID8gdHlwZSA6IFNIT1dfUE9QX1RZUEVfU1VDQ0VTUztcclxuICAgICAgICB2YXIgbXNnSW5mb0lkID0gJ21zZy1wb3AtJyArIF9pZCsrO1xyXG4gICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgICAgIG1zZ0luZm9JZDogbXNnSW5mb0lkLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyAgICQoXCJib2R5XCIpLmFwcGVuZCh0ZW1wbGF0ZSgnd2FybmluZy1ib3gvd2FybmluZy1ib3gtdGVtcGwnLCBkYXRhKSk7XHJcbiAgICAgICAgLy/lhbPpl63lm77moIfot5/lj5bmtojnmoTngrnlh7vkuovku7blsIHoo4XvvIzkvYbmmK/noa7orqTnmoTlsLHoh6rlt7HlhplcclxuICAgICAgICAkKFwiI1wiICsgbXNnSW5mb0lkICsgXCIgLmNhbmNlbCwjXCIgKyBtc2dJbmZvSWQgKyBcIiAuY2xvc2UtYm94XCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnIycgKyBtc2dJbmZvSWQpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIi5wb3AtbWFza1wiKS5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnIycgKyBtc2dJbmZvSWQpLnNob3coKTtcclxuICAgICAgICAgICAgJChcIi5wb3AtbWFza1wiKS5zaG93KCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBhcGVydEluZm86IGZ1bmN0aW9uICh0aXRsZSwgbWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBwb3B1cCA9IFwicG9wLXVwLWRpdlwiO1xyXG4gICAgICAgICQoXCIucG9wLW1hc2tcIikuc2hvdygpO1xyXG4gICAgICAgICQoXCIjXCIrcG9wdXApLnNob3coKTtcclxuICAgICAgICAkKFwiLmhlYWRcIikuZmluZChcImgxXCIpLmh0bWwodGl0bGUpO1xyXG4gICAgICAgICQoXCIucG9wLWNvbnRlbnRcIikuaHRtbChtZXNzYWdlKTtcclxuICAgICAgICAkKFwiI1wiK3BvcHVwKS5maW5kKFwiLmNsb3NlXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQoJyMnICsgcG9wdXApLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIi5wb3AtbWFza1wiKS5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgIH0sXHJcbiAgICBjbG9zZVBvcDpmdW5jdGlvbihwb3B1cCl7XHJcbiAgICAgICAgJCgnIycgKyBwb3B1cCkuaGlkZSgpO1xyXG4gICAgICAgICQoXCIucG9wLW1hc2tcIikuaGlkZSgpO1xyXG4gICAgfSxcclxuICAgIC8v5qC55o2u6Zi/5ouJ5Lyv5pWw5a2X55Sf5oiQ5Lit5paH5pWw5a2XXHJcbiAgICBjb3Zlck51bTogZnVuY3Rpb24gKG51bWJlcikge1xyXG4gICAgICAgIGlmIChpc05hTihudW1iZXIgLSAwKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZyBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG51bWJlci5sZW5ndGggPiAxMikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZyBpcyB0b28gYmlnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhID0gKG51bWJlciArICcnKS5zcGxpdCgnJyksXHJcbiAgICAgICAgICAgIHMgPSBbXSxcclxuICAgICAgICAgICAgdCA9IHRoaXMsXHJcbiAgICAgICAgICAgIGNoYXJzID0gJ+mbtuS4gOS6jOS4ieWbm+S6lOWFreS4g+WFq+S5nScsXHJcbiAgICAgICAgICAgIHVuaXRzID0gJ+S4quWNgeeZvuWNg+S4h0AjJeS6v14mfic7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhLmxlbmd0aCAtIDE7IGkgPD0gajsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChqID09IDEgfHwgaiA9PSA1IHx8IGogPT0gOSkgey8v5Lik5L2N5pWwIOWkhOeQhueJueauiueahCAxKlxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhW2ldICE9ICcxJykgcy5wdXNoKGNoYXJzLmNoYXJBdChhW2ldKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHMucHVzaChjaGFycy5jaGFyQXQoYVtpXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcy5wdXNoKGNoYXJzLmNoYXJBdChhW2ldKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICAgICAgcy5wdXNoKHVuaXRzLmNoYXJBdChqIC0gaSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcmV0dXJuIHM7XHJcbiAgICAgICAgcmV0dXJuIHMuam9pbignJykucmVwbGFjZSgv6Zu2KFvljYHnmb7ljYPkuIfkur9AIyVeJn5dKS9nLCBmdW5jdGlvbiAobSwgZCwgYikgey8v5LyY5YWI5aSE55CGIOmbtueZviDpm7bljYMg562JXHJcbiAgICAgICAgICAgIGIgPSB1bml0cy5pbmRleE9mKGQpO1xyXG4gICAgICAgICAgICBpZiAoYiAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPT0gJ+S6vycpIHJldHVybiBkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPT0gJ+S4hycpcmV0dXJuIGQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoYVtqIC0gYl0gPT0gJzAnKSByZXR1cm4gJ+mbtic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH0pLnJlcGxhY2UoL+mbtisvZywgJ+mbticpLnJlcGxhY2UoL+mbtihb5LiH5Lq/XSkvZywgZnVuY3Rpb24gKG0sIGIpIHsvLyDpm7bnmb4g6Zu25Y2D5aSE55CG5ZCOIOWPr+iDveWHuueOsCDpm7bpm7bnm7jov57nmoQg5YaN5aSE55CG57uT5bC+5Li66Zu255qEXHJcbiAgICAgICAgICAgIHJldHVybiBiO1xyXG4gICAgICAgIH0pLnJlcGxhY2UoL+S6v1vkuIfljYPnmb5dL2csICfkur8nKS5yZXBsYWNlKC9b6Zu2XSQvLCAnJykucmVwbGFjZSgvW0AjJV4mfl0vZywgZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsnQCc6ICfljYEnLCAnIyc6ICfnmb4nLCAnJSc6ICfljYMnLCAnXic6ICfljYEnLCAnJic6ICfnmb4nLCAnfic6ICfljYMnfVttXTtcclxuICAgICAgICB9KS5yZXBsYWNlKC8oW+S6v+S4h10pKFvkuIAt5LmdXSkvZywgZnVuY3Rpb24gKG0sIGQsIGIsIGMpIHtcclxuICAgICAgICAgICAgYyA9IHVuaXRzLmluZGV4T2YoZCk7XHJcbiAgICAgICAgICAgIGlmIChjICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYVtqIC0gY10gPT0gJzAnKSByZXR1cm4gZCArICfpm7YnICsgYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvL+iuoeeul2VjaGFydCB0aXRsZSDpq5jluqZcclxuICAgIGVIZWlnaHQ6IGZ1bmN0aW9uIChhcnJheSkge1xyXG4gICAgICAgIGFycmF5ID0gW10uc2xpY2UuY2FsbChhcnJheSk7Ly/lsIZhcnJheeWvueixoei9rOWMluS4uuaVsOe7hCxhcnJheeS4jeS4gOWumuaYr+S4quaVsOe7hFxyXG4gICAgICAgIGlmICghKGFycmF5IGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIFN0cmluZ1B4ID0gYXJyYXkuam9pbignJykubGVuZ3RoICogMTQ7XHJcbiAgICAgICAgdmFyIGVsc2VQTCA9IGFycmF5Lmxlbmd0aCAqICgyMCArIDEwKTtcclxuICAgICAgICB2YXIgWUhlaWdodCA9IE1hdGguY2VpbCgoU3RyaW5nUHggKyBlbHNlUEwpIC8gODUwKSAqIDI0ICsgMTA7Ly/lkJHkuIrkv67mraMxMOWDj+e0oFxyXG4gICAgICAgIHJldHVybiBZSGVpZ2h0IDwgNjAgPyA2MCA6IFlIZWlnaHQ7XHJcbiAgICB9LFxyXG4gICAgLy/ovazmjaLml7bpl7TmoLzlvI9cclxuICAgIGdldFRpbWU6IGZ1bmN0aW9uIChkYXRlLCBmb3JtYXQpIHtcclxuICAgICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZSAqIDEwMDApO1xyXG5cclxuICAgICAgICB2YXIgbWFwID0ge1xyXG4gICAgICAgICAgICBcIk1cIjogZGF0ZS5nZXRNb250aCgpICsgMSwgLy/mnIjku71cclxuICAgICAgICAgICAgXCJkXCI6IGRhdGUuZ2V0RGF0ZSgpLCAvL+aXpVxyXG4gICAgICAgICAgICBcImhcIjogZGF0ZS5nZXRIb3VycygpLCAvL+Wwj+aXtlxyXG4gICAgICAgICAgICBcIm1cIjogZGF0ZS5nZXRNaW51dGVzKCksIC8v5YiGXHJcbiAgICAgICAgICAgIFwic1wiOiBkYXRlLmdldFNlY29uZHMoKSwgLy/np5JcclxuICAgICAgICAgICAgXCJxXCI6IE1hdGguZmxvb3IoKGRhdGUuZ2V0TW9udGgoKSArIDMpIC8gMyksIC8v5a2j5bqmXHJcbiAgICAgICAgICAgIFwiU1wiOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC8v5q+r56eSXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgvKFt5TWRobXNxU10pKy9nLCBmdW5jdGlvbiAoYWxsLCB0KSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gbWFwW3RdO1xyXG4gICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWxsLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2ID0gJzAnICsgdjtcclxuICAgICAgICAgICAgICAgICAgICB2ID0gdi5zdWJzdHIodi5sZW5ndGggLSAyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHQgPT09ICd5Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChkYXRlLmdldEZ1bGxZZWFyKCkgKyAnJykuc3Vic3RyKDQgLSBhbGwubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYWxsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3JtYXQ7XHJcbiAgICB9LFxyXG4gICAgZ2V0QnJvd3NlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBTeXMgPSB7fTtcclxuICAgICAgICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgdmFyIHM7XHJcbiAgICAgICAgKHMgPSB1YS5tYXRjaCgvcnY6KFtcXGQuXSspXFwpIGxpa2UgZ2Vja28vKSkgPyBTeXMuaWUgPSBzWzFdIDpcclxuICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvbXNpZSAoW1xcZC5dKykvKSkgPyBTeXMuaWUgPSBzWzFdIDpcclxuICAgICAgICAgICAgICAgIChzID0gdWEubWF0Y2goL2ZpcmVmb3hcXC8oW1xcZC5dKykvKSkgPyBTeXMuZmlyZWZveCA9IHNbMV0gOlxyXG4gICAgICAgICAgICAgICAgICAgIChzID0gdWEubWF0Y2goL2Nocm9tZVxcLyhbXFxkLl0rKS8pKSA/IFN5cy5jaHJvbWUgPSBzWzFdIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvb3BlcmEuKFtcXGQuXSspLykpID8gU3lzLm9wZXJhID0gc1sxXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocyA9IHVhLm1hdGNoKC92ZXJzaW9uXFwvKFtcXGQuXSspLipzYWZhcmkvKSkgPyBTeXMuc2FmYXJpID0gc1sxXSA6IDA7XHJcblxyXG4gICAgICAgIGlmIChTeXMuaWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdpZSdcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN5cy5maXJlZm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZmlyZWZveCdcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN5cy5jaHJvbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdjaHJvbWUnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTeXMub3BlcmEpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdvcGVyYSdcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN5cy5zYWZhcmkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzYWZhcmknXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8v6K6h566X5pi+56S65a2X56ym5Liy55qE6ZW/5bqmXHJcbiAgICBzdHJEaXNwbGF5Zm9ybWF0OiBmdW5jdGlvbiAoc3RyaW5nLCBtYXhMZW5ndGgpIHtcclxuICAgICAgICB2YXIgbnVtID0gMDtcclxuICAgICAgICB2YXIgU1RSX05VTUJFUiA9IG1heExlbmd0aCA/IG1heExlbmd0aCA6IDMwO1xyXG4gICAgICAgIHZhciBwYXQgPSBuZXcgUmVnRXhwKCdbMC05YS16QS1aLV0nKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IChzdHJpbmcubGVuZ3RoID4gU1RSX05VTUJFUiA/IFNUUl9OVU1CRVIgOiBzdHJpbmcubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXQudGVzdChzdHJpbmdbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICBudW0rKztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG51bSArPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChudW0gPiBTVFJfTlVNQkVSKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nLnN1YnN0cmluZygwLCBpKSArICcuLi4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJpbmc7XHJcbiAgICB9LFxyXG4gICAgLy/moLnmja7kuK3mlofmlbDlrZfnlJ/miJDpmL/mi4nkvK/mlbDlrZdcclxuICAgIHRvTnVtOmZ1bmN0aW9uKHN0cil7XHJcbiAgICAgICAgaWYodHlwZW9mKHN0cikgIT09XCJzdHJpbmdcIil7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc3RyIGlzIG5vdCBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY2hhcnRzID0ge1xyXG4gICAgICAgICAgICBcIuS4gFwiOjEsXHJcbiAgICAgICAgICAgIFwi5LqMXCI6MixcclxuICAgICAgICAgICAgXCLkuIlcIjozLFxyXG4gICAgICAgICAgICBcIuWbm1wiOjQsXHJcbiAgICAgICAgICAgIFwi5LqUXCI6NSxcclxuICAgICAgICAgICAgXCLlha1cIjo2LFxyXG4gICAgICAgICAgICBcIuS4g1wiOjcsXHJcbiAgICAgICAgICAgIFwi5YWrXCI6OCxcclxuICAgICAgICAgICAgXCLkuZ1cIjo5XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgbnVtcyA9W107XHJcblxyXG4gICAgICAgIGlmKHN0ci5sZW5ndGggPT0xKXtcclxuICAgICAgICAgICAgcmV0dXJuIGNoYXJ0c1tzdHJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IodmFyIGkgPSAwO2k8c3RyLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgaWYoc3RyW2ldID09IFwi5Y2BXCIpe1xyXG4gICAgICAgICAgICAgICAgbnVtcy5wdXNoKFwi5Y2BXCIpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIG51bXMucHVzaChjaGFydHNbc3RyW2ldXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yKHZhciBpID0gMCxqPW51bXMubGVuZ3RoLTE7aTw9ajtpKyspe1xyXG4gICAgICAgICAgICBpZihudW1zW2ldID09XCLljYFcIil7XHJcbiAgICAgICAgICAgICAgICBudW1zW2ldID0gKGkgPT0gMCAmJiAxKSB8fCggaT09aiAmJiAnMCcpIHx8ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudW1zLmpvaW4oXCJcIiktMDtcclxuXHJcbiAgICB9LFxyXG4gICAgLy/kuI3lkIzlubTnuqfkuI3lkIznj63nmoTmjpLluo9cclxuICAgIHNvcnRncmFkZTpmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICBpZihkYXRhLmxlbmd0aDw9MSl7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVxID0gL1vkuIDkuozkuInlm5vkupTlha3kuIPlhavkuZ3ljYFdKy9nO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0R3JhZGVzID0gW107XHJcblxyXG4gICAgICAgIHZhciBncmFkZXM9e307Ly97WzE6W11dfVxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgdmFyIGdyYWRlTnVtID0gdGhpcy50b051bShkYXRhW2ldLmNsYXNzZXNOYW1lLm1hdGNoKHJlcSlbMF0pO1xyXG4gICAgICAgICAgICBpZighZ3JhZGVzW2dyYWRlTnVtXSl7XHJcbiAgICAgICAgICAgICAgICBncmFkZXNbZ3JhZGVOdW1dID1bXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBncmFkZXNbZ3JhZGVOdW1dLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciggdmFyIGlpIGluIGdyYWRlcyl7XHJcbiAgICAgICAgICAgIHJlc3VsdEdyYWRlcyA9cmVzdWx0R3JhZGVzLmNvbmNhdCh0aGlzLnNvcnRDbGFzcyhncmFkZXNbaWldKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRHcmFkZXM7XHJcbiAgICB9LFxyXG4gICAgLy/moLnmja7lkIzlubTnuqfkuI3lkIznj63nuqfmjpLluo9cclxuICAgIHNvcnRDbGFzczpmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICBpZihkYXRhLmxlbmd0aDw9MSl7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdG9JbmRleCA9IE1hdGguZmxvb3IoZGF0YS5sZW5ndGgvMik7XHJcbiAgICAgICAgdmFyIHRvTnVtID0gZGF0YVt0b0luZGV4XS5jbGFzc2VzTmFtZS5tYXRjaCgvXFxkKy9nKVswXS0wO1xyXG4gICAgICAgIHZhciBsZWZ0Q2xhc3M9IFtdLHJpZ2h0Q2xhc3MgPSBbXTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpPGRhdGEubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgIC8vbW9kZWwudXNlckRhdGEuY2xhc3Nlc1tpXS5jbGFzc051bSA9IGRhdGFbaV0uY2xhc3Nlc05hbWUubWF0Y2goL1xcZCsvZylbMF0tMDtcclxuICAgICAgICAgICAgaWYoaSA9PXRvSW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodG9OdW0gPmRhdGFbaV0uY2xhc3Nlc05hbWUubWF0Y2goL1xcZCsvZylbMF0tMCl7XHJcbiAgICAgICAgICAgICAgICBsZWZ0Q2xhc3MucHVzaChkYXRhW2ldKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICByaWdodENsYXNzLnB1c2goZGF0YVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuXHQgdGhpcy5zb3J0Q2xhc3MobGVmdENsYXNzKS5jb25jYXQoIGRhdGFbdG9JbmRleF0sdGhpcy5zb3J0Q2xhc3MocmlnaHRDbGFzcykpO1xyXG4gICAgfVxyXG5cclxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC91dGlsc3BhcmUvdXRpbC5qc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgNiA3IDEwIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgaHVpIG9uIDIwMTYvMTIvMjggMDAyOC5cclxuICovXHJcbnZhciAgbm9EYXRhVHBsPXJlcXVpcmUoXCIuL25vLWRhdGEudHBsXCIpO1xyXG4vKlxyXG4qIGRhdGEg5rKh5pyJ5pWw5o2u6ZyA6KaB5aGr5YaZ55qE5o+Q56S65YaF5a65XHJcbiogKi9cclxubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oZGF0YSl7XHJcbiAgIHJldHVybiBub0RhdGFUcGwoZGF0YSk7XHJcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvbm8tZGF0YS9uby1kYXRhLmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDUgNiA3IiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9uby1kYXRhL25vLWRhdGEnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSxjb250ZW50PSRkYXRhLmNvbnRlbnQsJG91dD0nJzskb3V0Kz0nPGRpdiBjbGFzcz1cIm5vLWRhdGFcIj4gPGRpdiBjbGFzcz1cIm5vLWltZ1wiPjwvZGl2PiA8ZGl2IGNsYXNzPVwiY29udFwiPic7XG4kb3V0Kz0kZXNjYXBlKGNvbnRlbnQpO1xuJG91dCs9JzwvZGl2PiA8L2Rpdj4nO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9uby1kYXRhL25vLWRhdGEudHBsXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDUgNiA3IiwiXHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBhamF4ID0gcmVxdWlyZSgndXRpbC9hamF4Jyk7XHJcbnZhciBsb2dpblRwbCA9IHJlcXVpcmUoJy4vdHBsL3BvcC1sb2dpbi50cGwnKTtcclxucmVxdWlyZSgnLi9wb3AtbG9naW4ubGVzcycpO1xyXG52YXIgcG9wTG9naW4gPSB7XHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHQkKCcucG9wJykuc2hvdygpO1xyXG5cdFx0JCgnLnBvcC1sb2dpbmcnKS5odG1sKGxvZ2luVHBsKCkpO1xyXG5cdFx0bWUubG9naW5nQnRuKCk7XHJcblx0XHRtZS5jbGlja0V2ZW4oKTtcclxuXHR9LFxyXG5cdGxvZ2luZ0J0bjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHQkKCcud3JhcCAubG9naW4tYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoJCgnLnVzZXItbmFtZScpLnZhbCgpID09ICcnKXtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VybmFtZScpLnNob3coKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VybmFtZScpLmhpZGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZigkKCcudXNlci1wYXNzJykudmFsKCkgPT0gJycpIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VycGFzcycpLnNob3coKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VycGFzcycpLmhpZGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZigkKCcudXNlci1uYW1lJykudmFsKCkgIT0gJycgJiYgJCgnLnVzZXItcGFzcycpLnZhbCgpICE9ICcnKXtcclxuXHRcdFx0XHRhamF4KHtcclxuXHRcdCAgICAgICAgICAgIHVybDogJy9lc2hvcC9hY2NvdW50L2xvZ2luJyxcclxuXHRcdCAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcclxuXHRcdCAgICAgICAgICAgIGRhdGE6e1xyXG5cdFx0ICAgICAgICAgICAgICAgIGxvZ2luTmFtZTogJCgnLnVzZXItbmFtZScpLnZhbCgpLFxyXG5cdFx0ICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAkKCcudXNlci1wYXNzJykudmFsKClcclxuXHRcdCAgICAgICAgICAgIH1cclxuXHRcdCAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuXHRcdCAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcblx0XHQgICAgICAgICAgICBcdHZhciBkZXRhaWwgPSBkYXRhLnJlc3VsdDtcclxuXHRcdFx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJsb2dpbm5hbWVcIixkZXRhaWwubG9naW5OYW1lKTtcclxuXHRcdCAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibG9naW5uYW1lXCIsZGV0YWlsLmxvZ2luTmFtZSk7XHJcblx0XHQgICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcImlkXCIsZGV0YWlsLmlkKTtcclxuXHRcdCAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwicGhvdG91cmxcIixkZXRhaWwucGhvdG9VcmwpO1xyXG5cdFx0ICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJpc2xvZ2luXCIsXCJ5ZXNcIik7XHJcblx0XHQgICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHQgICAgICAgICAgICB9XHJcblx0XHQgICAgICAgIH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH0sXHJcblx0Y2xpY2tFdmVuOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdCQoJy5wb3AtbG9naW4gLmxvZ2luLWRldGFpbHMgc3BhbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdCQoJy5wb3AsLnBvcC1sb2dpbmcnKS5oaWRlKCk7XHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHBvcExvZ2luLmluaXQoKVxyXG5cdH1cclxufVxyXG5cclxuXHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3BvcC1sb2dpbi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ2RlcC9wb3AtbG9naW4vdHBsL3BvcC1sb2dpbicsJzxkaXYgY2xhc3M9XCJwb3AtbG9naW5cIj4gPGRpdiBjbGFzcz1cImxvZ2luLWRldGFpbHMgY2xlYXJmaXhcIj4gPHAgY2xhc3M9XCJmbFwiPuS9oOWwmuacqueZu+W9lTwvcD4gPHNwYW4gY2xhc3M9XCJmclwiPjwvc3Bhbj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJ1c2VyLWxvZ2luXCI+6LSm5oi355m75b2VPC9kaXY+IDxkaXYgY2xhc3M9XCJsb2dpbi1kZXRhaWxcIj4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJ1c2VyLW5hbWVcIiBwbGFjZWhvbGRlcj1cIumCrueusS/nlKjmiLflkI0v5bey6aqM6K+B5omL5py6XCI+IDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBjbGFzcz1cInVzZXItcGFzc1wiIHBsYWNlaG9sZGVyPVwi5a+G56CBXCI+IDxidXR0b24gY2xhc3M9XCJsb2dpbi1idG5cIj7nmbvlvZU8L2J1dHRvbj4gPGRpdiBjbGFzcz1cInN1Yi1idG4gY2xlYXJmaXhcIj4gPGRpdiBjbGFzcz1cInJlZ2lzdGVyIGZsXCI+56uL5Y2z5rOo5YaMPC9kaXY+IDxkaXYgY2xhc3M9XCJmb3JnZXQgZnJcIj7lv5jorrDlr4bnoIE8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJ1c2VybmFtZSBlcnJvclwiPuivt+i+k+WFpei0puWPtzwvZGl2PiA8ZGl2IGNsYXNzPVwidXNlcnBhc3MgZXJyb3JcIj7or7fovpPlhaXlr4bnoIE8L2Rpdj4gPC9kaXY+IDwvZGl2PicpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3BvcC1sb2dpbi90cGwvcG9wLWxvZ2luLnRwbFxuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3BvcC1sb2dpbi5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCB7fSk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3BvcC1sb2dpbi5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9wb3AtbG9naW4ubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvcG9wLWxvZ2luL3BvcC1sb2dpbi5sZXNzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIucG9wLWxvZ2luIHtcXG4gIHdpZHRoOiA0MDBweDtcXG4gIGhlaWdodDogMzQwcHg7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIG1hcmdpbi1sZWZ0OiAtMjAwcHg7XFxuICBtYXJnaW4tdG9wOiAtMTcwcHg7XFxuICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMSk7XFxuICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAtbW96LWJvcmRlci1yYWRpdXM6IDVweDtcXG4gIC13ZWJraXQtYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgei1pbmRleDogOTk5O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG59XFxuLmxvZ2luLWRldGFpbHMge1xcbiAgd2lkdGg6IDM5OHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjNmMztcXG4gIHBhZGRpbmc6IDAgMTBweDtcXG59XFxuLmxvZ2luLWRldGFpbHMgcCB7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBjb2xvcjogIzY2NjtcXG4gIGxpbmUtaGVpZ2h0OiAzMHB4O1xcbn1cXG4ubG9naW4tZGV0YWlscyBzcGFuIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHdpZHRoOiAxM3B4O1xcbiAgaGVpZ2h0OiAxM3B4O1xcbiAgYmFja2dyb3VuZDogdXJsKFwiICsgcmVxdWlyZShcIi4uLy4uL2J1bmRsZS9pbWcvZGlhbG9nLnBuZ1wiKSArIFwiKSBuby1yZXBlYXQ7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBtYXJnaW4tdG9wOiA4cHg7XFxufVxcbi51c2VyLWxvZ2luIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGNvbG9yOiAjNjY2O1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbiAgbWFyZ2luLXRvcDogMjBweDtcXG4gIG1hcmdpbi1ib3R0b206IDIwcHg7XFxufVxcbi5sb2dpbi1kZXRhaWwge1xcbiAgcGFkZGluZzogMCA1MHB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG4ubG9naW4tZGV0YWlsIC51c2VyLW5hbWUge1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgaGVpZ2h0OiA0MnB4O1xcbiAgYm9yZGVyOiAxcHggc29saWQgI2QzZDNkMztcXG4gIGJhY2tncm91bmQ6IHVybChcIiArIHJlcXVpcmUoXCIuLi8uLi9idW5kbGUvaW1nL2ljb24tdXNlci5wbmdcIikgKyBcIikgbm8tcmVwZWF0IDEwcHggMTBweDtcXG4gIHBhZGRpbmctbGVmdDogMzZweDtcXG59XFxuLmxvZ2luLWRldGFpbCAudXNlci1wYXNzIHtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGhlaWdodDogNDJweDtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICNkM2QzZDM7XFxuICBiYWNrZ3JvdW5kOiB1cmwoXCIgKyByZXF1aXJlKFwiLi4vLi4vYnVuZGxlL2ltZy9pY29uLXBhc3MucG5nXCIpICsgXCIpIG5vLXJlcGVhdCAxMHB4IDEwcHg7XFxuICBwYWRkaW5nLWxlZnQ6IDM2cHg7XFxuICBtYXJnaW4tdG9wOiAyN3B4O1xcbn1cXG4ubG9naW4tZGV0YWlsIC5sb2dpbi1idG4ge1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgaGVpZ2h0OiA0MnB4O1xcbiAgYm9yZGVyOiAxcHggc29saWQgI2QzZDNkMztcXG4gIGJhY2tncm91bmQ6ICNlMDJiMmU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIG1hcmdpbi10b3A6IDI3cHg7XFxuICBsZXR0ZXItc3BhY2luZzogMTJweDtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuLmxvZ2luLWRldGFpbCAuc3ViLWJ0biB7XFxuICBtYXJnaW4tdG9wOiAxNnB4O1xcbn1cXG4ubG9naW4tZGV0YWlsIC5zdWItYnRuIC5mb3JnZXQge1xcbiAgY29sb3I6ICM5OTk5OTk7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbi5sb2dpbi1kZXRhaWwgLnN1Yi1idG4gLnJlZ2lzdGVyIHtcXG4gIHdpZHRoOiA3OHB4O1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XFxuICBjb2xvcjogI2Q1NTk1YjtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG4gIGJhY2tncm91bmQ6IHVybChcIiArIHJlcXVpcmUoXCIuLi8uLi9idW5kbGUvaW1nL2ljb24tcmVnaXN0ZXIucG5nXCIpICsgXCIpIG5vLXJlcGVhdCBsZWZ0O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4ubG9naW4tZGV0YWlsIC5lcnJvciB7XFxuICBjb2xvcjogI2UwMmIyZTtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbi5sb2dpbi1kZXRhaWwgLnVzZXJuYW1lIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDUwcHg7XFxuICB0b3A6IDQxcHg7XFxufVxcbi5sb2dpbi1kZXRhaWwgLnVzZXJwYXNzIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDUwcHg7XFxuICB0b3A6IDExMHB4O1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9kZXAvcG9wLWxvZ2luL3BvcC1sb2dpbi5sZXNzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDYgNyIsIm1vZHVsZS5leHBvcnRzID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUEwQUFBQU5CQU1BQUFDQXhmbFBBQUFBQkdkQlRVRUFBTEdQQy94aEJRQUFBQUZ6VWtkQ0FLN09IT2tBQUFBVlVFeFVSZlB6ODlYVjFmcjYrczNOemRyYTJ2WDE5ZmYzOXpXWHJxOEFBQUJBU1VSQlZBalhZMGhSWUdCZ1VFbGdjQlppWUdBU2RtQlFORlFBWXlaaElTQUN5aWthQmhxQzFEQUpHNE80REF6QnhnRU1TSHlvUEV3OVREL01QS2o1QU9CMENUdS9vZTExQUFBQUFFbEZUa1N1UW1DQ1wiXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9idW5kbGUvaW1nL2RpYWxvZy5wbmdcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJJQUFBQVRDQVlBQUFDZGtsM3lBQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBQXlGcFZGaDBXRTFNT21OdmJTNWhaRzlpWlM1NGJYQUFBQUFBQUR3L2VIQmhZMnRsZENCaVpXZHBiajBpNzd1L0lpQnBaRDBpVnpWTk1FMXdRMlZvYVVoNmNtVlRlazVVWTNwcll6bGtJajgrSUR4NE9uaHRjRzFsZEdFZ2VHMXNibk02ZUQwaVlXUnZZbVU2Ym5NNmJXVjBZUzhpSUhnNmVHMXdkR3M5SWtGa2IySmxJRmhOVUNCRGIzSmxJRFV1TlMxak1ERTBJRGM1TGpFMU1UUTRNU3dnTWpBeE15OHdNeTh4TXkweE1qb3dPVG94TlNBZ0lDQWdJQ0FnSWo0Z1BISmtaanBTUkVZZ2VHMXNibk02Y21SbVBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHhPVGs1THpBeUx6SXlMWEprWmkxemVXNTBZWGd0Ym5NaklqNGdQSEprWmpwRVpYTmpjbWx3ZEdsdmJpQnlaR1k2WVdKdmRYUTlJaUlnZUcxc2JuTTZlRzF3UFNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwzaGhjQzh4TGpBdklpQjRiV3h1Y3pwNGJYQk5UVDBpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5NFlYQXZNUzR3TDIxdEx5SWdlRzFzYm5NNmMzUlNaV1k5SW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdmVHRndMekV1TUM5elZIbHdaUzlTWlhOdmRYSmpaVkpsWmlNaUlIaHRjRHBEY21WaGRHOXlWRzl2YkQwaVFXUnZZbVVnVUdodmRHOXphRzl3SUVORElDaFhhVzVrYjNkektTSWdlRzF3VFUwNlNXNXpkR0Z1WTJWSlJEMGllRzF3TG1scFpEb3lOek5ETTBGQ04wSkVSVUV4TVVVM09URXpNMFk0T1RJNE5rVTNNMFkyT0NJZ2VHMXdUVTA2Ukc5amRXMWxiblJKUkQwaWVHMXdMbVJwWkRveU56TkRNMEZDT0VKRVJVRXhNVVUzT1RFek0wWTRPVEk0TmtVM00wWTJPQ0krSUR4NGJYQk5UVHBFWlhKcGRtVmtSbkp2YlNCemRGSmxaanBwYm5OMFlXNWpaVWxFUFNKNGJYQXVhV2xrT2pJM00wTXpRVUkxUWtSRlFURXhSVGM1TVRNelJqZzVNamcyUlRjelJqWTRJaUJ6ZEZKbFpqcGtiMk4xYldWdWRFbEVQU0o0YlhBdVpHbGtPakkzTTBNelFVSTJRa1JGUVRFeFJUYzVNVE16UmpnNU1qZzJSVGN6UmpZNElpOCtJRHd2Y21SbU9rUmxjMk55YVhCMGFXOXVQaUE4TDNKa1pqcFNSRVkrSUR3dmVEcDRiWEJ0WlhSaFBpQThQM2h3WVdOclpYUWdaVzVrUFNKeUlqOCtsVlQvTWdBQUFjNUpSRUZVZU5xY1ZFMUxBbEVVblhtRkppaEJpMEswWlp1Z0NIVnFZL1lIQ2l0Q2NCZDlRWCtnUmRHaWJmUURnb3FnRnRVbThpY0VRbGE2a0haQml4WmxFaFF4QlFyRFRPZkVpMnlhVWZQQzlkNjVIK2VkZCtlT3F1SWkrWHcrQ0xOaVdWYWF6NnFxSHNGc3htS3hrbE85NmdLU2hEbWpEeUJUQWdtWm5nUll4dDRqSEVEQ0JBSEFyV21hWVovUDEwWkZMTVFZYzZqcHRmZTFPeEJha3d3U21xYVZhK0tQaFVJaEFiQW4rS3ZRNWJxTUlDbis2THBldGljaWtVZ1pRTy9RbVlaWFE1Rk9Hd2dFL3VTS3hhSUFVei9jajRaQWtIMXBSKzBKd3pCR2JEWHVidzF6Nk1TUVgzQ3lBWFpqc0pjeXBVSFBFZk1JSWJxaTBlaGJYVVpvMUtHSGNEMndGN0NtVkFKMk1QZDlmVWRHU1BMVmszb0d4VDFLZlhtQVRvSFZOV3AvR0JFRVYxcENNRWNRdVM4cDdoRjhQNVUrWXpJWGdsN2g0TGxmakJBWWx0UUptcTVXcXlmeGVOeHlvcExOWmxXdjE1dkNnY2N5TkloTnYxRUJJdEJjUXFJYndVVUVkNVVtQkgwTE1EdFFmbnRoZ2d3UkJQYStVcW5zS1UyS3JMMkRCdEU3d0JsTnlOeTYyM1djaExXUURmbVk1S1pPZjAxZGlKenlUNUhyUVR2T3EvWExJYi8rRjZpbXA0OWYvd0VDczBCOXhnQ1ZGc0M0cktjQ2Z4WHpBTmxTV3BkdFlud0tNQUFLV041QVcxZThyZ0FBQUFCSlJVNUVya0pnZ2c9PVwiXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9idW5kbGUvaW1nL2ljb24tdXNlci5wbmdcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJJQUFBQVNDQVlBQUFCV3pvNVhBQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBQXlGcFZGaDBXRTFNT21OdmJTNWhaRzlpWlM1NGJYQUFBQUFBQUR3L2VIQmhZMnRsZENCaVpXZHBiajBpNzd1L0lpQnBaRDBpVnpWTk1FMXdRMlZvYVVoNmNtVlRlazVVWTNwcll6bGtJajgrSUR4NE9uaHRjRzFsZEdFZ2VHMXNibk02ZUQwaVlXUnZZbVU2Ym5NNmJXVjBZUzhpSUhnNmVHMXdkR3M5SWtGa2IySmxJRmhOVUNCRGIzSmxJRFV1TlMxak1ERTBJRGM1TGpFMU1UUTRNU3dnTWpBeE15OHdNeTh4TXkweE1qb3dPVG94TlNBZ0lDQWdJQ0FnSWo0Z1BISmtaanBTUkVZZ2VHMXNibk02Y21SbVBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHhPVGs1THpBeUx6SXlMWEprWmkxemVXNTBZWGd0Ym5NaklqNGdQSEprWmpwRVpYTmpjbWx3ZEdsdmJpQnlaR1k2WVdKdmRYUTlJaUlnZUcxc2JuTTZlRzF3UFNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwzaGhjQzh4TGpBdklpQjRiV3h1Y3pwNGJYQk5UVDBpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5NFlYQXZNUzR3TDIxdEx5SWdlRzFzYm5NNmMzUlNaV1k5SW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdmVHRndMekV1TUM5elZIbHdaUzlTWlhOdmRYSmpaVkpsWmlNaUlIaHRjRHBEY21WaGRHOXlWRzl2YkQwaVFXUnZZbVVnVUdodmRHOXphRzl3SUVORElDaFhhVzVrYjNkektTSWdlRzF3VFUwNlNXNXpkR0Z1WTJWSlJEMGllRzF3TG1scFpEb3pNVEl6TURSR04wSkVSVUV4TVVVM09EQkRSa1l5TWtJMU56WkJRelF3UkNJZ2VHMXdUVTA2Ukc5amRXMWxiblJKUkQwaWVHMXdMbVJwWkRvek1USXpNRFJHT0VKRVJVRXhNVVUzT0RCRFJrWXlNa0kxTnpaQlF6UXdSQ0krSUR4NGJYQk5UVHBFWlhKcGRtVmtSbkp2YlNCemRGSmxaanBwYm5OMFlXNWpaVWxFUFNKNGJYQXVhV2xrT2pNeE1qTXdORVkxUWtSRlFURXhSVGM0TUVOR1JqSXlRalUzTmtGRE5EQkVJaUJ6ZEZKbFpqcGtiMk4xYldWdWRFbEVQU0o0YlhBdVpHbGtPak14TWpNd05FWTJRa1JGUVRFeFJUYzRNRU5HUmpJeVFqVTNOa0ZETkRCRUlpOCtJRHd2Y21SbU9rUmxjMk55YVhCMGFXOXVQaUE4TDNKa1pqcFNSRVkrSUR3dmVEcDRiWEJ0WlhSaFBpQThQM2h3WVdOclpYUWdaVzVrUFNKeUlqOCt4Q1NrTkFBQUFPQkpSRUZVZU5waVpFQURWNjVjWWZqKy9Yc1FJeU5qRjVDcmpDejMvLy8vKzBDcWhKT1RjNTJPamc2S1BpWjBnNENHQkFJTldZdHVDQWdBeFJWQmNqOSsvUEJFbDJQQ29yZ2JhcnZ0NzkrL21VMU1UQmhCR01RR2lVR1ZUV1lnQk02Y09mTWZoRW1WWjJLZ0VzQm0wRjBpOUdHb1lUeDE2cFFvTUZ4MkFiRUJPUzRCaHRzRklIWmpvY1FRYU9TQTlPNWlnUmtDTkpYZjFOVDBFeW1HQUFPZEQwaDlCSmtCRHlOU0RRRUJZTEw0UkpkWUd6VUloMEduVDUvbUkxVXpzaDRXVU1vRXBRTWcvZ2hNRitRNjZCTElSVzRnQnJrbUFCMXlGb2hkQUFJTUFHMmVYekk5UkRuOEFBQUFBRWxGVGtTdVFtQ0NcIlxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYnVuZGxlL2ltZy9pY29uLXBhc3MucG5nXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCQUFBQUFTQ0FZQUFBQlNPMTVxQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUF5RnBWRmgwV0UxTU9tTnZiUzVoWkc5aVpTNTRiWEFBQUFBQUFEdy9lSEJoWTJ0bGRDQmlaV2RwYmowaTc3dS9JaUJwWkQwaVZ6Vk5NRTF3UTJWb2FVaDZjbVZUZWs1VVkzcHJZemxrSWo4K0lEeDRPbmh0Y0cxbGRHRWdlRzFzYm5NNmVEMGlZV1J2WW1VNmJuTTZiV1YwWVM4aUlIZzZlRzF3ZEdzOUlrRmtiMkpsSUZoTlVDQkRiM0psSURVdU5TMWpNREUwSURjNUxqRTFNVFE0TVN3Z01qQXhNeTh3TXk4eE15MHhNam93T1RveE5TQWdJQ0FnSUNBZ0lqNGdQSEprWmpwU1JFWWdlRzFzYm5NNmNtUm1QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh4T1RrNUx6QXlMekl5TFhKa1ppMXplVzUwWVhndGJuTWpJajRnUEhKa1pqcEVaWE5qY21sd2RHbHZiaUJ5WkdZNllXSnZkWFE5SWlJZ2VHMXNibk02ZUcxd1BTSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMM2hoY0M4eExqQXZJaUI0Yld4dWN6cDRiWEJOVFQwaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOTRZWEF2TVM0d0wyMXRMeUlnZUcxc2JuTTZjM1JTWldZOUltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZlR0Z3THpFdU1DOXpWSGx3WlM5U1pYTnZkWEpqWlZKbFppTWlJSGh0Y0RwRGNtVmhkRzl5Vkc5dmJEMGlRV1J2WW1VZ1VHaHZkRzl6YUc5d0lFTkRJQ2hYYVc1a2IzZHpLU0lnZUcxd1RVMDZTVzV6ZEdGdVkyVkpSRDBpZUcxd0xtbHBaRHBETnpNME9USTFOMEpFUlVJeE1VVTNPRFpEUVRoRk16QTFRakl4TlRVMU5TSWdlRzF3VFUwNlJHOWpkVzFsYm5SSlJEMGllRzF3TG1ScFpEcEROek0wT1RJMU9FSkVSVUl4TVVVM09EWkRRVGhGTXpBMVFqSXhOVFUxTlNJK0lEeDRiWEJOVFRwRVpYSnBkbVZrUm5KdmJTQnpkRkpsWmpwcGJuTjBZVzVqWlVsRVBTSjRiWEF1YVdsa09rTTNNelE1TWpVMVFrUkZRakV4UlRjNE5rTkJPRVV6TURWQ01qRTFOVFUxSWlCemRGSmxaanBrYjJOMWJXVnVkRWxFUFNKNGJYQXVaR2xrT2tNM016UTVNalUyUWtSRlFqRXhSVGM0TmtOQk9FVXpNRFZDTWpFMU5UVTFJaTgrSUR3dmNtUm1Pa1JsYzJOeWFYQjBhVzl1UGlBOEwzSmtaanBTUkVZK0lEd3ZlRHA0YlhCdFpYUmhQaUE4UDNod1lXTnJaWFFnWlc1a1BTSnlJajgrODJVQlhBQUFBVlZKUkVGVWVOcVUwODhyUkZFVXdQRVpNNk1VQzJNbFRWRmpKOUhreDhMR0F2a0RMS1FrbEtSRXpJYXltODFFRkJzYjFOVDhDUW9yQzBxU2xKVWZOZm1Sa0pUOGJtcDhyODZybWR0OTEzUHEwL1JlOTV4NzN6bDMvSm1CUVo4bG1wSEJnOXVDSWt0eUhRNXdqem1VL3FlQWVuK01hWlNnREhzWVFkQkxnUmxadUloUHhOR0tLcnloMjFub04vUWdqQ2UweWE2LzYrUTNod3JzNHhhenBoTnNZamN2V1VVQTUzS1NaNmhkMnhFTmFza2RhREUwTEl0NkxPQUNOWmhBS3I5QUNOdVlsTy9VNHgyanFFWVBsdlVlcktCUGVwRHplUXluQjVVWWsrUGJrdWZScUJkUU94NGlqVE5MY2llbWNLVVhXSkw1RGx1U2k3R0ZJUmx4UVlFVDNFbW4zV0lETDFnMzlTQ0ZjalM0SkVmUWk1aXBQNnJBSTNiUVpVZ09TRjlXWmY3R0thaXFTZlRMcy9yZUpxemhXdjZONDMrTjhRaTF1TUVYRXJpVUN4UEZ0MXNCNXlaK3lLN3ErUlN2WGkvU2p3QURBQ3FrU0RwakVycXRBQUFBQUVsRlRrU3VRbUNDXCJcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2J1bmRsZS9pbWcvaWNvbi1yZWdpc3Rlci5wbmdcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXHJcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXHJcbiovXHJcbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxyXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xyXG5cdFx0dmFyIG1lbW87XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRyZXR1cm4gbWVtbztcclxuXHRcdH07XHJcblx0fSxcclxuXHRpc09sZElFID0gbWVtb2l6ZShmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAvbXNpZSBbNi05XVxcYi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTtcclxuXHR9KSxcclxuXHRnZXRIZWFkRWxlbWVudCA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xyXG5cdH0pLFxyXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxyXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxyXG5cdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wID0gW107XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcclxuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcclxuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xyXG5cdH1cclxuXHJcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XHJcblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxyXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xyXG5cclxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgPGhlYWQ+LlxyXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XHJcblxyXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCk7XHJcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcclxuXHJcblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XHJcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xyXG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcclxuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xyXG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XHJcblx0XHR9XHJcblx0XHRpZihuZXdMaXN0KSB7XHJcblx0XHRcdHZhciBuZXdTdHlsZXMgPSBsaXN0VG9TdHlsZXMobmV3TGlzdCk7XHJcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XHJcblx0XHR9XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbWF5UmVtb3ZlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcclxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xyXG5cdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKylcclxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XHJcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucykge1xyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xyXG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XHJcblx0XHRpZihkb21TdHlsZSkge1xyXG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XHJcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QpIHtcclxuXHR2YXIgc3R5bGVzID0gW107XHJcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XHJcblx0XHR2YXIgaWQgPSBpdGVtWzBdO1xyXG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XHJcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xyXG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XHJcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XHJcblx0XHRpZighbmV3U3R5bGVzW2lkXSlcclxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xyXG5cdH1cclxuXHRyZXR1cm4gc3R5bGVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KSB7XHJcblx0dmFyIGhlYWQgPSBnZXRIZWFkRWxlbWVudCgpO1xyXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xyXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XHJcblx0XHRpZighbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcclxuXHRcdFx0aGVhZC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBoZWFkLmZpcnN0Q2hpbGQpO1xyXG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XHJcblx0XHRcdGhlYWQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xyXG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xyXG5cdFx0aGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XHJcblx0c3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcclxuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xyXG5cdGlmKGlkeCA+PSAwKSB7XHJcblx0XHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XHJcblx0dmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcclxuXHRzdHlsZUVsZW1lbnQudHlwZSA9IFwidGV4dC9jc3NcIjtcclxuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcclxuXHRyZXR1cm4gc3R5bGVFbGVtZW50O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKSB7XHJcblx0dmFyIGxpbmtFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XHJcblx0bGlua0VsZW1lbnQucmVsID0gXCJzdHlsZXNoZWV0XCI7XHJcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcclxuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xyXG5cdHZhciBzdHlsZUVsZW1lbnQsIHVwZGF0ZSwgcmVtb3ZlO1xyXG5cclxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcclxuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xyXG5cdFx0c3R5bGVFbGVtZW50ID0gc2luZ2xldG9uRWxlbWVudCB8fCAoc2luZ2xldG9uRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XHJcblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCBmYWxzZSk7XHJcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcclxuXHR9IGVsc2UgaWYob2JqLnNvdXJjZU1hcCAmJlxyXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcclxuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xyXG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0XHRpZihzdHlsZUVsZW1lbnQuaHJlZilcclxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcclxuXHRcdH07XHJcblx0fSBlbHNlIHtcclxuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcclxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xyXG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZShvYmopO1xyXG5cclxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XHJcblx0XHRpZihuZXdPYmopIHtcclxuXHRcdFx0aWYobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZW1vdmUoKTtcclxuXHRcdH1cclxuXHR9O1xyXG59XHJcblxyXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcclxuXHJcblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcclxuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcclxuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xyXG5cdH07XHJcbn0pKCk7XHJcblxyXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlRWxlbWVudCwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XHJcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xyXG5cclxuXHRpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcclxuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xyXG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2RlcztcclxuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xyXG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChjc3NOb2RlKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGVFbGVtZW50LCBvYmopIHtcclxuXHR2YXIgY3NzID0gb2JqLmNzcztcclxuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XHJcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XHJcblxyXG5cdGlmKG1lZGlhKSB7XHJcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXHJcblx0fVxyXG5cclxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xyXG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcclxuXHR9IGVsc2Uge1xyXG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcclxuXHRcdFx0c3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcclxuXHRcdH1cclxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUxpbmsobGlua0VsZW1lbnQsIG9iaikge1xyXG5cdHZhciBjc3MgPSBvYmouY3NzO1xyXG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcclxuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcclxuXHJcblx0aWYoc291cmNlTWFwKSB7XHJcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxyXG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xyXG5cdH1cclxuXHJcblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XHJcblxyXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xyXG5cclxuXHRsaW5rRWxlbWVudC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuXHJcblx0aWYob2xkU3JjKVxyXG5cdFx0VVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xyXG59XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSA2IDciLCJcclxudmFyIGpxID0gJC5ub0NvbmZsaWN0KCk7XHJcbi8vYmFuX3FoXHJcbmpxLmZuLmJhbnFoID0gZnVuY3Rpb24oY2FuKXtcclxuXHRjYW4gPSBqcS5leHRlbmQoe1xyXG5cdFx0XHRcdFx0Ym94Om51bGwsLy/mgLvmoYbmnrZcclxuXHRcdFx0XHRcdHBpYzpudWxsLC8v5aSn5Zu+5qGG5p62XHJcblx0XHRcdFx0XHRwbnVtOm51bGwsLy/lsI/lm77moYbmnrZcclxuXHRcdFx0XHRcdHByZXZfYnRuOm51bGwsLy/lsI/lm77lt6bnrq3lpLRcclxuXHRcdFx0XHRcdG5leHRfYnRuOm51bGwsLy/lsI/lm77lj7Pnrq3lpLRcclxuXHRcdFx0XHRcdHByZXY6bnVsbCwvL+Wkp+WbvuW3pueureWktFxyXG5cdFx0XHRcdFx0bmV4dDpudWxsLC8v5aSn5Zu+5Y+z566t5aS0XHJcblx0XHRcdFx0XHRwb3BfcHJldjpudWxsLC8v5by55Ye65qGG5bem566t5aS0XHJcblx0XHRcdFx0XHRwb3BfbmV4dDpudWxsLC8v5by55Ye65qGG5Y+z566t5aS0XHJcblx0XHRcdFx0XHRhdXRvcGxheTpmYWxzZSwvL+aYr+WQpuiHquWKqOaSreaUvlxyXG5cdFx0XHRcdFx0aW50ZXJUaW1lOjUwMDAsLy/lm77niYfoh6rliqjliIfmjaLpl7TpmpRcclxuXHRcdFx0XHRcdGRlbGF5VGltZTo4MDAsLy/liIfmjaLkuIDlvKDlm77niYfml7bpl7RcclxuXHRcdFx0XHRcdHBvcF9kZWxheVRpbWU6ODAwLC8v5by55Ye65qGG5YiH5o2i5LiA5byg5Zu+54mH5pe26Ze0XHJcblx0XHRcdFx0XHRvcmRlcjowLC8v5b2T5YmN5pi+56S655qE5Zu+54mH77yI5LuOMOW8gOWni++8iVxyXG5cdFx0XHRcdFx0cGljZGlyZTp0cnVlLC8v5aSn5Zu+5rua5Yqo5pa55ZCR77yIdHJ1ZeawtOW5s+aWueWQkea7muWKqO+8iVxyXG5cdFx0XHRcdFx0bWluZGlyZTp0cnVlLC8v5bCP5Zu+5rua5Yqo5pa55ZCR77yIdHJ1ZeawtOW5s+aWueWQkea7muWKqO+8iVxyXG5cdFx0XHRcdFx0bWluX3BpY251bTpudWxsLC8v5bCP5Zu+5pi+56S65pWw6YePXHJcblx0XHRcdFx0XHRwb3BfdXA6ZmFsc2UsLy/lpKflm77mmK/lkKbmnInlvLnlh7rmoYZcclxuXHRcdFx0XHRcdHBvcF9kaXY6bnVsbCwvL+W8ueWHuuahhuahhuaetlxyXG5cdFx0XHRcdFx0cG9wX3BpYzpudWxsLC8v5by55Ye65qGG5Zu+54mH5qGG5p62XHJcblx0XHRcdFx0XHRwb3BfeHg6bnVsbCwvL+WFs+mXreW8ueWHuuahhuaMiemSrlxyXG5cdFx0XHRcdFx0bWhjOm51bGwvL+acpueBsOWxglxyXG5cdFx0XHRcdH0sIGNhbiB8fCB7fSk7XHJcblx0dmFyIHBpY251bSA9IGpxKGNhbi5waWMpLmZpbmQoJ3VsIGxpJykubGVuZ3RoO1xyXG5cdHZhciBwaWN3ID0ganEoY2FuLnBpYykuZmluZCgndWwgbGknKS5vdXRlcldpZHRoKHRydWUpO1xyXG5cdHZhciBwaWNoID0ganEoY2FuLnBpYykuZmluZCgndWwgbGknKS5vdXRlckhlaWdodCh0cnVlKTtcclxuXHR2YXIgcG9wcGljdyA9IGpxKGNhbi5wb3BfcGljKS5maW5kKCd1bCBsaScpLm91dGVyV2lkdGgodHJ1ZSk7XHJcblx0dmFyIHBpY21pbm51bSA9IGpxKGNhbi5wbnVtKS5maW5kKCd1bCBsaScpLmxlbmd0aDtcclxuXHR2YXIgcGljcG9wbnVtID0ganEoY2FuLnBvcF9waWMpLmZpbmQoJ3VsIGxpJykubGVuZ3RoO1xyXG5cdHZhciBwaWNtaW53ID0ganEoY2FuLnBudW0pLmZpbmQoJ3VsIGxpJykub3V0ZXJXaWR0aCh0cnVlKTtcclxuXHR2YXIgcGljbWluaCA9IGpxKGNhbi5wbnVtKS5maW5kKCd1bCBsaScpLm91dGVySGVpZ2h0KHRydWUpO1xyXG5cdHZhciBwaWN0aW1lO1xyXG5cdHZhciB0cHFobnVtPTA7XHJcblx0dmFyIHh0cWhudW09MDtcclxuXHR2YXIgcG9wbnVtPTA7XHJcblx0anEoY2FuLnBpYykuZmluZCgndWwnKS53aWR0aChwaWNudW0qcGljdyk7XHJcblx0anEoY2FuLnBudW0pLmZpbmQoJ3VsJykud2lkdGgocGljbWlubnVtKnBpY21pbncpO1xyXG5cdGpxKGNhbi5wb3BfcGljKS5maW5kKCd1bCcpLndpZHRoKHBpY3BvcG51bSpwb3BwaWN3KTtcclxuXHRcclxuLy/ngrnlh7vlsI/lm77liIfmjaLlpKflm75cclxuXHQgICAganEoY2FuLnBudW0pLmZpbmQoJ2xpJykuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRwcWhudW0gPSB4dHFobnVtID0ganEoY2FuLnBudW0pLmZpbmQoJ2xpJykuaW5kZXgodGhpcyk7XHJcbiAgICAgICAgc2hvdyh0cHFobnVtKTtcclxuXHRcdG1pbnNob3coeHRxaG51bSk7XHJcbiAgICB9KS5lcShjYW4ub3JkZXIpLnRyaWdnZXIoXCJjbGlja1wiKTtcclxuLy/lpKflm77lvLnlh7rmoYZcclxuaWYoY2FuLnBvcF91cD09dHJ1ZSl7XHJcblx0anEoY2FuLnBpYykuZmluZCgndWwgbGknKS5jbGljayhmdW5jdGlvbigpe1xyXG5cdFx0anEoY2FuLm1oYykuaGVpZ2h0KGpxKGRvY3VtZW50KS5oZWlnaHQoKSkuc2hvdygpO1xyXG5cdFx0anEoY2FuLnBvcF9kaXYpLnNob3coKTtcclxuXHRcdHBvcG51bSA9IGpxKHRoaXMpLmluZGV4KCk7XHJcblx0XHR2YXIgZ2RqbF93PS1wb3BudW0qcG9wcGljdztcclxuXHRcdGpxKGNhbi5wb3BfcGljKS5maW5kKCd1bCcpLmNzcygnbGVmdCcsZ2RqbF93KTtcclxuXHRcdHBvcHNob3cocG9wbnVtKTtcclxuXHRcdH0pXHJcblx0anEoY2FuLnBvcF94eCkuY2xpY2soZnVuY3Rpb24oKXtcclxuXHRcdGpxKGNhbi5taGMpLmhpZGUoKTtcclxuXHRcdGpxKGNhbi5wb3BfZGl2KS5oaWRlKCk7XHJcblx0fSlcclxufVxyXG5cclxuXHRpZihjYW4uYXV0b3BsYXk9PXRydWUpe1xyXG4vL+iHquWKqOaSreaUvlxyXG5cdFx0cGljdGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHNob3codHBxaG51bSk7XHJcblx0XHRcdG1pbnNob3codHBxaG51bSlcclxuXHRcdFx0dHBxaG51bSsrO1xyXG5cdFx0XHR4dHFobnVtKys7XHJcblx0XHRcdGlmKHRwcWhudW09PXBpY251bSl7dHBxaG51bT0wfTtcdFxyXG5cdFx0XHRpZih4dHFobnVtPT1waWNtaW5udW0pe3h0cWhudW09MH07XHJcblx0XHRcdFx0XHRcclxuXHRcdH0sY2FuLmludGVyVGltZSk7XHRcclxuXHRcdFxyXG4vL+m8oOagh+e7j+i/h+WBnOatouaSreaUvlxyXG5cdFx0anEoY2FuLmJveCkuaG92ZXIoZnVuY3Rpb24oKXtcclxuXHRcdFx0Y2xlYXJJbnRlcnZhbChwaWN0aW1lKTtcclxuXHRcdH0sZnVuY3Rpb24oKXtcclxuXHRcdFx0cGljdGltZSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0c2hvdyh0cHFobnVtKTtcclxuXHRcdFx0XHRtaW5zaG93KHRwcWhudW0pXHJcblx0XHRcdFx0dHBxaG51bSsrO1xyXG5cdFx0XHRcdHh0cWhudW0rKztcclxuXHRcdFx0XHRpZih0cHFobnVtPT1waWNudW0pe3RwcWhudW09MH07XHRcclxuXHRcdFx0XHRpZih4dHFobnVtPT1waWNtaW5udW0pe3h0cWhudW09MH07XHRcdFxyXG5cdFx0XHRcdH0sY2FuLmludGVyVGltZSk7XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuLy/lsI/lm77lt6blj7PliIfmjaJcdFx0XHRcclxuXHRqcShjYW4ucHJldl9idG4pLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0cHFobnVtPT0wKXt0cHFobnVtPXBpY251bX07XHJcblx0XHRpZih4dHFobnVtPT0wKXt4dHFobnVtPXBpY251bX07XHJcblx0XHR4dHFobnVtLS07XHJcblx0XHR0cHFobnVtLS07XHJcblx0XHRzaG93KHRwcWhudW0pO1xyXG5cdFx0bWluc2hvdyh4dHFobnVtKTtcdFxyXG5cdFx0fSlcclxuXHRqcShjYW4ubmV4dF9idG4pLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0cHFobnVtPT1waWNudW0tMSl7dHBxaG51bT0tMX07XHJcblx0XHRpZih4dHFobnVtPT1waWNtaW5udW0tMSl7eHRxaG51bT0tMX07XHJcblx0XHR4dHFobnVtKys7XHJcblx0XHRtaW5zaG93KHh0cWhudW0pXHJcblx0XHR0cHFobnVtKys7XHJcblx0XHRzaG93KHRwcWhudW0pO1xyXG5cdFx0fSlcdFxyXG4vL+Wkp+WbvuW3puWPs+WIh+aNolx0XHJcblx0anEoY2FuLnByZXYpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0cHFobnVtPT0wKXt0cHFobnVtPXBpY251bX07XHJcblx0XHRpZih4dHFobnVtPT0wKXt4dHFobnVtPXBpY251bX07XHJcblx0XHR4dHFobnVtLS07XHJcblx0XHR0cHFobnVtLS07XHJcblx0XHRzaG93KHRwcWhudW0pO1xyXG5cdFx0bWluc2hvdyh4dHFobnVtKTtcdFxyXG5cdFx0fSlcclxuXHRqcShjYW4ubmV4dCkuY2xpY2soZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRwcWhudW09PXBpY251bS0xKXt0cHFobnVtPS0xfTtcclxuXHRcdGlmKHh0cWhudW09PXBpY21pbm51bS0xKXt4dHFobnVtPS0xfTtcclxuXHRcdHh0cWhudW0rKztcclxuXHRcdG1pbnNob3coeHRxaG51bSlcclxuXHRcdHRwcWhudW0rKztcclxuXHRcdHNob3codHBxaG51bSk7XHJcblx0XHR9KVxyXG4vL+W8ueWHuuahhuWbvueJh+W3puWPs+WIh+aNolx0XHJcblx0anEoY2FuLnBvcF9wcmV2KS5jbGljayhmdW5jdGlvbigpe1xyXG5cdFx0aWYocG9wbnVtPT0wKXtwb3BudW09cGljbnVtfTtcclxuXHRcdHBvcG51bS0tO1xyXG5cdFx0cG9wc2hvdyhwb3BudW0pO1xyXG5cdFx0fSlcclxuXHRqcShjYW4ucG9wX25leHQpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRpZihwb3BudW09PXBpY251bS0xKXtwb3BudW09LTF9O1xyXG5cdFx0cG9wbnVtKys7XHJcblx0XHRwb3BzaG93KHBvcG51bSk7XHJcblx0XHR9KVx0XHRcdFxyXG4vL+Wwj+WbvuWIh+aNoui/h+eoi1xyXG5cdGZ1bmN0aW9uIG1pbnNob3coeHRxaG51bSl7XHJcblx0XHR2YXIgbWluZ2RqbF9udW0gPXh0cWhudW0tY2FuLm1pbl9waWNudW0rMlxyXG5cdFx0dmFyIG1pbmdkamxfdz0tbWluZ2RqbF9udW0qcGljbWludztcclxuXHRcdHZhciBtaW5nZGpsX2g9LW1pbmdkamxfbnVtKnBpY21pbmg7XHJcblx0XHRcclxuXHRcdGlmKGNhbi5taW5kaXJlPT10cnVlKXtcclxuXHRcdFx0anEoY2FuLnBudW0pLmZpbmQoJ3VsIGxpJykuY3NzKCdmbG9hdCcsJ2xlZnQnKTtcclxuXHRcdFx0aWYocGljbWlubnVtPmNhbi5taW5fcGljbnVtKXtcclxuXHRcdFx0XHRpZih4dHFobnVtPDMpe21pbmdkamxfdz0wO31cclxuXHRcdFx0XHRpZih4dHFobnVtPT1waWNtaW5udW0tMSl7bWluZ2RqbF93PS0obWluZ2RqbF9udW0tMSkqcGljbWludzt9XHJcblx0XHRcdFx0anEoY2FuLnBudW0pLmZpbmQoJ3VsJykuc3RvcCgpLmFuaW1hdGUoeydsZWZ0JzptaW5nZGpsX3d9LGNhbi5kZWxheVRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdH1lbHNle1xyXG5cdFx0XHRqcShjYW4ucG51bSkuZmluZCgndWwgbGknKS5jc3MoJ2Zsb2F0Jywnbm9uZScpO1xyXG5cdFx0XHRpZihwaWNtaW5udW0+Y2FuLm1pbl9waWNudW0pe1xyXG5cdFx0XHRcdGlmKHh0cWhudW08Myl7bWluZ2RqbF9oPTA7fVxyXG5cdFx0XHRcdGlmKHh0cWhudW09PXBpY21pbm51bS0xKXttaW5nZGpsX2g9LShtaW5nZGpsX251bS0xKSpwaWNtaW5oO31cclxuXHRcdFx0XHRqcShjYW4ucG51bSkuZmluZCgndWwnKS5zdG9wKCkuYW5pbWF0ZSh7J3RvcCc6bWluZ2RqbF9ofSxjYW4uZGVsYXlUaW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFxyXG5cdH1cclxuLy/lpKflm77liIfmjaLov4fnqItcclxuXHRcdGZ1bmN0aW9uIHNob3codHBxaG51bSl7XHJcblx0XHRcdHZhciBnZGpsX3c9LXRwcWhudW0qcGljdztcclxuXHRcdFx0dmFyIGdkamxfaD0tdHBxaG51bSpwaWNoO1xyXG5cdFx0XHRpZihjYW4ucGljZGlyZT09dHJ1ZSl7XHJcblx0XHRcdFx0anEoY2FuLnBpYykuZmluZCgndWwgbGknKS5jc3MoJ2Zsb2F0JywnbGVmdCcpO1xyXG5cdFx0XHRcdGpxKGNhbi5waWMpLmZpbmQoJ3VsJykuc3RvcCgpLmFuaW1hdGUoeydsZWZ0JzpnZGpsX3d9LGNhbi5kZWxheVRpbWUpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRqcShjYW4ucGljKS5maW5kKCd1bCcpLnN0b3AoKS5hbmltYXRlKHsndG9wJzpnZGpsX2h9LGNhbi5kZWxheVRpbWUpO1xyXG5cdFx0XHR9Ly/mu5rliqhcclxuXHRcdFx0Ly9qcShjYW4ucGljKS5maW5kKCd1bCBsaScpLmVxKHRwcWhudW0pLmZhZGVJbihjYW4uZGVsYXlUaW1lKS5zaWJsaW5ncygnbGknKS5mYWRlT3V0KGNhbi5kZWxheVRpbWUpOy8v5reh5YWl5reh5Ye6XHJcblx0XHRcdGpxKGNhbi5wbnVtKS5maW5kKCdsaScpLmVxKHRwcWhudW0pLmFkZENsYXNzKFwib25cIikuc2libGluZ3ModGhpcykucmVtb3ZlQ2xhc3MoXCJvblwiKTtcclxuXHRcdH07XHJcbi8v5by55Ye65qGG5Zu+54mH5YiH5o2i6L+H56iLXHJcblx0XHRmdW5jdGlvbiBwb3BzaG93KHBvcG51bSl7XHJcblx0XHRcdHZhciBnZGpsX3c9LXBvcG51bSpwb3BwaWN3O1xyXG5cdFx0XHRcdGpxKGNhbi5wb3BfcGljKS5maW5kKCd1bCcpLnN0b3AoKS5hbmltYXRlKHsnbGVmdCc6Z2RqbF93fSxjYW4ucG9wX2RlbGF5VGltZSk7XHJcblx0XHRcdC8vanEoY2FuLnBvcF9waWMpLmZpbmQoJ3VsIGxpJykuZXEodHBxaG51bSkuZmFkZUluKGNhbi5wb3BfZGVsYXlUaW1lKS5zaWJsaW5ncygnbGknKS5mYWRlT3V0KGNhbi5wb3BfZGVsYXlUaW1lKTsvL+a3oeWFpea3oeWHulxyXG5cdFx0fTtcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvdXRpbHNwYXJlL3BpY190YWIuanNcbi8vIG1vZHVsZSBpZCA9IDMwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxyXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xyXG52YXIgYWpheCA9IHJlcXVpcmUoXCJ1dGlsL2FqYXhcIik7XHJcblxyXG52YXIgY2FydFRwbCA9IHJlcXVpcmUoJy4vdHBsL2FkZC1jYXJ0LnRwbCcpO1xyXG5yZXF1aXJlKCcuL2FkZC1jYXJ0Lmxlc3MnKTtcclxuXHJcbi8qXHJcbiAqICDmt7vliqDliLDotK3nianovaZcclxuICovXHJcblxyXG52YXIgY2FydCA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICAkKCcuZ29vZHMtZGV0YWlsLC5nb29kcy1pbnRyb2R1Y2UnKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnLndyYXBDJykuYXBwZW5kKGNhcnRUcGwoZGF0YSkpO1xyXG4gICAgICAgIG1lLmNsaWNrRXZlbigpO1xyXG4gICAgfSxcclxuICAgIGNsaWNrRXZlbjogZnVuY3Rpb24oKXtcclxuICAgIFx0dmFyIG1lID0gdGhpcztcclxuICAgIFx0JCgnLmxvb2stZGV0YWlsJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgIFx0XHQkKCcuZ29vZHMtZGV0YWlsLC5nb29kcy1pbnRyb2R1Y2UnKS5zaG93KCk7XHJcbiAgICBcdFx0JCgnLmFkZC10aGVuJykucmVtb3ZlKCk7XHJcbiAgICBcdH0pO1xyXG4gICAgICAgICQoJy5nby1jYXJ0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2luZG93Lm9wZW4oJy4uL215LWNhcnQvbXktY2FydC5odG1sJyk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqICBAcGFyYW0gZGF0YSAg6I635Y+W5Zu+54mH44CB54mp5ZOBaWTjgIHnianlk4HotK3kubDmlbDph4/jgIHnianlk4HlkI3np7BcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgY2FydC5pbml0KGRhdGEpO1xyXG4gICAgfVxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2FkZC1jYXJ0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2FkZC1jYXJ0L3RwbC9hZGQtY2FydCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZXNjYXBlPSR1dGlscy4kZXNjYXBlLHBob3RvdXJsPSRkYXRhLnBob3RvdXJsLG5hbWU9JGRhdGEubmFtZSxudW09JGRhdGEubnVtLGlkPSRkYXRhLmlkLCRvdXQ9Jyc7JG91dCs9JzxkaXYgY2xhc3M9XCJhZGQtdGhlblwiPiA8ZGl2IGNsYXNzPVwiYWRkQ1wiPiA8ZGl2IGNsYXNzPVwiYWRkLXN1Y2Nlc3MgY2xlYXJmaXhcIj4gPGltZyBjbGFzcz1cImZsXCIgc3JjPVwiLi4vLi4vYnVuZGxlL2ltZy9pY29uLXRoZW4ucG5nXCI+IDxzcGFuIGNsYXNzPVwiZ29vZHMgZmxcIj7llYblk4Hlt7LmiJDlip/liqDlhaXotK3nianovabvvIE8L3NwYW4+IDwvZGl2PiA8ZGl2IGNsYXNzPVwidGhlbi1kZXRhaWxzIGNsZWFyZml4XCI+IDxkaXYgY2xhc3M9XCJ0aGVuLWxlZnQgZmwgY2xlYXJmaXhcIj4gPGRpdiBjbGFzcz1cInRoZW4taW1nIGZsXCI+IDxpbWcgc3JjPVwiJztcbiRvdXQrPSRlc2NhcGUocGhvdG91cmwpO1xuJG91dCs9J1wiPiA8L2Rpdj4gPGRpdiBjbGFzcz1cInRoZW4taW50cm9kdWNlIGZsXCI+IDxwIGNsYXNzPVwidGhlbi1uYW1lXCI+JztcbiRvdXQrPSRlc2NhcGUobmFtZSk7XG4kb3V0Kz0nPC9wPiA8cCBjbGFzcz1cInRoZW4tbnVtXCI+5pWw6YeP77yaJztcbiRvdXQrPSRlc2NhcGUobnVtKTtcbiRvdXQrPSc8L3A+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cInRoZW4tYnRuIGZyIGNsZWFyZml4XCIgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKGlkKTtcbiRvdXQrPSdcIj4gPHNwYW4gY2xhc3M9XCJsb29rLWRldGFpbCBmbFwiPuafpeeci+eJqeWTgeivpuaDhTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJnby1jYXJ0IGZsXCI+5Y676LSt54mp6L2m57uT566XPC9zcGFuPiA8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4nO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9hZGQtY2FydC90cGwvYWRkLWNhcnQudHBsXG4vLyBtb2R1bGUgaWQgPSAzMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vYWRkLWNhcnQubGVzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwge30pO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9hZGQtY2FydC5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9hZGQtY2FydC5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9hZGQtY2FydC9hZGQtY2FydC5sZXNzXG4vLyBtb2R1bGUgaWQgPSAzM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuYWRkLXRoZW4ge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmNmY2O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMge1xcbiAgd2lkdGg6IDEyMDBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcGFkZGluZzogMjBweCAwO1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLmFkZC1zdWNjZXNzIHtcXG4gIGJvcmRlci1ib3R0b206IDFweCBkYXNoZWQgI2U0ZTRlNDtcXG4gIHdpZHRoOiAxMjAwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxufVxcbi5hZGQtdGhlbiAuYWRkQyAuYWRkLXN1Y2Nlc3MgaW1nIHtcXG4gIHdpZHRoOiAzMnB4O1xcbiAgaGVpZ2h0OiAzMnB4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLmFkZC1zdWNjZXNzIC5nb29kcyB7XFxuICBjb2xvcjogIzZlYjI0MjtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIG1hcmdpbi10b3A6IDJweDtcXG4gIG1hcmdpbi1sZWZ0OiAxMnB4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLnRoZW4tZGV0YWlscyB7XFxuICBtYXJnaW4tdG9wOiAxOXB4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLnRoZW4tZGV0YWlscyAudGhlbi1sZWZ0IC50aGVuLWltZyB7XFxuICB3aWR0aDogMTEycHg7XFxuICBoZWlnaHQ6IDExMnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmFkZC10aGVuIC5hZGRDIC50aGVuLWRldGFpbHMgLnRoZW4tbGVmdCAudGhlbi1pbWcgaW1nIHtcXG4gIHdpZHRoOiA5OHB4O1xcbiAgaGVpZ2h0OiA5OHB4O1xcbiAgbWFyZ2luLXRvcDogN3B4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLnRoZW4tZGV0YWlscyAudGhlbi1sZWZ0IC50aGVuLWludHJvZHVjZSB7XFxuICBtYXJnaW4tbGVmdDogMTFweDtcXG4gIG1hcmdpbi10b3A6IDI4cHg7XFxufVxcbi5hZGQtdGhlbiAuYWRkQyAudGhlbi1kZXRhaWxzIC50aGVuLWxlZnQgLnRoZW4taW50cm9kdWNlIC50aGVuLW5hbWUge1xcbiAgY29sb3I6ICM2NjY2NjY7XFxuICBmb250LXNpemU6IDE0cHg7XFxufVxcbi5hZGQtdGhlbiAuYWRkQyAudGhlbi1kZXRhaWxzIC50aGVuLWxlZnQgLnRoZW4taW50cm9kdWNlIC50aGVuLW51bSB7XFxuICBjb2xvcjogI2IxYjFiMTtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG4gIG1hcmdpbi10b3A6IDIwcHg7XFxufVxcbi5hZGQtdGhlbiAuYWRkQyAudGhlbi1kZXRhaWxzIC50aGVuLWJ0biB7XFxuICBtYXJnaW4tdG9wOiA4NHB4O1xcbiAgbWFyZ2luLXJpZ2h0OiA2MHB4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLnRoZW4tZGV0YWlscyAudGhlbi1idG4gLmxvb2stZGV0YWlsIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHdpZHRoOiAxNjBweDtcXG4gIGhlaWdodDogNDBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBsaW5lLWhlaWdodDogNDBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGNvbG9yOiAjNjY2NjY2O1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgbWFyZ2luLXJpZ2h0OiAyOXB4O1xcbn1cXG4uYWRkLXRoZW4gLmFkZEMgLnRoZW4tZGV0YWlscyAudGhlbi1idG4gLmdvLWNhcnQge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgd2lkdGg6IDE2NHB4O1xcbiAgaGVpZ2h0OiA0MHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2RlMzYyYjtcXG4gIGxpbmUtaGVpZ2h0OiA0MHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RlcC9hZGQtY2FydC9hZGQtY2FydC5sZXNzXG4vLyBtb2R1bGUgaWQgPSAzNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgndHBsL2NvbW1vZGl0eS1saXN0L2d1ZXNzLWxpc3QnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVhY2g9JHV0aWxzLiRlYWNoLCR2YWx1ZT0kZGF0YS4kdmFsdWUsJGluZGV4PSRkYXRhLiRpbmRleCwkZXNjYXBlPSR1dGlscy4kZXNjYXBlLCRvdXQ9Jyc7JGVhY2goJGRhdGEsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxkaXYgY2xhc3M9XCJsaXN0LWNob2ljZSBmbFwiIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPiA8aW1nIHNyYz1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5vbmVQaG90byk7XG4kb3V0Kz0nXCI+IDxwIGNsYXNzPVwibGlzdC1uYW1lXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvcD4gPGRpdiBjbGFzcz1cImxpc3QtY29udCBjbGVhcmZpeFwiPiA8c3BhbiBjbGFzcz1cImxpc3QtbW9uZXkgZmxcIj7vv6UnO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUucHJpY2UpO1xuJG91dCs9Jy4wMDwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJsaXN0LW51bSBmclwiPjxiPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5yZW1hcmtOdW0gfHwgJzAnKTtcbiRvdXQrPSc8L2I+5Lq66K+E5Lu3PC9zcGFuPiA8L2Rpdj4gPC9kaXY+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90cGwvY29tbW9kaXR5LWxpc3QvZ3Vlc3MtbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDM1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCA2IiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ3RwbC9jb21tb2RpdHktbGlzdC9ldmFsLWxpc3QnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVhY2g9JHV0aWxzLiRlYWNoLCR2YWx1ZT0kZGF0YS4kdmFsdWUsJGluZGV4PSRkYXRhLiRpbmRleCwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdHBsL2NvbW1vZGl0eS1saXN0L2V2YWwtbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDM2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCd0cGwvY29tbW9kaXR5LWxpc3QvaG90LWxpc3QnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVhY2g9JHV0aWxzLiRlYWNoLCR2YWx1ZT0kZGF0YS4kdmFsdWUsJGluZGV4PSRkYXRhLiRpbmRleCwkZXNjYXBlPSR1dGlscy4kZXNjYXBlLCRvdXQ9Jyc7JGVhY2goJGRhdGEsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBjbGFzcz1cImZsIGNsZWFyZml4XCIgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+IDxpbWcgY2xhc3M9XCJmbFwiIHNyYz1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5vbmVQaG90byk7XG4kb3V0Kz0nXCI+IDxkaXYgY2xhc3M9XCJob3QtZGV0YWlsIGZyXCI+IDxzcGFuPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5uYW1lKTtcbiRvdXQrPSc8L3NwYW4+IDxiPueJueS7t++8mjxpPu+/pSc7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5wcmljZSk7XG4kb3V0Kz0nLjAwPC9pPjwvYj4gPHAgY2xhc3M9XCJub3ctYnV5XCI+56uL5Y2z5oqi6LStPC9wPiA8L2Rpdj4gPC9saT4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RwbC9jb21tb2RpdHktbGlzdC9ob3QtbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ3RwbC9jb21tb2RpdHktbGlzdC9ob3RfbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGNsYXNzPVwiZmwgY2xlYXJmaXhcIiBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gPGltZyBjbGFzcz1cImZsXCIgc3JjPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm9uZVBob3RvKTtcbiRvdXQrPSdcIj4gPGRpdiBjbGFzcz1cImZyXCI+IDxzcGFuPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5uYW1lKTtcbiRvdXQrPSc8L3NwYW4+IDxiPu+/pSc7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5wcmljZSk7XG4kb3V0Kz0nLjAwPC9iPiA8L2Rpdj4gPC9saT4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RwbC9jb21tb2RpdHktbGlzdC9ob3RfbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDM4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCd0cGwvY29tbW9kaXR5LWxpc3Qvc2VlLWFnaWFuJyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+IDxpbWcgc3JjPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm9uZVBob3RvKTtcbiRvdXQrPSdcIj4gPHNwYW4gY2xhc3M9XCJzZWUtbW9uZXlcIj7vv6UnO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUucHJpY2UpO1xuJG91dCs9Jy4wMDwvc3Bhbj4gPC9saT4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RwbC9jb21tb2RpdHktbGlzdC9zZWUtYWdpYW4udHBsXG4vLyBtb2R1bGUgaWQgPSAzOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9