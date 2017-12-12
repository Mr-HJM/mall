webpackJsonp([9,12],{

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(69);


/***/ }),

/***/ 69:
/***/ (function(module, exports) {

	/* 跳转到支付宝支付页面 */
	var pay = {
	    init: function(){
	        var me = this;
	        var storage = window.sessionStorage;
	        var payHtml = storage["pay"];
	        $('body').html(payHtml);
	    }
	}
	
	pay.init()


/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9tYWluL3BheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6InBheS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIOi3s+i9rOWIsOaUr+S7mOWuneaUr+S7mOmhtemdoiAqL1xyXG52YXIgcGF5ID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xyXG4gICAgICAgIHZhciBwYXlIdG1sID0gc3RvcmFnZVtcInBheVwiXTtcclxuICAgICAgICAkKCdib2R5JykuaHRtbChwYXlIdG1sKTtcclxuICAgIH1cclxufVxyXG5cclxucGF5LmluaXQoKVxyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL21haW4vcGF5LmpzXG4vLyBtb2R1bGUgaWQgPSA2OVxuLy8gbW9kdWxlIGNodW5rcyA9IDkiXSwic291cmNlUm9vdCI6IiJ9