import * as React from "react";
export declare const StyledStepConnector: import("@emotion/styled").StyledComponent<import("@mui/material/StepConnector").StepConnectorProps & import("@mui/system").MUIStyledCommonProps<import("@mui/material/styles").Theme>, {}, {}>;
export interface StyledStepperProps {
    activeStep: number;
    steps: string[];
    fullWidth?: boolean;
}
export default function StyledStepper(props: StyledStepperProps): React.JSX.Element;
