exports.filter = function(request, response){
	if(request.url.indexOf("favicon")!=-1){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end("200");
		console.log(request.url + " is filtered out");
		return false;
	}
	console.log(request.url + " is filtered");
}