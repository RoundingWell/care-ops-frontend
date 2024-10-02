import{R as g}from"./20241002-iframe-form-B0GJWBFK.js";import{V as u,_ as m,R as c,C as x}from"./20241002-runtime-DV0Vx7LL.js";import{A as f}from"./20241002-app-BwOh0q31.js";import{P as w}from"./20241002-prelogin_views-Kga4nRI4.js";import{i as _}from"./20241002-index-CfUvApOY.js";import"./20241002-index-DH9Qm3f-.js";import"./20241002-parsePhoneNumber-CJFNDRtb.js";/* empty css                        */const k=u.extend({template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){var e,l=t.lookupProperty||function(o,s){if(Object.prototype.hasOwnProperty.call(o,s))return o[s]};return`
    <td class="table-list__cell w-100">`+t.escapeExpression((e=(e=l(i,"name")||(a!=null?l(a,"name"):a))!=null?e:t.hooks.helperMissing,typeof e=="function"?e.call(a??(t.nullContext||{}),{name:"name",hash:{},data:r,loc:{start:{line:2,column:39},end:{line:2,column:49}}}):e))+`</td>
  `},useData:!0}),className:"table-list__item",tagName:"tr",triggers:{click:"click"},onClick(){c.trigger("event-router","dashboard",this.model.id)}}),v=u.extend({tagName:"tr",template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){var e,l=t.lookupProperty||function(o,s){if(Object.prototype.hasOwnProperty.call(o,s))return o[s]};return`
    <td class="table-empty-list">
      <h2>`+t.escapeExpression(t.lambda((e=(e=(e=r&&l(r,"intl"))&&l(e,"dashboards"))&&l(e,"dashboardsAllViews"))&&l(e,"emptyView"),a))+`</h2>
    </td>
  `},useData:!0})}),y=x.extend({childView:k,className:"table-list",tagName:"table",emptyView:v}),V=u.extend({className:"flex-region",template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){var e,l=t.escapeExpression,o=t.lambda,s=t.lookupProperty||function(d,n){if(Object.prototype.hasOwnProperty.call(d,n))return d[n]};return`
  <div class="list-page__header">
    <div class="flex list-page__title">
      <div class="flex list-page__title-filter">
        <span class="list-page__title-icon">`+l((s(i,"far")||a&&s(a,"far")||t.hooks.helperMissing).call(a??(t.nullContext||{}),"gauge",{name:"far",hash:{},data:r,loc:{start:{line:5,column:44},end:{line:5,column:59}}}))+"</span>"+l(o((e=(e=(e=(e=r&&s(r,"intl"))&&s(e,"dashboards"))&&s(e,"dashboardsAllViews"))&&s(e,"layoutView"))&&s(e,"title"),a))+`
      </div>
    </div>
  </div>
  <div class="flex-region list-page__list">
    <table class="w-100"><tr>
      <td class="table-list__header w-100">`+l(o((e=(e=(e=(e=r&&s(r,"intl"))&&s(e,"dashboards"))&&s(e,"dashboardsAllViews"))&&s(e,"layoutView"))&&s(e,"nameHeader"),a))+`</td>
    </tr></table>
    <div class="flex-region" data-list-region></div>
  </div>
  `},useData:!0}),regions:{list:{el:"[data-list-region]",regionClass:w}}}),P=f.extend({onBeforeStart(){this.showView(new V),this.getRegion("list").startPreloader()},beforeStart(){return c.request("entities","fetch:dashboards:collection")},onStart(t,a){this.programs=a,this.showChildView("list",new y({collection:a}))}}),A=u.extend({className:"dashboard__context-trail",template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){var e,l,o=a??(t.nullContext||{}),s=t.hooks.helperMissing,d=t.escapeExpression,n=t.lookupProperty||function(h,b){if(Object.prototype.hasOwnProperty.call(h,b))return h[b]};return`
    <a class="js-back dashboard__context-link">
      `+d((n(i,"fas")||a&&n(a,"fas")||s).call(o,"chevron-left",{name:"fas",hash:{},data:r,loc:{start:{line:3,column:6},end:{line:3,column:28}}}))+d(t.lambda((e=(e=(e=(e=r&&n(r,"intl"))&&n(e,"dashboards"))&&n(e,"dashboardViews"))&&n(e,"contextTrailView"))&&n(e,"contextBackBtn"),a))+`
    </a>
    `+d((n(i,"fas")||a&&n(a,"fas")||s).call(o,"chevron-right",{name:"fas",hash:{},data:r,loc:{start:{line:5,column:4},end:{line:5,column:27}}}))+d((l=(l=n(i,"name")||(a!=null?n(a,"name"):a))!=null?l:s,typeof l=="function"?l.call(o,{name:"name",hash:{},data:r,loc:{start:{line:5,column:27},end:{line:5,column:37}}}):l))+`
  `},useData:!0}),triggers:{"click .js-back":"click:back"},onClickBack(){c.trigger("event-router","dashboards:all")}}),C=u.extend({className:"flex-grow",template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){var e,l=t.lookupProperty||function(o,s){if(Object.prototype.hasOwnProperty.call(o,s))return o[s]};return'<iframe src="'+t.escapeExpression((e=(e=l(i,"embed_url")||(a!=null?l(a,"embed_url"):a))!=null?e:t.hooks.helperMissing,typeof e=="function"?e.call(a??(t.nullContext||{}),{name:"embed_url",hash:{},data:r,loc:{start:{line:1,column:13},end:{line:1,column:28}}}):e))+'"></iframe>'},useData:!0})}),D=u.extend({className:"dashboard__frame",template:m.template({compiler:[8,">= 4.3.0"],main:function(t,a,i,p,r){return`
  <div class="dashboard__layout">
    <div data-context-trail-region></div>
    <div class="dashboard__iframe flex" data-dashboard-region></div>
  </div>
  `},useData:!0}),regions:{contextTrail:{el:"[data-context-trail-region]",replaceElement:!0},dashboard:{el:"[data-dashboard-region]",regionClass:w}}}),O=f.extend({onBeforeStart(){this.showView(new D),this.getRegion("dashboard").startPreloader()},beforeStart({dashboardId:t}){return c.request("entities","fetch:dashboards:model",t)},onStart(t,a){this.showChildView("contextTrail",new A({model:a})),this.showChildView("dashboard",new C({model:a}))},onFail(){c.request("alert","show:error",_.dashboards.dashboardApp.notFound),c.trigger("event-router","dashboards:all"),this.stop()}}),T=g.extend({routerAppName:"DashboardsApp",childApps:{dashboardsAll:P,dashboard:O},eventRoutes:{"dashboards:all":{action:"showDashboardsAll",route:"dashboards",isList:!0},dashboard:{action:"showDashboard",route:"dashboards/:id"}},showDashboardsAll(){this.startCurrent("dashboardsAll")},showDashboard(t){this.startCurrent("dashboard",{dashboardId:t})}});export{T as default};
