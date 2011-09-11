var fs=require("fs");
var vm=require("vm");
var util = require('util');
/**
 * This is basic Classloader with caching compiled copies of scripts
 * Allows to run scripts with dependencies in more comfortable way for FrontEnd developers
 * Keeps javascript classes simple and usable on front end
 * Features:
 * # add dependencies with IO.import([path to dependancy from root directory]);
 * # deploy precompiled scripts including dependancy in ./deploy folder
 * # cache scripts
 * # set any context for scripts
 * #TODO: default modules support
 * to keep track of errors and 
 */

function ClassLoader() {
    var DEPLOY_PATH = "./deploy/";
    var scripts = {};
    var classes = {};
    /**
     * TODO: create utils for writing/deleting directories and files
     */

    function writeFile(path, source) {
        var dirArray = path.split("/");
        var partialPath = "";
        for (var i = 0; i < dirArray.length - 1; i++) {
            partialPath += dirArray[i] + "/";
            try {
                fs.statSync(partialPath);
                if (!fs.statSync(partialPath).isDirectory()) {
                    throw new Error(partialPath + "is not directory");
                }
            }
            catch (e) {
                fs.mkdirSync(partialPath, 0755);
            }
        }
        partialPath += dirArray[dirArray.length - 1];
        fs.openSync(partialPath, 'w+');
        fs.writeFileSync(partialPath, source);
    }
    var natives = process.binding('natives');

    function checkNative(moduleName) {
        return (moduleName in natives);
    }
    return {
        clearDeploy: function() {
            //TODO: write recursive directory clearing
        },
        buildJsSource: function(source) {
            // TODO: generalize following regexp
            var importRegexp = /IO.import\("(.*?)"\)/g;
            var importArray = source.match(importRegexp);
            if (importArray) {
                for (var i = 0; i < importArray.length; i++) {
                    var pathToImport = importArray[i].split('"')[1];
                    if (checkNative(pathToImport)) {
                        source = source.replace('IO.import("' + pathToImport + '");', 
                        'require("' + pathToImport + '")\n');
                    }
                    else {
                        source = source.replace('IO.import("' + pathToImport + '");',
                        '/* look_at_the_bottom_imported '+pathToImport+'  */');
                        
                        source = source + '/**** imported '+pathToImport+ ' ****/\n' + 
                        this.loadJsSource(pathToImport + ".js") + 
                        '/**** imported END '+pathToImport+ ' ****/\n';

                    }
                }
            }
            return source;
        },
        loadJsSource: function(path) {
            var source = fs.readFileSync(path).toString();
            source = this.buildJsSource(source);
            return source;
        },
        getScriptFromSource: function(source, path /*optional*/ ) {
            if (path) {
                if (!scripts[path]) {
                    source = this.buildJsSource(source);
                    writeFile(path.replace(/\.\//, DEPLOY_PATH), source);
                    scripts[path] = vm.createScript(source, path);
                }
                return scripts[path];
            }
            return vm.createScript(this.buildJsSource(source), "dynamic [getScriptFromSource]");
        },
        getScript: function(path) {
            if (!scripts[path]) {
                var generatedSource = this.loadJsSource(path);
                writeFile(path.replace(/\.\//, DEPLOY_PATH), generatedSource);
                scripts[path] = vm.createScript(generatedSource, path);
            }
            return scripts[path];
        },
        getClassFromContext: function(path, context) {
            var className = this.getClassName(path);
            if (!context[className]) {
                this.getScript(path).runInContext(context);
            }
            if (!context[className]) {
                throw new Error("Can not find " + className + " in " + path);
                return false;
            }
            return context[className];
        },
        getClass: function(path, context) {
            if (!classes[path]) {
                this.getScript(path);
                if (!context) {
                    context = {
                        console: console,
                        require: require,
                        util: util
                    };
                }
                scripts[path].runInNewContext(context);
                var className = this.getClassName(path);
                classes[path] = context[className];
            }
            return classes[path];
        },
        getClassName: function(path) {
            return path.split("/")[path.split("/").length - 1].replace(/\.js/, "");
        }
    };
}
module.exports = new ClassLoader();