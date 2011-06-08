function GetFilterNew(){}
GetFilterNew.prototype.filter=function(request,response){

    console.debug("Get filter filtering");
    response.write("Get filter filtering");
	  var parsedGet=require('url').parse(request.url, true).query;
	  if(!request.params){
		  request.params={};
	  }	
	  for(param in parsedGet){
		  request.params[param]=parsedGet[param];
	  }
 
	this.doNext(request,response);
}

