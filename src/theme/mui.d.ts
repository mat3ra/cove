// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Palette, PaletteColor, Theme } from "@mui/material/styles";

import type { DesignerTokens } from "./palette/designer";

declare module "@mui/material/styles" {
    interface Theme {
        iconDefaultFontSize: number;
        /** Designer-surface tokens; see `theme/palette/designer.ts`. */
        designer: DesignerTokens;
    }

    interface ThemeOptions {
        designer?: DesignerTokens;
    }

    interface Palette {
        border: PaletteColor;
        neutral: PaletteColor;
        icon: PaletteColor;
        unitTypes: Record<string, string>;
        /** Semantic colour darkened enough to be read as text; see `palette/index.ts`. */
        successText: string;
    }

    interface PaletteOptions {
        successText?: string;
        unitTypes?: Record<string, string>;
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
