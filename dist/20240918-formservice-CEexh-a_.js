import{A as a}from"./20240918-app-Duwp84BN.js";import{R as s,B as p}from"./20240918-runtime-BkM71ZHJ.js";import{F as f}from"./20240918-workspaces-DiI15HKp.js";import"./20240918-index-QvW7sH4o.js";import"./20240918-parsePhoneNumber-ixnq_7K_.js";const m=a.extend({beforeStart({actionId:t}){return[s.request("entities","fetch:forms:byAction",t),s.request("entities","fetch:forms:definition:byAction",t),s.request("entities","fetch:forms:data",t),s.request("entities","fetch:actions:model",t)]},onStart(t,e,r,i,o){const c=this._getPrefillFilters(e,o);return Promise.resolve(s.request("entities","fetch:formResponses:latest",c)).then(n=>{parent.postMessage({message:"form:pdf",args:{definition:r,formData:i.attributes,responseData:n.getFormData(),formSubmission:n.getResponse(),contextScripts:e.getContextScripts(),loaderReducers:e.getLoaderReducers()}},window.origin)})},_getPrefillFilters(t,e){const r={status:f.SUBMITTED,flow:e.get("_flow"),patient:e.get("_patient")};t.isReport()&&(r.submitted=`<=${e.get("created_at")}`);const o=t.getPrefillActionTag();return o?(r["action.tags"]=o,r):(r.action=e.id,r)}}),u=a.extend({beforeStart({formId:t,patientId:e,responseId:r}){return[s.request("entities","fetch:forms:model",t),s.request("entities","fetch:forms:definition",t),s.request("entities","fetch:forms:data",null,e,t),s.request("entities","fetch:formResponses:model",r)]},onStart(t,e,r,i,o){parent.postMessage({message:"form:pdf",args:{definition:r,formData:i.attributes,responseData:o.getFormData(),formSubmission:o.getResponse(),contextScripts:e.getContextScripts(),loaderReducers:e.getLoaderReducers()}},window.origin)}}),d=p.Router.extend({routes:{"formservice/action/:actionId":"startActionFormService","formservice/:formId/:patientId(/:responseId)":"startFormService"},startActionFormService(t){new m().start({actionId:t})},startFormService(t,e,r){new u().start({formId:t,patientId:e,responseId:r})}});function A(){new d,p.history.start({pushState:!0})}export{A as startFormServiceApp};
