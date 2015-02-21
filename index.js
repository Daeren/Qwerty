//-----------------------------------------------------
//
// Author: Daeren Torn
// Site: 666.io
// Version: 0.00.004
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
    this.logLevel       = 1;
    this.path           = "";

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

                    if(Object.prototype.hasOwnProperty.call(_.modules, key)) {
                        result[key] = _.modules[key];
                    } else {
                        notFound = notFound || [];
                        notFound.push(key);
                    }
                }
            } else {
                var val, name;

                for(var key in m) {
                    if(!Object.prototype.hasOwnProperty.call(m, key)) continue;

                    val = m[key];
                    name = val || key;

                    if(Object.prototype.hasOwnProperty.call(_.modules, key)) {
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

        if(!Object.prototype.hasOwnProperty.call(_.modules, m)) {
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

    var shareMethods = {
        "strict": function(v) {
            _.strict = !!v;
            return _;
        },

        "dir": function(v) {
            _.path = v || "";
            return _;
        },

        "log": function(v) {
            _.logLevel = v;
            return _;
        },

        "autoInstall": function(v) {
            _.auto = !!v;
            return _;
        },

        //------------)>

        "createInstance": function(isGlobal) {
            return new CApp(isGlobal);
        },

        "new": function(name, data) {
            if(typeof(name) == "string") {
                _.modules[name] = data;
            } else if(name && typeof(name) == "object") {
                for(var i in name) {
                    if(Object.prototype.hasOwnProperty.call(name, i)) _.modules[i] = name[i];
                }
            }

            return _;
        },

        "delete": function(name) {
            if(typeof(name) == "string") {
                delete _.modules[name];
            } else if(Array.isArray(name)) {
                name.forEach(function(e) {
                    delete _.modules[e];
                });

            } else if(name && typeof(name) == "object") {
                for(var i in name) {
                    if(Object.prototype.hasOwnProperty.call(name, i)) delete _.modules[i];
                }
            }

            return _;
        }
    };


    for(var i in shareMethods) {
        if(!shareMethods.hasOwnProperty(i)) continue;

        if(isGlobal) {
            this.$[i] = shareMethods[i];
        }

        this[i] = shareMethods[i];
    }

    if(isGlobal) {
        global.$ =  this.$;
    }
};

CApp.prototype = {
    "global": function(v) {
        if(v) global.$ = this.require;
        else delete global.$;

        return this;
    }
};

//----------[HELPERS]-----------}>

function include(path) {
    var fc = require.resolve(path);

    if(fc && require.cache[fc])
        delete require.cache[fc];

    return require(path);
}

function resolveModulePath(name) {
    var fc = require.resolve(name);

    if(fc) {
        fc = fc.split(/\\\\|\\|\//g);
        fc.pop();

        fc = rPath.normalize(fc.join("/"));
    }

    return fc;
}

//----------------------------------]>

function loadModules(modules) {
    var _ = this;

    var numForLoad,
        numInstallsSuccess  = 0,
        numInstallsFailed   = 0,

        mode,               //_ 1 - string, 2 - array, 3 - hash
        globalInstall,      //_ 0 - N, 1 - Y, 2 - C, 3 - Q
        exceptions,

        dirModules          = _.path;

    //------------------]>

    if(!modules)
        return;

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


    if(_.logLevel > 1) {
        console.log("\n---------------------+");
        console.log("Load: %s module(s)", numForLoad);
        console.log("Dir: %s", dirModules || "[global]");
        console.log("---------------------+\n");
    }


    function loadModule(moduleName, moduleAlias, iTry) {
        var name = moduleAlias || moduleName;

        var objModule,
            moduleVer,
            moduleFullName = moduleName; //_ Name + Ver

        //----------------)>

        {
            var s = moduleFullName.split("@");

            moduleName = s[0];
            moduleVer = s[1] || "";
        }

        //----------------)>

        try {
            //-----[Get module version]-------]>

            if(moduleVer) {
                var packageVer, error,
                    modulePath = resolveModulePath(moduleName);

                try {
                    packageVer = include(modulePath + "/package.json").version;
                } catch(e) {
                }

                if(moduleVer != packageVer) {
                    error = new Error("package.json: different versions");
                    error.code = "MODULE_NOT_FOUND";

                    throw error;
                }
            }

            //-----[Try require]-------]>

            if(!dirModules) {
                objModule = include(moduleName);
            }
            else {
                try {
                    objModule = include(dirModules + "/node_modules/" + moduleName);
                } catch(e) {
                    if(e.code != "MODULE_NOT_FOUND") throw e;

                    try {
                        objModule = include(dirModules + "/" + moduleName);
                    } catch(e) {
                        if(e.code != "MODULE_NOT_FOUND") throw e;

                        objModule = include(moduleName);
                    }
                }
            }

            _.modules[name] = objModule;
        } catch(e) {
            var isNotFound = e.code == "MODULE_NOT_FOUND";

            if(_.strict && iTry) {
                exceptions = exceptions || [];
                exceptions.push(e);
            }

            if(!isNotFound) {
                if(_.logLevel)
                    console.log(e);
            }

            if(isNotFound && !iTry) {
                var cmd;

                if(_.logLevel)
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
                    if(_.logLevel)
                        console.log("Here We Go...");

                    try {
                        cmd = (dirModules ? ("cd " + dirModules + " && ") : "") + "npm install " + moduleName + (moduleVer ? ("@" + moduleVer) : "") + (dirModules ? "" : " -g");
                        cmd = rShelljs.exec(cmd,  {"silent": true});

                        if(cmd.code !== 0) {
                            if(_.strict) {
                                exceptions = exceptions || [];
                                exceptions.push(new Error(cmd.output));
                            }

                            numInstallsFailed++;
                        }

                        cmd = cmd.output;
                    } catch(e) {
                        cmd = null;
                    }

                    if(cmd && !cmd.toString().match(new RegExp("npm\\s+ERR!", "im"))) {
                        numInstallsSuccess++;

                        loadModule(moduleFullName, moduleAlias, true);
                        return;
                    }
                }
            }
        }

        if(_.logLevel)
            console.log("[%s] %s@%s |> %s", Object.prototype.hasOwnProperty.call(_.modules, name) ? "+" : "-", moduleName, moduleVer, moduleAlias || "");
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
                if(Object.prototype.hasOwnProperty.call(modules, i)) loadModule(i, modules[i])
            }

            break;
    }


    if(_.logLevel > 1 && numForLoad > 1 && (numInstallsSuccess || numInstallsFailed)) {
        console.log("\n---------------------+");
        console.log("Success: %s", numInstallsSuccess);
        console.log("Failed: %s", numInstallsFailed);
        console.log("---------------------+\n");
    }

    if(_.strict && exceptions)
        throw exceptions;
}

//-----------------------------------------------------

module.exports = new CApp(true);