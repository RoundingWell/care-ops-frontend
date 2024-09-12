import{R as p,V as h,_ as d,B as x,$ as E,a as P}from"./20240912-runtime-DXh0-cFF.js";import{f as b,h as g,v as O,A as _,t as v}from"./20240912-app-Ch2FKSkJ.js";import{k as I,I as j,R as C}from"./20240912-iframe-form-33t2My2d.js";import{a as A,m as D,b as R}from"./20240912-index-BjO3ZpiK.js";import{p as T}from"./20240912-parsePhoneNumber-DafX4GxM.js";function y(t,e){return{data:{type:e,id:t}}}let k;p.reply("auth",{setToken(t){k=t},getToken(){return k}});function B({actionId:t}){return b(`/api/outreach?filter[action]=${t}`,{method:"GET"}).then(g).then(({data:e})=>({outreachId:e.id,patientId:e.relationships.patient.data.id,patientPhoneEnd:e.attributes.phone_end}))}function q({actionId:t}){return b("/api/outreach/otp",{method:"POST",data:JSON.stringify({data:{type:"patient-actions",id:t}})}).then(g)}function F({outreachId:t,code:e,patientId:i}){const l={id:t,type:"outreach",attributes:{code:e},relationships:{patient:y(i,"patients")}};return b("/api/outreach/auth",{method:"POST",data:JSON.stringify({data:l})}).then(g).then(({data:{attributes:o}})=>(p.request("auth","setToken",o.token),Promise.resolve(o.token)))}function M(t){return b("/api/outreach",{method:"POST",data:JSON.stringify({data:{type:"patients",attributes:t}})}).then(g)}function N({formId:t,actionId:e,response:i}){const l={type:"form-responses",id:O(),attributes:{response:i},relationships:{action:y(e,"patient-actions"),form:y(t,"forms")}};return b(`/api/actions/${e}/relationships/form-responses`,{method:"POST",data:JSON.stringify({data:l})}).then(g)}const{BACKSPACE_KEY:X}=I,Y=h.extend({ui:{submit:".js-submit"},triggers:{"click @ui.submit":"click:submit"},template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n,a=e??(t.nullContext||{}),s=t.hooks.helperMissing,c=t.escapeExpression,u=t.lookupProperty||function(r,m){if(Object.prototype.hasOwnProperty.call(r,m))return r[m]};return`
    <div class="dialog__icon--blue">`+c((u(i,"fat")||e&&u(e,"fat")||s).call(a,"user-lock",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+`</div>
    <h2 class="verify__heading-text">Request a verification code to view this health resource.</h2>
    <p class="verify__info-text">We’ll send a text message with a verification code to the phone number XXX-XXX-`+c((n=(n=u(i,"phoneEnd")||(e!=null?u(e,"phoneEnd"):e))!=null?n:s,typeof n=="function"?n.call(a,{name:"phoneEnd",hash:{},data:o,loc:{start:{line:4,column:112},end:{line:4,column:126}}}):n))+`.</p>
    <button class="verify__submit button--green w-100 js-submit">Send Verification Code</button>
  `},useData:!0}),templateContext(){return{phoneEnd:this.getOption("patientPhoneEnd")}},onClickSubmit(){this.ui.submit.prop("disabled",!0)}}),J=h.extend({ui:{submit:".js-submit",resend:".js-resend",input:".js-input"},triggers:{"click @ui.submit":"click:submit","click @ui.resend":"click:resend"},events:{"input @ui.input":"watchInput","keydown @ui.input":"watchKeydown"},template:d.template({1:function(t,e,i,l,o){return" has-error"},3:function(t,e,i,l,o){return`      <p class="verify__error-text">Incorrect verification code. Please try again.</p>
`},compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n,a,s=e??(t.nullContext||{}),c=t.hooks.helperMissing,u=t.escapeExpression,r=t.lookupProperty||function(m,w){if(Object.prototype.hasOwnProperty.call(m,w))return m[w]};return`
    <div class="dialog__icon--blue">`+u((r(i,"fat")||e&&r(e,"fat")||c).call(s,"user-lock",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+`</div>
    <h2 class="verify__heading-text">Enter your verification code.</h2>
    <p class="verify__info-text">We sent a text message with a verification code to the phone number XXX-XXX-`+u((a=(a=r(i,"phoneEnd")||(e!=null?r(e,"phoneEnd"):e))!=null?a:c,typeof a=="function"?a.call(s,{name:"phoneEnd",hash:{},data:o,loc:{start:{line:4,column:109},end:{line:4,column:123}}}):a))+`.</p>
    <div class="verify__code-fields">
      <input class="input-primary verify__code-input js-input`+((n=r(i,"if").call(s,e!=null?r(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:6,column:61},end:{line:6,column:105}}}))!=null?n:"")+`" inputmode="numeric" />
      <input class="input-primary verify__code-input js-input`+((n=r(i,"if").call(s,e!=null?r(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:7,column:61},end:{line:7,column:105}}}))!=null?n:"")+`" inputmode="numeric" />
      <input class="input-primary verify__code-input js-input`+((n=r(i,"if").call(s,e!=null?r(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:8,column:61},end:{line:8,column:105}}}))!=null?n:"")+`" inputmode="numeric" />
      <input class="input-primary verify__code-input js-input`+((n=r(i,"if").call(s,e!=null?r(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(1,o,0),inverse:t.noop,data:o,loc:{start:{line:9,column:61},end:{line:9,column:105}}}))!=null?n:"")+`" inputmode="numeric" />
    </div>
`+((n=r(i,"if").call(s,e!=null?r(e,"hasInvalidCodeError"):e,{name:"if",hash:{},fn:t.program(3,o,0),inverse:t.noop,data:o,loc:{start:{line:11,column:4},end:{line:13,column:11}}}))!=null?n:"")+`    <button class="verify__submit button--green w-100 js-submit" disabled>Confirm Code</button>
    <div class="verify__heading-text u-text-link js-resend">Send a new code</div>
  `},useData:!0}),templateContext(){return{phoneEnd:this.getOption("patientPhoneEnd"),hasInvalidCodeError:this.getOption("hasInvalidCodeError")}},watchInput(t){const e=String(t.target.value).replace(/\s/g,""),i=e.charAt(0),l=e.substring(1);t.target.value=i;const o=this.ui.input,n=o.index(t.target),a=n===o.length-1,s=i!==void 0&&e.length,c=o.map((u,r)=>r.value).get().join("");if(this.disableSubmitButton(c.length!==o.length),s&&!a){const u=o.eq(n+1);u.focus(),u.val(l),u.trigger("input")}},watchKeydown(t){const e=this.ui.input,i=e.index(t.target);t.keyCode===X&&t.target.value===""&&e.eq(Math.max(0,i-1)).focus()},disableSubmitButton(t){this.ui.submit.prop("disabled",t)},onClickSubmit(){const e=this.ui.input.map((i,l)=>l.value).get().join("");this.triggerMethod("submit:code",e),this.disableSubmitButton(!0)}}),$=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--success">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"thumbs-up",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:39},end:{line:2,column:58}}}))+`</div>
    <div>This form has already been submitted.</div>
  `},useData:!0})}),G=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--error">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+`</div>
    <div>This form is no longer shared. Nothing else to do here.</div>
  `},useData:!0})}),K=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--error">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+`</div>
    <div class="dialog__error-header">Uh-oh, there was an error. Try reloading the page.</div>
  `},useData:!0})}),f=h.extend({className:"dialog__wrapper",template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n,a=e??(t.nullContext||{}),s=t.hooks.helperMissing,c=t.escapeExpression,u=t.lookupProperty||function(r,m){if(Object.prototype.hasOwnProperty.call(r,m))return r[m]};return`
    <h1 class="site-title">`+c((n=(n=u(i,"name")||(e!=null?u(e,"name"):e))!=null?n:s,typeof n=="function"?n.call(a,{name:"name",hash:{},data:o,loc:{start:{line:2,column:27},end:{line:2,column:37}}}):n))+`</h1>
    <div class="dialog" data-content-region>
      <div class="dialog__icon dialog__icon--success">`+c((u(i,"fat")||e&&u(e,"fat")||s).call(a,"circle-check",{name:"fat",hash:{},data:o,loc:{start:{line:4,column:54},end:{line:4,column:76}}}))+`</div>
      <div>You’ve submitted the form. Nice job.</div>
    </div>
  `},useData:!0}),templateContext(){return{name:A.name}},regions:{content:"[data-content-region]"}}),W=_.extend({onBeforeStart({actionId:t}){this.actionId=t},beforeStart(){return B({actionId:this.actionId})},onFail(t,{response:e}){const i=new f;if(this.showView(i),e.status===409){this.showAlreadySubmittedView();return}this.showNotAvailableView()},onStart(t,{outreachId:e,patientPhoneEnd:i,patientId:l}){this.outreachId=e,this.patientId=l,this.patientPhoneEnd=i;const o=new f;this.showView(o),this.showRequestCodeView()},showRequestCodeView(){const t=new Y({model:this.getState(),patientPhoneEnd:this.patientPhoneEnd});this.listenTo(t,"click:submit",()=>{q({actionId:this.actionId}).then(()=>{this.showVerifyCodeView()}).catch(({response:e})=>{e.status>=500||this.showGeneralErrorView()})}),this.showChildView("content",t)},showVerifyCodeView(t){const e=new J({patientPhoneEnd:this.patientPhoneEnd,hasInvalidCodeError:t});this.listenTo(e,"submit:code",i=>{F({outreachId:this.outreachId,patientId:this.patientId,code:i}).then(()=>{this.stop({isVerified:!0})}).catch(({response:l})=>{l.status>=500||this.showVerifyCodeView(!0)})}),this.listenTo(e,"click:resend",i=>{this.showRequestCodeView()}),this.showChildView("content",e)},showAlreadySubmittedView(){this.showChildView("content",new $)},showNotAvailableView(){this.showChildView("content",new G)},showGeneralErrorView(){this.showChildView("content",new K)}}),H=h.extend({behaviors:[j],regions:{formAction:"[data-action-region]"},template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n,a=t.lookupProperty||function(s,c){if(Object.prototype.hasOwnProperty.call(s,c))return s[c]};return`
  <div class="form__header">
    <div class="form__title">`+t.escapeExpression((n=(n=a(i,"name")||(e!=null?a(e,"name"):e))!=null?n:t.hooks.helperMissing,typeof n=="function"?n.call(e??(t.nullContext||{}),{name:"name",hash:{},data:o,loc:{start:{line:3,column:29},end:{line:3,column:39}}}):n))+`</div>
    <div data-action-region></div>
  </div>
  <div class="form__content">
    <iframe src="/formapp/"></iframe>
  </div>
  `},useData:!0})}),V=h.extend({isDisabled:!1,tagName:"button",className:"button--green",attributes(){return{disabled:this.getOption("isDisabled")}},template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){return"Submit"},useData:!0}),triggers:{click:"click"},onClick(){this.$el.prop("disabled",!0)}}),S=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--error">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+`</div>
    <div class="dialog__error-header">Uh-oh, there was an error.</div>
    <div class="dialog__error-header u-text-link u-margin--t-24 js-try-again">Try again</div>
  `},useData:!0}),triggers:{"click .js-try-again":"click:tryAgain"},onClickTryAgain(){history.back()}}),U=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"triangle-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:30},end:{line:2,column:60}}}))+`</div>
    <div class="dialog__error-header">Oops! The page you requested can’t be found.</div>
    <div class="dialog__error-info">Return to the Outreach message and re-open the link.</div>
  `},useData:!0})}),L=_.extend({beforeStart({actionId:t}){return[p.request("entities","fetch:forms:byAction",t),p.request("entities","fetch:forms:definition:byAction",t),p.request("entities","fetch:forms:data",t)]},onFail(){const t=new f;t.showChildView("content",new S),this.showView(t)},onStart({actionId:t},e,i,l){this.actionId=t,this.form=e,this.definition=i,this.formData=l.attributes,this.setView(new H({model:this.form})),this.startService(),this.showFormSaveDisabled(),this.showView()},startService(){this.channel=p.channel(`form${this.form.id}`),this.channel.reply({"ready:form":this.showFormSave,"submit:form":this.submitForm,"fetch:form:data":this.getFormPrefill},this)},getFormPrefill(){this.channel.request("send","fetch:form:data",{definition:this.definition,formData:this.formData,formSubmission:{},...this.form.getContext()})},showFormSaveDisabled(){this.form.isReadOnly()||this.showChildView("formAction",new V({isDisabled:!0}))},showFormSave(){if(this.form.isReadOnly())return;const t=this.showChildView("formAction",new V);this.listenTo(t,"click",()=>{this.channel.request("send","form:submit")})},submitForm({response:t}){N({formId:this.form.id,actionId:this.actionId,response:t}).then(()=>{this.showView(new f)}).catch(({responseData:e})=>{if(this.showFormSave(),!e)return;const i=D(e.errors,"detail");this.channel.request("send","form:errors",i)})}}),z=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n,a=e??(t.nullContext||{}),s=t.hooks.helperMissing,c=t.escapeExpression,u="function",r=t.lookupProperty||function(m,w){if(Object.prototype.hasOwnProperty.call(m,w))return m[w]};return`
    <div class="dialog__icon--warn">`+c((r(i,"fat")||e&&r(e,"fat")||s).call(a,"hand-wave",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:36},end:{line:2,column:55}}}))+`</div>
    <h2 class="opt-in__heading-text">Hi, we need to confirm your contact info. Please enter your information below, so that we can share health resources with you.</h2>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your first name</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-first-name"
        placeholder="Enter your first name"
        value="`+c((n=(n=r(i,"first_name")||(e!=null?r(e,"first_name"):e))!=null?n:s,typeof n===u?n.call(a,{name:"first_name",hash:{},data:o,loc:{start:{line:10,column:15},end:{line:10,column:31}}}):n))+`"
      />
    </div>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your last name</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-last-name"
        placeholder="Enter your last name"
        value="`+c((n=(n=r(i,"last_name")||(e!=null?r(e,"last_name"):e))!=null?n:s,typeof n===u?n.call(a,{name:"last_name",hash:{},data:o,loc:{start:{line:19,column:15},end:{line:19,column:30}}}):n))+`"
      />
    </div>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your date of birth</label>
      <input
        type="date"
        class="input-primary opt-in__field-input js-birth-date"
        placeholder="Enter your date of birth"
        value="`+c((n=(n=r(i,"birth_date")||(e!=null?r(e,"birth_date"):e))!=null?n:s,typeof n===u?n.call(a,{name:"birth_date",hash:{},data:o,loc:{start:{line:28,column:15},end:{line:28,column:31}}}):n))+`"
      />
    </div>
    <h3 class="opt-in__heading-text u-margin--t-32 u-margin--b-16">How may we share health resources with you?</h3>
    <div class="opt-in__field">
      <label class="opt-in__field-label">Your mobile phone number</label>
      <input
        type="text"
        class="input-primary opt-in__field-input js-phone"
        placeholder="Enter mobile phone number"
        value="`+c((n=(n=r(i,"phone")||(e!=null?r(e,"phone"):e))!=null?n:s,typeof n===u?n.call(a,{name:"phone",hash:{},data:o,loc:{start:{line:38,column:15},end:{line:38,column:26}}}):n))+`"
      />
    </div>
    <p class="opt-in__disclaimer">By clicking Submit you agree to receive SMS text message notifications. You may opt out at any time.</p>
    <button class="opt-in__submit button--green w-100 js-submit" disabled>Submit</button>
  `},useData:!0}),modelEvents:{change:"setSubmitButtonState"},ui:{firstName:".js-first-name",lastName:".js-last-name",birthDate:".js-birth-date",phone:".js-phone",submit:".js-submit"},triggers:{"input @ui.firstName":"change:firstName","input @ui.lastName":"change:lastName","input @ui.birthDate":"change:birthDate","input @ui.phone":"change:phone","click @ui.submit":"click:submit"},onRender(){this.setSubmitButtonState()},onChangeFirstName(){this.model.set({first_name:v(this.ui.firstName.val())})},onChangeLastName(){this.model.set({last_name:v(this.ui.lastName.val())})},onChangeBirthDate(){this.model.set({birth_date:v(this.ui.birthDate.val())})},onChangePhone(){const t=T(this.ui.phone.val(),"US");this.model.set({phone:t?t.number:null})},disableSubmitButton(){this.ui.submit.prop("disabled",!0)},enableSubmitButton(){this.ui.submit.prop("disabled",!1)},setSubmitButtonState(){if(!this.model.isValid()){this.disableSubmitButton();return}this.enableSubmitButton()},onClickSubmit(){this.disableSubmitButton()}}),Q=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--success">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"thumbs-up",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:39},end:{line:2,column:58}}}))+`</div>
    <div class="opt-in__heading-text">Your contact info is confirmed. Thanks for doing that. We’ll notify you when we have a health resource to share with you.</div>
  `},useData:!0})}),Z=h.extend({template:d.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,l,o){var n=t.lookupProperty||function(a,s){if(Object.prototype.hasOwnProperty.call(a,s))return a[s]};return`
    <div class="dialog__icon--error">`+t.escapeExpression((n(i,"fat")||e&&n(e,"fat")||t.hooks.helperMissing).call(e??(t.nullContext||{}),"octagon-exclamation",{name:"fat",hash:{},data:o,loc:{start:{line:2,column:37},end:{line:2,column:66}}}))+`</div>
    <div class="opt-in__heading-text">We were not able to confirm your contact info. Sorry about that. Please contact your care team.</div>
    <div class="opt-in__heading-text u-text-link js-try-again">Try again</div>
  `},useData:!0}),triggers:{"click .js-try-again":"click:tryAgain"}}),tt=x.Model.extend({defaults:{first_name:"",last_name:"",birth_date:"",phone:""},validate({first_name:t,last_name:e,birth_date:i,phone:l}){if(!t||!e||!i||!l)return"invalid"}}),et=_.extend({StateModel:tt,onStart(){const t=new f;this.showView(t),this.showOptInView()},showOptInView(){const t=new z({model:this.getState()});this.listenTo(t,"click:submit",()=>{M(this.getState().attributes).then(()=>{this.showResponseSuccessView()}).catch(()=>{this.showResponseErrorView()})}),this.showChildView("content",t)},showResponseSuccessView(){const t=new Q;this.showChildView("content",t)},showResponseErrorView(){const t=new Z;this.listenTo(t,"click:tryAgain",()=>{this.showOptInView()}),this.showChildView("content",t)}}),nt=C.extend({eventRoutes:{unknownError:{route:"outreach/unknown-error",action:"show500",root:!0}},initialize(){this.router.route("*unknown","show404",R(this.show404,this))},show404(){const t=new f;this.showView(t),this.showChildView("content",new U)},show500(){const t=new f;this.showView(t),this.showChildView("content",new S)}}),it=C.extend({childApps:{verify:W,form:L,optIn:et},routerAppName:"PatientsApp",eventRoutes:{"outreach:id":{route:"outreach/:id",action:"show",root:!0},"outreach:opt:in":{route:"outreach/opt-in",action:"showOptIn",root:!0}},show(t){this.actionId=t,this.startVerify()},startVerify(){const t=this.startCurrent("verify",{actionId:this.actionId});this.listenTo(t,"stop",()=>{p.request("auth","getToken")&&this.startForm()})},startForm(){this.startCurrent("form",{actionId:this.actionId})},showOptIn(){this.startCurrent("optIn")}});function ut(){E("meta[name=viewport]").attr("content","width=device-width, initial-scale=1.0, maximum-scale=1.0");const t=new P({el:document.getElementById("root")});new nt({region:t}),new it({region:t}),x.history.start({pushState:!0})}export{ut as startOutreachApp};
