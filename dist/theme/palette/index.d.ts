/**
 * "Soft" surfaces: a tinted background plus an ink that stays readable on it.
 *
 * This is the shape chips, badges, meters and flag rows need, and the reason
 * they could not be built from the palette before — a status chip painted
 * `success.main` with white text is unreadable, and one using `success.main`
 * as *text* on a white card is worse (1.7:1). Each tone is a validated triple,
 * checked against its own theme's `background.paper`.
 */
export interface StatusTone {
    /** Ink for text and icons sitting on `background`. */
    color: string;
    /** Translucent tint, painted over the surface underneath. */
    background: string;
    /** Outline for chips that need to read against a busy surface. */
    border: string;
}
export type StatusToneName = "neutral" | "primary" | "info" | "success" | "warning" | "error";
export type StatusTones = Record<StatusToneName, StatusTone>;
export declare const paletteLight: {
    statusTones: StatusTones;
    primary: {
        main: string;
    };
    secondary: {
        main: string;
    };
    text: {
        primary: string;
        secondary: string;
        disabled: string;
    };
    action: {
        active: string;
        hover: string;
        selected: string;
        disabled: string;
        disabledBackground: string;
        focus: string;
    };
    unitTypes: {
        execution: string;
        condition: string;
        assignment: string;
        assertion: string;
    };
    background: {
        paper: string;
        default: string;
    };
    border: {
        main: string;
        dark: string;
    };
    icon: {
        main: string;
        light: string;
    };
    success: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    error: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    warning: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    info: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
};
export declare const paletteDark: {
    statusTones: StatusTones;
    primary: {
        main: string;
    };
    secondary: {
        main: string;
    };
    text: {
        primary: string;
        secondary: string;
        disabled: string;
    };
    action: {
        active: string;
        hover: string;
        selected: string;
        disabled: string;
        disabledBackground: string;
        focus: string;
    };
    unitTypes: {
        execution: string;
        condition: string;
        assignment: string;
        assertion: string;
    };
    background: {
        paper: string;
        default: string;
    };
    border: {
        main: string;
        dark: string;
    };
    icon: {
        main: string;
        light: string;
    };
    success: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    error: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    warning: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
    info: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
    };
};
