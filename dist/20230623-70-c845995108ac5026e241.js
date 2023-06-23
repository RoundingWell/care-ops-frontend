(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[70],{2256:()=>{},7027:(t,e,i)=>{"use strict";i.d(e,{Z:()=>u});var n=i(7198),s=i(8088),r=i.n(s);function o(t,e){this.instances={},this.Model=t,this.modelName=e,this.ModelConstructor=this._getConstructor(t)}n.default.extend(o.prototype,{_getConstructor:function(t){var e=this,i=function(t,i){return e.get(t,i)};return n.default.extend(i,t),i.prototype=this.Model.prototype,i},get:function(t,e){var i=t&&t[this.Model.prototype.idAttribute],n=this.instances[i];return n?(n.set(t),h.trigger("update",n,this),n):this._new(t,e)},_new:function(t,e){var i=new this.Model(t,e);return i.isNew()?i.once("change:".concat(i.idAttribute),this._add,this):this._add(i),i.on("destroy",this.remove,this),i},_add:function(t){this.instances[t.id]||(this.instances[t.id]=t,h.trigger("add",t,this))},remove:function(t){return this.instances[t.id]?(delete this.instances[t.id],h.trigger("remove",t,this),t):t}});var a={};function h(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n.default.uniqueId("Store_");return h.add(t,e).ModelConstructor}n.default.extend(h,r().Events,{ModelCache:o,add:function(t,e){if(!e)throw"Model name required";return a[e]?a[e]:a[e]=new h.ModelCache(t,e)},getCache:function(t){if(!a[t])throw'Unrecognized Model: "'.concat(t,'"');return a[t]},getAllCache:function(){return n.default.clone(a)},get:function(t){return h.getCache(t).ModelConstructor},getAll:function(){return n.default.reduce(a,(function(t,e,i){return t[i]=e.ModelConstructor,t}),{})},remove:function(t){delete a[t]},removeAll:function(){a={}}}),r().Store=h;const u=h},3271:function(t){t.exports=function(){"use strict";var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,i=/\d\d/,n=/\d\d?/,s=/\d*[^-_:/,()\s\d]+/,r={},o=function(t){return(t=+t)+(t>68?1900:2e3)},a=function(t){return function(e){this[t]=+e}},h=[/[+-]\d\d:?(\d\d)?|Z/,function(t){(this.zone||(this.zone={})).offset=function(t){if(!t)return 0;if("Z"===t)return 0;var e=t.match(/([+-]|\d\d)/g),i=60*e[1]+(+e[2]||0);return 0===i?0:"+"===e[0]?-i:i}(t)}],u=function(t){var e=r[t];return e&&(e.indexOf?e:e.s.concat(e.f))},d=function(t,e){var i,n=r.meridiem;if(n){for(var s=1;s<=24;s+=1)if(t.indexOf(n(s,0,e))>-1){i=s>12;break}}else i=t===(e?"pm":"PM");return i},l={A:[s,function(t){this.afternoon=d(t,!1)}],a:[s,function(t){this.afternoon=d(t,!0)}],S:[/\d/,function(t){this.milliseconds=100*+t}],SS:[i,function(t){this.milliseconds=10*+t}],SSS:[/\d{3}/,function(t){this.milliseconds=+t}],s:[n,a("seconds")],ss:[n,a("seconds")],m:[n,a("minutes")],mm:[n,a("minutes")],H:[n,a("hours")],h:[n,a("hours")],HH:[n,a("hours")],hh:[n,a("hours")],D:[n,a("day")],DD:[i,a("day")],Do:[s,function(t){var e=r.ordinal,i=t.match(/\d+/);if(this.day=i[0],e)for(var n=1;n<=31;n+=1)e(n).replace(/\[|\]/g,"")===t&&(this.day=n)}],M:[n,a("month")],MM:[i,a("month")],MMM:[s,function(t){var e=u("months"),i=(u("monthsShort")||e.map((function(t){return t.slice(0,3)}))).indexOf(t)+1;if(i<1)throw new Error;this.month=i%12||i}],MMMM:[s,function(t){var e=u("months").indexOf(t)+1;if(e<1)throw new Error;this.month=e%12||e}],Y:[/[+-]?\d+/,a("year")],YY:[i,function(t){this.year=o(t)}],YYYY:[/\d{4}/,a("year")],Z:h,ZZ:h};function c(i){var n,s;n=i,s=r&&r.formats;for(var o=(i=n.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(e,i,n){var r=n&&n.toUpperCase();return i||s[n]||t[n]||s[r].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,i){return e||i.slice(1)}))}))).match(e),a=o.length,h=0;h<a;h+=1){var u=o[h],d=l[u],c=d&&d[0],f=d&&d[1];o[h]=f?{regex:c,parser:f}:u.replace(/^\[|\]$/g,"")}return function(t){for(var e={},i=0,n=0;i<a;i+=1){var s=o[i];if("string"==typeof s)n+=s.length;else{var r=s.regex,h=s.parser,u=t.slice(n),d=r.exec(u)[0];h.call(e,d),t=t.replace(d,"")}}return function(t){var e=t.afternoon;if(void 0!==e){var i=t.hours;e?i<12&&(t.hours+=12):12===i&&(t.hours=0),delete t.afternoon}}(e),e}}return function(t,e,i){i.p.customParseFormat=!0,t&&t.parseTwoDigitYear&&(o=t.parseTwoDigitYear);var n=e.prototype,s=n.parse;n.parse=function(t){var e=t.date,n=t.utc,o=t.args;this.$u=n;var a=o[1];if("string"==typeof a){var h=!0===o[2],u=!0===o[3],d=h||u,l=o[2];u&&(l=o[2]),r=this.$locale(),!h&&l&&(r=i.Ls[l]),this.$d=function(t,e,i){try{if(["x","X"].indexOf(e)>-1)return new Date(("X"===e?1e3:1)*t);var n=c(e)(t),s=n.year,r=n.month,o=n.day,a=n.hours,h=n.minutes,u=n.seconds,d=n.milliseconds,l=n.zone,f=new Date,p=o||(s||r?1:f.getDate()),g=s||f.getFullYear(),v=0;s&&!r||(v=r>0?r-1:f.getMonth());var _=a||0,w=h||0,m=u||0,M=d||0;return l?new Date(Date.UTC(g,v,p,_,w,m,M+60*l.offset*1e3)):i?new Date(Date.UTC(g,v,p,_,w,m,M)):new Date(g,v,p,_,w,m,M)}catch(t){return new Date("")}}(e,a,n),this.init(),l&&!0!==l&&(this.$L=this.locale(l).$L),d&&e!=this.format(a)&&(this.$d=new Date("")),r={}}else if(a instanceof Array)for(var f=a.length,p=1;p<=f;p+=1){o[1]=a[p-1];var g=i.apply(this,o);if(g.isValid()){this.$d=g.$d,this.$L=g.$L,this.init();break}p===f&&(this.$d=new Date(""))}else s.call(this,t)}}}()},3230:function(t){t.exports=function(){"use strict";var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(e,i,n){var s=i.prototype,r=s.format;n.en.formats=t,s.format=function(e){void 0===e&&(e="YYYY-MM-DDTHH:mm:ssZ");var i=this.$locale().formats,n=function(e,i){return e.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(e,n,s){var r=s&&s.toUpperCase();return n||i[s]||t[s]||i[r].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,i){return e||i.slice(1)}))}))}(e,void 0===i?{}:i);return r.call(this,n)}}}()},536:function(t){t.exports=function(){"use strict";return function(t,e,i){t=t||{};var n=e.prototype,s={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function r(t,e,i,s){return n.fromToBase(t,e,i,s)}i.en.relativeTime=s,n.fromToBase=function(e,n,r,o,a){for(var h,u,d,l=r.$locale().relativeTime||s,c=t.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],f=c.length,p=0;p<f;p+=1){var g=c[p];g.d&&(h=o?i(e).diff(r,g.d,!0):r.diff(e,g.d,!0));var v=(t.rounding||Math.round)(Math.abs(h));if(d=h>0,v<=g.r||!g.r){v<=1&&p>0&&(g=c[p-1]);var _=l[g.l];a&&(v=a(""+v)),u="string"==typeof _?_.replace("%d",v):_(v,n,g.l,d);break}}if(n)return u;var w=d?l.future:l.past;return"function"==typeof w?w(u):w.replace("%s",u)},n.to=function(t,e){return r(t,e,this,!0)},n.from=function(t,e){return r(t,e,this)};var o=function(t){return t.$u?i.utc():i()};n.toNow=function(t){return this.to(o(this),t)},n.fromNow=function(t){return this.from(o(this),t)}}}()},976:function(t){t.exports=function(){"use strict";var t="minute",e=/[+-]\d\d(?::?\d\d)?/g,i=/([+-]|\d\d)/g;return function(n,s,r){var o=s.prototype;r.utc=function(t){return new s({date:t,utc:!0,args:arguments})},o.utc=function(e){var i=r(this.toDate(),{locale:this.$L,utc:!0});return e?i.add(this.utcOffset(),t):i},o.local=function(){return r(this.toDate(),{locale:this.$L,utc:!1})};var a=o.parse;o.parse=function(t){t.utc&&(this.$u=!0),this.$utils().u(t.$offset)||(this.$offset=t.$offset),a.call(this,t)};var h=o.init;o.init=function(){if(this.$u){var t=this.$d;this.$y=t.getUTCFullYear(),this.$M=t.getUTCMonth(),this.$D=t.getUTCDate(),this.$W=t.getUTCDay(),this.$H=t.getUTCHours(),this.$m=t.getUTCMinutes(),this.$s=t.getUTCSeconds(),this.$ms=t.getUTCMilliseconds()}else h.call(this)};var u=o.utcOffset;o.utcOffset=function(n,s){var r=this.$utils().u;if(r(n))return this.$u?0:r(this.$offset)?u.call(this):this.$offset;if("string"==typeof n&&(n=function(t){void 0===t&&(t="");var n=t.match(e);if(!n)return null;var s=(""+n[0]).match(i)||["-",0,0],r=s[0],o=60*+s[1]+ +s[2];return 0===o?0:"+"===r?o:-o}(n),null===n))return this;var o=Math.abs(n)<=16?60*n:n,a=this;if(s)return a.$offset=o,a.$u=0===n,a;if(0!==n){var h=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(a=this.local().add(o+h,t)).$offset=o,a.$x.$localOffset=h}else a=this.utc();return a};var d=o.format;o.format=function(t){var e=t||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return d.call(this,e)},o.valueOf=function(){var t=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*t},o.isUTC=function(){return!!this.$u},o.toISOString=function(){return this.toDate().toISOString()},o.toString=function(){return this.toDate().toUTCString()};var l=o.toDate;o.toDate=function(t){return"s"===t&&this.$offset?r(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():l.call(this)};var c=o.diff;o.diff=function(t,e,i){if(t&&this.$u===t.$u)return c.call(this,t,e,i);var n=this.local(),s=r(t).local();return c.call(n,s,e,i)}}}()},6134:function(t){t.exports=function(){"use strict";return function(t,e){e.prototype.weekday=function(t){var e=this.$locale().weekStart||0,i=this.$W,n=(i<e?i+7:i)-e;return this.$utils().u(t)?n:this.subtract(n,"day").add(t,"day")}}}()},2894:(t,e,i)=>{"use strict";i.d(e,{gV:()=>p,j_:()=>_,wA:()=>v});var n=i(7198),s=i(8088),r=i.n(s),o=i(6718),a=["StateModel","stateEvents"],h={StateModel:r().Model,initState:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this._initState(t),this.delegateStateEvents(),this},_initState:function(t){this.mergeOptions(t,a),this._removeEventHandlers();var e=this._getStateModel(t);this._stateModel=new e(t.state),this._setEventHandlers()},delegateStateEvents:function(){return this.undelegateStateEvents(),this.bindEvents(this._stateModel,n.default.result(this,"stateEvents")),this},undelegateStateEvents:function(){return this.unbindEvents(this._stateModel),this},_setEventHandlers:function(){this.on("destroy",this._destroyState)},_removeEventHandlers:function(){this._stateModel&&(this.undelegateStateEvents(),this._stateModel.stopListening(),this.off("destroy",this._destroyState))},_getStateModel:function(t){if(this.StateModel.prototype instanceof r().Model||this.StateModel===r().Model)return this.StateModel;if(n.default.isFunction(this.StateModel))return this.StateModel.call(this,t);throw new Error('"StateModel" must be a model class or a function that returns a model class')},setState:function(){return this._stateModel.set.apply(this._stateModel,arguments)},resetStateDefaults:function(){var t=n.default.result(this._stateModel,"defaults");return this._stateModel.set(t)},getState:function(t){return t?this._stateModel.get.apply(this._stateModel,arguments):this._stateModel},toggleState:function(t,e){return arguments.length>1?this._stateModel.set(t,!!e):this._stateModel.set(t,!this._stateModel.get(t))},hasState:function(t){return this._stateModel.has(t)},_destroyState:function(){this._stateModel.stopListening()}},u=["childApps","childAppOptions"],d={_initChildApps:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this._childApps={},this.mergeOptions(t,u);var e=this.childApps;e&&(n.default.isFunction(e)&&(e=e.call(this,t)),this.addChildApps(e))},_getChildStartOpts:function(t){var e=this,i=t._tkOpts||{},s={region:this.getRegion(i.regionName)};return n.default.each(i.getOptions,(function(t){s[t]=e.getOption(t)})),s},_startChildApp:function(t,e){var i=this._getChildStartOpts(t);return t.start(n.default.extend(i,e))},_shouldActWithRestart:function(t,e){if(!this._isRestarting)return!0;var i=n.default.result(t,"restartWithParent");return!0===i||!(!1===i||!n.default.result(t,e))||void 0},_startChildApps:function(){var t=this,e="startWithParent";n.default.each(this._childApps,(function(i){t._shouldActWithRestart(i,e)&&(t._isRestarting||n.default.result(i,e))&&t._startChildApp(i)}))},_stopChildApps:function(){var t=this,e="stopWithParent";n.default.each(this._childApps,(function(i){t._shouldActWithRestart(i,e)&&(t._isRestarting||n.default.result(i,e))&&i.stop()}))},startChildApp:function(t,e){var i=this.getChildApp(t);if(!i)throw new Error("A child app with the name ".concat(t," does not exist."));return this._startChildApp(i,e)},stopChildApp:function(t,e){return this.getChildApp(t).stop(e)},_destroyChildApps:function(){n.default.each(this._childApps,(function(t){n.default.result(t,"preventDestroy")||t.destroy()}))},_buildAppFromObject:function(t){var e=t.AppClass,i=n.default.omit(t,"AppClass","regionName","getOptions"),s=this.buildApp(e,i);return s._tkOpts=n.default.pick(t,"regionName","getOptions"),s},_buildApp:function(t,e){return n.default.isFunction(t)?this.buildApp(t,e):n.default.isObject(t)?this._buildAppFromObject(t):void 0},buildApp:function(t,e){return new t(e=n.default.extend({},this.childAppOptions,e))},_ensureAppIsUnique:function(t){if(this._childApps[t])throw new Error('A child App with name "'.concat(t,'" has already been added.'))},addChildApps:function(t){n.default.each(t,n.default.bind((function(t,e){this.addChildApp(e,t)}),this))},addChildApp:function(t,e,i){this._ensureAppIsUnique(t);var s=this._buildApp(e,i);if(!s)throw new Error("App build failed.  Incorrect configuration.");return s._name=t,this._childApps[t]=s,s._on("destroy",n.default.partial(this._removeChildApp,t),this),this.isRunning()&&n.default.result(s,"startWithParent")&&this._startChildApp(s),s},getName:function(){return this._name},getChildApps:function(){return n.default.clone(this._childApps)},getChildApp:function(t){return this._childApps[t]},_removeChildApp:function(t){delete this._childApps[t]._name,delete this._childApps[t]},removeChildApps:function(){var t=this.getChildApps();return n.default.each(this._childApps,n.default.bind((function(t,e){this.removeChildApp(e)}),this)),t},removeChildApp:function(t,e){e=n.default.extend({},e);var i=this.getChildApp(t);if(i)return e.preventDestroy||n.default.result(i,"preventDestroy")?this._removeChildApp(t):i.destroy(),i}},l={_stopRunningEvents:function(){n.default.each(this._runningEvents,n.default.bind((function(t){this.off.apply(this,t)}),this)),this._runningEvents=[]},_stopRunningListeners:function(){n.default.each(this._runningListeningTo,n.default.bind((function(t){this.stopListening.apply(this,t)}),this)),this._runningListeningTo=[]},on:function(){return this._isRunning&&(this._runningEvents=this._runningEvents||[],this._runningEvents.push(arguments)),o.MnObject.prototype.on.apply(this,arguments)},_on:o.MnObject.prototype.on,listenTo:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),o.MnObject.prototype.listenTo.apply(this,arguments)},_listenTo:o.MnObject.prototype.listenTo,listenToOnce:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),o.MnObject.prototype.listenToOnce.apply(this,arguments)}},c={viewEventPrefix:!1,_buildEventProxies:function(){var t=n.default.result(this,"viewEvents")||{};this._viewEvents=this.normalizeMethods(t),this._viewTriggers=n.default.result(this,"viewTriggers")||{},this._viewEventPrefix=n.default.result(this,"viewEventPrefix")},_proxyViewEvents:function(t){this.listenTo(t,"all",this._childViewEventHandler)},_childViewEventHandler:function(t){for(var e=this._viewEvents,i=arguments.length,s=new Array(i>1?i-1:0),r=1;r<i;r++)s[r-1]=arguments[r];n.default.isFunction(e[t])&&e[t].apply(this,s);var o=this._viewTriggers;n.default.isString(o[t])&&this.triggerMethod.apply(this,[o[t]].concat(s));var a=this._viewEventPrefix;if(!1!==a){var h="".concat(a,":").concat(t);this.triggerMethod.apply(this,[h].concat(s))}}},f=["startWithParent","restartWithParent","stopWithParent","startAfterInitialized","preventDestroy","StateModel","stateEvents","viewEventPrefix","viewEvents","viewTriggers"],p=o.Application.extend({_isRunning:!1,_isRestarting:!1,preventDestroy:!1,startAfterInitialized:!1,startWithParent:!1,stopWithParent:!0,restartWithParent:null,constructor:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.mergeOptions(t,f),this.options=n.default.extend({},n.default.result(this,"options"),t),this._initChildApps(t),o.Application.call(this,t),n.default.result(this,"startAfterInitialized")&&this.start(t)},_ensureAppIsIntact:function(){if(this._isDestroyed)throw new Error("App has already been destroyed and cannot be used.")},isRunning:function(){return this._isRunning},isRestarting:function(){return this._isRestarting},start:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this._ensureAppIsIntact(),this._isRunning||(t.region&&this.setRegion(t.region),t.view&&this.setView(t.view),this._initState(t),this._buildEventProxies(),this.triggerMethod("before:start",t),this._isRunning=!0,this._bindRunningEvents(),this.triggerStart(t)),this},_bindRunningEvents:function(){this._region&&this._regionEventMonitor(),this._view&&this._proxyViewEvents(this._view),this.delegateStateEvents()},restart:function(){var t=this.getState().attributes;return this._isRestarting=!0,this.stop().start({state:t}),this._isRestarting=!1,this},finallyStart:function(){this._startChildApps(),this.triggerMethod.apply(this,["start"].concat(Array.prototype.slice.call(arguments)))},triggerStart:function(t){this.finallyStart(t)},stop:function(t){return this._isRunning?(this.triggerMethod("before:stop",t),this._stopChildApps(),this._isRunning=!1,this.triggerMethod("stop",t),this._stopRunningListeners(),this._stopRunningEvents(),this):this},destroy:function(){return this._isDestroyed||(this.stop(),this._removeView(),this._destroyChildApps(),o.Application.prototype.destroy.apply(this,arguments)),this},setRegion:function(t){return this._region&&this.stopListening(this._region),this._region=t,t.currentView&&this.setView(t.currentView),this._isRunning&&this._regionEventMonitor(),t},_regionEventMonitor:function(){this.listenTo(this._region,{"before:show":this._onBeforeShow,empty:this._onEmpty})},_onBeforeShow:function(t,e){this.setView(e)},_onEmpty:function(t,e){e===this._view&&this._removeView()},_removeView:function(){this._view&&(this.stopListening(this._view),delete this._view)},getRegion:function(t){return t?this.getView().getRegion(t):this._region},setView:function(t){return this._view===t||(this._view&&this.stopListening(this._view),this._view=t,this._isRunning&&this._proxyViewEvents(t),this._listenTo(this._view,"destroy",this._removeView)),t},getView:function(){return this._view||this._region&&this._region.currentView},showView:function(){for(var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this._view,e=this.getRegion(),i=arguments.length,n=new Array(i>1?i-1:0),s=1;s<i;s++)n[s-1]=arguments[s];return e.show.apply(e,[t].concat(n)),this.isRunning()||this.setView(e.currentView),t},showChildView:function(t,e){for(var i,n=arguments.length,s=new Array(n>2?n-2:0),r=2;r<n;r++)s[r-2]=arguments[r];return(i=this.getView()).showChildView.apply(i,[t,e].concat(s)),e},getChildView:function(t){return this.getView().getChildView(t)}});n.default.extend(p.prototype,h,d,l,c);var g=["regionOptions","ViewClass","viewEventPrefix","viewEvents","viewTriggers","viewOptions"],v=o.Application.extend({ViewClass:o.View,constructor:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.mergeOptions(t,g),this.options=n.default.extend({},n.default.result(this,"options"),t),this._buildEventProxies(),this._initState(t),o.Application.call(this,t),this.delegateStateEvents()},showIn:function(t,e,i){return this._region=t,this.show(e,i),this},show:function(t,e){var i=this.getRegion();if(!i)throw new Error("Component has no defined region.");var n=this._getView(t);return this.stopListening(i.currentView,"destroy",this.destroy),this.triggerMethod("before:show",this,n,t,e),this.showView(n,this.mixinRegionOptions(e)),this.listenTo(i.currentView,"destroy",this.destroy),this.triggerMethod("show",this,n,t,e),this},empty:function(){var t=this.getRegion();if(!t)throw new Error("Component has no defined region.");return this.stopListening(t.currentView,"destroy",this.destroy),t.empty(),this},mixinRegionOptions:function(t){var e=n.default.result(this,"regionOptions");return n.default.extend({},e,t)},_getView:function(t){var e=this._getViewClass(t),i=this.mixinViewOptions(t),n=this.buildView(e,i);return this._proxyViewEvents(n),n},_getViewClass:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=this.ViewClass;if(e.prototype instanceof r().View||e===r().View)return e;if(n.default.isFunction(e))return e.call(this,t);throw new Error('"ViewClass" must be a view class or a function that returns a view class')},mixinViewOptions:function(t){var e=n.default.result(this,"viewOptions");return n.default.extend({state:this.getState().attributes},e,t)},buildView:function(t,e){return new t(e)},destroy:function(){if(this._isDestroyed)return this;var t=this.getRegion();return t&&t.empty(),o.Application.prototype.destroy.apply(this,arguments),this}},{setRegion:function(t){this.prototype.region=t}});function _(t){var e=h;t.prototype.StateModel&&(e=n.default.omit(h,"StateModel")),n.default.extend(t.prototype,e)}n.default.extend(v.prototype,h,c)},3019:(t,e,i)=>{"use strict";i.d(e,{S:()=>s});const n=[];for(let t=0;t<256;++t)n.push((t+256).toString(16).slice(1));function s(t,e=0){return(n[t[e+0]]+n[t[e+1]]+n[t[e+2]]+n[t[e+3]]+"-"+n[t[e+4]]+n[t[e+5]]+"-"+n[t[e+6]]+n[t[e+7]]+"-"+n[t[e+8]]+n[t[e+9]]+"-"+n[t[e+10]]+n[t[e+11]]+n[t[e+12]]+n[t[e+13]]+n[t[e+14]]+n[t[e+15]]).toLowerCase()}},1766:(t,e,i)=>{"use strict";i.d(e,{Z:()=>h});const n={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let s;const r=new Uint8Array(16);function o(){if(!s&&(s="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!s))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return s(r)}var a=i(3019);const h=function(t,e,i){if(n.randomUUID&&!e&&!t)return n.randomUUID();const s=(t=t||{}).random||(t.rng||o)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,e){i=i||0;for(let t=0;t<16;++t)e[i+t]=s[t];return e}return(0,a.S)(s)}}}]);