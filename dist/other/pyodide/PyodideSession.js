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
 * Runs code in a PERSISTENT namespace, so it behaves like a REPL rather than a series of one-shot
 * scripts. Domain setup goes in a subclass via {@link bootstrapNamespace} / {@link beforeExecute};
 * completions need Jedi in the spec's package lists.
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
    get py() {
        return this.pyodide;
    }
    configure({ wheelBaseUrl }) {
        if (wheelBaseUrl)
            this.spec.wheelBaseUrl = wheelBaseUrl.replace(/\/$/, "");
    }
    /** Idempotent; reuses a cached `window.pyodide`. Browser-only (touches window/document). */
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
    /** Takes an already-loaded Pyodide so a Node test can inject one. Idempotent. */
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
        // Sequential: order matters. Logging before each install is what makes the wait legible.
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
    /** Runs after the environment is built, before the session reports itself initialized. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    async bootstrapNamespace(log) {
        // no domain setup by default
    }
    /** Runs before each {@link execute} — e.g. to snapshot state and diff it afterwards. */
    // eslint-disable-next-line class-methods-use-this
    beforeExecute() {
        // nothing by default
    }
    /**
     * The traceback comes back separately rather than in stdout, so a UI can render it distinctly.
     * Rejects overlapping runs.
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
    get lastError() {
        const raw = this.pyodide.globals.get("_repl_last_error");
        if (!raw)
            return null;
        const error = (raw.toJs ? raw.toJs({ dict_converter: Object.fromEntries }) : raw);
        if (raw.destroy)
            raw.destroy();
        return error;
    }
    /** `line` is 1-based, `column` 0-based (Jedi's convention). Resolved against the LIVE namespace. */
    complete(source, line, column) {
        if (!this.initialized)
            return [];
        this.pyodide.globals.set("_repl_c_src", source);
        return JSON.parse(this.pyodide.runPython(`_repl_complete(_repl_c_src, ${line}, ${column})`));
    }
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
