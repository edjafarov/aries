function SourceBuilder(className, source){
            var changedSource=source;
            return {
                addPublicMethod:function(method, context){
                        var strigifiedMethod=method.toString();
                        for(va in context){
                            //TODO: potentially buggable
                                var regX=new RegExp(va, "g");
                                strigifiedMethod=strigifiedMethod.replace(regX,context[va]);
                            }
                        var methodName=strigifiedMethod.match(/function\s*(.*?)\s*\(/)[1];
                        changedSource=[changedSource, "\n", className , ".prototype.",
                        methodName,"=", strigifiedMethod,"\n"].join("");
                        return this;
                },
                addStaticMethod:function(method,context){
                        var strigifiedMethod=method.toString();
                        for(va in context){
                            //TODO: potentially buggable
                                var regX=new RegExp(va, "g");
                                strigifiedMethod=strigifiedMethod.replace(regX,context[va]);
                            }                        
                        var methodName=strigifiedMethod.match(/function\s*(.*?)\s*\(/)[1];
                        changedSource=[changedSource, "\n", className , ".",
                        methodName,"=", strigifiedMethod,"\n"].join("");
                        return this;                    
                    },
                    replaceContext:function(method, context){
                        var strigifiedMethod=method.toString();
                        for(va in context){
                            //TODO: potentially buggable
                                var regX=new RegExp(va, "g");
                                strigifiedMethod=strigifiedMethod.replace(regX,context[va]);
                            }
                            return strigifiedMethod;
                        }
                ,
                    toString:function(){
                       return changedSource;
                }
            }
        };
