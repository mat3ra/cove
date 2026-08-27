// Note: https://bareynol.github.io/mui-theme-creator/#Dialog can be used to preview theme changes

import { designerDark, designerLight, toUnitTypeColors } from "./designer";

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
 * `contrastText` is what MUI paints on top of `main` — a Button's label, a filled Chip's text.
 *
 * Each value below is whichever of black or white actually reads on its own `main`, measured
 * rather than chosen: the previous values scored 1.49–3.11, i.e. an error button's label was
 * 23%-opacity black on red. `success.main` stays as it is (brand-adjacent); `successText` is the
 * darkened variant to use when the colour has to carry *text* on a light ground, where neither
 * `main` (1.68) nor `dark` (2.18) passes.
 */
const otherColorOptions = {
    success: {
        main: "#72E128",
        dark: "#64C623",
        light: "#83E542",
        contrastText: "#000000",
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
        contrastText: "#000000",
    },
    info: {
        main: "#0288D1",
        dark: "#01579B",
        light: "#03A9F4",
        contrastText: "#000000",
    },
};

/** Text-safe stand-ins for semantic colours that cannot be read as text on their own ground. */
const semanticTextOptionsLight = {
    successText: "#3F7F16",
};
const semanticTextOptionsDark = {
    successText: "#83E542",
};

const otherOptions = {
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
    unitTypes: toUnitTypeColors(designerLight.unitType),
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
 * The dark equivalents of everything in {@link otherOptions}.
 *
 * `paletteDark` previously spread only the primary/secondary and semantic colours, so keys this
 * package *declares* on the palette — `border`, `icon`, `unitTypes` — were simply absent in dark
 * mode. `theme.palette.border.dark` is read unguarded by `TextEditor`, `TotalWidget` and
 * `InfoWidget`, which therefore threw; `EntityName` already carried a `?.` and a hardcoded
 * fallback, which is the workaround this removes the need for.
 */
const otherOptionsDark = {
    text: {
        primary: "rgba(255, 255, 255, 0.87)",
        secondary: "rgba(255, 255, 255, 0.6)",
        disabled: "rgba(255, 255, 255, 0.38)",
    },
    action: {
        active: "rgba(255, 255, 255, 0.54)",
        hover: "rgba(255, 255, 255, 0.08)",
        selected: "rgba(255, 255, 255, 0.16)",
        disabled: "rgba(255, 255, 255, 0.3)",
        disabledBackground: "rgba(255, 255, 255, 0.12)",
        focus: "rgba(255, 255, 255, 0.12)",
    },
    unitTypes: toUnitTypeColors(designerDark.unitType),
    background: {
        paper: "#1A1A1F",
        default: "#131318",
    },
    border: {
        main: "#2A2A33",
        dark: "#3D3D47",
    },
    icon: {
        main: "#BDBDBD",
        light: "#7A7A85",
    },
};

export const paletteLight = {
    ...otherColorOptions,
    ...semanticTextOptionsLight,
    ...otherOptions,
    ...primaryAndSecondaryColorOptionsLight,
};

export const paletteDark = {
    ...otherColorOptions,
    ...semanticTextOptionsDark,
    ...otherOptionsDark,
    ...primaryAndSecondaryColorOptionsDark,
};

export { designerDark, designerLight };
export type { DesignerTokens, UnitTypeToken } from "./designer";
