function SimpleUrlResolver (){//cacheble
	var cache={};
	return {
		resolve:function(url){
			if(cache[url]) return cache[url];
			var resolved = urlMappings[url];
			if(!resolved) return null;
			cache[url]=resolved;
			return resolved;
		},
		get:function(url){
			var config=this.resolve(url);
			if(!config) throw new Error("couldNot resolve this URL: " + url);
			return config.inFile;
		}
	};
}