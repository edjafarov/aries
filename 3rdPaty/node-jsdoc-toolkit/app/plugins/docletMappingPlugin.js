
JSDOC.PluginManager.registerPlugin(
    "JSDOC.docletMappingPlugin",
    {
        onSymbol : function(symbol) {
			var mappingObject={};
			
			var getRequestMappingObj=new RegExp("@RequestMapping\s*(.*)")
			var matchResult=symbol.comment.toString().match(getRequestMappingObj);
			if(matchResult!=null){
				var CFG_FILE = IO.readFile("./app-cfg/auto-urlmapping.json");
				var CFG=JSON.parse(CFG_FILE);
				if(!CFG) CFG=[];
				var getMappingValue=new RegExp("value=(\"|')(.*?)(\"|')");
				mappingObject.mappingUrl=matchResult[1].match(getMappingValue)[2];
				mappingObject.mappingFunction=symbol._name;
				mappingObject.arguments=symbol.$args[1];
				mappingObject.inFile=symbol.srcFile;
				CFG.push(mappingObject);
				IO.saveFile("./app-cfg/","auto-urlmapping.json",JSON.stringify(CFG));
				console.log(JSON.stringify(CFG));
				console.log("******\n");
			}
			
        }
    }
);