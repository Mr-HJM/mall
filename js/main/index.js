
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
