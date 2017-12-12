/**
 * Created by Lanxumit on 2016/7/7.
 */
var WebUploader = require('web-uploader');

var UploaderUtil, uploaderList = [],_hideClass = "webuploader-element-invisible";

//上传类型
var accepts = {
    'pic':{
        extensions:"gif,jpg,jpeg,bmp,png",
        mimeTypes:".gif,.jpg,.jpeg,.bmp,.png"
    },
    'video':{
        extensions:"avi,rmvb,mpg,mpeg,mp4,swf,wmv,flv",
        mimeTypes:".avi,.rmvb,.mpg,.mpeg,.mp4,.swf,.wmv,.flv"
    }

};

UploaderUtil ={
   init:function(_opt){
       if(!WebUploader.Uploader.support()){
           var result = window.confirm('抱歉，当前页面的上传技术不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
           if(result){
               location.href = 'http://www.adobe.com/support/flashplayer/downloads.html';
           }
           throw new Error( 'WebUploader does not support the browser you are using.' );
       }

       var isStop =false;
       var uploader = WebUploader.create({
           swf: '../../bundle/js/Uploader.swf',
           server:  _opt.uploadUrl,
           fileVal: _opt.fileName,
           pick: {
               id: _opt.pickId,
               innerHTML : _opt.innerHTML,
               multiple: !!_opt.multiple
           },
           // runtimeOrder:'flash',
           auto: true,
           fileNumLimit: _opt.fileNumLimit,
           method :'POST',
           formData: _opt.formData || {},
           accept:[_opt.accept],
           fileSingleSizeLimit:_opt.fileSingleSizeLimit
       });
       var _id = uploaderList.push({
               url:'',
               isStop:false,
               uploader:uploader
           }) - 1;
       this.bindEvent(_id, 'error', function (code) {

           switch (code) {
               case 'Q_EXCEED_NUM_LIMIT':
                   alert('超出队列长度，请减少选中的文件数量。');
                   isStop = true;
                   break;
               case 'Q_EXCEED_SIZE_LIMIT':
                   alert('选中文件的总大小超过指定上限，请减少大小后继续上传。');
                   break;
               case 'Q_TYPE_DENIED':
                   alert('文件类型不满足条件，请上传正确的文件。');
                   break;
           }

       });
       this.bindEvent(_id,'uploadStart', function(file){
           if(isStop){
               uploader.stop(true);
               uploader.reset();
               uploaderList[_id].isStop = true;
               isStop = false;
               return;
           }
       });
       return _id;
   },
    hide: function ($el) {
        $el.addClass(_hideClass);
    },
    show: function ($el) {
        $el.removeClass(_hideClass);
    },
    addUploadBtn: function (pickId, _id) {
        var uploader = this.isCanUpload(_id);
        uploader.addButton({
            id: pickId
        });
    },
    upload: function (_id) {
        var uploader = this.isCanUpload(_id);
        uploader.upload();
    },
    isCanUpload: function (_id) {
        var uploader = uploaderList[_id].uploader;
        if (!uploader) {
            throw new Error('没有初始化uploader对象！');
        }
        return uploader;
    },
    //绑定事件
    bindEvent: function (_id, _event, callback,_scope) {
        var uploader = this.isCanUpload(_id);
        if(_scope){
            uploader.on(_event, function(){
                return callback.apply(_scope,arguments);
            });
        }else{
            uploader.on(_event, callback);
        }

    },
    reset: function (_id) {
        var uploader = this.isCanUpload(_id);
        uploader.reset();
        // console.log(uploader.getFiles());
    },
    stop: function(_id){
        var uploader = this.isCanUpload(_id);
        uploader.stop(true);
    },
    setStop: function(_id){
        uploaderList[_id].isStop = false;
    },
    removeFile: function (_id,file) {
        var uploader = this.isCanUpload(_id);
        uploader.removeFile(file,true);
    },
    destroy:function(_id){
        var uploader = this.isCanUpload(_id);
        uploader.destroy();
    }
};
module.exports = {
    //按钮的样式 是覆盖 webuploader-pick class来的。
    init: function (opt) {
        return UploaderUtil.init(opt);
    },
    /**
     * 隐藏上传区域
     * @param $el jquery元素，代表上传区域
     */
    hideUploader: function ($el) {
        UploaderUtil.hide($el);
    },
    /**
     * 显示上传区域
     * @param $el jquery元素，代表上传区域
     */
    showUploader: function ($el) {
        UploaderUtil.show($el);
    },
    /**
     * 指定接受哪些类型的文件
     * @returns {{}}
     */
    getAccept: function () {
        return accepts;
    },
    /**
     * 对于同一个上传组件添加多个对应的上传按钮
     * @param pickId 新初始化按钮的 id
     * @param _id init初始化返回的标记
     */
    addUploadBtn: function (pickId, _id) {
        UploaderUtil.addUploadBtn(pickId, _id);
    },
    /**
     * 手动上传开始
     * @param _id
     */
    upload: function (_id) {
        UploaderUtil.upload(_id);
    },
    /**
     * 重置队列
     * @param _id
     */
    reset: function (_id) {
        UploaderUtil.reset(_id);
    },
    /*停止上传*/
    stop:function(_id){
        UploaderUtil.stop(_id);
    },
    /*移除文件*/
    removeFile: function (_id,file) {
        UploaderUtil.removeFile(_id,file);
    },
    /*销毁实例*/
    destroy:function(_id){
        UploaderUtil.destroy(_id);
    },
    //event类型
    getEvents: function () {
        return {
            //当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列。
            'BEFORE_FILE_QUEUED': 'beforeFileQueued',
            //当文件被加入队列以后触发。
            'FILE_QUEUED': 'fileQueued',
            //当一批文件添加进队列以后触发
            'FILES_QUEUED': 'filesQueued',
            //文件开始上传前触发，一个文件只会触发一次
            'UPLOAD_START': 'uploadStart',
            //当开始上传流程时触发。
            'START_UPLOAD': 'startUpload',
            //上传过程中触发，携带上传进度。
            'UPLOAD_PROGRESS': 'uploadProgress',
            //当文件上传出错时触发。
            'UPLOAD_ERROR': 'uploadError',
            //当文件上传成功时触发。
            'UPLOAD_SUCCESS': 'uploadSuccess',
            //不管成功或者失败，文件上传完成时触发。
            'UPLOAD_COMPLETE': 'uploadComplete',
            //当validate不通过时，会以派送错误事件的形式通知调用者。
            'ERROR': 'error',
            //当 uploader 被重置的时候触发。
            'RESET':'reset',
            //当开始上传流程暂停时触发。
            'STOP_UPLOAD':'stopUpload',
            //当所有文件上传结束时触发。
            'UPLOAD_FINISH':'uploadFinished'
        }
    },
    on:function(_id,event,callback,_scope){
        UploaderUtil.bindEvent(_id,event,callback,_scope);
    },
    getUrl:function(_id){
        return uploaderList[_id].url;
    },
    isStop:function(_id){
        return uploaderList[_id].isStop;
    },
    setStop:function(_id){
        UploaderUtil.setStop(_id);
    }
};
