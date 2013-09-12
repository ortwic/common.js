/*****************************************************************************\
 *                                    *                                      *
 *  File:     debug.js                *   Author:  oc (Ortwin)               *
 *                                    *                                      *
 *  Version:  0.3.11                  *   Date:    2013-09-12                *
 *                                    *                                      *
 *  Module:   global                  *   E-Mail:  ohc84@gmx-topmail.de      *
 *                                    *                                      *
 *  Project:  -                       *   Website: http://ortwin.qu.am       *
 *                                                                           *
 *  Description:  Some unversial function to debug by printing anytime.      *
 *                                                                           *
\*****************************************************************************/

var println = (function() {
    var div;
    var IE8 = !!document.attachEvent;
    var config = {
        debug: false,
        clearOnDblClick: true,
        overrideAlert: false,
        printScriptErrors: true,
        groupsNotCollapsed: true,
        groupByObjectType: true
    }
    var style = {
        div: {
            position: "fixed",
            top: 0,
            right: 0,
            width: "auto", 
            maxWidth: "50%",
            maxHeight: "98%",
            color: "black",
            background: "cornsilk",
            border: "1px solid gray",
            overflow: "auto",
            padding: "4px",
            margin: "4px 20px",
            opacity: 0.9,
            zIndex: Math.pow(2, 31) 
        },
        ulStyle: {
            // display: config.groupsNotCollapsed ? "none" : "block", 
            display: "none", 
            margin: "0px 0px 0px 12px",
            padding: "0px",
            border: "1px solid #E0E0E0",
            background: IE8 ? "#FFF0C0" : "rgba(255,232,192,0.2)",
            fontFamily: "monospace",
            listStyle: "none"
        },
        liStyle: {
            textIndent: "4px",
            overflow: "hidden"
        },
        aTypeStyle: {
            display: "block",
            overflow: "hidden",
            color: "navy",
            background: "#E0E0E0",
            borderRadius: "0px",
            fontWeight: "bold",
            textDecoration: "none"
        },
        aObjStyle: {
            display: "block",
            overflow: "hidden",
            color: "navy",
            borderRadius: "0px",
            fontWeight: "bold",
            textDecoration: "none"
        },
        aObjRefOverStyle: { background: "#FFC000" /* borderRight: "14px solid #FFC000" */ },
        aObjRefOutStyle: { background: "transparent" },
        errStyle: { 
            color: "white", 
            background: "maroon", 
            padding: "0px 3px",
            fontFamily: "monospace",
            fontWeight: "bold" 
        }
    };
    var alert = window.alert;    
    var printError = function(e, f, l) { 
        if(typeof e == "string") {
            var file = (f.indexOf('/') > 0) ? f.match(/[\d\w-.]*$/) : f;
            var err = oc.dom.createDiv(style.errStyle, div).innerHTML = e + "<br>";
            if(file) err.innerHTML += "Line " + l + " in " + file;
        } else {
            var t = (typeof f == "object" && f.tagName) ? f : div;
            oc.dom.createDiv(style.errStyle, t).innerHTML = e.name;
            print(e, t);
        }
    };
    var clear = function(n) { 
        if(n > 1) {
            while(n <= div.childNodes.length) {
                div.removeChild(div.childNodes[0]);
            }
        } else { div.innerHTML = ""; }
    };
    var print = function(string, poly, timeout) {
        if(config.debug || poly && poly.tagName) {
            if(poly) {
                if(typeof poly == "number")
                    clear(poly);
                else if(typeof poly == "boolean")
                    clear(0);
            }
            
            var line;
            if(typeof string == "object") {
                printObj(string, poly && poly.tagName ? poly : null);
            } else if(typeof string == "function") {
                print(string.toString().match(/ .*\(.*?\)/).toString(), poly);
            } else {
                if(poly && poly.tagName) {
                    line = oc.dom.createElement("span", {}, poly);
                } else {
                    line = oc.dom.createDiv({}, div);
                }
                line.innerHTML = string;
                // div.scrollTop = div.scrollHeight;
            }
            
            if(typeof timeout == "number") {
                setTimeout(function() { if(line.parentNode) div.removeChild(line); }, timeout); 
            }
        }
    }
        
    print.config = function(cfg, show) {
        if(typeof cfg === "object") init(cfg, show);
    };
    
    print.style = function(style) {
        if(typeof style === "object") oc.dom.appendStyle(div, style); 
    };
    
    function getProto(obj) {
        try {
            return obj.__proto__;
        } catch(e) {
            print(e);
        }
        return "?";
    }

    function printObj(object, target, objRefTable) { 
        objRefTable = objRefTable || {}; // IE8?
        var types = {};
        var setNodeClickEvent = function(nodeObj, src, target, visible) {
            // Must force argument to be a local variable or else the closures created will
            // all refer to the same argument variable. One reason for this function.
            var node;
            var indicator = oc.dom.createElement("span", { paddingRight: "4px" }, nodeObj);
            if(visible) {
                src.style.display = "block"; 
                indicator.innerHTML = "-";
            } else {
                indicator.innerHTML = "+";           
            }
            addEvent(nodeObj, "click", function(e) { 
                try {
                    if(target && target.childNodes.length < 2) {
                        node = printObj(src, target, objRefTable);
                        indicator.innerHTML = "-";
                    } else {
                        if(!node) node = src;
                        if(node.style.display != "none") {
                            node.style.display = "none";
                            indicator.innerHTML = "+";
                        } else {
                            node.style.display = "block";
                            indicator.innerHTML = "-";
                        }
                    }
                } catch(e) {
                    printError(e, target);
                }
                if(e.preventDefault) e.preventDefault(); 
                return false;
            });
            return node;
        };
        var setNodeHoverEvent = function(nodeObj, src, target) {
            if(!target || !target.tagName) return;
            addEvent(nodeObj, "mouseover", function(e) { 
                if(target && target.id) clearTimeout(target.id);
                oc.dom.appendStyle(target, style.aObjRefOverStyle);
                if(e.preventDefault) e.preventDefault(); 
                return false;
            });
            addEvent(nodeObj, "mouseout", function(e) { 
                // oc.dom.appendStyle(target, style.aObjRefOutStyle);
                target.id = setTimeout(function(e) { oc.dom.appendStyle(target, style.aObjRefOutStyle); target.id = 0; }, 1000);
                if(e.preventDefault) e.preventDefault(); 
                return false;
            });
        };
        var isObjListed = function(obj) {
            for(var o in objRefTable) {
                if(obj === objRefTable[o].ref) return { key: o, a: objRefTable[o].a };
            }
        };
        
        // print objects, that are marked as non-iterable like Math, JSON... 
        if(Object.keys && !Object.keys(object).length && Object.toType(getProto(object)) == "object") { 
            var wrapObj = {};
            Object.getOwnPropertyNames(object).forEach(function(key) { wrapObj[key] = object[key]; });
            object = wrapObj;
        }
        
        var list = oc.dom.createElement("ul", style.ulStyle, target || div);
        list.style.display = "block";
        
        for(var key in object) {
            var type = (config.groupByObjectType) ? Object.toType(object[key]) : typeof object[key];
            
            // if group doesn't exist create a new one
            if(!types[type]) {
                var li = oc.dom.createElement("li", style.liStyle, list);
                var a = oc.dom.createElement("a", style.aTypeStyle, li);
                var ul = types[type] = oc.dom.createElement("ul", style.ulStyle, li);
                a.href = "#";
                setNodeClickEvent(a, types[type], null, config.groupsNotCollapsed);
                print((config.groupByObjectType) ? {}.toString.call(object[key]) : "[" + type + "]", a);
            } 
            
            var li = oc.dom.createElement("li", style.liStyle, types[type]);
            if(type == "function") {
                var args = object[key].toString().match(/\(.*?\)/).toString();
                if(args.length < 3 && object[key].length > 0) {
                    args = "( [" + object[key].length + " args] )";
                }
                if(IE8 && key.indexOf("{")+1) return; //key = key.split("(")[0];
                print(key + args, li);
            } else if(typeof object[key] == "object" || typeof object[key] == "function") {
                if(object[key] && type != "null") {
                    var alias = isObjListed(object[key]);
                    var a = oc.dom.createElement("a", style.aObjStyle, li);
                    if(alias) {
                        a.href = "#" + alias.key;
                        a.style.color = "#A0A0A0";
                        a.style.paddingLeft = "5px";
                        setNodeHoverEvent(a, alias, alias.a);
                        print("&nbsp;" + key + " = " + alias.key, a);                    
                    } else {
                        a.name = key;
                        a.href = "#" + key;
                        setNodeClickEvent(a, object[key], li);
                        print(key + "::" + Object.toType(getProto(object[key])), a);

                        if(!objRefTable[key]) objRefTable[key] = { ref: object[key], a: a };
                    }
                } else {
                    print(key + ": null", li);
                }
            } else {
                if(type == "string") {
                    // print(document.body.innerHTML) might produce display errors, so it won't be used in this special case
                    var d = oc.dom.createDiv( { overflow: "hidden", maxHeight: "30px" }, li);
                    // d.style["height"] = oc.dom.getStyle(li, "line-height");
                    // d.style[maxWidth] = window.innerWidth - parseInt(div.style.marginRight) * 4 + "px";

                    d[IE8 ? "innerText" : "textContent"] = key + ": " + object[key];
                } else {
                    print(key + ":&nbsp;" + object[key], li); 
                }
            }
        }
        return list;
    }
    
    function init(cfg, show) {
        if(typeof cfg === "object") {
            for(var c in config) {
                if(typeof cfg[c] == "boolean") config[c] = cfg[c];                
            }
        } else {
            print(config);        
        }
        
        if(!config.debug) {
            config.debug = window.location.search.indexOf('debug') > 0;
        }
        div.style.display = (config.debug) ? "block" : "none";
        
        (config.clearOnDblClick) ? addEvent(div, "dblclick", clear) : removeEvent(div, "dblclick", clear);
        
        window.alert = (config.overrideAlert) ? println : window.alert = alert;        
        
        // not supported by ff so use classic approach
        // (config.printScriptErrors) ? addEvent(window, "error", printError) : removeEvent(window, "error", printError); 
        window.onerror = (config.printScriptErrors) ? printError : null;
        
        if(show) {
            print("current config:");
            printObj(config);
        }
    }
    
    addEvent(this, "DOMContentLoaded", function(e) {        
        div = oc.dom.createDiv(style.div, document.getElementsByTagName("body")[0]);
        init({});
    });
    
    return print;
})();
