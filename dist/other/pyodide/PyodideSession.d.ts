import type { PythonCompletion, PythonSignatureInfo } from "../codemirror/utils/pythonCompletions";
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
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
}
/**
 * In-browser Python on Pyodide. Runs code in a PERSISTENT namespace, so it behaves like a REPL rather
 * than a series of one-shot scripts. Free of React and of any domain model.
 *
 * Domain setup goes in a subclass via {@link bootstrapNamespace} / {@link beforeExecute}. Completions
 * need Jedi in the spec's package lists.
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
    /** For subclasses that run their own domain Python. */
    protected get py(): Pyodide;
    configure({ wheelBaseUrl }: {
        wheelBaseUrl?: string;
    }): void;
    /** Idempotent; reuses a cached `window.pyodide`. Browser-only (touches window/document). */
    load(onProgress?: (message: string) => void): Promise<void>;
    /**
     * Build the environment on an already-loaded Pyodide (so a Node test can inject one). Idempotent.
     * `onProgress` fires before each step: the load takes ~30s and needs to look alive.
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
    /** Hook: define domain Python once the environment is built, before reporting initialized. */
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    /** Hook: runs before each {@link execute} (e.g. snapshot state to diff afterwards). */
    protected beforeExecute(): void;
    /**
     * Run user code in the persistent namespace. The traceback is returned separately rather than
     * dumped into stdout, so a UI can render it distinctly. Rejects overlapping runs.
     */
    execute(code: string): Promise<PythonExecutionResult>;
    /** The error the runner recorded for the last execution, if any. */
    private get lastError();
    /** Completions at 1-based `line` / 0-based `column`, against the LIVE namespace. */
    complete(source: string, line: number, column: number): PythonCompletion[];
    /** Signature + docstring for one completion, resolved on demand. */
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
    protected assertReady(): void;
}
export default PyodideSession;
