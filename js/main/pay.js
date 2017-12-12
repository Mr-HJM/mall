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
