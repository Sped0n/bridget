import { I as onCleanup, L as onMount, g as template, j as createSignal, k as createRenderEffect, m as setStyleProperty, u as insert } from "./C3xGhw.js";
//#region assets/ts/desktop/customCursor.tsx
var _tmpl$ = /*#__PURE__*/ template(`<div class=cursor><div class=cursorInner>`);
function CustomCursor(props) {
	let controller;
	const [xy, setXy] = createSignal({
		x: 0,
		y: 0
	});
	const onMouse = (e) => {
		const { clientX, clientY } = e;
		setXy({
			x: clientX,
			y: clientY
		});
	};
	onMount(() => {
		controller = new AbortController();
		const abortSignal = controller.signal;
		window.addEventListener("mousemove", onMouse, {
			passive: true,
			signal: abortSignal
		});
	});
	onCleanup(() => {
		controller?.abort();
	});
	return (() => {
		var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
		insert(_el$2, () => props.cursorText());
		createRenderEffect((_p$) => {
			var _v$ = !!props.active(), _v$2 = `translate3d(${xy().x}px, ${xy().y}px, 0)`;
			_v$ !== _p$.e && _el$.classList.toggle("active", _p$.e = _v$);
			_v$2 !== _p$.t && setStyleProperty(_el$, "transform", _p$.t = _v$2);
			return _p$;
		}, {
			e: void 0,
			t: void 0
		});
		return _el$;
	})();
}
//#endregion
export { CustomCursor as t };
