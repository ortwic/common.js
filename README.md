# common.js
ECMAScript 5 library with lots of useful js functions and polyfills. Like a light version of jquery. So actually obsolete. Use jquery. :-)
- string helper
  - format
  - capitalize
  - toCamel
  - toUnderscore
  - trim
- object helper
  - fixed toType
  - deep clone
  - merge object attributes
- observable pattern
- add late scripts or css 
- create any elements (like jquery)
- convert search query to object
- simplified communications between iframes
- cookie helper

# debug.js
## what for?

For Webapp-development debugging with alert() is not very comfy and might be also annoying. So it would be nice to provide an output-function with very little efford:

	<script src="js/debug.js" type="text/javascript"></script>
		

Fast debugging with only one global function:

	> println("some string");
	> println("some string", true); // replace previous output
		

Great! Next idea: Why just be able to print text? How about printing an object recursivly as a tree instead of [object Object]!

Side benefit: You can print and observe your current settings of your Browser/HTML-Page.
So if you forgot the name of a property, why don't print the object and its child instead to look some reference up.

## Examples

### Prepare
1. firstly enable debug   debug.html?debug
2. set config         println.config({ clearOnDblClick: true, overrideAlert: true }, show) 
3. append style       println.style({ left: "50%", background: 'aliceblue' })
   
### Action
1. print some text        `println('Hello World!')`
2. and again          `println('Some more Text')`
3. and once again     `println('Get outa here!', true)`
4. limited...         `println('Max 3 times', 3)`
5. ...by time         `println('Limited in time', 0, 2000)`
   
6. print some objects     `println(someObject)`
7. even your DOM      `println(window, 1)`

### Catch errors
force some error:      `foo.bar('does not exist')`

If you like you can also use alert(). (You have to override it via config)
    
    
