import{n as e,e as i}from"./20241004-index-Ds-t9eX-.js";import{j as o}from"./20241004-runtime-BELkZrA-.js";import{A as n}from"./20241004-app-CYElHFI9.js";const c=n.extend({constructor:function(){this._current=null,this.initRouter(),this.on("before:stop",this.stopCurrent),n.apply(this,arguments)},initRouter(){const t=e(this,"eventRoutes",{});this._eventRoutes=o(this,t)},startRoute({event:t,eventArgs:r}){const s=this._eventRoutes[t];s&&s.apply(this,r)},mixinOptions(t){const r=e(this,"currentAppOptions");return i({},r,t)},startCurrent(t,r){this.stopCurrent();const s=this.startChildApp(t,this.mixinOptions(r));return this._current=s,s},getCurrent(){return this._current},stopCurrent(){this._current&&(this._current.stop(),this._current=null)}});export{c as S};
