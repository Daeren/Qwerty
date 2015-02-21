//-----------------------------------------------------
//
// Author: Daeren Torn
// Site: 666.io
// Version: 0.00.005
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

//_ Dir [SET] -> Check Local [TREE] -> Check Global -> If [-] -> Install Local
//_ Dir [NSET] -> Check Global -> If [-] -> Install Global

require("../index").log(2).dir(__dirname);

//-----------------------------------------------------

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

//-------------------------]>

console.log(JSON.stringify({
    "T0": $(), //_ Get all

    "T1": $("test"), //_ Get module
    "T2": $("testClass", true, 3, 2, 1).func(), //_ New Object

    "T3": $(["test", "testV2"]), //_ List
    "T4": $({"test": "Z-TEST"}) //_ Alias
}, null, "\t"));


$({"fire-inject": "inject"});

$("fire-inject@0.0.36").go(function() { console.log("inject"); });
$("inject").go(function() { console.log("inject"); });

$("fire-inject@0.0.30").go(function() { console.log("inject"); });

//-------------------------]>

$.dir(__dirname + "/x/node_modules").$("ops.js"); //_ Load : First call
$.dir(__dirname).$("data.json");
$("ops.js"); //_ Return


//$("fire-inject.js");
//$(["fire-inject", "steel-model", "_empty_like_a_module_"]);
//$("fire-inject");
//$("_empty_like_a_module_-inject");