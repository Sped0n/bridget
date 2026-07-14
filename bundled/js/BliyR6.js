import { A as createSignal, F as onCleanup, I as onMount, O as createRenderEffect, a as loadGsap, c as delegateEvents, d as render, f as setAttribute, g as use, h as template, l as insert, u as memo, w as createComponent } from "./CCwPe9.js";
import { t as CustomCursor } from "./BGMSLm.js";
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
