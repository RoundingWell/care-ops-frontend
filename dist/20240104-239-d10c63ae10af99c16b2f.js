"use strict";(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[239],{7239:(t,e,n)=>{n.d(e,{Z:()=>i});var r=n(7198);const i=n(2894).gV.extend({triggerStart(t){this._isLoading=!0,this._fetchId=(0,r.uniqueId)("fetch");const e=(0,r.bind)(this.triggerMethod,this,"sync:data",this._fetchId,t),n=(0,r.bind)(this.triggerSyncFail,this,this._fetchId,t),i=this.beforeStart(t);i?Promise.all((0,r.isArray)(i)?i:[i]).then(e).catch(n):e()},beforeStart:r.noop,onSyncData(t,e,n=[]){this._isLoading=!1,this.isRunning()&&this._fetchId===t&&this.finallyStart.call(this,e,...n)},triggerSyncFail(t,e,...n){this._isLoading=!1,this.isRunning()&&this._fetchId===t&&this.triggerMethod("fail",e,...n)},onFail(t,e){!async function(t){if((0,r.isError)(t))throw t;if(t.response){const e=t.response.status,{errors:n}=t.responseData;throw new Error(`Error Status: ${e} - ${JSON.stringify(n)}`)}throw new Error(JSON.stringify(t))}(e)},isRunning(){return this._isRunning&&!this.isLoading()},_isLoading:!1,isLoading(){return this._isLoading}})},4257:(t,e,n)=>{n.d(e,{Z:()=>a});var r=n(7198),i=n(8088),s=n.n(i),o=n(1267);const a=s().Collection.extend((0,r.extend)({fetch(t={}){return s().Collection.prototype.fetch.call(this,t).then((t=>!t||t.ok?this:t))},parse(t){return t&&t.data?(this.cacheIncluded(t.included),this.meta=t.meta,(0,r.map)(t.data,this.parseModel,this)):t},getMeta(t){return(0,r.get)(this.meta,t)},destroy(t){const e=(0,r.clone)(this.models),n=(0,r.invoke)(e,"destroy",t);return Promise.all(n)}},o.default))},4822:(t,e,n)=>{n.d(e,{Z:()=>d});var r=n(7198),i=n(8088),s=n.n(i),o=n(6718),a=n(1267),c=n(2814);const d=o.MnObject.extend({channelName:"entities",Entity:s(),constructor:function(t){this.mergeOptions(t,["Entity"]),o.MnObject.apply(this,arguments)},getCollection(t,e={}){return new this.Entity.Collection(t,e)},getModel(t,e){return t&&!(0,r.isObject)(t)&&(t={id:t}),new this.Entity.Model(t,e)},fetchCollection(t){return(new this.Entity.Collection).fetch(t)},fetchModel(t,e){return new this.Entity.Model({id:t}).fetch(e)},async fetchBy(t,e){const n=await(0,c.ZP)(t,e);if(!n||204===n.status)return Promise.resolve();const r=await n.json();if(!n.ok)return Promise.reject({response:n,responseData:r});(0,a.H)(r.included);const i=new this.Entity.Model({id:r.data.id});return i.set(i.parseModel(r.data)),Promise.resolve(i)}})},2814:(t,e,n)=>{n.d(e,{S3:()=>p,Yu:()=>h,ZP:()=>g,sx:()=>f});var r=n(7198),i=n(7739),s=n.n(i),o=n(5245);const a=[];function c(t){delete a[t]}function d(t){return encodeURIComponent(t??"")}function l(t){if((0,r.isArray)(t)){const e=encodeURIComponent((0,r.first)(t));return(0,r.reduce)((0,r.rest)(t),((t,e)=>`${t}[${encodeURIComponent(e)}]`),e)}return encodeURIComponent(t)}function u(t,e){return(0,r.isArray)(t)?`${l(e)}=${t.map(d).join()}`:(0,r.isObject)(t)?(0,r.flatten)((0,r.map)(t,((t,n)=>u(t,(0,r.flatten)([e,n]))))).join("&"):`${l(e)}=${d(t)}`}function h(t,e){return t=t.clone(),"json"===e&&204!==t.status?t.json():t.text()}async function f(t){if(!t)return;const e=await h(t,"json");return t.ok?e:Promise.reject({response:t,responseData:e})}function p(t){if("AbortError"!==t.name)throw t}const g=async(t,e)=>(function(t,e={}){const n=function(t){return(0,r.get)(a[t],"fetcher")}(t);return!!n&&(!1!==e.abort?(function(t){const e=(0,r.get)(a[t],"controller");e&&(e.abort(),c(t))}(t),!1):n)}(t,e)||async function(t,e={}){const n=await s().request("auth","getToken"),i=new AbortController,o=t;e=(0,r.extend)({signal:i.signal,dataType:"json",headers:(0,r.defaults)(e.headers,{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json"})},e),n&&(e.headers.Authorization=`Bearer ${n}`),e.method&&"GET"!==e.method?e.data&&(e.body=e.data):t=function(t,e){if(!(0,r.isObject)(e))return t;const n=(i=e,(0,r.map)(i,u).join("&"));var i;return n?`${t}?${n}`:t}(t,e.data);const c=s().request("bootstrap","currentWorkspace");return c&&(e.headers.Workspace=c.id),function(t,e,n){return a[t]={fetcher:e,controller:n},e}(o,fetch(t,e),i)}(t,e)).then((async n=>{if(c(t),!n.ok){const i=n.clone();if(401===n.status){const t=await i.json();"5000"!==(0,r.get)(t,["errors",0,"code"])&&s().request("auth","logout")}n.status>=400&&(0,o.fe)(t,e,i),n.status>=500&&s().trigger("event-router","error")}return n})).catch(p)},2283:(t,e,n)=>{var r=n(7198),i=n(944),s=n.n(i);function o(t,e,{hash:n={}}){const r=`${t}-fa-${e}`,i=`<svg class="icon svg-inline--fa fa-${e} ${n.classes||""}"><use xlink:href="#${r}"></use></svg>`;return new(s().SafeString)(i)}n(2256),s().registerHelper({far:(0,r.partial)(o,"far"),fas:(0,r.partial)(o,"fas"),fal:(0,r.partial)(o,"fal"),fat:(0,r.partial)(o,"fat"),fa:o})},1267:(t,e,n)=>{n.d(e,{H:()=>c,default:()=>d});var r=n(7198),i=n(9203),s=n.n(i),o=n(7027),a=n(9386);function c(t){(0,r.each)(t,(t=>{const e=new(o.Z.get(t.type))({id:t.id});e.set(e.parseModel(t))}))}const d={cacheIncluded:c,parseId:(t={},e)=>(t.id=e,t),parseRelationship:t=>t?(0,r.isArray)(t)?(0,r.map)(t,(t=>{const e={id:t.id};return t.meta&&(0,r.each)(t.meta,((t,n)=>{e[`_${(0,a.Z)(n)}`]=t})),e})):t.id:t,parseRelationships(t,e){return(0,r.each)(e,((e,n)=>{t[`_${(0,a.Z)(n)}`]=this.parseRelationship(e.data,n)})),t},parseModel(t){const e=this.parseId(t.attributes,t.id);return e.__cached_ts=s().utc().format(),(0,r.each)(t.meta,((t,n)=>{e[`_${(0,a.Z)(n)}`]=t})),this.parseRelationships(e,t.relationships)},toRelation(t,e){if(!(0,r.isUndefined)(t))return(0,r.isNull)(t)?{data:null}:t.models?{data:t.map((({id:t,type:e})=>({id:t,type:e})))}:(0,r.isArray)(t)?{data:(0,r.map)(t,(t=>({id:t.id?t.id:t,type:e})))}:(0,r.isObject)(t)?{data:(0,r.pick)(t,"id","type")}:{data:{id:t,type:e}}}}},3018:(t,e,n)=>{n.d(e,{Z:()=>a});var r=n(7198),i=n(8088),s=n.n(i),o=n(1267);const a=s().Model.extend((0,r.extend)({destroy(t){return this.isNew()?(s().Model.prototype.destroy.call(this,t),Promise.resolve(t)):s().Model.prototype.destroy.call(this,t)},fetch(t){return s().Model.prototype.fetch.call(this,(0,r.extend)({abort:!0},t)).then((t=>!t||t.ok?this:t))},parse(t){return t&&t.data?(this.cacheIncluded(t.included),this.parseModel(t.data)):t},parseErrors({errors:t}){if(t)return(0,r.reduce)(t,((t,{source:e,detail:n})=>(t[String(e.pointer).slice(17)]=n,t)),{})},removeFEOnly:t=>(0,r.pick)(t,(function(t,e){return"id"!==e&&/^[^_]/.test(e)})),toJSONApi(t=this.attributes){return{id:this.id,type:this.type,attributes:this.removeFEOnly(t)}},save(t,e={},n){return null==t&&(n=e),e=(0,r.extend)(this.toJSONApi(e.attributes||t),e),(0,r.isEmpty)(e.attributes)&&delete e.attributes,n=(0,r.extend)({patch:!this.isNew(),data:JSON.stringify({data:e})},n),s().Model.prototype.save.call(this,t,n)},isCached(){return this.has("__cached_ts")}},o.default))},527:(t,e,n)=>{var r=n(5291),i=n.n(r),s=n(7198),o=n(8088),a=n.n(o),c=n(9203),d=n.n(c),l=n(7739),u=n.n(l),h=n(6718),f=n(2894);const p={getEl:t=>[t],findEl:(t,e)=>t.querySelectorAll(e),detachEl(t){t.parentNode&&t.parentNode.removeChild(t)},hasContents:t=>t.hasChildNodes(),setContents(t,e){t.innerHTML=e},appendContents(t,e){t.appendChild(e)},detachContents(t){t.textContent=""}};var g=n(2814);a().ajax=t=>(t=(0,s.extend)({method:t.type},t),(0,g.ZP)(t.url,t).then((async e=>{if(!e)return;const n=await(0,g.Yu)(e,t.dataType);return e.ok?(t.success&&t.success(n),e):(t.error&&t.error(n),Promise.reject({response:e,responseData:n}))})).catch(g.S3));var m=n(976),y=n.n(m),w=n(3230),S=n.n(w),b=n(6134),_=n.n(b),x=n(3271),$=n.n(x),C=n(536),v=n.n(C);d().extend(S()),d().extend(y()),d().extend(_()),d().extend($()),d().extend(v());const R={SHORT:"MMM D",LONG:"ll",SLASHES:"L",TIME:"LT",AT_TIME:"lll",DATE:t=>t.isSame(d()(),"year")?t.format(R.SHORT):t.format(R.LONG),TIME_OR_DAY:t=>t.isSame(d()(),"day")?t.format(R.TIME):R.DATE(t),AGO_OR_TODAY:t=>t.isSame(d()(),"day")?t.fromNow():R.DATE(t)};n(2283);var E=n(944),M=n.n(E),A=n(247);M().registerHelper({matchText:(t,e,{hash:n={}})=>e?(n.noEscape||(t=M().escapeExpression(t)),new(M().SafeString)(((t,e,n,r)=>{if(!t)return;n=n||"strong",r=r||n;const i=(0,A.Z)(e);return t.replace(i,`<${n}>$&</${r}>`)})(t,e))):t}),M().registerHelper({formatDateTime:(t,e,{hash:n={}})=>t?(t=function(t,e){const n=R[e];return n?(0,s.isFunction)(n)?n(t):t.format(n):t.format(e)}(t=n.utc?d().utc(t,n.inputFormat).local():d()(t,n.inputFormat),e),!1===n.nowrap?t:new(M().SafeString)(`<span class="u-text--nowrap">${t}</span>`)):new(M().SafeString)(n.defaultHtml||"")});const Z={8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",59:";",61:"=",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",173:"-",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},k={"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":"'",",":"<",".":">","/":"?","\\":"|"},O=["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"],j=/textarea|input|select/i;function T(t){const e=function({data:t}){return(0,s.isString)(t)?t.toLowerCase().split(" "):t&&(0,s.isString)(t.keys)?t.keys.toLowerCase().split(" "):void 0}(t);if(!e)return;const n=t.handler;t.handler=function(t){if(this!==t.target&&i().hotkeys.isTargetInput(t.target))return;const r=function(t,e,n){const r={},i=function(t,e){let n="";return(0,s.each)(["alt","ctrl","shift"],(function(r){t[`${r}Key`]&&e!==r&&(n+=`${r}+`)})),t.metaKey&&!t.ctrlKey&&"meta"!==e&&(n+="meta+"),t.metaKey&&"meta"!==e&&n.indexOf("alt+ctrl+shift+")>-1&&(n=n.replace("alt+ctrl+shift+","hyper+")),n}(t,e);return e?r[i+e]=!0:(r[i+n]=!0,r[i+k[n]]=!0,"shift+"===i&&(r[k[n]]=!0)),r}(t,"keypress"!==t.type&&Z[t.which],String.fromCharCode(t.which).toLowerCase());for(let t=0,i=e.length;t<i;t++)if(r[e[t]])return n.apply(this,arguments)}}i().hotkeys={version:"1.0.0",isTargetInput:t=>j.test(t.nodeName)||i()(t).attr("contenteditable")||(0,s.contains)(O,t.type)},(0,s.each)(["keydown","keyup","keypress"],(t=>{i().event.special[t]={add:T}}));var D=n(1766);a().Model.prototype.sync=function(t,e,n){if(n=(0,s.clone)(n),"create"===t){let t=n.data||n.attrs||e.toJSON(n);(0,s.isString)(t)&&(t=JSON.parse(t)),t.data.id=(0,D.Z)(),n.data=JSON.stringify(t)}return a().sync(t,e,n)};const{Region:I,View:L,CollectionView:N,setDomApi:P}=h;P(p),window._=s.default,window.$=i(),window.Backbone=a(),window.Radio=u(),window.Marionette=h,window.dayjs=d();const H=I.prototype.show;I.prototype.show=function(t,e){return t instanceof f.wA?(t.showIn(this,null,e),this):H.call(this,t,e)};const B=function(t){if(!this.isAttached())return!1;const e=t||this.$el,{left:n,top:r}=e.offset();return{left:n,top:r,outerHeight:e.outerHeight(),outerWidth:e.outerWidth()}};(0,s.extend)(L.prototype,{getBounds:B}),(0,s.extend)(N.prototype,{getBounds:B}),a().Model.prototype.dayjs=function(t){const e=this.get(t);return e||0===e?d()(e):e},RegExp.escape=function(t){return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}},8380:(t,e,n)=>{var r=n(4822),i=n(2814),s=n(7198),o=n(7739),a=n.n(o),c=n(7027),d=n(4257),l=n(3018),u=n(1962);const h="forms",f=l.Z.extend({type:h,urlRoot:"/api/forms",isReadOnly(){return(0,s.get)(this.get("options"),"read_only")},isSubmitHidden(){return(0,s.get)(this.get("options"),"submit_hidden")},getContext(){return{contextScripts:this.getContextScripts(),loaderReducers:this.getLoaderReducers(),changeReducers:this.getChangeReducers(),beforeSubmit:this.getBeforeSubmit(),submitReducers:this.getSubmitReducers()}},getContextScripts(){return(0,s.get)(this.get("options"),"context",[])},getLoaderReducers(){return(0,s.get)(this.get("options"),"reducers",["\n  const subm = _.extend({ patient: {} }, formSubmission,  formData);\n\n  subm.patient.fields = _.extend({}, _.get(formSubmission, 'patient.fields'), _.get(formData, 'patient.fields'));\n\n  return subm;\n"])},getChangeReducers(){return(0,s.get)(this.get("options"),"changeReducers",[])},getBeforeSubmit(){return(0,s.get)(this.get("options"),"beforeSubmit","return formSubmission;")},getSubmitReducers(){const t=(0,s.get)(this.get("options"),"submitReducers");return(0,s.size)(t)?t:["\n  formData.fields = formSubmission.fields || _.get(formSubmission, 'patient.fields');\n\n  return formData;\n"]},getWidgets(){const t=(0,s.get)(this.get("options"),"widgets");return a().request("entities","widgets:collection",(0,u.Z)((0,s.get)(t,"widgets"),"id"))},getWidgetFields(){const t=(0,s.get)(this.get("options"),"widgets");return(0,s.get)(t,"fields")},getPrefillFormId(){return(0,s.get)(this.get("options"),"prefill_form_id")||this.id},getPrefillActionTag(){return(0,s.get)(this.get("options"),"prefill_action_tag")}}),p=(0,c.Z)(f,h),g=d.Z.extend({url:"/api/forms",model:p,comparator:"name"});new(r.Z.extend({Entity:{_Model:f,Model:p,Collection:g},radioRequests:{"forms:model":"getModel","forms:collection":"getCollection","fetch:forms:model":"fetchModel","fetch:forms:collection":"fetchCollection","fetch:forms:definition":"fetchDefinition","fetch:forms:data":"fetchFormData","fetch:forms:byAction":"fetchByAction","fetch:forms:definition:byAction":"fetchDefinitionByAction"},fetchDefinition:t=>(0,i.ZP)(`/api/forms/${t}/definition`).then(i.sx),fetchFormData(t,e,n){const r=new l.Z;if(t)return r.fetch({url:`/api/actions/${t}/form/fields`});const i={filter:{patient:e}};return r.fetch({url:`/api/forms/${n}/fields`,data:i})},fetchByAction(t){return this.fetchBy(`/api/actions/${t}/form`)},fetchDefinitionByAction:t=>(0,i.ZP)(`/api/actions/${t}/form/definition`).then(i.sx)}))},247:(t,e,n)=>{n.d(e,{Z:()=>o});var r=n(7198),i=n(2889),s=n(1441);const o=(0,r.memoize)((function(t){const e=(0,r.map)((0,i.Z)((n=t,n=(n=(n=String(n)).replace(/\-/g," ")).replace(/[^\w\s]/g,""),(0,s.Z)(n).toLowerCase())),RegExp.escape);var n;return new RegExp(`\\b${e.join("|")}`,"gi")}))},1962:(t,e,n)=>{n.d(e,{Z:()=>i});var r=n(7198);const i=(t,e)=>(0,r.map)(t,(function(t){return(0,r.object)([e],[t])}))},1441:(t,e,n)=>{n.d(e,{Z:()=>r});const r=(t="",e)=>(t=String(t),e?t.replace(new RegExp(`^${e}+|${e}+$`,"g"),""):t.trim())},9386:(t,e,n)=>{n.d(e,{Z:()=>i});var r=n(1441);const i=t=>t?(0,r.Z)(t).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase():t},2889:(t,e,n)=>{n.d(e,{Z:()=>s});var r=n(7198),i=n(1441);const s=(t,e)=>(0,r.isEmpty)(t)?[]:(0,i.Z)(t,e).split(e||/\s+/)}}]);