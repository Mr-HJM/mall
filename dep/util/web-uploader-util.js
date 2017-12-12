/**
 * fudapeng
 * 2016-03-21
 */


require('web-uploader/../webuploader.less');

module.exports = {
    init:function(_cb,_scope){
    	require.ensure(['web-uploader'],function(require){
		var WebUploader = require('web-uploader');

        if ( !WebUploader.Uploader.support() ) {
            var result = window.confirm('抱歉，当前页面的上传技术不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
            if(result){
                location.href = 'http://www.adobe.com/support/flashplayer/downloads.html';
            }
            throw new Error( 'WebUploader does not support the browser you are using.' );
        }
        _cb.call(_scope || null, WebUploader);

	},'web-uploader-trunk');
    }
}