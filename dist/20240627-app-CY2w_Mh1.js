import{d as x,H as Y,p as de,$ as X}from"./20240627-parsePhoneNumber-D9cgvm8h.js";import{V as o,W as le,e as I,X as fe,S as ht,D as S,m as z,p as Q,j as At,O as pe,r as Dt,M as ge,A as tt,B as et,K as me,I as st,h as Tt,Y as ve,H as we,g as Z,i as yt,Z as Lt,$ as _e,a0 as ye,w as Ot,E as Vt,x as Me,F as Se,a1 as Ae,u as Ce,b as Ct,q as Ee}from"./20240627-index-Dt6oT601.js";import{B as m,M as B,A as K,V as xe,R as U,_ as Yt,e as It}from"./20240627-runtime-WlPobKHk.js";var be=["StateModel","stateEvents"],at={StateModel:m.Model,initState:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._initState(e),this.delegateStateEvents(),this},_initState:function(e){this.mergeOptions(e,be),this._removeEventHandlers();var i=this._getStateModel(e);this._stateModel=new i(e.state),this._setEventHandlers()},delegateStateEvents:function(){return this.undelegateStateEvents(),this.bindEvents(this._stateModel,o.result(this,"stateEvents")),this},undelegateStateEvents:function(){return this.unbindEvents(this._stateModel),this},_setEventHandlers:function(){this.on("destroy",this._destroyState)},_removeEventHandlers:function(){this._stateModel&&(this.undelegateStateEvents(),this._stateModel.stopListening(),this.off("destroy",this._destroyState))},_getStateModel:function(e){if(this.StateModel.prototype instanceof m.Model||this.StateModel===m.Model)return this.StateModel;if(o.isFunction(this.StateModel))return this.StateModel.call(this,e);throw new Error('"StateModel" must be a model class or a function that returns a model class')},setState:function(){return this._stateModel.set.apply(this._stateModel,arguments)},resetStateDefaults:function(){var e=o.result(this._stateModel,"defaults");return this._stateModel.set(e)},getState:function(e){return e?this._stateModel.get.apply(this._stateModel,arguments):this._stateModel},toggleState:function(e,i){return arguments.length>1?this._stateModel.set(e,!!i):this._stateModel.set(e,!this._stateModel.get(e))},hasState:function(e){return this._stateModel.has(e)},_destroyState:function(){this._stateModel.stopListening()}},$e=["childApps","childAppOptions"],Re={_initChildApps:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this._childApps={},this.mergeOptions(e,$e);var i=this.childApps;i&&(o.isFunction(i)&&(i=i.call(this,e)),this.addChildApps(i))},_getChildStartOpts:function(e){var i=this,n=e._tkOpts||{},s={region:this.getRegion(n.regionName)};return o.each(n.getOptions,function(a){s[a]=i.getOption(a)}),s},_startChildApp:function(e,i){var n=this._getChildStartOpts(e);return e.start(o.extend(n,i))},_shouldActWithRestart:function(e,i){if(!this._isRestarting)return!0;var n=o.result(e,"restartWithParent");if(n===!0||n!==!1&&o.result(e,i))return!0},_startChildApps:function(){var e=this,i="startWithParent";o.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!o.result(n,i)||e._startChildApp(n))})},_stopChildApps:function(){var e=this,i="stopWithParent";o.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!o.result(n,i)||n.stop())})},startChildApp:function(e,i){var n=this.getChildApp(e);if(!n)throw new Error("A child app with the name ".concat(e," does not exist."));return this._startChildApp(n,i)},stopChildApp:function(e,i){return this.getChildApp(e).stop(i)},_destroyChildApps:function(){o.each(this._childApps,function(e){o.result(e,"preventDestroy")||e.destroy()})},_buildAppFromObject:function(e){var i=e.AppClass,n=o.omit(e,"AppClass","regionName","getOptions"),s=this.buildApp(i,n);return s._tkOpts=o.pick(e,"regionName","getOptions"),s},_buildApp:function(e,i){if(o.isFunction(e))return this.buildApp(e,i);if(o.isObject(e))return this._buildAppFromObject(e)},buildApp:function(e,i){return i=o.extend({},this.childAppOptions,i),new e(i)},_ensureAppIsUnique:function(e){if(this._childApps[e])throw new Error('A child App with name "'.concat(e,'" has already been added.'))},addChildApps:function(e){o.each(e,o.bind(function(i,n){this.addChildApp(n,i)},this))},addChildApp:function(e,i,n){this._ensureAppIsUnique(e);var s=this._buildApp(i,n);if(!s)throw new Error("App build failed.  Incorrect configuration.");return s._name=e,this._childApps[e]=s,s._on("destroy",o.partial(this._removeChildApp,e),this),this.isRunning()&&o.result(s,"startWithParent")&&this._startChildApp(s),s},getName:function(){return this._name},getChildApps:function(){return o.clone(this._childApps)},getChildApp:function(e){return this._childApps[e]},_removeChildApp:function(e){delete this._childApps[e]._name,delete this._childApps[e]},removeChildApps:function(){var e=this.getChildApps();return o.each(this._childApps,o.bind(function(i,n){this.removeChildApp(n)},this)),e},removeChildApp:function(e,i){i=o.extend({},i);var n=this.getChildApp(e);if(n)return i.preventDestroy||o.result(n,"preventDestroy")?this._removeChildApp(e):n.destroy(),n}},De={_stopRunningEvents:function(){o.each(this._runningEvents,o.bind(function(e){this.off.apply(this,e)},this)),this._runningEvents=[]},_stopRunningListeners:function(){o.each(this._runningListeningTo,o.bind(function(e){this.stopListening.apply(this,e)},this)),this._runningListeningTo=[]},on:function(){return this._isRunning&&(this._runningEvents=this._runningEvents||[],this._runningEvents.push(arguments)),B.prototype.on.apply(this,arguments)},_on:B.prototype.on,listenTo:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),B.prototype.listenTo.apply(this,arguments)},_listenTo:B.prototype.listenTo,listenToOnce:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),B.prototype.listenToOnce.apply(this,arguments)}},Pt={viewEventPrefix:!1,_buildEventProxies:function(){var e=o.result(this,"viewEvents")||{};this._viewEvents=this.normalizeMethods(e),this._viewTriggers=o.result(this,"viewTriggers")||{},this._viewEventPrefix=o.result(this,"viewEventPrefix")},_proxyViewEvents:function(e){this.listenTo(e,"all",this._childViewEventHandler)},_childViewEventHandler:function(e){for(var i=this._viewEvents,n=arguments.length,s=new Array(n>1?n-1:0),a=1;a<n;a++)s[a-1]=arguments[a];o.isFunction(i[e])&&i[e].apply(this,s);var d=this._viewTriggers;o.isString(d[e])&&this.triggerMethod.apply(this,[d[e]].concat(s));var p=this._viewEventPrefix;if(p!==!1){var l="".concat(p,":").concat(e);this.triggerMethod.apply(this,[l].concat(s))}}},Te=["startWithParent","restartWithParent","stopWithParent","startAfterInitialized","preventDestroy","StateModel","stateEvents","viewEventPrefix","viewEvents","viewTriggers"],Ht=K.extend({_isRunning:!1,_isRestarting:!1,preventDestroy:!1,startAfterInitialized:!1,startWithParent:!1,stopWithParent:!0,restartWithParent:null,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,Te),this.options=o.extend({},o.result(this,"options"),e),this._initChildApps(e),K.call(this,e),o.result(this,"startAfterInitialized")&&this.start(e)},_ensureAppIsIntact:function(){if(this._isDestroyed)throw new Error("App has already been destroyed and cannot be used.")},isRunning:function(){return this._isRunning},isRestarting:function(){return this._isRestarting},start:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._ensureAppIsIntact(),this._isRunning?this:(e.region&&this.setRegion(e.region),e.view&&this.setView(e.view),this._initState(e),this._buildEventProxies(),this.triggerMethod("before:start",e),this._isRunning=!0,this._bindRunningEvents(),this.triggerStart(e),this)},_bindRunningEvents:function(){this._region&&this._regionEventMonitor(),this._view&&this._proxyViewEvents(this._view),this.delegateStateEvents()},restart:function(){var e=this.getState().attributes;return this._isRestarting=!0,this.stop().start({state:e}),this._isRestarting=!1,this},finallyStart:function(){this._startChildApps(),this.triggerMethod.apply(this,["start"].concat(Array.prototype.slice.call(arguments)))},triggerStart:function(e){this.finallyStart(e)},stop:function(e){return this._isRunning?(this.triggerMethod("before:stop",e),this._stopChildApps(),this._isRunning=!1,this.triggerMethod("stop",e),this._stopRunningListeners(),this._stopRunningEvents(),this):this},destroy:function(){return this._isDestroyed?this:(this.stop(),this._removeView(),this._destroyChildApps(),K.prototype.destroy.apply(this,arguments),this)},setRegion:function(e){return this._region&&this.stopListening(this._region),this._region=e,e.currentView&&this.setView(e.currentView),this._isRunning&&this._regionEventMonitor(),e},_regionEventMonitor:function(){this.listenTo(this._region,{"before:show":this._onBeforeShow,empty:this._onEmpty})},_onBeforeShow:function(e,i){this.setView(i)},_onEmpty:function(e,i){i===this._view&&this._removeView()},_removeView:function(){this._view&&(this.stopListening(this._view),delete this._view)},getRegion:function(e){return e?this.getView().getRegion(e):this._region},setView:function(e){return this._view===e||(this._view&&this.stopListening(this._view),this._view=e,this._isRunning&&this._proxyViewEvents(e),this._listenTo(this._view,"destroy",this._removeView)),e},getView:function(){return this._view||this._region&&this._region.currentView},showView:function(){for(var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this._view,i=this.getRegion(),n=arguments.length,s=new Array(n>1?n-1:0),a=1;a<n;a++)s[a-1]=arguments[a];return i.show.apply(i,[e].concat(s)),this.isRunning()||this.setView(i.currentView),e},showChildView:function(e,i){for(var n,s=arguments.length,a=new Array(s>2?s-2:0),d=2;d<s;d++)a[d-2]=arguments[d];return(n=this.getView()).showChildView.apply(n,[e,i].concat(a)),i},getChildView:function(e){return this.getView().getChildView(e)}});o.extend(Ht.prototype,at,Re,De,Pt);var Le=["regionOptions","ViewClass","viewEventPrefix","viewEvents","viewTriggers","viewOptions"],Ft=K.extend({ViewClass:xe,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,Le),this.options=o.extend({},o.result(this,"options"),e),this._buildEventProxies(),this._initState(e),K.call(this,e),this.delegateStateEvents()},showIn:function(e,i,n){return this._region=e,this.show(i,n),this},show:function(e,i){var n=this.getRegion();if(!n)throw new Error("Component has no defined region.");var s=this._getView(e);return this.stopListening(n.currentView,"destroy",this.destroy),this.triggerMethod("before:show",this,s,e,i),this.showView(s,this.mixinRegionOptions(i)),this.listenTo(n.currentView,"destroy",this.destroy),this.triggerMethod("show",this,s,e,i),this},empty:function(){var e=this.getRegion();if(!e)throw new Error("Component has no defined region.");return this.stopListening(e.currentView,"destroy",this.destroy),e.empty(),this},mixinRegionOptions:function(e){var i=o.result(this,"regionOptions");return o.extend({},i,e)},_getView:function(e){var i=this._getViewClass(e),n=this.mixinViewOptions(e),s=this.buildView(i,n);return this._proxyViewEvents(s),s},_getViewClass:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},i=this.ViewClass;if(i.prototype instanceof m.View||i===m.View)return i;if(o.isFunction(i))return i.call(this,e);throw new Error('"ViewClass" must be a view class or a function that returns a view class')},mixinViewOptions:function(e){var i=o.result(this,"viewOptions");return o.extend({state:this.getState().attributes},i,e)},buildView:function(e,i){return new e(i)},destroy:function(){if(this._isDestroyed)return this;var e=this.getRegion();return e&&e.empty(),K.prototype.destroy.apply(this,arguments),this}},{setRegion:function(e){this.prototype.region=e}});o.extend(Ft.prototype,at,Pt);function Ti(t){var e=at;t.prototype.StateModel&&(e=o.omit(at,"StateModel")),o.extend(t.prototype,e)}const Oe={getEl(t){return[t]},findEl(t,e){return t.querySelectorAll(e)},detachEl(t){t.parentNode&&t.parentNode.removeChild(t)},hasContents(t){return t.hasChildNodes()},setContents(t,e){t.innerHTML=e},appendContents(t,e){t.appendChild(e)},detachContents(t){t.textContent=""}},ct=[];function Ve(t,e,i){return ct[t]={fetcher:e,controller:i},e}function Ye(t){return S(ct[t],"fetcher")}function Ut(t){delete ct[t]}function Ie(t){const e=S(ct[t],"controller");e&&(e.abort(),Ut(t))}function Pe(t,e={}){const i=Ye(t);return i?e.abort!==!1?(Ie(t),!1):i:!1}async function He(t,e={}){const i=await U.request("auth","getToken"),n=new AbortController,s=t;e=I({signal:n.signal,dataType:"json",headers:fe(e.headers,{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json"})},e),i&&(e.headers.Authorization=`Bearer ${i}`),!e.method||e.method==="GET"?t=Ue(t,e.data):e.data&&(e.body=e.data);const a=U.request("bootstrap","currentWorkspace");return a&&(e.headers.Workspace=a.id),Ve(s,fetch(t,e),n)}function Et(t){return encodeURIComponent(t??"")}function xt(t){if(Q(t)){const e=encodeURIComponent(pe(t));return Dt(ge(t),(i,n)=>`${i}[${encodeURIComponent(n)}]`,e)}return encodeURIComponent(t)}function kt(t,e){return Q(t)?`${xt(e)}=${t.map(Et).join()}`:ht(t)?At(z(t,(i,n)=>kt(i,At([e,n])))).join("&"):`${xt(e)}=${Et(t)}`}function Fe(t){return z(t,kt).join("&")}function Ue(t,e){if(!ht(e))return t;const i=Fe(e);return i?`${t}?${i}`:t}function jt(t,e){return t=t.clone(),e==="json"&&t.status!==204?t.json():t.text()}async function bt(t){if(!t)return;const e=await jt(t,"json");return t.ok?e:Promise.reject({response:t,responseData:e})}function Wt(t){if(t.name!=="AbortError")throw t}async function ke(t){if(t.status!==401)return!1;const e=await t.clone().json();return S(e,["errors",0,"code"])!=="5000"}const ut=async(t,e)=>(Pe(t,e)||He(t,e)).then(async n=>(Ut(t),n.ok||(await ke(n)&&U.request("auth","logout"),n.status>=400&&(le(t,e,n),String(n.headers.get("Content-Type")).includes("json")||U.trigger("event-router","unknownError",n.status)),(n.status>=500||!n.status)&&U.trigger("event-router","unknownError",n.status)),n)).catch(Wt);m.ajax=t=>(t=I({method:t.type},t),ut(t.url,t).then(async i=>{if(!i)return;const n=await jt(i,t.dataType);return i.ok?(t.success&&t.success(n),i):(t.error&&t.error(n),Promise.reject({response:i,responseData:n}))}).catch(Wt));var Bt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i="minute",n=/[+-]\d\d(?::?\d\d)?/g,s=/([+-]|\d\d)/g;return function(a,d,p){var l=d.prototype;p.utc=function(r){var u={date:r,utc:!0,args:arguments};return new d(u)},l.utc=function(r){var u=p(this.toDate(),{locale:this.$L,utc:!0});return r?u.add(this.utcOffset(),i):u},l.local=function(){return p(this.toDate(),{locale:this.$L,utc:!1})};var h=l.parse;l.parse=function(r){r.utc&&(this.$u=!0),this.$utils().u(r.$offset)||(this.$offset=r.$offset),h.call(this,r)};var A=l.init;l.init=function(){if(this.$u){var r=this.$d;this.$y=r.getUTCFullYear(),this.$M=r.getUTCMonth(),this.$D=r.getUTCDate(),this.$W=r.getUTCDay(),this.$H=r.getUTCHours(),this.$m=r.getUTCMinutes(),this.$s=r.getUTCSeconds(),this.$ms=r.getUTCMilliseconds()}else A.call(this)};var E=l.utcOffset;l.utcOffset=function(r,u){var f=this.$utils().u;if(f(r))return this.$u?0:f(this.$offset)?E.call(this):this.$offset;if(typeof r=="string"&&(r=function(w){w===void 0&&(w="");var _=w.match(n);if(!_)return null;var y=(""+_[0]).match(s)||["-",0,0],C=y[0],$=60*+y[1]+ +y[2];return $===0?0:C==="+"?$:-$}(r),r===null))return this;var c=Math.abs(r)<=16?60*r:r,g=this;if(u)return g.$offset=c,g.$u=r===0,g;if(r!==0){var v=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(g=this.local().add(c+v,i)).$offset=c,g.$x.$localOffset=v}else g=this.utc();return g};var b=l.format;l.format=function(r){var u=r||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return b.call(this,u)},l.valueOf=function(){var r=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*r},l.isUTC=function(){return!!this.$u},l.toISOString=function(){return this.toDate().toISOString()},l.toString=function(){return this.toDate().toUTCString()};var k=l.toDate;l.toDate=function(r){return r==="s"&&this.$offset?p(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():k.call(this)};var T=l.diff;l.diff=function(r,u,f){if(r&&this.$u===r.$u)return T.call(this,r,u,f);var c=this.local(),g=p(r).local();return T.call(c,g,u,f)}}})})(Bt);var je=Bt.exports;const We=et(je);var zt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(n,s,a){var d=s.prototype,p=d.format;a.en.formats=i,d.format=function(l){l===void 0&&(l="YYYY-MM-DDTHH:mm:ssZ");var h=this.$locale().formats,A=function(E,b){return E.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(k,T,r){var u=r&&r.toUpperCase();return T||b[r]||i[r]||b[u].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(f,c,g){return c||g.slice(1)})})}(l,h===void 0?{}:h);return p.call(this,A)}}})})(zt);var Be=zt.exports;const ze=et(Be);var Nt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n){n.prototype.weekday=function(s){var a=this.$locale().weekStart||0,d=this.$W,p=(d<a?d+7:d)-a;return this.$utils().u(s)?p:this.subtract(p,"day").add(s,"day")}}})})(Nt);var Ne=Nt.exports;const qe=et(Ne);var qt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},n=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,s=/\d\d/,a=/\d\d?/,d=/\d*[^-_:/,()\s\d]+/,p={},l=function(r){return(r=+r)+(r>68?1900:2e3)},h=function(r){return function(u){this[r]=+u}},A=[/[+-]\d\d:?(\d\d)?|Z/,function(r){(this.zone||(this.zone={})).offset=function(u){if(!u||u==="Z")return 0;var f=u.match(/([+-]|\d\d)/g),c=60*f[1]+(+f[2]||0);return c===0?0:f[0]==="+"?-c:c}(r)}],E=function(r){var u=p[r];return u&&(u.indexOf?u:u.s.concat(u.f))},b=function(r,u){var f,c=p.meridiem;if(c){for(var g=1;g<=24;g+=1)if(r.indexOf(c(g,0,u))>-1){f=g>12;break}}else f=r===(u?"pm":"PM");return f},k={A:[d,function(r){this.afternoon=b(r,!1)}],a:[d,function(r){this.afternoon=b(r,!0)}],S:[/\d/,function(r){this.milliseconds=100*+r}],SS:[s,function(r){this.milliseconds=10*+r}],SSS:[/\d{3}/,function(r){this.milliseconds=+r}],s:[a,h("seconds")],ss:[a,h("seconds")],m:[a,h("minutes")],mm:[a,h("minutes")],H:[a,h("hours")],h:[a,h("hours")],HH:[a,h("hours")],hh:[a,h("hours")],D:[a,h("day")],DD:[s,h("day")],Do:[d,function(r){var u=p.ordinal,f=r.match(/\d+/);if(this.day=f[0],u)for(var c=1;c<=31;c+=1)u(c).replace(/\[|\]/g,"")===r&&(this.day=c)}],M:[a,h("month")],MM:[s,h("month")],MMM:[d,function(r){var u=E("months"),f=(E("monthsShort")||u.map(function(c){return c.slice(0,3)})).indexOf(r)+1;if(f<1)throw new Error;this.month=f%12||f}],MMMM:[d,function(r){var u=E("months").indexOf(r)+1;if(u<1)throw new Error;this.month=u%12||u}],Y:[/[+-]?\d+/,h("year")],YY:[s,function(r){this.year=l(r)}],YYYY:[/\d{4}/,h("year")],Z:A,ZZ:A};function T(r){var u,f;u=r,f=p&&p.formats;for(var c=(r=u.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function($,P,L){var R=L&&L.toUpperCase();return P||f[L]||i[L]||f[R].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(H,F,j){return F||j.slice(1)})})).match(n),g=c.length,v=0;v<g;v+=1){var w=c[v],_=k[w],y=_&&_[0],C=_&&_[1];c[v]=C?{regex:y,parser:C}:w.replace(/^\[|\]$/g,"")}return function($){for(var P={},L=0,R=0;L<g;L+=1){var H=c[L];if(typeof H=="string")R+=H.length;else{var F=H.regex,j=H.parser,it=$.slice(R),N=F.exec(it)[0];j.call(P,N),$=$.replace(N,"")}}return function(W){var D=W.afternoon;if(D!==void 0){var q=W.hours;D?q<12&&(W.hours+=12):q===12&&(W.hours=0),delete W.afternoon}}(P),P}}return function(r,u,f){f.p.customParseFormat=!0,r&&r.parseTwoDigitYear&&(l=r.parseTwoDigitYear);var c=u.prototype,g=c.parse;c.parse=function(v){var w=v.date,_=v.utc,y=v.args;this.$u=_;var C=y[1];if(typeof C=="string"){var $=y[2]===!0,P=y[3]===!0,L=$||P,R=y[2];P&&(R=y[2]),p=this.$locale(),!$&&R&&(p=f.Ls[R]),this.$d=function(it,N,W){try{if(["x","X"].indexOf(N)>-1)return new Date((N==="X"?1e3:1)*it);var D=T(N)(it),q=D.year,nt=D.month,oe=D.day,ae=D.hours,ue=D.minutes,he=D.seconds,ce=D.milliseconds,St=D.zone,dt=new Date,lt=oe||(q||nt?1:dt.getDate()),ft=q||dt.getFullYear(),rt=0;q&&!nt||(rt=nt>0?nt-1:dt.getMonth());var pt=ae||0,gt=ue||0,mt=he||0,vt=ce||0;return St?new Date(Date.UTC(ft,rt,lt,pt,gt,mt,vt+60*St.offset*1e3)):W?new Date(Date.UTC(ft,rt,lt,pt,gt,mt,vt)):new Date(ft,rt,lt,pt,gt,mt,vt)}catch{return new Date("")}}(w,C,_),this.init(),R&&R!==!0&&(this.$L=this.locale(R).$L),L&&w!=this.format(C)&&(this.$d=new Date("")),p={}}else if(C instanceof Array)for(var H=C.length,F=1;F<=H;F+=1){y[1]=C[F-1];var j=f.apply(this,y);if(j.isValid()){this.$d=j.$d,this.$L=j.$L,this.init();break}F===H&&(this.$d=new Date(""))}else g.call(this,v)}}})})(qt);var Je=qt.exports;const Ze=et(Je);var Jt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n,s){i=i||{};var a=n.prototype,d={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function p(h,A,E,b){return a.fromToBase(h,A,E,b)}s.en.relativeTime=d,a.fromToBase=function(h,A,E,b,k){for(var T,r,u,f=E.$locale().relativeTime||d,c=i.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],g=c.length,v=0;v<g;v+=1){var w=c[v];w.d&&(T=b?s(h).diff(E,w.d,!0):E.diff(h,w.d,!0));var _=(i.rounding||Math.round)(Math.abs(T));if(u=T>0,_<=w.r||!w.r){_<=1&&v>0&&(w=c[v-1]);var y=f[w.l];k&&(_=k(""+_)),r=typeof y=="string"?y.replace("%d",_):y(_,A,w.l,u);break}}if(A)return r;var C=u?f.future:f.past;return typeof C=="function"?C(r):C.replace("%s",r)},a.to=function(h,A){return p(h,A,this,!0)},a.from=function(h,A){return p(h,A,this)};var l=function(h){return h.$u?s.utc():s()};a.toNow=function(h){return this.to(l(this),h)},a.fromNow=function(h){return this.from(l(this),h)}}})})(Jt);var Ke=Jt.exports;const Ge=et(Ke);x.extend(ze);x.extend(We);x.extend(qe);x.extend(Ze);x.extend(Ge);const J={SHORT:"MMM D",LONG:"ll",SLASHES:"L",TIME:"LT",AT_TIME:"lll",DATE(t){return t.isSame(x(),"year")?t.format(J.SHORT):t.format(J.LONG)},TIME_OR_DAY(t){return t.isSame(x(),"day")?t.format(J.TIME):J.DATE(t)},AGO_OR_TODAY(t){return t.isSame(x(),"day")?t.fromNow():J.DATE(t)}};function Xe(t,e){const i=J[e];return i?me(i)?i(t):t.format(i):t.format(e)}function G(t,e,{hash:i={}}){const n=`${t}-fa-${e}`,s=`fa-${e}`,a=i.classes||"",d=`<svg class="icon svg-inline--fa ${s} ${a}"><use xlink:href="#${n}"></use></svg>`;return new Y.SafeString(d)}const Zt={far:st(G,"far"),fas:st(G,"fas"),fal:st(G,"fal"),fat:st(G,"fat"),fa:G};Y.registerHelper(Zt);Yt.registerHelper(Zt);const Mt=(t="",e)=>(t=String(t),t.trim()),Qe=(t,e)=>Tt(t)?[]:Mt(t).split(/\s+/),ti=t=>(t=String(t),t=t.replace(/\-/g," "),t=t.replace(/[^\w\s]/g,""),Mt(t).toLowerCase()),ei=ve(function(t){const e=z(Qe(ti(t)),RegExp.escape);return new RegExp(`\\b${e.join("|")}`,"gi")}),ii=(t,e,i,n)=>{if(!t)return;i=i||"strong",n=n||i;const s=ei(e);return t.replace(s,`<${i}>$&</${n}>`)},Kt={matchText(t,e,{hash:i={}}){return e?(i.noEscape||(t=Y.escapeExpression(t)),new Y.SafeString(ii(t,e))):t},formatDateTime(t,e,{hash:i={}}){return t?(t=i.utc?x.utc(t,i.inputFormat).local():x(t,i.inputFormat),t=Xe(t,e),i.nowrap===!1?t:new Y.SafeString(`<span class="u-text--nowrap">${t}</span>`)):new Y.SafeString(i.defaultHtml||"")},formatPhoneNumber(t,{hash:e={}}){if(!t)return new Y.SafeString(e.defaultHtml||"");const i=de(t,"US"),n=i?i.formatNational():"";return new Y.SafeString(n)}};Y.registerHelper(Kt);Yt.registerHelper(Kt);const ni={8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},$t={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":"'",",":"<",".":">","/":"?","\\":"|"},ri=["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"],si=/textarea|input|select/i;X.hotkeys={version:"1.0.0",isTargetInput(t){return si.test(t.nodeName)||X(t).attr("contenteditable")||we(ri,t.type)}};function oi({data:t}){if(yt(t))return t.toLowerCase().split(" ");if(t&&yt(t.keys))return t.keys.toLowerCase().split(" ")}function ai(t,e){let i="";return Z(["alt","ctrl","shift"],function(n){t[`${n}Key`]&&e!==n&&(i+=`${n}+`)}),t.metaKey&&!t.ctrlKey&&e!=="meta"&&(i+="meta+"),t.metaKey&&e!=="meta"&&i.indexOf("alt+ctrl+shift+")>-1&&(i=i.replace("alt+ctrl+shift+","hyper+")),i}function ui(t,e,i){const n={},s=ai(t,e);return e?n[s+e]=!0:(n[s+i]=!0,n[s+$t[i]]=!0,s==="shift+"&&(n[$t[i]]=!0)),n}function hi(t){const e=oi(t);if(!e)return;const i=t.handler;t.handler=function(n){if(this!==n.target&&X.hotkeys.isTargetInput(n.target))return;const s=n.type!=="keypress"&&ni[n.which],a=String.fromCharCode(n.which).toLowerCase(),d=ui(n,s,a);for(let p=0,l=e.length;p<l;p++)if(d[e[p]])return i.apply(this,arguments)}}Z(["keydown","keyup","keypress"],t=>{X.event.special[t]={add:hi}});var M=[];for(var wt=0;wt<256;++wt)M.push((wt+256).toString(16).slice(1));function ci(t,e=0){return(M[t[e+0]]+M[t[e+1]]+M[t[e+2]]+M[t[e+3]]+"-"+M[t[e+4]]+M[t[e+5]]+"-"+M[t[e+6]]+M[t[e+7]]+"-"+M[t[e+8]]+M[t[e+9]]+"-"+M[t[e+10]]+M[t[e+11]]+M[t[e+12]]+M[t[e+13]]+M[t[e+14]]+M[t[e+15]]).toLowerCase()}var ot,di=new Uint8Array(16);function li(){if(!ot&&(ot=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!ot))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return ot(di)}var fi=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const Rt={randomUUID:fi};function pi(t,e,i){if(Rt.randomUUID&&!e&&!t)return Rt.randomUUID();t=t||{};var n=t.random||(t.rng||li)();return n[6]=n[6]&15|64,n[8]=n[8]&63|128,ci(n)}m.Model.prototype.sync=function(t,e,i){if(i=Lt(i),t==="create"){let n=i.data||i.attrs||e.toJSON(i);yt(n)&&(n=JSON.parse(n)),n.data.id=pi(),i.data=JSON.stringify(n)}return m.sync(t,e,i)};const{Region:Gt,View:gi,CollectionView:mi,setDomApi:vi}=It;vi(Oe);window._=o;window.$=X;window.Backbone=m;window.Radio=U;window.Marionette=It;window.dayjs=x;const wi=Gt.prototype.show;Gt.prototype.show=function(t,e){return t instanceof Ft?(t.showIn(this,null,e),this):wi.call(this,t,e)};const Xt=function(t){if(!this.isAttached())return!1;const e=t||this.$el,{left:i,top:n}=e.offset(),s=e.outerHeight(),a=e.outerWidth();return{left:i,top:n,outerHeight:s,outerWidth:a}};I(gi.prototype,{getBounds:Xt});I(mi.prototype,{getBounds:Xt});m.Model.prototype.dayjs=function(t){const e=this.get(t);return!e&&e!==0?e:x(e)};RegExp.escape=function(t){return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")};function Qt(t,e){this.instances={},this.Model=t,this.modelName=e,this.ModelConstructor=this._getConstructor(t)}o.extend(Qt.prototype,{_getConstructor:function(e){var i=this,n=function(a,d){return i.get(a,d)};return o.extend(n,e),n.prototype=this.Model.prototype,n},get:function(e,i){var n=e&&e[this.Model.prototype.idAttribute],s=this.instances[n];return s?(s.set(e),O.trigger("update",s,this),s):this._new(e,i)},_new:function(e,i){var n=new this.Model(e,i);return n.isNew()?n.once("change:".concat(n.idAttribute),this._add,this):this._add(n),n.on("destroy",this.remove,this),n},_add:function(e){this.instances[e.id]||(this.instances[e.id]=e,O.trigger("add",e,this))},remove:function(e){return this.instances[e.id]&&(delete this.instances[e.id],O.trigger("remove",e,this)),e}});var V={};function O(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:o.uniqueId("Store_"),i=O.add(t,e);return i.ModelConstructor}o.extend(O,m.Events,{ModelCache:Qt,add:function(e,i){if(!i)throw"Model name required";return V[i]?V[i]:V[i]=new O.ModelCache(e,i)},getCache:function(e){if(!V[e])throw'Unrecognized Model: "'.concat(e,'"');return V[e]},getAllCache:function(){return o.clone(V)},get:function(e){return O.getCache(e).ModelConstructor},getAll:function(){return o.reduce(V,function(e,i,n){return e[n]=i.ModelConstructor,e},{})},remove:function(e){delete V[e]},removeAll:function(){V={}}});m.Store=O;const _t=t=>t&&Mt(t).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase();function te(t){Z(t,e=>{const i=O.get(e.type),n=new i({id:e.id});n.set(n.parseModel(e))})}const ee={cacheIncluded:te,parseId(t={},e){return t.id=e,t},parseRelationship(t){return t&&(Q(t)?z(t,e=>{const i={id:e.id};return e.meta&&Z(e.meta,(n,s)=>{i[`_${_t(s)}`]=n}),i}):t.id)},parseRelationships(t,e){return Z(e,(i,n)=>{t[`_${_t(n)}`]=this.parseRelationship(i.data,n)}),t},parseModel(t){const e=this.parseId(t.attributes,t.id);return e.__cached_ts=x.utc().format(),Z(t.meta,(i,n)=>{e[`_${_t(n)}`]=i}),this.parseRelationships(e,t.relationships)},toRelation(t,e){if(!_e(t))return ye(t)?{data:null}:t.models?{data:t.map(({id:i,type:n})=>({id:i,type:n}))}:Q(t)?{data:z(t,i=>({id:i.id?i.id:i,type:e}))}:ht(t)?{data:Ot(t,"id","type")}:{data:{id:t,type:e}}}},_i=B.extend({channelName:"entities",Entity:m,constructor:function(t){this.mergeOptions(t,["Entity"]),B.apply(this,arguments)},getCollection(t,e={}){return new this.Entity.Collection(t,e)},getModel(t,e){return t&&!ht(t)&&(t={id:t}),new this.Entity.Model(t,e)},fetchCollection(t){return new this.Entity.Collection().fetch(t)},fetchModel(t,e){return new this.Entity.Model({id:t}).fetch(e)},async fetchBy(t,e){const i=await ut(t,e);if(!i||i.status===204)return Promise.resolve();const n=await i.json();if(!i.ok)return Promise.reject({response:i,responseData:n});te(n.included);const s=new this.Entity.Model({id:n.data.id});return s.set(s.parseModel(n.data)),Promise.resolve(s)}}),yi=m.Collection.extend(I({fetch(t={}){return m.Collection.prototype.fetch.call(this,t).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.meta=t.meta,z(t.data,this.parseModel,this))},getMeta(t){return S(this.meta,t)},destroy(t){const e=Lt(this.models),i=Vt(e,"destroy",t);return Promise.all(i)}},ee)),ie=m.Model.extend(I({destroy(t){return this.isNew()?(m.Model.prototype.destroy.call(this,t),Promise.resolve(t)):m.Model.prototype.destroy.call(this,t)},fetch(t){return m.Model.prototype.fetch.call(this,I({abort:!0},t)).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.parseModel(t.data))},parseErrors({errors:t}){if(!t)return;const e="/data/attributes/";return Dt(t,(i,{source:n,detail:s})=>{const a=String(n.pointer).slice(e.length);return i[a]=s,i},{})},removeFEOnly(t){return Ot(t,function(e,i){return i!=="id"&&/^[^_]/.test(i)})},toJSONApi(t=this.attributes){return{id:this.id,type:this.type,attributes:this.removeFEOnly(t)}},save(t,e={},i){return t==null&&(i=e),e=I(this.toJSONApi(e.attributes||t),e),Tt(e.attributes)&&delete e.attributes,i=I({patch:!this.isNew(),data:JSON.stringify({data:e})},i),m.Model.prototype.save.call(this,t,i)},isCached(){return this.has("__cached_ts")}},ee)),ne="forms",Mi=`
  const subm = _.extend({ patient: {} }, formSubmission,  formData);

  subm.patient.fields = _.extend({}, _.get(formSubmission, 'patient.fields'), _.get(formData, 'patient.fields'));

  return subm;
`,Si=`
  formData.fields = formSubmission.fields || _.get(formSubmission, 'patient.fields');

  return formData;
`,Ai="return formSubmission;",re=ie.extend({type:ne,urlRoot:"/api/forms",isReadOnly(){return S(this.get("options"),"read_only")},isReport(){return S(this.get("options"),"is_report")},isSubmitHidden(){return S(this.get("options"),"submit_hidden")},getContext(){return{contextScripts:this.getContextScripts(),loaderReducers:this.getLoaderReducers(),changeReducers:this.getChangeReducers(),beforeSubmit:this.getBeforeSubmit(),submitReducers:this.getSubmitReducers()}},getContextScripts(){return S(this.get("options"),"context",[])},getLoaderReducers(){return S(this.get("options"),"reducers",[Mi])},getChangeReducers(){return S(this.get("options"),"changeReducers",[])},getBeforeSubmit(){return S(this.get("options"),"beforeSubmit",Ai)},getSubmitReducers(){const t=S(this.get("options"),"submitReducers");return Me(t)?t:[Si]},getWidgets(){const t=S(this.get("options"),["widgets","widgets"]),e=U.request("bootstrap","widgets"),i=z(t,n=>e.find({slug:n}));return U.request("entities","widgets:collection",Vt(Se(i),"omit","id"))},getWidgetFields(){return S(this.get("options"),["widgets","fields"])},getPrefillFormId(){const t=S(this.get("options"),"prefill_form_id");return t||this.id},getPrefillActionTag(){return S(this.get("options"),"prefill_action_tag")}}),se=O(re,ne),Ci=yi.extend({url:"/api/forms",model:se,comparator:"name"}),Ei=_i.extend({Entity:{_Model:re,Model:se,Collection:Ci},radioRequests:{"forms:model":"getModel","forms:collection":"getCollection","fetch:forms:model":"fetchModel","fetch:forms:collection":"fetchCollection","fetch:forms:definition":"fetchDefinition","fetch:forms:data":"fetchFormData","fetch:forms:byAction":"fetchByAction","fetch:forms:definition:byAction":"fetchDefinitionByAction"},fetchDefinition(t){return ut(`/api/forms/${t}/definition`).then(bt)},fetchFormData(t,e,i){const n=new ie;if(t)return n.fetch({url:`/api/actions/${t}/form/fields`});const s={filter:{patient:e}};return n.fetch({url:`/api/forms/${i}/fields`,data:s})},fetchByAction(t){return this.fetchBy(`/api/actions/${t}/form`)},fetchDefinitionByAction(t){return ut(`/api/actions/${t}/form/definition`).then(bt)}});new Ei;async function xi(t){if(Ae(t))throw t;if(t.response){const e=t.response.status,{errors:i}=t.responseData;throw new Error(`Error Status: ${e} - ${JSON.stringify(i)}`)}throw new Error(JSON.stringify(t))}const Li=Ht.extend({triggerStart(t){this._isLoading=!0,this._fetchId=Ce("fetch");const e=Ct(this.triggerMethod,this,"sync:data",this._fetchId,t),i=Ct(this.triggerSyncFail,this,this._fetchId,t),n=this.beforeStart(t);if(!n){e();return}Promise.all(Q(n)?n:[n]).then(e).catch(i)},beforeStart:Ee,onSyncData(t,e,i=[]){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.finallyStart.call(this,e,...i))},triggerSyncFail(t,e,...i){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.triggerMethod("fail",e,...i))},onFail(t,e){xi(e)},isRunning(){return this._isRunning&&!this.isLoading()},_isLoading:!1,isLoading(){return this._isLoading}});export{Li as A,ie as B,Ft as C,ee as J,O as S,yi as a,ei as b,_i as c,_t as d,ut as f,bt as h,Ti as m,Mt as t,ci as u,pi as v,Qe as w};
