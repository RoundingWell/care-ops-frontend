import{R as k}from"./20241010-iframe-form-C3TZjyHN.js";import{b6 as V,m as x,o as A,e as S,v as P}from"./20241010-index-BbW385wO.js";import{b as M,V as p,_ as w,R as d,C as T}from"./20241010-runtime-Ch9ZL3Ke.js";import{S as R}from"./20241010-list-pages-dafuHcH_.js";import{i as b}from"./20241010-index-BVeVz_uG.js";import{b as E,S as O}from"./20241010-build-matchers-array-CTiywa5I.js";import{P as j}from"./20241010-prelogin_views-DEK_feFi.js";import{g as D,h as _,i as C,W as L}from"./20241010-app-frame_app-BVo4HqoL.js";import{t as Q,m as q}from"./20241010-app-BCN0tauN.js";import{c as F}from"./20241010-app-CoUaKxH7.js";import"./20241010-parsePhoneNumber-CS_7G5tE.js";/* empty css                        */import"./20241010-workspaces-DTa7yKL1.js";const I=M.extend({modelEvents:{editing:"onEditing",change:"onChange"},onChange(){this.view.render()},onEditing(l){this.$el.toggleClass("is-selected",l)}}),W=p.extend({tagName:"tr",template:w.template({compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n=l.lookupProperty||function(r,a){if(Object.prototype.hasOwnProperty.call(r,a))return r[a]};return`
    <td class="table-empty-list">
      <h2>`+l.escapeExpression(l.lambda((e=(e=(e=t&&n(t,"intl"))&&n(e,"clinicians"))&&n(e,"cliniciansAllViews"))&&n(e,"emptyView"),i))+`</h2>
    </td>
  `},useData:!0})}),N=p.extend({tagName:"tr",template:w.template({compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n=l.lookupProperty||function(r,a){if(Object.prototype.hasOwnProperty.call(r,a))return r[a]};return`
    <td class="table-empty-list">
      <h2>`+l.escapeExpression(l.lambda((e=(e=(e=(e=t&&n(t,"intl"))&&n(e,"clinicians"))&&n(e,"cliniciansAllViews"))&&n(e,"emptyFindInListView"))&&n(e,"noResults"),i))+`</h2>
    </td>
  `},useData:!0})}),B=p.extend({modelEvents:{"change:enabled":"render"},className:"table-list__item",behaviors:[I],tagName:"tr",regions:{team:"[data-team-region]",role:"[data-role-region]",state:"[data-state-region]"},triggers:{click:"click"},template:w.template({1:function(l,i,s,m,t){var e,n=l.lookupProperty||function(r,a){if(Object.prototype.hasOwnProperty.call(r,a))return r[a]};return l.escapeExpression(l.lambda((e=(e=(e=(e=t&&n(t,"intl"))&&n(e,"clinicians"))&&n(e,"cliniciansAllViews"))&&n(e,"itemView"))&&n(e,"newClinician"),i))},3:function(l,i,s,m,t){return"table-list__cell--empty"},5:function(l,i,s,m,t){var e,n=l.lookupProperty||function(r,a){if(Object.prototype.hasOwnProperty.call(r,a))return r[a]};return((e=n(s,"unless").call(i??(l.nullContext||{}),t&&n(t,"first"),{name:"unless",hash:{},fn:l.program(6,t,0),inverse:l.noop,data:t,loc:{start:{line:3,column:115},end:{line:3,column:146}}}))!=null?e:"")+l.escapeExpression(l.lambda(i!=null?n(i,"name"):i,i))},6:function(l,i,s,m,t){return", "},8:function(l,i,s,m,t){var e,n=l.lookupProperty||function(r,a){if(Object.prototype.hasOwnProperty.call(r,a))return r[a]};return l.escapeExpression(l.lambda((e=(e=(e=(e=t&&n(t,"intl"))&&n(e,"clinicians"))&&n(e,"cliniciansAllViews"))&&n(e,"itemView"))&&n(e,"noWorkspaces"),i))},compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n,r=i??(l.nullContext||{}),a=l.hooks.helperMissing,u="function",o=l.escapeExpression,c=l.lookupProperty||function(h,g){if(Object.prototype.hasOwnProperty.call(h,g))return h[g]};return`
    <td class="table-list__cell w-20">`+((e=c(s,"unless").call(r,i!=null?c(i,"name"):i,{name:"unless",hash:{},fn:l.program(1,t,0),inverse:l.noop,data:t,loc:{start:{line:2,column:38},end:{line:2,column:128}}}))!=null?e:"")+o((n=(n=c(s,"name")||(i!=null?c(i,"name"):i))!=null?n:a,typeof n===u?n.call(r,{name:"name",hash:{},data:t,loc:{start:{line:2,column:128},end:{line:2,column:138}}}):n))+`&#8203;</td>
    <td class="table-list__cell w-30 `+((e=c(s,"unless").call(r,i!=null?c(i,"workspaces"):i,{name:"unless",hash:{},fn:l.program(3,t,0),inverse:l.noop,data:t,loc:{start:{line:3,column:37},end:{line:3,column:93}}}))!=null?e:"")+'">'+((e=c(s,"each").call(r,i!=null?c(i,"workspaces"):i,{name:"each",hash:{},fn:l.program(5,t,0),inverse:l.noop,data:t,loc:{start:{line:3,column:95},end:{line:3,column:170}}}))!=null?e:"")+((e=c(s,"unless").call(r,i!=null?c(i,"workspaces"):i,{name:"unless",hash:{},fn:l.program(8,t,0),inverse:l.noop,data:t,loc:{start:{line:3,column:170},end:{line:3,column:266}}}))!=null?e:"")+`&#8203;</td>
    <td class="table-list__cell w-30">
      <span class="u-margin--r-8" data-state-region></span>&#8203;`+o((n=(n=c(s,"remove_whitespace")||(i!=null?c(i,"remove_whitespace"):i))!=null?n:a,typeof n===u?n.call(r,{name:"remove_whitespace",hash:{},data:t,loc:{start:{line:5,column:66},end:{line:5,column:91}}}):n))+'<span class="u-margin--r-8" data-role-region></span>&#8203;'+o((n=(n=c(s,"remove_whitespace")||(i!=null?c(i,"remove_whitespace"):i))!=null?n:a,typeof n===u?n.call(r,{name:"remove_whitespace",hash:{},data:t,loc:{start:{line:6,column:65},end:{line:6,column:90}}}):n))+"<span data-team-region></span>&#8203;"+o((n=(n=c(s,"remove_whitespace")||(i!=null?c(i,"remove_whitespace"):i))!=null?n:a,typeof n===u?n.call(r,{name:"remove_whitespace",hash:{},data:t,loc:{start:{line:7,column:43},end:{line:7,column:68}}}):n))+`</td>
    <td class="table-list__cell w-20 `+((e=c(s,"unless").call(r,i!=null?c(i,"last_active_at"):i,{name:"unless",hash:{},fn:l.program(3,t,0),inverse:l.noop,data:t,loc:{start:{line:9,column:37},end:{line:9,column:97}}}))!=null?e:"")+'">'+o((c(s,"formatDateTime")||i&&c(i,"formatDateTime")||a).call(r,i!=null?c(i,"last_active_at"):i,"TIME_OR_DAY",{name:"formatDateTime",hash:{defaultHtml:(c(s,"intlGet")||i&&c(i,"intlGet")||a).call(r,"clinicians.cliniciansAllViews.itemView.noLastActive",{name:"intlGet",hash:{},data:t,loc:{start:{line:9,column:157},end:{line:9,column:220}}})},data:t,loc:{start:{line:9,column:99},end:{line:9,column:222}}}))+`&#8203;</td>
  `},useData:!0}),templateContext(){return{workspaces:V(x(this.model.getWorkspaces().models,"attributes"),"name")}},onRender(){this.showTeam(),this.showRole(),this.showState()},onClick(){d.trigger("event-router","clinician",this.model.id)},showState(){const l=this.model.isActive(),i=this.model.get("enabled")?"enabled":"disabled",s=new D({isActive:l,selectedId:i,isCompact:!0});this.listenTo(s,"change:selected",m=>{this.model.save({enabled:m.id!=="disabled"})}),this.showChildView("state",s)},showRole(){const l=new _({role:this.model.getRole(),isCompact:!0,state:{isDisabled:!this.model.get("enabled")}});this.listenTo(l,"change:role",i=>{this.model.saveRole(i)}),this.showChildView("role",l)},showTeam(){const l=new C({team:this.model.getTeam(),isCompact:!0,state:{isDisabled:!this.model.get("enabled")}});this.listenTo(l,"change:team",i=>{this.model.saveTeam(i)}),this.showChildView("team",l)}}),H=p.extend({className:"flex-region",template:w.template({compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n=i??(l.nullContext||{}),r=l.hooks.helperMissing,a=l.escapeExpression,u=l.lambda,o=l.lookupProperty||function(c,h){if(Object.prototype.hasOwnProperty.call(c,h))return c[h]};return`
    <div class="list-page__header">
      <div class="flex list-page__title">
        <div class="flex list-page__title-filter">
          <span class="list-page__title-icon">`+a((o(s,"far")||i&&o(i,"far")||r).call(n,"users-gear",{name:"far",hash:{},data:t,loc:{start:{line:5,column:46},end:{line:5,column:66}}}))+"</span>"+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"title"),i))+`
        </div>
        <div class="clinicians__list-search" data-search-region></div>
      </div>
      <button class="u-margin--b-16 button-primary js-add-clinician">`+a((o(s,"far")||i&&o(i,"far")||r).call(n,"circle-plus",{name:"far",hash:{},data:t,loc:{start:{line:9,column:69},end:{line:9,column:90}}}))+"<span>"+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"addClinicianButton"),i))+`</span></button>
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-20">`+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"clinicianHeader"),i))+`</td>
        <td class="table-list__header w-30">`+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"workspacesHeader"),i))+`</td>
        <td class="table-list__header w-30">`+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"attributesHeader"),i))+`</td>
        <td class="table-list__header w-20">`+a(u((e=(e=(e=(e=t&&o(t,"intl"))&&o(e,"clinicians"))&&o(e,"cliniciansAllViews"))&&o(e,"layoutView"))&&o(e,"lastActiveHeader"),i))+`</td>
      </tr></table>
      <div class="flex-region" data-list-region></div>
    </div>
  `},useData:!0}),regions:{list:{el:"[data-list-region]",regionClass:j},sidebar:"[data-sidebar-region]",addClinician:{el:"[data-add-region]",replaceElement:!0},search:"[data-search-region]"},triggers:{"click .js-add-clinician":"click:addClinician"}}),z=T.extend({className:"table-list",tagName:"table",childView:B,emptyView(){return this.collection.length&&this.state.get("searchQuery")?N:W},collectionEvents:{"change:name":"sort"},childViewTriggers:{render:"listItem:render"},viewComparator({model:l}){return String(l.get("name")).toLowerCase()},initialize({state:l}){this.state=l,this.listenTo(l,"change:searchQuery",this.searchList)},onAttach(){this.searchList(null,this.state.get("searchQuery"))},onListItemRender(l){l.searchString=l.$el.text()},onRenderChildren(){this.triggerMethod("filtered",this.children.pluck("model"))},searchList(l,i){if(!i){this.removeFilter();return}const s=E(i);this.setFilter(function({searchString:m}){return A(s,function(t){return t.test(m)})})}}),G=w.template({compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n=l.lambda,r=l.escapeExpression,a=l.lookupProperty||function(u,o){if(Object.prototype.hasOwnProperty.call(u,o))return u[o]};return'<div class="u-margin--b-8 flex"><div class="modal__form-label">'+r(n((e=(e=(e=(e=t&&a(t,"intl"))&&a(e,"clinicians"))&&a(e,"clinicianModal"))&&a(e,"clinicianModalTemplate"))&&a(e,"name"),i))+`</div><div class="flex-grow" data-name-region></div></div>
<div class="u-margin--b-8 flex"><div class="modal__form-label">`+r(n((e=(e=(e=(e=t&&a(t,"intl"))&&a(e,"clinicians"))&&a(e,"clinicianModal"))&&a(e,"clinicianModalTemplate"))&&a(e,"email"),i))+`</div><div class="flex-grow" data-email-region></div></div>
<div class="u-margin--b-8 flex"><div class="modal__form-label">`+r(n((e=(e=(e=(e=t&&a(t,"intl"))&&a(e,"clinicians"))&&a(e,"clinicianModal"))&&a(e,"clinicianModalTemplate"))&&a(e,"role"),i))+`</div><div class="modal__form-component" data-role-region></div></div>
<div class="u-margin--b-8 flex"><div class="modal__form-label">`+r(n((e=(e=(e=(e=t&&a(t,"intl"))&&a(e,"clinicians"))&&a(e,"clinicianModal"))&&a(e,"clinicianModalTemplate"))&&a(e,"team"),i))+`</div><div class="modal__form-component" data-team-region></div></div>
<div class="u-margin--b-8 flex"><div class="modal__form-label">`+r(n((e=(e=(e=(e=t&&a(t,"intl"))&&a(e,"clinicians"))&&a(e,"clinicianModal"))&&a(e,"clinicianModalTemplate"))&&a(e,"workspaces"),i))+`</div><div class="modal__form-component list-manager__wrapper" data-workspaces-region></div></div>
`},useData:!0}),f=b.clinicians.clinicianModal.clinicianModalViews,v=p.extend({behaviors(){if(this.getOption("shouldFocus"))return[{behaviorClass:F,selector:".js-input"}]},className:"pos--relative",template:w.template({1:function(l,i,s,m,t){return"has-error"},compiler:[8,">= 4.3.0"],main:function(l,i,s,m,t){var e,n,r=i??(l.nullContext||{}),a=l.hooks.helperMissing,u="function",o=l.escapeExpression,c=l.lookupProperty||function(h,g){if(Object.prototype.hasOwnProperty.call(h,g))return h[g]};return`
    <input class="input-primary w-100 js-input `+((e=c(s,"if").call(r,i!=null?c(i,"hasError"):i,{name:"if",hash:{},fn:l.program(1,t,0),inverse:l.noop,data:t,loc:{start:{line:2,column:47},end:{line:2,column:79}}}))!=null?e:"")+'" placeholder="'+o((n=(n=c(s,"placeholder")||(i!=null?c(i,"placeholder"):i))!=null?n:a,typeof n===u?n.call(r,{name:"placeholder",hash:{},data:t,loc:{start:{line:2,column:94},end:{line:2,column:111}}}):n))+'" value="'+o((n=(n=c(s,"value")||(i!=null?c(i,"value"):i))!=null?n:a,typeof n===u?n.call(r,{name:"value",hash:{},data:t,loc:{start:{line:2,column:120},end:{line:2,column:131}}}):n))+`" />
  `},useData:!0}),templateContext(){const l=this.getOption("state").get("errors");return{hasError:l&&l[this.getOption("attr")],placeholder:this.getOption("placeholder"),value:this.model.get(this.getOption("attr"))}},ui:{input:".js-input"},events:{"input @ui.input":"onChange"},initialize({state:l}){this.listenTo(l,"change:errors",this.render)},onChange(){const l=this.ui.input.val();this.model.set(this.getOption("attr"),Q(l))},onDomRefresh(){this.getOption("shouldFocus")&&this.ui.input.focus()}}),y=p.extend({className:"modal__content",regions:{name:"[data-name-region]",email:"[data-email-region]",role:"[data-role-region]",team:"[data-team-region]",workspaces:"[data-workspaces-region]"},modelEvents:{change:"onChange"},template:G,initialize({state:l}){this.initState({state:l})},onRender(){this.showNameView(),this.showEmailView(),this.showRole(),this.showTeam(),this.showWorkspacesComponent()},showNameView(){this.showChildView("name",new v({model:this.model,state:this.getState(),attr:"name",placeholder:f.clinicianModal.name,shouldFocus:!0}))},showEmailView(){this.showChildView("email",new v({model:this.model,state:this.getState(),attr:"email",placeholder:f.clinicianModal.email}))},showRole(){const l=new _({role:this.model.getRole(),className:"modal__form-component"});this.listenTo(l,"change:role",i=>{this.model.set("_role",i.id)}),this.showChildView("role",l)},showTeam(){const l=new C({team:this.model.get("_team"),className:"modal__form-component"});this.listenTo(l,"change:team",i=>{this.model.set("_team",i.id)}),this.showChildView("team",l)},showWorkspacesComponent(){const l=this.showChildView("workspaces",new L({className:"modal__form-component",workspaces:d.request("bootstrap","workspaces"),member:this.model}));this.listenTo(l,{"add:member"(i,s){this.model.addWorkspace(s)},"remove:member"(i,s){this.model.removeWorkspace(s)}})}});q(y);function $(l){const i=l.clinician,s=new y({model:i});return S({bodyView:s,headerIcon:"users-gear"},f.clinicianModal,l)}const Y=R.extend({routerAppName:"CliniciansApp",eventRoutes:{clinician:"showClinicianSidebar"},viewEvents:{"click:addClinician":"onClickAddClinician"},stateEvents:{"change:searchQuery":"onChangSearchQuery"},onChangSearchQuery(l){this.currentSearchQuery=l.get("searchQuery")},onBeforeStart(){this.showView(new H),this.getRegion("list").startPreloader(),this.setState({searchQuery:this.currentSearchQuery}),this.showSearchView()},beforeStart(){return d.request("entities","fetch:clinicians:collection")},onStart({currentRoute:l},i){this.clinicians=i,this.showChildView("list",new z({collection:this.clinicians,state:this.getState()})),this.startRoute(l)},_getClinician(l){return l?this.clinicians.get(l):d.request("entities","clinicians:model",{enabled:!0,disabled_at:null})},showSearchView(){const l=this.showChildView("search",new O({state:{query:this.getState("searchQuery")}}));this.listenTo(l.getState(),"change:query",this.setSearchState)},setSearchState(l,i){this.setState({searchQuery:i.length>2?i:""})},showClinicianSidebar(l){const i=this._getClinician(l);if(!i){d.request("alert","show:error",b.clinicians.cliniciansAllApp.notFound),d.trigger("event-router","clinicians:all");return}d.request("sidebar","start","clinician",{clinician:i}),i.trigger("editing",!0)},onClickAddClinician(){this.showAddModal()},showAddModal(){const l=this._getClinician(),i=l.clone(),s=d.request("modal","show",$({clinician:i,onSubmit:()=>{s.disableSubmit(),l.saveAll(i.attributes).then(()=>{this.clinicians.add(l),d.trigger("event-router","clinician",l.id),s.destroy()}).catch(m=>{s.disableSubmit();const t=l.parseErrors(m.responseData);s.getChildView("body").setState({errors:t}),d.request("alert","show:error",P(t).join(", "))})}}));s.disableSubmit(),s.listenTo(i,{change(){s.disableSubmit(!i.isValid())}})}}),re=k.extend({routerAppName:"CliniciansApp",childApps:{cliniciansAll:Y},eventRoutes:{"clinicians:all":{action:"showCliniciansAll",route:"clinicians",isList:!0},clinician:{action:"showCliniciansAll",route:"clinicians/:id"},"clinician:new":{action:"showCliniciansAll",route:"clinicians/new"}},showCliniciansAll(){this.startRoute("cliniciansAll")}});export{re as default};
