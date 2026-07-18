import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

import Accordion from "../mui/components/accordion/Accordion";
import ButtonMultiSelect from "../mui/components/button/ButtonMultiSelect";
import CheckboxComponent from "../mui/components/checkbox/Checkbox";
import InfoWidget from "../mui/components/custom/widgets/info-widget/InfoWidget";
import TotalWidget from "../mui/components/custom/widgets/total-widget/TotalWidget";
import Dialog from "../mui/components/dialog/Dialog";
import IconByName from "../mui/components/icon/IconByName";
import LinearProgress from "../mui/components/linear-progress/LinearProgress";
import InfoPopover from "../mui/components/popover/info-popover/InfoPopover";
import RadioGroup from "../mui/components/radio-group/RadioGroup";
import BasicSelect from "../mui/components/select/BasicSelect";
import StyledStepper from "../mui/components/stepper/Stepper";
import TabsMenu from "../mui/components/tabs/TabsMenu";
import { AccountCard } from "../mui-composed/components/account/AccountCard";
import { LoadingIndicator } from "../mui-composed/components/loading/LoadingIndicator";
import JSONViewer from "../other/object-viewer/json-viewer/JSONViewer";
import PlainTextViewer from "../other/object-viewer/plain-text-viewer/PlainTextViewer";
import { ButtonTest } from "../theme/themeTest/buttons/Button";
import { ButtonGroupTest } from "../theme/themeTest/buttons/ButtonGroup";
import { IconButtonTest } from "../theme/themeTest/buttons/IconButton";
import { SwitchTest } from "../theme/themeTest/buttons/Switch";
import { ToggleButtonTest } from "../theme/themeTest/buttons/ToggleButton";
import { AutocompleteTest } from "../theme/themeTest/inputs/Autocomplete";
import { SelectTest } from "../theme/themeTest/inputs/Select";
import { TextFieldTest } from "../theme/themeTest/inputs/TextField";
import { TypographyTest } from "../theme/themeTest/typography/Typography";

export type GalleryEntry = {
    category: string;
    name: string;
    /** Repo path shown under the demo so readers can jump to the source. */
    source: string;
    render: () => React.ReactElement;
};

const noop = () => undefined;

const ICON_NAMES = [
    "entities.workflow",
    "entities.unit",
    "entities.subworkflow",
    "entities.material",
    "shapes.save",
    "shapes.arrow.down",
];

function CheckboxDemo() {
    const [checked, setChecked] = useState(true);
    return (
        <CheckboxComponent
            id="gallery-checkbox"
            label="Enable feature"
            value="feature"
            checked={checked}
            required={false}
            disabled={false}
            className=""
            onChange={(isChecked: boolean) => setChecked(isChecked)}
        />
    );
}

function RadioGroupDemo() {
    const [value, setValue] = useState<string | number>("medium");
    return (
        <RadioGroup
            id="gallery-radio-group"
            label="Precision"
            value={value}
            items={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
            ]}
            onChange={(_event, newValue) => setValue(newValue)}
        />
    );
}

function BasicSelectDemo() {
    const [value, setValue] = useState("espresso");
    return (
        <BasicSelect
            id="gallery-basic-select"
            label="Application"
            selectedValue={value}
            options={[
                { id: "espresso", name: "espresso" },
                { id: "vasp", name: "vasp" },
                { id: "nwchem", name: "nwchem" },
            ]}
            onChange={setValue}
        />
    );
}

function StepperDemo() {
    const [activeStep, setActiveStep] = useState(1);
    const steps = ["Material", "Workflow", "Compute", "Submit"];
    return (
        <Stack spacing={2}>
            <StyledStepper activeStep={activeStep} steps={steps} fullWidth />
            <Stack direction="row" spacing={1}>
                <Button
                    size="small"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((s) => s - 1)}>
                    Back
                </Button>
                <Button
                    size="small"
                    disabled={activeStep === steps.length - 1}
                    onClick={() => setActiveStep((s) => s + 1)}>
                    Next
                </Button>
            </Stack>
        </Stack>
    );
}

function TabsMenuDemo() {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    return (
        <Stack spacing={2}>
            <TabsMenu
                tabs={[
                    {
                        itemName: "Overview",
                        className: "gallery-tab",
                        onClick: () => setActiveTabIndex(0),
                    },
                    {
                        itemName: "Results",
                        className: "gallery-tab",
                        onClick: () => setActiveTabIndex(1),
                    },
                    {
                        itemName: "Files",
                        className: "gallery-tab",
                        onClick: () => setActiveTabIndex(2),
                    },
                ]}
                activeTabIndex={activeTabIndex}
            />
            <Typography variant="body2">Active tab index: {activeTabIndex}</Typography>
        </Stack>
    );
}

function DialogDemo() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Open dialog
            </Button>
            <Dialog
                id="gallery-dialog"
                open={open}
                titleComponent="Example Dialog"
                onClose={() => setOpen(false)}
                onSubmit={() => setOpen(false)}>
                <Typography sx={{ p: 2 }}>
                    Dialog content goes here. Submit and close are wired to buttons below.
                </Typography>
            </Dialog>
        </>
    );
}

