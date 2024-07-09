/**
 * QronosMonacoEditor.tsx
 *
 * This component is a Monaco Editor component from here: https://github.com/suren-atoyan/monaco-react
 */
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

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

export const QronosEditor = () => {
  const [value, setValue] = useState<string>("");

  const monacoRef = useRef(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    console.log("editorRef", editorRef);
  }, []);

  /**
   * This is a callback function that is called when the editor is mounted.
   */
  const handleEditorDidMount = (mountedEditor: any, mountedMonaco: any) => {
    console.log("editor mounted");

    editorRef.current = mountedEditor;
    monacoRef.current = mountedMonaco;
  };

  const handleEditorChange = (value: any) => {
    console.log("handleEditorChange: ", value);
    setValue(value);
  };

  const handleEditorValidation = (markers: any) => {
    console.log("markers", markers);
  };

  const getDefaultValue = () => {
    return "// Welcome to Qronos script editor!\n\n function hello(foo: string) {\n\talert('Hello, ' + foo);\n}\n\nhello('world');\n";
  };

  const options = {
    automaticLayout: true, //
    glyphMargin: true, // margin for symbols like error and warning
    lineNumbers: "on",
    folding: true,
    minimap: { enabled: true },
    wordWrap: "on",
    wrappingIndent: "indent",
    wrappingStrategy: "advanced",
    fontSize: 14,
    lineHeight: 16,
    formatOnType: true,
    formatOnPaste: true,
  };

  return (
    <>
      <Editor
        height="60vh"
        width="100%"
        options={options}
        theme="vs-dark"
        loading={<div>Reticulating Splines...</div>}
        defaultLanguage="typescript"
        defaultValue={getDefaultValue()}
        onChange={(value: any) => {
          handleEditorChange(value);
        }}
        onMount={(editor: any, monaco: any) => {
          handleEditorDidMount(editor, monaco);
        }}
        onValidate={(markers: any) => {
          handleEditorValidation(markers);
        }}
      />
    </>
  );
};
