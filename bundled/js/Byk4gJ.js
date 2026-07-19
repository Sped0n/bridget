import { D as createEffect, F as on, I as onCleanup, L as onMount, M as getListener, O as createMemo, P as mergeProps, R as untrack, S as Show, T as createComponent, _ as use, b as For, c as __vitePreload, g as template, h as spread, j as createSignal, k as createRenderEffect, l as delegateEvents, m as setStyleProperty, n as expand, o as loadGsap, p as setAttribute, s as removeDuplicates, u as insert, v as $PROXY, w as batch, y as $TRACK } from "./C3xGhw.js";
import { a as invariant, r as useImageState, t as useMobileState } from "./main.js";
//#region assets/ts/mobile/collection.tsx
var _tmpl$$3 = /*#__PURE__*/ template(`<div class=collection>`), _tmpl$2$1 = /*#__PURE__*/ template(`<img>`);
function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function onIntersection(element, trigger) {
	new IntersectionObserver((entries, observer) => {
		for (const entry of entries) if (trigger(entry)) {
			observer.disconnect();
			break;
		}
	}).observe(element);
}
function Collection() {
	const imageState = useImageState();
	const imgs = Array(imageState().length);
	const [mobile, { setIndex, setIsOpen }] = useMobileState();
	const handleClick = (i) => {
		if (mobile.isAnimating()) return;
		setIndex(i);
		setIsOpen(true);
	};
	const scrollToActive = () => {
		const index = mobile.index();
		if (index < 0) return;
		imgs[index].scrollIntoView({
			behavior: "auto",
			block: "center"
		});
	};
	onMount(() => {
		imgs.forEach((img, i) => {
			if (i < 5) img.src = img.dataset.src;
			img.addEventListener("click", () => {
				handleClick(i);
			}, { passive: true });
			img.addEventListener("keydown", () => {
				handleClick(i);
			}, { passive: true });
			onIntersection(img, (entry) => {
				if (entry.intersectionRatio <= 0) return false;
				if (i + 5 < imgs.length) imgs[i + 5].src = imgs[i + 5].dataset.src;
				return true;
			});
		});
	});
	createEffect(on(mobile.isOpen, () => {
		if (!mobile.isOpen()) scrollToActive();
	}, { defer: true }));
	return (() => {
		var _el$ = _tmpl$$3();
		insert(_el$, createComponent(For, {
			get each() {
				return imageState().images;
			},
			children: (ij, i) => (() => {
				var _el$2 = _tmpl$2$1();
				_el$2.$$keydown = () => {
					handleClick(i());
				};
				_el$2.$$click = () => {
					handleClick(i());
				};
				var _ref$ = imgs[i()];
				typeof _ref$ === "function" ? use(_ref$, _el$2) : imgs[i()] = _el$2;
				createRenderEffect((_p$) => {
					var _v$ = ij.loImgH, _v$2 = ij.loImgW, _v$3 = ij.loUrl, _v$4 = ij.alt, _v$5 = `translate3d(${i() !== 0 ? getRandom(-25, 25) : 0}%, ${i() !== 0 ? getRandom(-35, 35) : 0}%, 0)`;
					_v$ !== _p$.e && setAttribute(_el$2, "height", _p$.e = _v$);
					_v$2 !== _p$.t && setAttribute(_el$2, "width", _p$.t = _v$2);
					_v$3 !== _p$.a && setAttribute(_el$2, "data-src", _p$.a = _v$3);
					_v$4 !== _p$.o && setAttribute(_el$2, "alt", _p$.o = _v$4);
					_v$5 !== _p$.i && setStyleProperty(_el$2, "transform", _p$.i = _v$5);
					return _p$;
				}, {
					e: void 0,
					t: void 0,
					a: void 0,
					o: void 0,
					i: void 0
				});
				return _el$2;
			})()
		}));
		return _el$;
	})();
}
delegateEvents(["click", "keydown"]);
//#endregion
//#region node_modules/.pnpm/solid-js@1.9.13/node_modules/solid-js/store/dist/store.js
var $RAW = Symbol("store-raw"), $NODE = Symbol("store-node"), $HAS = Symbol("store-has"), $SELF = Symbol("store-self");
function wrap$1(value) {
	let p = value[$PROXY];
	if (!p) {
		Object.defineProperty(value, $PROXY, { value: p = new Proxy(value, proxyTraps$1) });
		if (!Array.isArray(value)) {
			const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value), proto = Object.getPrototypeOf(value);
			const isClass = proto !== null && value !== null && typeof value === "object" && !Array.isArray(value) && proto !== Object.prototype;
			if (isClass) {
				const descriptors = Object.getOwnPropertyDescriptors(proto);
				keys.push(...Object.keys(descriptors));
				Object.assign(desc, descriptors);
			}
			for (let i = 0, l = keys.length; i < l; i++) {
				const prop = keys[i];
				if (isClass && prop === "constructor") continue;
				if (desc[prop].get) Object.defineProperty(value, prop, {
					configurable: true,
					enumerable: desc[prop].enumerable,
					get: desc[prop].get.bind(p)
				});
			}
		}
	}
	return p;
}
function isWrappable(obj) {
	let proto;
	return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
}
function unwrap(item, set = /* @__PURE__ */ new Set()) {
	let result, unwrapped, v, prop;
	if (result = item != null && item[$RAW]) return result;
	if (!isWrappable(item) || set.has(item)) return item;
	if (Array.isArray(item)) {
		if (Object.isFrozen(item)) item = item.slice(0);
		else set.add(item);
		for (let i = 0, l = item.length; i < l; i++) {
			v = item[i];
			if ((unwrapped = unwrap(v, set)) !== v) item[i] = unwrapped;
		}
	} else {
		if (Object.isFrozen(item)) item = Object.assign({}, item);
		else set.add(item);
		const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
		for (let i = 0, l = keys.length; i < l; i++) {
			prop = keys[i];
			if (desc[prop].get) continue;
			v = item[prop];
			if ((unwrapped = unwrap(v, set)) !== v) item[prop] = unwrapped;
		}
	}
	return item;
}
function getNodes(target, symbol) {
	let nodes = target[symbol];
	if (!nodes) Object.defineProperty(target, symbol, { value: nodes = Object.create(null) });
	return nodes;
}
function getNode(nodes, property, value) {
	if (nodes[property]) return nodes[property];
	const [s, set] = createSignal(value, {
		equals: false,
		internal: true
	});
	s.$ = set;
	return nodes[property] = s;
}
function proxyDescriptor$1(target, property) {
	const desc = Reflect.getOwnPropertyDescriptor(target, property);
	if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE) return desc;
	delete desc.value;
	delete desc.writable;
	desc.get = () => target[$PROXY][property];
	return desc;
}
function trackSelf(target) {
	getListener() && getNode(getNodes(target, $NODE), $SELF)();
}
function ownKeys(target) {
	trackSelf(target);
	return Reflect.ownKeys(target);
}
var proxyTraps$1 = {
	get(target, property, receiver) {
		if (property === $RAW) return target;
		if (property === $PROXY) return receiver;
		if (property === $TRACK) {
			trackSelf(target);
			return receiver;
		}
		const nodes = getNodes(target, $NODE);
		const tracked = nodes[property];
		let value = tracked ? tracked() : target[property];
		if (property === $NODE || property === $HAS || property === "__proto__") return value;
		if (!tracked) {
			const desc = Object.getOwnPropertyDescriptor(target, property);
			if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get)) value = getNode(nodes, property, value)();
		}
		return isWrappable(value) ? wrap$1(value) : value;
	},
	has(target, property) {
		if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__") return true;
		getListener() && getNode(getNodes(target, $HAS), property)();
		return property in target;
	},
	set() {
		return true;
	},
	deleteProperty() {
		return true;
	},
	ownKeys,
	getOwnPropertyDescriptor: proxyDescriptor$1
};
function setProperty(state, property, value, deleting = false) {
	if (property === "__proto__") return;
	if (!deleting && state[property] === value) return;
	const prev = state[property], len = state.length;
	if (value === void 0) {
		delete state[property];
		if (state[$HAS] && state[$HAS][property] && prev !== void 0) state[$HAS][property].$();
	} else {
		state[property] = value;
		if (state[$HAS] && state[$HAS][property] && prev === void 0) state[$HAS][property].$();
	}
	let nodes = getNodes(state, $NODE), node;
	if (node = getNode(nodes, property, prev)) node.$(() => value);
	if (Array.isArray(state) && state.length !== len) {
		for (let i = state.length; i < len; i++) (node = nodes[i]) && node.$();
		(node = getNode(nodes, "length", len)) && node.$(state.length);
	}
	(node = nodes[$SELF]) && node.$();
}
function mergeStoreNode(state, value) {
	const keys = Object.keys(value);
	for (let i = 0; i < keys.length; i += 1) {
		const key = keys[i];
		if (isUnsafeKey$1(key)) continue;
		setProperty(state, key, value[key]);
	}
}
function isUnsafeKey$1(property) {
	return property === "__proto__" || property === "constructor" || property === "prototype";
}
function updateArray(current, next) {
	if (typeof next === "function") next = next(current);
	next = unwrap(next);
	if (Array.isArray(next)) {
		if (current === next) return;
		let i = 0, len = next.length;
		for (; i < len; i++) {
			const value = next[i];
			if (current[i] !== value) setProperty(current, i, value);
		}
		setProperty(current, "length", len);
	} else mergeStoreNode(current, next);
}
function updatePath(current, path, traversed = []) {
	let part, prev = current;
	if (path.length > 1) {
		part = path.shift();
		const partType = typeof part, isArray = Array.isArray(current);
		if (partType === "string" && (part === "__proto__" || path.length > 1 && isUnsafeKey$1(part))) return;
		if (Array.isArray(part)) {
			for (let i = 0; i < part.length; i++) updatePath(current, [part[i]].concat(path), traversed);
			return;
		} else if (isArray && partType === "function") {
			for (let i = 0; i < current.length; i++) if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
			return;
		} else if (isArray && partType === "object") {
			const { from = 0, to = current.length - 1, by = 1 } = part;
			for (let i = from; i <= to; i += by) updatePath(current, [i].concat(path), traversed);
			return;
		} else if (path.length > 1) {
			updatePath(current[part], path, [part].concat(traversed));
			return;
		}
		prev = current[part];
		traversed = [part].concat(traversed);
	}
	let value = path[0];
	if (typeof value === "function") {
		value = value(prev, traversed);
		if (value === prev) return;
	}
	if (part === void 0 && value == void 0) return;
	value = unwrap(value);
	if (part === void 0 || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) mergeStoreNode(prev, value);
	else setProperty(current, part, value);
}
function createStore(...[store, options]) {
	const unwrappedStore = unwrap(store || {});
	const isArray = Array.isArray(unwrappedStore);
	const wrappedStore = wrap$1(unwrappedStore);
	function setStore(...args) {
		batch(() => {
			isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
		});
	}
	return [wrappedStore, setStore];
}
//#endregion
//#region assets/ts/mobile/galleryImage.tsx
var _tmpl$$2 = /*#__PURE__*/ template(`<div class=slideContainer><img><div class=loadingText>`);
function GalleryImage(props) {
	let img;
	let loadingDiv;
	let _gsap;
	let gsapPromise;
	let revealed = false;
	const [mobile] = useMobileState();
	const revealImage = async () => {
		if (revealed) return;
		revealed = true;
		invariant(img, "ref must be defined");
		invariant(loadingDiv, "loadingDiv must be defined");
		gsapPromise ??= loadGsap();
		try {
			_gsap ??= await gsapPromise;
		} catch (e) {
			console.log(e);
		}
		if (_gsap === void 0) {
			img.style.opacity = "1";
			loadingDiv.style.opacity = "0";
			return;
		}
		if (mobile.index() !== props.ij.index) {
			_gsap.set(img, { opacity: 1 });
			_gsap.set(loadingDiv, { opacity: 0 });
			return;
		}
		_gsap.to(img, {
			opacity: 1,
			delay: .5,
			duration: .5,
			ease: "power3.out"
		});
		_gsap.to(loadingDiv, {
			opacity: 0,
			duration: .5,
			ease: "power3.in"
		});
	};
	onMount(() => {
		gsapPromise = loadGsap().then((g) => {
			_gsap = g;
			return g;
		}).catch((e) => {
			console.log(e);
			throw e;
		});
		img?.addEventListener("load", () => {
			revealImage();
		}, {
			once: true,
			passive: true
		});
		if (props.load && img?.complete && img.currentSrc !== "") revealImage();
	});
	createEffect(on(() => props.load, (load) => {
		if (!load || img === void 0 || !img.complete || img.currentSrc === "") return;
		revealImage();
	}, { defer: true }));
	return (() => {
		var _el$ = _tmpl$$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
		var _ref$ = img;
		typeof _ref$ === "function" ? use(_ref$, _el$2) : img = _el$2;
		spread(_el$2, mergeProps(() => props.load && { src: props.ij.hiUrl }, {
			get height() {
				return props.ij.hiImgH;
			},
			get width() {
				return props.ij.hiImgW;
			},
			get ["data-src"]() {
				return props.ij.hiUrl;
			},
			get alt() {
				return props.ij.alt;
			},
			"style": { opacity: 0 }
		}), false, false);
		var _ref$2 = loadingDiv;
		typeof _ref$2 === "function" ? use(_ref$2, _el$3) : loadingDiv = _el$3;
		insert(_el$3, () => props.loadingText);
		return _el$;
	})();
}
//#endregion
//#region assets/ts/mobile/galleryNav.tsx
var _tmpl$$1 = /*#__PURE__*/ template(`<div class=nav><div><span class=num></span><span class=num></span><span class=num></span><span class=num></span><span>/</span><span class=num></span><span class=num></span><span class=num></span><span class=num></span></div><div class=navClose role=button tabindex=0>`);
function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function GalleryNav(props) {
	const imageState = useImageState();
	const [mobile, { setIsOpen }] = useMobileState();
	const indexValue = createMemo(() => expand(mobile.index() + 1));
	const indexLength = createMemo(() => expand(imageState().length));
	const onClick = () => {
		if (mobile.isAnimating()) return;
		setIsOpen(false);
	};
	return (() => {
		var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling, _el$8 = _el$6.nextSibling.nextSibling, _el$9 = _el$8.nextSibling, _el$0 = _el$9.nextSibling, _el$1 = _el$0.nextSibling, _el$10 = _el$2.nextSibling;
		insert(_el$3, () => indexValue()[0]);
		insert(_el$4, () => indexValue()[1]);
		insert(_el$5, () => indexValue()[2]);
		insert(_el$6, () => indexValue()[3]);
		insert(_el$8, () => indexLength()[0]);
		insert(_el$9, () => indexLength()[1]);
		insert(_el$0, () => indexLength()[2]);
		insert(_el$1, () => indexLength()[3]);
		_el$10.$$keydown = onClick;
		_el$10.$$touchend = onClick;
		_el$10.$$click = onClick;
		insert(_el$10, () => capitalizeFirstLetter(props.closeText));
		return _el$;
	})();
}
delegateEvents([
	"click",
	"touchend",
	"keydown"
]);
//#endregion
//#region assets/ts/mobile/galleryTransitions.ts
var OPEN_DELAY_MS = 1200;
var CLOSE_DELAY_MS = 1400;
function openGallery(args) {
	const { gsap, curtain, gallery, setIsAnimating, setIsScrollLocked } = args;
	setIsAnimating(true);
	gsap.to(curtain, {
		opacity: 1,
		duration: 1
	});
	gsap.to(gallery, {
		y: 0,
		ease: "power3.inOut",
		duration: 1,
		delay: .4
	});
	setTimeout(() => {
		setIsScrollLocked(true);
		setIsAnimating(false);
	}, OPEN_DELAY_MS);
}
function closeGallery(args) {
	const { gsap, curtain, gallery, setIsAnimating, setIsScrollLocked, onClosed } = args;
	setIsAnimating(true);
	gsap.to(gallery, {
		y: "100%",
		ease: "power3.inOut",
		duration: 1
	});
	gsap.to(curtain, {
		opacity: 0,
		duration: 1.2,
		delay: .4
	});
	setTimeout(() => {
		setIsScrollLocked(false);
		setIsAnimating(false);
		onClosed();
	}, CLOSE_DELAY_MS);
}
//#endregion
//#region assets/ts/mobile/galleryUtils.ts
async function loadSwiper() {
	return (await __vitePreload(() => import("./cTcGzc.js"), [])).Swiper;
}
function getActiveImageIndexes(currentIndex, length, navigateVector) {
	const nextIndex = Math.min(currentIndex + 1, length - 1);
	const prevIndex = Math.max(currentIndex - 1, 0);
	switch (navigateVector) {
		case "next": return [nextIndex];
		case "prev": return [prevIndex];
		case "none": return [
			currentIndex,
			nextIndex,
			prevIndex
		];
	}
}
//#endregion
//#region assets/ts/mobile/gallery.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div class=gallery><div class=galleryInner><div class=swiper-wrapper>`), _tmpl$2 = /*#__PURE__*/ template(`<div class=curtain>`), _tmpl$3 = /*#__PURE__*/ template(`<div class=swiper-slide>`);
function Gallery(props) {
	let _gsap;
	let _swiper;
	let initPromise;
	let curtain;
	let gallery;
	let galleryInner;
	const imageState = useImageState();
	const [mobile, { setIndex, setIsAnimating, setIsScrollLocked }] = useMobileState();
	const loadingText = createMemo(() => capitalizeFirstLetter(props.loadingText));
	let lastIndex = -1;
	let mounted = false;
	let navigateVector = "none";
	const [libLoaded, setLibLoaded] = createSignal(false);
	const [swiperReady, setSwiperReady] = createSignal(false);
	const [loads, setLoads] = createStore(Array(imageState().length).fill(false));
	const slideUp = () => {
		if (!libLoaded() || !mounted) return;
		invariant(curtain, "curtain is not defined");
		invariant(gallery, "gallery is not defined");
		openGallery({
			gsap: _gsap,
			curtain,
			gallery,
			setIsAnimating,
			setIsScrollLocked
		});
	};
	const slideDown = () => {
		invariant(gallery, "curtain is not defined");
		invariant(curtain, "gallery is not defined");
		closeGallery({
			gsap: _gsap,
			curtain,
			gallery,
			setIsAnimating,
			setIsScrollLocked,
			onClosed: () => {
				lastIndex = -1;
			}
		});
	};
	const galleryLoadImages = () => {
		setLoads(removeDuplicates(getActiveImageIndexes(mobile.index(), imageState().length, navigateVector)), true);
	};
	const changeSlide = (slide) => {
		if (!swiperReady() || _swiper === void 0) return;
		galleryLoadImages();
		_swiper.slideTo(slide, 0);
	};
	const ensureGalleryReady = async () => {
		if (initPromise !== void 0) return await initPromise;
		initPromise = (async () => {
			try {
				const [g, S] = await Promise.all([loadGsap(), loadSwiper()]);
				_gsap = g;
				invariant(galleryInner, "galleryInner is not defined");
				_swiper = new S(galleryInner, { spaceBetween: 20 });
				_swiper.on("slideChange", ({ realIndex }) => {
					setIndex(realIndex);
				});
				setLibLoaded(true);
				setSwiperReady(true);
				const initialIndex = untrack(mobile.index);
				if (initialIndex >= 0) {
					changeSlide(initialIndex);
					lastIndex = initialIndex;
				}
			} catch (e) {
				initPromise = void 0;
				setSwiperReady(false);
				console.log(e);
			}
		})();
		await initPromise;
	};
	onMount(() => {
		window.addEventListener("touchstart", () => void ensureGalleryReady(), {
			once: true,
			passive: true
		});
		mounted = true;
	});
	createEffect(on(() => [swiperReady(), mobile.index()], ([ready, index]) => {
		if (!ready || index < 0) return;
		if (index === lastIndex) return;
		if (lastIndex === -1) navigateVector = "none";
		else if (index < lastIndex) navigateVector = "prev";
		else if (index > lastIndex) navigateVector = "next";
		else navigateVector = "none";
		changeSlide(index);
		lastIndex = index;
	}));
	createEffect(on(() => mobile.isOpen(), async (isOpen) => {
		if (isOpen && !swiperReady()) await ensureGalleryReady();
		if (!libLoaded() || !swiperReady()) return;
		if (mobile.isAnimating()) return;
		if (isOpen) slideUp();
		else slideDown();
	}, { defer: true }));
	return [(() => {
		var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
		var _ref$ = gallery;
		typeof _ref$ === "function" ? use(_ref$, _el$) : gallery = _el$;
		var _ref$2 = galleryInner;
		typeof _ref$2 === "function" ? use(_ref$2, _el$2) : galleryInner = _el$2;
		insert(_el$3, createComponent(For, {
			get each() {
				return imageState().images;
			},
			children: (ij, i) => (() => {
				var _el$5 = _tmpl$3();
				insert(_el$5, createComponent(GalleryImage, {
					get load() {
						return loads[i()];
					},
					ij,
					get loadingText() {
						return loadingText();
					}
				}));
				return _el$5;
			})()
		}));
		insert(_el$, createComponent(GalleryNav, { get closeText() {
			return props.closeText;
		} }), null);
		return _el$;
	})(), (() => {
		var _el$4 = _tmpl$2();
		var _ref$3 = curtain;
		typeof _ref$3 === "function" ? use(_ref$3, _el$4) : curtain = _el$4;
		return _el$4;
	})()];
}
//#endregion
//#region assets/ts/mobile/layout.tsx
function Mobile(props) {
	const imageState = useImageState();
	const [mobile] = useMobileState();
	createEffect(() => {
		const container = document.getElementsByClassName("container").item(0);
		if (container === null) return;
		if (mobile.isScrollLocked()) container.classList.add("disableScroll");
		else container.classList.remove("disableScroll");
	});
	onCleanup(() => {
		document.getElementsByClassName("container").item(0)?.classList.remove("disableScroll");
	});
	return createComponent(Show, {
		get when() {
			return imageState().length > 0;
		},
		get children() {
			return [createComponent(Collection, {}), createComponent(Gallery, {
				get closeText() {
					return props.closeText;
				},
				get loadingText() {
					return props.loadingText;
				}
			})];
		}
	});
}
//#endregion
export { Mobile as default };
