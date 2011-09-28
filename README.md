# Aries
##... is simple
```javascript
/**
 *@RequestMapping(value="/hello-world") 
 */
HalloWorldController.prototype.sayHello = function(request, response){
	response.end("Hello world!");
};
```
##Installation
```
npm install -g aries
```
now start server with
```
aries-start src=./src port=8000
```
where src is a folder with sources of your server and port... is a port

##Features
###routing
Routing with Aries as simple as writing comments. You just put variable name in curvy braces and put it as a parametr in your constructor. Aries dynamically assigns the value to variable.
```javascript
/**
 *@RequestMapping(value="/twitter/{userId}") 
 */
HalloWorldController.prototype.twitterUser = function(request, response, userId){
	//we can use userId here
	//ex. response.end("Hi "+ userId);
};	
```
###asynchronous
Every request comes through a chain of functions to pass request to the next function you need to call this.doNext method along with request and response.
```javascript
/**
 *@RequestMapping(value="/twitter/tweets") 
 */
HalloWorldController.prototype.twitterFeed = function(request, response, twitId){
	//you can pass flow to view resolver asynchronously
	this.doNext(request, response);				
};```
###smart binding
Aries provides some magic that allow to get post and get params inside controller by just declaring those as a parameter for controller function
```javascript
/**
 *@RequestMapping(value="/twitter/tweets") 
 */
HalloWorldController.prototype.twitterFeed = function(request, response, twitId){
	//you can use twitId here if it is passed as POST or GET parameter
	//ex. response.end("Hi "+ twitId);
};```
###middleware
Standard request flow goes through following chain:
[filters]->[controller resolver]->[pre controller interceptors]->[controller]->[post controller interceptors]->[view resolver] which gives us flexibility of using middleware as filters, pre and post controller interceptors. For example we can use connect's static middleware to handle static content as a filter which is the best to handle before controller resolver. To assign class as filter we just need to put Filter annotation before constructor.
```javascript
var connect = require("connect");
var static = connect.static(__dirname + "/src/static");
/**
 * @Filter
 */
function StaticFilter(){}

StaticFilter.prototype.filter=function(request, response){
	var that=this;
	static(request, response, 
		function(){
			that.doNext(request, response);
		}
	);
}	
```
###there is more comming
session management
cookie support
validations handling
model binding
view caching
logger
what else would you like?

## License 

(The MIT License)

ARIES 

Copyright (c) 2009 Eldar Djafarov

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.




    