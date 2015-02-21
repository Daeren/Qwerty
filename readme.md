`npm install qwerty -g`


```js
//_ Dir [SET] -> Check Local [TREE] -> Check Global -> If [-] -> Install Local
//_ Dir [NSET] -> Check Global -> If [-] -> Install Global

require("qwerty").log(2);

$(["fire-inject", "steel-model"]); //_ Yep, that's all 
$("fire-inject").go(function() { console.log("Just Do It"); });


/*-------------------}>
>node project.js

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

| Name          | Desc        | Args 		|
| ------------- |-------------|-------------|
|               | -           ||
| create      	| Create new instance  								| (isGlobal) |
| remove      	| Remove module(s) from `Qwerty` app  				| (v [string, array, hash]) |
| $      		| Require  											| (module [string, array, hash], <args>) |
|               | -           ||
| strict        | Stop the work, if has errors in the modules  		| (v [default: true]) 	|
| global        | Set `$` as Global Var   							| (v [default: true]) 	|
| dir        	| Project directory (where modules) 				| (v [default: ""]) |
| log        	| Log level (0, 1, 2) 								| (v [default: 1]) |
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

$("inject").go(function() { console.log("inject"); });
```


## License

MIT

----------------------------------
[@ Daeren Torn][1]


[1]: http://666.io