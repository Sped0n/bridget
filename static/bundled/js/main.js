function t(t,e){return(t+1)%e}function e(t,e){return(t+e-1)%e}function n(t){return("0000"+t.toString()).slice(-4)}function s(t,e){return Math.floor(Math.random()*(e-t+1))+t}function o(t,e){new IntersectionObserver(((n,s)=>{n.forEach((n=>{n.intersectionRatio>0&&(e(t),s.disconnect())}))})).observe(t)}function r(t){return t.charAt(0).toUpperCase()+t.slice(1)}async function a(){const t=await import("./8mM4Ei.js");return[t.gsap,t.Power3]}async function i(){return(await import("./f6JTi3.js")).Swiper}class c{constructor(t){this.obj=t,this.watchers=[]}get(){return this.obj}set(t){this.obj=t,this.watchers.forEach((t=>{t(this.obj)}))}addWatcher(t){this.watchers.push(t)}}const h=new c(!0);let l;const d=[{threshold:20,trailLength:20},{threshold:40,trailLength:10},{threshold:80,trailLength:5},{threshold:140,trailLength:5},{threshold:200,trailLength:5}],g=new c({index:-1,length:0,threshold:d[w()].threshold,trailLength:d[w()].trailLength});function u(t){const e=g.get();e.index=t,g.set(e)}function m(){const e=g.get();e.index=t(e.index,e.length),g.set(e)}function f(){const t=g.get();t.index=e(t.index,t.length),g.set(t)}function p(t,e){const n=d.findIndex((e=>t.threshold===e.threshold))+e;if(n<0||n>=d.length)return t;sessionStorage.setItem("thresholdsIndex",n.toString());const s=d[n];return{...t,...s}}function w(){const t=sessionStorage.getItem("thresholdsIndex");return null===t?2:parseInt(t)}const x=document.getElementsByClassName("threshold").item(0),y=Array.from(x.getElementsByClassName("num")),E=x.getElementsByClassName("dec").item(0),j=x.getElementsByClassName("inc").item(0),L=document.getElementsByClassName("index").item(0),b=Array.from(L.getElementsByClassName("num"));l=document.getElementsByClassName("container").item(0),h.addWatcher((t=>{t?l.classList.remove("disableScroll"):l.classList.add("disableScroll")}));const v=await async function(){try{const t=await fetch(`${window.location.href}index.json`,{headers:{Accept:"application/json"}});return(await t.json()).sort(((t,e)=>t.index<e.index?-1:1))}catch(t){return[]}}();!function(t){const e=g.get();e.length=t,p(e,0),g.set(e)}(v.length),g.addWatcher((t=>{var e,s,o;e=n(t.index+1),s=n(t.length),b.forEach(((t,n)=>{t.innerText=n<4?e[n]:s[n-4]})),o=n(t.threshold),y.forEach(((t,e)=>{t.innerText=o[e]}))})),E.addEventListener("click",(()=>{!function(){let t=g.get();t=p(t,-1),g.set(t)}()}),{passive:!0}),j.addEventListener("click",(()=>{!function(){let t=g.get();t=p(t,1),g.set(t)}()}),{passive:!0}),v.length>0&&(window.matchMedia("(hover: none)").matches?import("./x7en59.js").then((t=>{t.initMobile(v)})).catch((t=>{console.log(t)})):import("./xwx9uS.js").then((t=>{t.initDesktop(v)})).catch((t=>{console.log(t)})));export{c as W,m as a,f as b,l as c,e as d,h as e,i as f,u as g,n as h,t as i,r as j,s as k,a as l,o,g as s};