"use strict";(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[329],{4329:(e,t,i)=>{var s=i(4822),o=i(8088),n=i.n(o),r=i(7198),a=i(7739),l=i.n(a),c=i(7027),d=i(9203),h=i.n(d),u=i(4257),p=i(3018),g=i(1267),m=i(1441),f=i(1188);const w="patient-actions",{parseRelationship:_}=g.default,y=function(e,t){return e&&"owner"!==t?_(e,t):e},R=p.Z.extend({urlRoot(){if(this.isNew()){const e=this.get("_flow");return e?`/api/flows/${e}/relationships/actions`:`/api/patients/${this.get("_patient")}/relationships/actions`}return"/api/actions"},type:w,validate({name:e}){if(!(0,m.Z)(e))return"Action name required"},hasTag(e){return(0,r.contains)(this.get("tags"),e)},getForm(){const e=this.get("_form");if(e)return l().request("entities","forms:model",e)},getFormResponses(){return l().request("entities","formResponses:collection",this.get("_form_responses"))},getPatient(){return l().request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner");return l().request("entities",`${e.type}:model`,e.id)},isSameTeamAsUser(){const e=l().request("bootstrap","currentUser").getTeam(),t=this.getOwner();return e===("teams"===t.type?t:t.getTeam())},getAuthor(){return l().request("entities","clinicians:model",this.get("_author"))},getFlow(){if(this.get("_flow"))return l().request("entities","flows:model",this.get("_flow"))},getState(){return l().request("entities","states:model",this.get("_state"))},getPreviousState(){return l().request("entities","states:model",this.previous("_state"))},isLocked(){return!!this.get("locked_at")},isDone(){return this.getState().isDone()},isFlowDone(){const e=this.getFlow();return e&&e.isDone()},isOverdue(){if(this.isDone())return!1;const e=this.get("due_date"),t=this.get("due_time");if(!t)return h()(e).isBefore(h()(),"day");const i=h()(`${e} ${t}`);return i.isBefore(h()(),"day")||i.isBefore(h()(),"minute")},isAdHoc(){return!this.get("_program_action")&&!this.get("_flow")},hasOutreach(){return this.get("outreach")!==f.Ww.DISABLED},hasSharing(){return this.get("sharing")!==f.q$.DISABLED},canEdit(){const e=l().request("bootstrap","currentUser");return!!e.can("work:manage")||!(!e.can("work:owned:manage")||this.getOwner()!==e)||!(!e.can("work:team:manage")||!this.isSameTeamAsUser())},canSubmit(){const e=l().request("bootstrap","currentUser");return!!e.can("work:submit")||!(!e.can("work:owned:submit")||this.getOwner()!==e)||!(!e.can("work:team:submit")||!this.isSameTeamAsUser())},canDelete(){if(!this.canEdit())return!1;const e=l().request("bootstrap","currentUser");return!!e.can("work:delete")||!(!e.can("work:owned:delete")||this.getOwner()!==e)||!(!e.can("work:authored:delete")||this.getAuthor()!==e)},saveDueDate(e){return e?this.save({due_date:e.format("YYYY-MM-DD")}):this.save({due_date:null,due_time:null})},saveDueTime(e){return e?this.save({due_time:e}):this.save({due_time:null})},saveState(e){const t={_state:e.id},i=this.get("sharing");return e.isDone()&&![f.q$.DISABLED,f.q$.RESPONDED].includes(i)&&(t.sharing=f.q$.CANCELED),this.save(t,{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},saveAll(e){this.isNew()&&(e=(0,r.extend)({},this.attributes,e));const t={flow:this.toRelation(e._flow,"flows"),form:this.toRelation(e._form,"forms"),owner:this.toRelation(e._owner),state:this.toRelation(e._state,"states"),"program-action":this.toRelation(e._program_action,"program-actions")};return this.save(e,{relationships:t},{wait:!0})},hasAttachments(){return!!(0,r.size)(this.get("_files"))},hasAllowedUploads(){if(!this.canEdit())return!1;const e=l().request("entities","programActions:model",this.get("_program_action"));return!!(0,r.size)(e.get("allowed_uploads"))},parseRelationship:y}),v=(0,c.Z)(R,w),A=u.Z.extend({url:"/api/actions",model:v,parseRelationship:y,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},groupByDate(){const e=this.groupBy("due_date");return(0,r.reduce)((0,r.keys)(e),((t,i)=>(t.add({date:i,actions:new A(e[i])}),t)),new(n().Collection)([]))}});new(s.Z.extend({Entity:{_Model:R,Model:v,Collection:A},radioRequests:{"actions:model":"getModel","actions:collection":"getCollection","fetch:actions:model":"fetchAction","fetch:actions:collection":"fetchCollection","fetch:actions:withResponses":"fetchActionWithResponses","fetch:actions:collection:byPatient":"fetchActionsByPatient","fetch:actions:collection:byFlow":"fetchActionsByFlow"},fetchAction(e){const t=["program-action.program","flow.program-flow.program"].join();return this.fetchModel(e,{data:{include:t}})},fetchActionWithResponses(e){return this.fetchModel(e,{data:{include:["form-responses"],fields:{"form-responses":["status","created_at","editor"]}}})},fetchActionsByPatient({patientId:e,filter:t}){const i={filter:t},s=`/api/patients/${e}/relationships/actions`;return this.fetchCollection({url:s,data:i})},fetchActionsByFlow(e){const t=`/api/flows/${e}/relationships/actions`;return this.fetchCollection({url:t})}}));var q=i(5245),Z=i(7948);const b="clinicians",C=p.Z.extend({type:b,urlRoot:"/api/clinicians",preinitialize(){this.on("change:_team",this.onChangeTeam)},validate:e=>(0,m.Z)(e.name)?(0,m.Z)(e.email)?e._role?void 0:"A clinician role is required":"A clinician email address is required":"A clinician name is required",onChangeTeam(){const e=l().request("entities","teams:model",this.previous("_team"));e.set("_clinicians",(0,r.reject)(e.get("_clinicians"),{id:this.id}));const t=l().request("entities","teams:model",this.get("_team"));t.set("_clinicians",(0,r.union)(t.get("_clinicians"),[{id:this.id}]))},getWorkspaces(){return l().request("entities","workspaces:collection",this.get("_workspaces"))},addWorkspace(e){const t=this.getWorkspaces();t.add(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},removeWorkspace(e){const t=this.getWorkspaces();t.remove(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},getTeam(){return l().request("entities","teams:model",this.get("_team"))},hasTeam(){const e=this.get("_team");return e&&e!==Z.Z},getRole(){return l().request("entities","roles:model",this.get("_role"))},can(e){const t=this.getRole().get("permissions");return(0,r.includes)(t,e)},saveRole(e){return this.save({_role:e.id},{relationships:{role:this.toRelation(e)}})},saveTeam(e){return this.save({_team:e.id},{relationships:{team:this.toRelation(e)}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={workspaces:this.toRelation(e._workspaces,"workspaces"),team:this.toRelation(e._team,"teams"),role:this.toRelation(e._role,"roles")};return this.save(e,{relationships:t},{wait:!0})},getInitials(){const e=String(this.get("name")).split(" ");return 1===e.length?(0,r.first)(e).charAt(0):`${(0,r.first)(e).charAt(0)}${(0,r.last)(e).charAt(0)}`},isEditable(){return!this.get("last_active_at")},isActive(){const e=this.hasTeam(),t=!!(0,r.size)(this.get("_workspaces")),i=this.get("last_active_at");return e&&t&&i}}),x=(0,c.Z)(C,b),M=u.Z.extend({url:"/api/clinicians",model:x,comparator:"name",filterAssignable(){const e=this.clone(),t=this.filter((e=>e.isActive()&&e.get("enabled")&&e.can("work:own")));return e.reset(t),e}}),E=(new(s.Z.extend({Entity:{_Model:C,Model:x,Collection:M},radioRequests:{"clinicians:model":"getModel","clinicians:collection":"getCollection","fetch:clinicians:collection":"fetchCollection","fetch:clinicians:current":"fetchCurrentClinician","fetch:clinicians:model":"fetchModel","fetch:clinicians:byWorkspace":"fetchByWorkspace"},fetchCurrentClinician(){return this.fetchBy("/api/clinicians/me").then((e=>((0,q.av)(e.pick("id","name","email")),e)))},fetchByWorkspace(e){const t=`/api/workspaces/${e}/relationships/clinicians`;return this.fetchCollection({url:t})}})),"comments"),k=p.Z.extend({type:E,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/comments`:"/api/comments"},validate({message:e}){if(!(0,m.Z)(e))return"Comment message required."},getClinician(){return l().request("entities","clinicians:model",this.get("_clinician"))}}),D=(0,c.Z)(k,E),F=u.Z.extend({model:D}),P=(new(s.Z.extend({Entity:{_Model:k,Model:D,Collection:F},radioRequests:{"comments:model":"getModel","fetch:comments:collection:byAction":"fetchCommentsByAction"},fetchCommentsByAction(e){const t=`/api/actions/${e}/relationships/comments`;return this.fetchCollection({url:t})}})),"dashboards"),T=p.Z.extend({type:P,urlRoot:"/api/dashboards"}),B=(0,c.Z)(T,P),S=u.Z.extend({url:"/api/dashboards",model:B}),O=(new(s.Z.extend({Entity:{_Model:T,Model:B,Collection:S},radioRequests:{"dashboards:model":"getModel","dashboards:collection":"getCollection","fetch:dashboards:model":"fetchModel","fetch:dashboards:collection":"fetchCollection"}})),p.Z.extend({type:"directories",url(){return`/api/directory/${this.get("slug")}`},getOptions(){if(this.options)return this.options;const e=(0,r.map)(this.get("value"),(e=>({name:e,id:e})));return this.options=new u.Z(e),this.options}})),$=u.Z.extend({url:"/api/directories",model:O}),I=(new(s.Z.extend({Entity:{Model:O,Collection:$},radioRequests:{"directories:collection":"getCollection","fetch:directories:model":"fetchDirectory","fetch:directories:filterable":"fetchFilterable"},fetchDirectory:(e,t)=>new O({slug:e}).fetch({data:t}),fetchFilterable(){return this.fetchCollection({data:{filter:{filterable:!0}}})}})),"events"),N=p.Z.extend({type:I,getClinician(){return l().request("entities","clinicians:model",this.get("_clinician"))},getRecipient(){if(this.get("_recipient"))return l().request("entities","patients:model",this.get("_recipient"))},getEditor(){return this.get("_editor")?l().request("entities","clinicians:model",this.get("_editor")):l().request("entities","clinicians:model",{name:"RoundingWell"})},getTeam(){return l().request("entities","teams:model",this.get("_team"))},getState(){return l().request("entities","states:model",this.get("_state"))},getProgram(){if(this.get("_program"))return l().request("entities","programs:model",this.get("_program"))},getForm(){if(this.get("_form"))return l().request("entities","forms:model",this.get("_form"))}}),U=(0,c.Z)(N,I),W=u.Z.extend({model:U}),L=(new(s.Z.extend({Entity:{_Model:N,Model:U,Collection:W},radioRequests:{"events:model":"getModel","events:collection":"getCollection","fetch:actionEvents:collection":"fetchActionEvents","fetch:flowEvents:collection":"fetchFlowEvents"},fetchActionEvents(e){return this.fetchCollection({url:`/api/actions/${e}/activity`})},fetchFlowEvents(e){return this.fetchCollection({url:`/api/flows/${e}/activity`})}})),"files"),z=p.Z.extend({defaults:{path:"",_progress:0},type:L,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/files?urls=upload`:"/api/files"},fetchFile(){return this.fetch({url:`${this.url()}?urls=download,view`})},createUpload(e){const t=`patient/${this.get("_patient")}/${e}`;return this.save({path:t,_progress:0},{},{type:"PUT"}).catch((({responseData:t}={})=>{if((0,r.get)((0,r.first)(t.errors),"detail","").includes("Another file exists"))return this.createUpload(function(e){const t=e.lastIndexOf(".");return`${e.slice(0,t)}-copy${e.slice(t)}`}(e));throw t}))},upload(e){this.createUpload(e.name).then((()=>this.putFile(e))).then((()=>this.fetchFile())).catch((()=>{this.trigger("upload:failed"),this.destroy()}))},putFile(e){const t=e.size;return new Promise(((i,s)=>{const o=new XMLHttpRequest;o.onreadystatechange=()=>{4===o.readyState&&(200===o.status?(this.set({_progress:100}),i()):s())},o.upload.onprogress=e=>{e.lengthComputable&&this.set({_progress:Math.round(e.loaded/t*100)})},o.open("PUT",this.get("_upload")),o.send(e)}))},getFilename(){return this.get("path").split("/").pop()}}),j=(0,c.Z)(z,L),Y=u.Z.extend({model:j}),Q=(new(s.Z.extend({Entity:{_Model:z,Model:j,Collection:Y},radioRequests:{"files:model":"getModel","fetch:files:collection:byAction":"fetchFilesByAction"},fetchFilesByAction(e){const t=`/api/actions/${e}/relationships/files`;return this.fetchCollection({url:t,data:{urls:["download","view"]}})}})),"flows"),{parseRelationship:J}=g.default,H=function(e,t){return e&&"owner"!==t?J(e,t):e},X=p.Z.extend({urlRoot(){return this.isNew()?`/api/patients/${this.get("_patient")}/relationships/flows`:"/api/flows"},type:Q,getPatient(){return l().request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner");return l().request("entities",`${e.type}:model`,e.id)},getAuthor(){return l().request("entities","clinicians:model",this.get("_author"))},getState(){return l().request("entities","states:model",this.get("_state"))},getProgramFlow(){return l().request("entities","programFlows:model",this.get("_program_flow"))},isDone(){return this.getState().isDone()},isAllDone(){const{complete:e,total:t}=this.get("_progress");return e===t},canEdit(){const e=l().request("bootstrap","currentUser");if(e.can("work:manage"))return!0;if(e.can("work:owned:manage")&&this.getOwner()===e)return!0;if(e.can("work:team:manage")){const t=this.getOwner();if(e.getTeam()===("teams"===t.type?t:t.getTeam()))return!0}return!1},canDelete(){if(!this.canEdit())return!1;const e=l().request("bootstrap","currentUser");return!!e.can("work:delete")||!(!e.can("work:owned:delete")||this.getOwner()!==e)||!(!e.can("work:authored:delete")||this.getAuthor()!==e)},saveState(e){return this.save({_state:e.id},{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},applyOwner(e){const t=`${this.url()}/relationships/actions`,i={owner:this.toRelation(e)};return this.save({},{relationships:i},{url:t})},saveAll(e){this.isNew()&&(e=(0,r.extend)({},this.attributes,e));const t={state:this.toRelation(e._state,"states"),owner:this.toRelation(e._owner),"program-flow":this.toRelation(e._program_flow,"program-flows")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:H}),G=(0,c.Z)(X,Q),V=u.Z.extend({url:"/api/flows",model:G,parseRelationship:H,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},applyOwner(e){const t=this.invoke("applyOwner",e);return Promise.all(t)}});new(s.Z.extend({Entity:{_Model:X,Model:G,Collection:V},radioRequests:{"flows:model":"getModel","flows:collection":"getCollection","fetch:flows:model":"fetchFlow","fetch:flows:collection":"fetchCollection","fetch:flows:collection:byPatient":"fetchFlowsByPatient"},fetchFlow(e){const t=["program-flow","program-flow.program","program-flow.program-actions"].join();return this.fetchModel(e,{data:{include:t}})},fetchFlowsByPatient({patientId:e,filter:t}){const i={filter:t},s=`/api/patients/${e}/relationships/flows`;return this.fetchCollection({url:s,data:i})}})),i(8380);var K=i(4861);const ee="form-responses",{parseRelationship:te}=g.default,ie=function(e,t){return"editor"===t?e:te(e,t)},se=p.Z.extend({type:ee,urlRoot:"/api/form-responses",saveAll(){const e=this.attributes,t={form:this.toRelation(e._form,"forms"),patient:this.toRelation(e._patient,"patients"),action:this.toRelation(e._action,"patient-actions")};return this.save(e,{relationships:t},{wait:!0})},getDraft(){if(this.get("status")===f.zB.DRAFT)return{updated:this.get("created_at"),submission:this.getResponse()}},getResponse(){return(0,r.get)(this.get("response"),"data",{})},getFormData(){return(0,r.omit)(this.get("response"),"data")},parseRelationship:ie}),oe=(0,c.Z)(se,ee),ne=u.Z.extend({url:"/api/form-responses",model:oe,parseRelationship:ie,comparator:(e,t)=>(0,K.XQ)("desc",e.get("created_at"),t.get("created_at")),getFirstSubmission(){return this.find({status:f.zB.SUBMITTED})},filterSubmissions(){const e=this.clone(),t=this.filter({status:f.zB.SUBMITTED});return e.reset(t),e}});new(s.Z.extend({Entity:{_Model:se,Model:oe,Collection:ne},radioRequests:{"formResponses:model":"getModel","formResponses:collection":"getCollection","fetch:formResponses:model":"fetchFormResponse","fetch:formResponses:latest":"fetchLatestResponse"},fetchFormResponse(e,t){return e?this.fetchModel(e,t):new oe},fetchLatestResponse(e){const t=(0,r.reduce)(e,((e,t,i)=>t?(e.filter[i]=t,e):e),{filter:{}});return this.fetchBy("/api/form-responses/latest",{data:t}).then((e=>e||new oe))}}));var re=i(5992);const ae="patient-fields",le=p.Z.extend({type:ae,url(){return`/api/patients/${this.get("_patient")}/fields/${this.get("name")}`},isNew:()=>!1,getValue(){const e=this.get("value");return(0,r.isObject)(e)&&(0,r.isEmpty)(e)?null:e},saveAll(e){(e=(0,r.extend)({},this.attributes,e)).id||this.set({id:(0,re.Z)(`resource:field:${e.name.toLowerCase()}`,e._patient)});const t={patient:this.toRelation(e._patient,"patients")};return this.save(e,{relationships:t},{wait:!0})}}),ce=(0,c.Z)(le,ae),de=u.Z.extend({model:ce}),he=(new(s.Z.extend({Entity:{_Model:le,Model:ce,Collection:de},radioRequests:{"patientFields:model":"getModel","patientFields:collection":"getCollection","fetch:patientFields:model":"fetchPatientField"},fetchPatientField(e,t){const i=`/api/patients/${e}/fields/${t}`;return this.fetchModel(t,{url:i,abort:!1}).then((e=>{this.getModel(e.attributes)}))}})),"patients"),ue=p.Z.extend({type:he,urlRoot:"/api/patients",validate({first_name:e,last_name:t,birth_date:i,sex:s}){const o={};if(e&&t||(o.name="required"),s||(o.sex="required"),i?h()(i).isAfter()&&(o.birth_date="invalidDate"):o.birth_date="required",!(0,r.isEmpty)(o))return o},getWorkspaces(){return l().request("entities","workspaces:collection",this.get("_workspaces"))},getFields(){return l().request("entities","patientFields:collection",this.get("_patient_fields"))},getField(e){return this.getFields().find({name:e})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={wait:!0};return this.isNew()&&(t.type="PUT"),this.save(e,{},t)},canEdit(){return this.isNew()||"manual"===this.get("source")},getSortName(){return(this.get("last_name")+this.get("first_name")).toLowerCase()},getStatus(){return l().request("entities","get:workspacePatients:model",this.id).get("status")}}),pe=(0,c.Z)(ue,he),ge=u.Z.extend({url:"/api/patients",model:pe}),me=(new(s.Z.extend({Entity:{_Model:ue,Model:pe,Collection:ge},radioRequests:{"patients:model":"getModel","patients:collection":"getCollection","fetch:patients:model":"fetchModel","fetch:patients:model:byAction":"fetchPatientByAction","fetch:patients:model:byFlow":"fetchPatientByFlow"},fetchPatientByAction(e){return this.fetchBy(`/api/actions/${e}/patient`)},fetchPatientByFlow(e){return this.fetchBy(`/api/flows/${e}/patient`)}})),p.Z.extend({type:"patients-search-results"})),fe=u.Z.extend({url:"/api/patients",model:me,initialize(){this._debouncedSearch=(0,r.debounce)(this._debouncedSearch,150)},prevSearch:"",controller:new AbortController,search(e=""){if(e.length<3)return e.length&&this.prevSearch.includes(e)||(delete this._hasIdentifiers,this.reset(),this.prevSearch=""),this._debouncedSearch.cancel(),void this.controller.abort();this.prevSearch=e,this.isSearching=!0,this._debouncedSearch(e)},hasIdentifiers(){return(0,r.isBoolean)(this._hasIdentifiers)||(this._hasIdentifiers=!!this.find((e=>(0,r.get)(e.get("identifiers"),"length")))),this._hasIdentifiers},_debouncedSearch(e){const t={search:e};delete this._hasIdentifiers,this.controller.abort(),this.controller=new AbortController;const i=this.fetch({data:{filter:t},signal:this.controller.signal});this.fetcher=i,i.then((()=>{this.fetcher===i&&(this.isSearching=!1,this.trigger("search",this))}))}});new(s.Z.extend({Entity:{Model:me,Collection:fe},radioRequests:{"searchPatients:collection":"getCollection"}}));var we=i(1962);const _e="program-actions",{parseRelationship:ye}=g.default,Re=function(e,t){return e&&"owner"!==t?ye(e,t):e},ve=p.Z.extend({urlRoot:"/api/program-actions",type:_e,validate({name:e}){if(!(0,m.Z)(e))return"Action name required"},getTags(){return l().request("entities","tags:collection",(0,we.Z)(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getAction({patientId:e,flowId:t}){const i=l().request("bootstrap","currentUser"),s=l().request("bootstrap","currentWorkspace").getStates(),o=(0,r.first)(s.filter({status:f.lO.QUEUED}));return l().request("entities","actions:model",{name:this.get("name"),_flow:t,_patient:e,_state:o.id,_owner:this.get("_owner")||{id:i.id,type:"clinicians"},_program_action:this.id})},enableAttachmentUploads(){this.save({allowed_uploads:["pdf"]})},disableAttachmentUploads(){this.save({allowed_uploads:[]})},getOwner(){const e=this.get("_owner");if(e)return l().request("entities","teams:model",e.id)},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},getForm(){const e=this.get("_form");if(e)return l().request("entities","forms:model",e)},hasOutreach(){return this.get("outreach")!==f.Ww.DISABLED},saveForm(e){const t={_form:(e=this.toRelation(e)).data};return e.data||(t.outreach=f.Ww.DISABLED),this.save(t,{relationships:{form:e}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams"),form:this.toRelation(e._form,"forms"),"program-flow":this.toRelation(e._program_flow,"program-flows"),program:this.toRelation(e._program,"programs")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:Re}),Ae=(0,c.Z)(ve,_e),qe=u.Z.extend({initialize(e,t={}){this.flowId=t.flowId,this.flowId&&(this.comparator="sequence")},url(){return this.flowId?`/api/program-flows/${this.flowId}/actions`:"/api/program-actions"},model:Ae,parseRelationship:Re,updateSequences(){const e=this.map(((e,t)=>(e.set({sequence:t}),e.toJSONApi({sequence:t}))));return this.sync("patch",this,{url:this.url(),data:JSON.stringify({data:e})})},filterAddable(){const e=this.clone(),t=this.filter((e=>{const t=!!e.get("published_at"),i=!!e.get("archived_at"),s=e.get("behavior")===f.g6.AUTOMATED;return t&&!i&&!s}));return e.reset(t),e}}),Ze=(new(s.Z.extend({Entity:{_Model:ve,Model:Ae,Collection:qe},radioRequests:{"programActions:model":"getModel","programActions:collection":"getCollection","fetch:programActions:model":"fetchModel","fetch:programActions:collection:byProgram":"fetchProgramActionsByProgram","fetch:programActions:collection":"fetchProgramActions","fetch:programActions:collection:byProgramFlow":"fetchProgramActionsByFlow"},fetchProgramActionsByProgram({programId:e}){const t=`/api/programs/${e}/relationships/actions`;return this.fetchCollection({url:t})},fetchProgramActions(e=f.g6.STANDARD){return(new this.Entity.Collection).fetch({data:{filter:{behavior:e}}})},fetchProgramActionsByFlow:(e,t)=>new qe([],{flowId:e}).fetch(t)})),"program-flows"),{parseRelationship:be}=g.default,Ce=function(e,t){return e&&"owner"!==t?be(e,t):e},xe=p.Z.extend({urlRoot(){return this.isNew()?`/api/programs/${this.get("_program")}/relationships/flows`:"/api/program-flows"},type:Ze,validate({name:e}){if(!(0,m.Z)(e))return"Flow name required"},getTags(){return l().request("entities","tags:collection",(0,we.Z)(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getOwner(){const e=this.get("_owner");if(e)return l().request("entities","teams:model",e.id)},getFlow(e){const t=l().request("bootstrap","currentWorkspace").getStates(),i=(0,r.first)(t.filter({status:f.lO.QUEUED}));return l().request("entities","flows:model",{_patient:e,_program_flow:this.get("id"),_state:i.id})},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams")};return this.save(e,{relationships:t},{wait:!0})},getActions(){return l().request("entities","programActions:collection",this.get("_program_actions"),{flowId:this.id})},getAddableActions(){return this.getActions().filterAddable()},parseRelationship:Ce}),Me=(0,c.Z)(xe,Ze),Ee=u.Z.extend({url:"/api/program-flows",model:Me,parseRelationship:Ce,filterAddable(){const e=this.clone(),t=this.filter((e=>{const t=!!e.get("published_at"),i=!!e.get("archived_at"),s=e.get("behavior")===f.g6.AUTOMATED;return t&&!i&&!s}));return e.reset(t),e}}),ke=(new(s.Z.extend({Entity:{_Model:xe,Model:Me,Collection:Ee},radioRequests:{"programFlows:model":"getModel","programFlows:collection":"getCollection","fetch:programFlows:model":"fetchModel","fetch:programFlows:collection:byProgram":"fetchProgramFlowsByProgram","fetch:programFlows:collection":"fetchProgramFlows"},fetchProgramFlowsByProgram({programId:e}){const t=`/api/programs/${e}/relationships/flows`;return this.fetchCollection({url:t})},fetchProgramFlows(e=f.g6.STANDARD){return(new this.Entity.Collection).fetch({data:{filter:{behavior:e}}})}})),"programs"),De=p.Z.extend({type:ke,validate({name:e}){if(!(0,m.Z)(e))return"Program name required"},urlRoot:"/api/programs",getAddable(){const e=l().request("entities","programActions:collection",this.get("_program_actions")),t=l().request("entities","programFlows:collection",this.get("_program_flows")),i=e.filterAddable(),s=t.filterAddable();return new(n().Collection)([...s.models,...i.models],{comparator:"name"})}}),Fe=(0,c.Z)(De,ke),Pe=u.Z.extend({url:"/api/programs",model:Fe}),Te=(new(s.Z.extend({Entity:{_Model:De,Model:Fe,Collection:Pe},radioRequests:{"programs:model":"getModel","programs:collection":"getCollection","fetch:programs:model":"fetchModel","fetch:programs:collection":"fetchCollection","fetch:programs:model:byProgramFlow":"fetchProgramByProgramFlow"},fetchProgramByProgramFlow(e){return this.fetchBy(`/api/program-flows/${e}/program`)}})),"roles"),Be=p.Z.extend({type:Te,urlRoot:"/api/roles"}),Se=(0,c.Z)(Be,Te),Oe=u.Z.extend({url:"/api/roles",model:Se}),$e=(new(s.Z.extend({Entity:{_Model:Be,Model:Se,Collection:Oe},radioRequests:{"roles:model":"getModel","roles:collection":"getCollection","fetch:roles:collection":"fetchCollection"}})),"settings"),Ie=p.Z.extend({type:$e,urlRoot:"/api/settings"}),Ne=(0,c.Z)(Ie,$e),Ue=u.Z.extend({url:"/api/settings",model:Ne}),We=(new(s.Z.extend({Entity:{_Model:Ie,Model:Ne,Collection:Ue},radioRequests:{"settings:model":"getModel","fetch:settings:collection":"fetchCollection"}})),"states"),Le=p.Z.extend({type:We,isDone(){return this.get("status")===f.lO.DONE}}),ze=(0,c.Z)(Le,We),je=u.Z.extend({url:"/api/states",model:ze,comparator:"sequence",groupByDone(){const{done:e,notDone:t}=this.groupBy((e=>e.isDone()?"done":"notDone"));return{done:new je(e),notDone:new je(t)}},getFilterIds(){return this.map("id").join(",")}}),Ye=(new(s.Z.extend({Entity:{_Model:Le,Model:ze,Collection:je},radioRequests:{"states:model":"getModel","states:collection":"getCollection","fetch:states:collection":"fetchCollection"}})),"tags"),Qe=p.Z.extend({type:Ye,idAttribute:"text"}),Je=(0,c.Z)(Qe,Ye),He=u.Z.extend({url:"/api/tags",model:Je,parse:e=>(0,r.map)(e.data,(e=>({text:e}))),comparator:"text"});let Xe;const Ge=(new(s.Z.extend({Entity:{_Model:Qe,Model:Je,Collection:He},radioRequests:{"tags:model":"getModel","tags:collection":"getCollection","fetch:tags:collection":"fetchTags"},fetchTags(){return Xe||this.fetchCollection().then((e=>(Xe=e,e)))}})),"teams"),Ve=p.Z.extend({type:Ge,urlRoot:"/api/teams",getAssignableClinicians(){return l().request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()}}),Ke=(0,c.Z)(Ve,Ge),et=u.Z.extend({url:"/api/teams",model:Ke,comparator:"name"}),tt=(new(s.Z.extend({Entity:{_Model:Ve,Model:Ke,Collection:et},radioRequests:{"teams:model":"getModel","teams:collection":"getCollection","fetch:teams:collection":"fetchCollection"}})),"widgets"),it=p.Z.extend({type:tt}),st=(0,c.Z)(it,tt),ot=u.Z.extend({url:"/api/widgets",model:st,modelId:e=>(0,r.uniqueId)(`${e.id}-`)}),nt=(new(s.Z.extend({Entity:{_Model:it,Model:st,Collection:ot},radioRequests:{"widgets:model":"getModel","widgets:collection":"getCollection","fetch:widgets:collection":"fetchWidgets"},fetchWidgets({filter:e={}}={}){const t={filter:e};return this.fetchCollection({data:t})}})),"workspace-patients"),rt=p.Z.extend({type:nt,urlRoot:"/api/workspace-patients"}),at=(0,c.Z)(rt,nt),lt=(new(s.Z.extend({Entity:{_Model:rt,Model:at},radioRequests:{"get:workspacePatients:model":"getByPatient","fetch:workspacePatients:byPatient":"fetchByPatient"},fetchByPatient(e){return this.getByPatient(e).fetch()},getByPatient(e){const t=l().request("bootstrap","currentWorkspace").id;return new at({id:(0,re.Z)(e,t)})}})),"workspaces"),ct=p.Z.extend({type:lt,urlRoot:"/api/workspaces",getStates(){return l().request("entities","states:collection",this.get("_states"))},getForms(){return l().request("entities","forms:collection",this.get("_forms"))},getAssignableClinicians(){return l().request("entities","clinicians:collection",this.get("_clinicians")).filterAssignable()},updateClinicians(e){this.set("_clinicians",e.map((e=>(0,r.pick)(e,"id","type"))))},addClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`,i=e.get("_workspaces");return e.set({_workspaces:(0,r.union)(i,[{id:this.id}])}),this.set({_clinicians:(0,r.union)(this.get("_clinicians"),[{id:e.id}])}),this.sync("create",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})},removeClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`;return e.set({_workspaces:(0,r.reject)(e.get("_workspaces"),{id:this.id})}),this.set({_clinicians:(0,r.reject)(this.get("_clinicians"),{id:e.id})}),this.sync("delete",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})}}),dt=(0,c.Z)(ct,lt),ht=u.Z.extend({url:"/api/workspaces",model:dt,comparator:"name"});new(s.Z.extend({Entity:{_Model:ct,Model:dt,Collection:ht},radioRequests:{"workspaces:model":"getModel","workspaces:collection":"getCollection","fetch:workspaces:collection":"fetchCollection"}}))},1188:(e,t,i)=>{i.d(t,{Ww:()=>s,cB:()=>a,g6:()=>r,lO:()=>l,q$:()=>n,zB:()=>o});const s={DISABLED:"disabled",PATIENT:"patient"},o={DRAFT:"draft",SUBMITTED:"submitted",ANY:"draft,submitted"},n={DISABLED:"disabled",PENDING:"pending",SENT:"sent",RESPONDED:"responded",CANCELED:"canceled",ERROR_NO_PHONE:"error_no_phone",ERROR_OPT_OUT:"error_opt_out",ERROR_SMS_FAILED:"error_sms_failed"},r={STANDARD:"standard",CONDITIONAL:"conditional",AUTOMATED:"automated"},a=[{id:"today",unit:"day",prev:0},{id:"yesterday",unit:"day",prev:1},{id:"thisweek",unit:"week",prev:0},{id:"lastweek",unit:"week",prev:1},{id:"thismonth",unit:"month",prev:0},{id:"lastmonth",unit:"month",prev:1}],l={STARTED:"started",QUEUED:"queued",DONE:"done"}},4861:(e,t,i)=>{i.d(t,{XQ:()=>n,oC:()=>a});var s=i(7198);function o(e,t){return"desc"===e?-1*t:t}function n(e,t,i,s=""){return t||(t=s),i||(i=s),o(e,t.localeCompare(i))}function r(e,t=-1){return(0,s.isNumber)(e)?e:t}function a(e,t,i,s=Number.NEGATIVE_INFINITY){return t||(t=s),i||(i=s),o(e,r(t,s)>r(i,s)?1:-1)}}}]);