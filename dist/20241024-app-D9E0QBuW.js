import{d as x,H as Y,p as ge,$ as X}from"./20241024-parsePhoneNumber-BAdgtXgI.js";import{V as s,W as me,e as I,X as ve,j as dt,B as C,m as K,q as Q,k as bt,P as we,r as Vt,M as _e,E as tt,F as et,K as Yt,J as at,h as It,Y as ye,I as Me,g as J,i as At,Z as Pt,$ as Se,a0 as Ae,x as Ht,C as Ce,n as Ee,y as xe,a1 as be,u as $e,b as $t,w as Re}from"./20241024-index-BwuohFuR.js";import{B as w,M as z,A as Z,V as De,R as k,_ as Ft,e as Ut}from"./20241024-runtime-idANKiI7.js";var Te=["StateModel","stateEvents"],ht={StateModel:w.Model,initState:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._initState(e),this.delegateStateEvents(),this},_initState:function(e){this.mergeOptions(e,Te),this._removeEventHandlers();var i=this._getStateModel(e);this._stateModel=new i(e.state),this._setEventHandlers()},delegateStateEvents:function(){return this.undelegateStateEvents(),this.bindEvents(this._stateModel,s.result(this,"stateEvents")),this},undelegateStateEvents:function(){return this.unbindEvents(this._stateModel),this},_setEventHandlers:function(){this.on("destroy",this._destroyState)},_removeEventHandlers:function(){this._stateModel&&(this.undelegateStateEvents(),this._stateModel.stopListening(),this.off("destroy",this._destroyState))},_getStateModel:function(e){if(this.StateModel.prototype instanceof w.Model||this.StateModel===w.Model)return this.StateModel;if(s.isFunction(this.StateModel))return this.StateModel.call(this,e);throw new Error('"StateModel" must be a model class or a function that returns a model class')},setState:function(){return this._stateModel.set.apply(this._stateModel,arguments)},resetStateDefaults:function(){var e=s.result(this._stateModel,"defaults");return this._stateModel.set(e)},getState:function(e){return e?this._stateModel.get.apply(this._stateModel,arguments):this._stateModel},toggleState:function(e,i){return arguments.length>1?this._stateModel.set(e,!!i):this._stateModel.set(e,!this._stateModel.get(e))},hasState:function(e){return this._stateModel.has(e)},_destroyState:function(){this._stateModel.stopListening()}},Oe=["childApps","childAppOptions"],Le={_initChildApps:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this._childApps={},this.mergeOptions(e,Oe);var i=this.childApps;i&&(s.isFunction(i)&&(i=i.call(this,e)),this.addChildApps(i))},_getChildStartOpts:function(e){var i=this,n=e._tkOpts||{},r={region:this.getRegion(n.regionName)};return s.each(n.getOptions,function(u){r[u]=i.getOption(u)}),r},_startChildApp:function(e,i){var n=this._getChildStartOpts(e);return e.start(s.extend(n,i))},_shouldActWithRestart:function(e,i){if(!this._isRestarting)return!0;var n=s.result(e,"restartWithParent");if(n===!0||n!==!1&&s.result(e,i))return!0},_startChildApps:function(){var e=this,i="startWithParent";s.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!s.result(n,i)||e._startChildApp(n))})},_stopChildApps:function(){var e=this,i="stopWithParent";s.each(this._childApps,function(n){e._shouldActWithRestart(n,i)&&(!e._isRestarting&&!s.result(n,i)||n.stop())})},startChildApp:function(e,i){var n=this.getChildApp(e);if(!n)throw new Error("A child app with the name ".concat(e," does not exist."));return this._startChildApp(n,i)},stopChildApp:function(e,i){return this.getChildApp(e).stop(i)},_destroyChildApps:function(){s.each(this._childApps,function(e){s.result(e,"preventDestroy")||e.destroy()})},_buildAppFromObject:function(e){var i=e.AppClass,n=s.omit(e,"AppClass","regionName","getOptions"),r=this.buildApp(i,n);return r._tkOpts=s.pick(e,"regionName","getOptions"),r},_buildApp:function(e,i){if(s.isFunction(e))return this.buildApp(e,i);if(s.isObject(e))return this._buildAppFromObject(e)},buildApp:function(e,i){return i=s.extend({},this.childAppOptions,i),new e(i)},_ensureAppIsUnique:function(e){if(this._childApps[e])throw new Error('A child App with name "'.concat(e,'" has already been added.'))},addChildApps:function(e){s.each(e,s.bind(function(i,n){this.addChildApp(n,i)},this))},addChildApp:function(e,i,n){this._ensureAppIsUnique(e);var r=this._buildApp(i,n);if(!r)throw new Error("App build failed.  Incorrect configuration.");return r._name=e,this._childApps[e]=r,r._on("destroy",s.partial(this._removeChildApp,e),this),this.isRunning()&&s.result(r,"startWithParent")&&this._startChildApp(r),r},getName:function(){return this._name},getChildApps:function(){return s.clone(this._childApps)},getChildApp:function(e){return this._childApps[e]},_removeChildApp:function(e){delete this._childApps[e]._name,delete this._childApps[e]},removeChildApps:function(){var e=this.getChildApps();return s.each(this._childApps,s.bind(function(i,n){this.removeChildApp(n)},this)),e},removeChildApp:function(e,i){i=s.extend({},i);var n=this.getChildApp(e);if(n)return i.preventDestroy||s.result(n,"preventDestroy")?this._removeChildApp(e):n.destroy(),n}},Ve={_stopRunningEvents:function(){s.each(this._runningEvents,s.bind(function(e){this.off.apply(this,e)},this)),this._runningEvents=[]},_stopRunningListeners:function(){s.each(this._runningListeningTo,s.bind(function(e){this.stopListening.apply(this,e)},this)),this._runningListeningTo=[]},on:function(){return this._isRunning&&(this._runningEvents=this._runningEvents||[],this._runningEvents.push(arguments)),z.prototype.on.apply(this,arguments)},_on:z.prototype.on,listenTo:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),z.prototype.listenTo.apply(this,arguments)},_listenTo:z.prototype.listenTo,listenToOnce:function(){return this._isRunning&&(this._runningListeningTo=this._runningListeningTo||[],this._runningListeningTo.push(arguments)),z.prototype.listenToOnce.apply(this,arguments)}},kt={viewEventPrefix:!1,_buildEventProxies:function(){var e=s.result(this,"viewEvents")||{};this._viewEvents=this.normalizeMethods(e),this._viewTriggers=s.result(this,"viewTriggers")||{},this._viewEventPrefix=s.result(this,"viewEventPrefix")},_proxyViewEvents:function(e){this.listenTo(e,"all",this._childViewEventHandler)},_childViewEventHandler:function(e){for(var i=this._viewEvents,n=arguments.length,r=new Array(n>1?n-1:0),u=1;u<n;u++)r[u-1]=arguments[u];s.isFunction(i[e])&&i[e].apply(this,r);var h=this._viewTriggers;s.isString(h[e])&&this.triggerMethod.apply(this,[h[e]].concat(r));var g=this._viewEventPrefix;if(g!==!1){var d="".concat(g,":").concat(e);this.triggerMethod.apply(this,[d].concat(r))}}},Ye=["startWithParent","restartWithParent","stopWithParent","startAfterInitialized","preventDestroy","StateModel","stateEvents","viewEventPrefix","viewEvents","viewTriggers"],jt=Z.extend({_isRunning:!1,_isRestarting:!1,preventDestroy:!1,startAfterInitialized:!1,startWithParent:!1,stopWithParent:!0,restartWithParent:null,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,Ye),this.options=s.extend({},s.result(this,"options"),e),this._initChildApps(e),Z.call(this,e),s.result(this,"startAfterInitialized")&&this.start(e)},_ensureAppIsIntact:function(){if(this._isDestroyed)throw new Error("App has already been destroyed and cannot be used.")},isRunning:function(){return this._isRunning},isRestarting:function(){return this._isRestarting},start:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return this._ensureAppIsIntact(),this._isRunning?this:(e.region&&this.setRegion(e.region),e.view&&this.setView(e.view),this._initState(e),this._buildEventProxies(),this.triggerMethod("before:start",e),this._isRunning=!0,this._bindRunningEvents(),this.triggerStart(e),this)},_bindRunningEvents:function(){this._region&&this._regionEventMonitor(),this._view&&this._proxyViewEvents(this._view),this.delegateStateEvents()},restart:function(e){var i=this.getState().attributes;return this._isRestarting=!0,this.stop().start(s.extend({state:i},e)),this._isRestarting=!1,this},finallyStart:function(){this._startChildApps(),this.triggerMethod.apply(this,["start"].concat(Array.prototype.slice.call(arguments)))},triggerStart:function(e){this.finallyStart(e)},stop:function(e){return this._isRunning?(this.triggerMethod("before:stop",e),this._stopChildApps(),this._isRunning=!1,this.triggerMethod("stop",e),this._stopRunningListeners(),this._stopRunningEvents(),this):this},destroy:function(){return this._isDestroyed?this:(this.stop(),this._removeView(),this._destroyChildApps(),Z.prototype.destroy.apply(this,arguments),this)},setRegion:function(e){return this._region&&this.stopListening(this._region),this._region=e,e.currentView&&this.setView(e.currentView),this._isRunning&&this._regionEventMonitor(),e},_regionEventMonitor:function(){this.listenTo(this._region,{"before:show":this._onBeforeShow,empty:this._onEmpty})},_onBeforeShow:function(e,i){this.setView(i)},_onEmpty:function(e,i){i===this._view&&this._removeView()},_removeView:function(){this._view&&(this.stopListening(this._view),delete this._view)},getRegion:function(e){return e?this.getView().getRegion(e):this._region},setView:function(e){return this._view===e||(this._view&&this.stopListening(this._view),this._view=e,this._isRunning&&this._proxyViewEvents(e),this._listenTo(this._view,"destroy",this._removeView)),e},getView:function(){return this._view||this._region&&this._region.currentView},showView:function(){for(var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this._view,i=this.getRegion(),n=arguments.length,r=new Array(n>1?n-1:0),u=1;u<n;u++)r[u-1]=arguments[u];return i.show.apply(i,[e].concat(r)),this.isRunning()||this.setView(i.currentView),e},showChildView:function(e,i){for(var n,r=arguments.length,u=new Array(r>2?r-2:0),h=2;h<r;h++)u[h-2]=arguments[h];return(n=this.getView()).showChildView.apply(n,[e,i].concat(u)),i},getChildView:function(e){return this.getView().getChildView(e)}});s.extend(jt.prototype,ht,Le,Ve,kt);var Ie=["regionOptions","ViewClass","viewEventPrefix","viewEvents","viewTriggers","viewOptions"],Wt=Z.extend({ViewClass:De,constructor:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};this.mergeOptions(e,Ie),this.options=s.extend({},s.result(this,"options"),e),this._buildEventProxies(),this._initState(e),Z.call(this,e),this.delegateStateEvents()},showIn:function(e,i,n){return this._region=e,this.show(i,n),this},show:function(e,i){var n=this.getRegion();if(!n)throw new Error("Component has no defined region.");var r=this._getView(e);return this.stopListening(n.currentView,"destroy",this.destroy),this.triggerMethod("before:show",this,r,e,i),this.showView(r,this.mixinRegionOptions(i)),this.listenTo(n.currentView,"destroy",this.destroy),this.triggerMethod("show",this,r,e,i),this},empty:function(){var e=this.getRegion();if(!e)throw new Error("Component has no defined region.");return this.stopListening(e.currentView,"destroy",this.destroy),e.empty(),this},mixinRegionOptions:function(e){var i=s.result(this,"regionOptions");return s.extend({},i,e)},_getView:function(e){var i=this._getViewClass(e),n=this.mixinViewOptions(e),r=this.buildView(i,n);return this._proxyViewEvents(r),r},_getViewClass:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},i=this.ViewClass;if(i.prototype instanceof w.View||i===w.View)return i;if(s.isFunction(i))return i.call(this,e);throw new Error('"ViewClass" must be a view class or a function that returns a view class')},mixinViewOptions:function(e){var i=s.result(this,"viewOptions");return s.extend({state:this.getState().attributes},i,e)},buildView:function(e,i){return new e(i)},destroy:function(){if(this._isDestroyed)return this;var e=this.getRegion();return e&&e.empty(),Z.prototype.destroy.apply(this,arguments),this}},{setRegion:function(e){this.prototype.region=e}});s.extend(Wt.prototype,ht,kt);function Vi(t){var e=ht;t.prototype.StateModel&&(e=s.omit(ht,"StateModel")),s.extend(t.prototype,e)}const Pe={getEl(t){return[t]},findEl(t,e){return t.querySelectorAll(e)},detachEl(t){t.parentNode&&t.parentNode.removeChild(t)},hasContents(t){return t.hasChildNodes()},setContents(t,e){t.innerHTML=e},appendContents(t,e){t.appendChild(e)},detachContents(t){t.textContent=""}},lt=[];function He(t,e,i){return lt[t]={fetcher:e,controller:i},e}function Fe(t){return C(lt[t],"fetcher")}function Bt(t){delete lt[t]}function Ue(t){const e=C(lt[t],"controller");e&&(e.abort(),Bt(t))}function ke(t,e={}){const i=Fe(t);return i?e.abort!==!1?(Ue(t),!1):i:!1}async function je(t,e={}){const i=await k.request("auth","getToken"),n=new AbortController,r=t;e=I({signal:n.signal,dataType:"json",headers:ve(e.headers,{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json"})},e),i&&(e.headers.Authorization=`Bearer ${i}`),!e.method||e.method==="GET"?t=Be(t,e.data):e.data&&(e.body=e.data);const u=k.request("workspace","current");u&&(e.headers.Workspace=u.id);const h=k.request("bootstrap","currentUser");return h&&(e.headers["Client-Key"]=h.clientKey),He(r,fetch(t,e),n)}function Rt(t){return encodeURIComponent(t??"")}function Dt(t){if(Q(t)){const e=encodeURIComponent(we(t));return Vt(_e(t),(i,n)=>`${i}[${encodeURIComponent(n)}]`,e)}return encodeURIComponent(t)}function zt(t,e){return Q(t)?`${Dt(e)}=${t.map(Rt).join()}`:dt(t)?bt(K(t,(i,n)=>zt(i,bt([e,n])))).join("&"):`${Dt(e)}=${Rt(t)}`}function We(t){return K(t,zt).join("&")}function Be(t,e){if(!dt(e))return t;const i=We(e);return i?`${t}?${i}`:t}function Nt(t,e){return t=t.clone(),e==="json"&&t.status!==204?t.json():t.text()}async function Tt(t){if(!t)return;const e=await Nt(t,"json");return t.ok?e:Promise.reject({response:t,responseData:e})}function qt(t){if(t.name!=="AbortError")throw t}const ct=async(t,e)=>(ke(t,e)||je(t,e)).then(async n=>(Bt(t),n.ok||(n.status===401&&k.request("auth","logout"),n.status>=400&&(me(t,e,n),String(n.headers.get("Content-Type")).includes("json")||k.trigger("event-router","unknownError",n.status)),(n.status>=500||!n.status)&&k.trigger("event-router","unknownError",n.status)),n)).catch(qt);w.ajax=t=>(t=I({method:t.type},t),ct(t.url,t).then(async i=>{if(!i)return;const n=await Nt(i,t.dataType);return i.ok?(t.success&&t.success(n),i):(t.error&&t.error(n),Promise.reject({response:i,responseData:n}))}).catch(qt));var Jt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i="minute",n=/[+-]\d\d(?::?\d\d)?/g,r=/([+-]|\d\d)/g;return function(u,h,g){var d=h.prototype;g.utc=function(a){var o={date:a,utc:!0,args:arguments};return new h(o)},d.utc=function(a){var o=g(this.toDate(),{locale:this.$L,utc:!0});return a?o.add(this.utcOffset(),i):o},d.local=function(){return g(this.toDate(),{locale:this.$L,utc:!1})};var m=d.parse;d.parse=function(a){a.utc&&(this.$u=!0),this.$utils().u(a.$offset)||(this.$offset=a.$offset),m.call(this,a)};var p=d.init;d.init=function(){if(this.$u){var a=this.$d;this.$y=a.getUTCFullYear(),this.$M=a.getUTCMonth(),this.$D=a.getUTCDate(),this.$W=a.getUTCDay(),this.$H=a.getUTCHours(),this.$m=a.getUTCMinutes(),this.$s=a.getUTCSeconds(),this.$ms=a.getUTCMilliseconds()}else p.call(this)};var b=d.utcOffset;d.utcOffset=function(a,o){var c=this.$utils().u;if(c(a))return this.$u?0:c(this.$offset)?b.call(this):this.$offset;if(typeof a=="string"&&(a=function(v){v===void 0&&(v="");var M=v.match(n);if(!M)return null;var S=(""+M[0]).match(r)||["-",0,0],A=S[0],E=60*+S[1]+ +S[2];return E===0?0:A==="+"?E:-E}(a),a===null))return this;var f=Math.abs(a)<=16?60*a:a,l=this;if(o)return l.$offset=f,l.$u=a===0,l;if(a!==0){var _=this.$u?this.toDate().getTimezoneOffset():-1*this.utcOffset();(l=this.local().add(f+_,i)).$offset=f,l.$x.$localOffset=_}else l=this.utc();return l};var $=d.format;d.format=function(a){var o=a||(this.$u?"YYYY-MM-DDTHH:mm:ss[Z]":"");return $.call(this,o)},d.valueOf=function(){var a=this.$utils().u(this.$offset)?0:this.$offset+(this.$x.$localOffset||this.$d.getTimezoneOffset());return this.$d.valueOf()-6e4*a},d.isUTC=function(){return!!this.$u},d.toISOString=function(){return this.toDate().toISOString()},d.toString=function(){return this.toDate().toUTCString()};var P=d.toDate;d.toDate=function(a){return a==="s"&&this.$offset?g(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate():P.call(this)};var T=d.diff;d.diff=function(a,o,c){if(a&&this.$u===a.$u)return T.call(this,a,o,c);var f=this.local(),l=g(a).local();return T.call(f,l,o,c)}}})})(Jt);var ze=Jt.exports;const Ne=et(ze);var Zt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(n,r,u){var h=r.prototype,g=h.format;u.en.formats=i,h.format=function(d){d===void 0&&(d="YYYY-MM-DDTHH:mm:ssZ");var m=this.$locale().formats,p=function(b,$){return b.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(P,T,a){var o=a&&a.toUpperCase();return T||$[a]||i[a]||$[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(c,f,l){return f||l.slice(1)})})}(d,m===void 0?{}:m);return g.call(this,p)}}})})(Zt);var qe=Zt.exports;const Je=et(qe);var Kt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n){n.prototype.weekday=function(r){var u=this.$locale().weekStart||0,h=this.$W,g=(h<u?h+7:h)-u;return this.$utils().u(r)?g:this.subtract(g,"day").add(r,"day")}}})})(Kt);var Ze=Kt.exports;const Ke=et(Ze);var Gt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){var i={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},n=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,r=/\d/,u=/\d\d/,h=/\d\d?/,g=/\d*[^-_:/,()\s\d]+/,d={},m=function(o){return(o=+o)+(o>68?1900:2e3)},p=function(o){return function(c){this[o]=+c}},b=[/[+-]\d\d:?(\d\d)?|Z/,function(o){(this.zone||(this.zone={})).offset=function(c){if(!c||c==="Z")return 0;var f=c.match(/([+-]|\d\d)/g),l=60*f[1]+(+f[2]||0);return l===0?0:f[0]==="+"?-l:l}(o)}],$=function(o){var c=d[o];return c&&(c.indexOf?c:c.s.concat(c.f))},P=function(o,c){var f,l=d.meridiem;if(l){for(var _=1;_<=24;_+=1)if(o.indexOf(l(_,0,c))>-1){f=_>12;break}}else f=o===(c?"pm":"PM");return f},T={A:[g,function(o){this.afternoon=P(o,!1)}],a:[g,function(o){this.afternoon=P(o,!0)}],Q:[r,function(o){this.month=3*(o-1)+1}],S:[r,function(o){this.milliseconds=100*+o}],SS:[u,function(o){this.milliseconds=10*+o}],SSS:[/\d{3}/,function(o){this.milliseconds=+o}],s:[h,p("seconds")],ss:[h,p("seconds")],m:[h,p("minutes")],mm:[h,p("minutes")],H:[h,p("hours")],h:[h,p("hours")],HH:[h,p("hours")],hh:[h,p("hours")],D:[h,p("day")],DD:[u,p("day")],Do:[g,function(o){var c=d.ordinal,f=o.match(/\d+/);if(this.day=f[0],c)for(var l=1;l<=31;l+=1)c(l).replace(/\[|\]/g,"")===o&&(this.day=l)}],w:[h,p("week")],ww:[u,p("week")],M:[h,p("month")],MM:[u,p("month")],MMM:[g,function(o){var c=$("months"),f=($("monthsShort")||c.map(function(l){return l.slice(0,3)})).indexOf(o)+1;if(f<1)throw new Error;this.month=f%12||f}],MMMM:[g,function(o){var c=$("months").indexOf(o)+1;if(c<1)throw new Error;this.month=c%12||c}],Y:[/[+-]?\d+/,p("year")],YY:[u,function(o){this.year=m(o)}],YYYY:[/\d{4}/,p("year")],Z:b,ZZ:b};function a(o){var c,f;c=o,f=d&&d.formats;for(var l=(o=c.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(j,H,O){var D=O&&O.toUpperCase();return H||f[O]||i[O]||f[D].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(F,U,W){return U||W.slice(1)})})).match(n),_=l.length,v=0;v<_;v+=1){var M=l[v],S=T[M],A=S&&S[0],E=S&&S[1];l[v]=E?{regex:A,parser:E}:M.replace(/^\[|\]$/g,"")}return function(j){for(var H={},O=0,D=0;O<_;O+=1){var F=l[O];if(typeof F=="string")D+=F.length;else{var U=F.regex,W=F.parser,it=j.slice(D),N=U.exec(it)[0];W.call(H,N),j=j.replace(N,"")}}return function(B){var nt=B.afternoon;if(nt!==void 0){var R=B.hours;nt?R<12&&(B.hours+=12):R===12&&(B.hours=0),delete B.afternoon}}(H),H}}return function(o,c,f){f.p.customParseFormat=!0,o&&o.parseTwoDigitYear&&(m=o.parseTwoDigitYear);var l=c.prototype,_=l.parse;l.parse=function(v){var M=v.date,S=v.utc,A=v.args;this.$u=S;var E=A[1];if(typeof E=="string"){var j=A[2]===!0,H=A[3]===!0,O=j||H,D=A[2];H&&(D=A[2]),d=this.$locale(),!j&&D&&(d=f.Ls[D]),this.$d=function(it,N,B,nt){try{if(["x","X"].indexOf(N)>-1)return new Date((N==="X"?1e3:1)*it);var R=a(N)(it),ft=R.year,rt=R.month,ce=R.day,de=R.hours,le=R.minutes,fe=R.seconds,pe=R.milliseconds,Et=R.zone,xt=R.week,pt=new Date,gt=ce||(ft||rt?1:pt.getDate()),mt=ft||pt.getFullYear(),st=0;ft&&!rt||(st=rt>0?rt-1:pt.getMonth());var ot,vt=de||0,wt=le||0,_t=fe||0,yt=pe||0;return Et?new Date(Date.UTC(mt,st,gt,vt,wt,_t,yt+60*Et.offset*1e3)):B?new Date(Date.UTC(mt,st,gt,vt,wt,_t,yt)):(ot=new Date(mt,st,gt,vt,wt,_t,yt),xt&&(ot=nt(ot).week(xt).toDate()),ot)}catch{return new Date("")}}(M,E,S,f),this.init(),D&&D!==!0&&(this.$L=this.locale(D).$L),O&&M!=this.format(E)&&(this.$d=new Date("")),d={}}else if(E instanceof Array)for(var F=E.length,U=1;U<=F;U+=1){A[1]=E[U-1];var W=f.apply(this,A);if(W.isValid()){this.$d=W.$d,this.$L=W.$L,this.init();break}U===F&&(this.$d=new Date(""))}else _.call(this,v)}}})})(Gt);var Ge=Gt.exports;const Xe=et(Ge);var Xt={exports:{}};(function(t,e){(function(i,n){t.exports=n()})(tt,function(){return function(i,n,r){i=i||{};var u=n.prototype,h={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function g(m,p,b,$){return u.fromToBase(m,p,b,$)}r.en.relativeTime=h,u.fromToBase=function(m,p,b,$,P){for(var T,a,o,c=b.$locale().relativeTime||h,f=i.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],l=f.length,_=0;_<l;_+=1){var v=f[_];v.d&&(T=$?r(m).diff(b,v.d,!0):b.diff(m,v.d,!0));var M=(i.rounding||Math.round)(Math.abs(T));if(o=T>0,M<=v.r||!v.r){M<=1&&_>0&&(v=f[_-1]);var S=c[v.l];P&&(M=P(""+M)),a=typeof S=="string"?S.replace("%d",M):S(M,p,v.l,o);break}}if(p)return a;var A=o?c.future:c.past;return typeof A=="function"?A(a):A.replace("%s",a)},u.to=function(m,p){return g(m,p,this,!0)},u.from=function(m,p){return g(m,p,this)};var d=function(m){return m.$u?r.utc():r()};u.toNow=function(m){return this.to(d(this),m)},u.fromNow=function(m){return this.from(d(this),m)}}})})(Xt);var Qe=Xt.exports;const ti=et(Qe);x.extend(Je);x.extend(Ne);x.extend(Ke);x.extend(Xe);x.extend(ti);const q={SHORT:"MMM D",LONG:"ll",SLASHES:"L",TIME:"LT",AT_TIME:"lll",DATE(t){return t.isSame(x(),"year")?t.format(q.SHORT):t.format(q.LONG)},TIME_OR_DAY(t){return t.isSame(x(),"day")?t.format(q.TIME):q.DATE(t)},AGO_OR_TODAY(t){return t.isSame(x(),"day")?t.fromNow():q.DATE(t)}};function ei(t,e){const i=q[e];return i?Yt(i)?i(t):t.format(i):t.format(e)}function G(t,e,{hash:i={}}){const n=`${t}-fa-${e}`,r=`fa-${e}`,u=i.classes||"",h=`<svg class="icon svg-inline--fa ${r} ${u}"><use xlink:href="#${n}"></use></svg>`;return new Y.SafeString(h)}const Qt={far:at(G,"far"),fas:at(G,"fas"),fal:at(G,"fal"),fat:at(G,"fat"),fa:G};Y.registerHelper(Qt);Ft.registerHelper(Qt);const Ct=(t="",e)=>(t=String(t),t.trim()),ii=(t,e)=>It(t)?[]:Ct(t).split(/\s+/),ni=t=>(t=String(t),t=t.replace(/\-/g," "),t=t.replace(/[^\w\s]/g,""),Ct(t).toLowerCase()),ri=ye(function(t){const e=K(ii(ni(t)),RegExp.escape);return new RegExp(`\\b${e.join("|")}`,"gi")}),si=(t,e,i,n)=>{if(!t)return;i=i||"strong",n=n||i;const r=ri(e);return t.replace(r,`<${i}>$&</${n}>`)},te={matchText(t,e,{hash:i={}}){return e?(i.noEscape||(t=Y.escapeExpression(t)),new Y.SafeString(si(t,e))):t},formatDateTime(t,e,{hash:i={}}){return t?(t=i.utc?x.utc(t,i.inputFormat).local():x(t,i.inputFormat),t=ei(t,e),i.nowrap===!1?t:new Y.SafeString(`<span class="u-text--nowrap">${t}</span>`)):new Y.SafeString(i.defaultHtml||"")},formatPhoneNumber(t,{hash:e={}}){if(!t)return new Y.SafeString(e.defaultHtml||"");const i=ge(t,"US"),n=i?i.formatNational():"";return new Y.SafeString(n)}};Y.registerHelper(te);Ft.registerHelper(te);const oi={8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},Ot={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":"'",",":"<",".":">","/":"?","\\":"|"},ai=["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"],ui=/textarea|input|select/i;X.hotkeys={version:"1.0.0",isTargetInput(t){return ui.test(t.nodeName)||X(t).attr("contenteditable")||Me(ai,t.type)}};function hi({data:t}){if(At(t))return t.toLowerCase().split(" ");if(t&&At(t.keys))return t.keys.toLowerCase().split(" ")}function ci(t,e){let i="";return J(["alt","ctrl","shift"],function(n){t[`${n}Key`]&&e!==n&&(i+=`${n}+`)}),t.metaKey&&!t.ctrlKey&&e!=="meta"&&(i+="meta+"),t.metaKey&&e!=="meta"&&i.indexOf("alt+ctrl+shift+")>-1&&(i=i.replace("alt+ctrl+shift+","hyper+")),i}function di(t,e,i){const n={},r=ci(t,e);return e?n[r+e]=!0:(n[r+i]=!0,n[r+Ot[i]]=!0,r==="shift+"&&(n[Ot[i]]=!0)),n}function li(t){const e=hi(t);if(!e)return;const i=t.handler;t.handler=function(n){if(this!==n.target&&X.hotkeys.isTargetInput(n.target))return;const r=n.type!=="keypress"&&oi[n.which],u=String.fromCharCode(n.which).toLowerCase(),h=di(n,r,u);for(let g=0,d=e.length;g<d;g++)if(h[e[g]])return i.apply(this,arguments)}}J(["keydown","keyup","keypress"],t=>{X.event.special[t]={add:li}});var y=[];for(var Mt=0;Mt<256;++Mt)y.push((Mt+256).toString(16).slice(1));function fi(t,e=0){return(y[t[e+0]]+y[t[e+1]]+y[t[e+2]]+y[t[e+3]]+"-"+y[t[e+4]]+y[t[e+5]]+"-"+y[t[e+6]]+y[t[e+7]]+"-"+y[t[e+8]]+y[t[e+9]]+"-"+y[t[e+10]]+y[t[e+11]]+y[t[e+12]]+y[t[e+13]]+y[t[e+14]]+y[t[e+15]]).toLowerCase()}var ut,pi=new Uint8Array(16);function gi(){if(!ut&&(ut=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!ut))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return ut(pi)}var mi=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);const Lt={randomUUID:mi};function vi(t,e,i){if(Lt.randomUUID&&!e&&!t)return Lt.randomUUID();t=t||{};var n=t.random||(t.rng||gi)();return n[6]=n[6]&15|64,n[8]=n[8]&63|128,fi(n)}w.Model.prototype.sync=function(t,e,i){if(i=Pt(i),t==="create"){let n=i.data||i.attrs||e.toJSON(i);At(n)&&(n=JSON.parse(n)),n.data.id=vi(),i.data=JSON.stringify(n)}return w.sync(t,e,i)};const{Region:ee,View:wi,CollectionView:_i,setDomApi:yi}=Ut;yi(Pe);window._=s;window.$=X;window.Backbone=w;window.Radio=k;window.Marionette=Ut;window.dayjs=x;const Mi=ee.prototype.show;ee.prototype.show=function(t,e){return t instanceof Wt?(t.showIn(this,null,e),this):Mi.call(this,t,e)};const ie=function(t){if(!this.isAttached())return!1;const e=t||this.$el,{left:i,top:n}=e.offset(),r=e.outerHeight(),u=e.outerWidth();return{left:i,top:n,outerHeight:r,outerWidth:u}};I(wi.prototype,{getBounds:ie});I(_i.prototype,{getBounds:ie});w.Model.prototype.dayjs=function(t){const e=this.get(t);return!e&&e!==0?e:x(e)};RegExp.escape=function(t){return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")};function ne(t,e){this.instances={},this.Model=t,this.modelName=e,this.ModelConstructor=this._getConstructor(t)}s.extend(ne.prototype,{_getConstructor:function(e){var i=this,n=function(u,h){return i.get(u,h)};return s.extend(n,e),n.prototype=this.Model.prototype,n},get:function(e,i){var n=e&&e[this.Model.prototype.idAttribute],r=this.instances[n];return r?(r.set(e),L.trigger("update",r,this),r):this._new(e,i)},_new:function(e,i){var n=new this.Model(e,i);return n.isNew()?n.once("change:".concat(n.idAttribute),this._add,this):this._add(n),n.on("destroy",this.remove,this),n},_add:function(e){this.instances[e.id]||(this.instances[e.id]=e,L.trigger("add",e,this))},remove:function(e){return this.instances[e.id]&&(delete this.instances[e.id],L.trigger("remove",e,this)),e}});var V={};function L(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:s.uniqueId("Store_"),i=L.add(t,e);return i.ModelConstructor}s.extend(L,w.Events,{ModelCache:ne,add:function(e,i){if(!i)throw"Model name required";return V[i]?V[i]:V[i]=new L.ModelCache(e,i)},getCache:function(e){if(!V[e])throw'Unrecognized Model: "'.concat(e,'"');return V[e]},getAllCache:function(){return s.clone(V)},get:function(e){return L.getCache(e).ModelConstructor},getAll:function(){return s.reduce(V,function(e,i,n){return e[n]=i.ModelConstructor,e},{})},remove:function(e){delete V[e]},removeAll:function(){V={}}});w.Store=L;const St=t=>t&&Ct(t).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase();function re(t){J(t,e=>{const i=L.get(e.type),n=new i({id:e.id});n.set(n.parseModel(e))})}const se={cacheIncluded:re,parseId(t={},e){return t.id=e,t},parseRelationship(t){return t&&(Q(t)?K(t,e=>{const i={id:e.id};return e.meta&&J(e.meta,(n,r)=>{i[`_${St(r)}`]=n}),i}):t.id)},parseRelationships(t,e){return J(e,(i,n)=>{t[`_${St(n)}`]=this.parseRelationship(i.data,n)}),t},parseModel(t){const e=this.parseId(t.attributes,t.id);return e.__cached_ts=x.utc().format(),J(t.meta,(i,n)=>{e[`_${St(n)}`]=i}),this.parseRelationships(e,t.relationships)},toRelation(t,e){if(!Se(t))return Ae(t)?{data:null}:t.models?{data:t.map(({id:i,type:n})=>({id:i,type:n}))}:Q(t)?{data:K(t,i=>({id:i.id?i.id:i,type:e}))}:dt(t)?{data:Ht(t,"id","type")}:{data:{id:t,type:e}}}},Si=z.extend({channelName:"entities",Entity:w,constructor:function(t){this.mergeOptions(t,["Entity"]),z.apply(this,arguments)},getCollection(t,e={}){return new this.Entity.Collection(t,e)},getModel(t,e){return t&&!dt(t)&&(t={id:t}),new this.Entity.Model(t,e)},fetchCollection(t){return new this.Entity.Collection().fetch(t)},fetchModel(t,e){return new this.Entity.Model({id:t}).fetch(e)},async fetchBy(t,e){const i=await ct(t,e);if(!i||i.status===204)return Promise.resolve();const n=await i.json();if(!i.ok)return Promise.reject({response:i,responseData:n});re(n.included);const r=new this.Entity.Model({id:n.data.id});return r.set(r.parseModel(n.data)),Promise.resolve(r)}}),Ai=w.Collection.extend(I({fetch(t={}){return w.Collection.prototype.fetch.call(this,t).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.meta=t.meta,K(t.data,this.parseModel,this))},getMeta(t){return C(this.meta,t)},destroy(t){const e=Pt(this.models),i=Ce(e,"destroy",t);return Promise.all(i)}},se)),oe=w.Model.extend(I({destroy(t){return this.isNew()?(w.Model.prototype.destroy.call(this,t),Promise.resolve(t)):w.Model.prototype.destroy.call(this,t)},fetch(t){return w.Model.prototype.fetch.call(this,I({abort:!0},t)).then(i=>!i||i.ok?this:i)},parse(t){return!t||!t.data?t:(this.cacheIncluded(t.included),this.parseModel(t.data))},parseErrors({errors:t}){if(!t)return;const e="/data/attributes/";return Vt(t,(i,{source:n,detail:r})=>{const u=String(n.pointer).slice(e.length);return i[u]=r,i},{})},removeFEOnly(t){return Ht(t,function(e,i){return i!=="id"&&/^[^_]/.test(i)})},getResource(){return{id:this.id,type:this.type}},toJSONApi(t=this.attributes){return{id:this.id,type:this.type,attributes:this.removeFEOnly(t)}},save(t,e={},i){return t==null&&(i=e),e=I(this.toJSONApi(e.attributes||t),e),It(e.attributes)&&delete e.attributes,i=I({patch:!this.isNew(),data:JSON.stringify({data:e})},i),w.Model.prototype.save.call(this,t,i)},isCached(){return this.has("__cached_ts")},_getMessageHandler(t){const e=Ee(this,"messages",{});return Yt(e[t])?e[t]:this[e[t]]},handleMessage({category:t,payload:e}){const i=this._getMessageHandler(t);i&&i.call(this,e),this.trigger("message",{category:t,payload:e})}},se)),ae="forms",Ci=`
  const subm = _.extend({ patient: {} }, formSubmission,  formData);

  subm.patient.fields = _.extend({}, _.get(formSubmission, 'patient.fields'), _.get(formData, 'patient.fields'));

  return subm;
`,Ei=`
  formData.fields = formSubmission.fields || _.get(formSubmission, 'patient.fields');

  return formData;
`,xi="return formSubmission;",ue=oe.extend({type:ae,urlRoot:"/api/forms",isReadOnly(){return C(this.get("options"),"read_only")},isReport(){return C(this.get("options"),"is_report")},isSubmitHidden(){return C(this.get("options"),"submit_hidden")},getContext(){return{contextScripts:this.getContextScripts(),loaderReducers:this.getLoaderReducers(),changeReducers:this.getChangeReducers(),beforeSubmit:this.getBeforeSubmit(),submitReducers:this.getSubmitReducers()}},getContextScripts(){return C(this.get("options"),"context",[])},getLoaderReducers(){return C(this.get("options"),"reducers",[Ci])},getChangeReducers(){return C(this.get("options"),"changeReducers",[])},getBeforeSubmit(){return C(this.get("options"),"beforeSubmit",xi)},getSubmitReducers(){const t=C(this.get("options"),"submitReducers");return xe(t)?t:[Ei]},getWidgets(){const t=C(this.get("options"),["widgets","widgets"]);return k.request("widgets","build",t)},getPrefillFormId(){const t=C(this.get("options"),"prefill_form_id");return t||this.id},getPrefillActionTag(){return C(this.get("options"),"prefill_action_tag")}}),he=L(ue,ae),bi=Ai.extend({url:"/api/forms",model:he,comparator:"name"}),$i=Si.extend({Entity:{_Model:ue,Model:he,Collection:bi},radioRequests:{"forms:model":"getModel","forms:collection":"getCollection","fetch:forms:model":"fetchModel","fetch:forms:collection":"fetchCollection","fetch:forms:definition":"fetchDefinition","fetch:forms:data":"fetchFormData","fetch:forms:byAction":"fetchByAction","fetch:forms:definition:byAction":"fetchDefinitionByAction"},fetchDefinition(t){return ct(`/api/forms/${t}/definition`).then(Tt)},fetchFormData(t,e,i){const n=new oe;if(t)return n.fetch({url:`/api/actions/${t}/form/fields`});const r={filter:{patient:e}};return n.fetch({url:`/api/forms/${i}/fields`,data:r})},fetchByAction(t){return this.fetchBy(`/api/actions/${t}/form`)},fetchDefinitionByAction(t){return ct(`/api/actions/${t}/form/definition`).then(Tt)}});new $i;async function Ri(t){if(be(t))throw t;if(t.response){const e=t.response.status,{errors:i}=t.responseData;throw new Error(`Error Status: ${e} - ${JSON.stringify(i)}`)}throw new Error(JSON.stringify(t))}const Yi=jt.extend({triggerStart(t){this._isLoading=!0,this._fetchId=$e("fetch");const e=$t(this.triggerMethod,this,"sync:data",this._fetchId,t),i=$t(this.triggerSyncFail,this,this._fetchId,t),n=this.beforeStart(t);if(!n){e();return}Promise.all(Q(n)?n:[n]).then(e).catch(i)},beforeStart:Re,onSyncData(t,e,i=[]){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.finallyStart.call(this,e,...i))},triggerSyncFail(t,e,...i){!this._isRunning||this._fetchId!==t||(this._isLoading=!1,this.triggerMethod("fail",e,...i))},onFail(t,e){Ri(e)},isRunning(){return this._isRunning&&!this.isLoading()},_isLoading:!1,isLoading(){return this._isLoading}});export{Yi as A,oe as B,Wt as C,se as J,L as S,Ai as a,ri as b,Si as c,St as d,ct as f,Tt as h,Vi as m,Ct as t,fi as u,vi as v,ii as w};