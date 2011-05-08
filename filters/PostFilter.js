
function PostFilter(){
	
}

PostFilter = ARIES.Extend(PostFilter).by(EventEmitter);

PostFilter.prototype.filter=function(request,response){
	console.debug("Post filter filtering");
	var content="";
	if (request.method === "POST") {
		that=this;
		      request.on('data', function (POST) {
		    	  content+=POST;      
		      });
		      request.on('end', function(){
		    	  var parsedPost=querystring.parse(content);
		    	  if(!request.params){
		    		  request.params={};
		    	  }
		    	  for(param in parsedPost){
		    		  request.params[param]=parsedPost[param];
		    	  }
		    	  that.emit("end",request, response);
		      });
	}else{
		this.emit("end",request, response);
	}
};

