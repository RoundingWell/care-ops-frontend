import{R as l}from"./20241024-iframe-form-Dml6VBih.js";import{L as c,S as u,A as d,C as p,T as w,a as S,F as g,b as f,P as m}from"./20241024-schedule_views-CqVXojAD.js";import{B as C,R as s}from"./20241024-runtime-idANKiI7.js";import{A as n}from"./20241024-app-D9E0QBuW.js";import{A as y,r as F,e as o}from"./20241024-index-BwuohFuR.js";import{s as r}from"./20241024-app-CKAzfl9d.js";import{N as a}from"./20241024-workspaces-CDJCnif6.js";import{S as V}from"./20241024-build-matchers-array-M9300dG9.js";import"./20241024-parsePhoneNumber-BAdgtXgI.js";import"./20241024-index-BcJP4SNp.js";import"./20241024-list-pages-5wHe1IHd.js";import"./20241024-app-frame_app-B2prRxK9.js";import"./20241024-prelogin_views-D5QXShTl.js";/* empty css                        */import"./20241024-sidebar_app-LOp0p6U1.js";const A="v6",R=C.Model.extend({defaults(){return{isReduced:!0,searchQuery:""}},getFiltersState(){return{customFilters:this.get("customFilters"),states:this.get("states"),flowStates:this.get("flowStates"),listType:"actions"}},preinitialize(){this.currentClinician=s.request("bootstrap","currentUser"),this.currentWorkspace=s.request("workspace","current")},initialize(){this.on("change",this.onChange),this.listenTo(s.channel("event-router"),"unknownError",this.removeStore)},getStoreKey(){return`reduced-schedule_${this.currentClinician.id}_${this.currentWorkspace.id}-${A}`},getStore(){return r.get(this.getStoreKey())},removeStore(){r.remove(this.getStoreKey())},onChange(){r.set(this.getStoreKey(),y(this.attributes,"filtersCount","searchQuery"))},setSearchQuery(t=""){return this.set({searchQuery:t.length>2?t:"",lastSelectedIndex:null})},getEntityStatesFilter(){return{state:this.get("states").join()||a,"flow.state":this.get("flowStates").join()||a}},getOwner(){return this.currentClinician},getEntityCustomFilter(){const t=this.get("customFilters");return F(t,(e,i,h)=>(i!==null&&(e[`@${h}`]=i),e),{})},getEntityFilter(){const t={clinician:this.currentClinician.id};return o(t,this.getEntityStatesFilter()),o(t,this.getEntityCustomFilter()),t}}),T=n.extend({StateModel:g}),b=n.extend({StateModel:R,childApps:{filters:{AppClass:T,restartWithParent:!1}},stateEvents:{"change:customFilters change:states change:flowStates":"restart","change:searchQuery":"onChangeSearchQuery"},startFiltersApp({setDefaults:t}={}){const e=this.startChildApp("filters",{state:this.getState().getFiltersState()}),i=e.getState();e.listenTo(i,"change",()=>{this.setState(i.getFiltersState())}),t&&i.setDefaultFilterStates(),this.setState(i.getFiltersState())},onChangeSearchQuery(t){this.currentSearchQuery=t.get("searchQuery")},initListState(){const t=this.getState().getStore();if(this.getState().setSearchQuery(this.currentSearchQuery),t){this.setState(t),this.startFiltersApp();return}const e=s.request("bootstrap","currentUser");this.setState({id:`reduced-schedule_${e.id}`}),this.startFiltersApp({setDefaults:!0})},onBeforeStart(){if(this.isRestarting()){this.getRegion("count").empty(),this.getRegion("list").startPreloader();return}this.initListState(),this.setView(new c({isReduced:this.getState("isReduced")})),this.showSearchView(),this.showTableHeaders(),this.showScheduleTitle(),this.showFiltersButtonView(),this.getRegion("list").startPreloader(),this.showView()},onBeforeStop(){this.collection=null,this.isRestarting()||this.stopChildApp("filters")},beforeStart(){const t=this.getState().getEntityFilter();return s.request("entities","fetch:actions:collection",{data:{filter:t}})},onStart(t,e){this.collection=e,this.filteredCollection=e.clone(),this.listenTo(this.filteredCollection,"reset",this.showCountView),this.showCountView(),this.showList()},showList(){const t=new u({collection:this.collection.groupByDate(),state:this.getState()});this.listenTo(t,"filtered",e=>{this.filteredCollection.reset(e)}),this.showChildView("list",t)},showFiltersButtonView(){const e=this.getChildApp("filters").getState(),i=new d({model:e});this.listenTo(i,"click",()=>{s.request("sidebar","start","filters",{filtersState:e})}),this.showChildView("filters",i)},showCountView(){const t=new p({collection:this.collection,filteredCollection:this.filteredCollection});this.showChildView("count",t)},showTableHeaders(){const t=new w;this.showChildView("table",t)},showScheduleTitle(){this.showChildView("title",new S({model:this.getState()}))},showSearchView(){const t=new V({state:{query:this.getState("searchQuery")}});this.listenTo(t.getState(),"change:query",(e,i)=>{this.getState().setSearchQuery(i)}),this.showChildView("search",t)}}),I=l.extend({routerAppName:"PatientsApp",childApps(){return{flow:f,patient:m,schedule:b}},eventRoutes:{schedule:{action:"showSchedule",route:"schedule",isList:!0},"patient:dashboard":{action:"showPatient",route:"patient/dashboard/:id"},"patient:archive":{action:"showPatient",route:"patient/archive/:id"},"patient:action":{action:"showPatient",route:"patient/:id/action/:id"},flow:{action:"showFlow",route:"flow/:id"},"flow:action":{action:"showFlow",route:"flow/:id/action/:id"}},showPatient(t){this.startRoute("patient",{patientId:t})},showFlow(t){this.startRoute("flow",{flowId:t})},showSchedule(){this.startCurrent("schedule")}});export{I as default};