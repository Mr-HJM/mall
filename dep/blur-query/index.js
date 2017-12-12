/*
  params 模糊查询的值 传递进来的 数组data 
  key 如果data数组里包含的是object
  return  返回查询到结果数组 data
 */
function isMatch(item,params){
   var pattern=new RegExp("["+params+"]","g");//查询模板
   if(pattern.test(item)){
   	return true
   }else{
   	return false
   }
}
module.exports=function(params,data,key){
	var newArray=[];
    for(var i=0;i<data.length;i++){
        if(typeof data[i]=="object"){
        	//一种是数组里 包含object
           if(!!isMatch(data[i][key],params)){
           	  newArray.push(data[i]);
           }
        }else{
           //一种是数组里包含的是除了object以外的值
          if(!!isMatch(data[i],params)){
           	  newArray.push(data[i]);
           }
        }
    }
    return newArray;
}