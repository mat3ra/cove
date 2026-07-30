import type { PythonCompletion, PythonSignatureInfo } from "../codemirror/utils/pythonCompletions";
import { PY_DEFINE_COMPLETER, PY_DEFINE_RUNNER } from "./pythonSnippets";

// Pyodide has no published types; use `any` until they are available upstream (see PyodideLoader).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Pyodide = any;

/** Jupyter/nbformat error shape, so a UI can render `ename: evalue` + traceback distinctly. */
export interface PythonError {
    ename: string;
    evalue: string;
    traceback: string;
}

export interface PythonExecutionResult {
    ok: boolean;
    output: string;
    error: PythonError | null;
}

/** The environment to build inside Pyodide. Data, so each consumer brings its own package set. */
export interface PyodideEnvironmentSpec {
    /**
     * Pyodide CDN base, passed to `loadPyodide` as `indexURL` EXPLICITLY. Always pass this rather than
     * relying on Pyodide's own `calculateIndexURL()`: a bundler that defines `__dirname` (e.g. Vite
     * with `define: { __dirname }`) makes that resolve to an absolute filesystem path, and Pyodide
     * then fetches `pyodide.asm.js` from a URL that does not exist.
     */
    indexUrl: string;
    /** Loaded via `pyodide.loadPackage` (Pyodide-native/compiled builds). */
    loadPackages?: string[];
    /** Installed with `micropip.install(deps=True)`. */
    pypiPinnedPackages?: string[];
    /** Prebuilt wheels, resolved against {@link wheelBaseUrl} and installed `deps=False`. */
    wheelFilenames?: string[];
    /** Installed `deps=True` AFTER the wheels — order matters. */
    postWheelPackages?: string[];
    wheelBaseUrl?: string;
    wheelFsDir?: string;
}

export interface PythonSessionInterface {
    isInitialized: boolean;
    isRunning: boolean;
    load(onProgress?: (message: string) => void): Promise<void>;
    execute(code: string): Promise<PythonExecutionResult>;
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(
        source: string,
        line: number,
        column: number,
        name: string,
    ): PythonSignatureInfo | null;
}

let scriptLoadPromise: Promise<void> | null = null;

