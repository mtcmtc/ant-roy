
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity$1 = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity$1, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const loading = writable(true);
    const scrollReveal = readable(true);
    const videosLoading = writable(0);

    /* src/Tailwind.svelte generated by Svelte v3.37.0 */

    function create_fragment$g(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tailwind", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity$1 } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*! smooth-scroll v16.1.3 | (c) 2020 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/smooth-scroll */

    var smoothScroll_polyfills_min = createCommonjsModule(function (module, exports) {
    window.Element&&!Element.prototype.closest&&(Element.prototype.closest=function(e){var t,n=(this.document||this.ownerDocument).querySelectorAll(e),o=this;do{for(t=n.length;0<=--t&&n.item(t)!==o;);}while(t<0&&(o=o.parentElement));return o}),(function(){if("function"==typeof window.CustomEvent)return;function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}e.prototype=window.Event.prototype,window.CustomEvent=e;})(),(function(){for(var r=0,e=["ms","moz","webkit","o"],t=0;t<e.length&&!window.requestAnimationFrame;++t)window.requestAnimationFrame=window[e[t]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[e[t]+"CancelAnimationFrame"]||window[e[t]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(e,t){var n=(new Date).getTime(),o=Math.max(0,16-(n-r)),a=window.setTimeout((function(){e(n+o);}),o);return r=n+o,a}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e);});})(),(function(e,t){module.exports=t(e);})("undefined"!=typeof commonjsGlobal?commonjsGlobal:"undefined"!=typeof window?window:commonjsGlobal,(function(M){var q={ignore:"[data-scroll-ignore]",header:null,topOnEmptyHash:!0,speed:500,speedAsDuration:!1,durationMax:null,durationMin:null,clip:!0,offset:0,easing:"easeInOutCubic",customEasing:null,updateURL:!0,popstate:!0,emitEvents:!0},I=function(){var n={};return Array.prototype.forEach.call(arguments,(function(e){for(var t in e){if(!e.hasOwnProperty(t))return;n[t]=e[t];}})),n},r=function(e){"#"===e.charAt(0)&&(e=e.substr(1));for(var t,n=String(e),o=n.length,a=-1,r="",i=n.charCodeAt(0);++a<o;){if(0===(t=n.charCodeAt(a)))throw new InvalidCharacterError("Invalid character: the input contains U+0000.");1<=t&&t<=31||127==t||0===a&&48<=t&&t<=57||1===a&&48<=t&&t<=57&&45===i?r+="\\"+t.toString(16)+" ":r+=128<=t||45===t||95===t||48<=t&&t<=57||65<=t&&t<=90||97<=t&&t<=122?n.charAt(a):"\\"+n.charAt(a);}return "#"+r},F=function(){return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight,document.body.clientHeight,document.documentElement.clientHeight)},L=function(e){return e?(t=e,parseInt(M.getComputedStyle(t).height,10)+e.offsetTop):0;var t;},x=function(e,t,n){0===e&&document.body.focus(),n||(e.focus(),document.activeElement!==e&&(e.setAttribute("tabindex","-1"),e.focus(),e.style.outline="none"),M.scrollTo(0,t));},H=function(e,t,n,o){if(t.emitEvents&&"function"==typeof M.CustomEvent){var a=new CustomEvent(e,{bubbles:!0,detail:{anchor:n,toggle:o}});document.dispatchEvent(a);}};return function(o,e){var b,a,A,O,C={};C.cancelScroll=function(e){cancelAnimationFrame(O),O=null,e||H("scrollCancel",b);},C.animateScroll=function(a,r,e){C.cancelScroll();var i=I(b||q,e||{}),c="[object Number]"===Object.prototype.toString.call(a),t=c||!a.tagName?null:a;if(c||t){var s=M.pageYOffset;i.header&&!A&&(A=document.querySelector(i.header));var n,o,u,l,m,d,f,h,p=L(A),g=c?a:(function(e,t,n,o){var a=0;if(e.offsetParent)for(;a+=e.offsetTop,e=e.offsetParent;);return a=Math.max(a-t-n,0),o&&(a=Math.min(a,F()-M.innerHeight)),a})(t,p,parseInt("function"==typeof i.offset?i.offset(a,r):i.offset,10),i.clip),y=g-s,v=F(),w=0,S=(n=y,u=(o=i).speedAsDuration?o.speed:Math.abs(n/1e3*o.speed),o.durationMax&&u>o.durationMax?o.durationMax:o.durationMin&&u<o.durationMin?o.durationMin:parseInt(u,10)),E=function(e){var t,n,o;l||(l=e),w+=e-l,d=s+y*(n=m=1<(m=0===S?0:w/S)?1:m,"easeInQuad"===(t=i).easing&&(o=n*n),"easeOutQuad"===t.easing&&(o=n*(2-n)),"easeInOutQuad"===t.easing&&(o=n<.5?2*n*n:(4-2*n)*n-1),"easeInCubic"===t.easing&&(o=n*n*n),"easeOutCubic"===t.easing&&(o=--n*n*n+1),"easeInOutCubic"===t.easing&&(o=n<.5?4*n*n*n:(n-1)*(2*n-2)*(2*n-2)+1),"easeInQuart"===t.easing&&(o=n*n*n*n),"easeOutQuart"===t.easing&&(o=1- --n*n*n*n),"easeInOutQuart"===t.easing&&(o=n<.5?8*n*n*n*n:1-8*--n*n*n*n),"easeInQuint"===t.easing&&(o=n*n*n*n*n),"easeOutQuint"===t.easing&&(o=1+--n*n*n*n*n),"easeInOutQuint"===t.easing&&(o=n<.5?16*n*n*n*n*n:1+16*--n*n*n*n*n),t.customEasing&&(o=t.customEasing(n)),o||n),M.scrollTo(0,Math.floor(d)),(function(e,t){var n=M.pageYOffset;if(e==t||n==t||(s<t&&M.innerHeight+n)>=v)return C.cancelScroll(!0),x(a,t,c),H("scrollStop",i,a,r),!(O=l=null)})(d,g)||(O=M.requestAnimationFrame(E),l=e);};0===M.pageYOffset&&M.scrollTo(0,0),f=a,h=i,c||history.pushState&&h.updateURL&&history.pushState({smoothScroll:JSON.stringify(h),anchor:f.id},document.title,f===document.documentElement?"#top":"#"+f.id),"matchMedia"in M&&M.matchMedia("(prefers-reduced-motion)").matches?x(a,Math.floor(g),!1):(H("scrollStart",i,a,r),C.cancelScroll(!0),M.requestAnimationFrame(E));}};var t=function(e){if(!e.defaultPrevented&&!(0!==e.button||e.metaKey||e.ctrlKey||e.shiftKey)&&"closest"in e.target&&(a=e.target.closest(o))&&"a"===a.tagName.toLowerCase()&&!e.target.closest(b.ignore)&&a.hostname===M.location.hostname&&a.pathname===M.location.pathname&&/#/.test(a.href)){var t,n;try{t=r(decodeURIComponent(a.hash));}catch(e){t=r(a.hash);}if("#"===t){if(!b.topOnEmptyHash)return;n=document.documentElement;}else n=document.querySelector(t);(n=n||"#top"!==t?n:document.documentElement)&&(e.preventDefault(),(function(e){if(history.replaceState&&e.updateURL&&!history.state){var t=M.location.hash;t=t||"",history.replaceState({smoothScroll:JSON.stringify(e),anchor:t||M.pageYOffset},document.title,t||M.location.href);}})(b),C.animateScroll(n,a));}},n=function(e){if(null!==history.state&&history.state.smoothScroll&&history.state.smoothScroll===JSON.stringify(b)){var t=history.state.anchor;"string"==typeof t&&t&&!(t=document.querySelector(r(history.state.anchor)))||C.animateScroll(t,null,{updateURL:!1});}};C.destroy=function(){b&&(document.removeEventListener("click",t,!1),M.removeEventListener("popstate",n,!1),C.cancelScroll(),O=A=a=b=null);};return (function(){if(!("querySelector"in document&&"addEventListener"in M&&"requestAnimationFrame"in M&&"closest"in M.Element.prototype))throw "Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs.";C.destroy(),b=I(q,e||{}),A=b.header?document.querySelector(b.header):null,document.addEventListener("click",t,!1),b.updateURL&&b.popstate&&M.addEventListener("popstate",n,!1);})(),C}}));
    });

    /* src/components/Nav.svelte generated by Svelte v3.37.0 */
    const file$e = "src/components/Nav.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (25:20) {:else}
    function create_else_block$2(ctx) {
    	let img;
    	let img_alt_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "w-full");
    			attr_dev(img, "alt", img_alt_value = /*logo*/ ctx[1].alt);
    			if (img.src !== (img_src_value = /*logo*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$e, 25, 24, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*logo*/ 2 && img_alt_value !== (img_alt_value = /*logo*/ ctx[1].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*logo*/ 2 && img.src !== (img_src_value = /*logo*/ ctx[1].src)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(25:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:20) {#if !logo}
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(23:20) {#if !logo}",
    		ctx
    	});

    	return block;
    }

    // (46:20) {#if i >= navItems.length-1}
    function create_if_block$6(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Enter Timberwolves.com";
    			attr_dev(a, "class", "my-1 p-2 text-midnight hover:text-lake-dark bg-lake-light rounded-md hover:bg-lake-light-interact text-center lg:mx-4 lg:my-0 transition-colors");
    			attr_dev(a, "href", "https://www.nba.com/timberwolves");
    			add_location(a, file$e, 46, 24, 2339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(46:20) {#if i >= navItems.length-1}",
    		ctx
    	});

    	return block;
    }

    // (44:16) {#each navItems as item, i}
    function create_each_block$3(ctx) {
    	let a;
    	let t0_value = /*item*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[8] >= /*navItems*/ ctx[2].length - 1 && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "class", `my-1 p-2 hover:text-aurora border-b-4 border-transparent lg:hover:border-aurora lg:mx-0 xl:mx-2 lg:my-0 transition-colors`);
    			attr_dev(a, "href", `#section-${/*i*/ ctx[8]}`);
    			add_location(a, file$e, 44, 20, 2091);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navItems*/ 4 && t0_value !== (t0_value = /*item*/ ctx[6].title + "")) set_data_dev(t0, t0_value);

    			if (/*i*/ ctx[8] >= /*navItems*/ ctx[2].length - 1) {
    				if (if_block) ; else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(44:16) {#each navItems as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let nav;
    	let div5;
    	let div2;
    	let div0;
    	let a;
    	let a_class_value;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let button;
    	let svg;
    	let path;
    	let t1;
    	let div4;
    	let div3;
    	let div4_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*logo*/ ctx[1]) return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*navItems*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "class", a_class_value = `text-xl font-bold lg:text-2xl hover:text-gray-300 uppercase ${/*logo*/ ctx[1] && "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-28" || ""}`);
    			attr_dev(a, "href", "#top");
    			add_location(a, file$e, 21, 16, 751);
    			attr_dev(div0, "class", div0_class_value = /*logo*/ ctx[1] && "h-14 w-14 md:h-20 md:w-20 overflow-hidden relative" || "");
    			add_location(div0, file$e, 20, 12, 654);
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z");
    			add_location(path, file$e, 34, 24, 1540);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "w-6 h-6 fill-current");
    			add_location(svg, file$e, 33, 20, 1461);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "text-aurora  hover:text-aurora-light focus:outline-none focus:text-aurora-light");
    			attr_dev(button, "aria-label", "toggle menu");
    			add_location(button, file$e, 32, 16, 1283);
    			attr_dev(div1, "class", "flex lg:hidden");
    			add_location(div1, file$e, 31, 12, 1238);
    			attr_dev(div2, "class", "flex items-center justify-between");
    			add_location(div2, file$e, 19, 8, 594);
    			attr_dev(div3, "class", "flex flex-col lg:flex-row lg:mx-6 text-sm font-bold uppercase tracking-wide");
    			add_location(div3, file$e, 42, 12, 1937);
    			attr_dev(div4, "class", div4_class_value = `items-center lg:flex ${/*menuOpen*/ ctx[3] ? "block" : "hidden"}`);
    			add_location(div4, file$e, 41, 8, 1855);
    			attr_dev(div5, "class", "container px-6 py-3 mx-auto lg:flex lg:justify-between lg:items-center");
    			add_location(div5, file$e, 18, 4, 501);
    			attr_dev(nav, "class", "bg-black bg-opacity-70 shadow border-aurora border-b-2 border-opacity-70 z-10 sticky top-0");
    			add_location(nav, file$e, 17, 0, 392);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div5);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			if_block.m(a, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(a, null);
    				}
    			}

    			if (dirty & /*logo*/ 2 && a_class_value !== (a_class_value = `text-xl font-bold lg:text-2xl hover:text-gray-300 uppercase ${/*logo*/ ctx[1] && "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-28" || ""}`)) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (dirty & /*logo*/ 2 && div0_class_value !== (div0_class_value = /*logo*/ ctx[1] && "h-14 w-14 md:h-20 md:w-20 overflow-hidden relative" || "")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*navItems*/ 4) {
    				each_value = /*navItems*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*menuOpen*/ 8 && div4_class_value !== (div4_class_value = `items-center lg:flex ${/*menuOpen*/ ctx[3] ? "block" : "hidden"}`)) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let { title = "" } = $$props;
    	let { logo = "" } = $$props;
    	let { navItems = [] } = $$props;
    	let menuOpen = false;

    	function toggleMenu() {
    		$$invalidate(3, menuOpen = !menuOpen);
    	}

    	const scroll = new smoothScroll_polyfills_min("a[href*=\"#\"]",
    	{
    			offset(anchor, toggle) {
    				return 150;
    			}
    		});

    	const writable_props = ["title", "logo", "navItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("logo" in $$props) $$invalidate(1, logo = $$props.logo);
    		if ("navItems" in $$props) $$invalidate(2, navItems = $$props.navItems);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		SmoothScroll: smoothScroll_polyfills_min,
    		title,
    		logo,
    		navItems,
    		menuOpen,
    		toggleMenu,
    		scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("logo" in $$props) $$invalidate(1, logo = $$props.logo);
    		if ("navItems" in $$props) $$invalidate(2, navItems = $$props.navItems);
    		if ("menuOpen" in $$props) $$invalidate(3, menuOpen = $$props.menuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, logo, navItems, menuOpen, toggleMenu];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$f, safe_not_equal, { title: 0, logo: 1, navItems: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get title() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get logo() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set logo(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navItems() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navItems(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SectionTemplate.svelte generated by Svelte v3.37.0 */

    const file$d = "src/components/SectionTemplate.svelte";

    function create_fragment$e(ctx) {
    	let section;
    	let section_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(section, "id", /*sectionId*/ ctx[1]);
    			attr_dev(section, "class", section_class_value = `mx-auto ${/*classList*/ ctx[0] || ""}`);
    			add_location(section, file$d, 7, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*sectionId*/ 2) {
    				attr_dev(section, "id", /*sectionId*/ ctx[1]);
    			}

    			if (!current || dirty & /*classList*/ 1 && section_class_value !== (section_class_value = `mx-auto ${/*classList*/ ctx[0] || ""}`)) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionTemplate", slots, ['default']);
    	let { class: classList = "" } = $$props;
    	let { id: sectionId = "" } = $$props;
    	const writable_props = ["class", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionTemplate> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, classList = $$props.class);
    		if ("id" in $$props) $$invalidate(1, sectionId = $$props.id);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classList, sectionId });

    	$$self.$inject_state = $$props => {
    		if ("classList" in $$props) $$invalidate(0, classList = $$props.classList);
    		if ("sectionId" in $$props) $$invalidate(1, sectionId = $$props.sectionId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classList, sectionId, $$scope, slots];
    }

    class SectionTemplate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$e, safe_not_equal, { class: 0, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionTemplate",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<SectionTemplate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SectionTemplate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<SectionTemplate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SectionTemplate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Sister;

    /**
    * @link https://github.com/gajus/sister for the canonical source repository
    * @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
    */
    Sister = function () {
        var sister = {},
            events = {};

        /**
         * @name handler
         * @function
         * @param {Object} data Event data.
         */

        /**
         * @param {String} name Event name.
         * @param {handler} handler
         * @return {listener}
         */
        sister.on = function (name, handler) {
            var listener = {name: name, handler: handler};
            events[name] = events[name] || [];
            events[name].unshift(listener);
            return listener;
        };

        /**
         * @param {listener}
         */
        sister.off = function (listener) {
            var index = events[listener.name].indexOf(listener);

            if (index !== -1) {
                events[listener.name].splice(index, 1);
            }
        };

        /**
         * @param {String} name Event name.
         * @param {Object} data Event data.
         */
        sister.trigger = function (name, data) {
            var listeners = events[name],
                i;

            if (listeners) {
                i = listeners.length;
                while (i--) {
                    listeners[i].handler(data);
                }
            }
        };

        return sister;
    };

    var sister = Sister;

    var loadScript = function load (src, opts, cb) {
      var head = document.head || document.getElementsByTagName('head')[0];
      var script = document.createElement('script');

      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }

      opts = opts || {};
      cb = cb || function() {};

      script.type = opts.type || 'text/javascript';
      script.charset = opts.charset || 'utf8';
      script.async = 'async' in opts ? !!opts.async : true;
      script.src = src;

      if (opts.attrs) {
        setAttributes(script, opts.attrs);
      }

      if (opts.text) {
        script.text = '' + opts.text;
      }

      var onend = 'onload' in script ? stdOnEnd : ieOnEnd;
      onend(script, cb);

      // some good legacy browsers (firefox) fail the 'in' detection above
      // so as a fallback we always set onload
      // old IE will ignore this and new IE will set onload
      if (!script.onload) {
        stdOnEnd(script, cb);
      }

      head.appendChild(script);
    };

    function setAttributes(script, attrs) {
      for (var attr in attrs) {
        script.setAttribute(attr, attrs[attr]);
      }
    }

    function stdOnEnd (script, cb) {
      script.onload = function () {
        this.onerror = this.onload = null;
        cb(null, script);
      };
      script.onerror = function () {
        // this.onload = null here is necessary
        // because even IE9 works not like others
        this.onerror = this.onload = null;
        cb(new Error('Failed to load ' + this.src), script);
      };
    }

    function ieOnEnd (script, cb) {
      script.onreadystatechange = function () {
        if (this.readyState != 'complete' && this.readyState != 'loaded') return
        this.onreadystatechange = null;
        cb(null, script); // there is no way to catch loading errors in IE8
      };
    }

    var loadYouTubeIframeApi = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });



    var _loadScript2 = _interopRequireDefault(loadScript);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = function (emitter) {
      /**
       * A promise that is resolved when window.onYouTubeIframeAPIReady is called.
       * The promise is resolved with a reference to window.YT object.
       */
      var iframeAPIReady = new Promise(function (resolve) {
        if (window.YT && window.YT.Player && window.YT.Player instanceof Function) {
          resolve(window.YT);

          return;
        } else {
          var protocol = window.location.protocol === 'http:' ? 'http:' : 'https:';

          (0, _loadScript2.default)(protocol + '//www.youtube.com/iframe_api', function (error) {
            if (error) {
              emitter.trigger('error', error);
            }
          });
        }

        var previous = window.onYouTubeIframeAPIReady;

        // The API will call this function when page has finished downloading
        // the JavaScript for the player API.
        window.onYouTubeIframeAPIReady = function () {
          if (previous) {
            previous();
          }

          resolve(window.YT);
        };
      });

      return iframeAPIReady;
    };

    module.exports = exports['default'];
    });

    /**
     * Helpers.
     */
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse$1(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse$1(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (ms >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (ms >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (ms >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      return plural(ms, d, 'day') ||
        plural(ms, h, 'hour') ||
        plural(ms, m, 'minute') ||
        plural(ms, s, 'second') ||
        ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }

    var debug$1 = createCommonjsModule(function (module, exports) {
    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = ms;

    /**
     * The currently active debug mode names, and names to skip.
     */

    exports.names = [];
    exports.skips = [];

    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     */

    exports.formatters = {};

    /**
     * Previous log timestamp.
     */

    var prevTime;

    /**
     * Select a color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */

    function selectColor(namespace) {
      var hash = 0, i;

      for (i in namespace) {
        hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      return exports.colors[Math.abs(hash) % exports.colors.length];
    }

    /**
     * Create a debugger with the given `namespace`.
     *
     * @param {String} namespace
     * @return {Function}
     * @api public
     */

    function createDebug(namespace) {

      function debug() {
        // disabled?
        if (!debug.enabled) return;

        var self = debug;

        // set `diff` timestamp
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;

        // turn the `arguments` into a proper Array
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }

        args[0] = exports.coerce(args[0]);

        if ('string' !== typeof args[0]) {
          // anything else let's inspect with %O
          args.unshift('%O');
        }

        // apply any `formatters` transformations
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          // if we encounter an escaped % then don't increase the array index
          if (match === '%%') return match;
          index++;
          var formatter = exports.formatters[format];
          if ('function' === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);

            // now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1);
            index--;
          }
          return match;
        });

        // apply env-specific formatting (colors, etc.)
        exports.formatArgs.call(self, args);

        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }

      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);

      // env-specific initialization logic for debug instances
      if ('function' === typeof exports.init) {
        exports.init(debug);
      }

      return debug;
    }

    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @api public
     */

    function enable(namespaces) {
      exports.save(namespaces);

      exports.names = [];
      exports.skips = [];

      var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
      var len = split.length;

      for (var i = 0; i < len; i++) {
        if (!split[i]) continue; // ignore empty strings
        namespaces = split[i].replace(/\*/g, '.*?');
        if (namespaces[0] === '-') {
          exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
        } else {
          exports.names.push(new RegExp('^' + namespaces + '$'));
        }
      }
    }

    /**
     * Disable debug output.
     *
     * @api public
     */

    function disable() {
      exports.enable('');
    }

    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */

    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */

    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    });

    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    var browser = createCommonjsModule(function (module, exports) {
    exports = module.exports = debug$1;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = 'undefined' != typeof chrome
                   && 'undefined' != typeof chrome.storage
                      ? chrome.storage.local
                      : localstorage();

    /**
     * Colors.
     */

    exports.colors = [
      'lightseagreen',
      'forestgreen',
      'goldenrod',
      'dodgerblue',
      'darkorchid',
      'crimson'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    function useColors() {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
      if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        return true;
      }

      // is webkit? http://stackoverflow.com/a/16459606/376773
      // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
      return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
        // is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
        // is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
        // double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return '[UnexpectedJSONParseError]: ' + err.message;
      }
    };


    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
      var useColors = this.useColors;

      args[0] = (useColors ? '%c' : '')
        + this.namespace
        + (useColors ? ' %c' : ' ')
        + args[0]
        + (useColors ? '%c ' : ' ')
        + '+' + exports.humanize(this.diff);

      if (!useColors) return;

      var c = 'color: ' + this.color;
      args.splice(1, 0, c, 'color: inherit');

      // the final "%c" is somewhat tricky, because there could be other
      // arguments passed either before or after the %c, so we need to
      // figure out the correct index to insert the CSS into
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ('%%' === match) return;
        index++;
        if ('%c' === match) {
          // we only are interested in the *last* %c
          // (the user may have provided their own)
          lastC = index;
        }
      });

      args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */

    function log() {
      // this hackery is required for IE8/9, where
      // the `console.log` function doesn't have 'apply'
      return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    }

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */

    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem('debug');
        } else {
          exports.storage.debug = namespaces;
        }
      } catch(e) {}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */

    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch(e) {}

      // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
      if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
      }

      return r;
    }

    /**
     * Enable namespaces listed in `localStorage.debug` initially.
     */

    exports.enable(load());

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {}
    }
    });

    var functionNames = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });


    /**
     * @see https://developers.google.com/youtube/iframe_api_reference#Functions
     */
    exports.default = ['cueVideoById', 'loadVideoById', 'cueVideoByUrl', 'loadVideoByUrl', 'playVideo', 'pauseVideo', 'stopVideo', 'getVideoLoadedFraction', 'cuePlaylist', 'loadPlaylist', 'nextVideo', 'previousVideo', 'playVideoAt', 'setShuffle', 'setLoop', 'getPlaylist', 'getPlaylistIndex', 'setOption', 'mute', 'unMute', 'isMuted', 'setVolume', 'getVolume', 'seekTo', 'getPlayerState', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates', 'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getCurrentTime', 'getDuration', 'removeEventListener', 'getVideoUrl', 'getVideoEmbedCode', 'getOptions', 'getOption', 'addEventListener', 'destroy', 'setSize', 'getIframe'];
    module.exports = exports['default'];
    });

    var eventNames = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });


    /**
     * @see https://developers.google.com/youtube/iframe_api_reference#Events
     * `volumeChange` is not officially supported but seems to work
     * it emits an object: `{volume: 82.6923076923077, muted: false}`
     */
    exports.default = ['ready', 'stateChange', 'playbackQualityChange', 'playbackRateChange', 'error', 'apiChange', 'volumeChange'];
    module.exports = exports['default'];
    });

    var PlayerStates = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = {
      BUFFERING: 3,
      ENDED: 0,
      PAUSED: 2,
      PLAYING: 1,
      UNSTARTED: -1,
      VIDEO_CUED: 5
    };
    module.exports = exports["default"];
    });

    var FunctionStateMap = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });



    var _PlayerStates2 = _interopRequireDefault(PlayerStates);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.default = {
      pauseVideo: {
        acceptableStates: [_PlayerStates2.default.ENDED, _PlayerStates2.default.PAUSED],
        stateChangeRequired: false
      },
      playVideo: {
        acceptableStates: [_PlayerStates2.default.ENDED, _PlayerStates2.default.PLAYING],
        stateChangeRequired: false
      },
      seekTo: {
        acceptableStates: [_PlayerStates2.default.ENDED, _PlayerStates2.default.PLAYING, _PlayerStates2.default.PAUSED],
        stateChangeRequired: true,

        // TRICKY: `seekTo` may not cause a state change if no buffering is
        // required.
        timeout: 3000
      }
    };
    module.exports = exports['default'];
    });

    var YouTubePlayer_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });



    var _debug2 = _interopRequireDefault(browser);



    var _functionNames2 = _interopRequireDefault(functionNames);



    var _eventNames2 = _interopRequireDefault(eventNames);



    var _FunctionStateMap2 = _interopRequireDefault(FunctionStateMap);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable promise/prefer-await-to-then */

    var debug = (0, _debug2.default)('youtube-player');

    var YouTubePlayer = {};

    /**
     * Construct an object that defines an event handler for all of the YouTube
     * player events. Proxy captured events through an event emitter.
     *
     * @todo Capture event parameters.
     * @see https://developers.google.com/youtube/iframe_api_reference#Events
     */
    YouTubePlayer.proxyEvents = function (emitter) {
      var events = {};

      var _loop = function _loop(eventName) {
        var onEventName = 'on' + eventName.slice(0, 1).toUpperCase() + eventName.slice(1);

        events[onEventName] = function (event) {
          debug('event "%s"', onEventName, event);

          emitter.trigger(eventName, event);
        };
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _eventNames2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var eventName = _step.value;

          _loop(eventName);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return events;
    };

    /**
     * Delays player API method execution until player state is ready.
     *
     * @todo Proxy all of the methods using Object.keys.
     * @todo See TRICKY below.
     * @param playerAPIReady Promise that resolves when player is ready.
     * @param strictState A flag designating whether or not to wait for
     * an acceptable state when calling supported functions.
     * @returns {Object}
     */
    YouTubePlayer.promisifyPlayer = function (playerAPIReady) {
      var strictState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var functions = {};

      var _loop2 = function _loop2(functionName) {
        if (strictState && _FunctionStateMap2.default[functionName]) {
          functions[functionName] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return playerAPIReady.then(function (player) {
              var stateInfo = _FunctionStateMap2.default[functionName];
              var playerState = player.getPlayerState();

              // eslint-disable-next-line no-warning-comments
              // TODO: Just spread the args into the function once Babel is fixed:
              // https://github.com/babel/babel/issues/4270
              //
              // eslint-disable-next-line prefer-spread
              var value = player[functionName].apply(player, args);

              // TRICKY: For functions like `seekTo`, a change in state must be
              // triggered given that the resulting state could match the initial
              // state.
              if (stateInfo.stateChangeRequired ||

              // eslint-disable-next-line no-extra-parens
              Array.isArray(stateInfo.acceptableStates) && stateInfo.acceptableStates.indexOf(playerState) === -1) {
                return new Promise(function (resolve) {
                  var onPlayerStateChange = function onPlayerStateChange() {
                    var playerStateAfterChange = player.getPlayerState();

                    var timeout = void 0;

                    if (typeof stateInfo.timeout === 'number') {
                      timeout = setTimeout(function () {
                        player.removeEventListener('onStateChange', onPlayerStateChange);

                        resolve();
                      }, stateInfo.timeout);
                    }

                    if (Array.isArray(stateInfo.acceptableStates) && stateInfo.acceptableStates.indexOf(playerStateAfterChange) !== -1) {
                      player.removeEventListener('onStateChange', onPlayerStateChange);

                      clearTimeout(timeout);

                      resolve();
                    }
                  };

                  player.addEventListener('onStateChange', onPlayerStateChange);
                }).then(function () {
                  return value;
                });
              }

              return value;
            });
          };
        } else {
          functions[functionName] = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return playerAPIReady.then(function (player) {
              // eslint-disable-next-line no-warning-comments
              // TODO: Just spread the args into the function once Babel is fixed:
              // https://github.com/babel/babel/issues/4270
              //
              // eslint-disable-next-line prefer-spread
              return player[functionName].apply(player, args);
            });
          };
        }
      };

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _functionNames2.default[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var functionName = _step2.value;

          _loop2(functionName);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return functions;
    };

    exports.default = YouTubePlayer;
    module.exports = exports['default'];
    });

    var dist = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };



    var _sister2 = _interopRequireDefault(sister);



    var _loadYouTubeIframeApi2 = _interopRequireDefault(loadYouTubeIframeApi);



    var _YouTubePlayer2 = _interopRequireDefault(YouTubePlayer_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * @typedef YT.Player
     * @see https://developers.google.com/youtube/iframe_api_reference
     * */

    /**
     * @see https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
     */
    var youtubeIframeAPI = void 0;

    /**
     * A factory function used to produce an instance of YT.Player and queue function calls and proxy events of the resulting object.
     *
     * @param maybeElementId Either An existing YT.Player instance,
     * the DOM element or the id of the HTML element where the API will insert an <iframe>.
     * @param options See `options` (Ignored when using an existing YT.Player instance).
     * @param strictState A flag designating whether or not to wait for
     * an acceptable state when calling supported functions. Default: `false`.
     * See `FunctionStateMap.js` for supported functions and acceptable states.
     */

    exports.default = function (maybeElementId) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var strictState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var emitter = (0, _sister2.default)();

      if (!youtubeIframeAPI) {
        youtubeIframeAPI = (0, _loadYouTubeIframeApi2.default)(emitter);
      }

      if (options.events) {
        throw new Error('Event handlers cannot be overwritten.');
      }

      if (typeof maybeElementId === 'string' && !document.getElementById(maybeElementId)) {
        throw new Error('Element "' + maybeElementId + '" does not exist.');
      }

      options.events = _YouTubePlayer2.default.proxyEvents(emitter);

      var playerAPIReady = new Promise(function (resolve) {
        if ((typeof maybeElementId === 'undefined' ? 'undefined' : _typeof(maybeElementId)) === 'object' && maybeElementId.playVideo instanceof Function) {
          var player = maybeElementId;

          resolve(player);
        } else {
          // asume maybeElementId can be rendered inside
          // eslint-disable-next-line promise/catch-or-return
          youtubeIframeAPI.then(function (YT) {
            // eslint-disable-line promise/prefer-await-to-then
            var player = new YT.Player(maybeElementId, options);

            emitter.on('ready', function () {
              resolve(player);
            });

            return null;
          });
        }
      });

      var playerApi = _YouTubePlayer2.default.promisifyPlayer(playerAPIReady, strictState);

      playerApi.on = emitter.on;
      playerApi.off = emitter.off;

      return playerApi;
    };

    module.exports = exports['default'];
    });

    var YoutubePlayer = /*@__PURE__*/getDefaultExportFromCjs(dist);

    /* node_modules/svelte-youtube/src/index.svelte generated by Svelte v3.37.0 */
    const file$c = "node_modules/svelte-youtube/src/index.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", /*id*/ ctx[0]);
    			add_location(div0, file$c, 143, 2, 4083);
    			attr_dev(div1, "class", /*className*/ ctx[1]);
    			add_location(div1, file$c, 142, 0, 4057);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[5](div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1) {
    				attr_dev(div0, "id", /*id*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 2) {
    				attr_dev(div1, "class", /*className*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const PlayerState = {
    	UNSTARTED: -1,
    	ENDED: 0,
    	PLAYING: 1,
    	PAUSED: 2,
    	BUFFERING: 3,
    	CUED: 5
    };

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Src", slots, []);
    	let { id = undefined } = $$props; // HTML element ID for player (optional)
    	let { videoId } = $$props; // Youtube video ID (required)
    	let { options = undefined } = $$props; // YouTube player options (optional)
    	let { class: className } = $$props; // HTML class names for container element
    	let playerElem; // player DOM element reference
    	let player; // player API instance

    	// Create and tear down player as component mounts or unmounts
    	onMount(() => createPlayer());

    	function createPlayer() {
    		player = YoutubePlayer(playerElem, options);

    		// Register event handlers
    		player.on("ready", onPlayerReady);

    		player.on("error", onPlayerError);
    		player.on("stateChange", onPlayerStateChange);
    		player.on("playbackRateChange", onPlayerPlaybackRateChange);
    		player.on("playbackQualityChange", onPlayerPlaybackQualityChange);

    		// Tear down player when done
    		return () => player.destroy();
    	}

    	function play(videoId) {
    		// this is needed because the loadVideoById function always starts playing,
    		// even if you have set autoplay to 1 whereas the cueVideoById function
    		// never starts autoplaying
    		if (player && videoId) {
    			if (options && options.playerVars && options.playerVars.autoplay === 1) {
    				player.loadVideoById(videoId);
    			} else {
    				player.cueVideoById(videoId);
    			}
    		}
    	}

    	// -------------------------------------------
    	// Event handling
    	// -------------------------------------------
    	const dispatch = createEventDispatcher();

    	/**
     * https://developers.google.com/youtube/iframe_api_reference#onReady
     *
     * @param {Object} event
     *   @param {Object} target - player object
     */
    	function onPlayerReady(event) {
    		dispatch("ready", event);

    		// Start playing
    		play(videoId);
    	}

    	/**
     * https://developers.google.com/youtube/iframe_api_reference#onError
     *
     * @param {Object} event
     *   @param {Integer} data  - error type
     *   @param {Object} target - player object
     */
    	function onPlayerError(event) {
    		dispatch("error", event);
    	}

    	/**
     * https://developers.google.com/youtube/iframe_api_reference#onStateChange
     *
     * @param {Object} event
     *   @param {Integer} data  - status change type
     *   @param {Object} target - actual YT player
     */
    	function onPlayerStateChange(event) {
    		dispatch("stateChange", event);

    		switch (event.data) {
    			case PlayerState.ENDED:
    				dispatch("end", event);
    				break;
    			case PlayerState.PLAYING:
    				dispatch("play", event);
    				break;
    			case PlayerState.PAUSED:
    				dispatch("pause", event);
    				break;
    		}
    	}

    	/**
     * https://developers.google.com/youtube/iframe_api_reference#onPlaybackRateChange
     *
     * @param {Object} event
     *   @param {Float} data    - playback rate
     *   @param {Object} target - actual YT player
     */
    	function onPlayerPlaybackRateChange(event) {
    		dispatch("playbackRateChange", event);
    	}

    	/**
     * https://developers.google.com/youtube/iframe_api_reference#onPlaybackQualityChange
     *
     * @param {Object} event
     *   @param {String} data   - playback quality
     *   @param {Object} target - actual YT player
     */
    	function onPlayerPlaybackQualityChange(event) {
    		dispatch("playbackQualityChange", event);
    	}

    	const writable_props = ["id", "videoId", "options", "class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			playerElem = $$value;
    			$$invalidate(2, playerElem);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("videoId" in $$props) $$invalidate(3, videoId = $$props.videoId);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("class" in $$props) $$invalidate(1, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		PlayerState,
    		onMount,
    		createEventDispatcher,
    		YoutubePlayer,
    		id,
    		videoId,
    		options,
    		className,
    		playerElem,
    		player,
    		createPlayer,
    		play,
    		dispatch,
    		onPlayerReady,
    		onPlayerError,
    		onPlayerStateChange,
    		onPlayerPlaybackRateChange,
    		onPlayerPlaybackQualityChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("videoId" in $$props) $$invalidate(3, videoId = $$props.videoId);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    		if ("playerElem" in $$props) $$invalidate(2, playerElem = $$props.playerElem);
    		if ("player" in $$props) player = $$props.player;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*videoId*/ 8) {
    			// Update videoId and load new video if URL changes
    			play(videoId);
    		}
    	};

    	return [id, className, playerElem, videoId, options, div0_binding];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$d, safe_not_equal, { id: 0, videoId: 3, options: 4, class: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoId*/ ctx[3] === undefined && !("videoId" in props)) {
    			console.warn("<Src> was created without expected prop 'videoId'");
    		}

    		if (/*className*/ ctx[1] === undefined && !("class" in props)) {
    			console.warn("<Src> was created without expected prop 'class'");
    		}
    	}

    	get id() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoId() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoId(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! @license is-dom-node v1.0.4

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */
    function isDomNode(x) {
    	return typeof window.Node === 'object'
    		? x instanceof window.Node
    		: x !== null &&
    				typeof x === 'object' &&
    				typeof x.nodeType === 'number' &&
    				typeof x.nodeName === 'string'
    }

    /*! @license is-dom-node-list v1.2.1

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */

    function isDomNodeList(x) {
    	var prototypeToString = Object.prototype.toString.call(x);
    	var regex = /^\[object (HTMLCollection|NodeList|Object)\]$/;

    	return typeof window.NodeList === 'object'
    		? x instanceof window.NodeList
    		: x !== null &&
    				typeof x === 'object' &&
    				typeof x.length === 'number' &&
    				regex.test(prototypeToString) &&
    				(x.length === 0 || isDomNode(x[0]))
    }

    /*! @license Tealight v0.3.6

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */

    function tealight(target, context) {
      if ( context === void 0 ) context = document;

      if (target instanceof Array) { return target.filter(isDomNode); }
      if (isDomNode(target)) { return [target]; }
      if (isDomNodeList(target)) { return Array.prototype.slice.call(target); }
      if (typeof target === "string") {
        try {
          var query = context.querySelectorAll(target);
          return Array.prototype.slice.call(query);
        } catch (err) {
          return [];
        }
      }
      return [];
    }

    /*! @license Rematrix v0.3.0

    	Copyright 2018 Julian Lloyd.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in
    	all copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    	THE SOFTWARE.
    */
    /**
     * @module Rematrix
     */

    /**
     * Transformation matrices in the browser come in two flavors:
     *
     *  - `matrix` using 6 values (short)
     *  - `matrix3d` using 16 values (long)
     *
     * This utility follows this [conversion guide](https://goo.gl/EJlUQ1)
     * to expand short form matrices to their equivalent long form.
     *
     * @param  {array} source - Accepts both short and long form matrices.
     * @return {array}
     */
    function format(source) {
    	if (source.constructor !== Array) {
    		throw new TypeError('Expected array.')
    	}
    	if (source.length === 16) {
    		return source
    	}
    	if (source.length === 6) {
    		var matrix = identity();
    		matrix[0] = source[0];
    		matrix[1] = source[1];
    		matrix[4] = source[2];
    		matrix[5] = source[3];
    		matrix[12] = source[4];
    		matrix[13] = source[5];
    		return matrix
    	}
    	throw new RangeError('Expected array with either 6 or 16 values.')
    }

    /**
     * Returns a matrix representing no transformation. The product of any matrix
     * multiplied by the identity matrix will be the original matrix.
     *
     * > **Tip:** Similar to how `5 * 1 === 5`, where `1` is the identity.
     *
     * @return {array}
     */
    function identity() {
    	var matrix = [];
    	for (var i = 0; i < 16; i++) {
    		i % 5 == 0 ? matrix.push(1) : matrix.push(0);
    	}
    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing the combined transformations
     * of both arguments.
     *
     * > **Note:** Order is very important. For example, rotating 45°
     * along the Z-axis, followed by translating 500 pixels along the
     * Y-axis... is not the same as translating 500 pixels along the
     * Y-axis, followed by rotating 45° along on the Z-axis.
     *
     * @param  {array} m - Accepts both short and long form matrices.
     * @param  {array} x - Accepts both short and long form matrices.
     * @return {array}
     */
    function multiply(m, x) {
    	var fm = format(m);
    	var fx = format(x);
    	var product = [];

    	for (var i = 0; i < 4; i++) {
    		var row = [fm[i], fm[i + 4], fm[i + 8], fm[i + 12]];
    		for (var j = 0; j < 4; j++) {
    			var k = j * 4;
    			var col = [fx[k], fx[k + 1], fx[k + 2], fx[k + 3]];
    			var result =
    				row[0] * col[0] + row[1] * col[1] + row[2] * col[2] + row[3] * col[3];

    			product[i + k] = result;
    		}
    	}

    	return product
    }

    /**
     * Attempts to return a 4x4 matrix describing the CSS transform
     * matrix passed in, but will return the identity matrix as a
     * fallback.
     *
     * > **Tip:** This method is used to convert a CSS matrix (retrieved as a
     * `string` from computed styles) to its equivalent array format.
     *
     * @param  {string} source - `matrix` or `matrix3d` CSS Transform value.
     * @return {array}
     */
    function parse(source) {
    	if (typeof source === 'string') {
    		var match = source.match(/matrix(3d)?\(([^)]+)\)/);
    		if (match) {
    			var raw = match[2].split(', ').map(parseFloat);
    			return format(raw)
    		}
    	}
    	return identity()
    }

    /**
     * Returns a 4x4 matrix describing X-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateX(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[5] = matrix[10] = Math.cos(theta);
    	matrix[6] = matrix[9] = Math.sin(theta);
    	matrix[9] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Y-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateY(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[0] = matrix[10] = Math.cos(theta);
    	matrix[2] = matrix[8] = Math.sin(theta);
    	matrix[2] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Z-axis rotation.
     *
     * @param  {number} angle - Measured in degrees.
     * @return {array}
     */
    function rotateZ(angle) {
    	var theta = Math.PI / 180 * angle;
    	var matrix = identity();

    	matrix[0] = matrix[5] = Math.cos(theta);
    	matrix[1] = matrix[4] = Math.sin(theta);
    	matrix[4] *= -1;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing 2D scaling. The first argument
     * is used for both X and Y-axis scaling, unless an optional
     * second argument is provided to explicitly define Y-axis scaling.
     *
     * @param  {number} scalar    - Decimal multiplier.
     * @param  {number} [scalarY] - Decimal multiplier.
     * @return {array}
     */
    function scale(scalar, scalarY) {
    	var matrix = identity();

    	matrix[0] = scalar;
    	matrix[5] = typeof scalarY === 'number' ? scalarY : scalar;

    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing X-axis translation.
     *
     * @param  {number} distance - Measured in pixels.
     * @return {array}
     */
    function translateX(distance) {
    	var matrix = identity();
    	matrix[12] = distance;
    	return matrix
    }

    /**
     * Returns a 4x4 matrix describing Y-axis translation.
     *
     * @param  {number} distance - Measured in pixels.
     * @return {array}
     */
    function translateY(distance) {
    	var matrix = identity();
    	matrix[13] = distance;
    	return matrix
    }

    /*! @license miniraf v1.0.0

    	Copyright 2018 Fisssion LLC.

    	Permission is hereby granted, free of charge, to any person obtaining a copy
    	of this software and associated documentation files (the "Software"), to deal
    	in the Software without restriction, including without limitation the rights
    	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    	copies of the Software, and to permit persons to whom the Software is
    	furnished to do so, subject to the following conditions:

    	The above copyright notice and this permission notice shall be included in all
    	copies or substantial portions of the Software.

    	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    	SOFTWARE.

    */
    var polyfill$1 = (function () {
    	var clock = Date.now();

    	return function (callback) {
    		var currentTime = Date.now();
    		if (currentTime - clock > 16) {
    			clock = currentTime;
    			callback(currentTime);
    		} else {
    			setTimeout(function () { return polyfill$1(callback); }, 0);
    		}
    	}
    })();

    var index = window.requestAnimationFrame ||
    	window.webkitRequestAnimationFrame ||
    	window.mozRequestAnimationFrame ||
    	polyfill$1;

    /*! @license ScrollReveal v4.0.9

    	Copyright 2021 Fisssion LLC.

    	Licensed under the GNU General Public License 3.0 for
    	compatible open source projects and non-commercial use.

    	For commercial sites, themes, projects, and applications,
    	keep your source code private/proprietary by purchasing
    	a commercial license from https://scrollrevealjs.org/
    */

    var defaults = {
    	delay: 0,
    	distance: '0',
    	duration: 600,
    	easing: 'cubic-bezier(0.5, 0, 0, 1)',
    	interval: 0,
    	opacity: 0,
    	origin: 'bottom',
    	rotate: {
    		x: 0,
    		y: 0,
    		z: 0
    	},
    	scale: 1,
    	cleanup: false,
    	container: document.documentElement,
    	desktop: true,
    	mobile: true,
    	reset: false,
    	useDelay: 'always',
    	viewFactor: 0.0,
    	viewOffset: {
    		top: 0,
    		right: 0,
    		bottom: 0,
    		left: 0
    	},
    	afterReset: function afterReset() {},
    	afterReveal: function afterReveal() {},
    	beforeReset: function beforeReset() {},
    	beforeReveal: function beforeReveal() {}
    };

    function failure() {
    	document.documentElement.classList.remove('sr');

    	return {
    		clean: function clean() {},
    		destroy: function destroy() {},
    		reveal: function reveal() {},
    		sync: function sync() {},
    		get noop() {
    			return true
    		}
    	}
    }

    function success() {
    	document.documentElement.classList.add('sr');

    	if (document.body) {
    		document.body.style.height = '100%';
    	} else {
    		document.addEventListener('DOMContentLoaded', function () {
    			document.body.style.height = '100%';
    		});
    	}
    }

    var mount = { success: success, failure: failure };

    function isObject(x) {
    	return (
    		x !== null &&
    		x instanceof Object &&
    		(x.constructor === Object ||
    			Object.prototype.toString.call(x) === '[object Object]')
    	)
    }

    function each(collection, callback) {
    	if (isObject(collection)) {
    		var keys = Object.keys(collection);
    		return keys.forEach(function (key) { return callback(collection[key], key, collection); })
    	}
    	if (collection instanceof Array) {
    		return collection.forEach(function (item, i) { return callback(item, i, collection); })
    	}
    	throw new TypeError('Expected either an array or object literal.')
    }

    function logger(message) {
    	var details = [], len = arguments.length - 1;
    	while ( len-- > 0 ) details[ len ] = arguments[ len + 1 ];

    	if (this.constructor.debug && console) {
    		var report = "%cScrollReveal: " + message;
    		details.forEach(function (detail) { return (report += "\n — " + detail); });
    		console.log(report, 'color: #ea654b;'); // eslint-disable-line no-console
    	}
    }

    function rinse() {
    	var this$1 = this;

    	var struct = function () { return ({
    		active: [],
    		stale: []
    	}); };

    	var elementIds = struct();
    	var sequenceIds = struct();
    	var containerIds = struct();

    	/**
    	 * Take stock of active element IDs.
    	 */
    	try {
    		each(tealight('[data-sr-id]'), function (node) {
    			var id = parseInt(node.getAttribute('data-sr-id'));
    			elementIds.active.push(id);
    		});
    	} catch (e) {
    		throw e
    	}
    	/**
    	 * Destroy stale elements.
    	 */
    	each(this.store.elements, function (element) {
    		if (elementIds.active.indexOf(element.id) === -1) {
    			elementIds.stale.push(element.id);
    		}
    	});

    	each(elementIds.stale, function (staleId) { return delete this$1.store.elements[staleId]; });

    	/**
    	 * Take stock of active container and sequence IDs.
    	 */
    	each(this.store.elements, function (element) {
    		if (containerIds.active.indexOf(element.containerId) === -1) {
    			containerIds.active.push(element.containerId);
    		}
    		if (element.hasOwnProperty('sequence')) {
    			if (sequenceIds.active.indexOf(element.sequence.id) === -1) {
    				sequenceIds.active.push(element.sequence.id);
    			}
    		}
    	});

    	/**
    	 * Destroy stale containers.
    	 */
    	each(this.store.containers, function (container) {
    		if (containerIds.active.indexOf(container.id) === -1) {
    			containerIds.stale.push(container.id);
    		}
    	});

    	each(containerIds.stale, function (staleId) {
    		var stale = this$1.store.containers[staleId].node;
    		stale.removeEventListener('scroll', this$1.delegate);
    		stale.removeEventListener('resize', this$1.delegate);
    		delete this$1.store.containers[staleId];
    	});

    	/**
    	 * Destroy stale sequences.
    	 */
    	each(this.store.sequences, function (sequence) {
    		if (sequenceIds.active.indexOf(sequence.id) === -1) {
    			sequenceIds.stale.push(sequence.id);
    		}
    	});

    	each(sequenceIds.stale, function (staleId) { return delete this$1.store.sequences[staleId]; });
    }

    var getPrefixedCssProp = (function () {
    	var properties = {};
    	var style = document.documentElement.style;

    	function getPrefixedCssProperty(name, source) {
    		if ( source === void 0 ) source = style;

    		if (name && typeof name === 'string') {
    			if (properties[name]) {
    				return properties[name]
    			}
    			if (typeof source[name] === 'string') {
    				return (properties[name] = name)
    			}
    			if (typeof source[("-webkit-" + name)] === 'string') {
    				return (properties[name] = "-webkit-" + name)
    			}
    			throw new RangeError(("Unable to find \"" + name + "\" style property."))
    		}
    		throw new TypeError('Expected a string.')
    	}

    	getPrefixedCssProperty.clearCache = function () { return (properties = {}); };

    	return getPrefixedCssProperty
    })();

    function style(element) {
    	var computed = window.getComputedStyle(element.node);
    	var position = computed.position;
    	var config = element.config;

    	/**
    	 * Generate inline styles
    	 */
    	var inline = {};
    	var inlineStyle = element.node.getAttribute('style') || '';
    	var inlineMatch = inlineStyle.match(/[\w-]+\s*:\s*[^;]+\s*/gi) || [];

    	inline.computed = inlineMatch ? inlineMatch.map(function (m) { return m.trim(); }).join('; ') + ';' : '';

    	inline.generated = inlineMatch.some(function (m) { return m.match(/visibility\s?:\s?visible/i); })
    		? inline.computed
    		: inlineMatch.concat( ['visibility: visible']).map(function (m) { return m.trim(); }).join('; ') + ';';

    	/**
    	 * Generate opacity styles
    	 */
    	var computedOpacity = parseFloat(computed.opacity);
    	var configOpacity = !isNaN(parseFloat(config.opacity))
    		? parseFloat(config.opacity)
    		: parseFloat(computed.opacity);

    	var opacity = {
    		computed: computedOpacity !== configOpacity ? ("opacity: " + computedOpacity + ";") : '',
    		generated: computedOpacity !== configOpacity ? ("opacity: " + configOpacity + ";") : ''
    	};

    	/**
    	 * Generate transformation styles
    	 */
    	var transformations = [];

    	if (parseFloat(config.distance)) {
    		var axis = config.origin === 'top' || config.origin === 'bottom' ? 'Y' : 'X';

    		/**
    		 * Let’s make sure our our pixel distances are negative for top and left.
    		 * e.g. { origin: 'top', distance: '25px' } starts at `top: -25px` in CSS.
    		 */
    		var distance = config.distance;
    		if (config.origin === 'top' || config.origin === 'left') {
    			distance = /^-/.test(distance) ? distance.substr(1) : ("-" + distance);
    		}

    		var ref = distance.match(/(^-?\d+\.?\d?)|(em$|px$|%$)/g);
    		var value = ref[0];
    		var unit = ref[1];

    		switch (unit) {
    			case 'em':
    				distance = parseInt(computed.fontSize) * value;
    				break
    			case 'px':
    				distance = value;
    				break
    			case '%':
    				/**
    				 * Here we use `getBoundingClientRect` instead of
    				 * the existing data attached to `element.geometry`
    				 * because only the former includes any transformations
    				 * current applied to the element.
    				 *
    				 * If that behavior ends up being unintuitive, this
    				 * logic could instead utilize `element.geometry.height`
    				 * and `element.geoemetry.width` for the distance calculation
    				 */
    				distance =
    					axis === 'Y'
    						? (element.node.getBoundingClientRect().height * value) / 100
    						: (element.node.getBoundingClientRect().width * value) / 100;
    				break
    			default:
    				throw new RangeError('Unrecognized or missing distance unit.')
    		}

    		if (axis === 'Y') {
    			transformations.push(translateY(distance));
    		} else {
    			transformations.push(translateX(distance));
    		}
    	}

    	if (config.rotate.x) { transformations.push(rotateX(config.rotate.x)); }
    	if (config.rotate.y) { transformations.push(rotateY(config.rotate.y)); }
    	if (config.rotate.z) { transformations.push(rotateZ(config.rotate.z)); }
    	if (config.scale !== 1) {
    		if (config.scale === 0) {
    			/**
    			 * The CSS Transforms matrix interpolation specification
    			 * basically disallows transitions of non-invertible
    			 * matrixes, which means browsers won't transition
    			 * elements with zero scale.
    			 *
    			 * That’s inconvenient for the API and developer
    			 * experience, so we simply nudge their value
    			 * slightly above zero; this allows browsers
    			 * to transition our element as expected.
    			 *
    			 * `0.0002` was the smallest number
    			 * that performed across browsers.
    			 */
    			transformations.push(scale(0.0002));
    		} else {
    			transformations.push(scale(config.scale));
    		}
    	}

    	var transform = {};
    	if (transformations.length) {
    		transform.property = getPrefixedCssProp('transform');
    		/**
    		 * The default computed transform value should be one of:
    		 * undefined || 'none' || 'matrix()' || 'matrix3d()'
    		 */
    		transform.computed = {
    			raw: computed[transform.property],
    			matrix: parse(computed[transform.property])
    		};

    		transformations.unshift(transform.computed.matrix);
    		var product = transformations.reduce(multiply);

    		transform.generated = {
    			initial: ((transform.property) + ": matrix3d(" + (product.join(', ')) + ");"),
    			final: ((transform.property) + ": matrix3d(" + (transform.computed.matrix.join(', ')) + ");")
    		};
    	} else {
    		transform.generated = {
    			initial: '',
    			final: ''
    		};
    	}

    	/**
    	 * Generate transition styles
    	 */
    	var transition = {};
    	if (opacity.generated || transform.generated.initial) {
    		transition.property = getPrefixedCssProp('transition');
    		transition.computed = computed[transition.property];
    		transition.fragments = [];

    		var delay = config.delay;
    		var duration = config.duration;
    		var easing = config.easing;

    		if (opacity.generated) {
    			transition.fragments.push({
    				delayed: ("opacity " + (duration / 1000) + "s " + easing + " " + (delay / 1000) + "s"),
    				instant: ("opacity " + (duration / 1000) + "s " + easing + " 0s")
    			});
    		}

    		if (transform.generated.initial) {
    			transition.fragments.push({
    				delayed: ((transform.property) + " " + (duration / 1000) + "s " + easing + " " + (delay / 1000) + "s"),
    				instant: ((transform.property) + " " + (duration / 1000) + "s " + easing + " 0s")
    			});
    		}

    		/**
    		 * The default computed transition property should be undefined, or one of:
    		 * '' || 'none 0s ease 0s' || 'all 0s ease 0s' || 'all 0s 0s cubic-bezier()'
    		 */
    		var hasCustomTransition =
    			transition.computed && !transition.computed.match(/all 0s|none 0s/);

    		if (hasCustomTransition) {
    			transition.fragments.unshift({
    				delayed: transition.computed,
    				instant: transition.computed
    			});
    		}

    		var composed = transition.fragments.reduce(
    			function (composition, fragment, i) {
    				composition.delayed += i === 0 ? fragment.delayed : (", " + (fragment.delayed));
    				composition.instant += i === 0 ? fragment.instant : (", " + (fragment.instant));
    				return composition
    			},
    			{
    				delayed: '',
    				instant: ''
    			}
    		);

    		transition.generated = {
    			delayed: ((transition.property) + ": " + (composed.delayed) + ";"),
    			instant: ((transition.property) + ": " + (composed.instant) + ";")
    		};
    	} else {
    		transition.generated = {
    			delayed: '',
    			instant: ''
    		};
    	}

    	return {
    		inline: inline,
    		opacity: opacity,
    		position: position,
    		transform: transform,
    		transition: transition
    	}
    }

    /**
     * apply a CSS string to an element using the CSSOM (element.style) rather
     * than setAttribute, which may violate the content security policy.
     *
     * @param {Node}   [el]  Element to receive styles.
     * @param {string} [declaration] Styles to apply.
     */
    function applyStyle (el, declaration) {
    	declaration.split(';').forEach(function (pair) {
    		var ref = pair.split(':');
    		var property = ref[0];
    		var value = ref.slice(1);
    		if (property && value) {
    			el.style[property.trim()] = value.join(':');
    		}
    	});
    }

    function clean(target) {
    	var this$1 = this;

    	var dirty;
    	try {
    		each(tealight(target), function (node) {
    			var id = node.getAttribute('data-sr-id');
    			if (id !== null) {
    				dirty = true;
    				var element = this$1.store.elements[id];
    				if (element.callbackTimer) {
    					window.clearTimeout(element.callbackTimer.clock);
    				}
    				applyStyle(element.node, element.styles.inline.generated);
    				node.removeAttribute('data-sr-id');
    				delete this$1.store.elements[id];
    			}
    		});
    	} catch (e) {
    		return logger.call(this, 'Clean failed.', e.message)
    	}

    	if (dirty) {
    		try {
    			rinse.call(this);
    		} catch (e) {
    			return logger.call(this, 'Clean failed.', e.message)
    		}
    	}
    }

    function destroy() {
    	var this$1 = this;

    	/**
    	 * Remove all generated styles and element ids
    	 */
    	each(this.store.elements, function (element) {
    		applyStyle(element.node, element.styles.inline.generated);
    		element.node.removeAttribute('data-sr-id');
    	});

    	/**
    	 * Remove all event listeners.
    	 */
    	each(this.store.containers, function (container) {
    		var target =
    			container.node === document.documentElement ? window : container.node;
    		target.removeEventListener('scroll', this$1.delegate);
    		target.removeEventListener('resize', this$1.delegate);
    	});

    	/**
    	 * Clear all data from the store
    	 */
    	this.store = {
    		containers: {},
    		elements: {},
    		history: [],
    		sequences: {}
    	};
    }

    function deepAssign(target) {
    	var sources = [], len = arguments.length - 1;
    	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    	if (isObject(target)) {
    		each(sources, function (source) {
    			each(source, function (data, key) {
    				if (isObject(data)) {
    					if (!target[key] || !isObject(target[key])) {
    						target[key] = {};
    					}
    					deepAssign(target[key], data);
    				} else {
    					target[key] = data;
    				}
    			});
    		});
    		return target
    	} else {
    		throw new TypeError('Target must be an object literal.')
    	}
    }

    function isMobile(agent) {
    	if ( agent === void 0 ) agent = navigator.userAgent;

    	return /Android|iPhone|iPad|iPod/i.test(agent)
    }

    var nextUniqueId = (function () {
    	var uid = 0;
    	return function () { return uid++; }
    })();

    function initialize() {
    	var this$1 = this;

    	rinse.call(this);

    	each(this.store.elements, function (element) {
    		var styles = [element.styles.inline.generated];

    		if (element.visible) {
    			styles.push(element.styles.opacity.computed);
    			styles.push(element.styles.transform.generated.final);
    			element.revealed = true;
    		} else {
    			styles.push(element.styles.opacity.generated);
    			styles.push(element.styles.transform.generated.initial);
    			element.revealed = false;
    		}

    		applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	});

    	each(this.store.containers, function (container) {
    		var target =
    			container.node === document.documentElement ? window : container.node;
    		target.addEventListener('scroll', this$1.delegate);
    		target.addEventListener('resize', this$1.delegate);
    	});

    	/**
    	 * Manually invoke delegate once to capture
    	 * element and container dimensions, container
    	 * scroll position, and trigger any valid reveals
    	 */
    	this.delegate();

    	/**
    	 * Wipe any existing `setTimeout` now
    	 * that initialization has completed.
    	 */
    	this.initTimeout = null;
    }

    function animate(element, force) {
    	if ( force === void 0 ) force = {};

    	var pristine = force.pristine || this.pristine;
    	var delayed =
    		element.config.useDelay === 'always' ||
    		(element.config.useDelay === 'onload' && pristine) ||
    		(element.config.useDelay === 'once' && !element.seen);

    	var shouldReveal = element.visible && !element.revealed;
    	var shouldReset = !element.visible && element.revealed && element.config.reset;

    	if (force.reveal || shouldReveal) {
    		return triggerReveal.call(this, element, delayed)
    	}

    	if (force.reset || shouldReset) {
    		return triggerReset.call(this, element)
    	}
    }

    function triggerReveal(element, delayed) {
    	var styles = [
    		element.styles.inline.generated,
    		element.styles.opacity.computed,
    		element.styles.transform.generated.final
    	];
    	if (delayed) {
    		styles.push(element.styles.transition.generated.delayed);
    	} else {
    		styles.push(element.styles.transition.generated.instant);
    	}
    	element.revealed = element.seen = true;
    	applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	registerCallbacks.call(this, element, delayed);
    }

    function triggerReset(element) {
    	var styles = [
    		element.styles.inline.generated,
    		element.styles.opacity.generated,
    		element.styles.transform.generated.initial,
    		element.styles.transition.generated.instant
    	];
    	element.revealed = false;
    	applyStyle(element.node, styles.filter(function (s) { return s !== ''; }).join(' '));
    	registerCallbacks.call(this, element);
    }

    function registerCallbacks(element, isDelayed) {
    	var this$1 = this;

    	var duration = isDelayed
    		? element.config.duration + element.config.delay
    		: element.config.duration;

    	var beforeCallback = element.revealed
    		? element.config.beforeReveal
    		: element.config.beforeReset;

    	var afterCallback = element.revealed
    		? element.config.afterReveal
    		: element.config.afterReset;

    	var elapsed = 0;
    	if (element.callbackTimer) {
    		elapsed = Date.now() - element.callbackTimer.start;
    		window.clearTimeout(element.callbackTimer.clock);
    	}

    	beforeCallback(element.node);

    	element.callbackTimer = {
    		start: Date.now(),
    		clock: window.setTimeout(function () {
    			afterCallback(element.node);
    			element.callbackTimer = null;
    			if (element.revealed && !element.config.reset && element.config.cleanup) {
    				clean.call(this$1, element.node);
    			}
    		}, duration - elapsed)
    	};
    }

    function sequence(element, pristine) {
    	if ( pristine === void 0 ) pristine = this.pristine;

    	/**
    	 * We first check if the element should reset.
    	 */
    	if (!element.visible && element.revealed && element.config.reset) {
    		return animate.call(this, element, { reset: true })
    	}

    	var seq = this.store.sequences[element.sequence.id];
    	var i = element.sequence.index;

    	if (seq) {
    		var visible = new SequenceModel(seq, 'visible', this.store);
    		var revealed = new SequenceModel(seq, 'revealed', this.store);

    		seq.models = { visible: visible, revealed: revealed };

    		/**
    		 * If the sequence has no revealed members,
    		 * then we reveal the first visible element
    		 * within that sequence.
    		 *
    		 * The sequence then cues a recursive call
    		 * in both directions.
    		 */
    		if (!revealed.body.length) {
    			var nextId = seq.members[visible.body[0]];
    			var nextElement = this.store.elements[nextId];

    			if (nextElement) {
    				cue.call(this, seq, visible.body[0], -1, pristine);
    				cue.call(this, seq, visible.body[0], +1, pristine);
    				return animate.call(this, nextElement, { reveal: true, pristine: pristine })
    			}
    		}

    		/**
    		 * If our element isn’t resetting, we check the
    		 * element sequence index against the head, and
    		 * then the foot of the sequence.
    		 */
    		if (
    			!seq.blocked.head &&
    			i === [].concat( revealed.head ).pop() &&
    			i >= [].concat( visible.body ).shift()
    		) {
    			cue.call(this, seq, i, -1, pristine);
    			return animate.call(this, element, { reveal: true, pristine: pristine })
    		}

    		if (
    			!seq.blocked.foot &&
    			i === [].concat( revealed.foot ).shift() &&
    			i <= [].concat( visible.body ).pop()
    		) {
    			cue.call(this, seq, i, +1, pristine);
    			return animate.call(this, element, { reveal: true, pristine: pristine })
    		}
    	}
    }

    function Sequence(interval) {
    	var i = Math.abs(interval);
    	if (!isNaN(i)) {
    		this.id = nextUniqueId();
    		this.interval = Math.max(i, 16);
    		this.members = [];
    		this.models = {};
    		this.blocked = {
    			head: false,
    			foot: false
    		};
    	} else {
    		throw new RangeError('Invalid sequence interval.')
    	}
    }

    function SequenceModel(seq, prop, store) {
    	var this$1 = this;

    	this.head = [];
    	this.body = [];
    	this.foot = [];

    	each(seq.members, function (id, index) {
    		var element = store.elements[id];
    		if (element && element[prop]) {
    			this$1.body.push(index);
    		}
    	});

    	if (this.body.length) {
    		each(seq.members, function (id, index) {
    			var element = store.elements[id];
    			if (element && !element[prop]) {
    				if (index < this$1.body[0]) {
    					this$1.head.push(index);
    				} else {
    					this$1.foot.push(index);
    				}
    			}
    		});
    	}
    }

    function cue(seq, i, direction, pristine) {
    	var this$1 = this;

    	var blocked = ['head', null, 'foot'][1 + direction];
    	var nextId = seq.members[i + direction];
    	var nextElement = this.store.elements[nextId];

    	seq.blocked[blocked] = true;

    	setTimeout(function () {
    		seq.blocked[blocked] = false;
    		if (nextElement) {
    			sequence.call(this$1, nextElement, pristine);
    		}
    	}, seq.interval);
    }

    function reveal(target, options, syncing) {
    	var this$1 = this;
    	if ( options === void 0 ) options = {};
    	if ( syncing === void 0 ) syncing = false;

    	var containerBuffer = [];
    	var sequence$$1;
    	var interval = options.interval || defaults.interval;

    	try {
    		if (interval) {
    			sequence$$1 = new Sequence(interval);
    		}

    		var nodes = tealight(target);
    		if (!nodes.length) {
    			throw new Error('Invalid reveal target.')
    		}

    		var elements = nodes.reduce(function (elementBuffer, elementNode) {
    			var element = {};
    			var existingId = elementNode.getAttribute('data-sr-id');

    			if (existingId) {
    				deepAssign(element, this$1.store.elements[existingId]);

    				/**
    				 * In order to prevent previously generated styles
    				 * from throwing off the new styles, the style tag
    				 * has to be reverted to its pre-reveal state.
    				 */
    				applyStyle(element.node, element.styles.inline.computed);
    			} else {
    				element.id = nextUniqueId();
    				element.node = elementNode;
    				element.seen = false;
    				element.revealed = false;
    				element.visible = false;
    			}

    			var config = deepAssign({}, element.config || this$1.defaults, options);

    			if ((!config.mobile && isMobile()) || (!config.desktop && !isMobile())) {
    				if (existingId) {
    					clean.call(this$1, element);
    				}
    				return elementBuffer // skip elements that are disabled
    			}

    			var containerNode = tealight(config.container)[0];
    			if (!containerNode) {
    				throw new Error('Invalid container.')
    			}
    			if (!containerNode.contains(elementNode)) {
    				return elementBuffer // skip elements found outside the container
    			}

    			var containerId;
    			{
    				containerId = getContainerId(
    					containerNode,
    					containerBuffer,
    					this$1.store.containers
    				);
    				if (containerId === null) {
    					containerId = nextUniqueId();
    					containerBuffer.push({ id: containerId, node: containerNode });
    				}
    			}

    			element.config = config;
    			element.containerId = containerId;
    			element.styles = style(element);

    			if (sequence$$1) {
    				element.sequence = {
    					id: sequence$$1.id,
    					index: sequence$$1.members.length
    				};
    				sequence$$1.members.push(element.id);
    			}

    			elementBuffer.push(element);
    			return elementBuffer
    		}, []);

    		/**
    		 * Modifying the DOM via setAttribute needs to be handled
    		 * separately from reading computed styles in the map above
    		 * for the browser to batch DOM changes (limiting reflows)
    		 */
    		each(elements, function (element) {
    			this$1.store.elements[element.id] = element;
    			element.node.setAttribute('data-sr-id', element.id);
    		});
    	} catch (e) {
    		return logger.call(this, 'Reveal failed.', e.message)
    	}

    	/**
    	 * Now that element set-up is complete...
    	 * Let’s commit any container and sequence data we have to the store.
    	 */
    	each(containerBuffer, function (container) {
    		this$1.store.containers[container.id] = {
    			id: container.id,
    			node: container.node
    		};
    	});
    	if (sequence$$1) {
    		this.store.sequences[sequence$$1.id] = sequence$$1;
    	}

    	/**
    	 * If reveal wasn't invoked by sync, we want to
    	 * make sure to add this call to the history.
    	 */
    	if (syncing !== true) {
    		this.store.history.push({ target: target, options: options });

    		/**
    		 * Push initialization to the event queue, giving
    		 * multiple reveal calls time to be interpreted.
    		 */
    		if (this.initTimeout) {
    			window.clearTimeout(this.initTimeout);
    		}
    		this.initTimeout = window.setTimeout(initialize.bind(this), 0);
    	}
    }

    function getContainerId(node) {
    	var collections = [], len = arguments.length - 1;
    	while ( len-- > 0 ) collections[ len ] = arguments[ len + 1 ];

    	var id = null;
    	each(collections, function (collection) {
    		each(collection, function (container) {
    			if (id === null && container.node === node) {
    				id = container.id;
    			}
    		});
    	});
    	return id
    }

    /**
     * Re-runs the reveal method for each record stored in history,
     * for capturing new content asynchronously loaded into the DOM.
     */
    function sync() {
    	var this$1 = this;

    	each(this.store.history, function (record) {
    		reveal.call(this$1, record.target, record.options, true);
    	});

    	initialize.call(this);
    }

    var polyfill = function (x) { return (x > 0) - (x < 0) || +x; };
    var mathSign = Math.sign || polyfill;

    function getGeometry(target, isContainer) {
    	/**
    	 * We want to ignore padding and scrollbars for container elements.
    	 * More information here: https://goo.gl/vOZpbz
    	 */
    	var height = isContainer ? target.node.clientHeight : target.node.offsetHeight;
    	var width = isContainer ? target.node.clientWidth : target.node.offsetWidth;

    	var offsetTop = 0;
    	var offsetLeft = 0;
    	var node = target.node;

    	do {
    		if (!isNaN(node.offsetTop)) {
    			offsetTop += node.offsetTop;
    		}
    		if (!isNaN(node.offsetLeft)) {
    			offsetLeft += node.offsetLeft;
    		}
    		node = node.offsetParent;
    	} while (node)

    	return {
    		bounds: {
    			top: offsetTop,
    			right: offsetLeft + width,
    			bottom: offsetTop + height,
    			left: offsetLeft
    		},
    		height: height,
    		width: width
    	}
    }

    function getScrolled(container) {
    	var top, left;
    	if (container.node === document.documentElement) {
    		top = window.pageYOffset;
    		left = window.pageXOffset;
    	} else {
    		top = container.node.scrollTop;
    		left = container.node.scrollLeft;
    	}
    	return { top: top, left: left }
    }

    function isElementVisible(element) {
    	if ( element === void 0 ) element = {};

    	var container = this.store.containers[element.containerId];
    	if (!container) { return }

    	var viewFactor = Math.max(0, Math.min(1, element.config.viewFactor));
    	var viewOffset = element.config.viewOffset;

    	var elementBounds = {
    		top: element.geometry.bounds.top + element.geometry.height * viewFactor,
    		right: element.geometry.bounds.right - element.geometry.width * viewFactor,
    		bottom: element.geometry.bounds.bottom - element.geometry.height * viewFactor,
    		left: element.geometry.bounds.left + element.geometry.width * viewFactor
    	};

    	var containerBounds = {
    		top: container.geometry.bounds.top + container.scroll.top + viewOffset.top,
    		right: container.geometry.bounds.right + container.scroll.left - viewOffset.right,
    		bottom:
    			container.geometry.bounds.bottom + container.scroll.top - viewOffset.bottom,
    		left: container.geometry.bounds.left + container.scroll.left + viewOffset.left
    	};

    	return (
    		(elementBounds.top < containerBounds.bottom &&
    			elementBounds.right > containerBounds.left &&
    			elementBounds.bottom > containerBounds.top &&
    			elementBounds.left < containerBounds.right) ||
    		element.styles.position === 'fixed'
    	)
    }

    function delegate(
    	event,
    	elements
    ) {
    	var this$1 = this;
    	if ( event === void 0 ) event = { type: 'init' };
    	if ( elements === void 0 ) elements = this.store.elements;

    	index(function () {
    		var stale = event.type === 'init' || event.type === 'resize';

    		each(this$1.store.containers, function (container) {
    			if (stale) {
    				container.geometry = getGeometry.call(this$1, container, true);
    			}
    			var scroll = getScrolled.call(this$1, container);
    			if (container.scroll) {
    				container.direction = {
    					x: mathSign(scroll.left - container.scroll.left),
    					y: mathSign(scroll.top - container.scroll.top)
    				};
    			}
    			container.scroll = scroll;
    		});

    		/**
    		 * Due to how the sequencer is implemented, it’s
    		 * important that we update the state of all
    		 * elements, before any animation logic is
    		 * evaluated (in the second loop below).
    		 */
    		each(elements, function (element) {
    			if (stale || element.geometry === undefined) {
    				element.geometry = getGeometry.call(this$1, element);
    			}
    			element.visible = isElementVisible.call(this$1, element);
    		});

    		each(elements, function (element) {
    			if (element.sequence) {
    				sequence.call(this$1, element);
    			} else {
    				animate.call(this$1, element);
    			}
    		});

    		this$1.pristine = false;
    	});
    }

    function isTransformSupported() {
    	var style = document.documentElement.style;
    	return 'transform' in style || 'WebkitTransform' in style
    }

    function isTransitionSupported() {
    	var style = document.documentElement.style;
    	return 'transition' in style || 'WebkitTransition' in style
    }

    var version = "4.0.9";

    var boundDelegate;
    var boundDestroy;
    var boundReveal;
    var boundClean;
    var boundSync;
    var config;
    var debug;
    var instance$d;

    function ScrollReveal(options) {
    	if ( options === void 0 ) options = {};

    	var invokedWithoutNew =
    		typeof this === 'undefined' ||
    		Object.getPrototypeOf(this) !== ScrollReveal.prototype;

    	if (invokedWithoutNew) {
    		return new ScrollReveal(options)
    	}

    	if (!ScrollReveal.isSupported()) {
    		logger.call(this, 'Instantiation failed.', 'This browser is not supported.');
    		return mount.failure()
    	}

    	var buffer;
    	try {
    		buffer = config
    			? deepAssign({}, config, options)
    			: deepAssign({}, defaults, options);
    	} catch (e) {
    		logger.call(this, 'Invalid configuration.', e.message);
    		return mount.failure()
    	}

    	try {
    		var container = tealight(buffer.container)[0];
    		if (!container) {
    			throw new Error('Invalid container.')
    		}
    	} catch (e) {
    		logger.call(this, e.message);
    		return mount.failure()
    	}

    	config = buffer;

    	if ((!config.mobile && isMobile()) || (!config.desktop && !isMobile())) {
    		logger.call(
    			this,
    			'This device is disabled.',
    			("desktop: " + (config.desktop)),
    			("mobile: " + (config.mobile))
    		);
    		return mount.failure()
    	}

    	mount.success();

    	this.store = {
    		containers: {},
    		elements: {},
    		history: [],
    		sequences: {}
    	};

    	this.pristine = true;

    	boundDelegate = boundDelegate || delegate.bind(this);
    	boundDestroy = boundDestroy || destroy.bind(this);
    	boundReveal = boundReveal || reveal.bind(this);
    	boundClean = boundClean || clean.bind(this);
    	boundSync = boundSync || sync.bind(this);

    	Object.defineProperty(this, 'delegate', { get: function () { return boundDelegate; } });
    	Object.defineProperty(this, 'destroy', { get: function () { return boundDestroy; } });
    	Object.defineProperty(this, 'reveal', { get: function () { return boundReveal; } });
    	Object.defineProperty(this, 'clean', { get: function () { return boundClean; } });
    	Object.defineProperty(this, 'sync', { get: function () { return boundSync; } });

    	Object.defineProperty(this, 'defaults', { get: function () { return config; } });
    	Object.defineProperty(this, 'version', { get: function () { return version; } });
    	Object.defineProperty(this, 'noop', { get: function () { return false; } });

    	return instance$d ? instance$d : (instance$d = this)
    }

    ScrollReveal.isSupported = function () { return isTransformSupported() && isTransitionSupported(); };

    Object.defineProperty(ScrollReveal, 'debug', {
    	get: function () { return debug || false; },
    	set: function (value) { return (debug = typeof value === 'boolean' ? value : debug); }
    });

    ScrollReveal();

    /* src/components/Header.svelte generated by Svelte v3.37.0 */
    const file$b = "src/components/Header.svelte";

    // (51:2) {#if video}
    function create_if_block$5(ctx) {
    	let youtube;
    	let current;

    	youtube = new Src({
    			props: {
    				videoId: /*video*/ ctx[2],
    				id: /*id*/ ctx[3],
    				class: "ytVideo scroll-reveal",
    				options: /*options*/ ctx[4]
    			},
    			$$inline: true
    		});

    	youtube.$on("ready", /*ready_handler*/ ctx[7]);
    	youtube.$on("end", /*end_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(youtube.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(youtube, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(youtube.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(youtube.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(youtube, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(51:2) {#if video}",
    		ctx
    	});

    	return block;
    }

    // (46:0) <SectionTemplate id="header">
    function create_default_slot$4(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let div1;
    	let current;
    	let if_block = /*video*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(img, "alt", /*alt*/ ctx[0]);
    			if (img.src !== (img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$b, 47, 2, 958);
    			attr_dev(div0, "class", "lg:w-1/2 mx-auto mt-5 ");
    			add_location(div0, file$b, 46, 1, 919);
    			attr_dev(div1, "class", "lg:w-3/5 mx-auto");
    			add_location(div1, file$b, 49, 1, 993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*video*/ ctx[2]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(46:0) <SectionTemplate id=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let sectiontemplate;
    	let current;

    	sectiontemplate = new SectionTemplate({
    			props: {
    				id: "header",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectiontemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectiontemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectiontemplate_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				sectiontemplate_changes.$$scope = { dirty, ctx };
    			}

    			sectiontemplate.$set(sectiontemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectiontemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectiontemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectiontemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onEnd$1(event) {
    	const player = event.detail.target;
    	player.playVideo();
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $videosLoading;
    	validate_store(videosLoading, "videosLoading");
    	component_subscribe($$self, videosLoading, $$value => $$invalidate(9, $videosLoading = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { header = {} } = $$props;
    	const { alt, src, video, id } = header;
    	const royContext = getContext("royState");
    	const options = { playerVars: { autoplay: 0 } };

    	function onReady(event) {
    		const player = event.detail.target;
    		player.mute();

    		ScrollReveal().reveal(`#header`, {
    			afterReveal: e => {
    				player.playVideo();
    			},
    			afterReset: e => {
    				player.stopVideo();
    			},
    			reset: true
    		});

    		videosLoading.update(existing => existing - 1);

    		if ($videosLoading === 0) {
    			loading.set(false);
    		}
    	}

    	const writable_props = ["header"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const ready_handler = e => onReady(e);
    	const end_handler = e => onEnd$1(e);

    	$$self.$$set = $$props => {
    		if ("header" in $$props) $$invalidate(6, header = $$props.header);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		loading,
    		videosLoading,
    		scrollReveal,
    		SectionTemplate,
    		YouTube: Src,
    		ScrollReveal,
    		header,
    		alt,
    		src,
    		video,
    		id,
    		royContext,
    		options,
    		onEnd: onEnd$1,
    		onReady,
    		$videosLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(6, header = $$props.header);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [alt, src, video, id, options, onReady, header, ready_handler, end_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { header: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get header() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.37.0 */
    const file$a = "src/components/Section.svelte";
    const get_cta_slot_changes = dirty => ({});
    const get_cta_slot_context = ctx => ({});

    // (78:4) {:else}
    function create_else_block$1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			attr_dev(img_1, "class", "object-cover object-center rounded scroll-reveal");
    			attr_dev(img_1, "alt", /*id*/ ctx[1]);
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[2])) attr_dev(img_1, "src", img_1_src_value);
    			add_location(img_1, file$a, 78, 3, 1871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(img_1, "alt", /*id*/ ctx[1]);
    			}

    			if (dirty & /*img*/ 4 && img_1.src !== (img_1_src_value = /*img*/ ctx[2])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(78:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#if video}
    function create_if_block_1$1(ctx) {
    	let youtube;
    	let current;

    	youtube = new Src({
    			props: {
    				videoId: /*video*/ ctx[3],
    				id: /*id*/ ctx[1],
    				class: "ytVideo scroll-reveal",
    				options: /*options*/ ctx[8]
    			},
    			$$inline: true
    		});

    	youtube.$on("ready", /*ready_handler*/ ctx[11]);
    	youtube.$on("end", /*end_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(youtube.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(youtube, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const youtube_changes = {};
    			if (dirty & /*video*/ 8) youtube_changes.videoId = /*video*/ ctx[3];
    			if (dirty & /*id*/ 2) youtube_changes.id = /*id*/ ctx[1];
    			youtube.$set(youtube_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(youtube.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(youtube.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(youtube, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(69:4) {#if video}",
    		ctx
    	});

    	return block;
    }

    // (84:5) {#if subtitle}
    function create_if_block$4(ctx) {
    	let br;
    	let t;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = text("subtitle");
    			attr_dev(br, "class", "hidden lg:inline-block");
    			add_location(br, file$a, 84, 10, 2295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(84:5) {#if subtitle}",
    		ctx
    	});

    	return block;
    }

    // (66:0) <SectionTemplate id={`section-${index}`} class="bg-black">
    function create_default_slot$3(ctx) {
    	let div2;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let div1_class_value;
    	let div2_class_value;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*video*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*subtitle*/ ctx[5] && create_if_block$4(ctx);
    	const cta_slot_template = /*#slots*/ ctx[10].cta;
    	const cta_slot = create_slot(cta_slot_template, ctx, /*$$scope*/ ctx[13], get_cta_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(/*title*/ ctx[4]);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			p = element("p");
    			t4 = text(/*desc*/ ctx[6]);
    			t5 = space();
    			if (cta_slot) cta_slot.c();
    			attr_dev(div0, "class", div0_class_value = `${!/*video*/ ctx[3] ? "lg:max-w-1/3" : "md:min-w-1/2"} md:w-1/2 mb-10 md:mb-0 ${/*index*/ ctx[0] % 2 !== 0 && "md:order-1"}`);
    			add_location(div0, file$a, 67, 2, 1550);
    			attr_dev(h2, "class", "w-full title-font lg:text-5xl sm:text-4xl text-3xl mb-4 font-bold text-white uppercase scroll-reveal");
    			add_location(h2, file$a, 82, 4, 2144);
    			attr_dev(p, "class", "w-full text-xl tracking-widest leading-relaxed uppercase scroll-reveal");
    			add_location(p, file$a, 87, 4, 2365);
    			attr_dev(div1, "class", div1_class_value = `md:max-w-1/2 xl:max-w-2/3 lg:px-10 xl:px-18 md:px-16 inline-flex flex-col md:items-start items-center text-center ${!/*centered*/ ctx[7] ? "md:text-left" : ""} `);
    			add_location(div1, file$a, 81, 2, 1974);
    			attr_dev(div2, "class", div2_class_value = `container mx-auto flex md:justify-center px-5 py-10 md:px-6 ${/*index*/ ctx[0] > 0 ? "md:py-24" : ""} md:flex-row flex-col items-center`);
    			add_location(div2, file$a, 66, 1, 1407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			if (if_block1) if_block1.m(h2, null);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);

    			if (cta_slot) {
    				cta_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (!current || dirty & /*video, index*/ 9 && div0_class_value !== (div0_class_value = `${!/*video*/ ctx[3] ? "lg:max-w-1/3" : "md:min-w-1/2"} md:w-1/2 mb-10 md:mb-0 ${/*index*/ ctx[0] % 2 !== 0 && "md:order-1"}`)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*title*/ 16) set_data_dev(t1, /*title*/ ctx[4]);

    			if (/*subtitle*/ ctx[5]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(h2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*desc*/ 64) set_data_dev(t4, /*desc*/ ctx[6]);

    			if (cta_slot) {
    				if (cta_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(cta_slot, cta_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_cta_slot_changes, get_cta_slot_context);
    				}
    			}

    			if (!current || dirty & /*centered*/ 128 && div1_class_value !== (div1_class_value = `md:max-w-1/2 xl:max-w-2/3 lg:px-10 xl:px-18 md:px-16 inline-flex flex-col md:items-start items-center text-center ${!/*centered*/ ctx[7] ? "md:text-left" : ""} `)) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*index*/ 1 && div2_class_value !== (div2_class_value = `container mx-auto flex md:justify-center px-5 py-10 md:px-6 ${/*index*/ ctx[0] > 0 ? "md:py-24" : ""} md:flex-row flex-col items-center`)) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(cta_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(cta_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (cta_slot) cta_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(66:0) <SectionTemplate id={`section-${index}`} class=\\\"bg-black\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let sectiontemplate;
    	let current;

    	sectiontemplate = new SectionTemplate({
    			props: {
    				id: `section-${/*index*/ ctx[0]}`,
    				class: "bg-black",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectiontemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectiontemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectiontemplate_changes = {};
    			if (dirty & /*index*/ 1) sectiontemplate_changes.id = `section-${/*index*/ ctx[0]}`;

    			if (dirty & /*$$scope, index, centered, desc, subtitle, title, video, id, img*/ 8447) {
    				sectiontemplate_changes.$$scope = { dirty, ctx };
    			}

    			sectiontemplate.$set(sectiontemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectiontemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectiontemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectiontemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onEnd(event, index) {
    	const player = event.detail.target;
    	player.playVideo();
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $videosLoading;
    	let $scrollReveal;
    	validate_store(videosLoading, "videosLoading");
    	component_subscribe($$self, videosLoading, $$value => $$invalidate(14, $videosLoading = $$value));
    	validate_store(scrollReveal, "scrollReveal");
    	component_subscribe($$self, scrollReveal, $$value => $$invalidate(15, $scrollReveal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['cta']);
    	let { index = 0 } = $$props;
    	let { id = "" } = $$props;
    	let { img = "" } = $$props;
    	let { video = "" } = $$props;
    	let { title = "" } = $$props;
    	let { subtitle = "" } = $$props;
    	let { desc = "" } = $$props;
    	let { centered = false } = $$props;
    	const royContext = getContext("royState");
    	const options = { playerVars: { autoplay: 0 } };

    	function onReady(event, index) {
    		const player = event.detail.target;
    		player.mute();
    		videosLoading.update(existing => existing - 1);

    		ScrollReveal().reveal(`#section-${index}`, {
    			afterReveal: e => {
    				player.playVideo();
    			},
    			afterReset: e => {
    				player.stopVideo();
    			},
    			reset: true
    		});

    		if ($videosLoading === 0) {
    			loading.set(false);

    			if ($scrollReveal) {
    				ScrollReveal().reveal(".bigwall .scroll-reveal", {
    					delay: 500,
    					useDelay: "onload",
    					reset: true
    				});

    				ScrollReveal().reveal(".bigwall .scroll-reveal:first-child", { delay: 0, interval: 150, reset: true });
    			}
    		}
    	}

    	const writable_props = ["index", "id", "img", "video", "title", "subtitle", "desc", "centered"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	const ready_handler = e => onReady(e, index);
    	const end_handler = e => onEnd(e);

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("img" in $$props) $$invalidate(2, img = $$props.img);
    		if ("video" in $$props) $$invalidate(3, video = $$props.video);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(5, subtitle = $$props.subtitle);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("centered" in $$props) $$invalidate(7, centered = $$props.centered);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		loading,
    		videosLoading,
    		scrollReveal,
    		SectionTemplate,
    		ScrollReveal,
    		YouTube: Src,
    		index,
    		id,
    		img,
    		video,
    		title,
    		subtitle,
    		desc,
    		centered,
    		royContext,
    		options,
    		onEnd,
    		onReady,
    		$videosLoading,
    		$scrollReveal
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("img" in $$props) $$invalidate(2, img = $$props.img);
    		if ("video" in $$props) $$invalidate(3, video = $$props.video);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(5, subtitle = $$props.subtitle);
    		if ("desc" in $$props) $$invalidate(6, desc = $$props.desc);
    		if ("centered" in $$props) $$invalidate(7, centered = $$props.centered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		id,
    		img,
    		video,
    		title,
    		subtitle,
    		desc,
    		centered,
    		options,
    		onReady,
    		slots,
    		ready_handler,
    		end_handler,
    		$$scope
    	];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			index: 0,
    			id: 1,
    			img: 2,
    			video: 3,
    			title: 4,
    			subtitle: 5,
    			desc: 6,
    			centered: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get index() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get img() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Divider.svelte generated by Svelte v3.37.0 */

    const file$9 = "src/components/Divider.svelte";

    function create_fragment$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "svelte-1coig5y");
    			add_location(div, file$9, 8, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/GalleryItem.svelte generated by Svelte v3.37.0 */

    const file$8 = "src/components/GalleryItem.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*item*/ ctx[2].title + "";
    	let t1;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			attr_dev(img, "class", "object-cover object-center w-full mx-auto rounded-lg border-2 border-transparent group-hover:border-aurora transition-color ease-out duration-300");
    			if (img.src !== (img_src_value = /*item*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[2].title);
    			add_location(img, file$8, 11, 19, 313);
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$8, 11, 4, 298);
    			attr_dev(h3, "class", "text-lg font-bold tracking-wider text-white uppercase");
    			add_location(h3, file$8, 14, 8, 546);
    			attr_dev(div0, "class", "mt-2");
    			add_location(div0, file$8, 13, 4, 519);
    			attr_dev(div1, "class", div1_class_value = `group w-full max-w-xs text-center col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform ease-out duration-300 ${/*classList*/ ctx[0]}`);
    			add_location(div1, file$8, 8, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 4 && img.src !== (img_src_value = /*item*/ ctx[2].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*item*/ 4 && img_alt_value !== (img_alt_value = /*item*/ ctx[2].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}

    			if (dirty & /*item*/ 4 && t1_value !== (t1_value = /*item*/ ctx[2].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*classList*/ 1 && div1_class_value !== (div1_class_value = `group w-full max-w-xs text-center col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform ease-out duration-300 ${/*classList*/ ctx[0]}`)) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GalleryItem", slots, []);
    	let { class: classList = "" } = $$props;
    	let { href: link = "" } = $$props;
    	let { item = {} } = $$props;
    	const writable_props = ["class", "href", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, classList = $$props.class);
    		if ("href" in $$props) $$invalidate(1, link = $$props.href);
    		if ("item" in $$props) $$invalidate(2, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ classList, link, item });

    	$$self.$inject_state = $$props => {
    		if ("classList" in $$props) $$invalidate(0, classList = $$props.classList);
    		if ("link" in $$props) $$invalidate(1, link = $$props.link);
    		if ("item" in $$props) $$invalidate(2, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classList, link, item];
    }

    class GalleryItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { class: 0, href: 1, item: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryItem",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Gallery.svelte generated by Svelte v3.37.0 */
    const file$7 = "src/components/Gallery.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (16:4) {#if title}
    function create_if_block$3(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*title*/ ctx[2]);
    			attr_dev(h2, "class", "text-xl font-medium text-white md:text-2xl");
    			add_location(h2, file$7, 16, 8, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(16:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (21:12) {#each items as item, i}
    function create_each_block$2(ctx) {
    	let galleryitem;
    	let current;

    	galleryitem = new GalleryItem({
    			props: {
    				href: `#section-${/*i*/ ctx[6]}`,
    				item: /*item*/ ctx[4],
    				class: /*direction*/ ctx[1] !== "vertical" && /*i*/ ctx[6] === /*items*/ ctx[0].length - 1 && "col-start-2" || ""
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(galleryitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(galleryitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const galleryitem_changes = {};
    			if (dirty & /*items*/ 1) galleryitem_changes.item = /*item*/ ctx[4];
    			if (dirty & /*direction, items*/ 3) galleryitem_changes.class = /*direction*/ ctx[1] !== "vertical" && /*i*/ ctx[6] === /*items*/ ctx[0].length - 1 && "col-start-2" || "";
    			galleryitem.$set(galleryitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(galleryitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(galleryitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(galleryitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(21:12) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    // (15:0) <SectionTemplate class="container p-6 mx-auto bg-black">
    function create_default_slot$2(ctx) {
    	let t;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let current;
    	let if_block = /*title*/ ctx[2] && create_if_block$3(ctx);
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", div0_class_value = `grid mt-8 ${/*galleryDirection*/ ctx[3]}`);
    			add_location(div0, file$7, 19, 8, 581);
    			attr_dev(div1, "class", "flex items-center justify-center");
    			add_location(div1, file$7, 18, 4, 526);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*items, direction*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*galleryDirection*/ 8 && div0_class_value !== (div0_class_value = `grid mt-8 ${/*galleryDirection*/ ctx[3]}`)) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(15:0) <SectionTemplate class=\\\"container p-6 mx-auto bg-black\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let sectiontemplate;
    	let current;

    	sectiontemplate = new SectionTemplate({
    			props: {
    				class: "container p-6 mx-auto bg-black",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectiontemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectiontemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectiontemplate_changes = {};

    			if (dirty & /*$$scope, galleryDirection, items, direction, title*/ 143) {
    				sectiontemplate_changes.$$scope = { dirty, ctx };
    			}

    			sectiontemplate.$set(sectiontemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectiontemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectiontemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectiontemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	let { items } = $$props;
    	let { direction = "horizontal" } = $$props;
    	let { title = "" } = $$props;
    	let galleryDirection = "";

    	galleryDirection = direction === "vertical"
    	? "gap-4 grid-row-auto"
    	: "gap-8 grid-cols-4 lg:grid-cols-5";

    	const writable_props = ["items", "direction", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("direction" in $$props) $$invalidate(1, direction = $$props.direction);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		SectionTemplate,
    		GalleryItem,
    		items,
    		direction,
    		title,
    		galleryDirection
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("direction" in $$props) $$invalidate(1, direction = $$props.direction);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("galleryDirection" in $$props) $$invalidate(3, galleryDirection = $$props.galleryDirection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, direction, title, galleryDirection];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { items: 0, direction: 1, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[0] === undefined && !("items" in props)) {
    			console.warn("<Gallery> was created without expected prop 'items'");
    		}
    	}

    	get items() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Gallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Gallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Content.svelte generated by Svelte v3.37.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (16:1) {#if i < 1}
    function create_if_block$2(ctx) {
    	let gallery;
    	let current;

    	gallery = new Gallery({
    			props: { items: /*sections*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallery_changes = {};
    			if (dirty & /*sections*/ 1) gallery_changes.items = /*sections*/ ctx[0];
    			gallery.$set(gallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:1) {#if i < 1}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#each sections as section, i}
    function create_each_block$1(ctx) {
    	let t0;
    	let section;
    	let t1;
    	let divider;
    	let current;
    	let if_block = /*i*/ ctx[3] < 1 && create_if_block$2(ctx);
    	const section_spread_levels = [{ index: /*i*/ ctx[3] }, /*section*/ ctx[1]];
    	let section_props = {};

    	for (let i = 0; i < section_spread_levels.length; i += 1) {
    		section_props = assign(section_props, section_spread_levels[i]);
    	}

    	section = new Section({ props: section_props, $$inline: true });
    	divider = new Divider({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(section.$$.fragment);
    			t1 = space();
    			create_component(divider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(divider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[3] < 1) if_block.p(ctx, dirty);

    			const section_changes = (dirty & /*sections*/ 1)
    			? get_spread_update(section_spread_levels, [section_spread_levels[0], get_spread_object(/*section*/ ctx[1])])
    			: {};

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(section.$$.fragment, local);
    			transition_in(divider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(section.$$.fragment, local);
    			transition_out(divider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(divider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:0) {#each sections as section, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*sections*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sections*/ 1) {
    				each_value = /*sections*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, []);
    	let { sections = [] } = $$props;
    	const writable_props = ["sections"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("sections" in $$props) $$invalidate(0, sections = $$props.sections);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		SectionTemplate,
    		Section,
    		Divider,
    		Gallery,
    		sections,
    		ScrollReveal
    	});

    	$$self.$inject_state = $$props => {
    		if ("sections" in $$props) $$invalidate(0, sections = $$props.sections);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sections];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { sections: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get sections() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sections(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Soundboard.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$6 = "src/components/Soundboard.svelte";

    // (35:4) 
    function create_cta_slot(ctx) {
    	let button;
    	let img_1;
    	let img_1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img_1 = element("img");
    			attr_dev(img_1, "alt", "press button to hear sound clips from anthony edwards");
    			if (img_1.src !== (img_1_src_value = "media/button-face.svg")) attr_dev(img_1, "src", img_1_src_value);
    			add_location(img_1, file$6, 34, 185, 915);
    			attr_dev(button, "slot", "cta");
    			attr_dev(button, "class", "w-full max-w-200px mx-auto mt-4 duration-200 hover:opacity-90 focus:outline-none transform scale-100 active:scale-95 scroll-reveal");
    			add_location(button, file$6, 34, 4, 734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img_1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_cta_slot.name,
    		type: "slot",
    		source: "(35:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				index: 1,
    				title: /*title*/ ctx[0],
    				id: /*id*/ ctx[1],
    				desc: /*desc*/ ctx[2],
    				img: /*img*/ ctx[3],
    				centered: true,
    				$$slots: { cta: [create_cta_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};
    			if (dirty & /*title*/ 1) section_changes.title = /*title*/ ctx[0];
    			if (dirty & /*id*/ 2) section_changes.id = /*id*/ ctx[1];
    			if (dirty & /*desc*/ 4) section_changes.desc = /*desc*/ ctx[2];
    			if (dirty & /*img*/ 8) section_changes.img = /*img*/ ctx[3];

    			if (dirty & /*$$scope*/ 256) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Soundboard", slots, []);
    	let { title = "" } = $$props;
    	let { id = "" } = $$props;
    	let { desc = "" } = $$props;
    	let { img = "" } = $$props;
    	let { audio = [] } = $$props;
    	let index = 0;
    	let sounds = [];

    	function handleClick(e) {
    		console.log("click");
    		sounds[index].play();
    		index += 1;
    		audio.length === index && (index = 0);
    	}

    	onMount(() => {
    		sounds = audio.map((src, i) => {
    			let sound = new Audio();
    			sound.src = src;
    			return sound;
    		});
    	});

    	const writable_props = ["title", "id", "desc", "img", "audio"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Soundboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    		if ("img" in $$props) $$invalidate(3, img = $$props.img);
    		if ("audio" in $$props) $$invalidate(5, audio = $$props.audio);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Section,
    		Divider,
    		title,
    		id,
    		desc,
    		img,
    		audio,
    		index,
    		sounds,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    		if ("img" in $$props) $$invalidate(3, img = $$props.img);
    		if ("audio" in $$props) $$invalidate(5, audio = $$props.audio);
    		if ("index" in $$props) index = $$props.index;
    		if ("sounds" in $$props) sounds = $$props.sounds;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, id, desc, img, handleClick, audio];
    }

    class Soundboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			title: 0,
    			id: 1,
    			desc: 2,
    			img: 3,
    			audio: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Soundboard",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get title() {
    		throw new Error("<Soundboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Soundboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Soundboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Soundboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Soundboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Soundboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get img() {
    		throw new Error("<Soundboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<Soundboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get audio() {
    		throw new Error("<Soundboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set audio(value) {
    		throw new Error("<Soundboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Hero.svelte generated by Svelte v3.37.0 */
    const file$5 = "src/components/Hero.svelte";

    // (4:0) <SectionTemplate>
    function create_default_slot$1(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let p;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "A1 FROM DAY 1";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Copper mug try-hard pitchfork pour-over freegan heirloom neutra air plant cold-pressed tacos poke beard tote bag. Heirloom echo park mlkshk tote bag selvage hot chicken authentic tumeric truffaut hexagon try-hard chambray.";
    			attr_dev(img, "class", "object-cover object-center rounded");
    			attr_dev(img, "alt", "hero");
    			if (img.src !== (img_src_value = "https://dummyimage.com/720x600")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$5, 6, 7, 253);
    			attr_dev(div0, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0");
    			add_location(div0, file$5, 5, 5, 181);
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-white");
    			add_location(h1, file$5, 9, 7, 495);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$5, 10, 7, 593);
    			attr_dev(div1, "class", "lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center");
    			add_location(div1, file$5, 8, 5, 367);
    			attr_dev(div2, "class", "container mx-auto flex px-5 py-24 md:flex-row flex-col items-center");
    			add_location(div2, file$5, 4, 1, 94);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:0) <SectionTemplate>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let sectiontemplate;
    	let current;

    	sectiontemplate = new SectionTemplate({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectiontemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectiontemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectiontemplate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				sectiontemplate_changes.$$scope = { dirty, ctx };
    			}

    			sectiontemplate.$set(sectiontemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectiontemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectiontemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectiontemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionTemplate });
    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.37.0 */

    const file$4 = "src/components/Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let div;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let a1;
    	let t2;
    	let span;
    	let a2;
    	let svg0;
    	let path0;
    	let t3;
    	let a3;
    	let svg1;
    	let path1;
    	let t4;
    	let a4;
    	let svg2;
    	let rect;
    	let path2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			a1 = element("a");
    			a1.textContent = "© 2021 Minnesota Timberwolves";
    			t2 = space();
    			span = element("span");
    			a2 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t3 = space();
    			a3 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t4 = space();
    			a4 = element("a");
    			svg2 = svg_element("svg");
    			rect = svg_element("rect");
    			path2 = svg_element("path");
    			attr_dev(img, "class", "w-full max-w-100px");
    			if (img.src !== (img_src_value = "https://cdn.nba.com/teams/static/timberwolves/images/logo/Wolves_Primary_Color.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Minnesota Timberwolves Footer Logo");
    			add_location(img, file$4, 3, 6, 205);
    			attr_dev(a0, "href", "https://www.nba.com/timberwolves");
    			attr_dev(a0, "class", "max-w-1/4");
    			add_location(a0, file$4, 2, 4, 137);
    			attr_dev(a1, "href", "https://www.nba.com/timberwolves");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "uppercase md:ml-2");
    			add_location(a1, file$4, 5, 4, 381);
    			attr_dev(path0, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path0, file$4, 9, 10, 828);
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-5 h-5");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$4, 8, 8, 692);
    			attr_dev(a2, "href", "https://www.facebook.com/MNTimberwolves/");
    			add_location(a2, file$4, 7, 6, 632);
    			attr_dev(path1, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path1, file$4, 14, 10, 1142);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$4, 13, 8, 1006);
    			attr_dev(a3, "href", "https://twitter.com/Timberwolves");
    			attr_dev(a3, "class", "ml-3");
    			add_location(a3, file$4, 12, 6, 941);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$4, 19, 10, 1578);
    			attr_dev(path2, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path2, file$4, 20, 10, 1651);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$4, 18, 8, 1428);
    			attr_dev(a4, "href", "https://www.instagram.com/timberwolves/");
    			attr_dev(a4, "class", "ml-3");
    			add_location(a4, file$4, 17, 6, 1356);
    			attr_dev(span, "class", "inline-flex sm:ml-auto sm:mt-0 mt-4 items-center justify-center sm:justify-start");
    			add_location(span, file$4, 6, 4, 530);
    			attr_dev(div, "class", "container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col");
    			add_location(div, file$4, 1, 2, 52);
    			attr_dev(footer, "class", "bg-midnight text-white body-font");
    			add_location(footer, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a0);
    			append_dev(a0, img);
    			append_dev(div, t0);
    			append_dev(div, a1);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(span, a2);
    			append_dev(a2, svg0);
    			append_dev(svg0, path0);
    			append_dev(span, t3);
    			append_dev(span, a3);
    			append_dev(a3, svg1);
    			append_dev(svg1, path1);
    			append_dev(span, t4);
    			append_dev(span, a4);
    			append_dev(a4, svg2);
    			append_dev(svg2, rect);
    			append_dev(svg2, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Extra.svelte generated by Svelte v3.37.0 */

    const file$3 = "src/components/Extra.svelte";

    // (8:0) {:else}
    function create_else_block(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*data*/ ctx[0].quote) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "p-5 bg-white text-midnight rounded-xl text-body md:text-xl tracking-wide");
    			add_location(div, file$3, 8, 1, 106);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(8:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if data.tweet}
    function create_if_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*data*/ ctx[0].tweet + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].tweet + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(6:0) {#if data.tweet}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {:else}
    function create_else_block_1(ctx) {
    	let html_tag;
    	let raw_value = /*data*/ ctx[0].stat + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].stat + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(13:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if data.quote}
    function create_if_block_1(ctx) {
    	let p0;
    	let t0;
    	let t1_value = /*data*/ ctx[0].quote + "";
    	let t1;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = /*data*/ ctx[0].source + "";
    	let t5;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("\"");
    			t1 = text(t1_value);
    			t2 = text("\"");
    			t3 = space();
    			p1 = element("p");
    			t4 = text("—");
    			t5 = text(t5_value);
    			add_location(p0, file$3, 10, 3, 215);
    			attr_dev(p1, "class", "text-right uppercase");
    			add_location(p1, file$3, 11, 3, 250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*data*/ ctx[0].quote + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*data*/ ctx[0].source + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(10:2) {#if data.quote}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].tweet) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "m-5");
    			add_location(div, file$3, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Extra", slots, []);
    	let { data = {} } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Extra> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Extra extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Extra",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<Extra>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Extra>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/BigWall.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/components/BigWall.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (22:2) {#each extra.data as item, i}
    function create_each_block_1(ctx) {
    	let div;
    	let extra;
    	let t;
    	let current;

    	extra = new Extra({
    			props: { data: /*item*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(extra.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "w-full scroll-reveal break-inside-avoid overflow-hidden");
    			add_location(div, file$2, 22, 3, 851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(extra, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const extra_changes = {};
    			if (dirty & /*extras*/ 1) extra_changes.data = /*item*/ ctx[4];
    			extra.$set(extra_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(extra.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(extra.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(extra);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(22:2) {#each extra.data as item, i}",
    		ctx
    	});

    	return block;
    }

    // (19:0) <SectionTemplate class="bigwall py-10">
    function create_default_slot(ctx) {
    	let h2;
    	let t0_value = /*extra*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let div;
    	let current;
    	let each_value_1 = /*extra*/ ctx[1].data;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "w-full title-font lg:text-5xl sm:text-4xl text-3xl mb-4 font-bold text-center text-white uppercase");
    			add_location(h2, file$2, 19, 1, 573);
    			attr_dev(div, "class", "container mx-auto column-count-1 md:column-count-2 lg:column-count-3 column-gap-0 overflow-hidden");
    			add_location(div, file$2, 20, 1, 704);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*extras*/ 1) && t0_value !== (t0_value = /*extra*/ ctx[1].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*extras*/ 1) {
    				each_value_1 = /*extra*/ ctx[1].data;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(19:0) <SectionTemplate class=\\\"bigwall py-10\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#each extras as extra, i}
    function create_each_block(ctx) {
    	let sectiontemplate;
    	let t;
    	let divider;
    	let current;

    	sectiontemplate = new SectionTemplate({
    			props: {
    				class: "bigwall py-10",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider = new Divider({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sectiontemplate.$$.fragment);
    			t = space();
    			create_component(divider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectiontemplate, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(divider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sectiontemplate_changes = {};

    			if (dirty & /*$$scope, extras*/ 65) {
    				sectiontemplate_changes.$$scope = { dirty, ctx };
    			}

    			sectiontemplate.$set(sectiontemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectiontemplate.$$.fragment, local);
    			transition_in(divider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectiontemplate.$$.fragment, local);
    			transition_out(divider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectiontemplate, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(divider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:0) {#each extras as extra, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*extras*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*extras*/ 1) {
    				each_value = /*extras*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BigWall", slots, []);
    	let { extras = [] } = $$props;

    	// let shuffled = extras.sort(() => Math.random() - 0.5);
    	onMount(() => {
    		const script = document.createElement("script");
    		script.setAttribute("src", "https://platform.twitter.com/widgets.js");
    		document.getElementsByClassName("twitter-tweet")[0].appendChild(script);
    	});

    	const writable_props = ["extras"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BigWall> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("extras" in $$props) $$invalidate(0, extras = $$props.extras);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		SectionTemplate,
    		Extra,
    		Divider,
    		extras
    	});

    	$$self.$inject_state = $$props => {
    		if ("extras" in $$props) $$invalidate(0, extras = $$props.extras);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [extras];
    }

    class BigWall extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { extras: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BigWall",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get extras() {
    		throw new Error("<BigWall>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extras(value) {
    		throw new Error("<BigWall>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Loading.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/components/Loading.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", "loading screen");
    			attr_dev(img, "class", "max-w-200px");
    			if (img.src !== (img_src_value = "media/lockup.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 4, 1, 167);
    			attr_dev(div, "class", "h-screen w-screen bg-midnight flex items-center justify-center fixed z-20");
    			add_location(div, file$1, 3, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loading", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade });
    	return [];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var data = {
    	title: "A1 from Day 1",
    	logo: {
    		src: "media/lockup.svg",
    		alt: "a1 from day 1"
    	},
    	header: {
    		id: "header",
    		src: "media/header.svg",
    		alt: "anthony edwards",
    		video: "ceyCVwQumec"
    	},
    	stats: [
    		{
    			title: "1,000 Points",
    			id: "points",
    			desc: "Fifth-youngest player in NBA history to reach 1,000 behind LeBron James, Kobe Bryant, Kevin Durant and Devin Booker.",
    			img: "media/tw21-roy_stat_points.jpg",
    			video: "bydLfdiNSzw",
    		},
    		{
    			title: "100 Triples",
    			id: "triples",
    			desc: "Third-youngest player in NBA history to connect on 100 three pointers behind Kobe Bryant and Kevin Knox.",
    			img: "media/tw21-roy_stat_triples.jpg",
    			video: "vlDRn-TlnHM",
    		},
    		{
    			title: "42 Point Night",
    			id: "fortytwo",
    			desc: "His 42 points are the most ever by a Timberwolves rookie and became the third-youngest player in NBA history to score 40+ points behind LeBron James and Kevin Durant.",
    			img: "media/tw21-roy_stat_fortytwo.jpg",
    			video: "oo7rpG2IKEo",
    		},
    		{
    			title: "Memorable March",
    			id: "rotm",
    			desc: "His 24.2 ppg are third-most in a calendar month by a teenager in NBA history, trailing only Carmelo Anthony and Lebron James.",
    			img: "media/tw21-roy_stat_march.jpg",
    			video: "__M3-3tg6Pc",
    		},
    		{
    			title: "5 Game Span",
    			id: "fivegame",
    			desc: "Tallied 153 points over a five-game span from Mar. 11-18, the most points ever in a five-game stretch by a player 19 years or younger.​",
    			img: "media/tw21-roy_stat_fivegame.jpg",
    			video: "_epzX4fSiZk",
    		}
    	],
    	extras : [
    		{
    			title : "Additional Stats",
    			data : [
    				{
    					stat: "<p>On Tuesday May 17, Anthony Edwards was named the <strong>Kia NBA Western Conference Rookie of the Month for May</strong>, becoming the third Timberwolves player to win the award multiple times (March and April 2021), joining Karl-Anthony Towns (November, December 2015, January, February, March, April 2016) and Andrew Wiggins (November, December 2014, January, February, April 2015). Edwards, who led the Timberwolves to an 8-8 record in April, ended the month <strong>scoring 345 points, grabbing 82 rebounds and handing out 53 assists</strong>. The last rookie to reach those levels in all three categories in one calendar month was Blake Griffin in January 2011 (364 points, 188 rebounds, 61 assists). The only other Timberwolves rookie to have a month like that was Christian Laettner in March 1993 (347 points, 193 rebounds, 70 assists). Edwards totaled <strong>44 three-pointers in April</strong>, the most by a rookie in the NBA in a single month, passing Landry Shamet who made 43 threes in March of 2019. Edwards averaged 21.6 points, 5.1 rebounds, 3.3 assists and 1.6 steals in 34.4 minutes per game in April. <strong>No other rookie in the NBA averaged 20+ points in April.</strong></p>"
    				},
    				{
    					stat: "<p>Edwards ranks in the <strong>top 10</strong> amongst rookies in multiple statistical categories, including first among rookies in points per game (18.9), tied for sixth in steals (1.1) and eighth in assists per game (2.9). Edwards also ranks first amongst rookies in total points (1288), second in total three-pointers among rookies (159), tied for second in total steals (77), third among rookies in total rebounds (323) and fifth in total assists (194).</p>"
    				},
    				{
    					stat: "<p>He recorded <strong>at least one steal in 25 straight games</strong> from Feb. 24-Apr.16, the longest ever run by a Timberwolves rookie (Pooh Richardson, 15 games twice in the 1989-90 season). Edwards’ 25 game streak with at least one steal was the <strong>second-longest by a rookie in NBA history</strong> (Chris Paul- 31 2005-06).</p>"
    				},
    				{
    					stat: "<p>With his first three pointer of the night on Mar. 31 vs New York, Edwards (19y-238d) connected on his 100th triple of the season, becoming the <strong>youngest player in Timberwolves history to reach 100 three-pointers</strong> (previous youngest was Stephon Marbury at 20y-058d). He also became the <strong>third-youngest player in NBA history to connect on 100 threes</strong> (Kobe Bryant: 19y-176d, Kevin Knox: 19y, 218d).</p>"
    				},
    				{
    					stat: "<p>On Mar. 18 at Phoenix, he tallied a <strong>career-high 42 points</strong> on 13-of-31 shooting, including 4-of-13 from beyond the arc and 8-of-13 from the free throw line, becoming the first Timberwolves rookie to score 40+ points in a game. With his 42 points against Phoenix on Mar. 18 at age 19y-225d, he became the <strong>third-youngest player in NBA history to tally 40+ points</strong> (LeBron James, 2003-04 at 19y-88d and Kevin Durant, 2007-08 at 19y-200d).</p>"
    				},
    				{
    					stat: "<p>Over a five-game stretch from Mar. 11-Mar. 18, Edwards totaled <strong>153 points, the most points ever in NBA history over a five-game span</strong> by a player 19 years or younger (LeBron James, 151 points from Nov 6-15, 2004).</p>"
    				},
    				{
    					stat: "<p>On May 5 vs. Memphis, Anthony Edwards erupted for a <strong>career-high-tying 42 points</strong> on a career-high 17-of-22 shooting, including a career-high 8-of-9 from deep. Edwards collected his second 40+ point game of the season, becoming the second player 19 years or younger to have multiple 40-point games (LeBron James, three in 2003-04). He also became the <strong>first 19-year-old in NBA history to have 40+ points and 5+ threes in a game.</strong></p>"
    				},
    				{
    					stat: "<p>With his six rebounds and a career-high seven assists against the Grizzlies on May 5th, Edwards joined LeBron James (2004) and Kevin Durant (2008) as the <strong>only teenagers in NBA history to have 40+ points/5+ rebounds/5+ assists in a game.</strong></p>"
    				},
    				{
    					stat: "<p>With his eight three-pointers on May 5th vs. Memphis, Edwards set the Timberwolves rookie <strong>single-game record for most threes in a game</strong>. With his third trey of the night, he registered his 150th three-pointer of the season. At 19y-273d, he is the <strong>youngest player in NBA history to reach 150 threes.</strong></p>"
    				},
    				{
    					stat: "<p>Edwards currently has 32 20+ point games this season, leading all NBA rookies. The Timberwolves rookie record for 20+ point games is 33 by Christian Laettner in 1993.</p>"
    				},
    			],
    		},
    		{
    			title : "What They're Saying",
    			data :	[
    				{
    					quote: "I definitely think he can be a better player than I was. He has all the tools.",
    					source: "Dwyane Wade",
    				},
    				{
    					quote: "He can be a big player. [...] He's got a powerful game. And he can do a little bit of everything. [...] He can do a lot of things. You talk about a three-level scorer. He's elite. I see star, All-Star, possibly superstar. Sky's the limit for the kid.",
    					source: "Paul George",
    				},
    				{
    					tweet:`<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/theantedwards_?ref_src=twsrc%5Etfw">@theantedwards_</a> is the ROY 🏆...</p>&mdash; Karl-Anthony Towns (@KarlTowns) <a href="https://twitter.com/KarlTowns/status/1390177752662253568?ref_src=twsrc%5Etfw">May 6, 2021</a></blockquote>`,
    				},
    				{
    					quote: "First of all, he is a great kid. Obviously, we know what he can do with the game of basketball. He showed that tonight, been showing throughout the course of his rookie season so far. Hopefully, for me, throughout my career, I inspired the younger generation to want to be part of this league and want to be great.",
    					source: "LeBron James",
    				},
    				{
    					quote: "He’s at the top of the scouting report. He and Karl-Anthony Towns. Towns is still 22 points per game, but Edwards is shooting 21 times a game over the last five, so he’s looking to score on a Bradley Beal type of level.",
    					source: "Frank Vogel",
    				},
    				{
    					tweet: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">ant man getting to it right now ‼️‼️</p>&mdash; Ja Morant (@JaMorant) <a href="https://twitter.com/JaMorant/status/1387951152910700545?ref_src=twsrc%5Etfw">April 30, 2021</a></blockquote>`,
    				},
    			],
    		},
    	],
    	soundboard:{
    		title: "Hear the Sounds",
    		id: "soundboard",
    		desc: "The best of Ant from this season",
    		img: "media/hype.jpg",
    		audio: [
    			"media/A1fromDay1.mp3",
    			"media/CleanupAisle3.mp3",
    			"media/ILikeYourAccent.mp3",
    			"media/WhateverYouNeedMetoPlay.mp3",
    		]
    	}
    };

    /* src/App.svelte generated by Svelte v3.37.0 */
    const file = "src/App.svelte";

    // (24:1) {#if $loading}
    function create_if_block(ctx) {
    	let loading_1;
    	let current;
    	loading_1 = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(24:1) {#if $loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let tailwind;
    	let t0;
    	let main;
    	let t1;
    	let nav;
    	let t2;
    	let header_1;
    	let t3;
    	let content;
    	let t4;
    	let bigwall;
    	let t5;
    	let soundboard_1;
    	let t6;
    	let footer;
    	let current;
    	tailwind = new Tailwind({ $$inline: true });
    	let if_block = /*$loading*/ ctx[0] && create_if_block(ctx);

    	nav = new Nav({
    			props: {
    				title: /*title*/ ctx[1],
    				logo: /*logo*/ ctx[3],
    				navItems: /*stats*/ ctx[4]
    			},
    			$$inline: true
    		});

    	header_1 = new Header({
    			props: { header: /*header*/ ctx[2] },
    			$$inline: true
    		});

    	content = new Content({
    			props: { sections: /*stats*/ ctx[4] },
    			$$inline: true
    		});

    	bigwall = new BigWall({
    			props: { extras: /*extras*/ ctx[6] },
    			$$inline: true
    		});

    	const soundboard_1_spread_levels = [/*soundboard*/ ctx[5]];
    	let soundboard_1_props = {};

    	for (let i = 0; i < soundboard_1_spread_levels.length; i += 1) {
    		soundboard_1_props = assign(soundboard_1_props, soundboard_1_spread_levels[i]);
    	}

    	soundboard_1 = new Soundboard({
    			props: soundboard_1_props,
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tailwind.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(nav.$$.fragment);
    			t2 = space();
    			create_component(header_1.$$.fragment);
    			t3 = space();
    			create_component(content.$$.fragment);
    			t4 = space();
    			create_component(bigwall.$$.fragment);
    			t5 = space();
    			create_component(soundboard_1.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "font-body bg-black text-white");
    			add_location(main, file, 22, 0, 706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwind, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			mount_component(nav, main, null);
    			append_dev(main, t2);
    			mount_component(header_1, main, null);
    			append_dev(main, t3);
    			mount_component(content, main, null);
    			append_dev(main, t4);
    			mount_component(bigwall, main, null);
    			append_dev(main, t5);
    			mount_component(soundboard_1, main, null);
    			append_dev(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$loading*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*$loading*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const soundboard_1_changes = (dirty & /*soundboard*/ 32)
    			? get_spread_update(soundboard_1_spread_levels, [get_spread_object(/*soundboard*/ ctx[5])])
    			: {};

    			soundboard_1.$set(soundboard_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwind.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(nav.$$.fragment, local);
    			transition_in(header_1.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			transition_in(bigwall.$$.fragment, local);
    			transition_in(soundboard_1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwind.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(nav.$$.fragment, local);
    			transition_out(header_1.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			transition_out(bigwall.$$.fragment, local);
    			transition_out(soundboard_1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwind, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(nav);
    			destroy_component(header_1);
    			destroy_component(content);
    			destroy_component(bigwall);
    			destroy_component(soundboard_1);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loading;
    	validate_store(loading, "loading");
    	component_subscribe($$self, loading, $$value => $$invalidate(0, $loading = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const { title, header, logo, stats, soundboard, extras } = data;
    	videosLoading.set(stats.length);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		loading,
    		videosLoading,
    		Tailwind,
    		Nav,
    		Header,
    		Content,
    		Soundboard,
    		Hero,
    		Footer,
    		BigWall,
    		Loading,
    		data,
    		title,
    		header,
    		logo,
    		stats,
    		soundboard,
    		extras,
    		$loading
    	});

    	return [$loading, title, header, logo, stats, soundboard, extras];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
