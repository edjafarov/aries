function PostFilterNew(){}
PostFilterNew.prototype.filter=function(request,response){

    console.debug("Post filter filtering");
    response.write("POST filter filtering");
	var content="";
	if (request.method === "POST") {
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
		    	  this.doNext(request,response);
		      });
	}else{
   
		this.doNext(request,response);
	}
};