function injectScriptOnce(src: string): Promise<void> {
    if (scriptLoadPromise) return scriptLoadPromise;
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
 * In-browser Python on Pyodide. Runs code in a PERSISTENT namespace, so it behaves like a REPL rather
 * than a series of one-shot scripts. Free of React and of any domain model.
 *
 * Domain setup goes in a subclass via {@link bootstrapNamespace} / {@link beforeExecute}. Completions
 * need Jedi in the spec's package lists.
 */
export class PyodideSession implements PythonSessionInterface {
    private pyodide: Pyodide = null;

    private initialized = false;

    private running = false;

    private outputBuffer = "";

    protected spec: PyodideEnvironmentSpec;

    constructor(spec: PyodideEnvironmentSpec) {
        this.spec = { wheelFsDir: "/tmp/pyodide_wheels", ...spec };
    }

    get isInitialized(): boolean {
        return this.initialized;
    }

    get isRunning(): boolean {
        return this.running;
    }

    /** For subclasses that run their own domain Python. */
    protected get py(): Pyodide {
        return this.pyodide;
    }

    configure({ wheelBaseUrl }: { wheelBaseUrl?: string }): void {
        if (wheelBaseUrl) this.spec.wheelBaseUrl = wheelBaseUrl.replace(/\/$/, "");
    }

    /** Idempotent; reuses a cached `window.pyodide`. Browser-only (touches window/document). */
    async load(onProgress?: (message: string) => void): Promise<void> {
        if (this.initialized) return;
        onProgress?.("Loading Pyodide runtime from CDN…");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window as any;
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
     * Build the environment on an already-loaded Pyodide (so a Node test can inject one). Idempotent.
     * `onProgress` fires before each step: the load takes ~30s and needs to look alive.
     */
    async initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void> {
        if (this.initialized) return;
        this.pyodide = pyodide;
        const log = (message: string) => onProgress?.(message);

        // stdout/stderr -> buffer, per https://pyodide.org/en/stable/usage/streams.html
        const appendOutput = (text: string) => {
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
        const installInOrder = (specs: string[], deps: boolean, label: string): Promise<void> =>
            specs.reduce((previous, spec, index) => {
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
    private async installWheels(micropip: Pyodide, log: (message: string) => void): Promise<void> {
        const { wheelFilenames = [], wheelBaseUrl, wheelFsDir } = this.spec;
        if (!wheelFilenames.length) return;
        if (!wheelBaseUrl) {
            throw new Error("PyodideSession: wheelFilenames given without a wheelBaseUrl.");
        }
        this.pyodide.FS.mkdirTree(wheelFsDir);
        await wheelFilenames.reduce(
            (previous, filename, index) =>
                previous.then(async () => {
                    log(`Installing wheel (${index + 1}/${wheelFilenames.length}): ${filename}`);
                    const response = await fetch(`${wheelBaseUrl}/${filename}`, {
                        cache: "no-store",
                    });
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch wheel ${filename}: HTTP ${response.status}`,
                        );
                    }
                    const bytes = new Uint8Array(await response.arrayBuffer());
                    const fsPath = `${wheelFsDir}/${filename}`;
                    this.pyodide.FS.writeFile(fsPath, bytes);
                    // deps=False is essential: these wheels exist precisely because their transitive
                    // deps either don't build under Pyodide or conflict with the pinned set.
                    await micropip.install.callKwargs(`emfs:${fsPath}`, { deps: false });
                }),
            Promise.resolve(),
        );
    }

    /** Hook: define domain Python once the environment is built, before reporting initialized. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    protected async bootstrapNamespace(log: (message: string) => void): Promise<void> {
        // no domain setup by default
    }

    /** Hook: runs before each {@link execute} (e.g. snapshot state to diff afterwards). */
    // eslint-disable-next-line class-methods-use-this
    protected beforeExecute(): void {
        // nothing by default
    }

    /**
     * Run user code in the persistent namespace. The traceback is returned separately rather than
     * dumped into stdout, so a UI can render it distinctly. Rejects overlapping runs.
     */
    async execute(code: string): Promise<PythonExecutionResult> {
        this.assertReady();
        if (this.running) throw new Error("A Python execution is already in flight.");
        this.running = true;
        this.outputBuffer = "";
        try {
            this.beforeExecute();
            this.pyodide.globals.set("_repl_src", code);
            // The runner catches user errors internally, so this only rejects on infra failures.
            await this.pyodide.runPythonAsync("await _repl_execute(_repl_src)");
            return { ok: !this.lastError, output: this.outputBuffer, error: this.lastError };
        } finally {
            this.running = false;
        }
    }

    /** The error the runner recorded for the last execution, if any. */
    private get lastError(): PythonError | null {
        const raw = this.pyodide.globals.get("_repl_last_error");
        if (!raw) return null;
        const error = (
            raw.toJs ? raw.toJs({ dict_converter: Object.fromEntries }) : raw
        ) as PythonError;
        if (raw.destroy) raw.destroy();
        return error;
    }

    /** Completions at 1-based `line` / 0-based `column`, against the LIVE namespace. */
    complete(source: string, line: number, column: number): PythonCompletion[] {
        if (!this.initialized) return [];
        this.pyodide.globals.set("_repl_c_src", source);
        return JSON.parse(
            this.pyodide.runPython(`_repl_complete(_repl_c_src, ${line}, ${column})`),
        );
    }

    /** Signature + docstring for one completion, resolved on demand. */
    describe(
        source: string,
        line: number,
        column: number,
        name: string,
    ): PythonSignatureInfo | null {
        if (!this.initialized) return null;
        this.pyodide.globals.set("_repl_c_src", source);
        this.pyodide.globals.set("_repl_c_name", name);
        return JSON.parse(
            this.pyodide.runPython(`_repl_describe(_repl_c_src, ${line}, ${column}, _repl_c_name)`),
        );
    }

    protected assertReady(): void {
        if (!this.initialized) throw new Error("PyodideSession is not initialized.");
    }
}

export default PyodideSession;
