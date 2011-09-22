/**
 * Hello world Constructor, also could be used to initialize 
 * object before running controller.
 */
function HalloWorldController(req,res){
  
}

/**
 *@RequestMapping(value="/hello-world") 
 */
HalloWorldController.prototype.sayHallo = function(request, response){
	response.end("Hello world!");
};

