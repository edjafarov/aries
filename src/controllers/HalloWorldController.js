var http = require("http");

/**
 * Hello world Constructor, also could be used to initialize 
 * object before running controller.
 */
function HalloWorldController(req,res){
  
}

/**
 *@RequestMapping(value="/hello-world") 
 */
HalloWorldController.prototype.sayHallo = function(request, response){
	response.end("Hello world!");
};


HalloWorldController.prototype.commonModel = {
	head:{
		title:"aries-node: {hallo there!}"
	},
	topNavBar:{activeItem:null}
}

/**
 *@RequestMapping(value="/twitter") 
 */
HalloWorldController.prototype.twitter = function(request, response){
	this.commonModel.bodyPath = "/ejs/twitterExample.html";
	this.setView("/ejs/Layout.html", this.commonModel);	
	this.doNext(request, response);
};


/**
 *@RequestMapping(value="/twitter/tweets") 
 */
HalloWorldController.prototype.twitterFeed = function(request, response, twitId){
    var that = this;

	doTwitterCall(twitId, function(msg){
		var twitResponse = JSON.parse(msg);
		that.commonModel.head.title = "aries-node: {hallo "+ twitId +"!}";
		that.commonModel.bodyPath = "/ejs/twitterFeedExample.html";
		that.commonModel.twitResponse = twitResponse;
		that.commonModel.userId = twitId;
		that.setView("/ejs/Layout.html", that.commonModel);
		that.doNext(request, response);				
	})

};


/**
 *@RequestMapping(value="/twitter/{userId}") 
 */
HalloWorldController.prototype.twitterUser = function(request, response, userId){
    var that = this;

	doTwitterCall(userId, function(msg){
		var twitResponse = JSON.parse(msg);
		that.commonModel.head.title = "aries-node: {hallo "+ userId +"!}";
		that.commonModel.bodyPath = "/ejs/twitterFeedExample.html";
		that.commonModel.twitResponse = twitResponse;
		that.commonModel.userId = userId;
		that.setView("/ejs/Layout.html", that.commonModel);	
		that.doNext(request, response);				
	})

};



function doTwitterCall(userId, callback){
	http.get({
		host:"twitter.com",
		port:80,
		path:"/statuses/user_timeline.json?id="+userId
		},
		function(res){
			var resMsg = "";
			res.on("data", function(chunk){
				resMsg+=chunk;
			});
			res.on("end",function(){
				callback(resMsg);
			})
		});
}