import type { PythonCompletion, PythonSignatureInfo } from "../codemirror/utils/pythonCompletions";
export type Pyodide = any;
/**
 * A Python error in the nbformat/Jupyter shape (`ename`/`evalue`/`traceback`), so a UI can render it
 * the way notebooks/IDEs do: a bold `ename: evalue` headline + the cleaned traceback. Produced by
 * the runner in pythonSnippets, which strips its own frame so the traceback starts at user code.
 */
export interface PythonError {
    ename: string;
    evalue: string;
    traceback: string;
}
/** Result of one {@link PyodideSession.execute}. `error` is null on success. */
export interface PythonExecutionResult {
    ok: boolean;
    output: string;
    error: PythonError | null;
}
/**
 * Declares the Python environment to build inside Pyodide. Kept as data (rather than hardcoded here)
 * so each consumer brings its own package set — the installation *mechanism* is what's reusable, not
 * any particular list of packages.
 */
export interface PyodideEnvironmentSpec {
    /**
     * Pyodide CDN base, passed to `loadPyodide` as `indexURL` EXPLICITLY. Always pass this rather than
     * relying on Pyodide's own `calculateIndexURL()`: a bundler that defines `__dirname` (e.g. Vite
     * with `define: { __dirname }`) makes that resolve to an absolute filesystem path, and Pyodide
     * then fetches `pyodide.asm.js` from a URL that does not exist.
     */
    indexUrl: string;
    /** Pyodide-native (stdlib/compiled) packages loaded via `pyodide.loadPackage(...)`. */
    loadPackages?: string[];
    /** Pure-Python PyPI requirements installed with `micropip.install(deps=True)`. */
    pypiPinnedPackages?: string[];
    /** Prebuilt wheel filenames, resolved against {@link wheelBaseUrl} and installed `deps=False`. */
    wheelFilenames?: string[];
    /** Packages installed with `deps=True` AFTER the wheels are present (order matters). */
    postWheelPackages?: string[];
    /** Where {@link wheelFilenames} are served from. Same-origin avoids CORS. */
    wheelBaseUrl?: string;
    /** Where wheel bytes are staged in Pyodide's virtual FS before installing via `emfs:`. */
    wheelFsDir?: string;
}
/** The surface a REPL UI needs from a session. Lets a UI be tested against a fake backend. */
export interface PythonSessionInterface {
    isInitialized: boolean;
    isRunning: boolean;
    load(onProgress?: (message: string) => void): Promise<void>;
    execute(code: string): Promise<PythonExecutionResult>;
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
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
export declare class PyodideSession implements PythonSessionInterface {
    private pyodide;
    private initialized;
    private running;
    private outputBuffer;
    protected spec: PyodideEnvironmentSpec;
    constructor(spec: PyodideEnvironmentSpec);
    get isInitialized(): boolean;
    get isRunning(): boolean;
    /** The live Pyodide handle. For subclasses that need to run their own domain Python. */
    protected get py(): Pyodide;
    /** Override where prebuilt wheels are fetched from, after construction. */
    configure({ wheelBaseUrl }: {
        wheelBaseUrl?: string;
    }): void;
    /**
     * Load Pyodide from the CDN with an explicit `indexURL`, then bootstrap. Idempotent, and reuses a
     * cached `window.pyodide` if one is already present. Browser-only (touches window/document).
     */
    load(onProgress?: (message: string) => void): Promise<void>;
    /**
     * Build the environment on an already-loaded Pyodide instance (from {@link load}, a worker, or a
     * Node test). Idempotent. `onProgress` is called before each step so a UI can stream a live log
     * during the slow first load instead of showing a frozen spinner.
     */
    initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void>;
    /**
     * Fetch each wheel ourselves and install it from Pyodide's virtual FS via `emfs:` — NOT by handing
     * micropip the HTTP URL directly. A static file server serves these with an ETag; on a repeat page
     * load the browser sends a conditional request and gets a 304 with an EMPTY body, which micropip
     * then tries to unzip -> `BadZipFile: File is not a zip file`. Fetching ourselves with
     * `cache: "no-store"` sidesteps that. (Appending a cache-busting query param instead is unsafe:
     * micropip parses the package name/version out of the URL's `.whl` filename.)
     */
    private installWheels;
    /**
     * Hook: import the consumer's own libraries / define domain Python once the environment is built.
     * Runs before the session reports itself initialized. Default: nothing.
     */
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    /** Hook: runs immediately before each {@link execute} (e.g. snapshot state to diff after). */
    protected beforeExecute(): void;
    /**
     * Run user code in the persistent namespace. Returns captured stdout plus a Jupyter-shaped
     * {@link PythonError} (null on success) — the traceback is NOT dumped into stdout, so a UI can
     * render it distinctly. Rejects overlapping runs.
     */
    execute(code: string): Promise<PythonExecutionResult>;
    /** Read the structured error the runner recorded for the last execution (null if none). */
    private get lastError();
    /**
     * Jedi completions for `source` at 1-based `line` / 0-based `column`, resolved against the LIVE
     * namespace (variables, attributes, modules, keywords). Returns [] if not ready.
     */
    complete(source: string, line: number, column: number): PythonCompletion[];
    /** On-demand signature + docstring for one completion `name` at the same position. */
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
    protected assertReady(): void;
}
export default PyodideSession;
