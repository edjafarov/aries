/**
 * ARIES project
 *
 * Copyright (c) 2009 Eldar Djafarov
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Basic concepts:
 * this is a core ARIES lbrary.
 * My intention is to make simple and highly extendible library
 * which will implement basic clasical inheritance.
 * The core feature of library is the constructor overriding.
 *
 * TODO: namespaces/libraries
 *	1. ARIES.events. - standart browser events handling<br/>
 *	implementation should be as simple as possible. Only basic<br/>
 *	features should be implemented. This will not be super featured<br/>
 *	library but it must be usable without 3dparty js.<br/>
 *	2. ARIES.customEvents. - custom events handling<br/>
 *	this library is necessary to work with components and to make<br/>
 *	DOM to JS binding tight.<br/>
 *	3. ARIES.xpath - get dom elements by xpath<br/>
 *	this library will provide interface to 3dparty xpath library.<br/>
 *	Since xpath is a very poverfull tecnology to work with xml. I<br/>
 *	think we should use it.<br/>
 *	4. ARIES.query - get dom elements by jQuery query<br/>
 * 	this library will empover basic library with jQuery<br/>
 *
 *	TODO: aliase/
 *	A = ARIES
 *
 *	TODO: features/
 *	1. implement smart initialization for every library.
 *	this initialization will consist of a piece of code in the
 *	beginning of every module which allows to load them in any order.
 *	library will implement itself properly when core class will be loaded
 *	2. implement possibility to get elements in jQuery style with
 *	following syntaxis:
 *	DomElement||<DomElement> A(id||xpath||jquery css selectors) - return elements
 */
var ARIES = new (function(){
    /**
     * Private namespace.
     */
    var CORE={
			/**
			 * CORE is an instance of basic object. Every new object will
			 * inherit this one
			 * rototype.destroy() is destructor
			 */

					destroy: function(){
						delete this;
					}

			};

	this.Plugins = {};
	this.Ext = {};

	/**
	 * TODO: this will be interesting syntaxis. It will implement
	 * something like this:
	 * function Aclass(){
	 * 		//constructor blablabla
	 * }
	 * Aclass.prototype.method1=function(){
	 *      //method implementation
	 * }
	 * Aclass.prototype.method2=function(){
	 *      //method implementation
	 * }
	 * ARIES.Extend(Aclass);
	 */
	this.Extend=function Extend(sub){

		// we need to put additional element in prototype chain
		var T=function T(){
		};
        var Plugins = this.Plugins;
		// Extending of a constructor
		var newConst=function(){// MAGIC
			var ret=new T();
			var rcon=sub.apply(ret, arguments);
			ret = rcon?rcon:ret;
			// since here a mess with instanceof stuff we need
			// to make some substitute
			ret.isInstanceOf= function (testConstr){
					if(testConstr._originalConstructor){
						return sub == testConstr._originalConstructor;
					}
					else{
						return sub == testConstr;
					}
				};
            return ret;
		};

        for(plugin in Plugins){
		
            newConst ["make" + plugin] = function(){
                for(method in Plugins[plugin]){
                    T.prototype[method] = Plugins[plugin][method]; 
                }
            }
        }

		// link to original non messed constructor
		newConst._originalConstructor = sub;


		return{
            /**
             * extends by core functionality
             */
			core:function(){
				function F(){}
				F.prototype=CORE;
				T.prototype=new F();

				// alternative way to create instances
				newConst.create=newConst;
				newConst.prototype=T.prototype;
				// standard behavior setup
				newConst.prototype.constructor=newConst;
				newConst.superclass=T.prototype.constructor;
				return newConst;
			},
            /**
             * allows to extend by any constuctor
             * @param sup
             */
			by:function(sup){
				T.prototype=new sup();
				// alternative way to create instances
				newConst.create=newConst;

				// standard behavior setup
				newConst.prototype=T.prototype;
				newConst.prototype.constructor=newConst;
				newConst.superclass=sup;
				return newConst;

				//Extend by something
			},
            /**
             * this function allows to make singleton out of any constructor
             */
			singletonize:function(){
				var instance = null;
				return function singletonConstructor(){
					if(!instance){
						instance=new sub(arguments);
					}
					return instance;
				};
			}
		};
	};
})();

module.exports = ARIES;
