import { D as createEffect, F as on, I as onCleanup, L as onMount, O as createMemo, S as Show, T as createComponent, _ as use, b as For, g as template, i as increment, k as createRenderEffect, l as delegateEvents, n as expand, o as loadGsap, p as setAttribute, t as decrement, u as insert } from "./C3xGhw.js";
import { i as useConfigState, n as useDesktopState, r as useImageState } from "./main.js";
import { t as CustomCursor } from "./DsETc2.js";
//#region assets/ts/desktop/nav.tsx
function Nav() {
	let thresholdNums = [];
	let indexNums = [];
	let decButton;
	let incButton;
	let controller;
	const imageState = useImageState();
	const [config, { incThreshold, decThreshold }] = useConfigState();
	const [desktop] = useDesktopState();
	const updateThresholdText = (thresholdValue) => {
		thresholdNums.forEach((element, i) => {
			element.innerText = thresholdValue[i];
		});
	};
	const updateIndexText = (indexValue, indexLength) => {
		indexNums.forEach((element, i) => {
			if (i < 4) element.innerText = indexValue[i];
			else element.innerText = indexLength[i - 4];
		});
	};
	onMount(() => {
		const thresholdDiv = document.getElementsByClassName("threshold")[0];
		const indexDiv = document.getElementsByClassName("index").item(0);
		thresholdNums = Array.from(thresholdDiv.getElementsByClassName("num"));
		indexNums = Array.from(indexDiv.getElementsByClassName("num"));
		decButton = thresholdDiv.getElementsByClassName("dec").item(0);
		incButton = thresholdDiv.getElementsByClassName("inc").item(0);
		controller = new AbortController();
		const signal = controller.signal;
		decButton.addEventListener("click", decThreshold, { signal });
		incButton.addEventListener("click", incThreshold, { signal });
	});
	createEffect(() => {
		if (thresholdNums.length === 0 || indexNums.length === 0) return;
		updateIndexText(expand(desktop.index() + 1), expand(imageState().length));
		updateThresholdText(expand(config().threshold));
	});
	onCleanup(() => {
		controller?.abort();
	});
	return null;
}
//#endregion
//#region assets/ts/desktop/stageUtils.ts
function getTrailElsIndex(cordHistValue) {
	return cordHistValue.map((el) => el.i);
}
function getTrailInactiveElsIndex(cordHistValue, trailLength) {
	return getTrailElsIndex(cordHistValue).slice(-trailLength).slice(0, -1);
}
function getCurrentElIndex(cordHistValue) {
	return getTrailElsIndex(cordHistValue).slice(-1)[0];
}
function getPrevElIndex(cordHistValue, length) {
	return decrement(cordHistValue.slice(-1)[0].i, length);
}
function getNextElIndex(cordHistValue, length) {
	return increment(cordHistValue.slice(-1)[0].i, length);
}
function getImagesFromIndexes(imgs, indexes) {
	return indexes.map((i) => imgs[i]);
}
function hires(imgs) {
	imgs.forEach((img) => {
		if (img.src === img.dataset.hiUrl) return;
		img.src = img.dataset.hiUrl;
		img.height = parseInt(img.dataset.hiImgH);
		img.width = parseInt(img.dataset.hiImgW);
	});
}
function lores(imgs) {
	imgs.forEach((img) => {
		if (img.src === img.dataset.loUrl) return;
		img.src = img.dataset.loUrl;
		img.height = parseInt(img.dataset.loImgH);
		img.width = parseInt(img.dataset.loImgW);
	});
}
function onMutation(element, trigger, observeOptions = { attributes: true }) {
	new MutationObserver((mutations, observer) => {
		for (const mutation of mutations) if (trigger(mutation)) {
			observer.disconnect();
			break;
		}
	}).observe(element, observeOptions);
}
//#endregion
//#region assets/ts/desktop/stageAnimations.ts
function setLoaderForHiresImage(args) {
	const { gsap, img, mounted, setIsLoading } = args;
	if (!mounted) return;
	if (img.complete) {
		gsap.set(img, { opacity: 1 }).then(() => {
			setIsLoading(false);
		}).catch((e) => {
			console.log(e);
		});
		return;
	}
	setIsLoading(true);
	const controller = new AbortController();
	const abortSignal = controller.signal;
	img.addEventListener("load", () => {
		gsap.to(img, {
			opacity: 1,
			ease: "power3.out",
			duration: .5
		}).then(() => {
			setIsLoading(false);
		}).catch((e) => {
			console.log(e);
		}).finally(() => {
			controller.abort();
		});
	}, {
		once: true,
		passive: true,
		signal: abortSignal
	});
	img.addEventListener("error", () => {
		gsap.set(img, { opacity: 1 }).then(() => {
			setIsLoading(false);
		}).catch((e) => {
			console.log(e);
		}).finally(() => {
			controller.abort();
		});
	}, {
		once: true,
		passive: true,
		signal: abortSignal
	});
}
function syncStagePosition(args) {
	const { gsap, imgs, cordHist, trailLength, length, isOpen, navVector, mounted, setIsLoading } = args;
	if (!mounted || imgs.length === 0) return;
	const trailElsIndex = getTrailElsIndex(cordHist);
	if (trailElsIndex.length === 0) return;
	const elsTrail = getImagesFromIndexes(imgs, trailElsIndex);
	gsap.set(elsTrail, {
		x: (i) => cordHist[i].x - window.innerWidth / 2,
		y: (i) => cordHist[i].y - window.innerHeight / 2,
		opacity: (i) => Math.max((i + 1 + trailLength <= cordHist.length ? 0 : 1) - (isOpen ? 1 : 0), 0),
		zIndex: (i) => i,
		scale: .6
	});
	if (!isOpen) {
		lores(elsTrail);
		return;
	}
	const current = getImagesFromIndexes(imgs, [getCurrentElIndex(cordHist)])[0];
	const indexArrayToHires = [];
	const indexArrayToCleanup = [];
	switch (navVector) {
		case "prev":
			indexArrayToHires.push(getPrevElIndex(cordHist, length));
			indexArrayToCleanup.push(getNextElIndex(cordHist, length));
			break;
		case "next":
			indexArrayToHires.push(getNextElIndex(cordHist, length));
			indexArrayToCleanup.push(getPrevElIndex(cordHist, length));
			break;
		default: break;
	}
	hires(getImagesFromIndexes(imgs, indexArrayToHires));
	gsap.set(getImagesFromIndexes(imgs, indexArrayToCleanup), { opacity: 0 });
	gsap.set(current, {
		x: 0,
		y: 0,
		scale: 1
	});
	setLoaderForHiresImage({
		gsap,
		img: current,
		mounted,
		setIsLoading
	});
}
async function expandStage(args) {
	const { gsap, imgs, cordHist, trailLength, length, mounted, setIsLoading, setIsAnimating } = args;
	if (!mounted) throw new Error("not mounted");
	setIsAnimating(true);
	const currentIndex = getCurrentElIndex(cordHist);
	const current = imgs[currentIndex];
	hires(getImagesFromIndexes(imgs, [
		currentIndex,
		getPrevElIndex(cordHist, length),
		getNextElIndex(cordHist, length)
	]));
	setLoaderForHiresImage({
		gsap,
		img: current,
		mounted,
		setIsLoading
	});
	const tl = gsap.timeline();
	const trailInactiveEls = getImagesFromIndexes(imgs, getTrailInactiveElsIndex(cordHist, trailLength));
	tl.to(trailInactiveEls, {
		y: "+=20",
		ease: "power3.in",
		stagger: .075,
		duration: .3,
		delay: .1,
		opacity: 0
	});
	tl.to(current, {
		x: 0,
		y: 0,
		ease: "power3.inOut",
		duration: .7,
		delay: .3
	});
	tl.to(current, {
		delay: .1,
		scale: 1,
		ease: "power3.inOut"
	});
	await tl.then(() => {
		setIsAnimating(false);
	});
}
async function minimizeStage(args) {
	const { gsap, imgs, cordHist, trailLength, mounted, setIsAnimating } = args;
	if (!mounted) throw new Error("not mounted");
	setIsAnimating(true);
	const currentIndex = getCurrentElIndex(cordHist);
	const trailInactiveIndexes = getTrailInactiveElsIndex(cordHist, trailLength);
	lores(getImagesFromIndexes(imgs, [...trailInactiveIndexes, currentIndex]));
	const tl = gsap.timeline();
	const current = getImagesFromIndexes(imgs, [currentIndex])[0];
	const trailInactiveEls = getImagesFromIndexes(imgs, trailInactiveIndexes);
	tl.to(current, {
		scale: .6,
		duration: .6,
		ease: "power3.inOut"
	});
	tl.to(current, {
		delay: .3,
		duration: .7,
		ease: "power3.inOut",
		x: cordHist.slice(-1)[0].x - window.innerWidth / 2,
		y: cordHist.slice(-1)[0].y - window.innerHeight / 2
	});
	tl.to(trailInactiveEls, {
		y: "-=20",
		ease: "power3.out",
		stagger: -.1,
		duration: .3,
		opacity: 1
	});
	await tl.then(() => {
		setIsAnimating(false);
	});
}
//#endregion
//#region assets/ts/desktop/stage.tsx
var _tmpl$$1 = /*#__PURE__*/ template(`<div class=stage>`), _tmpl$2$1 = /*#__PURE__*/ template(`<img>`);
function Stage() {
	let _gsap;
	let gsapPromise;
	const imageState = useImageState();
	const [config] = useConfigState();
	const [desktop, { setIndex, setCordHist, setIsOpen, setIsAnimating, setIsLoading, setNavVector }] = useDesktopState();
	const imgs = Array(imageState().length);
	let last = {
		x: 0,
		y: 0
	};
	let abortController;
	let gsapLoaded = false;
	let mounted = false;
	const ensureGsapReady = async () => {
		if (gsapPromise !== void 0) return await gsapPromise;
		gsapPromise = loadGsap().then((g) => {
			_gsap = g;
			gsapLoaded = true;
		}).catch((e) => {
			gsapPromise = void 0;
			console.log(e);
		});
		await gsapPromise;
	};
	const onMouse = (e) => {
		if (desktop.isOpen() || desktop.isAnimating() || !gsapLoaded || !mounted) return;
		const length = imageState().length;
		if (length <= 0) return;
		const cord = {
			x: e.clientX,
			y: e.clientY
		};
		if (Math.hypot(cord.x - last.x, cord.y - last.y) > config().threshold) {
			const nextIndex = increment(desktop.index(), length);
			last = cord;
			setIndex(nextIndex);
			setCordHist((prev) => [...prev, {
				i: nextIndex,
				...cord
			}].slice(-length));
		}
	};
	const onClick = async () => {
		if (!gsapLoaded) await ensureGsapReady();
		if (desktop.isAnimating() || !gsapLoaded) return;
		if (desktop.index() < 0 || desktop.cordHist().length === 0) return;
		setIsOpen(true);
	};
	const setPosition = () => {
		syncStagePosition({
			gsap: _gsap,
			imgs,
			cordHist: desktop.cordHist(),
			trailLength: config().trailLength,
			length: imageState().length,
			isOpen: desktop.isOpen(),
			navVector: desktop.navVector(),
			mounted,
			setIsLoading
		});
	};
	const expandImage = async () => {
		if (!mounted || !gsapLoaded) throw new Error("not mounted or gsap not loaded");
		await expandStage({
			gsap: _gsap,
			imgs,
			cordHist: desktop.cordHist(),
			trailLength: config().trailLength,
			length: imageState().length,
			mounted,
			setIsLoading,
			setIsAnimating
		});
	};
	const minimizeImage = async () => {
		if (!mounted || !gsapLoaded) throw new Error("not mounted or gsap not loaded");
		setNavVector("none");
		await minimizeStage({
			gsap: _gsap,
			imgs,
			cordHist: desktop.cordHist(),
			trailLength: config().trailLength,
			mounted,
			setIsAnimating
		});
	};
	onMount(() => {
		imgs.forEach((img, i) => {
			if (i < 5) img.src = img.dataset.loUrl;
			onMutation(img, (mutation) => {
				if (desktop.isOpen() || desktop.isAnimating()) return false;
				if (mutation.attributeName !== "style") return false;
				if (parseFloat(img.style.opacity) !== 1) return false;
				if (i + 5 < imgs.length) imgs[i + 5].src = imgs[i + 5].dataset.loUrl;
				return true;
			});
		});
		window.addEventListener("pointermove", () => void ensureGsapReady(), {
			passive: true,
			once: true
		});
		window.addEventListener("pointerdown", () => void ensureGsapReady(), {
			passive: true,
			once: true
		});
		window.addEventListener("click", () => void ensureGsapReady(), {
			passive: true,
			once: true
		});
		abortController = new AbortController();
		const abortSignal = abortController.signal;
		window.addEventListener("mousemove", onMouse, {
			passive: true,
			signal: abortSignal
		});
		mounted = true;
	});
	createEffect(on(() => desktop.cordHist(), () => {
		setPosition();
	}, { defer: true }));
	createEffect(on(desktop.isOpen, async (isOpen) => {
		if (desktop.isAnimating()) return;
		if (isOpen) {
			if (desktop.index() < 0 || desktop.cordHist().length === 0) {
				setIsOpen(false);
				return;
			}
			await expandImage().catch(() => {
				setIsOpen(false);
				setIsAnimating(false);
				setIsLoading(false);
			}).then(() => {
				abortController?.abort();
			});
		} else await minimizeImage().catch(() => {}).then(() => {
			abortController = new AbortController();
			const abortSignal = abortController.signal;
			window.addEventListener("mousemove", onMouse, {
				passive: true,
				signal: abortSignal
			});
			setIsLoading(false);
		});
	}, { defer: true }));
	return (() => {
		var _el$ = _tmpl$$1();
		_el$.$$keydown = onClick;
		_el$.$$click = onClick;
		insert(_el$, createComponent(For, {
			get each() {
				return imageState().images;
			},
			children: (ij, i) => (() => {
				var _el$2 = _tmpl$2$1();
				var _ref$ = imgs[i()];
				typeof _ref$ === "function" ? use(_ref$, _el$2) : imgs[i()] = _el$2;
				createRenderEffect((_p$) => {
					var _v$ = ij.loImgH, _v$2 = ij.loImgW, _v$3 = ij.hiUrl, _v$4 = ij.hiImgH, _v$5 = ij.hiImgW, _v$6 = ij.loUrl, _v$7 = ij.loImgH, _v$8 = ij.loImgW, _v$9 = ij.alt;
					_v$ !== _p$.e && setAttribute(_el$2, "height", _p$.e = _v$);
					_v$2 !== _p$.t && setAttribute(_el$2, "width", _p$.t = _v$2);
					_v$3 !== _p$.a && setAttribute(_el$2, "data-hi-url", _p$.a = _v$3);
					_v$4 !== _p$.o && setAttribute(_el$2, "data-hi-img-h", _p$.o = _v$4);
					_v$5 !== _p$.i && setAttribute(_el$2, "data-hi-img-w", _p$.i = _v$5);
					_v$6 !== _p$.n && setAttribute(_el$2, "data-lo-url", _p$.n = _v$6);
					_v$7 !== _p$.s && setAttribute(_el$2, "data-lo-img-h", _p$.s = _v$7);
					_v$8 !== _p$.h && setAttribute(_el$2, "data-lo-img-w", _p$.h = _v$8);
					_v$9 !== _p$.r && setAttribute(_el$2, "alt", _p$.r = _v$9);
					return _p$;
				}, {
					e: void 0,
					t: void 0,
					a: void 0,
					o: void 0,
					i: void 0,
					n: void 0,
					s: void 0,
					h: void 0,
					r: void 0
				});
				return _el$2;
			})()
		}));
		return _el$;
	})();
}
delegateEvents(["click", "keydown"]);
//#endregion
//#region assets/ts/desktop/stageNav.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div class=navOverlay>`), _tmpl$2 = /*#__PURE__*/ template(`<div class=overlay tabindex=-1>`);
function StageNav(props) {
	let controller;
	const navItems = [
		props.prevText,
		props.closeText,
		props.nextText
	];
	const imageState = useImageState();
	const [desktop, { incIndex, decIndex, setCordHist, setHoverText, setIsOpen, setNavVector }] = useDesktopState();
	const active = createMemo(() => desktop.isOpen() && !desktop.isAnimating());
	const prevImage = () => {
		setNavVector("prev");
		setCordHist((c) => c.map((item) => {
			return {
				...item,
				i: decrement(item.i, imageState().length)
			};
		}));
		decIndex();
	};
	const closeImage = () => {
		setIsOpen(false);
	};
	const nextImage = () => {
		setNavVector("next");
		setCordHist((c) => c.map((item) => {
			return {
				...item,
				i: increment(item.i, imageState().length)
			};
		}));
		incIndex();
	};
	const handleClick = (item) => {
		if (!desktop.isOpen() || desktop.isAnimating()) return;
		if (item === navItems[0]) prevImage();
		else if (item === navItems[1]) closeImage();
		else nextImage();
	};
	const handleKey = (e) => {
		if (!desktop.isOpen() || desktop.isAnimating()) return;
		if (e.key === "ArrowLeft") prevImage();
		else if (e.key === "Escape") closeImage();
		else if (e.key === "ArrowRight") nextImage();
	};
	createEffect(on(desktop.isOpen, (isOpen) => {
		controller?.abort();
		if (isOpen) {
			controller = new AbortController();
			const abortSignal = controller.signal;
			window.addEventListener("keydown", handleKey, {
				passive: true,
				signal: abortSignal
			});
		}
	}));
	onCleanup(() => {
		controller?.abort();
	});
	return (() => {
		var _el$ = _tmpl$();
		insert(_el$, createComponent(For, {
			each: navItems,
			children: (item) => (() => {
				var _el$2 = _tmpl$2();
				_el$2.$$mouseover = () => setHoverText(item);
				_el$2.addEventListener("focus", () => setHoverText(item));
				_el$2.$$click = () => {
					handleClick(item);
				};
				return _el$2;
			})()
		}));
		createRenderEffect(() => _el$.classList.toggle("active", !!active()));
		return _el$;
	})();
}
delegateEvents(["click", "mouseover"]);
//#endregion
//#region assets/ts/desktop/layout.tsx
/**
* components
*/
function Desktop(props) {
	const imageState = useImageState();
	const [desktop] = useDesktopState();
	const active = createMemo(() => desktop.isOpen() && !desktop.isAnimating());
	const cursorText = createMemo(() => desktop.isLoading() ? props.loadingText : desktop.hoverText());
	return [createComponent(Nav, {}), createComponent(Show, {
		get when() {
			return imageState().length > 0;
		},
		get children() {
			return [createComponent(Stage, {}), createComponent(Show, {
				get when() {
					return desktop.isOpen();
				},
				get children() {
					return [createComponent(CustomCursor, {
						cursorText,
						active
					}), createComponent(StageNav, {
						get prevText() {
							return props.prevText;
						},
						get closeText() {
							return props.closeText;
						},
						get nextText() {
							return props.nextText;
						}
					})];
				}
			})];
		}
	})];
}
//#endregion
export { Desktop as default };
