import{l as e,c as t,W as n,s,i as a,a as i,d as o,b as c}from"./main.js";let r=[],d={x:0,y:0};const g=new n([]),l=new n(!1),u=new n(!1),m=new n(!1),h=new n(!1);let v,p,f=!1;function y(){return g.get().map((e=>r[e.i]))}function w(){const e=y().slice(-s.get().trailLength);return e.slice(0,e.length-1)}function E(){const e=y();return e[e.length-1]}function I(){const e=g.get(),t=s.get(),n=e.length>0?e[e.length-1].i:t.index,i=[];for(let e=0;e<7;e++)i.push(r[a(n+e,t.length)]);return i}function L(){const e=g.get(),t=s.get();return r[o(e[e.length-1].i,t.length)]}function x(){const e=g.get(),t=s.get();return r[a(e[e.length-1].i,t.length)]}function W(e){if(l.get()||u.get()||!f)return;const t={x:e.clientX,y:e.clientY};if(Math.hypot(t.x-d.x,t.y-d.y)>s.get().threshold){d=t,i();const e={i:s.get().index,...t};g.set([...g.get(),e].slice(-s.get().length))}}function k(){if(u.get()||!f)return;l.set(!0),u.set(!0);const e=E();b([e,L(),x()]),N(e);const t=v.timeline();t.to(w(),{y:"+=20",ease:p.easeIn,stagger:.075,duration:.3,delay:.1,opacity:0}),t.to(E(),{x:0,y:0,ease:p.easeInOut,duration:.7,delay:.3}),t.to(E(),{delay:.1,scale:1,ease:p.easeInOut}),t.then((()=>{u.set(!1)})).catch((e=>{console.log(e)}))}function H(){if(u.get()||!f)return;l.set(!1),u.set(!0),A([E()]),A(w());const e=v.timeline();e.to(E(),{scale:.6,duration:.6,ease:p.easeInOut}),e.to(E(),{delay:.3,duration:.7,ease:p.easeInOut,x:g.get()[g.get().length-1].x-window.innerWidth/2,y:g.get()[g.get().length-1].y-window.innerHeight/2}),e.to(w(),{y:"-=20",ease:p.easeOut,stagger:-.1,duration:.3,opacity:1}),e.then((()=>{u.set(!1)})).catch((e=>{console.log(e)}))}function b(e){e.forEach((e=>{e.src=e.dataset.hiUrl,e.height=parseInt(e.dataset.hiImgH),e.width=parseInt(e.dataset.hiImgW)}))}function A(e){e.forEach((e=>{e.src=e.dataset.loUrl,e.height=parseInt(e.dataset.loImgH),e.width=parseInt(e.dataset.loImgW)}))}function N(e){e.complete?(e.classList.remove("hide"),h.set(!1)):(h.set(!0),e.addEventListener("load",(()=>{h.set(!1),e.classList.remove("hide")}),{once:!0,passive:!0}),e.addEventListener("error",(()=>{h.set(!1)}),{once:!0,passive:!0}))}const O=document.createElement("div"),T=document.createElement("div");function U(e){const t=e.clientX,n=e.clientY;O.style.transform=`translate3d(${t}px, ${n}px, 0)`}function S(e){T.innerText=e}const B=document.getElementById("main"),X=[B.getAttribute("prevText"),B.getAttribute("closeText"),B.getAttribute("nextText")],Y=B.getAttribute("loadingText")+"...";let $="";function j(e){e===X[0]?M():e===X[1]?H():C()}function z(e){if(!l.get()&&!u.get())switch(e.key){case"ArrowLeft":M();break;case"Escape":H();break;case"ArrowRight":C()}}function C(){u.get()||(g.set(g.get().map((e=>({...e,i:a(e.i,s.get().length)})))),i())}function M(){u.get()||(g.set(g.get().map((e=>({...e,i:o(e.i,s.get().length)})))),c())}function R(e){j(e),h.set(!1)}function q(e){$=e,S(e)}function D(e){h.get()||j(e)}function F(e){$=e,h.get()?S(Y):S(e)}function G(n){O.className="cursor",T.className="cursorInner",O.append(T),t.append(O),window.addEventListener("mousemove",U,{passive:!0}),m.addWatcher((e=>{e?O.classList.add("active"):O.classList.remove("active")})),function(n){!function(e){const n=document.createElement("div");n.className="stage";for(const t of e){const e=document.createElement("img");e.height=t.loImgH,e.width=t.loImgW,e.dataset.hiUrl=t.hiUrl,e.dataset.hiImgH=t.hiImgH.toString(),e.dataset.hiImgW=t.hiImgW.toString(),e.dataset.loUrl=t.loUrl,e.dataset.loImgH=t.loImgH.toString(),e.dataset.loImgW=t.loImgW.toString(),e.alt=t.alt,n.append(e)}t.append(n)}(n);const a=document.getElementsByClassName("stage").item(0);r=Array.from(a.getElementsByTagName("img")),a.addEventListener("click",(()=>{k()})),a.addEventListener("keydown",(()=>{k()})),window.addEventListener("mousemove",W,{passive:!0}),l.addWatcher((e=>{m.set(e&&!u.get())})),u.addWatcher((e=>{m.set(l.get()&&!e)})),g.addWatcher((e=>{!function(){const e=y();if(0!==e.length&&f&&(A(I()),v.set(e,{x:e=>g.get()[e].x-window.innerWidth/2,y:e=>g.get()[e].y-window.innerHeight/2,opacity:e=>e+1+s.get().trailLength<=g.get().length?0:1,zIndex:e=>e,scale:.6}),l.get())){A(y());const e=E();e.src="",e.classList.add("hide"),b([e,L(),x()]),v.set(r,{opacity:0}),v.set(e,{opacity:1,x:0,y:0,scale:1}),N(e)}}()})),A(I()),window.addEventListener("mousemove",(()=>{e().then((e=>{v=e[0],p=e[1],f=!0})).catch((e=>{console.log(e)}))}),{once:!0,passive:!0})}(n),function(){h.addWatcher((e=>{S(e?Y:$)}));const e=document.createElement("div");e.className="navOverlay";for(const[t,n]of X.entries()){const s=document.createElement("div");s.className="overlay",1===t?(s.addEventListener("click",(()=>{R(n)}),{passive:!0}),s.addEventListener("keydown",(()=>{R(n)}),{passive:!0}),s.addEventListener("mouseover",(()=>{q(n)}),{passive:!0}),s.addEventListener("focus",(()=>{q(n)}),{passive:!0})):(s.addEventListener("click",(()=>{D(n)}),{passive:!0}),s.addEventListener("keydown",(()=>{D(n)}),{passive:!0}),s.addEventListener("mouseover",(()=>{F(n)}),{passive:!0}),s.addEventListener("focus",(()=>{F(n)}),{passive:!0})),e.append(s)}m.addWatcher((()=>{m.get()?e.classList.add("active"):e.classList.remove("active")})),t.append(e),window.addEventListener("keydown",z,{passive:!0})}()}export{G as initDesktop};