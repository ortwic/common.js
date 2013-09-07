/*****************************************************************************\
 *                                    *                                      *
 *  File:     common.js               *   Author:  oc (Ortwin Cars.)         *
 *                                    *                                      *
 *  Version:  0.2.9                   *   Date:    2013-07-25                *
 *                                    *                                      *
 *  Module:   global                  *   E-Mail:  ohc84@gmx-topmail.de      *
 *                                    *                                      *
 *  Project:  -                       *   Website: http://ortwin.qu.am       *
 *                                                                           *
 *  Description:  A collection of usefull utilities gathered by myself.      *
 *                                                                           *
\*****************************************************************************/

var oc = function() {
    var _removeIEBorders = false; // used for VE-HTML5 project (lots of nested iframes)
    var _keys = [];
    var _hashMap = {};  // get properties from location.search
    var _mousePos = { source: window, clientX: 0, clientY: 0 }; 
    var _print = function(msg) { alert(msg); }; // fallback, should be overwritten
    var _flags = {
        oninit: "init",
        onshow: "show",
        onhide: "hide",
        onregister: "register",
        onmousedown: "mousedown",
        onmousemove: "mousemove",
        onmouseup: "mouseup"
    };
    
    // ====  Usefull Patterns  ================================================
    var Oberserverable = function() {
        var subscribers = {};        
        return {
            attach: function (obj, fn) { subscribers[obj] = { src: obj, fn: fn }; },
            detach: function (obj) { delete subscribers[obj]; },    
            notify: function (args) { 
                for(var o in subscribers) { 
                    if(typeof args === "object") { args.target = subscribers[o].src; }
                    subscribers[o].fn.call(window, args); 
                } 
            },
            count: function () { 
                var size = 0; 
                for(var o in subscribers) {
                    size++; 
                }
                return size; 
            }
        };
    }
    // ------------------------------------------------------------------------
    
    // ====  DOM-Helpers  =====================================================
    function appendProps(obj, props) {
        for(var p in props) {
            if(p in obj) 
                obj[p] = props[p];
        }
    }
    
    function getStyle(obj, prop) {
        if (obj.currentStyle)
            return obj.currentStyle[prop];
        else if (window.getComputedStyle)
            return document.defaultView.getComputedStyle(obj, null).getPropertyValue(prop);
    }
        
    function newElement(name, styleOrClass, base, self) {
        if(!base) base = document.getElementsByTagName("body")[0];
        if(!self) {
            self = document.createElement(name);
            base.appendChild(self);
        }
        if(typeof styleOrClass === "object") {
            oc.appendStyle(self, styleOrClass);
        } else {
            self.className = styleOrClass;
        }
        
        return self;
    }
    // ------------------------------------------------------------------------
    
    // ====  location.search Helpers  =========================================
    function getProps(str) {
        var array = str.split('&'); // '?' entfernen
        var parts = array.length;
        
        for(var i=0; i<parts; ++i) {
            var eq = array[i].indexOf('=');
            _keys[i] = array[i].substring(0,eq);
            var val = array[i].substring(eq+1,array[i].length);
            
            _hashMap[_keys[i]] = val;
        }
        
        return _hashMap;
    }

    function getKeysFromSearch() {
        if(_hashMap) {
            return _keys;
        }
    }
    // ------------------------------------------------------------------------
    
    // ====  Event handling  ==================================================   
    // handling popups and context menus
    function register(id, content) {
        parent.postMessage(_flags.onregister + ";" + id + ";" + content, "*"); 
    }
    
    function show(id, center) {
        center = !center ? _mousePos.clientX + "," + _mousePos.clientY : "";
        parent.postMessage(_flags.onshow + ";" + id + ";" + center, "*"); 
    }
    
    function hide(id) {
        parent.postMessage(_flags.onhide, "*"); 
    }
    
    function unregister(id) {
        parent.postMessage(_flags.onregister + ";" + id, "*"); 
    }
    // ------------------------------------------------------------------------
    
    // ====  Cookies  =========================================================
    function getCookie(name) {                  // a little outdated cookie api
        var data = new Object();
        var strNum, valAll, keyName, subVal;
        var i = 0;
        var clen = document.cookie.length;

        while (i < clen) {                          // Alle Cookies durchlaufen        
            strNum = document.cookie.indexOf (";", i);  // "Nummer" des Cookies
            if (strNum == -1) strNum = document.cookie.length;  // Nur 1 Cookie
            valAll = unescape(document.cookie.substring(i, strNum)); // name=values auslesen
            keyName = valAll.substring(0, valAll.indexOf("=", 0)); // Name des Cookie zurück
            subVal = valAll.substring(valAll.indexOf("=") + 1); // ab '=' Werte zurück
            data[keyName] = (data[keyName]) ? data[keyName] + subVal : subVal;
            i = strNum + 2;                  // Leerzeichen nach ; überspringen
        }
        
        if(name) {
            if(typeof(data[name])!="undefined")
            {
                return data[name];                  // gefundenes Cookie zurück
            }
            else return 0;                   // Gesuchtes Cookie nicht gefunden
        } else {
            return data;                                 // Alle Cookies zurück
        }
    }

    function setCookie(name, value, ttl, path) {
        var expire = new Date();
        var string2Sav, diff;
        
        if(!path) path = '/';
        
        if(ttl>0) {                                         // Speichere Cookie
            value = escape(value);
            expire.setTime(ttl*1000);
            string2Sav=name + "=" + value + "; expires=" + expire.toGMTString() + ";path=" + path;
            oldCki=getCookie(name);

            if(oldCki!=0) {                      // Wenn Cookie schon existiert
                diff = value.length - escape(oldCki).length; // Differenz zwischen Neuem und Alten Inhalt
                if(document.cookie.length + diff > 4096) { // Gesamtgröße darf nicht größer 4kB sein!
                    return "Zu wenig Speicher frei um &Auml;nderungen zu speichern!";
                }
            } else if(document.cookie.length+string2Sav.length > 4096) { // Zu wenig Speicher für neues Cookie
                return "Zu wenig Speicher frei um neues Element zu speichern!";
            }
            document.cookie = name + "=" + value + "; expires=" + expire.toGMTString() + ";path=" + path;
            if(document.cookie.length < 1) { // Nachträgliche Kontrolle, ob Cookie wirklich gespeichert
                _print("Fehler beim Speichern des Cookies.\nZu viele Daten zum Speichern!");
                return 0;
            }
            return 1;              
        } else {                                               // Lösche Cookie
            expire.setTime(0);
            document.cookie = name + "=''; expires=" + expire.toGMTString() + ";path=" + path;
            return 1;
        }
    } 
    // ------------------------------------------------------------------------
        
    // ====  misc stuff  ======================================================   
    var loadScript = function(scriptname) {  
        var node = document.createElement('script');  
        node.setAttribute('type', 'text/javascript');  
        node.setAttribute('src', scriptname);  
        document.getElementsByTagName('head')[0].appendChild(node);  
    }
    
    var loadCSS = function(scriptname) {  
        var node = document.createElement('link');  
        node.setAttribute('type', 'text/css');  
        node.setAttribute('href', scriptname);  
        node.setAttribute('rel', 'stylesheet');  
        document.getElementsByTagName('head')[0].appendChild(node);  
    }
    
    if(![].forEach) {
        Array.prototype.forEach = function(callback) {
            for( var i=0, l=this.length; i<l; i++) callback(this[i]);
        };
    }
    // ------------------------------------------------------------------------
        
    // ====  Improved functionalities  ========================================    
    window.addEvent = function (obj, type, fn, bub) {
        if(obj.addEventListener) {
            return obj.addEventListener(type, fn, bub ? bub : false);
        }
        // no use of attachEvent() 'cause of very buggy behaviour in IE<=8
        if(obj.attachEvent && type == "DOMContentLoaded") type = "load";
        
        if(!obj["e"+type]) obj["e"+type] = new Oberserverable();
        obj["e"+type].attach("e"+obj+fn, fn);
        if(!obj["on"+type]) { 
            obj["on"+type] = function(e) {
                e = e || window.event;  
                e.cancelBubble = bub;
                return obj["e"+type].notify(e); 
            };
        }
    }
    
    window.removeEvent = function (obj, type, fn) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, fn, false);
        } else if(obj["e"+type]) {
            obj["e"+type].detach("e"+obj+fn, fn);
        }
    }
    
    // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/#more-2838
    Object.toType = (function toType(global) { 
        return function(obj) {
            if (obj === global) {
              return "global";
            }
            return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        }
    })(this);
    
    String.format = function(string) { 
        var args = arguments; 
        var pattern = RegExp("%([1-" + (arguments.length-1) + "])", "g");
        return string.replace(pattern, function(match, index) { 
            return args[index]; 
        }); 
    }; 
    // ------------------------------------------------------------------------
        
    // ====  Construction  ====================================================
    addEvent(window, "DOMContentLoaded", function(e) {
        // probably deprecated, only used in VE-HTML5 project
        if(_removeIEBorders && this.attachEvent && document.getElementsByTagName("iframe")[0]) { 
            var ifs = document.getElementsByTagName("iframe");            
            if(typeof document.getElementsByTagName("iframe")[0].getAttribute("FRAMEBORDER") != "undefined") {   
                // remove all borders from IFrames                
                for(i=0; i<ifs.length; ++i) {
                    ifs[i].setAttribute("FRAMEBORDER","0");
                    ifs[i].setAttribute("ALLOWTRANSPARENCY","true");
                    // forcing redraw
                    ifs[i].parentNode.innerHTML = ifs[i].parentNode.innerHTML;
                }
            }
        }
        
        // probably deprecated, only used in VE-HTML5 project
        if(parent) parent.postMessage(_flags.onInit + ";", "*"); 
    });    
    // ------------------------------------------------------------------------
            
    // public methods and properties wrapped in a return 
    // statement and using the object literal
    return {
        createDiv: function newDiv(styleOrClass, base, self) { return newElement("div", styleOrClass, base, self); },
        createElement: newElement,
        appendProps: appendProps,
        appendStyle: function appendStyle(src, props) { appendProps(src.style, props); },
        getStyle: getStyle,
        
        Oberserverable: Oberserverable,
        MousePos: _mousePos,
        
        getPropsFromSearch: function(str) { return getProps(str.substring(1,str.length)); },
        getProps: getProps,
        getKeysFromSearch: getKeysFromSearch,
        
        addEvent: addEvent,
        removeEvent: removeEvent,
        
        msg: _flags, 
        registerObject: register,
        showObject: show,
        hideObject: hide,
        unregisterObject: unregister,
        
        getCookie: getCookie,
        setCookie: setCookie,
        loadScript: loadScript,
        loadCSS: loadCSS
    }
}();

var Common = oc; // deprecated, only used in VE-HTML5 project

    