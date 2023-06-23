"use strict";(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[891],{8172:(e,t,s)=>{s.r(t),s.d(t,{startFormApp:()=>$}),s(3923);var r=s(7198),o=s(5291),n=s.n(o),i=s(8088),a=s.n(i),d=s(9230),u=s.n(d),c=s(8443),m=s(7201),l=s(2182),p=s(3513);const h=Formio.Displays.displays.webform.prototype.init;Formio.Displays.displays.webform.prototype.init=function(){if(this.options.data){const e=(0,r.extend)({},this.options.data);this._submission={data:e},this._data=e}h.call(this)};const f=Formio.Evaluator.evaluator;Formio.Evaluator.evaluator=function(e){try{for(var t=arguments.length,s=new Array(t>1?t-1:0),r=1;r<t;r++)s[r-1]=arguments[r];return f(e,...s)}catch(e){(0,p.iT)(e)}};const v=Formio.Evaluator.evaluate;function g(e,t,s,o){return Formio.createForm(document.createElement("div"),{},{evalContext:o}).then((o=>{const n=(0,r.reduce)(s,((t,s)=>FormioUtils.evaluate(s,o.evalContext({formSubmission:t,formData:e}))||t),t);return o.destroy(),n}))}Formio.Evaluator.evaluate=function(e){try{for(var t=arguments.length,s=new Array(t>1?t-1:0),r=1;r<t;r++)s[r-1]=arguments[r];return v(e,...s)}catch(e){(0,p.iT)(e)}};const y=Formio.Components.components.nested,b=Formio.Components.components.select;class F extends Formio.Components.components.survey{get emptyValue(){return[]}}Formio.Components.components.survey=F;class w extends b{static schema(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];return b.schema({label:"Directory",key:"directory",type:"directory",dataSrc:"custom",searchField:!0,customOptions:{noChoicesText:"Type a minimum of 3 characters for results"}},...t)}get defaultSchema(){return w.schema()}constructor(){super(...arguments),this.updateCustomItems=(0,r.debounce)(this.updateCustomItems,300)}updateItems(e,t){this.visible?this.updateCustomItems(t,e):this.itemsLoadedResolve()}getCustomItems(e){return!e||e.length<3?Promise.resolve([]):this.evaluate(this.component.data.custom,{values:[],searchInput:e},"values")}updateCustomItems(e,t){e||this.active?(this.loading=!0,this.getCustomItems(t).then((e=>{this.loading=!1,this.setItems(e||[])})).catch((e=>{this.handleLoadingError(e)}))):this.itemsLoadedResolve()}}class C extends Formio.Components.components.button{get shouldDisabled(){return!this.component.alwaysEnable&&super.shouldDisabled}set disabled(e){this._disabled=e}get disabled(){return!this.component.alwaysEnable&&(this._disabled||this.parentDisabled)}}let q,x;function I(){window.scrollTo({top:0})}function S(e,t){return q.updateField({fieldName:e,value:t})}function _(e){return q.getField({fieldName:e})}function E(e,t){return q.getDirectory({directoryName:e,query:t})}function R(e){return function(e,t){return Formio.createForm(document.createElement("div"),{}).then((s=>{const o=(0,r.reduce)(e,((e,t)=>(0,r.extend)({},e,FormioUtils.evaluate(t,s.evalContext(e)))),t);return s.destroy(),o}))}(e,{getDirectory:E,getField:_,updateField:S,Handlebars:u(),TEMPLATES:{},parsePhoneNumber:c.S})}Formio.use({components:{snippet:class extends y{constructor(){super(...arguments),this.noField=!0}static schema(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];return y.schema({label:"Snippet",key:"snippet",type:"snippet",components:[],input:!1,persistent:!1,snippet:null},...t)}},directory:w,button:C}});const P=(0,r.debounce)((function(){q.request("update:storedSubmission",x)}),2e3),D=function(e,t){const s=function(e,t,s,o){return(0,r.reduce)(t,((t,s)=>{const r=e.evalContext({formSubmission:t,prevSubmission:o});return r.hasChanged=FormioUtils.evaluate("return function hasChanged(key) { return !_.isEqual(_.get(formSubmission, key), _.get(prevSubmission, key)); }",r),FormioUtils.evaluate(s,r)||t}),s)}(e,t,structuredClone(e.submission.data),x);e.data=s,e.setSubmission({data:s},{fromChangeReducers:!0,fromSubmission:!1}),x=structuredClone(e.submission.data),P()},k=(0,r.debounce)(D,100);async function V(e){let{definition:t,isReadOnly:s,storedSubmission:o,formData:n,formSubmission:i,reducers:a,changeReducers:d,contextScripts:u,beforeSubmit:c}=e;const m=await R(u),l=o||await g(n,i,a,m);x=structuredClone(l);const p=await Formio.createForm(document.getElementById("root"),t,{readOnly:s,evalContext:m,data:l,onChange(e,t){let{fromChangeReducers:s}=e,{instance:r}=t;s&&p.initialized||r&&r.inEditGrid||k(p,d)}});p.nosubmit=!0,q.off("form:submit"),q.off("form:errors"),q.on({"form:errors"(e){p.showErrors((0,r.map)(e,(e=>({message:e}))),!0)},"form:submit"(){p.submit()}}),p.on("prevPage",I),p.on("nextPage",I),p.on("error",(()=>{q.request("ready:form"),p._isReady=!0})),p.on("submit",(e=>{if(!p._isReady)return;if(p._isReady=!1,k.cancel(),D(p,d),P.cancel(),p.setPristine(!1),!p.checkValidity(e.data,!0,e.data))return void p.emit("error");const t=FormioUtils.evaluate(c,p.evalContext({formSubmission:e.data}))||{};q.request("submit:form",{response:(0,r.extend)({},e,{data:t})})})),q.request("ready:form"),p._isReady=!0}async function T(e){let{definition:t,contextScripts:s}=e;const o=await R(s);(0,r.extend)(o,{isPreview:!0}),Formio.createForm(document.getElementById("root"),t,{evalContext:o})}async function U(e){let{definition:t,formSubmission:s,contextScripts:o}=e;const n=await R(o);(0,r.extend)(n,{isResponse:!0}),Formio.createForm(document.getElementById("root"),t,{readOnly:!0,renderMode:"form",evalContext:n,data:s}).then((e=>{e.on("prevPage",I),e.on("nextPage",I)}))}async function A(e){let{definition:t,formData:s,formSubmission:r,reducers:o,contextScripts:n}=e;const i=await R(n),a=await g(s,r,o,i);(await Formio.createForm(document.getElementById("root"),t,{evalContext:i,data:a})).nosubmit=!0}const L=a().Router.extend({initialize(){window.addEventListener("message",(e=>{let{data:t,origin:s}=e;s===window.origin&&t&&t.message&&this.trigger(t.message,t.args)}),!1),n()(window).on("focus",(()=>{this.request("focus")})),this.request("version",l.dd.frontend),this.requestResolves={},this.on({"fetch:directory":this.onFetchDirectory,"fetch:field":this.onFetchField,"update:field":this.onUpdateField})},request(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return new Promise((s=>{this.once(e,s),parent.postMessage({message:e,args:t},window.origin)}))},requestValue(e){let{args:t,message:s,requestId:o}=e;return new Promise(((e,n)=>{this.requestResolves[o]={resolve:e,reject:n},parent.postMessage({message:s,args:(0,r.extend)({requestId:o},t)},window.origin)}))},resolveValue(e){let{value:t,error:s,requestId:r}=e;if(!this.requestResolves[r])return;const{resolve:o,reject:n}=this.requestResolves[r];delete this.requestResolves[r],s?n(s):o(t)},getDirectory(e){const t=(0,r.uniqueId)("directory");return this.requestValue({args:e,message:"fetch:directory",requestId:t})},onFetchDirectory(e){this.resolveValue(e)},getField(e){const t=(0,r.uniqueId)("field");return this.requestValue({args:e,message:"fetch:field",requestId:t})},onFetchField(e){this.resolveValue(e)},updateField(e){const t=(0,r.uniqueId)("field");return this.requestValue({args:e,message:"update:field",requestId:t})},onUpdateField(e){this.resolveValue(e)},routes:{"formapp/":"renderForm","formapp/preview":"renderPreview","formapp/:id":"renderResponse","formapp/pdf/:formId/:patientId(/:responseId)":"renderPdf"},renderForm(){this.request("fetch:form:data").then(V)},renderPreview(){this.request("fetch:form").then(T)},renderResponse(e){this.request("fetch:form:response",{responseId:e}).then(U)},renderPdf(e,t,s){this.once("form:pdf",A),n()("body").append(`<iframe class="iframe-hidden" src="/formservice/${e}/${t}${s?`/${s}`:""}"></iframe>`)}});function $(){n()("#root").append(`\n    <div class="loader__bar js-progress-bar">\n      <div class="loader__bar-progress--loop"></div>\n    </div>\n    <div class="loader__text js-loading">${m.ZP.regions.preload.loading}</div>\n  `),q=new L,a().history.start({pushState:!0})}}}]);