import{V as k,_ as g,B as P,R as h}from"./20241024-runtime-idANKiI7.js";import{A as x}from"./20241024-app-D9E0QBuW.js";import{b as f}from"./20241024-index-BwuohFuR.js";import{d as v}from"./20241024-workspaces-CDJCnif6.js";import{i as S}from"./20241024-index-BcJP4SNp.js";import{P as _}from"./20241024-prelogin_views-D5QXShTl.js";import{O as y}from"./20241024-app-CKAzfl9d.js";import{n as V}from"./20241024-app-frame_app-B2prRxK9.js";const o=S.patients.patient.sidebar.sidebarViews,C=k.extend({tagName:"h1",className:"patient-sidebar__name",template:g.template({compiler:[8,">= 4.3.0"],main:function(t,e,s,m,u){var i,n=e??(t.nullContext||{}),r=t.hooks.helperMissing,l="function",c=t.escapeExpression,a=t.lookupProperty||function(d,p){if(Object.prototype.hasOwnProperty.call(d,p))return d[p]};return c((i=(i=a(s,"first_name")||(e!=null?a(e,"first_name"):e))!=null?i:r,typeof i===l?i.call(n,{name:"first_name",hash:{},data:u,loc:{start:{line:1,column:0},end:{line:1,column:16}}}):i))+" "+c((i=(i=a(s,"last_name")||(e!=null?a(e,"last_name"):e))!=null?i:r,typeof i===l?i.call(n,{name:"last_name",hash:{},data:u,loc:{start:{line:1,column:17},end:{line:1,column:32}}}):i))},useData:!0}),modelEvents:{change:"render"}}),b=k.extend({className:"patient-sidebar flex-region",template:g.template({compiler:[8,">= 4.3.0"],main:function(t,e,s,m,u){var i=e??(t.nullContext||{}),n=t.hooks.helperMissing,r=t.escapeExpression,l=t.lookupProperty||function(c,a){if(Object.prototype.hasOwnProperty.call(c,a))return c[a]};return`
    <div data-name-region></div>
    <span class="patient-sidebar__icon">`+r((l(s,"far")||e&&l(e,"far")||n).call(i,"address-card",{name:"far",hash:{},data:u,loc:{start:{line:3,column:40},end:{line:3,column:62}}}))+`</span>
    <button class="button--icon patient-sidebar__menu js-menu">`+r((l(s,"far")||e&&l(e,"far")||n).call(i,"ellipsis",{name:"far",hash:{},data:u,loc:{start:{line:4,column:63},end:{line:4,column:81}}}))+`</button>
    <div class="patient-sidebar__widgets" data-widgets-region></div>
  `},useData:!0}),regions:{name:"[data-name-region]",widgets:{el:"[data-widgets-region]",regionClass:_}},onRender(){this.showChildView("name",new C({model:this.model})),this.showChildView("widgets",new V({model:this.model,collection:this.collection,itemClassName:"patient-sidebar__section"}))},triggers:{"click @ui.menu":"click:menu"},ui:{menu:".js-menu"},onClickMenu(){const t=this.model.getWorkspacePatient(),e=t.get("status"),s=this.model.canEdit(),m=new P.Collection([{text:s?o.menuOptions.edit:o.menuOptions.view,onSelect:f(this.triggerMethod,this,s?"click:patientEdit":"click:patientView")}]);t.canEdit()&&(m.push({text:e!==v.ACTIVE?o.menuOptions.activate:o.menuOptions.inactivate,onSelect:f(this.triggerMethod,this,"click:activeStatus")}),e!==v.ARCHIVED&&m.push({text:o.menuOptions.archive,onSelect:()=>{this.showConfirmArchiveModal()}})),new y({ui:this.ui.menu,uiView:this,headingText:o.menuOptions.headingText,itemTemplate:g.template({compiler:[8,">= 4.3.0"],main:function(i,n,r,l,c){var a,d=i.lookupProperty||function(p,w){if(Object.prototype.hasOwnProperty.call(p,w))return p[w]};return i.escapeExpression((a=(a=d(r,"text")||(n!=null?d(n,"text"):n))!=null?a:i.hooks.helperMissing,typeof a=="function"?a.call(n??(i.nullContext||{}),{name:"text",hash:{},data:c,loc:{start:{line:1,column:0},end:{line:1,column:10}}}):a))},useData:!0}),lists:[{collection:m}],align:"right",popWidth:248}).show()},showConfirmArchiveModal(){const t=h.request("modal","show:small",{bodyText:o.archiveModal.bodyText,headingText:o.archiveModal.headingText,submitText:o.archiveModal.submitText,buttonClass:"button--red",onSubmit:()=>{t.destroy(),this.triggerMethod("click:archivedStatus")}})}}),D=x.extend({viewEvents:{"click:patientEdit":"showPatientModal","click:patientView":"showPatientModal","click:activeStatus":"toggleActiveStatus","click:archivedStatus":"archivePatient"},onBeforeStart({patient:t}){this.showView(new b({model:t})),this.widgets=h.request("widgets","sidebarWidgets"),this.getRegion("widgets").startPreloader()},beforeStart({patient:t}){const e=h.request("entities","fetch:workspacePatients:byPatient",t.id),s=this.widgets.invoke("fetchValues",t.id);return[e,...s]},onStart({patient:t}){this.patient=t,this.showView(new b({model:this.patient,collection:this.widgets}))},showPatientModal(){h.request("nav","patient",this.patient)},toggleActiveStatus(){this.patient.toggleActiveStatus()},archivePatient(){this.patient.setArchivedStatus()}});export{D as P};
