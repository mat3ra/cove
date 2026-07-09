import * as React from "react";
export declare const StyledStepConnector: StyledComponent<ComponentProps, SpecificComponentProps, JSXProps>;
export interface StyledStepperProps {
    activeStep: number;
    steps: string[];
    fullWidth?: boolean;
}
export default function StyledStepper(props: StyledStepperProps): React.JSX.Element;
