/**
 * Created by Lanxumit on 2017/3/18.
 */

var tpl = require('./tpl/pop-alert');
var _data,_btnType;
var popAlert ={
    isInitBtn:false,
    renderHtml:function(){
        $('.pop-alert').html(tpl());
    },
    showPop:function(){
        $(".pop-mask").show();
        $('.pop-alert').css({width: "360px", height: "280px", margin: "-140px 0px 0px -180px"}).show();
    },
    initHtml:function(){
        var me = this,$el;
        me.renderHtml();
        $el = $('.pop-alert');
        $el.find('i').addClass(_data.type);
        $el.find('.ok').html(_data.sureN);
        $el.find('.cancel').html(_data.cancelN);
        $el.find('.reps-content').html(_data.content);
        $el.find('.reps-title').html(_data.title);

        if(_btnType == 'sure'){
            $el.find('.cancel').remove();
        }else if(_btnType == 'cancel'){
            $el.find('.ok').remove();
        }
        me.showPop();
        if(!me.isInitBtn){
            me.isInitBtn = true;
            me.initBtns();
        }

    },
    initBtns:function(){
        $('.pop-alert').delegate('.reps-close,.cancel','click',function(){
            $(".pop-mask,.pop-alert").hide();
            !!_data.cancelCallback ? _data.cancelCallback() : '';
        });
        $('.pop-alert').delegate('.ok','click',function(){
            $(".pop-mask,.pop-alert").hide();
            !!_data.callback ? _data.callback() : '';
        });
    }
};
/**
 * @params content 弹出消息内容  *
 * @params type 类型(success成功 fail失败 warn警告 none隐藏)
 * @params sureN 确定按钮实际显示
 * @params cancelN   取消按钮实际显示
 * @params callback 点击确定后的回调
 *@params cancelCallback 点击取消后的回调
 * **/
module.exports={
    initDouble:function(content,type,callback,sureN,cancelN,title,cancelCallback){
        _data = {};
        _data.type = type;
        _data.content = content;
        _data.sureN = sureN || '确定';
        _data.cancelN = cancelN || '取消';
        _data.callback = callback;
        _data.title = title;
        _data.cancelCallback = cancelCallback;
        _btnType = 'double';
        popAlert.initHtml();
    },
    initSure:function(content,type,callback,sureN,title){
        _data = {};
        _data.type = type;
        _data.content = content;
        _data.sureN = sureN || '确定';
        _data.callback = callback;
        _data.title = title;

        _btnType = 'sure';
        popAlert.initHtml();
    },
    initCancel:function(content,type,callback,cancelN,title){
        _data = {};
        _data.type = type;
        _data.content = content;
        _data.cancelN = cancelN || '取消';
        _data.callback = callback;
        _data.title = title;

        _btnType = 'cancel';
        popAlert.initHtml();
    },
    getType:{
        SUCCESS:'success',
        WARN:'warn',
        FAIL:'fail',
        NONE:"none",
        ERROR:'error'
    }
};