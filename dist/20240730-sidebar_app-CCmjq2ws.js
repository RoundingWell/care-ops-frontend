import{b as f,m as P}from"./20240730-index-DmcS4w7Y.js";import{V as k,_ as g,B as x,R as m}from"./20240730-runtime-CZ7wsFni.js";import{A as S}from"./20240730-app-EyLzDdbB.js";import{d as v}from"./20240730-workspaces-CmHMUl5I.js";import{i as _}from"./20240730-index-Coix0r9j.js";import{P as y}from"./20240730-prelogin_views-DMGoA6Mg.js";import{O as V}from"./20240730-app-BFHCzcAv.js";import{n as C}from"./20240730-app-frame_app-e6XRxSXZ.js";const o=_.patients.patient.sidebar.sidebarViews,M=k.extend({tagName:"h1",className:"patient-sidebar__name",template:g.template({compiler:[8,">= 4.3.0"],main:function(t,e,s,c,l){var i,n=e??(t.nullContext||{}),u=t.hooks.helperMissing,r="function",d=t.escapeExpression,a=t.lookupProperty||function(p,h){if(Object.prototype.hasOwnProperty.call(p,h))return p[h]};return d((i=(i=a(s,"first_name")||(e!=null?a(e,"first_name"):e))!=null?i:u,typeof i===r?i.call(n,{name:"first_name",hash:{},data:l,loc:{start:{line:1,column:0},end:{line:1,column:16}}}):i))+" "+d((i=(i=a(s,"last_name")||(e!=null?a(e,"last_name"):e))!=null?i:u,typeof i===r?i.call(n,{name:"last_name",hash:{},data:l,loc:{start:{line:1,column:17},end:{line:1,column:32}}}):i))},useData:!0}),modelEvents:{change:"render"}}),b=k.extend({className:"patient-sidebar flex-region",template:g.template({compiler:[8,">= 4.3.0"],main:function(t,e,s,c,l){var i=e??(t.nullContext||{}),n=t.hooks.helperMissing,u=t.escapeExpression,r=t.lookupProperty||function(d,a){if(Object.prototype.hasOwnProperty.call(d,a))return d[a]};return`
    <div data-name-region></div>
    <span class="patient-sidebar__icon">`+u((r(s,"far")||e&&r(e,"far")||n).call(i,"address-card",{name:"far",hash:{},data:l,loc:{start:{line:3,column:40},end:{line:3,column:62}}}))+`</span>
    <button class="button--icon patient-sidebar__menu js-menu">`+u((r(s,"far")||e&&r(e,"far")||n).call(i,"ellipsis",{name:"far",hash:{},data:l,loc:{start:{line:4,column:63},end:{line:4,column:81}}}))+`</button>
    <div class="patient-sidebar__widgets" data-widgets-region></div>
  `},useData:!0}),regions:{name:"[data-name-region]",widgets:{el:"[data-widgets-region]",regionClass:y}},onRender(){this.showChildView("name",new M({model:this.model})),this.showChildView("widgets",new C({model:this.model,collection:this.collection,itemClassName:"patient-sidebar__section"}))},triggers:{"click @ui.menu":"click:menu"},ui:{menu:".js-menu"},onClickMenu(){const t=this.model.getWorkspacePatient(),e=t.get("status"),s=this.model.canEdit(),c=new x.Collection([{text:s?o.menuOptions.edit:o.menuOptions.view,onSelect:f(this.triggerMethod,this,s?"click:patientEdit":"click:patientView")}]);t.canEdit()&&(c.push({text:e!==v.ACTIVE?o.menuOptions.activate:o.menuOptions.inactivate,onSelect:f(this.triggerMethod,this,"click:activeStatus")}),e!==v.ARCHIVED&&c.push({text:o.menuOptions.archive,onSelect:()=>{this.showConfirmArchiveModal()}})),new V({ui:this.ui.menu,uiView:this,headingText:o.menuOptions.headingText,itemTemplate:g.template({compiler:[8,">= 4.3.0"],main:function(i,n,u,r,d){var a,p=i.lookupProperty||function(h,w){if(Object.prototype.hasOwnProperty.call(h,w))return h[w]};return i.escapeExpression((a=(a=p(u,"text")||(n!=null?p(n,"text"):n))!=null?a:i.hooks.helperMissing,typeof a=="function"?a.call(n??(i.nullContext||{}),{name:"text",hash:{},data:d,loc:{start:{line:1,column:0},end:{line:1,column:10}}}):a))},useData:!0}),lists:[{collection:c}],align:"right",popWidth:248}).show()},showConfirmArchiveModal(){const t=m.request("modal","show:small",{bodyText:o.archiveModal.bodyText,headingText:o.archiveModal.headingText,submitText:o.archiveModal.submitText,buttonClass:"button--red",onSubmit:()=>{t.destroy(),this.triggerMethod("click:archivedStatus")}})}}),D=S.extend({viewEvents:{"click:patientEdit":"showPatientModal","click:patientView":"showPatientModal","click:activeStatus":"toggleActiveStatus","click:archivedStatus":"archivePatient"},onBeforeStart({patient:t}){this.showView(new b({model:t})),this.widgets=m.request("widgets","sidebarWidgets"),this.getRegion("widgets").startPreloader()},beforeStart({patient:t}){const e=m.request("entities","fetch:workspacePatients:byPatient",t.id),s=P(m.request("widgets","sidebarWidgets:fields"),l=>m.request("entities","fetch:patientFields:model",t.id,l)),c=this.widgets.invoke("fetchValues",t.id);return[e,...s,...c]},onStart({patient:t}){this.patient=t,this.showView(new b({model:this.patient,collection:this.widgets}))},showPatientModal(){m.request("nav","patient",this.patient)},toggleActiveStatus(){this.patient.toggleActiveStatus()},archivePatient(){this.patient.setArchivedStatus()}});export{D as P};
