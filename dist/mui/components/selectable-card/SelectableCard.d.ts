import React from "react";
export interface SelectableCardProps {
    /** The thing being chosen. Shown first and largest. */
    title: React.ReactNode;
    /** One line under the title — what distinguishes this option from its neighbours. */
    subtitle?: React.ReactNode;
    selected?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
    /** Top-right slot: a `StatusChip`, a price, a queue badge. */
    badge?: React.ReactNode;
    /** Facts below the divider — a row of `MetricTile`s reads well here. */
    children?: React.ReactNode;
    /** Why this option cannot be chosen. Shown in place of the subtitle when disabled. */
    disabledReason?: string;
    id?: string;
    className?: string;
}
/**
 * One option in a set, presented as a card rather than a row in a dropdown.
 *
 * A dropdown shows one option at a time and hides everything that would let a
 * reader choose between them — a cluster's queue, its price, whether it is busy.
 * Cards trade vertical space for a comparison the reader can actually make.
 *
 * Renders as a `radio`, not a button: a set of these is a single choice, so
 * screen readers should hear it as one, and the selected card carries
 * `aria-checked` rather than relying on the border colour.
 */
export default function SelectableCard({ title, subtitle, selected, disabled, onSelect, badge, children, disabledReason, id, className, }: SelectableCardProps): React.JSX.Element;
export interface SelectableCardGroupProps {
    /** Names the choice for screen readers, e.g. "Cluster". */
    label: string;
    children: React.ReactNode;
    id?: string;
}
/**
 * Wraps a set of `SelectableCard`s so assistive tech hears one choice rather
 * than a pile of unrelated radios.
 */
export declare function SelectableCardGroup({ label, children, id }: SelectableCardGroupProps): React.JSX.Element;
