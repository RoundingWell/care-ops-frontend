import{_ as N,V as R,a as Fe}from"./20241017-runtime-DnmPeeVn.js";/* empty css                        */var ye={update:null,begin:null,loopBegin:null,changeBegin:null,change:null,changeComplete:null,loopComplete:null,complete:null,loop:1,direction:"normal",autoplay:!0,timelineOffset:0},X={duration:1e3,delay:0,endDelay:0,easing:"easeOutElastic(1, .5)",round:0},Re=["translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY","perspective","matrix","matrix3d"],U={CSS:{},springs:{}};function I(e,r,n){return Math.min(Math.max(e,r),n)}function F(e,r){return e.indexOf(r)>-1}function J(e,r){return e.apply(null,r)}var f={arr:function(e){return Array.isArray(e)},obj:function(e){return F(Object.prototype.toString.call(e),"Object")},pth:function(e){return f.obj(e)&&e.hasOwnProperty("totalLength")},svg:function(e){return e instanceof SVGElement},inp:function(e){return e instanceof HTMLInputElement},dom:function(e){return e.nodeType||f.svg(e)},str:function(e){return typeof e=="string"},fnc:function(e){return typeof e=="function"},und:function(e){return typeof e>"u"},nil:function(e){return f.und(e)||e===null},hex:function(e){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(e)},rgb:function(e){return/^rgb/.test(e)},hsl:function(e){return/^hsl/.test(e)},col:function(e){return f.hex(e)||f.rgb(e)||f.hsl(e)},key:function(e){return!ye.hasOwnProperty(e)&&!X.hasOwnProperty(e)&&e!=="targets"&&e!=="keyframes"}};function we(e){var r=/\(([^)]+)\)/.exec(e);return r?r[1].split(",").map(function(n){return parseFloat(n)}):[]}function be(e,r){var n=we(e),a=I(f.und(n[0])?1:n[0],.1,100),t=I(f.und(n[1])?100:n[1],.1,100),o=I(f.und(n[2])?10:n[2],.1,100),u=I(f.und(n[3])?0:n[3],.1,100),s=Math.sqrt(t/a),i=o/(2*Math.sqrt(t*a)),p=i<1?s*Math.sqrt(1-i*i):0,c=1,l=i<1?(i*s+-u)/p:-u+s;function h(m){var v=r?r*m/1e3:m;return i<1?v=Math.exp(-v*i*s)*(c*Math.cos(p*v)+l*Math.sin(p*v)):v=(c+l*v)*Math.exp(-v*s),m===0||m===1?m:1-v}function P(){var m=U.springs[e];if(m)return m;for(var v=1/6,w=0,x=0;;)if(w+=v,h(w)===1){if(x++,x>=16)break}else x=0;var g=w*v*1e3;return U.springs[e]=g,g}return r?h:P}function He(e){return e===void 0&&(e=10),function(r){return Math.ceil(I(r,1e-6,1)*e)*(1/e)}}var Ue=function(){var e=11,r=1/(e-1);function n(c,l){return 1-3*l+3*c}function a(c,l){return 3*l-6*c}function t(c){return 3*c}function o(c,l,h){return((n(l,h)*c+a(l,h))*c+t(l))*c}function u(c,l,h){return 3*n(l,h)*c*c+2*a(l,h)*c+t(l)}function s(c,l,h,P,m){var v,w,x=0;do w=l+(h-l)/2,v=o(w,P,m)-c,v>0?h=w:l=w;while(Math.abs(v)>1e-7&&++x<10);return w}function i(c,l,h,P){for(var m=0;m<4;++m){var v=u(l,h,P);if(v===0)return l;var w=o(l,h,P)-c;l-=w/v}return l}function p(c,l,h,P){if(!(0<=c&&c<=1&&0<=h&&h<=1))return;var m=new Float32Array(e);if(c!==l||h!==P)for(var v=0;v<e;++v)m[v]=o(v*r,c,h);function w(x){for(var g=0,d=1,T=e-1;d!==T&&m[d]<=x;++d)g+=r;--d;var L=(x-m[d])/(m[d+1]-m[d]),b=g+L*r,V=u(b,c,h);return V>=.001?i(x,b,c,h):V===0?b:s(x,g,g+r,c,h)}return function(x){return c===l&&h===P||x===0||x===1?x:o(w(x),l,P)}}return p}(),xe=function(){var e={linear:function(){return function(a){return a}}},r={Sine:function(){return function(a){return 1-Math.cos(a*Math.PI/2)}},Expo:function(){return function(a){return a?Math.pow(2,10*a-10):0}},Circ:function(){return function(a){return 1-Math.sqrt(1-a*a)}},Back:function(){return function(a){return a*a*(3*a-2)}},Bounce:function(){return function(a){for(var t,o=4;a<((t=Math.pow(2,--o))-1)/11;);return 1/Math.pow(4,3-o)-7.5625*Math.pow((t*3-2)/22-a,2)}},Elastic:function(a,t){a===void 0&&(a=1),t===void 0&&(t=.5);var o=I(a,1,10),u=I(t,.1,2);return function(s){return s===0||s===1?s:-o*Math.pow(2,10*(s-1))*Math.sin((s-1-u/(Math.PI*2)*Math.asin(1/o))*(Math.PI*2)/u)}}},n=["Quad","Cubic","Quart","Quint"];return n.forEach(function(a,t){r[a]=function(){return function(o){return Math.pow(o,t+2)}}}),Object.keys(r).forEach(function(a){var t=r[a];e["easeIn"+a]=t,e["easeOut"+a]=function(o,u){return function(s){return 1-t(o,u)(1-s)}},e["easeInOut"+a]=function(o,u){return function(s){return s<.5?t(o,u)(s*2)/2:1-t(o,u)(s*-2+2)/2}},e["easeOutIn"+a]=function(o,u){return function(s){return s<.5?(1-t(o,u)(1-s*2))/2:(t(o,u)(s*2-1)+1)/2}}}),e}();function ee(e,r){if(f.fnc(e))return e;var n=e.split("(")[0],a=xe[n],t=we(e);switch(n){case"spring":return be(e,r);case"cubicBezier":return J(Ue,t);case"steps":return J(He,t);default:return J(a,t)}}function Me(e){try{var r=document.querySelectorAll(e);return r}catch{return}}function W(e,r){for(var n=e.length,a=arguments.length>=2?arguments[1]:void 0,t=[],o=0;o<n;o++)if(o in e){var u=e[o];r.call(a,u,o,e)&&t.push(u)}return t}function q(e){return e.reduce(function(r,n){return r.concat(f.arr(n)?q(n):n)},[])}function de(e){return f.arr(e)?e:(f.str(e)&&(e=Me(e)||e),e instanceof NodeList||e instanceof HTMLCollection?[].slice.call(e):[e])}function re(e,r){return e.some(function(n){return n===r})}function ne(e){var r={};for(var n in e)r[n]=e[n];return r}function Y(e,r){var n=ne(e);for(var a in e)n[a]=r.hasOwnProperty(a)?r[a]:e[a];return n}function Q(e,r){var n=ne(e);for(var a in r)n[a]=f.und(e[a])?r[a]:e[a];return n}function Ne(e){var r=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(e);return r?"rgba("+r[1]+",1)":e}function We(e){var r=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,n=e.replace(r,function(s,i,p,c){return i+i+p+p+c+c}),a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(n),t=parseInt(a[1],16),o=parseInt(a[2],16),u=parseInt(a[3],16);return"rgba("+t+","+o+","+u+",1)"}function qe(e){var r=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(e)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(e),n=parseInt(r[1],10)/360,a=parseInt(r[2],10)/100,t=parseInt(r[3],10)/100,o=r[4]||1;function u(h,P,m){return m<0&&(m+=1),m>1&&(m-=1),m<1/6?h+(P-h)*6*m:m<1/2?P:m<2/3?h+(P-h)*(2/3-m)*6:h}var s,i,p;if(a==0)s=i=p=t;else{var c=t<.5?t*(1+a):t+a-t*a,l=2*t-c;s=u(l,c,n+1/3),i=u(l,c,n),p=u(l,c,n-1/3)}return"rgba("+s*255+","+i*255+","+p*255+","+o+")"}function Qe(e){if(f.rgb(e))return Ne(e);if(f.hex(e))return We(e);if(f.hsl(e))return qe(e)}function D(e){var r=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(e);if(r)return r[1]}function Ze(e){if(F(e,"translate")||e==="perspective")return"px";if(F(e,"rotate")||F(e,"skew"))return"deg"}function G(e,r){return f.fnc(e)?e(r.target,r.id,r.total):e}function O(e,r){return e.getAttribute(r)}function te(e,r,n){var a=D(r);if(re([n,"deg","rad","turn"],a))return r;var t=U.CSS[r+n];if(!f.und(t))return t;var o=100,u=document.createElement(e.tagName),s=e.parentNode&&e.parentNode!==document?e.parentNode:document.body;s.appendChild(u),u.style.position="absolute",u.style.width=o+n;var i=o/u.offsetWidth;s.removeChild(u);var p=i*parseFloat(r);return U.CSS[r+n]=p,p}function Pe(e,r,n){if(r in e.style){var a=r.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),t=e.style[r]||getComputedStyle(e).getPropertyValue(a)||"0";return n?te(e,t,n):t}}function ae(e,r){if(f.dom(e)&&!f.inp(e)&&(!f.nil(O(e,r))||f.svg(e)&&e[r]))return"attribute";if(f.dom(e)&&re(Re,r))return"transform";if(f.dom(e)&&r!=="transform"&&Pe(e,r))return"css";if(e[r]!=null)return"object"}function Te(e){if(f.dom(e)){for(var r=e.style.transform||"",n=/(\w+)\(([^)]*)\)/g,a=new Map,t;t=n.exec(r);)a.set(t[1],t[2]);return a}}function $e(e,r,n,a){var t=F(r,"scale")?1:0+Ze(r),o=Te(e).get(r)||t;return n&&(n.transforms.list.set(r,o),n.transforms.last=r),a?te(e,o,a):o}function ie(e,r,n,a){switch(ae(e,r)){case"transform":return $e(e,r,a,n);case"css":return Pe(e,r,n);case"attribute":return O(e,r);default:return e[r]||0}}function oe(e,r){var n=/^(\*=|\+=|-=)/.exec(e);if(!n)return e;var a=D(e)||0,t=parseFloat(r),o=parseFloat(e.replace(n[0],""));switch(n[0][0]){case"+":return t+o+a;case"-":return t-o+a;case"*":return t*o+a}}function ke(e,r){if(f.col(e))return Qe(e);if(/\s/g.test(e))return e;var n=D(e),a=n?e.substr(0,e.length-n.length):e;return r?a+r:a}function ue(e,r){return Math.sqrt(Math.pow(r.x-e.x,2)+Math.pow(r.y-e.y,2))}function Ke(e){return Math.PI*2*O(e,"r")}function Je(e){return O(e,"width")*2+O(e,"height")*2}function Ye(e){return ue({x:O(e,"x1"),y:O(e,"y1")},{x:O(e,"x2"),y:O(e,"y2")})}function Ce(e){for(var r=e.points,n=0,a,t=0;t<r.numberOfItems;t++){var o=r.getItem(t);t>0&&(n+=ue(a,o)),a=o}return n}function Ge(e){var r=e.points;return Ce(e)+ue(r.getItem(r.numberOfItems-1),r.getItem(0))}function Ie(e){if(e.getTotalLength)return e.getTotalLength();switch(e.tagName.toLowerCase()){case"circle":return Ke(e);case"rect":return Je(e);case"line":return Ye(e);case"polyline":return Ce(e);case"polygon":return Ge(e)}}function Xe(e){var r=Ie(e);return e.setAttribute("stroke-dasharray",r),r}function er(e){for(var r=e.parentNode;f.svg(r)&&f.svg(r.parentNode);)r=r.parentNode;return r}function Oe(e,r){var n=r||{},a=n.el||er(e),t=a.getBoundingClientRect(),o=O(a,"viewBox"),u=t.width,s=t.height,i=n.viewBox||(o?o.split(" "):[0,0,u,s]);return{el:a,viewBox:i,x:i[0]/1,y:i[1]/1,w:u,h:s,vW:i[2],vH:i[3]}}function rr(e,r){var n=f.str(e)?Me(e)[0]:e,a=r||100;return function(t){return{property:t,el:n,svg:Oe(n),totalLength:Ie(n)*(a/100)}}}function nr(e,r,n){function a(c){c===void 0&&(c=0);var l=r+c>=1?r+c:0;return e.el.getPointAtLength(l)}var t=Oe(e.el,e.svg),o=a(),u=a(-1),s=a(1),i=n?1:t.w/t.vW,p=n?1:t.h/t.vH;switch(e.property){case"x":return(o.x-t.x)*i;case"y":return(o.y-t.y)*p;case"angle":return Math.atan2(s.y-u.y,s.x-u.x)*180/Math.PI}}function ge(e,r){var n=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,a=ke(f.pth(e)?e.totalLength:e,r)+"";return{original:a,numbers:a.match(n)?a.match(n).map(Number):[0],strings:f.str(e)||r?a.split(n):[]}}function se(e){var r=e?q(f.arr(e)?e.map(de):de(e)):[];return W(r,function(n,a,t){return t.indexOf(n)===a})}function De(e){var r=se(e);return r.map(function(n,a){return{target:n,id:a,total:r.length,transforms:{list:Te(n)}}})}function tr(e,r){var n=ne(r);if(/^spring/.test(n.easing)&&(n.duration=be(n.easing)),f.arr(e)){var a=e.length,t=a===2&&!f.obj(e[0]);t?e={value:e}:f.fnc(r.duration)||(n.duration=r.duration/a)}var o=f.arr(e)?e:[e];return o.map(function(u,s){var i=f.obj(u)&&!f.pth(u)?u:{value:u};return f.und(i.delay)&&(i.delay=s?0:r.delay),f.und(i.endDelay)&&(i.endDelay=s===o.length-1?r.endDelay:0),i}).map(function(u){return Q(u,n)})}function ar(e){for(var r=W(q(e.map(function(o){return Object.keys(o)})),function(o){return f.key(o)}).reduce(function(o,u){return o.indexOf(u)<0&&o.push(u),o},[]),n={},a=function(o){var u=r[o];n[u]=e.map(function(s){var i={};for(var p in s)f.key(p)?p==u&&(i.value=s[p]):i[p]=s[p];return i})},t=0;t<r.length;t++)a(t);return n}function ir(e,r){var n=[],a=r.keyframes;a&&(r=Q(ar(a),r));for(var t in r)f.key(t)&&n.push({name:t,tweens:tr(r[t],e)});return n}function or(e,r){var n={};for(var a in e){var t=G(e[a],r);f.arr(t)&&(t=t.map(function(o){return G(o,r)}),t.length===1&&(t=t[0])),n[a]=t}return n.duration=parseFloat(n.duration),n.delay=parseFloat(n.delay),n}function ur(e,r){var n;return e.tweens.map(function(a){var t=or(a,r),o=t.value,u=f.arr(o)?o[1]:o,s=D(u),i=ie(r.target,e.name,s,r),p=n?n.to.original:i,c=f.arr(o)?o[0]:p,l=D(c)||D(i),h=s||l;return f.und(u)&&(u=p),t.from=ge(c,h),t.to=ge(oe(u,c),h),t.start=n?n.end:0,t.end=t.start+t.delay+t.duration+t.endDelay,t.easing=ee(t.easing,t.duration),t.isPath=f.pth(o),t.isPathTargetInsideSVG=t.isPath&&f.svg(r.target),t.isColor=f.col(t.from.original),t.isColor&&(t.round=1),n=t,t})}var Le={css:function(e,r,n){return e.style[r]=n},attribute:function(e,r,n){return e.setAttribute(r,n)},object:function(e,r,n){return e[r]=n},transform:function(e,r,n,a,t){if(a.list.set(r,n),r===a.last||t){var o="";a.list.forEach(function(u,s){o+=s+"("+u+") "}),e.style.transform=o}}};function Ve(e,r){var n=De(e);n.forEach(function(a){for(var t in r){var o=G(r[t],a),u=a.target,s=D(o),i=ie(u,t,s,a),p=s||D(i),c=oe(ke(o,p),i),l=ae(u,t);Le[l](u,t,c,a.transforms,!0)}})}function sr(e,r){var n=ae(e.target,r.name);if(n){var a=ur(r,e),t=a[a.length-1];return{type:n,property:r.name,animatable:e,tweens:a,duration:t.end,delay:a[0].delay,endDelay:t.endDelay}}}function cr(e,r){return W(q(e.map(function(n){return r.map(function(a){return sr(n,a)})})),function(n){return!f.und(n)})}function ze(e,r){var n=e.length,a=function(o){return o.timelineOffset?o.timelineOffset:0},t={};return t.duration=n?Math.max.apply(Math,e.map(function(o){return a(o)+o.duration})):r.duration,t.delay=n?Math.min.apply(Math,e.map(function(o){return a(o)+o.delay})):r.delay,t.endDelay=n?t.duration-Math.max.apply(Math,e.map(function(o){return a(o)+o.duration-o.endDelay})):r.endDelay,t}var he=0;function fr(e){var r=Y(ye,e),n=Y(X,e),a=ir(n,e),t=De(e.targets),o=cr(t,a),u=ze(o,n),s=he;return he++,Q(r,{id:s,children:[],animatables:t,animations:o,duration:u.duration,delay:u.delay,endDelay:u.endDelay})}var C=[],Ee=function(){var e;function r(){!e&&(!pe()||!y.suspendWhenDocumentHidden)&&C.length>0&&(e=requestAnimationFrame(n))}function n(t){for(var o=C.length,u=0;u<o;){var s=C[u];s.paused?(C.splice(u,1),o--):(s.tick(t),u++)}e=u>0?requestAnimationFrame(n):void 0}function a(){y.suspendWhenDocumentHidden&&(pe()?e=cancelAnimationFrame(e):(C.forEach(function(t){return t._onDocumentVisibility()}),Ee()))}return typeof document<"u"&&document.addEventListener("visibilitychange",a),r}();function pe(){return!!document&&document.hidden}function y(e){e===void 0&&(e={});var r=0,n=0,a=0,t,o=0,u=null;function s(g){var d=window.Promise&&new Promise(function(T){return u=T});return g.finished=d,d}var i=fr(e);s(i);function p(){var g=i.direction;g!=="alternate"&&(i.direction=g!=="normal"?"normal":"reverse"),i.reversed=!i.reversed,t.forEach(function(d){return d.reversed=i.reversed})}function c(g){return i.reversed?i.duration-g:g}function l(){r=0,n=c(i.currentTime)*(1/y.speed)}function h(g,d){d&&d.seek(g-d.timelineOffset)}function P(g){if(i.reversePlayback)for(var T=o;T--;)h(g,t[T]);else for(var d=0;d<o;d++)h(g,t[d])}function m(g){for(var d=0,T=i.animations,L=T.length;d<L;){var b=T[d],V=b.animatable,B=b.tweens,z=B.length-1,M=B[z];z&&(M=W(B,function(Ae){return g<Ae.end})[0]||M);for(var E=I(g-M.start-M.delay,0,M.duration)/M.duration,H=isNaN(E)?1:M.easing(E),k=M.to.strings,Z=M.round,$=[],je=M.to.numbers.length,S=void 0,_=0;_<je;_++){var j=void 0,ce=M.to.numbers[_],fe=M.from.numbers[_]||0;M.isPath?j=nr(M.value,H*ce,M.isPathTargetInsideSVG):j=fe+H*(ce-fe),Z&&(M.isColor&&_>2||(j=Math.round(j*Z)/Z)),$.push(j)}var le=k.length;if(!le)S=$[0];else{S=k[0];for(var A=0;A<le;A++){k[A];var ve=k[A+1],K=$[A];isNaN(K)||(ve?S+=K+ve:S+=K+" ")}}Le[b.type](V.target,b.property,S,V.transforms),b.currentValue=S,d++}}function v(g){i[g]&&!i.passThrough&&i[g](i)}function w(){i.remaining&&i.remaining!==!0&&i.remaining--}function x(g){var d=i.duration,T=i.delay,L=d-i.endDelay,b=c(g);i.progress=I(b/d*100,0,100),i.reversePlayback=b<i.currentTime,t&&P(b),!i.began&&i.currentTime>0&&(i.began=!0,v("begin")),!i.loopBegan&&i.currentTime>0&&(i.loopBegan=!0,v("loopBegin")),b<=T&&i.currentTime!==0&&m(0),(b>=L&&i.currentTime!==d||!d)&&m(d),b>T&&b<L?(i.changeBegan||(i.changeBegan=!0,i.changeCompleted=!1,v("changeBegin")),v("change"),m(b)):i.changeBegan&&(i.changeCompleted=!0,i.changeBegan=!1,v("changeComplete")),i.currentTime=I(b,0,d),i.began&&v("update"),g>=d&&(n=0,w(),i.remaining?(r=a,v("loopComplete"),i.loopBegan=!1,i.direction==="alternate"&&p()):(i.paused=!0,i.completed||(i.completed=!0,v("loopComplete"),v("complete"),!i.passThrough&&"Promise"in window&&(u(),s(i)))))}return i.reset=function(){var g=i.direction;i.passThrough=!1,i.currentTime=0,i.progress=0,i.paused=!0,i.began=!1,i.loopBegan=!1,i.changeBegan=!1,i.completed=!1,i.changeCompleted=!1,i.reversePlayback=!1,i.reversed=g==="reverse",i.remaining=i.loop,t=i.children,o=t.length;for(var d=o;d--;)i.children[d].reset();(i.reversed&&i.loop!==!0||g==="alternate"&&i.loop===1)&&i.remaining++,m(i.reversed?i.duration:0)},i._onDocumentVisibility=l,i.set=function(g,d){return Ve(g,d),i},i.tick=function(g){a=g,r||(r=a),x((a+(n-r))*y.speed)},i.seek=function(g){x(c(g))},i.pause=function(){i.paused=!0,l()},i.play=function(){i.paused&&(i.completed&&i.reset(),i.paused=!1,C.push(i),l(),Ee())},i.reverse=function(){p(),i.completed=!i.reversed,l()},i.restart=function(){i.reset(),i.play()},i.remove=function(g){var d=se(g);Se(d,i)},i.reset(),i.autoplay&&i.play(),i}function me(e,r){for(var n=r.length;n--;)re(e,r[n].animatable.target)&&r.splice(n,1)}function Se(e,r){var n=r.animations,a=r.children;me(e,n);for(var t=a.length;t--;){var o=a[t],u=o.animations;me(e,u),!u.length&&!o.children.length&&a.splice(t,1)}!n.length&&!a.length&&r.pause()}function lr(e){for(var r=se(e),n=C.length;n--;){var a=C[n];Se(r,a)}}function vr(e,r){r===void 0&&(r={});var n=r.direction||"normal",a=r.easing?ee(r.easing):null,t=r.grid,o=r.axis,u=r.from||0,s=u==="first",i=u==="center",p=u==="last",c=f.arr(e),l=parseFloat(c?e[0]:e),h=c?parseFloat(e[1]):0,P=D(c?e[1]:e)||0,m=r.start||0+(c?l:0),v=[],w=0;return function(x,g,d){if(s&&(u=0),i&&(u=(d-1)/2),p&&(u=d-1),!v.length){for(var T=0;T<d;T++){if(!t)v.push(Math.abs(u-T));else{var L=i?(t[0]-1)/2:u%t[0],b=i?(t[1]-1)/2:Math.floor(u/t[0]),V=T%t[0],B=Math.floor(T/t[0]),z=L-V,M=b-B,E=Math.sqrt(z*z+M*M);o==="x"&&(E=-z),o==="y"&&(E=-M),v.push(E)}w=Math.max.apply(Math,v)}a&&(v=v.map(function(k){return a(k/w)*w})),n==="reverse"&&(v=v.map(function(k){return o?k<0?k*-1:-k:Math.abs(w-k)}))}var H=c?(h-l)/w:l;return m+H*(Math.round(v[g]*100)/100)+P}}function dr(e){e===void 0&&(e={});var r=y(e);return r.duration=0,r.add=function(n,a){var t=C.indexOf(r),o=r.children;t>-1&&C.splice(t,1);function u(h){h.passThrough=!0}for(var s=0;s<o.length;s++)u(o[s]);var i=Q(n,Y(X,e));i.targets=i.targets||e.targets;var p=r.duration;i.autoplay=!1,i.direction=r.direction,i.timelineOffset=f.und(a)?p:oe(a,p),u(r),r.seek(i.timelineOffset);var c=y(i);u(c),o.push(c);var l=ze(o,e);return r.delay=l.delay,r.endDelay=l.endDelay,r.duration=l.duration,r.seek(0),r.reset(),r.autoplay&&r.play(),r},r}y.version="3.2.1";y.speed=1;y.suspendWhenDocumentHidden=!0;y.running=C;y.remove=lr;y.get=ie;y.set=Ve;y.convertPx=te;y.path=rr;y.setDashoffset=Xe;y.stagger=vr;y.timeline=dr;y.easing=ee;y.penner=xe;y.random=function(e,r){return Math.floor(Math.random()*(r-e+1))+e};const gr=N.template({compiler:[8,">= 4.3.0"],main:function(e,r,n,a,t){var o,u=e.lookupProperty||function(s,i){if(Object.prototype.hasOwnProperty.call(s,i))return s[i]};return`
  <div class="loader__bar js-progress-bar">
    <div class="loader__bar-progress--loop"></div>
  </div>
  <div class="loader__text js-loading">`+e.escapeExpression(e.lambda((o=(o=(o=t&&u(t,"intl"))&&u(o,"regions"))&&u(o,"preload"))&&u(o,"loading"),r))+`</div>
`},useData:!0}),hr=R.extend({className:"loader",template:gr,ui:{progressBar:".js-progress-bar",loading:".js-loading"},onRender(){const e=this.getOption("timeout");if(!e){this.showLoader(0,300);return}this.showLoader(e/2,e/2+200)},showLoader(e,r){y.timeline({easing:"easeInQuad",delay:e}).add({opacity:[0,1],targets:this.ui.progressBar[0],duration:r}).add({opacity:[0,1],targets:this.ui.loading[0],duration:r-100},100)}}),Be=Fe.extend({timeout:500,startPreloader(){this.show(new hr({timeout:this.getOption("timeout")}))}}),_e=N.template({compiler:[8,">= 4.3.0"],main:function(e,r,n,a,t){return`<div class="prelogin">
  <div class="prelogin__roundingwell-logo">
    <svg class="svg roundingwell-logo" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="174" height="30" viewBox="0 0 185 32">
      <g></g>
      <path d="M40.975 11.456c-1.339 0.082-2.624 0.683-3.499 1.995v8.501c0 0.547-0.465 1.011-1.039 1.011h-0.027c-0.547-0.027-0.984-0.465-0.984-1.011v-11.535c0-0.519 0.465-0.984 1.066-0.984 0.519 0 0.984 0.465 0.984 0.984v1.312c0.793-1.039 2.105-2.351 3.635-2.351 0.492 0 0.929 0.41 0.929 0.957 0 0.602-0.465 1.093-1.066 1.121z" fill="#ffffff" />
      <path d="M49.53 23.128c-4.018 0-6.533-3.116-6.533-6.943 0-3.827 2.515-6.916 6.533-6.916s6.533 3.089 6.533 6.916c0 3.826-2.514 6.943-6.533 6.943zM49.53 11.101c-2.815 0-4.401 2.406-4.401 5.084 0 2.706 1.585 5.111 4.401 5.111 2.815 0 4.373-2.406 4.373-5.111 0-2.679-1.558-5.084-4.373-5.084z" fill="#ffffff" />
      <path d="M68.636 22.964c-0.547 0-1.011-0.465-1.011-1.011v-1.011c-1.011 1.148-2.733 2.187-4.701 2.187-2.761 0-4.209-1.34-4.209-4.21v-8.501c0-0.519 0.465-0.984 1.066-0.984 0.519 0 0.984 0.465 0.984 0.984v7.872c0 2.323 1.175 3.007 2.952 3.007 1.613 0 3.143-0.929 3.909-1.995v-8.883c0-0.519 0.465-0.984 1.066-0.984 0.519 0 0.984 0.465 0.984 0.984v11.535c0 0.546-0.465 1.011-1.039 1.011z" fill="#ffffff" />
      <path d="M83.013 22.964c-0.547 0-1.011-0.465-1.011-1.011v-7.79c0-2.323-1.175-3.062-2.952-3.062-1.613 0-3.143 0.984-3.909 2.050v8.801c0 0.547-0.465 1.011-1.039 1.011-0.547 0-1.011-0.465-1.011-1.011v-11.535c0-0.519 0.465-0.984 1.066-0.984 0.519 0 0.984 0.465 0.984 0.984v1.093c0.929-1.093 2.733-2.242 4.701-2.242 2.761 0 4.21 1.394 4.21 4.264v8.419c-0 0.547-0.465 1.012-1.039 1.012z" fill="#ffffff" />
      <path d="M98.046 22.964c-0.547 0-1.011-0.465-1.011-1.011v-1.121c-0.984 1.34-2.597 2.296-4.455 2.296-3.444 0-5.877-2.624-5.877-6.915 0-4.21 2.405-6.943 5.877-6.943 1.777 0 3.389 0.875 4.455 2.324v-6.205c0-0.519 0.465-0.984 1.066-0.984 0.519 0 0.984 0.465 0.984 0.984v16.564c0 0.547-0.464 1.012-1.038 1.012zM97.035 13.233c-0.738-1.148-2.324-2.132-3.964-2.132-2.651 0-4.237 2.187-4.237 5.112 0 2.924 1.585 5.084 4.237 5.084 1.64 0 3.226-0.929 3.964-2.077v-5.986z" fill="#ffffff" />
      <path d="M103.512 22.964c-0.546 0-1.011-0.465-1.011-1.011v-11.535c0-0.519 0.465-0.984 1.066-0.984 0.52 0 0.984 0.465 0.984 0.984v11.535c0 0.547-0.465 1.012-1.039 1.012z" fill="#ffffff" />
      <path d="M117.89 22.964c-0.547 0-1.012-0.465-1.012-1.011v-7.79c0-2.323-1.175-3.062-2.952-3.062-1.613 0-3.143 0.984-3.909 2.050v8.801c0 0.547-0.464 1.011-1.038 1.011-0.547 0-1.011-0.465-1.011-1.011v-11.535c0-0.519 0.464-0.984 1.066-0.984 0.52 0 0.984 0.465 0.984 0.984v1.093c0.93-1.093 2.734-2.242 4.702-2.242 2.76 0 4.209 1.394 4.209 4.264v8.419c0 0.547-0.464 1.012-1.038 1.012z" fill="#ffffff" />
      <path d="M127.647 28.157c-1.941 0-3.499-0.355-4.947-1.585-0.191-0.164-0.301-0.41-0.301-0.684 0-0.465 0.41-0.875 0.902-0.875 0.218 0 0.41 0.055 0.574 0.191 1.039 0.929 2.214 1.257 3.772 1.257 2.187 0 4.237-1.066 4.237-3.964v-1.886c-0.957 1.34-2.57 2.351-4.428 2.351-3.444 0-5.876-2.569-5.876-6.833 0-4.237 2.405-6.861 5.876-6.861 1.777 0 3.362 0.875 4.428 2.324v-1.175c0-0.519 0.464-0.984 1.066-0.984 0.52 0 0.984 0.465 0.984 0.984v11.999c0 4.373-3.061 5.74-6.286 5.74zM131.884 13.233c-0.711-1.148-2.296-2.132-3.936-2.132-2.652 0-4.237 2.105-4.237 5.030 0 2.897 1.585 5.029 4.237 5.029 1.64 0 3.225-1.011 3.936-2.16v-5.767z" fill="#ffffff" />
      <path d="M155.309 11.237l-3.198 10.332c-0.246 0.82-1.039 1.394-1.886 1.394h-0.055c-0.875 0-1.64-0.574-1.886-1.394l-2.652-8.391-2.651 8.391c-0.246 0.82-1.039 1.394-1.913 1.394h-0.055c-0.848 0-1.613-0.574-1.859-1.394l-3.225-10.332c-0.027-0.137-0.055-0.273-0.055-0.41 0-0.684 0.574-1.394 1.449-1.394 0.629 0 1.23 0.41 1.394 1.011l2.515 8.665 2.788-8.528c0.219-0.683 0.848-1.148 1.64-1.148 0.711 0 1.34 0.465 1.585 1.148l2.788 8.528 2.514-8.665c0.164-0.601 0.766-1.011 1.395-1.011 0.847 0 1.449 0.656 1.449 1.394-0.001 0.137-0.028 0.273-0.083 0.41z" fill="#ffffff" />
      <path d="M168.073 17.141h-8.692c0.191 1.968 1.695 3.635 4.155 3.635 0.956 0 2.049-0.3 2.952-0.875 0.191-0.109 0.41-0.164 0.601-0.164 0.602 0 1.23 0.492 1.23 1.202 0 1.503-3.389 2.187-5.084 2.187-3.964 0-6.915-2.761-6.915-6.943 0-3.827 2.788-6.916 6.697-6.916 3.089 0 5.33 1.859 6.15 4.701 0.164 0.547 0.328 1.175 0.328 1.749 0 0.765-0.629 1.421-1.421 1.421zM163.017 11.62c-2.406 0-3.526 1.913-3.663 3.499h7.326c-0.055-1.53-1.094-3.499-3.663-3.499z" fill="#ffffff" />
      <path d="M173.129 22.964c-0.82 0-1.449-0.656-1.449-1.449v-15.689c0-0.765 0.629-1.421 1.503-1.421 0.766 0 1.422 0.656 1.422 1.421v15.689c-0 0.793-0.656 1.449-1.477 1.449z" fill="#ffffff" />
      <path d="M179.060 22.964c-0.82 0-1.449-0.656-1.449-1.449v-15.689c0-0.765 0.629-1.421 1.503-1.421 0.766 0 1.422 0.656 1.422 1.421v15.689c-0 0.793-0.656 1.449-1.477 1.449z" fill="#ffffff" />
      <path d="M28.781 14.834c-0.117-1.519-0.498-3.012-1.117-4.385-0.618-1.374-1.471-2.627-2.501-3.694-1.030-1.068-2.235-1.949-3.546-2.598-1.311-0.651-2.727-1.067-4.16-1.23-1.432-0.164-2.878-0.081-4.264 0.24-1.385 0.321-2.702 0.883-3.877 1.644-1.175 0.761-2.208 1.719-3.046 2.814-0.838 1.094-1.481 2.325-1.893 3.618-0.414 1.293-0.596 2.648-0.55 3.983l0.263 0.003c0.076-1.305 0.375-2.585 0.879-3.768 0.503-1.183 1.208-2.268 2.067-3.196 0.858-0.929 1.87-1.701 2.971-2.277 1.102-0.576 2.294-0.955 3.505-1.118 1.209-0.164 2.442-0.116 3.617 0.132 1.176 0.247 2.296 0.697 3.299 1.318 1.004 0.62 1.89 1.411 2.614 2.318 0.724 0.907 1.283 1.93 1.649 3.006 0.367 1.076 0.54 2.204 0.521 3.323-0.020 1.122-0.23 2.224-0.617 3.247-0.386 1.024-0.949 1.969-1.648 2.787-0.699 0.818-1.534 1.507-2.449 2.031-0.915 0.525-1.91 0.883-2.925 1.061-1.014 0.178-2.057 0.177-3.060 0.007-1.001-0.169-1.954-0.509-2.815-0.996-0.295-0.167-0.578-0.352-0.85-0.551l4.686-7.132-0.102-0.083-10.27 10.316 0.106 0.099c0.083 0.076 0.156 0.142 0.236 0.211 0.157 0.137 0.318 0.271 0.48 0.401 0.326 0.261 0.662 0.506 1.008 0.737 0.201 0.134 0.405 0.263 0.613 0.386 0.506 0.302 1.029 0.573 1.566 0.81 1.513 0.669 3.135 1.066 4.76 1.18 0.813 0.057 1.622 0.045 2.428-0.035 0.805-0.080 1.603-0.229 2.379-0.445 1.554-0.431 3.020-1.132 4.315-2.052 1.296-0.918 2.423-2.054 3.321-3.338 0.9-1.283 1.572-2.715 1.978-4.21 0.408-1.495 0.548-3.048 0.429-4.565z" fill="#ffffff" />
    </svg>
  </div>
  <div class="prelogin__content" data-content-region></div>
</div>
`},useData:!0}),pr=N.template({compiler:[8,">= 4.3.0"],main:function(e,r,n,a,t){var o,u=e.lookupProperty||function(s,i){if(Object.prototype.hasOwnProperty.call(s,i))return s[i]};return`<h1 class="prelogin__header">Sign in to your organization</h1>

<h2 class="prelogin__host">`+e.escapeExpression((o=(o=u(n,"url")||(r!=null?u(r,"url"):r))!=null?o:e.hooks.helperMissing,typeof o=="function"?o.call(r??(e.nullContext||{}),{name:"url",hash:{},data:t,loc:{start:{line:3,column:27},end:{line:3,column:36}}}):o))+`</h2>

<button class="prelogin__continue-button button--green js-login">
  Continue to sign in
  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="right-to-bracket" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" class="svg-inline--fa fa-right-to-bracket">
    <path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"></path>
  </svg>
</button>

<p class="prelogin__contact-info">Having trouble signing in? <a href="https://roundingwell.com/contact/">Contact Us</a></p>
`},useData:!0}),mr=N.template({compiler:[8,">= 4.3.0"],main:function(e,r,n,a,t){var o=e.lookupProperty||function(u,s){if(Object.prototype.hasOwnProperty.call(u,s))return u[s]};return`<div class="prelogin__message-header">
  `+e.escapeExpression((o(n,"far")||r&&o(r,"far")||e.hooks.helperMissing).call(r??(e.nullContext||{}),"circle-exclamation",{name:"far",hash:{},data:t,loc:{start:{line:2,column:2},end:{line:2,column:30}}}))+`
</div>
<div>
Hold up, your account is not
set up yet. Please notify your manager
or administrator to correct this issue.
</div>
`},useData:!0}),yr=R.extend({triggers:{"click .js-login":"click:login"},template:pr,templateContext:{url:location.host}}),Mr=R.extend({el:"#root",onRender(){this.showChildView("content",new yr)},regions:{content:{el:"[data-content-region]",regionClass:Be}},template:_e,childViewTriggers:{"click:login":"click:login"}}),wr=R.extend({className:"prelogin__message",template:mr}),Pr=R.extend({className:"fill-window",regions:{content:{el:"[data-content-region]",regionClass:Be}},template:_e,onRender(){if(this.getOption("notSetup")){this.showChildView("content",new wr);return}this.getRegion("content").startPreloader()}});export{Mr as L,Be as P,y as a,Pr as b};
