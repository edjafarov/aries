	
function DynamicUrlResolver(){//cacheble dynamic low perfomance
	var cache={};
	var cachedRegexp;
	return {
		resolve:function(url){
			var resolved=null;
			if(cache[url]) return cache[url];
			if(!cachedRegexp){
				cachedRegexp={};
				var regxp=new RegExp("\{(\\w+?)\}","g");
				for(configUrl in urlMappings){
					var regexpConfig=urlMappings[configUrl];
					var matchRes=configUrl.match(regxp);
					if(matchRes){
					regexpConfig.autoDynaMap={};
					for(var i=0;i<matchRes.length;i++){
						for(var j=0;j<regexpConfig.arguments.length;j++){
							if(regexpConfig.arguments[j].name == matchRes[i].replace(/(\{|\})/g,"")){
								regexpConfig.autoDynaMap[i]=j;
							}
						}
					}}
					cachedRegexp[configUrl.replace(regxp,"(\\w+?)")]=regexpConfig;
				}
			}
			
			for(configUrl in cachedRegexp){
				var resolveMatch=url.match(new RegExp("^" + configUrl + "/?$"));
				
				if(resolveMatch){
					resolved =cachedRegexp[configUrl];
					resolved.argumentsToPass=[];
					for(var k=1;k<resolveMatch.length;k++){
						resolved.argumentsToPass[resolved.autoDynaMap[k-1]]=resolveMatch[k];
					}
				}
			}
			if(!resolved) return null;
			cache[url]=resolved;
			return resolved;
		},
		get:function(url){
			var config=this.resolve(url);
			if(!config) throw new Error("couldNot resolve this URL: " + url);
			return config.inFile;
		}
	}
}