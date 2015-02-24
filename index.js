//-----------------------------------------------------
//
// Author: Daeren Torn
// Site: 666.io
// Version: 0.00.007
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

var rPath           = require("path"),
    rFs             = require("fs"),
    rEvents         = require("events");

var rShelljs        = require("shelljs"),
    rReadline       = require("readline-sync");

//-----------------------------------------------------

var CApp = function(isGlobal) {
    var _ = this;

    //-----------------]>

    this.strict             = true;
    this.auto               = true;
    this.logLevel           = 1;
    this.path               = "";
    this.usePkgManager      = "npm";
    this.numDaysToUpdate    = 7;

    this.modules            = {};

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
            _.path = rPath.normalize(v || "");
            return _;
        },

        "log": function(v) {
            _.logLevel = v;
            return _;
        },

        "use": function(v) {
            _.usePkgManager  = v;
            return _;
        },

        "autoInstall": function(v) {
            _.auto = !!v;
            return _;
        },

        "update": function(v) {
            _.numDaysToUpdate = v;
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

//----------------]>

function getPathByFile(v) {
    if(!v || typeof(v) != "string")
        return "";

    v = v.split(/\\\\|\\|\//g);
    v.pop();

    return rPath.normalize(v.join("/"));
}

function getDaysBtwTwoDates(t2, t1) {
    var dtNow = t1 || new Date(),
        dtPkg = new Date(t2);

    var timeDiff = Math.abs(dtPkg.getTime() - dtNow.getTime());

    return Math.floor(timeDiff / (1000 * 3600 * 24));
}

//----------------]>

function throwModuleNotFound(text) {
    var error = new Error(text || "");
    error.code = "MODULE_NOT_FOUND";

    throw error;
}

function throwModuleNeedUpdate(text) {
    var error = new Error(text || "");
    error.code = "MODULE_NEED_UPDATE";

    throw error;
}

//----------------------------------]>

function loadModules(modules) {
    var _ = this;

    var numForLoad,
        numInstallsSuccess  = 0,
        numInstallsFailed   = 0,

        numUpdatesSuccess   = 0,
        numUpdatesFailed    = 0,

        mode,               //_ 1 - string, 2 - array, 3 - hash
        globalInstall,      //_ 0 - N, 1 - Y, 2 - C, 3 - Q
        exceptions,

        dirModules          = _.path || getPathByFile(module.parent.filename);

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

    //------------------]>

    function checkModuleTime(p) {
        var stPkg;

        try {
            stPkg = rFs.statSync(p + "/package.json");
        } catch(e) {
            return null;
        }

        return stPkg && getDaysBtwTwoDates(stPkg.mtime) < _.numDaysToUpdate;
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

        function checkModuleVersion(p) {
            var pkg;

            try {
                pkg = include(p + "/package.json");
            } catch(e) {
                return null;
            }

            return pkg && pkg.hasOwnProperty("version") && moduleVer == pkg.version;
        }

        function installModule() {
            var cmd;

            if(_.logLevel)
                console.log("\nNot found module: %s !\n", moduleFullName);

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
                    cmd = (dirModules ? ("cd " + dirModules + " && ") : "") + _.usePkgManager + " install " + moduleName + (moduleVer ? ("@" + moduleVer) : "") + (dirModules ? "" : " -g");

                    if(_.logLevel > 2)
                        console.log(cmd);

                    cmd = rShelljs.exec(cmd,  {"silent": true});

                    if(cmd.code !== 0) {
                        if(_.strict) {
                            exceptions = exceptions || [];
                            exceptions.push(new Error(cmd.output));
                        }

                        numInstallsFailed++;
                    }

                    cmd = cmd.output;

                    if(_.logLevel > 2)
                        console.log(cmd);
                } catch(e) {
                    cmd = null;
                }

                if(cmd && !cmd.toString().match(new RegExp("npm\\s+ERR!", "im"))) {
                    numInstallsSuccess++;
                    return true;
                }
            }

            return false;
        }

        function updateModule() {
            var cmd;

            if(_.logLevel)
                console.log("\nUpdate module: %s !\n", moduleFullName);

            try {
                cmd = (dirModules ? ("cd " + dirModules + " && ") : "") + _.usePkgManager + " update " + moduleName + (dirModules ? "" : " -g");

                if(_.logLevel > 2)
                    console.log(cmd);

                cmd = rShelljs.exec(cmd,  {"silent": true});

                if(cmd.code !== 0) {
                    if(_.strict) {
                        exceptions = exceptions || [];
                        exceptions.push(new Error(cmd.output));
                    }

                    numUpdatesFailed++;
                } else {
                    numUpdatesSuccess++;
                }

                cmd = cmd.output;

                if(_.logLevel > 2)
                    console.log(cmd);
            } catch(e) {
                cmd = null;
            }
        }

        //----------------)>

        try {
            //-----[Try require local]-------}>

            try {
                var p = dirModules + "/node_modules/" + moduleName;

                objModule = include(p);

                if(moduleVer) {
                    if(!checkModuleVersion(p)) //_ Strict
                        throwModuleNotFound("#1 : package.json: different versions");
                } else {
                    if(_.numDaysToUpdate && !iTry && !checkModuleTime(p)) //_ Easy
                        throwModuleNeedUpdate("#1");
                }
            } catch(e) {
                if(e.code != "MODULE_NOT_FOUND") throw e;

                try {
                    objModule = include(dirModules + "/" + moduleName);
                } catch(e) {
                    if(e.code != "MODULE_NOT_FOUND") throw e;
                }
            }

            //-----[Try find module]-------}>

            if(!objModule) {
                var result;
                var ps = module.parent.paths;

                for(var i = 0, p; !result && i < ps.length; i++) {
                    p = ps[i] + "/" + moduleName;

                    try {
                        result = include(p);
                    } catch(e) {
                        if(e.code != "MODULE_NOT_FOUND") throw e;
                        continue;
                    }

                    //--------------------]>

                    if(moduleVer) {
                        if(!checkModuleVersion(p)) //_ Strict
                            throwModuleNotFound("#2 : package.json: different versions");
                    } else {
                        if(_.numDaysToUpdate && !iTry && !checkModuleTime(p)) //_ Easy
                            throwModuleNeedUpdate("#2");
                    }
                }

                if(result)
                    objModule = result;
            }

            //-----[Try require global]-------}>

            if(!objModule) {
                objModule = include(moduleName);

                //---------------]>

                var p = getPathByFile(require.resolve(moduleName));

                if(moduleVer) {
                    if(!checkModuleVersion(p)) //_ Strict
                        throwModuleNotFound("#3: package.json: different versions");
                } else {
                    if(_.numDaysToUpdate && !iTry && !checkModuleTime(p)) //_ Easy
                        throwModuleNeedUpdate("#3");
                }
            }

            //-------------------]>

            _.modules[name] = objModule;
        } catch(e) {
            switch(e.code) {
                case "MODULE_NEED_UPDATE":
                    if(!iTry) {
                        updateModule();
                        return loadModule(moduleFullName, moduleAlias, true);
                    }

                    break;

                case "MODULE_NOT_FOUND":
                    if(!iTry) {
                        if(installModule())
                            return loadModule(moduleFullName, moduleAlias, true);
                    }

                    break;

                default:
                    if(_.strict && iTry) {
                        exceptions = exceptions || [];
                        exceptions.push(e);
                    }

                    if(_.logLevel)
                        console.log(e);
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