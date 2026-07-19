//#region assets/ts/postList.ts
/**
* Desktop-only enhancement for the scattered post index.
* Tiles are fully server-rendered (up to 4 frames, one per corner); on hover
* we riffle through a post's frames
* and hop its title from corner to corner in sync with the frames.
* Mobile is a static column and never loads this module.
*/
var FRAME_MS = 420;
var TITLE_SLOTS = 4;
function reducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function setupTile(tile) {
	const frames = Array.from(tile.querySelectorAll(".tileFrame"));
	const title = tile.querySelector(".tileTitle");
	if (frames.length === 0 || title == null) return;
	let timer;
	let idx = 0;
	const show = (next) => {
		frames[idx]?.classList.remove("active");
		idx = next % frames.length;
		frames[idx]?.classList.add("active");
		title.dataset.slot = String(idx % TITLE_SLOTS);
	};
	const start = () => {
		frames.forEach((f) => {
			const src = f.dataset.src;
			if (src !== void 0 && f.getAttribute("src") === null) f.src = src;
		});
		tile.classList.add("hovered");
		if (frames.length < 2 || reducedMotion()) return;
		timer = window.setInterval(() => {
			show(idx + 1);
		}, FRAME_MS);
	};
	const stop = () => {
		if (timer !== void 0) {
			clearInterval(timer);
			timer = void 0;
		}
		show(0);
		tile.classList.remove("hovered");
	};
	frames[0].classList.add("active");
	tile.addEventListener("pointerenter", start);
	tile.addEventListener("pointerleave", stop);
}
function initPostList() {
	Array.from(document.querySelectorAll(".tile")).forEach(setupTile);
}
//#endregion
export { initPostList };
