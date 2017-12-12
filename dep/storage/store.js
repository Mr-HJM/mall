/**
 * Created by hui on 2016/11/23 0023.
 */
(function(root,factory){

    if(typeof define === 'function' && define.amd){
        define(['store'],factory);
    }else{
        root.storage = factory(root.store);
    }

})(this,function(store){
    //超时时间为25分钟
    /*var overTime = 25 * 60 * 1000;*/
    return {
        get:function(key){
            /*var data = store.get(key);
             if(!data){
             return null;
             }
             var currentTime = new Date().getTime();
             if(data.time + overTime < currentTime){
             return null;//TODO----可以考虑做一个清除
             }else{
             this.set(key,data.data);
             return data.data;
             }*/
            return store.get(key);
        },
        set:function(key,val){
            /*store.set(key,{
             time:new Date().getTime(),
             data:val
             });*/
            store.set(key,val);
        },
        getPermanent:function(key){
            return store.get(key);
        },
        setPermanent:function(key,value){
            store.set(key,value);
        },
        clear:function(){
            store.clear();
        },
        remove:function(key){
            if(key){
                store.remove(key);
            }
        }
    };
});