/**
 * Created by hui on 2016/12/28 0028.
 */
var  noDataTpl=require("./no-data.tpl");
/*
* data 没有数据需要填写的提示内容
* */
module.exports=function(data){
   return noDataTpl(data);
};