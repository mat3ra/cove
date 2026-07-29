import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";
import { ConsistencyCheck } from "@mat3ra/esse/dist/js/types";
import { BasicSetupOptions } from "@uiw/react-codemirror";
import React from "react";
export interface CodeMirrorProps {
    updateContent?: (content: string) => void;
    content?: string;
    options: boolean | BasicSetupOptions;
    language: string;
    completions?: (context: CompletionContext) => CompletionResult;
    theme?: "light" | "dark";
    checks?: ConsistencyCheck[];
    readOnly?: boolean;
    /**
     * Extra CodeMirror 6 extensions appended after the built-in language/completion/lint set — an
     * escape hatch for consumer features the wrapper doesn't model (e.g. signature-help tooltips,
     * custom keymaps). Pass a stable array: extensions are wired when the editor mounts.
     */
    extensions?: Extension[];
}
export interface CodeMirrorState {
    content: string;
    checks?: ConsistencyCheck[];
    isEditing: boolean;
}
declare class CodeMirror extends React.Component<CodeMirrorProps, CodeMirrorState> {
    constructor(props: CodeMirrorProps);
    UNSAFE_componentWillReceiveProps(nextProps: CodeMirrorProps): void;
    shouldComponentUpdate(nextProps: Readonly<CodeMirrorProps>, nextState: Readonly<CodeMirrorState>): boolean;
    handleContentChange(newContent: string): void;
    createExtensions(): Extension[];
    render(): React.JSX.Element;
}
export default CodeMirror;
