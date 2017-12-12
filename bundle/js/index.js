webpackJsonp([2,12],{

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(49);


/***/ }),

/***/ 49:
/***/ (function(module, exports) {

	
	var integral = {
		init: function(){
			var me = this;
			var sUserAgent = navigator.userAgent.toLowerCase();
	        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
	        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
	        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
	        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
	        var bIsAndroid = sUserAgent.match(/android/i) == "android";
	        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
	        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
	        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
	            window.location.href='http://10.3.140.8:8090';       // 本地
	            // window.location.href='http://www.0744123.com:8089/html/integral-base/integral-home.html';    // 线上
	        } else {
	            window.location.href='../html/integral-base/integral-home.html';   // 本地
	            // window.location.href='http://www.0744123.com:8085/html/integral-base/integral-home.html';    // 线上
	        }
		}
	}
	
	integral.init()


/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9tYWluL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMEQ7QUFDMUQseUdBQXdHO0FBQ3hHLFVBQVM7QUFDVCw2RUFBNEU7QUFDNUUseUdBQXdHO0FBQ3hHO0FBQ0E7QUFDQTs7QUFFQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG52YXIgaW50ZWdyYWwgPSB7XHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgc1VzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB2YXIgYklzSXBhZCA9IHNVc2VyQWdlbnQubWF0Y2goL2lwYWQvaSkgPT0gXCJpcGFkXCI7XHJcbiAgICAgICAgdmFyIGJJc0lwaG9uZU9zID0gc1VzZXJBZ2VudC5tYXRjaCgvaXBob25lIG9zL2kpID09IFwiaXBob25lIG9zXCI7XHJcbiAgICAgICAgdmFyIGJJc01pZHAgPSBzVXNlckFnZW50Lm1hdGNoKC9taWRwL2kpID09IFwibWlkcFwiO1xyXG4gICAgICAgIHZhciBiSXNVYzcgPSBzVXNlckFnZW50Lm1hdGNoKC9ydjoxLjIuMy40L2kpID09IFwicnY6MS4yLjMuNFwiO1xyXG4gICAgICAgIHZhciBiSXNVYyA9IHNVc2VyQWdlbnQubWF0Y2goL3Vjd2ViL2kpID09IFwidWN3ZWJcIjtcclxuICAgICAgICB2YXIgYklzQW5kcm9pZCA9IHNVc2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgPT0gXCJhbmRyb2lkXCI7XHJcbiAgICAgICAgdmFyIGJJc0NFID0gc1VzZXJBZ2VudC5tYXRjaCgvd2luZG93cyBjZS9pKSA9PSBcIndpbmRvd3MgY2VcIjtcclxuICAgICAgICB2YXIgYklzV00gPSBzVXNlckFnZW50Lm1hdGNoKC93aW5kb3dzIG1vYmlsZS9pKSA9PSBcIndpbmRvd3MgbW9iaWxlXCI7XHJcbiAgICAgICAgaWYgKGJJc0lwYWQgfHwgYklzSXBob25lT3MgfHwgYklzTWlkcCB8fCBiSXNVYzcgfHwgYklzVWMgfHwgYklzQW5kcm9pZCB8fCBiSXNDRSB8fCBiSXNXTSkge1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZj0naHR0cDovLzEwLjMuMTQwLjg6ODA5MCc7ICAgICAgIC8vIOacrOWcsFxyXG4gICAgICAgICAgICAvLyB3aW5kb3cubG9jYXRpb24uaHJlZj0naHR0cDovL3d3dy4wNzQ0MTIzLmNvbTo4MDg5L2h0bWwvaW50ZWdyYWwtYmFzZS9pbnRlZ3JhbC1ob21lLmh0bWwnOyAgICAvLyDnur/kuIpcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZj0nLi4vaHRtbC9pbnRlZ3JhbC1iYXNlL2ludGVncmFsLWhvbWUuaHRtbCc7ICAgLy8g5pys5ZywXHJcbiAgICAgICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbi5ocmVmPSdodHRwOi8vd3d3LjA3NDQxMjMuY29tOjgwODUvaHRtbC9pbnRlZ3JhbC1iYXNlL2ludGVncmFsLWhvbWUuaHRtbCc7ICAgIC8vIOe6v+S4ilxyXG4gICAgICAgIH1cclxuXHR9XHJcbn1cclxuXHJcbmludGVncmFsLmluaXQoKVxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL21haW4vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMiJdLCJzb3VyY2VSb290IjoiIn0=