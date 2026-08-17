import { createTheme } from "@mui/material/styles";
import { buttons, chips, cssBaseline, icons, inputs, tooltips } from "./components";
import { designerDark, designerLight, paletteDark, paletteLight } from "./palette";
import shadows from "./shadows";
import { MDTypography, typography } from "./typography";
const commonSettings = {
    dropdownPopperZindex: 2147483647,
    iconDefaultFontSize: 20,
    inputMinWidth: "75px",
    fonts: {
        roboto: ["Roboto", "-apple-system", "sans-serif"].join(","),
        monospace: ["Menlo", "Monaco", "Consolas", "Courier New", "monospace"].join(", "),
    },
    sizes: {
        button: {
            // numbers are in theme.spacing units
            small: {
                height: 4,
                icon: "1.375rem",
                startIcon: "1.125rem",
                paddingX: 1.25,
            },
            medium: {
                height: 5,
                icon: "1.5rem",
                startIcon: "1.25rem",
                paddingX: 2,
            },
            large: {
                height: 6,
                icon: "1.5rem",
                startIcon: "1.375rem",
                paddingX: 2.75,
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
};
const lightThemePrototype = createTheme({ palette: { ...paletteLight, mode: "light" } });
const darkThemePrototype = createTheme({ palette: { ...paletteDark, mode: "dark" } });
// TODO: figure out how to avoid having to patch the theme and use the above createTheme() function instead
const patchTheme = (theme, typography) => {
    return createTheme(theme, {
        ...commonSettings,
        designer: theme.palette.mode === "dark" ? designerDark : designerLight,
        typography: typography(theme, commonSettings),
        shadows: shadows(theme),
        components: {
            ...buttons(theme, commonSettings),
            ...chips(),
            ...tooltips(),
            ...inputs(commonSettings),
            ...icons(),
            ...cssBaseline(),
        },
    });
};
export const oldLightMaterialUITheme = patchTheme(lightThemePrototype, typography);
export const LightMaterialUITheme = patchTheme(lightThemePrototype, MDTypography);
export const DarkMaterialUITheme = patchTheme(darkThemePrototype, MDTypography);
// Temporarily use oldTypography for compatibility purposes with the web app.
// TODO: make light and dark themes both use Typography and remove "old".
export default oldLightMaterialUITheme;
