/**
 * Which of a `ButtonMultiSelect`'s options is the active one.
 *
 * Extracted so the rule can be asserted rather than inferred from the render.
 * The component used to hold the selected *config object* in state, snapshotted
 * from whichever `buttonConfigs[0]` happened to be passed on mount and never
 * resynced — so it kept calling the very first `onClick` closure it ever
 * received. A parent re-rendering with fresh handlers was ignored for the
 * lifetime of the component, and consumers worked around it by reading their own
 * state at click time (`job-designer`'s `Job.jsx` still carries the note).
 *
 * Holding the *id* and resolving it against the live prop on every render is
 * what fixes that, and these are the cases where the two differ.
 */

export interface IdentifiedOption {
    id: string;
    [key: string]: unknown;
}

/**
 * The option matching `selectedOptionId`, or the first one when nothing is
 * selected or the remembered id no longer exists — a persisted choice can name
 * an option a later release removed, and falling back beats rendering nothing.
 */
export function resolveSelectedOption<T extends IdentifiedOption>(
    options: T[],
    selectedOptionId: string | null,
): T | undefined {
    return options.find((option) => option.id === selectedOptionId) ?? options[0];
}

/** Whether a remembered id is worth restoring — i.e. it still names an option. */
export function isRestorableOptionId(
    options: IdentifiedOption[],
    savedOptionId: string | null,
): boolean {
    return Boolean(savedOptionId) && options.some((option) => option.id === savedOptionId);
}
