/*****************************************************************************\
 *                                    *                                      *
 *  File:     common.js               *   Author:  oc (Ortwin Cars.)         *
 *                                    *                                      *
 *  Version:  0.2.8                   *   Date:    2013-07-25                *
 *                                    *                                      *
 *  Module:   global                  *   E-Mail:  ohc84@gmx-topmail.de      *
 *                                    *                                      *
 *  Project:  -                       *   Website: http://ortwin.qu.am       *
 *                                                                           *
 *  Description:  A collection of usefull utilities gathered by myself.      *
 *                                                                           *
\*****************************************************************************/

var oc = function() {
    // http://jszen.blogspot.com/2005/03/cross-domain-security-woes.html 
    var _removeIEBorders = false; // für VE-HTML5 Projekt notwendig
    var _keys = [];
    var _hashMap = {}; // um Properties auszulesen
    var _id;
    var _mousePos = { src: window, x: 0, y: 0 };
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
    function appendStyle(obj, props) {
        for(var p in props) {
            if(p in obj.style)
                obj.style[p] = props[p];
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
            appendStyle(self, styleOrClass);
        } else {
            self.className = styleOrClass;
        }
        
        return self;
    }
    // ------------------------------------------------------------------------
    
    // ====  URI-Search Helpers  ==============================================
    function getProps(str) {
        var array = str.split('&'); // '?' entfernen
        var parts = array.length;
        
        for(var i=0; i<parts; ++i)
        {
            var eq = array[i].indexOf('=');
            _keys[i] = array[i].substring(0,eq);
            var val = array[i].substring(eq+1,array[i].length);
            
            _hashMap[_keys[i]] = val;
        }
        
        return _hashMap;
    }

    function getKeysFromSearch() {
        if(_hashMap)
        {
            return _keys;
        }
    }
    // ------------------------------------------------------------------------
    
    // ====  Event handling  ==================================================    
    function getNewEventTarget(src) {
        if(typeof src.EventTarget=="function") {
            return new src.EventTarget();
        } else {
            try {
                src.parent.test();
            } catch(e) {
                _print(e);
            }
        }
    }
    
    function register(id, content) {
        if(!_id) _id = id.split("_")[0];
        parent.postMessage(_flags.onregister + ";" + id + ";" + content, "*"); 
    }
    
    function show(id, center) {
        center = !center ? _mousePos.x + "," + _mousePos.y : "";
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
    function getCookie(name) {
        var data = new Object();
        var strNum, valAll, keyName, subVal;
        var i = 0;
        var clen = document.cookie.length;

        while (i < clen) // Alle Cookies durchlaufen
        {
            strNum = document.cookie.indexOf (";", i); // "Nummer" des Cookies
            if (strNum == -1) strNum = document.cookie.length; // Es gibt nur ein Cookie
            valAll = unescape(document.cookie.substring(i, strNum)); // name=values auslesen
            keyName = valAll.substring(0, valAll.indexOf("=", 0)); // Name des Cookie zurück
            subVal = valAll.substring(valAll.indexOf("=") + 1); // ab '=' Werte zurück
            data[keyName] = (data[keyName]) ? data[keyName] + subVal : subVal;
            i = strNum + 2; // Leerzeichen nach ; überspringen
        }
        
        if(name)
        {
            if(typeof(data[name])!="undefined")
            {
                return data[name]; // gefundenes Cookie zurück
            }
            else return 0; // Gesuchtes Cookie nicht gefunden
        }
        else 
        {
            return data; // Alle Cookies zurück
        }
    }

    function setCookie(name, value, ttl, path) {
        var expire = new Date();
        var string2Sav, diff;
        
        if(!path) path = '/';
        
        if(ttl>0) { // Speichere Cookie
            value = escape(value);
            expire.setTime(ttl*1000);
            string2Sav=name + "=" + value + "; expires=" + expire.toGMTString() + ";path=" + path;
            oldCki=getCookie(name);

            if(oldCki!=0) { // Wenn Cookie schon existiert
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
        } else { // Lösche Cookie
            expire.setTime(0);
            document.cookie = name + "=''; expires=" + expire.toGMTString() + ";path=" + path;
            return 1;
        }
    } 
    // ------------------------------------------------------------------------
        
    // ====  misc stuff  ======================================================   
    function loadScript(scriptname) {  
        var snode = document.createElement('script');  
        snode.setAttribute('type','text/javascript');  
        snode.setAttribute('src',scriptname);  
        document.getElementsByTagName('head')[0].appendChild(snode);  
    }
    
    function loadCSS(scriptname) {  
        var snode = document.createElement('link');  
        snode.setAttribute('type','text/css');  
        snode.setAttribute('href',scriptname);  
        snode.setAttribute('rel','stylesheet');  
        document.getElementsByTagName('head')[0].appendChild(snode);  
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
            obj.addEventListener(type, fn, bub ? bub : false);
        } else if(obj.attachEvent) {
            // IE spezifisch
            if (type=="DOMContentLoaded") type="load"; // IE unterstützt kein DOMContentLoaded
            obj["e"+type+fn] = fn;
            obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
            obj.attachEvent( "on"+type, obj[type+fn] );
        } else {
            obj["on"+type] = fn;
        }
    }
    
    window.removeEvent = function (obj, type, fn) {
        if (obj.removeEventListener) {
            obj.removeEventListener( type, fn, false );
        } else if (obj.detachEvent) {
            obj.detachEvent( "on"+type, obj[type+fn] );
            obj[type+fn] = null;
            obj["e"+type+fn] = null;
        } else {
            obj["on"+type] = null;
        }
    }
    
    Object.toType = (function toType(global) { // http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/#more-2838
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
        _id = Common.getPropsFromSearch(location.search)["id"];
        
        if(_id) {
            // for(var k of ["mousedown", "mouseup", "mousemove"]) { // only firefox
            for(var k in { mousedown:0, mouseup:0, mousemove:0 }) {
                (function(key) {
                    addEvent(window, key, function(e) {
                        e = e || window.event;
                        _mousePos.x = e.clientX;
                        _mousePos.y = e.clientY;
                        if(_id) {
                            parent.postMessage(_flags["on" + key] + ";" + _id + ";" + e.clientX + "," + e.clientY, "*"); 
                        }
                    });    
                })(k);
            }
        }
        
        /* **** Init forms (IE only) **** */    
        if(_removeIEBorders && this.attachEvent) {
            (function(frames) {      
                if(document.getElementsByTagName("iframe")[0]) {
                    if(!frames) frames = document.getElementsByTagName("iframe");
                    
                    // IE Weiche
                    if(typeof document.getElementsByTagName("iframe")[0].getAttribute("FRAMEBORDER") != "undefined") {   
                        // Alle Borders der IFrames entfernen                
                        for(i=0; i<frames.length; ++i)
                        {
                            frames[i].setAttribute("FRAMEBORDER","0");
                            frames[i].setAttribute("ALLOWTRANSPARENCY","true");
                            // Neuzeichnung anstoßen
                            frames[i].parentNode.innerHTML = frames[i].parentNode.innerHTML;
                        }
                    }
                }
            })();
        }
        
        parent.postMessage(_flags.onInit + ";", "*"); 
    });    
    // ------------------------------------------------------------------------
            
    // public methods and properties wrapped in a return 
    // statement and using the object literal
    return {
        createDiv: function newDiv(styleOrClass, base, self) { return newElement("div", styleOrClass, base, self); },
        createElement: newElement,
        appendStyle: appendStyle,
        getStyle: getStyle,
        Oberserverable: Oberserverable,
        
        getPropsFromSearch: function(str) { return getProps(str.substring(1,str.length)); },
        getProps: getProps,
        getKeysFromSearch: getKeysFromSearch,
        
        addEvent: addEvent,
        removeEvent: removeEvent,
        getNewEventTarget: getNewEventTarget,
        
        docId: _id,
        msg: _flags, 
        registerObject: register,
        showObject: show,
        hideObject: hide,
        unregisterObject: unregister,
        
        getCookie: getCookie,
        setCookie: setCookie,
        window: _mousePos
    }
}();

var Common = oc;

    