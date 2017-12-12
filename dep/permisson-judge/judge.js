var ajax = require('util/ajax');
var config = require('config');
/*
 userId：用户登录的userId值
 json:用户传递的比对json文件内容
 cb：回调函数
 */
module.exports = function (userId, json, cb, flag) {
    ajax({
        url: config.URL.AUTHORIZATION,
        data: {
            userId: userId
        }
    }).then(function (data) {
        var permissionList = [];
        if (data.status == "200" && data.data != null && data.data['菜单编码']) {
            permissionList = data.data["菜单编码"].split(";");
            if (!!permissionList) {
                for (var i = 0, cont = json.length; i < cont; i++) {
                    for (var j = 0, perCont = permissionList.length; j < perCont; j++) {
                        if (json[i]["permissions"] == permissionList[j]) {
                            json[i]["isShow"] = true;//一
                            if (json[i]["sublistname"]) {//二
                                var two_menu_info = json[i]["sublistname"];
                                for (var k = 0, subCont = two_menu_info.length; k < subCont; k++) {
                                    var three_menu_info=two_menu_info[k]["sublistname"]?two_menu_info[k]["sublistname"]:'';
                                    loop(permissionList,two_menu_info[k]);
                                    if(!!three_menu_info){
                                        for(var m=0,len=three_menu_info.length;m<len;m++){
                                            loop(permissionList,three_menu_info[m])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (!!cb) {
            cb(json,permissionList);//回调函数
        }
    }).fail(function(data){
        if (!!cb) {
            cb(json,permissionList);//回调函数
        }
    });
}
function loop(permissionList,menu_info) {
    for (var x = 0, perLen = permissionList.length; x < perLen; x++) {
        if (permissionList[x] == menu_info["permissions"]) {
            menu_info["isShow"] = true;
        }
    }
}