/**
 *
 */
var art = require('tmodjs-loader/runtime');


//时间戳转化方法
art.helper('dateFormat', function (date, format) {
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
});
//学科ID转化学科文本方法
art.helper('courseFormat', function (courseId) {
    var COURSES_ALL_MAP = {
        '1': '语文',
        '2': '数学',
        '3': '英语',
        '4': '物理',
        '5': '化学',
        '6': '生物',
        '7': '政治',
        '8': '历史',
        '9': '地理'
    };
    return COURSES_ALL_MAP[courseId];
});

//如果数据是空字符串或者null则显示 -
art.helper('nullFormat', function (val) {
    if (val) {
        return val;
    } else {
        return val === 0 ? val : '-';
    }
});

//分值为"-"和正常分值的返回值显示
art.helper('scorehtml',function(score){
    if(score=="-"){
        return score;
    }else{
        return score / 100;
    }
});

//计算显示字符串的长度
art.helper('strDisplayformat', function (string,maxLength) {
    var num = 0;
    var STR_NUMBER = maxLength? maxLength:30;
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
});
// 渲染下拉框
art.helper('getOptionFormat',function(value,data){
    if(!data){
        data = value;
        value = '';
    }
    var html="";
    for (var i = 0; i < data.length; i++) {
        if (data[i].name == value) {
            html += "<option value='"+data[i].id+"' selected='true'>"+data[i].name+"</option>";
        }else{
            html += "<option value='"+data[i].id+"'>"+data[i].name+"</option>";
        };
    };
    return html;
});
 //根据阿拉伯数字生成中文数字
art.helper('coverNum',function(number){
    if(isNaN(number - 0)){
        throw new Error('arg is not a number');
    }else if(number.length > 12){
        throw new Error('arg is too big');
    }
    var a = (number + '').split(''),
        s = [],
        t = this,
        chars = '零一二三四五六七八九',
        units = '个十百千万@#%亿^&~';
    for(var i = 0, j = a.length - 1;i <= j; i++){
        if(j == 1 || j == 5||j == 9){//两位数 处理特殊的 1*
            if(i == 0){
                if(a[i] != '1') s.push(chars.charAt(a[i]));
            }else{
                s.push(chars.charAt(a[i]));
            }
        }else{
            s.push(chars.charAt(a[i]));
        }
        if(i != j){
            s.push(units.charAt(j-i));
        }
    }
    //return s;
    return s.join('').replace(/零([十百千万亿@#%^&~])/g,function(m, d, b){//优先处理 零百 零千 等
        b = units.indexOf(d);
        if(b != -1){
            if(d == '亿') return d;
            if(d == '万')return d;
            if(a[j - b] == '0') return '零';
        }
        return '';
    }).replace(/零+/g, '零').replace(/零([万亿])/g,function(m, b){// 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
        return b;
    }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function(m){
        return {'@':'十','#':'百','%':'千','^':'十','&':'百','~':'千'}[m];
    }).replace(/([亿万])([一-九])/g, function(m, d, b, c){
        c = units.indexOf(d);
        if(c != -1){
            if(a[j - c] == '0') return d + '零' + b;
        }
        return m;
    });
});

//组卷次数，数目过多的时候显示为10万+等
art.helper('coverCount',function(num){
    var MAX_COUNT = 100000;
    if(num / MAX_COUNT > 1){
       return "10万+";
    }else{
        return num;
    }
});

//由{id:value,name:value}组成的数组，只显示由name字段组成的内容，用英文，分开
art.helper('onlyShowName',function(arr){
    if(!arr) return '无';
    var nameArr = [];
    for(var i = 0; i < arr.length; i++){
        if(arr[i].name){
            nameArr.push(arr[i].name);
        }
    }
    if(nameArr.length){
        nameArr = nameArr.join('，');
    }else{
        nameArr = '无';
    }
    return nameArr;
});
//由{id:value,name:value}组成的数组，只返回由id字段组成的内容，用,分开
art.helper('onlyIds',function(arr){
    if(!arr) return '无';
    var idArr = [];
    for(var i = 0; i < arr.length; i++){
        if(arr[i].id){
            idArr.push(arr[i].id);
        }
    }
    idArr = idArr.join(',');
    return idArr;
});
//存在就保留两位小数  不存在就显示'-'
art.helper('twoDecimal',function(num){
    if (num) {
        return num.toFixed(2);
    } else {
        return '-';
    }
});

//将html显示到input和textarea中,主要是&nbsp;和<br>的替换
art.helper('encodeDecodeToText', function(val){
    return decodeURI(encodeURI(val).replace(/(%3Cbr%3E)/g, "%0A").replace(/(&nbsp;)/g, "%20"));
});

//难易度的转变
art.helper('complexTransfor', function(type){
    if(!type) return '<span style="color:red;">缺少难易度</span>';
    if(type == 1){
        return '简单';
    }else if(type == 2){
        return '容易';
    }else if(type == 3){
        return '困难';
    }
});
//小数位转成百分比整数位
art.helper('floatToIntPercent', function(floatNum){
    return Math.round(floatNum * 100);
});