import{I as V,R as j}from"./20241017-iframe-form-AoanckUW.js";import{e as T,B as k}from"./20241017-index-CLUXL0Ry.js";import{V as f,_ as h,R as c,a as I,B as q}from"./20241017-runtime-DnmPeeVn.js";import{T as x,D as _,s as b,F as A}from"./20241017-app-Ddt2t32N.js";import{A as y}from"./20241017-app-DMYJqA4y.js";import{i as v}from"./20241017-index-C1oNoNwx.js";import{F as C}from"./20241017-workspaces-DGu0l2rF.js";import{P as F}from"./20241017-sidebar_app-B9PBqg6f.js";import{n as G}from"./20241017-app-frame_app-gjLhPa4h.js";import"./20241017-parsePhoneNumber-HF6SYIlZ.js";import"./20241017-prelogin_views-jJZ4rk8a.js";/* empty css                        */const U=f.extend({className:"form-widgets flex",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){return"<div data-widgets-region></div>"},useData:!0}),regions:{widgets:"[data-widgets-region]"},onRender({model:e,collection:t}){this.showChildView("widgets",new G({model:e,collection:t,className:"flex flex-wrap",itemClassName:"form-widgets__section"}))}}),P=y.extend({beforeStart({patient:e,form:t}){const a=c.request("entities","fetch:workspacePatients:byPatient",e.id),o=t.getWidgets().invoke("fetchValues",e.id);return[a,...o]},onStart({patient:e,form:t}){const a=t.getWidgets();a.length&&this.showView(new U({model:e,collection:a}))}}),p=v.forms.form.formViews,L=f.extend({className:"form__context-trail",actionTemplate:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.escapeExpression,i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return'<a class="js-back form__context-link">'+n((i(a,"fas")||t&&i(t,"fas")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"chevron-left",{name:"fas",hash:{},data:o,loc:{start:{line:1,column:38},end:{line:1,column:61}}}))+n(e.lambda((s=(s=(s=(s=(s=o&&i(o,"intl"))&&i(s,"forms"))&&i(s,"form"))&&i(s,"formViews"))&&i(s,"contextTrailView"))&&i(s,"backBtn"),t))+"</a>"},useData:!0}),patientTemplate:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.escapeExpression,i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return'<a class="js-dashboard form__context-link">'+n((i(a,"fas")||t&&i(t,"fas")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"chevron-left",{name:"fas",hash:{},data:o,loc:{start:{line:1,column:43},end:{line:1,column:66}}}))+n(e.lambda((s=(s=(s=(s=(s=o&&i(o,"intl"))&&i(s,"forms"))&&i(s,"form"))&&i(s,"formViews"))&&i(s,"contextTrailView"))&&i(s,"backDashboard"),t))+"</a>"},useData:!0}),getTemplate(){return this.action?this.actionTemplate:this.patientTemplate},initialize({patient:e,action:t}){this.patient=e,this.action=t},triggers:{"click .js-back":"click:back","click .js-dashboard":"click:dashboard"},onClickBack(){c.request("history","go:back",()=>{if(this.action.get("_flow")){this.routeToFlow();return}this.routeToPatient()})},onClickDashboard(){this.routeToPatient()},routeToFlow(){c.trigger("event-router","flow",this.action.get("_flow"))},routeToPatient(){c.trigger("event-router","patient:dashboard",this.patient.id)}}),O=f.extend({className:"flex",template:h.template({1:function(e,t,a,m,o){var s,n=t??(e.nullContext||{}),i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return'<button class="js-history-button form__actions-icon'+((s=i(a,"if").call(n,t!=null?i(t,"shouldShowHistory"):t,{name:"if",hash:{},fn:e.program(2,o,0),inverse:e.noop,data:o,loc:{start:{line:2,column:73},end:{line:2,column:117}}}))!=null?s:"")+'">'+e.escapeExpression((i(a,"far")||t&&i(t,"far")||e.hooks.helperMissing).call(n,"clock-rotate-left",{name:"far",hash:{},data:o,loc:{start:{line:2,column:119},end:{line:2,column:146}}}))+"</button>"},2:function(e,t,a,m,o){return" is-selected"},4:function(e,t,a,m,o){var s=e.lookupProperty||function(n,i){if(Object.prototype.hasOwnProperty.call(n,i))return n[i]};return e.escapeExpression((s(a,"fas")||t&&s(t,"fas")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"down-left-and-up-right-to-center",{name:"fas",hash:{},data:o,loc:{start:{line:3,column:74},end:{line:3,column:116}}}))},6:function(e,t,a,m,o){var s=e.lookupProperty||function(n,i){if(Object.prototype.hasOwnProperty.call(n,i))return n[i]};return e.escapeExpression((s(a,"fas")||t&&s(t,"fas")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"up-right-and-down-left-from-center",{name:"fas",hash:{},data:o,loc:{start:{line:3,column:124},end:{line:3,column:168}}}))},8:function(e,t,a,m,o){var s,n=t??(e.nullContext||{}),i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return'<button class="js-sidebar-button form__actions-icon'+((s=i(a,"if").call(n,t!=null?i(t,"isActionShown"):t,{name:"if",hash:{},fn:e.program(2,o,0),inverse:e.noop,data:o,loc:{start:{line:4,column:72},end:{line:4,column:112}}}))!=null?s:"")+'">'+e.escapeExpression((i(a,"far")||t&&i(t,"far")||e.hooks.helperMissing).call(n,"file-lines",{name:"far",hash:{},data:o,loc:{start:{line:4,column:114},end:{line:4,column:134}}}))+"</button>"},compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=t??(e.nullContext||{}),i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return`
    `+((s=i(a,"if").call(n,t!=null?i(t,"hasHistory"):t,{name:"if",hash:{},fn:e.program(1,o,0),inverse:e.noop,data:o,loc:{start:{line:2,column:4},end:{line:2,column:162}}}))!=null?s:"")+`
    <button class="js-expand-button form__actions-icon">`+((s=i(a,"if").call(n,t!=null?i(t,"isExpanded"):t,{name:"if",hash:{},fn:e.program(4,o,0),inverse:e.program(6,o,0),data:o,loc:{start:{line:3,column:56},end:{line:3,column:175}}}))!=null?s:"")+`</button>
    `+((s=i(a,"if").call(n,t!=null?i(t,"hasAction"):t,{name:"if",hash:{},fn:e.program(8,o,0),inverse:e.noop,data:o,loc:{start:{line:4,column:4},end:{line:4,column:150}}}))!=null?s:"")+`
  `},useData:!0}),templateContext(){return{isActionShown:this.isActionShown(),hasHistory:this.responses&&!!this.responses.length,hasAction:!!this.action}},onRender(){this.renderSidebarTooltip(),this.renderExpandTooltip(),this.renderHistoryTooltip()},initialize({action:e,responses:t}){this.action=e,this.responses=t,this.listenTo(this.responses,"update",this.render)},modelEvents:{"change:isExpanded":"render","change:isActionSidebar":"render","change:shouldShowHistory":"render"},ui:{sidebarButton:".js-sidebar-button",expandButton:".js-expand-button",historyButton:".js-history-button"},triggers:{"click @ui.sidebarButton":"click:sidebarButton","click @ui.expandButton":"click:expandButton","click @ui.historyButton":"click:historyButton"},isActionShown(){return this.model.get("isActionSidebar")&&!this.model.get("isExpanded")},renderSidebarTooltip(){const t=this.isActionShown()?p.formActionsView.hideActionSidebar:p.formActionsView.showActionSidebar;new x({message:t,uiView:this,ui:this.ui.sidebarButton})},renderExpandTooltip(){const t=this.model.get("isExpanded")?p.formActionsView.decreaseWidth:p.formActionsView.increaseWidth;new x({message:t,uiView:this,ui:this.ui.expandButton})},renderHistoryTooltip(){const t=this.model.get("shouldShowHistory")?p.formActionsView.currentVersion:p.formActionsView.responseHistory;new x({message:t,uiView:this,ui:this.ui.historyButton})}}),B=f.extend({className:"form__frame",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n,i=t??(e.nullContext||{}),r=e.hooks.helperMissing,l=e.escapeExpression,u=e.lambda,d=e.lookupProperty||function(w,g){if(Object.prototype.hasOwnProperty.call(w,g))return w[g]};return`
    <div class="form__layout">
      <div class="flex">
        <div class="overflow--hidden flex-grow">
          <div data-context-trail-region></div>
          <div class="form__title">
            <span class="form__title-icon">`+l((d(a,"far")||t&&d(t,"far")||r).call(i,"square-poll-horizontal",{name:"far",hash:{},data:o,loc:{start:{line:7,column:43},end:{line:7,column:75}}}))+`</span>
            <span class="u-text--overflow">`+l(u((s=t!=null?d(t,"patient"):t)!=null?d(s,"first_name"):s,t))+" "+l(u((s=t!=null?d(t,"patient"):t)!=null?d(s,"last_name"):s,t))+" — "+l((n=(n=d(a,"name")||(t!=null?d(t,"name"):t))!=null?n:r,typeof n=="function"?n.call(i,{name:"name",hash:{},data:o,loc:{start:{line:8,column:90},end:{line:8,column:100}}}):n))+`</span>
          </div>
        </div>
        <div class="flex-grow">
          <div data-status-region>&nbsp;</div>
          <div class="form__controls">
            <div data-state-actions-region></div>
            <div data-form-updated-region></div>
            <div data-form-action-region></div>
          </div>
        </div>
      </div>
      <div data-widgets-header-region></div>
      <div data-form-region></div>
    </div>
    <div class="form__sidebar" data-sidebar-region></div>
  `},useData:!0}),regionClass:I.extend({replaceElement:!0}),regions:{contextTrail:"[data-context-trail-region]",form:"[data-form-region]",formUpdated:"[data-form-updated-region]",formAction:{el:"[data-form-action-region]",replaceElement:!0},sidebar:{el:"[data-sidebar-region]",replaceElement:!1},stateActions:"[data-state-actions-region]",status:"[data-status-region]",widgets:"[data-widgets-header-region]"},templateContext(){return{patient:this.getOption("patient").pick("first_name","last_name")}},onRender(){this.showChildView("contextTrail",new L({patient:this.getOption("patient"),action:this.getOption("action")}))}}),E=f.extend({behaviors:[V],className:"form__content",template:h.template({1:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return e.escapeExpression((s=(s=n(a,"responseId")||(t!=null?n(t,"responseId"):t))!=null?s:e.hooks.helperMissing,typeof s=="function"?s.call(t??(e.nullContext||{}),{name:"responseId",hash:{},data:o,loc:{start:{line:1,column:40},end:{line:1,column:56}}}):s))},compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return'<iframe src="/formapp/'+((s=n(a,"if").call(t??(e.nullContext||{}),t!=null?n(t,"responseId"):t,{name:"if",hash:{},fn:e.program(1,o,0),inverse:e.noop,data:o,loc:{start:{line:1,column:22},end:{line:1,column:63}}}))!=null?s:"")+'"></iframe>'},useData:!0}),templateContext(){return{responseId:this.getOption("responseId")}}}),M=f.extend({className:"form__content",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.lambda,i=e.escapeExpression,r=t??(e.nullContext||{}),l=e.hooks.helperMissing,u=e.lookupProperty||function(d,w){if(Object.prototype.hasOwnProperty.call(d,w))return d[w]};return`
    <div class="form__prompt">
      <h2 class="form__prompt-title">`+i(n((s=(s=(s=(s=(s=o&&u(o,"intl"))&&u(s,"forms"))&&u(s,"form"))&&u(s,"formViews"))&&u(s,"storedSubmissionView"))&&u(s,"title"),t))+`</h2>
      <div class="form__prompt-dialog">
        <div class="flex-shrink">
          <button class="button--blue button--large js-submit">`+i(n((s=(s=(s=(s=(s=o&&u(o,"intl"))&&u(s,"forms"))&&u(s,"form"))&&u(s,"formViews"))&&u(s,"storedSubmissionView"))&&u(s,"submitButton"),t))+`</button>
          <div class="u-margin--t-16">`+i((u(a,"formatHTMLMessage")||t&&u(t,"formatHTMLMessage")||l).call(r,(u(a,"intlGet")||t&&u(t,"intlGet")||l).call(r,"forms.form.formViews.storedSubmissionView.updated",{name:"intlGet",hash:{},data:o,loc:{start:{line:7,column:58},end:{line:7,column:119}}}),{name:"formatHTMLMessage",hash:{updated:(u(a,"formatDateTime")||t&&u(t,"formatDateTime")||l).call(r,t!=null?u(t,"updated"):t,"TIME_OR_DAY",{name:"formatDateTime",hash:{},data:o,loc:{start:{line:7,column:128},end:{line:7,column:166}}})},data:o,loc:{start:{line:7,column:38},end:{line:7,column:168}}}))+`</div>
        </div>
        <div class="flex-shrink">
          <button class="button-secondary button--large form__discard-button js-discard" style="color:red">`+i(n((s=(s=(s=(s=(s=o&&u(o,"intl"))&&u(s,"forms"))&&u(s,"form"))&&u(s,"formViews"))&&u(s,"storedSubmissionView"))&&u(s,"cancelButton"),t))+`</button>
        </div>
      </div>
    </div>
  `},useData:!0}),templateContext(){return{updated:this.getOption("updated")}},triggers:{"click .js-submit":"submit","click .js-discard":"discard"},onDiscard(){const e=c.request("modal","show:small",{bodyText:p.storedSubmissionView.discardModal.bodyText,headingText:p.storedSubmissionView.discardModal.headingText,submitText:p.storedSubmissionView.discardModal.submitText,buttonClass:"button--red",onSubmit:()=>{e.destroy(),this.triggerMethod("discard:submission")}})}}),$=f.extend({behaviors:[V],className:"form__frame",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n,i=t??(e.nullContext||{}),r=e.hooks.helperMissing,l=e.escapeExpression,u=e.lambda,d=e.lookupProperty||function(w,g){if(Object.prototype.hasOwnProperty.call(w,g))return w[g]};return`
    <div class="form__layout">
      <div class="form__context-trail">
        <a class="js-back form__context-link">`+l((d(a,"fas")||t&&d(t,"fas")||r).call(i,"chevron-left",{name:"fas",hash:{},data:o,loc:{start:{line:4,column:46},end:{line:4,column:68}}}))+l(u((s=(s=(s=(s=(s=o&&d(o,"intl"))&&d(s,"forms"))&&d(s,"form"))&&d(s,"formViews"))&&d(s,"previewView"))&&d(s,"backBtn"),t))+"</a>"+l((d(a,"fas")||t&&d(t,"fas")||r).call(i,"chevron-right",{name:"fas",hash:{},data:o,loc:{start:{line:5,column:8},end:{line:5,column:32}}}))+l(u((s=(s=(s=(s=(s=o&&d(o,"intl"))&&d(s,"forms"))&&d(s,"form"))&&d(s,"formViews"))&&d(s,"previewView"))&&d(s,"title"),t))+`
      </div>
      <div class="form__title"><span class="form__title-icon">`+l((d(a,"far")||t&&d(t,"far")||r).call(i,"square-poll-horizontal",{name:"far",hash:{},data:o,loc:{start:{line:7,column:62},end:{line:7,column:94}}}))+"</span>"+l((n=(n=d(a,"name")||(t!=null?d(t,"name"):t))!=null?n:r,typeof n=="function"?n.call(i,{name:"name",hash:{},data:o,loc:{start:{line:7,column:101},end:{line:7,column:111}}}):n))+`</div>
      <div class="form__content">
        <iframe src="/formapp/preview"></iframe>
      </div>
    </div>
  `},useData:!0}),triggers:{"click .js-back":"click:back"},onClickBack(){c.request("history","go:back")}}),D=f.extend({className:"u-text-align--right",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s=t??(e.nullContext||{}),n=e.hooks.helperMissing,i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return e.escapeExpression((i(a,"formatHTMLMessage")||t&&i(t,"formatHTMLMessage")||n).call(s,(i(a,"intlGet")||t&&i(t,"intlGet")||n).call(s,"forms.form.formViews.statusView.label",{name:"intlGet",hash:{},data:o,loc:{start:{line:1,column:20},end:{line:1,column:69}}}),{name:"formatHTMLMessage",hash:{date:(i(a,"formatDateTime")||t&&i(t,"formatDateTime")||n).call(s,t!=null?i(t,"updated_at"):t,"AT_TIME",{name:"formatDateTime",hash:{},data:o,loc:{start:{line:1,column:75},end:{line:1,column:112}}})},data:o,loc:{start:{line:1,column:0},end:{line:1,column:114}}}))},useData:!0})}),R=f.extend({className:"form__form-action",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return`
    <button class="button--grey" disabled=true>`+e.escapeExpression(e.lambda((s=(s=(s=(s=(s=o&&n(o,"intl"))&&n(s,"forms"))&&n(s,"form"))&&n(s,"formViews"))&&n(s,"readOnlyView"))&&n(s,"buttonText"),t))+`</button>
  `},useData:!0})}),W=f.extend({className:"form__submit-status",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.escapeExpression,i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return`
    <div class="form__submit-status-icon">
      `+n((i(a,"far")||t&&i(t,"far")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"lock-keyhole",{name:"far",hash:{},data:o,loc:{start:{line:3,column:6},end:{line:3,column:28}}}))+`
    </div>
    <div class="form__submit-status-locked-text">
      `+n(e.lambda((s=(s=(s=(s=(s=o&&i(o,"intl"))&&i(s,"forms"))&&i(s,"form"))&&i(s,"formViews"))&&i(s,"lockedSubmitView"))&&i(s,"permissionMessage"),t))+`
    </div>
  `},useData:!0})}),z=_.extend({align:"right",initialize({model:e}){this.collection=new q.Collection([{text:p.saveView.save.droplistItemText,value:"save"},{text:p.saveView.saveAndGoBack.droplistItemText,value:"saveAndGoBack"}]);const t=e.get("saveButtonType");this.setState("selected",this.collection.find({value:t}))},viewOptions:{className:"button--green button__drop-list-select",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s=e.lookupProperty||function(n,i){if(Object.prototype.hasOwnProperty.call(n,i))return n[i]};return e.escapeExpression((s(a,"fas")||t&&s(t,"fas")||e.hooks.helperMissing).call(t??(e.nullContext||{}),"caret-down",{name:"fas",hash:{},data:o,loc:{start:{line:1,column:0},end:{line:1,column:20}}}))},useData:!0})},picklistOptions(){return{headingText:p.saveView.droplistLabel,isCheckable:!0}}}),H=f.extend({className:"form__submit-status",template:h.template({1:function(e,t,a,m,o){var s=t??(e.nullContext||{}),n=e.hooks.helperMissing,i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return'        <div class="u-text--overflow">'+e.escapeExpression((i(a,"formatHTMLMessage")||t&&i(t,"formatHTMLMessage")||n).call(s,(i(a,"intlGet")||t&&i(t,"intlGet")||n).call(s,"forms.form.formViews.lastUpdatedView.updatedAt",{name:"intlGet",hash:{},data:o,loc:{start:{line:8,column:58},end:{line:8,column:116}}}),{name:"formatHTMLMessage",hash:{updated:(i(a,"formatDateTime")||t&&i(t,"formatDateTime")||n).call(s,t!=null?i(t,"updated"):t,"AGO_OR_TODAY",{name:"formatDateTime",hash:{},data:o,loc:{start:{line:8,column:125},end:{line:8,column:164}}})},data:o,loc:{start:{line:8,column:38},end:{line:8,column:166}}}))+`</div>
`},compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=t??(e.nullContext||{}),i=e.escapeExpression,r=e.lookupProperty||function(l,u){if(Object.prototype.hasOwnProperty.call(l,u))return l[u]};return`
    <div class="form__submit-status-icon">
      `+i((r(a,"far")||t&&r(t,"far")||e.hooks.helperMissing).call(n,"shield-check",{name:"far",hash:{},data:o,loc:{start:{line:3,column:6},end:{line:3,column:28}}}))+`
    </div>
    <div class="form__submit-status-text">
      <div class="u-text--overflow">`+i(e.lambda((s=(s=(s=(s=(s=o&&r(o,"intl"))&&r(s,"forms"))&&r(s,"form"))&&r(s,"formViews"))&&r(s,"lastUpdatedView"))&&r(s,"storedWork"),t))+`</div>
`+((s=r(a,"if").call(n,t!=null?r(t,"updated"):t,{name:"if",hash:{},fn:e.program(1,o,0),inverse:e.noop,data:o,loc:{start:{line:7,column:6},end:{line:9,column:13}}}))!=null?s:"")+`    </div>
  `},useData:!0}),templateContext(){return{updated:this.updated}},initialize({updated:e}){this.updated=e,this.updated&&(this.renderInterval=setInterval(()=>{this.render()},45e3))},onBeforeDestroy(){clearInterval(this.renderInterval)}}),S=f.extend({className:"form__form-action",regions:{saveType:{el:"[data-save-type-region]",replaceElement:!0}},modelEvents:{"change:saveButtonType":"render"},templateContext(){const e=this.model.get("saveButtonType");return{isDisabled:this.getOption("isDisabled"),showSaveButton:e==="save",showSaveGoBackButton:e==="saveAndGoBack"}},template:h.template({1:function(e,t,a,m,o){return"disabled"},3:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return"        "+e.escapeExpression(e.lambda((s=(s=(s=(s=(s=(s=o&&n(o,"intl"))&&n(s,"forms"))&&n(s,"form"))&&n(s,"formViews"))&&n(s,"saveView"))&&n(s,"save"))&&n(s,"buttonText"),t))+`
`},5:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return"        "+e.escapeExpression(e.lambda((s=(s=(s=(s=(s=(s=o&&n(o,"intl"))&&n(s,"forms"))&&n(s,"form"))&&n(s,"formViews"))&&n(s,"saveView"))&&n(s,"saveAndGoBack"))&&n(s,"buttonText"),t))+`
`},compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=t??(e.nullContext||{}),i=e.lookupProperty||function(r,l){if(Object.prototype.hasOwnProperty.call(r,l))return r[l]};return`
    <button class="button--green button__drop-list-action js-save-button" `+((s=i(a,"if").call(n,t!=null?i(t,"isDisabled"):t,{name:"if",hash:{},fn:e.program(1,o,0),inverse:e.noop,data:o,loc:{start:{line:2,column:74},end:{line:2,column:107}}}))!=null?s:"")+`>
`+((s=i(a,"if").call(n,t!=null?i(t,"showSaveButton"):t,{name:"if",hash:{},fn:e.program(3,o,0),inverse:e.noop,data:o,loc:{start:{line:3,column:6},end:{line:5,column:13}}}))!=null?s:"")+((s=i(a,"if").call(n,t!=null?i(t,"showSaveGoBackButton"):t,{name:"if",hash:{},fn:e.program(5,o,0),inverse:e.noop,data:o,loc:{start:{line:6,column:6},end:{line:8,column:13}}}))!=null?s:"")+`    </button>
    <button data-save-type-region></button>
  `},useData:!0}),triggers:{"click .js-save-button":"click:save"},onRender(){const e=this.showChildView("saveType",new z({model:this.model,state:{isDisabled:this.getOption("isDisabled")}}));this.listenTo(e,{"change:selected"(t){this.triggerMethod("select:button:type",t.get("value"))}})}}),Y=f.extend({className:"form__form-action",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return`
    <button class="button--green">`+e.escapeExpression(e.lambda((s=(s=(s=(s=(s=o&&n(o,"intl"))&&n(s,"forms"))&&n(s,"form"))&&n(s,"formViews"))&&n(s,"updateView"))&&n(s,"buttonText"),t))+`</button>
  `},useData:!0}),triggers:{click:"click"}}),N=_.extend({viewOptions(){return{className:"button-filter",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s=t??(e.nullContext||{}),n=e.hooks.helperMissing,i=e.escapeExpression,r=e.lookupProperty||function(l,u){if(Object.prototype.hasOwnProperty.call(l,u))return l[u]};return`
        `+i((r(a,"far")||t&&r(t,"far")||n).call(s,"clock-rotate-left",{name:"far",hash:{},data:o,loc:{start:{line:2,column:8},end:{line:2,column:35}}}))+i((r(a,"formatDateTime")||t&&r(t,"formatDateTime")||n).call(s,t!=null?r(t,"updated_at"):t,"AT_TIME",{name:"formatDateTime",hash:{},data:o,loc:{start:{line:2,column:35},end:{line:2,column:74}}}))+" "+i((r(a,"formatMessage")||t&&r(t,"formatMessage")||n).call(s,(r(a,"intlGet")||t&&r(t,"intlGet")||n).call(s,"forms.form.formViews.historyDroplistView.nameText",{name:"intlGet",hash:{},data:o,loc:{start:{line:2,column:91},end:{line:2,column:152}}}),{name:"formatMessage",hash:{name:t!=null?r(t,"name"):t},data:o,loc:{start:{line:2,column:75},end:{line:2,column:164}}}))+i((r(a,"far")||t&&r(t,"far")||n).call(s,"angle-down",{name:"far",hash:{},data:o,loc:{start:{line:2,column:164},end:{line:2,column:184}}}))+`
      `},useData:!0}),templateContext(){return{name:this.model.getEditorName()}}}},picklistOptions(){return{itemTemplate:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s=t??(e.nullContext||{}),n=e.hooks.helperMissing,i=e.escapeExpression,r=e.lookupProperty||function(l,u){if(Object.prototype.hasOwnProperty.call(l,u))return l[u]};return`
        `+i((r(a,"formatDateTime")||t&&r(t,"formatDateTime")||n).call(s,t!=null?r(t,"updated_at"):t,"AT_TIME",{name:"formatDateTime",hash:{},data:o,loc:{start:{line:2,column:8},end:{line:2,column:47}}}))+"&nbsp;"+i((r(a,"formatMessage")||t&&r(t,"formatMessage")||n).call(s,(r(a,"intlGet")||t&&r(t,"intlGet")||n).call(s,"forms.form.formViews.historyDroplistView.nameText",{name:"intlGet",hash:{},data:o,loc:{start:{line:2,column:69},end:{line:2,column:130}}}),{name:"formatMessage",hash:{name:t!=null?r(t,"name"):t},data:o,loc:{start:{line:2,column:53},end:{line:2,column:142}}}))+`
      `},useData:!0}),itemTemplateContext(){return{name:this.model.getEditorName()}}}}}),J=f.extend({className:"form__form-action",template:h.template({compiler:[8,">= 4.3.0"],main:function(e,t,a,m,o){var s,n=e.lookupProperty||function(i,r){if(Object.prototype.hasOwnProperty.call(i,r))return i[r]};return`
    <div data-versions-region></div>
    <button class="button--blue js-current u-margin--l-8">`+e.escapeExpression(e.lambda((s=(s=(s=(s=(s=o&&n(o,"intl"))&&n(s,"forms"))&&n(s,"form"))&&n(s,"formViews"))&&n(s,"historyView"))&&n(s,"currentVersionButton"),t))+`</button>
  `},useData:!0}),regions:{versions:{el:"[data-versions-region]",replaceElement:!0}},triggers:{"click .js-current":"click:current"},initialize({selected:e,collection:t}){const a=this.showChildView("versions",new N({collection:t,state:{selected:e}}));this.listenTo(a,{"change:selected"(m){this.triggerMethod("change:response",m)}})}}),K=y.extend({childApps:{patient:{AppClass:F,regionName:"sidebar",getOptions:["patient"]},widgetHeader:{AppClass:P,regionName:"widgets",getOptions:["patient","form"]}},initFormState(){const e=b.get(`form-state_${this.currentUser.id}`);this.setState(T({responseId:null,isActionSidebar:!0,isExpanded:!0,shouldShowHistory:!1,saveButtonType:"save"},e))},onBeforeStart(){this.getRegion().startPreloader(),this.currentUser=c.request("bootstrap","currentUser"),this.initFormState()},beforeStart({patientActionId:e}){return this.patientActionId=e||this.patientActionId,[c.request("entities","fetch:forms:byAction",this.patientActionId),c.request("entities","fetch:actions:withResponses",this.patientActionId),c.request("entities","fetch:patients:model:byAction",this.patientActionId),c.request("entities","fetch:formResponses:latest",{action:this.patientActionId,status:C.ANY,editor:this.currentUser.id})]},onFail(){c.request("alert","show:error",v.forms.form.formApp.notFound),c.trigger("event-router","default")},onBeforeStop(){this.removeChildApp("formsService")},onStart(e,t,a,m,o){this.form=t,this.patient=m,this.action=a,this.responses=a.getFormResponses(),this.latestResponse=o,this.isReadOnly=t.isReadOnly(),this.isLocked=a.isLocked()||!a.canSubmit(),this.isSubmitHidden=t.isSubmitHidden(),this.listenTo(a,"destroy",function(){c.request("alert","show:success",v.forms.form.formApp.deleteSuccess),c.trigger("event-router","default")}),this.startFormService(),this.setView(new B({model:this.form,patient:m,action:a})),this.startChildApp("widgetHeader"),this.showStateActions(),this.showSidebar(),this.setState({responseId:k(this.responses.getFirstSubmission(),"id",!1)}),this.showView()},startFormService(){const e=this.addChildApp("formsService",A,{patient:this.patient,action:this.action,form:this.form,responses:this.responses,latestResponse:this.latestResponse});!this.isReadOnly&&!this.isLocked&&this.bindEvents(e,this.serviceEvents)},serviceEvents:{submit:"onFormServiceSubmit",success:"onFormServiceSuccess",error:"onFormServiceError",ready:"onFormServiceReady","update:submission":"onFormServiceUpdateSubmission",refresh:"onFormServiceRefresh"},shouldSaveAndGoBack(){return this.getState("saveButtonType")==="saveAndGoBack"&&!this.isSubmitHidden},onFormServiceSubmit(){this.shouldSaveAndGoBack()&&(this.loadingModal=c.request("modal","show:loading"))},onFormServiceSuccess(e){if(this.shouldSaveAndGoBack()){this.listenTo(this.loadingModal,"destroy",()=>{c.request("history","go:back",()=>{if(this.action.get("_flow")){c.trigger("event-router","flow",this.action.get("_flow"));return}c.trigger("event-router","patient:dashboard",this.patient.id)})});return}this.responses.unshift(e),this.setState({responseId:e.id})},onFormServiceError(e){this.loadingModal&&this.loadingModal.destroy(),parseInt(e[0].status,10)===403&&c.request("alert","show:error",v.forms.form.formViews.lockedSubmitView.permissionMessage),this.showFormSave()},onFormServiceReady(){this.showFormSave()},onFormServiceUpdateSubmission(e){this.showLastUpdated(e)},onFormServiceRefresh(){this.restart()},stateEvents:{change:"onChangeState","change:isExpanded":"showSidebar","change:isActionSidebar":"showSidebar","change:shouldShowHistory":"showFormActions","change:responseId":"onChangeResponseId"},onChangeState(e){b.set(`form-state_${this.currentUser.id}`,e.pick("isExpanded","saveButtonType"))},onChangeResponseId(){this.showFormActions(),this.showContent()},showStateActions(){const e=new O({model:this.getState(),action:this.action,responses:this.responses.filterSubmissions()});this.listenTo(e,{"click:sidebarButton":this.onClickSidebarButton,"click:expandButton":this.onClickExpandButton,"click:historyButton":this.onClickHistoryButton}),this.showChildView("stateActions",e)},onClickSidebarButton(){if(this.getState("isExpanded")){this.setState({isActionSidebar:!0,isExpanded:!1});return}this.toggleState("isActionSidebar")},onClickExpandButton(){this.toggleState("isExpanded")},onClickHistoryButton(){this.setState({responseId:k(this.responses.getFirstSubmission(),"id"),shouldShowHistory:!this.getState("shouldShowHistory")})},showContent(){const e=this.getState("responseId");if(this.isReadOnly||this.isLocked||e){this.showForm();return}const{updated:t}=c.request(`form${this.form.id}`,"get:storedSubmission");if(t){const a=this.showChildView("form",new M({updated:t}));this.listenTo(a,{submit(){this.showForm()},"discard:submission"(){c.request(`form${this.form.id}`,"clear:storedSubmission"),this.showForm(),this.showFormActions()}});return}this.showForm()},showForm(){this.showChildView("form",new E({model:this.form,responseId:this.getState("responseId")}))},showSidebar(){const e=this.getState("isActionSidebar"),t=this.getState("isExpanded");if((!e||t)&&c.request("sidebar","close"),t){this.stopChildApp("patient"),this.getRegion("sidebar").empty();return}e&&this.showActionSidebar(),this.startChildApp("patient")},showActionSidebar(){const e=c.request("sidebar","start","action",{action:this.action,isShowingForm:!0});this.listenTo(e,"stop",()=>{this.getState("isExpanded")||this.setState("isActionSidebar",!1)})},showFormActions(){if(this.showFormStatus(),this.getState("shouldShowHistory")){this.showFormHistory();return}if(this.isReadOnly){this.showReadOnly();return}if(this.isLocked){this.showLockedSubmit();return}if(this.getState("responseId")){this.showFormUpdate();return}this.showFormSaveDisabled()},showReadOnly(){this.showChildView("formAction",new R)},showLockedSubmit(){this.showChildView("formAction",new W)},showFormStatus(){this.responses.getFirstSubmission()&&this.showChildView("status",new D({model:this.responses.getFirstSubmission()}))},showFormHistory(){const e=this.responses.get(this.getState("responseId")),t=this.showChildView("formAction",new J({selected:e,collection:this.responses.filterSubmissions()}));this.listenTo(t,{"change:response"(a){this.setState({responseId:a.id})},"click:current"(){this.setState({responseId:k(this.responses.getFirstSubmission(),"id"),shouldShowHistory:!1})}})},showFormUpdate(){const e=this.showChildView("formAction",new Y);this.listenTo(e,"click",()=>{this.setState({responseId:null})})},showLastUpdated(e){const t=new H({updated:e});this.showChildView("formUpdated",t)},showFormSaveDisabled(){if(this.isSubmitHidden){this.getRegion("formAction").empty();return}this.showChildView("formAction",new S({isDisabled:!0,model:this.getState()}))},showFormSave(){if(this.isSubmitHidden)return;const e=this.showChildView("formAction",new S({model:this.getState()}));this.listenTo(e,{"click:save"(){c.request(`form${this.form.id}`,"send","form:submit"),this.showFormSaveDisabled()},"select:button:type"(t){this.setState({saveButtonType:t})}})}}),Q=y.extend({childApps:{patient:{AppClass:F,regionName:"sidebar",getOptions:["patient"]},widgetHeader:{AppClass:P,regionName:"widgets",getOptions:["patient","form"]}},initFormState(){const e=b.get(`form-state_${this.currentUser.id}`);this.setState(T({isExpanded:!0,saveButtonType:"save"},e))},onBeforeStart(){this.getRegion().startPreloader(),this.currentUser=c.request("bootstrap","currentUser"),this.initFormState()},beforeStart({formId:e,patientId:t}){return[c.request("entities","fetch:patients:model",t),c.request("entities","fetch:forms:model",e),c.request("entities","fetch:formResponses:latest",{patient:t,form:e,status:C.ANY,editor:this.currentUser.id})]},onBeforeStop(){this.removeChildApp("formsService")},onStart(e,t,a,m){this.patient=t,this.form=a,this.latestResponse=m,this.isReadOnly=this.form.isReadOnly(),this.isSubmitHidden=this.form.isSubmitHidden(),this.startFormService(),this.setView(new B({model:this.form,patient:t})),this.startChildApp("widgetHeader"),this.showStateActions(),this.showFormActions(),this.showSidebar(),this.showContent(),this.showView()},startFormService(){const e=this.addChildApp("formsService",A,{patient:this.patient,form:this.form,latestResponse:this.latestResponse});this.isReadOnly||this.bindEvents(e,this.serviceEvents)},serviceEvents:{submit:"onFormServiceSubmit",success:"onFormServiceSuccess",error:"onFormServiceError",ready:"onFormServiceReady","update:submission":"onFormServiceUpdateSubmission"},shouldSaveAndGoBack(){return this.getState("saveButtonType")==="saveAndGoBack"&&!this.isSubmitHidden},onFormServiceSubmit(){this.shouldSaveAndGoBack()&&(this.loadingModal=c.request("modal","show:loading"))},onFormServiceSuccess(e){if(this.shouldSaveAndGoBack()){this.listenTo(this.loadingModal,"destroy",()=>{c.request("history","go:back",()=>{c.trigger("event-router","patient:dashboard",this.patient.id)})});return}this.showForm(e.id),this.showChildView("status",new D({model:e})),this.showFormActions()},onFormServiceError(){this.loadingModal&&this.loadingModal.destroy(),this.showFormSave()},onFormServiceReady(){this.showFormSave()},onFormServiceUpdateSubmission(e){this.showLastUpdated(e)},stateEvents:{change:"onChangeState","change:isExpanded":"showSidebar"},onChangeState(e){b.set(`form-state_${this.currentUser.id}`,e.pick("isExpanded","saveButtonType"))},showStateActions(){const e=new O({model:this.getState(),patient:this.patient});this.listenTo(e,{"click:expandButton":this.onClickExpandButton}),this.showChildView("stateActions",e)},onClickExpandButton(){this.toggleState("isExpanded")},showContent(){if(this.isReadOnly){this.showForm();return}const{updated:e}=c.request(`form${this.form.id}`,"get:storedSubmission");if(e){const t=this.showChildView("form",new M({updated:e}));this.listenTo(t,{submit(){this.showForm()},"discard:submission"(){c.request(`form${this.form.id}`,"clear:storedSubmission"),this.showForm(),this.showFormActions()}});return}this.showForm()},showForm(e){this.showChildView("form",new E({model:this.form,responseId:e}))},showSidebar(){if(this.getState("isExpanded")){this.stopChildApp("patient"),this.getRegion("sidebar").empty();return}this.startChildApp("patient")},showFormActions(){if(this.isReadOnly){this.showReadOnly();return}this.showFormSaveDisabled()},showReadOnly(){this.showChildView("formAction",new R)},showLastUpdated(e){const t=new H({updated:e});this.showChildView("formUpdated",t)},showFormSaveDisabled(){this.isSubmitHidden||this.showChildView("formAction",new S({isDisabled:!0,model:this.getState()}))},showFormSave(){if(this.isSubmitHidden)return;const e=this.showChildView("formAction",new S({model:this.getState()}));this.listenTo(e,{"click:save"(){c.request(`form${this.form.id}`,"send","form:submit"),this.showFormSaveDisabled()},"select:button:type"(t){this.setState({saveButtonType:t})}})}}),X=y.extend({beforeStart({formId:e}){return c.request("entities","fetch:forms:model",e)},onBeforeStop(){this.removeChildApp("formsService")},onStart(e,t){this.addChildApp("formsService",A,{form:t}),this.showView(new $({model:t}))}}),mt=j.extend({routerAppName:"FormsApp",childApps:{form:K,formPreview:X,patientForm:Q},eventRoutes:{"form:patient":{action:"showFormPatient",route:"patient/:id/form/:id"},"form:patientAction":{action:"showFormAction",route:"patient-action/:id/form/:id"},"form:preview":{action:"showFormPreview",route:"form/:id/preview"}},showFormAction(e,t){this.startCurrent("form",{formId:t,patientActionId:e})},showFormPatient(e,t){this.startCurrent("patientForm",{formId:t,patientId:e})},showFormPreview(e){this.startCurrent("formPreview",{formId:e})}});export{mt as default};
