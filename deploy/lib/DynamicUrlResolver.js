function DynamicUrlResolver() { //cacheble dynamic low perfomance
    var cache = {};
    var cachedRegexp;

    function precache(urlMappings) {
        // cache regular expressions for all urls in urlMappings
        if (!cachedRegexp) {
            cachedRegexp = {};
            var regxp = new RegExp("\{(\\w+?)\}", "g");
            for (configUrl in urlMappings) {
                var regexpConfig = urlMappings[configUrl];
                //If we got some {dynamics} in url
                var matchRes = configUrl.match(regxp);
                regexpConfig.autoDynaMap = {};
                if (matchRes) {
                    for (var i = 0; i < matchRes.length; i++) {
                        for (var j = 0; j < regexpConfig.arguments.length; j++) {
                            if (regexpConfig.arguments[j].name == matchRes[i].replace(/(\{|\})/g, "")) {
                                regexpConfig.autoDynaMap[i] = j;
                            }
                        }
                    }
                }
                for (var j = 0; j < regexpConfig.arguments.length; j++) {
                    if (regexpConfig.arguments[j].name.toLowerCase() == "request") {
                        regexpConfig.autoDynaMap["request"] = j;
                    }
                    if (regexpConfig.arguments[j].name.toLowerCase() == "response") {
                        regexpConfig.autoDynaMap["response"] = j;
                    }
                }
                
                
                //change {} -> () to fit regexp pattern
                cachedRegexp[configUrl.replace(regxp, "(\\w+?)")] = regexpConfig;
                
            }
        }
    }

    precache(CFG.urlMappings);
    
    return {
        bindReq: function (resolved, request, response) {
            if (resolved.autoDynaMap) {
                resolved.resolvedArguments[resolved.autoDynaMap["request"]] = request;
                resolved.resolvedArguments[resolved.autoDynaMap["response"]] = response;
            }
            return resolved;
        },
        resolve: function (request, response) {
            var urlObj = urlModule.parse(request.url, true);
            var url = urlObj.pathname;
            var resolved = null;
            if (cache[url]) {
                return this.bindReq(cache[url], request, response);
            }

            for (configUrl in cachedRegexp) {
                var resolveMatch = url.match(new RegExp("^" + configUrl + "/?$"));
                if (resolveMatch) {
                    resolved = cachedRegexp[configUrl];
                    resolved.resolvedArguments = [];
                    for (var k = 1; k < resolveMatch.length; k++) {
                        resolved.resolvedArguments[resolved.autoDynaMap[k - 1]] = resolveMatch[k];
                    }
                }
            }
            if (!resolved) return null;
            cache[url] = resolved;
            return this.bindReq(resolved, request, response);
        },
        get: function (url) {
            var config = this.resolve(url);
            if (!config) throw new Error("couldNot resolve this URL: " + url);
            return config.inFile;
        }
    }
}