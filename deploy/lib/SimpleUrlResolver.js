function SimpleUrlResolver (){//cacheble
	var cache={};
	return {
		resolve:function(request, response){
            var urlObj = urlModule.parse(request.url, true);
            var url = urlObj.pathname;
			var resolved;
            if(cache[url]) {
                resolved = cache[url];
            }else{
                resolved = CFG.urlMappings[url];
                if(!resolved) return null;
			    cache[url]=resolved;
            }
            resolved.resolvedArguments = [request, response];
			return resolved;
		},
		get:function(url){
			var config=this.resolve(url);
			if(!config) throw new Error("couldNot resolve this URL: " + url);
			return config.inFile;
		}
	};
}