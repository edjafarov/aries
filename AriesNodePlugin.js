
var parser = new ZParse(Implementation);

ARIES.Plugins["AriesNode"]={
		renderView:function(){
			parser.parse(this.view);
			var output = parser.process(this);
			return output;
		}
};