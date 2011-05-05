

IO.import("./controllers/page");
/**
 *@Controller 
 * @RequestMapping(value="/test")
 */
function simplePage(){
	this.title="simplePageTitle";
	this.content="Hallo ariesJs";
}

simplePage = ARIES.Extend(simplePage).by(page);

/**
* @RequestMapping(value="/tryIt/{dyna}/{gona}/{topa}")
*/
simplePage.prototype.init = function (response,dyna, request, topa, gona) {
	this.content="Hallo Dude! this Is dynamic test: "+dyna +" be nice with " + topa +" because "+gona;
};

