try{self["workbox:core:7.0.0"]&&_()}catch{}const ee=(n,...e)=>{let t=n;return e.length>0&&(t+=` :: ${JSON.stringify(e)}`),t},te=ee;class l extends Error{constructor(e,t){const s=te(e,t);super(s),this.name=e,this.details=t}}const se=new Set,f={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration<"u"?registration.scope:""},T=n=>[f.prefix,n,f.suffix].filter(e=>e&&e.length>0).join("-"),ne=n=>{for(const e of Object.keys(f))n(e)},P={updateDetails:n=>{ne(e=>{typeof n[e]=="string"&&(f[e]=n[e])})},getGoogleAnalyticsName:n=>n||T(f.googleAnalytics),getPrecacheName:n=>n||T(f.precache),getPrefix:()=>f.prefix,getRuntimeName:n=>n||T(f.runtime),getSuffix:()=>f.suffix};function A(n,e){const t=new URL(n);for(const s of e)t.searchParams.delete(s);return t.href}async function ae(n,e,t,s){const a=A(e.url,t);if(e.url===a)return n.match(e,s);const i=Object.assign(Object.assign({},s),{ignoreSearch:!0}),r=await n.keys(e,i);for(const c of r){const o=A(c.url,t);if(a===o)return n.match(c,s)}}let b;function re(){if(b===void 0){const n=new Response("");if("body"in n)try{new Response(n.body),b=!0}catch{b=!1}b=!1}return b}class ie{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}async function ce(){for(const n of se)await n()}const oe=n=>new URL(String(n),location.href).href.replace(new RegExp(`^${location.origin}`),"");function X(n){return new Promise(e=>setTimeout(e,n))}function B(n,e){const t=e();return n.waitUntil(t),t}async function he(n,e){let t=null;if(n.url&&(t=new URL(n.url).origin),t!==self.location.origin)throw new l("cross-origin-copy-response",{origin:t});const s=n.clone(),i={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},r=re()?s.body:await s.blob();return new Response(r,i)}function le(){self.addEventListener("activate",()=>self.clients.claim())}const ue=(n,e)=>e.some(t=>n instanceof t);let F,j;function de(){return F||(F=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function fe(){return j||(j=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const J=new WeakMap,v=new WeakMap,Y=new WeakMap,L=new WeakMap,K=new WeakMap;function ye(n){const e=new Promise((t,s)=>{const a=()=>{n.removeEventListener("success",i),n.removeEventListener("error",r)},i=()=>{t(w(n.result)),a()},r=()=>{s(n.error),a()};n.addEventListener("success",i),n.addEventListener("error",r)});return e.then(t=>{t instanceof IDBCursor&&J.set(t,n)}).catch(()=>{}),K.set(e,n),e}function we(n){if(v.has(n))return;const e=new Promise((t,s)=>{const a=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",r),n.removeEventListener("abort",r)},i=()=>{t(),a()},r=()=>{s(n.error||new DOMException("AbortError","AbortError")),a()};n.addEventListener("complete",i),n.addEventListener("error",r),n.addEventListener("abort",r)});v.set(n,e)}let x={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return v.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Y.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return w(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ge(n){x=n(x)}function pe(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=n.call(I(this),e,...t);return Y.set(s,e.sort?e.sort():[e]),w(s)}:fe().includes(n)?function(...e){return n.apply(I(this),e),w(J.get(this))}:function(...e){return w(n.apply(I(this),e))}}function me(n){return typeof n=="function"?pe(n):(n instanceof IDBTransaction&&we(n),ue(n,de())?new Proxy(n,x):n)}function w(n){if(n instanceof IDBRequest)return ye(n);if(L.has(n))return L.get(n);const e=me(n);return e!==n&&(L.set(n,e),K.set(e,n)),e}const I=n=>K.get(n);function _e(n,e,{blocked:t,upgrade:s,blocking:a,terminated:i}={}){const r=indexedDB.open(n,e),c=w(r);return s&&r.addEventListener("upgradeneeded",o=>{s(w(r.result),o.oldVersion,o.newVersion,w(r.transaction),o)}),t&&r.addEventListener("blocked",o=>t(o.oldVersion,o.newVersion,o)),c.then(o=>{i&&o.addEventListener("close",()=>i()),a&&o.addEventListener("versionchange",h=>a(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const be=["get","getKey","getAll","getAllKeys","count"],Re=["put","add","delete","clear"],q=new Map;function W(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(q.get(e))return q.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,a=Re.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(a||be.includes(t)))return;const i=async function(r,...c){const o=this.transaction(r,a?"readwrite":"readonly");let h=o.store;return s&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),a&&o.done]))[0]};return q.set(e,i),i}ge(n=>({...n,get:(e,t,s)=>W(e,t)||n.get(e,t,s),has:(e,t)=>!!W(e,t)||n.has(e,t)}));try{self["workbox:background-sync:7.0.0"]&&_()}catch{}const H=3,Ce="workbox-background-sync",d="requests",R="queueName";class Ee{constructor(){this._db=null}async addEntry(e){const s=(await this.getDb()).transaction(d,"readwrite",{durability:"relaxed"});await s.store.add(e),await s.done}async getFirstEntryId(){const t=await(await this.getDb()).transaction(d).store.openCursor();return t?.value.id}async getAllEntriesByQueueName(e){const s=await(await this.getDb()).getAllFromIndex(d,R,IDBKeyRange.only(e));return s||new Array}async getEntryCountByQueueName(e){return(await this.getDb()).countFromIndex(d,R,IDBKeyRange.only(e))}async deleteEntry(e){await(await this.getDb()).delete(d,e)}async getFirstEntryByQueueName(e){return await this.getEndEntryFromIndex(IDBKeyRange.only(e),"next")}async getLastEntryByQueueName(e){return await this.getEndEntryFromIndex(IDBKeyRange.only(e),"prev")}async getEndEntryFromIndex(e,t){const a=await(await this.getDb()).transaction(d).store.index(R).openCursor(e,t);return a?.value}async getDb(){return this._db||(this._db=await _e(Ce,H,{upgrade:this._upgradeDb})),this._db}_upgradeDb(e,t){t>0&&t<H&&e.objectStoreNames.contains(d)&&e.deleteObjectStore(d),e.createObjectStore(d,{autoIncrement:!0,keyPath:"id"}).createIndex(R,R,{unique:!1})}}class ke{constructor(e){this._queueName=e,this._queueDb=new Ee}async pushEntry(e){delete e.id,e.queueName=this._queueName,await this._queueDb.addEntry(e)}async unshiftEntry(e){const t=await this._queueDb.getFirstEntryId();t?e.id=t-1:delete e.id,e.queueName=this._queueName,await this._queueDb.addEntry(e)}async popEntry(){return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName))}async shiftEntry(){return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName))}async getAll(){return await this._queueDb.getAllEntriesByQueueName(this._queueName)}async size(){return await this._queueDb.getEntryCountByQueueName(this._queueName)}async deleteEntry(e){await this._queueDb.deleteEntry(e)}async _removeEntry(e){return e&&await this.deleteEntry(e.id),e}}const De=["method","referrer","referrerPolicy","mode","credentials","cache","redirect","integrity","keepalive"];class E{static async fromRequest(e){const t={url:e.url,headers:{}};e.method!=="GET"&&(t.body=await e.clone().arrayBuffer());for(const[s,a]of e.headers.entries())t.headers[s]=a;for(const s of De)e[s]!==void 0&&(t[s]=e[s]);return new E(t)}constructor(e){e.mode==="navigate"&&(e.mode="same-origin"),this._requestData=e}toObject(){const e=Object.assign({},this._requestData);return e.headers=Object.assign({},this._requestData.headers),e.body&&(e.body=e.body.slice(0)),e}toRequest(){return new Request(this._requestData.url,this._requestData)}clone(){return new E(this.toObject())}}const Q="workbox-background-sync",Pe=60*24*7,U=new Set,$=n=>{const e={request:new E(n.requestData).toRequest(),timestamp:n.timestamp};return n.metadata&&(e.metadata=n.metadata),e};class Ne{constructor(e,{forceSyncFallback:t,onSync:s,maxRetentionTime:a}={}){if(this._syncInProgress=!1,this._requestsAddedDuringSync=!1,U.has(e))throw new l("duplicate-queue-name",{name:e});U.add(e),this._name=e,this._onSync=s||this.replayRequests,this._maxRetentionTime=a||Pe,this._forceSyncFallback=!!t,this._queueStore=new ke(this._name),this._addSyncListener()}get name(){return this._name}async pushRequest(e){await this._addRequest(e,"push")}async unshiftRequest(e){await this._addRequest(e,"unshift")}async popRequest(){return this._removeRequest("pop")}async shiftRequest(){return this._removeRequest("shift")}async getAll(){const e=await this._queueStore.getAll(),t=Date.now(),s=[];for(const a of e){const i=this._maxRetentionTime*60*1e3;t-a.timestamp>i?await this._queueStore.deleteEntry(a.id):s.push($(a))}return s}async size(){return await this._queueStore.size()}async _addRequest({request:e,metadata:t,timestamp:s=Date.now()},a){const r={requestData:(await E.fromRequest(e.clone())).toObject(),timestamp:s};switch(t&&(r.metadata=t),a){case"push":await this._queueStore.pushEntry(r);break;case"unshift":await this._queueStore.unshiftEntry(r);break}this._syncInProgress?this._requestsAddedDuringSync=!0:await this.registerSync()}async _removeRequest(e){const t=Date.now();let s;switch(e){case"pop":s=await this._queueStore.popEntry();break;case"shift":s=await this._queueStore.shiftEntry();break}if(s){const a=this._maxRetentionTime*60*1e3;return t-s.timestamp>a?this._removeRequest(e):$(s)}else return}async replayRequests(){let e;for(;e=await this.shiftRequest();)try{await fetch(e.request.clone())}catch{throw await this.unshiftRequest(e),new l("queue-replay-failed",{name:this._name})}}async registerSync(){if("sync"in self.registration&&!this._forceSyncFallback)try{await self.registration.sync.register(`${Q}:${this._name}`)}catch{}}_addSyncListener(){"sync"in self.registration&&!this._forceSyncFallback?self.addEventListener("sync",e=>{if(e.tag===`${Q}:${this._name}`){const t=async()=>{this._syncInProgress=!0;let s;try{await this._onSync({queue:this})}catch(a){if(a instanceof Error)throw s=a,s}finally{this._requestsAddedDuringSync&&!(s&&!e.lastChance)&&await this.registerSync(),this._syncInProgress=!1,this._requestsAddedDuringSync=!1}};e.waitUntil(t())}}):this._onSync({queue:this})}static get _queueNames(){return U}}class Te{constructor(e,t){this.fetchDidFail=async({request:s})=>{await this._queue.pushRequest({request:s})},this._queue=new Ne(e,t)}}try{self["workbox:routing:7.0.0"]&&_()}catch{}const Z="GET",D=n=>n&&typeof n=="object"?n:{handle:n};class g{constructor(e,t,s=Z){this.handler=D(t),this.match=e,this.method=s}setCatchHandler(e){this.catchHandler=D(e)}}class Le extends g{constructor(e,t,s){const a=({url:i})=>{const r=e.exec(i.href);if(r&&!(i.origin!==location.origin&&r.index!==0))return r.slice(1)};super(a,t,s)}}class Ie{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map(a=>{typeof a=="string"&&(a=[a]);const i=new Request(...a);return this.handleRequest({request:i,event:e})}));e.waitUntil(s),e.ports&&e.ports[0]&&s.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const a=s.origin===location.origin,{params:i,route:r}=this.findMatchingRoute({event:t,request:e,sameOrigin:a,url:s});let c=r&&r.handler;const o=e.method;if(!c&&this._defaultHandlerMap.has(o)&&(c=this._defaultHandlerMap.get(o)),!c)return;let h;try{h=c.handle({url:s,request:e,event:t,params:i})}catch(u){h=Promise.reject(u)}const m=r&&r.catchHandler;return h instanceof Promise&&(this._catchHandler||m)&&(h=h.catch(async u=>{if(m)try{return await m.handle({url:s,request:e,event:t,params:i})}catch(O){O instanceof Error&&(u=O)}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:t});throw u})),h}findMatchingRoute({url:e,sameOrigin:t,request:s,event:a}){const i=this._routes.get(s.method)||[];for(const r of i){let c;const o=r.match({url:e,sameOrigin:t,request:s,event:a});if(o)return c=o,(Array.isArray(c)&&c.length===0||o.constructor===Object&&Object.keys(o).length===0||typeof o=="boolean")&&(c=void 0),{route:r,params:c}}return{}}setDefaultHandler(e,t=Z){this._defaultHandlerMap.set(t,D(e))}setCatchHandler(e){this._catchHandler=D(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new l("unregister-route-but-not-found-with-method",{method:e.method});const t=this._routes.get(e.method).indexOf(e);if(t>-1)this._routes.get(e.method).splice(t,1);else throw new l("unregister-route-route-not-registered")}}let C;const qe=()=>(C||(C=new Ie,C.addFetchListener(),C.addCacheListener()),C);function p(n,e,t){let s;if(typeof n=="string"){const i=new URL(n,location.href),r=({url:c})=>c.href===i.href;s=new g(r,e,t)}else if(n instanceof RegExp)s=new Le(n,e,t);else if(typeof n=="function")s=new g(n,e,t);else if(n instanceof g)s=n;else throw new l("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return qe().registerRoute(s),s}try{self["workbox:strategies:7.0.0"]&&_()}catch{}function k(n){return typeof n=="string"?new Request(n):n}class Ue{constructor(e,t){this._cacheKeys={},Object.assign(this,t),this.event=t.event,this._strategy=e,this._handlerDeferred=new ie,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const s of this._plugins)this._pluginStateMap.set(s,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:t}=this;let s=k(e);if(s.mode==="navigate"&&t instanceof FetchEvent&&t.preloadResponse){const r=await t.preloadResponse;if(r)return r}const a=this.hasCallback("fetchDidFail")?s.clone():null;try{for(const r of this.iterateCallbacks("requestWillFetch"))s=await r({request:s.clone(),event:t})}catch(r){if(r instanceof Error)throw new l("plugin-error-request-will-fetch",{thrownErrorMessage:r.message})}const i=s.clone();try{let r;r=await fetch(s,s.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const c of this.iterateCallbacks("fetchDidSucceed"))r=await c({event:t,request:i,response:r});return r}catch(r){throw a&&await this.runCallbacks("fetchDidFail",{error:r,event:t,originalRequest:a.clone(),request:i.clone()}),r}}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}async cacheMatch(e){const t=k(e);let s;const{cacheName:a,matchOptions:i}=this._strategy,r=await this.getCacheKey(t,"read"),c=Object.assign(Object.assign({},i),{cacheName:a});s=await caches.match(r,c);for(const o of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await o({cacheName:a,matchOptions:i,cachedResponse:s,request:r,event:this.event})||void 0;return s}async cachePut(e,t){const s=k(e);await X(0);const a=await this.getCacheKey(s,"write");if(!t)throw new l("cache-put-with-no-response",{url:oe(a.url)});const i=await this._ensureResponseSafeToCache(t);if(!i)return!1;const{cacheName:r,matchOptions:c}=this._strategy,o=await self.caches.open(r),h=this.hasCallback("cacheDidUpdate"),m=h?await ae(o,a.clone(),["__WB_REVISION__"],c):null;try{await o.put(a,h?i.clone():i)}catch(u){if(u instanceof Error)throw u.name==="QuotaExceededError"&&await ce(),u}for(const u of this.iterateCallbacks("cacheDidUpdate"))await u({cacheName:r,oldResponse:m,newResponse:i.clone(),request:a,event:this.event});return!0}async getCacheKey(e,t){const s=`${e.url} | ${t}`;if(!this._cacheKeys[s]){let a=e;for(const i of this.iterateCallbacks("cacheKeyWillBeUsed"))a=k(await i({mode:t,request:a,event:this.event,params:this.params}));this._cacheKeys[s]=a}return this._cacheKeys[s]}hasCallback(e){for(const t of this._strategy.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this._strategy.plugins)if(typeof t[e]=="function"){const s=this._pluginStateMap.get(t);yield i=>{const r=Object.assign(Object.assign({},i),{state:s});return t[e](r)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){let e;for(;e=this._extendLifetimePromises.shift();)await e}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let t=e,s=!1;for(const a of this.iterateCallbacks("cacheWillUpdate"))if(t=await a({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&t.status!==200&&(t=void 0),t}}class N{constructor(e={}){this.cacheName=P.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s=typeof e.request=="string"?new Request(e.request):e.request,a="params"in e?e.params:void 0,i=new Ue(this,{event:t,request:s,params:a}),r=this._getResponse(i,s,t),c=this._awaitComplete(r,i,s,t);return[r,c]}async _getResponse(e,t,s){await e.runCallbacks("handlerWillStart",{event:s,request:t});let a;try{if(a=await this._handle(t,e),!a||a.type==="error")throw new l("no-response",{url:t.url})}catch(i){if(i instanceof Error){for(const r of e.iterateCallbacks("handlerDidError"))if(a=await r({error:i,event:s,request:t}),a)break}if(!a)throw i}for(const i of e.iterateCallbacks("handlerWillRespond"))a=await i({event:s,request:t,response:a});return a}async _awaitComplete(e,t,s,a){let i,r;try{i=await e}catch{}try{await t.runCallbacks("handlerDidRespond",{event:a,request:s,response:i}),await t.doneWaiting()}catch(c){c instanceof Error&&(r=c)}if(await t.runCallbacks("handlerDidComplete",{event:a,request:s,response:i,error:r}),t.destroy(),r)throw r}}class V extends N{async _handle(e,t){let s=await t.cacheMatch(e),a;if(!s)try{s=await t.fetchAndCachePut(e)}catch(i){i instanceof Error&&(a=i)}if(!s)throw new l("no-response",{url:e.url,error:a});return s}}const Se={cacheWillUpdate:async({response:n})=>n.status===200||n.status===0?n:null};class G extends N{constructor(e={}){super(e),this.plugins.some(t=>"cacheWillUpdate"in t)||this.plugins.unshift(Se),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,t){const s=[],a=[];let i;if(this._networkTimeoutSeconds){const{id:o,promise:h}=this._getTimeoutPromise({request:e,logs:s,handler:t});i=o,a.push(h)}const r=this._getNetworkPromise({timeoutId:i,request:e,logs:s,handler:t});a.push(r);const c=await t.waitUntil((async()=>await t.waitUntil(Promise.race(a))||await r)());if(!c)throw new l("no-response",{url:e.url});return c}_getTimeoutPromise({request:e,logs:t,handler:s}){let a;return{promise:new Promise(r=>{a=setTimeout(async()=>{r(await s.cacheMatch(e))},this._networkTimeoutSeconds*1e3)}),id:a}}async _getNetworkPromise({timeoutId:e,request:t,logs:s,handler:a}){let i,r;try{r=await a.fetchAndCachePut(t)}catch(c){c instanceof Error&&(i=c)}return e&&clearTimeout(e),(i||!r)&&(r=await a.cacheMatch(t)),r}}class z extends N{constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,t){let s,a;try{const i=[t.fetch(e)];if(this._networkTimeoutSeconds){const r=X(this._networkTimeoutSeconds*1e3);i.push(r)}if(a=await Promise.race(i),!a)throw new Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`)}catch(i){i instanceof Error&&(s=i)}if(!a)throw new l("no-response",{url:e.url,error:s});return a}}try{self["workbox:cacheable-response:7.0.0"]&&_()}catch{}class ve{constructor(e={}){this._statuses=e.statuses,this._headers=e.headers}isResponseCacheable(e){let t=!0;return this._statuses&&(t=this._statuses.includes(e.status)),this._headers&&t&&(t=Object.keys(this._headers).some(s=>e.headers.get(s)===this._headers[s])),t}}class xe{constructor(e){this.cacheWillUpdate=async({response:t})=>this._cacheableResponse.isResponseCacheable(t)?t:null,this._cacheableResponse=new ve(e)}}try{self["workbox:precaching:7.0.0"]&&_()}catch{}const Ke="__WB_REVISION__";function Me(n){if(!n)throw new l("add-to-cache-list-unexpected-type",{entry:n});if(typeof n=="string"){const i=new URL(n,location.href);return{cacheKey:i.href,url:i.href}}const{revision:e,url:t}=n;if(!t)throw new l("add-to-cache-list-unexpected-type",{entry:n});if(!e){const i=new URL(t,location.href);return{cacheKey:i.href,url:i.href}}const s=new URL(t,location.href),a=new URL(t,location.href);return s.searchParams.set(Ke,e),{cacheKey:s.href,url:a.href}}class Oe{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if(e.type==="install"&&t&&t.originalRequest&&t.originalRequest instanceof Request){const a=t.originalRequest.url;s?this.notUpdatedURLs.push(a):this.updatedURLs.push(a)}return s}}}class Ae{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:t,params:s})=>{const a=s?.cacheKey||this._precacheController.getCacheKeyForURL(t.url);return a?new Request(a,{headers:t.headers}):t},this._precacheController=e}}class y extends N{constructor(e={}){e.cacheName=P.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(y.copyRedirectedCacheableResponsesPlugin)}async _handle(e,t){const s=await t.cacheMatch(e);return s||(t.event&&t.event.type==="install"?await this._handleInstall(e,t):await this._handleFetch(e,t))}async _handleFetch(e,t){let s;const a=t.params||{};if(this._fallbackToNetwork){const i=a.integrity,r=e.integrity,c=!r||r===i;s=await t.fetch(new Request(e,{integrity:e.mode!=="no-cors"?r||i:void 0})),i&&c&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),await t.cachePut(e,s.clone()))}else throw new l("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return s}async _handleInstall(e,t){this._useDefaultCacheabilityPluginIfNeeded();const s=await t.fetch(e);if(!await t.cachePut(e,s.clone()))throw new l("bad-precaching-response",{url:e.url,status:s.status});return s}_useDefaultCacheabilityPluginIfNeeded(){let e=null,t=0;for(const[s,a]of this.plugins.entries())a!==y.copyRedirectedCacheableResponsesPlugin&&(a===y.defaultPrecacheCacheabilityPlugin&&(e=s),a.cacheWillUpdate&&t++);t===0?this.plugins.push(y.defaultPrecacheCacheabilityPlugin):t>1&&e!==null&&this.plugins.splice(e,1)}}y.defaultPrecacheCacheabilityPlugin={async cacheWillUpdate({response:n}){return!n||n.status>=400?null:n}};y.copyRedirectedCacheableResponsesPlugin={async cacheWillUpdate({response:n}){return n.redirected?await he(n):n}};class Be{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new y({cacheName:P.getPrecacheName(e),plugins:[...t,new Ae({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const t=[];for(const s of e){typeof s=="string"?t.push(s):s&&s.revision===void 0&&t.push(s.url);const{cacheKey:a,url:i}=Me(s),r=typeof s!="string"&&s.revision?"reload":"default";if(this._urlsToCacheKeys.has(i)&&this._urlsToCacheKeys.get(i)!==a)throw new l("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(i),secondEntry:a});if(typeof s!="string"&&s.integrity){if(this._cacheKeysToIntegrities.has(a)&&this._cacheKeysToIntegrities.get(a)!==s.integrity)throw new l("add-to-cache-list-conflicting-integrities",{url:i});this._cacheKeysToIntegrities.set(a,s.integrity)}if(this._urlsToCacheKeys.set(i,a),this._urlsToCacheModes.set(i,r),t.length>0){const c=`Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(c)}}}install(e){return B(e,async()=>{const t=new Oe;this.strategy.plugins.push(t);for(const[i,r]of this._urlsToCacheKeys){const c=this._cacheKeysToIntegrities.get(r),o=this._urlsToCacheModes.get(i),h=new Request(i,{integrity:c,cache:o,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:r},request:h,event:e}))}const{updatedURLs:s,notUpdatedURLs:a}=t;return{updatedURLs:s,notUpdatedURLs:a}})}activate(e){return B(e,async()=>{const t=await self.caches.open(this.strategy.cacheName),s=await t.keys(),a=new Set(this._urlsToCacheKeys.values()),i=[];for(const r of s)a.has(r.url)||(await t.delete(r),i.push(r.url));return{deletedURLs:i}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s)return(await self.caches.open(this.strategy.cacheName)).match(s)}createHandlerBoundToURL(e){const t=this.getCacheKeyForURL(e);if(!t)throw new l("non-precached-url",{url:e});return s=>(s.request=new Request(e),s.params=Object.assign({cacheKey:t},s.params),this.strategy.handle(s))}}let S;const M=()=>(S||(S=new Be),S);function Fe(n,e=[]){for(const t of[...n.searchParams.keys()])e.some(s=>s.test(t))&&n.searchParams.delete(t);return n}function*je(n,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:t="index.html",cleanURLs:s=!0,urlManipulation:a}={}){const i=new URL(n,location.href);i.hash="",yield i.href;const r=Fe(i,e);if(yield r.href,t&&r.pathname.endsWith("/")){const c=new URL(r.href);c.pathname+=t,yield c.href}if(s){const c=new URL(r.href);c.pathname+=".html",yield c.href}if(a){const c=a({url:i});for(const o of c)yield o.href}}class We extends g{constructor(e,t){const s=({request:a})=>{const i=e.getURLsToCacheKeys();for(const r of je(a.url,t)){const c=i.get(r);if(c){const o=e.getIntegrityForCacheKey(c);return{cacheKey:c,integrity:o}}}};super(s,e.strategy)}}function He(n){const e=M(),t=new We(e,n);p(t)}const Qe="-precache-",$e=async(n,e=Qe)=>{const s=(await self.caches.keys()).filter(a=>a.includes(e)&&a.includes(self.registration.scope)&&a!==n);return await Promise.all(s.map(a=>self.caches.delete(a))),s};function Ve(){self.addEventListener("activate",n=>{const e=P.getPrecacheName();n.waitUntil($e(e).then(t=>{}))})}function Ge(n){M().precache(n)}function ze(n,e){Ge(n),He(e)}class Xe{constructor({fallbackURL:e,precacheController:t}){this.handlerDidError=()=>this._precacheController.matchPrecache(this._fallbackURL),this._fallbackURL=e,this._precacheController=t||M()}}self.skipWaiting();le();if(self.location.hostname!=="localhost"){let n=function(r){return`hashed-${1722349522171}-${r}`};Ve(),ze([{"revision":"8a4913415a2b597f30ae04feb8d31716","url":"20240730-app-BFHCzcAv.js"},{"revision":"17b53bfec564888249d5a19a4132b7e2","url":"20240730-app-EyLzDdbB.js"},{"revision":"5244967a16f91fcd98872132387db012","url":"20240730-app-frame_app-e6XRxSXZ.js"},{"revision":"087652ddc07a4b1795403935f3fa0134","url":"20240730-auth-4Rcmssnr.js"},{"revision":"4546ae222fe1fea397ea0d2405566389","url":"20240730-build-matchers-array-DLW3FjF0.js"},{"revision":"19f8f3931fabb18a10c306af3747d7ff","url":"20240730-clinicians-main_app-C4ePwPhQ.js"},{"revision":"1d25864a8f1bc967c4559a3cf13f85cd","url":"20240730-dashboards-main_app-BXN_DC1J.js"},{"revision":"d35b1452c710852aa5b3ec33b1901782","url":"20240730-formapp-M5D4qmH-.js"},{"revision":"9e0f998c537c547e93f689702ace2f83","url":"20240730-forms-main_app-PP5GaDAj.js"},{"revision":"0f4accdd85f2aaf401fc0289ef7d1d37","url":"20240730-formservice-BDH3KgzI.js"},{"revision":"1e6fd05450d0d3b35d662cd3a01f7440","url":"20240730-iframe-form-yacvsabY.js"},{"revision":"02929a01e8551fee9a481282a74b270b","url":"20240730-index-Coix0r9j.js"},{"revision":"87ba91b2b9f01a1398e58bcca72a3bcc","url":"20240730-index-CsISVEza.js"},{"revision":"01a77e27d6d51a188259a5ee9c2c9977","url":"20240730-index-DmcS4w7Y.js"},{"revision":"3f1f12dd98300c9317503be22e835624","url":"20240730-list-pages-GG2NKHug.js"},{"revision":"fc3f7f690308f8b0356884519ef87edc","url":"20240730-parsePhoneNumber-Cy1cmltz.js"},{"revision":"58406849898604ed4b73f180b70d37d5","url":"20240730-patients-main_app-RUu0Ae_z.js"},{"revision":"108f24dcf5682e14726868a3d6052ab6","url":"20240730-prelogin_views-DMGoA6Mg.js"},{"revision":"f5b5495c162b57aba0bd2754d7004dd8","url":"20240730-programs-main_app-5_oTAqhR.js"},{"revision":"06d16960992b8412602d4fb5c4975365","url":"20240730-reduced-patients-main_app-BUQi-c6-.js"},{"revision":"d41a977a0dddde7d2594da37bf2cd2da","url":"20240730-runtime-CZ7wsFni.js"},{"revision":"e199c369d0039f5f5d615a3d16b56108","url":"20240730-schedule_views-D8nWyZNH.js"},{"revision":"6f7de74e7b68d4d6c0a72c7fa8871dbd","url":"20240730-sidebar_app-CCmjq2ws.js"},{"revision":"6aa3f01f164a728d4810f2eba280a151","url":"20240730-workspaces-CmHMUl5I.js"},{"revision":null,"url":"assets/app-B79XuN-N.css"},{"revision":null,"url":"assets/app-DZ5SM8r1.css"},{"revision":null,"url":"assets/app-frame_app-B5FfPOPX.css"},{"revision":null,"url":"assets/build-matchers-array-C6KS_ldS.css"},{"revision":null,"url":"assets/clinicians-main_app-4xXSWT_q.css"},{"revision":null,"url":"assets/dashboards-main_app-CGagFgI8.css"},{"revision":null,"url":"assets/fa-solid-900-Bn3u-mvK.woff2"},{"revision":null,"url":"assets/formapp-DqKi6orQ.css"},{"revision":null,"url":"assets/forms-main_app-D8OEjpRW.css"},{"revision":null,"url":"assets/iframe-form-Dt2lfO_2.css"},{"revision":null,"url":"assets/index-B_TZY9pE.css"},{"revision":null,"url":"assets/list-pages-DqOoO24I.css"},{"revision":null,"url":"assets/loader-CdTtOIxO.css"},{"revision":null,"url":"assets/patients-main_app-Cq1F9ffA.css"},{"revision":null,"url":"assets/prelogin_views-D_NB3Jdp.css"},{"revision":null,"url":"assets/programs-main_app-w5LJytKv.css"},{"revision":null,"url":"assets/schedule_views-BM8bVuog.css"},{"revision":null,"url":"assets/sidebar_app-DUR0jsDX.css"},{"revision":"add648dcf37b0d3f5e04345cdc1ca376","url":"fonts/ProximaSoft/3955CC_0_0.woff2"},{"revision":"f66c57cf4d06520f9da99fa96d8f60f0","url":"fonts/ProximaSoft/3955CC_1_0.woff2"},{"revision":"9ac260a7780c56f86a2ad084a1765ef9","url":"fonts/ProximaSoft/3955CC_2_0.woff2"},{"revision":"37c5627028abd7d049f6f5b6aa65d23e","url":"fonts/ProximaSoft/3955CC_3_0.woff2"},{"revision":"81099a55deb671f19fb3d378e6009e1a","url":"fonts/ProximaSoft/3955CC_4_0.woff2"},{"revision":"eb7dc243d9bd0cfd32b3d9424646b34a","url":"fonts/ProximaSoft/3955CC_5_0.woff2"},{"revision":"ebbe879e0c6c782c668e00687a764279","url":"fonts/SignPainterHouseScriptRg/font.woff2"},{"revision":"51e81084096fb5c2af8eec014c4641f1","url":"index.html"},{"revision":"18a63fcd8153c36a059cf12499053b2a","url":"site.webmanifest"}]);const e=new g(({request:r})=>r.mode==="navigate",new z({plugins:[new Xe({fallbackURL:"/index.html"})]}));p(e);const t=new g(({request:r})=>["image"].includes(r.destination),new V({cacheName:"cache-static-assets"}));p(t);async function s(){const c=(await self.caches.keys()).filter(o=>o.startsWith("hashed-")&&!o.startsWith(`hashed-${1722349522171}`));return await Promise.all(c.map(o=>self.caches.delete(o))),c}s();const a=new g(({request:r})=>["script","style"].includes(r.destination),new V({cacheName:n("static-hashed-assets")}));p(a),p(({url:r})=>r.pathname.includes("appconfig.json"),new G({cacheName:"cache-appconfig"})),p(({url:r})=>r.pathname.startsWith("/api/"),new G({cacheName:"cache-api",plugins:[new xe({statuses:[0,200,204,404,410]})]}));const i=new Te("form-responses",{maxRetentionTime:24*60});p(/\/api\/form-responses/,new z({plugins:[i]}),"POST")}
