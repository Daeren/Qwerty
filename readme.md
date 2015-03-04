`npm install qwerty -g`


```js

//_ Dir/Project -> Check Local [TREE] -> Check Global -> If [-] -> Install Local

require("qwerty").log(2);

$(["fire-inject", "steel-model"]); //_ Yep, that's all 
$("fire-inject@0.0.30").go(function() { console.log("Just Do It"); });


/*-------------------}>
>node project.js

---------------------+
Load: 2 module(s)
Dir: /web/project
---------------------+

Not found module: steel-model !

Here We Go...
[+] steel-model@0.0.33 |>

Not found module: fire-inject !

Here We Go...
[+] fire-inject@0.0.36 |>

---------------------+
Success: 2
Failed: 0
---------------------+

...
*/
```

#### Desc

* Auto-install modules
* Simple, global access
* Ignored `require` cache


#### Methods of Module

| $ | Name        | Desc        | Args			|
|:-:|-------------|-------------|-------------|
|   |               	| -           ||
| + | createInstance    | Create new instance  								| ([isGlobal]) |
| + | new      			| Set module(s) in `Qwerty` app  					| (name [string, hash], [data]) |
| + | delete      		| Delete module(s) from `Qwerty` app  				| (name [string, array, hash]) |
|   |               	| -           ||
| - | $      			| Require  											| (module [string, array, hash], <args>) |
|   |               	| -           ||
| + | strict        	| Stop the work, if has errors in the modules  		| (v [default: true]) 	|
| - | global        	| Set `$` as Global Var   							| (v [default: true]) 	|
| + | dir        		| Project directory (where modules) 				| (v [default: ""]) |
| + | log        		| Log level (0, 1, 2, 3) 							| (v [default: 1]) |
| + | use        		| Package manager 									| (v [default: "npm"]) |
| + | autoInstall   	| Auto-install of modules  							| (v [default: true]) 	|


#### Examples

```js
require("qwerty").dir(__dirname + "/project");

//-----]>

$(); //_ Get all

$("moduleX"), //_ Get module "moduleX"
$("moduleClass", 3, 2, 1, <...>).func(), //_ Create object and call 'func'

$(["module1", "module2"]), //_ Get list
$({"fire-inject": "inject"}) //_ Alias

$("inject").go(function() { console.log("inject"); });

$("fire-inject@0.0.29").go(function() { console.log("inject"); });

//-----]>

{
    $.new({
        "test":     13,
        "testV1":   "X",
        "testV2":   "Y"
    });

    $.new("testClass", function() {
        this.data = 666;  console.log("test/Class:", arguments);
    });

    $("testClass").prototype.func = function() { return 69; };
}

console.log(JSON.stringify({
    "T0": $(),

    "T1": $("test"),
    "T2": $("testClass", true, 3, 2, 1).func(),

    "T3": $(["test", "testV2"]),
    "T4": $({"test": "Z-TEST"})
}, null, "\t"));


$({"fire-inject": "inject"});

$("fire-inject@0.0.36").go(function() { console.log("inject"); });
$("inject").go(function() { console.log("inject"); });

$("fire-inject@0.0.30").go(function() { console.log("inject"); });

//-------------------------]>

$.dir(__dirname + "/x/node_modules").$("ops.js"); //_ Load : First call
$.dir(__dirname).$("data.json");
$("ops.js"); //_ Return
```


## License

MIT

----------------------------------
[@ Daeren Torn][1]


[1]: http://666.io