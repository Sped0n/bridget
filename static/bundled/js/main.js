const e={},t=function(t,n,r){let o=Promise.resolve();if(n&&n.length>0){const t=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),l=(null==s?void 0:s.nonce)||(null==s?void 0:s.getAttribute("nonce"));o=Promise.all(n.map((n=>{if((n=function(e){return"/"+e}(n))in e)return;e[n]=!0;const o=n.endsWith(".css"),s=o?'[rel="stylesheet"]':"";if(r)for(let e=t.length-1;e>=0;e--){const r=t[e];if(r.href===n&&(!o||"stylesheet"===r.rel))return}else if(document.querySelector(`link[href="${n}"]${s}`))return;const i=document.createElement("link");return i.rel=o?"stylesheet":"modulepreload",o||(i.as="script",i.crossOrigin=""),i.href=n,l&&i.setAttribute("nonce",l),document.head.appendChild(i),o?new Promise(((e,t)=>{i.addEventListener("load",e),i.addEventListener("error",(()=>t(new Error(`Unable to preload CSS for ${n}`))))})):void 0})))}return o.then((()=>t())).catch((e=>{const t=new Event("vite:preloadError",{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}))},n={context:void 0,registry:void 0};function r(e){n.context=e}const o=Symbol("solid-proxy"),s=Symbol("solid-track"),l={equals:(e,t)=>e===t};let i=V;const u=1,c=2,a={owned:null,cleanups:null,context:null,owner:null},f={};var d=null;let h,p=null,g=null,v=null,y=null,m=0;function b(e,t){const n=g,r=d,o=0===e.length,s=void 0===t?r:t,l=o?a:{owned:null,cleanups:null,context:s?s.context:null,owner:s},i=o?e:()=>e((()=>L((()=>R(l)))));d=l,g=null;try{return B(i,!0)}finally{g=n,d=r}}function w(e,t){const n={value:e,observers:null,observerSlots:null,comparator:(t=t?Object.assign({},l,t):l).equals||void 0};return[P.bind(n),e=>("function"==typeof e&&(e=e(n.value)),_(n,e))]}function x(e,t,n){I(M(e,t,!0,u))}function A(e,t,n){I(M(e,t,!1,u))}function S(e,t,n){i=D;const r=M(e,t,!1,u);n&&n.render||(r.user=!0),y?y.push(r):I(r)}function E(e,t,n){n=n?Object.assign({},l,n):l;const r=M(e,t,!0,0);return r.observers=null,r.observerSlots=null,r.comparator=n.equals||void 0,I(r),P.bind(r)}function k(e,t,r){let o,s,l;2===arguments.length&&"object"==typeof t||1===arguments.length?(o=!0,s=e,l=t||{}):(o=e,s=t,l=r||{});let i=null,u=f,c=null,a=!1,d="initialValue"in l,p="function"==typeof o&&E(o);const v=new Set,[y,m]=(l.storage||w)(l.initialValue),[b,A]=w(void 0),[S,k]=w(void 0,{equals:!1}),[T,$]=w(d?"ready":"unresolved");if(n.context){let e;c=`${n.context.id}${n.context.count++}`,"initial"===l.ssrLoadFrom?u=l.initialValue:n.load&&(e=n.load(c))&&(u=e)}function j(e,t,n,r){return i===e&&(i=null,void 0!==r&&(d=!0),e!==u&&t!==u||!l.onHydrated||queueMicrotask((()=>l.onHydrated(r,{value:t}))),u=f,function(e,t){B((()=>{void 0===t&&m((()=>e)),$(void 0!==t?"errored":d?"ready":"unresolved"),A(t);for(const e of v.keys())e.decrement();v.clear()}),!1)}(t,n)),t}function N(){const e=h,t=y(),n=b();if(void 0!==n&&!i)throw n;return g&&!g.user&&e&&x((()=>{S(),i&&(e.resolved||v.has(e)||(e.increment(),v.add(e)))})),t}function O(e=!0){if(!1!==e&&a)return;a=!1;const t=p?p():o;if(null==t||!1===t)return void j(i,L(y));const n=u!==f?u:L((()=>s(t,{value:y(),refetching:e})));return(r=n)&&"object"==typeof r&&"then"in r?(i=n,"value"in n?("success"===n.status?j(i,n.value,void 0,t):j(i,void 0,F(n.value),t),n):(a=!0,queueMicrotask((()=>a=!1)),B((()=>{$(d?"refreshing":"pending"),k()}),!1),n.then((e=>j(n,e,void 0,t)),(e=>j(n,void 0,F(e),t))))):(j(i,n,void 0,t),n);var r}return Object.defineProperties(N,{state:{get:()=>T()},error:{get:()=>b()},loading:{get(){const e=T();return"pending"===e||"refreshing"===e}},latest:{get(){if(!d)return N();const e=b();if(e&&!i)throw e;return y()}}}),p?x((()=>O(!1))):O(!1),[N,{refetch:O,mutate:m}]}function T(e){return B(e,!1)}function L(e){if(null===g)return e();const t=g;g=null;try{return e()}finally{g=t}}function $(e,t,n){const r=Array.isArray(e);let o,s=n&&n.defer;return n=>{let l;if(r){l=Array(e.length);for(let t=0;t<e.length;t++)l[t]=e[t]()}else l=e();if(s)return s=!1,n;const i=L((()=>t(l,o,n)));return o=l,i}}function j(e){S((()=>L(e)))}function N(e){return null===d||(null===d.cleanups?d.cleanups=[e]:d.cleanups.push(e)),e}function O(){return g}function C(e){const t=E(e),n=E((()=>G(t())));return n.toArray=()=>{const e=n();return Array.isArray(e)?e:null!=e?[e]:[]},n}function P(){if(this.sources&&this.state)if(this.state===u)I(this);else{const e=v;v=null,B((()=>U(this)),!1),v=e}if(g){const e=this.observers?this.observers.length:0;g.sources?(g.sources.push(this),g.sourceSlots.push(e)):(g.sources=[this],g.sourceSlots=[e]),this.observers?(this.observers.push(g),this.observerSlots.push(g.sources.length-1)):(this.observers=[g],this.observerSlots=[g.sources.length-1])}return this.value}function _(e,t,n){let r=e.value;return e.comparator&&e.comparator(r,t)||(e.value=t,e.observers&&e.observers.length&&B((()=>{for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t],r=p&&p.running;r&&p.disposed.has(n),(r?n.tState:n.state)||(n.pure?v.push(n):y.push(n),n.observers&&H(n)),r||(n.state=u)}if(v.length>1e6)throw v=[],new Error}),!1)),t}function I(e){if(!e.fn)return;R(e);const t=m;!function(e,t,n){let r;const o=d,s=g;g=d=e;try{r=e.fn(t)}catch(l){return e.pure&&(e.state=u,e.owned&&e.owned.forEach(R),e.owned=null),e.updatedAt=n+1,X(l)}finally{g=s,d=o}(!e.updatedAt||e.updatedAt<=n)&&(null!=e.updatedAt&&"observers"in e?_(e,r):e.value=r,e.updatedAt=n)}(e,e.value,t)}function M(e,t,n,r=u,o){const s={fn:e,state:r,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:d,context:d?d.context:null,pure:n};return null===d||d!==a&&(d.owned?d.owned.push(s):d.owned=[s]),s}function q(e){if(0===e.state)return;if(e.state===c)return U(e);if(e.suspense&&L(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<m);)e.state&&t.push(e);for(let n=t.length-1;n>=0;n--)if((e=t[n]).state===u)I(e);else if(e.state===c){const n=v;v=null,B((()=>U(e,t[0])),!1),v=n}}function B(e,t){if(v)return e();let n=!1;t||(v=[]),y?n=!0:y=[],m++;try{const t=e();return function(e){if(v&&(V(v),v=null),e)return;const t=y;y=null,t.length&&B((()=>i(t)),!1)}(n),t}catch(r){n||(y=null),v=null,X(r)}}function V(e){for(let t=0;t<e.length;t++)q(e[t])}function D(e){let t,o=0;for(t=0;t<e.length;t++){const n=e[t];n.user?e[o++]=n:q(n)}if(n.context){if(n.count)return n.effects||(n.effects=[]),void n.effects.push(...e.slice(0,o));n.effects&&(e=[...n.effects,...e],o+=n.effects.length,delete n.effects),r()}for(t=0;t<o;t++)q(e[t])}function U(e,t){e.state=0;for(let n=0;n<e.sources.length;n+=1){const r=e.sources[n];if(r.sources){const e=r.state;e===u?r!==t&&(!r.updatedAt||r.updatedAt<m)&&q(r):e===c&&U(r,t)}}}function H(e){for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t];n.state||(n.state=c,n.pure?v.push(n):y.push(n),n.observers&&H(n))}}function R(e){let t;if(e.sources)for(;e.sources.length;){const t=e.sources.pop(),n=e.sourceSlots.pop(),r=t.observers;if(r&&r.length){const e=r.pop(),o=t.observerSlots.pop();n<r.length&&(e.sourceSlots[o]=n,r[n]=e,t.observerSlots[n]=o)}}if(e.owned){for(t=e.owned.length-1;t>=0;t--)R(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0}function F(e){return e instanceof Error?e:new Error("string"==typeof e?e:"Unknown error",{cause:e})}function X(e,t=d){throw F(e)}function G(e){if("function"==typeof e&&!e.length)return G(e());if(Array.isArray(e)){const t=[];for(let n=0;n<e.length;n++){const r=G(e[n]);Array.isArray(r)?t.push.apply(t,r):t.push(r)}return t}return e}function z(e,t){return function(t){let n;return A((()=>n=L((()=>(d.context={...d.context,[e]:t.value},C((()=>t.children)))))),void 0),n}}const K=Symbol("fallback");function W(e){for(let t=0;t<e.length;t++)e[t]()}function Y(e,t){return L((()=>e(t||{})))}function J(){return!0}const Q={get:(e,t,n)=>t===o?n:e.get(t),has:(e,t)=>t===o||e.has(t),set:J,deleteProperty:J,getOwnPropertyDescriptor:(e,t)=>({configurable:!0,enumerable:!0,get:()=>e.get(t),set:J,deleteProperty:J}),ownKeys:e=>e.keys()};function Z(e){return(e="function"==typeof e?e():e)?e:{}}function ee(){for(let e=0,t=this.length;e<t;++e){const t=this[e]();if(void 0!==t)return t}}function te(...e){let t=!1;for(let i=0;i<e.length;i++){const n=e[i];t=t||!!n&&o in n,e[i]="function"==typeof n?(t=!0,E(n)):n}if(t)return new Proxy({get(t){for(let n=e.length-1;n>=0;n--){const r=Z(e[n])[t];if(void 0!==r)return r}},has(t){for(let n=e.length-1;n>=0;n--)if(t in Z(e[n]))return!0;return!1},keys(){const t=[];for(let n=0;n<e.length;n++)t.push(...Object.keys(Z(e[n])));return[...new Set(t)]}},Q);const n={},r=Object.create(null);for(let o=e.length-1;o>=0;o--){const t=e[o];if(!t)continue;const s=Object.getOwnPropertyNames(t);for(let e=s.length-1;e>=0;e--){const o=s[e];if("__proto__"===o||"constructor"===o)continue;const l=Object.getOwnPropertyDescriptor(t,o);if(r[o]){const e=n[o];e&&(l.get?e.push(l.get.bind(t)):void 0!==l.value&&e.push((()=>l.value)))}else r[o]=l.get?{enumerable:!0,configurable:!0,get:ee.bind(n[o]=[l.get.bind(t)])}:void 0!==l.value?l:void 0}}const s={},l=Object.keys(r);for(let o=l.length-1;o>=0;o--){const e=l[o],t=r[e];t&&t.get?Object.defineProperty(s,e,t):s[e]=t?t.value:void 0}return s}function ne(e){let t,o;const s=s=>{const l=n.context;if(l){const[s,i]=w();n.count||(n.count=0),n.count++,(o||(o=e())).then((e=>{r(l),n.count--,i((()=>e.default)),r()})),t=s}else if(!t){const[n]=k((()=>(o||(o=e())).then((e=>e.default))));t=n}let i;return E((()=>(i=t())&&L((()=>{if(!l)return i(s);const e=n.context;r(l);const t=i(s);return r(e),t}))))};return s.preload=()=>o||((o=e()).then((e=>t=()=>e.default)),o),s}const re=e=>`Stale read from <${e}>.`;function oe(e){const t="fallback"in e&&{fallback:()=>e.fallback};return E(function(e,t,n={}){let r=[],o=[],l=[],i=0,u=t.length>1?[]:null;return N((()=>W(l))),()=>{let c,a,f=e()||[];return f[s],L((()=>{let e,t,s,h,p,g,v,y,m,w=f.length;if(0===w)0!==i&&(W(l),l=[],r=[],o=[],i=0,u&&(u=[])),n.fallback&&(r=[K],o[0]=b((e=>(l[0]=e,n.fallback()))),i=1);else if(0===i){for(o=new Array(w),a=0;a<w;a++)r[a]=f[a],o[a]=b(d);i=w}else{for(s=new Array(w),h=new Array(w),u&&(p=new Array(w)),g=0,v=Math.min(i,w);g<v&&r[g]===f[g];g++);for(v=i-1,y=w-1;v>=g&&y>=g&&r[v]===f[y];v--,y--)s[y]=o[v],h[y]=l[v],u&&(p[y]=u[v]);for(e=new Map,t=new Array(y+1),a=y;a>=g;a--)m=f[a],c=e.get(m),t[a]=void 0===c?-1:c,e.set(m,a);for(c=g;c<=v;c++)m=r[c],a=e.get(m),void 0!==a&&-1!==a?(s[a]=o[c],h[a]=l[c],u&&(p[a]=u[c]),a=t[a],e.set(m,a)):l[c]();for(a=g;a<w;a++)a in s?(o[a]=s[a],l[a]=h[a],u&&(u[a]=p[a],u[a](a))):o[a]=b(d);o=o.slice(0,i=w),r=f.slice(0)}return o}));function d(e){if(l[a]=e,u){const[e,n]=w(a);return u[a]=n,t(f[a],e)}return t(f[a])}}}((()=>e.each),e.children,t||void 0))}function se(e){const t=e.keyed,n=E((()=>e.when),void 0,{equals:(e,n)=>t?e===n:!e==!n});return E((()=>{const r=n();if(r){const o=e.children;return"function"==typeof o&&o.length>0?L((()=>o(t?r:()=>{if(!L(n))throw re("Show");return e.when}))):o}return e.fallback}),void 0,void 0)}function le(e){let t=!1;const n=C((()=>e.children)),r=E((()=>{let e=n();Array.isArray(e)||(e=[e]);for(let n=0;n<e.length;n++){const r=e[n].when;if(r)return t=!!e[n].keyed,[n,r,e[n]]}return[-1]}),void 0,{equals:(e,n)=>(t?e[1]===n[1]:!e[1]==!n[1])&&e[2]===n[2]});return E((()=>{const[n,o,s]=r();if(n<0)return e.fallback;const l=s.children;return"function"==typeof l&&l.length>0?L((()=>l(t?o:()=>{if(L(r)[0]!==n)throw re("Match");return s.when}))):l}),void 0,void 0)}function ie(e){return e}const ue=new Set(["className","value","readOnly","formNoValidate","isMap","noModule","playsInline","allowfullscreen","async","autofocus","autoplay","checked","controls","default","disabled","formnovalidate","hidden","indeterminate","inert","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","seamless","selected"]),ce=new Set(["innerHTML","textContent","innerText","children"]),ae=Object.assign(Object.create(null),{className:"class",htmlFor:"for"}),fe=Object.assign(Object.create(null),{class:"className",formnovalidate:{$:"formNoValidate",BUTTON:1,INPUT:1},ismap:{$:"isMap",IMG:1},nomodule:{$:"noModule",SCRIPT:1},playsinline:{$:"playsInline",VIDEO:1},readonly:{$:"readOnly",INPUT:1,TEXTAREA:1}}),de=new Set(["beforeinput","click","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"]),he={xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},pe="_$DX_DELEGATE";function ge(e,t,n){let r;const o=()=>{const t=document.createElement("template");return t.innerHTML=e,n?t.content.firstChild.firstChild:t.content.firstChild},s=t?()=>L((()=>document.importNode(r||(r=o()),!0))):()=>(r||(r=o())).cloneNode(!0);return s.cloneNode=s,s}function ve(e,t=window.document){const n=t[pe]||(t[pe]=new Set);for(let r=0,o=e.length;r<o;r++){const o=e[r];n.has(o)||(n.add(o),t.addEventListener(o,Se))}}function ye(e,t,r){n.context&&e.isConnected||(null==r?e.removeAttribute(t):e.setAttribute(t,r))}function me(e,t={},n,r){const o={};return r||A((()=>o.children=Ee(e,t.children,o.children))),A((()=>"function"==typeof t.ref?be(t.ref,e):t.ref=e)),A((()=>function(e,t,n,r,o={},s=!1){t||(t={});for(const l in o)if(!(l in t)){if("children"===l)continue;o[l]=Ae(e,l,null,o[l],n,s)}for(const l in t){if("children"===l){r||Ee(e,t.children);continue}const i=t[l];o[l]=Ae(e,l,i,o[l],n,s)}}(e,t,n,!0,o,!0))),o}function be(e,t,n){return L((()=>e(t,n)))}function we(e,t,n,r){if(void 0===n||r||(r=[]),"function"!=typeof t)return Ee(e,t,r,n);A((r=>Ee(e,t(),r,n)),r)}function xe(e,t,n){const r=t.trim().split(/\s+/);for(let o=0,s=r.length;o<s;o++)e.classList.toggle(r[o],n)}function Ae(e,t,r,o,s,l){let i,u,c,a,f;if("style"===t)return function(e,t,n){if(!t)return n?ye(e,"style"):t;const r=e.style;if("string"==typeof t)return r.cssText=t;let o,s;for(s in"string"==typeof n&&(r.cssText=n=void 0),n||(n={}),t||(t={}),n)null==t[s]&&r.removeProperty(s),delete n[s];for(s in t)o=t[s],o!==n[s]&&(r.setProperty(s,o),n[s]=o);return n}(e,r,o);if("classList"===t)return function(e,t,n={}){const r=Object.keys(t||{}),o=Object.keys(n);let s,l;for(s=0,l=o.length;s<l;s++){const r=o[s];r&&"undefined"!==r&&!t[r]&&(xe(e,r,!1),delete n[r])}for(s=0,l=r.length;s<l;s++){const o=r[s],l=!!t[o];o&&"undefined"!==o&&n[o]!==l&&l&&(xe(e,o,!0),n[o]=l)}return n}(e,r,o);if(r===o)return o;if("ref"===t)l||r(e);else if("on:"===t.slice(0,3)){const n=t.slice(3);o&&e.removeEventListener(n,o),r&&e.addEventListener(n,r)}else if("oncapture:"===t.slice(0,10)){const n=t.slice(10);o&&e.removeEventListener(n,o,!0),r&&e.addEventListener(n,r,!0)}else if("on"===t.slice(0,2)){const n=t.slice(2).toLowerCase(),s=de.has(n);if(!s&&o){const t=Array.isArray(o)?o[0]:o;e.removeEventListener(n,t)}(s||r)&&(function(e,t,n,r){if(r)Array.isArray(n)?(e[`$$${t}`]=n[0],e[`$$${t}Data`]=n[1]):e[`$$${t}`]=n;else if(Array.isArray(n)){const r=n[0];e.addEventListener(t,n[0]=t=>r.call(e,n[1],t))}else e.addEventListener(t,n)}(e,n,r,s),s&&ve([n]))}else if("attr:"===t.slice(0,5))ye(e,t.slice(5),r);else if((f="prop:"===t.slice(0,5))||(c=ce.has(t))||!s&&((a=function(e,t){const n=fe[e];return"object"==typeof n?n[t]?n.$:void 0:n}(t,e.tagName))||(u=ue.has(t)))||(i=e.nodeName.includes("-"))){if(f)t=t.slice(5),u=!0;else if(n.context&&e.isConnected)return r;"class"===t||"className"===t?function(e,t){n.context&&e.isConnected||(null==t?e.removeAttribute("class"):e.className=t)}(e,r):!i||u||c?e[a||t]=r:e[(d=t,d.toLowerCase().replace(/-([a-z])/g,((e,t)=>t.toUpperCase())))]=r}else{const o=s&&t.indexOf(":")>-1&&he[t.split(":")[0]];o?function(e,t,r,o){n.context&&e.isConnected||(null==o?e.removeAttributeNS(t,r):e.setAttributeNS(t,r,o))}(e,o,t,r):ye(e,ae[t]||t,r)}var d;return r}function Se(e){const t=`$$${e.type}`;let r=e.composedPath&&e.composedPath()[0]||e.target;for(e.target!==r&&Object.defineProperty(e,"target",{configurable:!0,value:r}),Object.defineProperty(e,"currentTarget",{configurable:!0,get:()=>r||document}),n.registry&&!n.done&&(n.done=_$HY.done=!0);r;){const n=r[t];if(n&&!r.disabled){const o=r[`${t}Data`];if(void 0!==o?n.call(r,o,e):n.call(r,e),e.cancelBubble)return}r=r._$host||r.parentNode||r.host}}function Ee(e,t,r,o,s){const l=!!n.context&&e.isConnected;if(l){!r&&(r=[...e.childNodes]);let t=[];for(let e=0;e<r.length;e++){const n=r[e];8===n.nodeType&&"!$"===n.data.slice(0,2)?n.remove():t.push(n)}r=t}for(;"function"==typeof r;)r=r();if(t===r)return r;const i=typeof t,u=void 0!==o;if(e=u&&r[0]&&r[0].parentNode||e,"string"===i||"number"===i){if(l)return r;if("number"===i&&(t=t.toString())===r)return r;if(u){let n=r[0];n&&3===n.nodeType?n.data!==t&&(n.data=t):n=document.createTextNode(t),r=Le(e,r,o,n)}else r=""!==r&&"string"==typeof r?e.firstChild.data=t:e.textContent=t}else if(null==t||"boolean"===i){if(l)return r;r=Le(e,r,o)}else{if("function"===i)return A((()=>{let n=t();for(;"function"==typeof n;)n=n();r=Ee(e,n,r,o)})),()=>r;if(Array.isArray(t)){const n=[],i=r&&Array.isArray(r);if(ke(n,t,r,s))return A((()=>r=Ee(e,n,r,o,!0))),()=>r;if(l){if(!n.length)return r;if(void 0===o)return[...e.childNodes];let t=n[0],s=[t];for(;(t=t.nextSibling)!==o;)s.push(t);return r=s}if(0===n.length){if(r=Le(e,r,o),u)return r}else i?0===r.length?Te(e,n,o):function(e,t,n){let r=n.length,o=t.length,s=r,l=0,i=0,u=t[o-1].nextSibling,c=null;for(;l<o||i<s;)if(t[l]!==n[i]){for(;t[o-1]===n[s-1];)o--,s--;if(o===l){const t=s<r?i?n[i-1].nextSibling:n[s-i]:u;for(;i<s;)e.insertBefore(n[i++],t)}else if(s===i)for(;l<o;)c&&c.has(t[l])||t[l].remove(),l++;else if(t[l]===n[s-1]&&n[i]===t[o-1]){const r=t[--o].nextSibling;e.insertBefore(n[i++],t[l++].nextSibling),e.insertBefore(n[--s],r),t[o]=n[s]}else{if(!c){c=new Map;let e=i;for(;e<s;)c.set(n[e],e++)}const r=c.get(t[l]);if(null!=r)if(i<r&&r<s){let u,a=l,f=1;for(;++a<o&&a<s&&null!=(u=c.get(t[a]))&&u===r+f;)f++;if(f>r-i){const o=t[l];for(;i<r;)e.insertBefore(n[i++],o)}else e.replaceChild(n[i++],t[l++])}else l++;else t[l++].remove()}}else l++,i++}(e,r,n):(r&&Le(e),Te(e,n));r=n}else if(t.nodeType){if(l&&t.parentNode)return r=u?[t]:t;if(Array.isArray(r)){if(u)return r=Le(e,r,o,t);Le(e,r,null,t)}else null!=r&&""!==r&&e.firstChild?e.replaceChild(t,e.firstChild):e.appendChild(t);r=t}}return r}function ke(e,t,n,r){let o=!1;for(let s=0,l=t.length;s<l;s++){let l,i=t[s],u=n&&n[e.length];if(null==i||!0===i||!1===i);else if("object"==(l=typeof i)&&i.nodeType)e.push(i);else if(Array.isArray(i))o=ke(e,i,u)||o;else if("function"===l)if(r){for(;"function"==typeof i;)i=i();o=ke(e,Array.isArray(i)?i:[i],Array.isArray(u)?u:[u])||o}else e.push(i),o=!0;else{const t=String(i);u&&3===u.nodeType&&u.data===t?e.push(u):e.push(document.createTextNode(t))}}return o}function Te(e,t,n=null){for(let r=0,o=t.length;r<o;r++)e.insertBefore(t[r],n)}function Le(e,t,n,r){if(void 0===n)return e.textContent="";const o=r||document.createTextNode("");if(t.length){let r=!1;for(let s=t.length-1;s>=0;s--){const l=t[s];if(o!==l){const t=l.parentNode===e;r||s?t&&l.remove():t?e.replaceChild(o,l):e.insertBefore(o,n)}else r=!0}}else e.insertBefore(o,n);return[o]}async function $e(){if("404"===document.title.split(" | ")[0])return[];try{const e=await fetch(`${window.location.href}index.json`,{headers:{Accept:"application/json"}});return(await e.json()).sort(((e,t)=>e.index<t.index?-1:1))}catch(e){return[]}}var je="Invariant failed";function Ne(e,t){if(!e)throw new Error(je)}function Oe(e,t){return(e+1)%t}function Ce(e,t){return(e+t-1)%t}function Pe(e){return("0000"+e.toString()).slice(-4)}async function _e(){return(await t((()=>import("./DrbWKT.js")),[])).gsap}function Ie(){const e=sessionStorage.getItem("thresholdsIndex");return null===e?2:parseInt(e)}const Me=[{threshold:20,trailLength:20},{threshold:40,trailLength:10},{threshold:80,trailLength:5},{threshold:140,trailLength:5},{threshold:200,trailLength:5}],qe=(e,t)=>[e,{setIndex:e=>{t((t=>({...t,index:e})))},incIndex:()=>{t((e=>({...e,index:Oe(e.index,e.length)})))},decIndex:()=>{t((e=>({...e,index:Ce(e.index,e.length)})))},incThreshold:()=>{t((e=>({...e,...Ve(e.threshold,Me,1)})))},decThreshold:()=>{t((e=>({...e,...Ve(e.threshold,Me,-1)})))}}],Be=function(e,t){const n=Symbol("context");return{id:n,Provider:z(n),defaultValue:void 0}}();function Ve(e,t,n){const r=t.findIndex((t=>t.threshold===e))+n;return r<0||r>=t.length?t[r-n]:(sessionStorage.setItem("thresholdsIndex",r.toString()),t[r])}function De(e){const t={index:-1,length:e.length,threshold:Me[Ie()].threshold,trailLength:Me[Ie()].trailLength},[n,r]=w(t),o=qe(n,r);return Y(Be.Provider,{value:o,get children(){return e.children}})}function Ue(){const e=(t=Be,d&&d.context&&void 0!==d.context[t.id]?d.context[t.id]:t.defaultValue);var t;return Ne(e),e}var He=ge("<div>Error");const Re=document.getElementsByClassName("container")[0],Fe=ne((async()=>await t((()=>import("./CmEyuP.js")),[]))),Xe=ne((async()=>await t((()=>import("./Dvxwov.js")),[])));function Ge(){const[e]=k($e),t=window.matchMedia("(hover: none)").matches,[n,r]=w(!0);return S((()=>{n()?Re.classList.remove("disableScroll"):Re.classList.add("disableScroll")})),Y(se,{get when(){return"ready"===e.state},get children(){return Y(De,{get length(){var t;return(null==(t=e())?void 0:t.length)??0},get children(){return Y(le,{get fallback(){return He()},get children(){return[Y(ie,{when:t,get children(){return Y(Xe,{get ijs(){return e()??[]},get closeText(){return Re.dataset.close},get loadingText(){return Re.dataset.loading},setScrollable:r})}}),Y(ie,{when:!t,get children(){return Y(Fe,{get ijs(){return e()??[]},get prevText(){return Re.dataset.prev},get closeText(){return Re.dataset.close},get nextText(){return Re.dataset.next},get loadingText(){return Re.dataset.loading}})}})]}})}})}})}!function(e,t,n,r={}){let o;b((r=>{o=r,t===document?e():we(t,e(),t.firstChild?null:void 0,n)}),r.owner)}((()=>Y(Ge,{})),Re);export{o as $,oe as F,se as S,t as _,N as a,A as b,w as c,S as d,Pe as e,$ as f,Y as g,be as h,we as i,ve as j,Ce as k,_e as l,Oe as m,E as n,j as o,s as p,O as q,T as r,ye as s,ge as t,Ue as u,me as v,te as w,Ne as x};