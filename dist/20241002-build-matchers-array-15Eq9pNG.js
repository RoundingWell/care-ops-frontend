import{_ as f,V as g,B as y}from"./20241002-runtime-DV0Vx7LL.js";import{C as d,w as C}from"./20241002-app-BwOh0q31.js";import"./20241002-iframe-form-B0GJWBFK.js";import{I as w}from"./20241002-app-DZyJ4C4l.js";import{m as h}from"./20241002-index-DH9Qm3f-.js";const q=f.template({1:function(e,a,t,m,l){return"is-hidden"},compiler:[8,">= 4.3.0"],main:function(e,a,t,m,l){var s,r,i=a??(e.nullContext||{}),c=e.hooks.helperMissing,o=e.escapeExpression,n=e.lookupProperty||function(u,p){if(Object.prototype.hasOwnProperty.call(u,p))return u[p]};return`
  <span class="list-search__search-icon">`+o((n(t,"far")||a&&n(a,"far")||c).call(i,"magnifying-glass",{name:"far",hash:{},data:l,loc:{start:{line:2,column:41},end:{line:2,column:67}}}))+`</span>
  <input
    class="list-search__input input-primary--small js-input w-100"
    type="text"
    placeholder="`+o(e.lambda((s=(s=(s=(s=(s=l&&n(l,"intl"))&&n(s,"shared"))&&n(s,"components"))&&n(s,"listSearch"))&&n(s,"listSearchViews"))&&n(s,"placeholder"),a))+`"
    value="`+o((r=(r=n(t,"query")||(a!=null?n(a,"query"):a))!=null?r:c,typeof r=="function"?r.call(i,{name:"query",hash:{},data:l,loc:{start:{line:7,column:11},end:{line:7,column:20}}}):r))+`"
  />
  <span class="list-search__clear-icon js-clear `+((s=n(t,"unless").call(i,a!=null?n(a,"query"):a,{name:"unless",hash:{},fn:e.program(1,l,0),inverse:e.noop,data:l,loc:{start:{line:9,column:48},end:{line:9,column:85}}}))!=null?s:"")+'">'+o((n(t,"fas")||a&&n(a,"fas")||c).call(i,"circle-xmark",{name:"fas",hash:{},data:l,loc:{start:{line:9,column:87},end:{line:9,column:109}}}))+`</span>
`},useData:!0}),_=g.extend({behaviors:{InputWatcherBehavior:w},className(){return this.getOption("state").query.length>2?"list-search__container is-applied":"list-search__container"},template:q,templateContext(){return{query:this.getOption("state").query}},ui:{input:".js-input",clear:".js-clear"},triggers:{"click @ui.clear":"clear"},onWatchChange(e){this.ui.clear.toggleClass("is-hidden",!e.length),this.$el.toggleClass("is-applied",e.length>2)},onClear(){this.ui.input.val(""),this.ui.clear.addClass("is-hidden"),this.$el.removeClass("is-applied")}}),x=y.Model.extend({defaults:{query:""}}),j=d.extend({StateModel:x,ViewClass:_,viewEvents:{"watch:change":"onViewWatchChange",clear:"onViewClear"},onViewClear(){this.setState("query","")},onViewWatchChange(e){this.setState("query",e)}}),W=e=>{const a=h(C(e),RegExp.escape);return h(a,function(t){return new RegExp(`\\b${t}`,"i")})};export{j as S,W as b};
