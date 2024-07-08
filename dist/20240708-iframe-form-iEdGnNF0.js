import{D as E,E as A,u as y,G as C,J as b,l as w,r as R,I as x,K as F,e as K,L,M as Y,N as q}from"./20240708-index-IPow8CrK.js";import{r as N,c as D,d as I,B as h,R as a,b as M}from"./20240708-runtime-BXvT6bd-.js";import{A as d}from"./20240708-app-B2MCT9A2.js";import{$ as m}from"./20240708-parsePhoneNumber-DUok-7-R.js";var T={exports:{}};/**
 * backbone.eventrouter - A highly opinionated, simplistic Backbone.Router coupled with a Backbone.Radio.Channel
 * @version v1.0.1
 * @link https://github.com/RoundingWellOS/backbone.eventrouter
 * @license MIT
 */(function(t,r){(function(e,n){t.exports=n(N,D,I)})(E,function(e,n,g){e="default"in e?e.default:e,n="default"in n?n.default:n;var c=/(\(\?)?:\w+/,v=n.EventRouter=n.Router.extend({constructor:function(s){e.extend(this,e.pick(s,["channelName","routeTriggers"])),this._ch=n.Radio.channel(e.result(this,"channelName")),this.listenTo(this._ch,"all",this.navigateFromEvent),n.Router.apply(this,arguments),this._initRoutes()},channelName:"event-router",getChannel:function(){return this._ch},_initRoutes:function(){this._routeTriggers=e.result(this,"routeTriggers",{}),e.each(this._routeTriggers,this._addRouteTrigger,this)},_addRouteTrigger:function(s,i){s=e.isArray(s)?s:[s],e.each(s,function(u){this.route(u,i,e.bind(this._ch.trigger,this._ch,i))},this)},addRouteTrigger:function(s,i){return this._routeTriggers[i]=s,this._addRouteTrigger(s,i),this},route:function(s,i,u){var l=n.Router.prototype.route;if(e.isFunction(i)||!u)return l.call(this,s,i,u);var f=e.bind(function(){var p=e.drop(arguments,0);this.trigger("before:route",i,p),this.trigger.apply(this,["before:route:"+i].concat(p)),this._storeRouteTrigger([i].concat(p)),u.apply(this,p),this._clearRouteTrigger()},this);return l.call(this,s,i,f)},_storeRouteTrigger:function(s){this._routeArgs=this._routeArgs||[],this._routeArgs.push(s)},_getCurrentRouteTrigger:function(){return e.last(this._routeArgs)||[]},_clearRouteTrigger:function(){this._routeArgs.pop()},_isTriggeredFromRoute:function(){var s=this._getCurrentRouteTrigger();return arguments.length!==s.length?!1:arguments.length===e.union(arguments,this.currentRoute).length},navigateFromEvent:function(s){var i=this.getDefaultRoute(s);if(!i){var u=e.drop(arguments,0);return this.trigger.apply(this,["noMatch"].concat(u)),this}if(this._isTriggeredFromRoute.apply(this,arguments))return this;var l=e.drop(arguments,1),f=this.translateRoute(i,l);return this.navigate(f,{trigger:!1})},getDefaultRoute:function(s){var i=this._routeTriggers[s];return e.isArray(i)?i[0]:i},_replaceParam:function(s,i){return s.replace(c,i)},translateRoute:function(s,i){return e.reduce(i,this._replaceParam,s)}});return v})})(T);var P=T.exports;const _=A(P),W=_.extend({initialize(){this.cid=y("bber")},route(){const t=_.prototype.route.apply(this,arguments);return h.history.handlers[0].cid=this.cid,t},destroy(){return h.history.handlers=C(h.history.handlers,{cid:this.cid}),this.stopListening(),this.trigger("destroy",this),this},_isTriggeredFromRoute(){const t=this._getCurrentRouteTrigger();return arguments.length!==t.length?!1:arguments.length===b(arguments,t).length}}),S=d.extend({routerAppName:"",constructor:function(){this.initRouter(),this.listenTo(this.router,"noMatch",this.onNoMatch),this.on("before:stop",this.stopCurrent),d.apply(this,arguments)},initRouter(){this._routes=w(this,"eventRoutes");const t=this.getRouteTriggers();this.router=new W({routeTriggers:t}),this.on("before:destroy",()=>this.router.destroy()),this.bindRouteEvents()},onNoMatch(){this.stop(),this._currentRoute=null},getRouteTriggers(){return R(this._routes,function(t,{route:r,root:e},n){if(e)return t[n]=r,t;const c=a.request("workspace","current").get("slug");return t[n]=r?`${c}/${r}`:c,t},{})},getEventActions(t,r){return R(t,function(e,{action:n},g){return e[g]=x(r,g,n),e},{})},bindRouteEvents(){const t=this.getEventActions(this._routes,this.routeAction);this.listenTo(this.router.getChannel(),t)},routeAction(t,r,...e){this.isRunning()||this.start(),this.triggerMethod("before:appRoute",t,...e),a.request("nav","select",this.routerAppName,t,e),a.request("sidebar","close"),this.setLatestList(t,e),this._currentRoute={event:t,eventArgs:e},F(r)||(r=this[r]),r.apply(this,e),this.triggerMethod("appRoute",t,...e)},setLatestList(t,r){if(this._routes[t].isList){a.request("history","set:latestList",t,r);return}this._routes[t].clearLatestList&&a.request("history","set:latestList",!1)},startCurrent(t,r){this.stopCurrent(),this._currentAppName=t,this._currentAppOptions=r,r=K({currentRoute:this._currentRoute},r);const e=this.startChildApp(t,r);return this._current=e,e},startRoute(t,r){return this.isCurrent(t,r)?this.getCurrent().startRoute(this.getCurrentRoute()):this.startCurrent(t,r)},getCurrent(){return this._current},isCurrent(t,r){return t===this._currentAppName&&L(r,this._currentAppOptions)},getCurrentRoute(){return this._currentRoute},stopCurrent(){this._current&&(this._current.stop(),this._current=null,this._currentAppName=null,this._currentAppOptions=null)},translateEvent(t){const r=this.router.getDefaultRoute(t);return this.router.translateRoute(r,Y(arguments))},replaceRoute(){const t=this.translateEvent.apply(this,arguments);this.replaceUrl(t)},navigateRoute(){const t=this.translateEvent.apply(this,arguments);h.history.navigate(t,{trigger:!1})},replaceUrl(t){h.history.navigate(t,{trigger:!1,replace:!0})}}),G={BACKSPACE_KEY:8,TAB_KEY:9,ENTER_KEY:13,SHIFT_KEY:16,ESCAPE_KEY:27,LEFT_KEY:37,UP_KEY:38,RIGHT_KEY:39,DOWN_KEY:40,AT_KEY_SHIFT:50},H=M.extend({ui:{iframe:"iframe"},onInitialize(){this.channel=a.channel(`form${this.view.model.id}`)},replies:{send(t,r={}){this.ui.iframe[0].contentWindow.postMessage({message:t,args:r},window.origin)},focus(){a.trigger("user-activity","iframe:focus",this.ui.iframe[0])}},onAttach(){this.channel.reply(this.replies,this),m(window).on("message",({originalEvent:t})=>{const{data:r,origin:e}=t;e!==window.origin||!r||!r.message||this.channel.request(r.message,r.args)})},onBeforeDetach(){m(window).off("message"),this.channel.stopReplying(q(this.replies).join(" "))}});export{H as I,S as R,G as k};