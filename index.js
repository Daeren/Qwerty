//-----------------------------------------------------
//
// Author: Daeren Torn
// Site: 666.io
// Version: 0.00.001
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

var rPath           = require("path"),
    rEvents         = require("events");

var rShelljs        = require("shelljs"),
    rReadline       = require("readline-sync");

//-----------------------------------------------------

var CApp = function(isGlobal) {
    var _ = this;

    //-----------------]>

    this.strict         = true;
    this.auto           = true;
    this.path           = __dirname;

    this.modules        = {};

    //-----------------]>

    this.$ = function(m) {
        if(arguments.length == 0)
            return _.modules;

        //---------------)>

        if(typeof(m) == "object") {
            var result      = {},
                notFound;

            if(Array.isArray(m)) {
                var key,
                    len = m.length;

                while(len--) {
                    key = m[len];

                    if(_.modules.hasOwnProperty(key)) {
                        result[key] = _.modules[key];
                    } else {
                        notFound = notFound || [];
                        notFound.push(key);
                    }
                }
            } else {
                var val, name;

                for(var key in m) {
                    if(!m.hasOwnProperty(key)) continue;

                    val = m[key];
                    name = val || key;

                    if(val === null) {
                        delete _.modules[key];
                        continue;
                    }

                    if(_.modules.hasOwnProperty(key)) {
                        result[name] = _.modules[key];
                    } else {
                        notFound = notFound || {};
                        notFound[key] = name;
                    }
                }
            }

            if(notFound)
                loadModules.call(_, notFound);

            return result;
        }

        //---------------)>

        if(!_.modules.hasOwnProperty(m)) {
            loadModules.call(_, m);
        }

        m = _.modules[m];

        if(!m || arguments.length == 1)
            return m;

        //---------------)>

        var data = Array.prototype.slice.call(arguments);
        data[0] = m;

        return new (m.bind.apply(m, data));
    };

    //-----------------]>

    if(isGlobal)
        global.$ =  this.$;
};

CApp.prototype = {
    "strict": function(v) {
        this.strict = !!v;
        return this;
    },


    "global": function(v) {
        if(v) global.$ = this.require;
        else delete global.$;

        return this;
    },

    "dir": function(v) {
        this.path = rPath.normalize(v || ".");
        return this;
    },

    "autoInstall": function(v) {
        this.auto = !!v;
        return this;
    },

    //------------]>

    "create": function(isGlobal) {
        return new CApp(isGlobal);
    }
};

//----------[HELPERS]-----------}>

function include(path) {
    var fc = require.resolve(path);

    if(fc && require.cache[fc])
        delete require.cache[fc];

    return require(path);
}

//----------------------------------]>

function loadModules(modules) {
    var _ = this;

    var numForLoad,
        numInstalled        = 0,
        numErrorsInstall    = 0,

        mode,               //_ 1 - string, 2 - array, 3 - hash
        globalInstall,      //_ 0 - N, 1 - Y, 2 - C, 3 - Q
        exceptions,

        dirModules      = _.path;

    //------------------]>

    if(typeof(modules) == "string") {
        numForLoad = 1;
        mode = 1;
    } else if(Array.isArray(modules)) {
        numForLoad = modules.length;
        mode = 2;
    } else if(typeof(modules) == "object") {
        numForLoad = Object.keys(modules).length;
        mode = 3;
    }

    if(numForLoad > 1)
        globalInstall = 3;


    console.log("\n---------------------+");
    console.log("Load: %s module(s)", numForLoad);
    console.log("Dir: %s", dirModules);
    console.log("---------------------+\n");


    function loadModule(key, value, iTry) {
        var name = value || key;
        var obj;

        //----------------)>

        try {
            try {
                obj = include(key);
            } catch(e) {
                if(e.code != "MODULE_NOT_FOUND") throw e;

                try {
                    obj = include(dirModules + "/" + key);
                } catch(e) {
                    if(e.code != "MODULE_NOT_FOUND") throw e;
                    obj = include(dirModules + "/node_modules/" + key);
                }
            }

            _.modules[name] = obj;
        } catch(e) {
            var isNotFound = e.code == "MODULE_NOT_FOUND";

            exceptions = exceptions || [];
            exceptions.push(e);

            if(!isNotFound) {
                console.log(e);
            }

            if(!iTry && isNotFound) {
                var cmd;

                console.log("\nNot found module: %s !\n", name);

                if(!_.auto) {
                    if(globalInstall == 3) {
                        cmd = rReadline.question("Install all (+/-/*): ");

                        switch(cmd) {
                            case "+": globalInstall = 1; break;
                            case "*": globalInstall = 2; break;

                            case "-":
                            default:
                                globalInstall = 0;
                        }
                    }

                    switch(globalInstall) {
                        case 0: cmd = undefined; break;
                        case 1: cmd = "+"; break;

                        case 2:
                        default:
                            cmd = rReadline.question("Install (+/-): ");
                    }
                }

                if(_.auto || cmd === "+") {
                    console.log("Here We Go...");

                    try {
                        rShelljs.mkdir("-p", dirModules + "/node_modules");
                    } catch(e) {
                    }

                    try {
                        cmd = rShelljs.exec("cd " + dirModules + " && npm install " + key,  {"silent": true});

                        if(cmd.code !== 0) {
                            numErrorsInstall++;
                        }

                        cmd = cmd.output;
                    } catch(e) {
                        cmd = null;
                    }

                    if(cmd && !cmd.toString().match(new RegExp("npm\\s+ERR!", "im"))) {
                        numInstalled++;

                        loadModule(key, value, true);
                        return;
                    }
                }
            }
        }

        console.log("[%s] %s |> %s", _.modules.hasOwnProperty(name) ? "+" : "-", key, value || "");
    }

    switch(mode) {
        case 1:
            loadModule(modules);

            break;

        case 2:
            modules.forEach(function(e) {
                loadModule(e);
            });

            break;

        case 3:
            for(var i in modules) {
                if(modules.hasOwnProperty(i)) loadModule(i, modules[i])
            }

            break;
    }


    if(numForLoad > 1 && (numInstalled || numErrorsInstall)) {
        console.log("\n---------------------+");
        console.log("Success: %s", numInstalled);
        console.log("Failed: %s", numErrorsInstall);
        console.log("---------------------+\n");
    }

    if(_.strict && numErrorsInstall)
        throw exceptions;
}

function installModule() {
}

//-----------------------------------------------------

module.exports = new CApp(true);