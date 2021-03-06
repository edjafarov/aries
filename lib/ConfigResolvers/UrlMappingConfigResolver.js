var fs = require('fs');
var path = require('path');

module.exports = function (cfg){
    var urlMappings = [];
    for(config in cfg.urlMappingConfig){
        urlMappings = jsonMerge(urlMappings, readConfig(path.join(cfg.appSrc, cfg.urlMappingConfig[config])));
    }
    
    return {urlMappings:urlMappings};
}

function readConfig(file){
        console.debug("Loading config file: " + file);
        var CFG_FILE = fs.readFileSync(file);
        console.debug("Parsing " + file + " config....\n\n");
        return JSON.parse(CFG_FILE);
    }
    
   
function jsonMerge(obj1,obj2){
    var obj3 = {};
    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}    