/*! For license information please see 20240202-outreach-01fea2eb9b448b52b464.js.LICENSE.txt */
(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[585],{2909:(t,e,n)=>{"use strict";n.d(e,{Z:()=>d});var i=n(7198),o=n(8088),s=n.n(o),r=n(7739),a=n.n(r),l=n(4737),u=n.n(l),h=n(7239);const c=u().extend({initialize(){this.cid=(0,i.uniqueId)("bber")},route(){const t=u().prototype.route.apply(this,arguments);return s().history.handlers[0].cid=this.cid,t},destroy(){return s().history.handlers=(0,i.reject)(s().history.handlers,{cid:this.cid}),this.stopListening(),this.trigger("destroy",this),this},_isTriggeredFromRoute(){const t=this._getCurrentRouteTrigger();return arguments.length===t.length&&arguments.length===(0,i.union)(arguments,t).length}}),d=h.Z.extend({routerAppName:"",constructor:function(){this.initRouter(),this.listenTo(this.router,"noMatch",this.onNoMatch),this.on("before:stop",this.stopCurrent),h.Z.apply(this,arguments)},initRouter(){this._routes=(0,i.result)(this,"eventRoutes");const t=this.getRouteTriggers();this.router=new c({routeTriggers:t}),this.on("before:destroy",(()=>this.router.destroy())),this.bindRouteEvents()},onNoMatch(){this.stop(),this._currentRoute=null},getRouteTriggers(){const t=a().request("bootstrap","currentWorkspace");return(0,i.reduce)(this._routes,(function(e,{route:n,root:i},o){if(i)return e[o]=n,e;const s=t.get("slug");return e[o]=n?`${s}/${n}`:s,e}),{})},getEventActions:(t,e)=>(0,i.reduce)(t,(function(t,{action:n},o){return t[o]=(0,i.partial)(e,o,n),t}),{}),bindRouteEvents(){const t=this.getEventActions(this._routes,this.routeAction);this.listenTo(this.router.getChannel(),t)},routeAction(t,e,...n){this.isRunning()||this.start(),this.triggerMethod("before:appRoute",t,...n),a().request("nav","select",this.routerAppName,t,n),a().request("sidebar","close"),this.setLatestList(t,n),this._currentRoute={event:t,eventArgs:n},(0,i.isFunction)(e)||(e=this[e]),e.apply(this,n),this.triggerMethod("appRoute",t,...n)},setLatestList(t,e){this._routes[t].isList?a().request("history","set:latestList",t,e):this._routes[t].clearLatestList&&a().request("history","set:latestList",!1)},startCurrent(t,e){this.stopCurrent(),this._currentAppName=t,this._currentAppOptions=e,e=(0,i.extend)({currentRoute:this._currentRoute},e);const n=this.startChildApp(t,e);return this._current=n,n},startRoute(t,e){return this.isCurrent(t,e)?this.getCurrent().startRoute(this.getCurrentRoute()):this.startCurrent(t,e)},getCurrent(){return this._current},isCurrent(t,e){return t===this._currentAppName&&(0,i.isEqual)(e,this._currentAppOptions)},getCurrentRoute(){return this._currentRoute},stopCurrent(){this._current&&(this._current.stop(),this._current=null,this._currentAppName=null,this._currentAppOptions=null)},translateEvent(t){const e=this.router.getDefaultRoute(t);return this.router.translateRoute(e,(0,i.rest)(arguments))},replaceRoute(){const t=this.translateEvent.apply(this,arguments);this.replaceUrl(t)},navigateRoute(){const t=this.translateEvent.apply(this,arguments);s().history.navigate(t,{trigger:!1})},replaceUrl(t){s().history.navigate(t,{trigger:!1,replace:!0})}})},7885:(t,e,n)=>{"use strict";n.d(e,{Z:()=>l});var i=n(5291),o=n.n(i),s=n(7198),r=n(7739),a=n.n(r);const l=n(6718).Behavior.extend({ui:{iframe:"iframe"},onInitialize(){this.channel=a().channel(`form${this.view.model.id}`)},replies:{send(t,e={}){this.ui.iframe[0].contentWindow.postMessage({message:t,args:e},window.origin)},focus(){a().trigger("user-activity","iframe:focus",this.ui.iframe[0])}},onAttach(){this.channel.reply(this.replies,this),o()(window).on("message",(({originalEvent:t})=>{const{data:e,origin:n}=t;n===window.origin&&e&&e.message&&this.channel.request(e.message,e.args)}))},onBeforeDetach(){o()(window).off("message"),this.channel.stopReplying((0,s.keys)(this.replies).join(" "))}})},9316:(t,e,n)=>{"use strict";n.r(e),n.d(e,{startOutreachApp:()=>L});var i=n(5291),o=n.n(i),s=(n(527),n(8088)),r=n.n(s),a=n(7739),l=n.n(a),u=n(6718),h=(n(2283),n(8380),n(2909)),c=n(7239),d=n(2814),p=n(1766);function m(t,e){return{data:{type:e,id:t}}}let f;l().reply("auth",{setToken(t){f=t},getToken:()=>f});var g=n(944),w=n.n(g),_=n(6658);const{BACKSPACE_KEY:v}=_.default,b=u.View.extend({ui:{submit:".js-submit"},triggers:{"click @ui.submit":"click:submit"},template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s,r=null!=e?e:t.nullContext||{},a=t.hooks.helperMissing,l=t.escapeExpression,u=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--blue">'+l((u(n,"fat")||e&&u(e,"fat")||a).call(r,"user-lock",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+'</div>\n    <h2 class="verify__heading-text">Request a verification code to view this health resource.</h2>\n    <p class="verify__info-text">We’ll send a text message with a verification code to the phone number XXX-XXX-'+l("function"==typeof(s=null!=(s=u(n,"phoneEnd")||(null!=e?u(e,"phoneEnd"):e))?s:a)?s.call(r,{name:"phoneEnd",hash:{},data:o,loc:{start:{line:4,column:112},end:{line:4,column:126}}}):s)+'.</p>\n    <button class="verify__submit button--green w-100 js-submit">Send Verification Code</button>\n  '},useData:!0}),templateContext(){return{phoneEnd:this.getOption("patientPhoneEnd")}},onClickSubmit(){this.ui.submit.prop("disabled",!0)}}),y=u.View.extend({ui:{submit:".js-submit",resend:".js-resend",input:".js-input"},triggers:{"click @ui.submit":"click:submit","click @ui.resend":"click:resend"},events:{"input @ui.input":"watchInput","keydown @ui.input":"watchKeydown"},template:w().template({1:function(t,e,n,i,o){return" has-error"},3:function(t,e,n,i,o){return'      <p class="verify__error-text">Incorrect verification code. Please try again.</p>\n'},compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s,r,a=null!=e?e:t.nullContext||{},l=t.hooks.helperMissing,u=t.escapeExpression,h=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--blue">'+u((h(n,"fat")||e&&h(e,"fat")||l).call(a,"user-lock",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+'</div>\n    <h2 class="verify__heading-text">Enter your verification code.</h2>\n    <p class="verify__info-text">We sent a text message with a verification code to the phone number XXX-XXX-'+u("function"==typeof(r=null!=(r=h(n,"phoneEnd")||(null!=e?h(e,"phoneEnd"):e))?r:l)?r.call(a,{name:"phoneEnd",hash:{},data:o,loc:{start:{line:4,column:109},end:{line:4,column:123}}}):r)+'.</p>\n    <div class="verify__code-fields">\n      <input class="input-primary verify__code-input js-input'+(null!=(s=h(n,"if").call(a,null!=e?h(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:6,column:61},end:{line:6,column:105}}}))?s:"")+'" inputmode="numeric" />\n      <input class="input-primary verify__code-input js-input'+(null!=(s=h(n,"if").call(a,null!=e?h(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:7,column:61},end:{line:7,column:105}}}))?s:"")+'" inputmode="numeric" />\n      <input class="input-primary verify__code-input js-input'+(null!=(s=h(n,"if").call(a,null!=e?h(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:8,column:61},end:{line:8,column:105}}}))?s:"")+'" inputmode="numeric" />\n      <input class="input-primary verify__code-input js-input'+(null!=(s=h(n,"if").call(a,null!=e?h(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:9,column:61},end:{line:9,column:105}}}))?s:"")+'" inputmode="numeric" />\n    </div>\n'+(null!=(s=h(n,"if").call(a,null!=e?h(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(3,o,0),inverse:t.noop,data:o,loc:{start:{line:11,column:4},end:{line:13,column:11}}}))?s:"")+'    <button class="verify__submit button--green w-100 js-submit" disabled>Confirm Code</button>\n    <div class="verify__heading-text u-text-link js-resend">Send a new code</div>\n  '},useData:!0}),templateContext(){return{phoneEnd:this.getOption("patientPhoneEnd"),hasInvalidCodeError:this.getOption("hasInvalidCodeError")}},watchInput(t){const e=String(t.target.value).replace(/\s/g,""),n=e.charAt(0),i=e.substring(1);t.target.value=n;const o=this.ui.input,s=o.index(t.target),r=s===o.length-1,a=void 0!==n&&e.length,l=o.map(((t,e)=>e.value)).get().join("");if(this.disableSubmitButton(l.length!==o.length),a&&!r){const t=o.eq(s+1);t.focus(),t.val(i),t.trigger("input")}},watchKeydown(t){const e=this.ui.input,n=e.index(t.target);t.keyCode===v&&""===t.target.value&&e.eq(Math.max(0,n-1)).focus()},disableSubmitButton(t){this.ui.submit.prop("disabled",t)},onClickSubmit(){const t=this.ui.input.map(((t,e)=>e.value)).get().join("");this.triggerMethod("submit:code",t),this.disableSubmitButton(!0)}}),x=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--success">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"thumbs-up",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:39},end:{line:2,column:58}}}))+"</div>\n    <div>This form has already been submitted.</div>\n  "},useData:!0})}),C=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--error">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+"</div>\n    <div>This form is no longer shared. Nothing else to do here.</div>\n  "},useData:!0})}),E=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--error">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+'</div>\n    <div class="dialog__error-header">Uh-oh, there was an error. Try reloading the page.</div>\n  '},useData:!0})});var k=n(2182);const R=u.View.extend({className:"dialog__wrapper",template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s,r=null!=e?e:t.nullContext||{},a=t.hooks.helperMissing,l=t.escapeExpression,u=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <h1 class="site-title">'+l("function"==typeof(s=null!=(s=u(n,"name")||(null!=e?u(e,"name"):e))?s:a)?s.call(r,{name:"name",hash:{},data:o,loc:{start:{line:2,column:27},end:{line:2,column:37}}}):s)+'</h1>\n    <div class="dialog" data-content-region>\n      <div class="dialog__icon dialog__icon--success">'+l((u(n,"fat")||e&&u(e,"fat")||a).call(r,"circle-check",{name:"fat",hash:{},data:o,loc:{start:{line:4,column:54},end:{line:4,column:76}}}))+"</div>\n      <div>You’ve submitted the form. Nice job.</div>\n    </div>\n  "},useData:!0}),templateContext:()=>({name:k.eG.name}),regions:{content:"[data-content-region]"}}),S=c.Z.extend({onBeforeStart({actionId:t}){this.actionId=t},beforeStart(){return function({actionId:t}){return(0,d.ZP)(`/api/outreach?filter[action]=${t}`,{method:"GET"}).then(d.sx).then((({data:t})=>({outreachId:t.id,patientPhoneEnd:t.attributes.phone_end})))}({actionId:this.actionId})},onFail(t,{response:e}){const n=new R;this.showView(n),409!==e.status?this.showNotAvailableView():this.showAlreadySubmittedView()},onStart(t,{outreachId:e,patientPhoneEnd:n}){this.outreachId=e,this.patientPhoneEnd=n;const i=new R;this.showView(i),this.showRequestCodeView()},showRequestCodeView(){const t=new b({model:this.getState(),patientPhoneEnd:this.patientPhoneEnd});this.listenTo(t,"click:submit",(()=>{(function({actionId:t}){return(0,d.ZP)("/api/outreach/otp",{method:"POST",data:JSON.stringify({data:{type:"patient-actions",id:t}})}).then(d.sx)})({actionId:this.actionId}).then((()=>{this.showVerifyCodeView()})).catch((({response:t})=>{t.status>=500||this.showGeneralErrorView()}))})),this.showChildView("content",t)},showVerifyCodeView(t){const e=new y({patientPhoneEnd:this.patientPhoneEnd,hasInvalidCodeError:t});this.listenTo(e,"submit:code",(t=>{(function({outreachId:t,code:e}){const n={id:t,type:"outreach",attributes:{code:e}};return(0,d.ZP)("/api/outreach/auth",{method:"POST",data:JSON.stringify({data:n})}).then(d.sx).then((({data:{attributes:t}})=>(l().request("auth","setToken",t.token),Promise.resolve(t.token))))})({outreachId:this.outreachId,code:t}).then((()=>{this.stop({isVerified:!0})})).catch((({response:t})=>{t.status>=500||this.showVerifyCodeView(!0)}))})),this.listenTo(e,"click:resend",(t=>{this.showRequestCodeView()})),this.showChildView("content",e)},showAlreadySubmittedView(){this.showChildView("content",new x)},showNotAvailableView(){this.showChildView("content",new C)},showGeneralErrorView(){this.showChildView("content",new E)}});var V=n(7198),T=n(7885);const P=u.View.extend({behaviors:[T.Z],regions:{formAction:"[data-action-region]"},template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s,r=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n  <div class="form__header">\n    <div class="form__title">'+t.escapeExpression("function"==typeof(s=null!=(s=r(n,"name")||(null!=e?r(e,"name"):e))?s:t.hooks.helperMissing)?s.call(null!=e?e:t.nullContext||{},{name:"name",hash:{},data:o,loc:{start:{line:3,column:29},end:{line:3,column:39}}}):s)+'</div>\n    <div data-action-region></div>\n  </div>\n  <div class="form__content">\n    <iframe src="/formapp/"></iframe>\n  </div>\n  '},useData:!0})}),I=u.View.extend({isDisabled:!1,tagName:"button",className:"button--green",attributes(){return{disabled:this.getOption("isDisabled")}},template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){return"Submit"},useData:!0}),triggers:{click:"click"},onClick(){this.$el.prop("disabled",!0)}}),O=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--error">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+'</div>\n    <div class="dialog__error-header">Uh-oh, there was an error.</div>\n    <div class="dialog__error-header u-text-link u-margin--t-24 js-try-again">Try again</div>\n  '},useData:!0}),triggers:{"click .js-try-again":"click:tryAgain"},onClickTryAgain(){history.back()}}),A=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"triangle-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:30},end:{line:2,column:60}}}))+'</div>\n    <div class="dialog__error-header">Oops! The page you requested can’t be found.</div>\n    <div class="dialog__error-info">Return to the Outreach message and re-open the link.</div>\n  '},useData:!0})}),j=c.Z.extend({beforeStart:({actionId:t})=>[l().request("entities","fetch:forms:byAction",t),l().request("entities","fetch:forms:definition:byAction",t),l().request("entities","fetch:forms:data",t)],onFail(){const t=new R;t.showChildView("content",new O),this.showView(t)},onStart({actionId:t},e,n,i){this.actionId=t,this.form=e,this.definition=n,this.formData=i.attributes,this.setView(new P({model:this.form})),this.startService(),this.showFormSaveDisabled(),this.showView()},startService(){this.channel=l().channel(`form${this.form.id}`),this.channel.reply({"ready:form":this.showFormSave,"submit:form":this.submitForm,"fetch:form:data":this.getFormPrefill},this)},getFormPrefill(){this.channel.request("send","fetch:form:data",{definition:this.definition,formData:this.formData,formSubmission:{},...this.form.getContext()})},showFormSaveDisabled(){this.form.isReadOnly()||this.showChildView("formAction",new I({isDisabled:!0}))},showFormSave(){if(this.form.isReadOnly())return;const t=this.showChildView("formAction",new I);this.listenTo(t,"click",(()=>{this.channel.request("send","form:submit")}))},submitForm({response:t}){(function({formId:t,actionId:e,response:n}){const i={type:"form-responses",id:(0,p.Z)(),attributes:{response:n},relationships:{action:m(e,"patient-actions"),form:m(t,"forms")}};return(0,d.ZP)(`/api/actions/${e}/relationships/form-responses`,{method:"POST",data:JSON.stringify({data:i})}).then(d.sx)})({formId:this.form.id,actionId:this.actionId,response:t}).then((()=>{this.showView(new R)})).catch((({responseData:t})=>{if(this.showFormSave(),!t)return;const e=(0,V.map)(t.errors,"detail");this.channel.request("send","form:errors",e)}))}});var N=n(4884),D=n(1441);const F=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s,r=null!=e?e:t.nullContext||{},a=t.hooks.helperMissing,l=t.escapeExpression,u="function",h=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--warn">'+l((h(n,"fat")||e&&h(e,"fat")||a).call(r,"hand-wave",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+'</div>\n    <h2 class="opt-in__heading-text">Hi, we need to confirm your contact info. Please enter your information below, so that we can share health resources with you.</h2>\n    <div class="opt-in__field">\n      <label class="opt-in__field-label">Your first name</label>\n      <input\n        type="text"\n        class="input-primary opt-in__field-input js-first-name"\n        placeholder="Enter your first name"\n        value="'+l(typeof(s=null!=(s=h(n,"first_name")||(null!=e?h(e,"first_name"):e))?s:a)===u?s.call(r,{name:"first_name",hash:{},data:o,loc:{start:{line:10,column:15},end:{line:10,column:31}}}):s)+'"\n      />\n    </div>\n    <div class="opt-in__field">\n      <label class="opt-in__field-label">Your last name</label>\n      <input\n        type="text"\n        class="input-primary opt-in__field-input js-last-name"\n        placeholder="Enter your last name"\n        value="'+l(typeof(s=null!=(s=h(n,"last_name")||(null!=e?h(e,"last_name"):e))?s:a)===u?s.call(r,{name:"last_name",hash:{},data:o,loc:{start:{line:19,column:15},end:{line:19,column:30}}}):s)+'"\n      />\n    </div>\n    <div class="opt-in__field">\n      <label class="opt-in__field-label">Your date of birth</label>\n      <input\n        type="date"\n        class="input-primary opt-in__field-input js-birth-date"\n        placeholder="Enter your date of birth"\n        value="'+l(typeof(s=null!=(s=h(n,"birth_date")||(null!=e?h(e,"birth_date"):e))?s:a)===u?s.call(r,{name:"birth_date",hash:{},data:o,loc:{start:{line:28,column:15},end:{line:28,column:31}}}):s)+'"\n      />\n    </div>\n    <h3 class="opt-in__heading-text u-margin--t-32 u-margin--b-16">How may we share health resources with you?</h3>\n    <div class="opt-in__field">\n      <label class="opt-in__field-label">Your mobile phone number</label>\n      <input\n        type="text"\n        class="input-primary opt-in__field-input js-phone"\n        placeholder="Enter mobile phone number"\n        value="'+l(typeof(s=null!=(s=h(n,"phone")||(null!=e?h(e,"phone"):e))?s:a)===u?s.call(r,{name:"phone",hash:{},data:o,loc:{start:{line:38,column:15},end:{line:38,column:26}}}):s)+'"\n      />\n    </div>\n    <p class="opt-in__disclaimer">By clicking Submit you agree to receive SMS text message notifications. You may opt out at any time.</p>\n    <button class="opt-in__submit button--green w-100 js-submit" disabled>Submit</button>\n  '},useData:!0}),modelEvents:{change:"setSubmitButtonState"},ui:{firstName:".js-first-name",lastName:".js-last-name",birthDate:".js-birth-date",phone:".js-phone",submit:".js-submit"},triggers:{"input @ui.firstName":"change:firstName","input @ui.lastName":"change:lastName","input @ui.birthDate":"change:birthDate","input @ui.phone":"change:phone","click @ui.submit":"click:submit"},onRender(){this.setSubmitButtonState()},onChangeFirstName(){this.model.set({first_name:(0,D.Z)(this.ui.firstName.val())})},onChangeLastName(){this.model.set({last_name:(0,D.Z)(this.ui.lastName.val())})},onChangeBirthDate(){this.model.set({birth_date:(0,D.Z)(this.ui.birthDate.val())})},onChangePhone(){const t=(0,N.S)(this.ui.phone.val(),"US");this.model.set({phone:t?t.number:null})},disableSubmitButton(){this.ui.submit.prop("disabled",!0)},enableSubmitButton(){this.ui.submit.prop("disabled",!1)},setSubmitButtonState(){this.model.isValid()?this.enableSubmitButton():this.disableSubmitButton()},onClickSubmit(){this.disableSubmitButton()}}),M=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--success">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"thumbs-up",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:39},end:{line:2,column:58}}}))+'</div>\n    <div class="opt-in__heading-text">Your contact info is confirmed. Thanks for doing that. We’ll notify you when we have a health resource to share with you.</div>\n  '},useData:!0})}),q=u.View.extend({template:w().template({compiler:[8,">= 4.3.0"],main:function(t,e,n,i,o){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'\n    <div class="dialog__icon--error">'+t.escapeExpression((s(n,"fat")||e&&s(e,"fat")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+'</div>\n    <div class="opt-in__heading-text">We were not able to confirm your contact info. Sorry about that. Please contact your care team.</div>\n    <div class="opt-in__heading-text u-text-link js-try-again">Try again</div>\n  '},useData:!0}),triggers:{"click .js-try-again":"click:tryAgain"}}),B=r().Model.extend({defaults:{first_name:"",last_name:"",birth_date:"",phone:""},validate({first_name:t,last_name:e,birth_date:n,phone:i}){if(!(t&&e&&n&&i))return"invalid"}}),Z=c.Z.extend({StateModel:B,onStart(){const t=new R;this.showView(t),this.showOptInView()},showOptInView(){const t=new F({model:this.getState()});this.listenTo(t,"click:submit",(()=>{(function(t){const e={type:"patients",attributes:t};return(0,d.ZP)("/api/outreach",{method:"POST",data:JSON.stringify({data:e})}).then(d.sx)})(this.getState().attributes).then((()=>{this.showResponseSuccessView()})).catch((()=>{this.showResponseErrorView()}))})),this.showChildView("content",t)},showResponseSuccessView(){const t=new M;this.showChildView("content",t)},showResponseErrorView(){const t=new q;this.listenTo(t,"click:tryAgain",(()=>{this.showOptInView()})),this.showChildView("content",t)}}),Y=h.Z.extend({eventRoutes:{unknownError:{route:"outreach/unknown-error",action:"show500",root:!0}},initialize(){this.router.route("*unknown","show404",(0,V.bind)(this.show404,this))},show404(){const t=new R;this.showView(t),this.showChildView("content",new A)},show500(){const t=new R;this.showView(t),this.showChildView("content",new O)}}),K=h.Z.extend({childApps:{verify:S,form:j,optIn:Z},routerAppName:"PatientsApp",eventRoutes:{"outreach:id":{route:"outreach/:id",action:"show",root:!0},"outreach:opt:in":{route:"outreach/opt-in",action:"showOptIn",root:!0}},show(t){this.actionId=t,this.startVerify()},startVerify(){const t=this.startCurrent("verify",{actionId:this.actionId});this.listenTo(t,"stop",(()=>{l().request("auth","getToken")&&this.startForm()}))},startForm(){this.startCurrent("form",{actionId:this.actionId})},showOptIn(){this.startCurrent("optIn")}});function L(){o()("meta[name=viewport]").attr("content","width=device-width, initial-scale=1.0, maximum-scale=1.0");const t=new u.Region({el:document.getElementById("root")});new Y({region:t}),new K({region:t}),r().history.start({pushState:!0})}},6658:(t,e,n)=>{"use strict";n.d(e,{default:()=>i});const i={BACKSPACE_KEY:8,TAB_KEY:9,ENTER_KEY:13,SHIFT_KEY:16,ESCAPE_KEY:27,LEFT_KEY:37,UP_KEY:38,RIGHT_KEY:39,DOWN_KEY:40,AT_KEY_SHIFT:50}},4737:function(t,e,n){t.exports=function(t,e,n){"use strict";t="default"in t?t.default:t,e="default"in e?e.default:e;var i=/(\(\?)?:\w+/,o=e.EventRouter=e.Router.extend({constructor:function(n){t.extend(this,t.pick(n,["channelName","routeTriggers"])),this._ch=e.Radio.channel(t.result(this,"channelName")),this.listenTo(this._ch,"all",this.navigateFromEvent),e.Router.apply(this,arguments),this._initRoutes()},channelName:"event-router",getChannel:function(){return this._ch},_initRoutes:function(){this._routeTriggers=t.result(this,"routeTriggers",{}),t.each(this._routeTriggers,this._addRouteTrigger,this)},_addRouteTrigger:function(e,n){e=t.isArray(e)?e:[e],t.each(e,(function(e){this.route(e,n,t.bind(this._ch.trigger,this._ch,n))}),this)},addRouteTrigger:function(t,e){return this._routeTriggers[e]=t,this._addRouteTrigger(t,e),this},route:function(n,i,o){var s=e.Router.prototype.route;if(t.isFunction(i)||!o)return s.call(this,n,i,o);var r=t.bind((function(){var e=t.drop(arguments,0);this.trigger("before:route",i,e),this.trigger.apply(this,["before:route:"+i].concat(e)),this._storeRouteTrigger([i].concat(e)),o.apply(this,e),this._clearRouteTrigger()}),this);return s.call(this,n,i,r)},_storeRouteTrigger:function(t){this._routeArgs=this._routeArgs||[],this._routeArgs.push(t)},_getCurrentRouteTrigger:function(){return t.last(this._routeArgs)||[]},_clearRouteTrigger:function(){this._routeArgs.pop()},_isTriggeredFromRoute:function(){var e=this._getCurrentRouteTrigger();return arguments.length===e.length&&arguments.length===t.union(arguments,this.currentRoute).length},navigateFromEvent:function(e){var n=this.getDefaultRoute(e);if(!n){var i=t.drop(arguments,0);return this.trigger.apply(this,["noMatch"].concat(i)),this}if(this._isTriggeredFromRoute.apply(this,arguments))return this;var o=t.drop(arguments,1),s=this.translateRoute(n,o);return this.navigate(s,{trigger:!1})},getDefaultRoute:function(e){var n=this._routeTriggers[e];return t.isArray(n)?n[0]:n},_replaceParam:function(t,e){return t.replace(i,e)},translateRoute:function(e,n){return t.reduce(n,this._replaceParam,e)}});return o}(n(7198),n(8088),n(7739))}}]);