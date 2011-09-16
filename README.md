# AriesNode
Is a MVC web framework
features:

    * Annotation based configuration
    * asynchronous
    * flexible

##Installation

```javascript
$ npm install AriesNode
```

##Quick start

just go into AriesNode directory and start server by 

```javascript
$ npm start
//or
$ node main.js
```

##Write simple controller
```javascript
IO.import("./src/controllers/superController");

/**
 *@Controller 
 */
function customController(){
}

customController = ARIES.Extend(customController).by(superController);

/**
* @RequestMapping(value="/foo/{bar}")
*/
customController.prototype.someAction = function (response, bar, request) {
    this.setView("customView.js");
    this.doNext(request, response);
};
```




    