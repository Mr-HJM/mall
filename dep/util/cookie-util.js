/**
 * Created by fudapeng on 2015/3/31 0031.
 */


module.exports = {

    setCookie: function (name, value, time) {
        if (time) {
            var exp = new Date();    //new Date("December 31, 9998");
            exp.setTime(exp.getTime() + time);
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
        } else {
            document.cookie = name + "=" + escape(value) + ";path=/";
        }
    },

    getCookie: function (c_name) {
        if (document.cookie.length > 0) {
            var c_start = document.cookie.indexOf(c_name + "=")
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1
                c_end = document.cookie.indexOf(";", c_start)
                if (c_end == -1) {
                    c_end = document.cookie.length
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return ""
    },

    updateCookie: function (name) {
        var me = this;
        var hours = 0.5; //此 cookie 将被保存 30 分钟

        var exp = new Date();    //new Date("December 31, 9998");
        exp.setTime(exp.getTime() + hours * 60 * 60 * 1000);
        var cval = me.getCookie(name);
        if (cval != null) {
            document.cookie = name + "=" + escape(cval) + ";expires=" + exp.toGMTString() + ";path=/";
        }
    },

    delCookie: function (name) {
        var me = this;
        var exp = new Date();

        exp.setTime(exp.getTime() - 1000);//让时间过期

        var cval = me.getCookie(name);

        if (cval != null) {
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
        }
    }


};
