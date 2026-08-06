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
export interface PyodideEnvironmentSpec {
    /**
     * Pyodide CDN base, passed to `loadPyodide` as `indexURL` EXPLICITLY. Always pass this rather than
     * relying on Pyodide's own `calculateIndexURL()`: a bundler that defines `__dirname` (e.g. Vite
     * with `define: { __dirname }`) makes that resolve to an absolute filesystem path, and Pyodide
     * then fetches `pyodide.asm.js` from a URL that does not exist.
     */
    indexUrl: string;
    loadPackages?: string[];
    pypiPinnedPackages?: string[];
    /** Prebuilt wheels, resolved against {@link wheelBaseUrl} and installed `deps=False`. */
    wheelFilenames?: string[];
    /** Installed AFTER the wheels — order matters. */
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
 * Runs code in a PERSISTENT namespace, so it behaves like a REPL rather than a series of one-shot
 * scripts. Domain setup goes in a subclass via {@link bootstrapNamespace} / {@link beforeExecute};
 * completions need Jedi in the spec's package lists.
 *
 * Browser-side there can be only one live instance — see {@link sessionOwningTheInterpreter}.
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
    protected get py(): Pyodide;
    /** Point wheel fetches at a host app's own server. Must precede {@link load}. */
    setWheelBaseUrl(wheelBaseUrl: string): void;
    /** Idempotent; reuses a cached `window.pyodide`. Browser-only (touches window/document). */
    load(onProgress?: (message: string) => void): Promise<void>;
    /** Takes an already-loaded Pyodide so a Node test can inject one. Idempotent. */
    initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void>;
    /**
     * Fetch each wheel ourselves and install it from Pyodide's virtual FS via `emfs:` — NOT by handing
     * micropip the HTTP URL directly. A static file server serves these with an ETag; on a repeat page
     * load the browser sends a conditional request and gets a 304 with an EMPTY body, which micropip
     * then tries to unzip -> `BadZipFile: File is not a zip file`. Fetching ourselves lets the
     * browser resolve a cached response to a complete body before we write it to the virtual FS.
     * Wheel filenames contain versions, so keeping them in the browser cache is safe and makes
     * repeat environment loads substantially cheaper.
     */
    private fetchWheel;
    /** Make wheels available to a domain installer without installing them here. */
    protected stageWheels(wheelFilenames: string[], log?: (message: string) => void): Promise<void>;
    private installWheels;
    /** Runs after the environment is built, before the session reports itself initialized. */
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    /** Runs before each {@link execute}. */
    protected beforeExecute(): void | Promise<void>;
    /** Runs after successful or failed user code, while the persistent namespace is still current. */
    protected afterExecute(): void | Promise<void>;
    /**
     * The traceback comes back separately rather than in stdout, so a UI can render it distinctly.
     * Rejects overlapping runs.
     */
    execute(code: string): Promise<PythonExecutionResult>;
    private get lastError();
    /**
     * `line` is 1-based, `column` 0-based (Jedi's convention). Resolved against the LIVE namespace.
     * Arguments go through `globals`, never interpolated into the source — an injection site the moment
     * a caller passes a non-number.
     */
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
    private setCompletionArguments;
    /**
     * Releases the interpreter claim so another session can be built. Pyodide cannot be unloaded, so
     * this resets our bookkeeping, not the runtime.
     */
    dispose(): void;
    protected assertReady(): void;
}
export default PyodideSession;
