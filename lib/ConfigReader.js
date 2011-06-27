var fs = require('fs');

module.exports = function (APP_CFG_PATH){
    console.log("Loading config defaults");
    var defaults = readConfig("./lib/default.json");
    console.log("Loading app config");
    var appSpecific = readConfig(APP_CFG_PATH + "app.json");
    var cfg = jsonMerge (defaults, appSpecific);
    if(cfg.configResolvers){
        for(resolver in cfg.configResolvers){
            cfg = jsonMerge (cfg, require(cfg.configResolvers[resolver])(cfg));
        }   
    }
    return cfg;
}

/**
 * Reads configuration file
 */
function readConfig(file){
        console.debug("Loading config file: " + file);
        var CFG_FILE = fs.readFileSync(file);
        console.debug("Parsing " + file + " config....\n\n");
        return JSON.parse(CFG_FILE.toString().replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//ig,""));
    }
    
    
function jsonMerge(obj1,obj2){
    var obj3 = {};
    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}