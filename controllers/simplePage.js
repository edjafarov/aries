IO.import("./controllers/page");

/**
 *@class
 *@Controller 
 *@Model
 *@RequestMapping(value="/test")
 */
function simplePage(){
	this.title="simplePageTitle";
	this.content="Hallo ariesJs";
}

simplePage = ARIES.Extend(simplePage).by(page);

/**
* @RequestMapping(value="/tryIt/{dyna}/{gona}/{topa}")
*/
simplePage.prototype.init = function (/**@test*/ response, dyna, request, /**@test1*/ topa, gona) {
	var form = ["<form action='/tryIt/rrr/ttt/yyy' method='post'>",
	"<input type='hidden' name='field1' value='this ia hidden field'/> <input name='field2' type='text' value=''/><input type='submit'/></form>"].join('');
	this.content="Hallo Dude! this Is dynamic test: "+dyna +" be nice with " + topa +" because "+gona + form;

};

