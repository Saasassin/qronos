/**
 * QronosMonacoEditor.tsx
 *
 * This component is a Monaco Editor component from here: https://github.com/suren-atoyan/monaco-react
 */
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import React from "react";

// BEGIN: Needed in Vite environments
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      console.log("Returning json worker");
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      console.log("Returning css worker");
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      console.log("Returning html worker");
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      console.log("Returning ts worker");
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
loader.init().then((monaco) => {
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  });
});
// END: Needed in Vite environments

export class QronosMonacoEditor extends React.Component {
  render() {
    return (
      <Editor
        height="90vh"
        width="100%"
        options={{
          // TODO: make some of these settings
          minimap: { enabled: true },
          wordWrap: "on",
          wrappingIndent: "indent",
          wrappingStrategy: "advanced",
          fontSize: 14,
          lineHeight: 16,
          formatOnType: true,
          formatOnPaste: true,
        }}
        theme="vs-dark" // TODO: make this a setting
        defaultLanguage="typescript"
        defaultValue={this.getDefaultValue()}
        onChange={(value: any) => {
          this.handleEditorChange(value);
        }}
        onMount={(editor: any, monaco: any) => {
          this.handleEditorDidMount(editor, monaco);
        }}
        onValidate={(markers: any) => {
          this.handleEditorValidation(markers);
        }}
      />
    );
  }

  handleEditorDidMount(editor: any, monaco: any) {
    console.log("editor mounted");
  }

  handleEditorChange(value: any) {
    console.log("value", value);
    this.setState({ code: value });
  }

  handleEditorValidation(markers: any) {
    console.log("markers", markers);
  }

  getDefaultValue() {
    return "// Welcome to Qronos script editor!\n\n function hello(foo: string) {\n\talert('Hello, ' + foo);\n}\n\nhello('world');\n";
  }
}
