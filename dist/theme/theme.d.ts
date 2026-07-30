import { Theme } from "@mui/material/styles";
declare module "@mui/material/SvgIcon" {
    interface SvgIconPropsSizeOverrides {
        xLarge: true;
        xxLarge: true;
    }
}
declare const commonSettings: {
    dropdownPopperZindex: number;
    iconDefaultFontSize: number;
    inputMinWidth: string;
    fonts: {
        roboto: string;
        monospace: string;
    };
    sizes: {
        button: {
            small: {
                height: number;
                icon: string;
                startIcon: string;
                paddingX: number;
            };
            medium: {
                height: number;
                icon: string;
                startIcon: string;
                paddingX: number;
            };
            large: {
                height: number;
                icon: string;
                startIcon: string;
                paddingX: number;
            };
        };
    };
    breakpoints: {
        values: {
            xs: number;
            sm: number;
            md: number;
            lg: number;
            xl: number;
        };
    };
};
export type CommonSettings = typeof commonSettings;
export { commonSettings };
export declare const oldLightMaterialUITheme: Theme;
export declare const LightMaterialUITheme: Theme;
export declare const DarkMaterialUITheme: Theme;
export default oldLightMaterialUITheme;
