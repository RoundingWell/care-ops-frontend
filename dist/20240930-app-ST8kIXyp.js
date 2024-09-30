import{d as x,H as Y,p as ce,$ as X}from"./20240930-parsePhoneNumber-ILmYtQ9I.js";import{V as o,W as de,e as I,X as fe,j as ht,B as C,m as K,q as Q,k as At,P as le,r as Dt,M as pe,E as tt,F as et,K as ge,J as st,h as Tt,Y as me,I as ve,g as J,i as yt,Z as Lt,$ as _e,a0 as we,x as Ot,C as ye,y as Me,a1 as Se,u as Ae,b as Ct,w as Ce}from"./20240930-index-C2PG_n-y.js";import{B as m,M as W,A as Z,V as Ee,R as B,_ as Vt,e as Yt}from"./20240930-runtime-7vHpoRUw.js";var xe=["StateModel","stateEvents"],at={StateModel:m.Model,initState:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._initState(e),this.delegateStateEvents(),this},_initState:function(e){this.mergeOptions(e,xe),this._removeEventHandlers();var i=this._getStateModel(e);this._stateModel=new i(e.state),this._setEventHandlers()},delegateStateEvents:function(){return this.undelegateStateEvents(),this.bindEvents(this._stateModel,o.result(this,"stateEvents")),this},undelegateStateEvents:function(){return this.unbindEvents(this._stateModel),this},_setEventHandlers:function(){this.on("destroy",this._destroyState)},_removeEventHandlers:function(){this._stateModel&&(this.undelegateStateEvents(),this._stateModel.stopListening(),this.off("destroy",this._destroyState))},_getStateModel:function(e){if(this.StateModel.prototype instanceof m.Model||this.StateModel===m.Model)return this.StateModel;if(o.isFunction(this.StateModel))return this.StateModel.call(this,e);throw new Error('"StateModel" must be a model class or a function that returns a model class')},setState:function(){return this._stateModel.set.apply(this._stateModel,arguments)},resetStateDefaults:function(){var e=o.result(this._stateModel,"defaults");return this._stateModel.set(e)},getState:function(e){return e?this._stateModel.get.apply(this._stateModel,arguments):this._stateModel},toggleState:function(e,i){return arguments.length>1?this._stateModel.set(e,!!i):this._stateModel.set(e,!this._stateModel.get(e))},hasState:function(e){return this._stateModel.has(e)},_destroyState:function(){this._stateModel.stopListening()}},be=["childApps","childAppOptions"],$e={_initChildApps:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this._childApps={},this.mergeOptions(e,be);var i=this.childApps;i&&(o.isFunction(i)&&(i=i.call(this,e)),this.addChildApps(i))},_getChildStartOpts:function(e){var i=this,n=e._tkOpts||{},s={region:this.getRegion(n.regionName)};return o.each(n.getOptions,function(a){s[a]=i.getOption(a)}),s},_startChildApp:function(e,i){var n=this._getChildStartOpts(e);return e.start(o.extend(n,i))},_shouldActWithRestart:function(e,i){if(!this._isRestarting)return!0;var n=o.result(e,"restartWithParent");if(n===!0||n!==!1&&o.result(e,i))return!0},_startChildApps:function(){var e=this,i="startWithParent";o.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!o.result(n,i)||e._startChildApp(n))})},_stopChildApps:function(){var e=this,i="stopWithParent";o.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!o.result(n,i)||n.stop())})},startChildApp:function(e,i){var n=this.getChildApp(e);if(!n)throw new Error("A child app with the name ".concat(e," does not exist."));return this._startChildApp(n,i)},stopChildApp:function(e,i){return this.getChildApp(e).stop(i)},_destroyChildApps:function(){o.each(this._childApps,function(e){o.result(e,"preventDestroy")||e.destroy()})},_buildAppFromObject:function(e){var i=e.AppClass,n=o.omit(e,"AppClass","regionName","getOptions"),s=this.buildApp(i,n);return s._tkOpts=o.pick(e,"regionName","getOptions"),s},_buildApp:function(e,i){if(o.isFunction(e))return this.buildApp(e,i);if(o.isObject(e))return this._buildAppFromObject(e)},buildApp:function(e,i){return i=o.extend({},this.childAppOptions,i),new e(i)},_ensureAppIsUnique:function(e){if(this._childApps[e])throw new Error('A child App with name "'.concat(e,'" has already been added.'))},addChildApps:function(e){o.each(e,o.bind(function(i,n){this.addChildApp(n,i)},this))},addChildApp:function(e,i,n){this._ensureAppIsUnique(e);var s=this._buildApp(i,n);if(!s)throw new Error("App build failed.  Incorrect configuration.");return s._name=e,this._childApps[e]=s,s._on("destroy",o.partial(this._removeChildApp,e),this),this.isRunning()&&o.result(s,"startWithParent")&&this._startChildApp(s),s},getName:function(){return this._name},getChildApps:function(){return o.clone(this._childApps)},getChildApp:function(e){return this._childApps[e]},_removeChildApp:function(e){delete this._childApps[e]._name,delete this._childApps[e]},removeChildApps:function(){var e=this.getChildApps();return o.each(this._childApps,o.bind(function(i,n){this.removeChildApp(n)},this)),e},removeChildApp:function(e,i){i=o.extend({},i);var n=this.getChildApp(e);if(n)return i.preventDestroy||o.result(n,"preventDestroy")?this._removeChildApp(e):n.destroy(),n}},Re={_stopRunningEvents:function(){o.each(this._runningEvents,o.bind(function(e){this.off.apply(this,e)},this)),this._runningEvents=[]},_stopRunningListeners:function(){o.each(this._runningListeningTo,o.bind(function(e){this.stopListening.apply(this,e)},this)),this._runningListeningTo=[]},on:function(){return this._isRunning&&(this._runningEvents=this._runningEvents||[],this._runningEvents.push(arguments)),W.prototype.on.apply(this,arguments)},_on:W.prototype.on,listenTo:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),W.prototype.listenTo.apply(this,arguments)},_listenTo:W.prototype.listenTo,listenToOnce:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),W.prototype.listenToOnce.apply(this,arguments)}},It={viewEventPrefix:!1,_buildEventProxies:function(){var e=o.result(this,"viewEvents")||{};this._viewEvents=this.normalizeMethods(e),this._viewTriggers=o.result(this,"viewTriggers")||{},this._viewEventPrefix=o.result(this,"viewEventPrefix")},_proxyViewEvents:function(e){this.listenTo(e,"all",this._childViewEventHandler)},_childViewEventHandler:function(e){for(var i=this._viewEvents,n=arguments.length,s=new Array(n>1?n-1:0),a=1;a<n;a++)s[a-1]=arguments[a];o.isFunction(i[e])&&i[e].apply(this,s);var d=this._viewTriggers;o.isString(d[e])&&this.triggerMethod.apply(this,[d[e]].concat(s));var p=this._viewEventPrefix;if(p!==!1){var f="".concat(p,":").concat(e);this.triggerMethod.apply(this,[f].concat(s))}}},De=["startWithParent","restartWithParent","stopWithParent","startAfterInitialized","preventDestroy","StateModel","stateEvents","viewEventPrefix","viewEvents","viewTriggers"],Pt=Z.extend({_isRunning:!1,_isRestarting:!1,preventDestroy:!1,startAfterInitialized:!1,startWithParent:!1,stopWithParent:!0,restartWithParent:null,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,De),this.options=o.extend({},o.result(this,"options"),e),this._initChildApps(e),Z.call(this,e),o.result(this,"startAfterInitialized")&&this.start(e)},_ensureAppIsIntact:function(){if(this._isDestroyed)throw new Error("App has already been destroyed and cannot be used.")},isRunning:function(){return this._isRunning},isRestarting:function(){return this._isRestarting},start:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._ensureAppIsIntact(),this._isRunning?this:(e.region&&this.setRegion(e.region),e.view&&this.setView(e.view),this._initState(e),this._buildEventProxies(),this.triggerMethod("before:start",e),this._isRunning=!0,this._bindRunningEvents(),this.triggerStart(e),this)},_bindRunningEvents:function(){this._region&&this._regionEventMonitor(),this._view&&this._proxyViewEvents(this._view),this.delegateStateEvents()},restart:function(){var e=this.getState().attributes;return this._isRestarting=!0,this.stop().start({state:e}),this._isRestarting=!1,this},finallyStart:function(){this._startChildApps(),this.triggerMethod.apply(this,["start"].concat(Array.prototype.slice.call(arguments)))},triggerStart:function(e){this.finallyStart(e)},stop:function(e){return this._isRunning?(this.triggerMethod("before:stop",e),this._stopChildApps(),this._isRunning=!1,this.triggerMethod("stop",e),this._stopRunningListeners(),this._stopRunningEvents(),this):this},destroy:function(){return this._isDestroyed?this:(this.stop(),this._removeView(),this._destroyChildApps(),Z.prototype.destroy.apply(this,arguments),this)},setRegion:function(e){return this._region&&this.stopListening(this._region),this._region=e,e.currentView&&this.setView(e.currentView),this._isRunning&&this._regionEventMonitor(),e},_regionEventMonitor:function(){this.listenTo(this._region,{"before:show":this._onBeforeShow,empty:this._onEmpty})},_onBeforeShow:function(e,i){this.setView(i)},_onEmpty:function(e,i){i===this._view&&this._removeView()},_removeView:function(){this._view&&(this.stopListening(this._view),delete this._view)},getRegion:function(e){return e?this.getView().getRegion(e):this._region},setView:function(e){return this._view===e||(this._view&&this.stopListening(this._view),this._view=e,this._isRunning&&this._proxyViewEvents(e),this._listenTo(this._view,"destroy",this._removeView)),e},getView:function(){return this._view||this._region&&this._region.currentView},showView:function(){for(var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this._view,i=this.getRegion(),n=arguments.length,s=new Array(n>1?n-1:0),a=1;a<n;a++)s[a-1]=arguments[a];return i.show.apply(i,[e].concat(s)),this.isRunning()||this.setView(i.currentView),e},showChildView:function(e,i){for(var n,s=arguments.length,a=new Array(s>2?s-2:0),d=2;d<s;d++)a[d-2]=arguments[d];return(n=this.getView()).showChildView.apply(n,[e,i].concat(a)),i},getChildView:function(e){return this.getView().getChildView(e)}});o.extend(Pt.prototype,at,$e,Re,It);var Te=["regionOptions","ViewClass","viewEventPrefix","viewEvents","viewTriggers","viewOptions"],Ht=Z.extend({ViewClass:Ee,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,Te),this.options=o.extend({},o.result(this,"options"),e),this._buildEventProxies(),this._initState(e),Z.call(this,e),this.delegateStateEvents()},showIn:function(e,i,n){return this._region=e,this.show(i,n),this},show:function(e,i){var n=this.getRegion();if(!n)throw new Error("Component has no defined region.");var s=this._getView(e);return this.stopListening(n.currentView,"destroy",this.destroy),this.triggerMethod("before:show",this,s,e,i),this.showView(s,this.mixinRegionOptions(i)),this.listenTo(n.currentView,"destroy",this.destroy),this.triggerMethod("show",this,s,e,i),this},empty:function(){var e=this.getRegion();if(!e)throw new Error("Component has no defined region.");return this.stopListening(e.currentView,"destroy",this.destroy),e.empty(),this},mixinRegionOptions:function(e){var i=o.result(this,"regionOptions");return o.extend({},i,e)},_getView:function(e){var i=this._getViewClass(e),n=this.mixinViewOptions(e),s=this.buildView(i,n);return this._proxyViewEvents(s),s},_getViewClass:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},i=this.ViewClass;if(i.prototype instanceof m.View||i===m.View)return i;if(o.isFunction(i))return i.call(this,e);throw new Error('"ViewClass" must be a view class or a function that returns a view class')},mixinViewOptions:function(e){var i=o.result(this,"viewOptions");return o.extend({state:this.getState().attributes},i,e)},buildView:function(e,i){return new e(i)},destroy:function(){if(this._isDestroyed)return this;var e=this.getRegion();return e&&e.empty(),Z.prototype.destroy.apply(this,arguments),this}},{setRegion:function(e){this.prototype.region=e}});o.extend(Ht.prototype,at,It);function Ri(t){var e=at;t.prototype.StateModel&&(e=o.omit(at,"StateModel")),o.extend(t.prototype,e)}const Le={getEl(t){return[t]},findEl(t,e){return t.querySelectorAll(e)},detachEl(t){t.parentNode&&t.parentNode.removeChild(t)},hasContents(t){return t.hasChildNodes()},setContents(t,e){t.innerHTML=e},appendContents(t,e){t.appendChild(e)},detachContents(t){t.textContent=""}},ct=[];function Oe(t,e,i){return ct[t]={fetcher:e,controller:i},e}function Ve(t){return C(ct[t],"fetcher")}function Ft(t){delete ct[t]}function Ye(t){const e=C(ct[t],"controller");e&&(e.abort(),Ft(t))}function Ie(t,e={}){const i=Ve(t);return i?e.abort!==!1?(Ye(t),!1):i:!1}async function Pe(t,e={}){const i=await B.request("auth","getToken"),n=new AbortController,s=t;e=I({signal:n.signal,dataType:"json",headers:fe(e.headers,{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json"})},e),i&&(e.headers.Authorization=`Bearer ${i}`),!e.method||e.method==="GET"?t=Fe(t,e.data):e.data&&(e.body=e.data);const a=B.request("workspace","current");return a&&(e.headers.Workspace=a.id),Oe(s,fetch(t,e),n)}function Et(t){return encodeURIComponent(t??"")}function xt(t){if(Q(t)){const e=encodeURIComponent(le(t));return Dt(pe(t),(i,n)=>`${i}[${encodeURIComponent(n)}]`,e)}return encodeURIComponent(t)}function Ut(t,e){return Q(t)?`${xt(e)}=${t.map(Et).join()}`:ht(t)?At(K(t,(i,n)=>Ut(i,At([e,n])))).join("&"):`${xt(e)}=${Et(t)}`}function He(t){return K(t,Ut).join("&")}function Fe(t,e){if(!ht(e))return t;const i=He(e);return i?`${t}?${i}`:t}function kt(t,e){return t=t.clone(),e==="json"&&t.status!==204?t.json():t.text()}async function bt(t){if(!t)return;const e=await kt(t,"json");return t.ok?e:Promise.reject({response:t,responseData:e})}function jt(t){if(t.name!=="AbortError")throw t}const ut=async(t,e)=>(Ie(t,e)||Pe(t,e)).then(async n=>(Ft(t),n.ok||(n.status===401&&B.request("auth","logout"),n.status>=400&&(de(t,e,n),String(n.headers.get("Content-Type")).includes("json")||B.trigger("event-router","unknownError",n.status)),(n.status>=500||!n.status)&&B.trigger("event-router","unknownError",n.status)),n)).catch(jt);m.ajax=t=>(t=I({method:t.type},t),ut(t.url,t).then(async i=>{if(!i)return;const n=await kt(i,t.dataType);return i.ok?(t.success&&t.success(n),i):(t.error&&t.error(n),Promise.reject({response:i,responseData:n}))}).catch(jt));var Wt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i="minute",n=/[+-]\d\d(?::?\d\d)?/g,s=/([+-]|\d\d)/g;return function(a,d,p){var f=d.prototype;p.utc=function(r){var u={date:r,utc:!0,args:arguments};return new d(u)},f.utc=function(r){var u=p(this.toDate(),{locale:this.$L,utc:!0});return r?u.add(this.utcOffset(),i):u},f.local=function(){return p(this.toDate(),{locale:this.$L,utc:!1})};var h=f.parse;f.parse=function(r){r.utc&&(this.$u=!0),this.$utils().u(r.$offset)||(this.$offset=r.$offset),h.call(this,r)};var S=f.init;f.init=function(){if(this.$u){var r=this.$d;this.$y=r.getUTCFullYear(),this.$M=r.getUTCMonth(),this.$D=r.getUTCDate(),this.$W=r.getUTCDay(),this.$H=r.getUTCHours(),this.$m=r.getUTCMinutes(),this.$s=r.getUTCSeconds(),this.$ms=r.getUTCMilliseconds()}else S.call(this)};var E=f.utcOffset;f.utcOffset=function(r,u){var l=this.$utils().u;if(l(r))return this.$u?0:l(this.$offset)?E.call(this):this.$offset;if(typeof r=="string"&&(r=function(_){_===void 0&&(_="");var w=_.match(n);if(!w)return null;var y=(""+w[0]).match(s)||["-",0,0],A=y[0],$=60*+y[1]+ +y[2];return $===0?0:A==="+"?$:-$}(r),r===null))return this;var c=Math.abs(r)<=16?60*r:r,g=this;if(u)return g.$offset=c,g.$u=r===0,g;if(r!==0){var v=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(g=this.local().add(c+v,i)).$offset=c,g.$x.$localOffset=v}else g=this.utc();return g};var b=f.format;f.format=function(r){var u=r||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return b.call(this,u)},f.valueOf=function(){var r=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*r},f.isUTC=function(){return!!this.$u},f.toISOString=function(){return this.toDate().toISOString()},f.toString=function(){return this.toDate().toUTCString()};var U=f.toDate;f.toDate=function(r){return r==="s"&&this.$offset?p(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():U.call(this)};var T=f.diff;f.diff=function(r,u,l){if(r&&this.$u===r.$u)return T.call(this,r,u,l);var c=this.local(),g=p(r).local();return T.call(c,g,u,l)}}})})(Wt);var Ue=Wt.exports;const ke=et(Ue);var Bt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(n,s,a){var d=s.prototype,p=d.format;a.en.formats=i,d.format=function(f){f===void 0&&(f="YYYY-MM-DDTHH:mm:ssZ");var h=this.$locale().formats,S=function(E,b){return E.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(U,T,r){var u=r&&r.toUpperCase();return T||b[r]||i[r]||b[u].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(l,c,g){return c||g.slice(1)})})}(f,h===void 0?{}:h);return p.call(this,S)}}})})(Bt);var je=Bt.exports;const We=et(je);var zt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n){n.prototype.weekday=function(s){var a=this.$locale().weekStart||0,d=this.$W,p=(d<a?d+7:d)-a;return this.$utils().u(s)?p:this.subtract(p,"day").add(s,"day")}}})})(zt);var Be=zt.exports;const ze=et(Be);var Nt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},n=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,s=/\d\d/,a=/\d\d?/,d=/\d*[^-_:/,()\s\d]+/,p={},f=function(r){return(r=+r)+(r>68?1900:2e3)},h=function(r){return function(u){this[r]=+u}},S=[/[+-]\d\d:?(\d\d)?|Z/,function(r){(this.zone||(this.zone={})).offset=function(u){if(!u||u==="Z")return 0;var l=u.match(/([+-]|\d\d)/g),c=60*l[1]+(+l[2]||0);return c===0?0:l[0]==="+"?-c:c}(r)}],E=function(r){var u=p[r];return u&&(u.indexOf?u:u.s.concat(u.f))},b=function(r,u){var l,c=p.meridiem;if(c){for(var g=1;g<=24;g+=1)if(r.indexOf(c(g,0,u))>-1){l=g>12;break}}else l=r===(u?"pm":"PM");return l},U={A:[d,function(r){this.afternoon=b(r,!1)}],a:[d,function(r){this.afternoon=b(r,!0)}],S:[/\d/,function(r){this.milliseconds=100*+r}],SS:[s,function(r){this.milliseconds=10*+r}],SSS:[/\d{3}/,function(r){this.milliseconds=+r}],s:[a,h("seconds")],ss:[a,h("seconds")],m:[a,h("minutes")],mm:[a,h("minutes")],H:[a,h("hours")],h:[a,h("hours")],HH:[a,h("hours")],hh:[a,h("hours")],D:[a,h("day")],DD:[s,h("day")],Do:[d,function(r){var u=p.ordinal,l=r.match(/\d+/);if(this.day=l[0],u)for(var c=1;c<=31;c+=1)u(c).replace(/\[|\]/g,"")===r&&(this.day=c)}],M:[a,h("month")],MM:[s,h("month")],MMM:[d,function(r){var u=E("months"),l=(E("monthsShort")||u.map(function(c){return c.slice(0,3)})).indexOf(r)+1;if(l<1)throw new Error;this.month=l%12||l}],MMMM:[d,function(r){var u=E("months").indexOf(r)+1;if(u<1)throw new Error;this.month=u%12||u}],Y:[/[+-]?\d+/,h("year")],YY:[s,function(r){this.year=f(r)}],YYYY:[/\d{4}/,h("year")],Z:S,ZZ:S};function T(r){var u,l;u=r,l=p&&p.formats;for(var c=(r=u.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function($,P,L){var R=L&&L.toUpperCase();return P||l[L]||i[L]||l[R].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(H,F,k){return F||k.slice(1)})})).match(n),g=c.length,v=0;v<g;v+=1){var _=c[v],w=U[_],y=w&&w[0],A=w&&w[1];c[v]=A?{regex:y,parser:A}:_.replace(/^\[|\]$/g,"")}return function($){for(var P={},L=0,R=0;L<g;L+=1){var H=c[L];if(typeof H=="string")R+=H.length;else{var F=H.regex,k=H.parser,it=$.slice(R),z=F.exec(it)[0];k.call(P,z),$=$.replace(z,"")}}return function(j){var D=j.afternoon;if(D!==void 0){var N=j.hours;D?N<12&&(j.hours+=12):N===12&&(j.hours=0),delete j.afternoon}}(P),P}}return function(r,u,l){l.p.customParseFormat=!0,r&&r.parseTwoDigitYear&&(f=r.parseTwoDigitYear);var c=u.prototype,g=c.parse;c.parse=function(v){var _=v.date,w=v.utc,y=v.args;this.$u=w;var A=y[1];if(typeof A=="string"){var $=y[2]===!0,P=y[3]===!0,L=$||P,R=y[2];P&&(R=y[2]),p=this.$locale(),!$&&R&&(p=l.Ls[R]),this.$d=function(it,z,j){try{if(["x","X"].indexOf(z)>-1)return new Date((z==="X"?1e3:1)*it);var D=T(z)(it),N=D.year,nt=D.month,se=D.day,oe=D.hours,ae=D.minutes,ue=D.seconds,he=D.milliseconds,St=D.zone,dt=new Date,ft=se||(N||nt?1:dt.getDate()),lt=N||dt.getFullYear(),rt=0;N&&!nt||(rt=nt>0?nt-1:dt.getMonth());var pt=oe||0,gt=ae||0,mt=ue||0,vt=he||0;return St?new Date(Date.UTC(lt,rt,ft,pt,gt,mt,vt+60*St.offset*1e3)):j?new Date(Date.UTC(lt,rt,ft,pt,gt,mt,vt)):new Date(lt,rt,ft,pt,gt,mt,vt)}catch{return new Date("")}}(_,A,w),this.init(),R&&R!==!0&&(this.$L=this.locale(R).$L),L&&_!=this.format(A)&&(this.$d=new Date("")),p={}}else if(A instanceof Array)for(var H=A.length,F=1;F<=H;F+=1){y[1]=A[F-1];var k=l.apply(this,y);if(k.isValid()){this.$d=k.$d,this.$L=k.$L,this.init();break}F===H&&(this.$d=new Date(""))}else g.call(this,v)}}})})(Nt);var Ne=Nt.exports;const qe=et(Ne);var qt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n,s){i=i||{};var a=n.prototype,d={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function p(h,S,E,b){return a.fromToBase(h,S,E,b)}s.en.relativeTime=d,a.fromToBase=function(h,S,E,b,U){for(var T,r,u,l=E.$locale().relativeTime||d,c=i.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],g=c.length,v=0;v<g;v+=1){var _=c[v];_.d&&(T=b?s(h).diff(E,_.d,!0):E.diff(h,_.d,!0));var w=(i.rounding||Math.round)(Math.abs(T));if(u=T>0,w<=_.r||!_.r){w<=1&&v>0&&(_=c[v-1]);var y=l[_.l];U&&(w=U(""+w)),r=typeof y=="string"?y.replace("%d",w):y(w,S,_.l,u);break}}if(S)return r;var A=u?l.future:l.past;return typeof A=="function"?A(r):A.replace("%s",r)},a.to=function(h,S){return p(h,S,this,!0)},a.from=function(h,S){return p(h,S,this)};var f=function(h){return h.$u?s.utc():s()};a.toNow=function(h){return this.to(f(this),h)},a.fromNow=function(h){return this.from(f(this),h)}}})})(qt);var Je=qt.exports;const Ze=et(Je);x.extend(We);x.extend(ke);x.extend(ze);x.extend(qe);x.extend(Ze);const q={SHORT:"MMM D",LONG:"ll",SLASHES:"L",TIME:"LT",AT_TIME:"lll",DATE(t){return t.isSame(x(),"year")?t.format(q.SHORT):t.format(q.LONG)},TIME_OR_DAY(t){return t.isSame(x(),"day")?t.format(q.TIME):q.DATE(t)},AGO_OR_TODAY(t){return t.isSame(x(),"day")?t.fromNow():q.DATE(t)}};function Ke(t,e){const i=q[e];return i?ge(i)?i(t):t.format(i):t.format(e)}function G(t,e,{hash:i={}}){const n=`${t}-fa-${e}`,s=`fa-${e}`,a=i.classes||"",d=`<svg class="icon svg-inline--fa ${s} ${a}"><use xlink:href="#${n}"></use></svg>`;return new Y.SafeString(d)}const Jt={far:st(G,"far"),fas:st(G,"fas"),fal:st(G,"fal"),fat:st(G,"fat"),fa:G};Y.registerHelper(Jt);Vt.registerHelper(Jt);const Mt=(t="",e)=>(t=String(t),t.trim()),Ge=(t,e)=>Tt(t)?[]:Mt(t).split(/\s+/),Xe=t=>(t=String(t),t=t.replace(/\-/g," "),t=t.replace(/[^\w\s]/g,""),Mt(t).toLowerCase()),Qe=me(function(t){const e=K(Ge(Xe(t)),RegExp.escape);return new RegExp(`\\b${e.join("|")}`,"gi")}),ti=(t,e,i,n)=>{if(!t)return;i=i||"strong",n=n||i;const s=Qe(e);return t.replace(s,`<${i}>$&</${n}>`)},Zt={matchText(t,e,{hash:i={}}){return e?(i.noEscape||(t=Y.escapeExpression(t)),new Y.SafeString(ti(t,e))):t},formatDateTime(t,e,{hash:i={}}){return t?(t=i.utc?x.utc(t,i.inputFormat).local():x(t,i.inputFormat),t=Ke(t,e),i.nowrap===!1?t:new Y.SafeString(`<span class="u-text--nowrap">${t}</span>`)):new Y.SafeString(i.defaultHtml||"")},formatPhoneNumber(t,{hash:e={}}){if(!t)return new Y.SafeString(e.defaultHtml||"");const i=ce(t,"US"),n=i?i.formatNational():"";return new Y.SafeString(n)}};Y.registerHelper(Zt);Vt.registerHelper(Zt);const ei={8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},$t={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":"'",",":"<",".":">","/":"?","\\":"|"},ii=["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"],ni=/textarea|input|select/i;X.hotkeys={version:"1.0.0",isTargetInput(t){return ni.test(t.nodeName)||X(t).attr("contenteditable")||ve(ii,t.type)}};function ri({data:t}){if(yt(t))return t.toLowerCase().split(" ");if(t&&yt(t.keys))return t.keys.toLowerCase().split(" ")}function si(t,e){let i="";return J(["alt","ctrl","shift"],function(n){t[`${n}Key`]&&e!==n&&(i+=`${n}+`)}),t.metaKey&&!t.ctrlKey&&e!=="meta"&&(i+="meta+"),t.metaKey&&e!=="meta"&&i.indexOf("alt+ctrl+shift+")>-1&&(i=i.replace("alt+ctrl+shift+","hyper+")),i}function oi(t,e,i){const n={},s=si(t,e);return e?n[s+e]=!0:(n[s+i]=!0,n[s+$t[i]]=!0,s==="shift+"&&(n[$t[i]]=!0)),n}function ai(t){const e=ri(t);if(!e)return;const i=t.handler;t.handler=function(n){if(this!==n.target&&X.hotkeys.isTargetInput(n.target))return;const s=n.type!=="keypress"&&ei[n.which],a=String.fromCharCode(n.which).toLowerCase(),d=oi(n,s,a);for(let p=0,f=e.length;p<f;p++)if(d[e[p]])return i.apply(this,arguments)}}J(["keydown","keyup","keypress"],t=>{X.event.special[t]={add:ai}});var M=[];for(var _t=0;_t<256;++_t)M.push((_t+256).toString(16).slice(1));function ui(t,e=0){return(M[t[e+0]]+M[t[e+1]]+M[t[e+2]]+M[t[e+3]]+"-"+M[t[e+4]]+M[t[e+5]]+"-"+M[t[e+6]]+M[t[e+7]]+"-"+M[t[e+8]]+M[t[e+9]]+"-"+M[t[e+10]]+M[t[e+11]]+M[t[e+12]]+M[t[e+13]]+M[t[e+14]]+M[t[e+15]]).toLowerCase()}var ot,hi=new Uint8Array(16);function ci(){if(!ot&&(ot=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!ot))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return ot(hi)}var di=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const Rt={randomUUID:di};function fi(t,e,i){if(Rt.randomUUID&&!e&&!t)return Rt.randomUUID();t=t||{};var n=t.random||(t.rng||ci)();return n[6]=n[6]&15|64,n[8]=n[8]&63|128,ui(n)}m.Model.prototype.sync=function(t,e,i){if(i=Lt(i),t==="create"){let n=i.data||i.attrs||e.toJSON(i);yt(n)&&(n=JSON.parse(n)),n.data.id=fi(),i.data=JSON.stringify(n)}return m.sync(t,e,i)};const{Region:Kt,View:li,CollectionView:pi,setDomApi:gi}=Yt;gi(Le);window._=o;window.$=X;window.Backbone=m;window.Radio=B;window.Marionette=Yt;window.dayjs=x;const mi=Kt.prototype.show;Kt.prototype.show=function(t,e){return t instanceof Ht?(t.showIn(this,null,e),this):mi.call(this,t,e)};const Gt=function(t){if(!this.isAttached())return!1;const e=t||this.$el,{left:i,top:n}=e.offset(),s=e.outerHeight(),a=e.outerWidth();return{left:i,top:n,outerHeight:s,outerWidth:a}};I(li.prototype,{getBounds:Gt});I(pi.prototype,{getBounds:Gt});m.Model.prototype.dayjs=function(t){const e=this.get(t);return!e&&e!==0?e:x(e)};RegExp.escape=function(t){return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")};function Xt(t,e){this.instances={},this.Model=t,this.modelName=e,this.ModelConstructor=this._getConstructor(t)}o.extend(Xt.prototype,{_getConstructor:function(e){var i=this,n=function(a,d){return i.get(a,d)};return o.extend(n,e),n.prototype=this.Model.prototype,n},get:function(e,i){var n=e&&e[this.Model.prototype.idAttribute],s=this.instances[n];return s?(s.set(e),O.trigger("update",s,this),s):this._new(e,i)},_new:function(e,i){var n=new this.Model(e,i);return n.isNew()?n.once("change:".concat(n.idAttribute),this._add,this):this._add(n),n.on("destroy",this.remove,this),n},_add:function(e){this.instances[e.id]||(this.instances[e.id]=e,O.trigger("add",e,this))},remove:function(e){return this.instances[e.id]&&(delete this.instances[e.id],O.trigger("remove",e,this)),e}});var V={};function O(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:o.uniqueId("Store_"),i=O.add(t,e);return i.ModelConstructor}o.extend(O,m.Events,{ModelCache:Xt,add:function(e,i){if(!i)throw"Model name required";return V[i]?V[i]:V[i]=new O.ModelCache(e,i)},getCache:function(e){if(!V[e])throw'Unrecognized Model: "'.concat(e,'"');return V[e]},getAllCache:function(){return o.clone(V)},get:function(e){return O.getCache(e).ModelConstructor},getAll:function(){return o.reduce(V,function(e,i,n){return e[n]=i.ModelConstructor,e},{})},remove:function(e){delete V[e]},removeAll:function(){V={}}});m.Store=O;const wt=t=>t&&Mt(t).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase();function Qt(t){J(t,e=>{const i=O.get(e.type),n=new i({id:e.id});n.set(n.parseModel(e))})}const te={cacheIncluded:Qt,parseId(t={},e){return t.id=e,t},parseRelationship(t){return t&&(Q(t)?K(t,e=>{const i={id:e.id};return e.meta&&J(e.meta,(n,s)=>{i[`_${wt(s)}`]=n}),i}):t.id)},parseRelationships(t,e){return J(e,(i,n)=>{t[`_${wt(n)}`]=this.parseRelationship(i.data,n)}),t},parseModel(t){const e=this.parseId(t.attributes,t.id);return e.__cached_ts=x.utc().format(),J(t.meta,(i,n)=>{e[`_${wt(n)}`]=i}),this.parseRelationships(e,t.relationships)},toRelation(t,e){if(!_e(t))return we(t)?{data:null}:t.models?{data:t.map(({id:i,type:n})=>({id:i,type:n}))}:Q(t)?{data:K(t,i=>({id:i.id?i.id:i,type:e}))}:ht(t)?{data:Ot(t,"id","type")}:{data:{id:t,type:e}}}},vi=W.extend({channelName:"entities",Entity:m,constructor:function(t){this.mergeOptions(t,["Entity"]),W.apply(this,arguments)},getCollection(t,e={}){return new this.Entity.Collection(t,e)},getModel(t,e){return t&&!ht(t)&&(t={id:t}),new this.Entity.Model(t,e)},fetchCollection(t){return new this.Entity.Collection().fetch(t)},fetchModel(t,e){return new this.Entity.Model({id:t}).fetch(e)},async fetchBy(t,e){const i=await ut(t,e);if(!i||i.status===204)return Promise.resolve();const n=await i.json();if(!i.ok)return Promise.reject({response:i,responseData:n});Qt(n.included);const s=new this.Entity.Model({id:n.data.id});return s.set(s.parseModel(n.data)),Promise.resolve(s)}}),_i=m.Collection.extend(I({fetch(t={}){return m.Collection.prototype.fetch.call(this,t).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.meta=t.meta,K(t.data,this.parseModel,this))},getMeta(t){return C(this.meta,t)},destroy(t){const e=Lt(this.models),i=ye(e,"destroy",t);return Promise.all(i)}},te)),ee=m.Model.extend(I({destroy(t){return this.isNew()?(m.Model.prototype.destroy.call(this,t),Promise.resolve(t)):m.Model.prototype.destroy.call(this,t)},fetch(t){return m.Model.prototype.fetch.call(this,I({abort:!0},t)).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.parseModel(t.data))},parseErrors({errors:t}){if(!t)return;const e="/data/attributes/";return Dt(t,(i,{source:n,detail:s})=>{const a=String(n.pointer).slice(e.length);return i[a]=s,i},{})},removeFEOnly(t){return Ot(t,function(e,i){return i!=="id"&&/^[^_]/.test(i)})},toJSONApi(t=this.attributes){return{id:this.id,type:this.type,attributes:this.removeFEOnly(t)}},save(t,e={},i){return t==null&&(i=e),e=I(this.toJSONApi(e.attributes||t),e),Tt(e.attributes)&&delete e.attributes,i=I({patch:!this.isNew(),data:JSON.stringify({data:e})},i),m.Model.prototype.save.call(this,t,i)},isCached(){return this.has("__cached_ts")}},te)),ie="forms",wi=`
  const subm = _.extend({ patient: {} }, formSubmission,  formData);

  subm.patient.fields = _.extend({}, _.get(formSubmission, 'patient.fields'), _.get(formData, 'patient.fields'));

  return subm;
`,yi=`
  formData.fields = formSubmission.fields || _.get(formSubmission, 'patient.fields');

  return formData;
`,Mi="return formSubmission;",ne=ee.extend({type:ie,urlRoot:"/api/forms",isReadOnly(){return C(this.get("options"),"read_only")},isReport(){return C(this.get("options"),"is_report")},isSubmitHidden(){return C(this.get("options"),"submit_hidden")},getContext(){return{contextScripts:this.getContextScripts(),loaderReducers:this.getLoaderReducers(),changeReducers:this.getChangeReducers(),beforeSubmit:this.getBeforeSubmit(),submitReducers:this.getSubmitReducers()}},getContextScripts(){return C(this.get("options"),"context",[])},getLoaderReducers(){return C(this.get("options"),"reducers",[wi])},getChangeReducers(){return C(this.get("options"),"changeReducers",[])},getBeforeSubmit(){return C(this.get("options"),"beforeSubmit",Mi)},getSubmitReducers(){const t=C(this.get("options"),"submitReducers");return Me(t)?t:[yi]},getWidgets(){const t=C(this.get("options"),["widgets","widgets"]);return B.request("widgets","build",t)},getPrefillFormId(){const t=C(this.get("options"),"prefill_form_id");return t||this.id},getPrefillActionTag(){return C(this.get("options"),"prefill_action_tag")}}),re=O(ne,ie),Si=_i.extend({url:"/api/forms",model:re,comparator:"name"}),Ai=vi.extend({Entity:{_Model:ne,Model:re,Collection:Si},radioRequests:{"forms:model":"getModel","forms:collection":"getCollection","fetch:forms:model":"fetchModel","fetch:forms:collection":"fetchCollection","fetch:forms:definition":"fetchDefinition","fetch:forms:data":"fetchFormData","fetch:forms:byAction":"fetchByAction","fetch:forms:definition:byAction":"fetchDefinitionByAction"},fetchDefinition(t){return ut(`/api/forms/${t}/definition`).then(bt)},fetchFormData(t,e,i){const n=new ee;if(t)return n.fetch({url:`/api/actions/${t}/form/fields`});const s={filter:{patient:e}};return n.fetch({url:`/api/forms/${i}/fields`,data:s})},fetchByAction(t){return this.fetchBy(`/api/actions/${t}/form`)},fetchDefinitionByAction(t){return ut(`/api/actions/${t}/form/definition`).then(bt)}});new Ai;async function Ci(t){if(Se(t))throw t;if(t.response){const e=t.response.status,{errors:i}=t.responseData;throw new Error(`Error Status: ${e} - ${JSON.stringify(i)}`)}throw new Error(JSON.stringify(t))}const Di=Pt.extend({triggerStart(t){this._isLoading=!0,this._fetchId=Ae("fetch");const e=Ct(this.triggerMethod,this,"sync:data",this._fetchId,t),i=Ct(this.triggerSyncFail,this,this._fetchId,t),n=this.beforeStart(t);if(!n){e();return}Promise.all(Q(n)?n:[n]).then(e).catch(i)},beforeStart:Ce,onSyncData(t,e,i=[]){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.finallyStart.call(this,e,...i))},triggerSyncFail(t,e,...i){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.triggerMethod("fail",e,...i))},onFail(t,e){Ci(e)},isRunning(){return this._isRunning&&!this.isLoading()},_isLoading:!1,isLoading(){return this._isLoading}});export{Di as A,ee as B,Ht as C,te as J,O as S,_i as a,Qe as b,vi as c,wt as d,ut as f,bt as h,Ri as m,Mt as t,ui as u,fi as v,Ge as w};