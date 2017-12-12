/**
 * Created by Tom on 2016/05/09
 */

module.exports = {
	URL:{
		SSO_LOGIN:'http://223.202.64.204:50901/login',//单点登录
        SSO_LOGOUT:'http://223.202.64.204:50901/logout',//单点退出
        INDEX:'http://127.0.0.1:9020/html/index.html',//人人通首页
        CHECK_LOGIN:'http://223.202.64.204:50934/',//检查是否登陆及得到登陆信息
        SETUSER:'http://223.202.64.204:50934/setuser.jsp',//设置登录
        APP:'http://223.202.64.204:50713/',//应用的请求地址
        RES:'http://221.228.242.4:8007/index.html',//资源的请求地址
        UPLOAD:'http://223.202.64.204:50951/files',//上传文件地址
        RESTFUL:'http://223.202.64.204:50932',
		FOOTERTYPE:2,//1是张家港，2是通配
		STATISTICS:0,//0是不显示，1是显示
        COURSE:0//0是不显示，1是显示
	},
	APP:{
		ISWX:true
    },
	APPEXISTS:false,//张家港显示，无锡、黄冈不显示
	ISPINGCETASK:false
};
