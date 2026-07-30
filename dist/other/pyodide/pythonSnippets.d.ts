/**
 * The Python that {@link PyodideSession} defines inside the interpreter. Kept as plain string
 * constants — cove has no Python toolchain and no codegen step, and adding one for two static
 * snippets would be build infrastructure this package otherwise doesn't need.
 *
 * The explanatory comments live inside the Python itself, so they travel with the code.
 */
/** Defines `_repl_execute`, used by {@link PyodideSession.execute}. */
export declare const PY_DEFINE_RUNNER = "\n# Runs user code in the REPL's persistent globals (not a fresh namespace), so variables and imports\n# from earlier runs are still visible \u2014 that's the whole point of a REPL versus a one-shot script.\n# eval_code_async is Pyodide's own top-level-await-capable exec, which is why 'await' works directly\n# in REPL code without the user wrapping it in an async function themselves.\n#\n# On failure, records a Jupyter/nbformat-shaped error (ename/evalue/traceback) in _repl_last_error\n# instead of letting the exception propagate \u2014 PyodideSession.execute() reads this afterwards.\n# The traceback is built from '_repl_traceback_frame.tb_next', deliberately skipping this function's\n# own stack frame, so what the user sees starts at their code, not at \"_repl_execute\" internals.\nfrom pyodide.code import eval_code_async as _repl_eval_code_async\nimport traceback as _repl_traceback\n_repl_last_error = None\nasync def _repl_execute(_repl_source):\n    global _repl_last_error\n    _repl_last_error = None\n    try:\n        await _repl_eval_code_async(_repl_source, globals=globals())\n    except Exception as _repl_exception:\n        _repl_traceback_frame = _repl_exception.__traceback__\n        _repl_last_error = {\n            \"ename\": type(_repl_exception).__name__,\n            \"evalue\": str(_repl_exception),\n            \"traceback\": \"\".join(\n                _repl_traceback.format_exception(\n                    type(_repl_exception),\n                    _repl_exception,\n                    _repl_traceback_frame.tb_next if _repl_traceback_frame else None,\n                )\n            ),\n        }\n";
export declare const MAX_COMPLETIONS_PER_REQUEST = 60;
/** Defines `_repl_complete` / `_repl_describe`, used by complete()/describe(). Requires Jedi. */
export declare const PY_DEFINE_COMPLETER: string;
