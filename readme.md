`npm install qwerty`


```js
require("qwerty")

$(["fire-inject", "steel-model"]); //_ Yep, that's all 
$("fire-inject").go(function() {});


/*-------------------}>
>node project

---------------------+
Load: 2 module(s)
Dir: /web/projectx
---------------------+

Not found module: steel-model !

Here We Go...
[+] steel-model |>

Not found module: fire-inject !

Here We Go...
[+] fire-inject |>

---------------------+
Success: 2
Failed: 0
---------------------+
*/
```

#### Desc

* Ignored `require` cache
* Automatic installation of modules
* Simple, global access


#### Methods of Module

| Name          | Desc        | Arg 		|
| ------------- |-------------|-------------|
|               | -           ||
| create      	| Create new instance  								| (isGlobal) |
| $      		| Require  											| (module [string, array, hash], <args>) |
|               | -           ||
| strict        | Stop the work, if has errors in the modules  		| (v [default: true]) 	|
| global        | Set `$` as Global Var   							| (v [default: true]) 	|
| dir        	| Project directory (where modules) 				| (v [default: __dirname]) |
| autoInstall   | Automatic installation of modules  				| (v [default: true]) 	|


#### Examples

```js
require("qwerty").dir(__dirname + "/project");

//-----]>

$(); //_ Get all

$("moduleX"), //_ Get module "moduleX"
$("moduleClass", 3, 2, 1, <...>).func(), //_ Create object and call 'func'

$(["module1", "module2"]), //_ Get list
$({"fire-inject": "inject"}) //_ Alias

//-----]>

$("inject").go(function() { console.log("inject"); });
$("fire-inject").go(function() { console.log("inject"); });

$({"inject": null}); //_ Remove "inject"
console.log("inject: %s", $("inject"));
```


## License

MIT

----------------------------------
[@ Daeren Torn][1]


[1]: http://666.io