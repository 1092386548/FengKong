angular.module('fkliving.services',[])

.factory('CachedUser', function() {
    var userInfo = {};

    return {
      	save: function(j) {
        	for (var k in j) {
          		window.localStorage[k] = userInfo[k] = j[k];
        	};
        	return userInfo;
      	},

      	remove: function(f) {
        	if (f.constructor == Array) {
          	for (var i = 0; i < f.length; i++) {
            	window.localStorage.removeItem(f[i]);
          	}
        	}
        	window.localStorage.removeItem(f);
      	},

      	add: function(k, v) {
        	window.localStorage[k] = userInfo[k] = v;
      	},

      	addLong: function(k, v) {
        	window.localStorage[k] = v;
      	},

      	l: window.localStorage
    };
})

.factory('GetParams',function(){
	return {
		UrlSearch:function (){
	        var name,value;
	        var str=location.href;
	        var num=str.indexOf("?");
	        str=str.substr(num+1);
	        var arr=str.split("&");
	        for(var i=0;i < arr.length;i++){
	            num=arr[i].indexOf("=");
	            if(num>0){
	                name=arr[i].substring(0,num);
	                value=arr[i].substr(num+1);
	                this[name]=value;
	            }
	        }
	    }
	}
})