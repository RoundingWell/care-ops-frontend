import{u as Ee,B as a,S as l,a as c,J as R,c as r,t as v,f as Me,h as Ce}from"./20240627-app-CY2w_Mh1.js";import{R as o,B as tt}from"./20240627-runtime-WlPobKHk.js";import{H as et,e as _,x as $,r as st,N as xe,G as O,J as N,O as A,P as Te,Q as be,m as J,D as j,R as Pe,z as qe,S as ke,h as G,d as Se,T as De,U as Ue,u as Fe,w as Ie}from"./20240627-index-Dt6oT601.js";import{d as y}from"./20240627-parsePhoneNumber-D9cgvm8h.js";const ot="00000000-0000-0000-0000-000000000000",Be=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;function nt(t){return typeof t=="string"&&Be.test(t)}function Oe(t){if(!nt(t))throw TypeError("Invalid UUID");var e,s=new Uint8Array(16);return s[0]=(e=parseInt(t.slice(0,8),16))>>>24,s[1]=e>>>16&255,s[2]=e>>>8&255,s[3]=e&255,s[4]=(e=parseInt(t.slice(9,13),16))>>>8,s[5]=e&255,s[6]=(e=parseInt(t.slice(14,18),16))>>>8,s[7]=e&255,s[8]=(e=parseInt(t.slice(19,23),16))>>>8,s[9]=e&255,s[10]=(e=parseInt(t.slice(24,36),16))/1099511627776&255,s[11]=e/4294967296&255,s[12]=e>>>24&255,s[13]=e>>>16&255,s[14]=e>>>8&255,s[15]=e&255,s}function Ne(t){t=unescape(encodeURIComponent(t));for(var e=[],s=0;s<t.length;++s)e.push(t.charCodeAt(s));return e}var Ye="6ba7b810-9dad-11d1-80b4-00c04fd430c8",Le="6ba7b811-9dad-11d1-80b4-00c04fd430c8";function We(t,e,s){function n(i,d,h,g){var p;if(typeof i=="string"&&(i=Ne(i)),typeof d=="string"&&(d=Oe(d)),((p=d)===null||p===void 0?void 0:p.length)!==16)throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");var u=new Uint8Array(16+i.length);if(u.set(d),u.set(i,d.length),u=s(u),u[6]=u[6]&15|e,u[8]=u[8]&63|128,h){g=g||0;for(var f=0;f<16;++f)h[g+f]=u[f];return h}return Ee(u)}try{n.name=t}catch{}return n.DNS=Ye,n.URL=Le,n}function Ve(t,e,s,n){switch(t){case 0:return e&s^~e&n;case 1:return e^s^n;case 2:return e&s^e&n^s&n;case 3:return e^s^n}}function I(t,e){return t<<e|t>>>32-e}function He(t){var e=[1518500249,1859775393,2400959708,3395469782],s=[1732584193,4023233417,2562383102,271733878,3285377520];if(typeof t=="string"){var n=unescape(encodeURIComponent(t));t=[];for(var i=0;i<n.length;++i)t.push(n.charCodeAt(i))}else Array.isArray(t)||(t=Array.prototype.slice.call(t));t.push(128);for(var d=t.length/4+2,h=Math.ceil(d/16),g=new Array(h),p=0;p<h;++p){for(var u=new Uint32Array(16),f=0;f<16;++f)u[f]=t[p*64+f*4]<<24|t[p*64+f*4+1]<<16|t[p*64+f*4+2]<<8|t[p*64+f*4+3];g[p]=u}g[h-1][14]=(t.length-1)*8/Math.pow(2,32),g[h-1][14]=Math.floor(g[h-1][14]),g[h-1][15]=(t.length-1)*8&4294967295;for(var U=0;U<h;++U){for(var m=new Uint32Array(80),E=0;E<16;++E)m[E]=g[U][E];for(var w=16;w<80;++w)m[w]=I(m[w-3]^m[w-8]^m[w-14]^m[w-16],1);for(var M=s[0],C=s[1],x=s[2],T=s[3],F=s[4],b=0;b<80;++b){var z=Math.floor(b/20),Re=I(M,5)+Ve(z,C,x,T)+F+e[z]+m[b]>>>0;F=T,T=x,x=I(C,30)>>>0,C=M,M=Re}s[0]=s[0]+M>>>0,s[1]=s[1]+C>>>0,s[2]=s[2]+x>>>0,s[3]=s[3]+T>>>0,s[4]=s[4]+F>>>0}return[s[0]>>24&255,s[0]>>16&255,s[0]>>8&255,s[0]&255,s[1]>>24&255,s[1]>>16&255,s[1]>>8&255,s[1]&255,s[2]>>24&255,s[2]>>16&255,s[2]>>8&255,s[2]&255,s[3]>>24&255,s[3]>>16&255,s[3]>>8&255,s[3]&255,s[4]>>24&255,s[4]>>16&255,s[4]>>8&255,s[4]&255]}var S=We("v5",80,He);const Y={DISABLED:"disabled",PATIENT:"patient"},L={DRAFT:"draft",SUBMITTED:"submitted",ANY:"draft,submitted"},P={DISABLED:"disabled",PENDING:"pending",SENT:"sent",RESPONDED:"responded",CANCELED:"canceled",ERROR_NO_PHONE:"error_no_phone",ERROR_OPT_OUT:"error_opt_out",ERROR_SMS_FAILED:"error_sms_failed"},D={STANDARD:"standard",CONDITIONAL:"conditional",AUTOMATED:"automated"},Qs=[{id:"today",unit:"day",prev:0},{id:"yesterday",unit:"day",prev:1},{id:"thisweek",unit:"week",prev:0},{id:"lastweek",unit:"week",prev:1},{id:"thismonth",unit:"month",prev:0},{id:"lastmonth",unit:"month",prev:1}],Q={STARTED:"started",QUEUED:"queued",DONE:"done"},q={ACTIVE:"active",INACTIVE:"inactive",ARCHIVED:"archived"},it="patient-actions",{parseRelationship:Je}=R,rt=function(t,e){return!t||e==="owner"?t:Je(t,e)},at=a.extend({urlRoot(){if(this.isNew()){const t=this.get("_flow");return t?`/api/flows/${t}/relationships/actions`:`/api/patients/${this.get("_patient")}/relationships/actions`}return"/api/actions"},type:it,hasTag(t){return et(this.get("tags"),t)},getForm(){const t=this.get("_form");if(t)return o.request("entities","forms:model",t)},getFormResponses(){return o.request("entities","formResponses:collection",this.get("_form_responses"))},getPatient(){return o.request("entities","patients:model",this.get("_patient"))},getOwner(){const t=this.get("_owner");return o.request("entities",`${t.type}:model`,t.id)},isSameTeamAsUser(){const e=o.request("bootstrap","currentUser").getTeam(),s=this.getOwner(),n=s.type==="teams"?s:s.getTeam();return e===n},getAuthor(){return o.request("entities","clinicians:model",this.get("_author"))},getFlow(){if(this.get("_flow"))return o.request("entities","flows:model",this.get("_flow"))},getState(){return o.request("entities","states:model",this.get("_state"))},getPreviousState(){return o.request("entities","states:model",this.previous("_state"))},isLocked(){return!!this.get("locked_at")},isDone(){return this.getState().isDone()},isFlowDone(){const t=this.getFlow();return t&&t.isDone()},isOverdue(){if(this.isDone())return!1;const t=this.get("due_date"),e=this.get("due_time");if(!e)return y(t).isBefore(y(),"day");const s=y(`${t} ${e}`);return s.isBefore(y(),"day")||s.isBefore(y(),"minute")},hasOutreach(){return this.get("outreach")!==Y.DISABLED},hasSharing(){return this.get("sharing")!==P.DISABLED},canEdit(){const t=o.request("bootstrap","currentUser");return!!(t.can("work:manage")||t.can("work:owned:manage")&&this.getOwner()===t||t.can("work:team:manage")&&this.isSameTeamAsUser())},canSubmit(){const t=o.request("bootstrap","currentUser");return!!(t.can("work:submit")||t.can("work:owned:submit")&&this.getOwner()===t||t.can("work:team:submit")&&this.isSameTeamAsUser())},canDelete(){if(!this.canEdit())return!1;const t=o.request("bootstrap","currentUser");return!!(t.can("work:delete")||t.can("work:owned:delete")&&this.getOwner()===t||t.can("work:authored:delete")&&this.getAuthor()===t)},saveDueDate(t){return t?this.save({due_date:t.format("YYYY-MM-DD")}):this.save({due_date:null,due_time:null})},saveDueTime(t){return t?this.save({due_time:t}):this.save({due_time:null})},saveState(t){const e={_state:t.id},s=this.get("sharing");return t.isDone()&&![P.DISABLED,P.RESPONDED].includes(s)&&(e.sharing=P.CANCELED),this.save(e,{relationships:{state:this.toRelation(t)}})},saveOwner(t){return this.save({_owner:t},{relationships:{owner:this.toRelation(t)}})},saveAll(t){this.isNew()&&(t=_({},this.attributes,t));const e={flow:this.toRelation(t._flow,"flows"),form:this.toRelation(t._form,"forms"),owner:this.toRelation(t._owner),state:this.toRelation(t._state,"states"),"program-action":this.toRelation(t._program_action,"program-actions")};return this.save(t,{relationships:e},{wait:!0})},hasAttachments(){return!!$(this.get("_files"))},hasAllowedUploads(){if(!this.canEdit())return!1;const t=o.request("entities","programActions:model",this.get("_program_action"));return!!$(t.get("allowed_uploads"))},parseRelationship:rt}),ct=l(at,it),lt=c.extend({url:"/api/actions",model:ct,parseRelationship:rt,save(t){const e=this.invoke("saveAll",t);return Promise.all(e)},groupByDate(){const t=this.groupBy("due_date");return st(xe(t),(e,s)=>(e.add({date:s,actions:new lt(t[s])}),e),new tt.Collection([]))}}),je=r.extend({Entity:{_Model:at,Model:ct,Collection:lt},radioRequests:{"actions:model":"getModel","actions:collection":"getCollection","fetch:actions:model":"fetchAction","fetch:actions:collection":"fetchCollection","fetch:actions:withResponses":"fetchActionWithResponses","fetch:actions:collection:byPatient":"fetchActionsByPatient","fetch:actions:collection:byFlow":"fetchActionsByFlow"},fetchAction(t){const e=["program-action.program","flow.program-flow.program"].join();return this.fetchModel(t,{data:{include:e}})},fetchActionWithResponses(t){const e={include:["form-responses"],fields:{"form-responses":["status","updated_at","editor"]}};return this.fetchModel(t,{data:e})},fetchActionsByPatient({patientId:t,filter:e}){const s={filter:e},n=`/api/patients/${t}/relationships/actions`;return this.fetchCollection({url:n,data:s})},fetchActionsByFlow(t){const e=`/api/flows/${t}/relationships/actions`;return this.fetchCollection({url:e})}});new je;const dt="clinicians",ht=a.extend({type:dt,urlRoot:"/api/clinicians",preinitialize(){this.on("change:_team",this.onChangeTeam)},validate(t){if(!v(t.name))return"A clinician name is required";if(!v(t.email))return"A clinician email address is required";if(!t._role)return"A clinician role is required"},onChangeTeam(){const t=o.request("entities","teams:model",this.previous("_team"));t.set("_clinicians",O(t.get("_clinicians"),{id:this.id}));const e=o.request("entities","teams:model",this.get("_team"));e.set("_clinicians",N(e.get("_clinicians"),[{id:this.id}]))},getWorkspaces(){return o.request("entities","workspaces:collection",this.get("_workspaces"))},addWorkspace(t){const e=this.getWorkspaces();e.add(t),this.set("_workspaces",this.toRelation(e,"workspaces").data)},removeWorkspace(t){const e=this.getWorkspaces();e.remove(t),this.set("_workspaces",this.toRelation(e,"workspaces").data)},getTeam(){return o.request("entities","teams:model",this.get("_team"))},hasTeam(){const t=this.get("_team");return t&&t!==ot},getRole(){return o.request("entities","roles:model",this.get("_role"))},can(t){const s=this.getRole().get("permissions");return et(s,t)},saveRole(t){return this.save({_role:t.id},{relationships:{role:this.toRelation(t)}})},saveTeam(t){return this.save({_team:t.id},{relationships:{team:this.toRelation(t)}})},saveAll(t){t=_({},this.attributes,t);const e={workspaces:this.toRelation(t._workspaces,"workspaces"),team:this.toRelation(t._team,"teams"),role:this.toRelation(t._role,"roles")};return this.save(t,{relationships:e},{wait:!0})},getInitials(){const t=String(this.get("name")).split(" ");return t.length===1?A(t).charAt(0):`${A(t).charAt(0)}${Te(t).charAt(0)}`},isEditable(){return!this.get("last_active_at")},isActive(){const t=this.hasTeam(),e=!!$(this.get("_workspaces")),s=this.get("last_active_at");return t&&e&&s}}),ut=l(ht,dt),Ge=c.extend({url:"/api/clinicians",model:ut,comparator:"name",filterAssignable(){const t=this.clone(),e=this.filter(s=>s.isActive()&&s.get("enabled")&&s.can("work:own"));return t.reset(e),t}}),Qe=r.extend({Entity:{_Model:ht,Model:ut,Collection:Ge},radioRequests:{"clinicians:model":"getModel","clinicians:collection":"getCollection","fetch:clinicians:collection":"fetchCollection","fetch:clinicians:current":"fetchCurrentClinician","fetch:clinicians:model":"fetchModel","fetch:clinicians:byWorkspace":"fetchByWorkspace"},fetchCurrentClinician(){return this.fetchBy("/api/clinicians/me").then(t=>(be(t.pick("id","name","email")),t))},fetchByWorkspace(t){const e=`/api/workspaces/${t}/relationships/clinicians`;return this.fetchCollection({url:e})}});new Qe;const ft="comments",pt=a.extend({type:ft,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/comments`:"/api/comments"},validate({message:t}){if(!v(t))return"Comment message required."},getClinician(){return o.request("entities","clinicians:model",this.get("_clinician"))}}),gt=l(pt,ft),ze=c.extend({model:gt}),Xe=r.extend({Entity:{_Model:pt,Model:gt,Collection:ze},radioRequests:{"comments:model":"getModel","fetch:comments:collection:byAction":"fetchCommentsByAction"},fetchCommentsByAction(t){const e=`/api/actions/${t}/relationships/comments`;return this.fetchCollection({url:e})}});new Xe;const mt="dashboards",wt=a.extend({type:mt,urlRoot:"/api/dashboards"}),_t=l(wt,mt),Ke=c.extend({url:"/api/dashboards",model:_t}),Ze=r.extend({Entity:{_Model:wt,Model:_t,Collection:Ke},radioRequests:{"dashboards:model":"getModel","dashboards:collection":"getCollection","fetch:dashboards:model":"fetchModel","fetch:dashboards:collection":"fetchCollection"}});new Ze;const ts="directories",W=a.extend({type:ts,url(){return`/api/directory/${this.get("slug")}`},getOptions(){if(this.options)return this.options;const t=J(this.get("value"),e=>({name:e,id:e}));return this.options=new c(t),this.options}}),es=c.extend({url:"/api/directories",model:W}),ss=r.extend({Entity:{Model:W,Collection:es},radioRequests:{"directories:collection":"getCollection","fetch:directories:model":"fetchDirectory","fetch:directories:filterable":"fetchFilterable"},fetchDirectory(t,e){return new W({slug:t}).fetch({data:e})},fetchFilterable(){const t={filter:{filterable:!0}};return this.fetchCollection({data:t})}});new ss;const yt="events",vt=a.extend({type:yt,getClinician(){return o.request("entities","clinicians:model",this.get("_clinician"))},getRecipient(){if(this.get("_recipient"))return o.request("entities","patients:model",this.get("_recipient"))},getEditor(){return this.get("_editor")?o.request("entities","clinicians:model",this.get("_editor")):o.request("entities","clinicians:model",{name:"RoundingWell"})},getTeam(){return o.request("entities","teams:model",this.get("_team"))},getState(){return o.request("entities","states:model",this.get("_state"))},getProgram(){if(this.get("_program"))return o.request("entities","programs:model",this.get("_program"))},getForm(){if(this.get("_form"))return o.request("entities","forms:model",this.get("_form"))}}),$t=l(vt,yt),os=c.extend({model:$t}),ns=r.extend({Entity:{_Model:vt,Model:$t,Collection:os},radioRequests:{"events:model":"getModel","events:collection":"getCollection","fetch:actionEvents:collection":"fetchActionEvents","fetch:flowEvents:collection":"fetchFlowEvents"},fetchActionEvents(t){return this.fetchCollection({url:`/api/actions/${t}/activity`})},fetchFlowEvents(t){return this.fetchCollection({url:`/api/flows/${t}/activity`})}});new ns;const At="files";function is(t){const e=t.lastIndexOf(".");return`${t.slice(0,e)}-copy${t.slice(e)}`}const Rt=a.extend({defaults:{path:"",_progress:0},type:At,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/files?urls=upload`:"/api/files"},fetchFile(){return this.fetch({url:`${this.url()}?urls=download,view`})},createUpload(t){const e=`patient/${this.get("_patient")}/${t}`;return this.save({path:e,_progress:0},{},{type:"PUT"}).catch(({responseData:n}={})=>{if(j(A(n.errors),"detail","").includes("Another file exists"))return this.createUpload(is(t));throw n})},upload(t){this.createUpload(t.name).then(()=>this.putFile(t)).then(()=>this.fetchFile()).catch(()=>{this.trigger("upload:failed"),this.destroy()})},putFile(t){const e=t.size;return new Promise((s,n)=>{const i=new XMLHttpRequest;i.onreadystatechange=()=>{if(i.readyState===4){if(i.status!==200){n();return}this.set({_progress:100}),s()}},i.upload.onprogress=d=>{d.lengthComputable&&this.set({_progress:Math.round(d.loaded/e*100)})},i.open("PUT",this.get("_upload")),i.send(t)})},getFilename(){return this.get("path").split("/").pop()}}),Et=l(Rt,At),rs=c.extend({model:Et}),as=r.extend({Entity:{_Model:Rt,Model:Et,Collection:rs},radioRequests:{"files:model":"getModel","fetch:files:collection:byAction":"fetchFilesByAction"},fetchFilesByAction(t){const e=`/api/actions/${t}/relationships/files`,s={urls:["download","view"]};return this.fetchCollection({url:e,data:s})}});new as;const Mt="flows",{parseRelationship:cs}=R,Ct=function(t,e){return!t||e==="owner"?t:cs(t,e)},xt=a.extend({urlRoot(){return this.isNew()?`/api/patients/${this.get("_patient")}/relationships/flows`:"/api/flows"},type:Mt,getPatient(){return o.request("entities","patients:model",this.get("_patient"))},getOwner(){const t=this.get("_owner");return o.request("entities",`${t.type}:model`,t.id)},getAuthor(){return o.request("entities","clinicians:model",this.get("_author"))},getState(){return o.request("entities","states:model",this.get("_state"))},getProgramFlow(){return o.request("entities","programFlows:model",this.get("_program_flow"))},isDone(){return this.getState().isDone()},isAllDone(){const{complete:t,total:e}=this.get("_progress");return t===e},canEdit(){const t=o.request("bootstrap","currentUser");if(t.can("work:manage")||t.can("work:owned:manage")&&this.getOwner()===t)return!0;if(t.can("work:team:manage")){const e=this.getOwner(),s=t.getTeam(),n=e.type==="teams"?e:e.getTeam();if(s===n)return!0}return!1},canDelete(){if(!this.canEdit())return!1;const t=o.request("bootstrap","currentUser");return!!(t.can("work:delete")||t.can("work:owned:delete")&&this.getOwner()===t||t.can("work:authored:delete")&&this.getAuthor()===t)},saveState(t){return this.save({_state:t.id},{relationships:{state:this.toRelation(t)}})},saveOwner(t){return this.save({_owner:t},{relationships:{owner:this.toRelation(t)}})},applyOwner(t){const e=`${this.url()}/relationships/actions`,s={owner:this.toRelation(t)};return this.save({},{relationships:s},{url:e})},saveAll(t){this.isNew()&&(t=_({},this.attributes,t));const e={state:this.toRelation(t._state,"states"),owner:this.toRelation(t._owner),"program-flow":this.toRelation(t._program_flow,"program-flows")};return this.save(t,{relationships:e},{wait:!0})},parseRelationship:Ct}),Tt=l(xt,Mt),ls=c.extend({url:"/api/flows",model:Tt,parseRelationship:Ct,save(t){const e=this.invoke("saveAll",t);return Promise.all(e)},applyOwner(t){const e=this.invoke("applyOwner",t);return Promise.all(e)}}),ds=r.extend({Entity:{_Model:xt,Model:Tt,Collection:ls},radioRequests:{"flows:model":"getModel","flows:collection":"getCollection","fetch:flows:model":"fetchFlow","fetch:flows:collection":"fetchCollection","fetch:flows:collection:byPatient":"fetchFlowsByPatient"},fetchFlow(t){const e=["program-flow","program-flow.program","program-flow.program-actions"].join();return this.fetchModel(t,{data:{include:e}})},fetchFlowsByPatient({patientId:t,filter:e}){const s={filter:e},n=`/api/patients/${t}/relationships/flows`;return this.fetchCollection({url:n,data:s})}});new ds;function bt(t,e){return t==="desc"?e*-1:e}function hs(t,e,s,n=""){return e||(e=n),s||(s=n),bt(t,e.localeCompare(s))}function X(t,e=-1){return Pe(t)?t:e}function zs(t,e,s,n=Number.NEGATIVE_INFINITY){e||(e=n),s||(s=n);const i=X(e,n)>X(s,n)?1:-1;return bt(t,i)}const Pt="form-responses",{parseRelationship:us}=R,qt=function(t,e){return e==="editor"?t:us(t,e)},kt=a.extend({type:Pt,urlRoot:"/api/form-responses",saveAll(){const t=this.attributes,e={form:this.toRelation(t._form,"forms"),patient:this.toRelation(t._patient,"patients"),action:this.toRelation(t._action,"patient-actions")};return this.save(t,{relationships:e},{wait:!0})},getDraft(){if(this.get("status")===L.DRAFT)return{updated:this.get("updated_at"),submission:this.getResponse()}},getResponse(){return j(this.get("response"),"data",{})},getFormData(){return qe(this.get("response"),"data")},parseRelationship:qt}),k=l(kt,Pt),fs=c.extend({url:"/api/form-responses",model:k,parseRelationship:qt,comparator(t,e){return hs("desc",t.get("updated_at"),e.get("updated_at"))},getFirstSubmission(){return this.find({status:L.SUBMITTED})},filterSubmissions(){const t=this.clone(),e=this.filter({status:L.SUBMITTED});return t.reset(e),t}}),ps=r.extend({Entity:{_Model:kt,Model:k,Collection:fs},radioRequests:{"formResponses:model":"getModel","formResponses:collection":"getCollection","fetch:formResponses:model":"fetchFormResponse","fetch:formResponses:latest":"fetchLatestResponse"},fetchFormResponse(t,e){return t?this.fetchModel(t,e):new k},fetchLatestResponse(t){const e=st(t,(s,n,i)=>(n&&(s.filter[i]=n),s),{filter:{}});return this.fetchBy("/api/form-responses/latest",{data:e}).then(s=>s||new k)}});new ps;const gs=r.extend({radioRequests:{"fetch:icd:byTerm":"fetchIcdByTerm"},fetchIcdByTerm(t){return Me("/api/graphql",{header:{Accept:"application/json","Content-Type":"application/json"},method:"POST",body:JSON.stringify({query:`query ($term: String!) {
      icdCodes(term: $term) {
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
    }`,variables:{term:t}})}).then(Ce)}});new gs;const St="patient-fields",Dt=a.extend({type:St,url(){return`/api/patients/${this.get("_patient")}/fields/${this.get("name")}`},isNew(){return!1},getValue(){const t=this.get("value");return ke(t)&&G(t)?null:t},saveAll(t){t=_({},this.attributes,t),t.id||this.set({id:S(`resource:field:${t.name.toLowerCase()}`,t._patient)});const e={patient:this.toRelation(t._patient,"patients")};return this.save(t,{relationships:e},{wait:!0})}}),Ut=l(Dt,St),ms=c.extend({model:Ut}),ws=r.extend({Entity:{_Model:Dt,Model:Ut,Collection:ms},radioRequests:{"patientFields:model":"getModel","patientFields:collection":"getCollection","fetch:patientFields:model":"fetchPatientField"},fetchPatientField(t,e){const s=`/api/patients/${t}/fields/${e}`;return this.fetchModel(e,{url:s,abort:!1}).then(n=>{this.getModel(n.attributes)})}});new ws;const Ft="patients",It=a.extend({type:Ft,urlRoot:"/api/patients",validate({first_name:t,last_name:e,birth_date:s,sex:n}){const i={};if((!t||!e)&&(i.name="required"),n||(i.sex="required"),s?y(s).isAfter()&&(i.birth_date="invalidDate"):i.birth_date="required",!G(i))return i},getWorkspaces(){return o.request("entities","workspaces:collection",this.get("_workspaces"))},getFields(){return o.request("entities","patientFields:collection",this.get("_patient_fields"))},getField(t){return this.getFields().find({name:t})},saveAll(t){t=_({},this.attributes,t);const e={wait:!0};return this.isNew()&&(e.type="PUT"),this.save(t,{},e)},canEdit(){return this.isNew()||this.get("source")==="manual"},getSortName(){return(this.get("last_name")+this.get("first_name")).toLowerCase()},getWorkspacePatient(){return o.request("entities","get:workspacePatients:model",this.id)},toggleActiveStatus(){const t=this.getWorkspacePatient(),s=t.get("status")!==q.ACTIVE?q.ACTIVE:q.INACTIVE;t.saveAll({status:s})},setArchivedStatus(){o.request("entities","get:workspacePatients:model",this.id).saveAll({status:q.ARCHIVED})}}),Bt=l(It,Ft),_s=c.extend({url:"/api/patients",model:Bt}),ys=r.extend({Entity:{_Model:It,Model:Bt,Collection:_s},radioRequests:{"patients:model":"getModel","patients:collection":"getCollection","fetch:patients:model":"fetchModel","fetch:patients:model:byAction":"fetchPatientByAction","fetch:patients:model:byFlow":"fetchPatientByFlow"},fetchPatientByAction(t){return this.fetchBy(`/api/actions/${t}/patient`)},fetchPatientByFlow(t){return this.fetchBy(`/api/flows/${t}/patient`)}});new ys;const vs="patients-search-results",Ot=a.extend({type:vs}),$s=c.extend({url:"/api/patients",model:Ot,initialize(){this._debouncedSearch=Se(this._debouncedSearch,150)},prevSearch:"",controller:new AbortController,search(t=""){if(t.length<3){(!t.length||!this.prevSearch.includes(t))&&(delete this._hasIdentifiers,this.reset(),this.prevSearch=""),this._debouncedSearch.cancel(),this.controller.abort();return}this.prevSearch=t,this.isSearching=!0,this._debouncedSearch(t)},hasIdentifiers(){return De(this._hasIdentifiers)?this._hasIdentifiers:(this._hasIdentifiers=!!this.find(t=>j(t.get("identifiers"),"length")),this._hasIdentifiers)},_debouncedSearch(t){const e={search:t};delete this._hasIdentifiers,this.controller.abort(),this.controller=new AbortController;const s=this.fetch({data:{filter:e},signal:this.controller.signal});this.fetcher=s,s.then(()=>{this.fetcher===s&&(this.isSearching=!1,this.trigger("search",this))})}}),As=r.extend({Entity:{Model:Ot,Collection:$s},radioRequests:{"searchPatients:collection":"getCollection"}});new As;const Nt=(t,e)=>J(t,function(s){return Ue([e],[s])}),Yt="program-actions",{parseRelationship:Rs}=R,Lt=function(t,e){return!t||e==="owner"?t:Rs(t,e)},Wt=a.extend({urlRoot:"/api/program-actions",type:Yt,validate({name:t}){if(!v(t))return"Action name required"},getTags(){return o.request("entities","tags:collection",Nt(this.get("tags"),"text"))},addTag(t){const e=this.getTags();return e.add(t),this.save({tags:e.map("text")})},removeTag(t){const e=this.getTags();return e.remove(t),this.save({tags:e.map("text")})},getAction({patientId:t,flowId:e}){const s=o.request("bootstrap","currentUser"),i=o.request("bootstrap","currentWorkspace").getStates(),d=A(i.filter({status:Q.QUEUED}));return o.request("entities","actions:model",{name:this.get("name"),_flow:e,_patient:t,_state:d.id,_owner:this.get("_owner")||{id:s.id,type:"clinicians"},_program_action:this.id})},enableAttachmentUploads(){this.save({allowed_uploads:["pdf"]})},disableAttachmentUploads(){this.save({allowed_uploads:[]})},getOwner(){const t=this.get("_owner");if(t)return o.request("entities","teams:model",t.id)},saveOwner(t){return t=this.toRelation(t),this.save({_owner:t.data},{relationships:{owner:t}})},getForm(){const t=this.get("_form");if(t)return o.request("entities","forms:model",t)},hasOutreach(){return this.get("outreach")!==Y.DISABLED},isVisibleToCurrentUser(){const t=this.get("_teams"),s=o.request("bootstrap","currentUser").getTeam();return $(t)?!!t.find(n=>n.id===s.id):!0},saveForm(t){t=this.toRelation(t);const e={_form:t.data};return t.data||(e.outreach=Y.DISABLED),this.save(e,{relationships:{form:t}})},saveAll(t){t=_({},this.attributes,t);const e={owner:this.toRelation(t._owner,"teams"),form:this.toRelation(t._form,"forms"),"program-flow":this.toRelation(t._program_flow,"program-flows"),program:this.toRelation(t._program,"programs")};return this.save(t,{relationships:e},{wait:!0})},parseRelationship:Lt}),Vt=l(Wt,Yt),K=c.extend({initialize(t,e={}){this.flowId=e.flowId,this.flowId&&(this.comparator="sequence")},url(){return this.flowId?`/api/program-flows/${this.flowId}/actions`:"/api/program-actions"},model:Vt,parseRelationship:Lt,updateSequences(){const t=this.map((e,s)=>(e.set({sequence:s}),e.toJSONApi({sequence:s})));return this.sync("patch",this,{url:this.url(),data:JSON.stringify({data:t})})},filterAddable(){const t=this.clone(),e=this.filter(s=>{const n=!!s.get("published_at"),i=!!s.get("archived_at"),d=s.get("behavior")===D.AUTOMATED,h=s.isVisibleToCurrentUser();return n&&!i&&!d&&h});return t.reset(e),t}}),Es=r.extend({Entity:{_Model:Wt,Model:Vt,Collection:K},radioRequests:{"programActions:model":"getModel","programActions:collection":"getCollection","fetch:programActions:model":"fetchModel","fetch:programActions:collection:byProgram":"fetchProgramActionsByProgram","fetch:programActions:collection":"fetchProgramActions","fetch:programActions:collection:byProgramFlow":"fetchProgramActionsByFlow"},fetchProgramActionsByProgram({programId:t}){const e=`/api/programs/${t}/relationships/actions`;return this.fetchCollection({url:e})},fetchProgramActions(t=D.STANDARD){return new this.Entity.Collection().fetch({data:{filter:{behavior:t}}})},fetchProgramActionsByFlow(t,e){return new K([],{flowId:t}).fetch(e)}});new Es;const Ht="program-flows",{parseRelationship:Ms}=R,Jt=function(t,e){return!t||e==="owner"?t:Ms(t,e)},jt=a.extend({urlRoot(){return this.isNew()?`/api/programs/${this.get("_program")}/relationships/flows`:"/api/program-flows"},type:Ht,validate({name:t}){if(!v(t))return"Flow name required"},getTags(){return o.request("entities","tags:collection",Nt(this.get("tags"),"text"))},addTag(t){const e=this.getTags();return e.add(t),this.save({tags:e.map("text")})},removeTag(t){const e=this.getTags();return e.remove(t),this.save({tags:e.map("text")})},getOwner(){const t=this.get("_owner");if(t)return o.request("entities","teams:model",t.id)},getFlow(t){const s=o.request("bootstrap","currentWorkspace").getStates(),n=A(s.filter({status:Q.QUEUED}));return o.request("entities","flows:model",{_patient:t,_program_flow:this.get("id"),_state:n.id})},saveOwner(t){return t=this.toRelation(t),this.save({_owner:t.data},{relationships:{owner:t}})},saveAll(t){t=_({},this.attributes,t);const e={owner:this.toRelation(t._owner,"teams")};return this.save(t,{relationships:e},{wait:!0})},getActions(){return o.request("entities","programActions:collection",this.get("_program_actions"),{flowId:this.id})},getAddableActions(){return this.getActions().filterAddable()},isVisibleToCurrentUser(){const t=this.get("_teams"),s=o.request("bootstrap","currentUser").getTeam();return $(t)?!!t.find(n=>n.id===s.id):!0},parseRelationship:Jt}),Gt=l(jt,Ht),Cs=c.extend({url:"/api/program-flows",model:Gt,parseRelationship:Jt,filterAddable(){const t=this.clone(),e=this.filter(s=>{const n=!!s.get("published_at"),i=!!s.get("archived_at"),d=s.get("behavior")===D.AUTOMATED,h=s.isVisibleToCurrentUser();return n&&!i&&!d&&h});return t.reset(e),t}}),xs=r.extend({Entity:{_Model:jt,Model:Gt,Collection:Cs},radioRequests:{"programFlows:model":"getModel","programFlows:collection":"getCollection","fetch:programFlows:model":"fetchModel","fetch:programFlows:collection:byProgram":"fetchProgramFlowsByProgram","fetch:programFlows:collection":"fetchProgramFlows"},fetchProgramFlowsByProgram({programId:t}){const e=`/api/programs/${t}/relationships/flows`;return this.fetchCollection({url:e})},fetchProgramFlows(t=D.STANDARD){return new this.Entity.Collection().fetch({data:{filter:{behavior:t}}})}});new xs;const Qt="programs",zt=a.extend({type:Qt,validate({name:t}){if(!v(t))return"Program name required"},urlRoot:"/api/programs",getAddable(){const t=o.request("entities","programActions:collection",this.get("_program_actions")),e=o.request("entities","programFlows:collection",this.get("_program_flows")),s=t.filterAddable(),n=e.filterAddable();return new tt.Collection([...n.models,...s.models],{comparator:"name"})}}),Xt=l(zt,Qt),Ts=c.extend({url:"/api/programs",model:Xt}),bs=r.extend({Entity:{_Model:zt,Model:Xt,Collection:Ts},radioRequests:{"programs:model":"getModel","programs:collection":"getCollection","fetch:programs:model":"fetchModel","fetch:programs:collection":"fetchCollection","fetch:programs:model:byProgramFlow":"fetchProgramByProgramFlow"},fetchProgramByProgramFlow(t){return this.fetchBy(`/api/program-flows/${t}/program`)}});new bs;const Kt="roles",Zt=a.extend({type:Kt,urlRoot:"/api/roles"}),te=l(Zt,Kt),Ps=c.extend({url:"/api/roles",model:te}),qs=r.extend({Entity:{_Model:Zt,Model:te,Collection:Ps},radioRequests:{"roles:model":"getModel","roles:collection":"getCollection","fetch:roles:collection":"fetchCollection"}});new qs;const ee="settings",se=a.extend({type:ee,urlRoot:"/api/settings"}),oe=l(se,ee),ks=c.extend({url:"/api/settings",model:oe}),Ss=r.extend({Entity:{_Model:se,Model:oe,Collection:ks},radioRequests:{"settings:model":"getModel","fetch:settings:collection":"fetchCollection"}});new Ss;const ne="states",ie=a.extend({type:ne,isDone(){return this.get("status")===Q.DONE}}),re=l(ie,ne),V=c.extend({url:"/api/states",model:re,comparator:"sequence",groupByDone(){const{done:t,notDone:e}=this.groupBy(s=>s.isDone()?"done":"notDone");return{done:new V(t),notDone:new V(e)}},getFilterIds(){return this.map("id").join(",")}}),Ds=r.extend({Entity:{_Model:ie,Model:re,Collection:V},radioRequests:{"states:model":"getModel","states:collection":"getCollection","fetch:states:collection":"fetchCollection"}});new Ds;const ae="tags",ce=a.extend({type:ae,idAttribute:"text"}),le=l(ce,ae),Us=c.extend({url:"/api/tags",model:le,parse(t){return J(t.data,e=>({text:e}))},comparator:"text"});let B;const Fs=r.extend({Entity:{_Model:ce,Model:le,Collection:Us},radioRequests:{"tags:model":"getModel","tags:collection":"getCollection","fetch:tags:collection":"fetchTags"},fetchTags(){return B||this.fetchCollection().then(t=>(B=t,t))}});new Fs;const de="teams",he=a.extend({type:de,urlRoot:"/api/teams",getAssignableClinicians(){return o.request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()}}),ue=l(he,de),Is=c.extend({url:"/api/teams",model:ue,comparator:"name"}),Bs=r.extend({Entity:{_Model:he,Model:ue,Collection:Is},radioRequests:{"teams:model":"getModel","teams:collection":"getCollection","fetch:teams:collection":"fetchCollection"}});new Bs;const fe="widget-values",pe=a.extend({type:fe}),H=l(pe,fe);c.extend({model:H});const Os=r.extend({Entity:{_Model:pe,Model:H},radioRequests:{"get:widgetValues:model":"getByPatient","fetch:widgetValues:byPatient":"fetchByPatient"},fetchByPatient(t,e){const s=this.getByPatient(t.get("slug"),e),n=t.get("values");if(G(n))return s;const i={filter:{patient:e}};return s.fetch({url:`/api/widgets/${t.get("slug")}/values`,data:i})},getByPatient(t,e){return nt(e)||(e=S(e,ot)),new H({id:S(t,e),name:t})}});new Os;const ge="widgets",me=a.extend({type:ge,fetchValues(t){return o.request("entities","fetch:widgetValues:byPatient",this,t)}}),we=l(me,ge),Ns=c.extend({url:"/api/widgets",model:we,modelId(t){return Fe(`${t.slug}-`)}}),Ys=r.extend({Entity:{_Model:me,Model:we,Collection:Ns},radioRequests:{"widgets:model":"getModel","widgets:collection":"getCollection","fetch:widgets:collection":"fetchWidgets"},fetchWidgets({filter:t={}}={}){const e={filter:t};return this.fetchCollection({data:e})}});new Ys;const _e="workspace-patients",ye=a.extend({type:_e,urlRoot:"/api/workspace-patients",saveAll(t){const e={type:"PUT"},s={workspace:this.toRelation(this.get("_workspace"),"workspaces"),patient:this.toRelation(this.get("_patient"),"patients")};this.save(t,{relationships:s},e)},canEdit(){return o.request("bootstrap","currentUser").can("patients:manage")}}),Z=l(ye,_e),Ls=r.extend({Entity:{_Model:ye,Model:Z},radioRequests:{"get:workspacePatients:model":"getByPatient","fetch:workspacePatients:byPatient":"fetchByPatient"},fetchByPatient(t){return this.getByPatient(t).fetch()},getByPatient(t){const s=o.request("bootstrap","currentWorkspace").id;return new Z({id:S(t,s),_patient:t,_workspace:s})}});new Ls;const ve="workspaces",$e=a.extend({type:ve,urlRoot:"/api/workspaces",getStates(){return o.request("entities","states:collection",this.get("_states"))},getForms(){return o.request("entities","forms:collection",this.get("_forms"))},getAssignableClinicians(){return o.request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()},updateClinicians(t){this.set("_clinicians",t.map(e=>Ie(e,"id","type")))},addClinician(t){const e=`/api/workspaces/${this.id}/relationships/clinicians`,s=t.get("_workspaces");return t.set({_workspaces:N(s,[{id:this.id}])}),this.set({_clinicians:N(this.get("_clinicians"),[{id:t.id}])}),this.sync("create",this,{url:e,data:JSON.stringify({data:[{id:t.id,type:t.type}]})})},removeClinician(t){const e=`/api/workspaces/${this.id}/relationships/clinicians`;return t.set({_workspaces:O(t.get("_workspaces"),{id:this.id})}),this.set({_clinicians:O(this.get("_clinicians"),{id:t.id})}),this.sync("delete",this,{url:e,data:JSON.stringify({data:[{id:t.id,type:t.type}]})})}}),Ae=l($e,ve),Ws=c.extend({url:"/api/workspaces",model:Ae,comparator:"name"}),Vs=r.extend({Entity:{_Model:$e,Model:Ae,Collection:Ws},radioRequests:{"workspaces:model":"getModel","workspaces:collection":"getCollection","fetch:workspaces:collection":"fetchCollection"}});new Vs;export{P as A,L as F,ot as N,D as P,Qs as R,Q as S,hs as a,Y as b,Nt as c,q as d,zs as n};
