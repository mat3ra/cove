// Note: https://bareynol.github.io/mui-theme-creator/#Dialog can be used to preview theme changes
const primaryColorConfig = {
    main: "#5b37c0",
    // To be better readable on dark backgrounds
    lighter: "#7c5fcd",
};
const secondaryColorConfig = {
    main: "#757575",
};
const primaryAndSecondaryColorOptionsLight = {
    primary: {
        main: primaryColorConfig.main,
    },
    secondary: {
        main: secondaryColorConfig.main,
    },
};
const primaryAndSecondaryColorOptionsDark = {
    primary: {
        main: primaryColorConfig.lighter,
    },
    secondary: {
        main: secondaryColorConfig.main,
    },
};
/**
 * Ink used on top of a saturated status color. Picked per color as whichever of
 * dark/white actually clears 4.5:1 on that background — `success.main` is a neon
 * green that white text disappears on, and the previous `rgba(0, 0, 0, 0.23)`
 * values were invisible on every background. Ratios are asserted in
 * `tests/palette.tests.ts`; do not change a value without re-running it.
 */
const inkOnSaturatedSurface = "rgba(0, 0, 0, 0.87)";
const otherColorOptions = {
    success: {
        main: "#72E128",
        dark: "#64C623",
        light: "#83E542",
        contrastText: inkOnSaturatedSurface,
    },
    error: {
        main: "#D32F2F",
        dark: "#C62828",
        light: "#EF5350",
        contrastText: "#FFFFFF",
    },
    warning: {
        main: "#ED6C02",
        dark: "#E65100",
        light: "#FF9800",
        contrastText: inkOnSaturatedSurface,
    },
    info: {
        main: "#0288D1",
        dark: "#01579B",
        light: "#03A9F4",
        contrastText: inkOnSaturatedSurface,
    },
};
const otherOptionsLight = {
    text: {
        primary: "rgba(37, 39, 60, 0.87)",
        secondary: "rgba(76, 78, 100, 0.6)",
        disabled: "rgba(76, 78, 100, 0.38)",
    },
    action: {
        active: "rgba(0, 0, 0, 0.54)",
        hover: "rgba(0, 0, 0, 0.04)",
        selected: "rgba(0, 0, 0, 0.08)",
        disabled: "rgba(0, 0, 0, 0.12)",
        disabledBackground: "rgba(0, 0, 0, 0.12)",
        focus: "rgba(0, 0, 0, 0.12)",
    },
    unitTypes: {
        execution: "#0288D1",
        condition: "#00BFA5",
        assignment: "#ff9800",
        assertion: "#BE134D",
    },
    background: {
        paper: "#FFFFFF",
        default: "#edecec",
    },
    border: {
        main: "#F4F4F4",
        dark: "#e0e0e0",
    },
    icon: {
        main: "#555555",
        light: "#ADADAD",
    },
};
/**
 * Dark counterparts of every `otherOptionsLight` slot.
 *
 * These used to be missing entirely: `paletteDark` carried only primary,
 * secondary and the four status colors, so `theme.palette.border.main`,
 * `icon.*` and `unitTypes.*` all read `undefined` in dark mode — which is why
 * surfaces that theme themselves from those tokens stay light inside a dark
 * shell.
 *
 * Values mirror the light structure: `border.main` is the subtle rule and
 * `border.dark` the stronger one; `icon.main` is the prominent icon and
 * `icon.light` the recessive one. Unit-type hues are lightened so they keep
 * their identity against a dark surface.
 */
const otherOptionsDark = {
    text: {
        primary: "rgba(255, 255, 255, 0.87)",
        secondary: "rgba(255, 255, 255, 0.60)",
        disabled: "rgba(255, 255, 255, 0.38)",
    },
    action: {
        active: "rgba(255, 255, 255, 0.54)",
        hover: "rgba(255, 255, 255, 0.08)",
        selected: "rgba(255, 255, 255, 0.16)",
        disabled: "rgba(255, 255, 255, 0.30)",
        disabledBackground: "rgba(255, 255, 255, 0.12)",
        focus: "rgba(255, 255, 255, 0.12)",
    },
    unitTypes: {
        execution: "#29B6F6",
        condition: "#26D7C0",
        assignment: "#FFB74D",
        assertion: "#F0447A",
    },
    background: {
        paper: "#1E1E1E",
        default: "#121212",
    },
    border: {
        main: "#2A2A2A",
        dark: "#3D3D3D",
    },
    icon: {
        main: "#C4C4C4",
        light: "#7A7A7A",
    },
};
const statusTonesLight = {
    neutral: {
        color: "#4C4E64",
        background: "rgba(76, 78, 100, 0.10)",
        border: "rgba(76, 78, 100, 0.45)",
    },
    primary: {
        color: "#5B37C0",
        background: "rgba(91, 55, 192, 0.10)",
        border: "rgba(91, 55, 192, 0.45)",
    },
    info: {
        color: "#01579B",
        background: "rgba(2, 136, 209, 0.12)",
        border: "rgba(1, 87, 155, 0.45)",
    },
    success: {
        color: "#3D7A15",
        background: "rgba(114, 225, 40, 0.20)",
        border: "rgba(61, 122, 21, 0.45)",
    },
    warning: {
        color: "#A85400",
        background: "rgba(237, 108, 2, 0.14)",
        border: "rgba(168, 84, 0, 0.45)",
    },
    error: {
        color: "#C62828",
        background: "rgba(211, 47, 47, 0.10)",
        border: "rgba(198, 40, 40, 0.45)",
    },
};
const statusTonesDark = {
    neutral: {
        color: "#C2C3CE",
        background: "rgba(255, 255, 255, 0.08)",
        border: "rgba(194, 195, 206, 0.45)",
    },
    primary: {
        color: "#BCA6F5",
        background: "rgba(124, 95, 205, 0.20)",
        border: "rgba(188, 166, 245, 0.45)",
    },
    info: {
        color: "#4FC3F7",
        background: "rgba(2, 136, 209, 0.24)",
        border: "rgba(79, 195, 247, 0.45)",
    },
    success: {
        color: "#8BE84F",
        background: "rgba(114, 225, 40, 0.18)",
        border: "rgba(139, 232, 79, 0.45)",
    },
    warning: {
        color: "#FFB74D",
        background: "rgba(237, 108, 2, 0.22)",
        border: "rgba(255, 183, 77, 0.45)",
    },
    error: {
        color: "#FF8A80",
        background: "rgba(211, 47, 47, 0.24)",
        border: "rgba(255, 138, 128, 0.45)",
    },
};
export const paletteLight = {
    ...otherColorOptions,
    ...otherOptionsLight,
    ...primaryAndSecondaryColorOptionsLight,
    statusTones: statusTonesLight,
};
export const paletteDark = {
    ...otherColorOptions,
    ...otherOptionsDark,
    ...primaryAndSecondaryColorOptionsDark,
    statusTones: statusTonesDark,
};
