/**
 * Created by Lanxumit on 2016/5/27.
 */
var $ = require('jquery');

//pop add pic success

var _callback = null, _ele = null,_mes = null;
var message = {
    style: {
        opacity:1,
        top:"20px",
        width:"250px",
        height:"30px",
        marginLeft:"-125px"
    },
    speed:500,
    init:function(){
        var me = this;
        this.addPop();
        this.popMess();
    },
    an_callback:function(call){
        var me = this;
        setTimeout(function(){
            //$('.pop-message').fadeOut();
            $(".pop-message").remove();
            if(call){
                call();
            }

        },2000);
    },
    popMess:function(){
        var me = this;
        $('.pop-message').animate(me.style,me.speed,function(){me.an_callback(_callback)});
    },
    addPop:function(){
        var me = this;
        var html ='<div class="pop-message">'+_mes+'</div>';
        $(_ele).css('position','relative').append(html);
        if(_ele =='body'||_ele==''){
            $('.pop-message').css({"position":"fixed","top":"230px"});
            me.style.top = "250px";
        }
    }

};
module.exports = {
    /**
     * ele:parent盒子
     * mes:要弹出的消息
     * callback:回调函数
     * 说明：参数可全部省略，或者直接写回调
     * */
   popMess:function(ele,mes,callback){
        if(typeof(ele) === 'function'){
            _callback = ele;
            _ele = 'body';
            _mes= '添加成功';
        }else{
            if(typeof(mes) === 'function'){
                _callback = mes;
                _ele = ele;
                _mes='添加成功';
            }else{
                _ele = ele||'body';
                _mes= mes|| '添加成功';
                _callback = callback || null ;
            }
        }
       message.init();
   }
};