export const GALLERY: GalleryEntry[] = [
    // ---- mui: inputs & controls -------------------------------------------------
    {
        category: "Inputs & Controls",
        name: "ButtonMultiSelect",
        source: "src/mui/components/button/ButtonMultiSelect.tsx",
        render: () => (
            <ButtonMultiSelect
                id="gallery-button-multi-select"
                localStorageKey="gallery-button-multi-select"
                buttonConfigs={[
                    { id: "save", iconName: "shapes.save", label: "Save", onClick: noop },
                    {
                        id: "save-as",
                        iconName: "shapes.save",
                        label: "Save As…",
                        onClick: noop,
                    },
                ]}
            />
        ),
    },
    {
        category: "Inputs & Controls",
        name: "Checkbox",
        source: "src/mui/components/checkbox/Checkbox.tsx",
        render: () => <CheckboxDemo />,
    },
    {
        category: "Inputs & Controls",
        name: "RadioGroup",
        source: "src/mui/components/radio-group/RadioGroup.tsx",
        render: () => <RadioGroupDemo />,
    },
    {
        category: "Inputs & Controls",
        name: "BasicSelect",
        source: "src/mui/components/select/BasicSelect.tsx",
        render: () => <BasicSelectDemo />,
    },
    // ---- mui: layout & navigation -----------------------------------------------
    {
        category: "Layout & Navigation",
        name: "Accordion",
        source: "src/mui/components/accordion/Accordion.tsx",
        render: () => (
            <Accordion header="Important Settings" isExpanded>
                <Typography variant="body2">Accordion body content.</Typography>
            </Accordion>
        ),
    },
    {
        category: "Layout & Navigation",
        name: "TabsMenu",
        source: "src/mui/components/tabs/TabsMenu.tsx",
        render: () => <TabsMenuDemo />,
    },
    {
        category: "Layout & Navigation",
        name: "Stepper",
        source: "src/mui/components/stepper/Stepper.tsx",
        render: () => <StepperDemo />,
    },
    {
        category: "Layout & Navigation",
        name: "Dialog",
        source: "src/mui/components/dialog/Dialog.tsx",
        render: () => <DialogDemo />,
    },
    // ---- mui: display -------------------------------------------------------------
    {
        category: "Display",
        name: "LinearProgress",
        source: "src/mui/components/linear-progress/LinearProgress.tsx",
        render: () => (
            <Stack spacing={2}>
                <LinearProgress percent={25} />
                <LinearProgress percent={60} />
                <LinearProgress percent={90} />
            </Stack>
        ),
    },
    {
        category: "Display",
        name: "InfoPopover",
        source: "src/mui/components/popover/info-popover/InfoPopover.tsx",
        render: () => (
            <InfoPopover id="gallery-info-popover" title="What is this?">
                <Typography variant="body2" sx={{ p: 1 }}>
                    Contextual help content shown on hover/click.
                </Typography>
            </InfoPopover>
        ),
    },
    {
        category: "Display",
        name: "InfoWidget",
        source: "src/mui/components/custom/widgets/info-widget/InfoWidget.tsx",
        render: () => (
            <InfoWidget
                title="Cluster status"
                description="All queues operational"
                content={<Typography variant="h4">98.6%</Typography>}
            />
        ),
    },
    {
        category: "Display",
        name: "TotalWidget",
        source: "src/mui/components/custom/widgets/total-widget/TotalWidget.tsx",
        render: () => (
            <TotalWidget
                id="gallery-total-widget"
                sum={128}
                label="Jobs this month"
                iconName="entities.workflow"
                boxColor="#3d5afe22"
            />
        ),
    },
    {
        category: "Display",
        name: "IconByName",
        source: "src/mui/components/icon/IconByName.tsx",
        render: () => (
            <Stack direction="row" spacing={3}>
                {ICON_NAMES.map((name) => (
                    <Box key={name} textAlign="center">
                        <IconByName name={name} fontSize="large" />
                        <Typography variant="caption" display="block">
                            {name}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        ),
    },
    // ---- mui-composed ------------------------------------------------------------
    {
        category: "Composed",
        name: "AccountCard",
        source: "src/mui-composed/components/account/AccountCard.tsx",
        render: () => (
            <Stack spacing={2}>
                <AccountCard account={{ name: "Dream Team" }} subtitle="organization" />
                <AccountCard
                    account={{ name: "Jane Researcher" }}
                    subtitle="personal"
                    size="large"
                />
            </Stack>
        ),
    },
    {
        category: "Composed",
        name: "LoadingIndicator",
        source: "src/mui-composed/components/loading/LoadingIndicator.tsx",
        render: () => <LoadingIndicator included maxHeight={120} />,
    },
    // ---- other ---------------------------------------------------------------------
    {
        category: "Viewers",
        name: "JSONViewer",
        source: "src/other/object-viewer/json-viewer/JSONViewer.tsx",
        render: () => (
            <JSONViewer
                src={{ name: "Silicon FCC", formula: "Si", lattice: { type: "FCC", a: 3.867 } }}
                onUpdate={noop}
            />
        ),
    },
    {
        category: "Viewers",
        name: "PlainTextViewer",
        source: "src/other/object-viewer/plain-text-viewer/PlainTextViewer.tsx",
        render: () => (
            <PlainTextViewer src={"Si2\n1.0\n0.0 2.734 2.734\n2.734 0.0 2.734\n2.734 2.734 0.0"} />
        ),
    },
    // ---- theme test harness --------------------------------------------------------
    {
        category: "Theme",
        name: "Buttons",
        source: "src/theme/themeTest/buttons/",
        render: () => (
            <Stack spacing={2}>
                <ButtonTest />
                <IconButtonTest />
                <ButtonGroupTest />
                <ToggleButtonTest />
                <SwitchTest />
            </Stack>
        ),
    },
    {
        category: "Theme",
        name: "Inputs",
        source: "src/theme/themeTest/inputs/",
        render: () => (
            <Stack spacing={2}>
                <TextFieldTest />
                <AutocompleteTest />
                <SelectTest />
            </Stack>
        ),
    },
    {
        category: "Theme",
        name: "Typography",
        source: "src/theme/themeTest/typography/Typography.tsx",
        render: () => <TypographyTest />,
    },
];
