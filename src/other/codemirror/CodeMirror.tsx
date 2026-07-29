import { autocompletion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { fortran } from "@codemirror/legacy-modes/mode/fortran";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { linter, lintGutter } from "@codemirror/lint";
import { Extension } from "@codemirror/state";
import { ConsistencyCheck } from "@mat3ra/esse/dist/js/types";
import CodeMirrorBase, { BasicSetupOptions } from "@uiw/react-codemirror";
import React from "react";

import { linterGenerator } from "./utils/linterGenerator";

const LANGUAGE_EXTENSIONS_MAP: Record<string, Extension[]> = {
    python: [python()],
    shell: [StreamLanguage.define(shell)],
    fortran: [StreamLanguage.define(fortran)],
    jinja2: [StreamLanguage.define(jinja2)],
    javascript: [javascript()],
    json: [json(), lintGutter(), linter(jsonParseLinter())],
};

export interface CodeMirrorProps {
    updateContent?: (content: string) => void;
    content?: string;
    options: boolean | BasicSetupOptions;
    language: string;
    completions?: (context: CompletionContext) => CompletionResult;
    theme?: "light" | "dark";
    checks?: ConsistencyCheck[];
    readOnly?: boolean;
}

export interface CodeMirrorState {
    content: string;
    checks?: ConsistencyCheck[];
    isEditing: boolean;
}

// TODO: add `StatefulEntityMixin` to update the state of content and checks
class CodeMirror extends React.Component<CodeMirrorProps, CodeMirrorState> {
    constructor(props: CodeMirrorProps) {
        super(props);
        this.state = {
            content: props.content || "",
            checks: props.checks,
            isEditing: false,
        };
        this.handleContentChange = this.handleContentChange.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps: CodeMirrorProps) {
        const { content, checks } = this.props;
        const update = {};
        if (nextProps.content !== content) {
            Object.assign(update, { content: nextProps.content || "" });
        }
        if (nextProps.checks !== checks) {
            Object.assign(update, { checks: nextProps.checks });
        }
        this.setState(update);
    }

    shouldComponentUpdate(
        nextProps: Readonly<CodeMirrorProps>,
        nextState: Readonly<CodeMirrorState>,
    ): boolean {
        const { content, checks } = this.state;
        const { content: nextContent, checks: nextChecks } = nextState;
        return content !== nextContent || checks !== nextChecks;
    }

    handleContentChange(newContent: string) {
        const { isEditing } = this.state;
        const { updateContent } = this.props;
        if (isEditing && updateContent) updateContent(newContent);
        this.setState({ content: newContent });
    }

    createExtensions(): Extension[] {
        const { checks } = this.state;
        const { completions, language } = this.props;
        const extensions: Extension[] = [];

        const languageExtensions =
            LANGUAGE_EXTENSIONS_MAP[language] || LANGUAGE_EXTENSIONS_MAP.fortran;
        extensions.push(...languageExtensions);

        if (completions) {
            const completionExtension = autocompletion({ override: [completions] });
            extensions.push(completionExtension);
        }

        if (checks) {
            const linterExtension = linterGenerator(checks);
            extensions.push(linter(linterExtension));
        }

        return extensions;
    }

    render() {
        const { options = {}, theme, readOnly } = this.props;
        const { content } = this.state;
        const extensions = this.createExtensions();

        return (
            <CodeMirrorBase
                value={content}
                onChange={(value: string) => {
                    this.handleContentChange(value);
                }}
                onFocus={() => this.setState({ isEditing: true })}
                onBlur={() => this.setState({ isEditing: false })}
                basicSetup={options}
                theme={theme || "light"}
                extensions={extensions}
                readOnly={readOnly}
            />
        );
    }
}

export default CodeMirror;
