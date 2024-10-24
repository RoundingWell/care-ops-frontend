import{u as Rt,B as c,S as r,a as l,J as E,c as a,t as $,v as Ct,f as Mt,h as xt}from"./20241024-app-D9E0QBuW.js";import{R as o,B as Z}from"./20241024-runtime-idANKiI7.js";import{I as ee,e as _,y as v,r as te,N as Tt,H as O,O as N,P as A,Q as Pt,R as bt,m as J,B as j,S as qt,A as kt,h as se,d as St,T as Dt,U as Ut,u as It,x as Bt}from"./20241024-index-BwuohFuR.js";import{d as y}from"./20241024-parsePhoneNumber-BAdgtXgI.js";const oe="00000000-0000-0000-0000-000000000000",Ft=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;function ne(e){return typeof e=="string"&&Ft.test(e)}function Ot(e){if(!ne(e))throw TypeError("Invalid UUID");var t,s=new Uint8Array(16);return s[0]=(t=parseInt(e.slice(0,8),16))>>>24,s[1]=t>>>16&255,s[2]=t>>>8&255,s[3]=t&255,s[4]=(t=parseInt(e.slice(9,13),16))>>>8,s[5]=t&255,s[6]=(t=parseInt(e.slice(14,18),16))>>>8,s[7]=t&255,s[8]=(t=parseInt(e.slice(19,23),16))>>>8,s[9]=t&255,s[10]=(t=parseInt(e.slice(24,36),16))/1099511627776&255,s[11]=t/4294967296&255,s[12]=t>>>24&255,s[13]=t>>>16&255,s[14]=t>>>8&255,s[15]=t&255,s}function Nt(e){e=unescape(encodeURIComponent(e));for(var t=[],s=0;s<e.length;++s)t.push(e.charCodeAt(s));return t}var Yt="6ba7b810-9dad-11d1-80b4-00c04fd430c8",Lt="6ba7b811-9dad-11d1-80b4-00c04fd430c8";function Wt(e,t,s){function n(i,d,h,g){var p;if(typeof i=="string"&&(i=Nt(i)),typeof d=="string"&&(d=Ot(d)),((p=d)===null||p===void 0?void 0:p.length)!==16)throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");var u=new Uint8Array(16+i.length);if(u.set(d),u.set(i,d.length),u=s(u),u[6]=u[6]&15|t,u[8]=u[8]&63|128,h){g=g||0;for(var f=0;f<16;++f)h[g+f]=u[f];return h}return Rt(u)}try{n.name=e}catch{}return n.DNS=Yt,n.URL=Lt,n}function Vt(e,t,s,n){switch(e){case 0:return t&s^~t&n;case 1:return t^s^n;case 2:return t&s^t&n^s&n;case 3:return t^s^n}}function B(e,t){return e<<t|e>>>32-t}function Ht(e){var t=[1518500249,1859775393,2400959708,3395469782],s=[1732584193,4023233417,2562383102,271733878,3285377520];if(typeof e=="string"){var n=unescape(encodeURIComponent(e));e=[];for(var i=0;i<n.length;++i)e.push(n.charCodeAt(i))}else Array.isArray(e)||(e=Array.prototype.slice.call(e));e.push(128);for(var d=e.length/4+2,h=Math.ceil(d/16),g=new Array(h),p=0;p<h;++p){for(var u=new Uint32Array(16),f=0;f<16;++f)u[f]=e[p*64+f*4]<<24|e[p*64+f*4+1]<<16|e[p*64+f*4+2]<<8|e[p*64+f*4+3];g[p]=u}g[h-1][14]=(e.length-1)*8/Math.pow(2,32),g[h-1][14]=Math.floor(g[h-1][14]),g[h-1][15]=(e.length-1)*8&4294967295;for(var U=0;U<h;++U){for(var m=new Uint32Array(80),R=0;R<16;++R)m[R]=g[U][R];for(var w=16;w<80;++w)m[w]=B(m[w-3]^m[w-8]^m[w-14]^m[w-16],1);for(var C=s[0],M=s[1],x=s[2],T=s[3],I=s[4],P=0;P<80;++P){var Q=Math.floor(P/20),Et=B(C,5)+Vt(Q,M,x,T)+I+t[Q]+m[P]>>>0;I=T,T=x,x=B(M,30)>>>0,M=C,C=Et}s[0]=s[0]+C>>>0,s[1]=s[1]+M>>>0,s[2]=s[2]+x>>>0,s[3]=s[3]+T>>>0,s[4]=s[4]+I>>>0}return[s[0]>>24&255,s[0]>>16&255,s[0]>>8&255,s[0]&255,s[1]>>24&255,s[1]>>16&255,s[1]>>8&255,s[1]&255,s[2]>>24&255,s[2]>>16&255,s[2]>>8&255,s[2]&255,s[3]>>24&255,s[3]>>16&255,s[3]>>8&255,s[3]&255,s[4]>>24&255,s[4]>>16&255,s[4]>>8&255,s[4]&255]}var S=Wt("v5",80,Ht);const Y={DISABLED:"disabled",PATIENT:"patient"},L={DRAFT:"draft",SUBMITTED:"submitted",ANY:"draft,submitted"},b={DISABLED:"disabled",PENDING:"pending",SENT:"sent",RESPONDED:"responded",CANCELED:"canceled",ERROR_NO_PHONE:"error_no_phone",ERROR_OPT_OUT:"error_opt_out",ERROR_SMS_FAILED:"error_sms_failed"},D={STANDARD:"standard",CONDITIONAL:"conditional",AUTOMATED:"automated"},Qs=[{id:"today",unit:"day",prev:0},{id:"yesterday",unit:"day",prev:1},{id:"thisweek",unit:"week",prev:0},{id:"lastweek",unit:"week",prev:1},{id:"thismonth",unit:"month",prev:0},{id:"lastmonth",unit:"month",prev:1}],G={STARTED:"started",QUEUED:"queued",DONE:"done"},q={ACTIVE:"active",INACTIVE:"inactive",ARCHIVED:"archived"},ie="patient-actions",{parseRelationship:Jt}=E,re=function(e,t){return!e||t==="owner"?e:Jt(e,t)},ae=c.extend({messages:{OwnerChanged({owner:e,attributes:t={}}){this.set({_owner:e,...t})},StateChanged({state:e,attributes:t={}}){this.set({_state:e.id,...t})}},urlRoot(){if(this.isNew()){const e=this.get("_flow");return e?`/api/flows/${e}/relationships/actions`:`/api/patients/${this.get("_patient")}/relationships/actions`}return"/api/actions"},type:ie,hasTag(e){return ee(this.get("tags"),e)},getForm(){const e=this.get("_form");if(e)return o.request("entities","forms:model",e)},getFormResponses(){return o.request("entities","formResponses:collection",this.get("_form_responses"))},getPatient(){return o.request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner"),t=r.get(e.type);return new t({id:e.id})},isSameTeamAsUser(){const t=o.request("bootstrap","currentUser").getTeam(),s=this.getOwner(),n=s.type==="teams"?s:s.getTeam();return t===n},getAuthor(){return o.request("entities","clinicians:model",this.get("_author"))},getFlow(){if(this.get("_flow"))return o.request("entities","flows:model",this.get("_flow"))},getState(){return o.request("entities","states:model",this.get("_state"))},getProgram(){return o.request("entities","programs:model",this.get("_program"))},getPreviousState(){return o.request("entities","states:model",this.previous("_state"))},isLocked(){return!!this.get("locked_at")},isDone(){return this.getState().isDone()},isFlowDone(){const e=this.getFlow();return e&&e.isDone()},isOverdue(){if(this.isDone())return!1;const e=this.get("due_date"),t=this.get("due_time");if(!t)return y(e).isBefore(y(),"day");const s=y(`${e} ${t}`);return s.isBefore(y(),"day")||s.isBefore(y(),"minute")},hasOutreach(){return this.get("outreach")!==Y.DISABLED},hasSharing(){return this.get("sharing")!==b.DISABLED},canEdit(){const e=o.request("bootstrap","currentUser");return!!(e.can("work:manage")||e.can("work:owned:manage")&&this.getOwner()===e||e.can("work:team:manage")&&this.isSameTeamAsUser())},canSubmit(){const e=o.request("bootstrap","currentUser");return!!(e.can("work:submit")||e.can("work:owned:submit")&&this.getOwner()===e||e.can("work:team:submit")&&this.isSameTeamAsUser())},canDelete(){if(!this.canEdit())return!1;const e=o.request("bootstrap","currentUser");return!!(e.can("work:delete")||e.can("work:owned:delete")&&this.getOwner()===e||e.can("work:authored:delete")&&this.getAuthor()===e)},saveDueDate(e){return e?this.save({due_date:e.format("YYYY-MM-DD")}):this.save({due_date:null,due_time:null})},saveDueTime(e){return e?this.save({due_time:e}):this.save({due_time:null})},saveState(e){const t={_state:e.id},s=this.get("sharing");return e.isDone()&&![b.DISABLED,b.RESPONDED].includes(s)&&(t.sharing=b.CANCELED),this.save(t,{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},saveAll(e){this.isNew()&&(e=_({},this.attributes,e));const t={flow:this.toRelation(e._flow,"flows"),form:this.toRelation(e._form,"forms"),owner:this.toRelation(e._owner),state:this.toRelation(e._state,"states"),"program-action":this.toRelation(e._program_action,"program-actions")};return this.save(e,{relationships:t},{wait:!0})},hasAttachments(){return!!v(this.get("_files"))},hasAllowedUploads(){if(!this.canEdit())return!1;const e=o.request("entities","programActions:model",this.get("_program_action"));return!!v(e.get("allowed_uploads"))},parseRelationship:re}),ce=r(ae,ie),le=l.extend({url:"/api/actions",model:ce,parseRelationship:re,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},groupByDate(){const e=this.groupBy("due_date");return te(Tt(e),(t,s)=>(t.add({date:s,actions:new le(e[s])}),t),new Z.Collection([]))}}),jt=a.extend({Entity:{_Model:ae,Model:ce,Collection:le},radioRequests:{"actions:model":"getModel","actions:collection":"getCollection","fetch:actions:model":"fetchAction","fetch:actions:collection":"fetchCollection","fetch:actions:withResponses":"fetchActionWithResponses","fetch:actions:collection:byPatient":"fetchActionsByPatient","fetch:actions:collection:byFlow":"fetchActionsByFlow"},fetchAction(e){const t=["program-action.program","flow.program-flow.program"].join();return this.fetchModel(e,{data:{include:t}})},fetchActionWithResponses(e){const t={include:["form-responses"],fields:{"form-responses":["status","updated_at","editor"]}};return this.fetchModel(e,{data:t})},fetchActionsByPatient({patientId:e,filter:t}){const s={filter:t},n=`/api/patients/${e}/relationships/actions`;return this.fetchCollection({url:n,data:s})},fetchActionsByFlow(e){const t=`/api/flows/${e}/relationships/actions`;return this.fetchCollection({url:t})}});new jt;const de="clinicians",he=c.extend({type:de,urlRoot:"/api/clinicians",preinitialize(){this.on("change:_team",this.onChangeTeam)},validate(e){if(!$(e.name))return"A clinician name is required";if(!$(e.email))return"A clinician email address is required";if(!e._role)return"A clinician role is required"},onChangeTeam(){const e=o.request("entities","teams:model",this.previous("_team"));e.set("_clinicians",O(e.get("_clinicians"),{id:this.id}));const t=o.request("entities","teams:model",this.get("_team"));t.set("_clinicians",N(t.get("_clinicians"),[{id:this.id}]))},getWorkspaces(){return o.request("entities","workspaces:collection",this.get("_workspaces"))},addWorkspace(e){const t=this.getWorkspaces();t.add(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},removeWorkspace(e){const t=this.getWorkspaces();t.remove(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},getTeam(){return o.request("entities","teams:model",this.get("_team"))},hasTeam(){const e=this.get("_team");return e&&e!==oe},getRole(){return o.request("entities","roles:model",this.get("_role"))},can(e){const s=this.getRole().get("permissions");return ee(s,e)},saveRole(e){return this.save({_role:e.id},{relationships:{role:this.toRelation(e)}})},saveTeam(e){return this.save({_team:e.id},{relationships:{team:this.toRelation(e)}})},saveAll(e){e=_({},this.attributes,e);const t={workspaces:this.toRelation(e._workspaces,"workspaces"),team:this.toRelation(e._team,"teams"),role:this.toRelation(e._role,"roles")};return this.save(e,{relationships:t},{wait:!0})},getInitials(){const e=String(this.get("name")).split(" ");return e.length===1?A(e).charAt(0):`${A(e).charAt(0)}${Pt(e).charAt(0)}`},isEditable(){return!this.get("last_active_at")},isActive(){const e=this.hasTeam(),t=!!v(this.get("_workspaces")),s=this.get("last_active_at");return e&&t&&s}}),ue=r(he,de),Gt=l.extend({url:"/api/clinicians",model:ue,comparator:"name",filterAssignable(){const e=this.clone(),t=this.filter(s=>s.isActive()&&s.get("enabled")&&s.can("work:own"));return e.reset(t),e}}),Qt=a.extend({Entity:{_Model:he,Model:ue,Collection:Gt},radioRequests:{"clinicians:model":"getModel","clinicians:collection":"getCollection","fetch:clinicians:collection":"fetchCollection","fetch:clinicians:current":"fetchCurrentClinician","fetch:clinicians:model":"fetchModel","fetch:clinicians:byWorkspace":"fetchByWorkspace"},fetchCurrentClinician(){return this.fetchBy("/api/clinicians/me").then(e=>(bt(e.pick("id","name","email")),e.clientKey=Ct(),e))},fetchByWorkspace(e){const t=`/api/workspaces/${e}/relationships/clinicians`,s=o.request("entities","workspaces:model",e);return this.fetchCollection({url:t}).then(n=>{s.updateClinicians(n)})}});new Qt;const fe="comments",pe=c.extend({type:fe,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/comments`:"/api/comments"},validate({message:e}){if(!$(e))return"Comment message required."},getClinician(){return o.request("entities","clinicians:model",this.get("_clinician"))}}),ge=r(pe,fe),zt=l.extend({model:ge}),Kt=a.extend({Entity:{_Model:pe,Model:ge,Collection:zt},radioRequests:{"comments:model":"getModel","fetch:comments:collection:byAction":"fetchCommentsByAction"},fetchCommentsByAction(e){const t=`/api/actions/${e}/relationships/comments`;return this.fetchCollection({url:t})}});new Kt;const me="dashboards",we=c.extend({type:me,urlRoot:"/api/dashboards"}),_e=r(we,me),Xt=l.extend({url:"/api/dashboards",model:_e}),Zt=a.extend({Entity:{_Model:we,Model:_e,Collection:Xt},radioRequests:{"dashboards:model":"getModel","dashboards:collection":"getCollection","fetch:dashboards:model":"fetchModel","fetch:dashboards:collection":"fetchCollection"}});new Zt;const es="directories",W=c.extend({type:es,url(){return`/api/directory/${this.get("slug")}`},getOptions(){if(this.options)return this.options;const e=J(this.get("value"),t=>({name:t,id:t}));return this.options=new l(e),this.options}}),ts=l.extend({url:"/api/directories",model:W}),ss=a.extend({Entity:{Model:W,Collection:ts},radioRequests:{"directories:collection":"getCollection","fetch:directories:model":"fetchDirectory","fetch:directories:filterable":"fetchFilterable"},fetchDirectory(e,t){return new W({slug:e}).fetch({data:t})},fetchFilterable(){const e={filter:{filterable:!0}};return this.fetchCollection({data:e})}});new ss;const ye="events",$e=c.extend({type:ye,getClinician(){return o.request("entities","clinicians:model",this.get("_clinician"))},getRecipient(){if(this.get("_recipient"))return o.request("entities","patients:model",this.get("_recipient"))},getEditor(){return this.get("_editor")?o.request("entities","clinicians:model",this.get("_editor")):o.request("entities","clinicians:model",{name:"RoundingWell"})},getTeam(){return o.request("entities","teams:model",this.get("_team"))},getState(){return o.request("entities","states:model",this.get("_state"))},getProgram(){if(this.get("_program"))return o.request("entities","programs:model",this.get("_program"))},getForm(){if(this.get("_form"))return o.request("entities","forms:model",this.get("_form"))}}),ve=r($e,ye),os=l.extend({model:ve}),ns=a.extend({Entity:{_Model:$e,Model:ve,Collection:os},radioRequests:{"events:model":"getModel","events:collection":"getCollection","fetch:actionEvents:collection":"fetchActionEvents","fetch:flowEvents:collection":"fetchFlowEvents"},fetchActionEvents(e){return this.fetchCollection({url:`/api/actions/${e}/activity`})},fetchFlowEvents(e){return this.fetchCollection({url:`/api/flows/${e}/activity`})}});new ns;const Ae="files";function is(e){const t=e.lastIndexOf(".");return`${e.slice(0,t)}-copy${e.slice(t)}`}const Ee=c.extend({defaults:{path:"",_progress:0},type:Ae,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/files?urls=upload`:"/api/files"},fetchFile(){return this.fetch({url:`${this.url()}?urls=download,view`})},createUpload(e){const t=`patient/${this.get("_patient")}/${e}`;return this.save({path:t,_progress:0},{},{type:"PUT"}).catch(({responseData:n}={})=>{if(j(A(n.errors),"detail","").includes("Another file exists"))return this.createUpload(is(e));throw n})},upload(e){this.createUpload(e.name).then(()=>this.putFile(e)).then(()=>this.fetchFile()).catch(()=>{this.trigger("upload:failed"),this.destroy()})},putFile(e){const t=e.size;return new Promise((s,n)=>{const i=new XMLHttpRequest;i.onreadystatechange=()=>{if(i.readyState===4){if(i.status!==200){n();return}this.set({_progress:100}),s()}},i.upload.onprogress=d=>{d.lengthComputable&&this.set({_progress:Math.round(d.loaded/t*100)})},i.open("PUT",this.get("_upload")),i.send(e)})},getFilename(){return this.get("path").split("/").pop()}}),Re=r(Ee,Ae),rs=l.extend({model:Re}),as=a.extend({Entity:{_Model:Ee,Model:Re,Collection:rs},radioRequests:{"files:model":"getModel","fetch:files:collection:byAction":"fetchFilesByAction"},fetchFilesByAction(e){const t=`/api/actions/${e}/relationships/files`,s={urls:["download","view"]};return this.fetchCollection({url:t,data:s})}});new as;const Ce="flows",{parseRelationship:cs}=E,Me=function(e,t){return!e||t==="owner"?e:cs(e,t)},xe=c.extend({messages:{OwnerChanged({owner:e,attributes:t={}}){this.set({_owner:e,...t})},StateChanged({state:e,attributes:t={}}){this.set({_state:e.id,...t})}},urlRoot(){return this.isNew()?`/api/patients/${this.get("_patient")}/relationships/flows`:"/api/flows"},type:Ce,getPatient(){return o.request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner"),t=r.get(e.type);return new t({id:e.id})},getAuthor(){return o.request("entities","clinicians:model",this.get("_author"))},getState(){return o.request("entities","states:model",this.get("_state"))},getProgramFlow(){return o.request("entities","programFlows:model",this.get("_program_flow"))},getProgram(){return o.request("entities","programs:model",this.get("_program"))},isDone(){return this.getState().isDone()},isAllDone(){const{complete:e,total:t}=this.get("_progress");return e===t},canEdit(){const e=o.request("bootstrap","currentUser");if(e.can("work:manage")||e.can("work:owned:manage")&&this.getOwner()===e)return!0;if(e.can("work:team:manage")){const t=this.getOwner(),s=e.getTeam(),n=t.type==="teams"?t:t.getTeam();if(s===n)return!0}return!1},canDelete(){if(!this.canEdit())return!1;const e=o.request("bootstrap","currentUser");return!!(e.can("work:delete")||e.can("work:owned:delete")&&this.getOwner()===e||e.can("work:authored:delete")&&this.getAuthor()===e)},saveState(e){return this.save({_state:e.id},{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},applyOwner(e){const t=`${this.url()}/relationships/actions`,s={owner:this.toRelation(e)};return this.save({},{relationships:s},{url:t})},saveAll(e){this.isNew()&&(e=_({},this.attributes,e));const t={state:this.toRelation(e._state,"states"),owner:this.toRelation(e._owner),"program-flow":this.toRelation(e._program_flow,"program-flows")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:Me}),Te=r(xe,Ce),ls=l.extend({url:"/api/flows",model:Te,parseRelationship:Me,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},applyOwner(e){const t=this.invoke("applyOwner",e);return Promise.all(t)}}),ds=a.extend({Entity:{_Model:xe,Model:Te,Collection:ls},radioRequests:{"flows:model":"getModel","flows:collection":"getCollection","fetch:flows:model":"fetchFlow","fetch:flows:collection":"fetchCollection","fetch:flows:collection:byPatient":"fetchFlowsByPatient"},fetchFlow(e){const t=["program-flow","program-flow.program","program-flow.program-actions"].join();return this.fetchModel(e,{data:{include:t}})},fetchFlowsByPatient({patientId:e,filter:t}){const s={filter:t},n=`/api/patients/${e}/relationships/flows`;return this.fetchCollection({url:n,data:s})}});new ds;function Pe(e,t){return e==="desc"?t*-1:t}function hs(e,t,s,n=""){return t||(t=n),s||(s=n),Pe(e,t.localeCompare(s))}function z(e,t=-1){return qt(e)?e:t}function zs(e,t,s,n=Number.NEGATIVE_INFINITY){t||(t=n),s||(s=n);const i=z(t,n)>z(s,n)?1:-1;return Pe(e,i)}const be="form-responses",{parseRelationship:us}=E,qe=function(e,t){return t==="editor"?e:us(e,t)},ke=c.extend({type:be,urlRoot:"/api/form-responses",saveAll(){const e=this.attributes,t={form:this.toRelation(e._form,"forms"),patient:this.toRelation(e._patient,"patients"),action:this.toRelation(e._action,"patient-actions")};return this.save(e,{relationships:t},{wait:!0})},getDraft(){if(this.get("status")===L.DRAFT)return{updated:this.get("updated_at"),submission:this.getResponse()}},getResponse(){return j(this.get("response"),"data",{})},getFormData(){return kt(this.get("response"),"data")},getEditor(){const e=this.get("_editor"),t=r.get(e.type);return new t({id:e.id})},getEditorName(){const e=this.getEditor();return e.get("name")||`${e.get("first_name")} ${e.get("last_name")}`},parseRelationship:qe}),k=r(ke,be),fs=l.extend({url:"/api/form-responses",model:k,parseRelationship:qe,comparator(e,t){return hs("desc",e.get("updated_at"),t.get("updated_at"))},getFirstSubmission(){return this.find({status:L.SUBMITTED})},filterSubmissions(){const e=this.clone(),t=this.filter({status:L.SUBMITTED});return e.reset(t),e}}),ps=a.extend({Entity:{_Model:ke,Model:k,Collection:fs},radioRequests:{"formResponses:model":"getModel","formResponses:collection":"getCollection","fetch:formResponses:model":"fetchFormResponse","fetch:formResponses:latest":"fetchLatestResponse"},fetchFormResponse(e,t){return e?this.fetchModel(e,t):new k},fetchLatestResponse(e){const t=te(e,(s,n,i)=>(n&&(s.filter[i]=n),s),{filter:{}});return this.fetchBy("/api/form-responses/latest",{data:t}).then(s=>s||new k)}});new ps;const gs=a.extend({radioRequests:{"fetch:icd":"fetchIcd"},fetchIcd({term:e,prefixes:t,year:s=2024}){return Mt("/api/graphql",{header:{Accept:"application/json","Content-Type":"application/json"},method:"POST",body:JSON.stringify({query:`query ($term: String!, $prefixes: [String!], $year: Int!) {
      icdCodes(term: $term, prefixes: $prefixes, year: $year) {
        code
        description
        hcc_v24
        hcc_v28
        isSpecific
        parent {
          code
          description
        }
        children {
          code
          description
        }
      }
    }`,variables:{term:e,prefixes:t,year:s}})}).then(xt)}});new gs;const Se="patient-fields",De=c.extend({type:Se,url(){return`/api/patients/${this.get("_patient")}/fields/${this.get("name")}`},isNew(){return!1},saveAll(e){e=_({},this.attributes,e),e.id||this.set({id:S(`resource:field:${e.name.toLowerCase()}`,e._patient)});const t={patient:this.toRelation(e._patient,"patients")};return this.save(e,{relationships:t},{wait:!0})}}),Ue=r(De,Se),ms=l.extend({model:Ue}),ws=a.extend({Entity:{_Model:De,Model:Ue,Collection:ms},radioRequests:{"patientFields:model":"getModel","patientFields:collection":"getCollection"}});new ws;const Ie="patients",Be=c.extend({type:Ie,url(){if(this.isNew())return"/api/patients";const e=o.request("workspace","current");return`/api/patients/${this.id}?filter[workspace]=${e.id}`},validate({first_name:e,last_name:t,birth_date:s,sex:n}){const i={};if((!e||!t)&&(i.name="required"),n||(i.sex="required"),s?y(s).isAfter()&&(i.birth_date="invalidDate"):i.birth_date="required",!se(i))return i},getWorkspaces(){return o.request("entities","workspaces:collection",this.get("_workspaces"))},getFields(){return o.request("entities","patientFields:collection",this.get("_patient_fields"))},getField(e){return this.getFields().find({name:e})},saveAll(e){e=_({},this.attributes,e);const t={wait:!0};return this.isNew()&&(t.type="PUT"),this.save(e,{},t)},canEdit(){return this.isNew()||this.get("source")==="manual"},getSortName(){return(this.get("last_name")+this.get("first_name")).toLowerCase()},getWorkspacePatient(){return o.request("entities","get:workspacePatients:model",this.id)},toggleActiveStatus(){const e=this.getWorkspacePatient(),s=e.get("status")!==q.ACTIVE?q.ACTIVE:q.INACTIVE;e.saveAll({status:s})},setArchivedStatus(){o.request("entities","get:workspacePatients:model",this.id).saveAll({status:q.ARCHIVED})}}),Fe=r(Be,Ie),_s=l.extend({url:"/api/patients",model:Fe}),ys=a.extend({Entity:{_Model:Be,Model:Fe,Collection:_s},radioRequests:{"patients:model":"getModel","patients:collection":"getCollection","fetch:patients:model":"fetchModel","fetch:patients:model:byAction":"fetchPatientByAction","fetch:patients:model:byFlow":"fetchPatientByFlow"},fetchPatientByAction(e){return this.fetchBy(`/api/actions/${e}/patient`)},fetchPatientByFlow(e){return this.fetchBy(`/api/flows/${e}/patient`)}});new ys;const $s="patients-search-results",Oe=c.extend({type:$s}),vs=l.extend({url:"/api/patients",model:Oe,initialize(){this._debouncedSearch=St(this._debouncedSearch,150)},prevSearch:"",controller:new AbortController,search(e=""){if(e.length<3){(!e.length||!this.prevSearch.includes(e))&&(delete this._hasIdentifiers,this.reset(),this.prevSearch=""),this._debouncedSearch.cancel(),this.controller.abort();return}this.prevSearch=e,this.isSearching=!0,this._debouncedSearch(e)},hasIdentifiers(){return Dt(this._hasIdentifiers)?this._hasIdentifiers:(this._hasIdentifiers=!!this.find(e=>j(e.get("identifiers"),"length")),this._hasIdentifiers)},_debouncedSearch(e){const t={search:e};delete this._hasIdentifiers,this.controller.abort(),this.controller=new AbortController;const s=this.fetch({data:{filter:t},signal:this.controller.signal});this.fetcher=s,s.then(()=>{this.fetcher===s&&(this.isSearching=!1,this.trigger("search",this))})}}),As=a.extend({Entity:{Model:Oe,Collection:vs},radioRequests:{"searchPatients:collection":"getCollection"}});new As;const Ne=(e,t)=>J(e,function(s){return Ut([t],[s])}),Ye="program-actions",{parseRelationship:Es}=E,Le=function(e,t){return!e||t==="owner"?e:Es(e,t)},We=c.extend({urlRoot:"/api/program-actions",type:Ye,validate({name:e}){if(!$(e))return"Action name required"},getTags(){return o.request("entities","tags:collection",Ne(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getAction({patientId:e,flowId:t}){const s=o.request("bootstrap","currentUser"),i=o.request("workspace","current").getStates(),d=A(i.filter({status:G.QUEUED}));return o.request("entities","actions:model",{name:this.get("name"),_flow:t,_patient:e,_state:d.id,_owner:this.get("_owner")||{id:s.id,type:"clinicians"},_program_action:this.id})},enableAttachmentUploads(){this.save({allowed_uploads:["pdf"]})},disableAttachmentUploads(){this.save({allowed_uploads:[]})},getOwner(){const e=this.get("_owner");if(e)return o.request("entities","teams:model",e.id)},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},getForm(){const e=this.get("_form");if(e)return o.request("entities","forms:model",e)},hasOutreach(){return this.get("outreach")!==Y.DISABLED},isVisibleToCurrentUser(){const e=this.get("_teams"),s=o.request("bootstrap","currentUser").getTeam();return v(e)?!!e.find(n=>n.id===s.id):!0},saveForm(e){e=this.toRelation(e);const t={_form:e.data};return e.data||(t.outreach=Y.DISABLED),this.save(t,{relationships:{form:e}})},saveAll(e){e=_({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams"),form:this.toRelation(e._form,"forms"),"program-flow":this.toRelation(e._program_flow,"program-flows"),program:this.toRelation(e._program,"programs")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:Le}),Ve=r(We,Ye),K=l.extend({initialize(e,t={}){this.flowId=t.flowId,this.flowId&&(this.comparator="sequence")},url(){return this.flowId?`/api/program-flows/${this.flowId}/actions`:"/api/program-actions"},model:Ve,parseRelationship:Le,updateSequences(){const e=this.map((t,s)=>(t.set({sequence:s}),t.toJSONApi({sequence:s})));return this.sync("patch",this,{url:this.url(),data:JSON.stringify({data:e})})},filterAddable(){const e=this.clone(),t=this.filter(s=>{const n=!!s.get("published_at"),i=!!s.get("archived_at"),d=s.get("behavior")===D.AUTOMATED,h=s.isVisibleToCurrentUser();return n&&!i&&!d&&h});return e.reset(t),e}}),Rs=a.extend({Entity:{_Model:We,Model:Ve,Collection:K},radioRequests:{"programActions:model":"getModel","programActions:collection":"getCollection","fetch:programActions:model":"fetchModel","fetch:programActions:collection:byProgram":"fetchProgramActionsByProgram","fetch:programActions:collection":"fetchProgramActions","fetch:programActions:collection:byProgramFlow":"fetchProgramActionsByFlow"},fetchProgramActionsByProgram({programId:e}){const t=`/api/programs/${e}/relationships/actions`;return this.fetchCollection({url:t})},fetchProgramActions(e=D.STANDARD){return new this.Entity.Collection().fetch({data:{filter:{behavior:e}}})},fetchProgramActionsByFlow(e,t){return new K([],{flowId:e}).fetch(t)}});new Rs;const He="program-flows",{parseRelationship:Cs}=E,Je=function(e,t){return!e||t==="owner"?e:Cs(e,t)},je=c.extend({urlRoot(){return this.isNew()?`/api/programs/${this.get("_program")}/relationships/flows`:"/api/program-flows"},type:He,validate({name:e}){if(!$(e))return"Flow name required"},getTags(){return o.request("entities","tags:collection",Ne(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getOwner(){const e=this.get("_owner");if(e)return o.request("entities","teams:model",e.id)},getFlow(e){const s=o.request("workspace","current").getStates(),n=A(s.filter({status:G.QUEUED}));return o.request("entities","flows:model",{_patient:e,_program_flow:this.get("id"),_state:n.id})},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},saveAll(e){e=_({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams")};return this.save(e,{relationships:t},{wait:!0})},getActions(){return o.request("entities","programActions:collection",this.get("_program_actions"),{flowId:this.id})},getAddableActions(){return this.getActions().filterAddable()},isVisibleToCurrentUser(){const e=this.get("_teams"),s=o.request("bootstrap","currentUser").getTeam();return v(e)?!!e.find(n=>n.id===s.id):!0},parseRelationship:Je}),Ge=r(je,He),Ms=l.extend({url:"/api/program-flows",model:Ge,parseRelationship:Je,filterAddable(){const e=this.clone(),t=this.filter(s=>{const n=!!s.get("published_at"),i=!!s.get("archived_at"),d=s.get("behavior")===D.AUTOMATED,h=s.isVisibleToCurrentUser();return n&&!i&&!d&&h});return e.reset(t),e}}),xs=a.extend({Entity:{_Model:je,Model:Ge,Collection:Ms},radioRequests:{"programFlows:model":"getModel","programFlows:collection":"getCollection","fetch:programFlows:model":"fetchModel","fetch:programFlows:collection:byProgram":"fetchProgramFlowsByProgram","fetch:programFlows:collection":"fetchProgramFlows"},fetchProgramFlowsByProgram({programId:e}){const t=`/api/programs/${e}/relationships/flows`;return this.fetchCollection({url:t})},fetchProgramFlows(e=D.STANDARD){return new this.Entity.Collection().fetch({data:{filter:{behavior:e}}})}});new xs;const Qe="programs",ze=c.extend({type:Qe,validate({name:e}){if(!$(e))return"Program name required"},urlRoot:"/api/programs",getAddable(){const e=o.request("entities","programActions:collection",this.get("_program_actions")),t=o.request("entities","programFlows:collection",this.get("_program_flows")),s=e.filterAddable(),n=t.filterAddable();return new Z.Collection([...n.models,...s.models],{comparator:"name"})},getUserWorkspaces(){const t=o.request("bootstrap","currentUser").getWorkspaces(),s=o.request("entities","workspaces:collection",this.get("_workspaces"));return s.reset(s.filter(n=>t.get(n.id))),s}}),Ke=r(ze,Qe),Ts=l.extend({url:"/api/programs",model:Ke}),Ps=a.extend({Entity:{_Model:ze,Model:Ke,Collection:Ts},radioRequests:{"programs:model":"getModel","programs:collection":"getCollection","fetch:programs:model":"fetchModel","fetch:programs:collection":"fetchCollection","fetch:programs:model:byProgramFlow":"fetchProgramByProgramFlow","fetch:programs:byWorkspace":"fetchProgramsByWorkspace"},fetchProgramByProgramFlow(e){return this.fetchBy(`/api/program-flows/${e}/program`)},fetchProgramsByWorkspace(e){const t=`/api/workspaces/${e}/relationships/programs`;return this.fetchCollection({url:t})}});new Ps;const Xe="roles",Ze=c.extend({type:Xe,urlRoot:"/api/roles"}),et=r(Ze,Xe),bs=l.extend({url:"/api/roles",model:et}),qs=a.extend({Entity:{_Model:Ze,Model:et,Collection:bs},radioRequests:{"roles:model":"getModel","roles:collection":"getCollection","fetch:roles:collection":"fetchCollection"}});new qs;const tt="settings",st=c.extend({type:tt,urlRoot:"/api/settings"}),ot=r(st,tt),ks=l.extend({url:"/api/settings",model:ot}),Ss=a.extend({Entity:{_Model:st,Model:ot,Collection:ks},radioRequests:{"settings:model":"getModel","fetch:settings:collection":"fetchCollection"}});new Ss;const nt="states",it=c.extend({type:nt,isDone(){return this.get("status")===G.DONE}}),rt=r(it,nt),V=l.extend({url:"/api/states",model:rt,comparator:"sequence",groupByDone(){const{done:e,notDone:t}=this.groupBy(s=>s.isDone()?"done":"notDone");return{done:new V(e),notDone:new V(t)}},getFilterIds(){return this.map("id").join(",")}}),Ds=a.extend({Entity:{_Model:it,Model:rt,Collection:V},radioRequests:{"states:model":"getModel","states:collection":"getCollection","fetch:states:collection":"fetchCollection"}});new Ds;const at="tags",ct=c.extend({type:at,idAttribute:"text"}),lt=r(ct,at),Us=l.extend({url:"/api/tags",model:lt,parse(e){return J(e.data,t=>({text:t}))},comparator:"text"});let F;const Is=a.extend({Entity:{_Model:ct,Model:lt,Collection:Us},radioRequests:{"tags:model":"getModel","tags:collection":"getCollection","fetch:tags:collection":"fetchTags"},fetchTags(){return F||this.fetchCollection().then(e=>(F=e,e))}});new Is;const dt="teams",ht=c.extend({type:dt,urlRoot:"/api/teams",getAssignableClinicians(){return o.request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()}}),ut=r(ht,dt),Bs=l.extend({url:"/api/teams",model:ut,comparator:"name"}),Fs=a.extend({Entity:{_Model:ht,Model:ut,Collection:Bs},radioRequests:{"teams:model":"getModel","teams:collection":"getCollection","fetch:teams:collection":"fetchCollection"}});new Fs;const ft="widget-values",pt=c.extend({type:ft}),H=r(pt,ft);l.extend({model:H});const Os=a.extend({Entity:{_Model:pt,Model:H},radioRequests:{"get:widgetValues:model":"getByPatient","fetch:widgetValues:byPatient":"fetchByPatient"},fetchByPatient(e,t){const s=this.getByPatient(e.get("slug"),t),n=e.get("values");if(se(n))return s;const i={filter:{patient:t}};return s.fetch({url:`/api/widgets/${e.get("slug")}/values`,data:i})},getByPatient(e,t){return ne(t)||(t=S(t,oe)),new H({id:S(e,t),name:e})}});new Os;const gt="widgets",mt=c.extend({type:gt,fetchValues(e){return o.request("entities","fetch:widgetValues:byPatient",this,e)}}),wt=r(mt,gt),Ns=l.extend({url:"/api/widgets",model:wt,modelId(e){return It(`${e.slug}-`)}}),Ys=a.extend({Entity:{_Model:mt,Model:wt,Collection:Ns},radioRequests:{"widgets:model":"getModel","widgets:collection":"getCollection","fetch:widgets:collection":"fetchWidgets"},fetchWidgets({filter:e={}}={}){const t={filter:e};return this.fetchCollection({data:t})}});new Ys;const _t="workspace-patients",yt=c.extend({type:_t,urlRoot:"/api/workspace-patients",saveAll(e){const t={type:"PUT"},s={workspace:this.toRelation(this.get("_workspace"),"workspaces"),patient:this.toRelation(this.get("_patient"),"patients")};this.save(e,{relationships:s},t)},canEdit(){return o.request("bootstrap","currentUser").can("patients:manage")}}),X=r(yt,_t),Ls=a.extend({Entity:{_Model:yt,Model:X},radioRequests:{"get:workspacePatients:model":"getByPatient","fetch:workspacePatients:byPatient":"fetchByPatient"},fetchByPatient(e){return this.getByPatient(e).fetch()},getByPatient(e){const s=o.request("workspace","current").id;return new X({id:S(e,s),_patient:e,_workspace:s})}});new Ls;const $t="workspaces",vt=c.extend({type:$t,urlRoot:"/api/workspaces",getStates(){return o.request("entities","states:collection",this.get("_states"))},getForms(){return o.request("entities","forms:collection",this.get("_forms"))},getAssignableClinicians(){return o.request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()},updateClinicians(e){this.set("_clinicians",e.map(t=>Bt(t,"id","type")))},addClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`,s=e.get("_workspaces");return e.set({_workspaces:N(s,[{id:this.id}])}),this.set({_clinicians:N(this.get("_clinicians"),[{id:e.id}])}),this.sync("create",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})},removeClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`;return e.set({_workspaces:O(e.get("_workspaces"),{id:this.id})}),this.set({_clinicians:O(this.get("_clinicians"),{id:e.id})}),this.sync("delete",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})}}),At=r(vt,$t),Ws=l.extend({url:"/api/workspaces",model:At,comparator:"name"}),Vs=a.extend({Entity:{_Model:vt,Model:At,Collection:Ws},radioRequests:{"workspaces:model":"getModel","workspaces:collection":"getCollection","fetch:workspaces:collection":"fetchCollection"}});new Vs;export{b as A,L as F,oe as N,D as P,Qs as R,G as S,hs as a,Y as b,Ne as c,q as d,zs as n};
