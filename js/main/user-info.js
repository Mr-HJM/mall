
var ajax = require('util/ajax');
var center = require('center-nav/center');
var noData = require('no-data/no-data.js');


var userInfo = {
    id: null,
	init: function(){
		var me = this;
		center.init(function(){});
        var storage = window.sessionStorage;
		me.id = storage["id"];
        me.getList();
	},
    clickEven: function(){
        var me = this;
    }
}

userInfo.init()
