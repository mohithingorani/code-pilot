"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import XTerminal from "./components/Terminal";

const Home = () => {


  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [value,setValue] = useState<string | undefined>()

  function handleEditorDidMount(editor :MonacoEditor.IStandaloneCodeEditor, monaco:typeof import("monaco-editor")){
    editorRef.current = editor;
  }

  function showValue(){
    if(editorRef.current){
      setValue(editorRef.current.getValue())
    }
  }

  useEffect(()=>{
    const interval = setInterval(()=>{
      showValue()
    },1500)

    return ()=>clearInterval(interval)
  })

  return (
    <div className="h-full w-full">
    <div className="flex h-full justify-start  w-full" >
      <div className="min-w-xs">files</div>
    <div className="h-full">
    <Editor height={"70vh"} className="min-w-xl h-full"  defaultLanguage="python" defaultValue="// start coding" theme="vs-dark" onMount={handleEditorDidMount}/>
    </div>
    </div>
    <div>
            <XTerminal/>

    </div>
    <pre>
        {value}
        
      </pre>
      </div>
  );
};

export default Home;