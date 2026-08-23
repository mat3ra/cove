// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Palette, PaletteColor, Theme } from "@mui/material/styles";

import type { StatusTones } from "./palette";

declare module "@mui/material/styles" {
    interface Theme {
        iconDefaultFontSize: number;
        fonts: { roboto: string; monospace: string };
    }

    interface ThemeOptions {
        fonts?: { roboto: string; monospace: string };
    }

    interface Palette {
        border: PaletteColor;
        neutral: PaletteColor;
        icon: { main: string; light: string };
        unitTypes: {
            execution: string;
            condition: string;
            assignment: string;
            assertion: string;
        };
        /**
         * Tinted surface + readable ink per status tone. Optional because a host
         * app may still be passing a theme built before these existed; consumers
         * fall back rather than reading `undefined`.
         */
        statusTones?: StatusTones;
    }

    interface PaletteOptions {
        icon?: { main: string; light: string };
        unitTypes?: {
            execution: string;
            condition: string;
            assignment: string;
            assertion: string;
        };
        statusTones?: StatusTones;
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        neutral: true;
    }
}

declare module "@mui/material/IconButton" {
    interface IconButtonPropsColorOverrides {
        neutral: true;
    }
}
