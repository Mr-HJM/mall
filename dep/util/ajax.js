/**
 * Created by YU on 2016/2/18.
 */
var Q = require('q');
var $ = require('jquery');
var CONFIG=require('config');
$.ajaxSetup({cache: false});

module.exports = function(opt){
    return Q.promise(function(resolve, reject, notify){
        $.ajax({
            url: opt.url,
            data: opt.data || {},
            dataType: opt.dataType || 'json',
            headers: opt.headers || {},
            type: opt.type || 'get',
            success: function (data,textStatus,jqXHR) {
                delete jqXHR.then;
                if(data.status == '401'){
                    //未登录 或者登录超时
                    location.href =CONFIG.URL.SSO_LOGIN+"?service="+CONFIG.URL.INDEX;
                    return;
                }
                resolve.apply(null, arguments);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                delete jqXHR.then;
                reject.apply(null, arguments);
            }
        });
    });
};