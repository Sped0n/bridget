function t(t,e){return(t+1)%e}function e(t,e){return(t+e-1)%e}function n(t){return("0000"+t.toString()).slice(-4)}function s(t,e){return Math.floor(Math.random()*(e-t+1))+t}function o(t,e){new IntersectionObserver(((n,s)=>{n.forEach((n=>{n.intersectionRatio>0&&(e(t),s.disconnect())}))})).observe(t)}function r(t){return t.charAt(0).toUpperCase()+t.slice(1)}async function i(){const t=await import("./-BhIIs.js");return[t.gsap,t.Power3]}async function a(){return(await import("./f6JTi3.js")).Swiper}class c{constructor(t){this.obj=t,this.watchers=[]}get(){return this.obj}set(t){this.obj=t,this.watchers.forEach((t=>{t(this.obj)}))}addWatcher(t){this.watchers.push(t)}}const l=new c(!0);let h;const d=[{threshold:20,trailLength:20},{threshold:40,trailLength:10},{threshold:80,trailLength:5},{threshold:140,trailLength:5},{threshold:200,trailLength:5}],m=new c({index:-1,length:0,threshold:d[p()].threshold,trailLength:d[p()].trailLength});function u(t){const e=m.get();e.index=t,m.set(e)}function g(){const e=m.get();e.index=t(e.index,e.length),m.set(e)}function f(){const t=m.get();t.index=e(t.index,t.length),m.set(t)}function x(t,e){const n=d.findIndex((e=>t.threshold===e.threshold))+e;if(n<0||n>=d.length)return t;sessionStorage.setItem("thresholdsIndex",n.toString());const s=d[n];return{...t,...s}}function p(){const t=sessionStorage.getItem("thresholdsIndex");return null===t?2:parseInt(t)}const w=document.getElementsByClassName("threshold").item(0),y=Array.from(w.getElementsByClassName("num")),E=w.getElementsByClassName("dec").item(0),j=w.getElementsByClassName("inc").item(0),L=document.getElementsByClassName("index").item(0),b=Array.from(L.getElementsByClassName("num")),I=document.getElementsByClassName("links").item(0),B=Array.from(I.getElementsByClassName("link")),C=document.getElementById("main")?.getAttribute("currentMenuItemIndex");for(const[t,e]of B.entries())t===parseInt(C)&&(e.classList.add("current"),0!==t&&(document.title=e.innerText+" | "+document.title));function N(t){y.forEach(((e,n)=>{e.innerText=t[n]}))}function v(t,e){b.forEach(((n,s)=>{n.innerText=s<4?t[s]:e[s-4]}))}h=document.getElementsByClassName("container").item(0),l.addWatcher((t=>{t?h.classList.remove("disableScroll"):h.classList.add("disableScroll")}));const S=await async function(){try{const t=await fetch(`${window.location.href}index.json`,{headers:{Accept:"application/json"}});return(await t.json()).sort(((t,e)=>t.index<e.index?-1:1))}catch(t){return[]}}();!function(t){const e=m.get();e.length=t,x(e,0),m.set(e)}(S.length),function(){const t=m.get();N(n(t.threshold)),v(n(t.index+1),n(t.length)),m.addWatcher((t=>{v(n(t.index+1),n(t.length)),N(n(t.threshold))})),E.addEventListener("click",(()=>{!function(){let t=m.get();t=x(t,-1),m.set(t)}()}),{passive:!0}),j.addEventListener("click",(()=>{!function(){let t=m.get();t=x(t,1),m.set(t)}()}),{passive:!0})}(),S.length>0&&(window.matchMedia("(hover: none)").matches?import("./fRwBqI.js").then((t=>{t.initMobile(S)})).catch((t=>{console.log(t)})):import("./PR3rto.js").then((t=>{t.initDesktop(S)})).catch((t=>{console.log(t)})));export{c as W,g as a,f as b,h as c,e as d,l as e,a as f,u as g,n as h,t as i,r as j,s as k,i as l,o,m as s};