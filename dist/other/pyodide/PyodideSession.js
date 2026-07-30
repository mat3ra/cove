import { PY_DEFINE_COMPLETER, PY_DEFINE_RUNNER } from "./pythonSnippets";
let scriptLoadPromise = null;
function injectScriptOnce(src) {
    if (scriptLoadPromise)
        return scriptLoadPromise;
    scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
    });
    return scriptLoadPromise;
}
/**
 * A reusable in-browser Python session on Pyodide: loads the runtime, builds an environment from a
 * {@link PyodideEnvironmentSpec}, runs code in a PERSISTENT namespace (so it behaves like a REPL, not
 * a series of one-shot scripts), captures stdout, reports errors in the Jupyter shape, and answers
 * Jedi-backed editor completions.
 *
 * Free of React and of any domain model, so it can be driven from a component, a worker, or a Node
 * test with a Pyodide instance injected via {@link initialize}.
 *
 * Domain-specific setup belongs in a subclass via the {@link bootstrapNamespace} and
 * {@link beforeExecute} hooks — e.g. pre-importing a library's helpers, or snapshotting objects to
 * diff after each run. Consumers that need Jedi completions must include a Jedi requirement in the
 * spec's {@link PyodideEnvironmentSpec.postWheelPackages} (or pypiPinnedPackages).
 */
