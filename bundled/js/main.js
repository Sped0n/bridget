const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/cQ6nev.js","js/C3xGhw.js","js/DsETc2.js","js/Byk4gJ.js","js/BQ67xS.js"])))=>i.map(i=>d[i]);
import { A as createResource, C as Switch, E as createContext, N as lazy, O as createMemo, S as Show, T as createComponent, a as isMobile, c as __vitePreload, f as render, g as template, i as increment, j as createSignal, r as getThresholdSessionIndex, t as decrement, x as Match, z as useContext } from "./C3xGhw.js";
//#region node_modules/.pnpm/tiny-invariant@1.3.3/node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var isProduction = true;
var prefix = "Invariant failed";
function invariant(condition, message) {
	if (condition) return;
	if (isProduction) throw new Error(prefix);
	var provided = typeof message === "function" ? message() : message;
	var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
	throw new Error(value);
}
//#endregion
//#region assets/ts/configState.tsx
var thresholds = [
	{
		threshold: 20,
		trailLength: 20
	},
	{
		threshold: 40,
		trailLength: 10
	},
	{
		threshold: 80,
		trailLength: 5
	},
	{
		threshold: 140,
		trailLength: 5
	},
	{
		threshold: 200,
		trailLength: 5
	}
];
var ConfigStateContext = createContext();
function getSafeThresholdIndex() {
	const index = getThresholdSessionIndex();
	if (index < 0 || index >= thresholds.length) return 2;
	return index;
}
function ConfigStateProvider(props) {
	const [thresholdIndex, setThresholdIndex] = createSignal(getSafeThresholdIndex());
	const state = createMemo(() => {
		const current = thresholds[thresholdIndex()];
		return {
			thresholdIndex: thresholdIndex(),
			threshold: current.threshold,
			trailLength: current.trailLength
		};
	});
	const updateThreshold = (stride) => {
		const nextIndex = thresholdIndex() + stride;
		if (nextIndex < 0 || nextIndex >= thresholds.length) return;
		sessionStorage.setItem("thresholdsIndex", nextIndex.toString());
		setThresholdIndex(nextIndex);
	};
	return createComponent(ConfigStateContext.Provider, {
		value: [state, {
			incThreshold: () => {
				updateThreshold(1);
			},
			decThreshold: () => {
				updateThreshold(-1);
			}
		}],
		get children() {
			return props.children;
		}
	});
}
function useConfigState() {
	const context = useContext(ConfigStateContext);
	invariant(context, "undefined config context");
	return context;
}
//#endregion
//#region assets/ts/imageState.tsx
var ImageStateContext = createContext();
function ImageStateProvider(props) {
	const state = createMemo(() => ({
		images: props.images,
		length: props.images.length
	}));
	return createComponent(ImageStateContext.Provider, {
		value: state,
		get children() {
			return props.children;
		}
	});
}
function useImageState() {
	const context = useContext(ImageStateContext);
	invariant(context, "undefined image context");
	return context;
}
//#endregion
//#region assets/ts/desktop/state.ts
var DesktopStateContext = createContext();
function DesktopStateProvider(props) {
	const imageState = useImageState();
	const [index, setIndex] = createSignal(-1);
	const [cordHist, setCordHist] = createSignal([]);
	const [hoverText, setHoverText] = createSignal("");
	const [isOpen, setIsOpen] = createSignal(false);
	const [isAnimating, setIsAnimating] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(false);
	const [navVector, setNavVector] = createSignal("none");
	const updateIndex = (stride) => {
		const length = imageState().length;
		if (length <= 0) return;
		setIndex((current) => stride === 1 ? increment(current, length) : decrement(current, length));
	};
	return createComponent(DesktopStateContext.Provider, {
		value: [{
			index,
			cordHist,
			hoverText,
			isOpen,
			isAnimating,
			isLoading,
			navVector
		}, {
			setIndex,
			incIndex: () => {
				updateIndex(1);
			},
			decIndex: () => {
				updateIndex(-1);
			},
			setCordHist,
			setHoverText,
			setIsOpen,
			setIsAnimating,
			setIsLoading,
			setNavVector
		}],
		get children() {
			return props.children;
		}
	});
}
function useDesktopState() {
	const context = useContext(DesktopStateContext);
	invariant(context, "undefined desktop context");
	return context;
}
//#endregion
//#region assets/ts/mobile/state.ts
var MobileStateContext = createContext();
function MobileStateProvider(props) {
	const imageState = useImageState();
	const [index, setIndex] = createSignal(-1);
	const [isOpen, setIsOpen] = createSignal(false);
	const [isAnimating, setIsAnimating] = createSignal(false);
	const [isScrollLocked, setIsScrollLocked] = createSignal(false);
	const updateIndex = (stride) => {
		const length = imageState().length;
		if (length <= 0) return;
		setIndex((current) => stride === 1 ? increment(current, length) : decrement(current, length));
	};
	return createComponent(MobileStateContext.Provider, {
		value: [{
			index,
			isOpen,
			isAnimating,
			isScrollLocked
		}, {
			setIndex,
			incIndex: () => {
				updateIndex(1);
			},
			decIndex: () => {
				updateIndex(-1);
			},
			setIsOpen,
			setIsAnimating,
			setIsScrollLocked
		}],
		get children() {
			return props.children;
		}
	});
}
function useMobileState() {
	const context = useContext(MobileStateContext);
	invariant(context, "undefined mobile context");
	return context;
}
//#endregion
//#region assets/ts/resources.ts
async function getImageJSON() {
	if (document.title.split(" | ")[0] === "404") return [];
	const ogUrlMetaTag = document.querySelector("meta[property=\"og:url\"]");
	const indexJsonUrl = ogUrlMetaTag?.content ? new URL("index.json", ogUrlMetaTag.content).href : new URL("index.json", window.location.href).href;
	try {
		return (await (await fetch(indexJsonUrl, { headers: { Accept: "application/json" } })).json()).sort((a, b) => {
			if (a.index < b.index) return -1;
			return 1;
		});
	} catch (e) {
		console.error(e);
		return [];
	}
}
//#endregion
//#region assets/ts/main.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div>Error`);
document.addEventListener("contextmenu", (e) => e.preventDefault());
var container = document.getElementsByClassName("container")[0];
var Desktop = lazy(async () => await __vitePreload(() => import("./cQ6nev.js"), __vite__mapDeps([0,1,2])));
var Mobile = lazy(async () => await __vitePreload(() => import("./Byk4gJ.js"), __vite__mapDeps([3,1])));
function AppContent(props) {
	return createComponent(Switch, {
		get fallback() {
			return _tmpl$();
		},
		get children() {
			return [createComponent(Match, {
				get when() {
					return props.isMobile;
				},
				get children() {
					return createComponent(MobileStateProvider, { get children() {
						return createComponent(Mobile, {
							get closeText() {
								return props.closeText;
							},
							get loadingText() {
								return props.loadingText;
							}
						});
					} });
				}
			}), createComponent(Match, {
				get when() {
					return !props.isMobile;
				},
				get children() {
					return createComponent(DesktopStateProvider, { get children() {
						return createComponent(Desktop, {
							get prevText() {
								return props.prevText;
							},
							get closeText() {
								return props.closeText;
							},
							get nextText() {
								return props.nextText;
							},
							get loadingText() {
								return props.loadingText;
							}
						});
					} });
				}
			})];
		}
	});
}
function Main() {
	const [ijs] = createResource(getImageJSON);
	return createComponent(Show, {
		get when() {
			return ijs.state === "ready";
		},
		get children() {
			return createComponent(ImageStateProvider, {
				get images() {
					return ijs() ?? [];
				},
				get children() {
					return createComponent(ConfigStateProvider, { get children() {
						return createComponent(AppContent, {
							get isMobile() {
								return isMobile();
							},
							get prevText() {
								return container.dataset.prev;
							},
							get closeText() {
								return container.dataset.close;
							},
							get nextText() {
								return container.dataset.next;
							},
							get loadingText() {
								return container.dataset.loading;
							}
						});
					} });
				}
			});
		}
	});
}
var page = container?.dataset.page;
if (page === "post") __vitePreload(() => import("./BQ67xS.js").then((m) => {
	m.initPost();
}), __vite__mapDeps([4,1,2]));
else if (page === "postlist") {
	if (!isMobile()) __vitePreload(() => import("./biROAg.js").then((m) => {
		m.initPostList();
	}), []);
} else render(() => createComponent(Main, {}), container);
//#endregion
export { invariant as a, useConfigState as i, useDesktopState as n, useImageState as r, useMobileState as t };
