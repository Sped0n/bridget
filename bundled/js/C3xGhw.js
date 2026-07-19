//#region node_modules/.pnpm/solid-js@1.9.13/node_modules/solid-js/dist/solid.js
var sharedConfig = {
	context: void 0,
	registry: void 0,
	effects: void 0,
	done: false,
	getContextId() {
		return getContextId(this.context.count);
	},
	getNextContextId() {
		return getContextId(this.context.count++);
	}
};
function getContextId(count) {
	const num = String(count), len = num.length - 1;
	return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
function setHydrateContext(context) {
	sharedConfig.context = context;
}
function nextHydrateContext() {
	return {
		...sharedConfig.context,
		id: sharedConfig.getNextContextId(),
		count: 0
	};
}
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var SUPPORTS_PROXY = typeof Proxy === "function";
var $TRACK = Symbol("solid-track");
var signalOptions = { equals: equalFn };
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
	owned: null,
	cleanups: null,
	context: null,
	owner: null
};
var NO_INIT = {};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
function createRoot(fn, detachedOwner) {
	const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
		owned: null,
		cleanups: null,
		context: current ? current.context : null,
		owner: current
	}, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
	Owner = root;
	Listener = null;
	try {
		return runUpdates(updateFn, true);
	} finally {
		Listener = listener;
		Owner = owner;
	}
}
function createSignal(value, options) {
	options = options ? Object.assign({}, signalOptions, options) : signalOptions;
	const s = {
		value,
		observers: null,
		observerSlots: null,
		comparator: options.equals || void 0
	};
	const setter = (value) => {
		if (typeof value === "function") if (Transition && Transition.running && Transition.sources.has(s)) value = value(s.tValue);
		else value = value(s.value);
		return writeSignal(s, value);
	};
	return [readSignal.bind(s), setter];
}
function createComputed(fn, value, options) {
	const c = createComputation(fn, value, true, STALE);
	if (Scheduler && Transition && Transition.running) Updates.push(c);
	else updateComputation(c);
}
function createRenderEffect(fn, value, options) {
	const c = createComputation(fn, value, false, STALE);
	if (Scheduler && Transition && Transition.running) Updates.push(c);
	else updateComputation(c);
}
function createEffect(fn, value, options) {
	runEffects = runUserEffects;
	const c = createComputation(fn, value, false, STALE), s = SuspenseContext && useContext(SuspenseContext);
	if (s) c.suspense = s;
	if (!options || !options.render) c.user = true;
	Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
	options = options ? Object.assign({}, signalOptions, options) : signalOptions;
	const c = createComputation(fn, value, true, 0);
	c.observers = null;
	c.observerSlots = null;
	c.comparator = options.equals || void 0;
	if (Scheduler && Transition && Transition.running) {
		c.tState = STALE;
		Updates.push(c);
	} else updateComputation(c);
	return readSignal.bind(c);
}
function isPromise(v) {
	return v && typeof v === "object" && "then" in v;
}
function createResource(pSource, pFetcher, pOptions) {
	let source;
	let fetcher;
	let options;
	if (typeof pFetcher === "function") {
		source = pSource;
		fetcher = pFetcher;
		options = pOptions || {};
	} else {
		source = true;
		fetcher = pSource;
		options = pFetcher || {};
	}
	let pr = null, initP = NO_INIT, id = null, loadedUnderTransition = false, scheduled = false, resolved = "initialValue" in options, dynamic = typeof source === "function" && createMemo(source);
	const contexts = /* @__PURE__ */ new Set(), [value, setValue] = (options.storage || createSignal)(options.initialValue), [error, setError] = createSignal(void 0), [track, trigger] = createSignal(void 0, { equals: false }), [state, setState] = createSignal(resolved ? "ready" : "unresolved");
	if (sharedConfig.context) {
		id = sharedConfig.getNextContextId();
		if (options.ssrLoadFrom === "initial") initP = options.initialValue;
		else if (sharedConfig.load && sharedConfig.has(id)) initP = sharedConfig.load(id);
	}
	function loadEnd(p, v, error, key) {
		if (pr === p) {
			pr = null;
			key !== void 0 && (resolved = true);
			if ((p === initP || v === initP) && options.onHydrated) queueMicrotask(() => options.onHydrated(key, { value: v }));
			initP = NO_INIT;
			if (Transition && p && loadedUnderTransition) {
				Transition.promises.delete(p);
				loadedUnderTransition = false;
				runUpdates(() => {
					Transition.running = true;
					completeLoad(v, error);
				}, false);
			} else completeLoad(v, error);
		}
		return v;
	}
	function completeLoad(v, err) {
		runUpdates(() => {
			if (err === void 0) setValue(() => v);
			setState(err !== void 0 ? "errored" : resolved ? "ready" : "unresolved");
			setError(err);
			for (const c of contexts.keys()) c.decrement();
			contexts.clear();
		}, false);
	}
	function read() {
		const c = SuspenseContext && useContext(SuspenseContext), v = value(), err = error();
		if (err !== void 0 && !pr) throw err;
		if (Listener && !Listener.user && c) createComputed(() => {
			track();
			if (pr) {
				if (c.resolved && Transition && loadedUnderTransition) Transition.promises.add(pr);
				else if (!contexts.has(c)) {
					c.increment();
					contexts.add(c);
				}
			}
		});
		return v;
	}
	function load(refetching = true) {
		if (refetching !== false && scheduled) return;
		scheduled = false;
		const lookup = dynamic ? dynamic() : source;
		loadedUnderTransition = Transition && Transition.running;
		if (lookup == null || lookup === false) {
			loadEnd(pr, untrack(value));
			return;
		}
		if (Transition && pr) Transition.promises.delete(pr);
		let error;
		const p = initP !== NO_INIT ? initP : untrack(() => {
			try {
				return fetcher(lookup, {
					value: value(),
					refetching
				});
			} catch (fetcherError) {
				error = fetcherError;
			}
		});
		if (error !== void 0) {
			loadEnd(pr, void 0, castError(error), lookup);
			return;
		} else if (!isPromise(p)) {
			loadEnd(pr, p, void 0, lookup);
			return p;
		}
		pr = p;
		if ("v" in p) {
			if (p.s === 1) loadEnd(pr, p.v, void 0, lookup);
			else loadEnd(pr, void 0, castError(p.v), lookup);
			return p;
		}
		scheduled = true;
		queueMicrotask(() => scheduled = false);
		runUpdates(() => {
			setState(resolved ? "refreshing" : "pending");
			trigger();
		}, false);
		return p.then((v) => loadEnd(p, v, void 0, lookup), (e) => loadEnd(p, void 0, castError(e), lookup));
	}
	Object.defineProperties(read, {
		state: { get: () => state() },
		error: { get: () => error() },
		loading: { get() {
			const s = state();
			return s === "pending" || s === "refreshing";
		} },
		latest: { get() {
			if (!resolved) return read();
			const err = error();
			if (err && !pr) throw err;
			return value();
		} }
	});
	let owner = Owner;
	if (dynamic) createComputed(() => (owner = Owner, load(false)));
	else load(false);
	return [read, {
		refetch: (info) => runWithOwner(owner, () => load(info)),
		mutate: setValue
	}];
}
function batch(fn) {
	return runUpdates(fn, false);
}
function untrack(fn) {
	if (!ExternalSourceConfig && Listener === null) return fn();
	const listener = Listener;
	Listener = null;
	try {
		if (ExternalSourceConfig) return ExternalSourceConfig.untrack(fn);
		return fn();
	} finally {
		Listener = listener;
	}
}
function on(deps, fn, options) {
	const isArray = Array.isArray(deps);
	let prevInput;
	let defer = options && options.defer;
	return (prevValue) => {
		let input;
		if (isArray) {
			input = Array(deps.length);
			for (let i = 0; i < deps.length; i++) input[i] = deps[i]();
		} else input = deps();
		if (defer) {
			defer = false;
			return prevValue;
		}
		const result = untrack(() => fn(input, prevInput, prevValue));
		prevInput = input;
		return result;
	};
}
function onMount(fn) {
	createEffect(() => untrack(fn));
}
function onCleanup(fn) {
	if (Owner === null);
	else if (Owner.cleanups === null) Owner.cleanups = [fn];
	else Owner.cleanups.push(fn);
	return fn;
}
function getListener() {
	return Listener;
}
function runWithOwner(o, fn) {
	const prev = Owner;
	const prevListener = Listener;
	Owner = o;
	Listener = null;
	try {
		return runUpdates(fn, true);
	} catch (err) {
		handleError(err);
	} finally {
		Owner = prev;
		Listener = prevListener;
	}
}
function startTransition(fn) {
	if (Transition && Transition.running) {
		fn();
		return Transition.done;
	}
	const l = Listener;
	const o = Owner;
	return Promise.resolve().then(() => {
		Listener = l;
		Owner = o;
		let t;
		if (Scheduler || SuspenseContext) {
			t = Transition || (Transition = {
				sources: /* @__PURE__ */ new Set(),
				effects: [],
				promises: /* @__PURE__ */ new Set(),
				disposed: /* @__PURE__ */ new Set(),
				queue: /* @__PURE__ */ new Set(),
				running: true
			});
			t.done || (t.done = new Promise((res) => t.resolve = res));
			t.running = true;
		}
		runUpdates(fn, false);
		Listener = Owner = null;
		return t ? t.done : void 0;
	});
}
var [transPending, setTransPending] = /*@__PURE__*/ createSignal(false);
function createContext(defaultValue, options) {
	const id = Symbol("context");
	return {
		id,
		Provider: createProvider(id),
		defaultValue
	};
}
function useContext(context) {
	let value;
	return Owner && Owner.context && (value = Owner.context[context.id]) !== void 0 ? value : context.defaultValue;
}
function children(fn) {
	const children = createMemo(fn);
	const memo = createMemo(() => resolveChildren(children()));
	memo.toArray = () => {
		const c = memo();
		return Array.isArray(c) ? c : c != null ? [c] : [];
	};
	return memo;
}
var SuspenseContext;
function readSignal() {
	const runningTransition = Transition && Transition.running;
	if (this.sources && (runningTransition ? this.tState : this.state)) if ((runningTransition ? this.tState : this.state) === STALE) updateComputation(this);
	else {
		const updates = Updates;
		Updates = null;
		runUpdates(() => lookUpstream(this), false);
		Updates = updates;
	}
	if (Listener) {
		const observers = this.observers;
		if (!observers || observers[observers.length - 1] !== Listener) {
			const sSlot = observers ? observers.length : 0;
			if (!Listener.sources) {
				Listener.sources = [this];
				Listener.sourceSlots = [sSlot];
			} else {
				Listener.sources.push(this);
				Listener.sourceSlots.push(sSlot);
			}
			if (!observers) {
				this.observers = [Listener];
				this.observerSlots = [Listener.sources.length - 1];
			} else {
				observers.push(Listener);
				this.observerSlots.push(Listener.sources.length - 1);
			}
		}
	}
	if (runningTransition && Transition.sources.has(this)) return this.tValue;
	return this.value;
}
function writeSignal(node, value, isComp) {
	let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
	if (!node.comparator || !node.comparator(current, value)) {
		if (Transition) {
			const TransitionRunning = Transition.running;
			if (TransitionRunning || !isComp && Transition.sources.has(node)) {
				Transition.sources.add(node);
				node.tValue = value;
			}
			if (!TransitionRunning) node.value = value;
		} else node.value = value;
		if (node.observers && node.observers.length) runUpdates(() => {
			for (let i = 0; i < node.observers.length; i += 1) {
				const o = node.observers[i];
				const TransitionRunning = Transition && Transition.running;
				if (TransitionRunning && Transition.disposed.has(o)) continue;
				if (TransitionRunning ? !o.tState : !o.state) {
					if (o.pure) Updates.push(o);
					else Effects.push(o);
					if (o.observers) markDownstream(o);
				}
				if (!TransitionRunning) o.state = STALE;
				else o.tState = STALE;
			}
			if (Updates.length > 1e6) {
				Updates = [];
				throw new Error();
			}
		}, false);
	}
	return value;
}
function updateComputation(node) {
	if (!node.fn) return;
	cleanNode(node);
	const time = ExecCount;
	runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
	if (Transition && !Transition.running && Transition.sources.has(node)) queueMicrotask(() => {
		runUpdates(() => {
			Transition && (Transition.running = true);
			Listener = Owner = node;
			runComputation(node, node.tValue, time);
			Listener = Owner = null;
		}, false);
	});
}
function runComputation(node, value, time) {
	let nextValue;
	const owner = Owner, listener = Listener;
	Listener = Owner = node;
	try {
		nextValue = node.fn(value);
	} catch (err) {
		if (node.pure) if (Transition && Transition.running) {
			node.tState = STALE;
			node.tOwned && node.tOwned.forEach(cleanNode);
			node.tOwned = void 0;
		} else {
			node.state = STALE;
			node.owned && node.owned.forEach(cleanNode);
			node.owned = null;
		}
		node.updatedAt = time + 1;
		return handleError(err);
	} finally {
		Listener = listener;
		Owner = owner;
	}
	if (!node.updatedAt || node.updatedAt <= time) {
		if (node.updatedAt != null && "observers" in node) writeSignal(node, nextValue, true);
		else if (Transition && Transition.running && node.pure) {
			if (!Transition.sources.has(node)) node.value = nextValue;
			Transition.sources.add(node);
			node.tValue = nextValue;
		} else node.value = nextValue;
		node.updatedAt = time;
	}
}
function createComputation(fn, init, pure, state = STALE, options) {
	const c = {
		fn,
		state,
		updatedAt: null,
		owned: null,
		sources: null,
		sourceSlots: null,
		cleanups: null,
		value: init,
		owner: Owner,
		context: Owner ? Owner.context : null,
		pure
	};
	if (Transition && Transition.running) {
		c.state = 0;
		c.tState = state;
	}
	if (Owner === null);
	else if (Owner !== UNOWNED) if (Transition && Transition.running && Owner.pure) if (!Owner.tOwned) Owner.tOwned = [c];
	else Owner.tOwned.push(c);
	else if (!Owner.owned) Owner.owned = [c];
	else Owner.owned.push(c);
	if (ExternalSourceConfig && c.fn) {
		const sourceFn = c.fn;
		const [track, trigger] = createSignal(void 0, { equals: false });
		const ordinary = ExternalSourceConfig.factory(sourceFn, trigger);
		onCleanup(() => ordinary.dispose());
		let inTransition;
		const triggerInTransition = () => startTransition(trigger).then(() => {
			if (inTransition) {
				inTransition.dispose();
				inTransition = void 0;
			}
		});
		c.fn = (x) => {
			track();
			if (Transition && Transition.running) {
				if (!inTransition) inTransition = ExternalSourceConfig.factory(sourceFn, triggerInTransition);
				return inTransition.track(x);
			}
			return ordinary.track(x);
		};
	}
	return c;
}
function runTop(node) {
	const runningTransition = Transition && Transition.running;
	if ((runningTransition ? node.tState : node.state) === 0) return;
	if ((runningTransition ? node.tState : node.state) === PENDING) return lookUpstream(node);
	if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
	const ancestors = [node];
	while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
		if (runningTransition && Transition.disposed.has(node)) return;
		if (runningTransition ? node.tState : node.state) ancestors.push(node);
	}
	for (let i = ancestors.length - 1; i >= 0; i--) {
		node = ancestors[i];
		if (runningTransition) {
			let top = node, prev = ancestors[i + 1];
			while ((top = top.owner) && top !== prev) if (Transition.disposed.has(top)) return;
		}
		if ((runningTransition ? node.tState : node.state) === STALE) updateComputation(node);
		else if ((runningTransition ? node.tState : node.state) === PENDING) {
			const updates = Updates;
			Updates = null;
			runUpdates(() => lookUpstream(node, ancestors[0]), false);
			Updates = updates;
		}
	}
}
function runUpdates(fn, init) {
	if (Updates) return fn();
	let wait = false;
	if (!init) Updates = [];
	if (Effects) wait = true;
	else Effects = [];
	ExecCount++;
	try {
		const res = fn();
		completeUpdates(wait);
		return res;
	} catch (err) {
		if (!wait) Effects = null;
		Updates = null;
		handleError(err);
	}
}
function completeUpdates(wait) {
	if (Updates) {
		if (Scheduler && Transition && Transition.running) scheduleQueue(Updates);
		else runQueue(Updates);
		Updates = null;
	}
	if (wait) return;
	let res;
	if (Transition) {
		if (!Transition.promises.size && !Transition.queue.size) {
			const sources = Transition.sources;
			const disposed = Transition.disposed;
			Effects.push.apply(Effects, Transition.effects);
			res = Transition.resolve;
			for (const e of Effects) {
				"tState" in e && (e.state = e.tState);
				delete e.tState;
			}
			Transition = null;
			runUpdates(() => {
				for (const d of disposed) cleanNode(d);
				for (const v of sources) {
					v.value = v.tValue;
					if (v.owned) for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
					if (v.tOwned) v.owned = v.tOwned;
					delete v.tValue;
					delete v.tOwned;
					v.tState = 0;
				}
				setTransPending(false);
			}, false);
		} else if (Transition.running) {
			Transition.running = false;
			Transition.effects.push.apply(Transition.effects, Effects);
			Effects = null;
			setTransPending(true);
			return;
		}
	}
	const e = Effects;
	Effects = null;
	if (e.length) runUpdates(() => runEffects(e), false);
	if (res) res();
}
function runQueue(queue) {
	for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function scheduleQueue(queue) {
	for (let i = 0; i < queue.length; i++) {
		const item = queue[i];
		const tasks = Transition.queue;
		if (!tasks.has(item)) {
			tasks.add(item);
			Scheduler(() => {
				tasks.delete(item);
				runUpdates(() => {
					Transition.running = true;
					runTop(item);
				}, false);
				Transition && (Transition.running = false);
			});
		}
	}
}
function runUserEffects(queue) {
	let i, userLength = 0;
	for (i = 0; i < queue.length; i++) {
		const e = queue[i];
		if (!e.user) runTop(e);
		else queue[userLength++] = e;
	}
	if (sharedConfig.context) {
		if (sharedConfig.count) {
			sharedConfig.effects || (sharedConfig.effects = []);
			sharedConfig.effects.push(...queue.slice(0, userLength));
			return;
		}
		setHydrateContext();
	}
	if (sharedConfig.effects && (sharedConfig.done || !sharedConfig.count)) {
		queue = [...sharedConfig.effects, ...queue];
		userLength += sharedConfig.effects.length;
		delete sharedConfig.effects;
	}
	for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
	const runningTransition = Transition && Transition.running;
	if (runningTransition) node.tState = 0;
	else node.state = 0;
	for (let i = 0; i < node.sources.length; i += 1) {
		const source = node.sources[i];
		if (source.sources) {
			const state = runningTransition ? source.tState : source.state;
			if (state === STALE) {
				if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
			} else if (state === PENDING) lookUpstream(source, ignore);
		}
	}
}
function markDownstream(node) {
	const runningTransition = Transition && Transition.running;
	for (let i = 0; i < node.observers.length; i += 1) {
		const o = node.observers[i];
		if (runningTransition ? !o.tState : !o.state) {
			if (runningTransition) o.tState = PENDING;
			else o.state = PENDING;
			if (o.pure) Updates.push(o);
			else Effects.push(o);
			o.observers && markDownstream(o);
		}
	}
}
function cleanNode(node) {
	let i;
	if (node.sources) while (node.sources.length) {
		const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
		if (obs && obs.length) {
			const n = obs.pop(), s = source.observerSlots.pop();
			if (index < obs.length) {
				n.sourceSlots[s] = index;
				obs[index] = n;
				source.observerSlots[index] = s;
			}
		}
	}
	if (node.tOwned) {
		for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
		delete node.tOwned;
	}
	if (Transition && Transition.running && node.pure) reset(node, true);
	else if (node.owned) {
		for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
		node.owned = null;
	}
	if (node.cleanups) {
		for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
		node.cleanups = null;
	}
	if (Transition && Transition.running) node.tState = 0;
	else node.state = 0;
}
function reset(node, top) {
	if (!top) {
		node.tState = 0;
		Transition.disposed.add(node);
	}
	if (node.owned) for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
}
function castError(err) {
	if (err instanceof Error) return err;
	return new Error(typeof err === "string" ? err : "Unknown error", { cause: err });
}
function runErrors(err, fns, owner) {
	try {
		for (const f of fns) f(err);
	} catch (e) {
		handleError(e, owner && owner.owner || null);
	}
}
function handleError(err, owner = Owner) {
	const fns = ERROR && owner && owner.context && owner.context[ERROR];
	const error = castError(err);
	if (!fns) throw error;
	if (Effects) Effects.push({
		fn() {
			runErrors(error, fns, owner);
		},
		state: STALE
	});
	else runErrors(error, fns, owner);
}
function resolveChildren(children) {
	if (typeof children === "function" && !children.length) return resolveChildren(children());
	if (Array.isArray(children)) {
		const results = [];
		for (let i = 0; i < children.length; i++) {
			const result = resolveChildren(children[i]);
			if (Array.isArray(result)) if (result.length < 32768) results.push.apply(results, result);
			else for (let j = 0; j < result.length; j++) results.push(result[j]);
			else results.push(result);
		}
		return results;
	}
	return children;
}
function createProvider(id, options) {
	return function provider(props) {
		let res;
		createRenderEffect(() => res = untrack(() => {
			Owner.context = {
				...Owner.context,
				[id]: props.value
			};
			return children(() => props.children);
		}), void 0);
		return res;
	};
}
var FALLBACK = Symbol("fallback");
function dispose(d) {
	for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
	let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
	onCleanup(() => dispose(disposers));
	return () => {
		let newItems = list() || [], newLen = newItems.length, i, j;
		newItems[$TRACK];
		return untrack(() => {
			let newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
			if (newLen === 0) {
				if (len !== 0) {
					dispose(disposers);
					disposers = [];
					items = [];
					mapped = [];
					len = 0;
					indexes && (indexes = []);
				}
				if (options.fallback) {
					items = [FALLBACK];
					mapped[0] = createRoot((disposer) => {
						disposers[0] = disposer;
						return options.fallback();
					});
					len = 1;
				}
			} else if (len === 0) {
				mapped = new Array(newLen);
				for (j = 0; j < newLen; j++) {
					items[j] = newItems[j];
					mapped[j] = createRoot(mapper);
				}
				len = newLen;
			} else {
				temp = new Array(newLen);
				tempdisposers = new Array(newLen);
				indexes && (tempIndexes = new Array(newLen));
				for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
				for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
					temp[newEnd] = mapped[end];
					tempdisposers[newEnd] = disposers[end];
					indexes && (tempIndexes[newEnd] = indexes[end]);
				}
				newIndices = /* @__PURE__ */ new Map();
				newIndicesNext = new Array(newEnd + 1);
				for (j = newEnd; j >= start; j--) {
					item = newItems[j];
					i = newIndices.get(item);
					newIndicesNext[j] = i === void 0 ? -1 : i;
					newIndices.set(item, j);
				}
				for (i = start; i <= end; i++) {
					item = items[i];
					j = newIndices.get(item);
					if (j !== void 0 && j !== -1) {
						temp[j] = mapped[i];
						tempdisposers[j] = disposers[i];
						indexes && (tempIndexes[j] = indexes[i]);
						j = newIndicesNext[j];
						newIndices.set(item, j);
					} else disposers[i]();
				}
				for (j = start; j < newLen; j++) if (j in temp) {
					mapped[j] = temp[j];
					disposers[j] = tempdisposers[j];
					if (indexes) {
						indexes[j] = tempIndexes[j];
						indexes[j](j);
					}
				} else mapped[j] = createRoot(mapper);
				mapped = mapped.slice(0, len = newLen);
				items = newItems.slice(0);
			}
			return mapped;
		});
		function mapper(disposer) {
			disposers[j] = disposer;
			if (indexes) {
				const [s, set] = createSignal(j);
				indexes[j] = set;
				return mapFn(newItems[j], s);
			}
			return mapFn(newItems[j]);
		}
	};
}
var hydrationEnabled = false;
function createComponent(Comp, props) {
	if (hydrationEnabled) {
		if (sharedConfig.context) {
			const c = sharedConfig.context;
			setHydrateContext(nextHydrateContext());
			const r = untrack(() => Comp(props || {}));
			setHydrateContext(c);
			return r;
		}
	}
	return untrack(() => Comp(props || {}));
}
function trueFn() {
	return true;
}
var propTraps = {
	get(_, property, receiver) {
		if (property === $PROXY) return receiver;
		return _.get(property);
	},
	has(_, property) {
		if (property === $PROXY) return true;
		return _.has(property);
	},
	set: trueFn,
	deleteProperty: trueFn,
	getOwnPropertyDescriptor(_, property) {
		return {
			configurable: true,
			enumerable: true,
			get() {
				return _.get(property);
			},
			set: trueFn,
			deleteProperty: trueFn
		};
	},
	ownKeys(_) {
		return _.keys();
	}
};
function resolveSource(s) {
	return !(s = typeof s === "function" ? s() : s) ? {} : s;
}
function resolveSources() {
	for (let i = 0, length = this.length; i < length; ++i) {
		const v = this[i]();
		if (v !== void 0) return v;
	}
}
function mergeProps(...sources) {
	let proxy = false;
	for (let i = 0; i < sources.length; i++) {
		const s = sources[i];
		proxy = proxy || !!s && $PROXY in s;
		sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
	}
	if (SUPPORTS_PROXY && proxy) return new Proxy({
		get(property) {
			for (let i = sources.length - 1; i >= 0; i--) {
				const v = resolveSource(sources[i])[property];
				if (v !== void 0) return v;
			}
		},
		has(property) {
			for (let i = sources.length - 1; i >= 0; i--) if (property in resolveSource(sources[i])) return true;
			return false;
		},
		keys() {
			const keys = [];
			for (let i = 0; i < sources.length; i++) keys.push(...Object.keys(resolveSource(sources[i])));
			return [...new Set(keys)];
		}
	}, propTraps);
	const sourcesMap = {};
	const defined = Object.create(null);
	for (let i = sources.length - 1; i >= 0; i--) {
		const source = sources[i];
		if (!source) continue;
		const sourceKeys = Object.getOwnPropertyNames(source);
		for (let i = sourceKeys.length - 1; i >= 0; i--) {
			const key = sourceKeys[i];
			if (key === "__proto__" || key === "constructor") continue;
			const desc = Object.getOwnPropertyDescriptor(source, key);
			if (!defined[key]) defined[key] = desc.get ? {
				enumerable: true,
				configurable: true,
				get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
			} : desc.value !== void 0 ? desc : void 0;
			else {
				const sources = sourcesMap[key];
				if (sources) {
					if (desc.get) sources.push(desc.get.bind(source));
					else if (desc.value !== void 0) sources.push(() => desc.value);
				}
			}
		}
	}
	const target = {};
	const definedKeys = Object.keys(defined);
	for (let i = definedKeys.length - 1; i >= 0; i--) {
		const key = definedKeys[i], desc = defined[key];
		if (desc && desc.get) Object.defineProperty(target, key, desc);
		else target[key] = desc ? desc.value : void 0;
	}
	return target;
}
function lazy(fn) {
	let comp;
	let p;
	const wrap = (props) => {
		const ctx = sharedConfig.context;
		if (ctx) {
			const [s, set] = createSignal();
			sharedConfig.count || (sharedConfig.count = 0);
			sharedConfig.count++;
			(p || (p = fn())).then((mod) => {
				!sharedConfig.done && setHydrateContext(ctx);
				sharedConfig.count--;
				set(() => mod.default);
				setHydrateContext();
			});
			comp = s;
		} else if (!comp) {
			const [s] = createResource(() => (p || (p = fn())).then((mod) => mod.default));
			comp = s;
		}
		let Comp;
		return createMemo(() => (Comp = comp()) ? untrack(() => {
			if (!ctx || sharedConfig.done) return Comp(props);
			const c = sharedConfig.context;
			setHydrateContext(ctx);
			const r = Comp(props);
			setHydrateContext(c);
			return r;
		}) : "");
	};
	wrap.preload = () => p || ((p = fn()).then((mod) => comp = () => mod.default), p);
	return wrap;
}
var narrowedError = (name) => `Stale read from <${name}>.`;
function For(props) {
	const fallback = "fallback" in props && { fallback: () => props.fallback };
	return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
}
function Show(props) {
	const keyed = props.keyed;
	const conditionValue = createMemo(() => props.when, void 0, void 0);
	const condition = keyed ? conditionValue : createMemo(conditionValue, void 0, { equals: (a, b) => !a === !b });
	return createMemo(() => {
		const c = condition();
		if (c) {
			const child = props.children;
			return typeof child === "function" && child.length > 0 ? untrack(() => child(keyed ? c : () => {
				if (!untrack(condition)) throw narrowedError("Show");
				return conditionValue();
			})) : child;
		}
		return props.fallback;
	}, void 0, void 0);
}
function Switch(props) {
	const chs = children(() => props.children);
	const switchFunc = createMemo(() => {
		const ch = chs();
		const mps = Array.isArray(ch) ? ch : [ch];
		let func = () => void 0;
		for (let i = 0; i < mps.length; i++) {
			const index = i;
			const mp = mps[i];
			const prevFunc = func;
			const conditionValue = createMemo(() => prevFunc() ? void 0 : mp.when, void 0, void 0);
			const condition = mp.keyed ? conditionValue : createMemo(conditionValue, void 0, { equals: (a, b) => !a === !b });
			func = () => prevFunc() || (condition() ? [
				index,
				conditionValue,
				mp
			] : void 0);
		}
		return func;
	});
	return createMemo(() => {
		const sel = switchFunc()();
		if (!sel) return props.fallback;
		const [index, conditionValue, mp] = sel;
		const child = mp.children;
		return typeof child === "function" && child.length > 0 ? untrack(() => child(mp.keyed ? conditionValue() : () => {
			if (untrack(switchFunc)()?.[0] !== index) throw narrowedError("Match");
			return conditionValue();
		})) : child;
	}, void 0, void 0);
}
function Match(props) {
	return props;
}
//#endregion
//#region node_modules/.pnpm/solid-js@1.9.13/node_modules/solid-js/web/dist/web.js
var Properties = /*#__PURE__*/ new Set([
	"className",
	"value",
	"readOnly",
	"noValidate",
	"formNoValidate",
	"isMap",
	"noModule",
	"playsInline",
	"adAuctionHeaders",
	"allowFullscreen",
	"browsingTopics",
	"defaultChecked",
	"defaultMuted",
	"defaultSelected",
	"disablePictureInPicture",
	"disableRemotePlayback",
	"preservesPitch",
	"shadowRootClonable",
	"shadowRootCustomElementRegistry",
	"shadowRootDelegatesFocus",
	"shadowRootSerializable",
	"sharedStorageWritable",
	...[
		"allowfullscreen",
		"async",
		"alpha",
		"autofocus",
		"autoplay",
		"checked",
		"controls",
		"default",
		"disabled",
		"formnovalidate",
		"hidden",
		"indeterminate",
		"inert",
		"ismap",
		"loop",
		"multiple",
		"muted",
		"nomodule",
		"novalidate",
		"open",
		"playsinline",
		"readonly",
		"required",
		"reversed",
		"seamless",
		"selected",
		"adauctionheaders",
		"browsingtopics",
		"credentialless",
		"defaultchecked",
		"defaultmuted",
		"defaultselected",
		"defer",
		"disablepictureinpicture",
		"disableremoteplayback",
		"preservespitch",
		"shadowrootclonable",
		"shadowrootcustomelementregistry",
		"shadowrootdelegatesfocus",
		"shadowrootserializable",
		"sharedstoragewritable"
	]
]);
var ChildProperties = /*#__PURE__*/ new Set([
	"innerHTML",
	"textContent",
	"innerText",
	"children"
]);
var Aliases = /*#__PURE__*/ Object.assign(Object.create(null), {
	className: "class",
	htmlFor: "for"
});
var PropAliases = /*#__PURE__*/ Object.assign(Object.create(null), {
	class: "className",
	novalidate: {
		$: "noValidate",
		FORM: 1
	},
	formnovalidate: {
		$: "formNoValidate",
		BUTTON: 1,
		INPUT: 1
	},
	ismap: {
		$: "isMap",
		IMG: 1
	},
	nomodule: {
		$: "noModule",
		SCRIPT: 1
	},
	playsinline: {
		$: "playsInline",
		VIDEO: 1
	},
	readonly: {
		$: "readOnly",
		INPUT: 1,
		TEXTAREA: 1
	},
	adauctionheaders: {
		$: "adAuctionHeaders",
		IFRAME: 1
	},
	allowfullscreen: {
		$: "allowFullscreen",
		IFRAME: 1
	},
	browsingtopics: {
		$: "browsingTopics",
		IMG: 1
	},
	defaultchecked: {
		$: "defaultChecked",
		INPUT: 1
	},
	defaultmuted: {
		$: "defaultMuted",
		AUDIO: 1,
		VIDEO: 1
	},
	defaultselected: {
		$: "defaultSelected",
		OPTION: 1
	},
	disablepictureinpicture: {
		$: "disablePictureInPicture",
		VIDEO: 1
	},
	disableremoteplayback: {
		$: "disableRemotePlayback",
		AUDIO: 1,
		VIDEO: 1
	},
	preservespitch: {
		$: "preservesPitch",
		AUDIO: 1,
		VIDEO: 1
	},
	shadowrootclonable: {
		$: "shadowRootClonable",
		TEMPLATE: 1
	},
	shadowrootdelegatesfocus: {
		$: "shadowRootDelegatesFocus",
		TEMPLATE: 1
	},
	shadowrootserializable: {
		$: "shadowRootSerializable",
		TEMPLATE: 1
	},
	sharedstoragewritable: {
		$: "sharedStorageWritable",
		IFRAME: 1,
		IMG: 1
	}
});
function getPropAlias(prop, tagName) {
	const a = PropAliases[prop];
	return typeof a === "object" ? a[tagName] ? a["$"] : void 0 : a;
}
var DelegatedEvents = /*#__PURE__*/ new Set([
	"beforeinput",
	"click",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
]);
var SVGNamespace = {
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace"
};
var memo = (fn) => createMemo(() => fn());
function reconcileArrays(parentNode, a, b) {
	let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
	while (aStart < aEnd || bStart < bEnd) {
		if (a[aStart] === b[bStart]) {
			aStart++;
			bStart++;
			continue;
		}
		while (a[aEnd - 1] === b[bEnd - 1]) {
			aEnd--;
			bEnd--;
		}
		if (aEnd === aStart) {
			const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
			while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
		} else if (bEnd === bStart) while (aStart < aEnd) {
			if (!map || !map.has(a[aStart])) a[aStart].remove();
			aStart++;
		}
		else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
			const node = a[--aEnd].nextSibling;
			parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
			parentNode.insertBefore(b[--bEnd], node);
			a[aEnd] = b[bEnd];
		} else {
			if (!map) {
				map = /* @__PURE__ */ new Map();
				let i = bStart;
				while (i < bEnd) map.set(b[i], i++);
			}
			const index = map.get(a[aStart]);
			if (index != null) if (bStart < index && index < bEnd) {
				let i = aStart, sequence = 1, t;
				while (++i < aEnd && i < bEnd) {
					if ((t = map.get(a[i])) == null || t !== index + sequence) break;
					sequence++;
				}
				if (sequence > index - bStart) {
					const node = a[aStart];
					while (bStart < index) parentNode.insertBefore(b[bStart++], node);
				} else parentNode.replaceChild(b[bStart++], a[aStart++]);
			} else aStart++;
			else a[aStart++].remove();
		}
	}
}
var $$EVENTS = "_$DX_DELEGATE";
function render(code, element, init, options = {}) {
	let disposer;
	createRoot((dispose) => {
		disposer = dispose;
		element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
	}, options.owner);
	return () => {
		disposer();
		element.textContent = "";
	};
}
function template(html, isImportNode, isSVG, isMathML) {
	let node;
	const create = () => {
		const t = isMathML ? document.createElementNS("http://www.w3.org/1998/Math/MathML", "template") : document.createElement("template");
		t.innerHTML = html;
		return isSVG ? t.content.firstChild.firstChild : isMathML ? t.firstChild : t.content.firstChild;
	};
	const fn = isImportNode ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
	fn.cloneNode = fn;
	return fn;
}
function delegateEvents(eventNames, document = window.document) {
	const e = document[$$EVENTS] || (document[$$EVENTS] = /* @__PURE__ */ new Set());
	for (let i = 0, l = eventNames.length; i < l; i++) {
		const name = eventNames[i];
		if (!e.has(name)) {
			e.add(name);
			document.addEventListener(name, eventHandler);
		}
	}
}
function setAttribute(node, name, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttribute(name);
	else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttributeNS(namespace, name);
	else node.setAttributeNS(namespace, name, value);
}
function setBoolAttribute(node, name, value) {
	if (isHydrating(node)) return;
	value ? node.setAttribute(name, "") : node.removeAttribute(name);
}
function className(node, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttribute("class");
	else node.className = value;
}
function addEventListener(node, name, handler, delegate) {
	if (delegate) if (Array.isArray(handler)) {
		node[`$$${name}`] = handler[0];
		node[`$$${name}Data`] = handler[1];
	} else node[`$$${name}`] = handler;
	else if (Array.isArray(handler)) {
		const handlerFn = handler[0];
		node.addEventListener(name, handler[0] = (e) => handlerFn.call(node, handler[1], e));
	} else node.addEventListener(name, handler, typeof handler !== "function" && handler);
}
function classList(node, value, prev = {}) {
	const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
	let i, len;
	for (i = 0, len = prevKeys.length; i < len; i++) {
		const key = prevKeys[i];
		if (!key || key === "undefined" || value[key]) continue;
		toggleClassKey(node, key, false);
		delete prev[key];
	}
	for (i = 0, len = classKeys.length; i < len; i++) {
		const key = classKeys[i], classValue = !!value[key];
		if (!key || key === "undefined" || prev[key] === classValue || !classValue) continue;
		toggleClassKey(node, key, true);
		prev[key] = classValue;
	}
	return prev;
}
function style(node, value, prev) {
	if (!value) return prev ? setAttribute(node, "style") : value;
	const nodeStyle = node.style;
	if (typeof value === "string") return nodeStyle.cssText = value;
	typeof prev === "string" && (nodeStyle.cssText = prev = void 0);
	prev || (prev = {});
	value || (value = {});
	let v, s;
	for (s in prev) {
		value[s] ?? nodeStyle.removeProperty(s);
		delete prev[s];
	}
	for (s in value) {
		v = value[s];
		if (v !== prev[s]) {
			nodeStyle.setProperty(s, v);
			prev[s] = v;
		}
	}
	return prev;
}
function setStyleProperty(node, name, value) {
	value != null ? node.style.setProperty(name, value) : node.style.removeProperty(name);
}
function spread(node, props = {}, isSVG, skipChildren) {
	const prevProps = {};
	if (!skipChildren) createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
	createRenderEffect(() => typeof props.ref === "function" && use(props.ref, node));
	createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
	return prevProps;
}
function use(fn, element, arg) {
	return untrack(() => fn(element, arg));
}
function insert(parent, accessor, marker, initial) {
	if (marker !== void 0 && !initial) initial = [];
	if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
	createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
}
function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
	props || (props = {});
	for (const prop in prevProps) if (!(prop in props)) {
		if (prop === "children") continue;
		prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef, props);
	}
	for (const prop in props) {
		if (prop === "children") {
			if (!skipChildren) insertExpression(node, props.children);
			continue;
		}
		const value = props[prop];
		prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef, props);
	}
}
function isHydrating(node) {
	return !!sharedConfig.context && !sharedConfig.done && (!node || node.isConnected);
}
function toPropertyName(name) {
	return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function toggleClassKey(node, key, value) {
	const classNames = key.trim().split(/\s+/);
	for (let i = 0, nameLen = classNames.length; i < nameLen; i++) node.classList.toggle(classNames[i], value);
}
function assignProp(node, prop, value, prev, isSVG, skipRef, props) {
	let isCE, isProp, isChildProp, propAlias, forceProp;
	if (prop === "style") return style(node, value, prev);
	if (prop === "classList") return classList(node, value, prev);
	if (value === prev) return prev;
	if (prop === "ref") {
		if (!skipRef) value(node);
	} else if (prop.slice(0, 3) === "on:") {
		const e = prop.slice(3);
		prev && node.removeEventListener(e, prev, typeof prev !== "function" && prev);
		value && node.addEventListener(e, value, typeof value !== "function" && value);
	} else if (prop.slice(0, 10) === "oncapture:") {
		const e = prop.slice(10);
		prev && node.removeEventListener(e, prev, true);
		value && node.addEventListener(e, value, true);
	} else if (prop.slice(0, 2) === "on") {
		const name = prop.slice(2).toLowerCase();
		const delegate = DelegatedEvents.has(name);
		if (!delegate && prev) {
			const h = Array.isArray(prev) ? prev[0] : prev;
			node.removeEventListener(name, h);
		}
		if (delegate || value) {
			addEventListener(node, name, value, delegate);
			delegate && delegateEvents([name]);
		}
	} else if (prop.slice(0, 5) === "attr:") setAttribute(node, prop.slice(5), value);
	else if (prop.slice(0, 5) === "bool:") setBoolAttribute(node, prop.slice(5), value);
	else if ((forceProp = prop.slice(0, 5) === "prop:") || (isChildProp = ChildProperties.has(prop)) || !isSVG && ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-") || "is" in props)) {
		if (forceProp) {
			prop = prop.slice(5);
			isProp = true;
		} else if (isHydrating(node)) return value;
		if (prop === "class" || prop === "className") className(node, value);
		else if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;
		else node[propAlias || prop] = value;
	} else {
		const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
		if (ns) setAttributeNS(node, ns, prop, value);
		else setAttribute(node, Aliases[prop] || prop, value);
	}
	return value;
}
function eventHandler(e) {
	if (sharedConfig.registry && sharedConfig.events) {
		if (sharedConfig.events.find(([el, ev]) => ev === e)) return;
	}
	let node = e.target;
	const key = `$$${e.type}`;
	const oriTarget = e.target;
	const oriCurrentTarget = e.currentTarget;
	const retarget = (value) => Object.defineProperty(e, "target", {
		configurable: true,
		value
	});
	const handleNode = () => {
		const handler = node[key];
		if (handler && !node.disabled) {
			const data = node[`${key}Data`];
			data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
			if (e.cancelBubble) return;
		}
		node.host && typeof node.host !== "string" && !node.host._$host && node.contains(e.target) && retarget(node.host);
		return true;
	};
	const walkUpTree = () => {
		while (handleNode() && (node = node._$host || node.parentNode || node.host));
	};
	Object.defineProperty(e, "currentTarget", {
		configurable: true,
		get() {
			return node || document;
		}
	});
	if (sharedConfig.registry && !sharedConfig.done) sharedConfig.done = _$HY.done = true;
	if (e.composedPath) {
		const path = e.composedPath();
		retarget(path[0]);
		for (let i = 0; i < path.length - 2; i++) {
			node = path[i];
			if (!handleNode()) break;
			if (node._$host) {
				node = node._$host;
				walkUpTree();
				break;
			}
			if (node.parentNode === oriCurrentTarget) break;
		}
	} else walkUpTree();
	retarget(oriTarget);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
	const hydrating = isHydrating(parent);
	if (hydrating) {
		!current && (current = [...parent.childNodes]);
		let cleaned = [];
		for (let i = 0; i < current.length; i++) {
			const node = current[i];
			if (node.nodeType === 8 && node.data.slice(0, 2) === "!$") node.remove();
			else cleaned.push(node);
		}
		current = cleaned;
	}
	while (typeof current === "function") current = current();
	if (value === current) return current;
	const t = typeof value, multi = marker !== void 0;
	parent = multi && current[0] && current[0].parentNode || parent;
	if (t === "string" || t === "number") {
		if (hydrating) return current;
		if (t === "number") {
			value = value.toString();
			if (value === current) return current;
		}
		if (multi) {
			let node = current[0];
			if (node && node.nodeType === 3) node.data !== value && (node.data = value);
			else node = document.createTextNode(value);
			current = cleanChildren(parent, current, marker, node);
		} else if (current !== "" && typeof current === "string") current = parent.firstChild.data = value;
		else current = parent.textContent = value;
	} else if (value == null || t === "boolean") {
		if (hydrating) return current;
		current = cleanChildren(parent, current, marker);
	} else if (t === "function") {
		createRenderEffect(() => {
			let v = value();
			while (typeof v === "function") v = v();
			current = insertExpression(parent, v, current, marker);
		});
		return () => current;
	} else if (Array.isArray(value)) {
		const array = [];
		const currentArray = current && Array.isArray(current);
		if (normalizeIncomingArray(array, value, current, unwrapArray)) {
			createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
			return () => current;
		}
		if (hydrating) {
			if (!array.length) return current;
			if (marker === void 0) return current = [...parent.childNodes];
			let node = array[0];
			if (node.parentNode !== parent) return current;
			const nodes = [node];
			while ((node = node.nextSibling) !== marker) nodes.push(node);
			return current = nodes;
		}
		if (array.length === 0) {
			current = cleanChildren(parent, current, marker);
			if (multi) return current;
		} else if (currentArray) if (current.length === 0) appendNodes(parent, array, marker);
		else reconcileArrays(parent, current, array);
		else {
			current && cleanChildren(parent);
			appendNodes(parent, array);
		}
		current = array;
	} else if (value.nodeType) {
		if (hydrating && value.parentNode) return current = multi ? [value] : value;
		if (Array.isArray(current)) {
			if (multi) return current = cleanChildren(parent, current, marker, value);
			cleanChildren(parent, current, null, value);
		} else if (current == null || current === "" || !parent.firstChild) parent.appendChild(value);
		else parent.replaceChild(value, parent.firstChild);
		current = value;
	}
	return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
	let dynamic = false;
	for (let i = 0, len = array.length; i < len; i++) {
		let item = array[i], prev = current && current[normalized.length], t;
		if (item == null || item === true || item === false);
		else if ((t = typeof item) === "object" && item.nodeType) normalized.push(item);
		else if (Array.isArray(item)) dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
		else if (t === "function") if (unwrap) {
			while (typeof item === "function") item = item();
			dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
		} else {
			normalized.push(item);
			dynamic = true;
		}
		else {
			const value = String(item);
			if (prev && prev.nodeType === 3 && prev.data === value) normalized.push(prev);
			else normalized.push(document.createTextNode(value));
		}
	}
	return dynamic;
}
function appendNodes(parent, array, marker = null) {
	for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
	if (marker === void 0) return parent.textContent = "";
	const node = replacement || document.createTextNode("");
	if (current.length) {
		let inserted = false;
		for (let i = current.length - 1; i >= 0; i--) {
			const el = current[i];
			if (node !== el) {
				const isParent = el.parentNode === parent;
				if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
				else isParent && el.remove();
			} else inserted = true;
		}
	} else parent.insertBefore(node, marker);
	return [node];
}
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep) {
	return "/" + dep;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region assets/ts/utils.ts
/**
* utils
*/
function increment(num, length) {
	return (num + 1) % length;
}
function decrement(num, length) {
	return (num + length - 1) % length;
}
function expand(num) {
	return ("0000" + num.toString()).slice(-4);
}
async function loadGsap() {
	return (await __vitePreload(() => import("./BtMreJ.js"), [])).gsap;
}
function getThresholdSessionIndex() {
	const s = sessionStorage.getItem("thresholdsIndex");
	if (s === null) return 2;
	return parseInt(s);
}
function isMobile() {
	const ua = window.navigator.userAgent.toLowerCase();
	const hasTouchInput = "ontouchstart" in window || window.navigator.maxTouchPoints > 0;
	const hasTouchLayout = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;
	const isMobileUA = /android|iphone|ipad|ipod|mobile/.test(ua);
	const isWindowsDesktop = /windows nt/.test(ua);
	return isMobileUA || hasTouchInput && hasTouchLayout && !isWindowsDesktop;
}
function removeDuplicates(arr) {
	if (arr.length < 2) return arr;
	return [...new Set(arr)];
}
//#endregion
export { createResource as A, Switch as C, createEffect as D, createContext as E, on as F, onCleanup as I, onMount as L, getListener as M, lazy as N, createMemo as O, mergeProps as P, untrack as R, Show as S, createComponent as T, use as _, isMobile as a, For as b, __vitePreload as c, memo as d, render as f, template as g, spread as h, increment as i, createSignal as j, createRenderEffect as k, delegateEvents as l, setStyleProperty as m, expand as n, loadGsap as o, setAttribute as p, getThresholdSessionIndex as r, removeDuplicates as s, decrement as t, insert as u, $PROXY as v, batch as w, Match as x, $TRACK as y, useContext as z };