export class PyodideSession {
    constructor(spec) {
        this.pyodide = null;
        this.initialized = false;
        this.running = false;
        this.outputBuffer = "";
        this.spec = { wheelFsDir: "/tmp/pyodide_wheels", ...spec };
    }
    get isInitialized() {
        return this.initialized;
    }
    get isRunning() {
        return this.running;
    }
    /** The live Pyodide handle. For subclasses that need to run their own domain Python. */
    get py() {
        return this.pyodide;
    }
    /** Override where prebuilt wheels are fetched from, after construction. */
    configure({ wheelBaseUrl }) {
        if (wheelBaseUrl)
            this.spec.wheelBaseUrl = wheelBaseUrl.replace(/\/$/, "");
    }
    /**
     * Load Pyodide from the CDN with an explicit `indexURL`, then bootstrap. Idempotent, and reuses a
     * cached `window.pyodide` if one is already present. Browser-only (touches window/document).
     */
    async load(onProgress) {
        if (this.initialized)
            return;
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("Loading Pyodide runtime from CDN…");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window;
        if (!globalWindow.pyodide) {
            if (typeof globalWindow.loadPyodide !== "function") {
                await injectScriptOnce(`${this.spec.indexUrl}pyodide.js`);
            }
            globalWindow.pyodide = await globalWindow.loadPyodide({
                indexURL: this.spec.indexUrl,
            });
        }
        await this.initialize(globalWindow.pyodide, onProgress);
    }
    /**
     * Build the environment on an already-loaded Pyodide instance (from {@link load}, a worker, or a
     * Node test). Idempotent. `onProgress` is called before each step so a UI can stream a live log
     * during the slow first load instead of showing a frozen spinner.
     */
    async initialize(pyodide, onProgress) {
        if (this.initialized)
            return;
        this.pyodide = pyodide;
        const log = (message) => onProgress === null || onProgress === void 0 ? void 0 : onProgress(message);
        // stdout/stderr -> buffer, per https://pyodide.org/en/stable/usage/streams.html
        const appendOutput = (text) => {
            this.outputBuffer += `${text}\n`;
        };
        pyodide.setStdout({ batched: appendOutput });
        pyodide.setStderr({ batched: appendOutput });
        const { loadPackages = [], pypiPinnedPackages = [], postWheelPackages = [] } = this.spec;
        log("Loading base packages…");
        await pyodide.loadPackage(["micropip", ...loadPackages]);
        const micropip = pyodide.pyimport("micropip");
        // Install sequentially — order matters, and logging each package before it installs is what
        // makes the multi-second load read as steady progress rather than a hang.
        const installInOrder = (specs, deps, label) => specs.reduce((previous, spec, index) => {
            const name = spec.split("/").pop() || spec;
            return previous.then(() => {
                log(`${label} (${index + 1}/${specs.length}): ${name}`);
                return micropip.install.callKwargs(spec, { deps });
            });
        }, Promise.resolve());
        await installInOrder(pypiPinnedPackages, true, "Installing dependency");
        await this.installWheels(micropip, log);
        await installInOrder(postWheelPackages, true, "Installing package");
        pyodide.runPython(PY_DEFINE_RUNNER);
        pyodide.runPython(PY_DEFINE_COMPLETER);
        await this.bootstrapNamespace(log);
        this.initialized = true;
    }
    /**
     * Fetch each wheel ourselves and install it from Pyodide's virtual FS via `emfs:` — NOT by handing
     * micropip the HTTP URL directly. A static file server serves these with an ETag; on a repeat page
     * load the browser sends a conditional request and gets a 304 with an EMPTY body, which micropip
     * then tries to unzip -> `BadZipFile: File is not a zip file`. Fetching ourselves with
     * `cache: "no-store"` sidesteps that. (Appending a cache-busting query param instead is unsafe:
     * micropip parses the package name/version out of the URL's `.whl` filename.)
     */
    async installWheels(micropip, log) {
        const { wheelFilenames = [], wheelBaseUrl, wheelFsDir } = this.spec;
        if (!wheelFilenames.length)
            return;
        if (!wheelBaseUrl) {
            throw new Error("PyodideSession: wheelFilenames given without a wheelBaseUrl.");
        }
        this.pyodide.FS.mkdirTree(wheelFsDir);
        await wheelFilenames.reduce((previous, filename, index) => previous.then(async () => {
            log(`Installing wheel (${index + 1}/${wheelFilenames.length}): ${filename}`);
            const response = await fetch(`${wheelBaseUrl}/${filename}`, {
                cache: "no-store",
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch wheel ${filename}: HTTP ${response.status}`);
            }
            const bytes = new Uint8Array(await response.arrayBuffer());
            const fsPath = `${wheelFsDir}/${filename}`;
            this.pyodide.FS.writeFile(fsPath, bytes);
            // deps=False is essential: these wheels exist precisely because their transitive
            // deps either don't build under Pyodide or conflict with the pinned set.
            await micropip.install.callKwargs(`emfs:${fsPath}`, { deps: false });
        }), Promise.resolve());
    }
    /**
     * Hook: import the consumer's own libraries / define domain Python once the environment is built.
     * Runs before the session reports itself initialized. Default: nothing.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    async bootstrapNamespace(log) {
        // no domain setup by default
    }
    /** Hook: runs immediately before each {@link execute} (e.g. snapshot state to diff after). */
    // eslint-disable-next-line class-methods-use-this
    beforeExecute() {
        // nothing by default
    }
    /**
     * Run user code in the persistent namespace. Returns captured stdout plus a Jupyter-shaped
     * {@link PythonError} (null on success) — the traceback is NOT dumped into stdout, so a UI can
     * render it distinctly. Rejects overlapping runs.
     */
    async execute(code) {
        this.assertReady();
        if (this.running)
            throw new Error("A Python execution is already in flight.");
        this.running = true;
        this.outputBuffer = "";
        try {
            this.beforeExecute();
            this.pyodide.globals.set("_repl_src", code);
            // The runner catches user errors internally, so this only rejects on infra failures.
            await this.pyodide.runPythonAsync("await _repl_execute(_repl_src)");
            return { ok: !this.lastError, output: this.outputBuffer, error: this.lastError };
        }
        finally {
            this.running = false;
        }
    }
    /** Read the structured error the runner recorded for the last execution (null if none). */
    get lastError() {
        const raw = this.pyodide.globals.get("_repl_last_error");
        if (!raw)
            return null;
        const error = (raw.toJs ? raw.toJs({ dict_converter: Object.fromEntries }) : raw);
        if (raw.destroy)
            raw.destroy();
        return error;
    }
    /**
     * Jedi completions for `source` at 1-based `line` / 0-based `column`, resolved against the LIVE
     * namespace (variables, attributes, modules, keywords). Returns [] if not ready.
     */
    complete(source, line, column) {
        if (!this.initialized)
            return [];
        this.pyodide.globals.set("_repl_c_src", source);
        return JSON.parse(this.pyodide.runPython(`_repl_complete(_repl_c_src, ${line}, ${column})`));
    }
    /** On-demand signature + docstring for one completion `name` at the same position. */
    describe(source, line, column, name) {
        if (!this.initialized)
            return null;
        this.pyodide.globals.set("_repl_c_src", source);
        this.pyodide.globals.set("_repl_c_name", name);
        return JSON.parse(this.pyodide.runPython(`_repl_describe(_repl_c_src, ${line}, ${column}, _repl_c_name)`));
    }
    assertReady() {
        if (!this.initialized)
            throw new Error("PyodideSession is not initialized.");
    }
}
export default PyodideSession;
