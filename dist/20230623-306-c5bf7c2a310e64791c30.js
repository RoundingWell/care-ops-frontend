"use strict";(globalThis.webpackChunkcare_ops_frontend=globalThis.webpackChunkcare_ops_frontend||[]).push([[306],{3306:(e,t,i)=>{var s=i(4822),o=i(8088),n=i.n(o),r=i(7198),a=i(7739),l=i.n(a),c=i(7027),d=i(9203),h=i.n(d),p=i(4257),u=i(3018),g=i(1267),m=i(4861),f=i(1441),w=i(1188);const _="patient-actions",{parseRelationship:y}=g.Z,v=function(e,t){return e&&"owner"!==t?y(e,t):e},R=u.Z.extend({urlRoot(){if(this.isNew()){const e=this.get("_flow");return e?`/api/flows/${e}/relationships/actions`:`/api/patients/${this.get("_patient")}/relationships/actions`}return"/api/actions"},type:_,validate(e){let{name:t}=e;if(!(0,f.Z)(t))return"Action name required"},hasTag(e){return(0,r.contains)(this.get("tags"),e)},getForm(){const e=this.get("_form");if(e)return l().request("entities","forms:model",e)},getFormResponses(){return l().request("entities","formResponses:collection",this.get("_form_responses"),{comparator:(e,t)=>(0,m.XQ)("desc",e.get("_created_at"),t.get("_created_at"))})},getPatient(){return l().request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner");return l().request("entities",`${e.type}:model`,e.id)},getFlow(){if(this.get("_flow"))return l().request("entities","flows:model",this.get("_flow"))},getState(){return l().request("entities","states:model",this.get("_state"))},getPreviousState(){return l().request("entities","states:model",this.previous("_state"))},isLocked(){return!!this.get("locked_at")},isDone(){return this.getState().isDone()},isOverdue(){if(this.isDone())return!1;const e=this.get("due_date"),t=this.get("due_time");if(!t)return h()(e).isBefore(h()(),"day");const i=h()(`${e} ${t}`);return i.isBefore(h()(),"day")||i.isBefore(h()(),"minute")},isAdHoc(){return!this.get("_program_action")&&!this.get("_flow")},hasOutreach(){return this.get("outreach")!==w.Ww.DISABLED},hasSharing(){return this.get("sharing")!==w.q$.DISABLED},canEdit(){const e=l().request("bootstrap","currentUser");return!!e.can("work:manage")||!(!e.can("work:owned:manage")||this.getOwner()!==e)},saveDueDate(e){return e?this.save({due_date:e.format("YYYY-MM-DD")}):this.save({due_date:null,due_time:null})},saveDueTime(e){return e?this.save({due_time:e}):this.save({due_time:null})},saveState(e){const t={_state:e.id},i=this.get("sharing");return e.isDone()&&![w.q$.DISABLED,w.q$.RESPONDED].includes(i)&&(t.sharing=w.q$.CANCELED),this.save(t,{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},saveAll(e){this.isNew()&&(e=(0,r.extend)({},this.attributes,e));const t={flow:this.toRelation(e._flow,"flows"),form:this.toRelation(e._form,"forms"),owner:this.toRelation(e._owner),state:this.toRelation(e._state,"states"),"program-action":this.toRelation(e._program_action,"program-actions")};return this.save(e,{relationships:t},{wait:!0})},hasAttachments(){return!!(0,r.size)(this.get("_files"))},hasAllowedUploads(){if(!this.canEdit())return!1;const e=l().request("entities","programActions:model",this.get("_program_action"));return!!(0,r.size)(e.get("allowed_uploads"))},parseRelationship:v}),Z=(0,c.Z)(R,_),C=p.Z.extend({url:"/api/actions",model:Z,parseRelationship:v,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},groupByDate(){const e=this.groupBy("due_date");return(0,r.reduce)((0,r.keys)(e),((t,i)=>(t.add({date:i,actions:new C(e[i])}),t)),new(n().Collection)([]))}});new(s.Z.extend({Entity:{_Model:R,Model:Z,Collection:C},radioRequests:{"actions:model":"getModel","actions:collection":"getCollection","fetch:actions:model":"fetchAction","fetch:actions:collection":"fetchActions","fetch:actions:collection:byPatient":"fetchActionsByPatient","fetch:actions:collection:byFlow":"fetchActionsByFlow"},fetchAction(e){const t=["program-action.program","flow.program-flow.program"].join();return this.fetchModel(e,{data:{include:t}})},fetchActions(e){let{filter:t,include:i}=e;const s={filter:t,include:i};return this.fetchCollection({data:s})},fetchActionsByPatient(e){let{patientId:t,filter:i}=e;const s={filter:i},o=`/api/patients/${t}/relationships/actions`;return this.fetchCollection({url:o,data:s})},fetchActionsByFlow(e){const t=`/api/flows/${e}/relationships/actions`;return this.fetchCollection({url:t})}}));var q=i(3513),A=i(7948),x=i(7201);const M="clinicians",b=u.Z.extend({type:M,urlRoot:"/api/clinicians",preinitialize(){this.on("change:_team",this.onChangeTeam)},validate:e=>(0,f.Z)(e.name)?(0,f.Z)(e.email)?e._role?void 0:"A clinician role is required":"A clinician email address is required":"A clinician name is required",onChangeTeam(){const e=l().request("entities","teams:model",this.previous("_team"));e.set("_clinicians",(0,r.reject)(e.get("_clinicians"),{id:this.id}));const t=l().request("entities","teams:model",this.get("_team"));t.set("_clinicians",(0,r.union)(t.get("_clinicians"),[{id:this.id}]))},getWorkspaces(){return l().request("entities","workspaces:collection",this.get("_workspaces"))},addWorkspace(e){const t=this.getWorkspaces();t.add(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},removeWorkspace(e){const t=this.getWorkspaces();t.remove(e),this.set("_workspaces",this.toRelation(t,"workspaces").data)},getTeam(){return this.hasTeam()?l().request("entities","teams:model",this.get("_team")):l().request("entities","teams:model",{name:x.ZP.patients.sidebar.action.activityViews.systemTeam})},hasTeam(){const e=this.get("_team");return e&&e!==A.Z},getRole(){return l().request("entities","roles:model",this.get("_role"))},can(e){const t=this.getRole().get("permissions");return(0,r.includes)(t,e)},saveRole(e){return this.save({_role:e.id},{relationships:{role:this.toRelation(e)}})},saveTeam(e){return this.save({_team:e.id},{relationships:{team:this.toRelation(e)}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={workspaces:this.toRelation(e._workspaces,"workspaces"),team:this.toRelation(e._team,"teams"),role:this.toRelation(e._role,"roles")};return this.save(e,{relationships:t},{wait:!0})},getInitials(){const e=String(this.get("name")).split(" ");return 1===e.length?(0,r.first)(e).charAt(0):`${(0,r.first)(e).charAt(0)}${(0,r.last)(e).charAt(0)}`},isEditable(){return!this.get("last_active_at")},isActive(){const e=this.hasTeam(),t=!!(0,r.size)(this.get("_workspaces")),i=this.get("last_active_at");return e&&t&&i}}),E=(0,c.Z)(b,M),k=p.Z.extend({url:"/api/clinicians",model:E,comparator:"name"}),F=(new(s.Z.extend({Entity:{_Model:b,Model:E,Collection:k},radioRequests:{"clinicians:model":"getModel","clinicians:collection":"getCollection","fetch:clinicians:collection":"fetchCollection","fetch:clinicians:current":"fetchCurrentClinician","fetch:clinicians:model":"fetchModel","fetch:clinicians:byWorkspace":"fetchByWorkspace"},fetchCurrentClinician(){return this.fetchBy("/api/clinicians/me").then((e=>((0,q.av)(e.pick("id","name","email")),e)))},fetchByWorkspace(e){const t=`/api/workspaces/${e}/relationships/clinicians`;return this.fetchCollection({url:t})}})),"comments"),D=u.Z.extend({type:F,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/comments`:"/api/comments"},validate(e){let{message:t}=e;if(!(0,f.Z)(t))return"Comment message required."},getClinician(){return l().request("entities","clinicians:model",this.get("_clinician"))}}),P=(0,c.Z)(D,F),S=p.Z.extend({model:P}),$=(new(s.Z.extend({Entity:{_Model:D,Model:P,Collection:S},radioRequests:{"comments:model":"getModel","fetch:comments:collection:byAction":"fetchCommentsByAction"},fetchCommentsByAction(e){const t=`/api/actions/${e}/relationships/comments`;return this.fetchCollection({url:t})}})),"dashboards"),T=u.Z.extend({type:$,urlRoot:"/api/dashboards"}),B=(0,c.Z)(T,$),O=p.Z.extend({url:"/api/dashboards",model:B}),I=(new(s.Z.extend({Entity:{_Model:T,Model:B,Collection:O},radioRequests:{"dashboards:model":"getModel","dashboards:collection":"getCollection","fetch:dashboards:model":"fetchModel","fetch:dashboards:collection":"fetchCollection"}})),u.Z.extend({type:"directories",url(){return`/api/directory/${this.get("slug")}`},getOptions(){if(this.options)return this.options;const e=(0,r.map)(this.get("value"),(e=>({name:e,id:e})));return this.options=new p.Z(e),this.options}})),N=p.Z.extend({url:"/api/directories",model:I}),W=(new(s.Z.extend({Entity:{Model:I,Collection:N},radioRequests:{"directories:collection":"getCollection","fetch:directories:model":"fetchDirectory","fetch:directories:filterable":"fetchFilterable"},fetchDirectory:(e,t)=>new I({slug:e}).fetch({data:t}),fetchFilterable(){return this.fetchCollection({data:{filter:{filterable:!0}}})}})),"events"),U=u.Z.extend({type:W,getClinician(){return l().request("entities","clinicians:model",this.get("_clinician"))},getRecipient(){if(this.get("_recipient"))return l().request("entities","patients:model",this.get("_recipient"))},getEditor(){return this.get("_editor")?l().request("entities","clinicians:model",this.get("_editor")):l().request("entities","clinicians:model",{name:"RoundingWell"})},getTeam(){return l().request("entities","teams:model",this.get("_team"))},getState(){return l().request("entities","states:model",this.get("_state"))},getProgram(){if(this.get("_program"))return l().request("entities","programs:model",this.get("_program"))},getForm(){if(this.get("_form"))return l().request("entities","forms:model",this.get("_form"))}}),L=(0,c.Z)(U,W),j=p.Z.extend({model:L}),z=(new(s.Z.extend({Entity:{_Model:U,Model:L,Collection:j},radioRequests:{"events:model":"getModel","events:collection":"getCollection","fetch:actionEvents:collection":"fetchActionEvents","fetch:flowEvents:collection":"fetchFlowEvents"},fetchActionEvents(e){return this.fetchCollection({url:`/api/actions/${e}/activity`})},fetchFlowEvents(e){return this.fetchCollection({url:`/api/flows/${e}/activity`})}})),"files"),J=u.Z.extend({defaults:{path:"",_progress:0},type:z,urlRoot(){return this.isNew()?`/api/actions/${this.get("_action")}/relationships/files?urls=upload`:"/api/files"},fetchFile(){return this.fetch({url:`${this.url()}?urls=download,view`})},createUpload(e){var t=this;const i=`patient/${this.get("_patient")}/${e}`;return this.save({path:i,_progress:0},{},{type:"PUT"}).catch((function(){let{responseData:i}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if((0,r.get)((0,r.first)(i.errors),"detail","").includes("Another file exists"))return t.createUpload(function(e){const t=e.lastIndexOf(".");return`${e.slice(0,t)}-copy${e.slice(t)}`}(e));throw i}))},upload(e){this.createUpload(e.name).then((()=>this.putFile(e))).then((()=>this.fetchFile())).catch((()=>{this.trigger("upload:failed"),this.destroy()}))},putFile(e){const t=e.size;return new Promise(((i,s)=>{const o=new XMLHttpRequest;o.onreadystatechange=()=>{4===o.readyState&&(200===o.status?(this.set({_progress:100}),i()):s())},o.upload.onprogress=e=>{e.lengthComputable&&this.set({_progress:Math.round(e.loaded/t*100)})},o.open("PUT",this.get("_upload")),o.send(e)}))},getFilename(){return this.get("path").split("/").pop()}}),Q=(0,c.Z)(J,z),Y=p.Z.extend({model:Q});new(s.Z.extend({Entity:{_Model:J,Model:Q,Collection:Y},radioRequests:{"files:model":"getModel","fetch:files:collection:byAction":"fetchFilesByAction"},fetchFilesByAction(e){const t=`/api/actions/${e}/relationships/files`;return this.fetchCollection({url:t,data:{urls:["download","view"]}})}}));var H=i(2814);const V="flows",{parseRelationship:X}=g.Z,G=function(e,t){return e&&"owner"!==t?X(e,t):e},K=u.Z.extend({urlRoot(){return this.isNew()?`/api/patients/${this.get("_patient")}/relationships/flows`:"/api/flows"},type:V,getPatient(){return l().request("entities","patients:model",this.get("_patient"))},getOwner(){const e=this.get("_owner");return l().request("entities",`${e.type}:model`,e.id)},getState(){return l().request("entities","states:model",this.get("_state"))},getProgramFlow(){return l().request("entities","programFlows:model",this.get("_program_flow"))},isDone(){return this.getState().isDone()},isAllDone(){const{complete:e,total:t}=this.get("_progress");return e===t},canEdit(){const e=l().request("bootstrap","currentUser");return!!e.can("work:manage")||!(!e.can("work:owned:manage")||this.getOwner()!==e)},saveState(e){return this.save({_state:e.id},{relationships:{state:this.toRelation(e)}})},saveOwner(e){return this.save({_owner:e},{relationships:{owner:this.toRelation(e)}})},applyOwner(e){const t=`${this.url()}/relationships/actions`,i={owner:this.toRelation(e)};return(0,H.ZP)(t,{method:"PATCH",data:JSON.stringify({data:{relationships:i}})})},saveAll(e){this.isNew()&&(e=(0,r.extend)({},this.attributes,e));const t={state:this.toRelation(e._state,"states"),owner:this.toRelation(e._owner),"program-flow":this.toRelation(e._program_flow,"program-flows")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:G}),ee=(0,c.Z)(K,V),te=p.Z.extend({url:"/api/flows",model:ee,parseRelationship:G,save(e){const t=this.invoke("saveAll",e);return Promise.all(t)},applyOwner(e){const t=this.invoke("applyOwner",e);return Promise.all(t)}});new(s.Z.extend({Entity:{_Model:K,Model:ee,Collection:te},radioRequests:{"flows:model":"getModel","flows:collection":"getCollection","fetch:flows:model":"fetchFlow","fetch:flows:collection":"fetchFlows","fetch:flows:collection:byPatient":"fetchFlowsByPatient"},fetchFlow(e){const t=["program-flow","program-flow.program","program-flow.program-actions"].join();return this.fetchModel(e,{data:{include:t}})},fetchFlows(e){let{filter:t,include:i}=e;const s={filter:t,include:i};return this.fetchCollection({data:s})},fetchFlowsByPatient(e){let{patientId:t,filter:i}=e;const s={filter:i},o=`/api/patients/${t}/relationships/flows`;return this.fetchCollection({url:o,data:s})}})),i(8380);const ie="form-responses",se=u.Z.extend({type:ie,urlRoot:"/api/form-responses",saveAll(){const e=this.attributes,t={form:this.toRelation(e._form,"forms"),patient:this.toRelation(e._patient,"patients"),action:this.toRelation(e._action,"patient-actions")};return this.save(e,{relationships:t},{wait:!0})}}),oe=(0,c.Z)(se,ie),ne=p.Z.extend({url:"/api/form-responses",model:oe});new(s.Z.extend({Entity:{_Model:se,Model:oe,Collection:ne},radioRequests:{"formResponses:model":"getModel","formResponses:collection":"getCollection","fetch:formResponses:submission":"fetchSubmission","fetch:formResponses:latestSubmission":"fetchLatestSubmission"},fetchSubmission:e=>e?(0,H.ZP)(`/api/form-responses/${e}/response`).then(H.sx):[{}],fetchLatestSubmission(e,t){const i=(0,r.reduce)(t,((e,t,i)=>t?(e.filter[i]=t,e):e),{filter:{}});return(0,H.ZP)(`/api/patients/${e}/form-responses/latest`,{data:i}).then(H.sx)}}));var re=i(5992);const ae="patient-fields",le=u.Z.extend({type:ae,url(){return`/api/patients/${this.get("_patient")}/fields/${this.get("name")}`},isNew:()=>!1,getValue(){const e=this.get("value");return(0,r.isObject)(e)&&(0,r.isEmpty)(e)?null:e},saveAll(e){(e=(0,r.extend)({},this.attributes,e)).id||this.set({id:(0,re.Z)(`resource:field:${e.name.toLowerCase()}`,e._patient)});const t={patient:this.toRelation(e._patient,"patients")};return this.save(e,{relationships:t},{wait:!0})}}),ce=(0,c.Z)(le,ae),de=p.Z.extend({model:ce}),he=(new(s.Z.extend({Entity:{_Model:le,Model:ce,Collection:de},radioRequests:{"patientFields:model":"getModel","patientFields:collection":"getCollection","fetch:patientFields:model":"fetchPatientField"},fetchPatientField(e,t){const i=`/api/patients/${e}/fields/${t}`;return this.fetchModel(t,{url:i,abort:!1}).then((e=>{this.getModel(e.attributes)}))}})),"patients"),pe=u.Z.extend({type:he,urlRoot:"/api/patients",validate(e){let{first_name:t,last_name:i,birth_date:s,sex:o,_workspaces:n}=e;const a={};if(t&&i||(a.name="required"),o||(a.sex="required"),n&&n.length||(a.workspaces="required"),s?h()(s).isAfter()&&(a.birth_date="invalidDate"):a.birth_date="required",!(0,r.isEmpty)(a))return a},getWorkspaces(){return l().request("entities","workspaces:collection",this.get("_workspaces"))},getFields(){return l().request("entities","patientFields:collection",this.get("_patient_fields"))},getField(e){return this.getFields().find({name:e})},addWorkspace(e){const t=this.getWorkspaces();t.add(e),this.set("_workspaces",t.map((e=>e.pick("id"))))},removeWorkspace(e){const t=this.getWorkspaces();t.remove(e),this.set("_workspaces",t.map((e=>e.pick("id"))))},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={workspaces:this.toRelation(e._workspaces,"workspaces")},i={wait:!0};return this.isNew()&&(i.type="PUT"),this.save(e,{relationships:t},i)},canEdit(){return this.isNew()||"manual"===this.get("source")},getSortName(){return(this.get("last_name")+this.get("first_name")).toLowerCase()}}),ue=(0,c.Z)(pe,he),ge=p.Z.extend({url:"/api/patients",model:ue}),me=(new(s.Z.extend({Entity:{_Model:pe,Model:ue,Collection:ge},radioRequests:{"patients:model":"getModel","patients:collection":"getCollection","fetch:patients:model":"fetchModel","fetch:patients:model:byAction":"fetchPatientByAction","fetch:patients:model:byFlow":"fetchPatientByFlow"},fetchPatientByAction(e){return this.fetchBy(`/api/actions/${e}/patient`)},fetchPatientByFlow(e){return this.fetchBy(`/api/flows/${e}/patient`)}})),u.Z.extend({type:"patients-search-results"})),fe=p.Z.extend({url:"/api/patients",model:me,initialize(){this._debouncedSearch=(0,r.debounce)(this._debouncedSearch,150)},prevSearch:"",fetcher:{abort:r.noop},search(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";if(e.length<3)return e.length&&this.prevSearch.includes(e)||(delete this._hasIdentifiers,this.reset(),this.prevSearch=""),this._debouncedSearch.cancel(),void this.fetcher.abort();this.prevSearch=e,this.isSearching=!0,this._debouncedSearch(e)},hasIdentifiers(){return(0,r.isBoolean)(this._hasIdentifiers)||(this._hasIdentifiers=!!this.find((e=>(0,r.get)(e.get("identifiers"),"length")))),this._hasIdentifiers},_debouncedSearch(e){const t={search:e};delete this._hasIdentifiers,this.fetcher=this.fetch({data:{filter:t}}),this.fetcher.then((()=>{this.isSearching=!1,this.trigger("search",this)}))}});new(s.Z.extend({Entity:{Model:me,Collection:fe},radioRequests:{"searchPatients:collection":"getCollection"}}));var we=i(1962);const _e="program-actions",{parseRelationship:ye}=g.Z,ve=function(e,t){return e&&"owner"!==t?ye(e,t):e},Re=u.Z.extend({urlRoot:"/api/program-actions",type:_e,validate(e){let{name:t}=e;if(!(0,f.Z)(t))return"Action name required"},getTags(){return l().request("entities","tags:collection",(0,we.Z)(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getAction(e){let{patientId:t,flowId:i}=e;const s=l().request("bootstrap","currentUser"),o=l().request("bootstrap","currentWorkspace").getStates(),n=(0,r.first)(o.filter({status:w.lO.QUEUED}));return l().request("entities","actions:model",{name:this.get("name"),_flow:i,_patient:t,_state:n.id,_owner:this.get("_owner")||{id:s.id,type:"clinicians"},_program_action:this.id})},enableAttachmentUploads(){this.save({allowed_uploads:["pdf"]})},disableAttachmentUploads(){this.save({allowed_uploads:[]})},getOwner(){const e=this.get("_owner");if(e)return l().request("entities","teams:model",e.id)},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},getForm(){const e=this.get("_form");if(e)return l().request("entities","forms:model",e)},hasOutreach(){return this.get("outreach")!==w.Ww.DISABLED},saveForm(e){const t={_form:(e=this.toRelation(e)).data};return e.data||(t.outreach=w.Ww.DISABLED),this.save(t,{relationships:{form:e}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams"),form:this.toRelation(e._form,"forms"),"program-flow":this.toRelation(e._program_flow,"program-flows"),program:this.toRelation(e._program,"programs")};return this.save(e,{relationships:t},{wait:!0})},parseRelationship:ve}),Ze=(0,c.Z)(Re,_e),Ce=p.Z.extend({initialize(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.flowId=t.flowId,this.flowId&&(this.comparator="sequence")},url(){return this.flowId?`/api/program-flows/${this.flowId}/actions`:"/api/program-actions"},model:Ze,parseRelationship:ve,updateSequences(){const e=this.map(((e,t)=>(e.set({sequence:t}),e.toJSONApi({sequence:t}))));return this.sync("patch",this,{url:this.url(),data:JSON.stringify({data:e})})}}),qe=(new(s.Z.extend({Entity:{_Model:Re,Model:Ze,Collection:Ce},radioRequests:{"programActions:model":"getModel","programActions:collection":"getCollection","fetch:programActions:model":"fetchModel","fetch:programActions:collection:byProgram":"fetchProgramActionsByProgram","fetch:programActions:collection":"fetchProgramActions","fetch:programActions:collection:byProgramFlow":"fetchProgramActionsByFlow"},fetchProgramActionsByProgram(e){let{programId:t}=e;const i=`/api/programs/${t}/relationships/actions`;return this.fetchCollection({url:i})},fetchProgramActions(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w.g6.STANDARD;return(new this.Entity.Collection).fetch({data:{filter:{behavior:e}}})},fetchProgramActionsByFlow:(e,t)=>new Ce([],{flowId:e}).fetch(t)})),"program-flows"),{parseRelationship:Ae}=g.Z,xe=function(e,t){return e&&"owner"!==t?Ae(e,t):e},Me=u.Z.extend({urlRoot(){return this.isNew()?`/api/programs/${this.get("_program")}/relationships/flows`:"/api/program-flows"},type:qe,validate(e){let{name:t}=e;if(!(0,f.Z)(t))return"Flow name required"},getTags(){return l().request("entities","tags:collection",(0,we.Z)(this.get("tags"),"text"))},addTag(e){const t=this.getTags();return t.add(e),this.save({tags:t.map("text")})},removeTag(e){const t=this.getTags();return t.remove(e),this.save({tags:t.map("text")})},getOwner(){const e=this.get("_owner");if(e)return l().request("entities","teams:model",e.id)},getFlow(e){const t=l().request("bootstrap","currentWorkspace").getStates(),i=(0,r.first)(t.filter({status:w.lO.QUEUED}));return l().request("entities","flows:model",{_patient:e,_program_flow:this.get("id"),_state:i.id})},saveOwner(e){return e=this.toRelation(e),this.save({_owner:e.data},{relationships:{owner:e}})},saveAll(e){e=(0,r.extend)({},this.attributes,e);const t={owner:this.toRelation(e._owner,"teams")};return this.save(e,{relationships:t},{wait:!0})},getActions(){return l().request("entities","programActions:collection",this.get("_program_actions"),{flowId:this.id})},parseRelationship:xe}),be=(0,c.Z)(Me,qe),Ee=p.Z.extend({url:"/api/program-flows",model:be,parseRelationship:xe}),ke=(new(s.Z.extend({Entity:{_Model:Me,Model:be,Collection:Ee},radioRequests:{"programFlows:model":"getModel","programFlows:collection":"getCollection","fetch:programFlows:model":"fetchModel","fetch:programFlows:collection:byProgram":"fetchProgramFlowsByProgram","fetch:programFlows:collection":"fetchProgramFlows"},fetchProgramFlowsByProgram(e){let{programId:t}=e;const i=`/api/programs/${t}/relationships/flows`;return this.fetchCollection({url:i})},fetchProgramFlows(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w.g6.STANDARD;return(new this.Entity.Collection).fetch({data:{filter:{behavior:e}}})}})),"programs");function Fe(e){return e.filter((e=>e.get("published")&&e.get("behavior")!==w.g6.AUTOMATED))}const De=u.Z.extend({type:ke,validate(e){let{name:t}=e;if(!(0,f.Z)(t))return"Program name required"},urlRoot:"/api/programs",getPublished(){const e=l().request("entities","programActions:collection",this.get("_program_actions")),t=l().request("entities","programFlows:collection",this.get("_program_flows")),i=l().request("entities","programActions:collection",Fe(e)),s=l().request("entities","programFlows:collection",Fe(t));return new(n().Collection)([...s.models,...i.models],{comparator:"name"})}}),Pe=(0,c.Z)(De,ke),Se=p.Z.extend({url:"/api/programs",model:Pe}),$e=(new(s.Z.extend({Entity:{_Model:De,Model:Pe,Collection:Se},radioRequests:{"programs:model":"getModel","programs:collection":"getCollection","fetch:programs:model":"fetchModel","fetch:programs:collection":"fetchCollection","fetch:programs:model:byProgramFlow":"fetchProgramByProgramFlow"},fetchProgramByProgramFlow(e){return this.fetchBy(`/api/program-flows/${e}/program`)}})),"roles"),Te=u.Z.extend({type:$e,urlRoot:"/api/roles"}),Be=(0,c.Z)(Te,$e),Oe=p.Z.extend({url:"/api/roles",model:Be}),Ie=(new(s.Z.extend({Entity:{_Model:Te,Model:Be,Collection:Oe},radioRequests:{"roles:model":"getModel","roles:collection":"getCollection","fetch:roles:collection":"fetchCollection"}})),"settings"),Ne=u.Z.extend({type:Ie,urlRoot:"/api/settings"}),We=(0,c.Z)(Ne,Ie),Ue=p.Z.extend({url:"/api/settings",model:We}),Le=(new(s.Z.extend({Entity:{_Model:Ne,Model:We,Collection:Ue},radioRequests:{"settings:model":"getModel","fetch:settings:collection":"fetchCollection"}})),"states"),je=u.Z.extend({type:Le,isDone(){return this.get("status")===w.lO.DONE}}),ze=(0,c.Z)(je,Le),Je=p.Z.extend({url:"/api/states",model:ze,groupByDone(){const{done:e,notDone:t}=this.groupBy((e=>e.isDone()?"done":"notDone"));return{done:new Je(e),notDone:new Je(t)}},getFilterIds(){return this.map("id").join(",")}}),Qe=(new(s.Z.extend({Entity:{_Model:je,Model:ze,Collection:Je},radioRequests:{"states:model":"getModel","states:collection":"getCollection","fetch:states:collection":"fetchCollection"}})),"tags"),Ye=u.Z.extend({type:Qe,idAttribute:"text"}),He=(0,c.Z)(Ye,Qe),Ve=p.Z.extend({url:"/api/tags",model:He,parse:e=>(0,r.map)(e.data,(e=>({text:e}))),comparator:"text"});let Xe;const Ge=(new(s.Z.extend({Entity:{_Model:Ye,Model:He,Collection:Ve},radioRequests:{"tags:model":"getModel","tags:collection":"getCollection","fetch:tags:collection":"fetchTags"},fetchTags(){return Xe||this.fetchCollection().then((e=>(Xe=e,e)))}})),"teams"),Ke=u.Z.extend({type:Ge,urlRoot:"/api/teams"}),et=(0,c.Z)(Ke,Ge),tt=p.Z.extend({url:"/api/teams",model:et,comparator:"name"}),it=(new(s.Z.extend({Entity:{_Model:Ke,Model:et,Collection:tt},radioRequests:{"teams:model":"getModel","teams:collection":"getCollection","fetch:teams:collection":"fetchCollection"}})),"widgets"),st=u.Z.extend({type:it}),ot=(0,c.Z)(st,it),nt=p.Z.extend({url:"/api/widgets",model:ot,modelId:e=>(0,r.uniqueId)(`${e.id}-`)}),rt=(new(s.Z.extend({Entity:{_Model:st,Model:ot,Collection:nt},radioRequests:{"widgets:model":"getModel","widgets:collection":"getCollection","fetch:widgets:collection":"fetchWidgets"},fetchWidgets(){let{filter:e={}}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const t={filter:e};return this.fetchCollection({data:t})}})),"workspaces"),at=u.Z.extend({type:rt,urlRoot:"/api/workspaces",getStates(){return l().request("entities","states:collection",this.get("_states"))},getForms(){return l().request("entities","forms:collection",this.get("_forms"))},getAssignableClinicians(){const e=l().request("entities","clinicians:collection",this.get("_clinicians")),t=e.filter((e=>e.isActive()&&e.get("enabled")&&e.can("work:own")));return e.reset(t),e},updateClinicians(e){this.set("_clinicians",e.map((e=>(0,r.pick)(e,"id","type"))))},addClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`,i=e.get("_workspaces");return e.set({_workspaces:(0,r.union)(i,[{id:this.id}])}),this.set({_clinicians:(0,r.union)(this.get("_clinicians"),[{id:e.id}])}),this.sync("create",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})},removeClinician(e){const t=`/api/workspaces/${this.id}/relationships/clinicians`;return e.set({_workspaces:(0,r.reject)(e.get("_workspaces"),{id:this.id})}),this.set({_clinicians:(0,r.reject)(this.get("_clinicians"),{id:e.id})}),this.sync("delete",this,{url:t,data:JSON.stringify({data:[{id:e.id,type:e.type}]})})}}),lt=(0,c.Z)(at,rt),ct=p.Z.extend({url:"/api/workspaces",model:lt,comparator:"name"});new(s.Z.extend({Entity:{_Model:at,Model:lt,Collection:ct},radioRequests:{"workspaces:model":"getModel","workspaces:collection":"getCollection","fetch:workspaces:collection":"fetchCollection"}}))},1188:(e,t,i)=>{i.d(t,{Ww:()=>s,cB:()=>r,g6:()=>n,lO:()=>a,q$:()=>o});const s={DISABLED:"disabled",PATIENT:"patient"},o={DISABLED:"disabled",PENDING:"pending",SENT:"sent",RESPONDED:"responded",CANCELED:"canceled",ERROR_NO_PHONE:"error_no_phone",ERROR_OPT_OUT:"error_opt_out",ERROR_SMS_FAILED:"error_sms_failed"},n={STANDARD:"standard",CONDITIONAL:"conditional",AUTOMATED:"automated"},r=[{id:"today",unit:"day",prev:0},{id:"yesterday",unit:"day",prev:1},{id:"thisweek",unit:"week",prev:0},{id:"lastweek",unit:"week",prev:1},{id:"thismonth",unit:"month",prev:0},{id:"lastmonth",unit:"month",prev:1}],a={STARTED:"started",QUEUED:"queued",DONE:"done"}},4861:(e,t,i)=>{i.d(t,{XQ:()=>n,oC:()=>a});var s=i(7198);function o(e,t){return"desc"===e?-1*t:t}function n(e,t,i){let s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"";return t||(t=s),i||(i=s),o(e,t.localeCompare(i))}function r(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1;return(0,s.isNumber)(e)?e:t}function a(e,t,i){let s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:Number.NEGATIVE_INFINITY;return t||(t=s),i||(i=s),o(e,r(t,s)>r(i,s)?1:-1)}}}]);