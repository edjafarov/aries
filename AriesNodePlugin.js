
var Zparse = require('./zparse.js');
var Implementation = require('./implementation.js');

var parser = new Zparse(Implementation);


module.exports = {
		renderView:function(){
			parser.parse(this.view);
			var output = parser.process(this);
			return output;
		}
}