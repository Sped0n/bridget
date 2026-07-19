import { D as createEffect, I as onCleanup, L as onMount, T as createComponent, _ as use, a as isMobile, d as memo, f as render, g as template, j as createSignal, k as createRenderEffect, l as delegateEvents, o as loadGsap, p as setAttribute, u as insert } from "./C3xGhw.js";
import { t as CustomCursor } from "./DsETc2.js";
//#region assets/ts/postDrag.ts
var SELECTOR = [
	".postTitle",
	".postLede",
	".postBody > p",
	".postBody > h2",
	".postBody > h3",
	".postBody > blockquote",
	".postFigure figcaption",
	".postImage"
].join(",");
var DRAG_THRESHOLD = 4;
var prefersReducedMotion$1 = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/**
* Makes the server-rendered post prose and imagery draggable: grab any block,
* it trails the pointer with an eased lag, and springs home on release. A
* decorative, pointer-only flourish — it never touches keyboard flow, and a
* plain click still falls through to the image lightbox. Returns a disposer.
*/
function initPostDrag(article) {
	if (prefersReducedMotion$1()) return () => {};
	const targets = Array.from(article.querySelectorAll(SELECTOR));
	if (targets.length === 0) return () => {};
	targets.forEach((el) => el.classList.add("postDraggable"));
	const controller = new AbortController();
	const { signal } = controller;
	let g;
	let active = null;
	let moveX = null;
	let moveY = null;
	let startX = 0;
	let startY = 0;
	let baseX = 0;
	let baseY = 0;
	let pointerId = -1;
	let dragged = false;
	loadGsap().then((lib) => {
		g = lib;
	});
	const suppressClick = (e) => {
		e.stopImmediatePropagation();
		e.preventDefault();
	};
	const onDown = (e) => {
		if (e.button !== 0 || active !== null || g === void 0) return;
		const target = e.target?.closest(SELECTOR);
		if (target == null) return;
		active = target;
		startX = e.clientX;
		startY = e.clientY;
		baseX = Number(g.getProperty(target, "x"));
		baseY = Number(g.getProperty(target, "y"));
		pointerId = e.pointerId;
		dragged = false;
		moveX = g.quickTo(target, "x", {
			duration: .15,
			ease: "power2.out"
		});
		moveY = g.quickTo(target, "y", {
			duration: .15,
			ease: "power2.out"
		});
	};
	const onMove = (e) => {
		if (active === null || e.pointerId !== pointerId) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		if (!dragged) {
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
			dragged = true;
			active.classList.add("is-dragging");
		}
		moveX?.(baseX + dx);
		moveY?.(baseY + dy);
	};
	const onUp = (e) => {
		if (active === null || e.pointerId !== pointerId) return;
		const el = active;
		active = null;
		moveX = null;
		moveY = null;
		if (!dragged) return;
		el.addEventListener("click", suppressClick, {
			capture: true,
			once: true
		});
	};
	article.addEventListener("pointerdown", onDown, { signal });
	window.addEventListener("pointermove", onMove, { signal });
	window.addEventListener("pointerup", onUp, { signal });
	window.addEventListener("pointercancel", onUp, { signal });
	article.addEventListener("dragstart", (e) => e.preventDefault(), { signal });
	return () => controller.abort();
}
//#endregion
//#region assets/ts/post.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div class=postLightbox role=dialog aria-modal=true><div class=postLightboxFrame>`), _tmpl$2 = /*#__PURE__*/ template(`<img alt>`);
var prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function Lightbox(props) {
	let overlay;
	let frame;
	let _gsap;
	let origin = {
		top: 0,
		left: 0,
		width: 0,
		height: 0
	};
	let animating = false;
	const [open, setOpen] = createSignal(false);
	const [shot, setShot] = createSignal(null);
	const ensureGsap = async () => {
		if (_gsap === void 0) _gsap = await loadGsap();
		return _gsap;
	};
	const rectOf = (el) => {
		const r = el.getBoundingClientRect();
		return {
			top: r.top,
			left: r.left,
			width: r.width,
			height: r.height
		};
	};
	const openShot = async (btn) => {
		if (animating || open()) return;
		const img = btn.querySelector("img");
		if (img == null) return;
		origin = rectOf(img);
		setShot({
			url: btn.dataset.hiUrl ?? "",
			w: Number(btn.dataset.hiW ?? 0),
			h: Number(btn.dataset.hiH ?? 0)
		});
		setOpen(true);
		const g = await ensureGsap();
		if (frame === void 0) return;
		animating = true;
		g.fromTo(frame, { ...origin }, {
			top: 0,
			left: 0,
			width: window.innerWidth,
			height: window.innerHeight,
			duration: prefersReducedMotion() ? 0 : .55,
			ease: "expo.out",
			onComplete: () => {
				animating = false;
			}
		});
	};
	const close = async () => {
		if (animating || !open()) return;
		const g = await ensureGsap();
		if (frame === void 0) {
			setOpen(false);
			return;
		}
		animating = true;
		g.to(frame, {
			...origin,
			duration: prefersReducedMotion() ? 0 : .45,
			ease: "expo.inOut",
			onComplete: () => {
				animating = false;
				setOpen(false);
				setShot(null);
			}
		});
	};
	const onKey = (e) => {
		if (open() && e.key === "Escape") close();
	};
	createEffect(() => {
		document.body.style.overflow = open() ? "hidden" : "";
	});
	onCleanup(() => {
		document.body.style.overflow = "";
	});
	onMount(() => {
		const controller = new AbortController();
		const { signal } = controller;
		props.buttons.forEach((btn) => {
			btn.addEventListener("click", () => void openShot(btn), { signal });
		});
		window.addEventListener("keydown", onKey, { signal });
		onCleanup(() => {
			controller.abort();
		});
	});
	return [(() => {
		var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
		_el$.$$click = () => void close();
		var _ref$ = overlay;
		typeof _ref$ === "function" ? use(_ref$, _el$) : overlay = _el$;
		var _ref$2 = frame;
		typeof _ref$2 === "function" ? use(_ref$2, _el$2) : frame = _el$2;
		insert(_el$2, (() => {
			var _c$ = memo(() => shot() != null);
			return () => _c$() && (() => {
				var _el$3 = _tmpl$2();
				createRenderEffect((_p$) => {
					var _v$ = shot()?.url, _v$2 = shot()?.w, _v$3 = shot()?.h;
					_v$ !== _p$.e && setAttribute(_el$3, "src", _p$.e = _v$);
					_v$2 !== _p$.t && setAttribute(_el$3, "width", _p$.t = _v$2);
					_v$3 !== _p$.a && setAttribute(_el$3, "height", _p$.a = _v$3);
					return _p$;
				}, {
					e: void 0,
					t: void 0,
					a: void 0
				});
				return _el$3;
			})();
		})());
		createRenderEffect(() => _el$.classList.toggle("active", !!open()));
		return _el$;
	})(), createComponent(CustomCursor, {
		active: open,
		cursorText: () => props.closeText
	})];
}
function initPost() {
	const article = document.querySelector(".postArticle");
	if (article == null) return;
	if (!isMobile()) initPostDrag(article);
	const buttons = Array.from(article.querySelectorAll("button.postImage"));
	if (buttons.length === 0) return;
	const closeText = document.querySelector(".container")?.dataset.close ?? "close";
	const root = document.createElement("div");
	root.className = "postOverlayRoot";
	document.body.appendChild(root);
	render(() => createComponent(Lightbox, {
		buttons,
		closeText
	}), root);
}
delegateEvents(["click"]);
//#endregion
export { initPost };
