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

/**
 *@RequestMapping(value="/twitter") 
 */
HalloWorldController.prototype.twitter = function(request, response){
    this.setView("/ejs/Layout.html",
	{
	head:{
		title:"aries-node: {hallo there!}"
		},
	bodyPath:"/ejs/twitterExample.html",
	topNavBar:{activeItem:null}
	});	
	this.doNext(request, response);
};


/**
 *@RequestMapping(value="/twitter/tweets") 
 */
HalloWorldController.prototype.twitterFeed = function(request, response, twitId){
    var that = this;

	doTwitterCall(twitId, function(msg){
		var twitResponse = JSON.parse(msg);
				
		that.setView("/ejs/Layout.html",
		{
		head:{	
			title:"aries-node: {hallo "+ twitId +"!}"
			},
		bodyPath:"/ejs/twitterFeedExample.html",
		topNavBar:{activeItem:null},
		twitResponse:twitResponse,
		userId:twitId
		});	
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
				
		that.setView("/ejs/Layout.html",
		{
		head:{	
			title:"aries-node: {hallo "+ userId +"!}"
			},
		bodyPath:"/ejs/twitterFeedExample.html",
		topNavBar:{activeItem:null},
		twitResponse:twitResponse,
		userId:userId
		});	
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