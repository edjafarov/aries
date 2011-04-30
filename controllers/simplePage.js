

IO.import("./controllers/page");
/**
 *@Controller 
 */
function simplePage(){
	this.title="simplePageTitle";
	this.content="Hallo ariesJs";
}

simplePage = ARIES.Extend(simplePage).by(page);

/**
*@RequestMapping(value="/simplePage")
*/
simplePage.prototype.init = function () {
	return "test";
};

