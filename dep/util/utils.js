/**
 * Created by lsc on 2014/12/7.
 */
var $ = require("jquery");
_id = 0;
var SHOW_POP_TYPE_SUCCESS = 0;
var SHOW_POP_TYPE_FAIL = 1;
var SHOW_POP_TYPE_WARNING = 2;
module.exports = {
    forEach: function (array, callback, scope) {
        scope = scope || null;
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
        var paramsStr = location.href.indexOf('?') > 0 ? location.href.substring(location.href.indexOf("?") + 1, location.href.length) : '';
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