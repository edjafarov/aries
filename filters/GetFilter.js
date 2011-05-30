function GetFilter(){

}

GetFilter = ARIES.Extend(GetFilter).by(EventEmitter);

GetFilter.prototype.filter=function(request,response){
    console.debug("Get filter filtering");
	  var parsedGet=require('url').parse(request.url, true).query;
	  if(!request.params){
		  request.params={};
	  }	
	  for(param in parsedGet){
		  request.params[param]=parsedGet[param];
	  }
	this.emit("end",request, response);
};
